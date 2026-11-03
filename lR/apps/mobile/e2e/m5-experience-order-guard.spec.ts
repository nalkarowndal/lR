import {test,expect} from '@playwright/test';
const mode=process.env.M4N_MODE||'offline';
test('offline experience order deep links never claim a server-backed successful order',async({page})=>{
 test.skip(mode!=='offline','offline safety guard only');
 await page.goto('/experience-order-result?orderId=11111111-1111-4111-8111-111111111111');
 await expect(page.getByText('주문 내역 확인을 위해 로그인해 주세요',{exact:true})).toBeVisible();
 await expect(page.getByText('주문이 접수되었습니다',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'내 주문 내역 보기'}).click();
 await expect(page.getByText('주문 내역을 보려면 로그인해 주세요',{exact:true})).toBeVisible();
 await expect(page.getByText('접수된 주문',{exact:true})).toHaveCount(0);
});
