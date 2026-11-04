import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve(process.cwd(), '../docs/screenshots_phase2');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log('=== 공식 소셜 인증, 약관 시스템, 이미지 에셋 E2E 시각적 검증 시작 ===');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,950', '--force-device-scale-factor=1.5']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // 1. 소셜 로그인 화면 (공식 로고 및 아이콘 적용 상태 검증)
  console.log('1. 소셜 로그인 화면 캡처...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    // Click heart or bottom mypage to open login
    const navBtns = document.querySelectorAll('nav[aria-label="하단 네비게이션"] button');
    if (navBtns[4]) navBtns[4].click();
  });
  await sleep(600);
  await page.screenshot({ path: path.join(outputDir, '53_login_official_social_buttons.png') });

  // 1.1 이메일 로그인 탭 전환 (빠른 테스트 / 자동입력 영역 완전 제거 검증)
  console.log('1.1 이메일 로그인 탭 전환 캡처...');
  await page.evaluate(() => {
    const emailTabBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('이메일 로그인'));
    if (emailTabBtn) emailTabBtn.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(outputDir, '53_1_login_clean_email_no_quick_test.png') });

  // 2. 회원가입 화면 (개별 필수/선택 약관 분리 및 전체 동의 UI 검증)
  console.log('2. 회원가입 세부 약관 화면 캡처...');
  await page.evaluate(() => {
    const regBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('이메일로 회원가입'));
    if (regBtn) regBtn.click();
  });
  await sleep(600);
  await page.screenshot({ path: path.join(outputDir, '54_register_granular_legal_terms.png') });

  // 3. 약관 상세 전문 뷰어 모달 팝업 캡처 (버전, 시행일, 조항 본문)
  console.log('3. 약관 상세 전문 뷰어 모달 팝업 캡처...');
  await page.evaluate(() => {
    const viewButtons = Array.from(document.querySelectorAll('button')).filter(el => el.textContent.includes('내용 보기'));
    if (viewButtons[0]) viewButtons[0].click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(outputDir, '55_register_legal_terms_modal_preview.png') });

  // 약관 모달 닫기
  await page.evaluate(() => {
    const agreeBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('동의하고 확인 완료'));
    if (agreeBtn) agreeBtn.click();
  });
  await sleep(400);

  // 4. 회원가입 창 닫고 메인으로 복귀 후 로그인 (일반회원)
  console.log('4. 일반 회원 로그인 및 마이페이지 프로필 사진 업로드 캡처...');
  await page.evaluate(async () => {
    const res = await fetch('http://localhost:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'customer@luxuryrental.com', password: 'luxury1234!' })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('lr_token', data.token);
      location.reload();
    }
  });
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await sleep(500);

  // 5. 메인 추천 상품 12종 신규 에셋 렌더링 검증 캡처
  console.log('5. 메인 추천 상품 카드 12종 에셋 렌더링 캡처...');
  await page.screenshot({ path: path.join(outputDir, '59_main_recommendations_with_all_images.png') });

  // 6. 하단 마이페이지 클릭 후 프로필 수정 모달 (사진 업로드 UI 검증)
  console.log('6. 마이페이지 프로필 사진 업로드 모달 캡처...');
  await page.evaluate(() => {
    const navBtns = document.querySelectorAll('nav[aria-label="하단 네비게이션"] button');
    if (navBtns[4]) navBtns[4].click();
  });
  await sleep(600);

  await page.evaluate(() => {
    const editBtn = document.querySelector('button[aria-label="프로필 수정"]');
    if (editBtn) editBtn.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(outputDir, '57_mypage_avatar_file_upload.png') });

  // 모달 닫기
  await page.evaluate(() => {
    const cancelBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === '취소');
    if (cancelBtn) cancelBtn.click();
  });
  await sleep(300);

  // 7. 상단 톱니바퀴 -> 설정 페이지에서 이용약관 모달 캡처
  console.log('7. 공통 설정 페이지 약관 선택 모달 캡처...');
  await page.evaluate(() => {
    const settingsBtn = document.querySelector('button[aria-label="설정 센터로 이동"]');
    if (settingsBtn) settingsBtn.click();
  });
  await sleep(500);

  await page.evaluate(() => {
    const termsItem = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('이용약관 및 개인정보처리방침'));
    if (termsItem) termsItem.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(outputDir, '56_settings_legal_terms_choice_modal.png') });

  // 8. 관리자 계정 로그인 후 관리자 갤러리 이미지 업로드 모달 검증
  console.log('8. 관리자 상품 이미지 갤러리 파일 업로드 캡처...');
  await page.evaluate(async () => {
    const res = await fetch('http://localhost:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@luxuryrental.com', password: 'admin1234!' })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('lr_token', data.token);
      location.reload();
    }
  });
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await sleep(500);

  // 설정 페이지 이동 후 관리자 대시보드 진입
  await page.evaluate(() => {
    const settingsBtn = document.querySelector('button[aria-label="설정 센터로 이동"]');
    if (settingsBtn) settingsBtn.click();
  });
  await sleep(500);

  await page.evaluate(() => {
    const adminEntryBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('최고관리자 대시보드'));
    if (adminEntryBtn) adminEntryBtn.click();
  });
  await sleep(600);

  // 관리자 대시보드에서 SHOP 탭 클릭 후 상품 갤러리 관리 버튼 클릭
  await page.evaluate(() => {
    const shopTabBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('명품 렌탈 쇼핑몰'));
    if (shopTabBtn) shopTabBtn.click();
  });
  await sleep(500);

  await page.evaluate(() => {
    const galleryBtns = Array.from(document.querySelectorAll('button')).filter(el => el.textContent.includes('이미지 갤러리'));
    if (galleryBtns[0]) galleryBtns[0].click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(outputDir, '58_admin_gallery_file_upload.png') });

  await browser.close();
  console.log('=== 모든 E2E 스크린샷 캡처 및 검증 완료! ===');
}

run().catch(console.error);
