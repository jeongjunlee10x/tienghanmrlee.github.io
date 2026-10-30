/* 22 topics × 5 local, nonduplicated WebP masters; no fabricated test data. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
const slugs=['le-hoi','am-thuc','truyen-thong','doi-song','phe-lich-su','giao-duc','du-lich','kpop','cong-so','tro-choi','lich-su','hien-dai','so-cap-cuu','goi-cuu-ho','lac-duong','mat-vi','tau-dien-ngam','xe-buyt','benh-vien','hoa-hoan','mat-dien-thoai','an-toan-giao-thong'];
const manifest=JSON.parse(fs.readFileSync('assets/culture/culture-v20-manifest.json','utf8'));
assert.equal(manifest.subjects,22);assert.equal(manifest.imageCount,110);
const captionsSource=fs.readFileSync('mrlee-culture-v20-captions.js','utf8');
const compiled=spawnSync('node',['--check','mrlee-culture-v20-captions.js'],{encoding:'utf8'});
assert.equal(compiled.status,0,compiled.stderr);
const captions=JSON.parse(captionsSource.split('window.MRLEE_CULTURE_V20_CAPTIONS=')[1].replace(/;\s*$/,''));
assert.equal(Object.keys(captions).length,22);
for(const slug of slugs){assert.equal(captions[slug]?.length,5,'Missing 5 study captions: '+slug);}
function dimensions(buffer){
 assert.equal(buffer.toString('ascii',0,4),'RIFF','Non-RIFF image');
 assert.equal(buffer.toString('ascii',8,12),'WEBP','Non-WebP image');
 const type=buffer.toString('ascii',12,16);
 if(type==='VP8 ')return {width:buffer.readUInt16LE(26)&0x3fff,height:buffer.readUInt16LE(28)&0x3fff};
 if(type==='VP8X')return {width:1+buffer.readUIntLE(24,3),height:1+buffer.readUIntLE(27,3)};
 if(type==='VP8L'){const v=buffer.readUInt32LE(21);return {width:1+(v&0x3fff),height:1+((v>>14)&0x3fff)}}
 throw Error('Unexpected WebP type: '+type);
}
const files=[];
const hash=new Set();
for(const slug of slugs){for(let i=1;i<=5;i++){
 const file=path.join('images','culture-v20-hd',slug,String(i).padStart(2,'0')+'.webp');
 assert(fs.existsSync(file),'Missing V20 image: '+file);
 const buf=fs.readFileSync(file),d=dimensions(buf);
 assert(d.width>=2000&&d.height>=1300,'Below V20 HD target: '+file+' '+JSON.stringify(d));
 const h=crypto.createHash('sha256').update(buf).digest('hex');
 assert(!hash.has(h),'Duplicate V20 art: '+file);hash.add(h);files.push(file);
}}
assert.equal(files.length,110);
const media=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
assert(media.includes("const DIR='images/culture-v20-hd/';"),'Browser engine must use V20 image paths');
assert(media.includes("CAPTIONS[ID]?.[i-1]"),'Topic-specific captions must be used');
for(const page of ['van-hoa-han-quoc.html','van-hoa-bai-hoc.html']){
 const body=fs.readFileSync(page,'utf8');
 assert(body.includes('mrlee-culture-v20-captions.js'),'V20 captions not mounted: '+page);
 assert(body.includes('20261030-hd20'),'V20 media cache not busted: '+page);
}
assert.equal(spawnSync('node',['--check','mrlee-culture-hd-v19.js'],{encoding:'utf8'}).status,0,'Culture image engine syntax error');
console.log('PASS: 22 culture topics, 110 distinct 2040x1360 WebP images, 110 captions, browser asset paths and JS syntax');
