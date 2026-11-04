/* MR LEE - verify home brand title is visible alongside original meme image.
 * Uses real Chromium; does not touch auth, ranking, navigation, or media assets.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

fs.mkdirSync('artifacts/home-brand',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let count=0;
try{
 for(const [device,width,height] of [
  ['phone',390,844],['small',580,900],['tablet',768,1024],['desktop',1440,900]
 ])for(const theme of ['fresh','future']){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  try{
   await context.addInitScript(value=>{
    localStorage.setItem('MRLEE.THEME.V1',value);
    sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',value);
   },theme);
   const page=await context.newPage();
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.locator('.site-header .header-inner > a.brand .mrlee-header-brand-name')
    .waitFor({state:'visible',timeout:25000});
   await page.waitForFunction(()=>document.querySelector('.site-header .brand img')?.complete);
   await page.evaluate(()=>document.fonts.ready);
   const result=await page.evaluate(()=>{
    const header=document.querySelector('.site-header');
    const brand=header.querySelector('.header-inner > a.brand');
    const logo=brand.querySelector('img');
    const text=brand.querySelector('.mrlee-header-brand-name');
    const s=getComputedStyle(text),bs=getComputedStyle(brand);
    const b=brand.getBoundingClientRect(),l=logo.getBoundingClientRect(),
     t=text.getBoundingClientRect(),h=header.getBoundingClientRect();
    return {
     text:text.textContent.trim(),
     displayed:s.display,
     visibility:s.visibility,
     opacity:parseFloat(s.opacity),
     color:s.color,
     fontSize:parseFloat(s.fontSize),
     imageLoaded:logo.complete&&logo.naturalWidth>0,
     imageSrc:logo.currentSrc,
     brand:{x:b.x,right:b.right,width:b.width,bottom:b.bottom},
     logo:{x:l.x,right:l.right,bottom:l.bottom},
     title:{x:t.x,right:t.right,width:t.width,height:t.height,bottom:t.bottom},
     header:{x:h.x,right:h.right,bottom:h.bottom},
     bodyWidth:document.documentElement.scrollWidth,
     viewport:innerWidth,
     theme:document.documentElement.dataset.mrleeTheme,
     brandOverflow:bs.overflow,
     textOverflow:s.overflow
    };
   });
   assert.equal(result.text,'TIẾNG HÀN MR LEE','Missing brand title');
   assert.equal(result.theme,theme,'Incorrect theme');
   assert(result.displayed!=='none'&&result.visibility==='visible'&&result.opacity>.9,
    'Brand title is hidden '+JSON.stringify(result));
   assert(result.imageLoaded&&result.imageSrc.includes('logo-mrlee.png'),
    'Original meme image missing '+JSON.stringify(result));
   assert(result.fontSize>=12&&result.title.width>70&&result.title.height>=16,
    'Brand text too small or collapsed '+JSON.stringify(result));
   assert(result.title.x>=result.logo.right-2,
    'Text overlaps brand image '+JSON.stringify(result));
   assert(result.title.right<=result.viewport+2,
    'Header brand title is offscreen '+JSON.stringify(result));
   assert(result.title.bottom<=result.header.bottom+4,
    'Header clips brand title vertically '+JSON.stringify(result));
   assert(result.bodyWidth<=result.viewport+3,
    'Header causes horizontal scrolling '+JSON.stringify(result));
   if(theme==='future')assert(result.color.startsWith('rgb('),
    'Future theme text color invalid');
   await page.locator('.site-header .header-inner > a.brand').screenshot({
    path:`artifacts/home-brand/${device}-${theme}.png`,animations:'disabled'
   });
   console.log('HOME BRAND PASS '+device+' '+theme+' '+JSON.stringify({
    title:result.text,brandWidth:Math.round(result.brand.width),
    imageLoaded:result.imageLoaded,color:result.color
   }));
   count++;
  }finally{await context.close()}
 }
}finally{await browser.close()}
console.log('HOME BRAND VISUAL QA PASSED '+count+' cases');
