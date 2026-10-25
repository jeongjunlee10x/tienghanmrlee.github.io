/** MR LEE categorized art audit (read-only). Verifies actual binary files and wiring. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),problems=[],sizeByPage={};
const get=(f)=>fs.readFileSync(path.resolve(root,f));
const manifest=JSON.parse(get('assets/mrlee-ai/v2/13_manifest_va_kiem_tra/deployment-manifest.json').toString('utf8'));
const sha=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
if(manifest.pages?.length!==10)problems.push('Expected 10 subject folders');
if(manifest.variants!=='one original WebP per route, responsive object-fit; true mobile variants absent')problems.push('Media provenance missing');
const digests=new Set();
for(const record of manifest.pages||[]){
 const f=record.hero;
 if(!f?.endsWith('/hero/hero-desktop.webp')||!fs.existsSync(path.resolve(root,f))){problems.push('MISSING '+f);continue}
 const bytes=get(f);const digest=sha(bytes);
 if(digests.has(digest))problems.push('DUPLICATE WEBP '+f);
 digests.add(digest);
 if(bytes.length<85000||bytes.subarray(0,4).toString('ascii')!=='RIFF'||bytes.subarray(8,12).toString('ascii')!=='WEBP')problems.push('BROKEN/SMALL WEBP '+f);
 sizeByPage[record.page]=bytes.length;
 if(!fs.existsSync(path.resolve(root,record.page)))problems.push('MISSING PAGE '+record.page);
 else{
  const html=get(record.page).toString('utf8');
  for(const required of ['assets/mrlee-ai/v2/integration.js','assets/mrlee-ai/v2/integration.css'])
   if(html.split(required).length!==2)problems.push('MISSING OR DUPLICATE LINK '+record.page+' -> '+required);
 }
}
const src=get('assets/mrlee-ai/v2/integration.js').toString('utf8');
for(const term of ['new Image()','naturalWidth','naturalHeight','data-mrlee-theme','hero-desktop.webp','mrlee-v4-hero-photo','mrlee-smart-home-card','mrlee-smart-admin-hero'])
 if(!src.includes(term))problems.push('UNSAFE OR MISSING ENHANCEMENT '+term);
const check=spawnSync(process.execPath,['--check','assets/mrlee-ai/v2/integration.js'],{cwd:root,encoding:'utf8'});
if(check.status!==0)problems.push('JS SYNTAX '+check.stderr.slice(0,300));
if(problems.length)problems.forEach(x=>console.error('FAIL '+x));
console.log('MR LEE DIRECT AI V2: '+digests.size+'/10 real unique existing GitHub WebPs; '+Object.keys(sizeByPage).length+'/10 routes linked; '+problems.length+' errors.');
console.log('Original conversation ZIP images were NOT transferred by this deployment; the manifest tracks provenance.');
if(problems.length)process.exitCode=1;
