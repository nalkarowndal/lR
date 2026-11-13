import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

const pages = {
  ShopCategory: ['D22ChevronLeft', 'D22ChevronRight', 'D22MessageCircle', 'D22ShoppingCart', 'D22Heart', 'D22ShieldCheck'],
  ShopSearch: ['D22Search', 'D22X', 'D22Heart', 'D22ArrowUp', 'D22ArrowDown'],
  ShopMyPage: ['D22Crown', 'D22Profile', 'D22Sparkles', 'D22ShoppingBag', 'D22Edit3'],
  ShopSettings: ['D22Lock', 'D22Bell', 'D22Profile', 'D22ShieldCheck', 'D22ChevronRight'],
  ShopSell: ['D22Search', 'D22PlusCircle', 'D22BadgeCheck', 'D22ChevronLeft'],
  ShopAdmin: ['D22Sell', 'D22PlusCircle', 'D22Refresh', 'D22ShoppingBag', 'D22Profile'],
};

test('D2-2 has consistent Iconoir adapters across six screens', () => {
  for (const [name, icons] of Object.entries(pages)) {
    const contents = read(`src/components/${name}.tsx`);
    assert.match(contents, /from '\.\/icons\/BoutiqueD22Icons'/, name);
    for (const icon of icons) assert.ok(contents.includes(icon), `${name} references ${icon}`);
  }
});

test('D2-2 original vector source and optical finishes are bundled', () => {
  const parts = ['A', 'B', 'C'].map(k => read(`src/components/icons/D22IconShapes${k}.ts`));
  const code = read('src/components/icons/BoutiqueD22Icons.tsx');
  for (const key of ['nav-arrow-left', 'nav-arrow-right', 'heart', 'cart', 'lock', 'user-circle', 'shopping-bag-arrow-up']) {
    assert.ok(parts.some(x => x.includes('"' + key + '"')), key);
  }
  assert.match(code, /useId\(\)/);
  assert.match(code, /stroke="currentColor"/);
  assert.match(code, /data-d22-glyph=/);
  assert.match(code, /fill=\{fill\}/);
  assert.match(code, /#FFF1D2/);
  assert.doesNotMatch(code, /rounded-full|border-radius|medallion-frame/);
});

test('Key functional state and product media remain', () => {
  const category = read('src/components/ShopCategory.tsx');
  const search = read('src/components/ShopSearch.tsx');
  const mypage = read('src/components/ShopMyPage.tsx');
  const settings = read('src/components/ShopSettings.tsx');
  const sell = read('src/components/ShopSell.tsx');
  const admin = read('src/components/ShopAdmin.tsx');
  assert.match(category, /CATEGORY_TOP_TILES/);
  assert.match(category, /<ProductImage\b/);
  assert.match(search, /<ProductImage\b/);
  assert.match(mypage, /<ProductImage\b/);
  assert.match(mypage, /fill="currentColor"/);
  assert.match(settings, /setShowLogoutConfirm/);
  assert.match(sell, /searchQuery/);
  assert.match(admin, /isLoadingSells\s*\?\s*'animate-spin'/);
  assert.match(admin, /D22Sell as EngravedAdminHandshake/);
});

test('Bottom navigation remains the original five buttons', () => {
  const main = read('src/components/ShopMain.tsx');
  const idx = main.indexOf('aria-label="하단 네비게이션"');
  assert.ok(idx > 0);
  const nav = main.slice(idx);
  for (const icon of ['<List size={22}', '<ShoppingBagIcon size={22}', '<Home size={22}', '<Heart size={22}', '<User size={22}']) {
    assert.ok(nav.includes(icon), icon);
  }
  // D2-4 extends the bundled icon family to the main header only.
  assert.match(main, /BoutiqueD22Icons/);
  const bottomNavOnly = nav.slice(0, nav.indexOf('</nav>'));
  assert.equal((bottomNavOnly.match(/<button\b/g) || []).length, 5);
  assert.doesNotMatch(bottomNavOnly, /<D22/);
});
