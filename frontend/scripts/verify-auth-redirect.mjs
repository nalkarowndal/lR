import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const docsDir = path.resolve('docs/auth_redirect_verification');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyAuthRedirect() {
  console.log('Launching browser for Auth Redirect Verification...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 920 });

  // 1. Visit Main View without logging in (Guest)
  console.log('Navigating to http://localhost:5173/?splash=false...');
  await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle0' });
  await sleep(600);

  // Click on the first recommendation product card in Main
  console.log('Clicking on recommendation product card on Main page...');
  await page.evaluate(() => {
    const cards = document.querySelectorAll('div.min-w-\\[150px\\]');
    if (cards.length > 0) {
      cards[0].click();
    }
  });
  await sleep(600);

  // 1-1. Capture Product Detail Modal
  await page.screenshot({ path: path.join(docsDir, '01_main_product_detail_modal.png') });
  console.log('Captured: 01_main_product_detail_modal.png');

  // 1-2. Click "장바구니 담기" as guest
  console.log('Clicking "장바구니 담기" button as unauthenticated guest...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cartBtn = buttons.find(b => b.textContent && b.textContent.includes('장바구니 담기'));
    if (cartBtn) cartBtn.click();
  });
  await sleep(600);

  // Capture Login Modal opened after "장바구니 담기"
  await page.screenshot({ path: path.join(docsDir, '02_main_cart_redirect_to_login.png') });
  console.log('Captured: 02_main_cart_redirect_to_login.png');

  // Close Login Modal
  console.log('Closing login modal...');
  await page.evaluate(() => {
    if (window.__lrSetOverlay) window.__lrSetOverlay(null);
  });
  await sleep(500);

  // 1-3. Re-open product modal and click "바로 렌탈 신청" as guest
  console.log('Re-opening product detail modal to test "바로 렌탈 신청"...');
  await page.evaluate(() => {
    const cards = document.querySelectorAll('div.min-w-\\[150px\\]');
    if (cards.length > 0) cards[0].click();
  });
  await sleep(500);

  console.log('Clicking "바로 렌탈 신청" button as unauthenticated guest...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const rentBtn = buttons.find(b => b.textContent && (b.textContent.includes('바로 렌탈') || b.textContent.includes('바로 렌탈 신청')));
    if (rentBtn) rentBtn.click();
  });
  await sleep(600);

  // Capture Login Modal opened after "바로 렌탈 신청"
  await page.screenshot({ path: path.join(docsDir, '03_main_rent_now_redirect_to_login.png') });
  console.log('Captured: 03_main_rent_now_redirect_to_login.png');

  // Close Login Modal
  await page.evaluate(() => {
    if (window.__lrSetOverlay) window.__lrSetOverlay(null);
  });
  await sleep(500);

  // 2. Test Category View
  console.log('Testing Category View...');
  await page.evaluate(() => {
    if (window.__lrNavigate) window.__lrNavigate('SHOP_CATEGORY');
  });
  await sleep(600);

  // Click on a product card in Category page
  console.log('Clicking on product card in Category page...');
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.grid-cols-2 div.group.cursor-pointer');
    if (cards.length > 0) cards[0].click();
  });
  await sleep(600);

  // Click "바로 렌탈하기" in Category modal
  console.log('Clicking "바로 렌탈하기" button in Category modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const rentBtn = buttons.find(b => b.textContent && b.textContent.includes('바로 렌탈하기'));
    if (rentBtn) rentBtn.click();
  });
  await sleep(600);

  await page.screenshot({ path: path.join(docsDir, '04_category_rent_redirect_to_login.png') });
  console.log('Captured: 04_category_rent_redirect_to_login.png');

  await browser.close();
  console.log('Auth Redirect Verification completed successfully!');
}

verifyAuthRedirect().catch(err => {
  console.error('Auth redirect verification failed:', err);
  process.exit(1);
});
