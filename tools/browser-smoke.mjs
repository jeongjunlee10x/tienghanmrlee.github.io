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
  {file:'index.html',check:async p=>{
    await p.locator('main').first().waitFor({timeout:10000});
    const contact=p.locator('#mrleeContactDock');
    await contact.waitFor({state:'visible',timeout:12000});
    if(await contact.locator('.mrlee-contact-links > *').count()!==5)throw Error('Contact dock must expose 5 real channels');
    if(p.viewportSize().width<=700){
      const toggle=contact.locator('button.mrlee-contact-toggle');
      const hit=await toggle.evaluate(el=>{
        const b=el.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;
        const style=getComputedStyle(el),top=document.elementFromPoint(x,y);
        return {x,y,width:b.width,height:b.height,display:style.display,visibility:style.visibility,pointer:style.pointerEvents,clickable:top===el||el.contains(top),overlap:top?.outerHTML.slice(0,210)||null,viewport:[innerWidth,innerHeight]};
      });
      console.log('MRLEE CONTACT MOBILE DIAGNOSTIC '+JSON.stringify(hit));
      if(!hit.clickable)throw Error('Contact toggle is blocked by another element: '+JSON.stringify(hit));
      await toggle.click({timeout:5000});
      if(!await contact.locator('.mrlee-contact-links').isVisible())throw Error('Mobile contact dock did not expand');
      await toggle.click({timeout:5000});
    }else if(!await contact.locator('.mrlee-contact-links').isVisible())throw Error('Desktop contact channels are hidden');
    // Lesson/feature card photos must remain the same when selecting the other visual theme.
    const photos=p.locator('.feature-card img,.mrlee-v4-card img');
    if(await photos.count()){
      const before=await photos.evaluateAll(images=>images.map(i=>i.getAttribute('src')));
      const original=await p.evaluate(()=>document.documentElement.dataset.mrleeTheme);
      const target=original==='future'?'fresh':'future';
      const other=p.locator('.mrlee-theme-switch button[data-theme="'+target+'"]');
      if(await other.count()){
        await other.evaluate(el=>el.click());
        const after=await photos.evaluateAll(images=>images.map(i=>i.getAttribute('src')));
        if(JSON.stringify(before)!==JSON.stringify(after)){const differences=before.map((from,i)=>from===after[i]?null:{index:i,before:from,after:after[i]}).filter(Boolean);throw Error('Theme switch replaced content card photos: '+JSON.stringify(differences.slice(0,5)));}
        await p.locator('.mrlee-theme-switch button[data-theme="'+original+'"]').evaluate(el=>el.click());
      }
    }
  }},
  {file:'admin.html',check:async p=>{
    await p.locator('#authWrap').waitFor({state:'visible',timeout:15000});
    if(!await p.locator('#app').evaluate(el=>el.classList.contains('hidden')))
      throw Error('Admin data UI must be hidden before authorization');
    const publicConfig=await p.locator('#loginForm,#setupForm').evaluateAll(forms=>forms.some(f=>!f.classList.contains('hidden')));
    if(!publicConfig)throw Error('Admin configuration/login form is not accessible');
    if(await p.locator('#mrleeContactDock').count())throw Error('Marketing contact dock must not obscure private Admin');
  }},
  {file:'quy-tac-diem-mrlee.html',check:async p=>{
    const loaded=p.locator('#mrlee-policy-loaded');
    await loaded.waitFor({state:'visible',timeout:10000});
    await p.waitForFunction(()=>document.querySelector('#mrlee-policy-loaded')?.textContent?.includes('Đã đồng bộ'),null,{timeout:12000});
    const values=await p.locator('#mrleePolicyTable tbody tr').evaluateAll(rows=>rows.map(r=>r.cells[2].textContent));
    if(values[0]!=='Tối đa 12 điểm'||values[1]!=='Tối đa 20 điểm'||values[2]!=='Tối đa 40 điểm')throw Error('Published scoring thresholds differ from live policy JSON');
    await p.locator('#mrleePolicyType').selectOption('listening');
    await p.locator('#mrleePolicyCorrect').fill('9');
    await p.locator('#mrleePolicyTotal').fill('10');
    const preview=await p.locator('#mrleePolicyEstimate').textContent();
    if(!preview.includes('18 điểm Spark'))throw Error('Score calculator gives an incorrect listening award: '+preview);
  }},
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
    await p.locator('#mrleeAdministrativeMap path.province').first().waitFor({timeout:17000});
    const regions=await p.locator('#mrleeAdministrativeMap path.province').count();
    if(regions!==17)throw Error('Administrative map must show 17 real first-level regions; found '+regions);
    await p.locator('#mrleeAdministrativeMap path.province[data-region="gyeonggi"]').evaluate(el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));
    if(await p.locator('#universityRegion').inputValue()!=='gyeonggi')throw Error('Clicking official region did not filter universities');
    await p.locator('#universityClear').evaluate(el=>el.click());
    // Both historic 2023 polygons map to the unified 2026 Jeonnam-Gwangju filter.
    const merged=p.locator('#mrleeAdministrativeMap path.province[data-region="jeonnam-gwangju"]');
    if(await merged.count()!==2)throw Error('Gwangju and Jeonnam need two mapped historical polygons');
    for(let index=0;index<2;index++){
      await merged.nth(index).evaluate(el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));
      const selected=await p.locator('#universityRegion').inputValue();
      if(selected!=='jeonnam-gwangju')throw Error('Historic region polygon did not select Jeonnam-Gwangju: '+selected);
      await p.locator('#universityClear').evaluate(el=>el.click());
    }
    await field.fill('Seoul');
    if(await field.inputValue()!=='Seoul')throw Error('University search input did not accept typed text');
  }},
  {file:'dang-ky-tu-van.html',check:async p=>{await p.locator('form').first().waitFor({timeout:10000})}},
  {file:'hoc-tieng-han.html',check:async p=>{await p.locator('main>.mrlee-v4-root .mrlee-v4-hero-photo').first().waitFor({timeout:11000})}},
  {file:'giao-tiep-theo-chu-de.html',check:async p=>{await p.locator('main>.mrlee-v4-root .mrlee-v4-hero-photo').first().waitFor({timeout:11000})}},
  {file:'kiem-tra-topik.html',check:async p=>{await p.locator('main>.mrlee-v4-root .mrlee-v4-hero-photo').first().waitFor({timeout:11000})}},
  {file:'giao-tiep-phong-van.html',check:async p=>{await p.locator('main>.mrlee-v4-root .mrlee-v4-hero-photo').first().waitFor({timeout:11000})}},
  {file:'van-hoa-han-quoc.html',check:async p=>{
    const opener=p.locator('.mrlee-v5-open-detail');
    if(await opener.count())await opener.evaluate(el=>el.click());
    await p.locator('#topics a.topic').first().waitFor({state:'visible',timeout:15000});
    const count=await p.locator('#topics a.topic').count();
    if(count!==22)throw Error('Culture: need 22 topics; got '+count);
    const images=p.locator('#topics a.topic img');
    await images.evaluateAll(async all=>await Promise.all(all.map(im=>im.decode().catch(()=>{}))));
    const bad=await images.evaluateAll(all=>all.filter(im=>im.naturalWidth<800).map(im=>({src:im.src,w:im.naturalWidth})));
    if(bad.length)throw Error('Culture HD topic images are not full size: '+JSON.stringify(bad.slice(0,4)));
    await p.locator('#search').fill('CPR');
    if(await p.locator('#topics a.topic').count()<1)throw Error('Culture search filter broken');
    await p.locator('#search').fill('');
    await p.locator('#topics a.topic').first().waitFor({state:'visible'});
    fs.mkdirSync('artifacts/culture-review',{recursive:true});
    await p.screenshot({path:'artifacts/culture-review/culture-'+p.viewportSize().width+'-'+(await p.evaluate(()=>document.documentElement.dataset.mrleeTheme))+'.png',fullPage:true});
  }},

  {file:'mrlee-bai-tap-pro.html',check:async p=>{await p.locator('main>.mrlee-v4-root .mrlee-v4-hero-photo').first().waitFor({timeout:11000})}},
  {file:'trung-tam-hoc-vien.html',check:async p=>{await p.locator('main>.mrlee-v4-root .mrlee-v4-hero-photo').first().waitFor({timeout:11000})}}
 ];
 for(const device of [{w:1440,h:900},{w:390,h:844}]){
  for(const theme of ['fresh','future']){
   const context=await browser.newContext({viewport:{width:device.w,height:device.h}});
   await context.addInitScript(t=>{try{localStorage.setItem('MRLEE.THEME.V1',t)}catch{}},theme);
   for(const test of cases){
    const page=await context.newPage();
    const protectedLayouts=new Set(['hoc-tieng-han.html','giao-tiep-theo-chu-de.html','giao-tiep-phong-van.html','mrlee-bai-tap-pro.html','trung-tam-hoc-vien.html']);
    const label=device.w+'x'+device.h+' '+theme+' '+test.file;
    const pageErrors=[];
    page.on('pageerror',err=>pageErrors.push(err.message));
    try{
     const response=await page.goto('http://127.0.0.1:'+port+'/'+test.file,{waitUntil:'domcontentloaded',timeout:20000});
     if(!response?.ok())throw Error('HTTP status '+response?.status());
     if(protectedLayouts.has(test.file)){
       // Authentication is REQUIRED on production pages. Guest QA checks the route and source.
       const html=fs.readFileSync(path.join(root,test.file),'utf8');
       if(!html.includes('assets/mrlee-v4/page-system.js'))throw Error('Missing protected page shell');
       await page.locator('body').first().waitFor({timeout:9000});
       notices.push(label+' authentication-gated; visual check requires test credentials');
     } else {
       await test.check(page);
     }
     if(["hoc-tieng-han.html","giao-tiep-theo-chu-de.html","kiem-tra-topik.html","giao-tiep-phong-van.html","van-hoa-han-quoc.html","ban-do-dai-hoc-han-quoc.html","mrlee-bai-tap-pro.html","trung-tam-hoc-vien.html"].includes(test.file) && !protectedLayouts.has(test.file)){
       await page.locator('.mrlee-v4-hero-photo').first().evaluate(i=>i.decode().catch(()=>{}));
       await page.locator('.mrlee-v4-card img').evaluateAll(async images=>{
         await Promise.all(images.map(img=>img.decode().catch(()=>{})));
       });
       const v=await page.evaluate(()=>{
        const box=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height}};
        const h=document.querySelector('main>.mrlee-v4-root>.mrlee-v4-hero');
        const im=h?.querySelector('.mrlee-v4-hero-photo'),w=h?.querySelector('.mrlee-v4-hero-words');
        const actions=h?.querySelector('.mrlee-v4-actions');
        return {photo:box(im),words:box(w),cta:box(actions),img:im?.naturalWidth||0,
         scroll:w?.scrollHeight,client:w?.clientHeight,
         cards:document.querySelectorAll('.mrlee-v4-card').length,
         width:document.documentElement.scrollWidth,viewport:innerWidth};
       });
       console.log('CHILD PAGE GEOMETRY '+label+' '+JSON.stringify(v));
       if(v.img<100)throw Error('No child hero image loaded');
       const missing=await page.locator('.mrlee-v4-card img').evaluateAll(imgs=>imgs.filter(i=>!i.naturalWidth).length);
       if(missing)throw Error('Subpage tile images not loaded: '+missing);
       if(v.cards<3||!v.cta||v.cta.height<25)throw Error('Missing child navigation');
       if(v.width>v.viewport+5)throw Error('Horizontal overflow');
       if(device.w>=980 && (Math.abs(v.words.right-v.photo.x)>5||v.cta.right>v.photo.x+5))
         throw Error('Child buttons overlap photograph');
       if(device.w<980 && v.cta.y<v.photo.bottom-4)throw Error('Mobile buttons overlap photograph');
       if(v.scroll>v.client+8)throw Error('Child hero copy clipped');
       fs.mkdirSync('artifacts/subpage-review',{recursive:true});
       await page.screenshot({path:'artifacts/subpage-review/'+device.w+'x'+device.h+'-'+theme+'-'+test.file.slice(0,-5)+'.png',fullPage:true});
     }
     if(test.file==='index.html') {
       await page.locator('.mrlee-smart-home-grid > a.mrlee-smart-home-card').first().waitFor({timeout:10000});
       await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.mrlee-smart-home-grid img')].map(i=>i.decode().catch(()=>{})));});
       const m=await page.evaluate(()=>{
        const rect=s=>{const el=document.querySelector(s);if(!el)return null;const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom,visible:getComputedStyle(el).display!=='none'}};
        return {header:rect('.site-header'),hero:rect('#mainContent>.hero'),hub:rect('.mrlee-smart-home-hub'),cards:[...document.querySelectorAll('.mrlee-smart-home-grid > a')].filter(e=>e.getBoundingClientRect().height>0).length,pair:rect('#mainContent>.mrlee-bottom-pair'),awards:rect('#mrleeScholarshipsHome'),dupe:rect('#mainContent>.feature-cards'),width:document.documentElement.scrollWidth,viewport:innerWidth};
       });
       const layoutDetail=await page.evaluate(()=>{
         const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.round(b.x),y:Math.round(b.y),bottom:Math.round(b.bottom),width:Math.round(b.width),height:Math.round(b.height),display:getComputedStyle(e).display}};
         const grid=document.querySelector('.mrlee-smart-home-grid');
         return {grid:r(grid),template:grid?getComputedStyle(grid).gridTemplateColumns:null,firstCard:r(grid?.firstElementChild),lastCard:r(grid?.lastElementChild),children:[...document.querySelector('#mainContent').children].map(e=>({cls:e.id||e.className,box:r(e)})),images:[...document.querySelectorAll('.mrlee-smart-home-grid img')].map(e=>({src:e.getAttribute('src'),ok:e.naturalWidth>0}))};
       });
       console.log('HOME DETAIL '+label+' '+JSON.stringify(layoutDetail));
       console.log('HOME LAYOUT '+label+' '+JSON.stringify(m));
       const heroAudit=await page.evaluate(()=>{
         const root=document.documentElement;
         const hero=document.querySelector('#mainContent>.hero[data-mrlee-hero="split"]');
         const copy=hero?.querySelector('.mrlee-hero-copy-pane');
         const photo=hero?.querySelector('.mrlee-hero-photo-pane');
         const active=root.dataset.mrleeTheme==='future'?hero?.querySelector('.mrlee-future-hero-copy'):hero?.querySelector('.hero-copy');
         const rect=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:b.x,right:b.right,y:b.y,bottom:b.bottom,height:b.height,width:b.width}};
         const actions=active?.querySelector('.mrlee-future-cta,.hero-buttons');
         return {theme:root.dataset.mrleeTheme,hero:rect(hero),copy:rect(copy),photo:rect(photo),actions:rect(actions),art:getComputedStyle(photo).backgroundImage,active:getComputedStyle(active).display,copyScroll:copy?.scrollHeight,copyHeight:copy?.clientHeight};
       });
       console.log('HERO SPLIT '+label+' '+JSON.stringify(heroAudit));
       const expectedArt=theme==='future'?'01-trang-chu-future.webp':'01-trang-chu-fresh.webp';
       if(!heroAudit.art?.includes(expectedArt))throw Error('Wrong theme cover: '+heroAudit.art);
       if(!heroAudit.photo || heroAudit.photo.height<120)throw Error('Hero cover invisible');
       if(device.w>760){
         if(Math.abs(heroAudit.hero.x+1-heroAudit.copy.x)>3)throw Error('Ghost cover exposed at left edge');
         if(Math.abs(heroAudit.hero.right-1-heroAudit.photo.right)>3)throw Error('Ghost cover exposed at right edge');
         if(Math.abs(heroAudit.copy.right-heroAudit.photo.x)>3)throw Error('Unexpected gap between text and photograph');
       }
       if(heroAudit.active==='none')throw Error('Hero theme copy hidden');
       if(!heroAudit.actions || heroAudit.actions.height<25)throw Error('Hero actions invisible');
       if(device.w>760){
         if(heroAudit.actions.right>heroAudit.photo.x+1)throw Error('Hero actions overlap photo');
       }else{
         if(heroAudit.actions.y<heroAudit.photo.bottom-1)throw Error('Mobile hero actions overlap photo');
       }
       if(heroAudit.copyScroll>heroAudit.copyHeight+5)throw Error('Hero copy clipped by its pane');
       for(const file of ['01-trang-chu-fresh.webp','01-trang-chu-future.webp']){
         const st=fs.statSync(path.join(root,'assets/images/heroes',file));
         if(st.size<100000)throw Error('Hero file too small: '+file);
       }
       if(m.cards!==8)throw Error('Expected 8 non-duplicated dashboard cards, got '+m.cards);
       if(layoutDetail.images.filter(i=>i.ok).length<7)throw Error('Missing card artwork: '+JSON.stringify(layoutDetail.images));
       if(!m.header || m.header.y < -2 || m.header.height < 45)throw Error('Header clipped or hidden');
       if(!m.hero || m.hero.height < 230 || m.hero.height > (device.w>760?380:750))throw Error('Hero cropped or oversized');
       if(!m.hub?.visible || !m.pair?.visible || m.pair.height < 90)throw Error('Homepage dashboard pair hidden');
       if(m.dupe?.visible)throw Error('Duplicated legacy feature row still visible');
       if(m.awards?.visible)throw Error('Oversized scholarship injection still visible');
       if(m.width > m.viewport + 4)throw Error('Horizontal overflow '+m.width+' > '+m.viewport);
       if(device.w>=1280 && m.pair.bottom>device.h+35)throw Error('Desktop first-fold content cut: bottom='+m.pair.bottom);
       await page.waitForTimeout(350); // allow decoded artwork to paint before screenshot
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
console.log('BROWSER QA Chromium: '+seen.size+'/44 public page visits passed, Fresh/Future at desktop and phone.');
notices.slice(0,10).forEach(s=>console.warn('BROWSER NOTICE '+s));
errors.forEach(s=>console.error('BROWSER FAIL '+s));
if(errors.length)process.exitCode=1;
