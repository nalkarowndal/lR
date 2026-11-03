import test,{after,before} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type{RowDataPacket} from 'mysql2';
import {readConfig} from '../src/config.js';
import {openPool} from '../src/db.js';
import {acquireInventoryHold,HoldConflictError,releaseInventoryHold} from '../src/holds.js';
import {getAvailability} from '../src/products.js';
const config=readConfig();
if(config.DB_NAME!=='lr_test'||config.NODE_ENV!=='test')throw new Error('test-only DB required');
const db=openPool(config);
before(async()=>{await db.query('SELECT 1')});
after(async()=>{await db.end()});
type Fixture={productId:string,unitIds:string[]};
async function fixture(unitCount:number):Promise<Fixture>{
 const token=randomUUID().slice(0,12);
 const productId='qa-'+token;
 await db.execute(`INSERT INTO lr_products(id,title,brand,category,condition_grade,published,is_demo)
  VALUES(?,'QA test item','TEST','bag','A',1,1)`,[productId]);
 await db.execute(`INSERT INTO lr_product_offers(id,product_id,channel,day_rate_krw,deposit_krw,is_active)
  VALUES(?,?,'RENTAL',10000,20000,1)`,['offer-'+token,productId]);
 const unitIds:string[]=[];
 for(let i=0;i<unitCount;i++){
  const unit='unit-'+token+'-'+i;
  await db.execute(`INSERT INTO lr_inventory_units(id,product_id,serial,condition_grade,physical_state)
   VALUES(?,?,?,'A','READY')`,[unit,productId,'TEST-'+token+'-'+i]);
  unitIds.push(unit);
 }
 return {productId,unitIds};
}
const start='2026-11-10', end='2026-11-13';
const make=(f:Fixture,actor:string,key:string,startDate=start,returnDate=end)=>({
 actorId:actor,idempotencyKey:key,productId:f.productId,kind:'RENTAL' as const,startDate,returnDate
});
const conflict=(error:unknown,code:HoldConflictError['code'])=>error instanceof HoldConflictError&&error.code===code;
interface Count extends RowDataPacket{total:number}
async function holdCount(unitId:string){
 const [rows]=await db.execute<Count[]>(`SELECT COUNT(*) total FROM lr_inventory_holds
   WHERE unit_id=? AND status='ACTIVE' AND expires_at>UTC_TIMESTAMP(3)`,[unitId]);
 return Number(rows[0]?.total??0);
}
test('20 simultaneous distinct requests can acquire only 1 of 1 unit',async()=>{
 const f=await fixture(1);
 const calls=Array.from({length:20},(_,i)=>acquireInventoryHold(db,make(f,'custA-'+i,'reqA-'+i)));
 const results=await Promise.allSettled(calls);
 const successes=results.filter(x=>x.status==='fulfilled');
 const conflicts=results.filter(x=>x.status==='rejected');
 assert.equal(successes.length,1);
 assert.equal(conflicts.length,19);
 assert.ok(conflicts.every(x=>x.status==='rejected'&&conflict(x.reason,'INVENTORY_CONFLICT')));
 assert.equal(await holdCount(f.unitIds[0]),1);
 assert.equal(await getAvailability(db,f.productId,start,end),0);
});
test('20 simultaneous requests allocate at most 2 of 2 distinct physical units',async()=>{
 const f=await fixture(2);
 const outcomes=await Promise.allSettled(Array.from({length:20},(_,i)=>
   acquireInventoryHold(db,make(f,'custB-'+i,'reqB-'+i))));
 const holds=outcomes.filter(x=>x.status==='fulfilled').map(x=>x.value);
 assert.equal(holds.length,2);
 assert.equal(new Set(holds.map(x=>x.unitId)).size,2);
 assert.equal(await holdCount(f.unitIds[0])+await holdCount(f.unitIds[1]),2);
});
test('same idempotency key replay is stable, and different payload is rejected',async()=>{
 const f=await fixture(1);
 const req=make(f,'customer-idempotent','same-key');
 const first=await acquireInventoryHold(db,req);
 const second=await acquireInventoryHold(db,req);
 assert.equal(second.holdId,first.holdId);
 assert.equal(second.checkoutId,first.checkoutId);
 assert.equal(second.replayed,true);
 assert.equal(await holdCount(f.unitIds[0]),1);
 await assert.rejects(()=>acquireInventoryHold(db,{...req,returnDate:'2026-11-14'}),
   error=>conflict(error,'IDEMPOTENCY_KEY_REUSED'));
});
test('20 concurrent exact idempotency retries all return one hold',async()=>{
 const f=await fixture(1);
 const req=make(f,'customer-retry','key-repeat');
 const results=await Promise.all(Array.from({length:20},()=>acquireInventoryHold(db,req)));
 assert.equal(new Set(results.map(x=>x.holdId)).size,1);
 assert.equal(results.filter(x=>!x.replayed).length,1);
 assert.equal(await holdCount(f.unitIds[0]),1);
});
test('adjacent half-open rental periods on one unit do not overlap',async()=>{
 const f=await fixture(1);
 const first=await acquireInventoryHold(db,make(f,'customer-adj-1','adj-1','2026-11-10','2026-11-13'));
 const second=await acquireInventoryHold(db,make(f,'customer-adj-2','adj-2','2026-11-13','2026-11-15'));
 assert.equal(first.unitId,second.unitId);
 assert.notEqual(first.holdId,second.holdId);
 assert.equal(await holdCount(f.unitIds[0]),2);
});
test('overlap is rejected while a full SALE hold blocks every rental period',async()=>{
 const f=await fixture(1);
 const first=await acquireInventoryHold(db,make(f,'customer-t','t-1','2026-11-10','2026-11-13'));
 await assert.rejects(()=>acquireInventoryHold(db,make(f,'customer-t2','t-2','2026-11-12','2026-11-16')),
  error=>conflict(error,'INVENTORY_CONFLICT'));
 await assert.rejects(()=>acquireInventoryHold(db,{
  actorId:'store-clerk',idempotencyKey:'sale-1',productId:f.productId,kind:'SALE'}),
  error=>conflict(error,'INVENTORY_CONFLICT'));
 assert.equal(await releaseInventoryHold(db,first.holdId),true);
 const sale=await acquireInventoryHold(db,{
  actorId:'store-clerk',idempotencyKey:'sale-2',productId:f.productId,kind:'SALE'});
 await assert.rejects(()=>acquireInventoryHold(db,make(f,'customer-post-sale','rental-after-sale')),
  error=>conflict(error,'INVENTORY_CONFLICT'));
 assert.equal(await releaseInventoryHold(db,sale.holdId),true);
 assert.equal(await releaseInventoryHold(db,sale.holdId),false);
});
test('expired active hold is ignored and allows a new hold',async()=>{
 const f=await fixture(1);
 const old=await acquireInventoryHold(db,make(f,'customer-expired','old'));
 await db.execute(`UPDATE lr_inventory_holds SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND)
 WHERE id=?`,[old.holdId]);
 const next=await acquireInventoryHold(db,make(f,'customer-expired-2','new'));
 assert.equal(next.unitId,old.unitId);
 assert.notEqual(next.holdId,old.holdId);
 assert.equal(await holdCount(f.unitIds[0]),1);
});
test('blocked rentals and physical maintenance states cannot be held',async()=>{
 const f=await fixture(1);
 await db.execute("UPDATE lr_inventory_units SET physical_state='REPAIR' WHERE id=?",[f.unitIds[0]]);
 await assert.rejects(()=>acquireInventoryHold(db,make(f,'customer-maint','m-1')),
  error=>conflict(error,'INVENTORY_CONFLICT'));
 await db.execute("UPDATE lr_inventory_units SET physical_state='READY' WHERE id=?",[f.unitIds[0]]);
 await db.execute(`INSERT INTO lr_rentals(id,user_id,product_id,unit_id,blocked_start_date,blocked_end_exclusive,status)
 VALUES(?,?,?,?,?,?,'CONFIRMED')`,
 [randomUUID(),'test-customer',f.productId,f.unitIds[0],start,end]);
 await assert.rejects(()=>acquireInventoryHold(db,make(f,'customer-busy','m-2')),
  error=>conflict(error,'INVENTORY_CONFLICT'));
});
test('bad input dates or untrusted actor identifiers fail closed',async()=>{
 const f=await fixture(1);
 await assert.rejects(()=>acquireInventoryHold(db,make(f,'valid-id','valid-key','2026-02-30','2026-03-05')),
  error=>conflict(error,'INVALID_HOLD_REQUEST'));
 await assert.rejects(()=>acquireInventoryHold(db,make(f,'','valid-key')),
  error=>conflict(error,'INVALID_HOLD_REQUEST'));
 await assert.rejects(()=>acquireInventoryHold(db,{
  actorId:'buyer',idempotencyKey:'wrong-sale-dates',productId:f.productId,kind:'SALE',startDate:start,returnDate:end}),
  error=>conflict(error,'INVALID_HOLD_REQUEST'));
});
