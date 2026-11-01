import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts',{recursive:true});
const url='http://127.0.0.1:8765/index.html';
for(const [mode,width,height] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844]]){
 for(const theme of ['fresh','future']){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await context.newPage();
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#mrlee-theme-entry button[data-theme="'+theme+'"]').waitFor({state:'visible',timeout:30000});
  await page.locator('#mrlee-theme-entry button[data-theme="'+theme+'"]').click();
  await page.locator('#mrleeSmartHub').waitFor({state:'visible',timeout:30000});
  await page.locator('#mrleeSmartHub img').evaluateAll(imgs=>imgs.forEach(img=>{img.loading='eager'}));
  await page.waitForFunction(()=>{const images=[...document.querySelectorAll('#mrleeSmartHub img')];return images.length===8&&images.every(i=>i.complete&&i.naturalWidth>0)},null,{timeout:45000});
  const data=await page.evaluate(()=>{
   const hub=document.querySelector('#mrleeSmartHub');
   const cards=[...hub.querySelectorAll('a.mrlee-smart-home-card')];
   const hero=document.querySelector('#mainContent>.hero');
   const photo=hero.querySelector('.mrlee-hero-photo-pane');
   const hidden=document.querySelector('#mainContent>.feature-cards');
   const r=hub.getBoundingClientRect(),h=hero.getBoundingClientRect();
   return {
    count:cards.length,
    destinations:cards.map(a=>a.getAttribute('href')),
    images:cards.map(a=>a.querySelector('img')?.naturalWidth||0),
    hubVisible:getComputedStyle(hub).display!=='none' && r.width>0,
    hubWidth:r.width,heroWidth:h.width,viewport:innerWidth,
    heroSrc:getComputedStyle(photo).backgroundImage,
    oldHidden:!hidden||getComputedStyle(hidden).display==='none',
    theme:document.documentElement.dataset.mrleeTheme,
    hasAuth:!!document.querySelector('#mrlee-auth2-dialog'),
    hasConsult:!!document.querySelector('#contactDialog')
   };
  });
  assert.equal(data.count,8,'eight cards '+mode+'/'+theme);
  assert.equal(new Set(data.destinations).size,8,'unique routes '+mode+'/'+theme);
  assert(data.hubVisible,'hub invisible '+mode+'/'+theme);
  assert(data.images.every(Boolean),'broken images '+mode+'/'+theme);
  assert(data.hubWidth<=data.viewport+1 && data.heroWidth<=data.viewport+1,
    'overflow '+mode+'/'+theme+' '+JSON.stringify(data));
  assert(data.heroSrc.includes('01-trang-chu-'+theme+'.webp'),
    'wrong theme-specific cover '+mode+'/'+theme+': '+data.heroSrc);
  assert(data.oldHidden,'duplicated home panels remain '+mode+'/'+theme);
  assert(data.hasAuth && data.hasConsult,'auth/consultation dialog missing');
  assert.equal(data.theme,theme);
  await page.locator('#mrleeSmartHub').screenshot({path:'artifacts/smart-ui-'+mode+'-'+theme+'.png'});
  await page.locator('#mrleeSmartToggle').click();
  await page.waitForFunction(()=>document.documentElement.dataset.mrleeSmartExpanded==='true');
  await page.locator('#mrleeSmartToggle').click();
  await page.waitForFunction(()=>document.documentElement.dataset.mrleeSmartExpanded==='false');
  await page.locator('#mrleeChangeTheme').click();
  await page.locator('#mrlee-theme-entry').waitFor({state:'visible',timeout:15000});
  console.log('PASS '+mode+'/'+theme+' routes, 8 images, hero, collapse/expand, chooser');
  await context.close();
 }
}
await browser.close();
