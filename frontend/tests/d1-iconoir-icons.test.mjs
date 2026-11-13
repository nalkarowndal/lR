import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

test('D1 geometry references verified Iconoir paths and no hand-drawn replacements', () => {
  const code = read('src/components/icons/BoutiqueD1Icons.tsx');
  for (const key of ['crown', 'shirt', 'handbag', 'shopping-bag-arrow-up']) {
    assert.match(code, new RegExp(`glyph=[\"']${key}[\"']`));
  }
  assert.match(code, /M19\.2 17L21 7L14\.7 10L12 7/);
  assert.match(code, /M16\.5 21H18\.6688/);
  assert.match(code, /useId\(\)/);
});

test('D1 service cards use the existing library shapes', () => {
  const code = read('src/components/ShopMain.tsx');
  for (const component of ['D1RentIcon', 'D1BuyIcon', 'D1SellIcon']) {
    assert.match(code, new RegExp(`<${component}\\b`));
  }
  assert.doesNotMatch(code, /<LuxuryHandshakeIcon\b/);
});

test('Bottom navigation keeps its original controls and actions', () => {
  const code = read('src/components/ShopMain.tsx');
  const bottom = code.slice(code.indexOf('aria-label="하단 네비게이션"'));
  for (const icon of ['<List size={22}', '<ShoppingBagIcon size={22}', '<Home size={22}', '<Heart size={22}', '<User size={22}']) {
    assert.ok(bottom.includes(icon), `Bottom bar icon unchanged: ${icon}`);
  }
});

test('Native and React splash use the same Iconoir crown with no circular medal', () => {
  const native = read('index.html');
  const reactSplash = read('src/components/ui/SplashScreen.tsx');
  assert.match(native, /M19\.2 17L21 7L14\.7 10L12 7/);
  assert.match(reactSplash, /D1SplashCrownIcon/);
  assert.doesNotMatch(native, /native-splash-emblem::after/);
  assert.doesNotMatch(reactSplash, /Outer Circular Ring with subtle gold glow/);
});

test('License notice is bundled with copied Iconoir geometry', () => {
  const license = read('../docs/design/ICONOIR_LICENSE.md');
  assert.match(license, /Copyright \(c\) 2021 Luca Burgio/);
  assert.match(license, /MIT License/);
});

test('Refined Atelier crown has real clipped inner-cut shading and restrained metallic face', () => {
  const code = read('src/components/icons/BoutiqueD1Icons.tsx');
  const native = read('index.html');
  for (const src of [code, native]) {
    assert.match(src, /feGaussianBlur/);
    assert.match(src, /feOffset/);
    assert.match(src, /feComposite/);
    assert.match(src, /operator=["']out["']/);
    assert.match(src, /operator=["']in["']/);
    assert.match(src, /#FFF1D2/);
    assert.match(src, /#F4DCB1/);
  }
  assert.match(code, /data-d1-finish=\{variant\}/);
  assert.match(code, /data-d1-glyph=\{glyph\}/);
  assert.doesNotMatch(native, /native-splash-emblem::before/);
});

test('Boutique style retains bold graphite legibility without external white halo', () => {
  const code = read('src/components/icons/BoutiqueD1Icons.tsx');
  assert.match(code, /stroke="#302D29" strokeWidth="1\.52"/);
  assert.match(code, /stroke="#AA9372"/);
  assert.doesNotMatch(code, /stroke="#FBF8F3" strokeWidth="2\.3"/);
});

test('Native and React Atelier crown share the same five metallic gradient stop colors', () => {
  const code = read('src/components/icons/BoutiqueD1Icons.tsx');
  const native = read('index.html');
  for (const hex of ['#FFF1D2', '#D6BD8E', '#AA8250', '#F4DCB1', '#B68E58', '#E6C99B']) {
    assert.ok(code.includes(hex) && native.includes(hex), `Same crown metallic tint in both splash layers: ${hex}`);
  }
});
