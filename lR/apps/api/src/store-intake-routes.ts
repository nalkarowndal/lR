/** C4-B isolated non-financial STORE receipt API; never confirms a sale. */
import type{Express,Request,Response,NextFunction} from 'express';
import {z} from 'zod';
import type{Database} from './db.js';
import {getIdentity,requireAuth,requireRole} from './auth.js';
import {problem} from './problem.js';
import {receiveStoreOrder,getOwnedStoreOrder,listStoreOrders,StoreOrderError} from './store-intake.js';

const input=z.object({
 productIds:z.array(z.string().min(1).max(40)).min(1).max(10)
  .refine(ids=>new Set(ids).size===ids.length,{message:'중복 상품은 허용되지 않습니다'}),
 paymentMethod:z.enum(['CARD','TRANSFER','EASY_PAY']),
 deliveryMethod:z.enum(['COURIER','PICKUP']),
 deliveryPreset:z.enum(['SAMPLE_SEOUL','SHOWROOM'])
}).strict().refine(v=>(v.deliveryMethod==='COURIER'&&v.deliveryPreset==='SAMPLE_SEOUL')||
 (v.deliveryMethod==='PICKUP'&&v.deliveryPreset==='SHOWROOM'),{message:'수령 방법을 확인해 주세요'});
const params=z.object({id:z.uuid()}).strict();
const page=z.object({limit:z.coerce.number().int().min(1).max(50).default(20),
 offset:z.coerce.number().int().min(0).max(1000).default(0)}).strict();
const note='스토어 포트폴리오 주문 접수 기록입니다. 실제 결제·판매 확정·재고 홀드·배송은 발생하지 않습니다.';
export function mountStoreIntakeRoutes(app:Express,db:Database,{demoMode}:{demoMode:boolean}){
 const gate=(req:Request,res:Response,next:NextFunction)=>{
  if(!demoMode||process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test'){
   problem(req,res,501,'NOT_IMPLEMENTED','스토어 체험 접수는 비활성화되어 있습니다');return;
  }
  next();
 };
 const auth=requireAuth(db),admin=requireRole('ADMIN');
 app.use(['/api/v1/experience/store-orders','/api/v1/admin/experience/store-orders'],(_req,res,next)=>{
  res.setHeader('Cache-Control','no-store');next();
 });
 app.post('/api/v1/experience/store-orders',gate,auth,async(req,res)=>{
  const payload=input.parse(req.body),key=req.get('Idempotency-Key');
  if(!key||!z.uuid().safeParse(key).success){
   problem(req,res,422,'VALIDATION_ERROR','UUID 요청 번호를 확인해 주세요');return;
  }
  try{
   const {order,replayed}=await receiveStoreOrder(db,payload,getIdentity(res).userId,key);
   res.setHeader('Location','/api/v1/experience/store-orders/'+order.orderId);
   res.status(replayed?200:201).json({data:order,meta:{
    requestId:res.locals.requestId,demo:true,replayed,disclaimer:note}});
  }catch(e){
   if(e instanceof StoreOrderError){
    const conflict=e.code==='INVENTORY_CONFLICT'||e.code==='IDEMPOTENCY_KEY_REUSED';
    problem(req,res,conflict?409:422,
     e.code==='IDEMPOTENCY_KEY_REUSED'?'IDEMPOTENCY_KEY_REUSED':
     e.code==='INVENTORY_CONFLICT'?'INVENTORY_CONFLICT':'VALIDATION_ERROR',
     e.code==='INVENTORY_CONFLICT'?'선택한 상품 중 접수 가능한 재고가 없는 상품이 있습니다':
     e.code==='IDEMPOTENCY_KEY_REUSED'?'변경된 주문에는 새 요청번호를 사용해 주세요':
     '스토어에서 접수할 수 없는 상품이 포함되어 있습니다');return;
   }
   throw e;
  }
 });
 app.get('/api/v1/experience/store-orders',gate,auth,async(req,res)=>{
  const q=page.parse(req.query);
  const orders=await listStoreOrders(db,{actorId:getIdentity(res).userId,...q});
  res.json({data:orders,meta:{requestId:res.locals.requestId,demo:true,disclaimer:note,page:q}});
 });
 app.get('/api/v1/experience/store-orders/:id',gate,auth,async(req,res)=>{
  const {id}=params.parse(req.params),order=await getOwnedStoreOrder(db,getIdentity(res).userId,id);
  if(!order){problem(req,res,404,'NOT_FOUND','스토어 주문 접수 기록을 찾지 못했습니다');return;}
  res.json({data:order,meta:{requestId:res.locals.requestId,demo:true,disclaimer:note}});
 });
 app.get('/api/v1/admin/experience/store-orders',gate,auth,admin,async(req,res)=>{
  const q=page.parse(req.query),orders=await listStoreOrders(db,q);
  res.json({data:orders,meta:{requestId:res.locals.requestId,demo:true,disclaimer:note,page:q}});
 });
}
