/** MR LEE NEXT — focused deployment gate, free Node 22 / no dependencies.
 * Checks real assets, navigation and JS syntax without reading student data.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=path.resolve('.');
const pages=['index.html','hoc-tieng-han.html','giao-tiep-theo-chu-de.html','kiem-tra-topik.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html','ban-do-dai-hoc-han-quoc.html','trung-tam-hoc-vien.html','mrlee-bai-tap-pro.html','tuyen-sinh.html','admin.html','dang-ky-tu-van.html','quy-tac-diem-mrlee.html','bang-diem-tuan-v12.html'];
const scripts=['assets/mrlee-dual-ui/theme.js','assets/mrlee-dual-ui/admin-charts.js','assets/mrlee-next/consultation.js','assets/mrlee-next/consultation-admin.js','mrlee-placement-admin.js','assets/mrlee-v2/experience.js','tools/audit-mrlee-rewards.mjs'];
const scenes=['home','learning','speaking','topik','interview','culture','universities','workbook','profile','admin','consultation'];
let errors=[];
const exists=(f)=>fs.existsSync(path.join(root,f));
for(const f of [...pages,...scripts,'assets/mrlee-next/premium.css','assets/mrlee-next/consultation-admin.css','assets/mrlee-v2/primary-nav.css','assets/mrlee-v2/experience.css','assets/branding/logo-mrlee.png',...scenes.map(x=>'assets/mrlee-next/scenes/'+x+'.svg')])if(!exists(f))errors.push('MISSING: '+f);
for(const f of scripts){if(!exists(f))continue;const run=spawnSync(process.execPath,['--check',path.join(root,f)],{encoding:'utf8'});if(run.status!==0)errors.push('SYNTAX: '+f+' '+run.stderr.slice(0,500))}
const local=/<(?:script|link|img|audio|video|a)\b[^>]*?\b(?:src|href)\s*=\s*["']([^"'#]+)["']/gi;
for(const page of pages){
 if(!exists(page))continue;
 const html=fs.readFileSync(path.join(root,page),'utf8');
 if(!/assets\/branding\/logo-mrlee\.png|site-logo\.js/.test(html))errors.push('OFFICIAL LOGO: '+page);
 for(const m of html.matchAll(local)){
   const value=m[1].trim();
   if(!value||/^(https?:|mailto:|tel:|data:|javascript:|\/\/|blob:)/i.test(value))continue;
   const relative=decodeURIComponent(value.split(/[?#]/)[0]);if(!relative)continue;
   const target=path.resolve(path.dirname(path.join(root,page)),relative);
   if(!target.startsWith(root+path.sep)){errors.push('PATH ESCAPE: '+page+' '+value);continue}
   if(!fs.existsSync(target))errors.push('BROKEN: '+page+' -> '+value);
 }
}
const theme=exists(scripts[0])?fs.readFileSync(path.join(root,scripts[0]),'utf8'):'';
for(const x of ['mrlee-next-portal','MRLEE.THEME.V1','portal()','assets/mrlee-next/premium.css'])if(!theme.includes(x))errors.push('THEME MISSING: '+x);
for(const m of theme.matchAll(/'([a-z0-9-]+\.html(?:\?[^']*)?)'/gi)){
 const f=m[1].split('?')[0];if(!exists(f))errors.push('BROKEN DYNAMIC PORTAL LINK: '+f);
}

// Admin V4 keeps protected data sections and uses existing RLS-based auth.
const adminV4=exists('admin.html')?fs.readFileSync('admin.html','utf8'):'';
for(const x of [
 'assets/mrlee-admin/layout-v4.css','assets/mrlee-admin/layout-v4.js',
 'id="pageSubtitle"','id="refresh"','id="mrlee27AdminNotice"',
 'data-mrlee27-nav="placements"','data-mrlee27-nav="consultations"',
 'id="studentsTbody"','id="scoresTbody"','id="rewardClaimsTbody"',
 'id="authWrap"','function isAdmin(uid)','mrlee_admins'
])if(!adminV4.includes(x))errors.push('ADMIN V4 MISSING: '+x);
const adminLayoutJS='assets/mrlee-admin/layout-v4.js';
if(!exists(adminLayoutJS))errors.push('ADMIN V4 LAYOUT JS MISSING');
else {
 const adminLayoutSource=fs.readFileSync(adminLayoutJS,'utf8');
 for(const key of ['overview','students','scores','all-attempts','activity','placements','consultations','rewards','settings'])
  if(!adminLayoutSource.includes(key+':[')&&!adminLayoutSource.includes("'"+key+"':["))errors.push('ADMIN V4 NAV KEY: '+key);
 const adminSyntax=spawnSync(process.execPath,['--check',path.join(root,adminLayoutJS)],{encoding:'utf8'});
 if(adminSyntax.status!==0)errors.push('ADMIN V4 SYNTAX: '+adminSyntax.stderr.slice(0,300));
}
// Placement exam contrast regression: both themes must keep legible question,
 // form and result surfaces even though shared Future theme sets dark panels.
const placement=exists('kiem-tra-dau-vao.html')?fs.readFileSync('kiem-tra-dau-vao.html','utf8'):'';
for(const marker of [
  'id="mrlee-placement-contrast-v2"',
  'html[data-mrlee-v23="exam"] .shell #intro',
  'html[data-mrlee-v23="exam"] .shell .option',
  'html[data-mrlee-v23="exam"] .shell #results .lesson-row',
  'html[data-mrlee-v23="exam"] .shell #results .correct-text',
  'html[data-mrlee-v23="exam"] .shell #results .incorrect-text',
  'html[data-mrlee-v23="exam"] .shell #mrlee-placement-save'
])if(!placement.includes(marker))errors.push('PLACEMENT CONTRAST MISSING: '+marker);
if(placement.match(/id="mrlee-placement-contrast-v2"/g)?.length!==1)
  errors.push('PLACEMENT CONTRAST DUPLICATED');
if(placement.indexOf('id="mrlee-placement-contrast-v2"')<placement.indexOf('assets/mrlee-dual-ui/theme.css'))
  errors.push('PLACEMENT CONTRAST BEFORE GLOBAL THEME');
if(!placement.includes('id="mrleePlacementConsent"')||!placement.includes('id="results"'))
  errors.push('PLACEMENT FLOW LOST');

// R1 release guards: real six-section navigation, Admin counts from RLS,
// and presentation labels which cannot silently drift back to sample totals.
const navCssFile='assets/mrlee-v2/primary-nav.css';
if(!exists(navCssFile))errors.push('V2 NAV CSS MISSING');
else if(!fs.readFileSync(navCssFile,'utf8').includes('.mrlee-v2-primary-nav { display:none; }'))errors.push('FRESH THEME NAV LEAK');
for(const x of ['function primaryNav()','assets/mrlee-v2/primary-nav.css','Bản đồ các trường ĐH Hàn Quốc']){
 if(!theme.includes(x))errors.push('V2 NAV MISSING: '+x);
}
const adminCharts=exists('assets/mrlee-dual-ui/admin-charts.js')?fs.readFileSync('assets/mrlee-dual-ui/admin-charts.js','utf8'):'';
if(!adminCharts.includes("select('id,level,last_activity_at',{count:'exact'})"))errors.push('ADMIN STUDENT TOTAL NOT SERVER-COUNTED');
if(!adminCharts.includes('activeTotal:activeCount.error?null:activeCount.count'))errors.push('ADMIN ACTIVE KPI NOT SERVER-COUNTED');
const admin=exists('admin.html')?fs.readFileSync('admin.html','utf8'):'';
for(const marker of [
  "id=\"forgotPassword\"","id=\"forgotForm\"","id=\"newPasswordForm\"",
  "resetPasswordForEmail","event==='PASSWORD_RECOVERY'","updateUser({password})",
  "if(!await isAdmin(data.user.id))"
])if(!admin.includes(marker))errors.push('ADMIN AUTH RECOVERY MISSING: '+marker);

if(admin.includes('Tiếng HÃ n'))errors.push('ADMIN TITLE MOJIBAKE');
const ctxScript=exists('assets/mrlee-v2/experience.js')?fs.readFileSync('assets/mrlee-v2/experience.js','utf8'):'';
for(const x of ['index.html','hoc-tieng-han.html','giao-tiep-theo-chu-de.html','kiem-tra-topik.html','mrlee-bai-tap-pro.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html','ban-do-dai-hoc-han-quoc.html','trung-tam-hoc-vien.html','dang-ky-tu-van.html'])if(!ctxScript.includes("'"+x+"'"))errors.push('V2 EXPERIENCE ROUTE: '+x);
for(const x of ['assets/mrlee-v2/experience.css','assets/mrlee-v2/experience.js'])if(!theme.includes(x))errors.push('THEME NOT WIRED: '+x);
// The university map has its own V3 layout and deliberately no longer
// loads the legacy experience.js menu injector. The consultation form
// remains on its original standalone layout until redesigned.
for(const p of ['ban-do-dai-hoc-han-quoc.html','dang-ky-tu-van.html']){
 const html=exists(p)?fs.readFileSync(p,'utf8'):'';
 const required=p==='ban-do-dai-hoc-han-quoc.html'
  ? ['assets/mrlee-ui2027/workspaces-v3.css','assets/mrlee-ui2027/workspaces-v3.js','assets/mrlee-next/university-map.js','assets/mrlee-geo/university-admin-map.js']
  : ['assets/mrlee-v2/experience.css','assets/mrlee-v2/experience.js','assets/mrlee-v2/primary-nav.css'];
 for(const x of required)if(!html.includes(x))errors.push('STANDALONE DESIGN MISSING: '+p+' -> '+x);
 if(p==='ban-do-dai-hoc-han-quoc.html' && html.includes('assets/mrlee-v2/experience.js'))
  errors.push('MAP STILL LOADS DUPLICATE LEGACY MENU');
}
const consultJs=exists('assets/mrlee-next/consultation.js')?fs.readFileSync('assets/mrlee-next/consultation.js','utf8'):'';
if(!consultJs.includes('server-issued reference'))errors.push('CONSULT RECEIPT MISSING');
if(!adminCharts.includes('openLeads:openLeadsCount.error')||!adminCharts.includes('reviewable:reviewCount.error'))errors.push('ADMIN CRM/REVIEW KPIS MISSING');

for(const x of ['consultation-admin.js','admin-charts.js','MRLEE_ADMIN_PLACEMENT_BRIDGE','logo-mrlee.png'])if(!admin.includes(x))errors.push('ADMIN MISSING: '+x);
const form=exists('dang-ky-tu-van.html')?fs.readFileSync('dang-ky-tu-van.html','utf8'):'';
for(const x of ['cf-turnstile','mrleeConsultConsent','mrleeConsultReceipt','logo-mrlee.png'])if(!form.includes(x))errors.push('CONSULT MISSING: '+x);
const rules=exists('quy-tac-diem-mrlee.html')?fs.readFileSync('quy-tac-diem-mrlee.html','utf8'):'';
if(!rules.includes('không phải điểm TOPIK chính thức'))errors.push('REWARD DISCLOSURE MISSING');
console.log('MR LEE QA NEXT — '+pages.length+' trang · '+scripts.length+' script · '+scenes.length+' đồ họa theo chủ đề.');
if(errors.length){for(const e of errors)console.error(e);console.error('FAILED '+errors.length+' checks');process.exit(1)}
console.log('PASS — paths, original logo, functions, privacy labels and JS syntax.');
