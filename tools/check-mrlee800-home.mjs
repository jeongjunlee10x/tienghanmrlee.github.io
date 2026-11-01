/* MR LEE 2027 — verify the *current* homepage and rebuilt subpage heroes.
 * Replaces the superseded MR LEE 800 auto-hero loader requirement.
 * Does not touch login, rewards, interviews or admin data.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const modern=[
 ['index.html','data-mrlee-redesign="v2"'],
 ['hoc-tieng-han.html','data-mrlee-hub-v2="learning"'],
 ['kiem-tra-topik.html','data-mrlee-hub-v2="topik"'],
 ['giao-tiep-phong-van.html','data-mrlee-hub-v2="talk"'],
 ['van-hoa-han-quoc.html','data-mrlee-culture-v2="1"'],
 ['ban-do-dai-hoc-han-quoc.html','data-mrlee-phase3="map"'],
 ['mrlee-bai-tap-pro.html','data-mrlee-hub-v2="workbook"'],
 ['trung-tam-hoc-vien.html','data-mrlee-phase3="student"'],
 ['admin.html','data-mrlee-phase3="admin"']
];
for(const [file,flag] of modern){
 const h=read(file);
 assert(h.includes(flag),'Current layout absent '+file);
 assert(!h.includes('assets/images/system/mrlee800-hero-loader.js'),
  'Legacy hero injector reappeared '+file);
}
const home=read('index.html');
const css=read('assets/mrlee-ui2027/rebuild-home-v2.css');
const homeJS=read('assets/mrlee-ui2027/rebuild-home-v2.js');
assert.equal((home.match(/class="mr27-tile"/g)||[]).length,8,'Home must have eight modules');
assert(home.includes('id="mrlee27Expand"')&&home.includes('id="mrlee27ThemeChange"'),'Progressive navigation or theme chooser absent');
assert(home.includes('id="ranking"')&&home.includes('id="contactDialog"'),'Legacy live ranking or consultation modal lost');
for(const img of [
 'assets/images/heroes/01-trang-chu-fresh.webp',
 'assets/images/heroes/01-trang-chu-future.webp'
]){
 assert(home.includes('src="'+img+'"'),'Unique home photo missing from page: '+img);
 const bin=fs.readFileSync(img);
 assert(bin.length>20000 && bin.toString('ascii',0,4)==='RIFF' && bin.toString('ascii',8,12)==='WEBP',
  'Image is too small/corrupt '+img);
}
for(const token of [
 'data-mrlee-theme="future"','grid-template-columns','@media(max-width:650px)',
 '@media(max-width:900px)','prefers-reduced-motion'
])assert(css.includes(token),'New home layout missing '+token);
assert(!home.includes('assets/branding/home-hero-overlay-v3.css'),'Superseded old hero CSS loaded');
assert(!home.includes('assets/branding/home-hero-split-v2.css'),'Superseded old split CSS loaded');
const syntax=spawnSync(process.execPath,['--check','assets/mrlee-ui2027/rebuild-home-v2.js'],{encoding:'utf8'});
assert.equal(syntax.status,0,syntax.stderr);
assert(homeJS.includes('mrleeSmartExpanded'),'User expansion control missing');
console.log('PASS MR LEE 2027: 9 clean modern pages, 2 real theme hero images, mobile-safe homepage, native ranking and consultation preserved.');
