import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import type{RowDataPacket} from 'mysql2';
import {createApp} from '../src/app.js';
import {readConfig} from '../src/config.js';
import {openPool} from '../src/db.js';
import {acquireInventoryHold} from '../src/holds.js';
import {createDemoPaymentOrder,applyVerifiedMockEvent} from '../src/demo-payment.js';

const config=readConfig();
if(config.DB_NAME!=='lr_test'||config.NODE_ENV!=='test')throw new Error('only synthetic lr_test is permitted');
const db=openPool(config);
const app=createApp(db,{demoMode:true});
const password='not-a-real-secret-2026';
const email=()=>randomUUID()+'@example.invalid';
let adminToken='',customerToken='',orderId='',productId='';
let eventId='',paymentId='';
const token=async(role:'ADMIN'|'CUSTOMER')=>{
 const registered=await request(app).post('/api/v1/auth/register').send({email:email(),password});
 assert.equal(registered.status,201);
 if(role==='ADMIN')await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[registered.body.data.userId]);
 const logged=await request(app).post('/api/v1/auth/login').send({email:registered.body.data.email,password});
 assert.equal(logged.status,200);
 return logged.body.data.accessToken as string;
};

before(async()=>{
 await db.query('SELECT 1');
 const suffix=randomUUID().slice(0,12);
 productId='audit-'+suffix;
 const unitId='auditu-'+suffix;
 await db.execute("INSERT INTO lr_products(id,title,brand,category,condition_grade,published,is_demo) VALUES(?,'QA Synthetic Rental','TEST','bag','A',1,1)",[productId]);
 await db.execute("INSERT INTO lr_product_offers(id,product_id,channel,day_rate_krw,deposit_krw,is_active) VALUES(?,?,'RENTAL',12000,25000,1)",['audito-'+suffix,productId]);
 await db.execute("INSERT INTO lr_inventory_units(id,product_id,serial,condition_grade,physical_state) VALUES(?,?,?,'A','READY')",[unitId,productId,'SYNTH-AUDIT-'+suffix]);
 const hold=await acquireInventoryHold(db,{actorId:'audit-actor-'+suffix,idempotencyKey:'audit-hold-'+suffix,
  productId,kind:'RENTAL',startDate:'2026-11-10',returnDate:'2026-11-13'});
 const order=await createDemoPaymentOrder(db,{actorId:'audit-actor-'+suffix,holdId:hold.holdId});
 orderId=order.orderId;
 eventId=randomUUID();paymentId=randomUUID();
 await applyVerifiedMockEvent(db,{eventId,orderId,providerPaymentId:paymentId,status:'DONE',claimedAmountKrw:1},
  async()=>({orderId,providerPaymentId:paymentId,status:'DONE',verifiedAmountKrw:61000,merchantId:'DEMO_ONLY'}));
 adminToken=await token('ADMIN');
 customerToken=await token('CUSTOMER');
});
after(async()=>{await db.end()});
const get=(url:string,t?:string)=>{const r=request(app).get(url);return t?r.set('Authorization','Bearer '+t):r;};

test('only admin can list isolated demo orders by exact orderId and see server-calculated money',async()=>{
 const res=await get('/api/v1/admin/demo-orders?orderId='+orderId+'&limit=10&offset=0',adminToken);
 assert.equal(res.status,200);
 assert.equal(res.headers['cache-control'],'no-store');
 assert.equal(res.body.meta.page.limit,10);
 assert.equal(res.body.data.length,1);
 const row=res.body.data[0];
 assert.equal(row.orderId,orderId);assert.equal(row.productId,productId);
 assert.equal(row.title,'QA Synthetic Rental');
 assert.equal(row.status,'SIMULATED_PAID');
 assert.equal(row.rentalFeeKrw,36000);assert.equal(row.depositKrw,25000);
 assert.equal(row.payableKrw,61000);assert.equal(row.demo,true);
 assert.equal(row.policyVersion,'demo-only');
 for(const forbidden of ['passwordHash','email','accessToken','providerPaymentId','token_hash','claimedAmountKrw'])
  assert.ok(!JSON.stringify(res.body).includes(forbidden),forbidden+' leak');
});
test('admin may read append-only mock audit and event results but not provider identifiers',async()=>{
 const res=await get('/api/v1/admin/demo-orders/'+orderId,adminToken);
 assert.equal(res.status,200);
 assert.equal(res.headers['cache-control'],'no-store');
 assert.deepEqual(res.body.data.audit.map((x:{action:string})=>x.action),['CREATED','SIMULATED_PAID']);
 assert.deepEqual(res.body.data.events.map((x:{status:string})=>x.status),['DONE']);
 assert.equal(res.body.data.status,'SIMULATED_PAID');
 assert.equal(res.body.data.events[0].verifiedAmountKrw,61000);
 assert.ok(!JSON.stringify(res.body).includes(paymentId));
 assert.ok(!JSON.stringify(res.body).includes(eventId));
});
test('unauthenticated or customer sessions cannot inspect admin orders',async()=>{
 for(const url of ['/api/v1/admin/demo-orders','/api/v1/admin/demo-orders/'+orderId]){
  const unauth=await get(url);
  assert.equal(unauth.status,401);
  const forbidden=await get(url,customerToken);
  assert.equal(forbidden.status,403);
  assert.equal(forbidden.body.code,'FORBIDDEN');
  assert.ok(!JSON.stringify(forbidden.body).includes(orderId));
 }
});
test('admin can only use safe filtered pagination and rejects invalid or unknown id',async()=>{
 assert.equal((await get('/api/v1/admin/demo-orders?status=SIMULATED_PAID&orderId='+orderId,adminToken)).body.data.length,1);
 assert.deepEqual((await get('/api/v1/admin/demo-orders?status=FAILED&orderId='+orderId,adminToken)).body.data,[]);
 for(const bad of ['limit=500','offset=-1','status=PAID','orderId=invalid','unknown=123']){
  assert.equal((await get('/api/v1/admin/demo-orders?'+bad,adminToken)).status,422,bad);
 }
 assert.equal((await get('/api/v1/admin/demo-orders/not-an-id',adminToken)).status,422);
 assert.equal((await get('/api/v1/admin/demo-orders/'+randomUUID(),adminToken)).status,404);
});
test('demo-only read APIs stay blocked in disabled application and never offer write operations',async()=>{
 const disabled=createApp(db,{demoMode:false});
 for(const route of ['/api/v1/admin/demo-orders','/api/v1/admin/demo-orders/'+orderId]){
  assert.equal((await request(disabled).get(route).set('Authorization','Bearer '+adminToken)).status,501);
 }
 assert.equal((await request(app).post('/api/v1/admin/demo-orders').set('Authorization','Bearer '+adminToken).send({})).status,404);
 assert.equal((await request(app).patch('/api/v1/admin/demo-orders/'+orderId).set('Authorization','Bearer '+adminToken).send({status:'CONFIRMED'})).status,404);
 // The order is a mock state, not a rental, sale or fulfillment.
 const [rows]=await db.execute<Array<RowDataPacket&{status:string}>>('SELECT physical_state AS status FROM lr_inventory_units WHERE product_id=?',[productId]);
 assert.equal(rows[0].status,'READY');
});
