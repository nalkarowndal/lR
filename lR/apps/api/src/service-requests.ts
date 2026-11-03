/**
 * M5-3A — test-only repair/consignment request journal.
 * Requests are demo workflow records, NOT actual goods intake, prices, shipping, or contracts.
 */
import {createHash,randomUUID} from 'node:crypto';
import type{RowDataPacket,ResultSetHeader} from 'mysql2';
import {appendDemoErpOutbox} from './erp-outbox.js';
import type{Database} from './db.js';

export type ServiceKind='REPAIR'|'CONSIGNMENT';
export type ServiceStatus='SUBMITTED'|'UNDER_REVIEW'|'INFO_REQUESTED'|'DEMO_CLOSED'|'CANCELED';
export class ServiceError extends Error{
 constructor(readonly code:'NOT_FOUND'|'STATE_CONFLICT'|'IDEMPOTENCY_KEY_REUSED'){
  super(code);this.name='ServiceError';
 }
}
export interface ServiceRecord {
 id:string;ownerId:string;kind:ServiceKind;itemName:string;details:string;
 status:ServiceStatus;policyVersion:'demo-only';createdAt:string;updatedAt:string;
}
interface ServiceRow extends RowDataPacket{
 id:string;owner_id:string;kind:ServiceKind;item_name:string;details:string;
 status:ServiceStatus;policy_version:'demo-only';created_at:string;updated_at:string;input_hash:string;
}
const fields='id,owner_id,kind,item_name,details,status,policy_version,created_at,updated_at,input_hash';
const toRecord=(r:ServiceRow):ServiceRecord=>({
 id:r.id,ownerId:r.owner_id,kind:r.kind,itemName:r.item_name,details:r.details,
 status:r.status,policyVersion:'demo-only',createdAt:r.created_at,updatedAt:r.updated_at
});
const hash=(kind:ServiceKind,itemName:string,details:string)=>
 createHash('sha256').update(JSON.stringify([kind,itemName,details])).digest('hex');
function testOnly(){
 if(process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test')
  throw new Error('TEST_ONLY: isolated lr_test required');
}
export async function createServiceRequest(db:Database,input:{
 ownerId:string;kind:ServiceKind;itemName:string;details:string;idempotencyKey:string
}):Promise<{record:ServiceRecord;replayed:boolean}>{
 testOnly();
 const insertedId=randomUUID(),inputHash=hash(input.kind,input.itemName,input.details);
 const connection=await db.getConnection();
 try{
  await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
  await connection.beginTransaction();
  await connection.execute(
   "INSERT INTO lr_demo_service_requests(id,owner_id,kind,idempotency_key,input_hash,item_name,details) "+
   "VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE id=id",
   [insertedId,input.ownerId,input.kind,input.idempotencyKey,inputHash,input.itemName,input.details]);
  const [rows]=await connection.execute<ServiceRow[]>(
   'SELECT '+fields+' FROM lr_demo_service_requests WHERE owner_id=? AND kind=? AND idempotency_key=? FOR UPDATE',
   [input.ownerId,input.kind,input.idempotencyKey]);
  const row=rows[0];
  if(!row)throw new Error('service request lost during transaction');
  if(row.input_hash!==inputHash)throw new ServiceError('IDEMPOTENCY_KEY_REUSED');
  const created=row.id===insertedId;
  if(created){
   const [audit]=await connection.execute<ResultSetHeader>(
    'INSERT INTO lr_demo_service_audit(request_id,actor_id,from_status,to_status) VALUES(?,?,NULL,?)',
    [row.id,input.ownerId,'SUBMITTED']);
   await appendDemoErpOutbox(connection,{
    auditId:audit.insertId,requestId:row.id,actorId:input.ownerId,kind:row.kind,
    fromStatus:null,toStatus:'SUBMITTED'
   });
  }
  await connection.commit();
  return {record:toRecord(row),replayed:!created};
 }catch(error){await connection.rollback();throw error;}
 finally{connection.release();}
}
export async function getOwnedServiceRequest(db:Database,userId:string,id:string):Promise<ServiceRecord|null>{
 testOnly();
 const [rows]=await db.execute<ServiceRow[]>(
  'SELECT '+fields+' FROM lr_demo_service_requests WHERE id=? AND owner_id=? LIMIT 1',
  [id,userId]);
 return rows[0]?toRecord(rows[0]):null;
}
export async function listOwnedServiceRequests(db:Database,userId:string,limit:number,offset:number){
 testOnly();
 const [rows]=await db.query<ServiceRow[]>(
  'SELECT '+fields+' FROM lr_demo_service_requests WHERE owner_id=? ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?',
  [userId,limit,offset]);
 return rows.map(toRecord);
}
export async function listAdminServiceRequests(db:Database,filters:{
 kind?:ServiceKind;status?:ServiceStatus;limit:number;offset:number
}):Promise<ServiceRecord[]>{
 testOnly();
 // All filters are bound parameters; listing admin records is permitted only by RBAC in routes.
 const where:string[]=[];const params:Array<string|number>=[];
 if(filters.kind){where.push('kind=?');params.push(filters.kind);}
 if(filters.status){where.push('status=?');params.push(filters.status);}
 const sql='SELECT '+fields+' FROM lr_demo_service_requests '+
  (where.length?'WHERE '+where.join(' AND ')+' ':'')+
  'ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?';
 const [rows]=await db.query<ServiceRow[]>(sql,[...params,filters.limit,filters.offset]);
 return rows.map(toRecord);
}
const adminTransitions:Record<ServiceStatus,readonly ServiceStatus[]>={
 SUBMITTED:['UNDER_REVIEW'],
 UNDER_REVIEW:['INFO_REQUESTED','DEMO_CLOSED'],
 INFO_REQUESTED:['UNDER_REVIEW'],
 DEMO_CLOSED:[],
 CANCELED:[]
};
export async function changeServiceRequestStatus(db:Database,input:{
 id:string;actorId:string;target:ServiceStatus;customerCancel:boolean
}):Promise<{record:ServiceRecord;replayed:boolean}>{
 testOnly();
 const connection=await db.getConnection();
 try{
  await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
  await connection.beginTransaction();
  const where=input.customerCancel?' AND owner_id=?':'';
  const [rows]=await connection.execute<ServiceRow[]>(
   'SELECT '+fields+' FROM lr_demo_service_requests WHERE id=?'+where+' FOR UPDATE',
   input.customerCancel?[input.id,input.actorId]:[input.id]);
  const current=rows[0];
  if(!current)throw new ServiceError('NOT_FOUND');
  if(current.status===input.target){
   await connection.commit();return {record:toRecord(current),replayed:true};
  }
  const valid=input.customerCancel?
   (input.target==='CANCELED'&&['SUBMITTED','INFO_REQUESTED'].includes(current.status)):
   adminTransitions[current.status].includes(input.target);
  if(!valid)throw new ServiceError('STATE_CONFLICT');
  await connection.execute('UPDATE lr_demo_service_requests SET status=? WHERE id=?',
   [input.target,input.id]);
  const [audit]=await connection.execute<ResultSetHeader>(
   'INSERT INTO lr_demo_service_audit(request_id,actor_id,from_status,to_status) VALUES(?,?,?,?)',
   [input.id,input.actorId,current.status,input.target]);
  await appendDemoErpOutbox(connection,{
   auditId:audit.insertId,requestId:input.id,actorId:input.actorId,kind:current.kind,
   fromStatus:current.status,toStatus:input.target
  });
  const [updated]=await connection.execute<ServiceRow[]>(
   'SELECT '+fields+' FROM lr_demo_service_requests WHERE id=?',[input.id]);
  await connection.commit();
  return {record:toRecord(updated[0]),replayed:false};
 }catch(error){await connection.rollback();throw error;}
 finally{connection.release();}
}
