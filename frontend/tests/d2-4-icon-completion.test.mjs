import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

test('Main header uses engraved D22 vectors and maintains 40px accessible actions', () => {
  const main = read('src/components/ShopMain.tsx');
  const header = main.split('{/* 1. Header */}')[1]?.split('{/* 2. 상단')[0];
  assert.ok(header, 'header found');
  for (const name of ['D22Search', 'D22ShoppingCart', 'D22Settings']) {
    assert.match(header, new RegExp('<' + name + '\\b'));
  }
  for (const text of ['상품 검색 열기', '장바구니 열기', '설정 센터로 이동']) {
    assert.ok(header.includes(text), text);
  }
  assert.equal((header.match(/w-10 h-10/g) || []).length, 3);
  assert.match(header, /focus-visible:outline/);
  const nav = main.split('aria-label="하단 네비게이션"')[1].split('</nav>')[0];
  assert.equal((nav.match(/<button\b/g) || []).length, 5);
  assert.doesNotMatch(nav, /<D22/);
});

test('Admin has no Font Awesome classes and uses correct SVG glyphs, including conditional store role', () => {
  const admin = read('src/components/ShopAdmin.tsx');
  assert.doesNotMatch(admin, /fa-(solid|regular|brands)|<i\b/);
  assert.match(admin, /glyph=\{role === 'STORE' \? 'shop' : 'building'\}/);
  for (const icon of ['media-image', 'media-image-list', 'view-grid', 'group', 'send', 'database', 'archive']) {
    assert.ok(admin.includes('glyph="' + icon + '"'), icon);
  }
  assert.match(admin, /data-qa-admin-main-tabs/);
  assert.match(admin, /data-qa-admin-recruit-tabs/);
  assert.match(admin, /isLoadingSells \? 'animate-spin'/);
});

test('Bundled original Iconoir D2-4 paths are registered and external FA CSS is absent', () => {
  const lib = read('src/components/icons/BoutiqueD22Icons.tsx');
  for (const suffix of ['D', 'E']) {
    const source = read('src/components/icons/D22IconShapes' + suffix + '.ts');
    assert.match(lib, new RegExp('D22_SHAPES_' + suffix));
    assert.match(source, /Original Iconoir SVG geometry/);
  }
  assert.match(lib, /useId\(\)/);
  assert.doesNotMatch(read('index.html'), /font-awesome|all\.min\.css/i);
  function scan(dir) {
    return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap(item => {
      const name = dir + item.name;
      return item.isDirectory() ? scan(name + '/') : /\.tsx$/.test(name) ? [name] : [];
    });
  }
  for (const path of scan('src/')) {
    assert.doesNotMatch(read(path), /className=["'`][^"'`]*fa-(solid|regular|brands)/, path);
  }
});
