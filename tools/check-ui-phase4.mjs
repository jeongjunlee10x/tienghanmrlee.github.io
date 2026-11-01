/* MR LEE UI 2027 Phase 4 — deterministic static regression audit.
 * It verifies repository source, not live deployment or Firebase/Supabase authorization.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=(p)=>fs.readFileSync(p,'utf8');
const rebuilt=[
 ['hoc-tieng-han.html','learning',6],
 ['giao-tiep-phong-van.html','talk',4],
 ['kiem-tra-topik.html','topik',5],
 ['van-hoa-han-quoc.html','culture',0],
 ['ban-do-dai-hoc-han-quoc.html','map',0],
 ['trung-tam-hoc-vien.html','student',0]
];
const legacy=[
 'assets/mrlee-v4/page-system.css',
 'assets/mrlee-v5/compact-shell.css',
 'assets/mrlee-v4/page-system.js',
 'assets/mrlee-v5/compact-shell.js'
];
const scriptPath='assets/mrlee-dual-ui/theme.js';
const theme=read(scriptPath);
assert(theme.includes("const modern=html.matches("),'New page theme guard');
assert(theme.includes('if(modern){'),'Modern theme early return');
assert(theme.includes('primaryNav();decorate();portal();update(theme);entryPicker();'),'Old pages still supported');
const themeVersion='assets/mrlee-dual-ui/theme.js?v=20261102-phase4';
for(const [filename,kind,cards] of rebuilt){
 const s=read(filename);
 for(const url of legacy)assert(!s.includes(url),filename+' still loads obsolete '+url);
 assert(s.includes('data-mrlee-'+(kind==='culture'?'culture-v2="1"':kind==='map'||kind==='student'?'phase3="'+kind+'"':'hub-v2="'+kind+'"')),
  filename+' missing new UI opt-in');
 if(kind==='learning'||kind==='talk'||kind==='topik'){
  assert.equal((s.match(/class="mr27-item"/g)||[]).length,cards,filename+' V2 navigation count');
  assert(s.includes('assets/mrlee-ui2027/learning-hubs-v2.css'),filename+' missing new stylesheet');
 }
 if(kind==='culture'){
  assert(s.includes('id="topics"'),filename+' 22-topic list');
  assert(s.includes('mrlee-culture-v13.js'),filename+' culture core');
 }
 if(kind==='map'){
  for(const id of ['universitySearch','universityRegion','universityType','mrleeAdministrativeMap','universityCards','universityDetail'])
   assert(s.includes('id="'+id+'"'),filename+' missing map control '+id);
  assert(!s.includes('assets/mrlee-v2/experience.js'),'map still injecting legacy menu/footer');
 }
 if(kind==='student'){
  for(const id of ['studentEmail','levelFilter','attemptRows','eventRows','statAttempts'])
   assert(s.includes('id="'+id+'"'),filename+' missing student control '+id);
  assert(s.includes('src="auth-guard.js"'),'must keep auth guard');
 }
 if(kind!=='map')assert(s.includes(themeVersion),filename+' must refresh theme cache');
 console.log('PASS clean rebuilt page',filename,'module cards:',cards);
}
const homepage=read('index.html');
assert(homepage.includes(themeVersion),'Homepage cache version');
assert(homepage.includes('id="mrleeNewHome"'),'Homepage V2 present');
assert.equal((homepage.match(/class="mr27-tile"/g)||[]).length,8,'Homepage exactly 8 cards');
const admissions=read('tuyen-sinh.html'),admin=read('admin.html');
for(const s of [admissions,admin])assert(s.includes(themeVersion),'Non-hub theme cache refresh');
assert(admissions.includes('assets/branding/admissions-intake.js'),'Admissions popup preserved');
assert(admin.includes('id="authWrap"')&&admin.includes('id="loginForm"'),'Admin auth preserved');
assert(admin.includes('mrlee-placement-admin.js'),'Placement review preserved');
assert(admin.includes('assets/mrlee-dual-ui/admin-charts.js'),'Admin charts preserved');
const assets=[
 'assets/mrlee-ui2027/rebuild-home-v2.css',
 'assets/mrlee-ui2027/rebuild-home-v2.js',
 'assets/mrlee-ui2027/learning-hubs-v2.css',
 'assets/mrlee-ui2027/learning-hubs-v2.js',
 'assets/mrlee-ui2027/culture-landing-v2.css',
 'assets/mrlee-ui2027/workspaces-v3.css',
 'assets/mrlee-ui2027/workspaces-v3.js',
 'assets/v306/images/feature-2-ban-do.webp',
 'assets/v306/images/learning-roadmap.webp',
 'assets/mrlee-tuyen-sinh-cover.webp'
];
for(const p of assets)assert(fs.existsSync(p),'Missing source asset '+p);
const jsFiles=[
 'assets/mrlee-dual-ui/theme.js',
 'assets/mrlee-ui2027/rebuild-home-v2.js',
 'assets/mrlee-ui2027/learning-hubs-v2.js',
 'assets/mrlee-ui2027/culture-landing-v2.js',
 'assets/mrlee-ui2027/workspaces-v3.js'
];
for(const p of jsFiles){
 const result=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
 assert.equal(result.status,0,'Bad JS syntax '+p+' '+result.stderr);
}
console.log('PASS phase4: 6 clean subpages, no V4/V5 injectors, 8 updated theme-cache routes, 8 home cards, native admin/map/auth preserved, 5 JS syntax checks.');
