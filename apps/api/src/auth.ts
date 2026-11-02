/** Test-only account/session API. No auth method is enabled for production operations yet. */
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import type{Express,Request,Response,NextFunction} from 'express';
import type{ResultSetHeader,RowDataPacket} from 'mysql2';
import * as argon2 from 'argon2';
import {z} from 'zod';
import type{Database} from './db.js';
import {problem} from './problem.js';

export type Role='CUSTOMER'|'ADMIN';
export interface Identity{userId:string;email:string;roles:Role[]}
interface UserRow extends RowDataPacket {id:string;email:string;password_hash:string;status:string}
interface IdentityRow extends RowDataPacket {userId:string;email:string;role:Role|null}
interface SessionRow extends RowDataPacket {id:string;user_id:string}
const credentials=z.object({
 email:z.email().trim().max(255).transform(s=>s.toLowerCase()),
 password:z.string().min(12).max(128)
}).strict();
const loginShape=z.object({email:z.email().trim().max(255).transform(s=>s.toLowerCase()),password:z.string().max(128)}).strict();
const hashToken=(token:string)=>createHash('sha256').update(token).digest('hex');
const makeToken=()=>randomBytes(32).toString('base64url');
const expiresIso=()=>new Date(Date.now()+12*3600_000).toISOString();
const mysqlDate=(iso:string)=>iso.slice(0,23).replace('T',' ');
const dummyHash=argon2.hash('placeholder-not-a-password', {type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1});
const rateLimit=new Map<string,{fails:number;until:number}>();
const isDuplicate=(error:unknown)=>typeof error==='object'&&error!==null&&'code' in error&&error.code==='ER_DUP_ENTRY';

async function issueSession(db:Database,userId:string){
 const token=makeToken(),expiresAt=expiresIso();
 await db.execute(`INSERT INTO lr_sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)`,
 [randomUUID(),userId,hashToken(token),mysqlDate(expiresAt)]);
 return {accessToken:token,tokenType:'Bearer' as const,expiresAt};
}
function bearer(req:Request):string|null{
 const value=req.get('Authorization');
 if(!value||!/^Bearer [A-Za-z0-9_-]{40,128}$/.test(value))return null;
 return value.slice(7);
}
export async function sessionIdentity(db:Database,token:string):Promise<Identity|null>{
 const [rows]=await db.execute<IdentityRow[]>(`
 SELECT u.id AS userId,u.email,r.role
 FROM lr_sessions s JOIN lr_users u ON u.id=s.user_id
 LEFT JOIN lr_user_roles r ON r.user_id=u.id
 WHERE s.token_hash=? AND s.revoked_at IS NULL
 AND s.expires_at>UTC_TIMESTAMP(3) AND u.status='ACTIVE'`,[hashToken(token)]);
 if(!rows.length)return null;
 const first=rows[0];
 return {userId:first.userId,email:first.email,roles:rows.flatMap(x=>x.role?[x.role]:[])};
}
export function requireAuth(db:Database){
 return async(req:Request,res:Response,next:NextFunction)=>{
  const token=bearer(req);
  if(!token){problem(req,res,401,'UNAUTHENTICATED','로그인이 필요합니다');return;}
  const identity=await sessionIdentity(db,token);
  if(!identity){problem(req,res,401,'UNAUTHENTICATED','유효하지 않거나 만료된 세션입니다');return;}
  res.locals.identity=identity;
  next();
 };
}
export function requireRole(role:Role){
 return (_req:Request,res:Response,next:NextFunction)=>{
  const identity=res.locals.identity as Identity|undefined;
  if(!identity){res.status(401).end();return;}
  if(!identity.roles.includes(role)){
   res.status(403).type('application/problem+json').json({
    type:'about:blank',title:'접근 권한이 없습니다',status:403,
    code:'FORBIDDEN',requestId:res.locals.requestId
   });return;
  }
  next();
 };
}
export function getIdentity(res:Response):Identity{
 const identity=res.locals.identity as Identity|undefined;
 if(!identity)throw new Error('missing verified identity');
 return identity;
}
/** Does not trust a client-supplied user ID or role. */
export function mountAuthRoutes(app:Express,db:Database,{demoMode}:{demoMode:boolean}){
 const auth=requireAuth(db);
 const demoOnly=(req:Request,res:Response,next:NextFunction)=>{
  if(!demoMode){problem(req,res,501,'NOT_IMPLEMENTED','계정 서비스 운영 전입니다');return;}
  next();
 };
 app.post('/api/v1/auth/register',demoOnly,async(req,res)=>{
  const data=credentials.parse(req.body);
  const userId=randomUUID();
  const passwordHash=await argon2.hash(data.password,{type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1});
  const conn=await db.getConnection();
  try{
   await conn.beginTransaction();
   await conn.execute('INSERT INTO lr_users(id,email,password_hash) VALUES(?,?,?)',[userId,data.email,passwordHash]);
   await conn.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'CUSTOMER')",[userId]);
   await conn.commit();
  }catch(e){
   await conn.rollback();
   if(isDuplicate(e)){problem(req,res,409,'VALIDATION_ERROR','이메일을 사용할 수 없습니다');return;}
   throw e;
  }finally{conn.release();}
  // No token until the user logs in; email verification is required before real service enablement.
  res.status(201).json({data:{userId,email:data.email,roles:['CUSTOMER'],demo:true},meta:{requestId:res.locals.requestId}});
 });
 app.post('/api/v1/auth/login',demoOnly,async(req,res)=>{
  const {email,password}=loginShape.parse(req.body);
  const key=req.ip+':'+email,now=Date.now();
  if(rateLimit.size>5000)rateLimit.clear();
  const limit=rateLimit.get(key);
  if(limit&&limit.fails>=5&&limit.until>now){
   problem(req,res,429,'RATE_LIMITED','로그인 시도가 너무 많습니다');return;
  }
  const [rows]=await db.execute<UserRow[]>('SELECT id,email,password_hash,status FROM lr_users WHERE email=? LIMIT 1',[email]);
  const user=rows[0];
  const valid=await argon2.verify(user?.password_hash??await dummyHash,password);
  if(!valid||user?.status!=='ACTIVE'){
   const previous=limit?.until>now?limit.fails:0;
   rateLimit.set(key,{fails:previous+1,until:now+10*60_000});
   problem(req,res,401,'UNAUTHENTICATED','이메일 또는 비밀번호를 확인해 주세요');return;
  }
  rateLimit.delete(key);
  const session=await issueSession(db,user.id);
  res.json({data:{userId:user.id,email:user.email,...session,demo:true},meta:{requestId:res.locals.requestId}});
 });
 app.get('/api/v1/me',auth,async(_req,res)=>{
  res.setHeader('Cache-Control','no-store');
  res.json({data:getIdentity(res),meta:{requestId:res.locals.requestId}});
 });
 app.post('/api/v1/auth/logout',auth,async(req,res)=>{
  const token=bearer(req)!;
  await db.execute('UPDATE lr_sessions SET revoked_at=UTC_TIMESTAMP(3) WHERE token_hash=? AND revoked_at IS NULL',[hashToken(token)]);
  res.status(204).end();
 });
 app.post('/api/v1/auth/refresh',auth,async(req,res)=>{
  const token=bearer(req)!;
  const conn=await db.getConnection();
  try{
   await conn.beginTransaction();
   const [result]=await conn.execute<ResultSetHeader>(`UPDATE lr_sessions
     SET revoked_at=UTC_TIMESTAMP(3)
     WHERE token_hash=? AND revoked_at IS NULL AND expires_at>UTC_TIMESTAMP(3)`,[hashToken(token)]);
   if(result.affectedRows!==1){await conn.rollback();problem(req,res,401,'UNAUTHENTICATED','이미 갱신된 세션입니다');return;}
   const session=makeToken(),expiresAt=expiresIso();
   await conn.execute('INSERT INTO lr_sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)',
     [randomUUID(),getIdentity(res).userId,hashToken(session),mysqlDate(expiresAt)]);
   await conn.commit();
   res.json({data:{accessToken:session,tokenType:'Bearer',expiresAt,demo:true},meta:{requestId:res.locals.requestId}});
  }catch(err){await conn.rollback();throw err;}
  finally{conn.release();}
 });
 app.get('/api/v1/admin/me',auth,requireRole('ADMIN'),async(_req,res)=>{
  res.json({data:getIdentity(res),meta:{requestId:res.locals.requestId}});
 });
}
