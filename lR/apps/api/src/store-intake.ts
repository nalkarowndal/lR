/** M5-2C4-B: non-financial STORE order intake in isolated lr_test. */
import {createHash,randomUUID} from 'node:crypto';
import type{RowDataPacket} from 'mysql2';
import type{Database} from './db.js';
export type StorePaymentMethod='CARD'|'TRANSFER'|'EASY_PAY';
export type StoreDeliveryMethod='COURIER'|'PICKUP';
export type StoreDeliveryPreset='SAMPLE_SEOUL'|'SHOWROOM';
export interface StoreOrderInput{
 productIds:string[];
 paymentMethod:StorePaymentMethod;
 deliveryMethod:StoreDeliveryMethod;
 deliveryPreset:StoreDeliveryPreset;
}
export interface StoreOrderItem{
 productId:string;title:string;unitPriceKrw:number;quantity:1;lineTotalKrw:number;
}
export interface StoreOrder{
 orderId:string;channel:'STORE';items:StoreOrderItem[];totalKrw:number;
 paymentMethod:StorePaymentMethod;deliveryMethod:StoreDeliveryMethod;deliveryPreset:StoreDeliveryPreset;
 status:'RECEIVED';paymentStatus:'NOT_CHARGED';createdAt:string;demo:true;
}
export class StoreOrderError extends Error{
 constructor(readonly code:'IDEMPOTENCY_KEY_REUSED'|'PRODUCT_UNAVAILABLE'|'INVENTORY_CONFLICT'){
  super(code);this.name='StoreOrderError';
 }
}
interface HeaderRow extends RowDataPacket{
 orderId:string;paymentMethod:StorePaymentMethod;
 deliveryMethod:StoreDeliveryMethod;deliveryPreset:StoreDeliveryPreset;
 totalKrw:string|number;status:string;paymentStatus:string;
 inputFingerprint:string;createdAt:string;
}
interface ItemRow extends RowDataPacket{
 productId:string;title:string;unitPriceKrw:string|number;quantity:number;
}
interface OfferRow extends RowDataPacket{
 id:string;title:string;price:string|number;
}
interface UnitRow extends RowDataPacket{id:string}
const guarded=()=>{
 if(process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test')
  throw new Error('STORE intake requires isolated lr_test');
};
const amount=(value:string|number)=>{
 const number=Number(value);
 if(!Number.isSafeInteger(number)||number<0)throw new Error('invalid STORE amount');
 return number;
};
const projection=`SELECT id AS orderId,payment_method AS paymentMethod,delivery_method AS deliveryMethod,
 delivery_preset AS deliveryPreset,total_krw AS totalKrw,status,payment_status AS paymentStatus,
 input_fingerprint AS inputFingerprint,created_at AS createdAt FROM lr_portfolio_store_orders`;
async function loadItems(db:Pick<Database,'execute'>,orderId:string):Promise<StoreOrderItem[]>{
 const [rows]=await db.execute<ItemRow[]>(`SELECT product_id AS productId,title_snapshot AS title,
 unit_price_krw AS unitPriceKrw,quantity FROM lr_portfolio_store_order_items
 WHERE order_id=? ORDER BY product_id ASC`,[orderId]);
 return rows.map(r=>{
  const unitPriceKrw=amount(r.unitPriceKrw);
  if(r.quantity!==1)throw new Error('invalid STORE item quantity');
  return {productId:r.productId,title:r.title,unitPriceKrw,quantity:1 as const,lineTotalKrw:unitPriceKrw};
 });
}
async function normalized(db:Pick<Database,'execute'>,row:HeaderRow):Promise<StoreOrder>{
 const items=await loadItems(db,row.orderId);
 const totalKrw=amount(row.totalKrw);
 const summed=items.reduce((value,item)=>value+item.lineTotalKrw,0);
 if(items.length<1||items.length>10||!Number.isSafeInteger(summed)||summed!==totalKrw||
  row.status!=='RECEIVED'||row.paymentStatus!=='NOT_CHARGED')
  throw new Error('invalid persisted STORE receipt');
 return {orderId:row.orderId,channel:'STORE',items,totalKrw,
  paymentMethod:row.paymentMethod,deliveryMethod:row.deliveryMethod,
  deliveryPreset:row.deliveryPreset,status:'RECEIVED',paymentStatus:'NOT_CHARGED',
  demo:true,createdAt:String(row.createdAt)};
}
const hashInput=(input:StoreOrderInput)=>createHash('sha256')
 .update(JSON.stringify({...input,productIds:[...input.productIds].sort()})).digest('hex');
export async function receiveStoreOrder(db:Database,input:StoreOrderInput,actorId:string,key:string):
 Promise<{order:StoreOrder;replayed:boolean}>{
 guarded();
 const products=[...input.productIds].sort(),fp=hashInput(input),orderId=randomUUID();
 const conn=await db.getConnection();
 try{
  await conn.beginTransaction();
  // Serializes the same account's submissions and retries (also prevents concurrent duplicate keys).
  await conn.execute('SELECT id FROM lr_users WHERE id=? AND status=? FOR UPDATE',[actorId,'ACTIVE']);
  const [prior]=await conn.execute<HeaderRow[]>(`${projection} WHERE actor_id=? AND idempotency_key=? LIMIT 1`,[actorId,key]);
  if(prior[0]){
   if(prior[0].inputFingerprint!==fp)throw new StoreOrderError('IDEMPOTENCY_KEY_REUSED');
   const order=await normalized(conn,prior[0]);
   await conn.commit();return {order,replayed:true};
  }
  const items:StoreOrderItem[]=[];
  let totalKrw=0;
  // Deterministic locking avoids deadlocks; any invalid line rejects the entire request.
  for(const id of products){
   const [offers]=await conn.execute<OfferRow[]>(`SELECT p.id,p.title,o.sale_price_krw AS price
    FROM lr_products p JOIN lr_product_offers o ON o.product_id=p.id
    WHERE p.id=? AND p.published=1 AND p.is_demo=1
    AND o.channel='STORE' AND o.is_active=1 LIMIT 1 FOR UPDATE`,[id]);
   if(!offers[0])throw new StoreOrderError('PRODUCT_UNAVAILABLE');
   const [units]=await conn.execute<UnitRow[]>(`SELECT u.id FROM lr_inventory_units u
    WHERE u.product_id=? AND u.physical_state='READY'
    AND NOT EXISTS(SELECT 1 FROM lr_inventory_holds h
      WHERE h.unit_id=u.id AND h.status='ACTIVE' AND h.expires_at>UTC_TIMESTAMP(3))
    AND NOT EXISTS(SELECT 1 FROM lr_rentals r
      WHERE r.unit_id=u.id AND r.status NOT IN ('CANCELED','COMPLETED'))
    ORDER BY u.id LIMIT 1 FOR UPDATE`,[id]);
   if(!units.length)throw new StoreOrderError('INVENTORY_CONFLICT');
   const unitPriceKrw=amount(offers[0].price);
   totalKrw+=unitPriceKrw;
   if(!Number.isSafeInteger(totalKrw))throw new Error('invalid total');
   items.push({productId:id,title:offers[0].title,unitPriceKrw,quantity:1,lineTotalKrw:unitPriceKrw});
  }
  await conn.execute(`INSERT INTO lr_portfolio_store_orders
    (id,actor_id,payment_method,delivery_method,delivery_preset,total_krw,idempotency_key,input_fingerprint)
    VALUES(?,?,?,?,?,?,?,?)`,[
    orderId,actorId,input.paymentMethod,input.deliveryMethod,input.deliveryPreset,totalKrw,key,fp
  ]);
  for(const item of items)
   await conn.execute(`INSERT INTO lr_portfolio_store_order_items
    (order_id,product_id,title_snapshot,unit_price_krw,quantity) VALUES(?,?,?,?,1)`,
    [orderId,item.productId,item.title,item.unitPriceKrw]);
  const [created]=await conn.execute<HeaderRow[]>(`${projection} WHERE id=?`,[orderId]);
  const order=await normalized(conn,created[0]);
  await conn.commit();
  return {order,replayed:false};
 }catch(e){await conn.rollback();throw e;}finally{conn.release();}
}
export async function listStoreOrders(db:Database,opts:{actorId?:string;limit:number;offset:number}):Promise<StoreOrder[]>{
 guarded();
 const where=opts.actorId?' WHERE actor_id=?':'';
 const [rows]=await db.execute<HeaderRow[]>(`${projection}${where} ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?`,
  opts.actorId?[opts.actorId,opts.limit,opts.offset]:[opts.limit,opts.offset]);
 return Promise.all(rows.map(row=>normalized(db,row)));
}
export async function getOwnedStoreOrder(db:Database,actorId:string,id:string):Promise<StoreOrder|null>{
 guarded();
 const [rows]=await db.execute<HeaderRow[]>(`${projection} WHERE id=? AND actor_id=? LIMIT 1`,[id,actorId]);
 return rows[0]?normalized(db,rows[0]):null;
}
