import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {readConfig} from '../src/config.js';
import {openPool} from '../src/db.js';

const config=readConfig();
if(config.DB_NAME!=='lr_test'||config.NODE_ENV!=='test')throw new Error('DB test isolation required');
const db=openPool(config);
const app=createApp(db,{demoMode:true});
before(async()=>{await db.query('SELECT 1')});
after(async()=>{await db.end()});
const dates={startDate:'2026-11-10',returnDate:'2026-11-13'};
async function customer(){
 const email=randomUUID().slice(0,14)+'@example.invalid',password='long-demo-password-2026';
 const created=await request(app).post('/api/v1/auth/register').send({email,password});
 assert.equal(created.status,201);
 const login=await request(app).post('/api/v1/auth/login').send({email,password});
 assert.equal(login.status,200);
 return login.body.data.accessToken as string;
}
async function fixture(unitCount=1){
 const key=randomUUID().slice(0,12),productId='qa-'+key;
 await db.execute(`INSERT INTO lr_products (id,title,brand,category,condition_grade,published,is_demo)
 VALUES(?,'QA rental','TEST','bag','A',1,1)`,[productId]);
 await db.execute(`INSERT INTO lr_product_offers(id,product_id,channel,day_rate_krw,deposit_krw,is_active)
 VALUES(?,?,'RENTAL',10000,10000,1)`,['offer-'+key,productId]);
 for(let i=0;i<unitCount;i++){
  await db.execute(`INSERT INTO lr_inventory_units(id,product_id,serial,condition_grade,physical_state)
 VALUES(?,?,?,'A','READY')`,['unit-'+key+'-'+i,productId,'TEST-'+key+'-'+i]);
 }
 return productId;
}
const hold=(token:string,productId:string,key=randomUUID(),extra:Record<string,unknown>={})=>
 request(app).post('/api/v1/rental-holds').set('Authorization','Bearer '+token)
 .set('Idempotency-Key',key).send({productId,...dates,...extra});

test('unauthenticated hold API is rejected and production mode is disabled',async()=>{
 const productId=await fixture();
 assert.equal((await request(app).post('/api/v1/rental-holds').send({productId,...dates})).status,401);
 const prod=createApp(db,{demoMode:false});
 assert.equal((await request(prod).post('/api/v1/rental-holds').send({productId,...dates})).status,501);
});
test('verified session identity creates demo-only hold, replay is idempotent',async()=>{
 const [token,productId]=await Promise.all([customer(),fixture()]);
 const key=randomUUID();const first=await hold(token,productId,key);
 assert.equal(first.status,201);assert.equal(first.body.data.status,'ACTIVE');
 assert.equal(first.body.data.demo,true);assert.ok(!('unitId' in first.body.data));
 const second=await hold(token,productId,key);
 assert.equal(second.status,200);assert.equal(second.body.data.holdId,first.body.data.holdId);
 assert.equal(second.body.data.replayed,true);
 assert.equal((await request(app).post('/api/v1/rentals').set('Authorization','Bearer '+token).send({})).status,501);
});
test('client spoofed user identity and invalid idempotency key are rejected',async()=>{
 const [token,productId]=await Promise.all([customer(),fixture()]);
 assert.equal((await hold(token,productId,randomUUID(),{actorId:'admin'})).status,422);
 assert.equal((await hold(token,productId,'bad')).status,422);
 const invalid=await hold(token,productId,randomUUID(),{startDate:'2026-02-30',returnDate:'2026-03-05'});
 assert.equal(invalid.status,422);
});
test('hold GET and DELETE enforce ownership rather than exposed hold IDs',async()=>{
 const [a,b,productId]=await Promise.all([customer(),customer(),fixture()]);
 const item=await hold(a,productId);
 assert.equal(item.status,201);const id=item.body.data.holdId;
 const forbidden=await request(app).get('/api/v1/rental-holds/'+id).set('Authorization','Bearer '+b);
 assert.equal(forbidden.status,404);
 const cancelForbidden=await request(app).delete('/api/v1/rental-holds/'+id).set('Authorization','Bearer '+b);
 assert.equal(cancelForbidden.status,404);
 assert.equal((await request(app).get('/api/v1/rental-holds/'+id).set('Authorization','Bearer '+a)).status,200);
 assert.equal((await request(app).delete('/api/v1/rental-holds/'+id).set('Authorization','Bearer '+a)).status,204);
 const released=await request(app).get('/api/v1/rental-holds/'+id).set('Authorization','Bearer '+a);
 assert.equal(released.body.data.status,'RELEASED');
});
test('20 simultaneous authenticated requests can acquire at most one physical unit',async()=>{
 const [token,productId]=await Promise.all([customer(),fixture()]);
 const results=await Promise.all(Array.from({length:20},()=>hold(token,productId)));
 assert.equal(results.filter(r=>r.status===201).length,1);
 assert.equal(results.filter(r=>r.status===409).length,19);
});
test('same idempotency key 20 times produces exactly one hold',async()=>{
 const [token,productId]=await Promise.all([customer(),fixture()]);
 const key=randomUUID();
 const res=await Promise.all(Array.from({length:20},()=>hold(token,productId,key)));
 assert.ok(res.every(r=>r.status===201||r.status===200));
 assert.equal(new Set(res.map(r=>r.body.data.holdId)).size,1);
 const changed=await hold(token,productId,key,{returnDate:'2026-11-14'});
 assert.equal(changed.status,409);assert.equal(changed.body.code,'IDEMPOTENCY_KEY_REUSED');
});
test('expired hold does not grant confirmed booking and can be replaced',async()=>{
 const [token,productId]=await Promise.all([customer(),fixture()]);
 const first=await hold(token,productId);
 await db.execute('UPDATE lr_inventory_holds SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND) WHERE id=?',[first.body.data.holdId]);
 const expired=await request(app).get('/api/v1/rental-holds/'+first.body.data.holdId).set('Authorization','Bearer '+token);
 assert.equal(expired.body.data.status,'EXPIRED');
 const again=await hold(token,productId);
 assert.equal(again.status,201);
 assert.notEqual(again.body.data.holdId,first.body.data.holdId);
});
