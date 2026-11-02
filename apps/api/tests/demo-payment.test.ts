import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type{RowDataPacket} from 'mysql2';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
import {acquireInventoryHold} from '../src/holds.js';
import {createDemoPaymentOrder,applyVerifiedMockEvent,DemoPaymentError,type VerifiedMockPayment} from '../src/demo-payment.js';

const cfg=readConfig();
if(cfg.DB_NAME!=='lr_test'||cfg.NODE_ENV!=='test')throw new Error('M5.2 tests must target isolated lr_test');
const db=openPool(cfg);
before(async()=>{await db.query('SELECT 1');});
after(async()=>{await db.end();});
async function held(kind:'RENTAL'|'SALE'='RENTAL'){
 const suffix=randomUUID().slice(0,12),productId='pay-'+suffix,unitId='payu-'+suffix;
 await db.execute(`INSERT INTO lr_products(id,title,brand,category,condition_grade,published,is_demo)
 VALUES(?,'Test-only goods','TEST','bag','A',1,1)`,[productId]);
 await db.execute(`INSERT INTO lr_product_offers(id,product_id,channel,day_rate_krw,deposit_krw,is_active)
 VALUES(?,?,'RENTAL',12000,25000,1)`,['payo-'+suffix,productId]);
 await db.execute(`INSERT INTO lr_inventory_units(id,product_id,serial,condition_grade,physical_state)
 VALUES(?,?,?,'A','READY')`,[unitId,productId,'SYNTH-'+suffix]);
 const actorId='actor-'+suffix;
 const hold=await acquireInventoryHold(db,{
  actorId,idempotencyKey:'payment-'+suffix,productId,kind,
  ...(kind==='RENTAL'?{startDate:'2026-11-10',returnDate:'2026-11-13'}:{})
 });
 return {actorId,productId,unitId,hold};
}
async function orderState(id:string){
 const [rows]=await db.execute<Array<RowDataPacket&{status:string}>>('SELECT status FROM lr_demo_orders WHERE id=?',[id]);
 return rows[0]?.status;
}
async function eventCount(id:string){
 const [rows]=await db.execute<Array<RowDataPacket&{n:string}>>('SELECT COUNT(*) AS n FROM lr_demo_payment_events WHERE order_id=?',[id]);
 return Number(rows[0]?.n);
}
async function auditCount(id:string){
 const [rows]=await db.execute<Array<RowDataPacket&{n:string}>>('SELECT COUNT(*) AS n FROM lr_demo_payment_audit WHERE order_id=?',[id]);
 return Number(rows[0]?.n);
}
function makeEvent(orderId:string,status:'DONE'|'FAILED'|'CANCELED'='DONE',eventId=randomUUID(),paymentId=randomUUID()){
 return {eventId,orderId,providerPaymentId:paymentId,status,claimedAmountKrw:1};
}
function checked(event:ReturnType<typeof makeEvent>,sum=61000):()=>Promise<VerifiedMockPayment>{
 return async()=>({orderId:event.orderId,providerPaymentId:event.providerPaymentId,status:event.status,
   verifiedAmountKrw:sum,merchantId:'DEMO_ONLY'});
}
const error=(e:unknown,code:DemoPaymentError['code'])=>e instanceof DemoPaymentError&&e.code===code;
test('20 simultaneous order initializations use same held unit only once and calculate KRW on server',async()=>{
 const h=await held();
 const responses=await Promise.all(Array.from({length:20},()=>createDemoPaymentOrder(db,{actorId:h.actorId,holdId:h.hold.holdId})));
 assert.equal(new Set(responses.map(x=>x.orderId)).size,1);
 assert.equal(responses.filter(x=>!x.replayed).length,1);
 assert.equal(responses[0].rentalFeeKrw,36000);
 assert.equal(responses[0].depositKrw,25000);
 assert.equal(responses[0].payableKrw,61000);
 assert.equal(responses[0].status,'PENDING_SIMULATION');
 assert.equal(responses[0].policyVersion,'demo-only');
 assert.equal(await auditCount(responses[0].orderId),1);
});
test('cannot generate a demo order from another actor, released hold, expired hold or SALE hold',async()=>{
 const a=await held(),b=await held(),c=await held(),d=await held('SALE');
 await assert.rejects(()=>createDemoPaymentOrder(db,{actorId:'attacker',holdId:a.hold.holdId}),e=>error(e,'HOLD_INVALID'));
 await db.execute("UPDATE lr_inventory_holds SET status='RELEASED' WHERE id=?",[b.hold.holdId]);
 await db.execute('UPDATE lr_inventory_holds SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND) WHERE id=?',[c.hold.holdId]);
 for(const x of [b,c,d])await assert.rejects(
  ()=>createDemoPaymentOrder(db,{actorId:x.actorId,holdId:x.hold.holdId}),e=>error(e,'HOLD_INVALID'));
});
test('fake provider amount mismatch, merchant mismatch and spoofed status fail closed',async()=>{
 const h=await held(),o=await createDemoPaymentOrder(db,{actorId:h.actorId,holdId:h.hold.holdId});
 const e=makeEvent(o.orderId);
 await assert.rejects(()=>applyVerifiedMockEvent(db,e,checked(e,61001)),err=>error(err,'AMOUNT_MISMATCH'));
 await assert.rejects(()=>applyVerifiedMockEvent(db,e,async()=>({...await checked(e)(),merchantId:'OTHER' as 'DEMO_ONLY'})),err=>error(err,'PROVIDER_MISMATCH'));
 await assert.rejects(()=>applyVerifiedMockEvent(db,e,async()=>({...await checked(e)(),status:'FAILED'})),err=>error(err,'PROVIDER_MISMATCH'));
 assert.equal(await orderState(o.orderId),'PENDING_SIMULATION');
 assert.equal(await eventCount(o.orderId),0);
});
test('20 duplicate signed-lookup mock deliveries record one simulated payment and one audit transition',async()=>{
 const h=await held(),o=await createDemoPaymentOrder(db,{actorId:h.actorId,holdId:h.hold.holdId});
 const event=makeEvent(o.orderId);
 // Claimed webhook value intentionally wrong: trusted server lookup must prevail.
 assert.equal(event.claimedAmountKrw,1);
 const responses=await Promise.all(Array.from({length:20},()=>applyVerifiedMockEvent(db,event,checked(event))));
 assert.equal(responses.filter(x=>!x.replayed).length,1);
 assert.ok(responses.every(x=>x.status==='SIMULATED_PAID'));
 assert.equal(await eventCount(o.orderId),1);
 assert.equal(await auditCount(o.orderId),2);
 const [unit]=await db.execute<Array<RowDataPacket&{physical_state:string}>>('SELECT physical_state FROM lr_inventory_units WHERE id=?',[h.unitId]);
 const [hold]=await db.execute<Array<RowDataPacket&{status:string}>>('SELECT status FROM lr_inventory_holds WHERE id=?',[h.hold.holdId]);
 assert.equal(unit[0].physical_state,'READY');
 assert.equal(hold[0].status,'ACTIVE');
 assert.equal((await request(createApp(db,{demoMode:true})).post('/api/v1/payments/confirm').send({})).status,501);
});
test('event ID reused with new payment ID is rejected and no new audit is written',async()=>{
 const h=await held(),o=await createDemoPaymentOrder(db,{actorId:h.actorId,holdId:h.hold.holdId});
 const a=makeEvent(o.orderId);
 await applyVerifiedMockEvent(db,a,checked(a));
 const b={...a,providerPaymentId:randomUUID()};
 await assert.rejects(()=>applyVerifiedMockEvent(db,b,checked(b)),e=>error(e,'EVENT_REUSED'));
 assert.equal(await auditCount(o.orderId),2);
});
test('FAILED before DONE becomes REVIEW_REQUIRED without inventory sale',async()=>{
 const h=await held(),o=await createDemoPaymentOrder(db,{actorId:h.actorId,holdId:h.hold.holdId});
 const fail=makeEvent(o.orderId,'FAILED');
 assert.equal((await applyVerifiedMockEvent(db,fail,checked(fail))).status,'FAILED');
 const late=makeEvent(o.orderId,'DONE');
 assert.equal((await applyVerifiedMockEvent(db,late,checked(late))).status,'REVIEW_REQUIRED');
 assert.equal(await orderState(o.orderId),'REVIEW_REQUIRED');
});
test('PAID then CANCELED requires manual review and does not auto-refund',async()=>{
 const h=await held(),o=await createDemoPaymentOrder(db,{actorId:h.actorId,holdId:h.hold.holdId});
 const paid=makeEvent(o.orderId,'DONE');
 assert.equal((await applyVerifiedMockEvent(db,paid,checked(paid))).status,'SIMULATED_PAID');
 const canceled=makeEvent(o.orderId,'CANCELED',randomUUID(),paid.providerPaymentId);
 assert.equal((await applyVerifiedMockEvent(db,canceled,checked(canceled))).status,'REVIEW_REQUIRED');
 assert.equal(await eventCount(o.orderId),2);
});
test('expired hold at payment callback cannot be marked as simulated paid',async()=>{
 const h=await held(),o=await createDemoPaymentOrder(db,{actorId:h.actorId,holdId:h.hold.holdId});
 await db.execute('UPDATE lr_inventory_holds SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND) WHERE id=?',[h.hold.holdId]);
 const paid=makeEvent(o.orderId,'DONE');
 assert.equal((await applyVerifiedMockEvent(db,paid,checked(paid))).status,'REVIEW_REQUIRED');
});
test('a real production-style app cannot expose any M5.2 sandbox endpoint',async()=>{
 const h=await held();const prod=createApp(db,{demoMode:false});
 const o=await createDemoPaymentOrder(db,{actorId:h.actorId,holdId:h.hold.holdId});
 for(const route of ['/api/v1/orders','/api/v1/payments/confirm']){
  const result=await request(prod).post(route).send({orderId:o.orderId});
  assert.equal(result.status,501);
 }
 assert.equal((await request(prod).post('/api/v1/payments/mock-webhook').send({})).status,404);
});
