/** Authenticated demo-only saved collections; only opaque product IDs cross the wire. */
import {AuthError,requireSecureDemoBaseUrl,type HttpFetch} from './api.ts';
export type SavedList='wishlist'|'cart';
const isObject=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const parse=(raw:unknown):string[]=>{
 if(!isObject(raw)||!isObject(raw.meta)||raw.meta.demo!==true||!isObject(raw.data)||
  !Array.isArray(raw.data.productIds))
  throw new AuthError('저장 목록 API 응답이 올바르지 않습니다');
 const ids=raw.data.productIds;
 if(ids.length>100||ids.some((id:unknown)=>typeof id!=='string'||id.length===0||id.length>40)||
  new Set(ids).size!==ids.length)
  throw new AuthError('저장 목록의 상품 정보가 올바르지 않습니다');
 return ids as string[];
};
export function createSavedCollectionsClient(base:string,fetcher:HttpFetch=fetch){
 const root=requireSecureDemoBaseUrl(base);
 async function call(token:string,kind:SavedList,method:'GET'|'POST'|'DELETE',id?:string):Promise<string[]>{
  if(!/^[-_A-Za-z0-9]{40,128}$/.test(token))
   throw new AuthError('테스트 계정 로그인이 필요합니다',401,'UNAUTHENTICATED');
  if(id!==undefined&&(id.length<1||id.length>40))throw new AuthError('잘못된 상품 식별자입니다');
  const path='/api/v1/me/'+kind+(method==='DELETE'?'/'+encodeURIComponent(id!):'');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
   let response:Response;
   try{
    response=await fetcher(root+path,{
     method,
     headers:{Accept:'application/json',Authorization:'Bearer '+token,
      ...(method==='POST'?{'Content-Type':'application/json'}:{})},
     body:method==='POST'?JSON.stringify({productId:id}):undefined,
     cache:'no-store',signal:controller.signal
    });
   }catch{throw new AuthError('저장 목록 서버에 연결할 수 없습니다. 연결을 확인해 주세요');}
   if(response.status===204&&method==='DELETE')return [];
   const raw:unknown=await response.json().catch(()=>null);
   if(!response.ok){
    const err=isObject(raw)?raw:{};
    throw new AuthError(typeof err.title==='string'?err.title:'상품 저장 요청이 실패했습니다',
     response.status,typeof err.code==='string'?err.code:undefined);
   }
   return parse(raw);
  }finally{clearTimeout(timer);}
 }
 return {
  list:(token:string,kind:SavedList)=>call(token,kind,'GET'),
  add:(token:string,kind:SavedList,id:string)=>call(token,kind,'POST',id),
  remove:(token:string,kind:SavedList,id:string)=>call(token,kind,'DELETE',id)
 };
}
