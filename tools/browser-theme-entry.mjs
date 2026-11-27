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
   const own=selected==='fresh'?'index.html':'future.html';
   const alternate=selected==='fresh'?'future':'fresh';
   const other=alternate==='fresh'?'index.html':'future.html';
   await page.goto(origin+'/'+own,{waitUntil:'domcontentloaded',timeout:20000});
   const nav=page.locator('#mrleeNewHome .mr4-theme-row');
   await nav.waitFor({state:'visible'});
   if(await nav.locator('a').count()!==2||await nav.locator('a[aria-current="page"]').getAttribute('href')!==own)throw Error('Missing native home routes');
   if(await page.locator('#mrlee-theme-entry,.mrlee-theme-switch').count())throw Error('Duplicate legacy selector');
   for(const box of await nav.locator('a').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,right:r.right,height:r.height}})))
    if(box.x<0||box.right>viewport.width+1||box.height<44)throw Error('Clipped or small route target');
   const chosen=await page.evaluate(()=>({theme:document.documentElement.dataset.mrleeTheme,session:sessionStorage.getItem('MRLEE.THEME.ENTRY.V1'),saved:localStorage.getItem('MRLEE.THEME.V1')}));
   if(chosen.theme!==selected||chosen.session!==selected||chosen.saved!==selected)throw Error('URL theme not persisted');
   const photos=await page.locator('.mr27-tile img').evaluateAll(a=>a.map(i=>i.getAttribute('src')));
   await nav.locator('a[href="'+other+'"]').click();
   await page.waitForURL('**/'+other);
   if(await page.locator('html').getAttribute('data-mrlee-home-mode')!==alternate)throw Error('Switch did not navigate');
   const after=await page.locator('.mr27-tile img').evaluateAll(a=>a.map(i=>i.getAttribute('src')));
   if(JSON.stringify(photos)!==JSON.stringify(after))throw Error('Theme changed shared card images');
   await page.goBack();
   await page.reload({waitUntil:'domcontentloaded'});
   if(await page.locator('html').getAttribute('data-mrlee-theme')!==selected)throw Error('Reload/back lost route theme');
   await page.goto(origin+'/ban-do-han-quoc.html',{waitUntil:'domcontentloaded'});
   if(await page.locator('#mrlee-theme-entry,.mrlee-theme-switch').count())throw Error('Child legacy chooser');
   if(await page.evaluate(()=>document.documentElement.dataset.mrleeTheme)!==selected)throw Error('Child theme not retained');
   await page.goto(origin+'/'+own,{waitUntil:'domcontentloaded'});
   const newTab=await context.newPage();
   await newTab.goto(origin+'/'+other,{waitUntil:'domcontentloaded'});
   if(await newTab.locator('html').getAttribute('data-mrlee-theme')!==alternate)throw Error('Second tab route not independent');
   await page.reload({waitUntil:'domcontentloaded'});
   if(await page.locator('html').getAttribute('data-mrlee-theme')!==selected)throw Error('First tab changed');
   console.log('PASS MPA ENTRY '+label+' native links, sizing, back/reload, child and independent tabs');
   passed++;
   await newTab.close();
  }catch(e){failed++;console.error('FAIL ENTRY PICKER '+label+' '+e.stack)}
  finally{await context.close()}
 }
}finally{await browser.close();await new Promise(r=>server.close(r))}
console.log('MR LEE theme entrance: '+passed+' passed; '+failed+' failed.');
if(failed)process.exitCode=1;
