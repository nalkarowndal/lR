/**
 * M5-2B2 — isolated, server-side Toss TEST-key payment lookup adapter.
 *
 * No Express route, no charge/confirm/cancel/refund method, no production keys.
 * Test in CI with injected fetcher; never contact Toss from automated tests.
 * Official docs: https://docs.tosspayments.com/reference/using-api/authorization
 *                https://docs.tosspayments.com/reference
 */
import type {TossPaymentLookup,TossPaymentSnapshot,TossInspection,
 ExpectedSandboxPayment,TossWebhookHeaders} from './toss-webhook-boundary.js';
import {inspectSignedTossSandboxEvent} from './toss-webhook-boundary.js';

export type SandboxLookupCode=
 'TEST_ONLY'|'INVALID_CONFIG'|'INVALID_PAYMENT_KEY'|'TRANSPORT_FAILURE'|
 'PG_HTTP_ERROR'|'INVALID_RESPONSE';
export class SandboxLookupError extends Error{
 constructor(readonly code:SandboxLookupCode){
  super(code);
  this.name='SandboxLookupError';
 }
}
type HttpFetch=(input:string,init:RequestInit)=>Promise<Response>;
export interface TossSandboxLookupOptions{
 /** Supply only at runtime from a server-side secret store; never hardcode keys. */
 secretKey:string;
 fetcher?:HttpFetch;
 timeoutMs?:number;
}
const HOST='https://api.tosspayments.com';
const MAX_BYTES=64*1024;
function isolated(){
 if(process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test')
  throw new SandboxLookupError('TEST_ONLY');
}
const obj=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const nonempty=(x:unknown,max:number):x is string=>typeof x==='string'&&x.length>0&&x.length<=max;
const amount=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;

function validateSnapshot(raw:unknown,requestedPaymentKey:string):TossPaymentSnapshot{
 if(!obj(raw)||!nonempty(raw.paymentKey,200)||raw.paymentKey!==requestedPaymentKey||
   !nonempty(raw.orderId,64)||!nonempty(raw.mId,120)||
   !nonempty(raw.status,60)||!amount(raw.totalAmount))
  throw new SandboxLookupError('INVALID_RESPONSE');
 return {
  paymentKey:raw.paymentKey,orderId:raw.orderId,mId:raw.mId,
  status:raw.status,totalAmount:raw.totalAmount
 };
}

async function boundedJson(response:Response):Promise<unknown>{
 if(!response.ok)throw new SandboxLookupError('PG_HTTP_ERROR');
 if(!response.headers.get('content-type')?.toLowerCase().includes('application/json'))
  throw new SandboxLookupError('INVALID_RESPONSE');
 const declared=response.headers.get('content-length');
 if(declared!==null&&( !/^\d+$/.test(declared) || Number(declared)>MAX_BYTES ))
  throw new SandboxLookupError('INVALID_RESPONSE');
 if(!response.body)throw new SandboxLookupError('INVALID_RESPONSE');
 const reader=response.body.getReader();
 const chunks:Uint8Array[]=[];
 let total=0;
 try{
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   total+=value.byteLength;
   if(total>MAX_BYTES)throw new SandboxLookupError('INVALID_RESPONSE');
   chunks.push(value);
  }
 }catch(e){
  try{await reader.cancel();}catch{/* best effort */}
  if(e instanceof SandboxLookupError)throw e;
  throw new SandboxLookupError('TRANSPORT_FAILURE');
 }finally{reader.releaseLock();}
 let parsed:unknown;
 try{parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));}
 catch{throw new SandboxLookupError('INVALID_RESPONSE');}
 return parsed;
}
function paymentPath(paymentKey:string):string{
 if(typeof paymentKey!=='string'||paymentKey.length===0||paymentKey.length>200||
   paymentKey==='.'||paymentKey==='..'||/[\u0000-\u001f\u007f]/.test(paymentKey))
  throw new SandboxLookupError('INVALID_PAYMENT_KEY');
 let escaped:string;
 try{escaped=encodeURIComponent(paymentKey);}catch{throw new SandboxLookupError('INVALID_PAYMENT_KEY');}
 return '/v1/payments/'+escaped;
}

/** Returns a read-only Payment lookup, never a payment-confirmation endpoint. */
export function createTossSandboxLookup(options:TossSandboxLookupOptions):TossPaymentLookup{
 isolated();
 // Never accept live keys, loose prefixes, whitespace or URL-controlled credentials.
 if(!options||typeof options.secretKey!=='string'||
   !/^test_sk_[A-Za-z0-9_-]{12,}$/.test(options.secretKey)||
   options.secretKey.length>256 ||
   (options.timeoutMs!==undefined&&(!Number.isSafeInteger(options.timeoutMs)||
     options.timeoutMs<250||options.timeoutMs>5000))||
   (options.fetcher!==undefined&&typeof options.fetcher!=='function'))
  throw new SandboxLookupError('INVALID_CONFIG');
 const fetcher=options.fetcher??fetch;
 const timeoutMs=options.timeoutMs??3000;
 const auth='Basic '+Buffer.from(options.secretKey+':','utf8').toString('base64');
 return async(paymentKey:string)=>{
  isolated();
  const path=paymentPath(paymentKey);
  let response:Response;
  try{
   response=await fetcher(HOST+path,{
    method:'GET',
    headers:{Authorization:auth,Accept:'application/json'},
    redirect:'error',credentials:'omit',cache:'no-store',
    signal:AbortSignal.timeout(timeoutMs)
   });
  }catch{
   // Never propagate the raw fetch/PG exception: it could contain a credential or URL.
   throw new SandboxLookupError('TRANSPORT_FAILURE');
  }
  return validateSnapshot(await boundedJson(response),paymentKey);
 };
}

/** Guard against stale/future webhook replay before even attempting a PG lookup.
 * Freshness is an auxiliary condition: database-backed event deduplication is still required.
 */
export function freshTossTransmissionTime(value:string|undefined,now=Date.now()):boolean{
 if(typeof value!=='string'||value.length>40||
  !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(value)||
  !Number.isFinite(now))return false;
 const sent=Date.parse(value);
 return Number.isFinite(sent)&&Math.abs(now-sent)<=5*60_000;
}
export type FreshTossInspection=TossInspection|{
 decision:'REVIEW_REQUIRED';reason:'STALE_TRANSMISSION_TIME';eventDedupKey:null
};

/** Non-mutating preview. Caller must derive expected order amount & merchant from trusted DB/config.
 * Never expose this directly via HTTP, and never mark an order paid from the return value.
 */
export async function inspectFreshTossSandboxEvent(input:{
 rawBody:Buffer;headers:TossWebhookHeaders;
 signingSecrets:readonly(string|Buffer)[];
 expected:ExpectedSandboxPayment;
 lookup:TossPaymentLookup;
 now?:number;
}):Promise<FreshTossInspection>{
 isolated();
 if(!freshTossTransmissionTime(input.headers.transmissionTime,input.now))
  return {decision:'REVIEW_REQUIRED',reason:'STALE_TRANSMISSION_TIME',eventDedupKey:null};
 return inspectSignedTossSandboxEvent(input);
}
