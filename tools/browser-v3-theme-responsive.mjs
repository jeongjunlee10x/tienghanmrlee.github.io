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
    const own=theme==='fresh'?'index.html':'future.html';
    const alternate=theme==='fresh'?'future':'fresh';
    const other=alternate==='fresh'?'index.html':'future.html';
    await context.addInitScript(opposite=>{try{localStorage.setItem('MRLEE.THEME.V1',opposite);sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',opposite)}catch{}},alternate);
    await page.goto(url.replace('index.html',own),{waitUntil:'domcontentloaded',timeout:30000});
    const nav=page.locator('#mrleeNewHome .mr4-theme-row');
    await nav.waitFor({state:'visible'});
    assert.equal(await nav.locator('a').count(),2,label+' native route options');
    assert.equal(await nav.locator('a[aria-current="page"]').getAttribute('href'),own);
    assert.equal(await page.locator('#mrlee-theme-entry').count(),0,label+' legacy popup');
    for(const box of await nav.locator('a').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return{x:b.x,right:b.right,height:b.height}})))
     assert(box.x>=-1&&box.right<=width+1&&box.height>=44,label+' route target/overflow');
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
    assert.equal(photo.inactive.length,0,label+' inactive image not loaded');
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
    if(width<900)assert(hero.media.y>=hero.copy.bottom-5,label+' mobile hero photo overlaps text');
    else assert(hero.copy.right<=hero.media.x+5,label+' tablet/desktop hero copy overlaps photo');
    await page.screenshot({path:'artifacts/v3-theme/'+size+'-'+theme+'-home.png',animations:'disabled'});

    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('#mrlee-theme-entry').count(),0,label+' chooser repeated on reload');
    const next=nav.locator('a[href="'+other+'"]');
    await next.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL('**/'+other);
    assert.equal(await page.locator('html').getAttribute('data-mrlee-home-mode'),alternate);
    assert.equal(await nav.locator('a[aria-current="page"]').getAttribute('href'),other);
    assert.equal(await page.locator('#mrlee-theme-entry').count(),0);
    await page.goBack();
    assert.equal(await page.locator('html').getAttribute('data-mrlee-home-mode'),theme);
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('html').getAttribute('data-mrlee-theme'),theme);
    console.log('PASS V4.1 MPA '+label+' URL lock/keyboard/back/reload/HD-priority');
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
