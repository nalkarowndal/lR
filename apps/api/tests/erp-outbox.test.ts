import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type{RowDataPacket} from 'mysql2';
import request from 'supertest';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
import {createApp} from '../src/app.js';
import {dispatchOneDemoErpOutbox,type DemoErpEvent} from '../src/erp-outbox.js';

const config=readConfig();
if(config.NODE_ENV!=='test'||config.DB_NAME!=='lr_test')throw new Error('requires lr_test only');
const db=openPool(config),app=createApp(db,{demoMode:true});
before(async()=>{await db.query('SELECT 1');});
after(async()=>{await db.end();});
const password='testing-nonreal-secret-2026';
async function account(){
 const email=randomUUID().slice(0,12)+'@example.invalid';
 const reg=await request(app).post('/api/v1/auth/register').send({email,password});
 assert.equal(reg.status,201);
 const login=await request(app).post('/api/v1/auth/login').send({email,password});
 assert.equal(login.status,200);
 return {userId:reg.body.data.userId,token:login.body.data.accessToken as string};
}
async function createRecord(kind='REPAIR'){
 const owner=await account(),idempotency=randomUUID();
 const post=await request(app).post('/api/v1/service-requests')
  .set('Authorization','Bearer '+owner.token).set('Idempotency-Key',idempotency)
  .send({kind,itemName:'테스트용 작은 가방',details:'개인정보가 아닌 테스트 설명만 기록합니다.'});
 assert.equal(post.status,201,JSON.stringify(post.body));
 return {owner,id:post.body.data.id as string,key:idempotency};
}
async function outbox(id:string){
 const [rows]=await db.query<Array<RowDataPacket&{
  event_id:string;audit_id:number;actor_id:string;request_id:string;
  from_status:string|null;to_status:string;state:string;
  attempt_count:number;lease_token:string|null;last_error_code:string|null
 }>>('SELECT * FROM lr_demo_erp_outbox WHERE request_id=? ORDER BY audit_id ASC',[id]);
 return rows;
}
async function audit(id:string){
 const [rows]=await db.execute<RowDataPacket[]>(
 'SELECT * FROM lr_demo_service_audit WHERE request_id=? ORDER BY id ASC',[id]);
 return rows;
}
async function advanceRetry(eventId:string){
 await db.execute(`UPDATE lr_demo_erp_outbox SET available_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND)
 WHERE event_id=?`,[eventId]);
}
const ok=async(_ev:Readonly<DemoErpEvent>,_ctx:{idempotencyKey:string;signal:AbortSignal})=>{};
test('new repair/consignment request and audit commit with exactly one privacy-minimal event',async()=>{
 const a=await createRecord('REPAIR'),b=await createRecord('CONSIGNMENT');
 for(const x of [a,b]){
  const evt=await outbox(x.id),logs=await audit(x.id);
  assert.equal(evt.length,1);assert.equal(logs.length,1);
  assert.equal(evt[0].audit_id,logs[0].id);
  assert.equal(evt[0].request_id,x.id);assert.equal(evt[0].actor_id,x.owner.userId);
  assert.equal(evt[0].to_status,'SUBMITTED');assert.equal(evt[0].from_status,null);
  assert.equal(evt[0].state,'PENDING');
  const [description]=await db.execute<RowDataPacket[]>('SELECT * FROM lr_demo_erp_outbox WHERE event_id=?',[evt[0].event_id]);
  assert.ok(!JSON.stringify(description).includes('테스트용 작은 가방'));
  assert.ok(!JSON.stringify(description).includes('개인정보가 아닌'));
 }
});
test('20 concurrent idempotent application submissions produce one outbox event and audit',async()=>{
 const a=await account(),key=randomUUID();
 const send=()=>request(app).post('/api/v1/service-requests')
  .set('Authorization','Bearer '+a.token).set('Idempotency-Key',key)
  .send({kind:'REPAIR',itemName:'시연용 가방',details:'가상 물품만 존재하는 신청 기록입니다.'});
 const all=await Promise.all(Array.from({length:20},()=>send()));
 assert.equal(all.filter(x=>x.status===201).length,1);
 assert.equal(all.filter(x=>x.status===200).length,19);
 const id=all[0].body.data.id;
 assert.equal((await outbox(id)).length,1);
 assert.equal((await audit(id)).length,1);
});
test('20 concurrent queue workers lease one pending event and deliver it only once',async()=>{
 const a=await createRecord();
 let delivered=0;const ids:string[]=[];
 // Isolate prior pending events in the suite by selecting the test event
 // through a helper table state reset only for synthetic test fixtures created here.
 // The entire suite is a mock-worker global queue: drain all earlier test events first.
 async function flush(){
  for(let i=0;i<90;i++){
   const done=await dispatchOneDemoErpOutbox(db,ok);
   if(done.outcome==='EMPTY')break;
  }
 }
 await flush();
 const b=await createRecord();
 const sends=await Promise.all(Array.from({length:20},()=>
  dispatchOneDemoErpOutbox(db,async(evt,context)=>{
   assert.equal(context.idempotencyKey,evt.eventId);
   delivered++;ids.push(evt.eventId);
  })));
 assert.equal(sends.filter(x=>x.outcome==='DELIVERED').length,1);
 assert.equal(delivered,1);assert.equal(new Set(ids).size,1);
 assert.equal((await outbox(b.id))[0].state,'DELIVERED');
});
test('state transitions and cancellation create ordered outbox events only on genuine changes',async()=>{
 const {owner,id}=await createRecord(),admin=await account();
 await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[admin.userId]);
 const patch=(status:string)=>request(app).patch('/api/v1/admin/service-requests/'+id+'/status')
  .set('Authorization','Bearer '+admin.token).send({status});
 assert.equal((await patch('UNDER_REVIEW')).status,200);
 assert.equal((await patch('UNDER_REVIEW')).body.data.replayed,true);
 assert.equal((await patch('INFO_REQUESTED')).status,200);
 assert.equal((await request(app).post('/api/v1/service-requests/'+id+'/cancel')
  .set('Authorization','Bearer '+owner.token)).status,200);
 assert.equal((await request(app).post('/api/v1/service-requests/'+id+'/cancel')
  .set('Authorization','Bearer '+owner.token)).body.data.replayed,true);
 const entries=await outbox(id),logs=await audit(id);
 assert.equal(entries.length,4);assert.equal(logs.length,4);
 assert.deepEqual(entries.map(x=>x.to_status),['SUBMITTED','UNDER_REVIEW','INFO_REQUESTED','CANCELED']);
 assert.deepEqual(entries.map(x=>x.from_status),[null,'SUBMITTED','UNDER_REVIEW','INFO_REQUESTED']);
 const initial=entries[0].event_id;
 const seen: string[]=[];
 const consumer=async(evt:DemoErpEvent)=>{if(evt.requestId===id)seen.push(evt.toStatus);};
 // Other cases can create pending events, so drain until this request's sequence completes.
 for(let i=0;i<150&&seen.length<4;i++){
  const out=await dispatchOneDemoErpOutbox(db,consumer);
  if(out.outcome==='EMPTY')break;
 }
 assert.deepEqual(seen,['SUBMITTED','UNDER_REVIEW','INFO_REQUESTED','CANCELED']);
 assert.equal((await outbox(id))[0].event_id,initial);
 assert.ok((await outbox(id)).every(e=>e.state==='DELIVERED'));
});
test('failures backoff, retry with same key, and then succeed',async()=>{
 const {id}=await createRecord();
 // Global queue may contain earlier fixtures. Drain until this test event is the oldest.
 for(let i=0;i<150;i++){
  const evt=await outbox(id);if(evt[0].state!=='PENDING')break;
  const done=await dispatchOneDemoErpOutbox(db,async(e)=>{if(e.requestId===id)throw Error('secret details must not leak')});
  if(done.eventId===evt[0].event_id)break;
  if(done.outcome==='EMPTY')throw Error('test event unexpectedly not claimable');
 }
 let item=(await outbox(id))[0];
 assert.equal(item.state,'PENDING');
 assert.equal(item.attempt_count,1);
 assert.equal(item.last_error_code,'ADAPTER_FAILED');
 assert.equal((await dispatchOneDemoErpOutbox(db,ok)).outcome,'EMPTY');
 await advanceRetry(item.event_id);
 const delivered=await dispatchOneDemoErpOutbox(db,async(e,ctx)=>{
  assert.equal(e.requestId,id);assert.equal(ctx.idempotencyKey,e.eventId);
 });
 assert.equal(delivered.outcome,'DELIVERED');
 item=(await outbox(id))[0];assert.equal(item.state,'DELIVERED');
 assert.equal(item.attempt_count,2);
 assert.equal(item.last_error_code,null);
});
test('after three adapter failures DEAD blocks later events for same request',async()=>{
 const {id}=await createRecord();
 // Drive all global pending ready records until this case is encountered.
 let eventId=(await outbox(id))[0].event_id;
 for(let i=0;i<120;i++){
  const r=await dispatchOneDemoErpOutbox(db,async(e)=>{if(e.eventId===eventId)throw Error('synthetic offline')});
  if(r.eventId===eventId)break;
  if(r.outcome==='EMPTY')throw Error('cannot process pending synthetic event');
 }
 for(let n=2;n<=3;n++){
  await advanceRetry(eventId);
  const v=await dispatchOneDemoErpOutbox(db,async()=>{throw Error('mock error')});
  assert.equal(v.eventId,eventId);
  assert.equal(v.outcome,n===3?'DEAD':'RETRY_SCHEDULED');
 }
 const evt=(await outbox(id))[0];assert.equal(evt.state,'DEAD');
 const admin=await account();
 await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[admin.userId]);
 assert.equal((await request(app).patch('/api/v1/admin/service-requests/'+id+'/status')
  .set('Authorization','Bearer '+admin.token).send({status:'UNDER_REVIEW'})).status,200);
 assert.equal((await outbox(id)).length,2);
 const later=(await outbox(id))[1];assert.equal(later.state,'PENDING');
 // The dead predecessor blocks that later event; no out of order delivery.
 assert.equal((await dispatchOneDemoErpOutbox(db,ok)).outcome,'EMPTY');
});
test('stale lease worker cannot mark event DELIVERED after a new lease succeeds',async()=>{
 const {id}=await createRecord(),eventId=(await outbox(id))[0].event_id;
 // Earlier pending fixtures may exist; drain until ours can be claimed.
 let started!:()=>void,release!:()=>void;
 const startedSignal=new Promise<void>(r=>{started=r;});
 const pending=new Promise<void>(r=>{release=r;});
 let oldPromise:ReturnType<typeof dispatchOneDemoErpOutbox>|null=null;
 for(let i=0;i<140;i++){
  const p=dispatchOneDemoErpOutbox(db,async(e)=>{
   if(e.eventId===eventId){started();await pending;}
  });
  // Probe via db to know if this event was leased, not arbitrary sleeps.
  const state=(await outbox(id))[0].state;
  if(state==='LEASED'){
   oldPromise=p;
   await startedSignal;
   break;
  }
  await p;
 }
 if(!oldPromise)throw Error('failed to claim synthetic lease');
 await db.execute(`UPDATE lr_demo_erp_outbox
  SET lease_until=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND) WHERE event_id=?`,[eventId]);
 const current=await dispatchOneDemoErpOutbox(db,async(e)=>{assert.equal(e.eventId,eventId)});
 assert.equal(current.outcome,'DELIVERED');
 release();
 const old=await oldPromise;
 assert.equal(old.outcome,'LEASE_LOST');
 assert.equal((await outbox(id))[0].state,'DELIVERED');
});
test('no public ERP dispatch endpoints and runtime DB isolation is enforced',async()=>{
 assert.equal((await request(app).post('/api/v1/admin/erp/dispatch').send({})).status,404);
 assert.equal((await request(app).post('/api/v1/erp/sync').send({})).status,404);
 const previous=process.env.DB_NAME;
 try{
  process.env.DB_NAME='lr_production';
  await assert.rejects(()=>dispatchOneDemoErpOutbox(db,ok),/TEST_ONLY/);
 }finally{
  if(previous===undefined)delete process.env.DB_NAME;else process.env.DB_NAME=previous;
 }
});
