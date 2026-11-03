/** Readable portfolio order intake; no actual PG, booking or fulfillment endpoints. */
import type{Express,Request,Response,NextFunction} from 'express';
import {z} from 'zod';
import type{Database} from './db.js';
import {getIdentity,requireAuth,requireRole} from './auth.js';
import {problem} from './problem.js';
import {receivePortfolioOrder,listPortfolioOrders,getOwnedPortfolioOrder,PortfolioOrderError} from './portfolio-orders.js';

const input=z.object({
 productId:z.string().min(1).max(40),
 startDate:z.iso.date(),returnDate:z.iso.date(),
 paymentMethod:z.enum(['CARD','TRANSFER','EASY_PAY']),
 deliveryMethod:z.enum(['COURIER','PICKUP']),
 deliveryPreset:z.enum(['SAMPLE_SEOUL','SHOWROOM'])
}).strict().refine(v=>(v.deliveryMethod==='COURIER'&&v.deliveryPreset==='SAMPLE_SEOUL')||
 (v.deliveryMethod==='PICKUP'&&v.deliveryPreset==='SHOWROOM'),{message:'수령 방법을 확인해 주세요'});
const idParam=z.object({id:z.uuid()}).strict();
const page=z.object({
 limit:z.coerce.number().int().min(1).max(50).default(20),
 offset:z.coerce.number().int().min(0).max(1000).default(0)
}).strict();
const note='포트폴리오 체험 주문으로 접수됐습니다. 실제 결제·예약 확정·배송은 진행되지 않습니다.';
export function mountPortfolioOrderRoutes(app:Express,db:Database,{demoMode}:{demoMode:boolean}){
 const gate=(req:Request,res:Response,next:NextFunction)=>{
  if(!demoMode||process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test'){
   problem(req,res,501,'NOT_IMPLEMENTED','체험 주문 접수 서비스는 비활성화되어 있습니다');return;
  }
  next();
 };
 const auth=requireAuth(db),admin=requireRole('ADMIN');
 app.use(['/api/v1/experience/orders','/api/v1/admin/experience/orders'],(_req,res,next)=>{
  res.setHeader('Cache-Control','no-store');next();
 });
 app.post('/api/v1/experience/orders',gate,auth,async(req,res)=>{
  const orderInput=input.parse(req.body);
  const key=req.get('Idempotency-Key');
  if(!key||!z.uuid().safeParse(key).success){
   problem(req,res,422,'VALIDATION_ERROR','Idempotency-Key UUID가 필요합니다');return;
  }
  try{
   const {order,replayed}=await receivePortfolioOrder(db,orderInput,getIdentity(res).userId,key);
   res.setHeader('Location','/api/v1/experience/orders/'+order.orderId);
   res.status(replayed?200:201).json({data:order,meta:{
    requestId:res.locals.requestId,replayed,demo:true,disclaimer:note}});
  }catch(e){
   if(e instanceof PortfolioOrderError){
    problem(req,res,409,e.code,e.code==='INVENTORY_CONFLICT'?'선택한 기간에 사용 가능한 상품이 없습니다':
      e.code==='IDEMPOTENCY_KEY_REUSED'?'다른 주문에는 새 요청번호를 사용해 주세요':
      '주문 내용이나 날짜를 확인해 주세요');return;
   }
   throw e;
  }
 });
 app.get('/api/v1/experience/orders',gate,auth,async(req,res)=>{
  const q=page.parse(req.query);
  const orders=await listPortfolioOrders(db,{actorId:getIdentity(res).userId,...q});
  res.json({data:orders,meta:{requestId:res.locals.requestId,demo:true,disclaimer:note,page:q}});
 });
 app.get('/api/v1/experience/orders/:id',gate,auth,async(req,res)=>{
  const {id}=idParam.parse(req.params);
  const order=await getOwnedPortfolioOrder(db,getIdentity(res).userId,id);
  if(!order){problem(req,res,404,'NOT_FOUND','주문 접수 기록을 찾지 못했습니다');return;}
  res.json({data:order,meta:{requestId:res.locals.requestId,demo:true,disclaimer:note}});
 });
 app.get('/api/v1/admin/experience/orders',gate,auth,admin,async(req,res)=>{
  const q=page.parse(req.query);
  const orders=await listPortfolioOrders(db,q);
  res.json({data:orders,meta:{requestId:res.locals.requestId,demo:true,disclaimer:note,page:q}});
 });
}
