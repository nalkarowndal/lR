import test from 'node:test';
import assert from 'node:assert/strict';
import {AuthError,createDemoAuthClient,parseIdentity,parseLogin,parseRefresh,sessionIsCurrent,requireSecureDemoBaseUrl} from '../src/auth/api.ts';
const future=new Date(Date.now()+3_600_000).toISOString();
const token='X'.repeat(44);
const good={data:{userId:'test-id',email:'account@example.invalid',accessToken:token,expiresAt:future,tokenType:'Bearer',demo:true}};
const res=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
test('login forbids cleartext credentials/tokens over remote HTTP',()=>{
 for(const url of ['http://192.168.0.10:4000','http://example.com','ftp://localhost:4000','http://user:pass@localhost:4000']){
  assert.throws(()=>requireSecureDemoBaseUrl(url),AuthError);
 }
 assert.equal(requireSecureDemoBaseUrl('http://127.0.0.1:4000'),'http://127.0.0.1:4000');
 assert.equal(requireSecureDemoBaseUrl('https://api.test.example'),'https://api.test.example');
});
test('invalid or unverified session is rejected before any storage',()=>{
 assert.equal(sessionIsCurrent({accessToken:token,expiresAt:new Date(Date.now()-1000).toISOString()}),false);
 assert.equal(sessionIsCurrent({accessToken:'x',expiresAt:future}),false);
 assert.equal(sessionIsCurrent({accessToken:token,expiresAt:future}),true);
 assert.throws(()=>parseLogin({data:{...good.data,demo:false}}),AuthError);
 assert.throws(()=>parseRefresh({data:{accessToken:token,expiresAt:future,demo:false}}),AuthError);
});
test('profile roles come from server, not login form',()=>{
 assert.deepEqual(parseIdentity({data:{userId:'id',email:'account@example.invalid',roles:['CUSTOMER']}}).roles,['CUSTOMER']);
 assert.throws(()=>parseIdentity({data:{userId:'id',email:'account@example.invalid',roles:['OWNER']}}),AuthError);
});
test('login sends no-store password POST and immediately checks authenticated /me',async()=>{
 const seen=[];
 const client=createDemoAuthClient('http://127.0.0.1:4000',async(url,init)=>{
  seen.push({url,method:init.method,body:init.body,cache:init.cache,headers:init.headers});
  if(url.endsWith('/login'))return res(good);
  return res({data:{userId:'test-id',email:good.data.email,roles:['CUSTOMER']}});
 });
 const s=await client.login('account@example.invalid','example-password-2026');
 const profile=await client.me(s.accessToken);
 assert.equal(profile.userId,s.userId);
 assert.equal(seen.length,2);
 assert.equal(seen[0].method,'POST');
 assert.equal(JSON.parse(seen[0].body).password,'example-password-2026');
 assert.equal(seen[0].cache,'no-store');
 assert.equal(seen[1].headers.Authorization,'Bearer '+token);
 assert.ok(!seen[1].url.includes(token));
});
test('server 401 and 429 are preserved; never use an offline fake login',async()=>{
 const client=createDemoAuthClient('https://auth.example.test',async()=>res({title:'Unauthorized',code:'UNAUTHENTICATED'},401));
 await assert.rejects(()=>client.login('account@example.invalid','example-password-2026'),e=>e instanceof AuthError&&e.status===401);
 const limited=createDemoAuthClient('https://auth.example.test',async()=>res({title:'Rate Limited',code:'RATE_LIMITED'},429));
 await assert.rejects(()=>limited.login('account@example.invalid','example-password-2026'),e=>e instanceof AuthError&&e.status===429);
});
test('register does not authorize without a separate login',async()=>{
 const client=createDemoAuthClient('http://localhost:4000',async(_,init)=>{
  assert.equal(init.method,'POST');return res({data:{demo:true,userId:'new',email:'fake@example.invalid'}},201);
 });
 const result=await client.register('fake@example.invalid','example-password-2026');
 assert.deepEqual(result,{userId:'new',email:'fake@example.invalid'});
 await assert.rejects(()=>client.register('fake@example.invalid','short'),AuthError);
});
test('refresh rotates; logout receives only the token in Authorization header',async()=>{
 const seen=[];
 const client=createDemoAuthClient('https://auth.example.test',async(url,init)=>{
  seen.push({url,init});
  if(url.endsWith('/refresh'))return res({data:{demo:true,accessToken:'Y'.repeat(44),expiresAt:future}});
  return new Response(null,{status:204});
 });
 const refresh=await client.refresh(token);
 assert.equal(refresh.accessToken,'Y'.repeat(44));
 await client.logout(refresh.accessToken);
 assert.equal(seen[1].init.method,'POST');
 assert.equal(seen[1].init.headers.Authorization,'Bearer '+refresh.accessToken);
 assert.equal(seen[1].init.body,undefined);
});
