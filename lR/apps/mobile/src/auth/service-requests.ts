/** M5-2C4-C: contract for isolated demo-only repair and consignment API. */
import {AuthError,requireSecureDemoBaseUrl,type HttpFetch} from './api.ts';
export type ServiceKind='REPAIR'|'CONSIGNMENT';
export type ServiceStatus='SUBMITTED'|'UNDER_REVIEW'|'INFO_REQUESTED'|'DEMO_CLOSED'|'CANCELED';
export type AdminServiceStatus='UNDER_REVIEW'|'INFO_REQUESTED'|'DEMO_CLOSED';
export interface ServiceInput{kind:ServiceKind;itemName:string;details:string}
export interface ServiceRecord extends ServiceInput{
 id:string;ownerId:string;status:ServiceStatus;policyVersion:'demo-only';
 createdAt:string;updatedAt:string;demo:true;disclaimer:string;replayed?:boolean;
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[89ab0-9a-f]{12}$/i;
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const str=(x:unknown)=>typeof x==='string'&&x.length>0;
const kinds:ServiceKind[]=['REPAIR','CONSIGNMENT'];
const statuses:ServiceStatus[]=['SUBMITTED','UNDER_REVIEW','INFO_REQUESTED','DEMO_CLOSED','CANCELED'];
const adminStatuses:AdminServiceStatus[]=['UNDER_REVIEW','INFO_REQUESTED','DEMO_CLOSED'];
const clean=(input:ServiceInput):ServiceInput=>{
 const itemName=input.itemName.trim(),details=input.details.trim();
 if(!kinds.includes(input.kind)||itemName.length<2||itemName.length>120||
  details.length<10||details.length>1000)
  throw new AuthError('상품명은 2~120자, 신청 내용은 10~1000자로 입력해 주세요',422,'VALIDATION_ERROR');
 return {kind:input.kind,itemName,details};
};
export function parseServiceRecord(raw:unknown):ServiceRecord{
 const d=object(raw)?raw.data:undefined;
 if(!object(d)||d.demo!==true||d.policyVersion!=='demo-only'||
  !kinds.includes(d.kind as ServiceKind)||!statuses.includes(d.status as ServiceStatus)||
  !str(d.id)||!str(d.ownerId)||!uuid.test(d.id as string)||!uuid.test(d.ownerId as string)||
  !str(d.itemName)||!str(d.details)||!str(d.createdAt)||!str(d.updatedAt)||!str(d.disclaimer)||
  (d.replayed!==undefined&&typeof d.replayed!=='boolean'))
  throw new AuthError('서버 서비스 접수 데이터가 올바르지 않습니다');
 const input=clean({kind:d.kind as ServiceKind,itemName:d.itemName as string,details:d.details as string});
 return {id:d.id as string,ownerId:d.ownerId as string,...input,
  status:d.status as ServiceStatus,policyVersion:'demo-only',
  createdAt:d.createdAt as string,updatedAt:d.updatedAt as string,demo:true,
  disclaimer:d.disclaimer as string,replayed:d.replayed as boolean|undefined};
}
export function parseServiceList(raw:unknown):ServiceRecord[]{
 const data=object(raw)?raw.data:undefined;
 if(!Array.isArray(data)||data.length>50)throw new AuthError('신청 목록 응답이 올바르지 않습니다');
 return data.map(v=>parseServiceRecord({data:v}));
}
export function createServiceRequestsClient(base:string,fetcher:HttpFetch=fetch){
 const root=requireSecureDemoBaseUrl(base);
 const call=async(path:string,token:string,{method='GET',body,key}:{
  method?:'GET'|'POST'|'PATCH';body?:unknown;key?:string
 }={})=>{
  if(!/^[-_A-Za-z0-9]{40,128}$/.test(token))throw new AuthError('테스트 계정으로 로그인해 주세요',401,'UNAUTHENTICATED');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
   let res:Response;
   try{res=await fetcher(root+path,{
    method,headers:{Accept:'application/json',Authorization:'Bearer '+token,
     ...(body?{'Content-Type':'application/json'}:{}),...(key?{'Idempotency-Key':key}:{})},
    body:body?JSON.stringify(body):undefined,cache:'no-store',signal:controller.signal
   });}catch{throw new AuthError('서비스 접수 API 연결이 끊겼습니다. 내 신청 내역에서 접수 여부를 확인해 주세요');}
   const raw:unknown=await res.json().catch(()=>null);
   if(!res.ok){
    const e=object(raw)?raw:{};
    throw new AuthError(typeof e.title==='string'?e.title:'서비스 접수 서버 요청에 실패했습니다',
     res.status,typeof e.code==='string'?e.code:undefined);
   }
   return raw;
  }finally{clearTimeout(timer);}
 };
 const p='/api/v1/service-requests';
 return {
  create:async(token:string,key:string,input:ServiceInput)=>{
   if(!uuid.test(key))throw new AuthError('접수 요청번호가 올바르지 않습니다',422,'VALIDATION_ERROR');
   return parseServiceRecord(await call(p,token,{method:'POST',body:clean(input),key}));
  },
  list:async(token:string)=>parseServiceList(await call(p+'?limit=20&offset=0',token)),
  detail:async(token:string,id:string)=>{
   if(!uuid.test(id))throw new AuthError('신청번호가 올바르지 않습니다',422,'VALIDATION_ERROR');
   return parseServiceRecord(await call(p+'/'+encodeURIComponent(id),token));
  },
  cancel:async(token:string,id:string)=>{
   if(!uuid.test(id))throw new AuthError('신청번호가 올바르지 않습니다',422,'VALIDATION_ERROR');
   return parseServiceRecord(await call(p+'/'+encodeURIComponent(id)+'/cancel',token,{method:'POST'}));
  },
  adminList:async(token:string,kind?:ServiceKind)=>{
   if(kind&&!kinds.includes(kind))throw new AuthError('신청 유형이 올바르지 않습니다');
   return parseServiceList(await call('/api/v1/admin/service-requests?limit=20&offset=0'+(kind?'&kind='+kind:''),token));
  },
  adminStatus:async(token:string,id:string,status:AdminServiceStatus)=>{
   if(!uuid.test(id)||!adminStatuses.includes(status))throw new AuthError('관리자 상태 요청이 올바르지 않습니다',422,'VALIDATION_ERROR');
   return parseServiceRecord(await call('/api/v1/admin/service-requests/'+encodeURIComponent(id)+'/status',
    token,{method:'PATCH',body:{status}}));
  }
 };
}
