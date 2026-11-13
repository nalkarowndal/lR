import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path,base),'utf8');

test('Visual QA routes are isolated from production entry and cannot supply auth credentials',()=>{
  const app=read('src/main.tsx');
  const harness=read('qa/d2-3-harness.tsx');
  const html=read('qa/d2-3-harness.html');
  assert.doesNotMatch(app,/d2-3-harness|d2-3-integrated/);
  assert.match(harness,/DEVELOPMENT ONLY/);
  assert.match(harness,/example\.invalid/);
  assert.doesNotMatch(harness,/accessToken|Bearer|localStorage\.setItem|document\.cookie/);
  assert.match(html,/qa\/d2-3-harness\.tsx/);
});

test('All three icon phases are checked against six optical sizes',()=>{
  const gallery=read('qa/d2-3-harness.tsx');
  for(const icon of ['D1SplashCrownIcon','D1RentIcon','D1BuyIcon','D1SellIcon','D2Icon','D22Icon'])
    assert.ok(gallery.includes(icon),icon);
  assert.match(gallery,/\[16, 20, 24, 32, 48, 72\]/);
  const qa=read('scripts/qa-d2-3-integrated.mjs');
  assert.match(qa,/duplicates\.length/);
  assert.match(qa,/ratio<3/);
  assert.match(qa,/D23_INTEGRATED_QA_PASS/);
});

test('Main page bottom navigation is untouched by D2-3',()=>{
  const main=read('src/components/ShopMain.tsx');
  const part=main.slice(main.indexOf('aria-label="하단 네비게이션"'));
  assert.match(part,/<List size=\{22\}/);
  assert.match(part,/<ShoppingBagIcon size=\{22\}/);
  assert.match(part,/<Home size=\{22\}/);
  assert.match(part,/<Heart size=\{22\}/);
  assert.match(part,/<User size=\{22\}/);
});
