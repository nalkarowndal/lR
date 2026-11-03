import type{RowDataPacket} from 'mysql2';
import type{Database} from './db.js';
import {approvedProductMedia,type PublishedMedia} from './media-rights.js';
import {generatedDemoMedia} from './generated-demo-media.js';
export type Channel='RENTAL'|'STORE';
export interface ProductDto{
 id:string;title:string;brand:string;category:string;condition:string;
 channels:Channel[];dayRateKrw:number|null;salePriceKrw:number|null;depositKrw:number;demo:boolean;media:PublishedMedia[];
 offers:Array<{channel:Channel;dayRateKrw:number|null;salePriceKrw:number|null;depositKrw:number}>;
}
interface IdRow extends RowDataPacket{id:string}
interface OfferRow extends RowDataPacket{
 id:string;title:string;brand:string;category:string;condition_grade:string;is_demo:number;
 channel:Channel|null;day_rate_krw:string|null;sale_price_krw:string|null;deposit_krw:string|null;
}
const exactAmount=(value:string|null):number|null=>{
 if(value===null)return null;
 const parsed=Number(value);
 if(!Number.isSafeInteger(parsed)||parsed<0)throw new Error('KRW amount not representable safely');
 return parsed;
};
export async function getProducts(db:Database,ids:string[]):Promise<ProductDto[]>{
 if(ids.length===0)return [];
 const bind=ids.map(()=>'?').join(',');
 const [rows]=await db.execute<OfferRow[]>(`SELECT p.id,p.title,p.brand,p.category,p.condition_grade,p.is_demo,
 o.channel,o.day_rate_krw,o.sale_price_krw,o.deposit_krw
 FROM lr_products p LEFT JOIN lr_product_offers o ON o.product_id=p.id AND o.is_active=1
 WHERE p.published=1 AND p.id IN (${bind}) ORDER BY p.id,o.channel`,ids);
 const products=new Map<string,ProductDto>();
 for(const row of rows){
  let dto=products.get(row.id);
  if(!dto){
   dto={id:row.id,title:row.title,brand:row.brand,category:row.category,condition:row.condition_grade,
    channels:[],dayRateKrw:null,salePriceKrw:null,depositKrw:0,demo:!!row.is_demo,media:[],offers:[]};
   products.set(row.id,dto);
  }
  if(row.channel){
   const dayRateKrw=exactAmount(row.day_rate_krw),salePriceKrw=exactAmount(row.sale_price_krw),
    depositKrw=exactAmount(row.deposit_krw)??0;
   dto.channels.push(row.channel);
   dto.offers.push({channel:row.channel,dayRateKrw,salePriceKrw,depositKrw});
   if(row.channel==='RENTAL'){dto.dayRateKrw=dayRateKrw;dto.depositKrw=depositKrw;}
   if(row.channel==='STORE')dto.salePriceKrw=salePriceKrw;
  }
 }
 const approved=await approvedProductMedia(db,ids);
 for(const [id,product] of products)product.media=[...generatedDemoMedia(id,product.demo),...(approved.get(id)||[])].slice(0,8);
 return ids.flatMap(id=>products.has(id)?[products.get(id)!]:[]);
}
export async function listProducts(db:Database,opts:{
 q?:string;brand?:string;category?:string;channel?:Channel;cursor?:string;limit:number
}):Promise<{products:ProductDto[],nextCursor:string|null,hasNext:boolean}>{
 const predicates=['p.published=1'];const args:(string|number)[]=[];
 if(opts.q){predicates.push('(p.title LIKE ? OR p.brand LIKE ? OR p.category LIKE ?)');const match='%'+opts.q+'%';args.push(match,match,match);}
 if(opts.brand){predicates.push('p.brand=?');args.push(opts.brand);}
 if(opts.category){predicates.push('p.category=?');args.push(opts.category);}
 if(opts.channel){predicates.push("EXISTS (SELECT 1 FROM lr_product_offers o WHERE o.product_id=p.id AND o.channel=? AND o.is_active=1)");args.push(opts.channel);}
 if(opts.cursor){predicates.push('p.id>?');args.push(opts.cursor);}
 const [ids]=await db.execute<IdRow[]>(`SELECT p.id FROM lr_products p WHERE ${predicates.join(' AND ')} ORDER BY p.id ASC LIMIT ?`,[...args,opts.limit+1]);
 const hasNext=ids.length>opts.limit;const chosen=ids.slice(0,opts.limit).map(x=>x.id);
 const products=await getProducts(db,chosen);
 return {products,hasNext,nextCursor:hasNext?chosen.at(-1)??null:null};
}
export async function getProduct(db:Database,id:string):Promise<ProductDto|null>{
 return (await getProducts(db,[id]))[0]??null;
}
interface CountRow extends RowDataPacket{unitCount:number|string}
export async function getAvailability(db:Database,productId:string,startDate:string,returnDate:string):Promise<number>{
 const [rows]=await db.execute<CountRow[]>(`
 SELECT COUNT(*) AS unitCount FROM lr_inventory_units u
 WHERE u.product_id=? AND u.physical_state='READY'
 AND NOT EXISTS (
  SELECT 1 FROM lr_inventory_holds h WHERE h.unit_id=u.id AND h.status='ACTIVE'
   AND h.expires_at>UTC_TIMESTAMP(3)
   AND (h.kind='SALE' OR (h.blocked_start_date < ? AND h.blocked_end_exclusive > ?))
 )
 AND NOT EXISTS (
  SELECT 1 FROM lr_rentals r WHERE r.unit_id=u.id AND r.status NOT IN ('CANCELED','COMPLETED')
   AND r.blocked_start_date < ? AND r.blocked_end_exclusive > ?
 )`,[productId,returnDate,startDate,returnDate,startDate]);
 return Number(rows[0]?.unitCount??0);
}
