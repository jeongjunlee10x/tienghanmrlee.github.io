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
    if(await contact.locator('.mrlee-contact-links > *').count()!==6)throw Error('Contact dock must expose 6 real channels');
    const tik=contact.locator('a.mrlee-contact-link[data-channel="tiktok"]');
    if(await tik.count()!==1 || await tik.getAttribute('href')!=='https://www.tiktok.com/@hankuc_chemi')
      throw Error('Missing/incorrect TikTok @hankuc_chemi profile URL');
    if(await tik.getAttribute('target')!=='_blank'||!(await tik.getAttribute('rel'))?.includes('noopener'))
      throw Error('TikTok link should open safely in new tab');
    // Contact is intentionally collapsed on all devices so it never hides ranking cards.
    const toggle=contact.locator('button.mrlee-contact-toggle');
    if(!await toggle.isVisible())throw Error('Compact contact trigger not visible');
    if(await contact.locator('.mrlee-contact-links').isVisible())throw Error('Contact links cover the homepage by default');
    const hit=await toggle.evaluate(el=>{
      const b=el.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;
      const top=document.elementFromPoint(x,y);
      return {x,y,clickable:top===el||el.contains(top),overlap:top?.outerHTML.slice(0,180)||null};
    });
    if(!hit.clickable)throw Error('Contact trigger obstructed: '+JSON.stringify(hit));
    await toggle.click({timeout:5000});
    if(!await contact.locator('.mrlee-contact-links').isVisible())throw Error('Contact dock did not expand');
    await toggle.click({timeout:5000});
    if(await contact.locator('.mrlee-contact-links').isVisible())throw Error('Contact dock did not collapse');
    // A completed entry selection persists. There must be NO header switcher.
    if(await p.locator('.mrlee-theme-switch').count())throw Error('Legacy header theme switcher reappeared');
    if(await p.locator('#mrlee-theme-entry').count())throw Error('Entry dialog asked twice during an already-chosen tab');

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
    if(values[0]!=='Tối đa 6 điểm'||values[1]!=='Tối đa 12 điểm'||values[2]!=='Tối đa 20 điểm'||values[3]!=='Tối đa 40 điểm')throw Error('Published scoring thresholds differ from live policy JSON');
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
    await images.evaluateAll(async all=>{for(const im of all){im.loading='eager';await im.decode().catch(()=>{})}});
    const bad=await images.evaluateAll(all=>all.filter(im=>{const url=im.currentSrc;const newShot=url.includes('/culture-v23-ai/')||url.includes('/culture-v24-ai/')||url.includes('/culture-v25-ai/')||url.includes('/culture-v26-ai/')||url.includes('/culture-v27-art/');const oldShot=url.includes('/culture-v20-hd/')||url.includes('/culture-v21-new/');return (!newShot&&!oldShot)||im.naturalWidth<(newShot?1500:2000)}).map(im=>({src:im.currentSrc,w:im.naturalWidth})));
    if(bad.length)throw Error('Culture HD topic images are not full size: '+JSON.stringify(bad.slice(0,4)));
    const mustReplace=new Set(['le-hoi','am-thuc','truyen-thong','doi-song','phe-lich-su','giao-duc','du-lich','kpop','cong-so','tro-choi','lich-su','hien-dai','so-cap-cuu','goi-cuu-ho','lac-duong','mat-vi','tau-dien-ngam','xe-buyt','benh-vien','hoa-hoan','mat-dien-thoai','an-toan-giao-thong']);
    const wrong=await p.locator('#topics a.topic').evaluateAll((cards,slugs)=>cards.map(card=>{
      const id=new URL(card.href).searchParams.get('chu-de');
      return {id,src:card.querySelector('img')?.currentSrc||''};
    }).filter(item=>slugs.includes(item.id)&&!(new Set(['lich-su','hien-dai']).has(item.id)?item.src.includes('/culture-v27-art/'):(new Set(['cong-so','tro-choi']).has(item.id)?item.src.includes('/culture-v26-ai/'):(new Set(['du-lich','kpop']).has(item.id)?item.src.includes('/culture-v25-ai/'):(new Set(['phe-lich-su','giao-duc']).has(item.id)?item.src.includes('/culture-v24-ai/'):(new Set(['le-hoi','am-thuc','truyen-thong','doi-song']).has(item.id)?item.src.includes('/culture-v23-ai/'):item.src.includes('/culture-v21-new/'))))))),[...mustReplace]);
    if(wrong.length)throw Error('Old images still used for V21 target topics: '+JSON.stringify(wrong));
    // Lesson route requires actual learner authentication; verify its five-image engine in static QA, not by bypassing auth.
    const lessonSource=fs.readFileSync(path.join(root,'van-hoa-bai-hoc.html'),'utf8');
    if(!lessonSource.includes('mrlee-culture-v20-captions.js'))throw Error('Culture lesson V20 captions not mounted');
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
   await context.addInitScript(t=>{try{localStorage.setItem('MRLEE.THEME.V1',t);sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',t)}catch{}},theme);
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
       if(v.cards<1||!v.cta||v.cta.height<25)throw Error('Missing child navigation');
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
         return {theme:root.dataset.mrleeTheme,hero:rect(hero),copy:rect(copy),photo:rect(photo),actions:rect(actions),heading:rect(active?.querySelector('h1')),art:getComputedStyle(photo).backgroundImage,active:getComputedStyle(active).display,copyScroll:copy?.scrollHeight,copyHeight:copy?.clientHeight};
       });
       console.log('HERO FULL-BLEED '+label+' '+JSON.stringify(heroAudit));
       const expectedArt=theme==='future'?'01-trang-chu-future.webp':'01-trang-chu-fresh.webp';
       if(!heroAudit.art?.includes(expectedArt))throw Error('Wrong theme cover: '+heroAudit.art);
       if(!heroAudit.photo || heroAudit.photo.height<120)throw Error('Hero cover invisible');
       // Image spans the full frame. Fresh live content is on the left;
       // Future live copy/buttons are on the right-hand skyline, away from learner's face.
       if(Math.abs(heroAudit.hero.x+1-heroAudit.photo.x)>3||
          Math.abs(heroAudit.hero.right-1-heroAudit.photo.right)>3||
          Math.abs(heroAudit.hero.height-heroAudit.photo.height)>3)
         throw Error('Full-bleed photo does not cover entire hero: '+JSON.stringify(heroAudit));
       if(heroAudit.copy.x<heroAudit.hero.x-3||heroAudit.copy.right>heroAudit.hero.right+3)
         throw Error('Live hero text pane escaped scene edges');
       if(heroAudit.active==='none')throw Error('Hero theme copy hidden');
       if(!heroAudit.actions || heroAudit.actions.height<25)throw Error('Hero actions invisible');
       if(device.w>1100 && theme==='fresh' && heroAudit.actions.right>heroAudit.hero.x+heroAudit.hero.width*.76)
         throw Error('Fresh hero CTA escaped the left-hand safe zone');
       if(device.w>1100 && theme==='future') {
         const midpoint=heroAudit.hero.x+heroAudit.hero.width*.47;
         if(heroAudit.copy.x<midpoint || heroAudit.heading?.x<midpoint || heroAudit.actions.x<midpoint)
           throw Error('Future headline and CTA were not moved to right skyline: '+JSON.stringify(heroAudit));
         if(heroAudit.heading?.right>heroAudit.hero.right+2 || heroAudit.actions.right>heroAudit.hero.right+2)
           throw Error('Right-side future text/CTA clipped by hero edge: '+JSON.stringify(heroAudit));
       }
       if(heroAudit.actions.bottom>heroAudit.hero.bottom+2)
         throw Error('Hero CTA buttons escape the photograph on mobile');
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
       // Regression for scholarship + leader-board collision reported on 28 Oct:
       // injected Firebase ranking rows must remain in their own horizontal scroller;
       // the weekly score belongs to the title, never floats across roster cards.
       await page.locator('#ranking .rank-title #mrleeV12Widget').waitFor({state:'visible',timeout:15000});
       const scoreLayout=await page.evaluate(()=>{
         const query=x=>document.querySelector(x),rect=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height}};
         const pair=query('#mainContent>.mrlee-bottom-pair'),scholar=pair?.querySelector('.scholarship'),rank=query('#ranking'),
           title=rank?.querySelector('.rank-title'),strip=rank?.querySelector('.rank-strip-wrap'),
           nav=rank?.querySelector('.rank-controls'),score=rank?.querySelector('#mrleeV12Widget');
         return {pair:rect(pair),scholar:rect(scholar),rank:rect(rank),title:rect(title),
           strip:rect(strip),nav:rect(nav),score:rect(score),
           headerScroll:title?.scrollHeight,headerClient:title?.clientHeight,
           rankScroll:rank?.scrollHeight,rankClient:rank?.clientHeight,
           scoreInTitle:score?.parentElement===title,
           contactCollapsed:getComputedStyle(query('#mrleeContactDock .mrlee-contact-links')).display==='none',
           rankScrollWidth:query('#rankSlider')?.scrollWidth,
           rankClientWidth:query('#rankSlider')?.clientWidth};
       });
       console.log('MRLEE RANK LAYOUT '+label+' '+JSON.stringify(scoreLayout));
       if(!scoreLayout.scoreInTitle||!scoreLayout.score)throw Error('Weekly points pill still floats over leaderboard');
       if(!scoreLayout.contactCollapsed)throw Error('Floating contact list covers leaderboard');
       if(scoreLayout.rank.height<135||scoreLayout.scholar.height<125)
         throw Error('Scholarship/leaderboard too short for content: '+JSON.stringify(scoreLayout));
       if(scoreLayout.headerScroll>scoreLayout.headerClient+4)
         throw Error('Leaderboard header text clipped: '+JSON.stringify(scoreLayout));
       if(scoreLayout.rankScroll>scoreLayout.rankClient+5)
         throw Error('Leaderboard card/header content vertically clipped: '+JSON.stringify(scoreLayout));
       const overlap=(a,b)=>a&&b&&a.x<b.right-2&&a.right>b.x+2&&a.y<b.bottom-2&&a.bottom>b.y+2;
       if(overlap(scoreLayout.strip,scoreLayout.nav))throw Error('Ranking navigation overlaps student cards');
       if(overlap(scoreLayout.score,scoreLayout.strip))throw Error('Weekly score badge overlaps student cards');
       if(device.w>760&&overlap(scoreLayout.scholar,scoreLayout.rank))
         throw Error('Scholarship overlaps ranking panel');
       // Firebase may be offline during CI, so inject mock VISUAL rank cards in
       // the isolated browser to verify real card dimensions and arrows, then
       // restore the original DOM. This NEVER writes data or publishes fake ranks.
       const synthetic=await page.evaluate(()=>{
         const strip=document.getElementById('rankSlider');
         const saved=[...strip.childNodes],oldLeft=strip.scrollLeft;
         strip.replaceChildren();
         for(let i=0;i<7;i++){
           const card=document.createElement('article');card.className='student-rank mrlee-rank-v304-card';
           const pos=document.createElement('span');pos.className='position';pos.textContent='#'+(i+1);
           const info=document.createElement('div');info.className='student-info';
           const name=document.createElement('b');name.className='student-name';
           name.textContent='Học viên MR LEE có họ và tên rất dài thử nghiệm '+(i+1);
           const points=document.createElement('small');points.className='student-score';points.textContent='239 điểm';
           info.append(name,points);card.append(pos,info);strip.append(card);
         }
         const rect=e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom}};
         const nav=document.querySelector('#ranking .rank-controls');
         const cards=[...strip.children];
         const output={
           scrollable:strip.scrollWidth>strip.clientWidth+25,
           cardHeight:cards[0].getBoundingClientRect().height,
           cardOverflow:cards.some(c=>c.scrollHeight>c.clientHeight+3),
           first:rect(cards[0]),scroll:rect(strip),nav:rect(nav),
           cardCount:cards.length
         };
         strip.replaceChildren(...saved);strip.scrollLeft=oldLeft;
         return output;
       });
       if(!synthetic.scrollable||synthetic.cardCount!==7||synthetic.cardHeight<70||synthetic.cardOverflow)
         throw Error('Ranking cards fail responsive horizontal scrolling: '+JSON.stringify(synthetic));
       if(synthetic.first.right>synthetic.nav.left+1)
         throw Error('Student card overlaps carousel arrow buttons: '+JSON.stringify(synthetic));


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
