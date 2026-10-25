/** MR LEE V3 live-art wiring audit. Does not claim the unuploaded WebPs exist. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),errors=[],messages=[];
const pages=['index.html','hoc-tieng-han.html','giao-tiep-theo-chu-de.html','kiem-tra-topik.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html','ban-do-dai-hoc-han-quoc.html','mrlee-bai-tap-pro.html','trung-tam-hoc-vien.html','admin.html'];
const manifest=JSON.parse(fs.readFileSync('assets/mrlee-ai/v3/14_manifest_va_QA/manifest.json','utf8'));
const known=new Set(manifest.records.map(r=>r.asset_path));
const code=fs.readFileSync('assets/mrlee-ai/v3/live-mapping.js','utf8');
const check=spawnSync(process.execPath,['--check','assets/mrlee-ai/v3/live-mapping.js'],{encoding:'utf8'});
if(check.status)errors.push('JS syntax '+check.stderr);
for(const page of pages){
 const html=fs.readFileSync(page,'utf8');
 if(!html.includes('assets/mrlee-ai/v3/live-mapping.js'))errors.push('Missing V3 loader: '+page);
 if(!html.includes('assets/mrlee-ai/v3/live-mapping.css'))errors.push('Missing V3 CSS: '+page);
 if(!html.includes('assets/branding/logo-mrlee.png')&&!html.includes('site-logo.js'))messages.push('Check brand injection on '+page);
}
for(const required of ['verified(u)','new Image()','image.naturalWidth','image.onerror','dataset.mrleeTheme','background-image','index.html','admin.html','.mrlee-v4-directory-grid','mrlee-smart-home-card']){
 if(!code.includes(required))errors.push('Missing fall-back or page mapping: '+required);
}
const exists=manifest.records.filter(r=>fs.existsSync(path.join(root,r.asset_path)));
const missing=manifest.records.length-exists.length;
let invalid=0;
for(const r of exists){
 const b=fs.readFileSync(r.asset_path);
 if(b.length<25000||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')invalid++;
}
if(invalid)errors.push('Invalid installed WebP assets: '+invalid);
console.log('MR LEE V3 mapping: '+pages.length+' pages; '+exists.length+'/'+manifest.records.length+' assets currently on disk; '+missing+' still not rendered/uploaded.');
if(missing)console.log('Pending artwork is expected. Loader retains the working previous picture until the real new WebP has loaded.');
messages.forEach(x=>console.warn('WARN '+x));
errors.forEach(x=>console.error('FAIL '+x));
if(errors.length)process.exitCode=1;
