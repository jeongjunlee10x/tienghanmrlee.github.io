/**
 * MR LEE V3 — browser visual smoke across the active learning ecosystem.
 * Local fixture only: blocks external requests and any non-GET operations.
 * 13 representative pages × Fresh/Future × desktop/mobile = 52 cases.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png',
 '.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml',
 '.mp3':'audio/mpeg','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{
  const local=new URL(req.url,'http://localhost');
  if(req.method!=='GET'){res.writeHead(405);res.end('Read-only fixture');return}
  const relative=decodeURIComponent(local.pathname).replace(/^\/+/,'')||'index.html';
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}
  const data=await fs.readFile(file);
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream',
   'cache-control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const pages=[
 ['home','index.html','site'],['learning','hoc-tieng-han.html','site'],
 ['lessons','hoc-theo-bai.html','site'],['topik','kiem-tra-topik.html','site'],
 ['listening','topik-nghe-24-cau.html','site'],
 ['culture','van-hoa-han-quoc.html','site'],
 ['culture-lesson','van-hoa-bai-hoc.html','site'],
 ['admissions','tuyen-sinh.html','site'],
 ['university-map','ban-do-dai-hoc-han-quoc.html','site'],
 ['workbook','mrlee-bai-tap-pro.html','site'],
 ['student','trung-tam-hoc-vien.html','site'],
 ['admin','admin.html','admin'],['games','mrlee-game-arena.html','game']
];
const sizes=[['mobile',390,844],['desktop',1440,900]];
await fs.mkdir('artifacts/v3-ui',{recursive:true});
let count=0,overflowWarnings=[];
try{
 for(const [area,file,scope] of pages)for(const [size,width,height] of sizes)
 for(const theme of ['fresh','future']){
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  try{
   await ctx.addInitScript(selected=>{
    try{
     localStorage.setItem('MRLEE.THEME.V1',selected);
     sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',selected);
    }catch{}
   },theme);
   await ctx.route('**/*',route=>{
    const req=route.request();
    if(req.method()!=='GET'||!req.url().startsWith(origin+'/')){
     route.abort();return;
    }
    route.continue();
   });
   const page=await ctx.newPage();
   await page.goto(origin+'/'+file,{waitUntil:'domcontentloaded',timeout:40000});
   await page.waitForFunction(()=>{
    const link=document.querySelector('link[data-mrlee-v3-ui]');
    return !!(link?.sheet&&link.sheet.cssRules.length>60);
   },null,{timeout:30000});
   const result=await page.evaluate(()=>{
    const root=document.documentElement;
    const style=getComputedStyle(root);
    const link=document.querySelector('link[data-mrlee-v3-ui]');
    const setNames=['--v3-page','--v3-ink','--v3-line','--v3-ring'];
    const sample=root.dataset.mrleeV3Scope==='site'?
       document.querySelector('.mr-new-panel,.lessonBlock,.tv-listen-card,.mrlee-next-card,.tv-panel,.v10-card,.ts-panel'):
       root.dataset.mrleeV3Scope==='admin'?document.querySelector('#app .panel,#app .kpi'):
       document.querySelector('.arena-game-card,.arena-panel');
    const r=sample?.getBoundingClientRect();
    return {
     scope:root.dataset.mrleeV3Scope,
     theme:root.dataset.mrleeTheme,
     hasUI:root.dataset.mrleeV3Ui==='1',
     loaded:link?.sheet?.cssRules?.length||0,
     tokens:Object.fromEntries(setNames.map(x=>[x,style.getPropertyValue(x).trim()])),
     heading:document.querySelector('h1')?.textContent?.trim().slice(0,70)||'',
     viewport:innerWidth,scrollWidth:root.scrollWidth,bodyWidth:document.body.scrollWidth,
     sample:sample?{radius:getComputedStyle(sample).borderTopLeftRadius,
       visible:r.width>0&&r.height>0}:null,
     logoCount:document.querySelectorAll('img[src*="logo-mrlee"]').length
    }
   });
   const label=area+'/'+size+'/'+theme;
   assert.equal(result.scope,scope,label+' scope changed');
   assert.equal(result.theme,theme,label+' preference lost');
   assert.equal(result.hasUI,true,label+' data marker missing');
   assert(result.loaded>60,label+' CSS did not parse: '+result.loaded);
   assert(Object.values(result.tokens).every(v=>v.length>0),label+' missing design tokens '+JSON.stringify(result.tokens));
   assert(result.tokens['--v3-page']!==result.tokens['--v3-ink'],label+' foreground/background conflict');
   assert(result.viewport>=width-2&&result.viewport<=width+2,label+' unexpected viewport');
   if(result.scrollWidth>width+6){
     overflowWarnings.push({label,excess:result.scrollWidth-width});
   }
   if(result.sample?.visible){
    assert(result.sample.radius!=='0px',label+' representative card has no rounding');
   }
   // Render evidence for each page/theme on mobile, plus all desktop primary flows.
   if(size==='mobile'||['home','learning','topik','admissions','admin','games'].includes(area)){
    await page.screenshot({path:'artifacts/v3-ui/'+area+'-'+size+'-'+theme+'.png',
      animations:'disabled',timeout:30000});
   }
   count++;
   console.log('UI V3 PASS '+label+' css='+result.loaded+' tokens='+result.tokens['--v3-page']+
    ' overflow='+Math.max(0,result.scrollWidth-width)+'px');
  }finally{await ctx.close()}
 }
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
assert.equal(count,pages.length*sizes.length*2,'Incomplete V3 visual suite');
const summary={cases:count,overflowWarnings};
await fs.writeFile('artifacts/v3-ui/report.json',JSON.stringify(summary,null,2));
console.log('PASS MR LEE V3 browser: '+count+'/'+(pages.length*sizes.length*2)+' layouts; overflow candidates: '+overflowWarnings.length);
