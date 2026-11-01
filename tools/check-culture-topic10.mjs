import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const html=fs.readFileSync('van-hoa-bai-hoc.html','utf8');
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
const base=fs.readFileSync('mrlee-culture-v13-data.js','utf8');
const captions=fs.readFileSync('mrlee-culture-v26-captions.js','utf8');
const css=fs.readFileSync('assets/culture/sports-gallery-v1.css','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/culture/sports-v34-published.json','utf8'));
const refs=[...html.matchAll(/src="(images\/culture-v34-photo\/tro-choi\/(\d\d)\.webp)\?v=20261101-topic10-hd34"/g)];
assert.deepEqual(refs.map(x=>x[2]),['01','02','03','04','05']);
assert(html.includes('id="cultureImagesV19Topic10"'));
assert(html.includes("dataset.mrleeSportsGallery='1'"));
assert(html.includes('assets/culture/sports-gallery-v1.css'));
assert(css.includes('html:not([data-mrlee-sports-gallery="1"])'));
assert(css.includes('object-fit:cover!important'));
assert(engine.includes('NEW_V34.has(id)?V34'));
assert(engine.includes("ID==='tro-choi'?$('#cultureImagesV19Topic10')"));
assert(base.includes('"image":"images/culture-v34-photo/tro-choi/01.webp"'));
assert(captions.includes('"tro-choi": ['));
assert.equal(manifest.photos.length,5);
const seen=new Set();
for(const [i,p] of manifest.photos.entries()){
 assert.equal(p.index,i+1);assert.equal(p.file,refs[i][1]);assert.equal(p.width,1536);assert.equal(p.height,1024);
 assert(p.source_dimensions[0]>=1536&&p.source_dimensions[1]>=1024);
 const buffer=fs.readFileSync(p.file);
 assert.equal(buffer.toString('ascii',0,4),'RIFF');assert.equal(buffer.toString('ascii',8,12),'WEBP');
 assert.equal(buffer.length,p.bytes);
 const hash=crypto.createHash('sha256').update(buffer).digest('hex');
 assert.equal(hash,p.sha256);assert(!seen.has(hash));seen.add(hash);
 assert(html.includes('Ảnh: '+p.author));assert(html.includes(p.licence_url)&&html.includes(p.source_page));
}
for(const i of [3,4,5,6,7,8,9])assert(html.includes('id="cultureImagesV19Topic'+i+'"'));
for(const file of ['mrlee-culture-hd-v19.js','mrlee-culture-v26-captions.js']){
 const syntax=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(syntax.status,0,file+': '+syntax.stderr);
}
console.log('PASS topic 10: five landscape WebPs, SHA-256, CC attribution, cover, gallery, captions and previous topics intact');
