/** MR LEE: real browser verification of one-time entry theme dialog.
 * Read-only localhost test. No Firebase sessions, no student data writes.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
 try{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/,'')||'index.html';
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}
  fs.readFile(file,(err,body)=>{
   if(err){res.writeHead(404);res.end('Not Found');return}
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  });
 }catch{res.writeHead(400);res.end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let passed=0,failed=0;
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}])
 for(const selected of ['fresh','future']){
  const context=await browser.newContext({viewport});
  const page=await context.newPage();
  const label=viewport.width+'px / '+selected;
  try{
   await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded',timeout:20000});
   const dialog=page.locator('dialog#mrlee-theme-entry');
   await dialog.waitFor({state:'visible',timeout:8000});
   if(!await page.evaluate(()=>document.getElementById('mrlee-theme-entry')?.matches(':modal')))
    throw Error('Initial chooser must be a blocking native modal');
   if(await page.locator('.mrlee-theme-switch').count())throw Error('Old header theme selector still present');
   const opts=dialog.locator('button[data-theme]');
   if(await opts.count()!==2)throw Error('Need exactly 2 choices, only in entry modal');
   const layout=await dialog.evaluate(el=>{
    const a=el.getBoundingClientRect();
    const buttons=[...el.querySelectorAll('button[data-theme]')].map(b=>{const r=b.getBoundingClientRect();return {x:r.x,right:r.right,y:r.y,bottom:r.bottom}});
    return {left:a.left,right:a.right,top:a.top,bottom:a.bottom,viewport:innerWidth,buttons,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight};
   });
   if(layout.left<0||layout.right>viewport.width+1||layout.buttons.some(b=>b.x<layout.left-1||b.right>layout.right+1))
    throw Error('Modal/card horizontally clipped on mobile: '+JSON.stringify(layout));
   const photo=await page.locator('.feature-card img,.mrlee-v4-card img').evaluateAll(a=>a.map(i=>i.getAttribute('src')));
   await dialog.locator('button[data-theme="'+selected+'"]').click();
   await dialog.waitFor({state:'detached',timeout:8000});
   const chosen=await page.evaluate(()=>({
    theme:document.documentElement.dataset.mrleeTheme,
    session:sessionStorage.getItem('MRLEE.THEME.ENTRY.V1'),
    saved:localStorage.getItem('MRLEE.THEME.V1')
   }));
   if(chosen.theme!==selected||chosen.session!==selected||chosen.saved!==selected)
    throw Error('Theme was not stored/activated: '+JSON.stringify(chosen));
   await page.reload({waitUntil:'domcontentloaded'});
   if(await page.locator('#mrlee-theme-entry').count())throw Error('Page reload showed chooser again');
   if(await page.locator('.mrlee-theme-switch').count())throw Error('Header switcher reappeared on reload');
   const after=await page.locator('.feature-card img,.mrlee-v4-card img').evaluateAll(a=>a.map(i=>i.getAttribute('src')));
   if(JSON.stringify(photo)!==JSON.stringify(after))throw Error('Theme picker changed course image sources');
   await page.goto(origin+'/ban-do-han-quoc.html',{waitUntil:'domcontentloaded'});
   if(await page.locator('.mrlee-theme-switch').count())throw Error('Child page still has theme buttons');
   if(await page.locator('#mrlee-theme-entry').count())throw Error('Child page asks again');
   if(await page.evaluate(()=>document.documentElement.dataset.mrleeTheme)!==selected)throw Error('Selection did not persist to child page');
   await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded'});
   if(await page.locator('#mrlee-theme-entry').count())throw Error('Returning home asks again in same tab');
   const newTab=await context.newPage();
   await newTab.goto(origin+'/index.html',{waitUntil:'domcontentloaded'});
   await newTab.locator('dialog#mrlee-theme-entry').waitFor({state:'visible',timeout:8000});
   const alternate=selected==='fresh'?'future':'fresh';
   await newTab.locator('button[data-theme="'+alternate+'"]').click();
   if(await newTab.evaluate(()=>document.documentElement.dataset.mrleeTheme)!==alternate)throw Error('New tab could not choose independently');
   await page.reload({waitUntil:'domcontentloaded'});
   if(await page.evaluate(()=>document.documentElement.dataset.mrleeTheme)!==selected)throw Error('First tab changed when second tab chose theme');
   if(await page.locator('#mrlee-theme-entry').count())throw Error('Original tab asked a second time');
   console.log('PASS ENTRY PICKER '+label+' dialog/keyboard-safe sizing, one choice, reload/navigation, new tab independent, same images');
   passed++;
   await newTab.close();
  }catch(e){failed++;console.error('FAIL ENTRY PICKER '+label+' '+e.stack)}
  finally{await context.close()}
 }
}finally{await browser.close();await new Promise(r=>server.close(r))}
console.log('MR LEE theme entrance: '+passed+' passed; '+failed+' failed.');
if(failed)process.exitCode=1;
