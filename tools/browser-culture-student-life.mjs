/* Student-life visual E2E: Chrome, Fresh/Future, phone/desktop. No backend mutations. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd();
const catalog=JSON.parse(fs.readFileSync('assets/culture/student-life-catalog-v1.json','utf8'));
const active=catalog.lessons.filter(x=>x.status==='preview');
const out='artifacts/culture-student-life';
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
const server=createServer((req,res)=>{
 try{
  const route=decodeURIComponent((req.url||'/').split('?')[0]);
  const full=path.resolve(root,'.'+(route==='/'?'/index.html':route));
  if(!(full===root||full.startsWith(root+path.sep))){res.writeHead(403);res.end();return}
  fs.readFile(full,(err,data)=>{
   if(err){res.writeHead(404);res.end('Not found');return}
   res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':'no-store'});
   res.end(data);
  });
 }catch{res.writeHead(400);res.end('Bad request')}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const host='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const mode of ['fresh','future']){
  for(const viewport of [{width:375,height:812},{width:1365,height:900}]){
   const context=await browser.newContext({viewport,serviceWorkers:'block'});
   await context.addInitScript(mode=>{
    try{localStorage.setItem('MRLEE.THEME.V1',mode)}catch{}
    window.__mrleeSpoken=[];
    window.SpeechSynthesisUtterance=function(text){this.text=text;this.lang='ko-KR'};
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
     getVoices:()=>[{lang:'ko-KR'}],cancel(){},speak(u){window.__mrleeSpoken.push(u.text)}
    }});
   },mode);
   const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(host+'/van-hoa-du-hoc-sinh-preview.html',{waitUntil:'domcontentloaded'});
   await page.locator('#topics .topic').first().waitFor();
   assert.equal(await page.locator('#topics .topic').count(),8,'Eight active topics');
   assert.equal(await page.locator('.planned-card').count(),12,'Twelve upcoming topics');
   assert.equal(await page.locator('.planned-card a').count(),0,'No dead lesson links');
   let overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
   assert.equal(overflow,false,mode+' '+viewport.width+': preview horizontal overflow');
   await page.screenshot({path:path.join(out,mode+'-'+viewport.width+'-library.png'),fullPage:true});
   for(const lesson of active){
    await page.locator('#topics .topic[data-id="'+lesson.slug+'"]').click();
    assert.equal(await page.locator('.scene-line').count(),4,lesson.slug+': four-turn preview');
    assert.match(await page.locator('.scene-line').first().innerText(),/[가-힣]/u,lesson.slug+': preview Korean');
    const href=await page.locator('.lesson-link').getAttribute('href');
    assert(href.endsWith('#'+lesson.slug+'/1'),lesson.slug+': wrong slide deep link');
    await page.goto(new URL(href,host+'/').href,{waitUntil:'domcontentloaded'});
    assert.equal((await page.locator('#counter').textContent()).trim(),'1 / 45',lesson.slug+': start');
    await page.locator('#next').click();
    assert.equal((await page.locator('#counter').textContent()).trim(),'2 / 45',lesson.slug+': next');
    await page.locator('#prev').click();
    assert.equal((await page.locator('#counter').textContent()).trim(),'1 / 45',lesson.slug+': prev');
    overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
    assert.equal(overflow,false,mode+' '+viewport.width+' '+lesson.slug+': slide horizontal overflow');
    if(lesson.slug===active[0].slug){
     for(let i=0;i<6;i++)await page.locator('#next').click();
     await page.locator('#speak').click();
     assert(await page.evaluate(()=>window.__mrleeSpoken.length>0),'Korean voice button');
     await page.screenshot({path:path.join(out,mode+'-'+viewport.width+'-slide.png')});
    }
    await page.goto(host+'/van-hoa-du-hoc-sinh-slides.html#'+lesson.slug+'/25',{waitUntil:'domcontentloaded'});
    assert.equal((await page.locator('#counter').textContent()).trim(),'25 / 45',lesson.slug+': contextual roleplay slide');
    assert.equal(await page.locator('.body.roleplay').count(),1,lesson.slug+': roleplay rendered');
    assert.match(await page.locator('.body.roleplay').innerText(),/[가-힣]/u,lesson.slug+': Korean dialogue');
    await page.locator('#reveal').click();
    assert(await page.locator('#answer').isVisible(),lesson.slug+': show bilingual translations');
    assert.match(await page.locator('#answer').innerText(),/Bản dịch Hàn–Việt/,lesson.slug+': Vietnamese reference');
    await page.locator('#speak').click();
    assert(await page.evaluate(()=>window.__mrleeSpoken.some(x=>x.includes('\n'))),lesson.slug+': Korean multi-turn speech');
    if(lesson.slug===active[0].slug){
     await page.screenshot({path:path.join(out,mode+'-'+viewport.width+'-roleplay.png')});
    }
    await page.goto(host+'/van-hoa-du-hoc-sinh-preview.html',{waitUntil:'domcontentloaded'});
   }
   assert.deepEqual(errors,[],mode+' '+viewport.width+': browser page errors');
   await context.close();
   console.log('PASS Chromium '+mode+' '+viewport.width+'px: 8 active / 12 planned, 8 slide links, bilingual roleplays, TTS stub, no overflow, no page errors');
  }
 }
}finally{
 if(browser)await browser.close();
 await new Promise(ok=>server.close(ok));
}
