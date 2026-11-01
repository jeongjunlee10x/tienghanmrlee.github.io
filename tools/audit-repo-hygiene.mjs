/* MR LEE final Git hygiene gate, 2026-11-02.
 * Read-only. Checks proven UI cleanup, stable links and preservation of data.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const has=p=>fs.existsSync(p);
const root=fs.readdirSync('.', {withFileTypes:true});
const unexpected=root.filter(x=>x.isFile()&&(/\.(?:cmd|ps1|zip)$/i.test(x.name))).map(x=>x.name);
assert.deepEqual(unexpected,[],'Old root-level installer/backup returned: '+unexpected.join(','));
assert(!has('FILES'),'Extracted installer FILES folder must stay archived with its manifest');
assert(has('archive/legacy-installers/FILES'),'Old installer source lost');
for(const script of ['01-CAP_NHAT.cmd','01-CAP_NHAT_SC.ps1','02-DAY_GITHUB.cmd','cap-nhat-v3.ps1','CAP_NHAT_V2_VA_DAY_GITHUB.ps1','DANH_SACH_FILE.txt'])
 assert(has('archive/legacy-installers/'+script),'Legacy installer or manifest lost: '+script);
const zipped=fs.readdirSync('archive/legacy-packages').filter(name=>name.endsWith('.zip'));
assert.equal(zipped.length,8,'Eight original dated ZIP packages must stay recoverable');
for(const name of zipped)assert(fs.statSync('archive/legacy-packages/'+name).size>100,'Archive invalid: '+name);
const oldCss=[
 'assets/mrlee-v2/smart-shell.js',
 'assets/mrlee-v2/smart-shell.css',
 'assets/mrlee-ui2027/smart-home-v1.css',
 'assets/branding/home-hero-overlay-v3.css',
 'assets/branding/home-hero-split-v2.css'
];
for(const f of oldCss)assert(!has(f),'Obsolete UI module unexpectedly re-added: '+f);
const home=read('index.html');
for(const redundant of ['id="mrleeFutureStart"','class="feature-cards"','class="journey"'])
 assert(!home.includes(redundant),'Duplicate expanded homepage component still exists '+redundant);
for(const core of ['id="mrleeNewHome"','id="schoolSearchForm"','id="ranking"','id="rankSlider"','id="contactDialog"','id="openContactHero"','id="mrlee27ThemeChange"','id="mrlee27Expand"'])
 assert(home.includes(core),'Critical homepage function lost '+core);
assert.equal((home.match(/class="mr27-tile"/g)||[]).length,8,'Homepage must keep exactly eight unique modules');
for(const img of ['assets/images/heroes/01-trang-chu-fresh.webp','assets/images/heroes/01-trang-chu-future.webp'])
 assert(has(img)&&home.includes('src="'+img+'"'),'Independent Fresh/Future hero missing: '+img);
for(const folder of ['MRLEE_AUDIO','MRLEE_PRO_AUDIO']){
 const catalog=has(folder)?fs.readdirSync(folder,{recursive:true}):[];
 const mp3=catalog.filter(name=>/\.mp3$/i.test(name)).length;
 assert(mp3>1000,'Active learning audio catalog missing: '+folder+' (MP3='+mp3+')');
}
const talk=read('giao-tiep-theo-chu-de.html');
for(const runtime of ['assets/mrlee-v4/page-system.js','assets/mrlee-v5/compact-shell.js'])
 assert(has(runtime)&&talk.includes(runtime),'Still-active legacy speaking runtime lost '+runtime);
const form=read('dang-ky-tu-van.html');
assert(has('assets/mrlee-v2/experience.js')&&form.includes('assets/mrlee-v2/experience.js'),
 'Consultation still depends on preserved experience runtime');
for(const file of ['admin.html','mrlee-bai-tap-pro.html','trung-tam-hoc-vien.html']){
 const s=read(file);assert(s.includes('auth-guard.js')||file==='admin.html','Protected layout regressed '+file);
}
assert(has('docs/GIT_REPO_STRUCTURE_2026-11-02.md'),'Structure map documentation missing');
const scripts=['assets/mrlee-ui2027/rebuild-home-v2.js','assets/mrlee-ui2027/learning-hubs-v2.js','assets/mrlee-ui2027/workspaces-v3.js'];
for(const file of scripts){
 const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(r.status,0,'JavaScript syntax: '+file+'\n'+r.stderr);
}
console.log('PASS MR LEE FINAL GIT HYGIENE: 0 root ZIP/CMD/PS1, 8 archived ZIP, 5 obsolete UI modules removed, 3 duplicate home sections removed, 8 real home cards, 2 live audio catalogs preserved.');
