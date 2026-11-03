/** Isolated non-commercial editorial API. ADMIN controls copy only, never images or commerce. */
import type{Express,Request,Response,NextFunction} from 'express';
import {z} from 'zod';
import type{Database} from './db.js';
import {getIdentity,requireAuth,requireRole} from './auth.js';
import {problem} from './problem.js';
import {readEditorial,changeEditorial,editorialCopySchema,EditorialConflict} from './editorial.js';
import {listMediaRights} from './media-rights.js';
const draftBody=z.object({expectedRevision:z.number().int().min(1),copy:editorialCopySchema}).strict();
const publishBody=z.object({expectedRevision:z.number().int().min(1)}).strict();
export function mountEditorialRoutes(app:Express,db:Database,{demoMode}:{demoMode:boolean}){
 const gate=(req:Request,res:Response,next:NextFunction)=>{
  if(!demoMode||process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test'){
   problem(req,res,501,'NOT_IMPLEMENTED','에디토리얼 CMS는 격리 테스트 환경에서만 제공됩니다');return;
  }
  next();
 };
 const admin=requireRole('ADMIN'),auth=requireAuth(db);
 const path='/api/v1/admin/editorial/home';
 app.use(['/api/v1/editorial/home',path,'/api/v1/admin/media-rights'],(_req,res,next)=>{
  res.setHeader('Cache-Control','no-store');next();
 });
 app.get('/api/v1/editorial/home',gate,async(_req,res)=>{
  const current=await readEditorial(db);
  // Public callers see a published-only snapshot and no draft or admin actor.
  res.json({data:{slot:current.slot,copy:current.published,revision:current.publishedRevision,demo:true},
   meta:{requestId:res.locals.requestId}});
 });
 app.get('/api/v1/admin/media-rights',gate,auth,admin,async(_req,res)=>{
  res.json({data:await listMediaRights(db),meta:{requestId:res.locals.requestId,demo:true}});
 });
 app.get(path,gate,auth,admin,async(_req,res)=>{
  res.json({data:await readEditorial(db),meta:{requestId:res.locals.requestId}});
 });
 app.put(path+'/draft',gate,auth,admin,async(req,res)=>{
  const {expectedRevision,copy}=draftBody.parse(req.body);
  try{
   const state=await changeEditorial(db,{actorId:getIdentity(res).userId,expectedRevision,copy,action:'DRAFT_EDIT'});
   res.json({data:state,meta:{requestId:res.locals.requestId}});
  }catch(e){
   if(!(e instanceof EditorialConflict))throw e;
   problem(req,res,409,'EDITORIAL_REVISION_CONFLICT','다른 관리자 수정 사항을 먼저 새로고침해 주세요');
  }
 });
 app.post(path+'/publish',gate,auth,admin,async(req,res)=>{
  const {expectedRevision}=publishBody.parse(req.body);
  try{
   const state=await changeEditorial(db,{actorId:getIdentity(res).userId,expectedRevision,action:'PUBLISH'});
   res.json({data:state,meta:{requestId:res.locals.requestId}});
  }catch(e){
   if(!(e instanceof EditorialConflict))throw e;
   problem(req,res,409,'EDITORIAL_REVISION_CONFLICT','게시 상태가 변경됐습니다. 관리자 목록을 새로고침해 주세요');
  }
 });
}
