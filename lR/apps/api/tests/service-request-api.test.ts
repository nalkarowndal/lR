import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import type{RowDataPacket} from 'mysql2';
import {createApp} from '../src/app.js';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
const config=readConfig();
if(config.DB_NAME!=='lr_test'||config.NODE_ENV!=='test')throw new Error('isolated lr_test only');
const db=openPool(config);
const app=createApp(db,{demoMode:true});
const disabled=createApp(db,{demoMode:false});
before(async()=>{await db.query('SELECT 1');});
after(async()=>{await db.end();});

const secret='test-only-strong-password-2026';
const uniqueEmail=()=>randomUUID().slice(0,14)+'@example.invalid';
async function actor(){
 const email=uniqueEmail();
 const registration=await request(app).post('/api/v1/auth/register').send({email,password:secret});
 assert.equal(registration.status,201);
 const login=await request(app).post('/api/v1/auth/login').send({email,password:secret});
 assert.equal(login.status,200);
 return {userId:registration.body.data.userId,token:login.body.data.accessToken};
}
function body(kind='REPAIR'){
 return {kind,itemName:'시연용 가방',details:'테스트용 가방 상태 설명입니다. 실제 물품은 없습니다.'};
}
async function submit(token:string,key=randomUUID(),data=body()){
 return request(app).post('/api/v1/service-requests')
  .set('Authorization','Bearer '+token).set('Idempotency-Key',key).send(data);
}
function mine(token:string,id:string){
 return request(app).get('/api/v1/service-requests/'+id).set('Authorization','Bearer '+token);
}
async function auditCount(id:string){
 const [rows]=await db.execute<Array<RowDataPacket&{n:string}>>(
  'SELECT COUNT(*) AS n FROM lr_demo_service_audit WHERE request_id=?',[id]);
 return Number(rows[0].n);
}
test('unauthenticated endpoints are 401; disabled demo mode is 501',async()=>{
 assert.equal((await request(app).post('/api/v1/service-requests').send(body())).status,401);
 assert.equal((await request(app).get('/api/v1/service-requests')).status,401);
 assert.equal((await request(app).get('/api/v1/admin/service-requests')).status,401);
 assert.equal((await request(disabled).post('/api/v1/service-requests').send(body())).status,501);
 assert.equal((await request(disabled).get('/api/v1/admin/service-requests')).status,501);
});
test('20 parallel identical customer POSTs create one audited demo request',async()=>{
 const user=await actor(),key=randomUUID();
 const all=await Promise.all(Array.from({length:20},()=>submit(user.token,key)));
 const created=all.filter(r=>r.status===201);
 assert.equal(created.length,1);
 assert.equal(all.filter(r=>r.status===200).length,19);
 const id=created[0].body.data.id;
 assert.equal(new Set(all.map(r=>r.body.data.id)).size,1);
 assert.equal(all.filter(r=>!r.body.data.replayed).length,1);
 assert.equal(await auditCount(id),1);
 assert.equal(created[0].body.data.policyVersion,'demo-only');
 assert.equal(created[0].body.data.status,'SUBMITTED');
 assert.equal(created[0].body.data.kind,'REPAIR');
 assert.match(created[0].body.data.disclaimer,/실제 수선/);
 const [rows]=await db.execute<Array<RowDataPacket&{n:string}>>(
  'SELECT COUNT(*) AS n FROM lr_demo_service_requests WHERE owner_id=?',[user.userId]);
 assert.equal(Number(rows[0].n),1);
});
test('same idempotency key with different payload fails 409; normalized whitespace replays',async()=>{
 const user=await actor(),key=randomUUID();
 const original=await submit(user.token,key,body('CONSIGNMENT'));
 assert.equal(original.status,201);
 const padded=await submit(user.token,key,{
  kind:'CONSIGNMENT',itemName:'  시연용 가방  ',details:'  테스트용 가방 상태 설명입니다. 실제 물품은 없습니다.  '
 });
 assert.equal(padded.status,200);
 const changed=await submit(user.token,key,{
  ...body('CONSIGNMENT'),itemName:'다른 가방'
 });
 assert.equal(changed.status,409);assert.equal(changed.body.code,'IDEMPOTENCY_KEY_REUSED');
 assert.equal(await auditCount(original.body.data.id),1);
});
test('a second user cannot retrieve, cancel or enumerate another users request',async()=>{
 const a=await actor(),b=await actor();
 const record=await submit(a.token);
 const id=record.body.data.id;
 assert.equal((await mine(a.token,id)).status,200);
 assert.equal((await mine(b.token,id)).status,404);
 assert.equal((await request(app).post('/api/v1/service-requests/'+id+'/cancel')
  .set('Authorization','Bearer '+b.token)).status,404);
 const listing=await request(app).get('/api/v1/service-requests')
  .set('Authorization','Bearer '+b.token);
 assert.equal(listing.status,200);assert.equal(listing.body.data.length,0);
 assert.equal(await auditCount(id),1);
});
test('self-supplied ownerId, role, status and photo contents are rejected with 422',async()=>{
 const a=await actor();
 for(const changed of [
  {...body(),ownerId:randomUUID()},
  {...body(),role:'ADMIN'},
  {...body(),status:'DEMO_CLOSED'},
  {...body(),photos:['https://example.com/photo.jpg']},
  {...body(),itemName:'a'},
  {...body(),details:'short'}
 ]){
  const res=await submit(a.token,randomUUID(),changed);
  assert.equal(res.status,422);
 }
 assert.equal((await request(app).post('/api/v1/service-requests')
  .set('Authorization','Bearer '+a.token).send(body())).status,422);
});
test('only ADMIN can list requests or change status, revocation applies immediately',async()=>{
 const customer=await actor(),admin=await actor();
 const rec=await submit(customer.token,randomUUID(),body('CONSIGNMENT'));
 const id=rec.body.data.id;
 assert.equal((await request(app).get('/api/v1/admin/service-requests')
  .set('Authorization','Bearer '+customer.token)).status,403);
 assert.equal((await request(app).patch('/api/v1/admin/service-requests/'+id+'/status')
  .set('Authorization','Bearer '+customer.token).send({status:'UNDER_REVIEW'})).status,403);
 await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[admin.userId]);
 const list=await request(app).get('/api/v1/admin/service-requests?kind=CONSIGNMENT&status=SUBMITTED')
  .set('Authorization','Bearer '+admin.token);
 assert.equal(list.status,200);
 assert.ok(list.body.data.some((x:{id:string})=>x.id===id));
 const first=await request(app).patch('/api/v1/admin/service-requests/'+id+'/status')
  .set('Authorization','Bearer '+admin.token).send({status:'UNDER_REVIEW'});
 assert.equal(first.status,200);
 assert.equal(first.body.data.status,'UNDER_REVIEW');
 const again=await request(app).patch('/api/v1/admin/service-requests/'+id+'/status')
  .set('Authorization','Bearer '+admin.token).send({status:'UNDER_REVIEW'});
 assert.equal(again.status,200);assert.equal(again.body.data.replayed,true);
 assert.equal(await auditCount(id),2);
 await db.execute("DELETE FROM lr_user_roles WHERE user_id=? AND role='ADMIN'",[admin.userId]);
 assert.equal((await request(app).get('/api/v1/admin/service-requests')
  .set('Authorization','Bearer '+admin.token)).status,403);
});
test('20 concurrent ADMIN transitions produce one audit and a consistent state',async()=>{
 const customer=await actor(),admin=await actor();
 const r=await submit(customer.token),id=r.body.data.id;
 await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[admin.userId]);
 const results=await Promise.all(Array.from({length:20},()=>
  request(app).patch('/api/v1/admin/service-requests/'+id+'/status')
   .set('Authorization','Bearer '+admin.token).send({status:'UNDER_REVIEW'})));
 assert.ok(results.every(x=>x.status===200&&x.body.data.status==='UNDER_REVIEW'));
 assert.equal(results.filter(x=>!x.body.data.replayed).length,1);
 assert.equal(await auditCount(id),2);
});
test('state machine prevents skipping steps, terminal edits and client-side admin impersonation',async()=>{
 const customer=await actor(),admin=await actor();
 const initial=await submit(customer.token),id=initial.body.data.id;
 await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[admin.userId]);
 const update=(status:string)=>request(app).patch('/api/v1/admin/service-requests/'+id+'/status')
  .set('Authorization','Bearer '+admin.token).send({status});
 assert.equal((await update('DEMO_CLOSED')).status,409);
 assert.equal((await update('UNDER_REVIEW')).status,200);
 assert.equal((await update('INFO_REQUESTED')).status,200);
 assert.equal((await update('UNDER_REVIEW')).status,200);
 assert.equal((await update('DEMO_CLOSED')).status,200);
 assert.equal((await update('INFO_REQUESTED')).status,409);
 assert.equal((await update('CANCELED')).status,422);
 assert.equal((await request(app).post('/api/v1/service-requests/'+id+'/cancel')
  .set('Authorization','Bearer '+customer.token)).status,409);
 assert.equal(await auditCount(id),5);
});
test('owner cancellation is permitted in open state and repeated cancel does not create audit',async()=>{
 const user=await actor();
 const r=await submit(user.token),id=r.body.data.id;
 const cancel=()=>request(app).post('/api/v1/service-requests/'+id+'/cancel')
  .set('Authorization','Bearer '+user.token);
 const all=await Promise.all(Array.from({length:20},()=>cancel()));
 assert.ok(all.every(x=>x.status===200&&x.body.data.status==='CANCELED'));
 assert.equal(all.filter(x=>!x.body.data.replayed).length,1);
 assert.equal(await auditCount(id),2);
 const latest=await mine(user.token,id);
 assert.equal(latest.body.data.status,'CANCELED');
});
test('malformed page query and path identifiers fail closed; only bounded list pages',async()=>{
 const user=await actor();
 assert.equal((await request(app).get('/api/v1/service-requests?limit=500')
  .set('Authorization','Bearer '+user.token)).status,422);
 assert.equal((await request(app).get('/api/v1/service-requests?offset=-1')
  .set('Authorization','Bearer '+user.token)).status,422);
 assert.equal((await mine(user.token,'not-a-uuid')).status,422);
 assert.equal((await mine(user.token,randomUUID())).status,404);
});
test('session revocation immediately blocks access to all service application data',async()=>{
 const user=await actor();
 const r=await submit(user.token),id=r.body.data.id;
 assert.equal(r.status,201);
 assert.equal((await request(app).post('/api/v1/auth/logout')
  .set('Authorization','Bearer '+user.token)).status,204);
 assert.equal((await mine(user.token,id)).status,401);
});
