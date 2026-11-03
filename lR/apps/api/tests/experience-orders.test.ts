import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type{RowDataPacket} from 'mysql2';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';

const cfg=readConfig();
if(cfg.NODE_ENV!=='test'||cfg.DB_NAME!=='lr_test')throw Error('isolated lr_test only');
const db=openPool(cfg),app=createApp(db,{demoMode:true});
const pass='sample-dummy-password-2026';
let productId='',owner='',other='',admin='',orderId='',sameKey='';
async function signIn(adminRole=false){
 const email=randomUUID().slice(0,16)+'@example.invalid';
 const registered=await request(app).post('/api/v1/auth/register').send({email,password:pass});
 assert.equal(registered.status,201);
 if(adminRole)await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[registered.body.data.userId]);
 const logged=await request(app).post('/api/v1/auth/login').send({email,password:pass});
 assert.equal(logged.status,200);
 return logged.body.data.accessToken as string;
}
before(async()=>{
 await db.query('SELECT 1');
 const suffix=randomUUID().slice(0,12);productId='exp-'+suffix;
 await db.execute("INSERT INTO lr_products(id,title,brand,category,condition_grade,published,is_demo) VALUES(?,'Portfolio Bag','TEST','bag','A',1,1)",[productId]);
 await db.execute("INSERT INTO lr_product_offers(id,product_id,channel,day_rate_krw,deposit_krw,is_active) VALUES(?,?,'RENTAL',28000,100000,1)",['expo-'+suffix,productId]);
 await db.execute("INSERT INTO lr_inventory_units(id,product_id,serial,condition_grade,physical_state) VALUES(?,?,?,'A','READY')",['expu-'+suffix,productId,'TEST-EXPERIENCE-'+suffix]);
 [owner,other,admin]=await Promise.all([signIn(),signIn(),signIn(true)]);
 sameKey=randomUUID();
});
after(async()=>db.end());
const input=()=>({productId,startDate:'2026-11-10',returnDate:'2026-11-13',paymentMethod:'CARD',deliveryMethod:'COURIER',deliveryPreset:'SAMPLE_SEOUL'});
const post=(token:string,key:string,body:unknown=input())=>request(app).post('/api/v1/experience/orders').set('Authorization','Bearer '+token).set('Idempotency-Key',key).send(body);
const get=(path:string,token?:string)=>{
 const r=request(app).get(path);
 return token?r.set('Authorization','Bearer '+token):r;
};
test('checkout stores one non-financial order with server KRW and exposes receipt',async()=>{
 const created=await post(owner,sameKey);
 assert.equal(created.status,201,JSON.stringify(created.body));
 assert.equal(created.headers['cache-control'],'no-store');
 assert.match(created.headers.location,/^\/api\/v1\/experience\/orders\//);
 assert.equal(created.body.data.status,'RECEIVED');
 assert.equal(created.body.data.paymentStatus,'NOT_CHARGED');
 assert.equal(created.body.data.rentalFeeKrw,84000);
 assert.equal(created.body.data.depositKrw,100000);
 assert.equal(created.body.data.payableKrw,184000);
 assert.equal(created.body.data.demo,true);
 assert.equal(created.body.data.deliveryPreset,'SAMPLE_SEOUL');
 assert.equal(created.body.data.title,'Portfolio Bag');
 orderId=created.body.data.orderId;
 const detail=await get('/api/v1/experience/orders/'+orderId,owner);
 assert.equal(detail.status,200);
 assert.equal(detail.body.data.orderId,orderId);
 const mine=await get('/api/v1/experience/orders?limit=20&offset=0',owner);
 assert.equal(mine.status,200);
 assert.ok(mine.body.data.some((x:{orderId:string})=>x.orderId===orderId));
});
test('20 duplicate submissions yield one order and changed body with same key conflicts',async()=>{
 const results=await Promise.all(Array.from({length:20},()=>post(owner,sameKey)));
 assert.ok(results.every(r=>r.status===200));
 assert.equal(new Set(results.map(r=>r.body.data.orderId)).size,1);
 assert.equal(results[0].body.data.orderId,orderId);
 const altered=await post(owner,sameKey,{...input(),paymentMethod:'TRANSFER'});
 assert.equal(altered.status,409);
 const [rows]=await db.execute<Array<RowDataPacket&{n:string}>>('SELECT COUNT(*) n FROM lr_portfolio_orders WHERE idempotency_key=?',[sameKey]);
 assert.equal(Number(rows[0].n),1);
});
test('no request can force amount, real card, address, payment result or status',async()=>{
 for(const fake of [
  {...input(),payableKrw:1},{...input(),status:'PAID'},{...input(),paymentStatus:'PAID'},
  {...input(),cardNumber:'4111111111111111'},{...input(),deliveryAddress:'real address'},
  {...input(),paymentMethod:'REAL_PG'},{...input(),deliveryPreset:'real address'},
  {...input(),deliveryMethod:'PICKUP',deliveryPreset:'SAMPLE_SEOUL'}
 ]){
  const r=await post(owner,randomUUID(),fake);
  assert.equal(r.status,422,JSON.stringify(fake));
 }
 assert.equal((await post(owner,'not-a-uuid')).status,422);
});
test('customer isolation, ADMIN read-only listing and no real endpoints',async()=>{
 assert.equal((await get('/api/v1/experience/orders/'+orderId,other)).status,404);
 assert.equal((await get('/api/v1/experience/orders/'+orderId)).status,401);
 assert.equal((await get('/api/v1/admin/experience/orders',other)).status,403);
 const adminList=await get('/api/v1/admin/experience/orders?limit=20&offset=0',admin);
 assert.equal(adminList.status,200);
 assert.ok(adminList.body.data.some((v:{orderId:string})=>v.orderId===orderId));
 assert.equal(adminList.headers['cache-control'],'no-store');
 assert.ok(!JSON.stringify(adminList.body).includes('token_hash'));
 assert.ok(!JSON.stringify(adminList.body).includes('password_hash'));
 const bad=await get('/api/v1/experience/orders?limit=1000',owner);
 assert.equal(bad.status,422);
 const [units]=await db.execute<Array<RowDataPacket&{physical_state:string}>>('SELECT physical_state FROM lr_inventory_units WHERE product_id=?',[productId]);
 assert.equal(units[0].physical_state,'READY');
 const [ledger]=await db.execute<Array<RowDataPacket&{n:string}>>('SELECT COUNT(*) n FROM lr_demo_orders WHERE unit_id IN (SELECT id FROM lr_inventory_units WHERE product_id=?)',[productId]);
 assert.equal(Number(ledger[0].n),0);
 assert.equal((await request(app).post('/api/v1/orders').send({})).status,501);
 assert.equal((await request(app).post('/api/v1/payments/confirm').send({})).status,501);
});
test('production-style app cannot create or list portfolio orders',async()=>{
 const off=createApp(db,{demoMode:false});
 assert.equal((await request(off).post('/api/v1/experience/orders').send(input())).status,501);
 assert.equal((await request(off).get('/api/v1/experience/orders').set('Authorization','Bearer '+owner)).status,501);
 assert.equal((await request(off).get('/api/v1/admin/experience/orders').set('Authorization','Bearer '+admin)).status,501);
});
