/** Non-financial STORE order intake, never a PG, sale or shipment request. */
import {AuthError,requireSecureDemoBaseUrl,type HttpFetch} from './api.ts';
export type StorePaymentMethod='CARD'|'TRANSFER'|'EASY_PAY';
export type StoreDeliveryMethod='COURIER'|'PICKUP';
export type StoreDeliveryPreset='SAMPLE_SEOUL'|'SHOWROOM';
export interface StoreOrderInput{
 productIds:string[];paymentMethod:StorePaymentMethod;
 deliveryMethod:StoreDeliveryMethod;deliveryPreset:StoreDeliveryPreset;
}
export interface StoreOrderItem{productId:string;title:string;unitPriceKrw:number;quantity:1;lineTotalKrw:number}
export interface StoreOrder{
 orderId:string;channel:'STORE';items:StoreOrderItem[];totalKrw:number;
 paymentMethod:StorePaymentMethod;deliveryMethod:StoreDeliveryMethod;deliveryPreset:StoreDeliveryPreset;
 status:'RECEIVED';paymentStatus:'NOT_CHARGED';createdAt:string;demo:true;
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const validString=(v:unknown)=>typeof v==='string'&&v.length>0;
const amount=(v:unknown)=>{
 if(typeof v!=='number'||!Number.isSafeInteger(v)||v<0)throw new AuthError('스토어 금액 형식이 올바르지 않습니다');
 return v;
};
const parseRow=(raw:unknown):StoreOrder=>{
 if(!object(raw)||raw.demo!==true||raw.channel!=='STORE'||raw.status!=='RECEIVED'||
  raw.paymentStatus!=='NOT_CHARGED'||!validString(raw.createdAt)||
  !['CARD','TRANSFER','EASY_PAY'].includes(String(raw.paymentMethod))||
  !['COURIER','PICKUP'].includes(String(raw.deliveryMethod))||
  !['SAMPLE_SEOUL','SHOWROOM'].includes(String(raw.deliveryPreset))||
  (raw.deliveryMethod==='COURIER')!==(raw.deliveryPreset==='SAMPLE_SEOUL')||
  !Array.isArray(raw.items)||raw.items.length<1||raw.items.length>10)
  throw new AuthError('스토어 주문 응답이 올바르지 않습니다');
 if(typeof raw.orderId!=='string'||!uuid.test(raw.orderId))throw new AuthError('주문번호가 올바르지 않습니다');
 const items=raw.items.map((v:unknown)=>{
  if(!object(v)||!validString(v.productId)||String(v.productId).length>40||
   !validString(v.title)||v.quantity!==1)
   throw new AuthError('스토어 상품 응답이 올바르지 않습니다');
  const unitPriceKrw=amount(v.unitPriceKrw),lineTotalKrw=amount(v.lineTotalKrw);
  if(unitPriceKrw!==lineTotalKrw)throw new AuthError('상품 금액이 일치하지 않습니다');
  return {productId:v.productId as string,title:v.title as string,unitPriceKrw,quantity:1 as const,lineTotalKrw};
 });
 const ids=items.map(i=>i.productId);
 const totalKrw=amount(raw.totalKrw),sum=items.reduce((a,item)=>a+item.lineTotalKrw,0);
 if(new Set(ids).size!==ids.length||!Number.isSafeInteger(sum)||sum!==totalKrw)
  throw new AuthError('스토어 주문 합계가 일치하지 않습니다');
 return {orderId:raw.orderId,channel:'STORE',items,totalKrw,
  paymentMethod:raw.paymentMethod as StorePaymentMethod,deliveryMethod:raw.deliveryMethod as StoreDeliveryMethod,
  deliveryPreset:raw.deliveryPreset as StoreDeliveryPreset,status:'RECEIVED',
  paymentStatus:'NOT_CHARGED',createdAt:raw.createdAt as string,demo:true};
};
const unpack=(raw:unknown)=>{
 if(!object(raw)||!object(raw.meta)||raw.meta.demo!==true)
  throw new AuthError('테스트 스토어 주문 응답이 아닙니다');
 return raw.data;
};
export const parseStoreOrder=(raw:unknown)=>parseRow(unpack(raw));
export const parseStoreOrderList=(raw:unknown):StoreOrder[]=>{
 const records=unpack(raw);
 if(!Array.isArray(records)||records.length>50)
  throw new AuthError('스토어 주문 목록 응답이 올바르지 않습니다');
 return records.map(parseRow);
};
export function createStoreOrdersClient(base:string,fetcher:HttpFetch=fetch){
 const root=requireSecureDemoBaseUrl(base);
 const call=async(path:string,token:string,method:'GET'|'POST',body?:StoreOrderInput,key?:string)=>{
  if(!/^[-_A-Za-z0-9]{40,128}$/.test(token))throw new AuthError('테스트 계정 로그인이 필요합니다',401,'UNAUTHENTICATED');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
   let res:Response;
   try{
    res=await fetcher(root+path,{method,headers:{
     Accept:'application/json',Authorization:'Bearer '+token,
     ...(body?{'Content-Type':'application/json','Idempotency-Key':key!}:{})
    },body:body?JSON.stringify(body):undefined,cache:'no-store',signal:controller.signal});
   }catch{throw new AuthError('서버 연결이 불안정합니다. 접수 내역에서 저장 여부를 확인해 주세요');}
   const raw:unknown=await res.json().catch(()=>null);
   if(!res.ok){
    const err=object(raw)?raw:{};
    throw new AuthError(typeof err.title==='string'?err.title:'스토어 주문 접수에 실패했습니다',
     res.status,typeof err.code==='string'?err.code:undefined);
   }
   return raw;
  }finally{clearTimeout(timer);}
 };
 return {
  create:async(token:string,key:string,input:StoreOrderInput)=>{
   if(!uuid.test(key)||input.productIds.length<1||input.productIds.length>10||
    new Set(input.productIds).size!==input.productIds.length)
    throw new AuthError('스토어 주문 내용이나 요청번호를 확인해 주세요');
   return parseStoreOrder(await call('/api/v1/experience/store-orders',token,'POST',input,key));
  },
  list:async(token:string)=>parseStoreOrderList(await call('/api/v1/experience/store-orders?limit=20&offset=0',token,'GET')),
  detail:async(token:string,id:string)=>{
   if(!uuid.test(id))throw new AuthError('주문번호가 올바르지 않습니다');
   return parseStoreOrder(await call('/api/v1/experience/store-orders/'+encodeURIComponent(id),token,'GET'));
  },
  adminList:async(token:string)=>parseStoreOrderList(await call('/api/v1/admin/experience/store-orders?limit=20&offset=0',token,'GET'))
 };
}
