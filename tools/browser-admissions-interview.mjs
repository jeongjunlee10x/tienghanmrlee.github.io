import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {chromium} from 'playwright';
const root=process.cwd(),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{
 try{const rel=decodeURIComponent(new URL(req.url,'http://local').pathname).replace(/^\/+/,'')||'index.html';
 const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(file,(err,buffer)=>{if(err){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(buffer)})}
 catch(e){res.writeHead(400);res.end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let passed=0,failed=0;
try{
 for(const mode of ['fresh','future'])for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const p=await browser.newPage({viewport});
  await p.addInitScript(theme=>{localStorage.setItem('MRLEE.THEME.V1',theme);sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',theme)},mode);
  const tag=mode+' '+viewport.width;
  try{
   await p.goto('http://127.0.0.1:'+port+'/tuyen-sinh.html',{waitUntil:'domcontentloaded',timeout:25000});
   const dlg=p.locator('#mrleeAdmissionsDialog');
   await dlg.waitFor({state:'visible',timeout:13000});
   if(!await dlg.evaluate(e=>e.open))throw Error('admissions must open as native modal');
   if(await p.locator('#tsWizard').count())throw Error('duplicate legacy intake form');
   await p.locator('input[name="goal"][value="college"]').check();
   await p.locator('input[name="stage"][value="graduated"]').check();
   await p.locator('#apNext').click();
   if(!await p.locator('#apStep2').isVisible())throw Error('second step not visible');
   await p.locator('#apRegion').selectOption('busan');
   await p.locator('#apKorean').selectOption('topik12');
   await p.locator('#apField').selectOption('technology');
   await p.locator('#apFinish').click();
   await p.locator('#mrleeAdmissionsResults').waitFor({state:'visible',timeout:18000});
   const cards=p.locator('#apSchools .ap-school-card');
   await cards.first().waitFor({state:'visible',timeout:15000});
   const count=await cards.count();
   if(count<3||count>6)throw Error('Expected 3–6 shortlisted grounded schools, got '+count);
   if(await p.locator('#tsProgram').inputValue()!=='Đại học / Cao đẳng D-2')throw Error('Consultation program not prefilled');
   if(await p.locator('#tsEducation').inputValue()!=='Đã tốt nghiệp THPT')throw Error('Consultation education not prefilled');
   const report=await p.evaluate(()=>{
    const dlg=document.getElementById('mrleeAdmissionsDialog'),result=document.getElementById('mrleeAdmissionsResults');
    const choices=[...document.querySelectorAll('#apSchools .ap-school-card')].map(x=>x.innerText.slice(0,90));
    return {open:dlg.open,hidden:result.hidden,width:document.documentElement.scrollWidth,innerWidth,
      allCollege:choices.every(x=>x.includes('CAO ĐẲNG')),bodyText:choices.slice(0,2)};
   });
   if(report.open||report.hidden||!report.allCollege||report.width>report.innerWidth+5)throw Error('Popup result/layout invalid: '+JSON.stringify(report));
   await p.locator('#apRetake').click();
   if(!await dlg.evaluate(e=>e.open))throw Error('Reopen modal link failed');
   await p.reload({waitUntil:'domcontentloaded'});
   await p.waitForTimeout(300);
   if(await dlg.evaluate(e=>e.open))throw Error('Reload of finished admission page should not repeat popup');
   console.log('PASS ADMISSIONS '+tag+' '+count+' verified catalog candidates');
   passed++;
  }catch(e){failed++;console.error('FAIL ADMISSIONS '+tag+' '+String(e.stack||e).slice(0,1100))}
  finally{await p.close()}
  const q=await browser.newPage({viewport});
  await q.addInitScript(theme=>{localStorage.setItem('MRLEE.THEME.V1',theme);sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',theme)},mode);
  await q.route('**/auth-guard.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:"document.getElementById('mrlee-auth-hide')?.remove();document.documentElement.dataset.mrleeAuth='verified';"}));
  try{
   const errors=[];q.on('pageerror',e=>errors.push(String(e.message)));
   await q.goto('http://127.0.0.1:'+port+'/on-luyen-phong-van.html',{waitUntil:'domcontentloaded',timeout:25000});
   await q.waitForFunction(()=>document.querySelectorAll('#questionList .question-link').length>2,{timeout:15000});
   const report=await q.evaluate(()=>{
    const selectors=['.panel-title','.question-link','.question-link .vn-mini','.big-ko','.translation','.sample .sample-vi','.field-label'];
    function rgb(s){let m=String(s).match(/^rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\)$/);return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null}
    function bg(el){const layers=[];let n=el;while(n){let c=rgb(getComputedStyle(n).backgroundColor);if(c&&c[3]>0)layers.push(c);if(c&&c[3]>=.999)break;n=n.parentElement}let out=[255,255,255];for(const c of layers.reverse())out=out.map((v,i)=>v*(1-c[3])+c[i]*c[3]);return out}
    function lum(a){return a.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)}
    const values=[];for(const sel of selectors){const e=document.querySelector(sel);if(!e||!e.getClientRects().length)continue;const f=rgb(getComputedStyle(e).color),b=bg(e);if(!f)continue;const x=lum(f),y=lum(b);values.push({sel,ratio:+((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2)})}
    return {theme:document.documentElement.dataset.mrleeTheme,questions:document.querySelectorAll('#questionList .question-link').length,
      korean:document.querySelector('#questionKo')?.textContent?.slice(0,40),
      width:document.documentElement.scrollWidth,innerWidth,values};
   });
   if(report.theme!==mode||!report.korean||report.questions<5||report.width>report.innerWidth+5)
     throw Error('Interview content/layout invalid '+JSON.stringify(report));
   const failures=report.values.filter(x=>x.ratio<4.5);
   if(failures.length)throw Error('Interview contrast below 4.5:1 '+JSON.stringify(failures));
   if(errors.some(e=>/BANK|undefined|renderQuestion|SyntaxError|TypeError/.test(e)))throw Error('Interview JS runtime errors '+errors.join('; ').slice(0,240));
   console.log('PASS INTERVIEW '+tag+' '+report.questions+' Q / '+JSON.stringify(report.values));
   passed++;
  }catch(e){failed++;console.error('FAIL INTERVIEW '+tag+' '+String(e.stack||e).slice(0,1300))}
  finally{await q.close()}
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
console.log('Admissions + interview browser QA: '+passed+' passed, '+failed+' failed');
if(failed)process.exitCode=1;
