/* Visual-only test of redesigned pages, with auth module stubbed locally.
 * This does NOT test real sign-in, permissions or private data.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts',{recursive:true});
const routes=[
  ['hoc-tieng-han.html','learning',6],
  ['giao-tiep-phong-van.html','talk',4],
  ['kiem-tra-topik.html','topik',5],
  ['mrlee-bai-tap-pro.html','workbook',0],
  ['van-hoa-han-quoc.html','culture',22]
];
for(const [file,kind,count] of routes){
 for(const theme of ['fresh','future']){
  for(const [viewport,width,height] of [['desktop',1365,900],['mobile',390,844]]){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
   await context.addInitScript(choice=>{
    try{localStorage.setItem('MRLEE.THEME.V1',choice);
        sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',choice)}catch{}
   },theme);
   await context.route('**/auth-guard.js',route=>route.fulfill({
    status:200,contentType:'text/javascript',
    body:'document.documentElement.dataset.mrleeAuth="verified";'
   }));
   const page=await context.newPage();
   await page.goto('http://127.0.0.1:8765/'+file,{waitUntil:'domcontentloaded',timeout:60000});
   if(kind==='culture'){
    const visual=page.locator('.mr27-culture-visual');
    await visual.waitFor({state:'visible',timeout:20000});
    await page.waitForFunction(()=>document.querySelectorAll('#topics a.topic').length===22,null,{timeout:30000});
    const all=await page.locator('#topics a.topic').count();
    assert.equal(all,22,'Culture list lost topics');
    await page.locator('[data-filter="life"]').click();
    await page.waitForFunction(()=>document.querySelectorAll('#topics a.topic').length===10);
    await page.locator('[data-filter="culture"]').click();
    await page.waitForFunction(()=>document.querySelectorAll('#topics a.topic').length===12);
    await page.locator('[data-filter="all"]').click();
    await page.waitForFunction(()=>document.querySelectorAll('#topics a.topic').length===22);
    await page.locator('main.wrap > .hero').screenshot({path:'artifacts/subv2-'+kind+'-'+theme+'-'+viewport+'.png'});
   }else if(kind==='workbook'){
    const intro=page.locator('.mrlee27-workintro');
    await intro.waitFor({state:'visible',timeout:20000});
    assert(await page.locator('#workLevel').isVisible(),'Workbook level input');
    assert(await page.locator('#workLesson').count(),'Workbook lesson selector');
    assert(await page.locator('#workList').count(),'Workbook exercises list');
    assert(await page.locator('#workGame').count(),'Workbook exercise area');
    await intro.screenshot({path:'artifacts/subv2-'+kind+'-'+theme+'-'+viewport+'.png'});
   }else{
    const section=page.locator('.mrlee27-subhub');
    await section.waitFor({state:'visible',timeout:30000});
    await page.locator('.mrlee27-subhub img').evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager'));
    await page.waitForFunction(()=>{
      const imgs=[...document.querySelectorAll('.mrlee27-subhub img')];
      return imgs.length>0&&imgs.every(img=>img.complete&&img.naturalWidth>0);
    },null,{timeout:30000});
    const state=await page.evaluate(()=>{
      const section=document.querySelector('.mrlee27-subhub');
      const cards=[...section.querySelectorAll('.mr27-item')];
      const old=document.querySelector('main > .section-hero');
      return {
       theme:document.documentElement.dataset.mrleeTheme,
       cardCount:cards.length,
       photosLoaded:[...section.querySelectorAll('img')].every(img=>img.naturalWidth>0),
       cardLinks:[...new Set(cards.map(x=>x.getAttribute('href')))].length,
       contentWidth:section.getBoundingClientRect().width,
       viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
       oldHidden:!old||getComputedStyle(old).display==='none'
      };
    });
    assert.equal(state.cardCount,count,file+' cards');
    assert.equal(state.theme,theme,file+' theme');
    assert(state.photosLoaded,file+' broken photos');
    assert.equal(state.cardLinks,count,file+' duplicate routes');
    assert(state.oldHidden,file+' old section not hidden');
    assert(state.contentWidth<=state.viewport+2,file+' subpage width overflow '+JSON.stringify(state));
    await section.screenshot({path:'artifacts/subv2-'+kind+'-'+theme+'-'+viewport+'.png'});
    await page.locator('#mrlee27HubExpand').click();
    await page.waitForFunction(()=>document.documentElement.dataset.mrleeHubExpanded==='true');
    await page.locator('#mrlee27HubExpand').click();
    await page.waitForFunction(()=>document.documentElement.dataset.mrleeHubExpanded==='false');
   }
   console.log('PASS visual-only '+file+' '+theme+' '+viewport);
   await context.close();
  }
 }
}
await browser.close();
