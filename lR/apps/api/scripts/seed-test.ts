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
 // Match the three other fictional offline catalog products in the isolated API catalog.
 // No external brand assets, orders or real inventory are created by this seed.
 for(const p of [
  {id:'demo-bag-02',title:'The Lune Shoulder Bag',category:'숄더백',condition:'A',
   dayRate:32000,salePrice:1180000,deposit:120000,serial:'TEST-DEMO-003'},
  {id:'demo-bag-03',title:'The Marais Mini',category:'크로스백',condition:'B',
   dayRate:22000,salePrice:560000,deposit:80000,serial:'TEST-DEMO-004'},
  {id:'demo-bag-04',title:'The Atelier Bucket',category:'버킷백',condition:'A',
   dayRate:19000,salePrice:480000,deposit:80000,serial:'TEST-DEMO-005'}
 ]){
  await conn.execute(`INSERT INTO lr_products(id,title,brand,category,condition_grade,published,is_demo)
   VALUES(?,?,'DEMO',?,?,1,1)
   ON DUPLICATE KEY UPDATE title=VALUES(title),brand='DEMO',category=VALUES(category),
    condition_grade=VALUES(condition_grade),published=1,is_demo=1`,
   [p.id,p.title,p.category,p.condition]);
  await conn.execute(`INSERT INTO lr_product_offers
   (id,product_id,channel,day_rate_krw,deposit_krw,is_active)
   VALUES(?,?,'RENTAL',?,?,1)
   ON DUPLICATE KEY UPDATE day_rate_krw=VALUES(day_rate_krw),
    deposit_krw=VALUES(deposit_krw),is_active=1`,
   ['demo-offer-rental-'+p.id.slice(-2),p.id,p.dayRate,p.deposit]);
  await conn.execute(`INSERT INTO lr_product_offers
   (id,product_id,channel,sale_price_krw,is_active)
   VALUES(?,?,'STORE',?,1)
   ON DUPLICATE KEY UPDATE sale_price_krw=VALUES(sale_price_krw),is_active=1`,
   ['demo-offer-store-'+p.id.slice(-2),p.id,p.salePrice]);
  await conn.execute(`INSERT INTO lr_inventory_units
   (id,product_id,serial,condition_grade,physical_state)
   VALUES(?,?,?,?,'READY')
   ON DUPLICATE KEY UPDATE product_id=VALUES(product_id),
    condition_grade=VALUES(condition_grade),physical_state='READY'`,
   ['demo-unit-'+String(Number(p.id.slice(-2))+1).padStart(2,'0'),p.id,p.serial,p.condition]);
 }
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
 console.log('Seeded four fictional DEMO products and isolated units with no real holds or charges');
}catch(e){await conn.rollback();throw e;}finally{conn.release();await pool.end();}
