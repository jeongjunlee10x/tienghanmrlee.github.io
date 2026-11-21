/**
 * MR LEE V3 phase 2: responsive and keyboard-accessible Fresh/Future chooser.
 * Offline Chromium test: no Firebase login, user account, database or writes.
 * npm install --no-save playwright@1.56.1 && npx playwright install chromium
 * node tools/browser-v3-theme-responsive.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
 '.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
 try{
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html';
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}
  const body=await fs.readFile(file);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(body);
 }catch{res.writeHead(404);res.end('Not Found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/index.html';
await fs.mkdir('artifacts/v3-theme',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const sizes=[
 ['compact',320,568],['phone',390,844],['landscape',667,375],
 ['tablet',768,1024],['desktop',1440,900]
];
let pass=0;
try{
 for(const [size,width,height] of sizes){
  for(const theme of ['fresh','future']){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
   try{
    const page=await context.newPage();
    const label=size+' '+theme;
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    const dialog=page.locator('#mrlee-theme-entry');
    await dialog.waitFor({state:'visible',timeout:10000});
    assert.equal(await page.evaluate(()=>document.getElementById('mrlee-theme-entry')?.matches(':modal')),true,label+' native modal');
    const buttons=dialog.locator('button[data-theme]');
    assert.equal(await buttons.count(),2,label+' options');
    for(const index of [0,1])assert.equal(await buttons.nth(index).getAttribute('aria-pressed'),null,label+' no preselected option');
    const rect=await dialog.evaluate(el=>{
      const dialogBox=el.getBoundingClientRect();
      const optionBoxes=[...el.querySelectorAll('button[data-theme]')].map(node=>{
       const b=node.getBoundingClientRect();return{x:b.x,right:b.right,height:b.height};
      });
      return{dialogBox:{x:dialogBox.x,y:dialogBox.y,right:dialogBox.right,bottom:dialogBox.bottom},
       width:innerWidth,height:innerHeight,optionBoxes,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight};
    });
    assert(rect.dialogBox.x>=-1&&rect.dialogBox.right<=width+1,label+' horizontal modal overflow '+JSON.stringify(rect));
    assert(rect.dialogBox.y>=-1&&rect.dialogBox.bottom<=height+1,label+' vertical modal overflow '+JSON.stringify(rect));
    assert(rect.optionBoxes.every(b=>b.x>=rect.dialogBox.x-2&&b.right<=rect.dialogBox.right+2&&b.height>=44),
      label+' clipped option/touch target '+JSON.stringify(rect));
    await buttons.first().focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(()=>document.activeElement?.dataset.theme),'future',label+' ArrowRight');
    await page.keyboard.press('Home');
    assert.equal(await page.evaluate(()=>document.activeElement?.dataset.theme),'fresh',label+' Home');
    await page.keyboard.press('End');
    assert.equal(await page.evaluate(()=>document.activeElement?.dataset.theme),'future',label+' End');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.evaluate(()=>document.activeElement?.dataset.theme),'fresh',label+' ArrowLeft');
    await buttons.nth(theme==='fresh'?0:1).focus();
    await page.keyboard.press('Enter');
    await dialog.waitFor({state:'detached',timeout:10000});
    const photo=await page.evaluate(()=>{
     const imgs=[...document.querySelectorAll('#mrleeNewHome .mr27-hero-media img')];
     return {theme:document.documentElement.dataset.mrleeTheme,
      current:imgs.filter(i=>getComputedStyle(i).display!=='none').map(i=>({
       src:i.getAttribute('src'),loading:i.loading,priority:i.getAttribute('fetchpriority'),decoding:i.decoding
      })),
      inactive:imgs.filter(i=>getComputedStyle(i).display==='none').map(i=>({
       src:i.getAttribute('src'),loading:i.loading,priority:i.getAttribute('fetchpriority')
      }))};
    });
    assert.equal(photo.theme,theme,label+' selection persisted');
    assert.equal(photo.current.length,1,label+' one active image '+JSON.stringify(photo));
    assert(photo.current[0].src.includes('01-trang-chu-'+theme+'.webp'),label+' theme-specific photo');
    assert.equal(photo.current[0].loading,'eager',label+' active photo eager');
    assert.equal(photo.current[0].priority,'high',label+' active photo high priority');
    assert.equal(photo.inactive.length,1,label+' inactive artwork preserved');
    assert.equal(photo.inactive[0].loading,'lazy',label+' inactive photo lazy');
    assert.equal(photo.inactive[0].priority,'low',label+' inactive photo low priority');
    await page.waitForFunction(name=>{
      const img=document.querySelector('#mrleeNewHome .mr27-art-'+name);
      return Boolean(img&&img.complete&&img.naturalWidth>=800);
    },theme,{timeout:15000});
    const hero=await page.evaluate(()=>{
      const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
      return {viewport:innerWidth,hero:box('#mrleeNewHome .mr27-hero'),
       copy:box('#mrleeNewHome .mr27-hero-copy'),media:box('#mrleeNewHome .mr27-hero-media')};
    });
    assert(hero.hero.x>=-2&&hero.hero.right<=width+2,label+' hero extends beyond viewport '+JSON.stringify(hero));
    if(width<=650)assert(hero.media.y>=hero.copy.bottom-5,label+' mobile hero photo overlaps text');
    else assert(hero.copy.right<=hero.media.x+5,label+' tablet/desktop hero copy overlaps photo');
    await page.screenshot({path:'artifacts/v3-theme/'+size+'-'+theme+'-home.png',animations:'disabled'});

    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('#mrlee-theme-entry').count(),0,label+' chooser repeated on reload');
    await page.goto(url+'?select-theme=1',{waitUntil:'domcontentloaded'});
    await dialog.waitFor({state:'visible',timeout:10000});
    const selected=dialog.locator('button[data-theme="'+theme+'"]');
    assert.equal(await selected.getAttribute('aria-pressed'),'true',label+' current choice not indicated');
    assert.equal(await dialog.locator('button[data-theme="'+(theme==='fresh'?'future':'fresh')+'"]').getAttribute('aria-pressed'),'false');
    assert.equal(await page.evaluate(()=>document.activeElement?.dataset.theme),theme,label+' current option not focused');
    await dialog.screenshot({path:'artifacts/v3-theme/'+size+'-'+theme+'-chooser.png',animations:'disabled'});
    const marker=await selected.locator('.mrlee-entry-option-copy').evaluate(el=>getComputedStyle(el,'::after').content);
    assert(marker.includes('Đang sử dụng'),label+' current-choice indicator missing');
    await page.keyboard.press(theme==='fresh'?'ArrowRight':'ArrowLeft');
    const alternate=theme==='fresh'?'future':'fresh';
    assert.equal(await page.evaluate(()=>document.activeElement?.dataset.theme),alternate,label+' switch focus');
    await page.keyboard.press('Enter');
    await dialog.waitFor({state:'detached'});
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.mrleeTheme),alternate,label+' explicit reselect');
    assert.equal(new URL(page.url()).searchParams.has('select-theme'),false,label+' reopen URL not cleaned');
    assert.equal(await page.locator('.mrlee-theme-switch').count(),0,label+' duplicate header buttons');
    console.log('PASS V3 THEME '+label+' modal/viewport/keyboard/current-choice/HD-priority');
    pass++;
   }finally{await context.close()}
  }
 }
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
console.log('MR LEE V3 responsive themes: '+pass+'/'+(sizes.length*2)+' passed');
assert.equal(pass,sizes.length*2);
