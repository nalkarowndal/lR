import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
const cfg=readConfig();
if(cfg.DB_NAME!=='lr_test'||cfg.NODE_ENV!=='test')throw new Error('editorial tests must use lr_test');
const db=openPool(cfg),app=createApp(db,{demoMode:true}),disabled=createApp(db,{demoMode:false});
const pass='synthetic-editorial-password-2026';
before(async()=>{await db.query('SELECT 1')});
after(async()=>{await db.end()});
async function actor(admin=false){
 const email='editor-'+randomUUID().slice(0,14)+'@example.invalid';
 const reg=await request(app).post('/api/v1/auth/register').send({email,password:pass});
 assert.equal(reg.status,201);
 if(admin)await db.execute("INSERT INTO lr_user_roles(user_id,role) VALUES(?,'ADMIN')",[reg.body.data.userId]);
 const login=await request(app).post('/api/v1/auth/login').send({email,password:pass});
 assert.equal(login.status,200);
 return {token:login.body.data.accessToken as string,userId:reg.body.data.userId as string};
}
const bearer=(token:string)=>({Authorization:'Bearer '+token});
const copy={eyebrow:'CURATED FOR YOU',headline:'테스트용 주간 컬렉션',description:'시연용 상품만 살펴보세요. 실제 계약과 결제는 진행되지 않습니다.',ctaLabel:'렌탈 컬렉션 보기',ctaTarget:'RENTAL'};
test('editorial public snapshot comes from isolated test DB, never reveals drafts',async()=>{
 const r=await request(app).get('/api/v1/editorial/home');
 assert.equal(r.status,200,JSON.stringify(r.body));
 assert.equal(r.body.data.demo,true);
 assert.equal(r.body.data.slot,'HOME_HERO');
 assert.ok(r.body.data.copy.headline.length>=2);
 assert.equal(r.body.data.draft,undefined);
 assert.equal(r.body.data.updatedBy,undefined);
 assert.ok(r.headers['cache-control']?.includes('no-store'));
 assert.equal((await request(disabled).get('/api/v1/editorial/home')).status,501);
});
test('ADMIN-only drafts, strict fields and explicit publish preserve old public copy',async()=>{
 const admin=await actor(true),customer=await actor();
 const publicBefore=(await request(app).get('/api/v1/editorial/home')).body.data.copy;
 assert.equal((await request(app).get('/api/v1/admin/editorial/home')).status,401);
 assert.equal((await request(app).get('/api/v1/admin/editorial/home').set(bearer(customer.token))).status,403);
 const state=await request(app).get('/api/v1/admin/editorial/home').set(bearer(admin.token));
 assert.equal(state.status,200);
 assert.equal(state.body.data.demo,true);
 assert.ok(state.body.data.published && state.body.data.draft);
 const revision=state.body.data.revision as number;
 const edited=await request(app).put('/api/v1/admin/editorial/home/draft')
  .set(bearer(admin.token)).send({expectedRevision:revision,copy});
 assert.equal(edited.status,200,JSON.stringify(edited.body));
 assert.equal(edited.body.data.draft.headline,copy.headline);
 assert.equal(edited.body.data.revision,revision+1);
 assert.equal(edited.body.data.publishedRevision,state.body.data.publishedRevision);
 const stillOld=(await request(app).get('/api/v1/editorial/home')).body.data.copy;
 assert.deepEqual(stillOld,publicBefore);
 assert.equal((await request(app).post('/api/v1/admin/editorial/home/publish')
  .set(bearer(customer.token)).send({expectedRevision:revision+1})).status,403);
 const published=await request(app).post('/api/v1/admin/editorial/home/publish')
  .set(bearer(admin.token)).send({expectedRevision:revision+1});
 assert.equal(published.status,200,JSON.stringify(published.body));
 assert.equal(published.body.data.published.headline,copy.headline);
 const newPublic=await request(app).get('/api/v1/editorial/home');
 assert.equal(newPublic.body.data.copy.headline,copy.headline);
 assert.equal(newPublic.body.data.copy.ctaTarget,'RENTAL');
 assert.equal(newPublic.body.data.revision,published.body.data.publishedRevision);
 const stale=await request(app).put('/api/v1/admin/editorial/home/draft')
  .set(bearer(admin.token)).send({expectedRevision:revision,copy});
 assert.equal(stale.status,409);
 const [audit]=await db.query<any[]>('SELECT action FROM lr_demo_editorial_audit WHERE actor_id=? ORDER BY id',[admin.userId]);
 assert.deepEqual(audit.map(x=>x.action),['DRAFT_EDIT','PUBLISH']);
});
test('two parallel editors cannot silently overwrite a published draft',async()=>{
 const admin=await actor(true);
 const current=(await request(app).get('/api/v1/admin/editorial/home').set(bearer(admin.token))).body.data;
 const [a,b]=await Promise.all(Array.from({length:2},(_,i)=>request(app)
  .put('/api/v1/admin/editorial/home/draft').set(bearer(admin.token))
  .send({expectedRevision:current.revision,copy:{...copy,headline:'버전 '+i+' 시연 헤드라인'}})));
 assert.deepEqual([a.status,b.status].sort(),[200,409]);
});
test('unsafe URLs, HTML, overly long text and extra image/upload fields are rejected',async()=>{
 const admin=await actor(true);
 const state=(await request(app).get('/api/v1/admin/editorial/home').set(bearer(admin.token))).body.data;
 for(const unsafe of [
  {...copy,ctaTarget:'https://attacker.invalid'},
  {...copy,headline:'<script>alert(1)</script>'},
  {...copy,description:'https://bad.invalid 외부 이미지'},
  {...copy,ctaLabel:'x'.repeat(65)},
  {...copy,heroImageUrl:'https://unlicensed.invalid/brand.jpg'},
  {...copy,headline:'a'}
 ]){
  const res=await request(app).put('/api/v1/admin/editorial/home/draft')
   .set(bearer(admin.token)).send({expectedRevision:state.revision,copy:unsafe});
  assert.equal(res.status,422,JSON.stringify(res.body));
 }
 assert.equal((await request(app).post('/api/v1/admin/editorial/home/publish')
  .set(bearer(admin.token)).send({expectedRevision:state.revision,override:true})).status,422);
 assert.equal((await request(disabled).put('/api/v1/admin/editorial/home/draft')
  .set(bearer(admin.token)).send({expectedRevision:state.revision,copy})).status,501);
});
test('role revocation is applied on every administrator mutation and public never reveals an audit actor',async()=>{
 const admin=await actor(true);
 const state=(await request(app).get('/api/v1/admin/editorial/home').set(bearer(admin.token))).body.data;
 await db.execute("DELETE FROM lr_user_roles WHERE user_id=? AND role='ADMIN'",[admin.userId]);
 assert.equal((await request(app).put('/api/v1/admin/editorial/home/draft')
  .set(bearer(admin.token)).send({expectedRevision:state.revision,copy})).status,403);
 assert.equal((await request(app).get('/api/v1/admin/editorial/home').set(bearer(admin.token))).status,403);
 const pub=await request(app).get('/api/v1/editorial/home');
 assert.equal(pub.status,200);assert.equal(pub.body.data.ownerId,undefined);
});

test('editorial PUT preflight allows only configured Expo origin, never wildcard',async()=>{
 const cors=createApp(db,{demoMode:true,corsOrigins:['http://127.0.0.1:8081']});
 const approved=await request(cors).options('/api/v1/admin/editorial/home/draft')
  .set('Origin','http://127.0.0.1:8081').set('Access-Control-Request-Method','PUT');
 assert.equal(approved.status,204);
 assert.equal(approved.headers['access-control-allow-origin'],'http://127.0.0.1:8081');
 assert.match(approved.headers['access-control-allow-methods'],/PUT/);
 const denied=await request(cors).options('/api/v1/admin/editorial/home/draft')
  .set('Origin','https://untrusted.invalid').set('Access-Control-Request-Method','PUT');
 assert.equal(denied.headers['access-control-allow-origin'],undefined);
});
