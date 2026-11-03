import {useCallback,useEffect,useRef,useState} from 'react';
import {products,findProduct,type Channel,type Product} from '../domain/catalog';
import {rentalDays} from '../domain/date';
import {
 apiEnabled,configuredApi,ApiError,type AvailabilityResult,type QuoteResult
} from './client';

export type LoadStatus='loading'|'ready'|'error';
export interface Resource<T>{data:T|null;status:LoadStatus;error:string|null;retry:()=>void}
export const friendlyError=(error:unknown):string=>{
 if(error instanceof ApiError){
  if(error.kind==='NETWORK')return '서버에 연결하지 못했습니다. API 주소와 네트워크를 확인해 주세요.';
  if(error.kind==='TIMEOUT')return '서버 응답이 지연되고 있습니다. 다시 시도해 주세요.';
  if(error.status===404)return '요청한 정보를 찾을 수 없습니다.';
  if(error.status===409)return '선택한 날짜에 이용 가능한 재고가 없습니다.';
  if(error.status===422)return '입력한 날짜와 상품 정보를 확인해 주세요.';
  return error.message;
 }
 return '정보를 가져오지 못했습니다. 다시 시도해 주세요.';
};
export function useProductList({channel,q=''}:{channel?:Channel;q?:string}={}){
 const [items,setItems]=useState<Product[]>([]);
 const [status,setStatus]=useState<LoadStatus>('loading');
 const [error,setError]=useState<string|null>(null);
 const [cursor,setCursor]=useState<string|null>(null);
 const [hasNext,setHasNext]=useState(false);
 const [loadingMore,setLoadingMore]=useState(false);
 const [refresh,setRefresh]=useState(0);
 const generation=useRef(0);
 const active=useRef<AbortController|null>(null);
 const retry=useCallback(()=>setRefresh(n=>n+1),[]);
 useEffect(()=>{
  const version=++generation.current;
  active.current?.abort();const controller=new AbortController();active.current=controller;
  setStatus('loading');setError(null);setItems([]);setCursor(null);setHasNext(false);
  const run=async()=>{
   try{
    if(!apiEnabled()){
     const term=q.trim().toLowerCase();
     const filtered=products.filter(x=>(!channel||x.channels.includes(channel))&&
       (!term||(x.brand+' '+x.title+' '+x.category).toLowerCase().includes(term)));
     if(version!==generation.current)return;
     setItems(filtered);setStatus('ready');return;
    }
    const page=await configuredApi().list({channel,q,limit:20},controller.signal);
    if(version!==generation.current)return;
    setItems(page.products);setCursor(page.cursor);setHasNext(page.hasNext);setStatus('ready');
   }catch(err){
    if(controller.signal.aborted||version!==generation.current)return;
    setError(friendlyError(err));setStatus('error');
   }
  };
  void run();
  return ()=>{controller.abort();generation.current++;};
 },[channel,q,refresh]);
 const loadMore=useCallback(async()=>{
  if(!apiEnabled()||status!=='ready'||!hasNext||!cursor||loadingMore)return;
  const version=generation.current;const controller=active.current;
  setLoadingMore(true);
  try{
   const page=await configuredApi().list({channel,q,cursor,limit:20},controller?.signal);
   if(version!==generation.current||controller?.signal.aborted)return;
   setItems(current=>[...current,...page.products.filter(item=>!current.some(x=>x.id===item.id))]);
   setCursor(page.cursor);setHasNext(page.hasNext);
  }catch(err){
   if(version!==generation.current||controller?.signal.aborted)return;
   setError(friendlyError(err));
  }finally{if(version===generation.current)setLoadingMore(false);}
 },[channel,q,cursor,hasNext,loadingMore,status]);
 return {items,status,error,retry,loadMore,hasNext,loadingMore};
}
function useResource<T>(key:string,loader:(signal:AbortSignal)=>Promise<T|null>,enabled=true):Resource<T>{
 const [data,setData]=useState<T|null>(null);
 const [status,setStatus]=useState<LoadStatus>('loading');
 const [error,setError]=useState<string|null>(null);
 const [refresh,setRefresh]=useState(0);
 const retry=useCallback(()=>setRefresh(n=>n+1),[]);
 useEffect(()=>{
  const controller=new AbortController();
  if(!enabled){setData(null);setStatus('ready');setError(null);return()=>controller.abort();}
  setData(null);setStatus('loading');setError(null);
  void loader(controller.signal).then(value=>{
   if(!controller.signal.aborted){setData(value);setStatus('ready');}
  }).catch(err=>{
   if(!controller.signal.aborted){setError(friendlyError(err));setStatus('error');}
  });
  return ()=>controller.abort();
 // loader is re-created during render; 'key' captures all request inputs.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[key,enabled,refresh]);
 return {data,status,error,retry};
}
export const useProduct=(id:string):Resource<Product>=>useResource(
 'product:'+id,async signal=>apiEnabled()?configuredApi().product(id,signal):findProduct(id)??null,!!id
);
export const useAvailability=(id:string,startDate:string,returnDate:string):Resource<AvailabilityResult>=>{
 const days=rentalDays(startDate,returnDate);
 return useResource('availability:'+id+':'+startDate+':'+returnDate,async signal=>{
  if(apiEnabled())return configuredApi().availability(id,startDate,returnDate,signal);
  return {productId:id,startDate,returnDate,rentalDays:days!,eligibleUnitCount:0,
   available:false,demo:true};
 },!!id&&days!==null);
};
export const useQuote=(draft:{productId:string;startDate:string;returnDate:string}|null):Resource<QuoteResult>=>{
 const key=draft?'quote:'+draft.productId+':'+draft.startDate+':'+draft.returnDate:'none';
 return useResource(key,async signal=>{
  if(!draft)return null;
  if(apiEnabled())return configuredApi().quote(draft,signal);
  const product=findProduct(draft.productId);
  const days=rentalDays(draft.startDate,draft.returnDate);
  if(!product||days===null)throw new ApiError('CONTRACT','견적 상품이나 날짜가 올바르지 않습니다');
  const rentalFeeKrw=product.dayRateKrw*days;
  return {quoteId:'local-demo',productId:product.id,startDate:draft.startDate,
   returnDate:draft.returnDate,rentalDays:days,dayRateKrw:product.dayRateKrw,
   rentalFeeKrw,discountKrw:0,shippingFeeKrw:0,depositKrw:product.depositKrw,
   payableNowKrw:rentalFeeKrw+product.depositKrw,demo:true,policyVersionId:'local-demo',
   quoteExpiresAt:new Date(Date.now()+5*60000).toISOString(),
   disclaimer:'오프라인 디자인 시연 견적입니다. 실제 예약이나 결제가 아닙니다.'};
 },draft!==null);
};

/** Resolve every selected product by ID. Never silently substitute stale demo stock. */
export function useProductIds(ids:string[]):Resource<Product[]>{
 const unique=Array.from(new Set(ids)).slice(0,30);
 const key=unique.join('|');
 return useResource('items:'+key,async signal=>{
  if(!unique.length)return [];
  if(apiEnabled()){
   const client=configuredApi();
   return Promise.all(unique.map(id=>client.product(id,signal)));
  }
  return unique.flatMap(id=>{const p=findProduct(id);return p?[p]:[]});
 });
}
