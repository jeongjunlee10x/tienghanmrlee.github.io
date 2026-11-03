/* UI Phase 5: deterministic audit of currently active V2/V3 pages.
 * Checks source invariants only; it cannot certify live GitHub Pages or backend auth.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=(name)=>fs.readFileSync(name,'utf8');
const pages=[
 ['index.html','data-mrlee-redesign="v2"',8,'mr27-tile'],
 ['hoc-tieng-han.html','data-mrlee-hub-v2="learning"',6,'mr27-item'],
 ['giao-tiep-phong-van.html','data-mrlee-hub-v2="talk"',4,'mr27-item'],
 ['kiem-tra-topik.html','data-mrlee-hub-v2="topik"',5,'mr27-item'],
 ['mrlee-bai-tap-pro.html','data-mrlee-hub-v2="workbook"',0,'mr27-item'],
 ['van-hoa-han-quoc.html','data-mrlee-culture-v2="1"',0,'mr27-item'],
 ['ban-do-dai-hoc-han-quoc.html','data-mrlee-phase3="map"',0,'mr27-item'],
 ['trung-tam-hoc-vien.html','data-mrlee-phase3="student"',0,'mr27-item'],
 ['tuyen-sinh.html','data-mrlee-phase3="admission"',0,'mr27-item'],
 ['admin.html','data-mrlee-phase3="admin"',0,'mr27-item']
];
for(const [path,flag,expectedCards,cardClass] of pages){
 const html=read(path);
 assert(html.includes(flag),'Missing current UI: '+path);
 assert(!html.includes('assets/images/system/mrlee800-hero-loader.js'),
  'Obsolete auto hero script still runs on redesigned '+path);
 assert.equal((html.match(new RegExp('class="'+cardClass+'"','g'))||[]).length,expectedCards,'Wrong navigation count: '+path);
 for(const old of ['assets/mrlee-v4/page-system.js','assets/mrlee-v5/compact-shell.js','assets/mrlee-v2/smart-shell.js'])
  assert(!html.includes(old),'Obsolete UI injection still active: '+path+' / '+old);
 const resources=[...html.matchAll(/<(?:img|script|link)\b[^>]*?(?:href|src)="(assets\/[^"]+)"/g)];
 for(const [,url] of resources){
  const filename=url.split('?')[0].split('#')[0];
  if(!/\.(?:js|css|svg|webp|png|jpe?g)$/.test(filename))continue;
  assert(fs.existsSync(filename),'Broken static asset: '+path+' -> '+filename);
 }
 console.log('SOURCE PASS '+path+' / static assets '+resources.length);
}
const homeHTML=read('index.html');
for(const cover of ['assets/images/heroes/01-trang-chu-fresh.webp','assets/images/heroes/01-trang-chu-future.webp']){
 assert(fs.existsSync(cover),'Missing original theme hero '+cover);
 assert(homeHTML.includes('src="'+cover+'"'),'Homepage hero must use original theme cover '+cover);
 const buf=fs.readFileSync(cover);
 assert(buf.length>20000,'Hero unexpectedly small '+cover);
 assert.equal(buf.toString('ascii',0,4),'RIFF','Wrong image format '+cover);
 assert.equal(buf.toString('ascii',8,12),'WEBP','Invalid image file '+cover);
}
for(const unused of ['home-hero-overlay-v3.css','home-hero-split-v2.css','assets/v31/premium-gallery.js'])
 assert(!homeHTML.includes(unused),'Rebuilt homepage still loads obsolete '+unused);
for(const id of ['mrleeNewHome','mrlee27Expand','mrlee27ThemeChange'])
 assert(read('index.html').includes('id="'+id+'"'),'Home interaction missing '+id);
const cultureData=read('mrlee-culture-v13-data.js');
const covers=[...cultureData.matchAll(/"image":"([^"]+)"/g)].map(x=>x[1]);
assert.equal(covers.length,22,'Culture must expose 22 independent cover images');
assert.equal(new Set(covers).size,22,'Culture covers may not repeat across topics');
for(const src of covers){
 assert(src.endsWith('.webp'),'Outdated SVG/other topic cover: '+src);
 assert(fs.existsSync(src),'Missing culture topic cover: '+src);
 const binary=fs.readFileSync(src);
 assert(binary.length>=10000,'Unexpectedly tiny cover: '+src);
 assert.equal(binary.toString('ascii',0,4),'RIFF','Invalid cover RIFF: '+src);
 assert.equal(binary.toString('ascii',8,12),'WEBP','Invalid WebP cover: '+src);
}
for(const page of ['van-hoa-han-quoc.html','van-hoa-bai-hoc.html'])
 assert(read(page).includes('mrlee-culture-v13-data.js?v=20261102-covers'),'New cover cache version missing: '+page);
console.log('SOURCE PASS Culture: 22 different actual WebP images, valid binaries, no SVG covers.');
const work=read('mrlee-bai-tap-pro.html');
for(const id of ['workLevel','workLesson','workProfile','workList','workGame','workSummary'])
 assert(work.includes('id="'+id+'"'),'Workbook selection/score missing '+id);
for(const page of ['hoc-tieng-han.html','giao-tiep-phong-van.html','mrlee-bai-tap-pro.html','trung-tam-hoc-vien.html'])
 assert(read(page).includes('auth-guard.js'),'Protected page lost auth guard: '+page);
const admin=read('admin.html');
for(const id of ['authWrap','loginForm','app','page-overview','page-students','page-scores','logout'])
 assert(admin.includes('id="'+id+'"'),'Admin auth/data UI missing '+id);
assert(admin.includes('mrlee-placement-admin.js'),'Placement admin missing');
assert(admin.includes('assets/mrlee-dual-ui/admin-charts.js'),'Admin charts missing');
const jsFiles=['assets/mrlee-dual-ui/theme.js','assets/mrlee-ui2027/rebuild-home-v2.js',
 'assets/mrlee-ui2027/learning-hubs-v2.js','assets/mrlee-ui2027/culture-landing-v2.js',
 'assets/mrlee-ui2027/workspaces-v3.js'];
for(const file of jsFiles){
 const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(r.status,0,'Syntax error '+file+': '+r.stderr);
}

/* Brand glow and compact navigation audit (V9): source contract, not live rendering. */
const orderedKeys=[...homeHTML.matchAll(/<a class="mr27-tile" data-key="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(orderedKeys,['learn','talk','topik','workbook','interview','map','culture','profile'],
 'Homepage must follow the learning journey and show eight unique routes');
assert(!homeHTML.includes('📍 Tìm trường tại Hàn Quốc'),'Homepage has a duplicate map action');
assert(!homeHTML.includes('class="mr27-stats"'),'Redundant home statistics still in HTML');
assert.equal((homeHTML.match(/class="mr27-index">0[1-8]/g)||[]).length,8,
 'Eight navigation labels must retain their original CSS class and correct numbering');
const officialLogoCSS=read('assets/branding/site-logo.css');
const memeCSS=read('assets/branding/mrlee-meme-brand.css');
assert(officialLogoCSS.includes('drop-shadow')&&memeCSS.includes('drop-shadow'),
 'Original-color logo glow is missing');
assert(homeHTML.includes('rebuild-home-v2.css?v=20261103-nav-density-v10'));
const v9Pages={
 'hoc-tieng-han.html':'learning-hubs-v2.css?v=20261103-density-v9',
 'giao-tiep-phong-van.html':'learning-hubs-v2.css?v=20261103-density-v9',
 'kiem-tra-topik.html':'learning-hubs-v2.css?v=20261103-density-v9',
 'mrlee-bai-tap-pro.html':'learning-hubs-v2.css?v=20261103-density-v9',
 'van-hoa-han-quoc.html':'culture-landing-v2.css?v=20261103-density-v9',
 'ban-do-dai-hoc-han-quoc.html':'workspaces-v3.css?v=20261103-density-v9',
 'tuyen-sinh.html':'workspaces-v3.css?v=20261103-density-v9',
 'trung-tam-hoc-vien.html':'workspaces-v3.css?v=20261103-density-v9',
 'admin.html':'workspaces-v3.css?v=20261103-density-v9'
};
for(const [page,cssVer] of Object.entries(v9Pages)){
 const html=read(page);
 assert(html.includes(cssVer),'Old layout version on '+page);
 assert(html.includes('site-logo.css?v=20261103-glow-v1'),'Old logo version on '+page);
}
const innerPages=['hoc-theo-bai.html','giao-tiep-theo-chu-de.html','lo-trinh-topik.html',
 'on-luyen-phong-van.html','van-hoa-bai-hoc.html','bo-sach.html'];
const innerStyle='assets/branding/inner-layout-density-v1.css?v=20261103-density-v1';
assert(fs.existsSync(innerStyle.split('?')[0]),'Inner-page density CSS missing');
for(const page of innerPages){
 const html=read(page);
 assert(html.includes(innerStyle),'Compact inner-page CSS missing on '+page);
 assert(html.includes('site-logo.css?v=20261103-glow-v1'),'Logo outline CSS missing on '+page);
}
const deepCss=read('assets/branding/inner-layout-density-v1.css');
assert(deepCss.includes('data-mrlee-v24="courses"')&&
 deepCss.includes('data-mrlee-v25="conversation"')&&
 deepCss.includes('data-mrlee-v25="culture-story"'),
 'Deep page rules must be scoped, not globally override page contents');
const dockCSS=read('assets/branding/contact-dock.css');
const brandJS=read('assets/branding/site-logo.js');
assert(dockCSS.includes('#mrleeContactDock[data-open="true"] .mrlee-contact-links{display:grid}'),
 'Contact drawer must be collapsed by default and open as a grid');
assert(brandJS.includes('contact-dock.css?v=20261103-compact-v1'),
 'Shared logo loader must deploy new contact dock stylesheet');
for(const page of ['index.html',...Object.keys(v9Pages),...innerPages]){
 assert(read(page).includes('site-logo.js?v=20261103-dock-v1'),
  'Contact drawer cache version is stale: '+page);
}
console.log('SOURCE PASS UI V10: 16 pages linked, original-color glow, compact contact drawer and ordered cards.');

console.log('SOURCE PASS phase5: 10 layouts, no V1/V4/V5 injectors, protected routes, Admin, 5 JS syntax checks.');
