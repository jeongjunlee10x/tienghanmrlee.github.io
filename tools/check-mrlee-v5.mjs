/* MR LEE V5: test one-screen controls and progressive disclosure without external accounts. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const errors=[];
const root=process.cwd();
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const exists=name=>fs.existsSync(path.join(root,name));
const pages=['hoc-tieng-han.html','giao-tiep-theo-chu-de.html','kiem-tra-topik.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html','ban-do-dai-hoc-han-quoc.html','mrlee-bai-tap-pro.html','trung-tam-hoc-vien.html'];
for(const pathname of ['assets/mrlee-v5/compact-shell.js','assets/mrlee-v4/page-system.js']){
 const p=spawnSync(process.execPath,['--check',pathname],{encoding:'utf8'});
 if(p.status!==0)errors.push('SYNTAX: '+pathname+' '+p.stderr.slice(0,250));
}
const css=read('assets/mrlee-v5/compact-shell.css');
const js=read('assets/mrlee-v5/compact-shell.js');
for(const page of pages){
 if(!exists(page)){errors.push('MISSING: '+page);continue}
 const html=read(page);
 for(const link of ['assets/mrlee-v5/compact-shell.css','assets/mrlee-v5/compact-shell.js']){
  if(html.split(link).length!==2)errors.push('MISSING OR DUPLICATED CONTROL FILE: '+page+' -> '+link);
 }
}
for(const marker of [
 'data-mrlee-v4-compact','data-mrlee-v4-folded','min-width:980px','min-height:650px',
 'grid-template-columns:repeat(var(--v5-card-count','grid-template-columns:repeat(var(--v5-tool-count',
 '.mrlee-v5-open-detail','.mrlee-v4-root ~ :is(nav,section,article,div,aside,header)',
 '--v5-height','max-height:100svh',
 'html[data-mrlee-v4] .mrlee-v4-live-intro',
 '@media(max-width:979px)','@media(max-width:560px)'
 ])if(!css.includes(marker))errors.push('COMPACT CSS REGRESSION: '+marker);
for(const marker of [
 'window.innerHeight','getBoundingClientRect','measure()','aria-expanded',
 'hashchange',"scrollIntoView",'resize','data-mrlee-v4-folded','root.dataset.mrleeV4Folded',
 'window.scrollTo','requestAnimationFrame'
 ])if(!js.includes(marker))errors.push('COMPACT JS REGRESSION: '+marker);
if(js.includes('localStorage')||js.includes('service_role')||js.includes('innerHTML'))errors.push('UNEXPECTED STATE WRITES/HTML OR SECRETS');
if(!js.includes('event.target.closest')||!js.includes("a[href^=\"#\"]"))errors.push('INTERNAL ANCHORS CANNOT OPEN NATIVE WORKFLOW');
const v4=read('assets/mrlee-v4/page-system.js');
const defsText=v4.split('const defs=')[1]?.split(';\nconst cfg=')[0];
let defs;try{defs=new Function('return ('+defsText+')')()}catch(err){errors.push('INVALID V4 DEFINITIONS: '+err.message)}
const learning=defs?.['hoc-tieng-han.html'];
if(!learning||learning.cards.length!==6||learning.tools.length!==6)errors.push('LEARNING MUST HAVE SIX LEVELS AND SIX FUNCTION CONTROLS');
if(learning){
 const all=[...learning.cards.map(x=>x[2]),...learning.tools.map(x=>x[1])];
 if(all.length!==new Set(all).size)errors.push('LEARNING BUTTON LINK DUPLICATED');
 for(const href of all){const filename=href.split('?')[0];if(!exists(filename))errors.push('BROKEN LEARNING BUTTON: '+href)}
}
if(errors.length){errors.forEach(x=>console.error('FAIL '+x));process.exitCode=1}
else console.log('PASS MR LEE V5: 8 pages with progressive fold; learning 6 level + 6 distinct tools; compact desktop with safe mobile fallback.');
