// MR LEE 800 static test: do not mistake planned art for generated artwork.
// Preserve navigation, ranking, forms, login and responsive scrolling.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const errors=[];
const pages=['index.html','hoc-tieng-han.html','giao-tiep-theo-chu-de.html','kiem-tra-topik.html','mrlee-topik-pro.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html','ban-do-dai-hoc-han-quoc.html','mrlee-bai-tap-pro.html','trung-tam-hoc-vien.html','admin.html'];
const css=fs.readFileSync('assets/images/system/mrlee800-home-fit.css','utf8');
const js=fs.readFileSync('assets/images/system/mrlee800-hero-loader.js','utf8');
const syntax=spawnSync(process.execPath,['--check','assets/images/system/mrlee800-hero-loader.js'],{encoding:'utf8'});
if(syntax.status!==0)errors.push('Invalid hero loader: '+syntax.stderr);
for(const p of pages){
 const html=fs.readFileSync(p,'utf8');
 if(!html.includes('assets/images/system/mrlee800-hero-loader.js'))errors.push(p+': missing hero loader');
 if(p==='index.html'){
  if(!html.includes('assets/images/system/mrlee800-home-fit.css'))errors.push('Homepage has no compact stylesheet');
  for(const tag of ['id="mainContent"','class="hero"','class="feature-cards"','class="search-strip"','id="ranking"','class="journey"','id="contactDialog"','class="contact-rail"'])
   if(!html.includes(tag))errors.push('Lost homepage feature '+tag);
  if(!html.includes('logo-mrlee.png'))errors.push('Official logo was lost');
 }
}
for(const val of ['(min-width:1180px)','(min-height:700px)','(max-width:1179px)','(max-height:699px)','grid-row:1!important','grid-row:2!important','grid-row:3!important','grid-row:4!important','minmax(0','overflow:visible!important']){
 if(!css.includes(val))errors.push('Missing layout/responsive guard '+val);
}
for(const val of ['new Image()','img.naturalWidth>=1100','img.onerror=','data-mrlee-theme','assets/images/heroes/','classList.add']){
 if(!js.includes(val))errors.push('Image safety check missing: '+val);
}
errors.forEach(x=>console.error('FAIL '+x));
console.log('MR LEE 800: '+pages.length+' pages wired. Home desktop one viewport, small/mobile scroll. Artwork included by ZIP, not falsely counted in repo.');
if(errors.length)process.exit(1);
