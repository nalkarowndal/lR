import test from 'node:test';
import assert from 'node:assert/strict';
import {AuthError} from '../src/auth/api.ts';
import {createAdminDemoOrdersClient,parseAdminDemoList,parseAdminDemoDetail} from '../src/auth/admin-demo-orders.ts';

const token='X'.repeat(44);
const row={
 orderId:'11111111-1111-4111-8111-111111111111',productId:'audit-demo-001',
 title:'QA Synthetic Rental',startDate:'2026-11-10',returnDate:'2026-11-13',rentalDays:3,
 rentalFeeKrw:36000,depositKrw:25000,payableKrw:61000,
 status:'SIMULATED_PAID',policyVersion:'demo-only',createdAt:'2026-11-03 03:39:00.000',demo:true
};
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
test('test admin list requires explicit demo contract and server-calculated safe currency',()=>{
 const parsed=parseAdminDemoList({data:[row],meta:{demo:true,page:{limit:20,offset:0}}});
 assert.equal(parsed.length,1);assert.equal(parsed[0].status,'SIMULATED_PAID');
 assert.equal(parsed[0].payableKrw,61000);
 assert.throws(()=>parseAdminDemoList({data:[{...row,demo:false}],meta:{demo:true,page:{limit:20,offset:0}}}),AuthError);
 assert.throws(()=>parseAdminDemoList({data:[{...row,payableKrw:1}],meta:{demo:true,page:{limit:20,offset:0}}}),AuthError);
 assert.throws(()=>parseAdminDemoList({data:[{...row,status:'CONFIRMED'}],meta:{demo:true,page:{limit:20,offset:0}}}),AuthError);
 assert.throws(()=>parseAdminDemoList({data:[],meta:{demo:false,page:{limit:20,offset:0}}}),AuthError);
});
test('test-only admin detail accepts audit history and rejects fake external reference data',()=>{
 const data={...row,audit:[{action:'CREATED',createdAt:'2026-11-03 03:30:00.000'}],
  events:[{status:'DONE',resultStatus:'SIMULATED_PAID',verifiedAmountKrw:61000,createdAt:'2026-11-03 03:31:00.000'}]};
 const parsed=parseAdminDemoDetail({data,meta:{demo:true}});
 assert.equal(parsed.audit[0].action,'CREATED');
 assert.equal(parsed.events[0].status,'DONE');
 assert.throws(()=>parseAdminDemoDetail({data:{...data,events:[{...data.events[0],verifiedAmountKrw:10}]},meta:{demo:true}}),AuthError);
 assert.throws(()=>parseAdminDemoDetail({data:{...data,policyVersion:'approved'} ,meta:{demo:true}}),AuthError);
});
test('admin ledger client uses existing bearer token, no-store and GET without payment mutations',async()=>{
 const seen=[];
 const client=createAdminDemoOrdersClient('http://127.0.0.1:4000',async(url,init)=>{
  seen.push({url,method:init.method,body:init.body,headers:init.headers,cache:init.cache});
  return reply(url.endsWith('/11111111-1111-4111-8111-111111111111')?
   {data:{...row,audit:[],events:[]},meta:{demo:true}}:
   {data:[row],meta:{demo:true,page:{limit:20,offset:0}}});
 });
 const items=await client.list(token);
 const detail=await client.detail(token,row.orderId);
 assert.equal(items.length,1);assert.equal(detail?.orderId,row.orderId);
 assert.equal(seen.length,2);
 for(const x of seen){
  assert.equal(x.method,'GET');assert.equal(x.body,undefined);
  assert.equal(x.headers.Authorization,'Bearer '+token);
  assert.equal(x.cache,'no-store');
  assert.ok(!x.url.includes(token));
 }
 assert.throws(()=>createAdminDemoOrdersClient('http://example.com:4000'),AuthError);
});
test('admin client cannot silently fabricate rows on missing session or 403',async()=>{
 const c=createAdminDemoOrdersClient('https://example.test',async()=>reply({title:'접근 권한이 없습니다',code:'FORBIDDEN'},403));
 await assert.rejects(()=>c.list(token),e=>e instanceof AuthError&&e.status===403);
 await assert.rejects(()=>c.list('invalid'),AuthError);
 await assert.rejects(()=>c.detail(token,'not-an-id'),AuthError);
});
