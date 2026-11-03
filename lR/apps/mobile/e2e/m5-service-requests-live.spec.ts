import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
/** Real isolated MySQL & Express. No photos, money, shipping or actual goods. */
test('repair and consignment forms persist receipts; customer can cancel and reload',async({page})=>{
 test.skip(process.env.M4N_MODE!=='experience-live','requires isolated service request test API');
 const email='svc-'+randomUUID().slice(0,13)+'@example.invalid';
 const password='synthetic-service-passphrase-2026';
 await page.goto('/my/login');
 await page.getByRole('button',{name:'테스트 계정 새로 만들기'}).click();
 await page.getByRole('textbox',{name:'테스트 이메일'}).fill(email);
 await page.getByRole('textbox',{name:'테스트 비밀번호'}).fill(password);
 await page.getByRole('button',{name:'테스트 계정 생성하기'}).click();
 await expect(page.getByText(/시연 계정을 생성했습니다/)).toBeVisible();
 await page.getByRole('textbox',{name:'테스트 비밀번호'}).fill(password);
 await page.getByRole('button',{name:'테스트 계정 로그인'}).click();
 await expect(page.getByText('테스트 계정: '+email)).toBeVisible();

 await page.getByRole('button',{name:'수선 서비스'}).click();
 await page.getByRole('button',{name:'수선 신청서 작성하기'}).click();
 await page.getByRole('textbox',{name:'수선 대상 물품'}).fill('시연용 가죽가방');
 await page.getByRole('textbox',{name:'수선이 필요한 내용'}).fill('합성 가방의 모서리 가죽 마모 시연 설명입니다.');
 const repaired=page.waitForResponse(r=>r.url().endsWith('/api/v1/service-requests')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'수선 신청 접수'}).click();
 expect((await repaired).status()).toBe(201);
 await expect(page.getByText('수선 신청 접수 정보',{exact:true})).toBeVisible();
 await expect(page.getByText('진행 상태: 접수 완료')).toBeVisible();
 const repairRef=await page.getByText(/^접수번호: /).textContent();
 expect(repairRef).toMatch(/^접수번호: [0-9a-f-]{36}$/);
 await page.getByRole('button',{name:'내 수선·위탁 신청 내역 보기'}).click();
 await expect(page.getByText('접수한 신청',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:/수선 · 시연용 가죽가방/}).click();
 const canceled=page.waitForResponse(r=>r.url().includes('/api/v1/service-requests/')&&r.url().endsWith('/cancel'));
 await page.getByRole('button',{name:'시연 신청 취소'}).click();
 expect((await canceled).status()).toBe(200);
 await expect(page.getByText('진행 상태: 신청 취소')).toBeVisible();
 await page.getByRole('button',{name:'마이페이지로 돌아가기'}).click();
 await expect(page.getByText('테스트 계정: '+email)).toBeVisible();

 await page.getByRole('button',{name:/명품 위탁 판매/}).click();
 await page.getByRole('textbox',{name:'위탁 판매 브랜드'}).fill('DEMO');
 await page.getByRole('button',{name:'다음 · 제품 종류'}).click();
 await page.getByRole('textbox',{name:'위탁 판매 품목'}).fill('시연용 숄더백');
 await page.getByRole('button',{name:'다음 · 제품 상태'}).click();
 await page.getByRole('textbox',{name:'물품 상태 설명'}).fill('합성 테스트 상품 사용감 시연');
 const consigned=page.waitForResponse(r=>r.url().endsWith('/api/v1/service-requests')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'위탁 신청 접수'}).click();
 expect((await consigned).status()).toBe(201);
 await expect(page.getByText('위탁 신청 접수 정보',{exact:true})).toBeVisible();
 await expect(page.getByText('진행 상태: 접수 완료')).toBeVisible();
 await page.getByRole('button',{name:'내 수선·위탁 신청 내역 보기'}).click();
 await expect(page.getByRole('button',{name:/수선 · 시연용 가죽가방/})).toBeVisible();
 await expect(page.getByRole('button',{name:/위탁 · DEMO 시연용 숄더백/})).toBeVisible();

 // Web tokens stay memory-only; rows survive a reload + fresh login.
 await page.reload();
 await page.goto('/my/login');
 await page.getByRole('textbox',{name:'테스트 이메일'}).fill(email);
 await page.getByRole('textbox',{name:'테스트 비밀번호'}).fill(password);
 await page.getByRole('button',{name:'테스트 계정 로그인'}).click();
 await expect(page.getByText('테스트 계정: '+email)).toBeVisible();
 await page.getByRole('button',{name:'내 수선·위탁 신청 내역'}).click();
 await expect(page.getByRole('button',{name:/위탁 · DEMO 시연용 숄더백/})).toBeVisible();
 await expect(page.getByRole('button',{name:/수선 · 시연용 가죽가방/})).toBeVisible();
});
