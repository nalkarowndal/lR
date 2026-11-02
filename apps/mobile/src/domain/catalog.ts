export type Channel='RENTAL'|'STORE';
export type ProductArt='#FDF2F8'|'#EFF6FF'|'#F0FDF4'|'#F3F4F6';
export interface Product {
  id:string;brand:string;title:string;category:string;
  dayRateKrw:number;salePriceKrw:number;depositKrw:number;
  condition:string;art:ProductArt;channels:Channel[];demo:boolean;
}
// Original M2 synthetic products, used ONLY when no EXPO_PUBLIC_API_URL is configured.
// Real API failures must never silently fall back to these items.
export const products:Product[]=[
 {id:'demo-bag-01',brand:'DEMO',title:'The Sera Top Handle',category:'토트백',dayRateKrw:28000,salePriceKrw:900000,depositKrw:100000,condition:'A',art:'#FDF2F8',channels:['RENTAL','STORE'],demo:true},
 {id:'demo-bag-02',brand:'DEMO',title:'The Lune Shoulder Bag',category:'숄더백',dayRateKrw:32000,salePriceKrw:1180000,depositKrw:120000,condition:'A',art:'#EFF6FF',channels:['RENTAL','STORE'],demo:true},
 {id:'demo-bag-03',brand:'DEMO',title:'The Marais Mini',category:'크로스백',dayRateKrw:22000,salePriceKrw:560000,depositKrw:80000,condition:'B',art:'#F0FDF4',channels:['RENTAL','STORE'],demo:true},
 {id:'demo-bag-04',brand:'DEMO',title:'The Atelier Bucket',category:'버킷백',dayRateKrw:19000,salePriceKrw:480000,depositKrw:80000,condition:'A',art:'#F3F4F6',channels:['RENTAL','STORE'],demo:true}
];
export const findProduct=(id:string)=>products.find(item=>item.id===id);
export const isDemo=true;
