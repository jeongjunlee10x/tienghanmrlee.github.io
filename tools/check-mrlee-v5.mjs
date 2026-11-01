/* MR LEE V5: test one-screen controls and progressive disclosure without external accounts. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const errors=[];
const root=process.cwd();
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const exists=name=>fs.existsSync(path.join(root,name));
const pages=['giao-tiep-theo-chu-de.html']; // remaining legacy V4/V5 page; other hubs were rebuilt in 2027 V2/V3
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
 'hashchange',"scrollIntoView",'resize','root.dataset.mrleeV4Folded',
 'window.scrollTo','requestAnimationFrame'
 ])if(!js.includes(marker))errors.push('COMPACT JS REGRESSION: '+marker);
if(js.includes('localStorage')||js.includes('service_role')||js.includes('innerHTML'))errors.push('UNEXPECTED STATE WRITES/HTML OR SECRETS');
if(!js.includes('event.target.closest')||!js.includes("a[href^=\"#\"]"))errors.push('INTERNAL ANCHORS CANNOT OPEN NATIVE WORKFLOW');
const v4=read('assets/mrlee-v4/page-system.js');
const defsText=v4.split('const defs=')[1]?.split(';\nconst cfg=')[0];
let defs;try{defs=new Function('return ('+defsText+')')()}catch(err){errors.push('INVALID V4 DEFINITIONS: '+err.message)}
const speaking=defs?.['giao-tiep-theo-chu-de.html'];
if(!speaking||speaking.cards.length!==4||speaking.tools.length!==4)errors.push('LEGACY SPEAKING PAGE MUST KEEP FOUR CARDS AND FOUR TOOLS');
for(const href of [...(speaking?.cards||[]).map(x=>x[2]),...(speaking?.tools||[]).map(x=>x[1])]){
 if(href.startsWith('#'))continue;
 if(!exists(href.split('?')[0]))errors.push('BROKEN LEGACY SPEAKING LINK: '+href)
}
if(errors.length){errors.forEach(x=>console.error('FAIL '+x));process.exitCode=1}
else console.log('PASS MR LEE V5: one remaining legacy speaking page; native topic links and compact/mobile fallback intact.');
