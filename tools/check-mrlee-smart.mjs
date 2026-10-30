/* MR LEE V3 — static release preflight. No network and no student records. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),problems=[];
const files=['assets/mrlee-v2/smart-shell.css','assets/mrlee-v2/smart-shell.js','index.html','admin.html'];
const must=(file)=>{const p=path.join(root,file);if(!fs.existsSync(p)){problems.push('Missing: '+file);return'';}return fs.readFileSync(p,'utf8')};
const [css,js,index,admin]=files.map(must);
for(const file of [files[1]]){const x=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});if(x.status!==0)problems.push('Syntax: '+file+' '+x.stderr.slice(0,300))}
const photos=['feature-5-hoc-tieng-han.webp','learning-cap-2.webp','feature-6-thi-topik.webp','step-1-tu-van.webp','culture.webp','feature-2-ban-do.webp','learning-roadmap.webp'];
for(const asset of photos){if(!fs.existsSync(path.join(root,'assets/v306/images',asset)))problems.push('Missing real WebP: '+asset)}
if(new Set(photos).size!==photos.length)problems.push('Duplicate topic hero image file');
if(!index.includes('smart-shell.js')||!admin.includes('smart-shell.js'))problems.push('Home or Admin not connected to smart theme');
if(!index.includes('assets/branding/logo-mrlee.png')||!admin.includes('assets/branding/logo-mrlee.png'))problems.push('Brand logo missing');
for(const part of ['data-mrlee-smart-home','mrlee-smart-home-card','data-mrlee-smart-expanded','mrlee-smart-admin-hero','mrlee-smart-admin-actions'])if(!css.includes(part)&&!js.includes(part))problems.push('Smart component missing: '+part);
for(const href of ['hoc-tieng-han.html','giao-tiep-theo-chu-de.html','kiem-tra-topik.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html','ban-do-dai-hoc-han-quoc.html','trung-tam-hoc-vien.html','mrlee-bai-tap-pro.html','kiem-tra-dau-vao.html','dang-ky-tu-van.html','bang-xep-hang.html']){
 if(!js.includes(href))problems.push('Missing V3 link: '+href);
 if(!fs.existsSync(path.join(root,href)))problems.push('Route does not exist: '+href);
}
if(!css.includes('.mrlee-smart-home-hub,.mrlee-smart-admin-hero,.mrlee-smart-admin-actions{display:none!important}'))problems.push('Fresh theme isolation missing');
if(!css.includes('grid-template-columns:minmax(218px,238px)')||!css.includes('word-break:keep-all')||!css.includes('object-fit:contain'))problems.push('Admin sidebar brand protection missing');
if(!css.includes('url("../v303/hero-glasses.webp")'))problems.push('Visible hero-cover image missing');
if(!fs.existsSync(path.join(root,'assets/v303/hero-glasses.webp')))problems.push('Actual hero-cover file does not exist');
if(!css.includes('#page-overview>.kpis')||!css.includes('#page-overview>.grid-2'))problems.push('Repeated admin analytics not hidden');
// V32 intentionally removes the second Admin shortcut toolbar. The existing
// authenticated side menu is canonical; don't demand a redundant "Add student" button.
const adminHtml=fs.readFileSync(path.join(root,'admin.html'),'utf8');
if(!js.includes('mrleeSmartExpanded')||!js.includes('overview.prepend(hero)')||
   !adminHtml.includes('data-nav="students"')||!adminHtml.includes('data-nav="scores"'))
  problems.push('Progressive navigation or canonical Admin sidebar missing');
if(js.includes("mrlee-smart-admin-actions');controls"))problems.push('Redundant Admin shortcut toolbar came back');
if(js.includes('innerHTML')||js.includes('service_role'))problems.push('Unsafe HTML or key use in V3 JS');
console.log('MR LEE SMART V3: visual assets, home menu, Admin layout, logo, JS syntax');
if(problems.length){problems.forEach(x=>console.error('FAIL '+x));process.exitCode=1}
else console.log('PASS — '+photos.length+' distinct pre-existing WebP, 11 valid routes, immutable brand and safe foldout');
