/* MR LEE V4 production preflight. Real WebP pixels + routes, no fixture data. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const root=process.cwd(),errors=[];
const exists=p=>fs.existsSync(path.join(root,p));
const read=p=>exists(p)?fs.readFileSync(path.join(root,p),'utf8'):'';
const pages=['hoc-tieng-han.html','giao-tiep-theo-chu-de.html','kiem-tra-topik.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html','ban-do-dai-hoc-han-quoc.html','mrlee-bai-tap-pro.html','trung-tam-hoc-vien.html'];
const source=read('assets/mrlee-v4/page-system.js');
const css=read('assets/mrlee-v4/page-system.css');
const jscheck=spawnSync(process.execPath,['--check','assets/mrlee-v4/page-system.js'],{encoding:'utf8'});
if(jscheck.status!==0)errors.push('JS syntax: '+jscheck.stderr.slice(0,300));
if(!source.includes('const defs=')||!source.includes('const cfg='))errors.push('Missing page data map');
const defsSource=source.split('const defs=')[1]?.split(';\nconst cfg=')[0];
let defs={};try{defs=new Function('"use strict";return ('+defsSource+')')()}catch(e){errors.push('Invalid config: '+e.message)}
const assetIndex=new Map();
for(const page of pages){
 if(!exists(page)){errors.push('MISSING HTML '+page);continue}
 const html=read(page);
 if(!html.includes('assets/mrlee-v4/page-system.js')||!html.includes('assets/mrlee-v4/page-system.css'))errors.push('MISSING V4 WIRING '+page);
 const cfg=defs[page];
 if(!cfg){errors.push('MISSING V4 DEFINITION '+page);continue}
 const files=[cfg.image,...cfg.cards.map(row=>row[3]),...cfg.tools.map(row=>row[2])],seen=new Map();
 for(const filename of files){
  if(!/^[-a-z0-9]+\.webp$/.test(filename)){errors.push('INVALID IMAGE NAME '+filename);continue}
  const rel='assets/v306/images/'+filename;
  if(!exists(rel)){errors.push('MISSING WEBP '+rel);continue}
  let digest=assetIndex.get(filename);
  if(!digest){
   const buf=fs.readFileSync(path.join(root,rel));
   if(buf.length<70000||buf.subarray(0,4).toString()!=='RIFF'||buf.subarray(8,12).toString()!=='WEBP')errors.push('LOW QUALITY OR CORRUPT WEBP '+rel);
   digest=crypto.createHash('sha256').update(buf).digest('hex');
   assetIndex.set(filename,digest);
  }
  if(seen.has(digest))errors.push('SAME IMAGE IN '+page+': '+filename+' = '+seen.get(digest));
  else seen.set(digest,filename);
 }
 for(const row of [...cfg.cards,...cfg.tools]){
  const target=row[2]&&row.length===4?row[2]:row[1];
  if(typeof target!=='string')continue;
  if(target.startsWith('#')){
   if(!html.includes('id="'+target.slice(1)+'"')&&!html.includes("id='"+target.slice(1)+"'"))errors.push('MISSING ANCHOR '+page+' '+target);
  }else{
   const file=target.split('?')[0];if(!exists(file))errors.push('BAD LINK '+page+' -> '+target);
  }
 }
 for(const link of [cfg.cta,cfg.secondary]){
  const target=link[1];if(target.startsWith('#')){if(!html.includes('id="'+target.slice(1)+'"'))errors.push('CTA ANCHOR '+page+' -> '+target)}
  else if(!exists(target.split('?')[0]))errors.push('CTA LINK '+page+' -> '+target)
 }
}
for(const clause of ['html[data-mrlee-theme="fresh"][data-mrlee-v4]','html[data-mrlee-theme="future"][data-mrlee-v4]','.mrlee-v4-hero','.mrlee-v4-directory-grid','.mrlee-v4-old-hero'])if(!css.includes(clause))errors.push('STYLING MISSING '+clause);
if(!source.includes('main.prepend(shell)')||!source.includes("d.createElement")||source.includes('service_role'))errors.push('BAD BOOT OR UNSAFE SECRET');
if(!read('index.html').includes('assets/branding/logo-mrlee.png')||!read('admin.html').includes('assets/branding/logo-mrlee.png'))errors.push('OFFICIAL LOGO INVALID');
if(errors.length){errors.forEach(e=>console.error('FAIL '+e));process.exitCode=1}
else console.log('PASS MR LEE V4: 8 pages, real '+assetIndex.size+' WebP images, no within-page image duplicates, verified routes and both theme palettes.');
