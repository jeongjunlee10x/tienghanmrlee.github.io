import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const manifest=JSON.parse(fs.readFileSync('assets/culture/v23-manifest.json','utf8'));
const slugs=['le-hoi','am-thuc','truyen-thong','doi-song'];
assert.equal(manifest.total,20);
assert.equal(manifest.images.length,20);
assert.deepEqual(Object.keys(manifest.topics).sort(),slugs.slice().sort());
const seen=new Set(),checksums=new Set();
for(const img of manifest.images){
 assert(slugs.includes(img.topic),'Invalid topic: '+img.topic);
 assert(img.index>=1&&img.index<=5);
 const expected='images/culture-v23-ai/'+img.topic+'/'+String(img.index).padStart(2,'0')+'.webp';
 assert.equal(img.file,expected);
 assert(fs.existsSync(expected),'Missing actual AI file: '+expected);
 const buf=fs.readFileSync(expected);
 assert.equal(buf.length,img.bytes,'Mismatched file size: '+expected);
 assert.equal(buf.toString('ascii',0,4),'RIFF');
 assert.equal(buf.toString('ascii',8,12),'WEBP');
 const t=buf.toString('ascii',12,16);
 let w=0,h=0;
 if(t==='VP8 '){w=buf.readUInt16LE(26)&16383;h=buf.readUInt16LE(28)&16383}
 else if(t==='VP8X'){w=1+buf.readUIntLE(24,3);h=1+buf.readUIntLE(27,3)}
 else if(t==='VP8L'){const x=buf.readUInt32LE(21);w=1+(x&16383);h=1+((x>>14)&16383)}
 else throw Error('Unknown WebP encoding: '+expected);
 assert.equal(w,1536,'Wrong image width: '+expected);
 assert.equal(h,1024,'Wrong image height: '+expected);
 const sha=crypto.createHash('sha256').update(buf).digest('hex');
 assert.equal(sha,img.sha256,'SHA-256 mismatch: '+expected);
 assert(!checksums.has(sha),'Duplicate art: '+expected);checksums.add(sha);
 const key=img.topic+'#'+img.index;assert(!seen.has(key));seen.add(key);
}
for(const slug of slugs){
 assert.equal(manifest.topics[slug],5);
 assert.equal(manifest.labels[slug].length,5);
 for(let i=1;i<=5;i++)assert(seen.has(slug+'#'+i));
}
for(const script of ['mrlee-culture-hd-v19.js','mrlee-culture-v23-captions.js','tools/browser-smoke.mjs']){
 const run=spawnSync(process.execPath,['--check',script],{encoding:'utf8'});
 assert.equal(run.status,0,'JS syntax invalid: '+script+' '+run.stderr);
}
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
assert(engine.includes("const V23='images/culture-v23-ai/';"),'V23 images not activated');
assert(engine.includes('V23_CAPTIONS[ID]?.[i-1]'),'New captions not used');
for(const page of ['van-hoa-han-quoc.html','van-hoa-bai-hoc.html']){
 const html=fs.readFileSync(page,'utf8');
 assert(html.includes('mrlee-culture-v23-captions.js'),'Captions script missing: '+page);
 assert(/mrlee-culture-hd-v19\.js\?v=20261031-v2[34567]/.test(html),'Culture engine cache version missing: '+page);
}
console.log('PASS: 4 topics, 20 images, 1536x1024 WebP, unique SHA-256, image mapping, captions and syntax.');
