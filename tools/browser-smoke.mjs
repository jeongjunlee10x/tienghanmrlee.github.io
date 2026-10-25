/** MR LEE public browser smoke: Playwright Chromium only in QA environment.
 * No authentication, no submissions, no database writes.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
const root=process.cwd(),errors=[],notices=[],seen=new Set();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp3':'audio/mpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 try{
  const u=new URL(req.url,'http://localhost');
  const rel=decodeURIComponent(u.pathname).replace(/^\/+/,'')||'index.html';
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}
  fs.readFile(file,(err,body)=>{
   if(err){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not Found');return}
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  });
 }catch{res.writeHead(400);res.end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const cases=[
  {file:'index.html',check:async p=>{await p.locator('main').first().waitFor({timeout:10000});}},
  {file:'ai-tro-ly.html',check:async p=>{
    await p.locator('#aiQuery').fill('학교');
    await p.locator('#aiSubmit').click();
    await p.locator('#aiResults .ml-ai-result').first().waitFor({timeout:13000});
    const status=await p.locator('#aiStatus').textContent();
    if(!/kết quả phù hợp nhất/i.test(status||''))throw Error('Offline AI search did not return real results: '+status);
  }},
  {file:'ban-do-dai-hoc-han-quoc.html',check:async p=>{await p.locator('#universitySearch').first().waitFor({timeout:10000})}},
  {file:'dang-ky-tu-van.html',check:async p=>{await p.locator('form').first().waitFor({timeout:10000})}}
 ];
 for(const device of [{w:1440,h:900},{w:390,h:844}]){
  for(const theme of ['fresh','future']){
   const context=await browser.newContext({viewport:{width:device.w,height:device.h}});
   await context.addInitScript(t=>{try{localStorage.setItem('MRLEE.THEME.V1',t)}catch{}},theme);
   for(const test of cases){
    const page=await context.newPage();
    const label=device.w+'x'+device.h+' '+theme+' '+test.file;
    const pageErrors=[];
    page.on('pageerror',err=>pageErrors.push(err.message));
    try{
     const response=await page.goto('http://127.0.0.1:'+port+'/'+test.file,{waitUntil:'domcontentloaded',timeout:20000});
     if(!response?.ok())throw Error('HTTP status '+response?.status());
     await test.check(page);
     const title=await page.title();if(!title.trim())throw Error('Empty HTML title');
     if(pageErrors.length){notices.push(label+' pageerror: '+pageErrors.slice(0,3).join(' | '))}
     seen.add(label);
    }catch(err){errors.push(label+' — '+String(err.message||err).slice(0,260));}
    finally{await page.close()}
   }
   await context.close();
  }
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
console.log('BROWSER QA Chromium: '+seen.size+'/16 public page visits passed, Fresh/Future at desktop and phone.');
notices.slice(0,10).forEach(s=>console.warn('BROWSER NOTICE '+s));
errors.forEach(s=>console.error('BROWSER FAIL '+s));
if(errors.length)process.exitCode=1;
