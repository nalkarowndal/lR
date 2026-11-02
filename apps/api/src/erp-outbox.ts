/**
 * M5-3B isolated transactional Outbox. Never contacts external ERP or runs unattended.
 * At-least-once dispatch only. Every consumer must deduplicate on eventId.
 */
import {randomUUID} from 'node:crypto';
import type{PoolConnection} from 'mysql2/promise';
import type{RowDataPacket,ResultSetHeader} from 'mysql2';
import type{Database} from './db.js';
import type{ServiceKind,ServiceStatus} from './service-requests.js';

function isolate(){
 if(process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test')
  throw new Error('TEST_ONLY: isolated lr_test required');
}
export interface DemoErpEvent{
 eventId:string;
 auditId:number;
 requestId:string;
 actorId:string;
 kind:ServiceKind;
 fromStatus:ServiceStatus|null;
 toStatus:ServiceStatus;
 eventVersion:1;
}
interface EventRow extends RowDataPacket {
 event_id:string;audit_id:number;request_id:string;actor_id:string;
 kind:ServiceKind;from_status:ServiceStatus|null;to_status:ServiceStatus;
 event_version:number;attempt_count:number;
}
export type DemoErpTransport=(event:Readonly<DemoErpEvent>,context:{
 idempotencyKey:string;signal:AbortSignal
})=>Promise<void>;
const toEvent=(row:EventRow):DemoErpEvent=>({
 eventId:row.event_id,auditId:Number(row.audit_id),requestId:row.request_id,
 actorId:row.actor_id,kind:row.kind,fromStatus:row.from_status,
 toStatus:row.to_status,eventVersion:1
});
export async function appendDemoErpOutbox(conn:PoolConnection,input:{
 auditId:number;requestId:string;actorId:string;kind:ServiceKind;
 fromStatus:ServiceStatus|null;toStatus:ServiceStatus
}):Promise<void>{
 isolate();
 // Call inside exactly the SAME transaction as the service state and audit INSERT.
 await conn.execute(`INSERT INTO lr_demo_erp_outbox
  (event_id,audit_id,request_id,actor_id,kind,from_status,to_status,event_version)
  VALUES(?,?,?,?,?,?,?,1)`,
  [randomUUID(),input.auditId,input.requestId,input.actorId,
   input.kind,input.fromStatus,input.toStatus]);
}
interface Claim{event:DemoErpEvent;token:string;attempt:number}
async function claimOne(db:Database,leaseSeconds:number):Promise<Claim|null>{
 const conn=await db.getConnection();
 try{
  await conn.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
  await conn.beginTransaction();
  // A later event for the same request waits until the preceding audit event is delivered.
  // Use SKIP LOCKED only for this queue, not normal request reads.
  const [rows]=await conn.query<EventRow[]>(`SELECT
   o.event_id,o.audit_id,o.request_id,o.actor_id,o.kind,o.from_status,
   o.to_status,o.event_version,o.attempt_count
   FROM lr_demo_erp_outbox o
   WHERE ((o.state='PENDING' AND o.available_at<=UTC_TIMESTAMP(3))
    OR (o.state='LEASED' AND o.lease_until<=UTC_TIMESTAMP(3)))
   AND NOT EXISTS (
    SELECT 1 FROM lr_demo_erp_outbox older
    WHERE older.request_id=o.request_id AND older.audit_id<o.audit_id
      AND older.state<>'DELIVERED'
   )
   ORDER BY o.audit_id ASC LIMIT 1 FOR UPDATE SKIP LOCKED`);
  if(!rows.length){await conn.commit();return null;}
  const row=rows[0],token=randomUUID();
  const [update]=await conn.execute<ResultSetHeader>(`UPDATE lr_demo_erp_outbox
   SET state='LEASED',lease_token=?,lease_until=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL ? SECOND),
       attempt_count=attempt_count+1
   WHERE event_id=? AND state IN ('PENDING','LEASED')`,[token,leaseSeconds,row.event_id]);
  if(update.affectedRows!==1)throw new Error('Outbox claim race');
  await conn.commit();
  return {event:toEvent(row),token,attempt:Number(row.attempt_count)+1};
 }catch(e){await conn.rollback();throw e;}
 finally{conn.release();}
}
/** One explicit polling step only; never starts a daemon, network job or timer. */
export async function dispatchOneDemoErpOutbox(db:Database,transport:DemoErpTransport,
 opts:{leaseSeconds?:number;maxAttempts?:number;timeoutMs?:number}={}
):Promise<{outcome:'EMPTY'|'DELIVERED'|'RETRY_SCHEDULED'|'DEAD'|'LEASE_LOST';eventId:string|null;attempt:number}>{
 isolate();
 if(typeof transport!=='function')throw new Error('TEST_ONLY: transport callback required');
 const leaseSeconds=opts.leaseSeconds??10;
 const maxAttempts=opts.maxAttempts??3;
 const timeoutMs=opts.timeoutMs??2500;
 if(!Number.isInteger(leaseSeconds)||leaseSeconds<5||leaseSeconds>300||
   !Number.isInteger(maxAttempts)||maxAttempts<1||maxAttempts>20||
   !Number.isInteger(timeoutMs)||timeoutMs<50||timeoutMs>=leaseSeconds*1000)
  throw new Error('TEST_ONLY: invalid bounded dispatch options');
 const claim=await claimOne(db,leaseSeconds);
 if(!claim)return {outcome:'EMPTY',eventId:null,attempt:0};
 const {event,token,attempt}=claim;
 const signal=AbortSignal.timeout(timeoutMs);
 let succeeded=false;
 // Time bound the adapter even if a faulty fake provider never resolves.
 // An adapter may still complete after timeout: delivery remains at-least-once.
 let onAbort:(()=>void)|null=null;
 try{
  await Promise.race([
   transport(event,{idempotencyKey:event.eventId,signal}),
   new Promise<never>((_,reject)=>{
    onAbort=()=>reject(new Error('TRANSPORT_TIMEOUT'));
    if(signal.aborted)onAbort();else signal.addEventListener('abort',onAbort,{once:true});
   })
  ]);
  succeeded=true;
 }catch{
  // No raw exception, credentials, customer data or user-supplied text in DB/audit.
 }finally{
  if(onAbort)signal.removeEventListener('abort',onAbort);
 }
 // Fencing token + lease expiry prevents a stale worker from committing a later worker's lease.
 if(succeeded){
  const [r]=await db.execute<ResultSetHeader>(`UPDATE lr_demo_erp_outbox
   SET state='DELIVERED',lease_token=NULL,lease_until=NULL,
       delivered_at=UTC_TIMESTAMP(3),last_error_code=NULL
   WHERE event_id=? AND state='LEASED' AND lease_token=? AND lease_until>UTC_TIMESTAMP(3)`,
   [event.eventId,token]);
  return {outcome:r.affectedRows?'DELIVERED':'LEASE_LOST',eventId:event.eventId,attempt};
 }
 const dead=attempt>=maxAttempts;
 const delaySeconds=Math.min(2**Math.min(attempt,10),3600);
 const [r]=await db.execute<ResultSetHeader>(`UPDATE lr_demo_erp_outbox
  SET state=?,lease_token=NULL,lease_until=NULL,
      available_at=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL ? SECOND),
      last_error_code='ADAPTER_FAILED'
  WHERE event_id=? AND state='LEASED' AND lease_token=? AND lease_until>UTC_TIMESTAMP(3)`,
  [dead?'DEAD':'PENDING',delaySeconds,event.eventId,token]);
 return {outcome:!r.affectedRows?'LEASE_LOST':dead?'DEAD':'RETRY_SCHEDULED',
  eventId:event.eventId,attempt};
}
