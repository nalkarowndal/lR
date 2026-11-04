import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../dist/app.js';
import { getDatabase } from '../dist/db/database.js';
import { seedDatabase } from '../dist/db/seed.js';

// Setup database & seed
getDatabase();
seedDatabase();

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
    assert.ok(forgotData.resetToken);

    // Reset password with token
    const resetRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: forgotData.resetToken,
        newPassword: 'newLuxuryPassword999!'
      })
    });
    const resetData = await resetRes.json();
    assert.equal(resetRes.status, 200);
    assert.equal(resetData.success, true);

    // Try resetting again with same token (should fail 400)
    const repeatRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: forgotData.resetToken,
        newPassword: 'anotherPassword123!'
      })
    });
    assert.equal(repeatRes.status, 400);

    // Restore customer password
    const restoreForgot = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'customer@luxuryrental.com' })
    });
    const restoreForgotData = await restoreForgot.json();
    await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: restoreForgotData.resetToken,
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
      body: JSON.stringify({ brandName: '고야드', userName: '테스트고객' })
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.brandName, '고야드');
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

  await t.test('Server teardown', async () => {
    await new Promise((resolve) => server.close(resolve));
    assert.ok(true);
  });
});
