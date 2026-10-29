import fs from 'node:fs';import http from 'node:http';import path from 'node:path';
import {chromium} from 'playwright';
const root=process.cwd(),failures=[];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let rel;try{rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html'}catch(_){res.writeHead(400);res.end();return}
 const f=path.resolve(root,rel);if(!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(f,(e,data)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});res.end(data)});
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const theme of ['fresh','future'])for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const ctx=await browser.newContext({viewport});
  await ctx.addInitScript(t=>{try{localStorage.setItem('MRLEE.THEME.V1',t)}catch(_){}},theme);
  // Local CSS test only. No production account access or bypass.
  await ctx.route('**/auth-guard.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:"document.getElementById('mrlee-auth-hide')?.remove();document.documentElement.dataset.mrleeAuth='verified';"}));
  const page=await ctx.newPage();
  try{
   await page.goto(base+'tuyen-sinh.html',{waitUntil:'domcontentloaded',timeout:25000});
   await page.locator('#tsIntakeOverlay').waitFor({state:'visible',timeout:15000});
   await page.locator('#tsIntakeForm input[name=goal][value=college]').check({force:true});
   await page.locator('#tsIntakeForm input[name=stage][value=graduated-highschool]').check({force:true});
   await page.locator('#tsIntakeNext').click();
   await page.locator('#tsIntakeForm input[name=language][value=basic]').check({force:true});
   await page.locator('#tsIntakeArea').selectOption('gyeonggi');
   await page.locator('#tsIntakeField').selectOption('engineering');
   await page.locator('#tsIntakeNext').click();
   await page.locator('#tsPersonalRecommendations').waitFor({state:'visible',timeout:18000});
   const a=await page.evaluate(()=>{
    const r=document.getElementById('tsPersonalRecommendations');
    return {visible:!r.hidden,cards:r.querySelectorAll('.ts-intake-school').length,program:document.getElementById('tsProgram').value,
      stage:document.getElementById('tsEducation').value,overlay:document.getElementById('tsIntakeOverlay').hidden,scrollWidth:document.documentElement.scrollWidth,width:window.innerWidth,
      disclaimer:!!r.querySelector('.ts-intake-disclaimer')?.textContent.includes('KHÔNG phải')};
   });
   if(!a.visible||!a.overlay||a.cards<1||a.program!=='Đại học / Cao đẳng D-2'||a.stage!=='Đã tốt nghiệp THPT'||!a.disclaimer||a.scrollWidth>a.width+5)throw Error('Admissions flow '+JSON.stringify(a));
   console.log('PASS admissions '+theme+' '+viewport.width+' '+JSON.stringify(a));
  }catch(e){failures.push('ADMISSIONS '+theme+' '+viewport.width+' '+e.message)}
  try{
   await page.goto(base+'on-luyen-phong-van.html',{waitUntil:'domcontentloaded',timeout:24000});
   await page.locator('.question-link').first().waitFor({state:'visible',timeout:12000});
   const b=await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('.question-list .question-link')].slice(0,7);
    return {count:cards.length,items:cards.map(e=>{
      const r=e.getBoundingClientRect(),ko=e.querySelector('.ko-mini'),vn=e.querySelector('.vn-mini');
      const k=ko?.getBoundingClientRect(),v=vn?.getBoundingClientRect(),c=getComputedStyle(ko),d=getComputedStyle(vn);
      return {height:r.height,content:e.scrollHeight,client:e.clientHeight,koColor:c.color,vnColor:d.color,
        overlap:!(k&&v)||k.bottom>v.top+1,inside:!(k&&v)||k.top<r.top-2||v.bottom>r.bottom+2};
    }),scrollWidth:document.documentElement.scrollWidth,width:innerWidth};
   });
   if(b.count<5||b.items.some(x=>x.overlap||x.inside||x.content>x.client+3||x.height<74)||b.scrollWidth>b.width+5)throw Error('Interview overflow '+JSON.stringify(b));
   console.log('PASS interview '+theme+' '+viewport.width+' cards='+b.count);
  }catch(e){failures.push('INTERVIEW '+theme+' '+viewport.width+' '+e.message)}
  await ctx.close();
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
if(failures.length){for(const m of failures)console.error('FAIL '+m);process.exitCode=1}else console.log('PASS all 8 admissions/interview viewport/theme browser checks');
