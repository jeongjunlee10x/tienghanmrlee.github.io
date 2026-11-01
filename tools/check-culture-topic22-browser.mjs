import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts',{recursive:true});
for (const [mode,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
 // Visual fixture ONLY. Production auth-guard.js is not changed.
 // Topic pages intentionally redirect unauthenticated students to sign-in.
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
 await context.route('**/auth-guard.js',route=>route.fulfill({
  status:200,contentType:'text/javascript',
  body:"document.documentElement.dataset.mrleeAuth='verified';document.getElementById('mrlee-auth-hide')?.remove();"
 }));
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:8765/van-hoa-bai-hoc.html?chu-de=an-toan-giao-thong',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('#cultureImagesV19Topic22 .mrleeCultureFigure',{state:'visible',timeout:25000});
 await page.evaluate(()=>document.querySelectorAll('#cultureImagesV19Topic22 img').forEach(img=>{img.loading='eager'}));
 await page.waitForFunction(()=>{const images=[...document.querySelectorAll('#cultureImagesV19Topic22 img')];return images.length===5&&images.every(i=>i.complete&&i.naturalWidth>=1536&&i.naturalHeight>=1024)},null,{timeout:30000});
 const x=await page.evaluate(()=>{
   const gallery=document.querySelector('#cultureImagesV19Topic22');
   const images=[...gallery.querySelectorAll('img')];
   const rect=gallery.getBoundingClientRect();
   return {
     count:images.length,
     visible:getComputedStyle(gallery).display!=='none'&&rect.width>0,
     width:rect.width,
     windowWidth:innerWidth,
     sourceOk:images.every(im=>im.currentSrc.includes('/images/culture-v44-photo/an-toan-giao-thong/')&&im.naturalWidth===1536&&im.naturalHeight===1024),
     figures:gallery.querySelectorAll('figure').length,
     emptyCaptions:gallery.querySelectorAll('figcaption:not(:has(.trafficKorean)):not(:has(.trafficCredit))').length,
   };
 });
 assert.equal(x.count,5,mode+' count');
 assert(x.visible,mode+' gallery visible');
 assert.equal(x.figures,5,mode+' figures');
 assert(x.sourceOk,mode+' v44 source and dimensions');
 assert(x.width<=x.windowWidth+1,mode+' gallery width overflow '+JSON.stringify(x));
 await page.locator('#cultureImagesV19Topic22').screenshot({path:'artifacts/topic22-'+mode+'.png'});
 console.log('PASS Topic22 Chrome '+mode,JSON.stringify(x));
 await context.close();
}
await browser.close();
