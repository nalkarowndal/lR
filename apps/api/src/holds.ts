/**
 * Internal inventory hold service (M3.2). It is NOT connected to a public route.
 * Caller identity must ultimately come from verified server authentication.
 *
 * All writers for an InventoryUnit MUST lock the corresponding unit row first.
 * We use READ COMMITTED and a locking unit read to prevent concurrent writers
 * from relying on a stale snapshot. Booking interval is [startDate, returnDate).
 */
import {createHash, randomUUID} from 'node:crypto';
import type{RowDataPacket} from 'mysql2';
import type{Database} from './db.js';
import {rentalDays} from './date.js';

type HoldKind='RENTAL'|'SALE';
export interface HoldRequest {
  actorId:string;
  idempotencyKey:string;
  productId:string;
  kind:HoldKind;
  startDate?:string;
  returnDate?:string;
}
export interface HoldResult {
  holdId:string;
  unitId:string;
  checkoutId:string;
  status:'ACTIVE'|'CONSUMED'|'EXPIRED'|'RELEASED';
  expiresAt:string;
  replayed:boolean;
}
export class HoldConflictError extends Error {
  constructor(readonly code:'INVENTORY_CONFLICT'|'IDEMPOTENCY_KEY_REUSED'|'INVALID_HOLD_REQUEST'){
    super(code);this.name='HoldConflictError';
  }
}
interface RequestRow extends RowDataPacket{
  request_hash:string;
  hold_id:string|null;
  state:'PENDING'|'COMPLETED';
}
interface UnitRow extends RowDataPacket{id:string;product_id:string;physical_state:string}
interface HeldRow extends RowDataPacket{id:string;unit_id:string;checkout_id:string;status:HoldResult['status'];expires_at:Date|string}
interface OccupiedRow extends RowDataPacket{id:string}

const isId=(value:string)=>value.length>=1&&value.length<=40&&/^[\w-]+$/.test(value);
const toUtc=(value:Date|string)=>value instanceof Date?value.toISOString():new Date(value.replace(' ','T')+'Z').toISOString();
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

export async function acquireInventoryHold(db:Database,input:HoldRequest):Promise<HoldResult>{
  if(!isId(input.actorId)||!isId(input.idempotencyKey)||!isId(input.productId)){
    throw new HoldConflictError('INVALID_HOLD_REQUEST');
  }
  if(input.kind!=='RENTAL'&&input.kind!=='SALE')throw new HoldConflictError('INVALID_HOLD_REQUEST');
  const startDate=input.kind==='RENTAL'?input.startDate:undefined;
  const returnDate=input.kind==='RENTAL'?input.returnDate:undefined;
  if(input.kind==='RENTAL'&&(!startDate||!returnDate||rentalDays(startDate,returnDate)===null)){
    throw new HoldConflictError('INVALID_HOLD_REQUEST');
  }
  if(input.kind==='SALE'&&(input.startDate!==undefined||input.returnDate!==undefined)){
    throw new HoldConflictError('INVALID_HOLD_REQUEST');
  }
  const requestHash=hash({productId:input.productId,kind:input.kind,startDate,returnDate});
  const conn=await db.getConnection();
  try{
    await conn.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    await conn.beginTransaction();
    // MySQL unique(actor_id,idempotency_key) serializes concurrent retries.
    await conn.execute(`INSERT INTO lr_hold_requests(actor_id,idempotency_key,request_hash,state)
      VALUES(?,?,?,'PENDING') ON DUPLICATE KEY UPDATE actor_id=actor_id`,
      [input.actorId,input.idempotencyKey,requestHash]);
    const [reqs]=await conn.execute<RequestRow[]>(`SELECT request_hash,hold_id,state
      FROM lr_hold_requests WHERE actor_id=? AND idempotency_key=? FOR UPDATE`,
      [input.actorId,input.idempotencyKey]);
    const prior=reqs[0];
    if(prior.request_hash!==requestHash)throw new HoldConflictError('IDEMPOTENCY_KEY_REUSED');
    if(prior.state==='COMPLETED'&&prior.hold_id){
      const [holds]=await conn.execute<HeldRow[]>(`SELECT id,unit_id,checkout_id,status,expires_at
        FROM lr_inventory_holds WHERE id=?`,[prior.hold_id]);
      if(holds.length!==1)throw new Error('previous hold missing');
      await conn.commit();
      const hold=holds[0];
      return {holdId:hold.id,unitId:hold.unit_id,checkoutId:hold.checkout_id,
        status:hold.status,expiresAt:toUtc(hold.expires_at),replayed:true};
    }
    if(prior.state!=='PENDING')throw new Error('invalid idempotency state');

    // Lock individual units in a stable order. All inventory writers must follow this convention.
    const [candidates]=await conn.execute<UnitRow[]>(`SELECT id,product_id,physical_state
      FROM lr_inventory_units WHERE product_id=? AND physical_state='READY'
      ORDER BY id ASC`,[input.productId]);
    let chosen:string|null=null;
    for(const candidate of candidates){
      const [locked]=await conn.execute<UnitRow[]>(`SELECT id,product_id,physical_state
        FROM lr_inventory_units WHERE id=? FOR UPDATE`,[candidate.id]);
      if(locked[0]?.physical_state!=='READY'||locked[0]?.product_id!==input.productId)continue;

      const [activeHolds]=await conn.execute<OccupiedRow[]>(`SELECT id FROM lr_inventory_holds
        WHERE unit_id=? AND status='ACTIVE' AND expires_at>UTC_TIMESTAMP(3)
        AND (?='SALE' OR kind='SALE' OR (blocked_start_date < ? AND blocked_end_exclusive > ?))
        LIMIT 1`,[candidate.id,input.kind,returnDate??null,startDate??null]);
      if(activeHolds.length>0)continue;

      const [rentals]=await conn.execute<OccupiedRow[]>(`SELECT id FROM lr_rentals
        WHERE unit_id=? AND status NOT IN ('CANCELED','COMPLETED')
        AND (?='SALE' OR (blocked_start_date < ? AND blocked_end_exclusive > ?))
        LIMIT 1`,[candidate.id,input.kind,returnDate??null,startDate??null]);
      if(rentals.length>0)continue;

      chosen=candidate.id;break;
    }
    if(!chosen)throw new HoldConflictError('INVENTORY_CONFLICT');
    const holdId=randomUUID(),checkoutId=randomUUID();
    // Ten-minute TTL is a technical demo value, not an approved business policy.
    const expiresAt=new Date(Date.now()+10*60_000);
    await conn.execute(`INSERT INTO lr_inventory_holds
      (id,unit_id,kind,blocked_start_date,blocked_end_exclusive,expires_at,status,checkout_id)
      VALUES(?,?,?,?,?,?,'ACTIVE',?)`,
      [holdId,chosen,input.kind,startDate??null,returnDate??null,expiresAt,checkoutId]);
    await conn.execute(`UPDATE lr_hold_requests SET state='COMPLETED',hold_id=?
      WHERE actor_id=? AND idempotency_key=?`,[holdId,input.actorId,input.idempotencyKey]);
    await conn.commit();
    return {holdId,unitId:chosen,checkoutId,status:'ACTIVE',expiresAt:expiresAt.toISOString(),replayed:false};
  }catch(error){await conn.rollback();throw error;}
  finally{conn.release();}
}

/** Test-support and future policy-controlled release; not exposed over HTTP. */
export async function releaseInventoryHold(db:Database,holdId:string):Promise<boolean>{
  if(!isId(holdId))throw new HoldConflictError('INVALID_HOLD_REQUEST');
  const conn=await db.getConnection();
  try{
    await conn.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    await conn.beginTransaction();
    // Find FK for lock ordering, then lock unit before mutating its hold.
    const [existing]=await conn.execute<HeldRow[]>(`SELECT id,unit_id,checkout_id,status,expires_at
      FROM lr_inventory_holds WHERE id=?`,[holdId]);
    if(!existing[0]){await conn.commit();return false;}
    await conn.execute('SELECT id FROM lr_inventory_units WHERE id=? FOR UPDATE',[existing[0].unit_id]);
    const [locked]=await conn.execute<HeldRow[]>(`SELECT id,unit_id,checkout_id,status,expires_at
      FROM lr_inventory_holds WHERE id=? FOR UPDATE`,[holdId]);
    if(locked[0]?.status!=='ACTIVE'){await conn.commit();return false;}
    await conn.execute(`UPDATE lr_inventory_holds SET status='RELEASED' WHERE id=?`,[holdId]);
    await conn.commit();
    return true;
  }catch(error){await conn.rollback();throw error;}
  finally{conn.release();}
}
