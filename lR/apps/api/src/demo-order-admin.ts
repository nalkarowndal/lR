/**
 * M5-2C2: read-only test ledger projection for ADMIN.
 * The source is the isolated lr_test internal mock payment ledger, NEVER the
 * M5-2C1 client-side mock receipts; no real orders, payment IDs or PII.
 */
import type{RowDataPacket} from 'mysql2';
import type{Database} from './db.js';
import {rentalDays} from './date.js';

export type AdminDemoStatus='PENDING_SIMULATION'|'SIMULATED_PAID'|'FAILED'|'CANCELED'|'REVIEW_REQUIRED';
export interface AdminDemoOrder{
 orderId:string;productId:string;title:string;startDate:string;returnDate:string;
 rentalDays:number;rentalFeeKrw:number;depositKrw:number;payableKrw:number;
 status:AdminDemoStatus;policyVersion:'demo-only';createdAt:string;demo:true;
}
export interface AdminDemoAudit{action:string;createdAt:string}
export interface AdminDemoEvent{status:string;resultStatus:string;verifiedAmountKrw:number;createdAt:string}
interface OrderRow extends RowDataPacket {
 orderId:string;productId:string;title:string;startDate:string;returnDate:string;
 rentalFeeKrw:number|string;depositKrw:number|string;payableKrw:number|string;
 status:AdminDemoStatus;policyVersion:'demo-only';createdAt:string
}
interface AuditRow extends RowDataPacket {action:string;createdAt:string}
interface EventRow extends RowDataPacket {
 status:string;resultStatus:string;verifiedAmountKrw:number|string;createdAt:string
}
const money=(v:string|number)=>{
 const n=typeof v==='string'&&/^\d+$/.test(v)?Number(v):v;
 if(typeof n!=='number'||!Number.isSafeInteger(n)||n<0)throw new Error('corrupt test ledger amount');
 return n;
};
function testOnly(){
 if(process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test')
  throw new Error('test-only admin demo ledger cannot be queried here');
}
const columns=`o.id AS orderId,u.product_id AS productId,p.title,
 h.blocked_start_date AS startDate,h.blocked_end_exclusive AS returnDate,
 o.rental_fee_krw AS rentalFeeKrw,o.deposit_krw AS depositKrw,
 o.payable_krw AS payableKrw,o.status,o.policy_version AS policyVersion,
 o.created_at AS createdAt`;
const from=` FROM lr_demo_orders o
 JOIN lr_inventory_holds h ON h.id=o.hold_id AND h.kind='RENTAL'
 JOIN lr_inventory_units u ON u.id=o.unit_id AND u.id=h.unit_id
 JOIN lr_products p ON p.id=u.product_id AND p.is_demo=1
 WHERE o.policy_version='demo-only'`;
function normalize(row:OrderRow):AdminDemoOrder{
 const days=rentalDays(row.startDate,row.returnDate);
 const rentalFeeKrw=money(row.rentalFeeKrw),depositKrw=money(row.depositKrw);
 const payableKrw=money(row.payableKrw);
 if(days===null||!Number.isSafeInteger(rentalFeeKrw+depositKrw)||
   rentalFeeKrw+depositKrw!==payableKrw)throw new Error('corrupt test ledger record');
 return {orderId:row.orderId,productId:row.productId,title:row.title,
  startDate:row.startDate,returnDate:row.returnDate,rentalDays:days,
  rentalFeeKrw,depositKrw,payableKrw,status:row.status,
  policyVersion:'demo-only',createdAt:String(row.createdAt),demo:true};
}
export async function listAdminDemoOrders(db:Database,input:{
 orderId?:string;status?:AdminDemoStatus;limit:number;offset:number
}):Promise<AdminDemoOrder[]>{
 testOnly();
 const where:string[]=[];const params:Array<string|number>=[];
 if(input.orderId){where.push('o.id=?');params.push(input.orderId);}
 if(input.status){where.push('o.status=?');params.push(input.status);}
 const condition=where.length?' AND '+where.join(' AND '):'';
 const [rows]=await db.execute<OrderRow[]>(`SELECT ${columns}${from}${condition}
 ORDER BY o.created_at DESC,o.id DESC LIMIT ? OFFSET ?`,
 [...params,input.limit,input.offset]);
 return rows.map(normalize);
}
export async function getAdminDemoOrder(db:Database,orderId:string):Promise<
 (AdminDemoOrder&{audit:AdminDemoAudit[];events:AdminDemoEvent[]})|null
>{
 testOnly();
 const [rows]=await db.execute<OrderRow[]>(`SELECT ${columns}${from} AND o.id=? LIMIT 1`,[orderId]);
 if(!rows[0])return null;
 const [auditRows]=await db.execute<AuditRow[]>(`SELECT action,created_at AS createdAt
 FROM lr_demo_payment_audit WHERE order_id=? ORDER BY id ASC LIMIT 100`,[orderId]);
 const [eventRows]=await db.execute<EventRow[]>(`SELECT status,result_status AS resultStatus,
 verified_amount_krw AS verifiedAmountKrw,created_at AS createdAt
 FROM lr_demo_payment_events WHERE order_id=?
 ORDER BY created_at ASC,event_id ASC LIMIT 100`,[orderId]);
 return {...normalize(rows[0]),
  audit:auditRows.map(a=>({action:a.action,createdAt:String(a.createdAt)})),
  events:eventRows.map(e=>({status:e.status,resultStatus:e.resultStatus,
   verifiedAmountKrw:money(e.verifiedAmountKrw),createdAt:String(e.createdAt)}))
 };
}
