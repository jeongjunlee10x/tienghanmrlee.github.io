/** MR LEE NEXT — focused deployment gate, free Node 22 / no dependencies.
 * Checks real assets, navigation and JS syntax without reading student data.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=path.resolve('.');
const pages=['index.html','hoc-tieng-han.html','giao-tiep-theo-chu-de.html','kiem-tra-topik.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html','ban-do-dai-hoc-han-quoc.html','trung-tam-hoc-vien.html','mrlee-bai-tap-pro.html','tuyen-sinh.html','admin.html','dang-ky-tu-van.html','quy-tac-diem-mrlee.html','bang-diem-tuan-v12.html'];
const scripts=['assets/mrlee-dual-ui/theme.js','assets/mrlee-dual-ui/admin-charts.js','assets/mrlee-next/consultation.js','assets/mrlee-next/consultation-admin.js','mrlee-placement-admin.js'];
const scenes=['home','learning','speaking','topik','interview','culture','universities','workbook','profile','admin','consultation'];
let errors=[];
const exists=(f)=>fs.existsSync(path.join(root,f));
for(const f of [...pages,...scripts,'assets/mrlee-next/premium.css','assets/mrlee-next/consultation-admin.css','assets/branding/logo-mrlee.png',...scenes.map(x=>'assets/mrlee-next/scenes/'+x+'.svg')])if(!exists(f))errors.push('MISSING: '+f);
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
if(admin.includes('Tiếng HÃ n'))errors.push('ADMIN TITLE MOJIBAKE');
for(const x of ['consultation-admin.js','admin-charts.js','MRLEE_ADMIN_PLACEMENT_BRIDGE','logo-mrlee.png'])if(!admin.includes(x))errors.push('ADMIN MISSING: '+x);
const form=exists('dang-ky-tu-van.html')?fs.readFileSync('dang-ky-tu-van.html','utf8'):'';
for(const x of ['cf-turnstile','mrleeConsultConsent','mrleeConsultReceipt','logo-mrlee.png'])if(!form.includes(x))errors.push('CONSULT MISSING: '+x);
const rules=exists('quy-tac-diem-mrlee.html')?fs.readFileSync('quy-tac-diem-mrlee.html','utf8'):'';
if(!rules.includes('không phải điểm TOPIK chính thức'))errors.push('REWARD DISCLOSURE MISSING');
console.log('MR LEE QA NEXT — '+pages.length+' trang · '+scripts.length+' script · '+scenes.length+' đồ họa theo chủ đề.');
if(errors.length){for(const e of errors)console.error(e);console.error('FAILED '+errors.length+' checks');process.exit(1)}
console.log('PASS — paths, original logo, functions, privacy labels and JS syntax.');
