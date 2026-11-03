import {test,expect,type Page} from '@playwright/test';
const mode=process.env.M4N_MODE||'offline';
const offline=mode==='offline';
const tab=(page:Page,name:string)=>page.getByText(name,{exact:true}).last();
async function capture(page:Page,info:{attach:(name:string,data:{body:Buffer;contentType:string})=>Promise<void>},label:string){
 await page.evaluate(()=>document.fonts.ready);
 await info.attach(label,{body:await page.screenshot({animations:'disabled',fullPage:true}),contentType:'image/png'});
}
test('QA-A: wishlist add, navigate, remove and empty states stay consistent in same tab',async({page},info)=>{
 test.skip(!offline,'local demo catalog only');
 await page.goto('/');
 await expect(page.getByRole('button',{name:'The Sera Top Handle 상세 보기'})).toBeVisible();
 await page.getByRole('button',{name:'찜 추가'}).first().click();
 await expect(page.getByRole('button',{name:'찜 해제'}).first()).toBeVisible();
 await tab(page,'마이').click();
 await expect(page.getByText('찜한 상품',{exact:true})).toBeVisible();
 await page.getByText('찜한 상품',{exact:true}).click();
 await expect(page.getByRole('button',{name:'The Sera Top Handle 상세 보기'})).toBeVisible();
 await expect(page.getByText(/1개 · 현재 앱 화면에서만 유지/)).toBeVisible();
 await capture(page,info,'wishlist-with-one-item');
 await page.getByRole('button',{name:'찜 해제'}).click();
 await expect(page.getByText('아직 찜한 상품이 없어요')).toBeVisible();
 await capture(page,info,'wishlist-after-removal');
});
test('QA-A: deep linked missing rental product has recovery route (tablet included)',async({page},info)=>{
 test.skip(!offline,'offline route fixture only');
 await page.goto('/rental/availability/missing-product-id');
 await expect(page.getByText('상품을 찾을 수 없습니다.')).toBeVisible();
 await expect(page.getByRole('button',{name:'렌탈 목록으로'})).toBeVisible();
 await capture(page,info,'missing-calendar-product-recovery');
 await page.getByRole('button',{name:'렌탈 목록으로'}).click();
 await expect(page.getByText('렌탈 컬렉션')).toBeVisible();
});
test('QA-A: calendar shows date cells at 360,390,768 and respects half-open rental dates',async({page},info)=>{
 test.skip(!offline,'offline product route only');
 await page.goto('/');
 await page.getByRole('button',{name:'The Sera Top Handle 상세 보기'}).click();
 await page.getByRole('button',{name:'렌탈 기간 선택'}).click();
 await expect(page.getByText('대여 기간 선택')).toBeVisible();
 const dateButtons=page.getByRole('button',{name:/\d{4}-\d{2}-\d{2}/});
 expect(await dateButtons.count()).toBeGreaterThanOrEqual(28);
 await page.getByRole('textbox',{name:'대여 시작일 YYYY-MM-DD'}).fill('2026-11-10');
 await page.getByRole('textbox',{name:'반납 예정일 YYYY-MM-DD'}).fill('2026-11-14');
 await page.getByRole('button',{name:'입력한 날짜 적용'}).click();
 await expect(page.getByText(/총 4일/)).toBeVisible();
 await expect(page.getByRole('button',{name:/4일 렌탈 견적 보기/})).toBeEnabled();
 await capture(page,info,'calendar-4-days-return-exclusive');
});
test('QA-A: invalid manual dates are explained without enabling quote',async({page})=>{
 test.skip(!offline,'offline fixture');
 await page.goto('/product/demo-bag-01');
 await page.getByRole('button',{name:'렌탈 기간 선택'}).click();
 await page.getByRole('textbox',{name:'대여 시작일 YYYY-MM-DD'}).fill('2026-11-16');
 await page.getByRole('textbox',{name:'반납 예정일 YYYY-MM-DD'}).fill('2026-11-15');
 await expect(page.getByRole('alert').filter({hasText:/날짜 형식과 순서/})).toBeVisible();
 await expect(page.getByRole('button',{name:'시작일과 반납일을 선택하세요'})).toBeDisabled();
});
