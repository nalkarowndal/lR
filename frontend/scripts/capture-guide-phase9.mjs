import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const baseDocsDir = path.resolve('D:/JSW_React/8.portfolio/IIL/docs/screenshots_phase9');
const screenshotsDir = path.join(baseDocsDir, 'screenshots');
const videosDir = path.join(baseDocsDir, 'videos');
const artifactDir = path.resolve('C:/Users/Administrator/.gemini/antigravity/brain/f15d06f1-f40a-4d5e-a6a5-9100540a5dd3');
const gifencScriptPath = path.resolve(__dirname, '../node_modules/gifenc/dist/gifenc.js');

for (const dir of [baseDocsDir, screenshotsDir, videosDir, artifactDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const appBaseUrl = 'http://localhost:5173';

const newScreenshotsRegistry = [];

async function captureScreenshot(page, filename, category, title, description, viewport = '440x920 Mobile') {
  const filePath = path.join(screenshotsDir, filename);
  await page.screenshot({ path: filePath });

  const buf = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  const shortHash = hash.slice(0, 16);

  console.log(`[CAPTURED] ${filename} [${shortHash}] - ${title}`);

  // Also copy to artifact dir
  const artifactFilePath = path.join(artifactDir, filename);
  fs.writeFileSync(artifactFilePath, buf);

  newScreenshotsRegistry.push({
    filename,
    category,
    title,
    description,
    viewport,
    sha256: hash,
    shortHash,
    status: 'PASS'
  });
}

async function injectRecordingCode(page) {
  const code = () => {
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
  };

  await page.evaluateOnNewDocument(code);
  await page.evaluate(code);
}

async function convertWebmToGif(webmBuffer, targetGifPath, options = {}) {
  const {
    fps = 10,
    targetWidth = 320,
    startTime = 0.2,
    maxDuration = 7.0
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

    // Also write to root screenshots_phase9 and artifact directory
    const rootGifPath = path.join(baseDocsDir, path.basename(targetGifPath));
    const artifactGifPath = path.join(artifactDir, path.basename(targetGifPath));
    fs.writeFileSync(rootGifPath, gifBuffer);
    fs.writeFileSync(artifactGifPath, gifBuffer);

    console.log(`[GIF GENERATED] Saved to ${targetGifPath} and root (${gifBuffer.length} bytes)`);
  } finally {
    await browser.close();
  }
}

async function runScreenshotPipeline() {
  console.log('\n======================================================');
  console.log('📸 [1/2] 렌트 이용 가이드 & 구독 가이드 11대 스크린샷 캡처 시작');
  console.log('======================================================\n');

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
  await page.setViewport({ width: 440, height: 920 });

  try {
    await page.goto(`${appBaseUrl}/?splash=false`, { waitUntil: 'networkidle2' });
    await sleep(600);

    // -------------------------------------------------------------
    // 1. SHOP_RENT_GUIDE
    // -------------------------------------------------------------
    console.log('Navigating to SHOP_RENT_GUIDE...');
    await page.evaluate(() => {
      if (window.__lrNavigate) window.__lrNavigate('SHOP_RENT_GUIDE');
      const container = document.querySelector('.overflow-y-auto');
      if (container) container.scrollTop = 0;
    });
    await sleep(600);

    // 117: Initial Process Tab with 3 days simulator
    await captureScreenshot(
      page,
      '117_rent_guide_initial_process.png',
      '렌트 이용 가이드 및 인터랙션',
      '렌트 이용 가이드 기본 화면',
      '24K 골드 기요셰 히어로 배너, 4단계 대여 절차(셀렉션-일정선택-배송-반납) 및 3일 대여일수 실시간 요금 계산기'
    );

    // 118: Duration 7 Days selected
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn7 = btns.find(b => b.textContent && b.textContent.trim() === '7일');
      if (btn7) btn7.click();
    });
    await sleep(400);
    await captureScreenshot(
      page,
      '118_rent_guide_duration_7days.png',
      '렌트 이용 가이드 및 인터랙션',
      '대여일수 시뮬레이터 7일 선택 인터랙션',
      '일일 환산가(42,000원), 대여료(294,000원) 및 안심 케어 플랜(15,000원) 실시간 합산 요금 계산'
    );

    // 119: Care Tab Active
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const careTab = btns.find(b => b.textContent && b.textContent.includes('안심 케어'));
      if (careTab) careTab.click();
    });
    await sleep(400);
    await captureScreenshot(
      page,
      '119_rent_guide_care_plan_active.png',
      '렌트 이용 가이드 및 인터랙션',
      '안심 케어 플랜 상세 가이드',
      '미세 스크래치 무상 수리 및 일반 부담금 대비 안심 케어 100% 면책 수리비 비교표'
    );

    // 120: Delivery Tab Active
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const delivTab = btns.find(b => b.textContent && b.textContent.includes('배송/반납'));
      if (delivTab) delivTab.click();
    });
    await sleep(400);
    await captureScreenshot(
      page,
      '120_rent_guide_delivery_tab.png',
      '렌트 이용 가이드 및 인터랙션',
      '프리미엄 배송 & 간편 반납 가이드',
      '발렛 특수 보안 배송, 시크릿 안심 패키징, 카카오톡 1클릭 무료 문앞 수거 반납 프로세스'
    );

    // 121: FAQ Tab Active & Expanded
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const faqTab = btns.find(b => b.textContent && b.textContent.includes('자주 묻는 질문'));
      if (faqTab) faqTab.click();
    });
    await sleep(400);
    // Expand the second FAQ
    await page.evaluate(() => {
      const questions = Array.from(document.querySelectorAll('button[aria-expanded]'));
      if (questions.length > 1) {
        questions[1].click();
      }
    });
    await sleep(400);
    await captureScreenshot(
      page,
      '121_rent_guide_faq_expanded.png',
      '렌트 이용 가이드 및 인터랙션',
      '렌트 이용 가이드 FAQ 아코디언 상호작용',
      '100% 정품 보증(가품 시 200% 보상), 기간 실시간 연장, 바이백 프로그램 안내 펼침'
    );

    // -------------------------------------------------------------
    // 2. SHOP_SUBSCRIPTION_GUIDE
    // -------------------------------------------------------------
    console.log('Navigating to SHOP_SUBSCRIPTION_GUIDE...');
    await page.evaluate(() => {
      if (window.__lrNavigate) window.__lrNavigate('SHOP_SUBSCRIPTION_GUIDE');
      const container = document.querySelector('.overflow-y-auto');
      if (container) container.scrollTop = 0;
    });
    await sleep(600);

    // 122: Monthly View (Default Premium Tier)
    await captureScreenshot(
      page,
      '122_subscription_guide_monthly_view.png',
      '구독 클럽 가이드 및 인터랙션',
      '구독 클럽 가이드 기본 화면',
      'VIP 엠블럼 히어로 배너, 월간 결제 기준 3대 멤버십 티어(베이직, 프리미엄, 오뜨 VIP) 및 개별 렌탈 대비 비용 절감 계산기'
    );

    // 123: Yearly Discount Toggle Active
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const yearlyBtn = btns.find(b => b.textContent && b.textContent.includes('연간 결제'));
      if (yearlyBtn) yearlyBtn.click();
    });
    await sleep(400);
    await captureScreenshot(
      page,
      '123_subscription_guide_yearly_discount.png',
      '구독 클럽 가이드 및 인터랙션',
      '결제 주기 "연간 결제 (15% 할인)" 토글 인터랙션',
      '베이직 75,650원, 프리미엄 135,150원, 오뜨 VIP 254,150원으로 실시간 15% 할인 가격 갱신'
    );

    // 124: Haute VIP Tier Selected
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.cursor-pointer'));
      const hauteCard = cards.find(c => c.textContent && c.textContent.includes('오뜨 VIP'));
      if (hauteCard) hauteCard.click();
    });
    await sleep(400);
    await captureScreenshot(
      page,
      '124_subscription_guide_haute_tier_selected.png',
      '구독 클럽 가이드 및 인터랙션',
      '최고 등급 "오뜨 VIP" 멤버십 카드 선택 상호작용',
      '월 2회 2개 동시 대여, 에르메스/샤넬/롤렉스 하이엔드 라인 무제한 이용 및 VIP 뱃지 하이라이트'
    );

    // 125: Benefits Grid & FAQ
    await page.evaluate(() => {
      const container = document.querySelector('.overflow-y-auto');
      if (container) container.scrollTop = 380;
    });
    await sleep(400);
    // Expand FAQ in subscription
    await page.evaluate(() => {
      const questions = Array.from(document.querySelectorAll('button[aria-expanded]'));
      if (questions.length > 0) questions[0].click();
    });
    await sleep(400);
    await captureScreenshot(
      page,
      '125_subscription_guide_benefits_and_faq.png',
      '구독 클럽 가이드 및 인터랙션',
      '구독 클럽 4대 독점 혜택 그리드 & FAQ 아코디언 인터랙션',
      '무제한 교환, 시즌 신상 우선권, 케어 100% 무료, 1:1 컨시어지 혜택 및 FAQ 펼침'
    );

    // 126: Confirm Modal Popup (Set user session so subscription modal opens instead of login redirect)
    await page.evaluate(() => {
      if (window.__lrSetUser) {
        window.__lrSetUser({
          id: 1,
          email: 'customer@luxuryrental.com',
          name: '김럭셔리',
          role: 'CUSTOMER'
        });
      }
    });
    await sleep(250);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cta = btns.find(b => b.textContent && b.textContent.includes('구독 신청하기'));
      if (cta) cta.click();
    });
    await sleep(500);
    await captureScreenshot(
      page,
      '126_subscription_guide_confirm_modal.png',
      '구독 클럽 가이드 및 인터랙션',
      '구독 멤버십 신청 모의 확인 모달 팝업',
      '선택 플랜(오뜨 VIP), 월 결제 요금(254,150원), 주요 혜택 요약 및 구독 결제 진행 버튼'
    );

    // 127: Success Modal Popup
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const payBtn = btns.find(b => b.textContent && b.textContent.includes('신청 완료'));
      if (payBtn) payBtn.click();
    });
    await sleep(600);
    await captureScreenshot(
      page,
      '127_subscription_guide_success_modal.png',
      '구독 클럽 가이드 및 인터랙션',
      '구독 신청 완료 크레스트 승리 모달',
      'AtelierOrderCompleteCrest 엠블럼, 회원 혜택 즉시 적용 축하 메시지 및 명품 큐레이션 둘러보기 버튼'
    );

  } finally {
    await browser.close();
  }
}

async function runVideoRecordingPipeline() {
  console.log('\n======================================================');
  console.log('🎬 [2/2] 렌트 이용 가이드 & 구독 가이드 비디오 & GIF 녹화 시작');
  console.log('======================================================\n');

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

  // -------------------------------------------------------------
  // Video 09: Rent Guide Interaction
  // -------------------------------------------------------------
  console.log('▶ Recording Video 09: 렌트 이용 가이드 상호작용...');
  {
    const browser = await launchMobileBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 440, height: 920 });

    await page.goto(`${appBaseUrl}/?splash=false`, { waitUntil: 'networkidle2' });
    await injectRecordingCode(page);

    await page.evaluate(() => window.__lrStartRecording());
    await sleep(400);

    // 1. From ShopMain, click "렌트 소개" menu
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const rentIntro = btns.find(b => b.textContent && b.textContent.includes('렌트 소개'));
      if (rentIntro) rentIntro.click();
    });
    await sleep(800);

    // 2. Simulator: Click 7일, then 30일
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn7 = btns.find(b => b.textContent && b.textContent.trim() === '7일');
      if (btn7) btn7.click();
    });
    await sleep(600);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn30 = btns.find(b => b.textContent && b.textContent.trim() === '30일');
      if (btn30) btn30.click();
    });
    await sleep(600);

    // 3. Click '안심 케어' tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const careTab = btns.find(b => b.textContent && b.textContent.includes('안심 케어'));
      if (careTab) careTab.click();
    });
    await sleep(800);

    // 4. Click '배송/반납' tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const delivTab = btns.find(b => b.textContent && b.textContent.includes('배송/반납'));
      if (delivTab) delivTab.click();
    });
    await sleep(800);

    // 5. Click '자주 묻는 질문' tab and expand FAQ
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const faqTab = btns.find(b => b.textContent && b.textContent.includes('자주 묻는 질문'));
      if (faqTab) faqTab.click();
    });
    await sleep(600);

    await page.evaluate(() => {
      const questions = Array.from(document.querySelectorAll('button[aria-expanded]'));
      if (questions.length > 1) questions[1].click();
    });
    await sleep(700);

    // 6. Click bottom CTA: 명품 렌탈 상품 둘러보기
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cta = btns.find(b => b.textContent && b.textContent.includes('명품 렌탈 상품 둘러보기'));
      if (cta) cta.click();
    });
    await sleep(800);

    const base64 = await page.evaluate(async () => {
      if (typeof window.__lrStopRecording === 'function') {
        return await window.__lrStopRecording();
      }
      return '';
    });

    const webmBuf = Buffer.from(base64, 'base64');
    const webmPath = path.join(videosDir, '09_rent_guide_interaction.webm');
    const gifPath = path.join(videosDir, '09_rent_guide_interaction.gif');

    fs.writeFileSync(webmPath, webmBuf);
    fs.writeFileSync(path.join(artifactDir, '09_rent_guide_interaction.webm'), webmBuf);

    await browser.close();
    await convertWebmToGif(webmBuf, gifPath, { fps: 10, maxDuration: 6.5 });
  }

  // -------------------------------------------------------------
  // Video 10: Subscription Guide Interaction
  // -------------------------------------------------------------
  console.log('▶ Recording Video 10: 구독 클럽 가이드 상호작용...');
  {
    const browser = await launchMobileBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 440, height: 920 });

    await page.goto(`${appBaseUrl}/?splash=false`, { waitUntil: 'networkidle2' });
    await injectRecordingCode(page);

    await page.evaluate(() => window.__lrStartRecording());
    await sleep(400);

    // 1. From ShopMain, click "베이직멤버십" menu
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const subBtn = btns.find(b => b.textContent && b.textContent.includes('베이직멤버십'));
      if (subBtn) subBtn.click();
    });
    await sleep(800);

    // 2. Toggle Yearly discount
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const yearlyBtn = btns.find(b => b.textContent && b.textContent.includes('연간 결제'));
      if (yearlyBtn) yearlyBtn.click();
    });
    await sleep(700);

    // 3. Select '오뜨 VIP' tier card
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.cursor-pointer'));
      const hauteCard = cards.find(c => c.textContent && c.textContent.includes('오뜨 VIP'));
      if (hauteCard) hauteCard.click();
    });
    await sleep(700);

    // 4. Scroll down slightly
    await page.evaluate(() => {
      const container = document.querySelector('.overflow-y-auto');
      if (container) container.scrollBy({ top: 250, behavior: 'smooth' });
    });
    await sleep(700);

    // 5. Click bottom CTA: 오뜨 VIP 구독 신청하기 (with user session)
    await page.evaluate(() => {
      if (window.__lrSetUser) {
        window.__lrSetUser({
          id: 1,
          email: 'customer@luxuryrental.com',
          name: '김럭셔리',
          role: 'CUSTOMER'
        });
      }
    });
    await sleep(250);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cta = btns.find(b => b.textContent && b.textContent.includes('구독 신청하기'));
      if (cta) cta.click();
    });
    await sleep(800);

    // 6. Inside Confirm Modal, click "신청 완료"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const payBtn = btns.find(b => b.textContent && b.textContent.includes('신청 완료'));
      if (payBtn) payBtn.click();
    });
    await sleep(900);

    // 7. Success crest modal, click "명품 큐레이션 둘러보기"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const closeBtn = btns.find(b => b.textContent && b.textContent.includes('명품 큐레이션 둘러보기'));
      if (closeBtn) closeBtn.click();
    });
    await sleep(700);

    const base64 = await page.evaluate(async () => {
      if (typeof window.__lrStopRecording === 'function') {
        return await window.__lrStopRecording();
      }
      return '';
    });

    const webmBuf = Buffer.from(base64, 'base64');
    const webmPath = path.join(videosDir, '10_subscription_guide_interaction.webm');
    const gifPath = path.join(videosDir, '10_subscription_guide_interaction.gif');

    fs.writeFileSync(webmPath, webmBuf);
    fs.writeFileSync(path.join(artifactDir, '10_subscription_guide_interaction.webm'), webmBuf);

    await browser.close();
    await convertWebmToGif(webmBuf, gifPath, { fps: 10, maxDuration: 6.5 });
  }

  // -------------------------------------------------------------
  // Update video_manifest.json
  // -------------------------------------------------------------
  const manifestPath = path.join(videosDir, 'video_manifest.json');
  let manifest = [];
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch {}
  }

  const newVideos = [
    {
      id: '09',
      title: '렌트 이용 가이드 & 대여일수·케어플랜·FAQ 상호작용',
      webm: 'videos/09_rent_guide_interaction.webm',
      gif: 'videos/09_rent_guide_interaction.gif',
      desc: '메인 8-Grid 메뉴에서 렌트 소개 클릭 진입, 1일/3일/7일/30일 대여일수 시뮬레이터 인터랙션, 안심 케어 플랜 보상 비교표, 배송/반납 탭 전환, FAQ 아코디언 질의응답 및 둘러보기 CTA 상호작용'
    },
    {
      id: '10',
      title: '구독 클럽 가이드 & 티어선택·할인주기·신청완료 상호작용',
      webm: 'videos/10_subscription_guide_interaction.webm',
      gif: 'videos/10_subscription_guide_interaction.gif',
      desc: '메인 8-Grid 메뉴에서 베이직멤버십 클릭 진입, 월간/연간(15% 할인) 토글, 베이직/프리미엄/오뜨 VIP 티어 카드 선택 및 혜택 비교, 구독 신청 모의 결제 확인 모달 팝업 및 오뜨 VIP 승리 크레스트 모달 완료 상호작용'
    }
  ];

  for (const nv of newVideos) {
    const idx = manifest.findIndex(m => m.id === nv.id);
    if (idx >= 0) manifest[idx] = nv;
    else manifest.push(nv);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[MANIFEST UPDATED] ${manifestPath}`);
}

async function main() {
  await runScreenshotPipeline();
  await runVideoRecordingPipeline();
  console.log('\n======================================================');
  console.log('🎉 모든 가이드 페이지 스크린샷 11종 및 비디오/GIF 2종 캡처 완료!');
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('오류 발생:', err);
  process.exit(1);
});
