import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
const config=readConfig();
if(config.DB_NAME!=='lr_test'||config.NODE_ENV==='production')throw new Error('Refusing demo seed outside lr_test');
const pool=openPool(config);const conn=await pool.getConnection();
try{
 await conn.beginTransaction();
 await conn.execute(`INSERT INTO lr_products(id,title,brand,category,condition_grade,published,is_demo)
 VALUES('demo-bag-01','The Sera Top Handle','DEMO','토트백','A',1,1)
 ON DUPLICATE KEY UPDATE title=VALUES(title),published=1,is_demo=1`);
 await conn.execute(`INSERT INTO lr_product_offers(id,product_id,channel,day_rate_krw,deposit_krw,is_active)
 VALUES('demo-offer-rental-01','demo-bag-01','RENTAL',28000,100000,1)
 ON DUPLICATE KEY UPDATE day_rate_krw=VALUES(day_rate_krw),deposit_krw=VALUES(deposit_krw),is_active=1`);
 await conn.execute(`INSERT INTO lr_product_offers(id,product_id,channel,sale_price_krw,is_active)
 VALUES('demo-offer-store-01','demo-bag-01','STORE',900000,1)
 ON DUPLICATE KEY UPDATE sale_price_krw=VALUES(sale_price_krw),is_active=1`);
 for(const [id,serial] of [['demo-unit-01','TEST-DEMO-001'],['demo-unit-02','TEST-DEMO-002']]){
   await conn.execute(`INSERT INTO lr_inventory_units(id,product_id,serial,condition_grade,physical_state)
 VALUES(?, 'demo-bag-01', ?, 'A', 'READY') ON DUPLICATE KEY UPDATE physical_state='READY'`,[id,serial]);
 }
 await conn.execute(`INSERT INTO lr_inventory_holds(id,unit_id,kind,blocked_start_date,blocked_end_exclusive,expires_at,status,checkout_id)
 VALUES('demo-hold-01','demo-unit-01','RENTAL','2026-11-10','2026-11-13','2099-01-01 00:00:00','ACTIVE','demo-checkout-01')
 ON DUPLICATE KEY UPDATE blocked_start_date=VALUES(blocked_start_date),blocked_end_exclusive=VALUES(blocked_end_exclusive),status='ACTIVE'`);
 // First install supplies only synthetic editorial copy. Reseeding must never overwrite ADMIN edits.
 const hero=JSON.stringify({
  eyebrow:'CURATED FOR YOU',headline:'오늘의 스타일, 소유보다 자유롭게.',
  description:'다양한 시연용 컬렉션을 둘러보고 나에게 맞는 이용 방식을 찾아보세요.',
  ctaLabel:'렌탈 컬렉션 보기',ctaTarget:'RENTAL'
 });
 await conn.execute(
  'INSERT INTO lr_demo_editorial_home(id,draft,published,revision,published_revision) VALUES(1,?,?,1,1) '+
  'ON DUPLICATE KEY UPDATE id=id',[hero,hero]);
 await conn.commit();
 console.log('Seeded synthetic DEMO product + two physical units + one test hold in lr_test');
}catch(e){await conn.rollback();throw e;}finally{conn.release();await pool.end();}
