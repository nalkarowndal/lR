import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac,randomUUID} from 'node:crypto';
import type{RowDataPacket} from 'mysql2';
import request from 'supertest';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
import {createApp} from '../src/app.js';
import {acquireInventoryHold} from '../src/holds.js';
import {createDemoPaymentOrder} from '../src/demo-payment.js';
import {reconcileSignedDemoTossEvent,logicalTossStateKey} from '../src/toss-reconciliation.js';
import type{TossPaymentSnapshot} from '../src/toss-webhook-boundary.js';

const cfg=readConfig();
if(cfg.NODE_ENV!=='test'||cfg.DB_NAME!=='lr_test')throw new Error('M5-2B2B requires isolated lr_test');
const db=openPool(cfg);
before(async()=>{await db.query('SELECT 1');});
after(async()=>{await db.end();});

const signing='SYNTHETIC-HMAC-TEST-ONLY-NEVER-ISSUED-1234';
const merchant='test_FAKE_MERCHANT_SIMULATED';
const at='2026-11-02T09:00:00Z';
const now=Date.parse(at);
async function order(){
 const suffix=randomUUID().slice(0,12),productId='recp-'+suffix,unitId='recu-'+suffix;
 await db.execute(`INSERT INTO lr_products(id,title,brand,category,condition_grade,published,is_demo)
 VALUES(?,'Demo reconciliation item','DEMO','bag','A',1,1)`,[productId]);
 await db.execute(`INSERT INTO lr_product_offers(id,product_id,channel,day_rate_krw,deposit_krw,is_active)
 VALUES(?,?,'RENTAL',12000,25000,1)`,['reco-'+suffix,productId]);
 await db.execute(`INSERT INTO lr_inventory_units(id,product_id,serial,condition_grade,physical_state)
 VALUES(?,?,?,'A','READY')`,[unitId,productId,'RECON-'+suffix]);
 const actorId='actor-'+suffix;
 const hold=await acquireInventoryHold(db,{
  actorId,idempotencyKey:'reconcile-'+suffix,productId,kind:'RENTAL',
  startDate:'2026-11-10',returnDate:'2026-11-13'
 });
 const o=await createDemoPaymentOrder(db,{actorId,holdId:hold.holdId});
 return {o,hold,unitId,actorId};
}
const pg=(orderId:string,paymentKey:string,status='DONE',amount=61000):TossPaymentSnapshot=>({
 orderId,paymentKey,status,mId:merchant,totalAmount:amount
});
function signed(o:{orderId:string},key:string,status='DONE',eventId?:string,when=at){
 const data={eventType:'PAYMENT_STATUS_CHANGED',
  ...(eventId?{eventId}:{}),
  data:{orderId:o.orderId,paymentKey:key,status}};
 const rawBody=Buffer.from(JSON.stringify(data));
 const signature='v1:'+createHmac('sha256',signing).update(rawBody).update(':'+when).digest('base64');
 return {rawBody,headers:{signature,transmissionTime:when},signingSecrets:[signing],merchantId:merchant,now};
}
async function receiptCount(orderId:string){
 const [rows]=await db.execute<Array<RowDataPacket&{n:string}>>(
  'SELECT COUNT(*) AS n FROM lr_demo_toss_reconciliation WHERE order_id=?',[orderId]);
 return Number(rows[0].n);
}
async function auditCount(orderId:string){
 const [rows]=await db.execute<Array<RowDataPacket&{n:string}>>(
  'SELECT COUNT(*) AS n FROM lr_demo_toss_reconcile_audit WHERE order_id=?',[orderId]);
 return Number(rows[0].n);
}
async function claimCount(orderId:string){
 const [rows]=await db.execute<Array<RowDataPacket&{n:string}>>(
  'SELECT COUNT(*) AS n FROM lr_demo_toss_payment_claims WHERE order_id=?',[orderId]);
 return Number(rows[0].n);
}
const lookup=(item:TossPaymentSnapshot)=>async()=>item;
test('20 identical webhook redeliveries with missing eventId create one row and audit once',async()=>{
 const {o,hold,unitId}=await order(),key='provider-'+randomUUID();
 const event=signed(o,key);
 const results=await Promise.all(Array.from({length:20},()=>
  reconcileSignedDemoTossEvent(db,{...event,lookup:lookup(pg(o.orderId,key))})));
 assert.equal(results.filter(r=>!r.replayed).length,1);
 assert.ok(results.every(r=>r.decision==='MATCHED'&&r.reason==='LOOKUP_CONFIRMED'));
 assert.equal(await receiptCount(o.orderId),1);
 assert.equal(await auditCount(o.orderId),1);
 assert.equal(await claimCount(o.orderId),1);
 const [r]=await db.execute<Array<RowDataPacket&{seen_count:number}>>(
  'SELECT seen_count FROM lr_demo_toss_reconciliation WHERE logical_key=?',[results[0].receiptKey]);
 assert.equal(r[0].seen_count,20);
 const [orders]=await db.execute<Array<RowDataPacket&{status:string}>>('SELECT status FROM lr_demo_orders WHERE id=?',[o.orderId]);
 const [units]=await db.execute<Array<RowDataPacket&{physical_state:string}>>('SELECT physical_state FROM lr_inventory_units WHERE id=?',[unitId]);
 const [holds]=await db.execute<Array<RowDataPacket&{status:string}>>('SELECT status FROM lr_inventory_holds WHERE id=?',[hold.holdId]);
 assert.equal(orders[0].status,'PENDING_SIMULATION');
 assert.equal(units[0].physical_state,'READY');
 assert.equal(holds[0].status,'ACTIVE');
});
test('retry with a different transmission time/id and optional eventId is still deduped',async()=>{
 const {o}=await order(),key='provider-'+randomUUID();
 const a=signed(o,key,'DONE',undefined,'2026-11-02T09:00:00Z');
 const b=signed(o,key,'DONE','different-event-id','2026-11-02T09:01:00Z');
 const first=await reconcileSignedDemoTossEvent(db,{...a,lookup:lookup(pg(o.orderId,key))});
 const next=await reconcileSignedDemoTossEvent(db,{...b,lookup:lookup(pg(o.orderId,key))});
 assert.equal(first.receiptKey,next.receiptKey);
 assert.equal(next.replayed,true);
 assert.equal(next.seenCount,2);
 assert.equal(await auditCount(o.orderId),1);
 assert.equal(logicalTossStateKey(o.orderId,key,'DONE'),next.receiptKey);
});
test('lookup timeout is persisted as review; later successful retry becomes MATCHED with audit',async()=>{
 const {o}=await order(),key='provider-'+randomUUID();
 const a=signed(o,key);
 const failure=await reconcileSignedDemoTossEvent(db,{...a,lookup:async()=>{throw Error('offline mock');}});
 assert.equal(failure.decision,'REVIEW_REQUIRED');
 assert.equal(failure.reason,'PROVIDER_LOOKUP_FAILED');
 assert.equal(failure.persisted,true);
 assert.equal(await claimCount(o.orderId),0);
 const ok=await reconcileSignedDemoTossEvent(db,{...a,lookup:lookup(pg(o.orderId,key))});
 assert.equal(ok.decision,'MATCHED');assert.equal(ok.replayed,true);
 assert.equal(ok.seenCount,2);
 assert.equal(await receiptCount(o.orderId),1);
 assert.equal(await auditCount(o.orderId),2);
});
test('matched result downgrades safely when provider lookup later returns bad amount',async()=>{
 const {o}=await order(),key='provider-'+randomUUID(),a=signed(o,key);
 const ok=await reconcileSignedDemoTossEvent(db,{...a,lookup:lookup(pg(o.orderId,key))});
 assert.equal(ok.decision,'MATCHED');
 const bad=await reconcileSignedDemoTossEvent(db,{...a,lookup:lookup(pg(o.orderId,key,'DONE',61001))});
 assert.equal(bad.decision,'REVIEW_REQUIRED');assert.equal(bad.reason,'AMOUNT_MISMATCH');
 assert.equal(await auditCount(o.orderId),2);
});
test('different status is separate recorded state and never produces automatic refund',async()=>{
 const {o}=await order(),key='provider-'+randomUUID();
 const done=await reconcileSignedDemoTossEvent(db,{
  ...signed(o,key),lookup:lookup(pg(o.orderId,key))});
 const canceled=await reconcileSignedDemoTossEvent(db,{
  ...signed(o,key,'CANCELED'),lookup:lookup(pg(o.orderId,key,'CANCELED'))});
 assert.equal(done.decision,'MATCHED');
 assert.equal(canceled.decision,'REVIEW_REQUIRED');
 assert.equal(canceled.reason,'PAYMENT_NOT_COMPLETED');
 assert.equal(await receiptCount(o.orderId),2);
 const [orders]=await db.execute<Array<RowDataPacket&{status:string}>>('SELECT status FROM lr_demo_orders WHERE id=?',[o.orderId]);
 assert.equal(orders[0].status,'PENDING_SIMULATION');
});
test('cannot claim one provider payment on two different valid demo orders',async()=>{
 const first=await order(),second=await order(),key='provider-'+randomUUID();
 const a=await reconcileSignedDemoTossEvent(db,{
  ...signed(first.o,key),lookup:lookup(pg(first.o.orderId,key))});
 const b=await reconcileSignedDemoTossEvent(db,{
  ...signed(second.o,key),lookup:lookup(pg(second.o.orderId,key))});
 assert.equal(a.decision,'MATCHED');
 assert.equal(b.decision,'REVIEW_REQUIRED');
 assert.equal(b.reason,'CLAIMED_BY_OTHER_ORDER');
 assert.equal(await claimCount(first.o.orderId),1);
 assert.equal(await claimCount(second.o.orderId),0);
});
test('second distinct payment key for same order is review-only, not double payment',async()=>{
 const {o}=await order(),key1='pay-'+randomUUID(),key2='pay-'+randomUUID();
 const a=await reconcileSignedDemoTossEvent(db,{...signed(o,key1),lookup:lookup(pg(o.orderId,key1))});
 const b=await reconcileSignedDemoTossEvent(db,{...signed(o,key2),lookup:lookup(pg(o.orderId,key2))});
 assert.equal(a.decision,'MATCHED');
 assert.equal(b.decision,'REVIEW_REQUIRED');
 assert.equal(b.reason,'MULTIPLE_PAYMENTS');
 assert.equal(await claimCount(o.orderId),1);
});
test('expired/disabled hold is REVIEW_REQUIRED even when provider reports DONE',async()=>{
 const {o,hold}=await order(),key='provider-'+randomUUID();
 await db.execute('UPDATE lr_inventory_holds SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND) WHERE id=?',[hold.holdId]);
 const result=await reconcileSignedDemoTossEvent(db,{...signed(o,key),lookup:lookup(pg(o.orderId,key))});
 assert.equal(result.reason,'HOLD_INACTIVE');
 assert.equal(result.decision,'REVIEW_REQUIRED');
 assert.equal(await claimCount(o.orderId),0);
});
test('invalid signature and stale transmissions never enter database nor call provider',async()=>{
 const {o}=await order(),key='provider-'+randomUUID();
 let calls=0;
 const event=signed(o,key);
 const mismatch=await reconcileSignedDemoTossEvent(db,{
  ...event,headers:{...event.headers,signature:'forged'},
  lookup:async()=>{calls++;return pg(o.orderId,key);}
 });
 const stale=await reconcileSignedDemoTossEvent(db,{
  ...signed(o,key,'DONE',undefined,'2026-11-01T09:00:00Z'),
  lookup:async()=>{calls++;return pg(o.orderId,key);}
 });
 assert.equal(mismatch.decision,'REJECTED');
 assert.equal(stale.decision,'REJECTED');
 assert.equal(calls,0);
 assert.equal(await receiptCount(o.orderId),0);
});
test('invalid signed order reference and unsupported event shapes are rejected',async()=>{
 const {o}=await order(),key='provider-'+randomUUID();
 const unknown=signed({orderId:'missing-test-order'},key);
 const noOrder=await reconcileSignedDemoTossEvent(db,{...unknown,lookup:lookup(pg(o.orderId,key))});
 assert.equal(noOrder.reason,'ORDER_NOT_FOUND');
 const base=signed(o,key);
 const malformed=Buffer.from('{"eventType":"payout.changed","data":{"orderId":"'+o.orderId+'"}}');
 const sig='v1:'+createHmac('sha256',signing).update(malformed).update(':'+at).digest('base64');
 const bad=await reconcileSignedDemoTossEvent(db,{
  ...base,rawBody:malformed,headers:{signature:sig,transmissionTime:at},
  lookup:lookup(pg(o.orderId,key))
 });
 assert.equal(bad.reason,'INVALID_PAYLOAD');
 assert.equal(await receiptCount(o.orderId),0);
});
test('no public Toss reconciliation/webhook/payment authorization endpoints',async()=>{
 const app=createApp(db,{demoMode:true});
 const res=await request(app).post('/api/v1/payments/toss/reconcile').send({paymentKey:'fake'});
 assert.equal(res.status,404);
 assert.equal((await request(app).post('/api/v1/payments/confirm').send({})).status,501);
 assert.equal((await request(app).post('/api/v1/orders').send({})).status,501);
});
test('production-like DB name cannot call isolated reconciliation module',async()=>{
 const former=process.env.DB_NAME;
 try{
  process.env.DB_NAME='not_lr_test';
  await assert.rejects(()=>reconcileSignedDemoTossEvent(db,{
   ...signed({orderId:'any'},'fake'),lookup:async()=>{throw Error('must not call');}
  }),/TEST_ONLY/);
 }finally{if(former===undefined)delete process.env.DB_NAME;else process.env.DB_NAME=former;}
});
