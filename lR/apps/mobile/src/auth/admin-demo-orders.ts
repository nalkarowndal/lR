/** ADMIN-only test-ledger transport. Never returns real PG/customer data. */
import {AuthError,requireSecureDemoBaseUrl,type HttpFetch} from './api.ts';
import {rentalDays} from '../domain/date.ts';

export type DemoAdminStatus='PENDING_SIMULATION'|'SIMULATED_PAID'|'FAILED'|'CANCELED'|'REVIEW_REQUIRED';
export interface DemoAdminOrder{
 orderId:string;productId:string;title:string;startDate:string;returnDate:string;
 rentalDays:number;rentalFeeKrw:number;depositKrw:number;payableKrw:number;
 status:DemoAdminStatus;policyVersion:'demo-only';createdAt:string;demo:true
}
export interface DemoAdminDetail extends DemoAdminOrder{
 audit:Array<{action:string;createdAt:string}>;
 events:Array<{status:string;resultStatus:string;verifiedAmountKrw:number;createdAt:string}>;
}
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const str=(v:unknown,k:string)=>{
 if(typeof v!=='string'||!v.trim())throw new AuthError('테스트 원장 응답 오류: '+k);
 return v;
};
const money=(v:unknown,k:string)=>{
 if(typeof v!=='number'||!Number.isSafeInteger(v)||v<0)throw new AuthError('테스트 원장 금액 오류: '+k);
 return v;
};
const statuses=['PENDING_SIMULATION','SIMULATED_PAID','FAILED','CANCELED','REVIEW_REQUIRED'];
const eventStatus=['DONE','FAILED','CANCELED'];
const auditStatus=['CREATED','SIMULATED_PAID','FAILED','CANCELED','REVIEW_REQUIRED'];
function parseRecord(value:unknown):DemoAdminOrder{
 if(!obj(value)||value.demo!==true||value.policyVersion!=='demo-only'||
   !statuses.includes(String(value.status)))throw new AuthError('시연용 원장만 확인할 수 있습니다');
 const startDate=str(value.startDate,'startDate'),returnDate=str(value.returnDate,'returnDate');
 const days=rentalDays(startDate,returnDate);
 const rentalFeeKrw=money(value.rentalFeeKrw,'rentalFeeKrw');
 const depositKrw=money(value.depositKrw,'depositKrw');
 const payableKrw=money(value.payableKrw,'payableKrw');
 if(days===null||value.rentalDays!==days||!Number.isSafeInteger(rentalFeeKrw+depositKrw)||
   rentalFeeKrw+depositKrw!==payableKrw)
  throw new AuthError('테스트 원장 날짜 또는 금액의 정합성이 맞지 않습니다');
 return {orderId:str(value.orderId,'orderId'),productId:str(value.productId,'productId'),
 title:str(value.title,'title'),startDate,returnDate,rentalDays:days,
 rentalFeeKrw,depositKrw,payableKrw,status:value.status as DemoAdminStatus,
 policyVersion:'demo-only',createdAt:str(value.createdAt,'createdAt'),demo:true};
}
const meta=(raw:unknown)=>{
 if(!obj(raw)||!obj(raw.meta)||raw.meta.demo!==true)throw new AuthError('테스트 전용 응답이 아닙니다');
 return raw;
};
export function parseAdminDemoList(raw:unknown):DemoAdminOrder[]{
 const container=meta(raw);
 if(!Array.isArray(container.data)||container.data.length>50||!obj(container.meta.page))
  throw new AuthError('테스트 원장 목록 응답이 올바르지 않습니다');
 const page=container.meta.page;
 if(!Number.isInteger(page.limit)||!Number.isInteger(page.offset)||
   (page.limit as number)<1||(page.limit as number)>50||
   (page.offset as number)<0)
  throw new AuthError('테스트 원장 페이지가 올바르지 않습니다');
 return container.data.map(parseRecord);
}
export function parseAdminDemoDetail(raw:unknown):DemoAdminDetail{
 const container=meta(raw);
 if(!obj(container.data)||!Array.isArray(container.data.audit)||
   !Array.isArray(container.data.events)||container.data.audit.length>100||container.data.events.length>100)
  throw new AuthError('테스트 원장 상세 응답이 올바르지 않습니다');
 const record=parseRecord(container.data);
 const audit=container.data.audit.map((a:unknown)=>{
  if(!obj(a)||!auditStatus.includes(String(a.action)))throw new AuthError('감사 이력이 올바르지 않습니다');
  return {action:str(a.action,'action'),createdAt:str(a.createdAt,'createdAt')};
 });
 const events=container.data.events.map((e:unknown)=>{
  if(!obj(e)||!eventStatus.includes(String(e.status))||!statuses.includes(String(e.resultStatus))||
    money(e.verifiedAmountKrw,'verifiedAmountKrw')!==record.payableKrw)
   throw new AuthError('모의 결제 이벤트의 금액 또는 상태가 올바르지 않습니다');
  return {status:str(e.status,'status'),resultStatus:str(e.resultStatus,'resultStatus'),
    verifiedAmountKrw:record.payableKrw,createdAt:str(e.createdAt,'createdAt')};
 });
 return {...record,audit,events};
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function createAdminDemoOrdersClient(base:string,fetcher:HttpFetch=fetch){
 const origin=requireSecureDemoBaseUrl(base);
 const get=async(path:string,token:string)=>{
  if(!/^[-_A-Za-z0-9]{40,128}$/.test(token))
   throw new AuthError('유효한 관리자 세션이 필요합니다',401,'UNAUTHENTICATED');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),10_000);
  try{
   let response:Response;
   try{response=await fetcher(origin+path,{method:'GET',
    headers:{Accept:'application/json',Authorization:'Bearer '+token},
    signal:controller.signal,cache:'no-store'
   });}catch{throw new AuthError('테스트 원장 서버에 연결하지 못했습니다');}
   const raw:unknown=await response.json().catch(()=>null);
   if(!response.ok){
    const body=obj(raw)?raw:{};
    throw new AuthError(typeof body.title==='string'?body.title:'원장 조회를 처리할 수 없습니다',
      response.status,typeof body.code==='string'?body.code:undefined);
   }
   return raw;
  }finally{clearTimeout(timeout);}
 };
 return {
  list:async(token:string)=>parseAdminDemoList(await get('/api/v1/admin/demo-orders?limit=20&offset=0',token)),
  detail:async(token:string,orderId:string)=>{
   if(!uuid.test(orderId))throw new AuthError('잘못된 모의 주문 번호입니다');
   return parseAdminDemoDetail(await get('/api/v1/admin/demo-orders/'+encodeURIComponent(orderId),token));
  }
 };
}
