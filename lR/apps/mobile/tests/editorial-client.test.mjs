import test from 'node:test';
import assert from 'node:assert/strict';
import {AuthError} from '../src/auth/api.ts';
import {createEditorialClient,parsePublishedEditorial,parseAdminEditorial,parseRightsReport,defaultHomeEditorial} from '../src/auth/editorial.ts';
const token='x'.repeat(48);
const copy={eyebrow:'CURATED FOR YOU',headline:'오늘의 시연 컬렉션',description:'저작권과 보안이 보호된 포트폴리오 전용 문구입니다.',
 ctaLabel:'렌탈 둘러보기',ctaTarget:'RENTAL'};
const pub={data:{slot:'HOME_HERO',copy,revision:2,demo:true}};
const admin={data:{slot:'HOME_HERO',draft:copy,published:copy,revision:2,publishedRevision:2,demo:true}};
const report={data:[{productId:'demo-bag-01',title:'The Sera Top Handle',registeredCount:0,rightsApprovedCount:0,
 displayReady:false,reason:'사용권 증빙이 아직 없어 시연용 일러스트를 표시합니다'}],meta:{demo:true}};
const ok=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json'}});
test('published and admin editorial contracts validate content and whitelist CTA only',()=>{
 assert.equal(parsePublishedEditorial(pub).copy.headline,copy.headline);
 assert.equal(parseAdminEditorial(admin).revision,2);
 assert.equal(defaultHomeEditorial.ctaTarget,'RENTAL');
 for(const unsafe of [
  {...pub,data:{...pub.data,copy:{...copy,ctaTarget:'https://evil.invalid'}}},
  {...pub,data:{...pub.data,copy:{...copy,headline:'<script>alert(1)</script>'}}},
  {...pub,data:{...pub.data,copy:{...copy,description:'http://unsafe.invalid/image.jpg'}}},
  {...pub,data:{...pub.data,demo:false}},
  {...pub,data:{...pub.data,draft:copy}}
 ])assert.throws(()=>parsePublishedEditorial(unsafe),AuthError);
 assert.throws(()=>parseAdminEditorial({data:{...admin.data,revision:1,publishedRevision:2}}),AuthError);
 assert.equal(parseRightsReport(report)[0].displayReady,false);
 assert.throws(()=>parseRightsReport({data:[{...report.data[0],displayReady:'yes'}]}),AuthError);
});
test('client fetches published snapshot without bearer and saves/admin-publishes only with bearer',async()=>{
 const calls=[];
 const client=createEditorialClient('http://127.0.0.1:4000',async(url,init)=>{
  calls.push({url,init});
  if(url.endsWith('/api/v1/editorial/home'))return ok(pub);
  if(url.endsWith('/draft'))return ok({data:{...admin.data,draft:copy,revision:3,publishedRevision:2}});
  if(url.endsWith('/publish'))return ok({data:{...admin.data,revision:4,publishedRevision:4}});
  if(url.endsWith('/media-rights'))return ok(report);
  return ok(admin);
 });
 assert.equal((await client.published()).revision,2);
 assert.equal((await client.adminRead(token)).revision,2);
 assert.equal((await client.adminDraft(token,2,copy)).revision,3);
 assert.equal((await client.adminPublish(token,3)).revision,4);
 assert.equal((await client.mediaRights(token)).length,1);
 assert.deepEqual(calls.map(x=>x.init.method),['GET','GET','PUT','POST','GET']);
 assert.equal(calls[0].init.headers.Authorization,undefined);
 assert.ok(calls.slice(1).every(x=>x.init.headers.Authorization==='Bearer '+token));
 assert.ok(calls.every(x=>x.init.cache==='no-store'));
 assert.deepEqual(JSON.parse(calls[2].init.body),{expectedRevision:2,copy});
});
test('requires valid admin session and rejects unsafe draft before POST; errors are explicit',async()=>{
 const client=createEditorialClient('https://editorial.example.invalid',async()=>ok({
  code:'FORBIDDEN',title:'접근 권한이 없습니다'},403));
 await assert.rejects(()=>client.adminRead('not-a-token'),AuthError);
 await assert.rejects(()=>client.adminRead(token),e=>e instanceof AuthError&&e.status===403);
 await assert.rejects(()=>client.adminDraft(token,1,{...copy,headline:'<b>bad</b>'}),AuthError);
 await assert.rejects(()=>client.adminPublish(token,0),AuthError);
 const offline=createEditorialClient('https://editorial.example.invalid',async()=>{throw Error('offline')});
 await assert.rejects(()=>offline.published(),/연결/);
 assert.throws(()=>createEditorialClient('http://remote.example.invalid'),AuthError);
});
