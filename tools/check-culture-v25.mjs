import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const manifest=JSON.parse(fs.readFileSync('assets/culture/v25-manifest.json','utf8'));
assert.equal(manifest.total,10);
assert.equal(manifest.batch,4);
const topics=['du-lich','kpop'];const seen=new Set(),hashes=new Set();
assert.equal(manifest.images.length,10);
for(const img of manifest.images){
 assert(topics.includes(img.topic),'Unexpected topic');
 assert(Number.isInteger(img.index)&&img.index>=1&&img.index<=5);
 const expected='images/culture-v25-ai/'+img.topic+'/'+String(img.index).padStart(2,'0')+'.webp';
 assert.equal(img.file,expected,'Image path mismatch');
 const buf=fs.readFileSync(expected);
 assert.equal(buf.length,img.bytes,'Size mismatch');
 assert.equal(buf.toString('ascii',0,4),'RIFF','RIFF invalid');
 assert.equal(buf.toString('ascii',8,12),'WEBP','WebP invalid');
 let w=0,h=0;const t=buf.toString('ascii',12,16);
 if(t==='VP8 '){w=buf.readUInt16LE(26)&16383;h=buf.readUInt16LE(28)&16383}
 else if(t==='VP8X'){w=1+buf.readUIntLE(24,3);h=1+buf.readUIntLE(27,3)}
 else if(t==='VP8L'){const n=buf.readUInt32LE(21);w=1+(n&16383);h=1+((n>>14)&16383)}
 else throw Error('Unrecognized WebP '+expected);
 assert.equal(w,1536);assert.equal(h,1024);
 assert.equal(createHash('sha256').update(buf).digest('hex'),img.sha256,'SHA mismatch');
 assert(!hashes.has(img.sha256),'Duplicate image file');
 hashes.add(img.sha256);
 const key=img.topic+'-'+img.index;assert(!seen.has(key));seen.add(key);
 assert(img.source==='isolated-scene-from-AI-montage','Source must remain transparent');
 assert(img.native_scene_size?.[0]<450,'Original source resolution must be disclosed');
 assert(img.caption?.length>=12);
}
for(const t of topics){assert.equal(manifest.topics[t],5);assert.equal(manifest.labels[t]?.length,5);}
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
assert(engine.includes("const V25='images/culture-v25-ai/';"));
assert(engine.includes("const NEW_V25=new Set(['du-lich','kpop']);"));
assert(engine.includes('V25_CAPTIONS[ID]?.[i-1]'));
for(const p of ['van-hoa-han-quoc.html','van-hoa-bai-hoc.html']){
 const html=fs.readFileSync(p,'utf8');
 assert(html.includes('mrlee-culture-v25-captions.js'),'V25 caption script not mounted '+p);
 assert(/mrlee-culture-hd-v19\.js\?v=20261031-v2[567]/.test(html),'Incorrect version '+p);
}
for(const f of ['mrlee-culture-hd-v19.js','mrlee-culture-v25-captions.js','tools/browser-smoke.mjs']){
 const p=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});
 assert.equal(p.status,0,'JavaScript syntax error '+f+' '+p.stderr);
}
console.log('PASS: 2 themes, 10 distinct WebP files, 5 each, 1536x1024, SHA-256, accurate image provenance, UI integration.');
