import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {readConfig} from '../src/config.js';
import {openPool} from '../src/db.js';
import {rentalDays} from '../src/date.js';
const cfg=readConfig();
if(cfg.DB_NAME!=='lr_test')throw new Error('API integration tests require lr_test');
const pool=openPool(cfg);
const app=createApp(pool,{demoMode:true});
before(async()=>{await pool.query('SELECT 1');});
after(async()=>{await pool.end();});
test('health and database readiness',async()=>{
 const health=await request(app).get('/health');
 assert.equal(health.status,200);assert.equal(health.body.status,'ok');
 const ready=await request(app).get('/ready');
 assert.equal(ready.status,200);assert.equal(ready.body.status,'ready');
});
test('published product DTO exposes DEMO and both offers',async()=>{
 const res=await request(app).get('/api/v1/products?brand=DEMO');
 assert.equal(res.status,200);assert.ok(res.headers['x-request-id']);
 // Concurrent hold tests create their own TEST-brand fixtures in the same isolated DB.
 assert.equal(res.body.data.length,4);
 const item=res.body.data[0];
 assert.equal(item.id,'demo-bag-01');assert.equal(item.dayRateKrw,28000);
 assert.equal(item.salePriceKrw,900000);assert.equal(item.demo,true);
 assert.deepEqual(item.channels,['RENTAL','STORE']);
});
test('search filters safely and exposes normalized pagination',async()=>{
 const match=await request(app).get('/api/v1/products?q=Sera&channel=RENTAL&limit=1');
 assert.equal(match.status,200);assert.equal(match.body.data[0].id,'demo-bag-01');
 const none=await request(app).get('/api/v1/products?q=does-not-exist');
 assert.equal(none.status,200);assert.deepEqual(none.body.data,[]);
 assert.equal(none.body.meta.page.hasNext,false);
 const bad=await request(app).get('/api/v1/products?limit=1000');
 assert.equal(bad.status,422);assert.equal(bad.headers['content-type']?.includes('application/problem+json'),true);
});
test('product detail and missing product response',async()=>{
 const product=await request(app).get('/api/v1/products/demo-bag-01');
 assert.equal(product.status,200);
 assert.equal(product.body.data.offers.length,2);
 const miss=await request(app).get('/api/v1/products/not-real');
 assert.equal(miss.status,404);assert.equal(miss.body.code,'NOT_FOUND');
});
test('availability counts physical inventory excluding active test holds',async()=>{
 const busy=await request(app).get('/api/v1/products/demo-bag-01/availability?startDate=2026-11-10&returnDate=2026-11-13');
 assert.equal(busy.status,200);
 assert.equal(busy.body.data.rentalDays,3);
 assert.equal(busy.body.data.eligibleUnitCount,1);
 const adjacent=await request(app).get('/api/v1/products/demo-bag-01/availability?startDate=2026-11-13&returnDate=2026-11-15');
 assert.equal(adjacent.status,200);assert.equal(adjacent.body.data.eligibleUnitCount,2);
});
test('server quote uses half-open date interval and explicit demo terms',async()=>{
 const res=await request(app).post('/api/v1/rentals/quote').send({productId:'demo-bag-01',startDate:'2026-11-10',returnDate:'2026-11-13'});
 assert.equal(res.status,200);
 const q=res.body.data;
 assert.equal(q.rentalDays,3);assert.equal(q.rentalFeeKrw,84000);
 assert.equal(q.depositKrw,100000);assert.equal(q.payableNowKrw,184000);assert.equal(q.demo,true);
});
test('invalid, impossible and reverse dates are rejected',async()=>{
 for(const [startDate,returnDate] of [
  ['2026-02-30','2026-03-05'],
  ['2026-11-13','2026-11-10'],
  ['2026-11-10','2026-11-10']
 ]){
  const res=await request(app).post('/api/v1/rentals/quote').send({productId:'demo-bag-01',startDate,returnDate});
  assert.equal(res.status,422);assert.equal(res.body.code,'VALIDATION_ERROR');
 }
 assert.equal(rentalDays('2028-02-28','2028-03-01'),2);
});
test('payments and bookings remain explicitly unavailable',async()=>{
 const routes=['/api/v1/rentals','/api/v1/orders','/api/v1/payments/confirm'];
 for(const url of routes){
  const res=await request(app).post(url).send({});
  assert.equal(res.status,501);assert.equal(res.body.code,'NOT_IMPLEMENTED');
 }
});
test('unavailable item returns conflict; no checkout created',async()=>{
 const connection=await pool.getConnection();
 try{
  await connection.beginTransaction();
  await connection.execute("UPDATE lr_inventory_units SET physical_state='REPAIR' WHERE id='demo-unit-02'");
  await connection.commit();
  const res=await request(app).post('/api/v1/rentals/quote').send({productId:'demo-bag-01',startDate:'2026-11-10',returnDate:'2026-11-13'});
  assert.equal(res.status,409);assert.equal(res.body.code,'INVENTORY_CONFLICT');
 }finally{
  await connection.execute("UPDATE lr_inventory_units SET physical_state='READY' WHERE id='demo-unit-02'");
  connection.release();
 }
});

test('CORS preflight permits only configured Expo web origin',async()=>{
 const corsApp=createApp(pool,{demoMode:true,corsOrigins:['http://localhost:8081']});
 const good=await request(corsApp).options('/api/v1/rentals/quote')
  .set('Origin','http://localhost:8081')
  .set('Access-Control-Request-Method','POST');
 assert.equal(good.status,204);
 assert.equal(good.headers['access-control-allow-origin'],'http://localhost:8081');
 assert.equal(good.headers['access-control-allow-headers'].includes('Content-Type'),true);
 const rejected=await request(corsApp).get('/health').set('Origin','https://attacker.example');
 assert.equal(rejected.status,200);
 assert.equal(rejected.headers['access-control-allow-origin'],undefined);
});
