import test from 'node:test';
import assert from 'node:assert/strict';
import {createApiClient,ApiError} from '../src/api/client.ts';
import {createDemoAuthClient,AuthError} from '../src/auth/api.ts';
import {randomUUID} from 'node:crypto';

const client=createApiClient(process.env.TEST_API_URL||'http://127.0.0.1:4000');
test('M4 client reads real MySQL-backed list and product details over HTTP',async()=>{
 const page=await client.list({channel:'RENTAL',q:'Sera',limit:20});
 const item=page.products.find(x=>x.id==='demo-bag-01');
 assert.ok(item,'must find seeded item from live Node API');
 assert.equal(item.dayRateKrw,28000);
 assert.equal(item.salePriceKrw,900000);
 assert.equal(item.demo,true);
 const detail=await client.product('demo-bag-01');
 assert.equal(detail.brand,'DEMO');assert.deepEqual(detail.channels,['RENTAL','STORE']);
});
test('M4 client checks real test inventory hold and adjacent rental dates',async()=>{
 const busy=await client.availability('demo-bag-01','2026-11-10','2026-11-13');
 assert.equal(busy.rentalDays,3);
 assert.equal(busy.eligibleUnitCount,1);
 assert.equal(busy.available,true);
 const adjacent=await client.availability('demo-bag-01','2026-11-13','2026-11-15');
 assert.equal(adjacent.eligibleUnitCount,2);
});
test('M4 client displays exact server quote amounts, never local calculated prices',async()=>{
 const result=await client.quote({productId:'demo-bag-01',startDate:'2026-11-10',returnDate:'2026-11-13'});
 assert.equal(result.dayRateKrw,28000);
 assert.equal(result.rentalFeeKrw,84000);
 assert.equal(result.payableNowKrw,184000);
 assert.equal(result.demo,true);
 assert.equal(result.policyVersionId,'demo-only');
});
test('real backend 404 response stays an API error and never becomes demo result',async()=>{
 await assert.rejects(()=>client.product('not-found'),
  e=>e instanceof ApiError&&e.status===404&&e.code==='NOT_FOUND');
});

test('M5 demo user can register, log in, verify /me, rotate, and revoke via live Node/MySQL',async()=>{
 const base=process.env.TEST_API_URL||'http://127.0.0.1:4000';
 const auth=createDemoAuthClient(base);
 const email='m5-'+randomUUID().slice(0,16)+'@example.invalid';
 const password='isolated-demo-password-2026';
 const registered=await auth.register(email,password);
 assert.equal(registered.email,email);
 const signed=await auth.login(email,password);
 assert.equal(signed.demo,true);
 assert.equal(signed.userId,registered.userId);
 const me=await auth.me(signed.accessToken);
 assert.deepEqual(me.roles,['CUSTOMER']);
 const rotated=await auth.refresh(signed.accessToken);
 assert.notEqual(rotated.accessToken,signed.accessToken);
 await assert.rejects(()=>auth.me(signed.accessToken),e=>e instanceof AuthError&&e.status===401);
 const me2=await auth.me(rotated.accessToken);
 assert.equal(me2.userId,registered.userId);
 await auth.logout(rotated.accessToken);
 await assert.rejects(()=>auth.me(rotated.accessToken),e=>e instanceof AuthError&&e.status===401);
});
