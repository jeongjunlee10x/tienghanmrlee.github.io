import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const html=fs.readFileSync('van-hoa-bai-hoc.html','utf8');
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
const base=fs.readFileSync('mrlee-culture-v13-data.js','utf8');
const caps=fs.readFileSync('mrlee-culture-v27-captions.js','utf8');
const css=fs.readFileSync('assets/culture/modern-gallery-v1.css','utf8');
const meta=JSON.parse(fs.readFileSync('assets/culture/modern-v36-published.json','utf8'));
const images=[...html.matchAll(/src="(images\/culture-v36-photo\/hien-dai\/(\d\d)\.webp)\?v=20261101-topic12-hd36"/g)];
assert.deepEqual(images.map(x=>x[2]),['01','02','03','04','05']);
assert(html.includes('id="cultureImagesV19Topic12"'));
assert(html.includes("dataset.mrleeModernGallery='1'"));
assert(html.includes('assets/culture/modern-gallery-v1.css'));
assert(css.includes('html:not([data-mrlee-modern-gallery="1"])'));
assert(css.includes('object-fit:cover!important'));
assert(engine.includes("NEW_V36.has(id)?V36"));
assert(engine.includes("ID==='hien-dai'?$('#cultureImagesV19Topic12')"));
assert(base.includes('"image":"images/culture-v36-photo/hien-dai/01.webp"'));
assert(caps.includes('"hien-dai": ['));
assert.equal(meta.photos.length,5);
const hashes=new Set();
for(const [i,p] of meta.photos.entries()){
 assert.equal(p.index,i+1);
 assert.equal(p.file,images[i][1]);
 assert.equal(p.width,1536);assert.equal(p.height,1024);
 assert(p.source_dimensions[0]>=1536&&p.source_dimensions[1]>=1024);
 const bin=fs.readFileSync(p.file);
 assert.equal(bin.toString('ascii',0,4),'RIFF');assert.equal(bin.toString('ascii',8,12),'WEBP');
 assert.equal(bin.length,p.bytes);
 const checksum=crypto.createHash('sha256').update(bin).digest('hex');
 assert.equal(checksum,p.sha256);
 assert(!hashes.has(checksum));hashes.add(checksum);
 assert(html.includes('Tác giả: '+p.author));
 assert(html.includes(p.licence_url)&&html.includes(p.source_page));
}
for(const n of [3,4,5,6,7,8,9,10,11])assert(html.includes('id="cultureImagesV19Topic'+n+'"'));
for(const f of ['mrlee-culture-hd-v19.js','mrlee-culture-v27-captions.js']){
 const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});
 assert.equal(r.status,0,f+': '+r.stderr);
}
console.log('PASS topic12 modern Korea: 5 distinct photos 3:2, authors, licences, SHA256, cover, HTML gallery and prior topics preserved');
