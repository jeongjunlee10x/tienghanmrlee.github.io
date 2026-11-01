import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const html=fs.readFileSync('van-hoa-bai-hoc.html','utf8');
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
const base=fs.readFileSync('mrlee-culture-v13-data.js','utf8');
const css=fs.readFileSync('assets/culture/kpop-gallery-v1.css','utf8');
const caps=fs.readFileSync('mrlee-culture-v25-captions.js','utf8');
const meta=JSON.parse(fs.readFileSync('assets/culture/kpop-v32-published.json','utf8'));
const urls=[...html.matchAll(/src="(images\/culture-v32-photo\/kpop\/(\d\d)\.webp)\?v=20261101-topic08-hd32"/g)];
assert.deepEqual(urls.map(x=>x[2]),['01','02','03','04','05']);
assert(html.includes('id="cultureImagesV19Topic8"'));
assert(html.includes("dataset.mrleeKpopGallery='1'"));
assert(html.includes('assets/culture/kpop-gallery-v1.css'));
assert(css.includes('html:not([data-mrlee-kpop-gallery="1"])'));
assert(css.includes('object-fit:cover!important'));
assert(engine.includes("NEW_V32.has(id)?V32"));
assert(engine.includes("ID==='kpop'?$('#cultureImagesV19Topic8')"));
assert(base.includes('"image":"images/culture-v32-photo/kpop/01.webp"'));
assert(caps.includes('"kpop": ['));
assert.equal(meta.photos.length,5);
const checksumSet=new Set();
for(const [idx,photo] of meta.photos.entries()){
 assert.equal(photo.index,idx+1);
 assert.equal(photo.file,urls[idx][1]);
 assert.equal(photo.width,1536);assert.equal(photo.height,1024);
 assert(photo.source_dimensions[0]>=1600&&photo.source_dimensions[1]>=1200);
 const bytes=fs.readFileSync(photo.file);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert.equal(bytes.length,photo.bytes);
 const hash=crypto.createHash('sha256').update(bytes).digest('hex');
 assert.equal(hash,photo.sha256);assert(!checksumSet.has(hash));checksumSet.add(hash);
 assert(html.includes('Tác giả: '+photo.author));
 assert(html.includes(photo.licence_url));assert(html.includes(photo.source_page));
}
for(const n of [3,4,5,6,7])assert(html.includes('id="cultureImagesV19Topic'+n+'"'));
for(const file of ['mrlee-culture-hd-v19.js','mrlee-culture-v25-captions.js']){
 const res=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(res.status,0,file+': '+res.stderr);
}
console.log('PASS Topic 08: five real landscape K-pop photos, 3:2, source hashes, credits, full static HTML, old topics preserved');
