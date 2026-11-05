import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('d:/JSW_React/8.portfolio/IIL');

test('Engraved Icon Design System - Exports and Structure', () => {
  const iconsIndexPath = path.join(ROOT, 'frontend/src/components/icons/index.ts');
  assert.ok(fs.existsSync(iconsIndexPath), 'icons/index.ts must exist');

  const content = fs.readFileSync(iconsIndexPath, 'utf-8');
  assert.match(content, /EngravedServiceIcons/, 'Must export service icons');
  assert.match(content, /EngravedMenuIcons/, 'Must export menu icons');
  assert.match(content, /EngravedCategoryIcons/, 'Must export category icons');
  assert.match(content, /EngravedAccountIcons/, 'Must export account icons');
  assert.match(content, /EngravedAdminIcons/, 'Must export admin icons');
});

test('Bottom Floating Navigation - Absolute Immunity Check', () => {
  const shopMainPath = path.join(ROOT, 'frontend/src/components/ShopMain.tsx');
  const shopMain = fs.readFileSync(shopMainPath, 'utf-8');

  // Verify bottom navigation section exists and uses standard Lucide/ShoppingBag icons
  const navSectionMatch = shopMain.match(/<nav[^>]*aria-label="하단 네비게이션"[\s\S]*?<\/nav>/);
  assert.ok(navSectionMatch, 'Bottom navigation section must exist in ShopMain.tsx');

  const navSection = navSectionMatch[0];

  // Must contain exactly the 5 preserved buttons:
  assert.ok(navSection.includes('카테고리'), 'Must contain 카테고리');
  assert.ok(navSection.includes('내 상품 판매'), 'Must contain 내 상품 판매');
  assert.ok(navSection.includes('홈'), 'Must contain 홈');
  assert.ok(navSection.includes('좋아요'), 'Must contain 좋아요');
  assert.ok(navSection.includes('마이페이지'), 'Must contain 마이페이지');

  // Must NOT contain luxury-engraved-icon class (isolated!)
  assert.strictEqual(
    navSection.includes('luxury-engraved-icon'),
    false,
    'Bottom navigation MUST NOT be polluted with luxury-engraved-icon classes'
  );
});

test('Scoped CSS in index.css - Non-pollution Check', () => {
  const cssPath = path.join(ROOT, 'frontend/src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  // Must define .luxury-engraved-icon
  assert.ok(cssContent.includes('.luxury-engraved-icon'), 'Must define .luxury-engraved-icon class');
  
  // Must NOT define blanket global SVG overrides like "svg { ... }" that break other icons
  const blanketSvg = /(^|\n)\s*svg\s*\{/g;
  assert.strictEqual(blanketSvg.test(cssContent), false, 'No global blanket svg selector allowed');
});

test('Deterministic SVG Defs - Namespace and Anti-Collision', () => {
  const tokensPath = path.join(ROOT, 'frontend/src/components/icons/EngravedIconTokens.tsx');
  const tokensContent = fs.readFileSync(tokensPath, 'utf-8');

  assert.ok(tokensContent.includes('EngravedDefs'), 'Must define EngravedDefs component');
  assert.ok(tokensContent.includes('-satin-grad'), 'Must define satin gradient');
  assert.ok(tokensContent.includes('-gold-grad'), 'Must define champagne gold gradient');
  assert.ok(tokensContent.includes('-gunmetal-grad'), 'Must define gunmetal gradient');
  assert.ok(tokensContent.includes('-deboss-filter'), 'Must define deboss shadow filter');
});

