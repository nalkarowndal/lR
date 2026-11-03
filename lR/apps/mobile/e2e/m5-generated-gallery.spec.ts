import {test,expect} from '@playwright/test';
const names=['The Sera Top Handle','The Lune Shoulder Bag','The Marais Mini','The Atelier Bucket'];
const mode=process.env.M4N_MODE||'offline';
test('all four original AI DEMO product images load as real bundled image bytes without external hosts',async({page},info)=>{
 test.skip(mode==='api-unreachable','catalog API is deliberately unavailable');
 await page.goto('/');
 for(const name of names){
  await expect(page.getByRole('button',{name:name+' 상세 보기'}).filter({visible:true})).toBeVisible();
 }
 const pictures=page.getByTestId('product-media-image');
 await expect(pictures).toHaveCount(4);
 for(let i=0;i<4;i++){
  const photo=pictures.nth(i);
  await expect.poll(()=>photo.evaluate(n=>{
   const img=n.tagName==='IMG'?n:n.querySelector('img');
   return img?.naturalWidth||0;
  })).toBeGreaterThan(300);
  await expect(photo).toHaveAttribute('aria-label',/AI 생성/);
 }
 if(info.project.name==='tablet-768'){
  await page.setViewportSize({width:1024,height:768});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(3);
 }
 await info.attach('ai-demo-catalog',{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
});
test('AI demo gallery switches view, labels remain truthful, and full-size preview closes',async({page},info)=>{
 test.skip(mode==='api-unreachable','catalog API is deliberately unavailable');
 await page.goto('/product/demo-bag-01?channel=STORE');
 await expect(page.getByText(/AI로 만든 가상 상품 이미지입니다/)).toBeVisible();
 const viewTwo=page.getByRole('button',{name:/상품 이미지 2:/}).filter({visible:true});
 await expect(viewTwo).toBeVisible();
 await viewTwo.click();
 const main=page.getByTestId('product-media-image').filter({visible:true}).first();
 await expect(main).toHaveAttribute('aria-label',/확대/);
 await page.getByRole('button',{name:'사진 크게 보기'}).click();
 await expect(page.getByRole('button',{name:'확대 이미지 닫기'})).toBeVisible();
 const expanded=page.getByTestId('product-gallery-expanded');
 await expect(expanded).toBeVisible();
 await page.getByRole('button',{name:'확대 이미지 닫기'}).click();
 await expect(expanded).toHaveCount(0);
 await info.attach('ai-demo-gallery',{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
});
