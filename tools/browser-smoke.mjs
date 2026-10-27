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
  {file:'ban-do-dai-hoc-han-quoc.html',check:async p=>{
    const field=p.locator('#universitySearch').first();
    if(!await field.isVisible()){
      const cta=p.locator('.mrlee-v4-hero a[href="#universitySearch"]').first();
      if(await cta.count())await cta.click();
      else await p.locator('.mrlee-v5-open-detail').click();
    }
    await field.waitFor({state:'visible',timeout:10000});
    await field.fill('Seoul');
    if(await field.inputValue()!=='Seoul')throw Error('University search input did not accept typed text');
  }},
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
     if(test.file==='index.html') {
       await page.locator('.mrlee-smart-home-grid > a.mrlee-smart-home-card').first().waitFor({timeout:10000});
       const m=await page.evaluate(()=>{
        const rect=s=>{const el=document.querySelector(s);if(!el)return null;const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom,visible:getComputedStyle(el).display!=='none'}};
        return {header:rect('.site-header'),hero:rect('#mainContent>.hero'),hub:rect('.mrlee-smart-home-hub'),cards:[...document.querySelectorAll('.mrlee-smart-home-grid > a')].filter(e=>e.getBoundingClientRect().height>0).length,pair:rect('#mainContent>.mrlee-bottom-pair'),awards:rect('#mrleeScholarshipsHome'),dupe:rect('#mainContent>.feature-cards'),width:document.documentElement.scrollWidth,viewport:innerWidth};
       });
       console.log('HOME LAYOUT '+label+' '+JSON.stringify(m));
       if(m.cards!==8)throw Error('Expected 8 non-duplicated dashboard cards, got '+m.cards);
       if(!m.header || m.header.y < -2 || m.header.height < 45)throw Error('Header clipped or hidden');
       if(!m.hero || m.hero.height < 230 || m.hero.height > (device.w>760?380:750))throw Error('Hero cropped or oversized');
       if(!m.hub?.visible || !m.pair?.visible || m.pair.height < 90)throw Error('Homepage dashboard pair hidden');
       if(m.dupe?.visible)throw Error('Duplicated legacy feature row still visible');
       if(m.awards?.visible)throw Error('Oversized scholarship injection still visible');
       if(m.width > m.viewport + 4)throw Error('Horizontal overflow '+m.width+' > '+m.viewport);
       if(device.w>=1280 && m.pair.bottom>device.h+35)throw Error('Desktop first-fold content cut: bottom='+m.pair.bottom);
       fs.mkdirSync('artifacts/home-review',{recursive:true});
       await page.screenshot({path:'artifacts/home-review/'+device.w+'x'+device.h+'-'+theme+'.png',fullPage:true});
     }
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
