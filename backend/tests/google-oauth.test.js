import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import { app } from '../dist/app.js';
import { getDatabase } from '../dist/db/database.js';
import { config } from '../dist/config/env.js';

test('Google OAuth 2.0 Integration & Security Suite', async (t) => {
  let appServer;
  let baseUrl;
  let mockGoogleServer;
  let mockGooglePort = 4099;
  let mockGoogleUrl = `http://localhost:${mockGooglePort}`;

  const db = getDatabase();

  // Store original config
  const originalClientId = config.googleClientId;
  const originalClientSecret = config.googleClientSecret;
  const originalAuthBaseUrl = config.googleAuthBaseUrl;
  const originalTokenBaseUrl = config.googleTokenBaseUrl;
  const originalUserInfoUrl = config.googleUserInfoUrl;
  const originalRedirectUri = config.googleRedirectUri;

  // 1. Setup Mock Google OAuth Server
  const mockApp = express();
  mockApp.use(express.urlencoded({ extended: true }));
  mockApp.use(express.json());

  // Mock Token Endpoint
  mockApp.post('/token', (req, res) => {
    const { code, client_id, client_secret, redirect_uri, grant_type } = req.body;
    if (grant_type !== 'authorization_code') {
      return res.status(400).json({ error: 'unsupported_grant_type' });
    }
    if (code === 'VALID_AUTH_CODE') {
      return res.json({
        access_token: 'mock_google_access_token_123',
        token_type: 'Bearer',
        expires_in: 3599
      });
    }
    if (code === 'VALID_EXISTING_USER_CODE') {
      return res.json({
        access_token: 'mock_google_existing_token_456',
        token_type: 'Bearer',
        expires_in: 3599
      });
    }
    if (code === 'VALID_EMAIL_CONFLICT_CODE') {
      return res.json({
        access_token: 'mock_google_conflict_token_789',
        token_type: 'Bearer',
        expires_in: 3599
      });
    }
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Bad Request'
    });
  });

  // Mock UserInfo Endpoint
  mockApp.get('/userinfo', (req, res) => {
    const auth = req.headers.authorization;
    if (auth === 'Bearer mock_google_access_token_123') {
      return res.json({
        sub: 'google_user_sub_99999',
        name: '구글테스터',
        email: 'google_tester_99999@example.com',
        picture: 'https://lh3.googleusercontent.com/test_avatar.jpg',
        email_verified: true
      });
    }
    if (auth === 'Bearer mock_google_existing_token_456') {
      return res.json({
        sub: 'google_user_sub_99999',
        name: '구글테스터(이름변경)',
        email: 'google_tester_99999@example.com',
        picture: 'https://lh3.googleusercontent.com/updated_avatar.jpg',
        email_verified: true
      });
    }
    if (auth === 'Bearer mock_google_conflict_token_789') {
      return res.json({
        sub: 'google_user_sub_conflict',
        name: '충돌고객',
        email: 'customer@luxuryrental.com', // Pre-seeded in test DB
        picture: '',
        email_verified: true
      });
    }
    return res.status(401).json({ error: 'invalid_token' });
  });

  await new Promise((resolve) => {
    mockGoogleServer = mockApp.listen(mockGooglePort, resolve);
  });

  // 2. Configure environment to point to Mock Google
  config.googleClientId = 'mock-google-client-id-xyz';
  config.googleClientSecret = 'mock-google-client-secret-123';
  config.googleAuthBaseUrl = `${mockGoogleUrl}/auth`;
  config.googleTokenBaseUrl = `${mockGoogleUrl}/token`;
  config.googleUserInfoUrl = `${mockGoogleUrl}/userinfo`;
  config.googleRedirectUri = 'http://localhost:4002/api/v1/auth/google/callback';

  // 3. Start Backend Test Server on dedicated port 4002
  await new Promise((resolve) => {
    appServer = app.listen(4002, () => {
      baseUrl = 'http://localhost:4002/api/v1';
      resolve(null);
    });
  });

  await t.test('GET /auth/google/status reflects configuration accurately', async () => {
    const res = await fetch(`${baseUrl}/auth/google/status`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.configured, true);
    assert.strictEqual(data.hasClientSecret, true);
  });

  await t.test('GET /auth/google creates CSRF state and redirects to authorize URL', async () => {
    const res = await fetch(`${baseUrl}/auth/google?format=json`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.state && data.state.length >= 32);
    assert.ok(data.redirectUrl.includes(config.googleClientId));
    assert.ok(data.redirectUrl.includes('response_type=code'));

    const row = db.prepare('SELECT state, provider FROM oauth_states WHERE state = ?').get(data.state);
    assert.ok(row, 'State record must exist in DB');
    assert.strictEqual(row.provider, 'google');
  });

  await t.test('GET /auth/google/callback rejects user cancel / access_denied', async () => {
    const res = await fetch(`${baseUrl}/auth/google/callback?error=access_denied&error_description=User%20denied`, {
      redirect: 'manual'
    });
    assert.strictEqual(res.status, 302);
    const location = res.headers.get('location');
    assert.ok(location.includes('oauth=cancelled'));
    assert.ok(location.includes('provider=google'));
  });

  await t.test('GET /auth/google/callback rejects invalid or expired state', async () => {
    const res = await fetch(`${baseUrl}/auth/google/callback?code=SOME_CODE&state=INVALID_NON_EXISTENT_STATE`, {
      redirect: 'manual'
    });
    assert.strictEqual(res.status, 302);
    const location = res.headers.get('location');
    assert.ok(location.includes('oauth=invalid_state'));
  });

  await t.test('Full Flow: New Google user registration & session cookie issuance', async () => {
    const initRes = await fetch(`${baseUrl}/auth/google?format=json`);
    const initData = await initRes.json();
    const state = initData.state;

    const callbackRes = await fetch(`${baseUrl}/auth/google/callback?code=VALID_AUTH_CODE&state=${state}`, {
      redirect: 'manual'
    });

    assert.strictEqual(callbackRes.status, 302);
    const location = callbackRes.headers.get('location');
    assert.ok(location.includes('oauth=success'));

    const setCookie = callbackRes.headers.get('set-cookie');
    assert.ok(setCookie && setCookie.includes('lr_session='), 'HttpOnly session cookie must be set');

    const sessionMatch = setCookie.match(/lr_session=([^;]+)/);
    const sessionToken = sessionMatch[1];

    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        'Cookie': `lr_session=${sessionToken}`
      }
    });
    assert.strictEqual(meRes.status, 200);
    const meData = await meRes.json();
    assert.strictEqual(meData.user.name, '구글테스터');
    assert.strictEqual(meData.user.role, 'USER');

    // Test /users/me profile
    const profileRes = await fetch(`${baseUrl}/users/me`, {
      headers: {
        'Cookie': `lr_session=${sessionToken}`
      }
    });
    assert.strictEqual(profileRes.status, 200);
    const profileData = await profileRes.json();
    assert.strictEqual(profileData.profile.is_oauth_user, true);
    assert.ok(profileData.profile.oauth_accounts.includes('google'));

    // Verify security: Google user strictly blocked from Admin routes
    const adminRes = await fetch(`${baseUrl}/admin/products`, {
      headers: { 'Cookie': `lr_session=${sessionToken}` }
    });
    assert.strictEqual(adminRes.status, 403);
  });

  await t.test('Full Flow: Existing Google user re-login updates session without duplicate', async () => {
    const initRes = await fetch(`${baseUrl}/auth/google?format=json`);
    const initData = await initRes.json();
    const state = initData.state;

    const callbackRes = await fetch(`${baseUrl}/auth/google/callback?code=VALID_EXISTING_USER_CODE&state=${state}`, {
      redirect: 'manual'
    });
    assert.strictEqual(callbackRes.status, 302);

    const count = db.prepare(`SELECT COUNT(*) as c FROM user_oauth_accounts WHERE provider = 'google' AND provider_user_id = 'google_user_sub_99999'`).get();
    assert.strictEqual(count.c, 1, 'Must not duplicate OAuth account record');
  });

  await t.test('Security: Prevent silent account takeover on existing email collision', async () => {
    const initRes = await fetch(`${baseUrl}/auth/google?format=json`);
    const initData = await initRes.json();
    const state = initData.state;

    const callbackRes = await fetch(`${baseUrl}/auth/google/callback?code=VALID_EMAIL_CONFLICT_CODE&state=${state}`, {
      redirect: 'manual'
    });
    assert.strictEqual(callbackRes.status, 302);
    const location = callbackRes.headers.get('location');
    assert.ok(location.includes('oauth=email_conflict'));
  });

  // Cleanup
  config.googleClientId = originalClientId;
  config.googleClientSecret = originalClientSecret;
  config.googleAuthBaseUrl = originalAuthBaseUrl;
  config.googleTokenBaseUrl = originalTokenBaseUrl;
  config.googleUserInfoUrl = originalUserInfoUrl;
  config.googleRedirectUri = originalRedirectUri;

  await new Promise((resolve) => appServer.close(resolve));
  await new Promise((resolve) => mockGoogleServer.close(resolve));
});
