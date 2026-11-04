import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = process.env.SCREENSHOT_OUTPUT_DIR || path.resolve(process.cwd(), '../docs/screenshots_phase2');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function test() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, '00_test.png') });
  console.log('Saved test screenshot!');
  await browser.close();
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
