import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../../docs/auth_redirect_verification');

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runBfcacheAuthVerification() {
  console.log('Launching browser for BFcache Social Login Back Navigation Verification...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 920 });

  try {
    console.log('1. Navigating to http://localhost:5173/?splash=false...');
    await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle2' });

    console.log('2. Opening Login Overlay...');
    await page.evaluate(() => {
      window.__lrSetOverlay('LOGIN');
    });

    await page.waitForFunction(() => {
      const modal = document.querySelector('div[role="dialog"][aria-label="간편 로그인"]');
      return modal && modal.getAttribute('aria-hidden') !== 'true';
    }, { timeout: 5000 });
    console.log('Login overlay is open and visible.');

    // Screenshot initial login modal
    await page.screenshot({ path: path.join(outputDir, '05_login_modal_initial.png') });
    console.log('Captured: 05_login_modal_initial.png');

    const getModalButtons = () => page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"][aria-label="간편 로그인"]');
      if (!modal) return null;
      const btns = Array.from(modal.querySelectorAll('button'));
      const kakaoBtn = btns.find(b => b.textContent && b.textContent.includes('카카오'));
      const googleBtn = btns.find(b => b.textContent && b.textContent.includes('Google'));
      return {
        kakao: {
          text: kakaoBtn ? kakaoBtn.textContent.trim() : null,
          disabled: kakaoBtn ? kakaoBtn.disabled : null
        },
        google: {
          text: googleBtn ? googleBtn.textContent.trim() : null,
          disabled: googleBtn ? googleBtn.disabled : null
        }
      };
    });

    // 3. Test initial state
    const initialButtons = await getModalButtons();
    console.log('Initial Modal Buttons:', initialButtons);

    if (initialButtons.google.disabled || initialButtons.google.text !== 'Google로 계속하기') {
      throw new Error(`Google button unexpected initial state: ${JSON.stringify(initialButtons.google)}`);
    }
    if (initialButtons.kakao.disabled || initialButtons.kakao.text !== '카카오로 3초만에 계속하기') {
      throw new Error(`Kakao button unexpected initial state: ${JSON.stringify(initialButtons.kakao)}`);
    }

    // 4. Test bfcache event: Dispatch 'pageshow' with persisted=true while in login modal
    console.log('4. Simulating browser back bfcache restoration event (pageshow with persisted: true)...');
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });

    const buttonsAfterPageshow = await getModalButtons();
    console.log('Buttons after pageshow event:', buttonsAfterPageshow);
    if (buttonsAfterPageshow.google.disabled || buttonsAfterPageshow.kakao.disabled) {
      throw new Error('Buttons are disabled after pageshow!');
    }

    // 5. Test real browser navigation flow to Google OAuth endpoint and back
    console.log('5. Clicking Google Login button to trigger OAuth navigation...');
    
    // We navigate to Google login and then navigate back using page.goBack()
    const navPromise = page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => null);
    
    await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"][aria-label="간편 로그인"]');
      const btns = Array.from(modal.querySelectorAll('button'));
      const googleBtn = btns.find(b => b.textContent && b.textContent.includes('Google'));
      if (googleBtn) googleBtn.click();
    });

    await navPromise;

    console.log('Landed on URL:', page.url());
    await page.screenshot({ path: path.join(outputDir, '06_oauth_external_screen.png') });
    console.log('Captured: 06_oauth_external_screen.png');

    // 6. User clicks browser "Back" button from external OAuth screen
    console.log('6. User presses browser "Back" button (page.goBack())...');
    await page.goBack({ waitUntil: 'networkidle2' });
    console.log('Back on URL:', page.url());

    // Wait a brief moment for page to stabilize
    await sleep(400);

    // 7. Verify login modal buttons in restored state
    const buttonsAfterBack = await getModalButtons();
    console.log('Buttons state after Browser Back:', buttonsAfterBack);
    await page.screenshot({ path: path.join(outputDir, '07_restored_buttons_after_back.png') });
    console.log('Captured: 07_restored_buttons_after_back.png');

    if (!buttonsAfterBack) {
      throw new Error('Login modal was not found after browser back!');
    }

    if (buttonsAfterBack.google.disabled) {
      throw new Error(`Google button is stuck disabled after Back navigation: ${JSON.stringify(buttonsAfterBack.google)}`);
    }
    if (buttonsAfterBack.google.text.includes('연결 중')) {
      throw new Error(`Google button still shows "연결 중..." after Back navigation: ${JSON.stringify(buttonsAfterBack.google)}`);
    }
    if (buttonsAfterBack.kakao.disabled) {
      throw new Error(`Kakao button is stuck disabled after Back navigation: ${JSON.stringify(buttonsAfterBack.kakao)}`);
    }
    if (buttonsAfterBack.kakao.text.includes('연결 중')) {
      throw new Error(`Kakao button still shows "연결 중..." after Back navigation: ${JSON.stringify(buttonsAfterBack.kakao)}`);
    }

    // 8. Verify buttons can be clicked again immediately without getting permanently locked
    console.log('8. Verifying Kakao button is clickable again after back navigation...');
    const canClickKakao = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"][aria-label="간편 로그인"]');
      const btns = Array.from(modal.querySelectorAll('button'));
      const kakaoBtn = btns.find(b => b.textContent && b.textContent.includes('카카오'));
      return kakaoBtn !== undefined && !kakaoBtn.disabled;
    });

    console.log('Kakao button clickable:', canClickKakao);

    console.log('\n✅ BFcache Social Login Back Navigation Verification PASSED completely!');
  } catch (err) {
    console.error('Verification failed with error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBfcacheAuthVerification();
