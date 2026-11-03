import type{Channel,Product,ProductArt,ProductMedia} from '../domain/catalog';
import {getGeneratedDemoMedia,isGeneratedDemoMediaUrl} from '../domain/generated-media';

export type ApiErrorKind='HTTP'|'NETWORK'|'TIMEOUT'|'CONFIG'|'CONTRACT';
export class ApiError extends Error {
  readonly kind:ApiErrorKind;
  readonly status?:number;
  readonly code?:string;
  constructor(kind:ApiErrorKind,message:string,status?:number,code?:string){
    super(message);this.name='ApiError';
    this.kind=kind;this.status=status;this.code=code;
  }
}
export interface PageResult{products:Product[];cursor:string|null;hasNext:boolean}
export interface AvailabilityResult{
  productId:string;startDate:string;returnDate:string;rentalDays:number;
  available:boolean;eligibleUnitCount:number;demo:boolean;
}
export interface QuoteResult{
  quoteId:string;productId:string;startDate:string;returnDate:string;rentalDays:number;
  dayRateKrw:number;rentalFeeKrw:number;discountKrw:number;shippingFeeKrw:number;
  depositKrw:number;payableNowKrw:number;demo:boolean;disclaimer:string;
  quoteExpiresAt:string;policyVersionId:string;
}
export type FetchLike=(url:string,init?:RequestInit)=>Promise<Response>;
const isObject=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const str=(v:unknown,name:string)=>{if(typeof v!=='string'||!v.length)throw new ApiError('CONTRACT','서버 응답의 '+name+'이 올바르지 않습니다');return v;};
const amount=(v:unknown,name:string)=>{if(typeof v!=='number'||!Number.isSafeInteger(v)||v<0)throw new ApiError('CONTRACT','서버 금액 '+name+'이 올바르지 않습니다');return v;};
const nullable=(v:unknown,name:string)=>v===null?0:amount(v,name);
const palette:ProductArt[]=['#FDF2F8','#EFF6FF','#F0FDF4','#F3F4F6'];
const stableArt=(id:string):ProductArt=>palette[Array.from(id).reduce((sum,x)=>sum+x.charCodeAt(0),0)%palette.length];
/** Never render untrusted data: URLs or cleartext remote image origins. */
export function parseProductMedia(value:unknown):ProductMedia[]{
 if(value===undefined||value===null)return [];
 if(!Array.isArray(value)||value.length>8)throw new ApiError('CONTRACT','상품 이미지 목록이 올바르지 않습니다');
 return value.map(item=>{
  if(!isObject(item)||typeof item.url!=='string'||typeof item.alt!=='string'||!item.alt.trim()||item.alt.length>160)
   throw new ApiError('CONTRACT','상품 이미지 설명이 올바르지 않습니다');
  let url:URL;try{url=new URL(item.url);}catch{throw new ApiError('CONTRACT','상품 이미지 주소가 잘못되었습니다');}
  const approvedHosts: string=typeof process.env.EXPO_PUBLIC_MEDIA_HOSTS==='string'?process.env.EXPO_PUBLIC_MEDIA_HOSTS:'';
  const origins=new Set(approvedHosts.split(',')
   .map((host:string)=>host.trim().toLowerCase()).filter(Boolean));
  if(url.protocol!=='https:'||(!origins.has(url.hostname.toLowerCase())&&!isGeneratedDemoMediaUrl(item.url))||url.username||url.password||
   url.port||url.search||url.hash||item.url.length>2048||
   !/\.(?:webp|avif|png|jpe?g)$/i.test(url.pathname)||
   /[<>\u0000-\u001f\u007f]/.test(item.alt)||item.alt.trim().length<2)
   throw new ApiError('CONTRACT','상품 이미지는 사용권을 확인한 HTTPS 출처에서만 제공합니다');
  return {url:item.url,alt:item.alt.trim()};
 });
}
export const apiBaseUrl=()=>process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/,'')||null;
export const apiEnabled=()=>!!apiBaseUrl();
export function parseProduct(value:unknown):Product{
 if(!isObject(value))throw new ApiError('CONTRACT','상품 응답 형식이 올바르지 않습니다');
 if(!Array.isArray(value.channels)||!value.channels.every(x=>x==='RENTAL'||x==='STORE'))throw new ApiError('CONTRACT','판매 채널이 올바르지 않습니다');
 if(typeof value.demo!=='boolean')throw new ApiError('CONTRACT','상품 표시 정보가 올바르지 않습니다');
 const media=parseProductMedia(value.media);
 if(media.some(item=>isGeneratedDemoMediaUrl(item.url)&&
  (value.demo!==true||!getGeneratedDemoMedia(value.id as string)
   .some(known=>known.url===item.url&&known.alt===item.alt))))
  throw new ApiError('CONTRACT','AI 시연 이미지가 다른 상품에 연결됐습니다');
 return {id:str(value.id,'id'),brand:str(value.brand,'brand'),title:str(value.title,'title'),
  category:str(value.category,'category'),condition:str(value.condition,'condition'),
  channels:value.channels,dayRateKrw:nullable(value.dayRateKrw,'dayRateKrw'),
  salePriceKrw:nullable(value.salePriceKrw,'salePriceKrw'),
  depositKrw:amount(value.depositKrw,'depositKrw'),demo:value.demo,art:stableArt(value.id as string),media};
}
export function parsePage(value:unknown):PageResult{
 if(!isObject(value)||!Array.isArray(value.data)||!isObject(value.meta)||!isObject(value.meta.page))
  throw new ApiError('CONTRACT','상품 목록 응답이 올바르지 않습니다');
 const page=value.meta.page;
 if(typeof page.hasNext!=='boolean'||(page.cursor!==null&&typeof page.cursor!=='string'))
  throw new ApiError('CONTRACT','페이지 정보가 올바르지 않습니다');
 return {products:value.data.map(parseProduct),cursor:page.cursor,hasNext:page.hasNext};
}
export function parseAvailability(value:unknown):AvailabilityResult{
 if(!isObject(value)||!isObject(value.data))throw new ApiError('CONTRACT','가용성 응답이 올바르지 않습니다');
 const d=value.data;
 if(typeof d.available!=='boolean'||typeof d.demo!=='boolean')throw new ApiError('CONTRACT','가용성 상태가 올바르지 않습니다');
 return {productId:str(d.productId,'productId'),startDate:str(d.startDate,'startDate'),returnDate:str(d.returnDate,'returnDate'),
  rentalDays:amount(d.rentalDays,'rentalDays'),eligibleUnitCount:amount(d.eligibleUnitCount,'eligibleUnitCount'),
  available:d.available,demo:d.demo};
}
export function parseQuote(value:unknown):QuoteResult{
 if(!isObject(value)||!isObject(value.data))throw new ApiError('CONTRACT','견적 응답이 올바르지 않습니다');
 const d=value.data;if(d.demo!==true)throw new ApiError('CONTRACT','실거래 견적을 지원하지 않습니다');
 return {quoteId:str(d.quoteId,'quoteId'),productId:str(d.productId,'productId'),
  startDate:str(d.startDate,'startDate'),returnDate:str(d.returnDate,'returnDate'),
  rentalDays:amount(d.rentalDays,'rentalDays'),dayRateKrw:amount(d.dayRateKrw,'dayRateKrw'),
  rentalFeeKrw:amount(d.rentalFeeKrw,'rentalFeeKrw'),discountKrw:amount(d.discountKrw,'discountKrw'),
  shippingFeeKrw:amount(d.shippingFeeKrw,'shippingFeeKrw'),depositKrw:amount(d.depositKrw,'depositKrw'),
  payableNowKrw:amount(d.payableNowKrw,'payableNowKrw'),demo:true,
  disclaimer:str(d.disclaimer,'disclaimer'),quoteExpiresAt:str(d.quoteExpiresAt,'quoteExpiresAt'),
  policyVersionId:str(d.policyVersionId,'policyVersionId')};
}
export function createApiClient(base:string,fetcher:FetchLike=fetch){
 const root=base.trim().replace(/\/+$/,'');
 if(!/^https?:\/\//.test(root))throw new ApiError('CONFIG','API 주소를 설정해 주세요');
 const call=async(path:string,{method='GET',body,signal}:{method?:string;body?:unknown;signal?:AbortSignal}={})=>{
  const controller=new AbortController();
  const cancel=()=>controller.abort();
  if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',cancel,{once:true});
  let timedOut=false;
  const timeout=setTimeout(()=>{timedOut=true;controller.abort()},10000);
  try{
   let response:Response;
   try{response=await fetcher(root+path,{method,body:body===undefined?undefined:JSON.stringify(body),
      headers:{Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},
      signal:controller.signal});}
   catch(e){
    if(signal?.aborted)throw e;
    throw new ApiError(timedOut?'TIMEOUT':'NETWORK',timedOut?'서버 응답이 지연되고 있습니다':'서버에 연결할 수 없습니다');
   }
   const payload:unknown=await response.json().catch(()=>null);
   if(!response.ok){
    const err=isObject(payload)?payload:{};
    throw new ApiError('HTTP',typeof err.title==='string'?err.title:'요청에 실패했습니다',response.status,
      typeof err.code==='string'?err.code:undefined);
   }
   return payload;
  }finally{clearTimeout(timeout);signal?.removeEventListener('abort',cancel);}
 };
 return {
  list:async(query:{q?:string;channel?:Channel;cursor?:string;limit?:number}={},signal?:AbortSignal)=>{
   const qs=new URLSearchParams();
   if(query.q?.trim())qs.set('q',query.q.trim());
   if(query.channel)qs.set('channel',query.channel);
   if(query.cursor)qs.set('cursor',query.cursor);
   qs.set('limit',String(query.limit??20));
   return parsePage(await call('/api/v1/products?'+qs.toString(),{signal}));
  },
  product:async(id:string,signal?:AbortSignal)=>{
   const raw=await call('/api/v1/products/'+encodeURIComponent(id),{signal});
   if(!isObject(raw))throw new ApiError('CONTRACT','상품 상세 응답이 올바르지 않습니다');
   return parseProduct(raw.data);
  },
  availability:async(id:string,startDate:string,returnDate:string,signal?:AbortSignal)=>{
   const qs=new URLSearchParams({startDate,returnDate});
   return parseAvailability(await call('/api/v1/products/'+encodeURIComponent(id)+'/availability?'+qs.toString(),{signal}));
  },
  quote:async(input:{productId:string;startDate:string;returnDate:string},signal?:AbortSignal)=>
   parseQuote(await call('/api/v1/rentals/quote',{method:'POST',body:input,signal}))
 };
}
export function configuredApi(){
 const url=apiBaseUrl();
 if(!url)throw new ApiError('CONFIG','API 주소가 설정되지 않았습니다');
 return createApiClient(url);
}
