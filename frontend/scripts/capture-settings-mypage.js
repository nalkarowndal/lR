import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve(process.cwd(), '../docs/screenshots_phase2');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log('=== 설정 및 마이페이지 전용 고해상도 캡처 시작 ===');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,950', '--force-device-scale-factor=1.5']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // 1. 비로그인 상태에서 톱니바퀴 클릭 -> 공통 설정 페이지 캡처
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    const settingsBtn = document.querySelector('button[aria-label="설정 센터로 이동"]');
    if (settingsBtn) settingsBtn.click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(outputDir, '47_settings_page_unauthenticated.png') });

  // 2. 비로그인 상태에서 마이페이지 접근 캡처
  await page.evaluate(() => {
    const backBtn = document.querySelector('button[aria-label="뒤로 가기"]');
    if (backBtn) backBtn.click();
  });
  await sleep(400);

  // 하단 바 마이페이지 클릭 (비로그인 상태 안내)
  await page.evaluate(() => {
    // 5번째 네비게이션 버튼
    const btns = document.querySelectorAll('nav[aria-label="하단 네비게이션"] button');
    if (btns[4]) btns[4].click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(outputDir, '48_mypage_unauthenticated_login_prompt.png') });

  // 3. 일반 사용자(USER) 로그인 후 설정 페이지 및 마이페이지 캡처
  await page.evaluate(async () => {
    const res = await fetch('http://127.0.0.1:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@luxuryrental.com', password: 'luxury1234!' })
    });
    const data = await res.json();
    if (data.token) localStorage.setItem('lr_token', data.token);
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(500);

  // 일반 회원 상태에서 설정 진입 (관리자 메뉴가 안 보이는지 검증!)
  await page.evaluate(() => {
    const settingsBtn = document.querySelector('button[aria-label="설정 센터로 이동"]');
    if (settingsBtn) settingsBtn.click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(outputDir, '49_settings_page_user_no_admin_menu.png') });

  // 일반 회원 마이페이지 진입
  await page.evaluate(() => {
    const myPageBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('마이페이지'));
    if (myPageBtn) myPageBtn.click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(outputDir, '50_mypage_user_authenticated.png') });

  // 4. 최고관리자(ADMIN) 로그인 후 설정 페이지 (관리자 대시보드 진입 카드 노출 검증!)
  await page.evaluate(async () => {
    const res = await fetch('http://127.0.0.1:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@luxuryrental.com', password: 'admin1234!' })
    });
    const data = await res.json();
    if (data.token) localStorage.setItem('lr_token', data.token);
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(500);

  // 관리자 설정 페이지
  await page.evaluate(() => {
    const settingsBtn = document.querySelector('button[aria-label="설정 센터로 이동"]');
    if (settingsBtn) settingsBtn.click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(outputDir, '51_settings_page_admin_with_dashboard_card.png') });

  // 관리자 마이페이지 (관리자 계정 뱃지 + 일반 쇼핑몰 기능 동일 이용 검증!)
  await page.evaluate(() => {
    const myPageBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('마이페이지'));
    if (myPageBtn) myPageBtn.click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(outputDir, '52_mypage_admin_authenticated.png') });

  await browser.close();
  console.log('=== 설정 및 마이페이지 캡처 6종 완료! ===');
}

run().catch(err => {
  console.error('캡처 실패:', err);
  process.exit(1);
});
