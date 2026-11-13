/**
 * D2-3 Integrated optical QA.
 * - Runs original production app Chrome QA separately (CI step)
 * - Uses a Vite development-only harness for gallery and mocked component
 *   rendering. No production credentials, authorization bypass or data writes.
 */
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const out=resolve('qa/d2-3-evidence');
await mkdir(out,{recursive:true});
const port=5197;
const host=`http://127.0.0.1:${port}/qa/d2-3-harness.html`;
const chrome=process.env.CHROME_PATH||['google-chrome','google-chrome-stable','chromium'].map(n=>{
  try{return execFileSync('which',[n],{encoding:'utf8'}).trim()}catch{return null}
}).find(Boolean);
if(!chrome)throw new Error('Chrome/Chromium required for D2-3');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const vite=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(port),'--strictPort'],{
  cwd:process.cwd(),stdio:'ignore',detached:process.platform!=='win32',shell:process.platform==='win32'
});
let browser;
const results=[];
const warnings=[];
function relativeLum(rgb){
  const lin=x=>{const v=x/255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4};
  return .2126*lin(rgb[0])+.7152*lin(rgb[1])+.0722*lin(rgb[2]);
}
function rgb(hex){
  return hex.match(/[\da-f]{2}/gi).map(x=>parseInt(x,16));
}
function contrast(a,b){
  const [hi,lo]=[relativeLum(rgb(a)),relativeLum(rgb(b))].sort((x,y)=>y-x);
  return +( (hi+.05)/(lo+.05) ).toFixed(2);
}
async function waitForServer(){
  for(let i=0;i<75;i++){
    try{const r=await fetch(host);if(r.ok)return;}catch{}
    await sleep(250);
  }
  throw new Error('QA-only Vite dev server did not start');
}
async function render(browser,view,width,height){
  const page=await browser.newPage();
  await page.setViewport({width,height,deviceScaleFactor:1});
  await page.setRequestInterception(true);
  page.on('request',req=>{
    const url=req.url();
    if(url.includes('/api/')||url.startsWith('https://')||url.startsWith('http://')&&!url.startsWith('http://127.0.0.1:')){
      req.abort('blockedbyclient').catch(()=>{});
    }else req.continue().catch(()=>{});
  });
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
  await page.goto(host+'?view='+view,{waitUntil:'domcontentloaded',timeout:35000});
  const expected=view==='gallery'?'#qa-optical-table':'#qa-authenticated-component';
  await page.waitForSelector(expected,{timeout:35000});
  await sleep(550);
  const state=await page.evaluate(()=>{
    const icons=[...document.querySelectorAll('svg[data-d1-glyph],svg[data-d2-glyph],svg[data-d22-glyph]')];
    const visible=icons.filter(el=>{
      const r=el.getBoundingClientRect(),s=getComputedStyle(el);
      return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';
    });
    const defs=[...document.querySelectorAll('svg [id]')].map(x=>x.id);
    const duplicates=defs.filter((id,i)=>defs.indexOf(id)!==i);
    return {
      allIcons:icons.length,visibleIcons:visible.length,uniqueGlyphs:[...new Set(visible.map(i=>i.getAttribute('data-d1-glyph')||i.getAttribute('data-d2-glyph')||i.getAttribute('data-d22-glyph')))],
      duplicates,documentWidth:document.documentElement.scrollWidth,
      visibleWidth:window.innerWidth,hasMockIdentity:Boolean(document.querySelector('#qa-authenticated-component'))
    };
  });
  results.push({view,width,...state,pageErrors});
  if(state.duplicates.length)throw new Error(`Duplicate SVG gradient IDs on ${view}: ${state.duplicates.join(',')}`);
  if(pageErrors.length)throw new Error(`Uncaught React errors in ${view}: ${JSON.stringify(pageErrors)}`);
  if(view==='gallery'){
    if(state.visibleIcons<150)throw new Error('Optical gallery has too few real rendered icon samples: '+state.visibleIcons);
    const sizes=await page.$$eval('[data-qa-row="crown"] svg',elements=>elements.map(e=>Math.round(e.getBoundingClientRect().width)));
    if(JSON.stringify(sizes)!==JSON.stringify([16,20,24,32,48,72]))throw new Error('Missing optical sizes: '+sizes.join(','));
  }else{
    const min=view==='admin'?4:6;
    if(state.visibleIcons<min)throw new Error(`${view} rendered only ${state.visibleIcons} icons; minimum ${min}`);
    if(state.documentWidth>width+3)warnings.push(`${view} at ${width}px overflows viewport (${state.documentWidth}px); review responsive layout`);
  }
  await page.screenshot({path:resolve(out,`${view}-${width}.png`),fullPage:view==='gallery'});
  await page.close();
}
try{
  await waitForServer();
  browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const [view,width,height] of [
    ['gallery',1024,900],
    ['mypage',360,844],['mypage',390,844],['mypage',430,844],
    ['admin',390,844],['admin',1280,900]
  ]) await render(browser,view,width,height);

  // Palette contrast sampling for solid icon strokes on solid grounds.
  const palette=[
    {label:'Boutique graphite on ivory',front:'#302D29',back:'#F8F6F2'},
    {label:'D2 boutique graphite on white',front:'#302D29',back:'#FFFFFF'},
    {label:'Atelier darkest champagne on black',front:'#AA8250',back:'#101215'},
    {label:'Atelier bright champagne on black',front:'#FFF1D2',back:'#101215'},
  ].map(v=>({...v,ratio:contrast(v.front,v.back)}));
  if(palette.some(x=>x.ratio<3))throw new Error('Reference icon color pair does not meet 3:1: '+JSON.stringify(palette));
  const json={status:'pass',date:'2026-11-13',results,palette,warnings,scope:{
    productionScreens:'Separate D2-2 Chrome production preview QA',
    protectedScreens:'Development-only mocked component rendering. NOT real user authentication or E2E access-control test',
    noProductionChanges:true,
    excluded:'Actual Android/iOS devices, backend E2E, screen-reader manual verification'
  }};
  await writeFile(resolve(out,'d2-3-results.json'),JSON.stringify(json,null,2));
  console.log('D23_INTEGRATED_QA_PASS',JSON.stringify({checks:results.length,palette,warnings}));
}catch(err){
  await writeFile(resolve(out,'d2-3-results.json'),JSON.stringify({status:'fail',error:String(err),results,warnings},null,2));
  throw err;
}finally{
  if(browser)await Promise.race([browser.close(),sleep(5000)]);
  if(vite.pid&&process.platform!=='win32'){try{process.kill(-vite.pid,'SIGTERM')}catch{vite.kill('SIGTERM')}}
  else vite.kill('SIGTERM');
}
