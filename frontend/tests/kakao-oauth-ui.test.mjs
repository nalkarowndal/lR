import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('d:/JSW_React/8.portfolio/IIL');

test('Kakao OAuth UI: ShopLike.tsx implements real OAuth activation', () => {
  const shopLikeContent = fs.readFileSync(path.join(ROOT, 'frontend/src/components/ShopLike.tsx'), 'utf-8');

  // Must call handleKakaoLogin
  assert.ok(shopLikeContent.includes('handleKakaoLogin'), 'ShopLike.tsx must implement handleKakaoLogin');
  assert.ok(shopLikeContent.includes('onClick={handleKakaoLogin}'), 'Kakao button must bind handleKakaoLogin');

  // Must preserve official styling & official symbol
  assert.ok(shopLikeContent.includes('#FEE500'), 'Must use Kakao official yellow background #FEE500');
  assert.ok(shopLikeContent.includes('KakaoOfficialSymbol'), 'Must render official Kakao symbol');
  assert.ok(shopLikeContent.includes('카카오로 3초만에 계속하기'), 'Must display official marketing copy');

  // Must verify configuration with backend status API
  assert.ok(shopLikeContent.includes('api.getKakaoStatus()'), 'Must check backend Kakao configuration status');
  assert.ok(shopLikeContent.includes('docs/auth/KAKAO_LOGIN_SETUP.md'), 'Must guide user to setup doc when unconfigured');
});

test('Kakao OAuth Return: main.tsx handles OAuth callback query parameters', () => {
  const mainContent = fs.readFileSync(path.join(ROOT, 'frontend/src/main.tsx'), 'utf-8');

  assert.ok(mainContent.includes("params.get('oauth')"), 'main.tsx must inspect oauth param');
  assert.ok(mainContent.includes("oauthStatus === 'success'"), 'main.tsx must handle oauth success');
  assert.ok(mainContent.includes("oauthStatus === 'cancelled'"), 'main.tsx must handle oauth cancellation');
  assert.ok(mainContent.includes("oauthStatus === 'config_required'"), 'main.tsx must handle missing configuration');
  assert.ok(mainContent.includes("oauthStatus === 'email_conflict'"), 'main.tsx must handle email collision');
  assert.ok(mainContent.includes('window.history.replaceState'), 'main.tsx must clean query from URL bar');
});

test('Kakao OAuth API Client: api.ts exports typed OAuth helpers', () => {
  const apiContent = fs.readFileSync(path.join(ROOT, 'frontend/src/services/api.ts'), 'utf-8');

  assert.ok(apiContent.includes('getKakaoStatus'), 'api.ts must export getKakaoStatus');
  assert.ok(apiContent.includes('unlinkKakao'), 'api.ts must export unlinkKakao');
  assert.ok(apiContent.includes("credentials: 'include'"), 'fetchJson must include credentials for HttpOnly session cookie');
});

test('Bottom Floating Navigation: Absolute Immunity Check', () => {
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
