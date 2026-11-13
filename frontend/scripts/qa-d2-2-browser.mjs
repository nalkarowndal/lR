/**
 * D2-2 live Chrome visual QA for accessible guest routes.
 * Authenticated MyPage and Admin are covered by TypeScript + static regression;
 * they are not impersonated or counted as browser-tested here.
 */
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const port = 5192;
const base = `http://127.0.0.1:${port}/?splash=false`;
const outDir = resolve('qa/d2-2-screens');
await mkdir(outDir, { recursive: true });
const chrome = process.env.CHROME_PATH || ['google-chrome', 'google-chrome-stable', 'chromium'].map(n=>{
  try {return execFileSync('which',[n],{encoding:'utf8'}).trim()}catch{return null}
}).find(Boolean);
if(!chrome) throw new Error('Chrome not installed for screenshot QA');

const vite=spawn('npm',['run','preview','--','--host','127.0.0.1','--port',String(port),'--strictPort'],{
  cwd:process.cwd(),stdio:'ignore',detached:process.platform!=='win32',shell:process.platform==='win32'
});
let browser;
const report=[];
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
const find = (page,selector) => page.waitForSelector(selector,{timeout:10000});
async function ensurePreview(){
  for(let n=0;n<70;n++){
    try { const r=await fetch(base); if(r.ok)return; }catch{}
    await sleep(300);
  }
  throw new Error('Vite preview unavailable');
}
async function capture(page,width,name,minimumIcons){
  await sleep(450);
  const state=await page.evaluate(()=>{
    const icons=[...document.querySelectorAll('svg[data-d22-glyph]')].filter(e=>{
      const rect=e.getBoundingClientRect(),s=getComputedStyle(e);
      return rect.width>=12&&rect.height>=12&&s.visibility!=='hidden'&&s.display!=='none';
    }).map(e=>({glyph:e.getAttribute('data-d22-glyph'),size:Math.round(e.getBoundingClientRect().width)}));
    return {icons,documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth};
  });
  report.push({width,name,...state});
  if(state.icons.length<minimumIcons)throw new Error(`${name} icon count ${state.icons.length} < ${minimumIcons}`);
  if(state.documentWidth>state.viewportWidth+2)throw new Error(`${name} horizontal overflow: ${state.documentWidth} > ${state.viewportWidth}`);
  await page.screenshot({path:resolve(outDir,`${name}-${width}.png`)});
  return state;
}
async function backToHome(page) {
  const back=await find(page,'button[aria-label="메인 화면으로 뒤로가기"]');
  await back.click();
  await find(page,'nav[aria-label="하단 네비게이션"]');
  await sleep(420);
}
try{
  await ensurePreview();
  browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const width of [360,390,430]){
    const page=await browser.newPage();
    await page.setViewport({width,height:844,deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',err=>errors.push(err.message||String(err)));
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await find(page,'nav[aria-label="하단 네비게이션"]');
    await sleep(850);
    const navCount=await page.$$eval('nav[aria-label="하단 네비게이션"] button',els=>els.length);
    if(navCount!==5)throw new Error('Bottom navigation changed: '+navCount);

    // Category (real photos remain, new navigational symbols visible).
    await page.$eval('nav[aria-label="하단 네비게이션"] button',el=>el.click());
    await find(page,'svg[data-d22-glyph="chat-bubble"]');
    await capture(page,width,'category',3);
    await backToHome(page);

    // Search overlay (use actual header search button).
    await page.click('button[aria-label="상품 검색 열기"]');
    await find(page,'[aria-label="통합 검색"] svg[data-d22-glyph="search"]');
    await capture(page,width,'search',2);
    await page.click('button[aria-label="검색창 닫기"]');
    await sleep(450);

    // Sell brand selection.
    await page.$eval('nav[aria-label="하단 네비게이션"]',nav=>nav.querySelectorAll('button')[1]?.click());
    await find(page,'svg[data-d22-glyph="search"]');
    await capture(page,width,'sell',2);
    await backToHome(page);

    // Settings is reachable through existing header for guest session.
    await page.click('button[aria-label="설정 센터로 이동"]');
    await find(page,'svg[data-d22-glyph="arrow-left"]');
    await capture(page,width,'settings',3);
    if(errors.length)throw new Error(`Chrome page errors on ${width}: ${JSON.stringify(errors)}`);
    await page.close();
  }
  await writeFile(resolve(outDir,'d2-2-browser-qa.json'),JSON.stringify({status:'pass',report,limits:['guest routes only','no admin impersonation']},null,2));
  console.log('D22_BROWSER_QA_PASS',JSON.stringify(report));
}catch(error){
  await writeFile(resolve(outDir,'d2-2-browser-qa.json'),JSON.stringify({status:'fail',error:String(error),report},null,2));
  throw error;
}finally{
  if(browser)await Promise.race([browser.close(),sleep(6000)]);
  if(vite.pid&&process.platform!=='win32'){try{process.kill(-vite.pid,'SIGTERM')}catch{vite.kill('SIGTERM')}}
  else vite.kill('SIGTERM');
}
