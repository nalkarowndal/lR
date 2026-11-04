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

test('Legal Documents & Consents Audit Suite', async (t) => {
  let server;
  let baseUrl;
  let customerToken;

  await t.test('Server startup for legal tests', async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}/api/v1`;
        resolve();
      });
    });
    assert.ok(baseUrl);

    // Login customer
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
  });

  await t.test('GET /legal lists all active legal documents', async () => {
    const res = await fetch(`${baseUrl}/legal`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length >= 4);

    const docTypes = data.data.map((d) => d.doc_type);
    assert.ok(docTypes.includes('TERMS_OF_SERVICE'));
    assert.ok(docTypes.includes('PRIVACY_COLLECTION'));
    assert.ok(docTypes.includes('PRIVACY_POLICY'));
    assert.ok(docTypes.includes('MARKETING_CONSENT'));
  });

  await t.test('GET /legal/:docType returns full document text', async () => {
    const res = await fetch(`${baseUrl}/legal/TERMS_OF_SERVICE`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.doc_type, 'TERMS_OF_SERVICE');
    assert.ok(data.data.content.length > 20);
    assert.equal(data.data.version, 'v2.1');
  });

  await t.test('GET /legal/:docType with unknown type returns 404', async () => {
    const res = await fetch(`${baseUrl}/legal/NON_EXISTENT_DOCUMENT`);
    const data = await res.json();
    assert.equal(res.status, 404);
    assert.equal(data.success, false);
  });

  await t.test('POST /auth/register creates user_consents audit rows', async () => {
    const testEmail = `consents_test_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123!',
        name: '동의테스터',
        serviceTermsAgreed: true,
        privacyPolicyAgreed: true,
        marketingConsent: true
      })
    });

    const regData = await regRes.json();
    assert.equal(regRes.status, 201);
    assert.ok(regData.token);

    // Verify consents in audit table
    const auditRes = await fetch(`${baseUrl}/legal/user/consents`, {
      headers: { authorization: `Bearer ${regData.token}` }
    });
    const auditData = await auditRes.json();
    assert.equal(auditRes.status, 200);
    assert.equal(auditData.success, true);
    assert.ok(Array.isArray(auditData.data));
    assert.ok(auditData.data.length >= 3);

    const types = auditData.data.map((c) => c.doc_type);
    assert.ok(types.includes('TERMS_OF_SERVICE'));
    assert.ok(types.includes('PRIVACY_COLLECTION'));
    assert.ok(types.includes('MARKETING_CONSENT'));
  });

  await t.test('PUT /legal/user/consents updates marketing consent and logs audit entry', async () => {
    const updateRes = await fetch(`${baseUrl}/legal/user/consents`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        docType: 'MARKETING_CONSENT',
        agreed: false
      })
    });

    const updateData = await updateRes.json();
    assert.equal(updateRes.status, 200);
    assert.equal(updateData.success, true);
    assert.equal(updateData.consent.agreed, false);

    // Fetch history
    const historyRes = await fetch(`${baseUrl}/legal/user/consents`, {
      headers: { authorization: `Bearer ${customerToken}` }
    });
    const historyData = await historyRes.json();
    assert.equal(historyRes.status, 200);
    assert.equal(historyData.data[0].doc_type, 'MARKETING_CONSENT');
    assert.equal(historyData.data[0].agreed, 0);
  });

  await t.test('Server teardown', async () => {
    // Reset customer password for idempotency
    testDb.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(
      hashPassword('luxury1234!'),
      'customer@luxuryrental.com'
    );
    await new Promise((resolve) => server.close(resolve));
  });
});

