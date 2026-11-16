import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';

const chrome = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((candidate) => candidate && existsSync(candidate));
assert.ok(chrome, 'Set CHROME_PATH to an installed Chromium browser.');

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
const captureDir = process.env.IIL_THEME_CAPTURE_DIR;
if (captureDir) await mkdir(captureDir, { recursive: true });

function capture(page, name) {
  return captureDir && page.screenshot({ path: join(captureDir, name) });
}

function splashLayout(page, selector) {
  return page.$eval(selector, (splash) =>
    ['art', 'wordmark', 'bar', 'skip'].map((part) => {
      const { x, y, width, height } = splash.querySelector(`.lr-splash__${part}`).getBoundingClientRect();
      return [x, y, width, height].map((value) => Math.round(value));
    }),
  );
}

let browser;
try {
  await server.listen();
  const { port } = server.httpServer.address();
  const url = `http://127.0.0.1:${port}`;
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, pipe: true, timeout: 8000 });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.setRequestInterception(true);
  let resumeModule;
  const moduleReleased = new Promise((resolve) => { resumeModule = resolve; });
  page.on('request', async (request) => {
    if (new URL(request.url()).pathname === '/src/main.tsx') await moduleReleased;
    await request.continue();
  });

  const navigation = page.goto(url, { waitUntil: 'domcontentloaded' });
  navigation.catch(() => {});
  const nativeArt = await page.waitForSelector('#native-splash img', { visible: true, timeout: 2500 });
  const originalArt = await nativeArt.evaluate((img) => img.src);
  assert.match(originalArt, /^data:image\/svg\+xml/);
  const nativeLayout = await splashLayout(page, '#native-splash');
  await capture(page, 'luxuryrental-splash.png');
  resumeModule();
  await navigation;

  const reactArt = await page.waitForSelector('#app-splash img', { visible: true });
  assert.equal(await reactArt.evaluate((img) => img.src), originalArt, 'Both splash stages render the same local art');
  assert.deepEqual(await splashLayout(page, '#app-splash'), nativeLayout, 'Splash content stays in place during handoff');
  const skip = await page.waitForSelector('#app-splash button', { visible: true });
  await skip.focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('#app-splash', { hidden: true });
  assert.equal(await page.evaluate(() => sessionStorage.getItem('lr_splash_viewed')), 'true');

  const nav = 'nav[aria-label="하단 네비게이션"]';
  assert.deepEqual(await page.$$eval(`${nav} button`, (buttons) => buttons.map((button) => button.textContent.trim())), [
    '카테고리', '내 상품 판매', '홈', '좋아요', '마이페이지',
  ]);
  assert.equal(await page.$(`${nav} [data-theme-icon]`), null);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector(nav);
  assert.equal(await page.$('#native-splash, #app-splash'), null);
  for (const width of [360, 390, 430, 1440]) {
    const height = 844;
    await page.setViewport({ width, height });
    const bounds = await page.$eval(nav, (node) => node.getBoundingClientRect().toJSON());
    assert.ok(Math.abs(bounds.width - Math.min(width * 0.9, 384)) < 1, `Navigation width at ${width}px`);
    assert.ok(Math.abs(bounds.x + bounds.width / 2 - width / 2) < 1, `Navigation is centered at ${width}px`);
    assert.ok(Math.abs(height - bounds.bottom - 16) < 1, `Navigation bottom offset at ${width}px`);
  }
  await page.setViewport({ width: 390, height: 844 });
  await page.waitForSelector('[data-theme-icon="line"]');
  await capture(page, 'luxuryrental-home.png');

  await page.click('[data-testid="recommend-product-card"]');
  const detail = '[role="dialog"][aria-label="상품 상세 정보"]';
  await page.waitForSelector(detail, { visible: true });
  assert.equal(await page.$eval(`${detail} button[aria-label="관심 상품 저장"]`, (button) => button.getAttribute('aria-pressed')), 'false');
  assert.ok(await page.$(`${detail} svg[aria-label="100% Authentic Certified"][aria-hidden="true"]`));
  await page.click(`${detail} button[aria-label="닫기"]`);
  await page.waitForSelector(detail, { hidden: true });
  await page.$eval(`${nav} button:nth-child(4)`, (button) => button.click());
  await page.waitForSelector('[role="dialog"][aria-label="간편 로그인"]', { visible: true });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector(nav);
  await page.click('button[aria-label="상품 검색 열기"]');
  await page.waitForSelector('input[placeholder="검색어를 입력해주세요"]');
  await page.click('button[aria-label="검색창 닫기"]');
  await page.waitForSelector('[aria-label="통합 검색"]', { hidden: true });

  await page.click(`${nav} button:nth-child(2)`);
  await page.waitForSelector('input[placeholder="브랜드명을 검색해주세요."]');
  await page.click('[role="button"][tabindex="0"]');
  const gradeButton = 'button[aria-pressed="false"]:has(svg[viewBox="0 0 36 36"])';
  const grade = await page.waitForSelector(gradeButton, { visible: true });
  await grade.click();
  assert.equal(await grade.evaluate((button) => button.getAttribute('aria-pressed')), 'true');

  for (const suffix of ['/?splash=false', '/?oauth=cancelled', '/auth/google/callback']) {
    const context = await browser.createBrowserContext();
    const fresh = await context.newPage();
    await fresh.goto(`${url}${suffix}`, { waitUntil: 'domcontentloaded' });
    assert.equal(await fresh.$('#native-splash, #app-splash'), null, suffix);
    await context.close();
  }

  const reduced = await browser.createBrowserContext();
  const reducedPage = await reduced.newPage();
  await reducedPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await reducedPage.goto(url, { waitUntil: 'domcontentloaded' });
  await reducedPage.waitForSelector(nav);
  assert.equal(await reducedPage.$('#native-splash, #app-splash'), null);
  await reduced.close();

  const slow = await browser.createBrowserContext();
  const slowPage = await slow.newPage();
  await slowPage.setRequestInterception(true);
  slowPage.on('request', (request) => {
    if (request.resourceType() === 'fetch' && new URL(request.url()).pathname.endsWith('/health')) return;
    void request.continue();
  });
  await slowPage.goto(url, { waitUntil: 'domcontentloaded' });
  await slowPage.waitForSelector('#app-splash', { visible: true, timeout: 2500 });
  await slowPage.waitForSelector('#app-splash', { hidden: true, timeout: 5000 });
  await slowPage.waitForSelector(nav, { visible: true });
  await slow.close();

  const adminPage = await browser.newPage();
  await adminPage.setViewport({ width: 1440, height: 900 });
  await adminPage.setRequestInterception(true);
  adminPage.on('request', (request) => {
    if (request.resourceType() === 'fetch' && new URL(request.url()).pathname.endsWith('/health')) {
      void request.abort();
      return;
    }
    void request.continue();
  });
  await adminPage.goto(`${url}/?splash=false`, { waitUntil: 'domcontentloaded' });
  await adminPage.waitForFunction(() => typeof window.__lrSetUser === 'function');
  await adminPage.evaluate(() => {
    window.__lrSetUser({ id: 1, name: 'QA', email: 'qa@example.test', role: 'ADMIN' });
    window.__lrNavigate('ADMIN');
  });
  const darkAdmin = '[data-icon-tone="dark"]:has(header)';
  await adminPage.waitForSelector(darkAdmin, { visible: true });
  assert.ok(await adminPage.$(`${darkAdmin} [data-theme-icon]`));
  assert.equal(await adminPage.$(`${darkAdmin} i[class*="fa-"]`), null);
  await capture(adminPage, 'luxuryrental-admin.png');

  console.log('Theme browser checks passed.');
} finally {
  await browser?.close();
  await server.close();
}
