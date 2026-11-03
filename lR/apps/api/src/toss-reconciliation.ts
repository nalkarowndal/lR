/**
 * M5-2B2B — persistent *read-only* reconciliation of signed synthetic Toss events.
 * No HTTP route, no real PG requests, no order/hold/inventory mutation.
 * Never use the transmission-id as a deduplication key (Toss issues a new one per resend).
 */
import {createHash} from 'node:crypto';
import type{RowDataPacket} from 'mysql2';
import type{Database} from './db.js';
import {verifyTossWebhookSignature,type TossPaymentLookup,type TossWebhookHeaders} from './toss-webhook-boundary.js';
import {inspectFreshTossSandboxEvent,freshTossTransmissionTime} from './toss-sandbox-lookup.js';

type Decision='MATCHED'|'REVIEW_REQUIRED';
export type ReconciliationReason=
 'LOOKUP_CONFIRMED'|'INVALID_SIGNATURE'|'STALE_TRANSMISSION_TIME'|'INVALID_PAYLOAD'|
 'ORDER_NOT_FOUND'|'ORDER_MISMATCH'|'PROVIDER_LOOKUP_FAILED'|'MERCHANT_MISMATCH'|
 'PAYMENT_KEY_MISMATCH'|'AMOUNT_MISMATCH'|'PAYMENT_STATUS_MISMATCH'|'PAYMENT_NOT_COMPLETED'|
 'HOLD_INACTIVE'|'CLAIMED_BY_OTHER_ORDER'|'MULTIPLE_PAYMENTS';
export interface ReconcileResult{
 decision:Decision|'REJECTED';
 reason:ReconciliationReason;
 receiptKey:string|null;
 replayed:boolean;
 seenCount:number;
 persisted:boolean;
}
interface OrderRow extends RowDataPacket{
 id:string;unit_id:string;hold_id:string;payable_krw:string|number;policy_version:string;
}
interface ReceiptRow extends RowDataPacket{
 seen_count:number;last_decision:Decision;reason:string;
}
interface NamedRow extends RowDataPacket{order_id:string;provider_payment_id:string}
interface UnitRow extends RowDataPacket{unit_id:string}
interface HoldRow extends RowDataPacket{status:string;expired:number}
const row=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const string=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length>0&&v.length<=max;
const money=(v:unknown):number|null=>{
 const n=typeof v==='string'&&/^\d+$/.test(v)?Number(v):v;
 return typeof n==='number'&&Number.isSafeInteger(n)&&n>=0?n:null;
};
function isolated(){
 if(process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test')
  throw new Error('TEST_ONLY: isolated lr_test test database required');
}
/** The stable identity covers the logical provider state, not the delivery attempt.
 * The same payment may legitimately have multiple reported states, each recorded separately.
 */
export function logicalTossStateKey(orderId:string,paymentKey:string,status:string):string{
 return createHash('sha256').update(JSON.stringify([orderId,paymentKey,status]),'utf8').digest('hex');
}
/** Test-only system-owned merchant ID; caller must never forward a client-supplied value here. */
export async function reconcileSignedDemoTossEvent(db:Database,input:{
 rawBody:Buffer;headers:TossWebhookHeaders;
 signingSecrets:readonly(string|Buffer)[];
 merchantId:string;
 lookup:TossPaymentLookup;
 now?:number;
}):Promise<ReconcileResult>{
 isolated();
 const rejected=(reason:ReconciliationReason):ReconcileResult=>({
  decision:'REJECTED',reason,receiptKey:null,replayed:false,seenCount:0,persisted:false
 });
 if(!freshTossTransmissionTime(input.headers.transmissionTime,input.now))
  return rejected('STALE_TRANSMISSION_TIME');
 if(!verifyTossWebhookSignature(input.rawBody,input.headers,input.signingSecrets))
  return rejected('INVALID_SIGNATURE');
 let value:unknown;
 try{value=JSON.parse(input.rawBody.toString('utf8'));}
 catch{return rejected('INVALID_PAYLOAD');}
 if(!row(value)||value.eventType!=='PAYMENT_STATUS_CHANGED'||!row(value.data))
  return rejected('INVALID_PAYLOAD');
 const payload=value.data;
 if(!string(payload.orderId,40)||!string(payload.paymentKey,200)||!string(payload.status,40)||
  !string(input.merchantId,120))return rejected('INVALID_PAYLOAD');
 const orderId=payload.orderId,paymentKey=payload.paymentKey,reportedStatus=payload.status;
 const [before]=await db.execute<OrderRow[]>(
  'SELECT id,unit_id,hold_id,payable_krw,policy_version FROM lr_demo_orders WHERE id=?',
  [orderId]);
 const anticipated=before[0];
 if(!anticipated||anticipated.policy_version!=='demo-only')return rejected('ORDER_NOT_FOUND');
 const amount=money(anticipated.payable_krw);
 if(amount===null)return rejected('INVALID_PAYLOAD');
 // Calls the injected mock adapter, validates signature/time again and compares
 // provider-retrieved merchant/order/payment/amount/status with server values.
 const inspection=await inspectFreshTossSandboxEvent({
  rawBody:input.rawBody,headers:input.headers,signingSecrets:input.signingSecrets,
  expected:{orderId,merchantId:input.merchantId,payableKrw:amount},
  lookup:input.lookup,now:input.now
 });
 const key=logicalTossStateKey(orderId,paymentKey,reportedStatus);
 const conn=await db.getConnection();
 try{
  await conn.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
  await conn.beginTransaction();
  // Match M3.2/M5.2 lock order: inventory unit -> demo order -> hold -> claims -> receipt.
  await conn.execute('SELECT id FROM lr_inventory_units WHERE id=? FOR UPDATE',[anticipated.unit_id]);
  const [orders]=await conn.execute<OrderRow[]>(
   'SELECT id,unit_id,hold_id,payable_krw,policy_version FROM lr_demo_orders WHERE id=? FOR UPDATE',
   [orderId]);
  const current=orders[0];
  if(!current||current.policy_version!=='demo-only'||current.unit_id!==anticipated.unit_id)
   throw new Error('TEST_ONLY: demo order changed during inspection');
  let decision:Decision=inspection.decision==='SANDBOX_MATCH_ONLY'?'MATCHED':'REVIEW_REQUIRED';
  let reason:ReconciliationReason=inspection.decision==='SANDBOX_MATCH_ONLY'?
   'LOOKUP_CONFIRMED':inspection.reason;
  if(money(current.payable_krw)!==amount){
   decision='REVIEW_REQUIRED';reason='AMOUNT_MISMATCH';
  }
  if(decision==='MATCHED'){
   const [holds]=await conn.execute<HoldRow[]>(
    'SELECT status,(expires_at<=UTC_TIMESTAMP(3)) AS expired FROM lr_inventory_holds WHERE id=? FOR UPDATE',
    [current.hold_id]);
   if(holds[0]?.status!=='ACTIVE'||Number(holds[0]?.expired)){
    decision='REVIEW_REQUIRED';reason='HOLD_INACTIVE';
   }
  }
  if(decision==='MATCHED'){
   // Do not associate a second provider payment with one order.
   const [other]=await conn.execute<NamedRow[]>(
    'SELECT provider_payment_id,order_id FROM lr_demo_toss_payment_claims WHERE order_id=? AND provider_payment_id<>? LIMIT 1',
    [orderId,paymentKey]);
   if(other.length){decision='REVIEW_REQUIRED';reason='MULTIPLE_PAYMENTS';}
  }
  if(decision==='MATCHED'){
   // Unique claim means the same provider key cannot be credited to a different order.
   await conn.execute(`INSERT INTO lr_demo_toss_payment_claims(provider_payment_id,order_id)
    VALUES(?,?) ON DUPLICATE KEY UPDATE provider_payment_id=provider_payment_id`,[paymentKey,orderId]);
   const [claimed]=await conn.execute<NamedRow[]>(
    'SELECT provider_payment_id,order_id FROM lr_demo_toss_payment_claims WHERE provider_payment_id=? FOR UPDATE',
    [paymentKey]);
   if(claimed[0]?.order_id!==orderId){
    decision='REVIEW_REQUIRED';reason='CLAIMED_BY_OTHER_ORDER';
   }
  }
  const [existing]=await conn.execute<ReceiptRow[]>(
   'SELECT seen_count,last_decision,reason FROM lr_demo_toss_reconciliation WHERE logical_key=? FOR UPDATE',
   [key]);
  const prev=existing[0];
  if(prev){
   await conn.execute(`UPDATE lr_demo_toss_reconciliation SET seen_count=seen_count+1,
    last_decision=?,reason=?,last_seen_at=CURRENT_TIMESTAMP(3) WHERE logical_key=?`,
    [decision,reason,key]);
  }else{
   await conn.execute(`INSERT INTO lr_demo_toss_reconciliation
    (logical_key,order_id,provider_payment_id,reported_status,last_decision,reason)
    VALUES(?,?,?,?,?,?)`,[key,orderId,paymentKey,reportedStatus,decision,reason]);
  }
  if(!prev||prev.last_decision!==decision||prev.reason!==reason){
   await conn.execute(`INSERT INTO lr_demo_toss_reconcile_audit(logical_key,order_id,decision,reason)
    VALUES(?,?,?,?)`,[key,orderId,decision,reason]);
  }
  await conn.commit();
  return {decision,reason,receiptKey:key,replayed:!!prev,
   seenCount:prev?Number(prev.seen_count)+1:1,persisted:true};
 }catch(e){await conn.rollback();throw e;}
 finally{conn.release();}
}
