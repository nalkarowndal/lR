import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
const cfg=readConfig();
if(cfg.DB_NAME!=='lr_test'||cfg.NODE_ENV!=='test')throw new Error('isolated test DB only');
const db=openPool(cfg),app=createApp(db,{demoMode:true});
const pass='synthetic-service-ui-check-2026';
before(async()=>{await db.query('SELECT 1');});
after(async()=>{await db.end();});
async function signIn(){
 const email=randomUUID().slice(0,15)+'@example.invalid';
 const r=await request(app).post('/api/v1/auth/register').send({email,password:pass});
 assert.equal(r.status,201);
 const login=await request(app).post('/api/v1/auth/login').send({email,password:pass});
 assert.equal(login.status,200);
 return login.body.data.accessToken as string;
}
const auth=(token:string)=>({Authorization:'Bearer '+token});
test('C4-C mobile forms use unchanged, owner-scoped repair and consignment API contracts',async()=>{
 const token=await signIn(),other=await signIn();
 const get=(url:string,t=token)=>request(app).get(url).set(auth(t));
 const records=[];
 for(const [kind,itemName,details] of [
  ['REPAIR','시연용 가죽가방','시연용 가죽가방 모서리 보수 검토를 요청합니다.'],
  ['CONSIGNMENT','DEMO 시연용 숄더백','시연용 위탁 상품 유형: 숄더백 / 선택 등급: A']
 ]){
  const key=randomUUID(),body={kind,itemName,details};
  const created=await request(app).post('/api/v1/service-requests')
   .set(auth(token)).set('Idempotency-Key',key).send(body);
  assert.equal(created.status,201,JSON.stringify(created.body));
  const dto=created.body.data;
  assert.match(dto.id,/^[a-f0-9-]{36}$/);
  assert.match(dto.ownerId,/^[a-f0-9-]{36}$/);
  assert.equal(dto.demo,true);assert.equal(dto.policyVersion,'demo-only');
  assert.equal(dto.status,'SUBMITTED');
  assert.equal(dto.replayed,false);
  assert.ok(dto.disclaimer.includes('시연용'));
  assert.equal(dto.itemName,itemName);assert.equal(dto.details,details);
  const replay=await request(app).post('/api/v1/service-requests')
   .set(auth(token)).set('Idempotency-Key',key).send(body);
  assert.equal(replay.status,200);assert.equal(replay.body.data.id,dto.id);
  assert.equal(replay.body.data.replayed,true);
  assert.equal((await get('/api/v1/service-requests/'+dto.id,other)).status,404);
  assert.equal((await get('/api/v1/service-requests/'+dto.id)).body.data.id,dto.id);
  records.push(dto);
 }
 const listed=await get('/api/v1/service-requests?limit=20&offset=0');
 assert.equal(listed.status,200);
 for(const r of records)assert.ok(listed.body.data.some((x:{id:string})=>x.id===r.id));
 const canceled=await request(app).post('/api/v1/service-requests/'+records[0].id+'/cancel').set(auth(token));
 assert.equal(canceled.status,200);assert.equal(canceled.body.data.status,'CANCELED');
 const detail=await get('/api/v1/service-requests/'+records[0].id);
 assert.equal(detail.body.data.status,'CANCELED');
 assert.equal((await get('/api/v1/admin/service-requests')).status,403);
 assert.equal((await request(app).post('/api/v1/orders').send({})).status,501);
 assert.equal((await request(app).post('/api/v1/payments/confirm').send({})).status,501);
});
