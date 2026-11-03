import test from 'node:test';
import assert from 'node:assert/strict';
import {AuthError} from '../src/auth/api.ts';
import {createStoreOrdersClient,parseStoreOrder,parseStoreOrderList} from '../src/auth/store-orders.ts';
const id='11111111-1111-4111-8111-111111111111',token='x'.repeat(44);
const input={productIds:['bag-2','bag-1'],paymentMethod:'CARD',deliveryMethod:'COURIER',deliveryPreset:'SAMPLE_SEOUL'};
const order={orderId:id,channel:'STORE',items:[
 {productId:'bag-1',title:'First Bag',unitPriceKrw:125000,quantity:1,lineTotalKrw:125000},
 {productId:'bag-2',title:'Second Bag',unitPriceKrw:234000,quantity:1,lineTotalKrw:234000}
 ],totalKrw:359000,paymentMethod:'CARD',deliveryMethod:'COURIER',deliveryPreset:'SAMPLE_SEOUL',
 status:'RECEIVED',paymentStatus:'NOT_CHARGED',createdAt:'2026-11-03 05:00:00',demo:true};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
test('STORE response must contain complete consistent nonpaid receipt',()=>{
 assert.equal(parseStoreOrder({data:order,meta:{demo:true}}).totalKrw,359000);
 for(const bad of [
  {...order,totalKrw:1},{...order,status:'PAID'},{...order,paymentStatus:'CHARGED'},
  {...order,items:[order.items[0],order.items[0]]},
  {...order,items:[{...order.items[0],quantity:2}]},
  {...order,deliveryPreset:'SHOWROOM'}
 ]){
  assert.throws(()=>parseStoreOrder({data:bad,meta:{demo:true}}),AuthError);
 }
 assert.throws(()=>parseStoreOrder({data:order,meta:{demo:false}}),AuthError);
 assert.equal(parseStoreOrderList({data:[order],meta:{demo:true}}).length,1);
});
test('STORE intake posts only selected IDs/options and key; GETs never mutate',async()=>{
 const calls=[];
 const c=createStoreOrdersClient('http://127.0.0.1:4000',async(url,init)=>{
  calls.push({url,init});
  return json(url.includes('?limit=')?{data:[order],meta:{demo:true}}:{data:order,meta:{demo:true}},init.method==='POST'?201:200);
 });
 const saved=await c.create(token,id,input);
 assert.equal(saved.orderId,id);
 assert.equal((await c.list(token)).length,1);
 assert.equal((await c.adminList(token)).length,1);
 assert.equal((await c.detail(token,id)).orderId,id);
 assert.deepEqual(calls.map(x=>x.init.method),['POST','GET','GET','GET']);
 assert.deepEqual(JSON.parse(calls[0].init.body),input);
 assert.equal(calls[0].init.headers['Idempotency-Key'],id);
 assert.ok(calls.every(x=>x.init.headers.Authorization==='Bearer '+token&&x.init.cache==='no-store'));
});
test('STORE client rejects untrusted response, server failures and invalid login',async()=>{
 const c=createStoreOrdersClient('https://example.test',async()=>json({title:'No access',code:'FORBIDDEN'},403));
 await assert.rejects(()=>c.list(token),e=>e instanceof AuthError&&e.status===403);
 await assert.rejects(()=>c.create(token,id,{...input,productIds:['x','x']}),AuthError);
 await assert.rejects(()=>c.list('short'),AuthError);
 assert.throws(()=>createStoreOrdersClient('http://example.test'),AuthError);
});
