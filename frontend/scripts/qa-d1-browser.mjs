/**
 * D1 browser QA: native splash consistency, service icon bounds and unchanged
 * five-item bottom navigation at 360, 390 and 430 CSS px.
 * On GitHub Actions, Google Chrome is preinstalled on the Linux runner.
 */
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const port = 5187;
const base = `http://127.0.0.1:${port}`;
const outDir = resolve('qa/d1-screens');
await mkdir(outDir, { recursive: true });

function chromeBinary() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try { return execFileSync('which', [bin], { encoding: 'utf8' }).trim(); }
    catch {}
  }
  throw new Error('No Chrome/Chromium binary found for D1 visual QA.');
}

async function awaitPreview() {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 350));
  }
  throw new Error('Vite preview server did not start');
}

const vite = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: process.cwd(), stdio: 'ignore', detached: process.platform !== 'win32', shell: process.platform === 'win32',
});
let browser;
const metrics = [];
try {
  console.log('D1 QA: waiting for preview server');
  await awaitPreview();
  console.log('D1 QA: launching Chrome');
  browser = await puppeteer.launch({
    headless: true,
    executablePath: chromeBinary(),
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const nativePage = await browser.newPage();
  await nativePage.setJavaScriptEnabled(false);
  await nativePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await nativePage.goto(base, { waitUntil: 'domcontentloaded' });
  const nativeOK = await nativePage.evaluate(() => {
    const frame = document.getElementById('native-splash');
    const svg = frame?.querySelector('svg');
    return Boolean(frame && svg && svg.querySelector('path'));
  });
  if (!nativeOK) throw new Error('Initial native splash crown missing');
  await nativePage.screenshot({ path: resolve(outDir, 'native-splash-390.png') });
  await nativePage.close();

  // Capture the actual React splash too, ensuring both splash layers show
  // the same crown design rather than only checking source text.
  const reactSplashPage = await browser.newPage();
  await reactSplashPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await reactSplashPage.goto(base, { waitUntil: 'domcontentloaded' });
  await reactSplashPage.waitForSelector('[aria-label="LuxuryRental 로딩 중"]', { timeout: 6000 });
  await reactSplashPage.waitForFunction(() => !document.getElementById('native-splash'), { timeout: 6000 });
  const reactCrown = await reactSplashPage.evaluate(() => {
    const splash = document.querySelector('[aria-label="LuxuryRental 로딩 중"]');
    const svg = splash?.querySelector('svg');
    return svg ? { width: svg.getBoundingClientRect().width, height: svg.getBoundingClientRect().height } : null;
  });
  if (!reactCrown || reactCrown.width < 60 || reactCrown.height < 60) {
    throw new Error('React splash crown not rendered');
  }
  await reactSplashPage.screenshot({ path: resolve(outDir, 'react-splash-390.png') });
  await reactSplashPage.close();

  for (const width of [360, 390, 430]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(String(e.message || e)));
    console.log('D1 QA: viewport', width);
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5200));
    const result = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="하단 네비게이션"]');
      const targets = ['렌트하기', '구매하기', '판매하기'];
      const cardIcons = {};
      for (const title of targets) {
        const label = [...document.querySelectorAll('h4')].find(el => el.textContent.trim() === title);
        const svg = label?.closest('[role="button"]')?.querySelector('svg');
        const rect = svg?.getBoundingClientRect();
        cardIcons[title] = rect ? { width: rect.width, height: rect.height } : null;
      }
      return {
        navButtons: nav?.querySelectorAll('button').length ?? 0,
        cardIcons,
        visibleDocumentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        hasReactSplash: Boolean(document.querySelector('[aria-label="LuxuryRental 로딩 중"]')),
      };
    });
    await page.screenshot({ path: resolve(outDir, `main-${width}.png`), fullPage: true });
    await page.close();
    metrics.push({ ...result, pageErrors });
    if (result.navButtons !== 5) throw new Error(`Bottom nav items invalid at ${width}: ${result.navButtons}`);
    if (result.visibleDocumentWidth > result.viewportWidth + 2) throw new Error(`Horizontal overflow at ${width}: ${result.visibleDocumentWidth}`);
    if (Object.values(result.cardIcons).some(v => !v || v.width < 35 || v.height < 35)) {
      throw new Error(`D1 service icon not visible at ${width}: ${JSON.stringify(result.cardIcons)}`);
    }
  }
  await writeFile(resolve(outDir, 'd1-browser-qa.json'), JSON.stringify({ status: 'pass', metrics }, null, 2));
  console.log('D1_BROWSER_QA_PASS', JSON.stringify(metrics));
} catch (error) {
  await writeFile(resolve(outDir, 'd1-browser-qa.json'), JSON.stringify({ status: 'fail', reason: String(error), metrics }, null, 2));
  throw error;
} finally {
  if (browser) {
    await Promise.race([browser.close(), new Promise(resolve => setTimeout(resolve, 6000))]);
  }
  if (vite.pid && process.platform !== 'win32') {
    try { process.kill(-vite.pid, 'SIGTERM'); } catch { vite.kill('SIGTERM'); }
  } else vite.kill('SIGTERM');
}
