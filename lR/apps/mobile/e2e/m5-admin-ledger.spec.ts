import {test,expect} from '@playwright/test';
const mode=process.env.M4N_MODE||'offline';

test('M5-2C2 admin ledger deep link denies unauthenticated browser without fabricating data',async({page})=>{
 test.skip(mode!=='offline','offline browser only');
 await page.goto('/my/admin-demo-orders');
 await expect(page.getByText('관리자 로그인이 필요합니다',{exact:true})).toBeVisible();
 await expect(page.getByText('QA Synthetic Rental')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'마이페이지로 돌아가기'})).toBeVisible();
});
