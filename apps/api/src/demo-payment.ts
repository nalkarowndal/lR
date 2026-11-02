/**
 * M5-2 TEST-ONLY INTERNAL payment ledger.
 * There are NO public API routes or real provider secrets; mock verifier only.
 * Every order uses a server-created rental hold, a server-side price and audit writes.
 * This does not create a rental, mark a hold consumed or set an inventory unit SOLD.
 */
import {randomUUID} from 'node:crypto';
import type{RowDataPacket} from 'mysql2';
import type{Database} from './db.js';
import {rentalDays} from './date.js';

type OrderStatus='PENDING_SIMULATION'|'SIMULATED_PAID'|'FAILED'|'CANCELED'|'REVIEW_REQUIRED';
type EventStatus='DONE'|'FAILED'|'CANCELED';
export interface DemoOrder{
 orderId:string;holdId:string;unitId:string;actorId:string;status:OrderStatus;
 rentalFeeKrw:number;depositKrw:number;payableKrw:number;policyVersion:'demo-only';replayed:boolean;
}
export interface SimulatedEvent{
 eventId:string;orderId:string;providerPaymentId:string;status:EventStatus;
 // Untrusted; never use this to set the ledger amount.
 claimedAmountKrw:number;
}
export interface VerifiedMockPayment{
 orderId:string;providerPaymentId:string;status:EventStatus;
 verifiedAmountKrw:number;merchantId:'DEMO_ONLY';
}
export type MockLookup=(paymentId:string)=>Promise<VerifiedMockPayment>;
export class DemoPaymentError extends Error {
 constructor(readonly code:'TEST_ONLY'|'INVALID_INPUT'|'HOLD_INVALID'|'ORDER_NOT_FOUND'|'AMOUNT_MISMATCH'|'PROVIDER_MISMATCH'|'EVENT_REUSED'){
  super(code);this.name='DemoPaymentError';
 }
}
interface Row extends RowDataPacket{
 id:string;actor_id:string;hold_id:string;unit_id:string;
 rental_fee_krw:string|number;deposit_krw:string|number;payable_krw:string|number;
 status:OrderStatus;
}
interface HoldRow extends RowDataPacket{
 id:string;unit_id:string;kind:string;status:string;expired:number;
 blocked_start_date:string;blocked_end_exclusive:string;
 day_rate_krw:string|number;deposit_krw:string|number;is_demo:number;physical_state:string;
}
interface EventRow extends RowDataPacket{
 order_id:string;provider_payment_id:string;status:EventStatus;
 verified_amount_krw:string|number;result_status:OrderStatus;
}
interface UnitRow extends RowDataPacket{id:string}
const id=(v:string)=>typeof v==='string'&&v.length>0&&v.length<=80&&/^[\w-]+$/.test(v);
function testOnly(){
 if(process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test')
  throw new DemoPaymentError('TEST_ONLY');
}
function money(v:unknown){
 const n=typeof v==='string'&&/^\d+$/.test(v)?Number(v):v;
 if(typeof n!=='number'||!Number.isSafeInteger(n)||n<0)throw new DemoPaymentError('INVALID_INPUT');
 return n;
}
const asOrder=(r:Row,replayed=false):DemoOrder=>({
 orderId:r.id,actorId:r.actor_id,holdId:r.hold_id,unitId:r.unit_id,
 rentalFeeKrw:money(r.rental_fee_krw),depositKrw:money(r.deposit_krw),payableKrw:money(r.payable_krw),
 policyVersion:'demo-only',status:r.status,replayed
});
function assertOrder(row:Row){
 if(!row)throw new DemoPaymentError('ORDER_NOT_FOUND');
 return row;
}
export async function createDemoPaymentOrder(db:Database,input:{actorId:string;holdId:string}):Promise<DemoOrder>{
 testOnly();
 if(!id(input.actorId)||input.actorId.length>40||!id(input.holdId)||input.holdId.length>40)
  throw new DemoPaymentError('INVALID_INPUT');
 const conn=await db.getConnection();
 try{
  await conn.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
  await conn.beginTransaction();
  // Discover the unit id without a lock, then lock unit first (matches holds.ts).
  const [references]=await conn.execute<UnitRow[]>('SELECT unit_id AS id FROM lr_inventory_holds WHERE id=?',[input.holdId]);
  if(!references[0])throw new DemoPaymentError('HOLD_INVALID');
  await conn.execute('SELECT id FROM lr_inventory_units WHERE id=? FOR UPDATE',[references[0].id]);
  const [holds]=await conn.execute<HoldRow[]>(`SELECT h.id,h.unit_id,h.kind,h.status,
    (h.expires_at<=UTC_TIMESTAMP(3)) expired,
    h.blocked_start_date,h.blocked_end_exclusive,
    u.physical_state,p.is_demo,o.day_rate_krw,o.deposit_krw
    FROM lr_inventory_holds h
    JOIN lr_inventory_units u ON u.id=h.unit_id
    JOIN lr_products p ON p.id=u.product_id
    JOIN lr_product_offers o ON o.product_id=p.id AND o.channel='RENTAL' AND o.is_active=1
    JOIN lr_hold_requests hr ON hr.hold_id=h.id AND hr.actor_id=?
    WHERE h.id=? FOR UPDATE`,[input.actorId,input.holdId]);
  const h=holds[0];
  if(!h||h.kind!=='RENTAL'||h.status!=='ACTIVE'||Number(h.expired)||h.physical_state!=='READY'||Number(h.is_demo)!==1)
   throw new DemoPaymentError('HOLD_INVALID');
  const [existing]=await conn.execute<Row[]>('SELECT * FROM lr_demo_orders WHERE hold_id=? FOR UPDATE',[input.holdId]);
  if(existing[0]){
   await conn.commit();
   return asOrder(existing[0],true);
  }
  const days=rentalDays(h.blocked_start_date,h.blocked_end_exclusive);
  if(days===null)throw new DemoPaymentError('HOLD_INVALID');
  const fee=money(h.day_rate_krw)*days,deposit=money(h.deposit_krw);
  if(!Number.isSafeInteger(fee)||!Number.isSafeInteger(fee+deposit))throw new DemoPaymentError('INVALID_INPUT');
  const orderId=randomUUID();
  await conn.execute(`INSERT INTO lr_demo_orders
   (id,actor_id,hold_id,unit_id,rental_fee_krw,deposit_krw,payable_krw,status)
   VALUES(?,?,?,?,?,?,?,'PENDING_SIMULATION')`,
   [orderId,input.actorId,input.holdId,h.unit_id,fee,deposit,fee+deposit]);
  await conn.execute("INSERT INTO lr_demo_payment_audit(order_id,action) VALUES(?,'CREATED')",[orderId]);
  await conn.commit();
  return {orderId,holdId:input.holdId,actorId:input.actorId,unitId:h.unit_id,
   rentalFeeKrw:fee,depositKrw:deposit,payableKrw:fee+deposit,
   policyVersion:'demo-only',status:'PENDING_SIMULATION',replayed:false};
 }catch(e){await conn.rollback();throw e;}finally{conn.release();}
}
/**
 * Caller MUST supply a trusted server-side mock PG lookup. Not exposed to HTTP.
 * Provider verification is performed before transactions; DB serialization happens on the order row.
 * Declared webhook amount is deliberately ignored, and no sale/rental state can be confirmed.
 */
export async function applyVerifiedMockEvent(db:Database,event:SimulatedEvent,lookup:MockLookup):
 Promise<{status:OrderStatus;replayed:boolean}>{
 testOnly();
 if(!id(event.eventId)||!id(event.orderId)||!id(event.providerPaymentId)||
  !['DONE','FAILED','CANCELED'].includes(event.status)||!Number.isSafeInteger(event.claimedAmountKrw))
  throw new DemoPaymentError('INVALID_INPUT');
 // Trusted adapter fetches by payment ID; never rely on inbound webhook values.
 const checked=await lookup(event.providerPaymentId);
 if(checked.merchantId!=='DEMO_ONLY'||checked.orderId!==event.orderId||
  checked.providerPaymentId!==event.providerPaymentId||checked.status!==event.status)
  throw new DemoPaymentError('PROVIDER_MISMATCH');
 const verified=money(checked.verifiedAmountKrw);
 const conn=await db.getConnection();
 try{
  await conn.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
  await conn.beginTransaction();
  const [orders]=await conn.execute<Row[]>('SELECT * FROM lr_demo_orders WHERE id=? FOR UPDATE',[event.orderId]);
  const order=assertOrder(orders[0]);
  if(verified!==money(order.payable_krw))throw new DemoPaymentError('AMOUNT_MISMATCH');
  const [past]=await conn.execute<EventRow[]>(`SELECT order_id,provider_payment_id,status,verified_amount_krw,result_status
   FROM lr_demo_payment_events WHERE event_id=?`,[event.eventId]);
  if(past[0]){
   const prior=past[0];
   if(prior.order_id!==event.orderId||prior.provider_payment_id!==event.providerPaymentId||
    prior.status!==event.status||money(prior.verified_amount_krw)!==verified)
    throw new DemoPaymentError('EVENT_REUSED');
   await conn.commit();
   return {status:order.status,replayed:true};
  }
  // Prevent one verified mock payment id being claimed by two separate orders.
  const [conflicting]=await conn.execute<EventRow[]>(`SELECT order_id,provider_payment_id,status,verified_amount_krw,result_status
   FROM lr_demo_payment_events WHERE provider_payment_id=? AND order_id<>? LIMIT 1`,
   [event.providerPaymentId,event.orderId]);
  if(conflicting.length)throw new DemoPaymentError('PROVIDER_MISMATCH');
  let next:OrderStatus='REVIEW_REQUIRED';
  if(order.status==='PENDING_SIMULATION'){
   if(event.status==='DONE'){
    const [hold]=await conn.execute<Array<RowDataPacket&{status:string;expired:number}>>(
     "SELECT status,expires_at<=UTC_TIMESTAMP(3) AS expired FROM lr_inventory_holds WHERE id=?",
     [order.hold_id]);
    next=hold[0]?.status==='ACTIVE'&&!Number(hold[0]?.expired)?'SIMULATED_PAID':'REVIEW_REQUIRED';
   }else next=event.status==='FAILED'?'FAILED':'CANCELED';
  }else if(order.status=== 'SIMULATED_PAID'&&event.status==='DONE')next='SIMULATED_PAID';
  else next='REVIEW_REQUIRED'; // late or contradictory events need human reconciliation.
  await conn.execute('UPDATE lr_demo_orders SET status=? WHERE id=?',[next,order.id]);
  await conn.execute(`INSERT INTO lr_demo_payment_events
   (event_id,order_id,provider_payment_id,status,verified_amount_krw,result_status)
   VALUES(?,?,?,?,?,?)`,
   [event.eventId,event.orderId,event.providerPaymentId,event.status,verified,next]);
  if(order.status!==next)await conn.execute('INSERT INTO lr_demo_payment_audit(order_id,event_id,action) VALUES(?,?,?)',
    [order.id,event.eventId,next]);
  await conn.commit();
  return {status:next,replayed:false};
 }catch(e){await conn.rollback();throw e;}finally{conn.release();}
}
