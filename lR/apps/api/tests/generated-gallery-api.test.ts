import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
import {createApp} from '../src/app.js';

const cfg=readConfig();
if(cfg.DB_NAME!=='lr_test'||cfg.NODE_ENV!=='test')throw new Error('Generated demo assets require isolated lr_test');
const pool=openPool(cfg),app=createApp(pool,{demoMode:true});
const ids=['demo-bag-01','demo-bag-02','demo-bag-03','demo-bag-04'];
const hosted='https://raw.githubusercontent.com/nalkarowndal/lR/main/lR/apps/mobile/assets/catalog/';
before(async()=>{await pool.query('SELECT 1')});
after(async()=>{await pool.end()});

test('all four offline DEMO catalog products are present through real test API with independent offer prices',async()=>{
 const r=await request(app).get('/api/v1/products?brand=DEMO&limit=20');
 assert.equal(r.status,200,JSON.stringify(r.body));
 assert.deepEqual(r.body.data.map((p:{id:string})=>p.id),ids);
 assert.deepEqual(r.body.data.map((p:{salePriceKrw:number})=>p.salePriceKrw),
  [900000,1180000,560000,480000]);
 assert.deepEqual(r.body.data.map((p:{dayRateKrw:number})=>p.dayRateKrw),
  [28000,32000,22000,19000]);
 assert.ok(r.body.data.every((p:{demo:boolean;channels:string[]})=>
  p.demo&&p.channels.includes('STORE')&&p.channels.includes('RENTAL')));
});

test('each fictional demo product has precisely 2 unique generated local-asset gallery views with honest alt',async()=>{
 const r=await request(app).get('/api/v1/products?brand=DEMO');
 assert.equal(r.status,200);
 const seen=new Set<string>();
 for(let index=0;index<ids.length;index++){
  const p=r.body.data[index];
  assert.equal(p.id,ids[index]);
  assert.equal(p.media.length,2,p.id);
  for(const [i,m] of p.media.entries()){
   assert.equal(m.url,hosted+p.id+'-'+(i===0?'front':'detail')+'.jpg');
   assert.match(m.alt,/AI 생성/);
   assert.match(m.alt,/실물 사진 아님/);
   assert.equal(seen.has(m.url),false);
   seen.add(m.url);
  }
  const d=await request(app).get('/api/v1/products/'+p.id);
  assert.deepEqual(d.body.data.media,p.media);
 }
 assert.equal(seen.size,8);
});

test('disabling outside test database remains safe; manual uploaded media still requires separate allowlist',async()=>{
 const env=process.env.APPROVED_MEDIA_HOSTS;
 delete process.env.APPROVED_MEDIA_HOSTS;
 try{
  const result=await request(app).get('/api/v1/products/demo-bag-02');
  assert.equal(result.body.data.media.length,2);
  assert.ok(result.body.data.media.every((m:{url:string})=>m.url.startsWith(hosted)));
 }finally{
  if(env===undefined)delete process.env.APPROVED_MEDIA_HOSTS;
  else process.env.APPROVED_MEDIA_HOSTS=env;
 }
});
