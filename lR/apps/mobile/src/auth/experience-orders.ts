/** Portfolio order intake: server-saved non-financial orders; no real payment methods are called. */
import {AuthError,requireSecureDemoBaseUrl,type HttpFetch} from './api.ts';
import {rentalDays} from '../domain/date.ts';

export type PaymentMethod='CARD'|'TRANSFER'|'EASY_PAY';
export type DeliveryMethod='COURIER'|'PICKUP';
export type DeliveryPreset='SAMPLE_SEOUL'|'SHOWROOM';
export interface ExperienceOrderInput {
 productId:string;startDate:string;returnDate:string;
 paymentMethod:PaymentMethod;deliveryMethod:DeliveryMethod;deliveryPreset:DeliveryPreset;
}
export interface ExperienceOrder extends ExperienceOrderInput {
 orderId:string;title:string;rentalDays:number;
 rentalFeeKrw:number;depositKrw:number;payableKrw:number;
 status:'RECEIVED';paymentStatus:'NOT_CHARGED';createdAt:string;demo:true;
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const str=(v:unknown,k:string)=>{
 if(typeof v!=='string'||!v.trim())throw new AuthError('주문 응답이 올바르지 않습니다: '+k);
 return v;
};
const krw=(v:unknown,k:string)=>{
 if(typeof v!=='number'||!Number.isSafeInteger(v)||v<0)throw new AuthError('주문 금액이 올바르지 않습니다: '+k);
 return v;
};
const paymentMethods=['CARD','TRANSFER','EASY_PAY'];
const deliveryMethods=['COURIER','PICKUP'];
const presets=['SAMPLE_SEOUL','SHOWROOM'];
function record(raw:unknown):ExperienceOrder{
 if(!obj(raw)||raw.demo!==true||raw.status!=='RECEIVED'||raw.paymentStatus!=='NOT_CHARGED'||
  !paymentMethods.includes(String(raw.paymentMethod))||
  !deliveryMethods.includes(String(raw.deliveryMethod))||
  !presets.includes(String(raw.deliveryPreset)))
  throw new AuthError('체험 주문의 상태 또는 선택 정보가 올바르지 않습니다');
 const startDate=str(raw.startDate,'startDate'),returnDate=str(raw.returnDate,'returnDate'),
  days=rentalDays(startDate,returnDate);
 const rentalFeeKrw=krw(raw.rentalFeeKrw,'rentalFeeKrw'),
  depositKrw=krw(raw.depositKrw,'depositKrw'),payableKrw=krw(raw.payableKrw,'payableKrw');
 if(days===null||raw.rentalDays!==days||!Number.isSafeInteger(rentalFeeKrw+depositKrw)||
  rentalFeeKrw+depositKrw!==payableKrw||
  (raw.deliveryMethod==='COURIER')!==(raw.deliveryPreset==='SAMPLE_SEOUL'))
  throw new AuthError('체험 주문의 날짜·수령지·가격이 일치하지 않습니다');
 const orderId=str(raw.orderId,'orderId');
 if(!uuid.test(orderId))throw new AuthError('주문 번호가 올바르지 않습니다');
 return {orderId,productId:str(raw.productId,'productId'),title:str(raw.title,'title'),
  startDate,returnDate,rentalDays:days,
  paymentMethod:raw.paymentMethod as PaymentMethod,
  deliveryMethod:raw.deliveryMethod as DeliveryMethod,
  deliveryPreset:raw.deliveryPreset as DeliveryPreset,
  rentalFeeKrw,depositKrw,payableKrw,status:'RECEIVED',
  paymentStatus:'NOT_CHARGED',demo:true,createdAt:str(raw.createdAt,'createdAt')};
}
const unwrap=(raw:unknown)=>{
 if(!obj(raw)||!obj(raw.meta)||raw.meta.demo!==true)
  throw new AuthError('테스트 주문 서버 응답이 아닙니다');
 return raw;
};
export function parseExperienceOrder(raw:unknown):ExperienceOrder{
 return record(unwrap(raw).data);
}
const list=(raw:unknown):ExperienceOrder[]=>{
 const value=unwrap(raw);
 if(!Array.isArray(value.data)||value.data.length>50)throw new AuthError('주문 내역 응답이 올바르지 않습니다');
 return value.data.map(record);
};
/** UUID is an idempotency label, NOT a security credential; no account/payment data is encoded. */
export function createIntakeRequestKey():string{
 if(typeof globalThis.crypto?.randomUUID==='function')return globalThis.crypto.randomUUID();
 return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
  const r=Math.floor(Math.random()*16);
  return (c==='x'?r:(r&3)|8).toString(16);
 });
}
export function createExperienceOrdersClient(base:string,fetcher:HttpFetch=fetch){
 const root=requireSecureDemoBaseUrl(base);
 const call=async(path:string,token:string,opts:{body?:ExperienceOrderInput;key?:string}={})=>{
  if(!/^[-_A-Za-z0-9]{40,128}$/.test(token))
   throw new AuthError('테스트 계정 로그인이 필요합니다',401,'UNAUTHENTICATED');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
   let response:Response;
   try{response=await fetcher(root+path,{
    method:opts.body?'POST':'GET',
    headers:{Accept:'application/json',Authorization:'Bearer '+token,
     ...(opts.body?{'Content-Type':'application/json','Idempotency-Key':opts.key!}:{})},
    body:opts.body?JSON.stringify(opts.body):undefined,
    cache:'no-store',signal:controller.signal
   });}catch{throw new AuthError('주문 서버에 연결하지 못했습니다. 주문 내역에서 접수 여부를 확인해 주세요');}
   const raw:unknown=await response.json().catch(()=>null);
   if(!response.ok){
    const error=obj(raw)?raw:{};
    throw new AuthError(typeof error.title==='string'?error.title:'주문 요청이 실패했습니다',
      response.status,typeof error.code==='string'?error.code:undefined);
   }
   return raw;
  }finally{clearTimeout(timer);}
 };
 return {
  create:async(token:string,key:string,input:ExperienceOrderInput)=>{
   if(!uuid.test(key))throw new AuthError('주문 요청 번호가 잘못되었습니다');
   return parseExperienceOrder(await call('/api/v1/experience/orders',token,{body:input,key}));
  },
  list:async(token:string)=>list(await call('/api/v1/experience/orders?limit=20&offset=0',token)),
  detail:async(token:string,id:string)=>{
   if(!uuid.test(id))throw new AuthError('잘못된 주문 번호입니다');
   return parseExperienceOrder(await call('/api/v1/experience/orders/'+encodeURIComponent(id),token));
  },
  adminList:async(token:string)=>list(await call('/api/v1/admin/experience/orders?limit=20&offset=0',token))
 };
}
