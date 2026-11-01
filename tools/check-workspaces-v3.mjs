import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const pages=[
 ['ban-do-dai-hoc-han-quoc.html','map'],
 ['tuyen-sinh.html','admission'],
 ['trung-tam-hoc-vien.html','student'],
 ['admin.html','admin']
];
const read=p=>fs.readFileSync(p,'utf8');
const css=read('assets/mrlee-ui2027/workspaces-v3.css');
const js=read('assets/mrlee-ui2027/workspaces-v3.js');
for(const [path,kind] of pages){
 const s=read(path);
 assert(s.includes('data-mrlee-phase3="'+kind+'"'),path+' phase attr');
 assert(s.includes('assets/mrlee-ui2027/workspaces-v3.css?v=20261101-p3'),path+' stylesheet');
 assert(s.includes('assets/mrlee-ui2027/workspaces-v3.js?v=20261101-p3'),path+' js');
 assert(s.includes('assets/branding/logo-mrlee.png'),path+' original logo');
 assert(css.includes('data-mrlee-phase3="'+kind+'"'),'missing '+kind+' CSS');
}
const map=read(pages[0][0]);
for(const id of ['mapSchoolStat','mapCampusStat','mapVerifiedStat','universitySearch','universityRegion','universityType','universityClear','mrleeRegionList','mrleeAdministrativeMap','universityDetail','universityCount','universityCards','universityMore'])
 assert.equal((map.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'map selector '+id);
assert(map.includes('mrlee-next-hero mrlee27-map-intro'));
assert(map.includes('mrlee27-map-quick'));
assert(map.includes('assets/mrlee-geo/university-admin-map.js'),'map boundary runtime preserved');
assert(map.includes('assets/mrlee-next/university-map.js'),'map filtering runtime preserved');
assert(map.includes('id="ky-tuc-xa"'),'dorm section preserved');
assert(fs.existsSync('assets/v306/images/feature-2-ban-do.webp'),'map art');
const admissions=read(pages[1][0]);
for(const id of ['ts-title','noi-dung','tsNavigation','tsLogo','tu-van-nhanh','chuong-trinh','chon-truong','lo-trinh','dang-ky'])
 assert(admissions.includes('id="'+id+'"'),'admissions anchor '+id);
assert(admissions.includes('mrlee27-admission-steps'));
assert(admissions.includes('assets/branding/admissions-intake.js'),'admissions wizard preserved');
assert(admissions.includes('assets/mrlee-tuyen-sinh.js'),'admissions core preserved');
assert(fs.existsSync('assets/mrlee-tuyen-sinh-cover.webp'),'admissions cover');
const student=read(pages[2][0]);
for(const id of ['studentEmail','levelFilter','refreshBtn','status','statAttempts','statAverage','statUnique','statEvents','attemptRows','eventRows'])
 assert(student.includes('id="'+id+'"'),'student data anchor '+id);
assert(student.includes('mrlee27-student-photo')&&student.includes('mrlee27-student-links'));
assert(student.includes('src="auth-guard.js"'),'student auth guard preserved');
assert(student.includes('src="mrlee-student.js"'),'student data runtime preserved');
assert(student.includes('ml-home-tools'),'existing AI and audio tools preserved');
assert(fs.existsSync('assets/v306/images/learning-roadmap.webp'),'student cover');
const admin=read(pages[3][0]);
for(const id of ['authWrap','setupForm','loginForm','app','page-overview','page-students','page-scores','page-activity','page-rewards','page-settings','kpiStudents','kpiScores','syncStatus','modalBackdrop','logout'])
 assert(admin.includes('id="'+id+'"'),'Admin data or auth anchor '+id);
assert(admin.includes('mrlee27-admin-focus'));
assert(admin.includes('data-mrlee27-nav="placements"')&&admin.includes('data-mrlee27-nav="consultations"'));
assert(admin.includes('mrlee-placement-admin.js'),'placement review still loaded');
assert(admin.includes('assets/mrlee-dual-ui/admin-charts.js'),'real chart logic preserved');
assert(js.includes("classList.contains('hidden')"),'admin shortcut must not bypass auth');
assert(js.includes("target.click()"),'native menu dispatch required');
assert(!js.includes('service_role'),'no service secret names in client enhancements');
for(const filename of ['assets/mrlee-ui2027/workspaces-v3.js']){
 const r=spawnSync(process.execPath,['--check',filename],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
}
const count=s=>{let c=0;for(const char of s){if(char==='{')c++;if(char==='}')c--;}return c;};
assert.equal(count(css),0,'CSS braces mismatch');
console.log('PASS MR LEE Phase3: 4 rebuilt pages, map interactions, admissions intake, personal data controls, private Admin auth+charts and CSS/JS syntax preserved.');
