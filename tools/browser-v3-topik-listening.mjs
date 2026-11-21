/**
 * Browser QA for actual TOPIK listening page + shared audio enhancer.
 * Tests speed/filters/review accessibility using the real HTML, not MP3 playback quality.
 * A local-only HTTP server and stubbed .play() make the test deterministic and private.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
 '.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp',
 '.jpg':'image/jpeg','.woff2':'font/woff2','.mp3':'audio/mpeg'};
const server=http.createServer(async(req,res)=>{
 try{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/,'')||'index.html';
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}
  const data=await fs.readFile(file);
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
  res.end(data);
 }catch{res.writeHead(404);res.end('Not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const sizes=[['mobile',390,844],['desktop',1440,900]];
const themes=['fresh','future'];
let passed=0;
await fs.mkdir('artifacts/v3-topik-listening',{recursive:true});
try{
 for(const [size,width,height] of sizes)for(const theme of themes){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  try{
   await context.addInitScript(t=>{
    try{localStorage.setItem('MRLEE.THEME.V1',t);sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',t)}catch{}
    const fake=function(){this.dispatchEvent(new Event('play'));return Promise.resolve()};
    Object.defineProperty(HTMLMediaElement.prototype,'play',{configurable:true,value:fake});
   },theme);
   await context.route('**/*',route=>{
    const u=new URL(route.request().url());
    if(u.origin!==origin){route.abort();return}
    if(u.pathname.endsWith('/auth-guard.js')){
     route.fulfill({status:200,contentType:'text/javascript',
      body:"document.documentElement.dataset.mrleeAuth='verified';document.getElementById('mrlee-auth-hide')?.remove()"});
     return;
    }
    route.continue();
   });
   const page=await context.newPage();
   const label=size+'/'+theme;
   await page.goto(origin+'/topik-nghe-24-cau.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.MRLEE_AUDIO_PLUS&&document.querySelector('.tv-listen-card [data-speed][aria-pressed]'),null,{timeout:30000});
   const cards=page.locator('.tv-listen-card');
   assert.equal(await cards.count(),24,label+' total');
   assert.equal(await page.locator('.tv-listen-card[data-level="1"]').count(),12,label+' TOPIK I count');
   assert.equal(await page.locator('.tv-listen-card[data-level="2"]').count(),12,label+' TOPIK II count');
   assert.equal(await page.locator('.ml-audio-bar').count(),0,label+' duplicate shared audio controls present');
   const first=cards.first(),audio=first.locator('audio');
   assert.equal(await audio.evaluate(a=>Boolean(a.dataset.mlAudioUpgraded)),false,label+' shared enhancer should opt out');
   await first.locator('[data-speed="0.8"]').click();
   assert.equal(await audio.evaluate(a=>a.playbackRate),.8,label+' slow button was overridden');
   assert.equal(await first.locator('[data-speed="0.8"]').getAttribute('aria-pressed'),'true',label+' slow pressed status');
   await first.locator('[data-speed="1"]').click();
   assert.equal(await audio.evaluate(a=>a.playbackRate),1,label+' normal speed');
   assert.equal(await first.locator('[data-speed="0.8"]').getAttribute('aria-pressed'),'false');
   const toggle=first.locator('[data-transcript]'),transcript=first.locator('.tv-listen-transcript');
   assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   assert.equal(await transcript.isHidden(),true);
   await toggle.click();
   assert.equal(await transcript.isVisible(),true,label+' transcript shown');
   assert.equal(await toggle.getAttribute('aria-expanded'),'true');
   assert.equal(await toggle.getAttribute('aria-controls'),await transcript.getAttribute('id'));
   await toggle.click();
   assert.equal(await transcript.isHidden(),true,label+' transcript hidden');
   const done=first.locator('[data-reviewed]');
   await done.check();
   assert.equal(await page.locator('#tv-listen-progress').textContent(),'Đã ôn 1/24 câu',label+' progress count');
   const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('mrlee-v9-listening-reviewed')||'{}'));
   assert.equal(persisted['1-listening-1'],true,label+' reviewed state local only');
   await page.locator('[data-filter="2"]').click();
   assert.equal(await page.locator('.tv-listen-card:not([hidden])').count(),12,label+' TOPIK II filter');
   assert.equal(await page.locator('[data-filter="2"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('[data-filter="all"]').getAttribute('aria-pressed'),'false');
   await page.locator('[data-filter="all"]').click();
   assert.equal(await page.locator('.tv-listen-card:not([hidden])').count(),24,label+' all filter');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.MRLEE_AUDIO_PLUS&&document.querySelector('.tv-listen-card [data-speed][aria-pressed]'));
   assert.equal(await page.locator('.tv-listen-card').first().locator('[data-reviewed]').isChecked(),true,label+' progress reload');
   assert.equal(await page.locator('#tv-listen-progress').textContent(),'Đã ôn 1/24 câu');
   await page.locator('.tv-listen-card').first().locator('[data-reviewed]').uncheck();
   assert.equal(await page.locator('#tv-listen-progress').textContent(),'Đã ôn 0/24 câu');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
   assert.equal(overflow,false,label+' horizontal overflow');
   await page.screenshot({path:'artifacts/v3-topik-listening/'+size+'-'+theme+'.png',animations:'disabled'});
   console.log('TOPIK 24 MP3 UI PASS '+label+' 0.8x/1x, 24 cards, accessible transcript, filters, local progress');
   passed++;
  }finally{await context.close()}
 }
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
assert.equal(passed,4);
console.log('PASS TOPIK V3 listening: '+passed+'/4 browser scenarios');
