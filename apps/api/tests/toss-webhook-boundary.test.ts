import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import request from 'supertest';
import type{Database} from '../src/db.js';
import {createApp} from '../src/app.js';
import {
 verifyTossWebhookSignature,deriveTossEventDedupKey,inspectSignedTossSandboxEvent,
 type TossPaymentSnapshot
} from '../src/toss-webhook-boundary.js';

const secret='TEST-ONLY-LOCAL-SIGNATURE-KEY-32-BYTES';
const rotated='ROTATED-TEST-ONLY-SIGNING-KEY-32';
const timestamp='2026-11-02T04:00:00Z';
const payload=(eventId?:string)=>({
 eventType:'PAYMENT_STATUS_CHANGED',
 ...(eventId?{eventId}:{}),
 data:{orderId:'order-test-001',paymentKey:'pay-test-001',status:'DONE'}
});
const raw=(value:unknown)=>Buffer.from(JSON.stringify(value));
function sign(bytes:Buffer,secretKey=secret,at=timestamp){
 return 'v1:'+createHmac('sha256',secretKey)
  .update(bytes).update(':'+at,'utf8').digest('base64');
}
const expected={orderId:'order-test-001',merchantId:'test_merchant_123',payableKrw:184000};
const snapshot:TossPaymentSnapshot={
 orderId:expected.orderId,mId:expected.merchantId,paymentKey:'pay-test-001',
 status:'DONE',totalAmount:184000
};
function run(overrides:{
 body?:unknown,header?:string,time?:string,key?:string,expected?:typeof expected,
 snapshot?:TossPaymentSnapshot,lookup?:()=>Promise<TossPaymentSnapshot>
}={}){
 const bytes=raw(overrides.body??payload('event-demo-001'));
 return inspectSignedTossSandboxEvent({
  rawBody:bytes,headers:{signature:overrides.header??sign(bytes,overrides.key??secret,overrides.time??timestamp),
  transmissionTime:overrides.time??timestamp},
  signingSecrets:[secret],
  expected:overrides.expected??expected,
  lookup:overrides.lookup??(async()=>overrides.snapshot??snapshot)
 });
}

test('valid raw-byte HMAC and rotated/multiple signatures pass',()=>{
 const bytes=raw(payload());
 const good=sign(bytes);
 assert.equal(verifyTossWebhookSignature(bytes,{signature:good,transmissionTime:timestamp},[secret]),true);
 const bad=sign(bytes,rotated);
 assert.equal(verifyTossWebhookSignature(bytes,{signature:bad+', '+good,transmissionTime:timestamp},[secret]),true);
 assert.equal(verifyTossWebhookSignature(bytes,{signature:bad,transmissionTime:timestamp},[secret,rotated]),true);
});
test('body whitespace modification invalidates signature: never reserialize payload',()=>{
 const bytes=raw(payload());const canonical=sign(bytes);
 const changed=Buffer.from(JSON.stringify(payload(),null,2));
 assert.equal(verifyTossWebhookSignature(changed,{signature:canonical,transmissionTime:timestamp},[secret]),false);
});
test('signature with wrong timestamp, wrong key, changed JSON body or empty header fails',()=>{
 const bytes=raw(payload());
 for(const headers of [
  {signature:sign(bytes),transmissionTime:'2026-11-02T04:01:00Z'},
  {signature:sign(bytes,rotated),transmissionTime:timestamp},
  {signature:undefined,transmissionTime:timestamp},
  {signature:'',transmissionTime:timestamp},
  {signature:sign(bytes),transmissionTime:undefined}
 ]){
  assert.equal(verifyTossWebhookSignature(bytes,headers,[secret]),false);
 }
});
test('malformed versions/base64, oversized payload/headers and empty body fail closed',()=>{
 const bytes=raw(payload());
 for(const wrong of ['v2:'+sign(bytes).slice(3),'v1:not-base64','v1:'+('A'.repeat(44)),sign(bytes)+',v1:bad']){
  assert.equal(verifyTossWebhookSignature(bytes,{signature:wrong,transmissionTime:timestamp},[secret]),false);
 }
 assert.equal(verifyTossWebhookSignature(Buffer.alloc(65*1024,65),{signature:sign(bytes),transmissionTime:timestamp},[secret]),false);
 assert.equal(verifyTossWebhookSignature(Buffer.alloc(0),{signature:sign(bytes),transmissionTime:timestamp},[secret]),false);
 assert.equal(verifyTossWebhookSignature(bytes,{signature:'x'.repeat(4097),transmissionTime:timestamp},[secret]),false);
 assert.equal(verifyTossWebhookSignature(bytes,{signature:sign(bytes),transmissionTime:'x\n'},[secret]),false);
});
test('missing or too short signing secrets must throw configuration error, not bypass verification',()=>{
 const bytes=raw(payload()),h={signature:sign(bytes),transmissionTime:timestamp};
 for(const secrets of [[],['short'],Array(5).fill(secret)]){
  assert.throws(()=>verifyTossWebhookSignature(bytes,h,secrets),/configuration invalid/);
 }
});
test('event ID is opaque and transmission-id is NEVER used for deduplication',()=>{
 assert.ok(deriveTossEventDedupKey(payload('event-1'))?.startsWith('toss-event:'));
 assert.equal(deriveTossEventDedupKey({...payload(),transmissionId:'retry-1'}),null);
 assert.equal(deriveTossEventDedupKey({...payload(),eventId:''}),null);
 assert.equal(deriveTossEventDedupKey({...payload(),eventId:'a'.repeat(65)}),null);
});
test('valid synthetic signature + server payment snapshot only yields non-mutating sandbox match',async()=>{
 const result=await run();
 assert.equal(result.decision,'SANDBOX_MATCH_ONLY');
 assert.equal(result.reason,'LOOKUP_CONFIRMED');
 if(result.decision==='SANDBOX_MATCH_ONLY')assert.equal(result.verifiedAmountKrw,184000);
});
test('invalid signature rejects before parsing and MUST NEVER call lookup',async()=>{
 let calls=0;
 const bytes=raw(payload());
 const result=await inspectSignedTossSandboxEvent({rawBody:bytes,
  headers:{signature:sign(bytes,rotated),transmissionTime:timestamp},
  signingSecrets:[secret],expected,
  lookup:async()=>{calls++;return snapshot;}
 });
 assert.equal(result.reason,'INVALID_SIGNATURE');assert.equal(calls,0);
});
test('malformed or non-payment event is rejected even if signed',async()=>{
 for(const body of [{eventType:'PAYMENT_STATUS_CHANGED',data:{orderId:'abc'}},
  {eventType:'payout.changed',eventId:'abc',data:snapshot},
  {eventType:'PAYMENT_STATUS_CHANGED',data:{orderId:'abc',paymentKey:'abc',status:'DONE'}}]){
  const result=await run({body});
  assert.notEqual(result.decision,'SANDBOX_MATCH_ONLY');
 }
});
test('order ID spoofing is rejected before a payment lookup',async()=>{
 let lookups=0;
 const body={...payload(),data:{...payload().data,orderId:'forged-order'}};
 const result=await run({body,lookup:async()=>{lookups++;return snapshot;}});
 assert.equal(result.reason,'ORDER_MISMATCH');assert.equal(lookups,0);
});
test('PG lookup merchant, order, paymentKey, amount and status must all match',async()=>{
 const variations=[
  [{mId:'other_merchant'},'MERCHANT_MISMATCH'],
  [{orderId:'other-order'},'ORDER_MISMATCH'],
  [{paymentKey:'different-key'},'PAYMENT_KEY_MISMATCH'],
  [{totalAmount:183999},'AMOUNT_MISMATCH'],
  [{totalAmount:184001},'AMOUNT_MISMATCH'],
  [{totalAmount:184000.5},'AMOUNT_MISMATCH'],
  [{status:'FAILED'},'PAYMENT_STATUS_MISMATCH']
 ] as const;
 for(const [fields,reason] of variations){
  const result=await run({snapshot:{...snapshot,...fields}});
  assert.equal(result.reason,reason);
 }
});
test('even matching non-DONE/CANCELED snapshot cannot confirm a payment',async()=>{
 for(const status of ['CANCELED','PARTIAL_CANCELED','WAITING_FOR_DEPOSIT','EXPIRED']){
  const body={...payload(),data:{...payload().data,status}};
  const result=await run({body,snapshot:{...snapshot,status}});
  assert.equal(result.decision,'REVIEW_REQUIRED');
  assert.equal(result.reason,'PAYMENT_NOT_COMPLETED');
 }
});
test('provider lookup timeout/error requires reconciliation, not simulated paid',async()=>{
 const result=await run({lookup:async()=>{throw new Error('timeout - no credentials');}});
 assert.equal(result.reason,'PROVIDER_LOOKUP_FAILED');
});
test('no real Toss webhook, order confirmation or refund API routes are exposed',async()=>{
 const app=createApp({} as Database,{demoMode:true});
 assert.equal((await request(app).post('/api/v1/payments/toss/webhook').send({})).status,404);
 assert.equal((await request(app).post('/api/v1/payments/confirm').send({})).status,501);
 assert.equal((await request(app).post('/api/v1/orders').send({})).status,501);
});
