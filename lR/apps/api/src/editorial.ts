/** M5-2C4-D1: strictly isolated editorial copy, no images, HTML, links or production publishing. */
import {z} from 'zod';
import type{RowDataPacket,ResultSetHeader} from 'mysql2';
import type{Database} from './db.js';

const cleanText=(max:number)=>z.string().trim().min(2).max(max)
 .refine(s=>!/[<>\u0000-\u001f\u007f]/.test(s)&&!/https?:\/\/|www\.|javascript:|data:/i.test(s),
  'Only safe plain text is allowed');
export const editorialCopySchema=z.object({
 eyebrow:cleanText(60),headline:cleanText(80),description:cleanText(180),
 ctaLabel:cleanText(32),ctaTarget:z.enum(['RENTAL','STORE','CARE','CONSIGNMENT'])
}).strict();
export type EditorialCopy=z.infer<typeof editorialCopySchema>;
export interface EditorialState {
 slot:'HOME_HERO';draft:EditorialCopy;published:EditorialCopy;
 revision:number;publishedRevision:number;demo:true;
}
interface Row extends RowDataPacket{
 draft:string|EditorialCopy;published:string|EditorialCopy;
 revision:number;published_revision:number;
}
const select='SELECT draft,published,revision,published_revision FROM lr_demo_editorial_home WHERE id=1';
function testOnly(){
 if(process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test')throw new Error('TEST_ONLY: lr_test required');
}
const copyFromJson=(v:Row['draft'])=>editorialCopySchema.parse(typeof v==='string'?JSON.parse(v):v);
const map=(r:Row):EditorialState=>({
 slot:'HOME_HERO',draft:copyFromJson(r.draft),published:copyFromJson(r.published),
 revision:r.revision,publishedRevision:r.published_revision,demo:true
});
export class EditorialConflict extends Error{
 constructor(){super('EDITORIAL_REVISION_CONFLICT');this.name='EditorialConflict';}
}
export async function readEditorial(db:Database):Promise<EditorialState>{
 testOnly();
 const [rows]=await db.execute<Row[]>(select);
 if(!rows[0])throw new Error('Missing synthetic editorial seed in lr_test');
 return map(rows[0]);
}
export async function changeEditorial(db:Database,input:{
 actorId:string;expectedRevision:number;action:'DRAFT_EDIT'|'PUBLISH';copy?:EditorialCopy;
}):Promise<EditorialState>{
 testOnly();
 const conn=await db.getConnection();
 try{
  await conn.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
  await conn.beginTransaction();
  const [rows]=await conn.execute<Row[]>(select+' FOR UPDATE');
  const current=rows[0];if(!current)throw new Error('Missing synthetic editorial seed in lr_test');
  if(current.revision!==input.expectedRevision)throw new EditorialConflict();
  const revision=current.revision+1;
  if(input.action==='DRAFT_EDIT'){
   if(!input.copy)throw new Error('Missing editorial draft');
   await conn.execute('UPDATE lr_demo_editorial_home SET draft=?,revision=? WHERE id=1',
    [JSON.stringify(editorialCopySchema.parse(input.copy)),revision]);
  }else{
   if(current.revision===current.published_revision)throw new EditorialConflict();
   await conn.execute(
    'UPDATE lr_demo_editorial_home SET published=draft,published_revision=?,revision=? WHERE id=1',
    [revision,revision]);
  }
  await conn.execute<ResultSetHeader>(
   'INSERT INTO lr_demo_editorial_audit(actor_id,action,revision) VALUES(?,?,?)',
   [input.actorId,input.action,revision]);
  const [updated]=await conn.execute<Row[]>(select);
  await conn.commit();
  return map(updated[0]);
 }catch(err){await conn.rollback();throw err;}finally{conn.release();}
}
