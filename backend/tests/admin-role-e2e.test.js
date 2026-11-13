/**
 * D2-5: Real HTTP role-based access E2E with disposable test accounts.
 * Uses only an isolated temporary SQLite database; never production accounts,
 * default seed passwords, external endpoints or production data.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

test('D2-5 actual login sessions enforce ADMIN authorization', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'lr-admin-role-e2e-'));
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_PATH = join(dir, 'disposable.sqlite');
  process.env.ADMIN_API_KEY = ''; // deliberately disable service-to-service override
  const [{ app }, { getDatabase }, { hashPassword }] = await Promise.all([
    import('../dist/app.js'),
    import('../dist/db/database.js'),
    import('../dist/utils/crypto.js')
  ]);
  const db = getDatabase();
  const suffix = randomBytes(8).toString('hex');
  const userEmail = 'e2e-user-' + suffix + '@example.invalid';
  const adminEmail = 'e2e-admin-' + suffix + '@example.invalid';
  const userPassword = 'e2e-U-' + randomBytes(18).toString('hex');
  const adminPassword = 'e2e-A-' + randomBytes(18).toString('hex');
  const adminRow = db.prepare(
    "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, 'E2E Admin', 'ADMIN')"
  ).run(adminEmail, hashPassword(adminPassword));
  const adminId = Number(adminRow.lastInsertRowid);
  const server = await new Promise(resolve => {
    const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
  });
  const base = 'http://127.0.0.1:' + server.address().port + '/api/v1';
  const call = async (method, path, { token, cookie, headers = {}, body } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(cookie ? { Cookie: 'lr_session=' + encodeURIComponent(cookie) } : {}),
        ...headers
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    return { status: res.status, payload: await res.json() };
  };
  let userToken, adminToken;
  const adminRoutes = [
    '/admin/products', '/admin/recruit/requests', '/admin/workers',
    '/admin/messages', '/admin/sell-requests'
  ];
  try {
    await t.test('register USER including attempted ADMIN role injection', async () => {
      const result = await call('POST', '/auth/register', {
        body: {
          email: userEmail, password: userPassword, name: 'E2E User',
          termsAgreed: true, role: 'ADMIN'
        }
      });
      assert.equal(result.status, 201);
      assert.equal(result.payload.user.role, 'USER');
      assert.ok(result.payload.token);
    });

    await t.test('reject incorrect administrator password', async () => {
      const r = await call('POST', '/auth/login', {
        body: { email: adminEmail, password: 'invalid-password' }
      });
      assert.equal(r.status, 401);
    });

    await t.test('login via real HTTP for both isolated accounts', async () => {
      const ordinary = await call('POST', '/auth/login', {
        body: { email: userEmail, password: userPassword }
      });
      assert.equal(ordinary.status, 200);
      assert.equal(ordinary.payload.user.role, 'USER');
      userToken = ordinary.payload.token;
      const elevated = await call('POST', '/auth/login', {
        body: { email: adminEmail, password: adminPassword }
      });
      assert.equal(elevated.status, 200);
      assert.equal(elevated.payload.user.role, 'ADMIN');
      adminToken = elevated.payload.token;
      assert.ok(userToken && adminToken && userToken !== adminToken);
      const me = await call('GET', '/auth/me', { token: adminToken });
      assert.equal(me.status, 200);
      assert.equal(me.payload.user.role, 'ADMIN');
    });

    await t.test('all admin read endpoints deny guest, USER and role-spoofed headers', async () => {
      for (const path of adminRoutes) {
        const guest = await call('GET', path);
        assert.equal(guest.status, 403, 'guest ' + path);
        const user = await call('GET', path, { token: userToken });
        assert.equal(user.status, 403, 'USER ' + path);
        const spoofed = await call('GET', path, {
          token: userToken,
          headers: { 'x-user-role': 'ADMIN', 'x-admin-key': 'wrong-test-key' }
        });
        assert.equal(spoofed.status, 403, 'spoofed ' + path);
        const invalidToken = await call('GET', path, { token: randomBytes(32).toString('hex') });
        assert.equal(invalidToken.status, 403, 'forged session ' + path);
      }
    });

    await t.test('ADMIN session and HttpOnly-style cookie permit each admin read endpoint', async () => {
      for (const path of adminRoutes) {
        const allowed = await call('GET', path, { token: adminToken });
        assert.equal(allowed.status, 200, 'ADMIN ' + path);
        assert.equal(allowed.payload.success, true);
      }
      const viaCookie = await call('GET', '/admin/products', { cookie: adminToken });
      assert.equal(viaCookie.status, 200);
    });

    await t.test('mutation endpoints are denied before validation for USER, guest, spoofing', async () => {
      const body = { title: 'Isolated E2E item', type: 'RENT', price: 10000, brand: 'E2E' };
      const path = '/admin/products';
      for (const opts of [
        {}, { token: userToken },
        { token: userToken, headers: { 'x-user-role': 'ADMIN', 'x-admin-key': 'bad-key' } }
      ]) {
        const res = await call('POST', path, { ...opts, body });
        assert.equal(res.status, 403);
      }
      const created = await call('POST', path, { token: adminToken, body });
      assert.equal(created.status, 201);
      const id = created.payload.data.id;
      assert.ok(Number.isInteger(id));
      const blocked = await call('DELETE', '/admin/products/' + id, { token: userToken });
      assert.equal(blocked.status, 403);
      const removed = await call('DELETE', '/admin/products/' + id, { token: adminToken });
      assert.equal(removed.status, 200);
    });

    await t.test('live demotion immediately removes privileges of existing ADMIN session', async () => {
      db.prepare("UPDATE users SET role = 'USER' WHERE id = ?").run(adminId);
      const denied = await call('GET', '/admin/products', { token: adminToken });
      assert.equal(denied.status, 403);
      db.prepare("UPDATE users SET role = 'ADMIN' WHERE id = ?").run(adminId);
      const restored = await call('GET', '/admin/products', { token: adminToken });
      assert.equal(restored.status, 200);
    });

    await t.test('expired and logged-out ADMIN sessions are rejected', async () => {
      db.prepare("UPDATE sessions SET expires_at = datetime('now','-1 day') WHERE token = ?")
        .run(adminToken);
      const expired = await call('GET', '/admin/products', { token: adminToken });
      assert.equal(expired.status, 403);
      const relogin = await call('POST', '/auth/login', {
        body: { email: adminEmail, password: adminPassword }
      });
      assert.equal(relogin.status, 200);
      const validToken = relogin.payload.token;
      assert.equal((await call('GET', '/admin/products', { token: validToken })).status, 200);
      assert.equal((await call('POST', '/auth/logout', { token: validToken })).status, 200);
      assert.equal((await call('GET', '/admin/products', { token: validToken })).status, 403);
    });
  } finally {
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
