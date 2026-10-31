import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const manifest=JSON.parse(fs.readFileSync('assets/culture/v26-manifest.json','utf8'));
assert.equal(manifest.total,10);assert.equal(manifest.batch,5);
const topics=['cong-so','tro-choi'];const seen=new Set(),hashes=new Set();
assert.equal(manifest.images.length,10);
for(const img of manifest.images){
 assert(topics.includes(img.topic),'Unknown topic');
 assert(Number.isInteger(img.index)&&img.index>=1&&img.index<=5);
 const expected='images/culture-v26-ai/'+img.topic+'/'+String(img.index).padStart(2,'0')+'.webp';
 assert.equal(img.file,expected,'File path incorrect');
 const buf=fs.readFileSync(expected);
 assert.equal(buf.length,img.bytes,'File length mismatched');
 assert.equal(buf.toString('ascii',0,4),'RIFF');
 assert.equal(buf.toString('ascii',8,12),'WEBP');
 let w=0,h=0;const kind=buf.toString('ascii',12,16);
 if(kind==='VP8 '){w=buf.readUInt16LE(26)&16383;h=buf.readUInt16LE(28)&16383}
 else if(kind==='VP8X'){w=1+buf.readUIntLE(24,3);h=1+buf.readUIntLE(27,3)}
 else if(kind==='VP8L'){const v=buf.readUInt32LE(21);w=1+(v&16383);h=1+((v>>14)&16383)}
 else throw Error('Invalid WebP type: '+expected);
 assert.equal(w,1536,'Incorrect canvas width: '+expected);assert.equal(h,1024,'Incorrect height: '+expected);
 const sha=createHash('sha256').update(buf).digest('hex');
 assert.equal(sha,img.sha256,'SHA-256 changed: '+expected);
 assert(!hashes.has(sha),'Duplicate picture hash');hashes.add(sha);
 const key=img.topic+'-'+img.index;assert(!seen.has(key));seen.add(key);
 assert.equal(img.source,'isolated-scene-from-AI-montage');
 assert(img.native_scene_size[0]<330,'Original visual detail provenance missing');
 assert(img.caption?.length>10);
}
for(const topic of topics){assert.equal(manifest.topics[topic],5);assert.equal(manifest.labels[topic].length,5);}
const loader=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
assert(loader.includes("const V26='images/culture-v26-ai/';"));
assert(loader.includes("const NEW_V26=new Set(['cong-so','tro-choi']);"));
assert(loader.includes('V26_CAPTIONS[ID]?.[i-1]'));
assert(loader.includes('NEW_V25.has(id)'),'Preserve previous art batches');
for(const page of ['van-hoa-han-quoc.html','van-hoa-bai-hoc.html']){
 const html=fs.readFileSync(page,'utf8');
 assert(html.includes('mrlee-culture-v26-captions.js'),'Missing V26 captions script: '+page);
 assert(/mrlee-culture-hd-v19\.js\?v=20261031-v2[67]/.test(html),'Cache-bust missing: '+page);
}
for(const script of ['mrlee-culture-hd-v19.js','mrlee-culture-v26-captions.js','tools/browser-smoke.mjs']){
 const r=spawnSync(process.execPath,['--check',script],{encoding:'utf8'});
 assert.equal(r.status,0,'JS syntax error: '+script+' '+r.stderr);
}
console.log('PASS: 10 individually packaged WebP images, 5/office, 5/sports, SHA-256, source clarity, correct route and previous batches.');
