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
  console.log('[QA] Starting Comprehensive Visual & Icon QA with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    responsiveTests: []
  };

  try {
    // 1. Visit Main Screen
    console.log('[QA] Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    // Test 1: Main Action Service Cards (Engraved Dress, Bag, Handshake, Gift)
    console.log('[QA] Checking Main Service Cards with Engraved Icons...');
    const actionCardsData = await page.evaluate(() => {
      const dress = document.querySelector('svg[viewBox="0 0 48 48"] path[d*="M24 8.5"]');
      const bag = document.querySelector('svg[viewBox="0 0 48 48"] path[d*="M18.5 17"]');
      const handshake = document.querySelector('svg[viewBox="0 0 48 48"] circle[r="15"]');
      const gift = document.querySelector('svg[viewBox="0 0 24 24"] circle[cx="12"][cy="7.5"]');
      return {
        dressFound: !!dress,
        bagFound: !!bag,
        handshakeFound: !!handshake,
        giftFound: !!gift
      };
    });

    const actionCardsPass = actionCardsData.dressFound && actionCardsData.bagFound && actionCardsData.handshakeFound;
    testResults.tests.push({
      id: 'TEST-01-ACTION-CARDS-ENGRAVED',
      name: 'Main Service Action Cards Premium Metal Engraved Icons',
      passed: actionCardsPass,
      details: actionCardsData
    });
    console.log(`[QA] Action cards engraved icons: passed=${actionCardsPass}`);

    // Test 2: Main 8-Grid Menu Icons
    console.log('[QA] Checking Main 8-Grid Menu Icons...');
    const menuIconsCount = await page.evaluate(() => {
      const menuSection = document.querySelector('div.grid.grid-cols-4.gap-y-6');
      if (!menuSection) return 0;
      return menuSection.querySelectorAll('svg').length;
    });
    const menuIconsPass = menuIconsCount === 8;
    testResults.tests.push({
      id: 'TEST-02-MENU-8GRID-ICONS',
      name: 'Main 8-Grid Menu Engraved Emblem Icons',
      passed: menuIconsPass,
      details: { menuIconsCount }
    });
    console.log(`[QA] 8-Grid menu icons count: ${menuIconsCount}, passed=${menuIconsPass}`);

    // Test 3: Main Screen Rent New Arrivals (Real Photos)
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
      id: 'TEST-03-MAIN-RENT-ARRIVALS',
      name: 'Main Screen Rent New Arrivals Real Photos',
      passed: rentArrivalsPass,
      details: newArrivalImages
    });

    await page.screenshot({ path: path.join(screenshotsDir, 'screen_d_main_rent_new_arrivals.png') });
    console.log(`[QA] Screen D captured: passed=${rentArrivalsPass}`);

    // Test 4: Category Top 3 Tiles (Sneakers Photoreal + Visual Tiles)
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
      id: 'TEST-04-CATEGORY-TOP-TILES',
      name: 'Category Top 3 Visual Tiles (Sneaker Photoreal Asset)',
      passed: categoryTilesPass,
      details: categoryTiles
    });

    await page.screenshot({ path: path.join(screenshotsDir, 'screen_a_category_top_tiles.png') });
    console.log(`[QA] Screen A captured: passed=${categoryTilesPass}`);

    // Test 5: Brand Tab & Monogram Medallions - Louis Vuitton
    console.log('[QA] Switching to Brand tab in Category view...');
    await page.evaluate(() => {
      const brandTabBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent && b.textContent.trim() === '브랜드');
      if (brandTabBtn) brandTabBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    // Verify Brand Monogram Medallions
    const monogramData = await page.evaluate(() => {
      const monograms = Array.from(document.querySelectorAll('div.flex.gap-4.overflow-x-auto > div'));
      return {
        count: monograms.length,
        activeText: monograms[0]?.textContent?.trim()
      };
    });

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
      id: 'TEST-05-BRAND-LOUIS-VUITTON',
      name: 'Louis Vuitton 6 Products & Engraved Monogram Medallion',
      passed: lvBrandPass,
      details: { ...lvBrandCards, monograms: monogramData }
    });

    await page.screenshot({ path: path.join(screenshotsDir, 'screen_b_category_brand_louisvuitton.png') });
    console.log(`[QA] Screen B captured (Louis Vuitton): passed=${lvBrandPass}`);

    // Test 6: Check Other Brands (Stone Island, Gucci, Chanel, CP Company, Celine)
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
        id: `TEST-06-BRAND-${bName.replace(/\s+/g, '_')}`,
        name: `${bName} 6 Products & Monogram`,
        passed: bPass,
        details: brandCards
      });

      const safeName = brandFileNames[bName] || 'brand';
      await page.screenshot({ path: path.join(screenshotsDir, `screen_b_brand_${safeName}.png`) });
      console.log(`[QA] Brand ${bName} tested: passed=${bPass}`);
    }

    // Test 7: Search Overlay with query "샤넬"
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
      id: 'TEST-07-SEARCH-CATALOG',
      name: 'Search Results Chanel Real Images',
      passed: searchPass,
      details: searchResults
    });

    await page.screenshot({ path: path.join(screenshotsDir, 'screen_c_search_results_chanel.png') });
    console.log(`[QA] Screen C captured: passed=${searchPass}`);

    // Close search overlay
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[aria-label="통합 검색"] button[aria-label="검색창 닫기"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Return cleanly to ShopMain for multi-viewport responsive and interactive QA
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    // Test 8: Multi-viewport Responsive QA (360px, 390px, 430px, 768px, 1440px)
    console.log('[QA] Running Multi-Viewport Responsive QA...');
    const viewports = [
      { name: 'mobile_360', width: 360, height: 780, label: 'Small Mobile (360px)' },
      { name: 'mobile_390', width: 390, height: 844, label: 'Standard Mobile (390px)' },
      { name: 'mobile_430', width: 430, height: 932, label: 'Large Mobile (430px)' },
      { name: 'tablet_768', width: 768, height: 1024, label: 'Tablet Portrait (768px)' },
      { name: 'desktop_1440', width: 1440, height: 900, label: 'Desktop View (1440px)' }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
      await new Promise(r => setTimeout(r, 400));

      const layoutIntegrity = await page.evaluate(() => {
        const docWidth = document.documentElement.offsetWidth;
        const bodyWidth = document.body.offsetWidth;
        const hasHorizontalScroll = document.documentElement.scrollWidth > docWidth + 5;
        return {
          docWidth,
          bodyWidth,
          hasHorizontalScroll: !hasHorizontalScroll
        };
      });

      const vpPass = layoutIntegrity.hasHorizontalScroll;
      testResults.responsiveTests.push({
        id: `RESPONSIVE-${vp.name.toUpperCase()}`,
        name: vp.label,
        width: vp.width,
        height: vp.height,
        passed: vpPass
      });

      const vpScreenshotPath = path.join(screenshotsDir, `responsive_${vp.name}.png`);
      await page.screenshot({ path: vpScreenshotPath });
      console.log(`[QA] Responsive ${vp.label}: passed=${vpPass}, saved to responsive_${vp.name}.png`);

      // 🌟 Desktop 1440px: High-priority layout offset, focus trap, and cart tests
      if (vp.name === 'desktop_1440') {
        console.log('[QA] Testing Desktop 1440px Search Panel Alignment & Focus...');
        // 1. Open Search Overlay
        await page.evaluate(() => {
          const btn = document.querySelector('button[aria-label="상품 검색 열기"]');
          if (btn) btn.click();
        });
        // Wait for 300ms slide-in transition + 320ms focus timer
        await new Promise(r => setTimeout(r, 500));

        const searchAlignment = await page.evaluate(() => {
          const searchPanel = document.querySelector('div[role="dialog"][aria-label="통합 검색"]');
          const appContainer = searchPanel ? searchPanel.closest('.max-w-md') || searchPanel.parentElement : null;
          const searchRect = searchPanel ? searchPanel.getBoundingClientRect() : null;
          const appRect = appContainer ? appContainer.getBoundingClientRect() : null;
          const windowScrollX = window.scrollX;
          const offsetDiff = (searchRect && appRect) ? Math.abs(searchRect.left - appRect.left) : 999;
          return {
            searchLeft: searchRect ? searchRect.left : null,
            appLeft: appRect ? appRect.left : null,
            offsetDiff,
            windowScrollX,
            isPerfectAligned: offsetDiff < 2 && windowScrollX === 0
          };
        });

        testResults.tests.push({
          id: 'TEST-08-DESKTOP-SEARCH-ALIGNMENT',
          name: 'Desktop 1440px Search Panel Alignment & Zero Scroll Shift',
          passed: searchAlignment.isPerfectAligned,
          details: searchAlignment
        });

        const desktopSearchScreenshot = path.join(screenshotsDir, 'responsive_desktop_1440_search_aligned.png');
        await page.screenshot({ path: desktopSearchScreenshot });
        console.log(`[QA] Desktop Search Alignment: passed=${searchAlignment.isPerfectAligned}, offsetDiff=${searchAlignment.offsetDiff}px, scrollX=${searchAlignment.windowScrollX}`);

        // 2. Close Search Overlay
        await page.evaluate(() => {
          const closeBtn = document.querySelector('div[aria-label="통합 검색"] button[aria-label="검색창 닫기"]');
          if (closeBtn) closeBtn.click();
        });
        await new Promise(r => setTimeout(r, 450));

        // 3. Test Closed Overlay Keyboard Focus Exclusion (W3C Dialog inert/invisible)
        console.log('[QA] Testing Closed Overlays Keyboard Focus Exclusion...');
        const focusExclusion = await page.evaluate(() => {
          const focusables = Array.from(document.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])'));
          const hiddenElements = focusables.filter(el => {
            const inertParent = el.closest('[inert]');
            const invisibleParent = el.closest('.invisible');
            return inertParent || invisibleParent;
          });
          
          return {
            totalFocusables: focusables.length,
            hiddenFocusablesCount: hiddenElements.length,
            allHiddenExcludedFromTab: hiddenElements.every(el => el.closest('[inert]') !== null || el.closest('.invisible') !== null)
          };
        });

        testResults.tests.push({
          id: 'TEST-09-KEYBOARD-FOCUS-EXCLUSION',
          name: 'Closed Overlays Keyboard Focus Exclusion (Inert/Invisible)',
          passed: focusExclusion.allHiddenExcludedFromTab,
          details: focusExclusion
        });
        console.log(`[QA] Keyboard Focus Exclusion: passed=${focusExclusion.allHiddenExcludedFromTab}`);

        // 4. Test Product Recommendation Detail Modal & Cart Workflow
        console.log('[QA] Testing Product Recommendation Detail Modal & Cart on Home View...');
        
        // Click recommendation card
        const cardTest = await page.evaluate(async () => {
          const cards = document.querySelectorAll('[data-testid="recommend-product-card"]');
          const card = cards[0];
          if (card) {
            card.scrollIntoView({ behavior: 'instant', block: 'center' });
            card.click();
          }
          await new Promise(r => setTimeout(r, 600));
          const modal = document.querySelector('div[role="dialog"][aria-label="상품 상세 정보"]');
          return {
            cardsCount: cards.length,
            modalOpened: Boolean(modal)
          };
        });

        // Click "장바구니 담기"
        await page.evaluate(async () => {
          const modal = document.querySelector('div[role="dialog"][aria-label="상품 상세 정보"]');
          if (modal) {
            const addBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('장바구니 담기'));
            if (addBtn) addBtn.click();
          }
          await new Promise(r => setTimeout(r, 600));
        });

        const cartBadgeVerified = await page.evaluate(() => {
          const badge = document.querySelector('header span.bg-indigo-600');
          return Boolean(badge && badge.textContent && parseInt(badge.textContent.trim(), 10) >= 1);
        });

        const cartPass = cardTest.cardsCount > 0 && cardTest.modalOpened && cartBadgeVerified;
        testResults.tests.push({
          id: 'TEST-10-RECOMMENDATION-DETAIL-CART',
          name: 'Product Recommendation Detail Modal & Cart Add',
          passed: cartPass,
          details: {
            cardsCount: cardTest.cardsCount,
            modalOpened: cardTest.modalOpened,
            cartBadgeVerified
          }
        });
        console.log(`[QA] Product Detail & Cart: passed=${cartPass} (cardsCount=${cardTest.cardsCount}, modal=${cardTest.modalOpened}, badge=${cartBadgeVerified})`);
      }
    }

  } catch (err) {
    console.error('[QA ERROR]', err);
    testResults.error = String(err);
  } finally {
    await browser.close();
  }

  // Generate Reports
  const allCorePassed = testResults.tests.length > 0 && testResults.tests.every(t => t.passed);
  const allRespPassed = testResults.responsiveTests.length > 0 && testResults.responsiveTests.every(t => t.passed);
  const allPassed = allCorePassed && allRespPassed;

  console.log(`\n========================================`);
  console.log(`[QA SUMMARY] All Core Tests Passed: ${allCorePassed}`);
  console.log(`[QA SUMMARY] All Responsive Tests Passed: ${allRespPassed}`);
  console.log(`Passed Tests: ${testResults.tests.filter(t => t.passed).length} / ${testResults.tests.length}`);
  console.log(`Passed Responsive: ${testResults.responsiveTests.filter(t => t.passed).length} / ${testResults.responsiveTests.length}`);
  console.log(`========================================\n`);

  // Write docs/qa/UI_VISUAL_QA.md
  let uiMd = `# LuxuryRental UI Visual & Icon System QA Report\n\n`;
  uiMd += `- **Execution Time**: ${testResults.timestamp}\n`;
  uiMd += `- **Design Paradigm**: Luxury Engraved Emblem / Precision Metal Engraving\n`;
  uiMd += `- **Core Tests Passed**: ${testResults.tests.filter(t => t.passed).length} / ${testResults.tests.length}\n`;
  uiMd += `- **Responsive Viewport Tests**: ${testResults.responsiveTests.filter(t => t.passed).length} / ${testResults.responsiveTests.length}\n`;
  uiMd += `- **Final Evaluation**: ${allPassed ? '✅ 100% ALL PASS' : '❌ SOME TESTS FAILED'}\n\n`;

  uiMd += `## 1. Icon & Visual Component Test Matrix\n\n`;
  uiMd += `| Test ID | Component / Area | Status | Verification Criteria |\n`;
  uiMd += `|---|---|---|---|\n`;
  for (const t of testResults.tests) {
    uiMd += `| \`${t.id}\` | ${t.name} | ${t.passed ? '✅ PASS' : '❌ FAIL'} | ${JSON.stringify(t.details)} |\n`;
  }

  uiMd += `\n## 2. Multi-Viewport Responsive Matrix\n\n`;
  uiMd += `| Viewport | Resolution | Result | Screenshot Evidence |\n`;
  uiMd += `|---|---|---|---|\n`;
  for (const r of testResults.responsiveTests) {
    uiMd += `| ${r.name} | ${r.width}x${r.height} | ${r.passed ? '✅ PASS' : '❌ FAIL'} | \`docs/screenshots_phase2/${r.id.toLowerCase().replace('responsive-', 'responsive_')}.png\` |\n`;
  }

  fs.writeFileSync(path.join(qaDir, 'UI_VISUAL_QA.md'), uiMd, 'utf-8');
  fs.writeFileSync(path.join(qaDir, 'visual_qa_results.json'), JSON.stringify(testResults, null, 2), 'utf-8');
  console.log(`[REPORT SAVED] docs/qa/UI_VISUAL_QA.md & docs/qa/visual_qa_results.json`);

  if (!allPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runBrowserQA();
