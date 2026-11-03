import test from 'node:test';
import assert from 'node:assert/strict';
import {AuthError} from '../src/auth/api.ts';
import {createSavedCollectionsClient} from '../src/auth/saved-collections.ts';

const token='A'.repeat(44);
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
test('saved collection client requires demo response, unique short product IDs and proper auth',async()=>{
 const c=createSavedCollectionsClient('https://demo.example.test',async()=>response({data:{productIds:['bag-1','bag-2']},meta:{demo:true}}));
 assert.deepEqual(await c.list(token,'wishlist'),['bag-1','bag-2']);
 await assert.rejects(()=>c.list('invalid','cart'),AuthError);
 const fake=createSavedCollectionsClient('https://demo.example.test',async()=>response({data:{productIds:['bag-1']},meta:{demo:false}}));
 await assert.rejects(()=>fake.list(token,'wishlist'),AuthError);
 const duplicates=createSavedCollectionsClient('https://demo.example.test',async()=>response({data:{productIds:['bag-1','bag-1']},meta:{demo:true}}));
 await assert.rejects(()=>duplicates.list(token,'wishlist'),AuthError);
});
test('methods include bearer, no-store and only minimal product ID payload',async()=>{
 const seen=[];
 const c=createSavedCollectionsClient('http://127.0.0.1:4000',async(url,init)=>{
  seen.push({url,init});
  if(init.method==='DELETE')return new Response(null,{status:204});
  return response({data:{productIds:['item-1']},meta:{demo:true}},init.method==='POST'?201:200);
 });
 assert.deepEqual(await c.add(token,'wishlist','item-1'),['item-1']);
 await c.remove(token,'cart','item-1');
 assert.deepEqual(await c.list(token,'cart'),['item-1']);
 assert.deepEqual(seen.map(x=>x.init.method),['POST','DELETE','GET']);
 assert.ok(seen.every(x=>x.init.headers.Authorization==='Bearer '+token&&x.init.cache==='no-store'));
 assert.deepEqual(JSON.parse(seen[0].init.body),{productId:'item-1'});
 assert.ok(seen.every(x=>!x.url.includes(token)));
});
test('HTTP failures do not masquerade as successful saved item updates',async()=>{
 const c=createSavedCollectionsClient('https://demo.example.test',async()=>response({title:'Access denied',code:'FORBIDDEN'},403));
 await assert.rejects(()=>c.add(token,'cart','item-1'),error=>error instanceof AuthError&&error.status===403);
 assert.throws(()=>createSavedCollectionsClient('http://public.example.test'),AuthError);
});
