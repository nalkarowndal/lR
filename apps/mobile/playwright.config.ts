import {defineConfig} from '@playwright/test';
const ci=!!process.env.CI;
export default defineConfig({
 testDir:'./e2e',
 timeout:60_000,
 expect:{timeout:20_000},
 fullyParallel:false,
 forbidOnly:ci,
 retries:ci?1:0,
 workers:1,
 reporter:ci?[['list'],['html',{outputFolder:'playwright-report',open:'never'}]]:[['list']],
 outputDir:'test-results',
 use:{
  baseURL:'http://127.0.0.1:8081',
  browserName:'chromium',
  screenshot:'only-on-failure',
  trace:'on-first-retry',
  actionTimeout:15_000,
  navigationTimeout:30_000,
 },
 projects:[
  {name:'phone-360',use:{viewport:{width:360,height:780},isMobile:true,hasTouch:true,deviceScaleFactor:1}},
  {name:'phone-390',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}},
  {name:'tablet-768',use:{viewport:{width:768,height:1024},isMobile:true,hasTouch:true,deviceScaleFactor:1}}
 ],
 webServer:{
  command:'npm run web -- --port 8081',
  url:'http://127.0.0.1:8081',
  timeout:180_000,
  reuseExistingServer:!ci,
  env:{CI:'1',EXPO_NO_TELEMETRY:'1'}
 }
});
