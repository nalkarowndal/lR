import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {createConnection} from 'mysql2/promise';
/** Browser against isolated test API + MySQL; no real media, commerce or production access. */
test('ADMIN edits a copy-only draft, public stays unchanged until publish, rights remain gated',async({page,request})=>{
 test.skip(process.env.M4N_MODE!=='experience-live','strictly isolated live test API required');
 if(process.env.DB_NAME!=='lr_test'||process.env.DB_HOST!=='127.0.0.1')
  throw new Error('Refuse editorial ADMIN fixture outside local lr_test');
 const base='http://127.0.0.1:4000';
 const email='editor-'+randomUUID().slice(0,13)+'@example.invalid';
 const password='synthetic-editorial-fixture-2026';
 const register=await request.post(base+'/api/v1/auth/register',{data:{email,password}});
 expect(register.status()).toBe(201);
 const userId=(await register.json()).data.userId;
 const connection=await createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),
  user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:'lr_test'});
 try{
  await connection.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[userId]);
  const previous=(await (await request.get(base+'/api/v1/editorial/home')).json()).data.copy.headline;
  await page.goto('/my/login');
  await page.getByRole('textbox',{name:'테스트 이메일'}).fill(email);
  await page.getByRole('textbox',{name:'테스트 비밀번호'}).fill(password);
  await page.getByRole('button',{name:'테스트 계정 로그인'}).click();
  await expect(page.getByText('테스트 계정: '+email).filter({visible:true})).toBeVisible();
  await page.getByRole('button',{name:'에디토리얼 관리'}).click();
  await expect(page.getByText('상품 이미지 사용권 점검',{exact:true})).toBeVisible();
  await expect(page.getByText(/사용권 검토 대기/).first()).toBeVisible();
  const changed='시연 에디토리얼 '+randomUUID().slice(0,8);
  await page.getByRole('textbox',{name:'에디토리얼 헤드라인'}).fill(changed);
  await page.getByRole('textbox',{name:'에디토리얼 버튼 문구'}).fill('스토어 컬렉션 보기');
  await page.getByRole('button',{name:'에디토리얼 이동 위치 스토어'}).click();
  const draft=page.waitForResponse(r=>r.url().endsWith('/api/v1/admin/editorial/home/draft')&&r.request().method()==='PUT');
  await page.getByRole('button',{name:'에디토리얼 초안 저장'}).click();
  expect((await draft).status()).toBe(200);
  await expect(page.getByText(/아직 고객 화면에는 게시되지 않았습니다/)).toBeVisible();
  const beforePublish=(await (await request.get(base+'/api/v1/editorial/home')).json()).data.copy;
  expect(beforePublish.headline).toBe(previous);
  const publish=page.waitForResponse(r=>r.url().endsWith('/api/v1/admin/editorial/home/publish')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'에디토리얼 게시'}).click();
  expect((await publish).status()).toBe(200);
  const published=(await (await request.get(base+'/api/v1/editorial/home')).json()).data;
  expect(published.copy.headline).toBe(changed);
  expect(published.copy.ctaTarget).toBe('STORE');
  expect(published.draft).toBeUndefined();
  await page.goto('/');
  await expect(page.getByTestId('home-editorial-headline')).toHaveText(changed);
  await page.getByRole('button',{name:'스토어 컬렉션 보기'}).click();
  await expect(page.getByText('스토어 상품',{exact:true})).toBeVisible();
 }finally{
  await connection.execute("DELETE FROM lr_user_roles WHERE user_id=? AND role='ADMIN'",[userId]);
  await connection.end();
 }
});
