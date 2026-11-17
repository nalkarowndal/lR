import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { preview } from 'vite';

const base = process.argv[2] ?? '/group/four/1/';
const outDir = process.argv[3] ?? 'dist';
const chrome = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((path) => path && existsSync(path));
assert.ok(chrome, 'Set CHROME_PATH to an installed Chromium browser.');

const server = await preview({ base, build: { outDir }, preview: { host: '127.0.0.1', port: 0 } });
const site = new URL(base, `http://127.0.0.1:${server.httpServer.address().port}`);
let browser;

try {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, pipe: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.resourceType() === 'fetch' || new URL(request.url()).origin !== site.origin) {
      void request.abort();
    } else {
      void request.continue();
    }
  });
  const photoRequests = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'image' && request.url().startsWith(site.origin)) {
      photoRequests.push(new URL(request.url()).pathname);
    }
  });
  await page.goto(site.href);
  const nav = 'nav[aria-label="하단 네비게이션"]';
  await page.waitForSelector(nav, { visible: true, timeout: 6000 });
  await page.waitForSelector('#app-splash, #native-splash', { hidden: true });
  const productRequests = photoRequests.filter((path) => path.includes('/assets/products/'));
  assert.ok(productRequests.length > 0, 'The home page requests product photos');
  assert.ok(productRequests.every((path) => path.startsWith(base)), productRequests.join('\n'));
  await page.waitForSelector('[data-testid="recommend-product-card"] [data-image-status="ready"] img', { timeout: 5000 });

  await page.click(`${nav} button:first-child`);
  await page.waitForFunction((assetBase) => Array.from(document.images).some(
    (img) => img.naturalWidth > 0 && new URL(img.src).pathname.startsWith(`${assetBase}assets/categories/`),
  ), { timeout: 5000 }, base);

  await page.goto(new URL('auth/google/callback?error=access_denied', site).href);
  await page.waitForFunction((pathname) => location.pathname === pathname, { timeout: 5000 }, base);
  await page.waitForSelector(nav, { visible: true });
  console.log(`Home, product and category photos, and callback return verified at ${base}.`);
} finally {
  await browser?.close();
  await server.close();
}
