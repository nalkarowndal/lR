import test from 'node:test';
import assert from 'node:assert/strict';
import {getGeneratedDemoMedia,isGeneratedDemoMediaUrl} from '../src/domain/generated-media.ts';
import {parseProduct,ApiError} from '../src/api/client.ts';

const root='https://raw.githubusercontent.com/nalkarowndal/lR/main/lR/apps/mobile/assets/catalog/';
test('offline demo manifest exposes two explicitly identified views for each of four fictional products',()=>{
 const urls=[];
 for(const n of [1,2,3,4]){
  const id='demo-bag-0'+n;
  const media=getGeneratedDemoMedia(id);
  assert.equal(media.length,2);
  assert.equal(media[0].url,root+id+'-front.jpg');
  assert.equal(media[1].url,root+id+'-detail.jpg');
  assert.ok(media.every(x=>x.alt.includes('AI 생성')&&x.alt.includes('실물 사진 아님')));
  urls.push(...media.map(x=>x.url));
 }
 assert.equal(new Set(urls).size,8);
 assert.deepEqual(getGeneratedDemoMedia('not-a-demo-id'),[]);
 assert.ok(urls.every(isGeneratedDemoMediaUrl));
});
test('a known generated demo image is allowed without arbitrary external media host allowlisting',()=>{
 const sample={id:'demo-bag-01',brand:'DEMO',title:'The Sera Top Handle',category:'토트백',
  condition:'A',channels:['RENTAL','STORE'],dayRateKrw:28000,
  salePriceKrw:900000,depositKrw:100000,demo:true};
 const m=getGeneratedDemoMedia(sample.id);
 const previous=process.env.EXPO_PUBLIC_MEDIA_HOSTS;
 delete process.env.EXPO_PUBLIC_MEDIA_HOSTS;
 try{
  assert.deepEqual(parseProduct({...sample,media:m}).media,m);
  for(const wrong of [
   root+'../../anything.jpg',
   'https://raw.githubusercontent.com/other/repo/main/bag.jpg',
   root+'demo-bag-05-front.jpg',
   root+'demo-bag-01-front.svg',
   root+'demo-bag-01-front.jpg?download=1'
  ])assert.throws(()=>parseProduct({...sample,media:[{url:wrong,alt:m[0].alt}]}),ApiError);
 }finally{if(previous!==undefined)process.env.EXPO_PUBLIC_MEDIA_HOSTS=previous;}
});
