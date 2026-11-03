import test from 'node:test';
import assert from 'node:assert/strict';
import {AuthError} from '../src/auth/api.ts';
import {createServiceRequestsClient,parseServiceRecord,parseServiceList} from '../src/auth/service-requests.ts';
const id='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222';
const token='x'.repeat(48),draft={kind:'REPAIR',itemName:'테스트 가죽가방',details:'합성 상품의 모서리 가죽 마모를 시연합니다.'};
const row={id,ownerId:user,...draft,status:'SUBMITTED',policyVersion:'demo-only',
 createdAt:'2026-11-03 00:00:00',updatedAt:'2026-11-03 00:00:00',demo:true,
 disclaimer:'테스트용, 실제 수선이나 계약이 없습니다',replayed:false};
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
test('service response parsing requires demo-only policy and safe explicit status',()=>{
 assert.equal(parseServiceRecord({data:row}).status,'SUBMITTED');
 assert.equal(parseServiceList({data:[row]}).length,1);
 for(const bad of [
  {...row,demo:false},{...row,policyVersion:'real'},{...row,status:'PAID'},
  {...row,kind:'DELIVERY'},{...row,id:'123'}, {...row,details:'too short'}
 ])assert.throws(()=>parseServiceRecord({data:bad}),AuthError);
 assert.throws(()=>parseServiceList({data:new Array(51).fill(row)}),AuthError);
});
test('service client creates, reads, cancels and queries ADMIN through authenticated no-store API',async()=>{
 const calls=[];
 const client=createServiceRequestsClient('http://127.0.0.1:4000',async(url,init)=>{
  calls.push({url,init});
  if(url.endsWith('/api/v1/service-requests')&&init.method==='POST')return response({data:row},201);
  if(url.includes('?limit='))return response({data:[row]});
  return response({data:{...row,status:url.includes('/cancel')?'CANCELED':'UNDER_REVIEW'}});
 });
 const created=await client.create(token,id,draft);
 assert.equal(created.id,id);
 assert.equal((await client.list(token)).length,1);
 assert.equal((await client.detail(token,id)).id,id);
 assert.equal((await client.cancel(token,id)).status,'CANCELED');
 assert.equal((await client.adminList(token)).length,1);
 assert.equal((await client.adminStatus(token,id,'UNDER_REVIEW')).status,'UNDER_REVIEW');
 assert.deepEqual(calls.map(x=>x.init.method),['POST','GET','GET','POST','GET','PATCH']);
 assert.deepEqual(JSON.parse(calls[0].init.body),draft);
 assert.equal(calls[0].init.headers['Idempotency-Key'],id);
 assert.ok(calls.every(x=>x.init.headers.Authorization==='Bearer '+token&&x.init.cache==='no-store'));
});
test('service client rejects invalid body/key/session, network errors and unauthorized responses',async()=>{
 const deny=createServiceRequestsClient('https://example.test',async()=>response({code:'FORBIDDEN',title:'접근 권한이 없습니다'},403));
 await assert.rejects(()=>deny.list(token),e=>e instanceof AuthError&&e.status===403);
 await assert.rejects(()=>deny.adminList('invalid'),AuthError);
 await assert.rejects(()=>deny.create(token,id,{...draft,details:'short'}),AuthError);
 await assert.rejects(()=>deny.create(token,'not-uuid',draft),AuthError);
 await assert.rejects(()=>deny.detail(token,'not-uuid'),AuthError);
 const fail=createServiceRequestsClient('https://example.test',async()=>{throw new Error('socket down')});
 await assert.rejects(()=>fail.list(token),/연결/);
 assert.throws(()=>createServiceRequestsClient('http://example.test'),AuthError);
});
