/** M3.3 demo-only authenticated hold endpoints; never imply paid/confirmed rentals. */
import type{Express,Request,Response,NextFunction} from 'express';
import type{RowDataPacket} from 'mysql2';
import {z} from 'zod';
import type{Database} from './db.js';
import {getIdentity,requireAuth} from './auth.js';
import {getProduct} from './products.js';
import {rentalDays} from './date.js';
import {HoldConflictError,acquireInventoryHold,releaseInventoryHold} from './holds.js';
import {problem} from './problem.js';

const bodySchema=z.object({
 productId:z.string().min(1).max(40),
 startDate:z.iso.date(),
 returnDate:z.iso.date()
}).strict();
const holdIdSchema=z.object({id:z.uuid()});
interface HoldRow extends RowDataPacket{
 id:string;checkout_id:string;product_id:string;blocked_start_date:string;
 blocked_end_exclusive:string;expires_at:Date|string;
 status:'ACTIVE'|'EXPIRED'|'RELEASED'|'CONSUMED';is_expired:number
}
const iso=(v:string|Date)=>v instanceof Date?v.toISOString():new Date(v.replace(' ','T')+'Z').toISOString();
async function findOwned(db:Database,actorId:string,holdId:string){
 const [rows]=await db.execute<HoldRow[]>(`SELECT h.id,h.checkout_id,u.product_id,
 h.blocked_start_date,h.blocked_end_exclusive,h.expires_at,h.status,
 (h.expires_at<=UTC_TIMESTAMP(3)) AS is_expired
 FROM lr_inventory_holds h JOIN lr_inventory_units u ON u.id=h.unit_id
 JOIN lr_hold_requests r ON r.hold_id=h.id
 WHERE h.id=? AND r.actor_id=? AND h.kind='RENTAL' LIMIT 1`,[holdId,actorId]);
 return rows[0]??null;
}
const response=(h:HoldRow)=>({
 holdId:h.id,checkoutId:h.checkout_id,productId:h.product_id,
 startDate:h.blocked_start_date,returnDate:h.blocked_end_exclusive,
 status:h.status==='ACTIVE'&&Number(h.is_expired)>0?'EXPIRED':h.status,
 expiresAt:iso(h.expires_at),demo:true,
 disclaimer:'테스트용 재고 홀드이며 실제 예약·결제·배송을 생성하지 않습니다.'
});
export function mountRentalHoldRoutes(app:Express,db:Database,{demoMode}:{demoMode:boolean}){
 const auth=requireAuth(db);
 const gate=(req:Request,res:Response,next:NextFunction)=>{
  if(!demoMode){problem(req,res,501,'NOT_IMPLEMENTED','상용 예약 홀드는 비활성화되어 있습니다');return;}
  next();
 };
 app.post('/api/v1/rental-holds',gate,auth,async(req,res)=>{
  const data=bodySchema.parse(req.body);
  if(rentalDays(data.startDate,data.returnDate)===null){
   problem(req,res,422,'VALIDATION_ERROR','날짜 범위를 확인해 주세요');return;
  }
  const key=req.get('Idempotency-Key');
  if(!key||!z.uuid().safeParse(key).success){
   problem(req,res,422,'VALIDATION_ERROR','유효한 Idempotency-Key UUID가 필요합니다');return;
  }
  const product=await getProduct(db,data.productId);
  if(!product){problem(req,res,404,'NOT_FOUND','상품을 확인할 수 없습니다');return;}
  if(!product.demo||!product.channels.includes('RENTAL')){
   problem(req,res,422,'VALIDATION_ERROR','현재 테스트용 렌탈 상품만 지원합니다');return;
  }
  try{
   const result=await acquireInventoryHold(db,{
    actorId:getIdentity(res).userId,idempotencyKey:key,productId:product.id,
    kind:'RENTAL',startDate:data.startDate,returnDate:data.returnDate
   });
   const owned=await findOwned(db,getIdentity(res).userId,result.holdId);
   if(!owned)throw new Error('newly created hold could not be read');
   res.setHeader('Cache-Control','no-store');
   res.setHeader('Location','/api/v1/rental-holds/'+result.holdId);
   res.status(result.replayed?200:201).json({data:{...response(owned),replayed:result.replayed},meta:{requestId:res.locals.requestId}});
  }catch(error){
   if(error instanceof HoldConflictError){
    const status=error.code==='INVENTORY_CONFLICT'||error.code==='IDEMPOTENCY_KEY_REUSED'?409:422;
    problem(req,res,status,error.code,status===409?'예약 요청이 충돌했습니다':'예약 요청이 유효하지 않습니다');return;
   }
   throw error;
  }
 });
 app.get('/api/v1/rental-holds/:id',gate,auth,async(req,res)=>{
  const {id}=holdIdSchema.parse(req.params);
  const owned=await findOwned(db,getIdentity(res).userId,id);
  if(!owned){problem(req,res,404,'NOT_FOUND','홀드를 찾을 수 없습니다');return;}
  res.setHeader('Cache-Control','no-store');
  res.json({data:response(owned),meta:{requestId:res.locals.requestId}});
 });
 app.delete('/api/v1/rental-holds/:id',gate,auth,async(req,res)=>{
  const {id}=holdIdSchema.parse(req.params);
  const owned=await findOwned(db,getIdentity(res).userId,id);
  if(!owned){problem(req,res,404,'NOT_FOUND','홀드를 찾을 수 없습니다');return;}
  if(owned.status==='ACTIVE'){
   await releaseInventoryHold(db,id);
  }
  res.status(204).end();
 });
}
