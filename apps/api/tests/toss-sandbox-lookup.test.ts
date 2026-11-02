import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import request from 'supertest';
import type{Database} from '../src/db.js';
import {createApp} from '../src/app.js';
import {createTossSandboxLookup,inspectFreshTossSandboxEvent,
 freshTossTransmissionTime,SandboxLookupError} from '../src/toss-sandbox-lookup.js';

const fakeSecret='test_sk_FICTIONAL_NONISSUED_1234567890';
const fakePayment='pay-example-001';
const auth='Basic '+Buffer.from(fakeSecret+':').toString('base64');
const json=(body:unknown,status=200,headers:Record<string,string>={})=>new Response(
 JSON.stringify(body),{status,headers:{'content-type':'application/json',...headers}}
);
const payment={paymentKey:fakePayment,orderId:'fake-order-0001',
 mId:'test_merchant_simulated',totalAmount:61000,status:'DONE'};
const err=(code:string)=>(e:unknown)=>e instanceof SandboxLookupError&&e.code===code;

test('server-only test key sends GET with Basic auth to fixed Toss HTTPS host',async()=>{
 let seen=0;
 const lookup=createTossSandboxLookup({secretKey:fakeSecret,fetcher:async(url,init)=>{
  seen++;
  assert.equal(url,'https://api.tosspayments.com/v1/payments/'+fakePayment);
  assert.equal(init.method,'GET');
  assert.deepEqual(init.headers,{Authorization:auth,Accept:'application/json'});
  assert.equal(init.redirect,'error');
  assert.equal(init.credentials,'omit');
  assert.equal(init.cache,'no-store');
  assert.ok(init.signal instanceof AbortSignal);
  return json(payment);
 }});
 assert.deepEqual(await lookup(fakePayment),payment);
 assert.equal(seen,1);
});
test('GET path percent-encodes opaque identifier, never permits host or route changes',async()=>{
 let requested='';
 const key='pay/ABC?next=redirect';
 const lookup=createTossSandboxLookup({secretKey:fakeSecret,fetcher:async(url)=>{
  requested=url;
  return json({...payment,paymentKey:key});
 }});
 await lookup(key);
 assert.equal(requested,'https://api.tosspayments.com/v1/payments/pay%2FABC%3Fnext%3Dredirect');
});
test('wrong live, unprefixed, too-short and malformed secret rejected before network',async()=>{
 for(const secretKey of ['live_sk_REAL_NOT_PROVIDED','test_gsk_demo','test_sk_short','',
  'test_sk_dummy_credential\nAuthorization: other']){
  assert.throws(()=>createTossSandboxLookup({secretKey}),err('INVALID_CONFIG'));
 }
 assert.throws(()=>createTossSandboxLookup({secretKey:fakeSecret,timeoutMs:0}),err('INVALID_CONFIG'));
 assert.throws(()=>createTossSandboxLookup({secretKey:fakeSecret,timeoutMs:20000}),err('INVALID_CONFIG'));
});
test('invalid payment identifiers reject before fetch',async()=>{
 let calls=0;const lookup=createTossSandboxLookup({secretKey:fakeSecret,
  fetcher:async()=>{calls++;return json(payment);}});
 for(const key of ['', '.', '..','\n','abc\rdef','a'.repeat(201),'\uD800']){
  await assert.rejects(()=>lookup(key),err('INVALID_PAYMENT_KEY'));
 }
 assert.equal(calls,0);
});
test('PG HTTP failure, HTML redirect, invalid content-type and oversized content rejected',async()=>{
 const responses=[
  json({message:'error',secret:'DO_NOT_PROPAGATE'},401),
  new Response(null,{status:302,headers:{location:'https://evil.example'}}),
  new Response('<html>unsafe</html>',{headers:{'content-type':'text/html'}}),
  json(payment,200,{'content-length':'66000'}),
  new Response('x'.repeat(66*1024),{headers:{'content-type':'application/json'}})
 ];
 for(const response of responses){
  const lookup=createTossSandboxLookup({secretKey:fakeSecret,fetcher:async()=>response});
  await assert.rejects(()=>lookup(fakePayment),e=>e instanceof SandboxLookupError&&
   ['PG_HTTP_ERROR','INVALID_RESPONSE'].includes(e.code)&&!e.message.includes('DO_NOT_PROPAGATE'));
 }
});
test('PG response shape, paymentKey, amount and JSON parse are fail closed',async()=>{
 const bodies=[
  {...payment,paymentKey:'different-payment'},
  {...payment,totalAmount:'61000'},
  {...payment,totalAmount:-1},
  {...payment,totalAmount:1.5},
  {...payment,mId:''},
  {...payment,orderId:undefined}
 ];
 for(const data of bodies){
  const lookup=createTossSandboxLookup({secretKey:fakeSecret,fetcher:async()=>json(data)});
  await assert.rejects(()=>lookup(fakePayment),err('INVALID_RESPONSE'));
 }
 const invalid=createTossSandboxLookup({secretKey:fakeSecret,
  fetcher:async()=>new Response('{',{headers:{'content-type':'application/json'}})});
 await assert.rejects(()=>invalid(fakePayment),err('INVALID_RESPONSE'));
});
test('network error hides upstream error text and never retries a payment lookup',async()=>{
 let calls=0;
 const lookup=createTossSandboxLookup({secretKey:fakeSecret,fetcher:async()=>{
  calls++;throw new Error('secret leaked from upstream');
 }});
 await assert.rejects(()=>lookup(fakePayment),e=>e instanceof SandboxLookupError&&
  e.code==='TRANSPORT_FAILURE'&&!e.message.includes('secret'));
 assert.equal(calls,1);
});
test('Toss timestamp freshness gates stale/future/invalid webhook before lookup',async()=>{
 const now=Date.parse('2026-11-02T06:00:00Z');
 assert.equal(freshTossTransmissionTime('2026-11-02T06:00:00Z',now),true);
 assert.equal(freshTossTransmissionTime('2026-11-02T05:55:00Z',now),true);
 assert.equal(freshTossTransmissionTime('2026-11-02T05:54:59Z',now),false);
 assert.equal(freshTossTransmissionTime('2026-11-02T06:05:01Z',now),false);
 assert.equal(freshTossTransmissionTime('invalid',now),false);
 const bytes=Buffer.from('{"eventType":"PAYMENT_STATUS_CHANGED"}');
 let calls=0;
 const verdict=await inspectFreshTossSandboxEvent({rawBody:bytes,
  headers:{transmissionTime:'2026-11-01T05:00:00Z',signature:'bad'},
  signingSecrets:['TEST-SYNTHETIC-WEBHOOK-SIGNING-SECRET-0123'],
  expected:{orderId:payment.orderId,merchantId:payment.mId,payableKrw:payment.totalAmount},
  lookup:async()=>{calls++;return payment;},now});
 assert.equal(verdict.reason,'STALE_TRANSMISSION_TIME');
 assert.equal(calls,0);
});
test('fresh signed synthetic webhook + injected HTTPS lookup returns read-only verdict',async()=>{
 const at='2026-11-02T06:00:00Z',now=Date.parse(at);
 const signingKey='TEST-SYNTHETIC-WEBHOOK-SIGNING-SECRET-0123';
 const bytes=Buffer.from(JSON.stringify({eventType:'PAYMENT_STATUS_CHANGED',eventId:'evt-001',
  data:{orderId:payment.orderId,paymentKey:payment.paymentKey,status:'DONE'}}));
 const signature='v1:'+createHmac('sha256',signingKey).update(bytes).update(':'+at).digest('base64');
 const lookup=createTossSandboxLookup({secretKey:fakeSecret,fetcher:async()=>json(payment)});
 const verdict=await inspectFreshTossSandboxEvent({rawBody:bytes,
  headers:{transmissionTime:at,signature},signingSecrets:[signingKey],
  expected:{orderId:payment.orderId,merchantId:payment.mId,payableKrw:payment.totalAmount},
  lookup,now});
 assert.equal(verdict.decision,'SANDBOX_MATCH_ONLY');
 const wrong=await inspectFreshTossSandboxEvent({rawBody:bytes,
  headers:{transmissionTime:at,signature},signingSecrets:[signingKey],
  expected:{orderId:payment.orderId,merchantId:payment.mId,payableKrw:payment.totalAmount+1},
  lookup,now});
 assert.equal(wrong.reason,'AMOUNT_MISMATCH');
});
test('no public provider lookup/PG confirmation routes have been added',async()=>{
 const app=createApp({} as Database,{demoMode:true});
 for(const route of ['/api/v1/payments/toss/lookup','/api/v1/payments/toss/webhook']){
  const result=await request(app).post(route).send({});
  assert.equal(result.status,404);
 }
 assert.equal((await request(app).post('/api/v1/payments/confirm').send({})).status,501);
});
test('adapter always fails closed outside NODE_ENV=test and DB_NAME=lr_test',()=>{
 const former=process.env.DB_NAME;
 try{
  process.env.DB_NAME='lr_demo_prod';
  assert.throws(()=>createTossSandboxLookup({secretKey:fakeSecret}),err('TEST_ONLY'));
 }finally{if(former===undefined)delete process.env.DB_NAME;else process.env.DB_NAME=former;}
});
