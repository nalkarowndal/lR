import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const screenshotsDir = path.join(projectRoot, 'docs/screenshots_phase2');
const qaDir = path.join(projectRoot, 'docs/qa');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}
if (!fs.existsSync(qaDir)) {
  fs.mkdirSync(qaDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const brandFileNames = {
  '스톤 아일랜드': 'stoneisland',
  '구찌': 'gucci',
  '샤넬': 'chanel',
  'CP 컴퍼니': 'cpcompany',
  '셀린느': 'celine'
};

async function runBrowserQA() {
  console.log('[QA] Starting Browser Image QA with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    // 1. Visit Main Screen
    console.log('[QA] Navigating to http://127.0.0.1:5173/ ...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    // Test 1: Main Screen Rent New Arrivals
    console.log('[QA] Checking Main Screen Rent New Arrivals...');
    const newArrivalImages = await page.evaluate(() => {
      const section = Array.from(document.querySelectorAll('section')).find(s => s.textContent && s.textContent.includes('Rent New Arrivals'));
      if (!section) return { found: false, count: 0, items: [] };
      const imgs = Array.from(section.querySelectorAll('img'));
      return {
        found: true,
        count: imgs.length,
        items: imgs.map(img => ({
          src: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        }))
      };
    });

    const rentArrivalsPass = newArrivalImages.found && newArrivalImages.count >= 2 && newArrivalImages.items.every(i => i.naturalWidth > 0);
    testResults.tests.push({
      id: 'TEST-01-MAIN-RENT-ARRIVALS',
      name: 'Main Screen Rent New Arrivals Real Photos',
      passed: rentArrivalsPass,
      details: newArrivalImages
    });

    await page.screenshot({ path: path.join(screenshotsDir, 'screen_d_main_rent_new_arrivals.png') });
    console.log(`[QA] Screen D captured: passed=${rentArrivalsPass}`);

    // Test 2: Category Top 3 Tiles
    console.log('[QA] Navigating to Category view...');
    await page.evaluate(() => {
      const catButton = Array.from(document.querySelectorAll('button, div[role="button"]')).find(el => el.textContent && el.textContent.trim() === '카테고리');
      if (catButton) {
        catButton.click();
      } else {
        const bottomNavs = document.querySelectorAll('footer, nav button');
        if (bottomNavs.length > 1) bottomNavs[1].click();
      }
    });

    await new Promise(r => setTimeout(r, 1000));

    const categoryTiles = await page.evaluate(() => {
      const tilesContainer = document.querySelector('div.flex.justify-between.gap-2\\.5');
      if (!tilesContainer) return { found: false, count: 0, tiles: [] };
      const imgs = Array.from(tilesContainer.querySelectorAll('img'));
      return {
        found: true,
        count: imgs.length,
        tiles: imgs.map(img => ({
          src: img.src,
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        }))
      };
    });

    const categoryTilesPass = categoryTiles.found && categoryTiles.count === 3 && categoryTiles.tiles.every(t => t.naturalWidth > 0);
    testResults.tests.push({
      id: 'TEST-02-CATEGORY-TOP-TILES',
      name: 'Category Top 3 Fashion Visual Tiles (No SVG Icons)',
      passed: categoryTilesPass,
      details: categoryTiles
    });

    await page.screenshot({ path: path.join(screenshotsDir, 'screen_a_category_top_tiles.png') });
    console.log(`[QA] Screen A captured: passed=${categoryTilesPass}`);

    // Test 3: Brand Tab - Louis Vuitton (루이비통)
    console.log('[QA] Switching to Brand tab in Category view...');
    await page.evaluate(() => {
      const brandTabBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent && b.textContent.trim() === '브랜드');
      if (brandTabBtn) brandTabBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    const lvBrandCards = await page.evaluate(() => {
      const grid = document.querySelector('div.grid.grid-cols-2');
      if (!grid) return { found: false, count: 0, items: [] };
      const imgs = Array.from(grid.querySelectorAll('img'));
      const fallbackBadges = grid.querySelectorAll('[data-image-status="fallback"]');
      return {
        found: true,
        count: imgs.length,
        fallbackBadgesCount: fallbackBadges.length,
        items: imgs.map(img => ({
          src: img.src,
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        }))
      };
    });

    const lvBrandPass = lvBrandCards.found && lvBrandCards.count === 6 && lvBrandCards.fallbackBadgesCount === 0 && lvBrandCards.items.every(i => i.naturalWidth > 0);
    testResults.tests.push({
      id: 'TEST-03-BRAND-LOUIS-VUITTON',
      name: 'Louis Vuitton 6 Products Real Images (Zero Fallback Badges)',
      passed: lvBrandPass,
      details: lvBrandCards
    });

    await page.screenshot({ path: path.join(screenshotsDir, 'screen_b_category_brand_louisvuitton.png') });
    console.log(`[QA] Screen B captured (Louis Vuitton): passed=${lvBrandPass}`);

    // Test 4: Check Other Brands (스톤 아일랜드, 구찌, 샤넬, CP 컴퍼니, 셀린느)
    const otherBrands = ['스톤 아일랜드', '구찌', '샤넬', 'CP 컴퍼니', '셀린느'];
    for (const bName of otherBrands) {
      console.log(`[QA] Testing brand switch to: ${bName}...`);
      await page.evaluate((targetName) => {
        const brandMonograms = Array.from(document.querySelectorAll('div.flex.gap-4.overflow-x-auto > div'));
        const target = brandMonograms.find(el => el.textContent && el.textContent.includes(targetName));
        if (target) target.click();
      }, bName);

      await new Promise(r => setTimeout(r, 700));

      const brandCards = await page.evaluate(() => {
        const grid = document.querySelector('div.grid.grid-cols-2');
        if (!grid) return { found: false, count: 0, items: [] };
        const imgs = Array.from(grid.querySelectorAll('img'));
        const fallbackBadges = grid.querySelectorAll('[data-image-status="fallback"]');
        return {
          found: true,
          count: imgs.length,
          fallbackBadgesCount: fallbackBadges.length,
          items: imgs.map(img => ({
            src: img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          }))
        };
      });

      const bPass = brandCards.found && brandCards.count === 6 && brandCards.fallbackBadgesCount === 0 && brandCards.items.every(i => i.naturalWidth > 0);
      testResults.tests.push({
        id: `TEST-04-BRAND-${bName.replace(/\s+/g, '_')}`,
        name: `${bName} 6 Products Real Images`,
        passed: bPass,
        details: brandCards
      });

      const safeName = brandFileNames[bName] || 'brand';
      await page.screenshot({ path: path.join(screenshotsDir, `screen_b_brand_${safeName}.png`) });
      console.log(`[QA] Brand ${bName} tested: passed=${bPass}`);
    }

    // Test 5: Search Overlay
    console.log('[QA] Testing Search Overlay with query "샤넬"...');
    // Go back to main
    await page.evaluate(() => {
      const backBtn = document.querySelector('header button');
      if (backBtn) backBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Open Search overlay via header button
    await page.evaluate(() => {
      const searchBtn = document.querySelector('button[aria-label="통합 검색창 열기"]');
      if (searchBtn) searchBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Click trending keyword "샤넬" in search modal
    await page.evaluate(() => {
      const trendingItems = Array.from(document.querySelectorAll('div[aria-label="통합 검색"] div.flex-1.flex.flex-col.gap-5 span'));
      const chanel = trendingItems.find(s => s.textContent === '샤넬');
      if (chanel) chanel.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const searchResults = await page.evaluate(() => {
      const searchModal = document.querySelector('div[aria-label="통합 검색"]');
      if (!searchModal) return { found: false, count: 0, items: [] };
      const resultsGrid = searchModal.querySelector('div.grid.grid-cols-2');
      if (!resultsGrid) return { found: false, count: 0, items: [] };
      const imgs = Array.from(resultsGrid.querySelectorAll('img'));
      const fallbackBadges = resultsGrid.querySelectorAll('[data-image-status="fallback"]');
      return {
        found: true,
        count: imgs.length,
        fallbackBadgesCount: fallbackBadges.length,
        items: imgs.map(img => ({
          src: img.src,
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        }))
      };
    });

    const searchPass = searchResults.found && searchResults.count >= 2 && searchResults.fallbackBadgesCount === 0 && searchResults.items.every(i => i.naturalWidth > 0);
    testResults.tests.push({
      id: 'TEST-05-SEARCH-CATALOG',
      name: 'Search Results Chanel Real Images',
      passed: searchPass,
      details: searchResults
    });

    await page.screenshot({ path: path.join(screenshotsDir, 'screen_c_search_results_chanel.png') });
    console.log(`[QA] Screen C captured: passed=${searchPass}`);

  } catch (err) {
    console.error('[QA ERROR]', err);
    testResults.error = String(err);
  } finally {
    await browser.close();
  }

  // Generate Report
  const allPassed = testResults.tests.length > 0 && testResults.tests.every(t => t.passed);
  console.log(`\n========================================`);
  console.log(`[QA SUMMARY] All Passed: ${allPassed}`);
  console.log(`Passed Tests: ${testResults.tests.filter(t => t.passed).length} / ${testResults.tests.length}`);
  console.log(`========================================\n`);

  let md = `# LuxuryRental Browser E2E Image QA Report\n\n`;
  md += `- **Execution Time**: ${testResults.timestamp}\n`;
  md += `- **Environment**: Headless Chrome (Viewport: 430x932 @ 2x Retina)\n`;
  md += `- **Total Tests**: ${testResults.tests.length}\n`;
  md += `- **Passed**: ${testResults.tests.filter(t => t.passed).length}\n`;
  md += `- **Failed**: ${testResults.tests.filter(t => !t.passed).length}\n`;
  md += `- **Final Verdict**: ${allPassed ? '✅ 100% ALL PASS' : '❌ SOME TESTS FAILED'}\n\n`;

  md += `## Test Summary\n\n`;
  md += `| Test ID | Test Description | Image Count | Fallback Badges | Result |\n`;
  md += `|---------|------------------|-------------|-----------------|--------|\n`;

  for (const t of testResults.tests) {
    const count = t.details?.count ?? 0;
    const fallbacks = t.details?.fallbackBadgesCount ?? 0;
    md += `| \`${t.id}\` | ${t.name} | ${count} | ${fallbacks} | ${t.passed ? '✅ PASS' : '❌ FAIL'} |\n`;
  }

  md += `\n## Captured Visual Evidence\n\n`;
  md += `- **Screen A (카테고리 상단 3개 타일)**: \`docs/screenshots_phase2/screen_a_category_top_tiles.png\`\n`;
  md += `- **Screen B (루이비통 6대 상품 그리드)**: \`docs/screenshots_phase2/screen_b_category_brand_louisvuitton.png\`\n`;
  md += `- **Screen B2~B6 (스톤아일랜드, 구찌, 샤넬, CP컴퍼니, 셀린느)**: \`docs/screenshots_phase2/screen_b_brand_*.png\`\n`;
  md += `- **Screen C (통합 검색 결과 실사)**: \`docs/screenshots_phase2/screen_c_search_results_chanel.png\`\n`;
  md += `- **Screen D (메인 렌트 신규 입고 실사)**: \`docs/screenshots_phase2/screen_d_main_rent_new_arrivals.png\`\n`;

  fs.writeFileSync(path.join(qaDir, 'CATEGORY_IMAGE_QA.md'), md, 'utf-8');
  fs.writeFileSync(path.join(qaDir, 'browser_qa_results.json'), JSON.stringify(testResults, null, 2), 'utf-8');

  console.log(`[QA REPORT SAVED] docs/qa/CATEGORY_IMAGE_QA.md & docs/qa/browser_qa_results.json`);

  // Clean up temporary script
  if (fs.existsSync(path.join(frontendDir, 'scripts/test-search.js'))) {
    fs.unlinkSync(path.join(frontendDir, 'scripts/test-search.js'));
  }

  if (!allPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

const frontendDir = path.resolve(__dirname, '..');
runBrowserQA();
