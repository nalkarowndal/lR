import {test,expect,type Page} from '@playwright/test';

const mode=process.env.M4N_MODE||'offline';
const setupCheckout=async(page:Page)=>{
 await page.goto('/product/demo-bag-01');
 await page.getByRole('button',{name:'렌탈 기간 선택'}).click();
 await page.getByRole('textbox',{name:'대여 시작일 YYYY-MM-DD'}).fill('2026-11-10');
 await page.getByRole('textbox',{name:'반납 예정일 YYYY-MM-DD'}).fill('2026-11-13');
 await page.getByRole('button',{name:'입력한 날짜 적용'}).click();
 await page.getByRole('button',{name:/3일 렌탈 견적 보기/}).click();
 await expect(page.getByText('예시 청구 합계')).toBeVisible();
 await page.getByRole('button',{name:'렌탈 주문서 미리보기 (실제 결제 없음)'}).click();
 await expect(page.getByText('렌탈 주문서 미리보기')).toBeVisible();
 await page.getByRole('button',{name:'시연 조건 확인'}).click();
};

const cases=[
 {outcome:'success',button:'모의 결제 성공 체험',result:'결제 시뮬레이션 성공'},
 {outcome:'failure',button:'모의 결제 실패 체험',result:'결제 시뮬레이션 실패'},
 {outcome:'canceled',button:'모의 결제 취소 체험',result:'결제 시뮬레이션 취소'}
] as const;

for(const scenario of cases){
 test('portfolio rental demo checkout '+scenario.outcome+' appears in My history without payment',async({page},info)=>{
  test.skip(mode!=='offline','offline browser demo flow only');
  await setupCheckout(page);
  await page.getByRole('button',{name:scenario.button}).click();
  await expect(page.getByText(scenario.result,{exact:true})).toBeVisible();
  await expect(page.getByText(/실제 결제·주문·예약은 발생하지 않았습니다/)).toBeVisible();
  await page.getByRole('button',{name:'마이페이지에서 모의 내역 보기'}).click();
  await expect(page.getByText('모의 렌탈 이용 내역',{exact:true})).toBeVisible();
  await expect(page.getByText(scenario.result,{exact:true})).toBeVisible();
  await expect(page.getByText(/The Sera Top Handle/)).toBeVisible();
  expect(await page.getByText(/모의 주문 번호:/).count()).toBe(1);
  await info.attach('demo-checkout-'+scenario.outcome,{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  await page.reload();
  await expect(page.getByText('모의 내역이 없습니다')).toBeVisible();
 });
}
