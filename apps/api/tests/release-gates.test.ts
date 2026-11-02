import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import type {Database} from '../src/db.js';
import {createApp} from '../src/app.js';
// These routes are intentionally blocked even when no database connection is available.
const fakeDb={} as Database;
test('release gate: every real money and fulfillment mutation remains 501',async()=>{
 const app=createApp(fakeDb,{demoMode:false});
 for(const [method,path] of [
  ['post','/api/v1/payments/confirm'],['post','/api/v1/orders'],
  ['post','/api/v1/rentals'],['post','/api/v1/service-requests'],
  ['post','/api/v1/auth/register']
 ] as const){
  const res=await request(app)[method](path).send({});
  assert.equal(res.status,501,path);
  assert.equal(res.headers['x-powered-by'],undefined);
  assert.equal(res.headers['x-content-type-options'],'nosniff');
  assert.ok(!JSON.stringify(res.body).includes('testpass'));
 }
});
test('release gate: admin and service demo endpoints cannot bypass 501 with a bearer string',async()=>{
 const app=createApp(fakeDb,{demoMode:false});
 for(const path of ['/api/v1/admin/service-requests','/api/v1/service-requests']){
  const res=await request(app).get(path).set('Authorization','Bearer '+('a'.repeat(50)));
  assert.equal(res.status,501);
  assert.equal(res.headers['cache-control'],'no-store');
 }
});
test('release gate: CORS does not reflect suffix origin, wildcard or arbitrary OPTIONS',async()=>{
 const allowed='https://mobile.example.invalid';
 const app=createApp(fakeDb,{demoMode:false,corsOrigins:[allowed]});
 const good=await request(app).options('/api/v1/products').set('Origin',allowed)
  .set('Access-Control-Request-Method','GET');
 assert.equal(good.status,204);
 assert.equal(good.headers['access-control-allow-origin'],allowed);
 for(const origin of [allowed+'.evil.example','https://notallowed.example.invalid','null']){
  const res=await request(app).options('/api/v1/products').set('Origin',origin)
   .set('Access-Control-Request-Method','GET');
  assert.equal(res.headers['access-control-allow-origin'],undefined);
 }
});
test('release gate: uncaught database failures never return internal SQL or secrets',async()=>{
 const app=createApp({query:async()=>{throw new Error('db password testpass SQL SELECT private_table')}} as unknown as Database,
 {demoMode:false});
 const res=await request(app).get('/ready');
 assert.equal(res.status,503);
 assert.ok(!JSON.stringify(res.body).includes('testpass'));
 assert.ok(!JSON.stringify(res.body).includes('private_table'));
});
