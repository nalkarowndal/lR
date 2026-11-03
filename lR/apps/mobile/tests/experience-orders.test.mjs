import test from 'node:test';
import assert from 'node:assert/strict';
import {AuthError} from '../src/auth/api.ts';
import {createExperienceOrdersClient,parseExperienceOrder,createIntakeRequestKey} from '../src/auth/experience-orders.ts';

const id='11111111-1111-4111-8111-111111111111',token='X'.repeat(44);
const row={orderId:id,productId:'demo-bag-01',title:'The Sera Top Handle',
 startDate:'2026-11-10',returnDate:'2026-11-13',rentalDays:3,
 paymentMethod:'CARD',deliveryMethod:'COURIER',deliveryPreset:'SAMPLE_SEOUL',
 rentalFeeKrw:84000,depositKrw:100000,payableKrw:184000,
 status:'RECEIVED',paymentStatus:'NOT_CHARGED',createdAt:'2026-11-03 05:00:00.000',demo:true};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
test('portfolio order response requires server saved received/not-charged contract',()=>{
 assert.equal(parseExperienceOrder({data:row,meta:{demo:true}}).payableKrw,184000);
 assert.throws(()=>parseExperienceOrder({data:{...row,payableKrw:1},meta:{demo:true}}),AuthError);
 assert.throws(()=>parseExperienceOrder({data:{...row,status:'PAID'},meta:{demo:true}}),AuthError);
 assert.throws(()=>parseExperienceOrder({data:{...row,paymentStatus:'CHARGED'},meta:{demo:true}}),AuthError);
 assert.throws(()=>parseExperienceOrder({data:{...row,deliveryPreset:'PERSONAL_ADDRESS'},meta:{demo:true}}),AuthError);
 assert.throws(()=>parseExperienceOrder({data:row,meta:{demo:false}}),AuthError);
});
test('portfolio client posts only selected options with idempotency, bearer and no-store',async()=>{
 const seen=[];
 const client=createExperienceOrdersClient('http://127.0.0.1:4000',async(url,init)=>{
  seen.push({url,method:init.method,headers:init.headers,body:init.body,cache:init.cache});
  return json({data:row,meta:{demo:true}},201);
 });
 const payload={productId:row.productId,startDate:row.startDate,returnDate:row.returnDate,paymentMethod:'CARD',deliveryMethod:'COURIER',deliveryPreset:'SAMPLE_SEOUL'};
 const order=await client.create(token,id,payload);
 assert.equal(order.orderId,id);
 assert.equal(seen[0].method,'POST');assert.equal(seen[0].headers.Authorization,'Bearer '+token);
 assert.equal(seen[0].headers['Idempotency-Key'],id);
 assert.equal(seen[0].cache,'no-store');
 assert.deepEqual(JSON.parse(seen[0].body),payload);
 assert.ok(!seen[0].url.includes(token));
});
test('list, detail and admin list are authenticated and never mutate payment',async()=>{
 const seen=[];
 const c=createExperienceOrdersClient('https://api.example.test',async(url,init)=>{
  seen.push({url,init});
  return json(url.includes('?limit=')?{data:[row],meta:{demo:true,page:{limit:20,offset:0}}}:{data:row,meta:{demo:true}});
 });
 assert.equal((await c.list(token)).length,1);
 assert.equal((await c.detail(token,id)).orderId,id);
 assert.equal((await c.adminList(token)).length,1);
 assert.ok(seen.every(x=>x.init.method==='GET'));
 assert.ok(seen.every(x=>x.init.cache==='no-store'));
 await assert.rejects(()=>c.detail(token,'abc'),AuthError);
});
test('portfolio create never accepts invalid session and response errors do not become successful orders',async()=>{
 const c=createExperienceOrdersClient('https://api.example.test',async()=>json({title:'Unauthorized',code:'UNAUTHENTICATED'},401));
 await assert.rejects(()=>c.create('bad',id,{productId:'x',startDate:'2026-11-10',returnDate:'2026-11-13',paymentMethod:'CARD',deliveryMethod:'COURIER',deliveryPreset:'SAMPLE_SEOUL'}),AuthError);
 await assert.rejects(()=>c.list(token),e=>e instanceof AuthError&&e.status===401);
 assert.throws(()=>createExperienceOrdersClient('http://example.com:4000'),AuthError);
 const generated=createIntakeRequestKey();
 assert.match(generated,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
