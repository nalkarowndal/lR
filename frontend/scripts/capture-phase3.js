import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('D:\\JSW_React\\8.portfolio\\IIL\\docs\\screenshots_phase3');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const screenshotRegistry = [];

async function capture(page, filename, category, title, description, viewport) {
  const filePath = path.join(outputDir, filename);
  await page.screenshot({ path: filePath });
  console.log(`[CAPTURED] ${filename} - ${title}`);
  screenshotRegistry.push({
    filename,
    category,
    title,
    description,
    viewport: viewport || `${page.viewport()?.width}x${page.viewport()?.height}`
  });
}

// Helper: 텍스트로 요소 찾아 클릭
async function clickByText(page, selector, text, options = {}) {
  const handles = await page.$$(selector);
  for (const h of handles) {
    const val = await page.evaluate(el => el.textContent, h);
    if (val && val.includes(text)) {
      if (options.scroll) {
        await page.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }), h);
        await sleep(200);
      }
      await h.click();
      await sleep(options.delay || 400);
      return true;
    }
  }
  return false;
}

// Helper: 특정 요소 스크롤
async function scrollElement(page, selector, top) {
  await page.evaluate((sel, t) => {
    const el = document.querySelector(sel);
    if (el) el.scrollTop = t;
  }, selector, top);
  await sleep(350);
}

// Helper: 내비게이션 상태 강제 리셋
async function resetToView(page, viewName) {
  await page.evaluate((view) => {
    if (window.__lrSetOverlay) window.__lrSetOverlay(null);
    if (window.__lrNavigate) window.__lrNavigate(view);
  }, viewName);
  await sleep(500);
}

// Helper: 오버레이 강제 해제
async function clearOverlays(page) {
  await page.evaluate(() => {
    if (window.__lrSetOverlay) window.__lrSetOverlay(null);
  });
  await sleep(400);
}

async function run() {
  console.log('=== LUXURY RENTAL PHASE 3 전체 화면 및 상호작용 종합 캡처 시작 ===');
  console.log(`대상 디렉토리: ${outputDir}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--force-device-scale-factor=1.5' // 선명한 1.5x 레티나 해상도
    ]
  });

  const page = await browser.newPage();
  const mainScrollContainer = '.scrollbar-hide';

  try {
    // 0. 로컬 스토리지 초기화 및 게스트 모드 접속
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(700);

    // ==========================================
    // [CATEGORY 1] 데스크톱 레이아웃 & QR 앱 다운로드 배너
    // ==========================================
    console.log('\n--- Category 1: 데스크톱 레이아웃 & 다운로드 배너 ---');
    await page.setViewport({ width: 1440, height: 920 });
    await sleep(500);

    await capture(
      page,
      '01_desktop_main_view.png',
      '데스크톱 레이아웃',
      '데스크톱 1440px 전체 뷰',
      '중앙 448px 모바일 컨테이너 + 좌측 고해상도 SVG QR 스캐너 배너 + 스토어 다운로드 버튼 + 고객센터 안내',
      '1440x920 Desktop'
    );

    // QR 배너 스토어 버튼 클릭 -> AppDownloadModal 오픈
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('aside button')).find(b => b.textContent && b.textContent.includes('Google Play'));
      if (btn) btn.click();
    });
    await sleep(500);

    await capture(
      page,
      '02_desktop_qr_download_modal.png',
      '데스크톱 레이아웃',
      '앱 다운로드 안내 모달',
      'Google Play 및 App Store 다운로드 링크 및 SMS 안내 전송 팝업 모달',
      '1440x920 Desktop'
    );

    // 모달 닫기
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[role="dialog"] button[aria-label="닫기"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(400);

    // ==========================================
    // [CATEGORY 2] 모바일 메인 화면 및 렌탈 인터랙션
    // ==========================================
    console.log('\n--- Category 2: 모바일 메인 화면 & 렌탈 인터랙션 ---');
    await page.setViewport({ width: 440, height: 920 });
    await resetToView(page, 'SHOP_MAIN');

    await capture(
      page,
      '03_main_mobile_initial.png',
      '모바일 메인',
      '모바일 메인 화면 상단',
      '헤더(검색/장바구니/설정), 비로그인 안내 배너, 3대 서비스 액션 카드(렌트하기 70% 할인, 구매하기 정품 보증, 판매하기)',
      '440x920 Mobile'
    );

    // 스크롤: 8-Grid 메뉴
    await scrollElement(page, mainScrollContainer, 290);
    await capture(
      page,
      '04_main_services_and_8grid_menu.png',
      '모바일 메인',
      '리본즈만의 서비스 & 8-Grid 메뉴',
      '고급스러운 음각 각인 아이콘 8종 (명품 렌트, 타임 세일, 24시간 퀵, VIP 멤버십, 안심 케어, 라운지, 바이백, 친구 초대)',
      '440x920 Mobile'
    );

    // '친구 초대' 메뉴 클릭 -> 클립보드 복사 & 토스트 알림
    await clickByText(page, 'span', '친구 초대');
    await sleep(400);

    await capture(
      page,
      '05_main_friend_invite_clipboard_toast.png',
      '모바일 메인',
      '친구 초대 클립보드 복사 완료 토스트',
      'VIP 추천인 코드(LUXURY-VIP-2026) 복사 성공 토스트 및 인터랙션',
      '440x920 Mobile'
    );

    // 스크롤: 맞춤 추천 상품 섹션
    await scrollElement(page, mainScrollContainer, 660);
    await capture(
      page,
      '06_main_recommend_tab_20w.png',
      '모바일 메인',
      '맞춤 추천 상품: 20대 여성 (기본)',
      '20대 여성 인기 큐레이션 실사 명품 가방 그리드 및 가격/할인율 표시',
      '440x920 Mobile'
    );

    // 맞춤 추천 탭 클릭들
    await clickByText(page, 'button', '20대 남성');
    await capture(page, '07_main_recommend_tab_20m.png', '모바일 메인', '맞춤 추천 탭: 20대 남성', '20대 남성 인기 상품 큐레이션 전환', '440x920 Mobile');

    await clickByText(page, 'button', '30대 여성');
    await capture(page, '08_main_recommend_tab_30w.png', '모바일 메인', '맞춤 추천 탭: 30대 여성', '30대 여성 인기 상품 큐레이션 전환', '440x920 Mobile');

    await clickByText(page, 'button', '30대 남성');
    await capture(page, '09_main_recommend_tab_30m.png', '모바일 메인', '맞춤 추천 탭: 30대 남성', '30대 남성 인기 상품 큐레이션 전환', '440x920 Mobile');

    await clickByText(page, 'button', '40대 여성');
    await capture(page, '10_main_recommend_tab_40w.png', '모바일 메인', '맞춤 추천 탭: 40대 여성', '40대 여성 인기 상품 큐레이션 전환', '440x920 Mobile');

    // 하트(찜) 클릭 인터랙션 (비로그인 상태)
    await page.evaluate(() => {
      const heartBtn = document.querySelector('[data-testid="recommend-product-card"] button[aria-label*="좋아요"]');
      if (heartBtn) heartBtn.click();
    });
    await sleep(400);

    await capture(
      page,
      '11_main_recommend_favorite_toggle.png',
      '모바일 메인',
      '비로그인 찜 클릭 시 로그인 안내',
      '비로그인 상태에서 좋아요 클릭 시 로그인 유도 토스트 및 로그인 오버레이 자동 안내',
      '440x920 Mobile'
    );

    // 로그인 오버레이 완전 해제
    await clearOverlays(page);

    // ==========================================
    // [CATEGORY 3] 상품 상세 정보 모달 & 장바구니 시스템
    // ==========================================
    console.log('\n--- Category 3: 상품 상세 모달 & 장바구니 ---');
    // 추천 상품 카드 클릭 -> ProductDetailModal 오픈
    await page.evaluate(() => {
      const card = document.querySelector('[data-testid="recommend-product-card"]');
      if (card) card.click();
    });
    await sleep(500);

    await capture(
      page,
      '12_product_detail_modal_3days.png',
      '상품 상세 및 장바구니',
      '상품 상세 모달 (3일 기준 기본)',
      '실사 제품 룩북, 한국명품감정원 100% 정품 인증 배지, 3일 기준 대여료 실시간 계산기',
      '440x920 Mobile'
    );

    // 7일 대여 기간 선택
    await clickByText(page, 'button', '7일');
    await capture(
      page,
      '13_product_detail_modal_7days.png',
      '상품 상세 및 장바구니',
      '상품 상세 모달 (7일 선택)',
      '7일 선택 시 실시간 대여료 재계산 및 선택 버튼 활성화',
      '440x920 Mobile'
    );

    // 15일 대여 기간 선택
    await clickByText(page, 'button', '15일');
    await capture(
      page,
      '14_product_detail_modal_15days.png',
      '상품 상세 및 장바구니',
      '상품 상세 모달 (15일 선택)',
      '15일 선택 시 실시간 대여료 재계산 및 혜택 요약',
      '440x920 Mobile'
    );

    // 30일 대여 기간 선택
    await clickByText(page, 'button', '30일');
    await capture(
      page,
      '15_product_detail_modal_30days.png',
      '상품 상세 및 장바구니',
      '상품 상세 모달 (30일 선택)',
      '30일 선택 시 월간 렌탈 할인 요금 표시',
      '440x920 Mobile'
    );

    // "장바구니 담기" 버튼 클릭
    await clickByText(page, 'button', '장바구니 담기');
    await sleep(500);

    await capture(
      page,
      '16_product_detail_add_to_cart_toast.png',
      '상품 상세 및 장바구니',
      '장바구니 담기 완료 토스트',
      '장바구니 추가 성공 안내 토스트 및 모달 닫힘',
      '440x920 Mobile'
    );

    // 상단 스크롤 후 카트 배지 캡처
    await scrollElement(page, mainScrollContainer, 0);
    await capture(
      page,
      '17_cart_header_badge.png',
      '상품 상세 및 장바구니',
      '헤더 장바구니 실시간 수량 배지',
      '장바구니 아이콘 우측 상단 인디고 원형 배지에 수량(1) 실시간 반영',
      '440x920 Mobile'
    );

    // 장바구니 아이콘 클릭 -> CartModal 오픈
    await page.evaluate(() => {
      const cartBtn = document.querySelector('button[aria-label*="장바구니"]');
      if (cartBtn) cartBtn.click();
    });
    await sleep(500);

    await capture(
      page,
      '18_cart_modal_view.png',
      '상품 상세 및 장바구니',
      '장바구니 팝업 모달',
      '담긴 렌탈 상품 정보, 렌탈 기간, 보증금 0원 프로모션, 무료 왕복 특송 배송비, 총 예상 대여료 계산 요약',
      '440x920 Mobile'
    );

    // "주문서 작성으로 이동" 클릭
    await clickByText(page, 'button', '주문서 작성으로 이동');
    await sleep(500);

    await capture(
      page,
      '19_cart_modal_checkout_toast.png',
      '상품 상세 및 장바구니',
      '렌탈 주문 배송 정보 입력 화면',
      '수령인 성명, 휴대폰 번호, 배송지 주소, 배송 메모 입력 및 VIP 왕복 특송 무료 혜택',
      '440x920 Mobile'
    );

    // 모달 닫기
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[role="dialog"] button[aria-label="닫기"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(300);

    // ==========================================
    // [CATEGORY 4] 신규 입고 상품 & 푸터 법적 모달
    // ==========================================
    console.log('\n--- Category 4: Rent New Arrivals & 푸터 모달 ---');
    await scrollElement(page, mainScrollContainer, 1100);
    await capture(
      page,
      '20_main_rent_new_arrivals.png',
      '신규 입고 & 푸터',
      'Rent New Arrivals 가로 스크롤',
      '매주 수요일 업데이트되는 신규 입고 명품 카드 가로 스크롤 뷰',
      '440x920 Mobile'
    );

    await scrollElement(page, mainScrollContainer, 1600);
    await capture(
      page,
      '21_main_footer_escrow_and_links.png',
      '신규 입고 & 푸터',
      '토스 에스크로 및 정책 푸터',
      '토스페이먼츠 구매안전 에스크로 배지, 고객센터, 정책안내, 이용약관, 개인정보처리방침 링크',
      '440x920 Mobile'
    );

    // 고객센터 모달
    await clickByText(page, 'span', '고객센터');
    await sleep(400);
    await capture(
      page,
      '22_footer_customer_service_modal.png',
      '신규 입고 & 푸터',
      '고객센터 안내 팝업 모달',
      '평일 운영시간, 대표번호(1544-0000), 이메일, 카카오톡 채널 안내',
      '440x920 Mobile'
    );
    await clickByText(page, 'button', '확인');
    await sleep(300);

    // 정책안내 모달
    await clickByText(page, 'span', '정책안내');
    await sleep(400);
    await capture(
      page,
      '23_footer_service_policy_modal.png',
      '신규 입고 & 푸터',
      '정책 안내 팝업 모달',
      '100% 정품 인증 검수, 가품 시 200% 책임보상, 일상 스크래치 무상 케어 보증',
      '440x920 Mobile'
    );
    await clickByText(page, 'button', '확인');
    await sleep(300);

    // 이용약관 모달
    await clickByText(page, 'span', '이용약관');
    await sleep(400);
    await capture(
      page,
      '24_footer_terms_of_service_modal.png',
      '신규 입고 & 푸터',
      '전자상거래 표준 이용약관 모달',
      '총칙, 회원가입, 대여 계약, 청약철회, 손해배상 등 법적 공시 전문',
      '440x920 Mobile'
    );
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[role="dialog"] button[aria-label="닫기"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(300);

    // 하단 플로팅 네비게이션 포커스
    await scrollElement(page, mainScrollContainer, 0);
    await capture(
      page,
      '25_main_floating_bottom_nav.png',
      '모바일 메인',
      '하단 플로팅 알약 내비게이션 바',
      '홈, 카테고리, 내 상품 판매, 좋아요, 마이페이지 5대 탭 플로팅 바',
      '440x920 Mobile'
    );

    // ==========================================
    // [CATEGORY 5] 통합 검색 오버레이 & 키보드/정렬 인터랙션
    // ==========================================
    console.log('\n--- Category 5: 검색 오버레이 인터랙션 ---');
    // 데스크톱 1440px에서 검색 패널 열기 -> 0px 정렬 검증 캡처
    await page.setViewport({ width: 1440, height: 920 });
    await page.evaluate(() => {
      if (window.__lrSetOverlay) window.__lrSetOverlay('SEARCH');
    });
    await sleep(600);

    await capture(
      page,
      '26_search_overlay_desktop_aligned_0px.png',
      '통합 검색 오버레이',
      '데스크톱 1440px 검색창 0px 오프셋 정렬',
      '슬라이드 완료 후 가로 스크롤(scrollX: 0) 및 앱 중앙 컨테이너와의 완벽한 0px 경계 정렬',
      '1440x920 Desktop'
    );

    // 모바일 해상도로 복귀하여 세부 검색 캡처
    await page.setViewport({ width: 440, height: 920 });
    await sleep(300);
    await capture(
      page,
      '27_search_overlay_mobile_default.png',
      '통합 검색 오버레이',
      '모바일 검색 오버레이 기본',
      '최근 검색어 칩, 실시간 급상승 브랜드 순위 1~10위, 추천 태그',
      '440x920 Mobile'
    );

    // 검색창에 "샤넬" 입력
    const searchInput = 'input[placeholder*="검색어를 입력"]';
    await page.waitForSelector(searchInput);
    await page.type(searchInput, '샤넬', { delay: 60 });
    await sleep(400);

    await capture(
      page,
      '28_search_typing_chanel.png',
      '통합 검색 오버레이',
      '샤넬 실시간 검색 결과',
      '샤넬 클래식 플랩백, 22 미니백 등 고화질 실사 제품 카드 및 READY 상태',
      '440x920 Mobile'
    );

    // 입력창 초기화 후 "스톤 아일랜드" 입력
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.value = '';
    }, searchInput);
    await page.type(searchInput, '스톤 아일랜드', { delay: 60 });
    await sleep(400);

    await capture(
      page,
      '29_search_typing_stone_island.png',
      '통합 검색 오버레이',
      '스톤 아일랜드 실시간 검색 결과',
      '스톤 아일랜드 나일론 메탈, 쉐도우 프로젝트 실사 의류 카탈로그',
      '440x920 Mobile'
    );

    // 추천 검색어 태그 클릭 "까르띠에"
    await page.evaluate(() => {
      const clearBtn = document.querySelector('button[aria-label="검색어 지우기"]');
      if (clearBtn) clearBtn.click();
    });
    await sleep(400);
    await clickByText(page, 'button', '까르띠에');
    await sleep(400);

    await capture(
      page,
      '30_search_keyword_chip_cartier.png',
      '통합 검색 오버레이',
      '추천 검색어 칩 클릭 결과',
      '추천 태그 클릭 시 검색어 자동 입력 및 결과 필터링',
      '440x920 Mobile'
    );

    // 검색 오버레이 닫기
    await clearOverlays(page);

    // ==========================================
    // [CATEGORY 6] 회원 인증 및 약관 오버레이 (LOGIN / REGISTER / RESET)
    // ==========================================
    console.log('\n--- Category 6: 로그인/회원가입/비밀번호 재설정 오버레이 ---');
    await page.evaluate(() => {
      if (window.__lrSetOverlay) window.__lrSetOverlay('LOGIN');
    });
    await sleep(500);

    await capture(
      page,
      '31_login_overlay_default.png',
      '회원 인증 오버레이',
      '간편 로그인 오버레이 기본',
      '공식 로고 적용 카카오/네이버/Apple/PAYCO 소셜 로그인 및 이메일 로그인 폼',
      '440x920 Mobile'
    );

    // 잘못된 로그인 시도 -> 유효성 검사 에러
    const emailLoginInput = 'input[type="email"]';
    const pwLoginInput = 'input[type="password"]';
    if (await page.$(emailLoginInput)) {
      await page.type(emailLoginInput, 'invalid@example.com', { delay: 40 });
      await page.type(pwLoginInput, 'wrongpw123!', { delay: 40 });
      await clickByText(page, 'button', '이메일로 로그인');
      await sleep(500);
      await capture(
        page,
        '32_login_error_validation.png',
        '회원 인증 오버레이',
        '로그인 실패 유효성 검증 토스트',
        '존재하지 않는 계정 또는 비밀번호 불일치 시 직관적인 에러 토스트 안내',
        '440x920 Mobile'
      );
    }

    // "회원가입하기" 클릭 -> 회원가입 오버레이로 전환
    await page.evaluate(() => {
      if (window.__lrSetOverlay) window.__lrSetOverlay('REGISTER');
    });
    await sleep(500);

    await capture(
      page,
      '33_register_overlay_initial.png',
      '회원 인증 오버레이',
      '회원가입 오버레이 초기 화면',
      '이름, 이메일, 비밀번호, 휴대폰 번호 입력 및 필수/선택 법적 약관 동의 체크박스',
      '440x920 Mobile'
    );

    // 이용약관 '내용보기' 클릭 -> 상세 모달 팝업
    await page.evaluate(() => {
      const viewBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('내용보기'));
      if (viewBtn) viewBtn.click();
    });
    await sleep(400);

    await capture(
      page,
      '34_register_view_terms_modal.png',
      '회원 인증 오버레이',
      '회원가입 필수 약관 전문 팝업',
      '회원가입 화면에서 이탈 없이 약관 전문을 검토할 수 있는 인앱 약관 모달',
      '440x920 Mobile'
    );

    // 약관 모달 닫기
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[role="dialog"] button[aria-label="닫기"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(300);

    // 회원가입 폼 채우기 & 전체 동의
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(i => {
        if (i.placeholder?.includes('이름')) i.value = '홍길동';
        if (i.type === 'email') i.value = 'hong@luxuryrental.com';
        if (i.type === 'password' && i.placeholder?.includes('영문')) i.value = 'luxury2026!';
        if (i.type === 'password' && i.placeholder?.includes('확인')) i.value = 'luxury2026!';
        if (i.placeholder?.includes('010')) i.value = '010-1234-5678';
        if (i.type === 'checkbox') i.checked = true;
        i.dispatchEvent(new Event('input', { bubbles: true }));
        i.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    await sleep(300);

    await capture(
      page,
      '35_register_form_filled.png',
      '회원 인증 오버레이',
      '회원가입 폼 입력 완료 상태',
      '입력값 완성 및 약관 전체 동의 체크박스 활성화 상태',
      '440x920 Mobile'
    );

    // 비밀번호 찾기 오버레이 열기
    await page.evaluate(() => {
      if (window.__lrSetOverlay) window.__lrSetOverlay('FORGOT_PASSWORD');
    });
    await sleep(500);

    await capture(
      page,
      '36_password_reset_step1_email.png',
      '회원 인증 오버레이',
      '비밀번호 재설정 Step 1: 이메일 입력',
      '가입 이메일 주소 입력 및 보안 토큰 전송 요청 단계',
      '440x920 Mobile'
    );

    // 이메일 입력 및 재설정 토큰 요청
    const resetEmailInput = 'input[placeholder="가입된 이메일 입력"]';
    if (await page.$(resetEmailInput)) {
      await page.type(resetEmailInput, 'customer@luxuryrental.com', { delay: 40 });
      await clickByText(page, 'button', '재설정 안내 받기');
      await sleep(700);

      await capture(
        page,
        '37_password_reset_step2_token.png',
        '회원 인증 오버레이',
        '비밀번호 재설정 Step 2: 토큰 및 새 비밀번호 입력',
        '인증 토큰 발송 성공 안내 토스트, 토큰 입력 필드, 신규 비밀번호 변경 폼',
        '440x920 Mobile'
      );
    }

    // 모든 오버레이 닫기
    await clearOverlays(page);

    // ==========================================
    // [CATEGORY 7] 카테고리 & 6대 명품 브랜드 페이지 (SHOP_CATEGORY)
    // ==========================================
    console.log('\n--- Category 7: 카테고리 및 브랜드 뷰 ---');
    await resetToView(page, 'SHOP_CATEGORY');

    await capture(
      page,
      '38_category_women_bags.png',
      '카테고리 및 브랜드',
      '카테고리: 여성 > 가방 (기본)',
      '좌측 서브메뉴(가방, 의류, 슈즈, 지갑, 시계/액세서리) 및 가방 카탈로그',
      '440x920 Mobile'
    );

    await clickByText(page, 'button', '의류');
    await capture(page, '39_category_women_clothing.png', '카테고리 및 브랜드', '카테고리: 여성 > 의류', '의류 카테고리 룩북 및 상품 목록', '440x920 Mobile');

    await clickByText(page, 'button', '슈즈');
    await capture(page, '40_category_women_shoes.png', '카테고리 및 브랜드', '카테고리: 여성 > 슈즈', '슈즈/스니커즈 카테고리 룩북 및 상품 목록', '440x920 Mobile');

    await clickByText(page, 'button', '지갑');
    await capture(page, '41_category_women_wallet.png', '카테고리 및 브랜드', '카테고리: 여성 > 지갑', '지갑/카드홀더 카테고리 룩북 및 상품 목록', '440x920 Mobile');

    await clickByText(page, 'button', '시계/액세서리');
    await capture(page, '42_category_women_watch.png', '카테고리 및 브랜드', '카테고리: 여성 > 시계/액세서리', '하이엔드 워치 및 주얼리 카테고리', '440x920 Mobile');

    await clickByText(page, 'button', '남성');
    await capture(page, '43_category_subtab_men.png', '카테고리 및 브랜드', '카테고리 대상: 남성', '남성 럭셔리 라인업 서브탭 전환', '440x920 Mobile');

    await clickByText(page, 'button', '아동');
    await capture(page, '44_category_subtab_kids.png', '카테고리 및 브랜드', '카테고리 대상: 아동', '키즈 명품 라인업 서브탭 전환', '440x920 Mobile');

    // 상단 메인 탭: '브랜드' 클릭
    await clickByText(page, 'button', '브랜드');
    await sleep(400);

    await capture(
      page,
      '45_brand_tab_louis_vuitton.png',
      '카테고리 및 브랜드',
      '브랜드 탭: 루이비통 (Louis Vuitton)',
      '루이비통 브랜드 칩 활성화 및 6종 고화질 실사 제품(스피디, 네오노에, 포쉐트 등) 그리드',
      '440x920 Mobile'
    );

    // 브랜드 칩 순회 (스톤 아일랜드, 구찌, 샤넬, CP 컴퍼니, 셀린느)
    await clickByText(page, 'span', '스톤 아일랜드');
    await capture(page, '46_brand_tab_stone_island.png', '카테고리 및 브랜드', '브랜드 탭: 스톤 아일랜드', '스톤 아일랜드 6종 실사 의류(나일론 메탈 오버셔츠, 소프트쉘 등)', '440x920 Mobile');

    await clickByText(page, 'span', '구찌');
    await capture(page, '47_brand_tab_gucci.png', '카테고리 및 브랜드', '브랜드 탭: 구찌 (Gucci)', '구찌 6종 실사 백/지갑(재키 1961, GG 마몽, 디오니소스 등)', '440x920 Mobile');

    await clickByText(page, 'span', '샤넬');
    await capture(page, '48_brand_tab_chanel.png', '카테고리 및 브랜드', '브랜드 탭: 샤넬 (Chanel)', '샤넬 6종 실사 백(클래식 플랩백, 22백, 보이샤넬 등)', '440x920 Mobile');

    await clickByText(page, 'span', 'CP 컴퍼니');
    await capture(page, '49_brand_tab_cp_company.png', '카테고리 및 브랜드', '브랜드 탭: CP 컴퍼니', 'CP 컴퍼니 6종 실사 아우터(렌즈 와펜 소프트쉘, 고글 후디 등)', '440x920 Mobile');

    await clickByText(page, 'span', '셀린느');
    await capture(page, '50_brand_tab_celine.png', '카테고리 및 브랜드', '브랜드 탭: 셀린느 (Celine)', '셀린느 6종 실사 백(트리옹프 숄더백, 벨트백, 라지 카바스 등)', '440x920 Mobile');

    // ==========================================
    // [CATEGORY 8] 내 상품 판매 및 간편 위탁 페이지 (SHOP_SELL)
    // ==========================================
    console.log('\n--- Category 8: 내 상품 판매 및 간편 위탁 ---');
    await resetToView(page, 'SHOP_SELL');

    await capture(
      page,
      '51_sell_page_initial.png',
      '내 상품 판매',
      '내 상품 판매 초기 화면',
      '브랜드 검색창, 가나다순 브랜드 셀렉터 칩, 간편 위탁/판매 신청 가이드',
      '440x920 Mobile'
    );

    // 브랜드 검색창에 "고야드" 입력
    const sellSearchInput = 'input[placeholder*="브랜드명을 검색"]';
    if (await page.$(sellSearchInput)) {
      await page.type(sellSearchInput, '고야드', { delay: 60 });
      await sleep(300);
      await capture(
        page,
        '52_sell_page_brand_search_typing.png',
        '내 상품 판매',
        '판매 브랜드 실시간 검색',
        '브랜드명 검색 필터링 및 일치 브랜드 즉시 노출',
        '440x920 Mobile'
      );
      // 검색창 지우기
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.value = '';
      }, sellSearchInput);
      await sleep(200);
    }

    // "원하는 브랜드가 없다면 직접 등록해보세요" 클릭
    await clickByText(page, 'button', '직접 등록');
    await sleep(400);

    await capture(
      page,
      '53_sell_page_direct_register_modal.png',
      '내 상품 판매',
      '브랜드 직접 등록 팝업 모달',
      '리스트 외 신규 럭셔리 브랜드 수기 입력 및 감정 의뢰 모달',
      '440x920 Mobile'
    );

    // 직접 등록 모달 닫기
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('div[role="dialog"] button')).find(b => b.textContent && b.textContent.includes('취소')) || document.querySelector('div[role="dialog"] button');
      if (closeBtn) closeBtn.click();
    });
    await sleep(300);

    // 브랜드 선택 클릭 (구찌) -> 감정팀 회신 연락처 팝업
    await clickByText(page, 'button', '구찌');
    await sleep(400);

    await capture(
      page,
      '54_sell_page_brand_confirm_modal.png',
      '내 상품 판매',
      '판매 감정 신청 정보 입력 모달',
      '신청 브랜드 확인, 비회원 연락처 및 성함 입력 폼',
      '440x920 Mobile'
    );

    // 신청서 입력 및 제출
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('div[role="dialog"] input');
      inputs.forEach(i => {
        if (i.placeholder?.includes('이름')) i.value = '김럭셔리';
        if (i.placeholder?.includes('010')) i.value = '010-8888-9999';
        i.dispatchEvent(new Event('input', { bubbles: true }));
        i.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    await sleep(200);

    await clickByText(page, 'button', '위탁 신청 완료');
    await sleep(500);

    await capture(
      page,
      '55_sell_page_submitted_toast.png',
      '내 상품 판매',
      '판매 신청 접수 완료 안내',
      '전문 감정팀 24시간 내 배정 및 회신 완료 안내 팝업',
      '440x920 Mobile'
    );

    await clickByText(page, 'button', '확인');
    await sleep(300);

    // ==========================================
    // [CATEGORY 9] 일반 회원 세션, 설정 및 마이페이지
    // ==========================================
    console.log('\n--- Category 9: 일반 회원 로그인, 설정 및 마이페이지 ---');
    // 일반 회원 토큰 주입 (customer@luxuryrental.com)
    await page.evaluate(async () => {
      try {
        const res = await fetch('http://localhost:4000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'customer@luxuryrental.com', password: 'luxury1234!' })
        });
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('lr_token', data.token);
        }
      } catch (e) {}
    });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await sleep(700);

    await capture(
      page,
      '56_customer_login_home.png',
      '일반 회원 세션',
      '일반 회원 로그인 메인 화면',
      '상단 "일반 회원" 배지, "김럭셔리님 반갑습니다" 맞춤 환영 메시지 및 로그아웃 버튼',
      '440x920 Mobile'
    );

    // 헤더 톱니바퀴 -> 공통 설정 페이지
    await resetToView(page, 'SHOP_SETTINGS');

    await capture(
      page,
      '57_customer_settings_page.png',
      '일반 회원 세션',
      '일반 회원 공통 설정 페이지',
      '회원 프로필 요약 카드, 알림/애니메이션 감축 스위치, 비밀번호 변경, 로그아웃 (관리자 대시보드 카드 철저히 미노출)',
      '440x920 Mobile'
    );

    // 마이페이지 이동
    await resetToView(page, 'SHOP_MY_PAGE');

    await capture(
      page,
      '58_customer_mypage_favorites.png',
      '일반 회원 세션',
      '고객 마이페이지: 찜한 상품 탭',
      '회원 등급(VIP), 닉네임, 프로필 수정 버튼, 찜한 상품(FAVORITES) 실사 갤러리',
      '440x920 Mobile'
    );

    // '판매 내역' 탭 클릭
    await clickByText(page, 'button', '판매 내역');
    await sleep(400);

    await capture(
      page,
      '59_customer_mypage_sell_requests.png',
      '일반 회원 세션',
      '고객 마이페이지: 내 판매 신청 내역 탭',
      '고객이 신청한 명품 판매/위탁 신청 건의 접수 상태(검토중/승인) 실시간 트래킹',
      '440x920 Mobile'
    );

    // '프로필 수정' 버튼 클릭 -> 프로필 수정 모달
    await clickByText(page, 'button', '프로필 수정');
    await sleep(400);

    await capture(
      page,
      '60_customer_mypage_profile_edit_modal.png',
      '일반 회원 세션',
      '프로필 사진 및 정보 수정 모달',
      '프로필 아바타 이미지 업로드 UI, 닉네임, 연락처 변경 폼',
      '440x920 Mobile'
    );

    // 모달 닫기
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[role="dialog"] button[aria-label="닫기"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(300);

    // ==========================================
    // [CATEGORY 10] 최고관리자 세션 & 통합 관리자 대시보드 (SHOP_ADMIN)
    // ==========================================
    console.log('\n--- Category 10: 최고관리자 세션 & 관리자 대시보드 ---');
    // 최고관리자 토큰 주입 (admin@luxuryrental.com)
    await page.evaluate(async () => {
      try {
        const res = await fetch('http://localhost:4000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@luxuryrental.com', password: 'admin1234!' })
        });
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('lr_token', data.token);
        }
      } catch (e) {}
    });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await sleep(700);

    await capture(
      page,
      '61_admin_login_home.png',
      '최고관리자 세션',
      '최고관리자 로그인 메인 화면',
      '상단 "👑 최고관리자" 황금 인디고 배지 및 관리자 프로필',
      '440x920 Mobile'
    );

    // 설정 센터로 이동 -> 관리자 대시보드 진입 카드 노출 확인
    await resetToView(page, 'SHOP_SETTINGS');

    await capture(
      page,
      '62_admin_settings_dashboard_entry_card.png',
      '최고관리자 세션',
      '관리자 전용 설정 페이지',
      '최고관리자에게만 독점 노출되는 "통합 관리자 대시보드" 진입 카드 (ADMIN ONLY)',
      '440x920 Mobile'
    );

    // 관리자 마이페이지
    await resetToView(page, 'SHOP_MY_PAGE');

    await capture(
      page,
      '63_admin_mypage_admin_role.png',
      '최고관리자 세션',
      '관리자 마이페이지 화면',
      '최고관리자 권한 배지 및 시스템 관리 안내',
      '440x920 Mobile'
    );

    // 고해상도 1920x1080 데스크톱 뷰포트로 확장하여 관리자 대시보드 캡처
    await page.setViewport({ width: 1920, height: 1080 });
    await resetToView(page, 'SHOP_ADMIN');
    await sleep(800);

    await capture(
      page,
      '64_admin_recruit_dashboard_store.png',
      '통합 관리자 대시보드',
      '매장 구인/채용 현황 대시보드 (매장 모드)',
      '실시간 충원 통계, 매장별 TO 현황, 긴급 구인 요청 리스트 및 글래스모피즘 UI',
      '1920x1080 Desktop'
    );

    // TO 변경 요청 클릭 -> 모달 팝업
    await clickByText(page, 'button', 'TO 변경요청');
    await sleep(400);

    await capture(
      page,
      '65_admin_recruit_to_request_modal.png',
      '통합 관리자 대시보드',
      'TO 변경 요청 글래스모피즘 모달',
      '매장 관리자 권한 TO 증원/감원 요청 팝업',
      '1920x1080 Desktop'
    );
    await clickByText(page, 'button', '확인');
    await sleep(300);

    // '신규 구인 요청 작성' 서브탭
    await clickByText(page, 'button', '신규 구인 요청 작성');
    await sleep(400);

    // 폼 입력
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(i => {
        if (i.type === 'date') i.value = '2026-11-10';
        if (i.placeholder?.includes('예: 10:00')) i.value = '10:00 - 19:00';
        if (i.placeholder?.includes('예: 30분')) i.value = '60분';
        if (i.type === 'number') i.value = '2';
        if (i.placeholder?.includes('추천 지인')) i.value = '이민호 매니저';
        i.dispatchEvent(new Event('input', { bubbles: true }));
        i.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const selects = document.querySelectorAll('select');
      if (selects[0]) {
        selects[0].value = '강남본점';
        selects[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(300);

    await capture(
      page,
      '66_admin_recruit_form_filled.png',
      '통합 관리자 대시보드',
      '신규 구인 요청 작성 폼 입력 상태',
      '근무일자, 직무, 근무시간, 휴게시간, 인원수, 추천인 입력 상태',
      '1920x1080 Desktop'
    );

    // '근무자 DB & 단체 문자' 서브탭
    await clickByText(page, 'button', '근무자 DB & 단체 문자');
    await sleep(400);

    // '선택 대상 단체 문자 발송' 클릭 -> 모달
    await clickByText(page, 'button', '선택 대상 단체 문자 발송');
    await sleep(400);

    await capture(
      page,
      '67_admin_recruit_workers_db_and_sms_modal.png',
      '통합 관리자 대시보드',
      '근무자 DB 및 단체 문자 발송 모달',
      '체크박스로 선택된 매장 근무자 대상 맞춤 공지 SMS 발송 모달',
      '1920x1080 Desktop'
    );
    await clickByText(page, 'button', '확인');
    await sleep(300);

    // '실시간 소통 및 채팅' 서브탭
    await clickByText(page, 'button', '실시간 소통 및 채팅');
    await sleep(400);

    // 채팅 메시지 입력 및 전송
    const chatInput = 'input[placeholder*="메시지를 입력하세요"]';
    if (await page.$(chatInput)) {
      await page.type(chatInput, '주말 팝업 스토어 럭셔리 핸드백 검수 인력 2명 정상 배치되었습니다.', { delay: 25 });
      await sleep(200);
      await clickByText(page, 'button', '전송');
      await sleep(300);
    }

    await capture(
      page,
      '68_admin_recruit_chat_interaction.png',
      '통합 관리자 대시보드',
      '실시간 소통 및 채팅 상호작용',
      '매장 관리자 및 본사 총괄 담당자 간 실시간 업무 지시 및 상태 공유 채팅',
      '1920x1080 Desktop'
    );

    // 권한 전환: '담당자 화면으로 전환' (본사 ADMIN 모드)
    await clickByText(page, 'button', '담당자 화면으로 전환');
    await sleep(400);

    await capture(
      page,
      '69_admin_role_switch_headquarters.png',
      '통합 관리자 대시보드',
      '본사 총괄 관리자(ADMIN) 모드 전환',
      '전국 매장 구인 현황 집계 및 본사 전용 관리 도구(엑셀 업로드, 채용 확정 등록) 활성화',
      '1920x1080 Desktop'
    );

    // 엑셀 구인현황 업로드 모달
    await clickByText(page, 'button', '엑셀 구인현황 업로드 도구');
    await sleep(500);
    await capture(page, '70_admin_excel_upload_modal.png', '통합 관리자 대시보드', '35개 매장 구인 현황 엑셀 일괄 업로드 모달', '35개 매장 TO 데이터 미리보기 및 데이터베이스 일괄 반영 모달', '1920x1080 Desktop');
    await clickByText(page, 'button', '취소');
    await sleep(300);

    // 채용 결과 등록 모달
    await clickByText(page, 'button', '채용 결과 등록');
    await sleep(400);
    await capture(page, '71_admin_hire_result_modal.png', '통합 관리자 대시보드', '채용 결과 등록 팝업 모달', '최종 합격자 확정 및 문자 통보 모달', '1920x1080 Desktop');
    await clickByText(page, 'button', '확인');
    await sleep(300);

    // 상단 탭: '쇼핑몰 관리' 클릭
    await clickByText(page, 'button', '쇼핑몰 관리');
    await sleep(600);

    await capture(
      page,
      '72_admin_shop_management_table.png',
      '통합 관리자 대시보드',
      '쇼핑몰 상품 관리 테이블',
      '서버 DB와 연동된 명품 렌탈 상품 목록, 브랜드, 1일/3일 대여료, 이미지 갤러리 관리 버튼',
      '1920x1080 Desktop'
    );

    // '신규 상품 등록' 버튼 클릭
    await clickByText(page, 'button', '신규 상품 등록');
    await sleep(500);

    await capture(
      page,
      '73_admin_shop_add_product_modal.png',
      '통합 관리자 대시보드',
      '신규 명품 상품 등록 모달',
      '신규 상품 즉시 등록 및 DB 반영 확인 알림 모달',
      '1920x1080 Desktop'
    );
    await clickByText(page, 'button', '확인');
    await sleep(400);

    // 첫 번째 상품의 '갤러리 관리' 버튼 클릭
    await page.evaluate(() => {
      const galleryBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('갤러리 관리'));
      if (galleryBtn) galleryBtn.click();
    });
    await sleep(500);

    await capture(
      page,
      '74_admin_shop_image_gallery_modal.png',
      '통합 관리자 대시보드',
      '상품 이미지 갤러리 관리 모달',
      '해당 상품에 연결된 실사 룩북 갤러리 조회, 신규 룩북 사진 파일 첨부 및 등록/삭제 인터랙션',
      '1920x1080 Desktop'
    );

    // 갤러리 모달 닫기
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '닫기');
      if (closeBtn) closeBtn.click();
    });
    await sleep(400);

    // 상단 탭: '고객 판매/위탁 관리' 클릭
    await clickByText(page, 'button', '고객 판매/위탁 관리');
    await sleep(500);

    await capture(
      page,
      '75_admin_sell_requests_management.png',
      '통합 관리자 대시보드',
      '고객 명품 판매/위탁 신청 관리 탭',
      '고객들이 신청한 명품 판매 접수 건 검토, 승인/반려 상태 변경 컨트롤러',
      '1920x1080 Desktop'
    );

    // '앱으로 돌아가기' 버튼 클릭
    await clickByText(page, 'button', '앱으로 돌아가기');
    await sleep(600);

    await capture(
      page,
      '76_admin_return_to_main_app.png',
      '통합 관리자 대시보드',
      '메인 쇼핑몰 앱으로 부드러운 복귀',
      '관리자 대시보드에서 일반 소비자 쇼핑몰 화면으로의 완벽한 뷰 전환',
      '1920x1080 Desktop'
    );

    // ==========================================
    // [CATEGORY 11] 멀티 뷰포트 반응형 완전성 검증
    // ==========================================
    console.log('\n--- Category 11: 5대 뷰포트 반응형 검증 ---');
    const viewports = [
      { name: '77_responsive_360_small_mobile.png', width: 360, height: 780, label: '360px 소형 모바일', desc: '초소형 안드로이드 폰 뷰포트 레이아웃 무결성' },
      { name: '78_responsive_390_standard_mobile.png', width: 390, height: 844, label: '390px 표준 모바일', desc: '표준 아이폰 뷰포트 레이아웃 무결성' },
      { name: '79_responsive_430_large_mobile.png', width: 430, height: 932, label: '430px 대형 모바일', desc: '대화면 프로 맥스 뷰포트 레이아웃 무결성' },
      { name: '80_responsive_768_tablet.png', width: 768, height: 1024, label: '768px 태블릿 세로', desc: '아이패드/태블릿 세로 모드 중앙 정렬 레이아웃 무결성' },
      { name: '81_responsive_1920_ultrawide.png', width: 1920, height: 1080, label: '1920px 울트라와이드 데스크톱', desc: 'FHD 와이드 모니터 뷰포트 레이아웃 무결성' }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await sleep(350);
      await capture(
        page,
        vp.name,
        '반응형 뷰포트 검증',
        vp.label,
        vp.desc,
        `${vp.width}x${vp.height}`
      );
    }

    // ==========================================
    // 색인 마크다운 생성 (SCREENSHOTS_INDEX.md)
    // ==========================================
    console.log('\n--- SCREENSHOTS_INDEX.md 색인 문서 생성 ---');
    let md = `# LUXURY RENTAL — 전 화면 및 상호작용 스크린샷 인덱스 (Phase 3)\n\n`;
    md += `본 디렉토리(\`docs/screenshots_phase3/\`)는 LuxuryRental 웹 애플리케이션의 **모든 화면, 모달, 인터랙션, 상태 변화, 관리자 대시보드 및 5대 반응형 뷰포트**를 **1.5x Retina 고해상도**로 자동 캡처한 전체 스크린샷 모음입니다.\n\n`;
    md += `**총 캡처 수량**: **${screenshotRegistry.length}개**\n`;
    md += `**생성 일시**: ${new Date().toISOString()}\n\n`;
    md += `---\n\n`;

    const categories = Array.from(new Set(screenshotRegistry.map(s => s.category)));

    categories.forEach((cat, idx) => {
      md += `## ${idx + 1}. ${cat}\n\n`;
      md += `| 번호 | 미리보기 | 파일명 | 기능 및 화면 설명 | 세부 인터랙션 내용 | 해상도/환경 |\n`;
      md += `| :---: | :---: | :--- | :--- | :--- | :--- |\n`;
      
      const items = screenshotRegistry.filter(s => s.category === cat);
      items.forEach((item, itemIdx) => {
        md += `| ${itemIdx + 1} | <img src="./${item.filename}" width="120" alt="${item.title}" /> | \`${item.filename}\` | **${item.title}** | ${item.description} | \`${item.viewport}\` |\n`;
      });
      md += `\n---\n\n`;
    });

    const indexPath = path.join(outputDir, 'SCREENSHOTS_INDEX.md');
    fs.writeFileSync(indexPath, md, 'utf-8');
    console.log(`[INDEX GENERATED] ${indexPath}`);

    console.log(`\n=== 성공! 총 ${screenshotRegistry.length}개 스크린샷 캡처 및 인덱스 문서 작성 완료 ===`);

  } catch (err) {
    console.error('[CAPTURE ERROR]', err);
    throw err;
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
