/**
 * M5-2C3: genuine API-persisted portfolio order INTAKE, not a financial order.
 * Isolated lr_test records; never consumes inventory, charges money or creates a rental.
 */
import {createHash,randomUUID} from 'node:crypto';
import type{RowDataPacket} from 'mysql2';
import type{Database} from './db.js';
import {getAvailability,getProduct} from './products.js';
import {rentalDays} from './date.js';

export type PaymentMethod='CARD'|'TRANSFER'|'EASY_PAY';
export type DeliveryMethod='COURIER'|'PICKUP';
export type DeliveryPreset='SAMPLE_SEOUL'|'SHOWROOM';
export type PortfolioInput={
 productId:string;startDate:string;returnDate:string;
 paymentMethod:PaymentMethod;deliveryMethod:DeliveryMethod;deliveryPreset:DeliveryPreset;
};
export class PortfolioOrderError extends Error {
 constructor(readonly code:'INVENTORY_CONFLICT'|'IDEMPOTENCY_KEY_REUSED'|'PRODUCT_UNAVAILABLE'|'INVALID_DATES'){
  super(code);this.name='PortfolioOrderError';
 }
}
export interface PortfolioOrder{
 orderId:string;productId:string;title:string;startDate:string;returnDate:string;rentalDays:number;
 paymentMethod:PaymentMethod;deliveryMethod:DeliveryMethod;deliveryPreset:DeliveryPreset;
 rentalFeeKrw:number;depositKrw:number;payableKrw:number;
 status:'RECEIVED';paymentStatus:'NOT_CHARGED';demo:true;createdAt:string;
}
interface OrderRow extends RowDataPacket{
 orderId:string;productId:string;title:string;startDate:string;returnDate:string;
 paymentMethod:PaymentMethod;deliveryMethod:DeliveryMethod;deliveryPreset:DeliveryPreset;
 rentalFeeKrw:number|string;depositKrw:number|string;payableKrw:number|string;
 status:'RECEIVED';paymentStatus:'NOT_CHARGED';inputFingerprint:string;createdAt:string;
}
const guarded=()=>{
 if(process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test')
  throw new Error('portfolio order intake requires isolated lr_test');
};
const money=(v:number|string):number=>{
 const n=typeof v==='string'&&/^\d+$/.test(v)?Number(v):v;
 if(typeof n!=='number'||!Number.isSafeInteger(n)||n<0)throw new Error('invalid test order amount');
 return n;
};
const select=`SELECT o.id AS orderId,o.product_id AS productId,p.title,
 o.start_date AS startDate,o.return_date AS returnDate,
 o.payment_method AS paymentMethod,o.delivery_method AS deliveryMethod,
 o.delivery_preset AS deliveryPreset,o.rental_fee_krw AS rentalFeeKrw,
 o.deposit_krw AS depositKrw,o.payable_krw AS payableKrw,
 o.status,o.payment_status AS paymentStatus,o.input_fingerprint AS inputFingerprint,
 o.created_at AS createdAt
 FROM lr_portfolio_orders o JOIN lr_products p ON p.id=o.product_id`;
const normalized=(r:OrderRow):PortfolioOrder=>{
 const days=rentalDays(r.startDate,r.returnDate);
 const rentalFeeKrw=money(r.rentalFeeKrw),depositKrw=money(r.depositKrw),
  payableKrw=money(r.payableKrw);
 if(days===null||!Number.isSafeInteger(rentalFeeKrw+depositKrw)||
  rentalFeeKrw+depositKrw!==payableKrw||r.status!=='RECEIVED'||r.paymentStatus!=='NOT_CHARGED')
  throw new Error('invalid persisted nonfinancial order');
 return {orderId:r.orderId,productId:r.productId,title:r.title,
  startDate:r.startDate,returnDate:r.returnDate,rentalDays:days,
  paymentMethod:r.paymentMethod,deliveryMethod:r.deliveryMethod,
  deliveryPreset:r.deliveryPreset,rentalFeeKrw,depositKrw,payableKrw,
  status:'RECEIVED',paymentStatus:'NOT_CHARGED',demo:true,createdAt:String(r.createdAt)};
};
const fingerprint=(input:PortfolioInput)=>createHash('sha256').update(JSON.stringify(input)).digest('hex');
export async function receivePortfolioOrder(db:Database,input:PortfolioInput,actorId:string,key:string):
 Promise<{order:PortfolioOrder;replayed:boolean}>{
 guarded();
 const fp=fingerprint(input),conn=await db.getConnection(),orderId=randomUUID();
 try{
  await conn.beginTransaction();
  const [prior]=await conn.execute<OrderRow[]>(`${select} WHERE o.actor_id=? AND o.idempotency_key=? FOR UPDATE`,[actorId,key]);
  if(prior[0]){
   if(prior[0].inputFingerprint!==fp)throw new PortfolioOrderError('IDEMPOTENCY_KEY_REUSED');
   await conn.commit();return {order:normalized(prior[0]),replayed:true};
  }
  const days=rentalDays(input.startDate,input.returnDate);
  if(days===null)throw new PortfolioOrderError('INVALID_DATES');
  const p=await getProduct(db,input.productId);
  if(!p||!p.demo||!p.channels.includes('RENTAL')||p.dayRateKrw===null)
   throw new PortfolioOrderError('PRODUCT_UNAVAILABLE');
  const available=await getAvailability(db,input.productId,input.startDate,input.returnDate);
  if(available<1)throw new PortfolioOrderError('INVENTORY_CONFLICT');
  const rentalFeeKrw=p.dayRateKrw*days;
  const depositKrw=p.depositKrw;
  if(!Number.isSafeInteger(rentalFeeKrw)||!Number.isSafeInteger(depositKrw)||
   !Number.isSafeInteger(rentalFeeKrw+depositKrw)||rentalFeeKrw<0||depositKrw<0)
   throw new Error('invalid server-side price');
  // Unique actor/key prevents retries and races from creating additional records.
  await conn.execute(`INSERT INTO lr_portfolio_orders
   (id,actor_id,product_id,start_date,return_date,payment_method,delivery_method,delivery_preset,
    rental_fee_krw,deposit_krw,payable_krw,idempotency_key,input_fingerprint)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE id=id`,[
     orderId,actorId,input.productId,input.startDate,input.returnDate,input.paymentMethod,
     input.deliveryMethod,input.deliveryPreset,rentalFeeKrw,depositKrw,
     rentalFeeKrw+depositKrw,key,fp
    ]);
  const [rows]=await conn.execute<OrderRow[]>(`${select} WHERE o.actor_id=? AND o.idempotency_key=? LIMIT 1`,[actorId,key]);
  if(!rows[0])throw new Error('test intake not found');
  if(rows[0].inputFingerprint!==fp)throw new PortfolioOrderError('IDEMPOTENCY_KEY_REUSED');
  await conn.commit();
  return {order:normalized(rows[0]),replayed:rows[0].orderId!==orderId};
 }catch(e){await conn.rollback();throw e;}finally{conn.release();}
}
export async function listPortfolioOrders(db:Database,input:{actorId?:string;limit:number;offset:number}):Promise<PortfolioOrder[]>{
 guarded();
 const actorClause=input.actorId?' WHERE o.actor_id=?':'';
 const [rows]=await db.execute<OrderRow[]>(`${select}${actorClause}
 ORDER BY o.created_at DESC,o.id DESC LIMIT ? OFFSET ?`,
 input.actorId?[input.actorId,input.limit,input.offset]:[input.limit,input.offset]);
 return rows.map(normalized);
}
export async function getOwnedPortfolioOrder(db:Database,actorId:string,id:string):Promise<PortfolioOrder|null>{
 guarded();
 const [rows]=await db.execute<OrderRow[]>(`${select} WHERE o.actor_id=? AND o.id=? LIMIT 1`,[actorId,id]);
 return rows[0]?normalized(rows[0]):null;
}
