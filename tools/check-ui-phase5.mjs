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
for(const id of ['mrleeNewHome','mrlee27Expand','mrlee27ThemeChange'])
 assert(read('index.html').includes('id="'+id+'"'),'Home interaction missing '+id);
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
console.log('SOURCE PASS phase5: 10 layouts, no V1/V4/V5 injectors, protected routes, Admin, 5 JS syntax checks.');
