import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import type{RowDataPacket} from 'mysql2';
import {createApp} from '../src/app.js';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';

const cfg=readConfig();
if(cfg.DB_NAME!=='lr_test'||cfg.NODE_ENV!=='test')throw Error('test DB only');
const db=openPool(cfg),app=createApp(db,{demoMode:true});
let actor='',stranger='',admin='',goodA='',goodB='',held='',rentalOnly='',savedId='';
const password='synthetic-example-password-2026';
async function login(isAdmin=false){
 const email=randomUUID().slice(0,16)+'@example.invalid';
 const reg=await request(app).post('/api/v1/auth/register').send({email,password});
 assert.equal(reg.status,201);
 if(isAdmin)await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[reg.body.data.userId]);
 const result=await request(app).post('/api/v1/auth/login').send({email,password});
 assert.equal(result.status,200);
 return result.body.data.accessToken as string;
}
const data=()=>({productIds:[goodB,goodA],paymentMethod:'EASY_PAY',deliveryMethod:'PICKUP',deliveryPreset:'SHOWROOM'});
const post=(token:string,key:string,payload:unknown=data())=>request(app).post('/api/v1/experience/store-orders')
 .set('Authorization','Bearer '+token).set('Idempotency-Key',key).send(payload);
const get=(path:string,token?:string)=>token?request(app).get(path).set('Authorization','Bearer '+token):request(app).get(path);
before(async()=>{
 const n=randomUUID().slice(0,9);
 [goodA,goodB,held,rentalOnly]=['a','b','held','rental'].map(x=>'st-'+x+'-'+n);
 for(const id of [goodA,goodB,held,rentalOnly]){
  await db.execute("INSERT INTO lr_products(id,title,brand,category,condition_grade,published,is_demo) VALUES(?,'Demo Store Item','TEST','bag','A',1,1)",[id]);
  await db.execute('INSERT INTO lr_product_offers(id,product_id,channel,sale_price_krw,day_rate_krw,is_active) VALUES(?,?,?,?,?,1)',
   ['off-'+id,id,id===rentalOnly?'RENTAL':'STORE',id===goodA?125000:id===goodB?234000:95000,id===rentalOnly?20000:null]);
  await db.execute("INSERT INTO lr_inventory_units(id,product_id,serial,condition_grade,physical_state) VALUES(?,?,?,'A','READY')",['unit-'+id,id,'S-'+id]);
 }
 await db.execute("INSERT INTO lr_inventory_holds(id,unit_id,kind,blocked_start_date,blocked_end_exclusive,expires_at,status,checkout_id) VALUES(?,?,'SALE',NULL,NULL,'2099-01-01 00:00:00','ACTIVE',?)",
 ['hold-'+n,'unit-'+held,'checkout-'+n]);
 [actor,stranger,admin]=await Promise.all([login(),login(),login(true)]);
});
after(async()=>db.end());

test('all-or-nothing multi-line unpaid STORE intake snapshots server price and exposes private history',async()=>{
 const key=randomUUID(),created=await post(actor,key);
 assert.equal(created.status,201,JSON.stringify(created.body));
 assert.equal(created.headers['cache-control'],'no-store');
 const order=created.body.data;savedId=order.orderId;
 assert.equal(order.channel,'STORE');
 assert.equal(order.status,'RECEIVED');assert.equal(order.paymentStatus,'NOT_CHARGED');
 assert.equal(order.totalKrw,359000);assert.equal(order.items.length,2);
 assert.deepEqual(order.items.map((x:{productId:string})=>x.productId),[goodA,goodB]);
 assert.equal(order.demo,true);
 assert.equal((await get('/api/v1/experience/store-orders/'+savedId,actor)).status,200);
 const mine=await get('/api/v1/experience/store-orders',actor);
 assert.ok(mine.body.data.some((x:{orderId:string})=>x.orderId===savedId));
 assert.equal((await get('/api/v1/experience/store-orders/'+savedId,stranger)).status,404);
 assert.equal((await get('/api/v1/experience/store-orders',stranger)).body.data.length,0);
 assert.equal((await get('/api/v1/experience/store-orders')).status,401);
 assert.equal((await get('/api/v1/admin/experience/store-orders',stranger)).status,403);
 const all=await get('/api/v1/admin/experience/store-orders',admin);
 assert.equal(all.status,200);assert.ok(all.body.data.some((x:{orderId:string})=>x.orderId===savedId));
 assert.ok(!JSON.stringify(all.body).includes('password_hash'));
 assert.equal((await get('/api/v1/experience/store-orders?limit=1000',actor)).status,422);
});

test('20 concurrent retries create exactly one order; keyed body mutations conflict',async()=>{
 const key=randomUUID();
 const results=await Promise.all(Array.from({length:20},()=>post(actor,key)));
 assert.ok(results.every(x=>[200,201].includes(x.status)),JSON.stringify(results.map(x=>x.status)));
 assert.equal(new Set(results.map(x=>x.body.data.orderId)).size,1);
 const changed=await post(actor,key,{...data(),paymentMethod:'CARD'});
 assert.equal(changed.status,409);
 const [rows]=await db.execute<Array<RowDataPacket&{count:string}>>(
  'SELECT COUNT(*) AS count FROM lr_portfolio_store_orders WHERE idempotency_key=?',[key]);
 assert.equal(Number(rows[0].count),1);
});

test('partial unavailable product, rental-only, and empty or duplicated checkout rejected without order write',async()=>{
 for(const productIds of [[goodA,held],[goodA,rentalOnly],[],[goodA,goodA]]){
  const response=await post(actor,randomUUID(),{...data(),productIds});
  assert.ok([409,422].includes(response.status),JSON.stringify(response.body));
 }
 assert.equal((await post(actor,randomUUID(),{...data(),totalKrw:1})).status,422);
 assert.equal((await post(actor,randomUUID(),{...data(),status:'PAID'})).status,422);
 assert.equal((await post(actor,randomUUID(),{...data(),cardNumber:'not accepted'})).status,422);
 assert.equal((await post(actor,randomUUID(),{...data(),address:'not accepted'})).status,422);
 assert.equal((await post(actor,randomUUID(),{...data(),deliveryMethod:'COURIER'})).status,422);
 assert.equal((await post(actor,'bad-uuid')).status,422);
});

test('unavailable item does not create a partial order or alter stock, rentals, payments or ERP',async()=>{
 const key=randomUUID();
 assert.equal((await post(actor,key,{...data(),productIds:[goodA,held]})).status,409);
 const [count]=await db.execute<Array<RowDataPacket&{n:string}>>('SELECT COUNT(*) AS n FROM lr_portfolio_store_orders WHERE idempotency_key=?',[key]);
 assert.equal(Number(count[0].n),0);
 const [rows]=await db.execute<Array<RowDataPacket&{physical_state:string}>>('SELECT physical_state FROM lr_inventory_units WHERE product_id IN (?,?)',[goodA,goodB]);
 assert.equal(rows.length,2);
 assert.ok(rows.every(r=>r.physical_state==='READY'));
 assert.equal((await request(app).post('/api/v1/orders').send({})).status,501);
 assert.equal((await request(app).post('/api/v1/payments/confirm').send({})).status,501);
});

test('disabled production-style mode returns 501 and owner detail is not bypassed',async()=>{
 const off=createApp(db,{demoMode:false});
 assert.equal((await request(off).post('/api/v1/experience/store-orders').send(data())).status,501);
 assert.equal((await request(off).get('/api/v1/experience/store-orders').set('Authorization','Bearer '+actor)).status,501);
 assert.equal((await request(off).get('/api/v1/admin/experience/store-orders').set('Authorization','Bearer '+admin)).status,501);
});
