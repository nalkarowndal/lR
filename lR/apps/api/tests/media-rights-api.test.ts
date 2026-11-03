import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
const cfg=readConfig();
if(cfg.DB_NAME!=='lr_test'||cfg.NODE_ENV!=='test')throw new Error('lr_test required');
const db=openPool(cfg),app=createApp(db,{demoMode:true}),disabled=createApp(db,{demoMode:false});
const ids=[randomUUID(),randomUUID(),randomUUID()],pass='synthetic-editorial-rights-2026';
before(async()=>{await db.query('SELECT 1')});
after(async()=>{
 await db.execute('DELETE FROM lr_demo_product_media WHERE id IN (?,?,?)',ids);
 delete process.env.APPROVED_MEDIA_HOSTS;
 await db.end();
});
async function admin(){
 const email=randomUUID().slice(0,12)+'@example.invalid';
 const r=await request(app).post('/api/v1/auth/register').send({email,password:pass});
 assert.equal(r.status,201);
 await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[r.body.data.userId]);
 const l=await request(app).post('/api/v1/auth/login').send({email,password:pass});
 return {token:l.body.data.accessToken,userId:r.body.data.userId};
}
test('product JSON explicitly has empty media by default and no public upload endpoint',async()=>{
 const list=await request(app).get('/api/v1/products?brand=DEMO');
 assert.equal(list.status,200);
 assert.deepEqual(list.body.data[0].media,[]);
 const detail=await request(app).get('/api/v1/products/demo-bag-01');
 assert.deepEqual(detail.body.data.media,[]);
 assert.equal((await request(app).post('/api/v1/admin/media-rights').send({url:'https://unlicensed.invalid/photo.jpg'})).status,404);
});
test('unapproved or nonallowlisted URLs never leave the API; sorted approved media requires evidence and reviewer',async()=>{
 const reviewer=await admin();
 const add=async(id:string,url:string,status:'PENDING'|'APPROVED',order:number,approved:boolean)=>{
  await db.execute(`INSERT INTO lr_demo_product_media
   (id,product_id,asset_url,alt,sort_order,rights_status,rights_evidence_ref,rights_reviewed_by,rights_reviewed_at)
   VALUES(?,'demo-bag-01',?,'허가된 시연용 가방 정면',?,?,?, ?, ?)`,[
    id,url,order,status,approved?'TEST_FIXTURE_ONLY':null,
    approved?reviewer.userId:null,approved?'2026-11-03 00:00:00':null
   ]);
 };
 await add(ids[0],'https://cdn.example.invalid/demo/faux-bag.webp','APPROVED',210,true);
 await add(ids[1],'https://cdn.example.invalid/demo/pending.jpg','PENDING',211,false);
 await add(ids[2],'https://unlicensed.invalid/photo/brand.webp','APPROVED',212,true);
 // Even an APPROVED status is insufficient unless an explicit approved origin exists.
 delete process.env.APPROVED_MEDIA_HOSTS;
 assert.deepEqual((await request(app).get('/api/v1/products/demo-bag-01')).body.data.media,[]);
 process.env.APPROVED_MEDIA_HOSTS='cdn.example.invalid';
 const product=await request(app).get('/api/v1/products/demo-bag-01');
 assert.equal(product.status,200);
 assert.deepEqual(product.body.data.media,[{
  url:'https://cdn.example.invalid/demo/faux-bag.webp',alt:'허가된 시연용 가방 정면'
 }]);
 const report=await request(app).get('/api/v1/admin/media-rights').set('Authorization','Bearer '+reviewer.token);
 assert.equal(report.status,200);
 const row=report.body.data.find((x:{productId:string})=>x.productId==='demo-bag-01');
 assert.equal(row.registeredCount,3);assert.equal(row.rightsApprovedCount,2);
 assert.equal(row.displayReady,true);
 assert.equal((await request(app).get('/api/v1/admin/media-rights')).status,401);
 assert.equal((await request(disabled).get('/api/v1/admin/media-rights')).status,501);
 // Never expose internal rights evidence, reviewer identity or administrator data in the public API.
 assert.equal(product.body.data.rights_evidence_ref,undefined);
 assert.equal(product.body.data.rights_reviewed_by,undefined);
});
