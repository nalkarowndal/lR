import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const defaultDir = path.resolve(process.cwd(), '../docs/screenshots_phase2');
const outputDir = process.env.SCREENSHOT_OUTPUT_DIR || defaultDir;

// 폴더 확인 및 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('=== LUXURY RENTAL 전체 화면 & 상호작용 자동 캡처 시작 ===');
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--force-device-scale-factor=1.5' // 선명한 고해상도 캡처
    ]
  });

  const page = await browser.newPage();

  // Helper: 클릭 가능한 요소 찾기 (텍스트 기반)
  const clickByText = async (selector, text) => {
    const handles = await page.$$(selector);
    for (const h of handles) {
      const val = await page.evaluate(el => el.textContent, h);
      if (val && val.includes(text)) {
        await h.click();
        await sleep(350);
        return true;
      }
    }
    return false;
  };

  // Helper: 특정 컨테이너 스크롤
  const scrollElement = async (selector, top) => {
    await page.evaluate((sel, t) => {
      const el = document.querySelector(sel);
      if (el) el.scrollTop = t;
    }, selector, top);
    await sleep(350);
  };

  // ==========================================
  // [PART 1] 데스크탑 전체 뷰 (QR 배너 + 모바일 앱 컨테이너)
  // ==========================================
  console.log('1. 데스크탑 뷰 캡처...');
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await sleep(600);
  await page.screenshot({ path: path.join(outputDir, '01_main_desktop_view.png') });

  // ==========================================
  // [PART 2] 모바일 앱 메인 화면 및 스크롤/탭 인터랙션
  // ==========================================
  console.log('2. 모바일 앱 메인 및 스크롤 인터랙션 캡처...');
  await page.setViewport({ width: 440, height: 920 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await sleep(500);
  await page.screenshot({ path: path.join(outputDir, '02_main_mobile_view.png') });

  // 메인 스크롤 - 리본즈만의 서비스 & 8-Grid 메뉴
  const mainScrollContainer = '.scrollbar-hide';
  await scrollElement(mainScrollContainer, 280);
  await page.screenshot({ path: path.join(outputDir, '03_main_services_and_menu.png') });

  // 메인 스크롤 - 가이드 한눈에 & 맞춤 추천 상품
  await scrollElement(mainScrollContainer, 650);
  await page.screenshot({ path: path.join(outputDir, '04_main_guides_and_recommendations.png') });

  // 맞춤 추천 탭 인터랙션 (20대 남성, 30대 여성, 30대 남성, 40대 여성)
  console.log('3. 맞춤 추천 탭 클릭 인터랙션...');
  await clickByText('button', '20대 남성');
  await page.screenshot({ path: path.join(outputDir, '05_main_recommend_tab_20m.png') });

  await clickByText('button', '30대 여성');
  await page.screenshot({ path: path.join(outputDir, '06_main_recommend_tab_30w.png') });

  await clickByText('button', '30대 남성');
  await page.screenshot({ path: path.join(outputDir, '07_main_recommend_tab_30m.png') });

  await clickByText('button', '40대 여성');
  await page.screenshot({ path: path.join(outputDir, '08_main_recommend_tab_40w.png') });

  // 메인 스크롤 - Rent New Arrivals
  await scrollElement(mainScrollContainer, 1050);
  await page.screenshot({ path: path.join(outputDir, '09_main_rent_new_arrivals.png') });

  // 메인 스크롤 - 전체보기 및 토스 에스크로 푸터
  await scrollElement(mainScrollContainer, 1500);
  await page.screenshot({ path: path.join(outputDir, '10_main_footer_escrow.png') });

  // 상단으로 부드럽게 복귀 후 바텀 플로팅 네비게이션 포커스
  await scrollElement(mainScrollContainer, 0);
  await sleep(300);
  await page.screenshot({ path: path.join(outputDir, '11_main_floating_bottom_nav.png') });

  // ==========================================
  // [PART 3] 검색 오버레이 인터랙션 (SEARCH)
  // ==========================================
  console.log('4. 검색 오버레이 인터랙션 캡처...');
  // 검색 버튼 클릭 (헤더의 돋보기 아이콘)
  await page.evaluate(() => {
    const btn = document.querySelector('button > svg.lucide-search')?.parentElement;
    if (btn) btn.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(outputDir, '12_search_overlay_default.png') });

  // 검색창 입력 상호작용
  const searchInput = 'input[placeholder="검색어를 입력해주세요"]';
  await page.waitForSelector(searchInput);
  await page.type(searchInput, '샤넬 클래식 플랩백', { delay: 50 });
  await sleep(300);
  await page.screenshot({ path: path.join(outputDir, '13_search_overlay_typing.png') });

  // 추천 검색어 클릭 상호작용
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.value = '';
  }, searchInput);
  await clickByText('button', '까르띠에');
  await sleep(300);
  await page.screenshot({ path: path.join(outputDir, '14_search_keyword_click.png') });

  // 검색 오버레이 닫기 (뒤로가기 버튼)
  await page.evaluate(() => {
    const backBtn = document.querySelector('.z-\\[110\\] button');
    if (backBtn) backBtn.click();
  });
  await sleep(400);

  // ==========================================
  // [PART 4] 간편 로그인 오버레이 인터랙션 (LOGIN)
  // ==========================================
  console.log('5. 간편 로그인 오버레이 캡처...');
  // 상단 장바구니 버튼 클릭
  await page.evaluate(() => {
    const cartBtn = document.querySelector('button > svg.lucide-shopping-cart')?.parentElement;
    if (cartBtn) cartBtn.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(outputDir, '15_login_overlay_from_cart.png') });

  // 로그인 닫기
  await page.evaluate(() => {
    const backBtn = document.querySelector('.z-\\[100\\] button');
    if (backBtn) backBtn.click();
  });
  await sleep(400);

  // 바텀 네비게이션 '좋아요' 클릭으로 로그인 진입
  await clickByText('span', '좋아요');
  await sleep(400);
  await page.screenshot({ path: path.join(outputDir, '16_login_overlay_from_bottom_heart.png') });

  await page.evaluate(() => {
    const backBtn = document.querySelector('.z-\\[100\\] button');
    if (backBtn) backBtn.click();
  });
  await sleep(400);

  // 바텀 네비게이션 '마이럭셔리렌탈' 클릭으로 로그인 진입
  await clickByText('span', '마이럭셔리렌탈');
  await sleep(400);
  await page.screenshot({ path: path.join(outputDir, '17_login_overlay_from_bottom_mypage.png') });

  await page.evaluate(() => {
    const backBtn = document.querySelector('.z-\\[100\\] button');
    if (backBtn) backBtn.click();
  });
  await sleep(400);

  // ==========================================
  // [PART 5] 카테고리 & 브랜드 페이지 인터랙션 (SHOP_CATEGORY)
  // ==========================================
  console.log('6. 카테고리 & 브랜드 페이지 캡처...');
  await clickByText('span', '카테고리');
  await sleep(400);
  await page.screenshot({ path: path.join(outputDir, '18_category_women_bags.png') });

  // 좌측 카테고리 메뉴 클릭 (의류, 슈즈, 지갑, 시계/액세서리)
  await clickByText('button', '의류');
  await page.screenshot({ path: path.join(outputDir, '19_category_women_clothing.png') });

  await clickByText('button', '슈즈');
  await page.screenshot({ path: path.join(outputDir, '20_category_women_shoes.png') });

  await clickByText('button', '지갑');
  await page.screenshot({ path: path.join(outputDir, '21_category_women_wallet.png') });

  await clickByText('button', '시계/액세서리');
  await page.screenshot({ path: path.join(outputDir, '22_category_women_watch.png') });

  // 상단 서브탭 '남성', '아동'
  await clickByText('button', '남성');
  await page.screenshot({ path: path.join(outputDir, '23_category_subtab_men.png') });

  await clickByText('button', '아동');
  await page.screenshot({ path: path.join(outputDir, '24_category_subtab_kids.png') });

  // 상단 메인 탭 '브랜드' 클릭
  await clickByText('button', '브랜드');
  await page.screenshot({ path: path.join(outputDir, '25_category_main_brand_tab.png') });

  // 브랜드 칩 '구찌', '샤넬' 선택 인터랙션
  await clickByText('span', '구찌');
  await page.screenshot({ path: path.join(outputDir, '26_category_brand_select_gucci.png') });

  await clickByText('span', '샤넬');
  await page.screenshot({ path: path.join(outputDir, '27_category_brand_select_chanel.png') });

  // 메인으로 복귀 (뒤로가기)
  await page.evaluate(() => {
    const backBtn = document.querySelector('button > svg.lucide-chevron-left')?.parentElement;
    if (backBtn) backBtn.click();
  });
  await sleep(400);

  // ==========================================
  // [PART 6] 내 상품 판매 페이지 인터랙션 (SHOP_SELL)
  // ==========================================
  console.log('7. 내 상품 판매 페이지 캡처...');
  await clickByText('span', '내 상품 판매');
  await sleep(400);
  await page.screenshot({ path: path.join(outputDir, '28_sell_page_initial.png') });

  // 판매 브랜드 검색창 입력
  const sellSearchInput = 'input[placeholder="브랜드명을 검색해주세요."]';
  await page.waitForSelector(sellSearchInput);
  await page.type(sellSearchInput, '고야드 (Goyard)', { delay: 50 });
  await sleep(300);
  await page.screenshot({ path: path.join(outputDir, '29_sell_page_search_input.png') });

  // 직접 등록 링크 포커스
  await clickByText('button', '원하는 브랜드가 없다면 직접 등록해보세요');
  await sleep(300);
  await page.screenshot({ path: path.join(outputDir, '30_sell_page_direct_register.png') });

  // 메인으로 복귀 (뒤로가기)
  await page.evaluate(() => {
    const backBtn = document.querySelector('button > svg.lucide-chevron-left')?.parentElement;
    if (backBtn) backBtn.click();
  });
  await sleep(400);

  // ==========================================
  // [PART 7] 통합 관리자 대시보드 인터랙션 (SHOP_ADMIN)
  // ==========================================
  console.log('8. 통합 관리자 대시보드 캡처...');
  // 데스크탑 고해상도 해상도로 확장
  await page.setViewport({ width: 1920, height: 1080 });
  
  // 관리센터 진입 (헤더의 톱니바퀴 아이콘 클릭)
  await page.evaluate(() => {
    const adminBtn = document.querySelector('button > svg.lucide-settings')?.parentElement;
    if (adminBtn) adminBtn.click();
  });
  await sleep(600);
  await page.screenshot({ path: path.join(outputDir, '31_admin_recruit_dashboard_store.png') });

  // TO 변경 요청 클릭 -> 모달 팝업
  await clickByText('button', 'TO 변경요청');
  await page.screenshot({ path: path.join(outputDir, '32_admin_recruit_to_request_modal.png') });
  await clickByText('button', '확인'); // 모달 닫기
  await sleep(300);

  // '신규 구인 요청 작성' 서브탭 클릭
  await clickByText('button', '신규 구인 요청 작성');
  await page.screenshot({ path: path.join(outputDir, '33_admin_recruit_request_form.png') });

  // 구인 요청 폼 입력
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(i => {
      if (i.type === 'date') i.value = '2026-11-05';
      if (i.placeholder?.includes('예: 10:00')) i.value = '09:30 - 18:30';
      if (i.placeholder?.includes('예: 30분')) i.value = '60분';
      if (i.type === 'number') i.value = '3';
      if (i.placeholder?.includes('추천 지인')) i.value = '박지수';
      i.dispatchEvent(new Event('input', { bubbles: true }));
      i.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const selects = document.querySelectorAll('select');
    if (selects[0]) {
      selects[0].value = '홍대점';
      selects[0].dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (selects[1]) {
      selects[1].value = '카운터';
      selects[1].dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(300);
  await page.screenshot({ path: path.join(outputDir, '34_admin_recruit_request_form_filled.png') });

  // 구인 요청 등록 버튼 클릭 -> 모달 팝업
  await clickByText('button', '구인 요청 즉시 등록 및 전송');
  await page.screenshot({ path: path.join(outputDir, '35_admin_recruit_request_submitted_modal.png') });
  await clickByText('button', '확인'); // 모달 닫기
  await sleep(300);

  // '근무자 DB & 단체 문자' 서브탭 클릭
  await clickByText('button', '근무자 DB & 단체 문자');
  await page.screenshot({ path: path.join(outputDir, '36_admin_recruit_workers_db.png') });

  // 단체 문자 발송 버튼 클릭 -> 모달 팝업
  await clickByText('button', '선택 대상 단체 문자 발송');
  await page.screenshot({ path: path.join(outputDir, '37_admin_recruit_sms_modal.png') });
  await clickByText('button', '확인');
  await sleep(300);

  // '실시간 소통 및 채팅' 서브탭 클릭
  await clickByText('button', '실시간 소통 및 채팅');
  await page.screenshot({ path: path.join(outputDir, '38_admin_recruit_chat_initial.png') });

  // 채팅 메시지 입력 및 전송
  const chatInput = 'input[placeholder*="메시지를 입력하세요"]';
  await page.waitForSelector(chatInput);
  await page.type(chatInput, '강남본점 주말 홀 서빙 충원 인원 정상 배정 확인 부탁드립니다.', { delay: 30 });
  await sleep(300);
  await clickByText('button', '전송');
  await sleep(300);
  await page.screenshot({ path: path.join(outputDir, '39_admin_recruit_chat_sent.png') });

  // 권한 토글: '담당자 화면으로 전환' (ADMIN 모드)
  await clickByText('button', '담당자 화면으로 전환');
  await clickByText('button', '채용 현황 및 접수 리스트');
  await page.screenshot({ path: path.join(outputDir, '40_admin_role_switch_to_admin.png') });

  // ADMIN 전용 엑셀 업로드 버튼 클릭 -> 모달 팝업
  await clickByText('button', '엑셀 구인현황 업로드');
  await page.screenshot({ path: path.join(outputDir, '41_admin_role_admin_excel_modal.png') });
  await clickByText('button', '확인');
  await sleep(300);

  // ADMIN 전용 채용 결과 등록 버튼 클릭 -> 모달 팝업
  await clickByText('button', '채용 결과 등록');
  await page.screenshot({ path: path.join(outputDir, '42_admin_role_admin_hire_result_modal.png') });
  await clickByText('button', '확인');
  await sleep(300);

  // 상단 메인 탭: '쇼핑몰 관리' 클릭
  await clickByText('button', '쇼핑몰 관리');
  await page.screenshot({ path: path.join(outputDir, '43_admin_shop_management_tab.png') });

  // 신규 상품 등록 버튼 클릭 -> 글래스모피즘 모달 팝업
  await clickByText('button', '신규 상품 등록');
  await page.screenshot({ path: path.join(outputDir, '44_admin_shop_add_product_modal.png') });
  await clickByText('button', '확인');
  await sleep(300);

  // 상품 추가 후 쇼핑몰 관리 상품 리스트
  await page.screenshot({ path: path.join(outputDir, '45_admin_shop_product_added_list.png') });

  // '앱으로 돌아가기' 버튼 클릭
  await clickByText('button', '앱으로 돌아가기');
  await sleep(500);
  await page.screenshot({ path: path.join(outputDir, '46_admin_return_to_app.png') });

  await browser.close();
  console.log('=== 총 46개 스크린샷 캡처 완료! ===');
}

run().catch(err => {
  console.error('캡처 스크립트 실행 중 오류:', err);
  process.exit(1);
});
