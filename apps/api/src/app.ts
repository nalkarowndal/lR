import express,{type NextFunction,type Request,type Response} from 'express';
import helmet from 'helmet';
import {randomUUID} from 'node:crypto';
import {z,ZodError} from 'zod';
import type{Database} from './db.js';
import {problem} from './problem.js';
import {getAvailability,getProduct,listProducts} from './products.js';
import {rentalDays} from './date.js';
import {mountAuthRoutes} from './auth.js';

const listSchema=z.object({
 q:z.string().trim().max(100).optional(),brand:z.string().trim().max(120).optional(),
 category:z.string().trim().max(100).optional(),channel:z.enum(['RENTAL','STORE']).optional(),
 cursor:z.string().min(1).max(40).optional(),
 limit:z.coerce.number().int().min(1).max(50).default(20)
});
const dateSchema=z.object({
 startDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
 returnDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
const quoteSchema=dateSchema.extend({
 productId:z.string().min(1).max(40),
 shippingOption:z.string().max(30).optional()
});
const detailSchema=z.object({id:z.string().min(1).max(40)});
export function createApp(db:Database,{demoMode=false}:{demoMode?:boolean}={}){
 const app=express();
 app.disable('x-powered-by');
 app.use(helmet());
 app.use(express.json({limit:'32kb'}));
 app.use((req,res,next)=>{const requestId=randomUUID();res.locals.requestId=requestId;res.setHeader('X-Request-Id',requestId);next();});
 const meta=(res:Response)=>({requestId:res.locals.requestId});
 mountAuthRoutes(app,db,{demoMode});
 app.get('/health',(_req,res)=>{res.json({status:'ok'});});
 app.get('/ready',async(req,res)=>{
   try{await db.query('SELECT 1');res.json({status:'ready'});}
   catch{problem(req,res,503,'DATABASE_UNAVAILABLE','Database is not ready');}
 });
 app.get('/api/v1/products',async(req,res)=>{
   const q=listSchema.parse(req.query);
   const result=await listProducts(db,q);
   res.json({data:result.products,meta:{...meta(res),page:{cursor:result.nextCursor,hasNext:result.hasNext}}});
 });
 app.get('/api/v1/products/:id',async(req,res)=>{
   const {id}=detailSchema.parse(req.params);
   const product=await getProduct(db,id);
   if(!product){problem(req,res,404,'NOT_FOUND','상품을 확인할 수 없습니다');return;}
   res.json({data:product,meta:meta(res)});
 });
 app.get('/api/v1/products/:id/availability',async(req,res)=>{
   const {id}=detailSchema.parse(req.params);
   const {startDate,returnDate}=dateSchema.parse(req.query);
   const days=rentalDays(startDate,returnDate);
   if(days===null){problem(req,res,422,'VALIDATION_ERROR','대여 날짜를 확인해 주세요');return;}
   const product=await getProduct(db,id);
   if(!product){problem(req,res,404,'NOT_FOUND','상품을 확인할 수 없습니다');return;}
   const eligibleUnitCount=product.channels.includes('RENTAL')?await getAvailability(db,id,startDate,returnDate):0;
   res.json({data:{productId:id,startDate,returnDate,rentalDays:days,available:eligibleUnitCount>0,eligibleUnitCount,
     unavailableReasons:eligibleUnitCount>0?[]:['NO_ELIGIBLE_UNIT'],demo:product.demo},meta:meta(res)});
 });
 app.post('/api/v1/rentals/quote',async(req,res)=>{
   if(!demoMode){problem(req,res,501,'NOT_IMPLEMENTED','견적 서비스 연결 전입니다');return;}
   const input=quoteSchema.parse(req.body);
   const days=rentalDays(input.startDate,input.returnDate);
   if(days===null){problem(req,res,422,'VALIDATION_ERROR','대여 날짜를 확인해 주세요');return;}
   const product=await getProduct(db,input.productId);
   if(!product){problem(req,res,404,'NOT_FOUND','상품을 확인할 수 없습니다');return;}
   if(!product.channels.includes('RENTAL')||product.dayRateKrw===null){problem(req,res,422,'VALIDATION_ERROR','렌탈 상품이 아닙니다');return;}
   const count=await getAvailability(db,product.id,input.startDate,input.returnDate);
   if(count===0){problem(req,res,409,'INVENTORY_CONFLICT','선택한 기간에 대여할 수 없습니다');return;}
   const fee=product.dayRateKrw*days;
   if(!Number.isSafeInteger(fee)||!Number.isSafeInteger(fee+product.depositKrw))throw new Error('unsafe quote amount');
   res.json({data:{
     quoteId:randomUUID(),productId:product.id,startDate:input.startDate,returnDate:input.returnDate,
     rentalDays:days,dayRateKrw:product.dayRateKrw,rentalFeeKrw:fee,discountKrw:0,
     shippingFeeKrw:0,depositKrw:product.depositKrw,payableNowKrw:fee+product.depositKrw,
     policyVersionId:'demo-only',quoteExpiresAt:new Date(Date.now()+5*60_000).toISOString(),
     demo:true,disclaimer:'시연용 견적이며 실제 예약 또는 재고 확보가 아닙니다.'
   },meta:meta(res)});
 });
 // Hard stop: never simulate a paid or confirmed booking without auth, holds and PG verification.
 app.post('/api/v1/rentals',(req,res)=>{problem(req,res,501,'NOT_IMPLEMENTED','회원 인증·예약 홀드·결제 연동 전에는 예약할 수 없습니다');});
 app.post('/api/v1/orders',(req,res)=>{problem(req,res,501,'NOT_IMPLEMENTED','실제 주문 기능은 아직 제공되지 않습니다');});
 app.post('/api/v1/payments/confirm',(req,res)=>{problem(req,res,501,'NOT_IMPLEMENTED','결제 승인은 아직 제공되지 않습니다');});
 app.use((req,res)=>problem(req,res,404,'NOT_FOUND','요청한 API를 찾을 수 없습니다'));
 app.use((err:unknown,req:Request,res:Response,next:NextFunction)=>{
   if(res.headersSent){next(err);return;}
   if(err instanceof ZodError){
     problem(req,res,422,'VALIDATION_ERROR','입력값을 확인해 주세요');return;
   }
   // Do not expose DB/stack details, credential strings or SQL to callers.
   console.error('API error',res.locals.requestId,err instanceof Error?err.name:'unknown');
   problem(req,res,500,'SERVER_ERROR','요청을 처리할 수 없습니다');
 });
 return app;
}
