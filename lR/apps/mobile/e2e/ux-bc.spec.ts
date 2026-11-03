import {test,expect} from '@playwright/test';
const offline=(process.env.M4N_MODE||'offline')==='offline';
test('UX-BC: search filter category and grade without falsely ranking unloaded products',async({page},info)=>{
 test.skip(!offline,'synthetic offline catalog only');
 await page.goto('/');
 await page.getByRole('button',{name:'상품 검색'}).click();
 await expect(page.getByRole('button',{name:'가격 낮은 순'})).toBeVisible();
 await expect(page.getByText(/현재 불러온 상품에만 적용/)).toBeVisible();
 await page.getByRole('button',{name:'토트백'}).click();
 await expect(page.getByRole('button',{name:'The Sera Top Handle 상세 보기'})).toBeVisible();
 await expect(page.getByRole('button',{name:'The Lune Shoulder Bag 상세 보기'})).toHaveCount(0);
 await page.getByRole('button',{name:'B등급'}).click();
 await expect(page.getByText(/검색 조건에 맞는 상품이 없습니다/)).toBeVisible();
 await page.getByRole('button',{name:'검색어·필터 초기화'}).click();
 await expect(page.getByRole('button',{name:'The Lune Shoulder Bag 상세 보기'})).toBeVisible();
 await page.getByRole('button',{name:'가격 낮은 순'}).click();
 await expect(page.getByRole('button',{name:/ 상세 보기$/}).first())
  .toHaveAttribute('aria-label','The Atelier Bucket 상세 보기');
 await info.attach('search-filtered',{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
});
test('UX-BC: detail identifies original AI demo visuals and route-aware primary action',async({page},info)=>{
 test.skip(!offline,'offline demo product only');
 await page.goto('/product/demo-bag-01?channel=STORE');
 await expect(page.getByText(/AI로 만든 가상 상품 이미지입니다/)).toBeVisible();
 const buttons=page.getByRole('button');
 const shop=page.getByRole('button',{name:'스토어 시연 장바구니에 담기'});
 const rental=page.getByRole('button',{name:'렌탈 기간 선택'});
 await expect(shop).toBeVisible();await expect(rental).toBeVisible();
 await info.attach('product-detail-demo',{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
});
test('UX-BC: tablet 768px shows 3 grid columns and 1024px shows 4 without overflow',async({page},info)=>{
 test.skip(!offline||info.project.name!=='tablet-768','tablet-only focused responsive test');
 const firstRow=async()=>{
  const rects=await page.getByTestId('product-grid-item').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top));
  if(rects.length<4)return 0;
  return rects.filter(y=>Math.abs(y-rects[0])<3).length;
 };
 await page.goto('/');
 await expect(page.getByRole('button',{name:'The Sera Top Handle 상세 보기'})).toBeVisible();
 await expect.poll(firstRow).toBe(3);
 await page.setViewportSize({width:1024,height:768});
 await expect.poll(firstRow).toBe(4);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow).toBeLessThanOrEqual(3);
 await info.attach('tablet-1024-four-columns',{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
});
