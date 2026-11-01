import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const html=fs.readFileSync('van-hoa-bai-hoc.html','utf8');
const e=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
const cover=fs.readFileSync('mrlee-culture-v13-data.js','utf8');
const c=fs.readFileSync('mrlee-culture-v28-captions.js','utf8');
const css=fs.readFileSync('assets/culture/cpr-gallery-v1.css','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/culture/cpr-v37-published.json','utf8'));
const refs=[...html.matchAll(/src="(images\/culture-v37-photo\/so-cap-cuu\/(\d\d)\.webp)\?v=20261101-topic13-hd37"/g)];
assert.deepEqual(refs.map(x=>x[2]),['01','02','03','04','05']);
assert(html.includes('id="cultureImagesV19Topic13"'));
assert(html.includes("dataset.mrleeCprGallery='1'"));
assert(css.includes('html:not([data-mrlee-cpr-gallery="1"])'));
assert(css.includes('object-fit:cover!important'));
assert(e.includes('NEW_V37.has(id)?V37'));
assert(e.includes("ID==='so-cap-cuu'?$('#cultureImagesV19Topic13')"));
assert(cover.includes('"image":"images/culture-v37-photo/so-cap-cuu/01.webp"'));
assert(c.includes('"so-cap-cuu": ['));
assert(html.includes('Khi có cấp cứu ở Hàn Quốc: gọi 119.'));
assert(html.includes('cpr.heart.org/en/resuscitation-science'));
assert(html.includes('safekorea.go.kr'));
assert.equal(manifest.photos.length,5);
const hashes=new Set();
for(const [i,p] of manifest.photos.entries()){
 assert.equal(p.index,i+1);assert.equal(p.file,refs[i][1]);
 assert.equal(p.width,1536);assert.equal(p.height,1024);
 assert(p.source_dimensions[0]>=1536&&p.source_dimensions[1]>=1024);
 const bytes=fs.readFileSync(p.file);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert.equal(bytes.length,p.bytes);
 const sha=crypto.createHash('sha256').update(bytes).digest('hex');
 assert.equal(sha,p.sha256);assert(!hashes.has(sha));hashes.add(sha);
 assert(html.includes('Ảnh: '+p.author));
 assert(html.includes(p.licence_url)&&html.includes(p.source_page));
}
for(let i=3;i<=12;i++)assert(html.includes('id="cultureImagesV19Topic'+i+'"'));
for(const filename of ['mrlee-culture-hd-v19.js','mrlee-culture-v28-captions.js']){
 const r=spawnSync(process.execPath,['--check',filename],{encoding:'utf8'});
 assert.equal(r.status,0,filename+' '+r.stderr);
}
console.log('PASS topic 13 CPR: 5 landscape training photographs, 119/AHA safety notice, attribution and SHA256; older galleries retained');
