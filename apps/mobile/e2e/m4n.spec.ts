import {test,expect,type Page} from '@playwright/test';
const mode=process.env.M4N_MODE||'offline';
const offline=mode==='offline';
const tab=(page:Page,title:string)=>page.getByText(title,{exact:true}).last();

async function capture(page:Page,testInfo:{attach:(name:string,data:{body:Buffer;contentType:string})=>Promise<void>},label:string){
 await page.evaluate(()=>document.fonts.ready);
 await testInfo.attach(label,{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
}
test('five customer tabs render on phone and tablet with screenshots',async({page},info)=>{
 test.skip(!offline,'offline catalog screenshots only');
 await page.goto('/');
 await expect(page.getByText('이달의 셀렉션')).toBeVisible();
 for(const [label,heading] of [['렌탈','렌탈 컬렉션'],['스토어','스토어 상품'],['수선','수선 접수 절차'],['마이','방문을 환영합니다'],['홈','이달의 셀렉션']] as const){
  await tab(page,label).click();
  await expect(page.getByText(heading,{exact:true})).toBeVisible();
  await capture(page,info,'tab-'+label);
 }
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow,'horizontal page overflow in responsive viewport').toBeLessThanOrEqual(3);
});
test('search, product detail and rental calendar flow without charging',async({page},info)=>{
 test.skip(!offline,'offline UI navigation only');
 await page.goto('/');
 await page.getByRole('button',{name:'상품 검색'}).click();
 await expect(page.getByText('상품 검색',{exact:true}).first()).toBeVisible();
 await page.getByRole('textbox',{name:'상품 검색어'}).fill('Sera');
 await expect(page.getByText('The Sera Top Handle')).toBeVisible();
 await page.getByRole('button',{name:/The Sera Top Handle 상세 보기/}).click();
 await expect(page.getByText('The Sera Top Handle')).toBeVisible();
 await page.getByRole('button',{name:'렌탈 기간 선택'}).click();
 await expect(page.getByText('대여 기간 선택')).toBeVisible();
 await page.getByRole('textbox',{name:'대여 시작일 YYYY-MM-DD'}).fill('2026-11-10');
 await page.getByRole('textbox',{name:'반납 예정일 YYYY-MM-DD'}).fill('2026-11-13');
 await page.getByRole('button',{name:'입력한 날짜 적용'}).click();
 await expect(page.getByRole('button',{name:/3일 렌탈 견적 보기/})).toBeEnabled();
 await page.getByRole('button',{name:/3일 렌탈 견적 보기/}).click();
 await expect(page.getByText('예시 청구 합계')).toBeVisible();
 await expect(page.getByText(/184,000/)).toBeVisible();
 await expect(page.getByText(/실제 예약이나 결제가 아닙니다/)).toBeVisible();
 await capture(page,info,'rental-quote-preview');
});
test('wishlist is a visual state and keeps product in client navigation',async({page},info)=>{
 test.skip(!offline,'offline sample product only');
 await page.goto('/');
 await page.getByRole('button',{name:'찜 추가'}).first().click();
 await tab(page,'마이').click();
 await page.getByText('찜한 상품',{exact:true}).click();
 await expect(page.getByText('The Sera Top Handle')).toBeVisible();
 await capture(page,info,'wishlist-demo');
});
test('all interactive controls on home have nonempty accessible names',async({page},info)=>{
 test.skip(!offline,'offline home accessibility smoke');
 await page.goto('/');
 await expect(page.getByText('이달의 셀렉션')).toBeVisible();
 const unnamed=await page.locator('button, [role="button"], [role="tab"]').evaluateAll(nodes=>
  nodes.filter(node=>{
   const element=node as HTMLElement;
   const label=element.getAttribute('aria-label')||element.getAttribute('title')||element.innerText||'';
   return !label.trim()&&element.getBoundingClientRect().width>0;
  }).map(node=>node.outerHTML.slice(0,260)));
 await info.attach('accessible-name-audit',{body:Buffer.from(JSON.stringify({unnamed},null,2)),contentType:'application/json'});
 expect(unnamed,'visible interactive elements need accessible labels').toEqual([]);
});
test('unreachable Node API shows retry/error and never silently falls back to demo products',async({page},info)=>{
 test.skip(mode!=='api-unreachable','API failure scenario');
 await page.goto('/');
 await expect(page.getByText(/테스트 Node.js API 연결 모드/)).toBeVisible();
 await expect(page.getByText('연결 오류')).toBeVisible();
 await expect(page.getByRole('button',{name:'다시 시도'})).toBeVisible();
 await expect(page.getByText('The Sera Top Handle')).toHaveCount(0);
 await capture(page,info,'api-connection-error');
 await page.getByRole('button',{name:'다시 시도'}).click();
 await expect(page.getByText('연결 오류')).toBeVisible();
 await tab(page,'렌탈').click();
 await expect(page.getByText('연결 오류')).toBeVisible();
 await expect(page.getByText('The Sera Top Handle')).toHaveCount(0);
});
