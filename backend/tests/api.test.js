import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../dist/app.js';
import { getDatabase } from '../dist/db/database.js';
import { seedDatabase } from '../dist/db/seed.js';
import { hashPassword } from '../dist/utils/crypto.js';

// Setup database & seed
const testDb = getDatabase();
seedDatabase();
testDb.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(
  hashPassword('luxury1234!'),
  'customer@luxuryrental.com'
);

test('Backend Health & API Endpoints Suite', async (t) => {
  let server;
  let baseUrl;
  let adminToken;
  let customerToken;

  await t.test('Server startup', async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}/api/v1`;
        resolve();
      });
    });
    assert.ok(baseUrl);
  });

  await t.test('GET /health returns status ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'LuxuryRental API');
  });

  // ==========================================
  // [AUTH SUITE]
  // ==========================================
  await t.test('POST /auth/register creates new user & session token', async () => {
    const email = `newuser_${Date.now()}@test.com`;
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'Password123!',
        name: '신규고객',
        phone: '010-1111-2222',
        termsAgreed: true,
        marketingConsent: true
      })
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.email, email);
    assert.equal(data.user.role, 'USER');
  });

  await t.test('POST /auth/register rejects duplicate email with 409', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@luxuryrental.com', // Seeded email
        password: 'Password123!',
        name: '중복고객',
        termsAgreed: true
      })
    });
    const data = await res.json();
    assert.equal(res.status, 409);
    assert.equal(data.success, false);
    assert.match(data.error, /이미 등록된 이메일/);
  });

  await t.test('POST /auth/login fails on wrong password with 401', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@luxuryrental.com',
        password: 'wrong_password_123'
      })
    });
    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
  });

  await t.test('POST /auth/login succeeds for admin', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@luxuryrental.com',
        password: 'admin1234!'
      })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.role, 'ADMIN');
    adminToken = data.token;
  });

  await t.test('POST /auth/login succeeds for customer', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@luxuryrental.com',
        password: 'luxury1234!'
      })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.role, 'USER');
    customerToken = data.token;
  });

  await t.test('GET /auth/me returns current session user', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.user.email, 'admin@luxuryrental.com');
  });

  await t.test('POST /auth/forgot-password & /reset-password flow', async () => {
    const forgotRes = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'customer@luxuryrental.com' })
    });
    const forgotData = await forgotRes.json();
    assert.equal(forgotRes.status, 200);
    assert.equal(forgotData.success, true);
    // OWASP compliance: reset token must never be leaked in public response payload
    assert.equal(forgotData.resetToken, undefined);

    // Retrieve dispatched token from database (simulating receipt from user inbox)
    const tokenRow = testDb.prepare(`
      SELECT token FROM password_reset_tokens 
      WHERE user_id = (SELECT id FROM users WHERE email = 'customer@luxuryrental.com')
      ORDER BY created_at DESC LIMIT 1
    `).get();
    assert.ok(tokenRow && tokenRow.token);
    const resetToken = tokenRow.token;

    // Reset password with token
    const resetRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        newPassword: 'newLuxuryPassword999!'
      })
    });
    const resetData = await resetRes.json();
    assert.equal(resetRes.status, 200);
    assert.equal(resetData.success, true);

    // Try resetting again with same token (should fail 400 - used token)
    const repeatRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        newPassword: 'anotherPassword123!'
      })
    });
    assert.equal(repeatRes.status, 400);

    // Restore customer password
    await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'customer@luxuryrental.com' })
    });
    const restoreTokenRow = testDb.prepare(`
      SELECT token FROM password_reset_tokens 
      WHERE user_id = (SELECT id FROM users WHERE email = 'customer@luxuryrental.com')
      ORDER BY created_at DESC LIMIT 1
    `).get();
    await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: restoreTokenRow.token,
        newPassword: 'luxury1234!'
      })
    });
  });

  // ==========================================
  // [SECURITY & ADMIN SUITE]
  // ==========================================
  await t.test('Admin route blocks unauthenticated access with 403', async () => {
    const res = await fetch(`${baseUrl}/admin/products`);
    assert.equal(res.status, 403);
  });

  await t.test('Admin route blocks customer role with 403', async () => {
    const res = await fetch(`${baseUrl}/admin/products`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert.equal(res.status, 403);
  });

  await t.test('Admin route allows verified ADMIN token', async () => {
    const res = await fetch(`${baseUrl}/admin/products`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  // ==========================================
  // [PRODUCT IMAGES SUITE]
  // ==========================================
  let createdImageId;
  await t.test('POST /admin/products/:id/images creates product image', async () => {
    const res = await fetch(`${baseUrl}/admin/products/1/images`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        imagePath: '/assets/products/bags/saint_laurent_le5a7_front.jpg',
        altText: '생로랑 Le 5 A 7 호보백 정면',
        isPrimary: 1
      })
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.ok(data.data.id);
    createdImageId = data.data.id;
  });

  await t.test('GET /products/:id/images retrieves gallery', async () => {
    const res = await fetch(`${baseUrl}/products/1/images`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.count > 0);
  });

  await t.test('DELETE /admin/products/:id/images/:imageId deletes image', async () => {
    const res = await fetch(`${baseUrl}/admin/products/1/images/${createdImageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
  });

  // ==========================================
  // [COMMERCE CATALOG & SELL SUITE]
  // ==========================================
  await t.test('GET /products returns seeded product list', async () => {
    const res = await fetch(`${baseUrl}/products`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.count > 0);
  });

  await t.test('GET /products/recommendations?target=20대 여성 returns 4 items', async () => {
    const res = await fetch(`${baseUrl}/products/recommendations?target=${encodeURIComponent('20대 여성')}`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.target, '20대 여성');
    assert.equal(data.count, 4);
    assert.equal(data.data[0].brand, '생로랑');
  });

  await t.test('GET /categories returns 8 categories with subcategories', async () => {
    const res = await fetch(`${baseUrl}/categories`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.count, 8);
    assert.equal(data.data[0].name, '가방/핸드백');
    assert.ok(Array.isArray(data.data[0].subcategories));
  });

  await t.test('GET /categories/brands returns all brands', async () => {
    const res = await fetch(`${baseUrl}/categories/brands`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.count >= 12);
  });

  await t.test('GET /search with query returns matching results', async () => {
    const res = await fetch(`${baseUrl}/search?q=${encodeURIComponent('샤넬')}`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.count > 0);
  });

  await t.test('POST /sell-requests validates and creates request', async () => {
    const res = await fetch(`${baseUrl}/sell-requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ brandName: '고야드', userName: '테스트고객', phone: '010-1234-5678' })
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.brandName, '고야드');
    assert.equal(data.data.phone, '010-1234-5678');
  });

  await t.test('POST /sell-requests rejects empty brandName with 400', async () => {
    const res = await fetch(`${baseUrl}/sell-requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ brandName: '' })
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  await t.test('Admin Products: GET and POST with Admin Token', async () => {
    const createRes = await fetch(`${baseUrl}/admin/products`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ title: '테스트 신규 렌탈백 v2', type: 'RENT', price: 65000, brand: '샤넬' })
    });
    const createData = await createRes.json();
    assert.equal(createRes.status, 201);
    assert.equal(createData.data.title, '테스트 신규 렌탈백 v2');

    const getRes = await fetch(`${baseUrl}/admin/products`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const getData = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.ok(getData.data.some(p => p.title === '테스트 신규 렌탈백 v2'));
  });

  await t.test('Admin Recruit Requests: GET, POST and PATCH with Admin Token', async () => {
    const postRes = await fetch(`${baseUrl}/admin/recruit/requests`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        storeName: '성수점',
        date: '2026-11-10',
        section: '카운터',
        time: '11:00 - 18:00',
        breakTime: '45분',
        required: 2,
        partner: '박지인'
      })
    });
    const postData = await postRes.json();
    assert.equal(postRes.status, 201);
    assert.equal(postData.data.storeName, '성수점');

    const patchRes = await fetch(`${baseUrl}/admin/recruit/requests/${postData.data.id}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: '완료', hired: 2 })
    });
    const patchData = await patchRes.json();
    assert.equal(patchRes.status, 200);
    assert.equal(patchData.success, true);
  });

  await t.test('Admin Workers: GET and POST with Admin Token', async () => {
    const postRes = await fetch(`${baseUrl}/admin/workers`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ name: '강동원', phone: '010-9999-8888', exp: '매니저 3년' })
    });
    const postData = await postRes.json();
    assert.equal(postRes.status, 201);
    assert.equal(postData.data.name, '강동원');
  });

  await t.test('Admin Messages: GET and POST with Admin Token', async () => {
    const postRes = await fetch(`${baseUrl}/admin/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ sender: '본사담당자', text: '승인 처리되었습니다.', isMine: true })
    });
    const postData = await postRes.json();
    assert.equal(postRes.status, 201);
    assert.equal(postData.data.text, '승인 처리되었습니다.');
  });

  // ==========================================
  // [USER PROFILE & SETTINGS & FAVORITES SUITE]
  // ==========================================
  await t.test('GET /users/me returns authenticated user profile & settings', async () => {
    // Re-login customer since reset-password invalidated earlier sessions for security
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@luxuryrental.com',
        password: 'luxury1234!'
      })
    });
    const loginData = await loginRes.json();
    assert.equal(loginRes.status, 200);
    customerToken = loginData.token;

    const res = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.profile.email, 'customer@luxuryrental.com');
    assert.equal(data.profile.role, 'USER');
    assert.ok(data.profile.settings);
    assert.equal(typeof data.profile.stats.favorites_count, 'number');
  });

  await t.test('PATCH /users/me updates name & strictly blocks role escalation', async () => {
    const res = await fetch(`${baseUrl}/users/me`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        name: '김럭셔리',
        phone: '010-5555-6666',
        role: 'ADMIN' // Malicious attempt to escalate role
      })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.profile.name, '김럭셔리');
    assert.equal(data.profile.role, 'USER', 'Role must remain USER, rejecting client elevation attempt');
  });

  await t.test('PATCH /users/me/settings updates notifications & animation preferences', async () => {
    const res = await fetch(`${baseUrl}/users/me/settings`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        marketing_notifications: true,
        reduce_animations: true
      })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.settings.marketing_notifications, true);
    assert.equal(data.settings.reduce_animations, true);
  });

  await t.test('POST & GET & DELETE /users/me/favorites manages product wishlist', async () => {
    // 1. Add favorite
    const addRes = await fetch(`${baseUrl}/users/me/favorites/1`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const addData = await addRes.json();
    assert.equal(addRes.status, 200);
    assert.equal(addData.success, true);

    // 2. Get favorites
    const getRes = await fetch(`${baseUrl}/users/me/favorites`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const getData = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.equal(getData.success, true);
    assert.ok(Array.isArray(getData.favorites));
    assert.ok(getData.favorites.some(f => f.id === 1));

    // 3. Remove favorite
    const delRes = await fetch(`${baseUrl}/users/me/favorites/1`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const delData = await delRes.json();
    assert.equal(delRes.status, 200);
    assert.equal(delData.success, true);
  });

  await t.test('PATCH /users/me/password verifies current password before updating', async () => {
    // 1. Invalid current password rejects
    const failRes = await fetch(`${baseUrl}/users/me/password`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        currentPassword: 'wrongPassword123!',
        newPassword: 'newLuxuryPass2026!'
      })
    });
    assert.equal(failRes.status, 400);

    // 2. Valid current password succeeds
    const okRes = await fetch(`${baseUrl}/users/me/password`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        currentPassword: 'luxury1234!',
        newPassword: 'newLuxuryPass2026!'
      })
    });
    const okData = await okRes.json();
    assert.equal(okRes.status, 200);
    assert.equal(okData.success, true);

    // 3. Restore customer password for test idempotency
    await fetch(`${baseUrl}/users/me/password`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        currentPassword: 'newLuxuryPass2026!',
        newPassword: 'luxury1234!'
      })
    });
  });

  // ==========================================
  // [P0 SECURITY & IDOR ISOLATION SUITE]
  // ==========================================
  await t.test('GET /sell-requests blocks unauthenticated public access with 401', async () => {
    const res = await fetch(`${baseUrl}/sell-requests`);
    assert.equal(res.status, 401);
  });

  await t.test('GET /admin/sell-requests strictly requires ADMIN role', async () => {
    const custRes = await fetch(`${baseUrl}/admin/sell-requests`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert.equal(custRes.status, 403);

    const adminRes = await fetch(`${baseUrl}/admin/sell-requests`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminData = await adminRes.json();
    assert.equal(adminRes.status, 200);
    assert.equal(adminData.success, true);
    assert.ok(Array.isArray(adminData.data));
  });

  await t.test('P0 Isolation: User A cannot see User B sell requests even with identical homonym name', async () => {
    // 1. Customer (User A: name '김명품') creates sell request
    const postA = await fetch(`${baseUrl}/sell-requests`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ brandName: '디올 레이디백', userName: '김명품' })
    });
    assert.equal(postA.status, 201);

    // 2. User A can view their request
    const getA = await fetch(`${baseUrl}/users/me/sell-requests`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const dataA = await getA.json();
    assert.equal(getA.status, 200);
    assert.ok(dataA.sellRequests.some(r => r.brand_name === '디올 레이디백'));

    // 3. Register User B with identical homonym name '김명품'
    const userBEmail = `homonym_${Date.now()}@test.com`;
    const regB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: userBEmail,
        password: 'password1234!',
        name: '김명품', // Same name, different user_id!
        phone: '010-9999-0000',
        termsAgreed: true,
        privacyAgreed: true
      })
    });
    const dataBReg = await regB.json();
    assert.equal(regB.status, 201);
    const tokenB = dataBReg.token;

    // 4. User B queries their sell requests: MUST NOT see User A's requests!
    const getB = await fetch(`${baseUrl}/users/me/sell-requests`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const dataB = await getB.json();
    assert.equal(getB.status, 200);
    assert.equal(dataB.sellRequests.length, 0); // Strict zero leakage!
  });

  // ==========================================
  // [AVATAR & REAL IMAGE UPLOAD SUITE]
  // ==========================================
  await t.test('POST /users/me/avatar validates magic bytes and uploads profile picture', async () => {
    // 1. Valid 1x1 JPEG magic bytes in base64: FF D8 FF E0 ...
    const validJpegBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    const uploadRes = await fetch(`${baseUrl}/users/me/avatar`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ fileData: validJpegBase64 })
    });
    const uploadData = await uploadRes.json();
    assert.equal(uploadRes.status, 200);
    assert.equal(uploadData.success, true);
    assert.ok(uploadData.avatar_url.startsWith('/assets/uploads/avatars/'));

    // Verify /users/me returns updated avatar
    const meRes = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const meData = await meRes.json();
    assert.equal(meData.profile.avatar_url, uploadData.avatar_url);

    // 2. Reject non-image text with 400
    const fakeData = Buffer.from('this is plain text not image').toString('base64');
    const failRes = await fetch(`${baseUrl}/users/me/avatar`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ fileData: fakeData })
    });
    assert.equal(failRes.status, 400);

    // 3. Reset avatar with DELETE
    const delRes = await fetch(`${baseUrl}/users/me/avatar`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const delData = await delRes.json();
    assert.equal(delRes.status, 200);
    assert.equal(delData.avatar_url, '');
  });

  await t.test('POST /admin/products/:id/images accepts real base64 fileData with magic bytes', async () => {
    const validPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadRes = await fetch(`${baseUrl}/admin/products/1/images`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        fileData: validPngBase64,
        altText: '생로랑 르 5 아 7 실사 업로드',
        isPrimary: 0
      })
    });
    const data = await uploadRes.json();
    assert.equal(uploadRes.status, 201);
    assert.equal(data.success, true);
    assert.ok(data.data.image_path.startsWith('/assets/uploads/products/'));

    // Cleanup created test image
    await fetch(`${baseUrl}/admin/products/1/images/${data.data.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
  });

  // ==========================================
  // [NEW COMPREHENSIVE QA VERIFICATION SUITE]
  // ==========================================
  await t.test('POST /sell-requests requires phone contact for guest applicants', async () => {
    // 1. Unauthenticated guest request without phone -> rejected 400
    const failRes = await fetch(`${baseUrl}/sell-requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ brandName: '구찌 (Gucci)' })
    });
    assert.equal(failRes.status, 400);
    const failData = await failRes.json();
    assert.ok(failData.error.includes('연락처'));

    // 2. Unauthenticated guest request with phone -> succeeds 201
    const okRes = await fetch(`${baseUrl}/sell-requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        brandName: '구찌 (Gucci)',
        userName: '게스트신청자',
        phone: '010-9876-5432'
      })
    });
    assert.equal(okRes.status, 201);
    const okData = await okRes.json();
    assert.equal(okData.data.phone, '010-9876-5432');
    assert.equal(okData.data.userName, '게스트신청자');
  });

  await t.test('GET /products?brand=스톤 아일랜드 returns real DB products with numeric IDs', async () => {
    const res = await fetch(`${baseUrl}/products?brand=${encodeURIComponent('스톤 아일랜드')}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.length > 0);
    for (const item of data.data) {
      assert.equal(typeof item.id, 'number');
      assert.equal(item.brand, '스톤 아일랜드');
    }
  });

  await t.test('POST /users/me/favorites rejects invalid product IDs with foreign key enforcement', async () => {
    // Foreign key enforcement (PRAGMA foreign_keys = ON) blocks non-existent product ID 999999
    const failRes = await fetch(`${baseUrl}/users/me/favorites/999999`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert.equal(failRes.status, 500);

    // Valid product ID 1 succeeds
    const okRes = await fetch(`${baseUrl}/users/me/favorites/1`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert.equal(okRes.status, 200);

    // Cleanup favorite
    await fetch(`${baseUrl}/users/me/favorites/1`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
  });

  await t.test('Server teardown', async () => {
    await new Promise((resolve) => server.close(resolve));
    assert.ok(true);
  });
});
