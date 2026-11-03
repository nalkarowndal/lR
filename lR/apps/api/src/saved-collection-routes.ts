/** M5-2C4A: scoped, non-financial per-customer wishlist and cart. */
import type {Express,Request,Response,NextFunction} from 'express';
import type {ResultSetHeader,RowDataPacket} from 'mysql2';
import {z} from 'zod';
import type {Database} from './db.js';
import {getIdentity,requireAuth} from './auth.js';
import {problem} from './problem.js';

type ListKind='wishlist'|'cart';
interface IdRow extends RowDataPacket {productId:string}
interface CountRow extends RowDataPacket {count:number}
interface AvailabilityRow extends RowDataPacket {id:string}
const item=z.object({productId:z.string().min(1).max(40)}).strict();
const itemParam=z.object({productId:z.string().min(1).max(40)}).strict();
const tables:Record<ListKind,string>={wishlist:'lr_user_wishlist',cart:'lr_user_cart'};
const maximum:Record<ListKind,number>={wishlist:100,cart:30};
const note='포트폴리오 테스트 계정의 상품 저장 기록입니다. 실제 구매·대여 예약 또는 결제는 발생하지 않습니다.';
function guard(req:Request,res:Response,next:NextFunction,demoMode:boolean){
 if(!demoMode||process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test'){
  problem(req,res,501,'NOT_IMPLEMENTED','저장 목록 기능은 테스트 모드에서만 사용할 수 있습니다');return;
 }
 next();
}
async function ids(db:Database,kind:ListKind,actorId:string):Promise<string[]>{
 const [rows]=await db.execute<IdRow[]>(`SELECT product_id AS productId FROM ${tables[kind]} WHERE actor_id=? ORDER BY created_at DESC,product_id DESC LIMIT ?`,[actorId,maximum[kind]]);
 return rows.map(r=>r.productId);
}
async function insert(db:Database,kind:ListKind,actorId:string,productId:string):Promise<'created'|'exists'|'invalid'|'full'>{
 const conn=await db.getConnection();
 try{
  await conn.beginTransaction();
  // Serializes this user's concurrent mutations, including collection size checks.
  const [users]=await conn.execute<AvailabilityRow[]>('SELECT id FROM lr_users WHERE id=? AND status=? FOR UPDATE',[actorId,'ACTIVE']);
  if(!users.length)throw new Error('verified customer disappeared');
  const [products]=await conn.execute<AvailabilityRow[]>(`SELECT p.id FROM lr_products p WHERE p.id=? AND p.published=1 AND p.is_demo=1
    ${kind==='cart'?`AND EXISTS(SELECT 1 FROM lr_product_offers f WHERE f.product_id=p.id AND f.channel='STORE' AND f.is_active=1)`:''}
    LIMIT 1`,[productId]);
  if(!products.length){await conn.rollback();return 'invalid';}
  const [existing]=await conn.execute<IdRow[]>(`SELECT product_id AS productId FROM ${tables[kind]} WHERE actor_id=? AND product_id=? LIMIT 1`,[actorId,productId]);
  if(existing.length){await conn.commit();return 'exists';}
  const [counts]=await conn.execute<CountRow[]>(`SELECT COUNT(*) AS count FROM ${tables[kind]} WHERE actor_id=?`,[actorId]);
  if(Number(counts[0].count)>=maximum[kind]){await conn.rollback();return 'full';}
  await conn.execute(`INSERT INTO ${tables[kind]}(actor_id,product_id) VALUES(?,?)`,[actorId,productId]);
  await conn.commit();
  return 'created';
 }catch(err){await conn.rollback();throw err;}finally{conn.release();}
}
export function mountSavedCollectionRoutes(app:Express,db:Database,{demoMode}:{demoMode:boolean}){
 const auth=requireAuth(db);
 for(const kind of ['wishlist','cart'] as const){
  const path='/api/v1/me/'+kind;
  const gated=(req:Request,res:Response,next:NextFunction)=>guard(req,res,next,demoMode);
  app.use(path,(_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
  app.get(path,gated,auth,async(_req,res)=>{
   const productIds=await ids(db,kind,getIdentity(res).userId);
   res.json({data:{productIds},meta:{requestId:res.locals.requestId,demo:true,disclaimer:note}});
  });
  app.post(path,gated,auth,async(req,res)=>{
   const {productId}=item.parse(req.body);
   const result=await insert(db,kind,getIdentity(res).userId,productId);
   if(result==='invalid'){problem(req,res,422,'VALIDATION_ERROR','선택한 시연 상품을 저장할 수 없습니다');return;}
   if(result==='full'){problem(req,res,409,'COLLECTION_LIMIT','저장 가능한 상품 수를 초과했습니다');return;}
   const productIds=await ids(db,kind,getIdentity(res).userId);
   res.status(result==='created'?201:200).json({data:{productIds},meta:{requestId:res.locals.requestId,demo:true,disclaimer:note}});
  });
  app.delete(path+'/:productId',gated,auth,async(req,res)=>{
   const {productId}=itemParam.parse(req.params);
   await db.execute<ResultSetHeader>(`DELETE FROM ${tables[kind]} WHERE actor_id=? AND product_id=?`,[getIdentity(res).userId,productId]);
   res.status(204).end();
  });
 }
}
