/**
 * Culture 45-slide presentation (offline) visual QA.
 * Protects real student data: authentication and external persistence are not used.
 * Chromium browser checks for 16:9 desktop, viewport-height mobile, active HD image,
 * slide counts, navigation, and keyboard interaction on Fresh/Future.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
 '.js':'text/javascript; charset=utf-8','.json':'application/json','.webp':'image/webp',
 '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{
  const rel=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\/+/, '') || 'index.html';
  const filename=path.resolve(root,rel);
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);return void res.end('Forbidden')}
  const body=await fs.readFile(filename);
  res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(body);
 }catch{res.writeHead(404);res.end('Not Found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const cases=[
 {name:'desktop',width:1440,height:900},
 {name:'small-laptop',width:1280,height:720},
 {name:'phone',width:390,height:844},
 {name:'landscape',width:667,height:375}
];
await fs.mkdir('artifacts/v3-culture-slides',{recursive:true});
let passed=0;
try{
 for(const size of cases)for(const theme of ['fresh','future']){
  const context=await browser.newContext({viewport:{width:size.width,height:size.height},deviceScaleFactor:1});
  try{
   await context.addInitScript(t=>{
    try{
     localStorage.setItem('MRLEE.THEME.V1',t);
     sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',t);
     document.documentElement.dataset.mrleeAuth='verified';
    }catch{}
   },theme);
   // Auth-only visual fixture: never request an authenticated Firebase session.
   await context.route('**/auth-guard.js',route=>route.fulfill({
    status:200,contentType:'text/javascript',
    body:"document.documentElement.dataset.mrleeAuth='verified';document.getElementById('mrlee-auth-hide')?.remove();"
   }));
   const page=await context.newPage();
   const label=size.name+'-'+theme;
   const topic=size.name==='small-laptop'?'tau-dien-ngam':'xe-buyt';
   await page.goto(origin+'/van-hoa-bai-hoc.html?chu-de='+topic+'&mode=slides',{waitUntil:'domcontentloaded',timeout:60000});
   const deck=page.locator('dialog.mcl-deck');
   await deck.waitFor({state:'visible',timeout:45000});
   assert.equal(await deck.getAttribute('open'),'','Deck must be native modal '+label);
   const progress=deck.locator('[data-progress]');
   assert.match((await progress.textContent())||'',/^1\/45\b/,'Wrong first-slide count '+label);
   await page.waitForFunction(()=>{
    const image=document.querySelector('dialog.mcl-deck .mcl-scene-layout img');
    return image && image.complete && image.naturalWidth>=600;
   },null,{timeout:30000});
   const dims=await deck.evaluate((d)=>{
    const rect=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
    const a=d.querySelector('.mcl-scene-layout img');
    const text=d.querySelector('.mcl-scene-layout>div:last-child');
    const main=d.querySelector('main');
    const buttons=[...d.querySelectorAll('.mcl-deck-bar button:not([hidden])')];
    return {dialog:rect(d),viewport:innerWidth,viewportHeight:innerHeight,
     image:rect(a),text:rect(text),main:rect(main),
     imageWidth:a.naturalWidth,loading:a.loading,priority:a.getAttribute('fetchpriority'),
     fit:getComputedStyle(a).objectFit,buttons:buttons.map(b=>({label:b.textContent,rect:rect(b)}))};
   });
   assert(dims.dialog.x>=-2 && dims.dialog.right<=size.width+2,label+' deck horizontal clipping '+JSON.stringify(dims));
   assert(dims.dialog.y>=-2 && dims.dialog.bottom<=size.height+2,label+' deck vertical clipping '+JSON.stringify(dims));
   if(size.width>720){
    const ratio=dims.dialog.width/dims.dialog.height;
    assert(Math.abs(ratio-16/9)<.07,label+' desktop deck not 16:9 '+ratio);
    assert(dims.image.right<=dims.text.x+15,label+' desktop image overlaps slide text');
   }else{
    assert(dims.text.y>=dims.image.bottom-8,label+' mobile image overlaps slide text');
   }
   assert(dims.buttons.every(b=>b.rect.height>=43),label+' navigation touch target too small');
   assert.equal(dims.loading,'eager',label+' foreground image not eager');
   assert.equal(dims.priority,'high',label+' foreground image not high priority');
   assert.equal(dims.fit,'contain',label+' foreground image distorted');
   await deck.screenshot({path:'artifacts/v3-culture-slides/'+label+'-first.png',animations:'disabled'});
   const forward=deck.locator('[data-next]'),back=deck.locator('[data-prev]');
   assert.equal(await back.isDisabled(),true,label+' first-slide previous enabled');
   await forward.click();
   assert.match((await progress.textContent())||'',/^2\/45\b/,label+' next failed');
   await page.keyboard.press('ArrowRight');
   assert.match((await progress.textContent())||'',/^3\/45\b/,label+' keyboard next failed');
   await page.keyboard.press('ArrowLeft');
   assert.match((await progress.textContent())||'',/^2\/45\b/,label+' keyboard previous failed');
   await back.click();
   assert.match((await progress.textContent())||'',/^1\/45\b/,label+' previous failed');

   // Deep-link last slide is evaluated on the same topic, independent of the first-slide case.
   await page.goto(origin+'/van-hoa-bai-hoc.html?chu-de='+topic+'&mode=slides&slide=45',{waitUntil:'domcontentloaded',timeout:60000});
   const finalDeck=page.locator('dialog.mcl-deck');
   await finalDeck.waitFor({state:'visible',timeout:45000});
   assert.match((await finalDeck.locator('[data-progress]').textContent())||'',/^45\/45\b/,label+' last slide not reached');
   assert.equal(await finalDeck.locator('[data-next]').isDisabled(),true,label+' next not disabled on last slide');
   await finalDeck.screenshot({path:'artifacts/v3-culture-slides/'+label+'-last.png',animations:'disabled'});
   await finalDeck.locator('[data-close]').click();
   assert.equal(await finalDeck.isVisible(),false,label+' close failed');
   console.log('CULTURE SLIDE PASS '+label+' '+JSON.stringify({aspect:(dims.dialog.width/dims.dialog.height).toFixed(3),photo:dims.imageWidth,viewport:size.width+'x'+size.height}));
   passed++;
  }finally{await context.close()}
 }
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
assert.equal(passed,cases.length*2);
console.log('V3 CULTURE SLIDE 45: '+passed+'/'+(cases.length*2)+' viewport-theme cases passed');
