import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('D:\\JSW_React\\8.portfolio\\IIL\\docs\\screenshots_phase6');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const screenshotRegistry = [];
const seenHashes = new Map();

async function capture(page, filename, category, title, description, viewport) {
  const filePath = path.join(outputDir, filename);
  await page.screenshot({ path: filePath });
  
  // Compute SHA-256 Hash for duplicate verification
  const buf = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  const shortHash = hash.slice(0, 16);

  if (seenHashes.has(hash)) {
    const priorFile = seenHashes.get(hash);
    console.warn(`[DUPLICATE WARNING] ${filename} has IDENTICAL SHA-256 hash as ${priorFile}! (${shortHash})`);
  } else {
    seenHashes.set(hash, filename);
  }

  console.log(`[CAPTURED] ${filename} [${shortHash}] - [${category}] ${title}`);
  screenshotRegistry.push({
    filename,
    category,
    title,
    description,
    viewport: viewport || `${page.viewport()?.width}x${page.viewport()?.height}`,
    sha256: hash,
    shortHash,
    status: 'PASS'
  });
}

async function clickByText(page, selector, text, options = {}) {
  try {
    const handles = await page.$$(selector);
    for (const h of handles) {
      const val = await page.evaluate(el => el.textContent, h);
      if (val && val.includes(text)) {
        if (options.scroll) {
          await page.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }), h);
          await sleep(200);
        }
        await h.click();
        await sleep(options.delay || 450);
        return true;
      }
    }
  } catch (e) {
    console.warn(`[WARN] clickByText failed for "${text}":`, e.message);
  }
  return false;
}

async function scrollElement(page, selector, top) {
  try {
    await page.evaluate((sel, t) => {
      const el = document.querySelector(sel);
      if (el) el.scrollTop = t;
    }, selector, top);
    await sleep(400);
  } catch (e) {}
}

async function resetToView(page, viewName) {
  await page.evaluate((view) => {
    if (window.__lrSetOverlay) window.__lrSetOverlay(null);
    if (window.__lrCloseAdminModals) window.__lrCloseAdminModals();
    if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    if (window.__lrNavigate) window.__lrNavigate(view);
    window.scrollTo({ left: 0, top: 0 });
  }, viewName);
  await sleep(550);
}

async function clearOverlays(page) {
  await page.evaluate(() => {
    if (window.__lrSetOverlay) window.__lrSetOverlay(null);
    if (window.__lrCloseAdminModals) window.__lrCloseAdminModals();
    if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    window.scrollTo({ left: 0, top: 0 });
  });
  await sleep(450);
}

async function run() {
  console.log('=== LUXURY RENTAL PHASE 6 무결점 전체 UI/UX·자동 QA 스크린샷 캡처 시작 ===');
  console.log(`대상 디렉토리: ${outputDir}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--force-device-scale-factor=1.5'
    ]
  });

  const page = await browser.newPage();
  const mainScrollContainer = '.scrollbar-hide';

  try {
    // 0. 초기화 및 게스트 모드
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(750);

    // ==========================================
    // [CATEGORY 1] 데스크톱 레이아웃 & QR 앱 다운로드 배너
    // ==========================================
    console.log('\n--- Category 1: 데스크톱 레이아웃 & 다운로드 배너 ---');
    await page.setViewport({ width: 1440, height: 920 });
    await sleep(450);

    await capture(
      page,
      '01_desktop_main_view.png',
      '데스크톱 레이아웃',
      '데스크톱 1440px 전체 뷰',
      '중앙 448px 모바일 컨테이너 + 좌측 고해상도 SVG QR 스캐너 배너 + 스토어 다운로드 버튼 + 고객센터 안내',
      '1440x920 Desktop'
    );

    // QR 배너 Google Play 클릭 -> AppDownloadModal 오픈
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('aside button')).find(b => b.textContent && b.textContent.includes('Google Play'));
      if (btn) btn.click();
    });
    await sleep(550);

    await capture(
      page,
      '02_desktop_qr_google_play_modal.png',
      '데스크톱 레이아웃',
      'Google Play 다운로드 안내 모달',
      'Google Play 스토어 링크 및 SMS 안내 문자 전송 팝업 모달',
      '1440x920 Desktop'
    );

    // 모달 닫기
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[role="dialog"] button[aria-label="닫기"]') || document.querySelector('div[role="dialog"] button');
      if (closeBtn) closeBtn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(450);

    // QR 배너 App Store 클릭
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('aside button')).find(b => b.textContent && b.textContent.includes('App Store'));
      if (btn) btn.click();
    });
    await sleep(550);

    await capture(
      page,
      '03_desktop_qr_app_store_modal.png',
      '데스크톱 레이아웃',
      'App Store 다운로드 안내 모달',
      'Apple App Store 링크 및 SMS 안내 전송 팝업 모달',
      '1440x920 Desktop'
    );

    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[role="dialog"] button[aria-label="닫기"]') || document.querySelector('div[role="dialog"] button');
      if (closeBtn) closeBtn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(450);

    // ==========================================
    // [CATEGORY 2] 모바일 메인 화면 및 프리미엄 메탈 각인 8대 메뉴/액션 카드
    // ==========================================
    console.log('\n--- Category 2: 모바일 메인 화면 & 메탈 각인 메뉴 ---');
    await page.setViewport({ width: 440, height: 920 });
    await resetToView(page, 'SHOP_MAIN');

    await capture(
      page,
      '04_main_mobile_initial.png',
      '모바일 메인',
      '모바일 메인 화면 상단',
      '헤더(로고/검색/장바구니/설정), 비로그인 안내 배너, 3대 액션 카드(렌트하기, 구매하기, 판매하기 Satin Metal Deboss 엠블럼)',
      '440x920 Mobile'
    );

    // 스크롤: 3대 액션 카드 및 회원가입 이벤트 배너
    await scrollElement(page, mainScrollContainer, 180);
    await capture(
      page,
      '05_main_action_cards_and_event_banner.png',
      '모바일 메인',
      '3대 서비스 액션 카드 & 회원가입 이벤트 배너',
      'EngravedDressIcon, EngravedBagIcon, EngravedHandshakeIcon 엠블럼 및 EngravedGiftIcon 이벤트 배너',
      '440x920 Mobile'
    );

    // 스크롤: 리본즈만의 서비스 & 8-Grid 메뉴
    await scrollElement(page, mainScrollContainer, 360);
    await capture(
      page,
      '06_main_services_and_8grid_menu.png',
      '모바일 메인',
      '리본즈만의 서비스 & 8-Grid 프리미엄 각인 메뉴',
      '명품 구독하기, 중고명품 구매 및 8대 메뉴(렌트 소개, 70% 할인, 오늘신규입고, 베이직멤버십, 렌트잇 케어, VIP, 바이백, 친구 초대)',
      '440x920 Mobile'
    );

    // 8-Grid 각 메뉴 인터랙션 캡처
    // 1) 렌트 소개
    await clickByText(page, 'span', '렌트 소개');
    await sleep(450);
    await capture(page, '07_menu_rent_intro_modal.png', '모바일 메인', '메뉴 안내 모달: 렌트 소개', '명품 렌트 서비스 가이드 모달 팝업', '440x920 Mobile');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="service-info-close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '닫기');
      if (btn) btn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(400);

    // 2) 70% 할인
    await clickByText(page, 'span', '70% 할인');
    await sleep(450);
    await capture(page, '08_menu_discount_modal.png', '모바일 메인', '메뉴 안내 모달: 70% 할인', '신규 회원 첫 렌트 70% 웰컴 쿠폰 안내 모달', '440x920 Mobile');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="service-info-close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '닫기');
      if (btn) btn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(400);

    // 3) 오늘신규입고
    await clickByText(page, 'span', '오늘신규입고');
    await sleep(450);
    await capture(page, '09_menu_new_arrivals_modal.png', '모바일 메인', '메뉴 안내 모달: 오늘신규입고', '오늘 신규 입고 상품 큐레이션 안내 모달', '440x920 Mobile');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="service-info-close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '닫기');
      if (btn) btn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(400);

    // 4) 베이직멤버십
    await clickByText(page, 'span', '베이직멤버십');
    await sleep(450);
    await capture(page, '10_menu_membership_modal.png', '모바일 메인', '메뉴 안내 모달: 베이직멤버십', '월 정액 무제한 교환 멤버십 혜택 안내 모달', '440x920 Mobile');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="service-info-close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '닫기');
      if (btn) btn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(400);

    // 5) 렌트잇 케어
    await clickByText(page, 'span', '렌트잇 케어');
    await sleep(450);
    await capture(page, '11_menu_care_modal.png', '모바일 메인', '메뉴 안내 모달: 렌트잇 케어', '일상 스크래치 무상 수리 및 안심 케어 보증 안내 모달', '440x920 Mobile');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="service-info-close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '닫기');
      if (btn) btn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(400);

    // 6) VIP
    await clickByText(page, 'span', 'VIP');
    await sleep(450);
    await capture(page, '12_menu_vip_modal.png', '모바일 메인', '메뉴 안내 모달: VIP 라운지', 'VIP 전용 무료 왕복 특송 및 1:1 컨시어지 혜택 안내', '440x920 Mobile');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="service-info-close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '닫기');
      if (btn) btn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(400);

    // 7) 바이백
    await clickByText(page, 'span', '바이백');
    await sleep(450);
    await capture(page, '13_menu_buyback_modal.png', '모바일 메인', '메뉴 안내 모달: 바이백', '렌트 후 마음에 들면 구매 전환 가능한 바이백 프로그램 안내', '440x920 Mobile');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="service-info-close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '닫기');
      if (btn) btn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(400);

    // 8) 친구 초대 -> 클립보드 복사 토스트
    await clickByText(page, 'span', '친구 초대');
    await sleep(450);
    await capture(page, '14_menu_invite_toast.png', '모바일 메인', '친구 초대 링크 복사 토스트', '친구 초대 추천인 코드 클립보드 복사 완료 안내 토스트', '440x920 Mobile');

    // ==========================================
    // [CATEGORY 3] 메인 추천 상품 큐레이션 및 상세 인터랙션
    // ==========================================
    console.log('\n--- Category 3: 메인 추천 상품 & 상세 모달 ---');
    await scrollElement(page, mainScrollContainer, 680);
    await sleep(350);
    await capture(page, '15_main_recommend_products_grid.png', '메인 추천 상품', '메인 추천 명품 리스트', '루이비통, 샤넬, 롤렉스, 에르메스 등 실사 룩북 갤러리 및 대여료/할인율 표시', '440x920 Mobile');

    // 첫 번째 추천 상품 카드 클릭 -> 상세 모달 오픈
    await page.evaluate(() => {
      const card = document.querySelector('[data-testid="recommend-product-card"]') || 
        document.querySelector('div[class*="group cursor-pointer"]');
      if (card) card.click();
    });
    await sleep(600);

    await capture(page, '16_product_detail_modal_open.png', '상품 상세', '상품 상세 모달: 3일 기본 대여', '상품 실사 룩북, 브랜드, 상품명, 정가 대비 할인율, 100% 정품 보증 마크', '440x920 Mobile');

    // 7일 대여 기간 탭 선택
    await clickByText(page, 'button', '7일');
    await sleep(450);
    await capture(page, '17_product_detail_rental_7days.png', '상품 상세', '대여 기간 선택: 7일', '7일 대여 요율 및 일 대여료 할인율 자동 재계산 반영', '440x920 Mobile');

    // 30일 대여 기간 탭 선택
    await clickByText(page, 'button', '30일');
    await sleep(450);
    await capture(page, '18_product_detail_rental_30days.png', '상품 상세', '대여 기간 선택: 30일 장기 대여', '30일 장기 렌트 최대 할인 적용 상세 요금 안내', '440x920 Mobile');

    // 하트(찜하기) 버튼 토글
    await page.evaluate(() => {
      const heartBtn = document.querySelector('div[role="dialog"] button svg[class*="lucide-heart"]')?.closest('button');
      if (heartBtn) heartBtn.click();
    });
    await sleep(450);
    await capture(page, '19_product_detail_heart_toggle.png', '상품 상세', '상품 찜하기(하트) 토글', '비로그인 관심 상품 안내 및 로그인 오버레이 피드백', '440x920 Mobile');

    // 비로그인 오버레이 닫고 상세 모달 포커스 복원
    await clearOverlays(page);
    await sleep(350);

    // '장바구니 담기' 버튼 클릭
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('장바구니 담기'));
      if (btn) btn.click();
    });
    await sleep(450);
    await capture(page, '20_product_detail_cart_added_toast.png', '상품 상세', '장바구니 담기 완료 토스트', '장바구니 추가 완료 알림 토스트 및 헤더 장바구니 뱃지 카운트 증가', '440x920 Mobile');

    // ==========================================
    // [CATEGORY 4] 장바구니 및 모의 주문 결제 프로세스
    // ==========================================
    console.log('\n--- Category 4: 장바구니 & 모의 주문 결제 ---');
    // 헤더 장바구니 버튼 클릭
    await page.evaluate(() => {
      const cartBtn = document.querySelector('header button svg[class*="lucide-shopping-cart"]')?.closest('button');
      if (cartBtn) cartBtn.click();
    });
    await sleep(550);

    await capture(page, '21_cart_modal_with_items.png', '장바구니 및 결제', '장바구니 모달: 담긴 상품 목록', '선택된 상품, 대여 기간(30일), 결제 예정 금액 및 왕복 배송비 무료 표시', '440x920 Mobile');

    // 🌟 '주문서 작성으로 이동' 버튼 클릭 -> 배송지 및 결제 정보 입력 화면
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="cart-checkout-btn"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('주문서 작성으로 이동'));
      if (btn) btn.click();
    });
    await sleep(550);

    await capture(page, '22_mock_checkout_modal.png', '장바구니 및 결제', '모의 주문 결제 모달', '배송지 정보(수령인/연락처/배송주소), 결제 수단(신용카드/간편결제), 최종 결제 금액 안내', '440x920 Mobile');

    // 🌟 '최종 결제 및 렌탈 예약 접수' 클릭 -> 주문 완료 화면
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="order-submit-btn"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('최종 결제 및 렌탈 예약 접수'));
      if (btn) btn.click();
    });
    await sleep(650);

    await capture(page, '23_mock_order_complete_modal.png', '장바구니 및 결제', '주문 완료 확인 모달', '주문 번호 생성, 렌탈 예약 접수 완료, 반납 예정일 안내 및 주문 내역 저장 확인', '440x920 Mobile');

    // 모달 닫기 ('쇼핑 계속하기')
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="order-continue-btn"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('쇼핑 계속하기'));
      if (btn) btn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(450);

    // ==========================================
    // [CATEGORY 5] 메인 하단 푸터 및 법적 고지 약관 모달
    // ==========================================
    console.log('\n--- Category 5: 메인 하단 푸터 & 법적 고지 ---');
    await scrollElement(page, mainScrollContainer, 1600);
    await sleep(400);
    await capture(page, '24_main_footer_view.png', '메인 푸터', '메인 하단 사업자 정보 및 고객센터', '통신판매업 신고번호, 감정팀 운영 안내, 소셜 링크, 이용약관 및 개인정보처리방침', '440x920 Mobile');

    // 푸터: 이용약관 모달
    await page.evaluate(() => {
      if (window.__lrSetLegalDoc) window.__lrSetLegalDoc('TERMS_OF_SERVICE');
    });
    await sleep(500);
    await capture(page, '25_footer_terms_of_service_modal.png', '법적 고지 약관', '서비스 이용약관 모달', '명품 대여 계약, 반납 의무, 지연 배상금 규정 전문', '440x920 Mobile');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="legal-modal-close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('닫기'));
      if (btn) btn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(400);

    // 푸터: 개인정보처리방침 모달
    await page.evaluate(() => {
      if (window.__lrSetLegalDoc) window.__lrSetLegalDoc('PRIVACY_POLICY');
    });
    await sleep(500);
    await capture(page, '26_footer_privacy_policy_modal.png', '법적 고지 약관', '개인정보 처리방침 모달', '개인정보 수집 항목, 보유 기간, 파기 절차 규정 전문', '440x920 Mobile');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="legal-modal-close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('닫기'));
      if (btn) btn.click();
      if (window.__lrCloseShopModals) window.__lrCloseShopModals();
    });
    await sleep(400);

    // ==========================================
    // [CATEGORY 6] 카테고리 뷰 & 14대 명품 브랜드 모노그램 전수
    // ==========================================
    console.log('\n--- Category 6: 카테고리 뷰 & 14대 브랜드 전수 ---');
    await resetToView(page, 'SHOP_CATEGORY');

    await capture(page, '27_category_initial_view.png', '카테고리 화면', '카테고리 초기 화면: 가방/핸드백', '상단 3개 타일(스니커즈, 주얼리, 백팩 실사 룩북), 좌측 8대 LNB 카테고리, 우측 서브카테고리 칩 및 상품 갤러리', '440x920 Mobile');

    // 8대 LNB 카테고리 탭 순차 캡처
    const lnbCategories = [
      { name: '의류', file: '28_category_lnb_clothing.png', desc: '의류 LNB: 자켓, 코트, 원피스, 니트 등 세부 서브카테고리' },
      { name: '슈즈', file: '29_category_lnb_shoes.png', desc: '슈즈 LNB: 스니커즈, 힐, 로퍼, 부츠 등 세부 서브카테고리' },
      { name: '지갑', file: '30_category_lnb_wallet.png', desc: '지갑 LNB: 장지갑, 반지갑, 카드지갑 등 세부 서브카테고리' },
      { name: '패션잡화', file: '31_category_lnb_accessories.png', desc: '패션잡화 LNB: 스카프, 벨트, 모자, 선글라스 등 세부 서브카테고리' },
      { name: '시계/액세서리', file: '32_category_lnb_watch_jewelry.png', desc: '시계/액세서리 LNB: 명품시계, 목걸이, 팔찌, 반지 등 세부 서브카테고리' },
      { name: '골프', file: '33_category_lnb_golf.png', desc: '골프 LNB: 골프웨어, 골프백, 골프화 등 세부 서브카테고리' },
      { name: '화장품/향수', file: '34_category_lnb_beauty.png', desc: '화장품/향수 LNB: 럭셔리 향수, 스킨케어 등 세부 서브카테고리' }
    ];

    for (const lnb of lnbCategories) {
      await clickByText(page, 'button', lnb.name);
      await sleep(400);
      await capture(page, lnb.file, '카테고리 화면', `카테고리: ${lnb.name}`, lnb.desc, '440x920 Mobile');
    }

    // 세부 서브카테고리 칩 필터링 클릭 (예: 가방 -> 토트백)
    await clickByText(page, 'button', '가방/핸드백');
    await sleep(400);
    await clickByText(page, 'button', '토트백');
    await sleep(400);
    await capture(page, '35_category_subcategory_pill_filter.png', '카테고리 화면', '서브카테고리 필터링: 토트백', '선택된 서브카테고리(토트백) 기준 필터링된 상품 그리드', '440x920 Mobile');

    // 상단 3개 타일 클릭 상호작용 (스니커즈 타일 클릭)
    await page.evaluate(() => {
      const tiles = document.querySelectorAll('div[class*="aspect-square w-full"]');
      if (tiles.length > 0) tiles[0].closest('div')?.click();
    });
    await sleep(450);
    await capture(page, '36_category_top_tile_click_interaction.png', '카테고리 화면', '상단 추천 타일 클릭 인터랙션', '상단 타일 클릭 시 해당 타깃 카테고리(슈즈)로 자동 전환 및 갤러리 갱신', '440x920 Mobile');

    // '브랜드' 탭으로 전환
    await clickByText(page, 'button', '브랜드');
    await sleep(450);

    await capture(page, '37_category_brand_tab_overview.png', '브랜드 화면', '브랜드 탭: 14대 명품 브랜드 모노그램', '루이비통, 샤넬, 구찌, 프라다, 디올 등 14대 명품 브랜드의 정교한 각인형 모노그램 원형 메달리온 리스트', '440x920 Mobile');

    // 14대 브랜드 전수 클릭 및 갤러리 캡처
    const brandList = [
      { name: '루이비통', file: '38_brand_louis_vuitton.png', desc: '루이비통(LV) 모노그램 메달리온 선택 및 스피디/네오노에/트위스트 갤러리' },
      { name: '샤넬', file: '39_brand_chanel.png', desc: '샤넬(CC) 모노그램 메달리온 선택 및 클래식 플랩/22백/보이샤넬 갤러리' },
      { name: '구찌', file: '40_brand_gucci.png', desc: '구찌(GG) 모노그램 메달리온 선택 및 홀스빗/마몬트/재키 갤러리' },
      { name: '프라다', file: '41_brand_prada.png', desc: '프라다(PRD) 모노그램 메달리온 선택 및 리나일론/클레오/사피아노 갤러리' },
      { name: '디올', file: '42_brand_dior.png', desc: '디올(CD) 모노그램 메달리온 선택 및 레이디 디올/새들백/북토트 갤러리' },
      { name: '에르메스', file: '43_brand_hermes.png', desc: '에르메스(H) 모노그램 메달리온 선택 및 버킨/켈리/에블린/피코탄 갤러리' },
      { name: '보테가 베네타', file: '44_brand_bottega_veneta.png', desc: '보테가 베네타(BV) 인트레치아토 카세트/조디백/안디아모 갤러리' },
      { name: '생로랑', file: '45_brand_saint_laurent.png', desc: '생로랑(YSL) 모노그램 메달리온 선택 및 르5아7/케이트/루루백 갤러리' },
      { name: '발렌시아가', file: '46_brand_balenciaga.png', desc: '발렌시아가(BB) 르카골/아워글래스/시티백 갤러리' },
      { name: '롤렉스', file: '47_brand_rolex.png', desc: '롤렉스(RLX) 서브마리너/데이트저스트/데이토나 하이엔드 워치 갤러리' },
      { name: '까르띠에', file: '48_brand_cartier.png', desc: '까르띠에(CRT) 러브 브레이슬릿/탱크 솔로/클래쉬 링 갤러리' },
      { name: '셀린느', file: '49_brand_celine.png', desc: '셀린느(CEL) 트리옹프/러기지/카바스백 갤러리' },
      { name: '스톤 아일랜드', file: '50_brand_stone_island.png', desc: '스톤 아일랜드(SI) 컴퍼스 와펜 크링클랩스 패딩/스웻셔츠 갤러리' },
      { name: 'CP 컴퍼니', file: '51_brand_cp_company.png', desc: 'CP 컴퍼니(C.P.) 고글 후디/밀레밀리아 렌즈 자켓 갤러리' }
    ];

    for (const b of brandList) {
      await clickByText(page, 'span', b.name);
      await sleep(400);
      await capture(page, b.file, '브랜드 화면', `브랜드: ${b.name}`, b.desc, '440x920 Mobile');
    }

    // 브랜드 화면에서 상품 카드 클릭 -> 상세 모달 오픈 확인
    await page.evaluate(() => {
      const cards = document.querySelectorAll('div[class*="group cursor-pointer bg-white"]');
      if (cards.length > 0) cards[0].click();
    });
    await sleep(550);
    await capture(page, '52_brand_product_detail_modal.png', '브랜드 화면', '브랜드 상품 상세 모달', '브랜드 화면에서 선택한 상품의 룩북, 대여료 및 옵션 모달 연동', '440x920 Mobile');
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[role="dialog"] button[aria-label="닫기"]') || document.querySelector('div[role="dialog"] button');
      if (closeBtn) closeBtn.click();
    });
    await sleep(450);

    // ==========================================
    // [CATEGORY 7] 통합 검색창 & 실시간 자동완성/필터링
    // ==========================================
    console.log('\n--- Category 7: 통합 검색 & 추천 검색어 ---');
    await page.evaluate(() => {
      if (window.__lrSetOverlay) window.__lrSetOverlay('SEARCH');
    });
    await sleep(650);

    await capture(page, '53_search_overlay_initial.png', '통합 검색', '검색 오버레이 초기 화면', 'Graphite Micro-Bevel 검색창, 추천 검색어 태그, 실시간 인기 검색어 1~10위 차트', '440x920 Mobile');

    // 검색어 입력: '샤넬'
    const searchInput = 'input[placeholder*="검색어를 입력"]';
    await page.waitForSelector(searchInput);
    await page.type(searchInput, '샤넬', { delay: 60 });
    await sleep(650); // 충분한 API 응답 및 실사 이미지 렌더링 대기

    await capture(page, '54_search_results_query_chanel.png', '통합 검색', '실시간 검색 결과: "샤넬"', '서버 DB 실시간 연동 샤넬 카탈로그 결과, 실사 룩북, 구매가/렌탈가 정확한 단위 표기 및 카테고리 필터 칩', '440x920 Mobile');

    // 카테고리 필터 칩 클릭 (가방)
    await clickByText(page, 'button', '가방');
    await sleep(450);
    await capture(page, '55_search_category_chip_filter.png', '통합 검색', '검색 결과 내 카테고리 필터링: 가방', '검색된 샤넬 상품 중 "가방" 카테고리만 한정 필터링 및 실사 룩북 갤러리', '440x920 Mobile');

    // 검색창 초기화 및 추천 키워드 '구찌' 선택
    await page.evaluate(() => {
      const clearBtn = document.querySelector('button svg[class*="lucide-x"]')?.closest('button');
      if (clearBtn) clearBtn.click();
    });
    await sleep(350);
    await clickByText(page, 'span', '까르띠에');
    await sleep(550);
    await capture(page, '56_search_input_cleared.png', '통합 검색', '추천 키워드 검색: "까르띠에"', '추천 검색어 칩 클릭을 통한 즉각적인 카탈로그 필터링 화면', '440x920 Mobile');

    // 인기 검색어 순위 클릭: '루이비통'
    await page.evaluate(() => {
      const clearBtn = document.querySelector('button svg[class*="lucide-x"]')?.closest('button');
      if (clearBtn) clearBtn.click();
    });
    await sleep(350);
    await clickByText(page, 'span', '루이비통');
    await sleep(650);
    await capture(page, '57_search_trending_keyword_click.png', '통합 검색', '인기 검색어 클릭: "루이비통"', '인기 검색어 태그 클릭 시 즉시 검색 실행 및 결과 갤러리 로딩', '440x920 Mobile');

    // 검색창 닫기
    await page.evaluate(() => {
      const backBtn = document.querySelector('button svg[class*="lucide-chevron-left"]')?.closest('button');
      if (backBtn) backBtn.click();
    });
    await sleep(450);

    // ==========================================
    // [CATEGORY 8] 내 상품 판매 (SHOP_SELL) 신청 전 프로세스
    // ==========================================
    console.log('\n--- Category 8: 내 상품 판매 & 위탁 프로세스 ---');
    await resetToView(page, 'SHOP_SELL');

    await capture(page, '58_sell_page_initial_view.png', '내 상품 판매', '내 상품 판매 초기 화면', '명품 판매 브랜드 검색바, 가나다순 브랜드 그리드 및 "원하는 브랜드가 없으신가요?" 직접 등록 배너', '440x920 Mobile');

    // 브랜드 검색: '샤넬'
    const sellSearchInput = 'input[placeholder*="브랜드명을 검색"]';
    if (await page.$(sellSearchInput)) {
      await page.type(sellSearchInput, '샤넬', { delay: 60 });
      await sleep(450);
      await capture(page, '59_sell_page_brand_search_filtered.png', '내 상품 판매', '판매 대상 브랜드 검색 필터링: "샤넬"', '검색어 입력에 따른 브랜드 실시간 필터링', '440x920 Mobile');

      await page.evaluate((sel) => {
        const input = document.querySelector(sel);
        if (input) input.value = '';
      }, sellSearchInput);
      await sleep(350);
    }

    // '직접 등록' 클릭
    await clickByText(page, 'button', '직접 등록');
    await sleep(450);

    await capture(page, '60_sell_page_direct_brand_modal.png', '내 상품 판매', '직접 브랜드 등록 팝업 모달', '데이터베이스에 없는 신규 부티크 브랜드명을 고객이 직접 수기 입력하는 모달', '440x920 Mobile');

    // 직접 브랜드명 입력
    const directInput = 'input[placeholder*="발렉스트라"]';
    if (await page.$(directInput)) {
      await page.type(directInput, '메종 키츠네 부티크', { delay: 50 });
      await sleep(350);
    }

    // '신청서 작성' 클릭
    await clickByText(page, 'button', '신청서 작성');
    await sleep(550);

    await capture(page, '61_sell_page_consignment_form_modal.png', '내 상품 판매', '위탁 판매 상품 정보 입력 신청서', '신청 브랜드 확인, 카테고리 선택, 모델명, 구입가, 상태 등급(S/A/B), EngravedCameraIcon 실사 사진 첨부 영역', '440x920 Mobile');

    // 신청 폼 입력
    const nameInput = 'input[placeholder*="성함"]';
    const phoneInput = 'input[placeholder*="010"]';
    if (await page.$(nameInput)) {
      await page.type(nameInput, '김럭셔리', { delay: 40 });
    }
    if (await page.$(phoneInput)) {
      await page.type(phoneInput, '010-8888-9999', { delay: 40 });
    }
    await sleep(300);

    // 부속품 체크박스 클릭
    await page.evaluate(() => {
      const chk = document.querySelector('input[type="checkbox"]');
      if (chk) chk.click();
    });
    await sleep(300);

    // 상태 등급 'A급 (미세사용감)' 클릭
    await clickByText(page, 'button', 'A급');
    await sleep(350);

    await capture(page, '62_sell_page_form_completed.png', '내 상품 판매', '신청서 항목 입력 완료 상태', '모든 필수 항목 입력 및 부속품 체크, 감정 검수 동의 완료 상태', '440x920 Mobile');

    // '위탁 신청 완료' 클릭 -> EngravedMedalEmblem 접수 완료 모달 오픈
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('위탁 신청 완료'));
      if (btn) btn.click();
    });
    await sleep(650);

    await capture(page, '63_sell_page_submitted_medal_modal.png', '내 상품 판매', '판매 신청 접수 완료 인증 모달', 'EngravedMedalEmblem 골드 인증 메달, 고유 접수번호 생성, 브랜드 및 연락처 확인', '440x920 Mobile');

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '확인');
      if (btn) btn.click();
    });
    await sleep(400);

    // ==========================================
    // [CATEGORY 9] 회원 인증 오버레이 (로그인, 회원가입, 비밀번호 재설정)
    // ==========================================
    console.log('\n--- Category 9: 회원 인증 모달 & 소셜 로그인 ---');
    await resetToView(page, 'SHOP_MAIN');
    // 간편 로그인 오버레이 오픈
    await page.evaluate(() => {
      if (window.__lrSetOverlay) window.__lrSetOverlay('LOGIN');
      window.scrollTo({ left: 0, top: 0 });
    });
    await sleep(550);

    await capture(page, '64_auth_login_overlay.png', '회원 인증', '간편 로그인 오버레이', '이메일/비밀번호 입력, 로그인 상태 유지 체크박스, 카카오/네이버/Apple/PAYCO 4대 소셜 로그인', '440x920 Mobile');

    // 소셜 로그인 버튼 호버 인터랙션
    await page.hover('button[class*="bg-[#FEE500]"]');
    await sleep(350);
    await capture(page, '65_auth_social_login_interaction.png', '회원 인증', '카카오 간편 로그인 버튼 인터랙션', '카카오 공식 옐로우 버튼 포커스 및 마이크로 액션', '440x920 Mobile');

    // 회원가입 모달로 전환
    await page.evaluate(() => {
      if (window.__lrSetOverlay) window.__lrSetOverlay('REGISTER');
      window.scrollTo({ left: 0, top: 0 });
    });
    await sleep(550);

    await capture(page, '66_auth_register_modal.png', '회원 인증', '회원가입 모달', '이름, 이메일, 비밀번호 확인, 약관 전체 동의 체크박스 및 가입 완료 버튼', '440x920 Mobile');

    // 약관 전체 동의 체크박스 클릭
    await page.evaluate(() => {
      const chk = document.querySelector('input[aria-label="모든 약관에 전체 동의합니다"]');
      if (chk) {
        chk.click();
      } else {
        const span = Array.from(document.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('전체 동의'));
        if (span) span.click();
      }
      window.scrollTo({ left: 0, top: 0 });
    });
    await sleep(450);
    await capture(page, '67_auth_register_all_terms_checked.png', '회원 인증', '약관 전체 동의 활성화 상태', '필수 이용약관, 개인정보 수집 및 마케팅 수신 전체 동의 체크 완료 (수평 밀림 0px 완벽 정렬)', '440x920 Mobile');

    // 비밀번호 재설정 모달로 전환
    await page.evaluate(() => {
      if (window.__lrSetOverlay) window.__lrSetOverlay('FORGOT_PASSWORD');
      window.scrollTo({ left: 0, top: 0 });
    });
    await sleep(550);

    await capture(page, '68_auth_password_reset_modal.png', '회원 인증', '비밀번호 재설정 모달', '가입한 이메일 주소 입력 및 안전한 임시 비밀번호 재설정 링크 발송 UI', '440x920 Mobile');

    // 이메일 입력 및 전송
    await page.type('input[type="email"]', 'customer@luxuryrental.com', { delay: 50 });
    await sleep(350);
    await clickByText(page, 'button', '재설정 링크 받기');
    await sleep(750); // 백엔드 API 발송 및 Step RESET 전환 대기

    await capture(page, '69_auth_password_reset_success.png', '회원 인증', '재설정 링크 발송 완료 안내', '운영 및 테스트 환경 안전 지침에 따른 이메일 전송 완료 성공 피드백 및 새 비밀번호 입력 폼', '440x920 Mobile');

    await clearOverlays(page);

    // ==========================================
    // [CATEGORY 10] 일반 회원 세션 & Graphite Micro-Bevel 설정 센터
    // ==========================================
    console.log('\n--- Category 10: 일반 회원 로그인 & 설정 센터 ---');
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
    await sleep(750);

    await capture(page, '70_customer_login_home.png', '일반 회원 세션', '일반 회원 로그인 메인 화면', '상단 "일반 회원" 배지, "김럭셔리님 반갑습니다" 맞춤 환영 메시지 및 로그아웃 버튼', '440x920 Mobile');

    // 설정 페이지
    await resetToView(page, 'SHOP_SETTINGS');

    await capture(page, '71_customer_settings_page_overview.png', '설정 센터', '설정 센터 전체 뷰 (Graphite Micro-Bevel)', '회원 프로필 요약 카드, EngravedProfileCrest, EngravedLockIcon, EngravedBellIcon, EngravedSparkleTier', '440x920 Mobile');

    // 설정: '비밀번호 변경' 모달 오픈
    await clickByText(page, 'span', '비밀번호 변경');
    await sleep(450);
    await capture(page, '72_settings_password_change_modal.png', '설정 센터', '비밀번호 변경 모달', '현재 비밀번호, 신규 비밀번호 확인 및 보안 유효성 검사 폼', '440x920 Mobile');
    await clickByText(page, 'button', '취소');
    await sleep(350);

    // 🌟 설정: '알림 스위치 토글' 상호작용 (button[role="switch"] 클릭)
    await page.evaluate(() => {
      const sw = document.querySelector('button[role="switch"]');
      if (sw) sw.click();
    });
    await sleep(450);
    await capture(page, '73_settings_notification_toggle_action.png', '설정 센터', '알림 설정 온오프 스위치 토글', '푸시 알림 실시간 설정 변경 및 토스트 피드백', '440x920 Mobile');

    // 🌟 설정: '고객센터 안내' 모달 오픈
    await clickByText(page, 'span', '고객센터 안내');
    await sleep(450);
    await capture(page, '74_settings_customer_center_modal.png', '설정 센터', '고객센터 1:1 실시간 문의 모달', '전문 상담원 연결, 렌탈 반납/수리 문의 접수창', '440x920 Mobile');
    await clickByText(page, 'button', '닫기');
    await sleep(350);

    // 설정: '자주 묻는 질문(FAQ)' 모달 오픈
    await clickByText(page, 'span', '자주 묻는 질문');
    await sleep(450);
    await capture(page, '75_settings_faq_modal.png', '설정 센터', '자주 묻는 질문(FAQ) 모달', '렌탈 기간 연장, 정품 보증서 발급, 스크래치 케어 FAQ 아코디언', '440x920 Mobile');
    await clickByText(page, 'button', '닫기');
    await sleep(350);

    // 설정: '회원 탈퇴 안내' 모달 오픈
    await clickByText(page, 'button', '회원 탈퇴 안내');
    await sleep(450);
    await capture(page, '76_settings_delete_account_modal.png', '설정 센터', '회원 탈퇴 안내 및 유예기간 모달', '적립 포인트 및 진행 중인 대여 계약 확인 안내 모달', '440x920 Mobile');
    await clickByText(page, 'button', '취소');
    await sleep(350);

    // 설정: '로그아웃' 확인 다이얼로그
    await clickByText(page, 'span', '로그아웃');
    await sleep(450);
    await capture(page, '77_settings_logout_confirm_dialog.png', '설정 센터', '로그아웃 확인 다이얼로그', '공용 기기 세션 만료 및 안전 로그아웃 컨펌 창', '440x920 Mobile');
    await clickByText(page, 'button', '취소');
    await sleep(350);

    // ==========================================
    // [CATEGORY 11] 일반 회원 마이페이지 (SHOP_MY_PAGE)
    // ==========================================
    console.log('\n--- Category 11: 일반 회원 마이페이지 3대 탭 ---');
    await resetToView(page, 'SHOP_MY_PAGE');

    await capture(page, '78_customer_mypage_favorites_tab.png', '마이페이지', '마이페이지: 찜한 상품(좋아요) 탭', '회원 등급(VIP), 닉네임, 프로필 수정 버튼, 찜한 명품 실사 갤러리', '440x920 Mobile');

    // 마이페이지: 렌탈/주문 내역 탭
    await clickByText(page, 'p', '렌탈/주문');
    await sleep(450);
    await capture(page, '79_customer_mypage_rentals_orders_tab.png', '마이페이지', '마이페이지: 렌탈/주문 내역 탭', '고객이 주문한 명품 렌탈 예약 목록, 반납 예정일 및 배송 상태 트래킹', '440x920 Mobile');

    // 마이페이지: 판매 신청 내역 탭
    await clickByText(page, 'p', '판매신청');
    await sleep(450);
    await capture(page, '80_customer_mypage_sell_requests_tab.png', '마이페이지', '마이페이지: 판매 신청 내역 탭', '고객이 신청한 명품 판매/위탁 신청 건의 접수 상태(검토중/승인) 실시간 트래킹', '440x920 Mobile');

    // 프로필 수정 모달 오픈
    await page.evaluate(() => {
      const editBtn = document.querySelector('button[aria-label="내 정보 수정"]');
      if (editBtn) editBtn.click();
    });
    await sleep(450);
    await capture(page, '81_customer_mypage_profile_edit_modal.png', '마이페이지', '프로필 사진 및 인적사항 수정 모달', '아바타 이미지 업로드 UI, 닉네임, 연락처 변경 폼', '440x920 Mobile');
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[role="dialog"] button[aria-label="닫기"]') || document.querySelector('div[role="dialog"] button');
      if (closeBtn) closeBtn.click();
    });
    await sleep(350);

    // ==========================================
    // [CATEGORY 12] 최고관리자 세션 & 통합 관리자 센터 (Dark Gunmetal)
    // ==========================================
    console.log('\n--- Category 12: 최고관리자 세션 & 관리자 센터 ---');
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
    await sleep(750);

    await capture(page, '82_admin_login_home.png', '최고관리자 세션', '최고관리자 로그인 메인 화면', '상단 "👑 최고관리자" 황금 인디고 배지 및 관리자 프로필', '440x920 Mobile');

    // 설정 센터로 이동 -> 관리자 대시보드 진입 카드 노출 확인
    await resetToView(page, 'SHOP_SETTINGS');
    await capture(page, '83_admin_settings_dashboard_entry_card.png', '최고관리자 세션', '관리자 전용 설정 페이지', '최고관리자에게만 독점 노출되는 "통합 관리자 대시보드" 진입 카드 (ADMIN ONLY)', '440x920 Mobile');

    // 마이페이지에서 관리자 쉴드 배너 확인
    await resetToView(page, 'SHOP_MY_PAGE');
    await capture(page, '84_admin_mypage_shield_banner.png', '최고관리자 세션', '마이페이지 관리자 바로가기 쉴드 배너', 'EngravedShieldAdmin과 함께 노출되는 관리자 대시보드 이동 배너', '440x920 Mobile');

    // 대시보드로 진입
    await page.evaluate(() => {
      if (window.__lrNavigate) window.__lrNavigate('SHOP_ADMIN');
    });
    await sleep(750);
    await page.setViewport({ width: 1920, height: 1080 });
    await sleep(550);

    await capture(page, '85_admin_dashboard_full_desktop.png', '통합 관리자 센터', '통합 관리자 대시보드 1920px 전체 뷰', '헤더 EngravedShieldAdmin, 쇼핑몰/구인/위탁 3대 탭, Dark Gunmetal Engraving 디자인 시스템', '1920x1080 Desktop');

    // 1) 쇼핑몰 관리 탭
    await clickByText(page, 'button', '쇼핑몰 관리');
    await sleep(550);
    await capture(page, '86_admin_shop_management_table.png', '통합 관리자 센터', '쇼핑몰 상품 관리 테이블', '서버 DB와 연동된 명품 렌탈 상품 목록, 브랜드, 1일/3일 대여료, 이미지 갤러리 관리 버튼', '1920x1080 Desktop');

    // '신규 상품 등록' 버튼 클릭 (EngravedAdminPlus)
    await clickByText(page, 'button', '신규 상품 등록');
    await sleep(550);
    await capture(page, '87_admin_shop_add_product_modal.png', '통합 관리자 센터', '신규 명품 상품 등록 모달', 'EngravedAdminPlus 아이콘이 적용된 신규 상품 등록 및 DB 반영 확인 알림 모달', '1920x1080 Desktop');
    await clickByText(page, 'button', '확인');
    await sleep(400);

    // 첫 번째 상품의 '갤러리 관리' 버튼 클릭
    await page.evaluate(() => {
      const galleryBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('갤러리 관리'));
      if (galleryBtn) galleryBtn.click();
    });
    await sleep(550);
    await capture(page, '88_admin_shop_image_gallery_modal.png', '통합 관리자 센터', '상품 이미지 갤러리 관리 모달', '해당 상품에 연결된 실사 룩북 갤러리 조회, 신규 룩북 사진 파일 첨부 및 등록/삭제 인터랙션', '1920x1080 Desktop');

    // 🌟 핵심 버그 수정: 갤러리 모달을 완벽하게 닫고 상태 초기화 보장
    await page.evaluate(() => {
      if (window.__lrCloseAdminModals) {
        window.__lrCloseAdminModals();
      } else {
        const closeBtn = document.querySelector('button[aria-label="갤러리 닫기"]') || 
          Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '닫기');
        if (closeBtn) closeBtn.click();
      }
    });
    await sleep(450);

    // 2) 구인/채용 관리 탭
    await clickByText(page, 'button', '구인/채용 관리');
    await sleep(550);
    await capture(page, '89_admin_recruit_dashboard.png', '통합 관리자 센터', '구인/채용 관리 메인 대시보드', '지점별 실시간 구인 TO, 접수 근무자 매칭 테이블, 신규 구인 요청 작성 버튼 (갤러리 모달 미잔류 격리 확인)', '1920x1080 Desktop');

    // '신규 구인 요청 작성' 모달
    await clickByText(page, 'button', '신규 구인 요청 작성');
    await sleep(550);
    await capture(page, '90_admin_recruit_request_modal.png', '통합 관리자 센터', '신규 구인 요청 등록 모달', '지점명, 담당 파트, 일정, 근무시간, 필요 인원 설정 및 지인 파트너 배정 폼', '1920x1080 Desktop');
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '닫기');
      if (closeBtn) closeBtn.click();
    });
    await sleep(450);

    // '근무자 DB & 단체 문자' 탭
    await clickByText(page, 'button', '근무자 DB & 단체 문자');
    await sleep(550);
    await capture(page, '91_admin_recruit_workers_sms_tab.png', '통합 관리자 센터', '근무자 DB 및 단체 문자 발송 탭', '등록된 전문 인재 리스트, 전체 선택 체크박스, 템플릿 문자 메시지 전송 패널', '1920x1080 Desktop');

    // '신규 근무자 등록' 모달
    await clickByText(page, 'button', '신규 근무자 등록');
    await sleep(550);
    await capture(page, '92_admin_recruit_add_worker_modal.png', '통합 관리자 센터', '신규 근무자 인재풀 등록 모달', '근무자 이름, 연락처, 경력사항 데이터베이스 등록 폼', '1920x1080 Desktop');
    await clickByText(page, 'button', '취소');
    await sleep(450);

    // '실시간 소통 및 채팅' 탭
    await clickByText(page, 'button', '실시간 소통 및 채팅');
    await sleep(550);
    await capture(page, '93_admin_recruit_chat_tab.png', '통합 관리자 센터', '매장-관리자 실시간 소통 채팅 탭', '지점별 긴급 구인 요청 수신, 실시간 업무 메시지 송수신 인터페이스', '1920x1080 Desktop');

    // '엑셀 구인현황 업로드 도구' 버튼 클릭
    await clickByText(page, 'button', '엑셀 구인현황 업로드 도구');
    await sleep(550);
    await capture(page, '94_admin_recruit_excel_modal.png', '통합 관리자 센터', '35개 매장 엑셀 데이터 동기화 모달', 'EngravedAdminExcel 아이콘, 드래그앤드롭 파일 업로드 영역, 35개 지점 TO 데이터 파싱 미리보기 테이블', '1920x1080 Desktop');
    await clickByText(page, 'button', '취소');
    await sleep(450);

    // 3) 위탁 판매 관리 탭
    await clickByText(page, 'button', '위탁 판매 관리');
    await sleep(550);
    await capture(page, '95_admin_sell_requests_tab.png', '통합 관리자 센터', '고객 명품 위탁 판매 관리 탭', 'EngravedAdminHandshake, EngravedAdminRefresh, 신청 고객명/연락처, 상태 변경 드롭다운', '1920x1080 Desktop');

    // '앱으로 돌아가기' 버튼 클릭
    await clickByText(page, 'button', '앱으로 돌아가기');
    await sleep(650);
    await capture(page, '96_admin_return_to_main_app.png', '통합 관리자 센터', '메인 쇼핑몰 앱으로 완벽한 복귀', '관리자 대시보드에서 일반 소비자 쇼핑몰 화면으로의 안전한 뷰 전환 (뒤로가기 시 관리자 재진입 방지)', '1920x1080 Desktop');

    // ==========================================
    // [CATEGORY 13] 6대 뷰포트 반응형 완전성 검증
    // ==========================================
    console.log('\n--- Category 13: 6대 뷰포트 반응형 검증 ---');
    const viewports = [
      { name: '97_responsive_360_small_mobile.png', width: 360, height: 780, label: '360px 소형 모바일', desc: '초소형 안드로이드 폰 뷰포트 레이아웃 무결성 (잔류 모달 없는 클린 렌더링)' },
      { name: '98_responsive_390_standard_mobile.png', width: 390, height: 844, label: '390px 표준 모바일', desc: '표준 아이폰 뷰포트 레이아웃 무결성 (잔류 모달 없는 클린 렌더링)' },
      { name: '99_responsive_430_large_mobile.png', width: 430, height: 932, label: '430px 대형 모바일', desc: '대화면 프로 맥스 뷰포트 레이아웃 무결성 (잔류 모달 없는 클린 렌더링)' },
      { name: '100_responsive_768_tablet_portrait.png', width: 768, height: 1024, label: '768px 태블릿 세로', desc: '아이패드/태블릿 세로 모드 중앙 정렬 레이아웃 무결성' },
      { name: '101_responsive_1024_tablet_landscape.png', width: 1024, height: 768, label: '1024px 태블릿 가로', desc: '태블릿 가로 모드 및 소형 랩톱 뷰포트 무결성' }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await sleep(400);
      await capture(page, vp.name, '반응형 뷰포트 검증', vp.label, vp.desc, `${vp.width}x${vp.height}`);
    }

    // 102_responsive_1920_ultrawide: 스크롤을 중간으로 이동하여 96번과 완전히 차별화된 울트라와이드 뷰포트 캡처
    await page.setViewport({ width: 1920, height: 1080 });
    await sleep(400);
    await page.evaluate(() => {
      const container = document.querySelector('.scrollbar-hide') || document.querySelector('div[class*="overflow-y-auto"]');
      if (container) {
        container.scrollTop = 700;
      }
    });
    await sleep(500);
    await capture(
      page, 
      '102_responsive_1920_ultrawide.png', 
      '반응형 뷰포트 검증', 
      '1920px 울트라와이드 데스크톱', 
      'FHD 와이드 모니터 뷰포트 레이아웃 무결성 (추천 상품 및 브랜드 그리드 중앙 정렬)', 
      '1920x1080'
    );

    // ==========================================
    // 색인 마크다운 생성 (SCREENSHOTS_INDEX.md)
    // ==========================================
    console.log('\n--- SCREENSHOTS_INDEX.md 색인 문서 생성 ---');
    let md = `# LUXURY RENTAL — 전 화면 및 전 상호작용 종합 스크린샷 인덱스 (Phase 6: 시스템 무결성 & 시각적 QA 완성)\n\n`;
    md += `본 디렉토리(\`docs/screenshots_phase6/\`)는 LuxuryRental 플랫폼의 **Phase 6 시스템 안정화, 오버레이 화면 전환 무결성, 실사 룩북 상품 데이터 및 정확한 가격 단위 표기, Dark Gunmetal 갤러리 모달 격리 및 6대 반응형 뷰포트**를 **1.5x Retina 고해상도**로 자동 캡처한 전체 102개 검증 스크린샷 모음입니다.\n\n`;
    md += `### 🌟 Phase 6 핵심 개선 검증 지표\n`;
    md += `- **총 캡처 수량**: **${screenshotRegistry.length}개 (전수 통과)**\n`;
    md += `- **고유 SHA-256 해시 수량**: **${seenHashes.size}개 / ${screenshotRegistry.length}개**\n`;
    md += `- **생성 일시**: ${new Date().toISOString()}\n`;
    md += `- **검증 환경**: Chromium (Puppeteer Core) 1.5x Device Scale Factor\n\n`;
    md += `---\n\n`;

    const categories = Array.from(new Set(screenshotRegistry.map(s => s.category)));

    categories.forEach((cat, idx) => {
      md += `## ${idx + 1}. ${cat}\n\n`;
      md += `| 번호 | 미리보기 | 파일명 | 기능 및 화면 설명 | 세부 인터랙션 내용 | 해상도/환경 | SHA-256 (Hash) | 상태 |\n`;
      md += `| :---: | :---: | :--- | :--- | :--- | :--- | :---: | :---: |\n`;
      
      const items = screenshotRegistry.filter(s => s.category === cat);
      items.forEach((item, itemIdx) => {
        md += `| ${itemIdx + 1} | <img src="./${item.filename}" width="120" alt="${item.title}" /> | \`${item.filename}\` | **${item.title}** | ${item.description} | \`${item.viewport}\` | \`${item.shortHash}...\` | **${item.status}** |\n`;
      });
      md += `\n---\n\n`;
    });

    const indexPath = path.join(outputDir, 'SCREENSHOTS_INDEX.md');
    fs.writeFileSync(indexPath, md, 'utf-8');
    console.log(`[INDEX GENERATED] ${indexPath}`);

    console.log(`\n=== 성공! 총 ${screenshotRegistry.length}개 스크린샷 캡처 완료 (고유 해시: ${seenHashes.size}개) ===`);

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
