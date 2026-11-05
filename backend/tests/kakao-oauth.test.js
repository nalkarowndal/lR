import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../dist/app.js';
import { getDatabase } from '../dist/db/database.js';
import { config } from '../dist/config/env.js';

test('Kakao OAuth 2.0 Integration & Security Suite', async (t) => {
  let appServer;
  let baseUrl;
  let mockKakaoServer;
  let mockKakaoPort;
  let mockKakaoBaseUrl;

  const db = getDatabase();

  // Helper to start the test servers
  await t.test('Startup backend and mock Kakao provider server', async () => {
    // 1. App server
    await new Promise((resolve) => {
      appServer = app.listen(0, () => {
        const port = appServer.address().port;
        baseUrl = `http://127.0.0.1:${port}/api/v1`;
        resolve();
      });
    });

    // 2. Mock Kakao OAuth & API Server
    await new Promise((resolve) => {
      mockKakaoServer = http.createServer((req, res) => {
        const url = new URL(req.url, `http://127.0.0.1:${mockKakaoPort || 9999}`);

        // Token endpoint
        if (url.pathname === '/oauth/token' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            const params = new URLSearchParams(body);
            const code = params.get('code');

            if (code === 'VALID_AUTH_CODE') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                access_token: 'MOCK_KAKAO_ACCESS_TOKEN_123',
                token_type: 'bearer',
                refresh_token: 'MOCK_REFRESH_TOKEN_456',
                expires_in: 21600
              }));
            } else if (code === 'VALID_EXISTING_USER_CODE') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                access_token: 'MOCK_EXISTING_ACCESS_TOKEN',
                token_type: 'bearer',
                expires_in: 21600
              }));
            } else if (code === 'VALID_EMAIL_CONFLICT_CODE') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                access_token: 'MOCK_CONFLICT_ACCESS_TOKEN',
                token_type: 'bearer',
                expires_in: 21600
              }));
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'invalid_grant',
                error_description: 'authorization code not found or expired'
              }));
            }
          });
          return;
        }

        // User info endpoint
        if (url.pathname === '/v2/user/me' && req.method === 'GET') {
          const auth = req.headers['authorization'];
          if (auth === 'Bearer MOCK_KAKAO_ACCESS_TOKEN_123') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              id: 9988776655,
              connected_at: '2026-11-05T00:00:00Z',
              properties: {
                nickname: '카카오새회원',
                profile_image: 'http://k.kakaocdn.net/dn/profile1.jpg'
              },
              kakao_account: {
                profile: {
                  nickname: '카카오새회원',
                  profile_image_url: 'http://k.kakaocdn.net/dn/profile1.jpg'
                },
                email: 'kakao_newuser_qa@domain.com'
              }
            }));
            return;
          }

          if (auth === 'Bearer MOCK_EXISTING_ACCESS_TOKEN') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              id: 9988776655, // Same Kakao ID
              connected_at: '2026-11-05T00:00:00Z',
              properties: {
                nickname: '카카오새회원_Updated',
                profile_image: 'http://k.kakaocdn.net/dn/profile1_updated.jpg'
              },
              kakao_account: {
                profile: {
                  nickname: '카카오새회원_Updated',
                  profile_image_url: 'http://k.kakaocdn.net/dn/profile1_updated.jpg'
                },
                email: 'kakao_newuser_qa@domain.com'
              }
            }));
            return;
          }

          if (auth === 'Bearer MOCK_CONFLICT_ACCESS_TOKEN') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              id: 1122334455,
              kakao_account: {
                profile: { nickname: '충돌고객' },
                email: 'customer@luxuryrental.com' // Already exists in luxuryRental DB
              }
            }));
            return;
          }

          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'unauthorized' }));
          return;
        }

        res.writeHead(404);
        res.end();
      });

      mockKakaoServer.listen(0, () => {
        mockKakaoPort = mockKakaoServer.address().port;
        mockKakaoBaseUrl = `http://127.0.0.1:${mockKakaoPort}`;
        resolve();
      });
    });

    assert.ok(baseUrl);
    assert.ok(mockKakaoBaseUrl);
  });

  await t.test('GET /auth/kakao/status reflects configuration accurately', async () => {
    // 1. Unconfigured state
    const originalKey = config.kakaoRestApiKey;
    config.kakaoRestApiKey = '';

    const res1 = await fetch(`${baseUrl}/auth/kakao/status`);
    const data1 = await res1.json();
    assert.equal(data1.configured, false);

    // 2. Configured state
    config.kakaoRestApiKey = 'test_kakao_rest_api_key_12345';
    const res2 = await fetch(`${baseUrl}/auth/kakao/status`);
    const data2 = await res2.json();
    assert.equal(data2.configured, true);
    assert.equal(data2.redirectUri, config.kakaoRedirectUri);

    config.kakaoRestApiKey = originalKey; // Restore
  });

  await t.test('GET /auth/kakao returns 400 when REST API key is missing', async () => {
    const originalKey = config.kakaoRestApiKey;
    config.kakaoRestApiKey = '';

    const res = await fetch(`${baseUrl}/auth/kakao`, {
      headers: { 'Accept': 'application/json' },
      redirect: 'manual'
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error, 'KAKAO_NOT_CONFIGURED');

    config.kakaoRestApiKey = originalKey;
  });

  await t.test('GET /auth/kakao creates CSRF state and redirects to authorize URL', async () => {
    config.kakaoRestApiKey = 'kakao_test_client_id_xyz';
    config.kakaoAuthBaseUrl = mockKakaoBaseUrl;

    const res = await fetch(`${baseUrl}/auth/kakao?format=json`, {
      headers: { 'Accept': 'application/json' }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.state);
    assert.ok(data.redirectUrl.includes('response_type=code'));
    assert.ok(data.redirectUrl.includes(`client_id=${config.kakaoRestApiKey}`));
    assert.ok(data.redirectUrl.includes(`state=${data.state}`));

    // Check state in SQLite DB
    const stateInDb = db.prepare('SELECT state, provider FROM oauth_states WHERE state = ?').get(data.state);
    assert.ok(stateInDb);
    assert.equal(stateInDb.provider, 'kakao');
  });

  await t.test('GET /auth/kakao/callback rejects user cancel / access_denied', async () => {
    const res = await fetch(`${baseUrl}/auth/kakao/callback?error=access_denied&error_description=User%20denied%20access`, {
      redirect: 'manual'
    });
    assert.equal(res.status, 302);
    const location = res.headers.get('location');
    assert.ok(location.includes('oauth=cancelled'));
    assert.ok(location.includes('provider=kakao'));
  });

  await t.test('GET /auth/kakao/callback rejects invalid or expired state', async () => {
    const res = await fetch(`${baseUrl}/auth/kakao/callback?code=SOME_CODE&state=INVALID_NON_EXISTENT_STATE`, {
      redirect: 'manual'
    });
    assert.equal(res.status, 302);
    const location = res.headers.get('location');
    assert.ok(location.includes('oauth=invalid_state'));
  });

  await t.test('State replay prevention: consumed state cannot be reused', async () => {
    // Generate valid state in DB
    const testState = 'replay_test_state_1234567890abcdef1234567890abcdef';
    db.prepare(`
      INSERT INTO oauth_states (state, provider, redirect_uri, return_to, expires_at)
      VALUES (?, 'kakao', 'http://localhost:4000/callback', '/', datetime('now', '+10 minutes'))
    `).run(testState);

    // First attempt consumes state
    const res1 = await fetch(`${baseUrl}/auth/kakao/callback?code=INVALID_CODE&state=${testState}`, {
      redirect: 'manual'
    });
    assert.equal(res1.status, 302);

    // Second attempt with same state MUST be rejected as invalid_state
    const res2 = await fetch(`${baseUrl}/auth/kakao/callback?code=INVALID_CODE&state=${testState}`, {
      redirect: 'manual'
    });
    assert.equal(res2.status, 302);
    assert.ok(res2.headers.get('location').includes('oauth=invalid_state'));
  });

  await t.test('Full Flow: New Kakao user registration & session cookie issuance', async () => {
    config.kakaoRestApiKey = 'valid_test_kakao_key';
    config.kakaoAuthBaseUrl = mockKakaoBaseUrl;
    config.kakaoApiBaseUrl = mockKakaoBaseUrl;

    // Clean up test kakao user if exists
    db.prepare('DELETE FROM users WHERE email = ?').run('kakao_newuser_qa@domain.com');

    // 1. Generate valid state
    const authRes = await fetch(`${baseUrl}/auth/kakao?format=json`);
    const authData = await authRes.json();
    const state = authData.state;

    // 2. Call callback with valid code and state
    const callbackRes = await fetch(`${baseUrl}/auth/kakao/callback?code=VALID_AUTH_CODE&state=${state}`, {
      redirect: 'manual'
    });

    assert.equal(callbackRes.status, 302);
    const location = callbackRes.headers.get('location');
    assert.ok(location.includes('oauth=success'));
    assert.ok(location.includes('provider=kakao'));
    // Security check: Verify NO tokens or code in redirect URL!
    assert.ok(!location.includes('token='));
    assert.ok(!location.includes('code='));

    // Verify Set-Cookie header contains lr_session
    const setCookie = callbackRes.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.ok(setCookie.includes('lr_session='));
    assert.ok(setCookie.includes('HttpOnly'));

    // Extract lr_session cookie value
    const sessionTokenMatch = setCookie.match(/lr_session=([^;]+)/);
    assert.ok(sessionTokenMatch);
    const sessionToken = sessionTokenMatch[1];

    // 3. Verify user in SQLite DB
    const userInDb = db.prepare('SELECT id, email, name, role, avatar_url FROM users WHERE email = ?').get('kakao_newuser_qa@domain.com');
    assert.ok(userInDb);
    assert.equal(userInDb.name, '카카오새회원');
    assert.equal(userInDb.role, 'USER', 'OAuth user role must strictly be USER');
    assert.ok(userInDb.avatar_url.includes('profile1.jpg'));

    // 4. Verify user_oauth_accounts link in SQLite DB
    const oauthAccount = db.prepare('SELECT user_id, provider, provider_user_id FROM user_oauth_accounts WHERE provider_user_id = ?').get('9988776655');
    assert.ok(oauthAccount);
    assert.equal(oauthAccount.user_id, userInDb.id);
    assert.equal(oauthAccount.provider, 'kakao');

    // 5. Test authenticated API access using HttpOnly Cookie
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Cookie': `lr_session=${sessionToken}` }
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.success, true);
    assert.equal(meData.user.id, userInDb.id);
    assert.equal(meData.user.email, 'kakao_newuser_qa@domain.com');

    // 6. Test GET /users/me profile returns oauth_accounts
    const profileRes = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Cookie': `lr_session=${sessionToken}` }
    });
    assert.equal(profileRes.status, 200);
    const profileData = await profileRes.json();
    assert.equal(profileData.profile.is_oauth_user, true);
    assert.deepEqual(profileData.profile.oauth_accounts, ['kakao']);

    // 7. Security: Verify Kakao user is strictly BLOCKED from Admin endpoints
    const adminRes = await fetch(`${baseUrl}/admin/products`, {
      headers: { 'Cookie': `lr_session=${sessionToken}` }
    });
    assert.equal(adminRes.status, 403, 'Kakao user must receive 403 Forbidden on admin routes');
  });

  await t.test('Full Flow: Existing Kakao user re-login updates session without duplicate', async () => {
    config.kakaoRestApiKey = 'valid_test_kakao_key';
    config.kakaoAuthBaseUrl = mockKakaoBaseUrl;
    config.kakaoApiBaseUrl = mockKakaoBaseUrl;

    const countBefore = (db.prepare('SELECT count(*) as count FROM users WHERE email = ?').get('kakao_newuser_qa@domain.com')).count;

    // 1. Generate state
    const authRes = await fetch(`${baseUrl}/auth/kakao?format=json`);
    const authData = await authRes.json();
    const state = authData.state;

    // 2. Call callback with same kakao ID user
    const callbackRes = await fetch(`${baseUrl}/auth/kakao/callback?code=VALID_EXISTING_USER_CODE&state=${state}`, {
      redirect: 'manual'
    });
    assert.equal(callbackRes.status, 302);
    assert.ok(callbackRes.headers.get('location').includes('oauth=success'));

    // Check count of users in DB: NO DUPLICATE CREATED
    const countAfter = (db.prepare('SELECT count(*) as count FROM users WHERE email = ?').get('kakao_newuser_qa@domain.com')).count;
    assert.equal(countAfter, countBefore, 'Re-login must not duplicate user row in users table');
  });

  await t.test('Security: Prevent silent account takeover on existing email collision', async () => {
    config.kakaoRestApiKey = 'valid_test_kakao_key';
    config.kakaoAuthBaseUrl = mockKakaoBaseUrl;
    config.kakaoApiBaseUrl = mockKakaoBaseUrl;

    // 1. Generate state
    const authRes = await fetch(`${baseUrl}/auth/kakao?format=json`);
    const authData = await authRes.json();
    const state = authData.state;

    // 2. Call callback returning email of existing user customer@luxuryrental.com
    const callbackRes = await fetch(`${baseUrl}/auth/kakao/callback?code=VALID_EMAIL_CONFLICT_CODE&state=${state}`, {
      redirect: 'manual'
    });
    assert.equal(callbackRes.status, 302);
    const location = callbackRes.headers.get('location');
    assert.ok(location.includes('oauth=email_conflict'));
    assert.ok(location.includes(encodeURIComponent('customer@luxuryrental.com')));

    // Ensure customer@luxuryrental.com was NOT modified or linked silently
    const linked = db.prepare('SELECT * FROM user_oauth_accounts WHERE provider_user_id = ?').get('1122334455');
    assert.equal(linked, undefined, 'Must not silently link conflicting email without verification');
  });

  await t.test('POST /auth/kakao/unlink unlinks OAuth account safely', async () => {
    // 1. Get Kakao user session
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get('kakao_newuser_qa@domain.com');
    assert.ok(user);

    // Create session for user
    const token = 'unlink_test_session_token_' + Date.now();
    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?, ?, datetime('now', '+1 hour'))
    `).run(token, user.id);

    // Unlink
    const unlinkRes = await fetch(`${baseUrl}/auth/kakao/unlink`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    assert.equal(unlinkRes.status, 200);
    const data = await unlinkRes.json();
    assert.equal(data.success, true);

    // Verify unlinked from DB
    const checkOAuth = db.prepare('SELECT * FROM user_oauth_accounts WHERE user_id = ?').get(user.id);
    assert.equal(checkOAuth, undefined, 'OAuth account must be unlinked');
  });

  await t.test('POST /auth/logout destroys session and clears cookie', async () => {
    const user = db.prepare('SELECT id FROM users LIMIT 1').get();
    const token = 'logout_test_session_token_' + Date.now();
    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?, ?, datetime('now', '+1 hour'))
    `).run(token, user.id);

    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `lr_session=${token}`
      }
    });
    assert.equal(logoutRes.status, 200);
    const data = await logoutRes.json();
    assert.equal(data.success, true);

    // Session deleted from DB
    const sessionInDb = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
    assert.equal(sessionInDb, undefined);
  });

  await t.test('Teardown test servers', async () => {
    await new Promise(r => appServer.close(r));
    await new Promise(r => mockKakaoServer.close(r));
  });
});
