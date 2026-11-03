/** M5-2C4-D1: copy-only editorial CMS. No media upload or external destinations. */
import {AuthError,requireSecureDemoBaseUrl,type HttpFetch} from './api.ts';
export type EditorialTarget='RENTAL'|'STORE'|'CARE'|'CONSIGNMENT';
export interface EditorialCopy{
 eyebrow:string;headline:string;description:string;ctaLabel:string;ctaTarget:EditorialTarget;
}
export interface PublishedEditorial{slot:'HOME_HERO';copy:EditorialCopy;revision:number;demo:true}
export interface AdminEditorial{
 slot:'HOME_HERO';draft:EditorialCopy;published:EditorialCopy;revision:number;
 publishedRevision:number;demo:true;
}
export interface MediaRightsRow{
 productId:string;title:string;registeredCount:number;rightsApprovedCount:number;
 displayReady:boolean;reason:string;
}
export const defaultHomeEditorial:EditorialCopy={
 eyebrow:'CURATED FOR YOU',headline:'오늘의 스타일, 소유보다 자유롭게.',
 description:'다양한 시연용 컬렉션을 둘러보고 나에게 맞는 이용 방식을 찾아보세요.',
 ctaLabel:'렌탈 컬렉션 보기',ctaTarget:'RENTAL'
};
const obj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const safeString=(x:unknown,min:number,max:number):x is string=>
 typeof x==='string'&&x.trim().length>=min&&x.trim().length<=max&&x===x.trim()&&
 !/[<>\u0000-\u001f\u007f]/.test(x)&&!/https?:\/\/|www\.|javascript:|data:/i.test(x);
const target=(x:unknown):x is EditorialTarget=>
 x==='RENTAL'||x==='STORE'||x==='CARE'||x==='CONSIGNMENT';
const integer=(x:unknown):x is number=>Number.isSafeInteger(x)&&typeof x==='number'&&x>=1;
const nonNegativeInteger=(x:unknown):x is number=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=0;
function copyFrom(x:unknown):EditorialCopy{
 if(!obj(x)||!safeString(x.eyebrow,2,60)||!safeString(x.headline,2,80)||
  !safeString(x.description,2,180)||!safeString(x.ctaLabel,2,32)||!target(x.ctaTarget)||
  Object.keys(x).some(k=>!['eyebrow','headline','description','ctaLabel','ctaTarget'].includes(k)))
  throw new AuthError('에디토리얼 문구 형식이 올바르지 않습니다',422,'VALIDATION_ERROR');
 return {eyebrow:x.eyebrow,headline:x.headline,description:x.description,
  ctaLabel:x.ctaLabel,ctaTarget:x.ctaTarget};
}
export function parsePublishedEditorial(raw:unknown):PublishedEditorial{
 const d=obj(raw)?raw.data:undefined;
 if(!obj(d)||d.demo!==true||d.slot!=='HOME_HERO'||!integer(d.revision)||
  d.draft!==undefined||d.published!==undefined)
  throw new AuthError('게시 문구 API 응답이 올바르지 않습니다');
 return {slot:'HOME_HERO',copy:copyFrom(d.copy),revision:d.revision,demo:true};
}
export function parseAdminEditorial(raw:unknown):AdminEditorial{
 const d=obj(raw)?raw.data:undefined;
 if(!obj(d)||d.demo!==true||d.slot!=='HOME_HERO'||!integer(d.revision)||
  !integer(d.publishedRevision)||d.revision<d.publishedRevision)
  throw new AuthError('관리자 에디토리얼 API 응답이 올바르지 않습니다');
 return {slot:'HOME_HERO',draft:copyFrom(d.draft),published:copyFrom(d.published),
  revision:d.revision,publishedRevision:d.publishedRevision,demo:true};
}
export function parseRightsReport(raw:unknown):MediaRightsRow[]{
 const d=obj(raw)?raw.data:undefined;
 if(!Array.isArray(d)||d.length>50||!obj(raw)||!obj(raw.meta)||raw.meta.demo!==true)
  throw new AuthError('미디어 권리 보고서 응답이 올바르지 않습니다');
 return d.map((r:unknown)=>{
  if(!obj(r)||typeof r.productId!=='string'||!r.productId.length||r.productId.length>40||
   !safeString(r.title,2,255)||!nonNegativeInteger(r.registeredCount)||!nonNegativeInteger(r.rightsApprovedCount)||
   r.rightsApprovedCount>r.registeredCount||typeof r.displayReady!=='boolean'||
   !safeString(r.reason,2,255))
   throw new AuthError('미디어 권리 보고서 항목이 올바르지 않습니다');
  return {productId:r.productId,title:r.title,registeredCount:r.registeredCount,
   rightsApprovedCount:r.rightsApprovedCount,displayReady:r.displayReady,reason:r.reason};
 });
}
export function createEditorialClient(base:string,fetcher:HttpFetch=fetch){
 const root=requireSecureDemoBaseUrl(base);
 const call=async(path:string,{token,method='GET',body}:{
  token?:string;method?:'GET'|'POST'|'PUT';body?:unknown
 }={})=>{
  if(token!==undefined&&!/^[-_A-Za-z0-9]{40,128}$/.test(token))
   throw new AuthError('테스트 관리자 로그인이 필요합니다',401,'UNAUTHENTICATED');
  if(path.startsWith('/api/v1/admin/')&&!token)
   throw new AuthError('테스트 관리자 로그인이 필요합니다',401,'UNAUTHENTICATED');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
   let response:Response;
   try{response=await fetcher(root+path,{method,headers:{
    Accept:'application/json',...(token?{Authorization:'Bearer '+token}:{}),
    ...(body?{'Content-Type':'application/json'}:{})
   },body:body?JSON.stringify(body):undefined,cache:'no-store',signal:controller.signal});}
   catch{throw new AuthError('에디토리얼 API 연결이 끊겼습니다. 다시 불러와 주세요');}
   const raw:unknown=await response.json().catch(()=>null);
   if(!response.ok){
    const error=obj(raw)?raw:{};
    throw new AuthError(typeof error.title==='string'?error.title:'에디토리얼 작업에 실패했습니다',
     response.status,typeof error.code==='string'?error.code:undefined);
   }
   return raw;
  }finally{clearTimeout(timer);}
 };
 const path='/api/v1/admin/editorial/home';
 return {
  published:async()=>parsePublishedEditorial(await call('/api/v1/editorial/home')),
  adminRead:async(token:string)=>parseAdminEditorial(await call(path,{token})),
  adminDraft:async(token:string,expectedRevision:number,copy:EditorialCopy)=>{
   if(!integer(expectedRevision))throw new AuthError('에디토리얼 수정 버전을 확인해 주세요');
   const clean=copyFrom(copy);
   return parseAdminEditorial(await call(path+'/draft',{token,method:'PUT',body:{expectedRevision,copy:clean}}));
  },
  adminPublish:async(token:string,expectedRevision:number)=>{
   if(!integer(expectedRevision))throw new AuthError('게시할 버전을 확인해 주세요');
   return parseAdminEditorial(await call(path+'/publish',{token,method:'POST',body:{expectedRevision}}));
  },
  mediaRights:async(token:string)=>parseRightsReport(await call('/api/v1/admin/media-rights',{token}))
 };
}
