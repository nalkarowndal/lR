import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const docsScreenDir = path.resolve(__dirname, '../../docs/screen');
const videosDir = path.resolve(docsScreenDir, 'videos');
const screenshotsDir = path.resolve(docsScreenDir, 'screenshots');
const artifactDir = path.resolve('C:/Users/Administrator/.gemini/antigravity/brain/f15d06f1-f40a-4d5e-a6a5-9100540a5dd3');
const gifencScriptPath = path.resolve(__dirname, '../node_modules/gifenc/dist/gifenc.js');

for (const dir of [docsScreenDir, videosDir, screenshotsDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function injectRecordingCode(page) {
  await page.evaluate(() => {
    window.__lrStartRecording = async () => {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser', frameRate: 60 }
      });
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3000000 });
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      window.__lrRecordingDonePromise = new Promise((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: mime });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        };
      });
      window.__lrRecorder = recorder;
      recorder.start(50);
      return true;
    };

    window.__lrStopRecording = async () => {
      if (window.__lrRecorder && window.__lrRecorder.state !== 'inactive') {
        window.__lrRecorder.stop();
      }
      return await window.__lrRecordingDonePromise;
    };
  });
}

async function convertWebmToGif(webmBuffer, targetGifPath, options = {}) {
  const {
    fps = 10,
    targetWidth = 320,
    startTime = 0.2,
    maxDuration = 6.0
  } = options;

  console.log(`Converting video to GIF: ${path.basename(targetGifPath)}...`);
  const videoBase64 = webmBuffer.toString('base64');
  const videoDataUrl = `data:video/webm;base64,${videoBase64}`;

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><script>var exports = {};</script></head>
        <body style="margin: 0; background: black;">
          <video id="v" muted playsinline></video>
          <canvas id="c"></canvas>
        </body>
      </html>
    `);

    await page.addScriptTag({ path: gifencScriptPath });
    await page.evaluate(() => {
      window.gifenc = exports;
    });

    const base64Gif = await page.evaluate(async ({ dataUrl, fps, targetWidth, startTime, maxDuration }) => {
      const { GIFEncoder, quantize, applyPalette } = window.gifenc;
      const v = document.getElementById('v');
      const c = document.getElementById('c');

      await new Promise((resolve, reject) => {
        v.onloadedmetadata = resolve;
        v.onerror = () => reject('Video failed to load');
        v.src = dataUrl;
        v.load();
      });

      const videoDuration = (Number.isFinite(v.duration) && v.duration > 0) ? v.duration : maxDuration;
      const endTime = Math.min(videoDuration, startTime + maxDuration);
      const effectiveDuration = Math.max(0.5, endTime - startTime);

      const targetHeight = Math.round((v.videoHeight / v.videoWidth) * targetWidth);
      c.width = targetWidth;
      c.height = targetHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });

      const frameInterval = 1 / fps;
      const delayMs = Math.round(frameInterval * 1000);
      const totalFrames = Math.max(5, Math.floor(effectiveDuration * fps));

      const gif = GIFEncoder();

      for (let i = 0; i < totalFrames; i++) {
        const timestamp = startTime + (i * frameInterval);
        v.currentTime = timestamp;
        await new Promise((r) => {
          v.onseeked = r;
          setTimeout(r, 60);
        });

        ctx.drawImage(v, 0, 0, targetWidth, targetHeight);
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const rgba = imgData.data;

        const palette = quantize(rgba, 256);
        const index = applyPalette(rgba, palette);

        gif.writeFrame(index, targetWidth, targetHeight, {
          palette,
          delay: delayMs,
          repeat: 0
        });
      }

      gif.finish();
      const bytes = gif.bytes();
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }, { dataUrl: videoDataUrl, fps, targetWidth, startTime, maxDuration });

    const gifBuffer = Buffer.from(base64Gif, 'base64');
    fs.writeFileSync(targetGifPath, gifBuffer);

    // Also copy to artifact dir and main docs/screen dir
    const artifactGifPath = path.join(artifactDir, path.basename(targetGifPath));
    const screenRootGifPath = path.join(docsScreenDir, path.basename(targetGifPath));
    fs.writeFileSync(artifactGifPath, gifBuffer);
    fs.writeFileSync(screenRootGifPath, gifBuffer);

    console.log(`Saved GIF: ${targetGifPath} (${gifBuffer.length} bytes)`);
  } finally {
    await browser.close();
  }
}

async function recordAllInteractions() {
  console.log('================================================================');
  console.log('🚀 LUXURY RENTAL 전체 페이지 및 상호작용 비디오 녹화 파이프라인 가동');
  console.log(`📁 비디오 출력 폴더: ${videosDir}`);
  console.log('================================================================\n');

  const videoManifest = [];

  // 1. Mobile Sessions (440x920)
  const launchMobileBrowser = async () => {
    return await puppeteer.launch({
      executablePath: chromePath,
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-usermedia-screen-capturing',
        '--allow-http-screen-capture',
        '--auto-select-desktop-capture-source=Entire screen',
        '--use-fake-ui-for-media-stream',
        '--window-size=440,920'
      ]
    });
  };

  // 2. Desktop Sessions (1280x800)
  const launchDesktopBrowser = async () => {
    return await puppeteer.launch({
      executablePath: chromePath,
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-usermedia-screen-capturing',
        '--allow-http-screen-capture',
        '--auto-select-desktop-capture-source=Entire screen',
        '--use-fake-ui-for-media-stream',
        '--window-size=1280,800'
      ]
    });
  };

  // -------------------------------------------------------------
  // Video 1: Splash & ShopMain Interaction
  // -------------------------------------------------------------
  console.log('▶ [1/8] Recording Video 01: 스플래시 화면 인트로 & 메인 큐레이션 상호작용...');
  {
    const browser = await launchMobileBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 440, height: 920 });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await injectRecordingCode(page);

    await page.evaluate(() => window.__lrStartRecording());

    // Trigger splash
    await page.evaluate(() => {
      if (window.__lrTriggerSplash) window.__lrTriggerSplash();
    });
    await sleep(2200); // Splash plays and transitions into Main

    // Scroll main feed
    await page.evaluate(async () => {
      window.scrollBy({ top: 350, behavior: 'smooth' });
    });
    await sleep(600);

    // Click recommendation tabs
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const tab20m = tabs.find((b) => b.textContent && b.textContent.includes('20대 남성'));
      if (tab20m) tab20m.click();
    });
    await sleep(600);

    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const tab30w = tabs.find((b) => b.textContent && b.textContent.includes('30대 여성'));
      if (tab30w) tab30w.click();
    });
    await sleep(600);

    // Click a product card to open product detail modal
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.min-w-\\[150px\\], div.cursor-pointer'));
      const card = cards.find((c) => c.textContent && c.textContent.includes('원'));
      if (card) card.click();
    });
    await sleep(800);

    // Select rental days: 5일, 7일
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn5 = btns.find((b) => b.textContent && b.textContent.trim() === '5일');
      if (btn5) btn5.click();
    });
    await sleep(500);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn7 = btns.find((b) => b.textContent && b.textContent.trim() === '7일');
      if (btn7) btn7.click();
    });
    await sleep(600);

    const base64 = await page.evaluate(() => window.__lrStopRecording());
    const webmBuf = Buffer.from(base64, 'base64');
    const webmPath = path.join(videosDir, '01_splash_and_main_interaction.webm');
    const gifPath = path.join(videosDir, '01_splash_and_main_interaction.gif');
    fs.writeFileSync(webmPath, webmBuf);
    fs.writeFileSync(path.join(artifactDir, '01_splash_and_main_interaction.webm'), webmBuf);

    await browser.close();
    await convertWebmToGif(webmBuf, gifPath, { fps: 10, maxDuration: 5.5 });

    videoManifest.push({
      id: '01',
      title: '스플래시 화면 인트로 & 메인 큐레이션 상호작용',
      webm: 'videos/01_splash_and_main_interaction.webm',
      gif: 'videos/01_splash_and_main_interaction.gif',
      desc: '골드 로고 스플래시 화면 진입, 메인 화면 슬라이드 전환, 20대/30대 추천 탭 전환, 상품 상세 모달 오픈 및 대여 일수(5일/7일) 가격 실시간 계산'
    });
  }

  // -------------------------------------------------------------
  // Video 2: Category & Brands Interaction
  // -------------------------------------------------------------
  console.log('\n▶ [2/8] Recording Video 02: 카테고리 뷰 & 14대 명품 브랜드 필터링 상호작용...');
  {
    const browser = await launchMobileBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 440, height: 920 });

    await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle2' });
    await page.evaluate(() => window.__lrNavigate('SHOP_CATEGORY'));
    await sleep(400);

    await injectRecordingCode(page);
    await page.evaluate(() => window.__lrStartRecording());

    // Switch subtabs: 남성 -> 아동 -> 여성
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const men = tabs.find((b) => b.textContent && b.textContent.trim() === '남성');
      if (men) men.click();
    });
    await sleep(500);

    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const kids = tabs.find((b) => b.textContent && b.textContent.trim() === '아동');
      if (kids) kids.click();
    });
    await sleep(500);

    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const women = tabs.find((b) => b.textContent && b.textContent.trim() === '여성');
      if (women) women.click();
    });
    await sleep(500);

    // Switch LNB: 의류 -> 슈즈 -> 지갑 -> 가방
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const clothing = btns.find((b) => b.textContent && b.textContent.trim() === '의류');
      if (clothing) clothing.click();
    });
    await sleep(400);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bags = btns.find((b) => b.textContent && b.textContent.trim() === '가방');
      if (bags) bags.click();
    });
    await sleep(400);

    // Switch main tab to '브랜드'
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const brandTab = tabs.find((b) => b.textContent && b.textContent.trim() === '브랜드');
      if (brandTab) brandTab.click();
    });
    await sleep(500);

    // Filter brands: 샤넬 -> 구찌 -> 에르메스
    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('button'));
      const chanel = chips.find((c) => c.textContent && c.textContent.trim() === '샤넬');
      if (chanel) chanel.click();
    });
    await sleep(500);

    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('button'));
      const gucci = chips.find((c) => c.textContent && c.textContent.trim() === '구찌');
      if (gucci) gucci.click();
    });
    await sleep(500);

    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('button'));
      const hermes = chips.find((c) => c.textContent && c.textContent.trim() === '에르메스');
      if (hermes) hermes.click();
    });
    await sleep(600);

    const base64 = await page.evaluate(() => window.__lrStopRecording());
    const webmBuf = Buffer.from(base64, 'base64');
    const webmPath = path.join(videosDir, '02_category_and_brands_interaction.webm');
    const gifPath = path.join(videosDir, '02_category_and_brands_interaction.gif');
    fs.writeFileSync(webmPath, webmBuf);
    fs.writeFileSync(path.join(artifactDir, '02_category_and_brands_interaction.webm'), webmBuf);

    await browser.close();
    await convertWebmToGif(webmBuf, gifPath, { fps: 10, maxDuration: 5.0 });

    videoManifest.push({
      id: '02',
      title: '카테고리 뷰 & 14대 명품 브랜드 필터링 상호작용',
      webm: 'videos/02_category_and_brands_interaction.webm',
      gif: 'videos/02_category_and_brands_interaction.gif',
      desc: '여성/남성/아동 서브탭 전환, LNB 품목별 카테고리 전환, 브랜드별 탭 진입 및 샤넬/구찌/에르메스 브랜드 필터 칩 반응형 렌더링'
    });
  }

  // -------------------------------------------------------------
  // Video 3: Search Flow Interaction
  // -------------------------------------------------------------
  console.log('\n▶ [3/8] Recording Video 03: 실시간 통합 검색 & 키워드 필터링 상호작용...');
  {
    const browser = await launchMobileBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 440, height: 920 });

    await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle2' });
    await injectRecordingCode(page);
    await page.evaluate(() => window.__lrStartRecording());

    // Click search icon in header
    await page.evaluate(() => {
      window.__lrSetOverlay('SEARCH');
    });
    await sleep(600);

    // Click trending keyword
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, span, div.cursor-pointer'));
      const item = items.find((i) => i.textContent && i.textContent.includes('샤넬'));
      if (item) item.click();
    });
    await sleep(600);

    // Type query
    const searchInput = await page.$('input[type="text"], input[placeholder*="검색"]');
    if (searchInput) {
      await searchInput.click();
      await searchInput.evaluate((el) => (el.value = ''));
      await searchInput.type('디올', { delay: 100 });
      await page.keyboard.press('Enter');
    }
    await sleep(600);

    // Filter by tag
    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('button'));
      const bagChip = chips.find((c) => c.textContent && c.textContent.trim() === '가방');
      if (bagChip) bagChip.click();
    });
    await sleep(600);

    // Click result card
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.cursor-pointer'));
      const card = cards.find((c) => c.textContent && c.textContent.includes('디올'));
      if (card) card.click();
    });
    await sleep(800);

    const base64 = await page.evaluate(() => window.__lrStopRecording());
    const webmBuf = Buffer.from(base64, 'base64');
    const webmPath = path.join(videosDir, '03_search_flow_interaction.webm');
    const gifPath = path.join(videosDir, '03_search_flow_interaction.gif');
    fs.writeFileSync(webmPath, webmBuf);
    fs.writeFileSync(path.join(artifactDir, '03_search_flow_interaction.webm'), webmBuf);

    await browser.close();
    await convertWebmToGif(webmBuf, gifPath, { fps: 10, maxDuration: 5.0 });

    videoManifest.push({
      id: '03',
      title: '실시간 통합 검색 & 키워드 필터링 상호작용',
      webm: 'videos/03_search_flow_interaction.webm',
      gif: 'videos/03_search_flow_interaction.gif',
      desc: '슬라이딩 검색 오버레이 오픈, 실시간 검색어 1~10위 클릭, 키워드 타이핑 검색 및 카테고리 태그 필터링, 검색 결과 상품 상세 팝업'
    });
  }

  // -------------------------------------------------------------
  // Video 4: Auth Guard & Login / Register Interaction
  // -------------------------------------------------------------
  console.log('\n▶ [4/8] Recording Video 04: 비로그인 가드 & 공식 소셜 로그인·약관 모달...');
  {
    const browser = await launchMobileBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 440, height: 920 });

    await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle2' });
    await injectRecordingCode(page);
    await page.evaluate(() => window.__lrStartRecording());

    // Click product to open modal as guest
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.min-w-\\[150px\\], div.cursor-pointer'));
      const card = cards.find((c) => c.textContent && c.textContent.includes('원'));
      if (card) card.click();
    });
    await sleep(600);

    // Click "장바구니 담기" as guest -> Auth Guard triggers
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cartBtn = btns.find((b) => b.textContent && b.textContent.includes('장바구니 담기'));
      if (cartBtn) cartBtn.click();
    });
    await sleep(800); // Toast and Login overlay open

    // Switch to Email Login Tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const emailTab = btns.find((b) => b.textContent && b.textContent.includes('이메일 로그인'));
      if (emailTab) emailTab.click();
    });
    await sleep(600);

    // Click Banner to go to Register
    await page.evaluate(() => {
      window.__lrSetOverlay('REGISTER');
    });
    await sleep(800);

    // Check legal terms checkboxes in Register
    await page.evaluate(() => {
      const cbs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      cbs.forEach((cb) => cb.click());
    });
    await sleep(600);

    const base64 = await page.evaluate(() => window.__lrStopRecording());
    const webmBuf = Buffer.from(base64, 'base64');
    const webmPath = path.join(videosDir, '04_auth_guard_and_login_interaction.webm');
    const gifPath = path.join(videosDir, '04_auth_guard_and_login_interaction.gif');
    fs.writeFileSync(webmPath, webmBuf);
    fs.writeFileSync(path.join(artifactDir, '04_auth_guard_and_login_interaction.webm'), webmBuf);

    await browser.close();
    await convertWebmToGif(webmBuf, gifPath, { fps: 10, maxDuration: 5.0 });

    videoManifest.push({
      id: '04',
      title: '비로그인 가드 & 공식 소셜 로그인·약관 모달',
      webm: 'videos/04_auth_guard_and_login_interaction.webm',
      gif: 'videos/04_auth_guard_and_login_interaction.gif',
      desc: '비로그인 상품 담기 시 안내 토스트 및 로그인 창 자동 전환, 카카오/구글 공식 버튼, 이메일 로그인 탭, 회원가입 세부 약관 4단 체크박스 상호작용'
    });
  }

  // -------------------------------------------------------------
  // Video 5: Cart & Checkout Interaction
  // -------------------------------------------------------------
  console.log('\n▶ [5/8] Recording Video 05: 장바구니 & 모의 주문 결제 프로세스 상호작용...');
  {
    const browser = await launchMobileBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 440, height: 920 });

    await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle2' });
    // Set authenticated user
    await page.evaluate(() => {
      window.__lrSetUser({ id: 1, email: 'customer@luxuryrental.com', name: '김럭셔리', role: 'CUSTOMER' });
    });
    await sleep(400);

    await injectRecordingCode(page);
    await page.evaluate(() => window.__lrStartRecording());

    // Click product and add to cart
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.min-w-\\[150px\\], div.cursor-pointer'));
      const card = cards.find((c) => c.textContent && c.textContent.includes('원'));
      if (card) card.click();
    });
    await sleep(600);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find((b) => b.textContent && b.textContent.includes('장바구니 담기'));
      if (addBtn) addBtn.click();
    });
    await sleep(800);

    // Open Cart modal via top cart icon
    await page.evaluate(() => {
      const cartIconBtn = document.querySelector('button[aria-label="장바구니"]');
      if (cartIconBtn) cartIconBtn.click();
    });
    await sleep(600);

    // Change rental days
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const plusBtn = btns.find((b) => b.textContent && b.textContent.trim() === '+');
      if (plusBtn) plusBtn.click();
    });
    await sleep(500);

    // Click 주문서 작성하기
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const checkoutBtn = btns.find((b) => b.textContent && (b.textContent.includes('주문') || b.textContent.includes('결제')));
      if (checkoutBtn) checkoutBtn.click();
    });
    await sleep(800);

    const base64 = await page.evaluate(() => window.__lrStopRecording());
    const webmBuf = Buffer.from(base64, 'base64');
    const webmPath = path.join(videosDir, '05_cart_and_checkout_interaction.webm');
    const gifPath = path.join(videosDir, '05_cart_and_checkout_interaction.gif');
    fs.writeFileSync(webmPath, webmBuf);
    fs.writeFileSync(path.join(artifactDir, '05_cart_and_checkout_interaction.webm'), webmBuf);

    await browser.close();
    await convertWebmToGif(webmBuf, gifPath, { fps: 10, maxDuration: 5.0 });

    videoManifest.push({
      id: '05',
      title: '장바구니 & 모의 주문 결제 프로세스 상호작용',
      webm: 'videos/05_cart_and_checkout_interaction.webm',
      gif: 'videos/05_cart_and_checkout_interaction.gif',
      desc: '로그인 후 상품 장바구니 추가, 장바구니 모달 슬라이드, 대여 일수/수량 증감 및 합계 자동 계산, 주문서 작성 단계 이동'
    });
  }

  // -------------------------------------------------------------
  // Video 6: MyPage & Settings Interaction
  // -------------------------------------------------------------
  console.log('\n▶ [6/8] Recording Video 06: 마이페이지 & 공통 설정 토글 상호작용...');
  {
    const browser = await launchMobileBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 440, height: 920 });

    await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      window.__lrSetUser({ id: 1, email: 'customer@luxuryrental.com', name: '김럭셔리', role: 'CUSTOMER' });
    });
    await sleep(300);

    await injectRecordingCode(page);
    await page.evaluate(() => window.__lrStartRecording());

    // Go to MyPage via bottom nav
    await page.evaluate(() => {
      window.__lrNavigate('MY_PAGE');
    });
    await sleep(600);

    // Click profile avatar to open avatar modal
    await page.evaluate(() => {
      const avatarBtn = document.querySelector('button[aria-label*="프로필"], div[role="button"]');
      if (avatarBtn) avatarBtn.click();
    });
    await sleep(600);

    // Close avatar modal
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('취소'));
      if (closeBtn) closeBtn.click();
    });
    await sleep(400);

    // Switch to 찜 목록 tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const wishTab = tabs.find((b) => b.textContent && b.textContent.includes('찜 목록'));
      if (wishTab) wishTab.click();
    });
    await sleep(600);

    // Go to Settings page
    await page.evaluate(() => {
      window.__lrNavigate('SETTINGS');
    });
    await sleep(600);

    // Toggle settings switches
    await page.evaluate(() => {
      const switches = Array.from(document.querySelectorAll('button[role="switch"], input[type="checkbox"]'));
      if (switches[0]) switches[0].click();
    });
    await sleep(400);

    await page.evaluate(() => {
      const switches = Array.from(document.querySelectorAll('button[role="switch"], input[type="checkbox"]'));
      if (switches[1]) switches[1].click();
    });
    await sleep(600);

    const base64 = await page.evaluate(() => window.__lrStopRecording());
    const webmBuf = Buffer.from(base64, 'base64');
    const webmPath = path.join(videosDir, '06_mypage_and_settings_interaction.webm');
    const gifPath = path.join(videosDir, '06_mypage_and_settings_interaction.gif');
    fs.writeFileSync(webmPath, webmBuf);
    fs.writeFileSync(path.join(artifactDir, '06_mypage_and_settings_interaction.webm'), webmBuf);

    await browser.close();
    await convertWebmToGif(webmBuf, gifPath, { fps: 10, maxDuration: 5.0 });

    videoManifest.push({
      id: '06',
      title: '마이페이지 & 공통 설정 토글 상호작용',
      webm: 'videos/06_mypage_and_settings_interaction.webm',
      gif: 'videos/06_mypage_and_settings_interaction.gif',
      desc: '마이페이지 VIP 프로필 카드, 아바타 변경 모달, 찜 목록 탭 전환, 설정 페이지 알림 및 애니메이션 감소 토글 스위치 인터랙션'
    });
  }

  // -------------------------------------------------------------
  // Video 7: Sell Request Flow Interaction
  // -------------------------------------------------------------
  console.log('\n▶ [7/8] Recording Video 07: 내 상품 판매 & 위탁 신청 폼 상호작용...');
  {
    const browser = await launchMobileBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 440, height: 920 });

    await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      window.__lrSetUser({ id: 1, email: 'customer@luxuryrental.com', name: '김럭셔리', role: 'CUSTOMER' });
    });
    await sleep(300);

    await injectRecordingCode(page);
    await page.evaluate(() => window.__lrStartRecording());

    // Navigate to Sell Page
    await page.evaluate(() => {
      window.__lrNavigate('SHOP_SELL');
    });
    await sleep(600);

    // Search brand Goyard
    const brandInput = await page.$('input[placeholder*="브랜드"]');
    if (brandInput) {
      await brandInput.type('고야드', { delay: 100 });
      await sleep(500);
    }

    // Click brand item
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div.cursor-pointer, button'));
      const goyard = items.find((i) => i.textContent && i.textContent.includes('고야드'));
      if (goyard) goyard.click();
    });
    await sleep(800);

    // Fill expected price
    const priceInput = await page.$('input[placeholder*="희망"], input[type="number"], input[name="price"]');
    if (priceInput) {
      await priceInput.type('25000', { delay: 60 });
      await sleep(400);
    }

    // Submit consignment form
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submit = btns.find((b) => b.textContent && (b.textContent.includes('신청') || b.textContent.includes('제출')));
      if (submit) submit.click();
    });
    await sleep(800);

    const base64 = await page.evaluate(() => window.__lrStopRecording());
    const webmBuf = Buffer.from(base64, 'base64');
    const webmPath = path.join(videosDir, '07_sell_request_flow_interaction.webm');
    const gifPath = path.join(videosDir, '07_sell_request_flow_interaction.gif');
    fs.writeFileSync(webmPath, webmBuf);
    fs.writeFileSync(path.join(artifactDir, '07_sell_request_flow_interaction.webm'), webmBuf);

    await browser.close();
    await convertWebmToGif(webmBuf, gifPath, { fps: 10, maxDuration: 5.0 });

    videoManifest.push({
      id: '07',
      title: '내 상품 판매 & 위탁 신청 폼 상호작용',
      webm: 'videos/07_sell_request_flow_interaction.webm',
      gif: 'videos/07_sell_request_flow_interaction.gif',
      desc: '내 상품 판매 페이지 진입, 브랜드 검색(고야드) 및 실시간 필터링, 상품 상태/희망가 입력 폼 작성 및 위탁 신청 제출 완료'
    });
  }

  // -------------------------------------------------------------
  // Video 8: Admin Recruit & Shop Management Interaction (Desktop 1280x800)
  // -------------------------------------------------------------
  console.log('\n▶ [8/8] Recording Video 08: 통합 관리자 RECRUIT 대시보드 & 쇼핑몰 관리 상호작용...');
  {
    const browser = await launchDesktopBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      window.__lrSetUser({ id: 99, email: 'admin@luxuryrental.com', name: '최고관리자', role: 'ADMIN' });
      window.__lrNavigate('SHOP_ADMIN');
    });
    await sleep(600);

    await injectRecordingCode(page);
    await page.evaluate(() => window.__lrStartRecording());

    // Click TO 변경요청 modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const toBtn = btns.find((b) => b.textContent && b.textContent.includes('TO 변경요청'));
      if (toBtn) toBtn.click();
    });
    await sleep(600);

    // Close TO modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const closeBtn = btns.find((b) => b.textContent && (b.textContent.includes('취소') || b.textContent.includes('확인')));
      if (closeBtn) closeBtn.click();
    });
    await sleep(400);

    // Switch to Headquarter Admin Mode
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const switchBtn = btns.find((b) => b.textContent && b.textContent.includes('담당자 화면으로 전환'));
      if (switchBtn) switchBtn.click();
    });
    await sleep(600);

    // Click '근무자 DB & 단체 문자' subtab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const workerTab = tabs.find((t) => t.textContent && t.textContent.includes('근무자 DB'));
      if (workerTab) workerTab.click();
    });
    await sleep(600);

    // Click '실시간 소통 및 채팅' subtab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const chatTab = tabs.find((t) => t.textContent && t.textContent.includes('실시간 소통'));
      if (chatTab) chatTab.click();
    });
    await sleep(600);

    // Type chat message
    const chatInput = await page.$('input[placeholder*="메시지"], input[type="text"]');
    if (chatInput) {
      await chatInput.type('홍대점 긴급 TO 배치가 완료되었습니다.', { delay: 40 });
      await page.keyboard.press('Enter');
      await sleep(600);
    }

    // Switch to '쇼핑몰 관리' tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const shopTab = tabs.find((t) => t.textContent && t.textContent.includes('쇼핑몰 관리'));
      if (shopTab) shopTab.click();
    });
    await sleep(700);

    // Click "앱으로 돌아가기"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const returnBtn = btns.find((b) => b.textContent && b.textContent.includes('앱으로 돌아가기'));
      if (returnBtn) returnBtn.click();
    });
    await sleep(600);

    const base64 = await page.evaluate(() => window.__lrStopRecording());
    const webmBuf = Buffer.from(base64, 'base64');
    const webmPath = path.join(videosDir, '08_admin_recruit_and_shop_interaction.webm');
    const gifPath = path.join(videosDir, '08_admin_recruit_and_shop_interaction.gif');
    fs.writeFileSync(webmPath, webmBuf);
    fs.writeFileSync(path.join(artifactDir, '08_admin_recruit_and_shop_interaction.webm'), webmBuf);

    await browser.close();
    await convertWebmToGif(webmBuf, gifPath, { fps: 10, maxDuration: 6.0, targetWidth: 480 });

    videoManifest.push({
      id: '08',
      title: '통합 관리자 RECRUIT 대시보드 & 쇼핑몰 관리 상호작용',
      webm: 'videos/08_admin_recruit_and_shop_interaction.webm',
      gif: 'videos/08_admin_recruit_and_shop_interaction.gif',
      desc: '매장/본사 관리자 역할 전환, TO 변경 요청, 근무자 DB 조회, 실시간 채팅 메시지 발송, 쇼핑몰 상품 관리 및 앱 복귀 전체 관리 플로우'
    });
  }

  // Save video manifest to disk
  fs.writeFileSync(path.join(videosDir, 'video_manifest.json'), JSON.stringify(videoManifest, null, 2));

  console.log('\n================================================================');
  console.log(`🎉 8개 전 페이지 상호작용 비디오 (WebM & GIF) 녹화 및 인코딩 완료!`);
  console.log('================================================================\n');
}

recordAllInteractions().catch((err) => {
  console.error('Video recording failed:', err);
  process.exit(1);
});
