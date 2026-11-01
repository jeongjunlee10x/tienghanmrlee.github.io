import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const html=fs.readFileSync('van-hoa-bai-hoc.html','utf8');
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
const cover=fs.readFileSync('mrlee-culture-v13-data.js','utf8');
const caps=fs.readFileSync('mrlee-culture-v28-captions.js','utf8');
const css=fs.readFileSync('assets/culture/emergency-gallery-v1.css','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/culture/emergency-v38-published.json','utf8'));
const links=[...html.matchAll(/src="(images\/culture-v38-photo\/goi-cuu-ho\/(\d\d)\.webp)\?v=20261101-topic14-hd38"/g)];
assert.deepEqual(links.map(x=>x[2]),['01','02','03','04','05']);
assert(html.includes('id="cultureImagesV19Topic14"'));
assert(html.includes("dataset.mrleeEmergencyGallery='1'"));
assert(html.includes('assets/culture/emergency-gallery-v1.css'));
assert(css.includes('html:not([data-mrlee-emergency-gallery="1"])'));
assert(css.includes('object-fit:cover!important'));
assert(engine.includes('NEW_V38.has(id)?V38'));
assert(engine.includes("ID==='goi-cuu-ho'?$('#cultureImagesV19Topic14')"));
assert(cover.includes('"image":"images/culture-v38-photo/goi-cuu-ho/01.webp"'));
assert(caps.includes('"goi-cuu-ho": ['));
assert(html.includes('<strong>119</strong>')&&html.includes('<strong>112</strong>')&&html.includes('<strong>1330</strong>'));
assert(html.includes('1330 hỗ trợ thông tin du lịch, không phải số cấp cứu'));
assert(html.includes('https://english.visitkorea.or.kr/'));
assert(html.includes('https://www.gov.uk/foreign-travel-advice/south-korea/getting-help'));
assert.equal(manifest.photos.length,5);
const hashes=new Set();
for(const [i,p] of manifest.photos.entries()){
 assert.equal(p.index,i+1);assert.equal(p.file,links[i][1]);
 assert.equal(p.width,1536);assert.equal(p.height,1024);
 assert(p.source_dimensions[0]>=1536&&p.source_dimensions[1]>=1024);
 const bin=fs.readFileSync(p.file);
 assert.equal(bin.toString('ascii',0,4),'RIFF');assert.equal(bin.toString('ascii',8,12),'WEBP');
 assert.equal(bin.length,p.bytes);
 const hash=crypto.createHash('sha256').update(bin).digest('hex');
 assert.equal(hash,p.sha256);assert(!hashes.has(hash));hashes.add(hash);
 assert(html.includes('Nguồn: '+p.author));
 assert(html.includes(p.licence_url)&&html.includes(p.source_page));
}
for(let n=3;n<=13;n++)assert(html.includes('id="cultureImagesV19Topic'+n+'"'));
for(const path of ['mrlee-culture-hd-v19.js','mrlee-culture-v28-captions.js']){
 const r=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});assert.equal(r.status,0,path+': '+r.stderr);
}
console.log('PASS Topic14: five distinct 3:2 emergency-service photos, source SHA256, 119/112/1330 safety education and previous topics intact');
