import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
const slugs=['le-hoi','am-thuc','doi-song','so-cap-cuu','goi-cuu-ho','lac-duong','mat-vi','tau-dien-ngam','xe-buyt','benh-vien','hoa-hoan','mat-dien-thoai','an-toan-giao-thong'];
const mf=JSON.parse(fs.readFileSync('assets/culture/v21-manifest.json','utf8'));
assert.equal(mf.topics,13);assert.equal(mf.images,65);
assert.equal(mf.entries.length,65);
const hashes=new Set(),seen=new Set();
for(const x of mf.entries){
 assert(slugs.includes(x.topic),'Unexpected slug '+x.topic);
 assert(x.index>=1&&x.index<=5);
 assert(fs.existsSync(x.file),'Missing '+x.file);
 const b=fs.readFileSync(x.file);
 assert(b.length>25000,'Tiny image '+x.file);
 assert.equal(b.toString('ascii',0,4),'RIFF','Invalid RIFF '+x.file);
 assert.equal(b.toString('ascii',8,12),'WEBP','Invalid WebP '+x.file);
 const sha=crypto.createHash('sha256').update(b).digest('hex');
 assert.equal(sha,x.sha256,'Tampered art '+x.file);
 assert(!hashes.has(sha),'Duplicate artwork '+x.file);hashes.add(sha);
 const key=x.topic+'#'+x.index;assert(!seen.has(key));seen.add(key);
}
for(const slug of slugs)for(let i=1;i<=5;i++)assert(seen.has(slug+'#'+i),'Missing '+slug+' image '+i);
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
assert(engine.includes("const V21='images/culture-v21-new/';"),'Site not serving V21 sources');
assert(engine.includes('REPLACED.has(id)?V21:DIR'),'Site not routing replacement topics');
assert(engine.includes("img.dataset.mrleeCultureHd='21'"),'Cannot distinguish cached old cover');
const page=fs.readFileSync('van-hoa-han-quoc.html','utf8');
const lesson=fs.readFileSync('van-hoa-bai-hoc.html','utf8');
assert(page.includes('mrlee-culture-hd-v19.js'),'Hub missing image controller');
assert(lesson.includes('mrlee-culture-hd-v19.js'),'Lesson missing image controller');
for(const f of ['mrlee-culture-hd-v19.js','mrlee-culture-v20-captions.js']){
 const s=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});
 assert.equal(s.status,0,f+': '+s.stderr);
}
console.log('PASS Culture V21: 65 newly composed images, 13 replacement topics, 5/topic, site routes and no duplicate files.');
