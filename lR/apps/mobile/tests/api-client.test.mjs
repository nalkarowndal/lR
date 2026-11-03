import test from 'node:test';
import assert from 'node:assert/strict';
import {createApiClient,ApiError,parseProduct,parsePage,parseQuote,parseAvailability} from '../src/api/client.ts';

const sample={
 id:'demo-bag-01',title:'The Sera Top Handle',brand:'DEMO',category:'토트백',
 condition:'A',channels:['RENTAL','STORE'],dayRateKrw:28000,
 salePriceKrw:900000,depositKrw:100000,demo:true
};
const ok=(obj,status=200)=>new Response(JSON.stringify(obj),{
 status,headers:{'Content-Type':'application/json'}});
test('DTO maps real API product into UI product with fallback illustration',()=>{
 const p=parseProduct(sample);
 assert.equal(p.title,sample.title);
 assert.equal(p.dayRateKrw,28000);
 assert.equal(p.art.startsWith('#'),true);
 assert.deepEqual(p.channels,['RENTAL','STORE']);
});
test('null offer price is not advertised as available channel',()=>{
 const p=parseProduct({...sample,dayRateKrw:null,channels:['STORE']});
 assert.equal(p.dayRateKrw,0);
 assert.deepEqual(p.channels,['STORE']);
 assert.throws(()=>parseProduct({...sample,salePriceKrw:'900000'}),ApiError);
 assert.throws(()=>parseProduct({...sample,demo:undefined}),ApiError);
});
test('list sends encoded query and respects cursor/page envelope',async()=>{
 const urls=[];
 const client=createApiClient('https://example.test/',async(url)=>{
  urls.push(url);
  return ok({data:[sample],meta:{requestId:'req',page:{cursor:'demo-bag-01',hasNext:true}}});
 });
 const page=await client.list({q:'le sac & bag',channel:'RENTAL',cursor:'previous',limit:12});
 assert.equal(page.products.length,1);assert.equal(page.hasNext,true);
 assert.equal(page.cursor,'demo-bag-01');
 assert.ok(urls[0].includes('q=le+sac+%26+bag'));
 assert.ok(urls[0].includes('cursor=previous'));
 assert.ok(urls[0].includes('channel=RENTAL'));
});
test('detail URL escapes product ID and errors are not converted into demo data',async()=>{
 const client=createApiClient('https://example.test',(url)=>{
  assert.equal(url,'https://example.test/api/v1/products/a%2Fb');
  return Promise.resolve(ok({type:'about:blank',title:'상품 없음',status:404,code:'NOT_FOUND'},404));
 });
 await assert.rejects(()=>client.product('a/b'),
  err=>err instanceof ApiError&&err.status===404&&err.code==='NOT_FOUND');
});
test('unavailable network reports NETWORK without a sample product fallback',async()=>{
 const client=createApiClient('https://example.test',async()=>{throw new Error('offline')});
 await assert.rejects(()=>client.list({}),
  err=>err instanceof ApiError&&err.kind==='NETWORK');
});
test('availability adapter reads server physical-unit count',async()=>{
 const client=createApiClient('https://example.test',async()=>ok({
  data:{productId:'demo-bag-01',startDate:'2026-11-10',returnDate:'2026-11-13',
  rentalDays:3,available:true,eligibleUnitCount:1,demo:true}}));
 const value=await client.availability('demo-bag-01','2026-11-10','2026-11-13');
 assert.equal(value.eligibleUnitCount,1);assert.equal(value.available,true);
 assert.throws(()=>parseAvailability({data:{available:'yes'}}),ApiError);
});
test('server quotation is source of truth and remains demo only',async()=>{
 const client=createApiClient('https://example.test',async(_url,init)=>{
  assert.equal(init.method,'POST');
  assert.equal(JSON.parse(init.body).startDate,'2026-11-10');
  return ok({data:{quoteId:'quote-1',productId:'demo-bag-01',
   startDate:'2026-11-10',returnDate:'2026-11-13',rentalDays:3,
   dayRateKrw:28000,rentalFeeKrw:84000,discountKrw:0,shippingFeeKrw:0,
   depositKrw:100000,payableNowKrw:184000,quoteExpiresAt:'2026-11-02T05:00:00.000Z',
   policyVersionId:'demo-only',demo:true,disclaimer:'no charge'}});
 });
 const q=await client.quote({productId:'demo-bag-01',startDate:'2026-11-10',returnDate:'2026-11-13'});
 assert.equal(q.payableNowKrw,184000);
 assert.equal(q.rentalFeeKrw,84000);
 assert.equal(q.demo,true);
 assert.throws(()=>parseQuote({data:{...q,demo:false}}),ApiError);
});
test('corrupt catalog envelope cannot masquerade as an empty result',()=>{
 assert.throws(()=>parsePage({data:[],meta:{page:{cursor:4,hasNext:false}}}),ApiError);
 assert.throws(()=>parsePage({data:[],meta:{}}),ApiError);
});
test('abort signal cancels in-flight requests, not marked as offline',async()=>{
 const controller=new AbortController();
 const client=createApiClient('https://example.test',(_url,init)=>
  new Promise((_resolve,reject)=>{
   init.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true});
  }));
 const run=client.list({},controller.signal);
 controller.abort();
 await assert.rejects(run,/aborted/);
});
test('unconfigured URL cannot produce a mock HTTP request',()=>{
 assert.throws(()=>createApiClient('not-an-origin'),ApiError);
});

test('product media contract rejects insecure and deceptive external origins',()=>{
 const parsed=parseProduct({...sample,media:[
  {url:'https://cdn.example.invalid/catalog/bag.webp',alt:'제품 앞면 예시 사진'}
 ]});
 assert.equal(parsed.media.length,1);
 assert.equal(parsed.media[0].alt,'제품 앞면 예시 사진');
 for(const url of ['http://cdn.example.invalid/bag.jpg','data:image/png;base64,aaaa',
  'javascript:alert(1)','https://user:password@cdn.example.invalid/photo.jpg']){
  assert.throws(()=>parseProduct({...sample,media:[{url,alt:'테스트 사진'}]}),ApiError);
 }
 assert.throws(()=>parseProduct({...sample,media:[{url:'https://cdn.example.invalid/x.webp',alt:''}]}),ApiError);
 assert.throws(()=>parseProduct({...sample,media:Array(9).fill({url:'https://cdn.example.invalid/x.webp',alt:'테스트'})}),ApiError);
 assert.deepEqual(parseProduct(sample).media,[]);
});
