/** MR LEE read-only Chromium contrast audit.
 * Isolated localhost auth guard stubbing is TEST ONLY. Production auth is never changed.
 * Measures real computed CSS after Fresh/Future theme switching, not text matching.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=process.cwd();
const pages=[
 ['lo-trinh-topik.html','?cap=1&mode=PBT&days=14&day=1'],
 ['topik-i-lo-trinh.html','?cap=1&mode=PBT&days=14&day=1'],
 ['topik-ii-lo-trinh.html','?cap=2&mode=IBT&days=14&day=1'],
 ['topik-hoc-moi-ngay.html','?cap=1&mode=PBT&days=14&day=1'],
 ['topik-hoc-moi-ngay.html','?cap=2&mode=PBT&days=14&day=1'],
 ['topik-viet-51-54.html','?cap=2&mode=PBT'],
 ['topik-nghe-24-cau.html','']
];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{
 try{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/,'')||'index.html';
  const f=path.resolve(root,rel);
  if(!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  fs.readFile(f,(err,body)=>{
   if(err){res.writeHead(404);res.end('Not Found');return}
   res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  });
 }catch(e){res.writeHead(400);res.end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let count=0,failed=0,observed=0;
try{
 for(const mode of ['fresh','future'])for(const size of [{width:1440,height:900},{width:390,height:844}]){
  for(const [file,params] of pages){
   const page=await browser.newPage({viewport:size});
   // A deliberately isolated TEST-ONLY stub to see CSS underneath the prod auth overlay.
   // Never bypasses real Firebase backend; browser hits localhost test assets only.
   await page.route('**/auth-guard.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'document.documentElement.dataset.mrleeAuth="verified";'}));
   await page.addInitScript(mode=>{
    try{localStorage.setItem('MRLEE.THEME.V1',mode)}catch(e){}
    document.documentElement.dataset.mrleeAuth='verified';
   },mode);
   try{
    await page.goto('http://127.0.0.1:'+port+'/'+file+params,{waitUntil:'domcontentloaded',timeout:20000});
    await page.locator('body.tv-body').waitFor({timeout:8000});
    await page.waitForTimeout(450);
    if(file==='topik-hoc-moi-ngay.html')await page.locator('.tv-choice').first().waitFor({timeout:6000});
    const report=await page.evaluate(()=>{
     function parseColor(s){
      const a=String(s).match(/^rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\)$/);
      return a?[+a[1],+a[2],+a[3],a[4]===undefined?1:+a[4]]:null;
     }
     function bgOf(el){
      let layers=[],n=el;
      while(n&&n.nodeType===1){
       const c=parseColor(getComputedStyle(n).backgroundColor);
       if(c&&c[3]>0)layers.push(c);
       if(c&&c[3]>=.999)break;
       n=n.parentElement;
      }
      let rgb=[255,255,255];
      for(let i=layers.length-1;i>=0;i--){const c=layers[i];rgb=rgb.map((v,k)=>Math.round(v*(1-c[3])+c[k]*c[3]))}
      return rgb;
     }
     function lum(rgb){const s=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});return s[0]*.2126+s[1]*.7152+s[2]*.0722}
     function contrast(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
     const selectors=[
      '.tv-brand','.tv-topnav a','.tv-topnav a.active',
      '.tv-panel h2','.tv-panel .tv-muted','.tv-question h3',
      '.tv-choices .tv-choice','.tv-choices .tv-choice span',
      '.tv-audio .tv-muted','.tv-transcript',
      '.tv-field label','.tv-metric span','.tv-day small',
      '.tv-listen-card','.tv-listen-q','.tv-listen-note',
      '.tv-listen-progress','.tv-listen-transcript',
      '.tv-listen-ctrl button','.tv-btn:not(:disabled)'
     ];
     const result=[];
     for(const sel of selectors){
      const el=document.querySelector(sel);
      if(!el||!el.getClientRects().length||!el.textContent?.trim())continue;
      const style=getComputedStyle(el),foreground=parseColor(style.color);
      if(!foreground)continue;
      const bg=bgOf(el);
      result.push({selector:sel,text:el.textContent.trim().slice(0,45),color:style.color,bg,ratio:+contrast(foreground,bg).toFixed(2)});
     }
     return {theme:document.documentElement.dataset.mrleeTheme,items:result,
       optionCount:document.querySelectorAll('.tv-choice').length,
       bodyVisible:getComputedStyle(document.body).visibility!=='hidden'};
    });
    const low=report.items.filter(x=>x.ratio<4.5);
    count++;observed+=report.items.length;
    console.log('CONTRAST '+mode+' '+size.width+' '+file+' samples='+report.items.length+' options='+report.optionCount+' min='+(Math.min(...report.items.map(x=>x.ratio))).toFixed(2));
    if(!report.bodyVisible||report.theme!==mode||report.items.length<3||low.length){
      failed++;console.error('FAIL contrast '+JSON.stringify({file,mode,size,bodyVisible:report.bodyVisible,detectedTheme:report.theme,low}));
    }
   }catch(e){failed++;console.error('FAIL contrast navigation '+mode+' '+size.width+' '+file+' '+e.message.slice(0,400))}
   finally{await page.close()}
  }
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
console.log('MR LEE TOPIK readability: '+count+' pages/theme/viewport checks; '+observed+' measured text/surface pairs; '+failed+' failed.');
if(failed)process.exitCode=1;
