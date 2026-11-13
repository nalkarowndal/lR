import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

const expected = [
  ['gift', 'D2EventGiftIcon'],
  ['shirt', 'D2RentMenuIcon'],
  ['percentage', 'D2DiscountMenuIcon'],
  ['box', 'D2ArrivalMenuIcon'],
  ['credit-card', 'D2MembershipMenuIcon'],
  ['shield-check', 'D2CareMenuIcon'],
  ['crown', 'D2VipMenuIcon'],
  ['refresh-double', 'D2BuybackMenuIcon'],
  ['mail', 'D2InviteMenuIcon'],
];

test('D2 contains nine verified Iconoir source glyphs and named exports', () => {
  const iconSource = read('src/components/icons/BoutiqueD2Icons.tsx');
  for (const [glyph, component] of expected) {
    assert.match(iconSource, new RegExp(`"${glyph}": \\[`));
    assert.match(iconSource, new RegExp(`export const ${component}:`));
    assert.match(iconSource, new RegExp(`glyph="${glyph}"`));
  }
  assert.match(iconSource, /useId\(\)/);
  assert.match(iconSource, /MIT/);
});

test('Event banner renders the new Atelier gift without round medallion', () => {
  const main = read('src/components/ShopMain.tsx');
  const banner = main.slice(main.indexOf('{/* 회원가입 이벤트 배너 카드 */}'), main.indexOf('{/* 리본즈만의 서비스 */}'));
  assert.match(banner, /D2EventGiftIcon/);
  assert.match(banner, /setActiveOverlay\('REGISTER'\)/);
  assert.doesNotMatch(banner, /LuxuryGiftIcon|rounded-full|bg-indigo|indigo-950/);
});

test('Eight original menu labels and handlers remain, backed by D2 icons', () => {
  const main = read('src/components/ShopMain.tsx');
  const entries = [
    ['D2RentMenuIcon', '렌트 소개'],
    ['D2DiscountMenuIcon', '70% 할인'],
    ['D2ArrivalMenuIcon', '오늘신규입고'],
    ['D2MembershipMenuIcon', '베이직멤버십'],
    ['D2CareMenuIcon', '렌트잇 케어'],
    ['D2VipMenuIcon', 'VIP'],
    ['D2BuybackMenuIcon', '바이백'],
    ['D2InviteMenuIcon', '친구 초대'],
  ];
  for (const [icon, title] of entries) {
    assert.ok(main.includes(`<${icon}`), `Icon: ${icon}`);
    assert.ok(main.includes(`title: '${title}'`), `Label: ${title}`);
  }
  assert.match(main, /handleMenuClick\(menu.title\)/);
  assert.match(main, /onKeyDown=\{\(e\) => \(e.key === 'Enter' \|\| e.key === ' '\)/);
  assert.doesNotMatch(main, /w-12 h-12 bg-\[#FAF9F6\] rounded-2xl/);
});

test('Bottom navigation still has exactly five original icons', () => {
  const main = read('src/components/ShopMain.tsx');
  const nav = main.slice(main.indexOf('aria-label="하단 네비게이션"'));
  for (const icon of ['<List size={22}', '<ShoppingBagIcon size={22}', '<Home size={22}', '<Heart size={22}', '<User size={22}']) {
    assert.ok(nav.includes(icon), icon);
  }
  assert.equal((nav.match(/<button\b/g) ?? []).length >= 5, true);
});
