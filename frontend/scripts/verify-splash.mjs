import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('C:/Users/Administrator/.gemini/antigravity/brain/f15d06f1-f40a-4d5e-a6a5-9100540a5dd3');
const docsDir = path.resolve('docs/splash');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Launching browser to verify splash screen...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 920 });

  // 1. Cold boot with fresh session
  console.log('Navigating to http://localhost:5173/?splash=true (Cold Boot Mobile)...');
  await page.goto('http://localhost:5173/?splash=true', { waitUntil: 'domcontentloaded' });

  // Capture immediately to see the Tier 1 / Tier 2 splash screen
  await sleep(200);
  const splashMobile1 = path.join(outputDir, 'verified_splash_screen_mobile.png');
  const docsSplashMobile1 = path.join(docsDir, '01_splash_screen_mobile.png');
  await page.screenshot({ path: splashMobile1 });
  await page.screenshot({ path: docsSplashMobile1 });
  console.log('Captured Mobile Splash:', splashMobile1);

  // Wait for the minimum duration (1200ms) + exit transition (350ms)
  console.log('Waiting for splash animation exit transition...');
  await sleep(1500);

  const mainViewMobile = path.join(outputDir, 'verified_main_view_after_splash.png');
  const docsMainViewMobile = path.join(docsDir, '02_main_view_after_splash.png');
  await page.screenshot({ path: mainViewMobile });
  await page.screenshot({ path: docsMainViewMobile });
  console.log('Captured Main View after Splash transition:', mainViewMobile);

  // 2. Desktop Viewport
  console.log('Verifying Desktop view...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluate(() => {
    sessionStorage.clear();
    if (window.__lrTriggerSplash) window.__lrTriggerSplash();
  });
  await sleep(200);

  const splashDesktop = path.join(outputDir, 'verified_splash_screen_desktop.png');
  const docsSplashDesktop = path.join(docsDir, '03_splash_screen_desktop.png');
  await page.screenshot({ path: splashDesktop });
  await page.screenshot({ path: docsSplashDesktop });
  console.log('Captured Desktop Splash:', splashDesktop);

  await browser.close();
  console.log('Splash verification complete!');
}

run().catch(err => {
  console.error('Error during splash verification:', err);
  process.exit(1);
});
