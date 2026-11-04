/* Phase 5 Playwright visual QA.
 * Offline visual fixture for protected pages is NOT authentication testing.
 * Run on GitHub Actions after a local HTTP server starts on port 8765.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts/phase5',{recursive:true});
const cases=[
 {file:'index.html',kind:'home',box:'#mrleeNewHome .mr27-hero',copy:'.mr27-hero-copy',media:'.mr27-hero-media',cards:'.mr27-tile',count:8},
 {file:'hoc-tieng-han.html',kind:'learning',box:'.mr27-subhero',copy:'.mr27-copy',media:'.mr27-subphoto',cards:'.mr27-item',count:6,protected:true},
 {file:'hoc-theo-bai.html',kind:'lessons',box:'#mrleeLessonDirectory',copy:'.mr-lesson-directory-head',cards:'#lessonGrid .mr-new-card',count:15,protected:true},
 {file:'kiem-tra-topik.html',kind:'topik',box:'.mr27-subhero',copy:'.mr27-copy',media:'.mr27-subphoto',cards:'.mr27-item',count:5},
 {file:'van-hoa-han-quoc.html',kind:'culture',box:'#topicSection',copy:'#topicSection .sectionHeading',cards:'#topics a.topic',count:22},
 {file:'ban-do-dai-hoc-han-quoc.html',kind:'map',box:'.mrlee27-map-intro',copy:'.mrlee-next-hero-copy',media:'.mrlee27-map-photo'},
 {file:'tuyen-sinh.html',kind:'admission',box:'.ts-hero-grid',copy:'.ts-hero-copy',media:'.ts-hero-visual'},
 {file:'mrlee-bai-tap-pro.html',kind:'workbook',box:'.mrlee27-workintro',copy:'.mr27-worktext',media:'.mrlee27-workintro > img',protected:true},
 {file:'admin.html',kind:'admin',box:'#authWrap'}
];
try{
 for(const test of cases){
  for(const theme of ['fresh','future']){
   for(const [size,width,height] of [['desktop',1440,900],['mobile',390,844]]){
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
    await context.addInitScript(value=>{
     try{
      localStorage.setItem('MRLEE.THEME.V1',value);
      sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',value);
     }catch{}
    },theme);
    if(test.protected){
     await context.route('**/auth-guard.js',route=>route.fulfill({
      status:200,contentType:'text/javascript',
      body:"document.documentElement.dataset.mrleeAuth='verified';document.addEventListener('DOMContentLoaded',()=>{document.querySelector('#mrlee-auth-hide')?.remove();if(document.body)document.body.style.visibility='visible';},{once:true});"
     }));
     if(test.kind==='learning')await context.route('**/firebase-config.js',route=>route.fulfill({
      status:200,contentType:'text/javascript',body:'/* visual fixture */'
     }));
    }
    const page=await context.newPage();
    try{
     await page.goto('http://127.0.0.1:8765/'+test.file,{waitUntil:'domcontentloaded',timeout:60000});
     await page.locator(test.box).waitFor({state:'visible',timeout:30000});
     if(test.kind==='lessons'){
      await page.waitForFunction(()=>document.querySelectorAll('#lessonGrid .mr-new-card').length===15,null,{timeout:30000});
      const first=await page.evaluate(()=>{
       const node=document.querySelector('#lessonGrid .mr-new-card');
       const nav=document.querySelector('.site-top');
       const cards=[...document.querySelectorAll('#lessonGrid .mr-new-card')];
       return {
        firstTop:node?.getBoundingClientRect().top,
        navBottom:nav?.getBoundingClientRect().bottom,
        rows:cards.map(c=>Math.round(c.getBoundingClientRect().y)),
        redundant:document.querySelectorAll('.mrlee-v2-primary-nav,.mrlee-v2-context,.mrlee-next-portal,.section-hero,.breadcrumbs').length,
        routes:cards.map(c=>c.getAttribute('href')),
        columns:getComputedStyle(document.querySelector('#lessonGrid')).gridTemplateColumns.split(' ').length,
        horizontalOverflow:document.documentElement.scrollWidth>innerWidth+3
       };
      });
      assert.equal(first.redundant,0,'Redundant marketing/nav panels still precede lesson list');
      assert(!first.horizontalOverflow,'Lesson directory overflows horizontally '+size);
      assert(first.firstTop-first.navBottom<(width>=1000?280:450),'Lesson list is not first on screen '+JSON.stringify(first));
      assert.equal(first.columns,width>=1160?5:2,'Unexpected '+size+' grid columns');
      assert.equal(new Set(first.routes).size,15,'Duplicate lesson routes');
      assert(first.routes.every((u,i)=>u==='hoc-theo-bai.html?cap=1&bai='+(i+1)),
       'Missing ordered native lesson routes '+JSON.stringify(first.routes));
     }
     if(test.kind==='culture'){
      await page.waitForFunction(()=>document.querySelectorAll('#topics a.topic').length===22,null,{timeout:30000});
      await page.locator('#topics a.topic img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
      await page.waitForFunction(()=>{
       const imgs=[...document.querySelectorAll('#topics a.topic img')];
       return imgs.length===22&&imgs.every(i=>i.complete&&i.naturalWidth>0);
      },null,{timeout:30000});
      const images=await page.locator('#topics a.topic img').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc||i.src,width:i.naturalWidth})));
      assert.equal(new Set(images.map(i=>i.src.split('?')[0])).size,22,'Culture 22 cover images must be distinct');
      assert(images.every(i=>i.width>=600),'Culture has a broken/low-resolution thumbnail');
      assert.equal(await page.locator('.v23-editorial, main.wrap > .hero, main.wrap > .stats').count(),0,'Culture redundant panels still visible');
     }
     if(['learning','topik'].includes(test.kind)){
      const visibleContent=await page.locator(test.box).evaluate(hero=>{
       const host=hero.getBoundingClientRect();
       const targets=[...hero.querySelectorAll('.mr27-copy h1,.mr27-copy p,.mr27-cta a')];
       return targets.map(el=>{const rect=el.getBoundingClientRect();return {
        label:el.textContent.trim().slice(0,60),
        fits:rect.top>=host.top-2&&rect.bottom<=host.bottom+2&&rect.right<=host.right+2,
        bottom:Math.round(rect.bottom),heroBottom:Math.round(host.bottom)
       }});
      });
      assert(visibleContent.length>0&&visibleContent.every(x=>x.fits),
       'Clipped learning/TOPIK hero text or CTA: '+test.file+' '+JSON.stringify(visibleContent));
     }
     if(test.cards){
      assert.equal(await page.locator(test.cards).count(),test.count,test.file+' navigation');
     }
     if(test.media){
      await page.locator(test.media+' img').evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager')).catch(()=>{});
      await page.waitForFunction(sel=>{
       const images=[...document.querySelectorAll(sel+' img')];
       return images.length===0||images.every(img=>img.complete&&img.naturalWidth>0);
      },test.media,{timeout:20000}).catch(()=>{});
     }
     const geometry=await page.evaluate((test)=>{
      const boxOf=selector=>{
       if(!selector)return null;
       const node=document.querySelector(selector);if(!node)return null;
       const box=node.getBoundingClientRect(),style=getComputedStyle(node);
       return {x:box.x,y:box.y,width:box.width,height:box.height,right:box.right,bottom:box.bottom,display:style.display,visibility:style.visibility};
      };
      const media=document.querySelector(test.media);
      const images=media?(media.tagName==='IMG'?[media]:[...media.querySelectorAll('img')]).filter(i=>getComputedStyle(i).display!=='none'):[];
      return {
       theme:document.documentElement.dataset.mrleeTheme,
       viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
       box:boxOf(test.box),copy:boxOf(test.copy),media:boxOf(test.media),
       imageTotal:images.length,loaded:images.filter(i=>i.naturalWidth>0).length,
       missing:images.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')),
       appHidden:document.querySelector('#app')?.classList.contains('hidden')??null
      };
     },test);
     assert(geometry.box&&geometry.box.width>0&&geometry.box.height>0,'Layout invisible '+test.file);
     assert(geometry.box.width<=geometry.viewport+2,'Layout horizontal overflow '+test.file+' '+JSON.stringify(geometry));
     if(test.kind==='admin'){
      assert(geometry.appHidden===true,'Admin private dashboard visible without login');
     }else if(test.kind==='culture'){
      assert(geometry.copy,'Missing compact culture title');
      assert(geometry.documentWidth<=geometry.viewport+2,'Culture horizontal overflow '+size);
     }else if(test.kind==='lessons'){
      assert(geometry.copy,'Lesson directory title/level selector missing');
      assert(geometry.documentWidth<=geometry.viewport+2,'Lesson grid overflow '+size);
     }else{
      assert(geometry.copy&&geometry.media,'Missing hero columns '+test.file);
      if(width>=900){
       assert(geometry.copy.right<=geometry.media.x+9,'Text overlaps photo '+test.file+' '+size);
      }else{
       assert(geometry.media.y>=geometry.copy.bottom-9,'Photo overlaps mobile text '+test.file+' '+size);
      }
      assert(!geometry.missing.length,'Broken hero image '+test.file+' '+geometry.missing.join(','));
     }
     await page.locator(test.box).screenshot({path:'artifacts/phase5/'+test.kind+'-'+size+'-'+theme+'.png',animations:'disabled'});
     console.log('VISUAL CHECK PASS '+test.kind+' '+size+' '+theme+' '+JSON.stringify({photo:geometry.loaded,container:Math.round(geometry.box.width),documentWidth:geometry.documentWidth}));
    }finally{await context.close()}
   }
  }
 }
}finally{await browser.close()}
