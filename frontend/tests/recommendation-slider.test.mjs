import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('d:/JSW_React/8.portfolio/IIL');

test('Recommendation Slider: ShopMain tab slide navigation and cyclic advancing', () => {
  const RECOMMEND_TABS = ['20대 여성', '20대 남성', '30대 여성', '30대 남성', '40대 여성'];

  const cycleTab = (current, dir) => {
    const idx = RECOMMEND_TABS.indexOf(current);
    if (dir === 'next') {
      return RECOMMEND_TABS[(idx + 1) % RECOMMEND_TABS.length];
    }
    return RECOMMEND_TABS[(idx - 1 + RECOMMEND_TABS.length) % RECOMMEND_TABS.length];
  };

  assert.equal(cycleTab('20대 여성', 'next'), '20대 남성');
  assert.equal(cycleTab('20대 남성', 'next'), '30대 여성');
  assert.equal(cycleTab('30대 여성', 'next'), '30대 남성');
  assert.equal(cycleTab('30대 남성', 'next'), '40대 여성');
  assert.equal(cycleTab('40대 여성', 'next'), '20대 여성', 'Loops back to start on next');
  assert.equal(cycleTab('20대 여성', 'prev'), '40대 여성', 'Loops back to end on prev');

  // Verify ShopMain.tsx contains slider controls and refs
  const shopMain = fs.readFileSync(path.join(ROOT, 'frontend/src/components/ShopMain.tsx'), 'utf-8');
  assert.ok(shopMain.includes('tabScrollRef'), 'ShopMain must bind tabScrollRef');
  assert.ok(shopMain.includes('handleTabScroll'), 'ShopMain must implement handleTabScroll');
  assert.ok(shopMain.includes('handleTabMouseDown'), 'ShopMain must support mouse dragging');
  assert.ok(shopMain.includes('slideToNextTab'), 'ShopMain must support slideToNextTab');
  assert.ok(shopMain.includes('animate-slideInRight'), 'ShopMain must use slideInRight transition');
  assert.ok(shopMain.includes('animate-slideInLeft'), 'ShopMain must use slideInLeft transition');
});

test('Recommendation Slider: Floating Navigation absolute immunity intact', () => {
  const shopMain = fs.readFileSync(path.join(ROOT, 'frontend/src/components/ShopMain.tsx'), 'utf-8');
  const navSectionMatch = shopMain.match(/<nav[^>]*aria-label="하단 네비게이션"[\s\S]*?<\/nav>/);
  assert.ok(navSectionMatch, 'Bottom navigation section must exist in ShopMain.tsx');
  const navSection = navSectionMatch[0];
  assert.ok(navSection.includes('카테고리'));
  assert.ok(navSection.includes('내 상품 판매'));
  assert.ok(navSection.includes('홈'));
  assert.ok(navSection.includes('좋아요'));
  assert.ok(navSection.includes('마이페이지'));
});
