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
  for(const [viewport,width,height] of [['desktop',1440,900],['tablet',768,1000],['mobile',390,844],['narrow',320,720]]){
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
   await page.evaluate(()=>document.fonts.ready); // measure after Korean/Vietnamese web fonts settle
   if(kind==='culture'){
    const visual=page.locator('#topicSection .sectionHeading');
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
    assert.equal(await page.locator('.v23-editorial, main.wrap > .hero, main.wrap > .stats').count(),0,'Culture should not include redundant top panels');
    await page.locator('#topicSection').screenshot({path:'artifacts/subv2-'+kind+'-'+theme+'-'+viewport+'.png'});
   }else if(kind==='workbook'){
    const intro=page.locator('.mrlee27-workintro');
    await intro.waitFor({state:'visible',timeout:20000});
    const fit=await intro.evaluate(node=>{
      const copy=node.querySelector('.mr27-worktext');
      const desc=copy?.querySelector('p');
      if(!copy||!desc)return {ok:false,reason:'missing text'};
      const outer=node.getBoundingClientRect(),inner=desc.getBoundingClientRect();
      return {ok:inner.bottom<=outer.bottom+1 && inner.right<=outer.right+1,
        outerBottom:outer.bottom, textBottom:inner.bottom, containerHeight:outer.height};
    });
    assert(fit.ok,'Workbook introduction clips description '+JSON.stringify(fit));
    const headerHeight=await page.locator('.pro-header').evaluate(node=>node.getBoundingClientRect().height);
    assert(headerHeight<260,'Workbook first header wastes vertical space '+viewport+' '+headerHeight);

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
    // A banner passes only when every visible text fragment and CTA fits.
    // The photo must fill its cell but not define a taller grid row.
    const hero=await page.locator('.mr27-subhero').evaluate(node=>{
     const outer=node.getBoundingClientRect();
     const copy=node.querySelector('.mr27-copy');
     const photo=node.querySelector('.mr27-subphoto');
     const copyBox=copy.getBoundingClientRect();
     const photoBox=photo.getBoundingClientRect();
     const items=[...copy.querySelectorAll('.mr27-eyebrow,h1,p,.mr27-cta a')].map(el=>{
      const box=el.getBoundingClientRect();
      return {name:el.textContent.trim().slice(0,35),
       fits:box.left>=outer.left-2&&box.right<=outer.right+2&&
        box.top>=outer.top-2&&box.bottom<=outer.bottom+2,
       y:Math.round(box.y),bottom:Math.round(box.bottom)};
     });
     return {height:Math.round(outer.height),width:Math.round(outer.width),
      topGap:Math.round(items[0]?.y-outer.y),items,
      copyFits:copyBox.bottom<=outer.bottom+2,
      photoFits:photoBox.bottom<=outer.bottom+2,
      photoPosition:getComputedStyle(photo.querySelector('img')).position,
      heroOverflow:getComputedStyle(node).overflow};
    });
    assert(hero.items.length>0&&hero.items.every(x=>x.fits),
      file+' clipped heading, description or action '+viewport+' '+theme+' '+JSON.stringify(hero));
    assert(hero.copyFits&&hero.photoFits,
      file+' grid child escapes hero '+viewport+' '+theme+' '+JSON.stringify(hero));
    assert.equal(hero.photoPosition,'absolute',file+' photo participates in grid sizing');
    if(width>=960){
     assert(hero.topGap<85,file+' excessive empty space above headline '+JSON.stringify(hero));
     assert(hero.height<440,file+' unnecessarily tall desktop banner '+JSON.stringify(hero));
    }
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
