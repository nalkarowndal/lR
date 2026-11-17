import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testCategoryGender() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:5173/?splash=false...');
  await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle2' });

  await page.waitForFunction(() => typeof window.__lrNavigate === 'function');
  await page.evaluate(() => window.__lrNavigate('SHOP_CATEGORY'));
  await new Promise(r => setTimeout(r, 800));

  const testMatrix = [
    { gender: '여성', category: '가방/핸드백' },
    { gender: '여성', category: '의류' },
    { gender: '남성', category: '의류' },
    { gender: '남성', category: '슈즈' },
    { gender: '아동', category: '가방/핸드백' },
    { gender: '아동', category: '의류' },
    { gender: '아동', category: '슈즈' },
  ];

  for (const item of testMatrix) {
    console.log(`\n======================================================`);
    console.log(`=== Testing [${item.gender}] Subtab x [${item.category}] Category ===`);
    console.log(`======================================================`);

    // Click gender subtab
    await page.evaluate((g) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent && b.textContent.trim() === g);
      if (target) target.click();
    }, item.gender);

    await new Promise(r => setTimeout(r, 400));

    // Click LNB category
    await page.evaluate((cat) => {
      const btns = Array.from(document.querySelectorAll('div.w-\\[104px\\] button'));
      const target = btns.find(b => b.textContent && b.textContent.trim() === cat);
      if (target) target.click();
    }, item.category);

    await new Promise(r => setTimeout(r, 600));

    const data = await page.evaluate(() => {
      // Top 3 tiles
      const tileEls = Array.from(document.querySelectorAll('.flex.justify-between.gap-2\\.5.mb-6 > div'));
      const tiles = tileEls.map(el => {
        const img = el.querySelector('img');
        const title = el.querySelector('span.text-\\[11px\\]') || Array.from(el.querySelectorAll('span')).pop();
        return {
          title: title ? title.textContent.trim() : '',
          imgSrc: img ? img.getAttribute('src') : ''
        };
      });

      // Heading
      const heading = document.querySelector('h3.font-extrabold')?.textContent?.trim() || '';

      // Products
      const prodContainer = document.querySelector('div.grid.grid-cols-2.gap-x-2\\.5');
      const prodEls = prodContainer ? Array.from(prodContainer.children) : [];
      const products = prodEls.slice(0, 6).map(el => {
        const spans = Array.from(el.querySelectorAll(':scope > span'));
        const brand = spans[0]?.textContent?.trim() || '';
        const title = spans[1]?.textContent?.trim() || '';
        return `[${brand}] ${title}`;
      });

      return { tiles, heading, count: prodEls.length, products };
    });

    console.log(`Section Heading: ${data.heading}`);
    console.log('Top 3 Visual Tiles:');
    data.tiles.forEach((t, i) => console.log(`  ${i+1}. [${t.title}] -> ${t.imgSrc}`));
    console.log(`Filtered Product Count: ${data.count}`);
    console.log('Products:', data.products);

    const shotPath = path.join(__dirname, `test_${item.gender}_${item.category.replace('/', '_')}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);
  }

  await browser.close();
  console.log('\nAll matrix tests finished successfully!');
}

testCategoryGender().catch(console.error);
