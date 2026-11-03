/**
 * M5-2B1 internal Toss Payments webhook verification boundary.
 *
 * NOT an HTTP route; NOT a live Toss integration; NOT a payment confirmation.
 * No real credentials, no operational database and no inventory changes.
 * A signature proves payload authenticity only: PG payment lookup is still necessary.
 * Ref: https://docs.tosspayments.com/reference/using-api/webhook-events
 */
import {createHash,createHmac,timingSafeEqual} from 'node:crypto';

export interface TossWebhookHeaders{
 signature:string|undefined;
 transmissionTime:string|undefined;
}
export interface ExpectedSandboxPayment{
 orderId:string;
 merchantId:string;
 payableKrw:number;
}
export interface TossPaymentSnapshot{
 orderId:string;
 mId:string;
 paymentKey:string;
 totalAmount:number;
 status:string;
}
export type TossPaymentLookup=(paymentKey:string)=>Promise<TossPaymentSnapshot>;
export type TossReviewReason=
 'INVALID_SIGNATURE'|'INVALID_PAYLOAD'|'ORDER_MISMATCH'|'PROVIDER_LOOKUP_FAILED'|
 'MERCHANT_MISMATCH'|'PAYMENT_KEY_MISMATCH'|'AMOUNT_MISMATCH'|
 'PAYMENT_STATUS_MISMATCH'|'PAYMENT_NOT_COMPLETED';
export type TossInspection=
 |{decision:'REVIEW_REQUIRED';reason:TossReviewReason;eventDedupKey:string|null}
 |{decision:'SANDBOX_MATCH_ONLY';reason:'LOOKUP_CONFIRMED';eventDedupKey:string|null;
   paymentKey:string;verifiedAmountKrw:number};

const MAX_PAYLOAD=64*1024;
const MAX_SIGNATURE_HEADER=4096;
const signaturePattern=/^v1:([A-Za-z0-9+/]{43}=)$/;
function validAsciiHeader(v:unknown):v is string{
 return typeof v==='string'&&v.length>0&&v.length<=128&&/^[\x21-\x7e]+$/.test(v);
}
const record=(value:unknown):value is Record<string,unknown>=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const nonempty=(value:unknown):value is string=>typeof value==='string'&&value.length>0&&value.length<=256;
const amount=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0;

/**
 * Compare original raw bytes, not JSON.stringify(parsedBody).
 * Header allows multiple v1:base64 signatures for key rotation.
 * Fail closed for missing, malformed and oversized untrusted fields.
 */
export function verifyTossWebhookSignature(
 rawBody:Buffer,headers:TossWebhookHeaders,signingSecrets:readonly (string|Buffer)[]
):boolean{
 if(!signingSecrets.length||signingSecrets.length>4||
  signingSecrets.some(secret=>!(typeof secret==='string'||Buffer.isBuffer(secret))||
    Buffer.byteLength(secret)<16))
  throw new Error('Toss signing secret configuration invalid');
 if(!Buffer.isBuffer(rawBody)||rawBody.length===0||rawBody.length>MAX_PAYLOAD||
  !validAsciiHeader(headers.transmissionTime)||typeof headers.signature!=='string'||
  headers.signature.length===0||headers.signature.length>MAX_SIGNATURE_HEADER)
  return false;
 const candidates=headers.signature.split(',');
 if(candidates.length>8)return false;
 const digests:Buffer[]=[];
 for(const candidate of candidates){
  const match=signaturePattern.exec(candidate.trim());
  if(!match)return false;
  const decoded=Buffer.from(match[1],'base64');
  if(decoded.length!==32||decoded.toString('base64')!==match[1])return false;
  digests.push(decoded);
 }
 const material=Buffer.concat([rawBody,Buffer.from(':'+headers.transmissionTime,'utf8')]);
 // No early exit on a failed or successful candidate comparison.
 let matched=0;
 for(const secret of signingSecrets){
  const ours=createHmac('sha256',secret).update(material).digest();
  for(const supplied of digests)matched|=Number(timingSafeEqual(ours,supplied));
 }
 return matched!==0;
}

/**
 * Some Toss event bodies have eventId; others such as PAYMENT_STATUS_CHANGED may not.
 * Never use tosspayments-webhook-transmission-id as an idempotency key: it changes on resend.
 * If absent, PG payment lookup plus persistent order/payment status reconciliation is required.
 */
export function deriveTossEventDedupKey(payload:unknown):string|null{
 if(!record(payload)||!nonempty(payload.eventId)||payload.eventId.length>64)return null;
 return 'toss-event:'+createHash('sha256').update(payload.eventId,'utf8').digest('hex');
}

/**
 * This returns an advisory decision, never an order or payment mutation.
 * Deliberately requires valid signature before reading, parsing, or looking up a payment.
 * The lookup is an INJECTED test adapter; no real PG credential or outbound call here.
 */
export async function inspectSignedTossSandboxEvent(input:{
 rawBody:Buffer;
 headers:TossWebhookHeaders;
 signingSecrets:readonly (string|Buffer)[];
 expected:ExpectedSandboxPayment;
 lookup:TossPaymentLookup;
}):Promise<TossInspection>{
 const fail=(reason:TossReviewReason,eventDedupKey:string|null=null):TossInspection=>
  ({decision:'REVIEW_REQUIRED',reason,eventDedupKey});
 if(!verifyTossWebhookSignature(input.rawBody,input.headers,input.signingSecrets))
  return fail('INVALID_SIGNATURE');
 let body:unknown;
 try{body=JSON.parse(input.rawBody.toString('utf8'));}catch{return fail('INVALID_PAYLOAD');}
 const key=deriveTossEventDedupKey(body);
 if(!record(body)||body.eventType!=='PAYMENT_STATUS_CHANGED'||!record(body.data))
  return fail('INVALID_PAYLOAD',key);
 const payment=body.data;
 if(!nonempty(payment.paymentKey)||!nonempty(payment.orderId)||!nonempty(payment.status))
  return fail('INVALID_PAYLOAD',key);
 if(!nonempty(input.expected.orderId)||!nonempty(input.expected.merchantId)||
  !amount(input.expected.payableKrw))return fail('INVALID_PAYLOAD',key);
 if(payment.orderId!==input.expected.orderId)return fail('ORDER_MISMATCH',key);
 let snapshot:TossPaymentSnapshot;
 try{snapshot=await input.lookup(payment.paymentKey);}catch{return fail('PROVIDER_LOOKUP_FAILED',key);}
 if(!snapshot||snapshot.mId!==input.expected.merchantId)return fail('MERCHANT_MISMATCH',key);
 if(snapshot.orderId!==input.expected.orderId)return fail('ORDER_MISMATCH',key);
 if(snapshot.paymentKey!==payment.paymentKey)return fail('PAYMENT_KEY_MISMATCH',key);
 if(!amount(snapshot.totalAmount)||snapshot.totalAmount!==input.expected.payableKrw)
  return fail('AMOUNT_MISMATCH',key);
 if(snapshot.status!==payment.status)return fail('PAYMENT_STATUS_MISMATCH',key);
 if(snapshot.status!=='DONE')return fail('PAYMENT_NOT_COMPLETED',key);
 return {
  decision:'SANDBOX_MATCH_ONLY',reason:'LOOKUP_CONFIRMED',eventDedupKey:key,
  paymentKey:snapshot.paymentKey,verifiedAmountKrw:snapshot.totalAmount
 };
}
