import type{Channel,Product} from './catalog';
export type SortMode='RECOMMENDED'|'PRICE_ASC'|'PRICE_DESC';
export interface DiscoveryFilter{channel:Channel;category:string;condition:string;sort:SortMode}
export function filterVisibleProducts(items:readonly Product[],filter:DiscoveryFilter):Product[]{
 const price=(p:Product)=>filter.channel==='STORE'?p.salePriceKrw:p.dayRateKrw;
 const subset=items.filter(p=>p.channels.includes(filter.channel)&&
  (filter.category==='ALL'||p.category===filter.category)&&
  (filter.condition==='ALL'||p.condition===filter.condition));
 if(filter.sort==='RECOMMENDED')return subset;
 return subset.map((p,i)=>({p,i})).sort((a,b)=>(
  (price(a.p)-price(b.p))*(filter.sort==='PRICE_ASC'?1:-1)||a.i-b.i
 )).map(({p})=>p);
}
export function visibleCategories(items:readonly Product[]):string[]{
 return [...new Set(items.map(p=>p.category))].sort((a,b)=>a.localeCompare(b,'ko'));
}
