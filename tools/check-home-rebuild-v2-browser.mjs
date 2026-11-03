import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const pageUrl='http://127.0.0.1:8765/index.html';
for(const [mode,width,height] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844]]){
 for(const theme of ['fresh','future']){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  await context.addInitScript(themeName=>{
    localStorage.setItem('MRLEE.THEME.V1',themeName);
    sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',themeName);
  },theme);
  const page=await context.newPage();
  await page.goto(pageUrl,{waitUntil:'domcontentloaded',timeout:50000});
  await page.locator('#mrleeNewHome').waitFor({state:'visible',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.mrleeTheme==='fresh'||document.documentElement.dataset.mrleeTheme==='future',null,{timeout:15000});
  await page.locator('#mrleeNewHome .mr27-tile img').evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager'));
  await page.waitForFunction(()=>{
    const imgs=[...document.querySelectorAll('#mrleeNewHome .mr27-tile img')];
    return imgs.length===8&&imgs.every(img=>img.complete&&img.naturalWidth>0);
  },null,{timeout:30000});
  const result=await page.evaluate(()=>{
    const root=document.documentElement,home=document.querySelector('#mrleeNewHome');
    const nodes=[...home.querySelectorAll('.mr27-tile')];
    const v=home.getBoundingClientRect();
    const photo=[...home.querySelectorAll('.mr27-hero-media img')].filter(img=>getComputedStyle(img).display!=='none');
    const original=document.querySelector('#mainContent>.hero');
    const heading=home.querySelector('h1');
    return{
      theme:root.dataset.mrleeTheme,
      cards:nodes.length,
      hrefs:nodes.map(n=>n.getAttribute('href')),
      cardImages:home.querySelectorAll('.mr27-tile img').length,
      imagesComplete:[...home.querySelectorAll('.mr27-tile img')].every(img=>img.naturalWidth>0),
      heroPhotos:photo.map(img=>img.getAttribute('src')),
      oldHeroHidden:!original||getComputedStyle(original).display==='none',
      width:v.width,windowWidth:innerWidth,docWidth:document.documentElement.scrollWidth,
      oneVisibleH1:getComputedStyle(heading).display!=='none',
      buttons:[!!document.querySelector('#mrlee27ThemeChange'),!!document.querySelector('#mrlee27Expand')],
      allTextNoBars:[...nodes].every(n=>{
        const t=n.querySelector('.mr27-tile-copy strong');const st=getComputedStyle(t);
        return st.backgroundColor==='rgba(0, 0, 0, 0)'||st.backgroundColor==='transparent';
      }),
      orderedRoutes:nodes.map(n=>n.dataset.key),
      cardRects:nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}),
      heroCTAClipped:[...home.querySelectorAll('.mr27-hero-copy :is(h1,p,.mr27-actions a)')]
       .some(el=>el.getBoundingClientRect().bottom>home.querySelector('.mr27-hero').getBoundingClientRect().bottom+2),
      heroToGridGap:Math.round(home.querySelector('.mr27-section-title').getBoundingClientRect().top-home.querySelector('.mr27-hero').getBoundingClientRect().bottom),
      duplicateStatsAbsent:!home.querySelector('.mr27-stats'),
      brandGlow:getComputedStyle(document.querySelector('.site-header .brand img')).filter
    };
  });
  assert.equal(result.theme,theme,mode+' theme');
  assert.equal(result.cards,8,mode+' count');
  assert.equal(new Set(result.hrefs).size,8,mode+' unique targets');
  assert(result.imagesComplete,mode+' images');
  assert(result.heroPhotos.length===1,mode+' hero only one visible');
  assert(result.heroPhotos[0].includes(theme==='future'?'01-trang-chu-future.webp':'01-trang-chu-fresh.webp'),mode+' artwork');
  assert(result.oldHeroHidden,mode+' legacy hero remained');
  assert(result.width<=result.windowWidth+1,mode+' home overflows viewport');
  assert(result.docWidth<=result.windowWidth+2,mode+' horizontal page overflow');
  assert(result.oneVisibleH1 && result.allTextNoBars,mode+' headings');
  assert(result.buttons.every(Boolean),mode+' buttons');
  assert.deepEqual(result.orderedRoutes,['learn','talk','topik','workbook','interview','map','culture','profile'],mode+' route order');
  assert(!result.heroCTAClipped,mode+' hero text or CTA clipped');
  assert(result.duplicateStatsAbsent,mode+' duplicate statistic strip should be removed');
  assert(result.heroToGridGap>=-2&&result.heroToGridGap<=64,mode+' excessive hero-to-actions gap '+result.heroToGridGap);
  assert(result.brandGlow&&result.brandGlow!=='none',mode+' original logo outline not applied');
  const cardsPerRow=mode==='desktop'?4:2;
  assert(result.cardRects.slice(0,cardsPerRow).every(r=>Math.abs(r.y-result.cardRects[0].y)<3),
    mode+' primary navigation cards not aligned in a row: '+JSON.stringify(result.cardRects));
  await page.locator('#mrleeNewHome').screenshot({path:'artifacts/mrlee-home-v2-'+mode+'-'+theme+'.png',animations:'disabled'});
  await page.locator('#mrlee27Expand').click();
  await page.waitForFunction(()=>document.documentElement.dataset.mrleeSmartExpanded==='true');
  await page.locator('#mrlee27Expand').click();
  await page.waitForFunction(()=>document.documentElement.dataset.mrleeSmartExpanded==='false');
  console.log('PASS MR LEE V2 '+mode+' '+theme+' '+JSON.stringify({width:result.width,photos:result.heroPhotos,cards:result.cards}));
  await context.close();
 }
}
await browser.close();