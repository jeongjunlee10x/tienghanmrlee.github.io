import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const html=fs.readFileSync('van-hoa-bai-hoc.html','utf8');
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
const cover=fs.readFileSync('mrlee-culture-v13-data.js','utf8');
const caps=fs.readFileSync('mrlee-culture-v27-captions.js','utf8');
const css=fs.readFileSync('assets/culture/heritage-gallery-v1.css','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/culture/heritage-v35-published.json','utf8'));
const imgs=[...html.matchAll(/src="(images\/culture-v35-photo\/lich-su\/(\d\d)\.webp)\?v=20261101-topic11-hd35"/g)];
assert.deepEqual(imgs.map(x=>x[2]),['01','02','03','04','05']);
assert(html.includes('id="cultureImagesV19Topic11"'));
assert(html.includes("dataset.mrleeHeritageGallery='1'"));
assert(html.includes('assets/culture/heritage-gallery-v1.css'));
assert(css.includes('html:not([data-mrlee-heritage-gallery="1"])'));
assert(css.includes('object-fit:cover!important'));
assert(engine.includes('NEW_V35.has(id)?V35'));
assert(engine.includes("ID==='lich-su'?$('#cultureImagesV19Topic11')"));
assert(cover.includes('"image":"images/culture-v35-photo/lich-su/01.webp"'));
assert(caps.includes('"lich-su": ['));
assert.equal(manifest.photos.length,5);
const hashes=new Set();
for(const [i,photo] of manifest.photos.entries()){
 assert.equal(photo.index,i+1);
 assert.equal(photo.file,imgs[i][1]);
 assert.equal(photo.width,1536);assert.equal(photo.height,1024);
 assert(photo.source_dimensions[0]>=1536&&photo.source_dimensions[1]>=1024);
 const b=fs.readFileSync(photo.file);
 assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');
 assert.equal(b.length,photo.bytes);
 const sha=crypto.createHash('sha256').update(b).digest('hex');
 assert.equal(sha,photo.sha256);assert(!hashes.has(sha));hashes.add(sha);
 assert(html.includes('Tác giả: '+photo.author));
 assert(html.includes(photo.licence_url)&&html.includes(photo.source_page));
}
for(const i of [3,4,5,6,7,8,9,10])assert(html.includes('id="cultureImagesV19Topic'+i+'"'));
for(const file of ['mrlee-culture-hd-v19.js','mrlee-culture-v27-captions.js']){
 const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(result.status,0,file+result.stderr);
}
console.log('PASS Topic11: five genuine landscape history photographs with provenance, SHA256, cover and responsive HTML gallery');
