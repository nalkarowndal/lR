import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {readConfig} from '../src/config.js';
import {openPool} from '../src/db.js';
const config=readConfig();
if(config.DB_NAME!=='lr_test'||config.NODE_ENV!=='test')throw new Error('only isolated lr_test is permitted');
const db=openPool(config);
const app=createApp(db,{demoMode:true});
before(async()=>{await db.query('SELECT 1')});
after(async()=>{await db.end()});
const email=()=>randomUUID().slice(0,12)+'@example.invalid';
const password='long-example-password-2026';
const register=async(e:string)=>request(app).post('/api/v1/auth/register').send({email:e,password});
const login=async(e:string,p=password)=>request(app).post('/api/v1/auth/login').send({email:e,password:p});
test('register returns customer only and never returns password hash',async()=>{
 const e=email();const r=await register(e);
 assert.equal(r.status,201);assert.deepEqual(r.body.data.roles,['CUSTOMER']);
 assert.ok(!JSON.stringify(r.body).includes('password'));
 const duplicate=await register(e);assert.equal(duplicate.status,409);
 const [rows]=await db.query<any[]>('SELECT password_hash FROM lr_users WHERE email=?',[e]);
 assert.ok(rows[0].password_hash.startsWith('$argon2id$'));
});
test('invalid credentials do not reveal account existence, sensitive routes require login',async()=>{
 const e=email();
 assert.equal((await login(e)).status,401);
 assert.equal((await request(app).get('/api/v1/me')).status,401);
 assert.equal((await request(app).get('/api/v1/admin/me')).status,401);
 await register(e);
 assert.equal((await login(e,'wrong-password')).status,401);
});
test('login session authorizes /me and prevents user-elevation to ADMIN',async()=>{
 const e=email();await register(e);
 const r=await login(e);assert.equal(r.status,200);
 const token=r.body.data.accessToken;
 const me=await request(app).get('/api/v1/me').set('Authorization','Bearer '+token);
 assert.equal(me.status,200);assert.equal(me.body.data.email,e);
 assert.deepEqual(me.body.data.roles,['CUSTOMER']);
 const admin=await request(app).get('/api/v1/admin/me').set('Authorization','Bearer '+token);
 assert.equal(admin.status,403);assert.equal(admin.body.code,'FORBIDDEN');
});
test('logout revokes opaque bearer session, refresh rotates exactly once',async()=>{
 const e=email();await register(e);
 const r=await login(e);const t=r.body.data.accessToken;
 const rotated=await request(app).post('/api/v1/auth/refresh').set('Authorization','Bearer '+t);
 assert.equal(rotated.status,200);
 assert.notEqual(rotated.body.data.accessToken,t);
 assert.equal((await request(app).get('/api/v1/me').set('Authorization','Bearer '+t)).status,401);
 const t2=rotated.body.data.accessToken;
 assert.equal((await request(app).post('/api/v1/auth/logout').set('Authorization','Bearer '+t2)).status,204);
 assert.equal((await request(app).get('/api/v1/me').set('Authorization','Bearer '+t2)).status,401);
});
test('session expires in database and is rejected immediately',async()=>{
 const e=email();const u=await register(e);const r=await login(e);
 await db.execute('UPDATE lr_sessions SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND) WHERE user_id=?',[u.body.data.userId]);
 const check=await request(app).get('/api/v1/me').set('Authorization','Bearer '+r.body.data.accessToken);
 assert.equal(check.status,401);
});
test('ADMIN role is loaded from DB, not client fields',async()=>{
 const e=email();const u=await register(e);
 const r=await login(e);const token=r.body.data.accessToken;
 await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[u.body.data.userId]);
 const granted=await request(app).get('/api/v1/admin/me').set('Authorization','Bearer '+token);
 assert.equal(granted.status,200);
 await db.execute("DELETE FROM lr_user_roles WHERE user_id=? AND role='ADMIN'",[u.body.data.userId]);
 const revoked=await request(app).get('/api/v1/admin/me').set('Authorization','Bearer '+token);
 assert.equal(revoked.status,403);
});
test('malformed auth headers and registration input fail closed',async()=>{
 const e=email();
 assert.equal((await request(app).get('/api/v1/me').set('Authorization','Bearer x')).status,401);
 assert.equal((await request(app).post('/api/v1/auth/register').send({email:e,password:'tiny',role:'ADMIN'})).status,422);
});
test('production-style app mode blocks new self-service registrations',async()=>{
 const other=createApp(db,{demoMode:false});
 const result=await request(other).post('/api/v1/auth/register').send({email:email(),password});
 assert.equal(result.status,501);
});

test('demo bearer issuing and profile routes refuse HTTP caching',async()=>{
 const e=email();
 const registration=await register(e);
 assert.equal(registration.status,201);
 assert.equal(registration.headers['cache-control'],'no-store');
 const logged=await login(e);
 assert.equal(logged.status,200);
 assert.equal(logged.headers['cache-control'],'no-store');
 const me=await request(app).get('/api/v1/me')
   .set('Authorization','Bearer '+logged.body.data.accessToken);
 assert.equal(me.status,200);
 assert.equal(me.headers['cache-control'],'no-store');
});
