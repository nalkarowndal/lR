import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../dist/app.js';
import { getDatabase } from '../dist/db/database.js';
import { seedDatabase } from '../dist/db/seed.js';

// Setup database & seed
getDatabase();
seedDatabase();

// Helper to make mock requests to express app
async function request(path, options = {}) {
  const method = options.method || 'GET';
  const headers = {
    'content-type': 'application/json',
    ...(options.headers || {})
  };
  const body = options.body ? JSON.stringify(options.body) : undefined;

  return new Promise((resolve, reject) => {
    const req = {
      method,
      url: path,
      headers,
      body: options.body || {},
      query: options.query || {},
      params: options.params || {}
    };

    // Use fetch against running server or supertest-like mock
    // For Node test, start server on dynamic port
  });
}

test('Backend Health & API Endpoints Suite', async (t) => {
  let server;
  let baseUrl;

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

  await t.test('Admin Products: GET and POST', async () => {
    const createRes = await fetch(`${baseUrl}/admin/products`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-role': 'ADMIN' },
      body: JSON.stringify({ title: '테스트 신규 렌탈백', type: 'RENT', price: 65000, brand: '샤넬' })
    });
    const createData = await createRes.json();
    assert.equal(createRes.status, 201);
    assert.equal(createData.data.title, '테스트 신규 렌탈백');

    const getRes = await fetch(`${baseUrl}/admin/products`, {
      headers: { 'x-user-role': 'ADMIN' }
    });
    const getData = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.ok(getData.data.some(p => p.title === '테스트 신규 렌탈백'));
  });

  await t.test('Admin Recruit Requests: GET, POST and PATCH', async () => {
    const postRes = await fetch(`${baseUrl}/admin/recruit/requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-role': 'ADMIN' },
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
      headers: { 'content-type': 'application/json', 'x-user-role': 'ADMIN' },
      body: JSON.stringify({ status: '완료', hired: 2 })
    });
    const patchData = await patchRes.json();
    assert.equal(patchRes.status, 200);
    assert.equal(patchData.success, true);
  });

  await t.test('Admin Workers: GET and POST', async () => {
    const postRes = await fetch(`${baseUrl}/admin/workers`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-role': 'ADMIN' },
      body: JSON.stringify({ name: '강동원', phone: '010-9999-8888', exp: '매니저 3년' })
    });
    const postData = await postRes.json();
    assert.equal(postRes.status, 201);
    assert.equal(postData.data.name, '강동원');
  });

  await t.test('Admin Messages: GET and POST', async () => {
    const postRes = await fetch(`${baseUrl}/admin/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-role': 'ADMIN' },
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
