/** M5-2C2. ADMIN GET-only, isolated lr_test; no real transaction access. */
import type{Express,Request,Response,NextFunction} from 'express';
import {z} from 'zod';
import type{Database} from './db.js';
import {requireAuth,requireRole} from './auth.js';
import {problem} from './problem.js';
import {getAdminDemoOrder,listAdminDemoOrders} from './demo-order-admin.js';

const filter=z.object({
 orderId:z.uuid().optional(),
 status:z.enum(['PENDING_SIMULATION','SIMULATED_PAID','FAILED','CANCELED','REVIEW_REQUIRED']).optional(),
 limit:z.coerce.number().int().min(1).max(50).default(20),
 offset:z.coerce.number().int().min(0).max(1000).default(0)
}).strict();
const idParam=z.object({id:z.uuid()}).strict();
const disclaimer='테스트 DB에서 만든 모의 주문 원장입니다. 실제 결제·예약·배송 또는 고객 주문이 아닙니다.';
export function mountAdminDemoOrderRoutes(app:Express,db:Database,{demoMode}:{demoMode:boolean}){
 const gate=(req:Request,res:Response,next:NextFunction)=>{
  if(!demoMode||process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test'){
   problem(req,res,501,'NOT_IMPLEMENTED','테스트용 관리자 원장 조회는 비활성화되어 있습니다');return;
  }
  next();
 };
 const auth=requireAuth(db),admin=requireRole('ADMIN');
 app.use('/api/v1/admin/demo-orders',(_req,res,next)=>{
  res.setHeader('Cache-Control','no-store');next();
 });
 app.get('/api/v1/admin/demo-orders',gate,auth,admin,async(req,res)=>{
  const q=filter.parse(req.query);
  const orders=await listAdminDemoOrders(db,q);
  res.json({data:orders,meta:{requestId:res.locals.requestId,
   demo:true,disclaimer,page:{limit:q.limit,offset:q.offset}}});
 });
 app.get('/api/v1/admin/demo-orders/:id',gate,auth,admin,async(req,res)=>{
  const {id}=idParam.parse(req.params);
  const order=await getAdminDemoOrder(db,id);
  if(!order){problem(req,res,404,'NOT_FOUND','모의 주문 내역을 찾을 수 없습니다');return;}
  res.json({data:order,meta:{requestId:res.locals.requestId,demo:true,disclaimer}});
 });
}
