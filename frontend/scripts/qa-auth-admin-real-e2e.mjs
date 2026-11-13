/**
 * D2-5: Real browser email-login + RBAC QA, against a disposable backend DB.
 * No production services or genuine accounts are used.
 */
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import puppeteer from 'puppeteer-core';

const root=process.cwd();
const backendRoot=resolve(root,'../backend');
const out=resolve(root,'qa/admin-role-e2e-evidence');
const temp=mkdtempSync(join(tmpdir(),'lr-browser-admin-e2e-'));
await mkdir(out,{recursive:true});
const backendPort=5279;
const frontendPort=5198;
const api='http://127.0.0.1:'+backendPort+'/api/v1';
const site='http://127.0.0.1:'+frontendPort+'/?splash=false';
const pwd=()=> 'Qa-'+randomBytes(20).toString('hex')+'!';
const users={
  ADMIN:{email:'admin@luxuryrental.com',password:pwd()},
  USER:{email:'customer@luxuryrental.com',password:pwd()}
};
const chrome=process.env.CHROME_PATH || ['google-chrome','google-chrome-stable','chromium'].map(name=>{
  try{return execFileSync('which',[name],{encoding:'utf8'}).trim()}catch{return null}
}).find(Boolean);
if(!chrome)throw new Error('Chrome/Chromium required for real login E2E');
const children=[];
const result={scope:'Disposable SQLite + real Express + production Vite preview + Chrome',checks:[],status:'fail'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function start(command,args,cwd,env){
  const child=spawn(command,args,{cwd,env,stdio:'ignore',detached:process.platform!=='win32',shell:process.platform==='win32'});
  children.push(child);
}
async function ready(url){
  for(let i=0;i<120;i++){
    try{if((await fetch(url)).ok)return;}catch{}
    await sleep(250);
  }
  throw new Error('Local QA service unavailable: '+url);
}
async function textVisible(page,value){
  await page.waitForFunction(value=>document.body.textContent?.includes(value),{timeout:15000},value);
}
async function createActor(browser){
  const context=await browser.createBrowserContext();
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:390,height:844,deviceScaleFactor:1});
  await page.goto(site,{waitUntil:'domcontentloaded',timeout:35000});
  await page.waitForSelector('button[aria-label="설정 센터로 이동"]',{timeout:25000});
  return {context,page,errors};
}
async function realLogin(page,who){
  await page.evaluate(()=>{
    const button=[...document.querySelectorAll('button')].find(e=>e.textContent?.trim()==='간편 로그인하기');
    if(!button)throw new Error('Login action missing');
    button.click();
  });
  await page.waitForSelector('button[aria-label="이메일 로그인 전환"]',{visible:true});
  await page.click('button[aria-label="이메일 로그인 전환"]');
  await page.waitForSelector('input[placeholder="아이디(이메일)"]',{visible:true});
  await page.type('input[placeholder="아이디(이메일)"]',users[who].email);
  await page.type('input[placeholder="비밀번호"]',users[who].password);
  const loginResponse=page.waitForResponse(
    response=>response.url().includes('/auth/login') && response.request().method()==='POST',
    {timeout:15000}
  );
  await page.$eval('input[placeholder="아이디(이메일)"]',i=>i.closest('form')?.requestSubmit());
  const actualLogin=await loginResponse;
  if(actualLogin.status()!==200)throw new Error('Real account login HTTP '+actualLogin.status()+' ('+who+')');
  try{
    await textVisible(page,who==='ADMIN'?'최고관리자':'일반 회원');
  }catch(e){
    const diagnosis=await page.evaluate(()=>({
      screen:document.body.innerText.slice(0,950),
      savedSession:Boolean(sessionStorage.getItem('lr_token')||localStorage.getItem('lr_token')),
      overlayVisible:Boolean(document.querySelector('[role="dialog"]'))
    }));
    throw new Error('Login response 200 but UI role missing: '+JSON.stringify(diagnosis));
  }
  await sleep(950); // overlay closes after successful login animation
}
let browser;
try{
  start('node',['dist/server.js'],backendRoot,{
    ...process.env,NODE_ENV:'test',PORT:String(backendPort),
    DATABASE_PATH:join(temp,'disposable.sqlite'),
    ADMIN_API_KEY:'',
    DEV_ADMIN_PASSWORD:users.ADMIN.password,
    DEV_CUSTOMER_PASSWORD:users.USER.password,
    CLIENT_ORIGIN:'http://127.0.0.1:'+frontendPort
  });
  await ready(api+'/health');
  start('npm',['run','preview','--','--host','127.0.0.1','--port',String(frontendPort),'--strictPort'],root,process.env);
  await ready(site);
  browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
  {
    const {context,page,errors}=await createActor(browser);
    await page.evaluate(()=>window.__lrNavigate('SHOP_ADMIN'));
    await textVisible(page,'관리자 인증이 필요합니다');
    assert.equal(errors.length,0);
    result.checks.push({actor:'GUEST',outcome:'direct navigation denied'});
    await page.screenshot({path:resolve(out,'guest-denied.png')});
    await context.close();
  }
  {
    const {context,page,errors}=await createActor(browser);
    await realLogin(page,'USER');
    await page.click('button[aria-label="설정 센터로 이동"]');
    await textVisible(page,'계정 및 보안');
    assert.equal(await page.evaluate(()=>document.body.textContent?.includes('통합 관리자 대시보드')),false);
    await page.evaluate(()=>window.__lrNavigate('SHOP_ADMIN'));
    await textVisible(page,'접근 권한이 없습니다');
    assert.equal(await page.evaluate(()=>document.body.textContent?.includes('통합 관리자 센터')),false);
    assert.equal(errors.length,0);
    result.checks.push({actor:'USER',outcome:'real login accepted; admin card hidden; direct navigation denied'});
    await page.screenshot({path:resolve(out,'user-denied.png')});
    await context.close();
  }
  {
    const {context,page,errors}=await createActor(browser);
    await realLogin(page,'ADMIN');
    await page.click('button[aria-label="설정 센터로 이동"]');
    await textVisible(page,'통합 관리자 대시보드');
    await page.evaluate(()=>{
      const button=[...document.querySelectorAll('button')].find(e=>e.textContent?.trim()==='진입');
      if(!button)throw new Error('Admin entry action missing');
      button.click();
    });
    await textVisible(page,'통합 관리자 센터');
    assert.equal(await page.evaluate(()=>document.body.textContent?.includes('접근 권한이 없습니다')),false);
    assert.equal(errors.length,0);
    result.checks.push({actor:'ADMIN',outcome:'real login accepted; admin entry and dashboard rendered'});
    await page.screenshot({path:resolve(out,'admin-allowed.png')});
    await context.close();
  }
  result.status='pass';
  console.log('D25_REAL_ACCOUNT_BROWSER_QA_PASS',JSON.stringify(result.checks));
}catch(e){
  result.error=String(e);
  throw e;
}finally{
  await writeFile(resolve(out,'results.json'),JSON.stringify(result,null,2));
  if(browser)await browser.close();
  for(const child of children.reverse()){
    if(!child.pid)continue;
    try{if(process.platform!=='win32')process.kill(-child.pid,'SIGTERM');else child.kill('SIGTERM')}
    catch{try{child.kill('SIGTERM')}catch{}}
  }
  await sleep(600);
  rmSync(temp,{recursive:true,force:true});
}
