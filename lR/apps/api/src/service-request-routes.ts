/** M5-3A: demo-only authenticated repair/consignment applications and ADMIN review. */
import type{Express,Request,Response,NextFunction} from 'express';
import {z} from 'zod';
import type{Database} from './db.js';
import {requireAuth,requireRole,getIdentity} from './auth.js';
import {problem} from './problem.js';
import {
 createServiceRequest,getOwnedServiceRequest,listOwnedServiceRequests,
 listAdminServiceRequests,changeServiceRequestStatus,ServiceError,
 type ServiceKind,type ServiceStatus
} from './service-requests.js';

const createBody=z.object({
 kind:z.enum(['REPAIR','CONSIGNMENT']),
 itemName:z.string().trim().min(2).max(120),
 details:z.string().trim().min(10).max(1000)
}).strict();
const idParams=z.object({id:z.uuid()});
const pageQuery=z.object({
 limit:z.coerce.number().int().min(1).max(50).default(20),
 offset:z.coerce.number().int().min(0).max(1000).default(0)
}).strict();
const adminQuery=pageQuery.extend({
 kind:z.enum(['REPAIR','CONSIGNMENT']).optional(),
 status:z.enum(['SUBMITTED','UNDER_REVIEW','INFO_REQUESTED','DEMO_CLOSED','CANCELED']).optional()
});
const updateBody=z.object({
 status:z.enum(['UNDER_REVIEW','INFO_REQUESTED','DEMO_CLOSED'])
}).strict();
const disclaimer='시연용 접수 기록입니다. 실제 수선·위탁 계약, 물품 수거, 배송, 견적 또는 정산은 진행되지 않습니다.';
function handleServiceError(req:Request,res:Response,error:unknown):boolean{
 if(!(error instanceof ServiceError))return false;
 if(error.code==='NOT_FOUND'){
  problem(req,res,404,'NOT_FOUND','요청한 신청을 찾을 수 없습니다');return true;
 }
 if(error.code==='IDEMPOTENCY_KEY_REUSED'){
  problem(req,res,409,'IDEMPOTENCY_KEY_REUSED','같은 요청 키로 다른 내용을 등록할 수 없습니다');return true;
 }
 problem(req,res,409,'SERVICE_STATE_CONFLICT','허용되지 않는 신청 상태 변경입니다');
 return true;
}
const responseData=(record:Awaited<ReturnType<typeof getOwnedServiceRequest>>)=>({
 ...record,demo:true,disclaimer
});
export function mountServiceRequestRoutes(app:Express,db:Database,{demoMode}:{demoMode:boolean}){
 const auth=requireAuth(db);
 const admin=requireRole('ADMIN');
 const gate=(req:Request,res:Response,next:NextFunction)=>{
  if(!demoMode||process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test'){
   problem(req,res,501,'NOT_IMPLEMENTED','실제 수선·위탁 접수는 아직 비활성화되어 있습니다');return;
  }
  next();
 };
 app.use(['/api/v1/service-requests','/api/v1/admin/service-requests'],(_req,res,next)=>{
  res.setHeader('Cache-Control','no-store');next();
 });
 app.post('/api/v1/service-requests',gate,auth,async(req,res)=>{
  const input=createBody.parse(req.body);
  const key=req.get('Idempotency-Key');
  if(!key||!z.uuid().safeParse(key).success){
   problem(req,res,422,'VALIDATION_ERROR','Idempotency-Key UUID가 필요합니다');return;
  }
  try{
   const {record,replayed}=await createServiceRequest(db,{
    ownerId:getIdentity(res).userId,
    kind:input.kind as ServiceKind,itemName:input.itemName,
    details:input.details,idempotencyKey:key
   });
   res.setHeader('Location','/api/v1/service-requests/'+record.id);
   res.status(replayed?200:201).json({
    data:{...responseData(record),replayed},meta:{requestId:res.locals.requestId}
   });
  }catch(e){if(!handleServiceError(req,res,e))throw e;}
 });
 app.get('/api/v1/service-requests',gate,auth,async(req,res)=>{
  const query=pageQuery.parse(req.query);
  const list=await listOwnedServiceRequests(db,getIdentity(res).userId,query.limit,query.offset);
  res.json({data:list.map(x=>responseData(x)),meta:{requestId:res.locals.requestId,
   page:{limit:query.limit,offset:query.offset}}});
 });
 app.get('/api/v1/service-requests/:id',gate,auth,async(req,res)=>{
  const {id}=idParams.parse(req.params);
  const found=await getOwnedServiceRequest(db,getIdentity(res).userId,id);
  if(!found){problem(req,res,404,'NOT_FOUND','신청 내역을 찾을 수 없습니다');return;}
  res.json({data:responseData(found),meta:{requestId:res.locals.requestId}});
 });
 app.post('/api/v1/service-requests/:id/cancel',gate,auth,async(req,res)=>{
  const {id}=idParams.parse(req.params);
  try{
   const r=await changeServiceRequestStatus(db,{
    id,actorId:getIdentity(res).userId,target:'CANCELED',customerCancel:true
   });
   res.json({data:{...responseData(r.record),replayed:r.replayed},meta:{requestId:res.locals.requestId}});
  }catch(e){if(!handleServiceError(req,res,e))throw e;}
 });
 app.get('/api/v1/admin/service-requests',gate,auth,admin,async(req,res)=>{
  const query=adminQuery.parse(req.query);
  const list=await listAdminServiceRequests(db,{
   kind:query.kind,status:query.status,limit:query.limit,offset:query.offset
  });
  res.json({data:list.map(x=>responseData(x)),meta:{requestId:res.locals.requestId,
   page:{limit:query.limit,offset:query.offset}}});
 });
 app.patch('/api/v1/admin/service-requests/:id/status',gate,auth,admin,async(req,res)=>{
  const {id}=idParams.parse(req.params);
  const {status}=updateBody.parse(req.body);
  try{
   const r=await changeServiceRequestStatus(db,{
    id,actorId:getIdentity(res).userId,target:status as ServiceStatus,customerCancel:false
   });
   res.json({data:{...responseData(r.record),replayed:r.replayed},meta:{requestId:res.locals.requestId}});
  }catch(e){if(!handleServiceError(req,res,e))throw e;}
 });
}
