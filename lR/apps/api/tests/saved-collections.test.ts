import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
const cfg=readConfig();
if(cfg.DB_NAME!=='lr_test'||cfg.NODE_ENV!=='test')throw Error('isolated test DB required');
const db=openPool(cfg),app=createApp(db,{demoMode:true});
let owner='',other='',itemId='',rentalOnly='';
const password='example-test-only-account-secret';
async function login(){
 const email=randomUUID().slice(0,16)+'@example.invalid';
 assert.equal((await request(app).post('/api/v1/auth/register').send({email,password})).status,201);
 const result=await request(app).post('/api/v1/auth/login').send({email,password});
 assert.equal(result.status,200);
 return result.body.data.accessToken as string;
}
const bearer=(token:string)=>'Bearer '+token;
before(async()=>{
 const suffix=randomUUID().slice(0,10);itemId='saved-store-'+suffix;rentalOnly='saved-rental-'+suffix;
 for(const id of [itemId,rentalOnly])
  await db.execute("INSERT INTO lr_products(id,title,brand,category,condition_grade,published,is_demo) VALUES(?,'Saved Demo','TEST','bag','A',1,1)",[id]);
 await db.execute("INSERT INTO lr_product_offers(id,product_id,channel,sale_price_krw,is_active) VALUES(?,?,'STORE',100000,1)",['off-'+itemId,itemId]);
 await db.execute("INSERT INTO lr_product_offers(id,product_id,channel,day_rate_krw,is_active) VALUES(?,?,'RENTAL',30000,1)",['off-'+rentalOnly,rentalOnly]);
 [owner,other]=await Promise.all([login(),login()]);
});
after(async()=>db.end());
test('wishlist is persistent and private; mutations are idempotent',async()=>{
 const path='/api/v1/me/wishlist';
 assert.equal((await request(app).get(path)).status,401);
 const saved=await request(app).post(path).set('Authorization',bearer(owner)).send({productId:itemId});
 assert.equal(saved.status,201,JSON.stringify(saved.body));
 assert.deepEqual(saved.body.data.productIds,[itemId]);
 assert.equal(saved.headers['cache-control'],'no-store');
 assert.equal((await request(app).post(path).set('Authorization',bearer(owner)).send({productId:itemId})).status,200);
 assert.deepEqual((await request(app).get(path).set('Authorization',bearer(other))).body.data.productIds,[]);
 assert.deepEqual((await request(app).get(path).set('Authorization',bearer(owner))).body.data.productIds,[itemId]);
 assert.equal((await request(app).delete(path+'/'+itemId).set('Authorization',bearer(other))).status,204);
 assert.deepEqual((await request(app).get(path).set('Authorization',bearer(owner))).body.data.productIds,[itemId]);
 assert.equal((await request(app).delete(path+'/'+itemId).set('Authorization',bearer(owner))).status,204);
 assert.deepEqual((await request(app).get(path).set('Authorization',bearer(owner))).body.data.productIds,[]);
});
test('cart only accepts valid STORE demo products and never client prices',async()=>{
 const path='/api/v1/me/cart';
 assert.equal((await request(app).post(path).send({productId:itemId})).status,401);
 assert.equal((await request(app).post(path).set('Authorization',bearer(owner)).send({productId:rentalOnly})).status,422);
 assert.equal((await request(app).post(path).set('Authorization',bearer(owner)).send({productId:itemId,price:1})).status,422);
 assert.equal((await request(app).post(path).set('Authorization',bearer(owner)).send({productId:itemId})).status,201);
 assert.deepEqual((await request(app).get(path).set('Authorization',bearer(owner))).body.data.productIds,[itemId]);
 assert.deepEqual((await request(app).get(path).set('Authorization',bearer(other))).body.data.productIds,[]);
 assert.equal((await request(app).delete(path+'/'+itemId).set('Authorization',bearer(owner))).status,204);
});
test('simultaneous identical saves create one item and gated production routes refuse access',async()=>{
 const path='/api/v1/me/wishlist';
 const results=await Promise.all(Array.from({length:8},()=>request(app).post(path).set('Authorization',bearer(owner)).send({productId:itemId})));
 assert.ok(results.every(x=>[200,201].includes(x.status)));
 assert.deepEqual((await request(app).get(path).set('Authorization',bearer(owner))).body.data.productIds,[itemId]);
 const off=createApp(db,{demoMode:false});
 assert.equal((await request(off).get(path).set('Authorization',bearer(owner))).status,501);
 assert.equal((await request(off).post('/api/v1/me/cart').set('Authorization',bearer(owner)).send({productId:itemId})).status,501);
});
