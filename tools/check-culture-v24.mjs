import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const manifest=JSON.parse(fs.readFileSync('assets/culture/v24-manifest.json','utf8'));
const slugs=['phe-lich-su','giao-duc'];
assert.equal(manifest.total,10);
assert.equal(manifest.images.length,10);
const seen=new Set(),hashes=new Set();
for(const ent of manifest.images){
 assert(slugs.includes(ent.topic),'Wrong topic');
 assert(ent.index>=1&&ent.index<=5);
 const file='images/culture-v24-ai/'+ent.topic+'/'+String(ent.index).padStart(2,'0')+'.webp';
 assert.equal(ent.file,file);
 const raw=fs.readFileSync(file);
 assert.equal(raw.length,ent.bytes);
 assert.equal(raw.toString('ascii',0,4),'RIFF');
 assert.equal(raw.toString('ascii',8,12),'WEBP');
 let w=0,h=0;
 const format=raw.toString('ascii',12,16);
 if(format==='VP8 '){w=raw.readUInt16LE(26)&16383;h=raw.readUInt16LE(28)&16383;}
 else if(format==='VP8X'){w=1+raw.readUIntLE(24,3);h=1+raw.readUIntLE(27,3);}
 else if(format==='VP8L'){const x=raw.readUInt32LE(21);w=1+(x&16383);h=1+((x>>14)&16383);}
 else throw Error('Unexpected WebP format: '+file);
 assert.equal(w,1536);assert.equal(h,1024);
 const digest=createHash('sha256').update(raw).digest('hex');
 assert.equal(digest,ent.sha256,'Checksum mismatch '+file);
 assert(!hashes.has(digest),'Duplicate picture '+file);hashes.add(digest);
 const key=ent.topic+'-'+ent.index;assert(!seen.has(key));seen.add(key);
 assert(ent.caption&&ent.caption.length>12,'Missing caption');
}
for(const slug of slugs){assert.equal(manifest.topics[slug],5);assert.equal(manifest.labels[slug].length,5);}
const loader=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
assert(loader.includes("const V24='images/culture-v24-ai/';"));
assert(loader.includes("const NEW_V24=new Set(['phe-lich-su','giao-duc']);"));
assert(loader.includes('V24_CAPTIONS[ID]?.[i-1]'));
assert(loader.includes('NEW_V23.has(id)'),'V23 needs to remain for other topics');
for(const page of ['van-hoa-han-quoc.html','van-hoa-bai-hoc.html']){
 const html=fs.readFileSync(page,'utf8');
 assert(html.includes('mrlee-culture-v24-captions.js'),'Caption script missing '+page);
 assert(/mrlee-culture-hd-v19\.js\?v=20261031-v2[45]/.test(html),'Incorrect cache version '+page);
}
for(const js of ['mrlee-culture-hd-v19.js','mrlee-culture-v24-captions.js','tools/browser-smoke.mjs']){
 const v=spawnSync(process.execPath,['--check',js],{encoding:'utf8'});
 assert.equal(v.status,0,'JS syntax error: '+js+' '+v.stderr);
}
console.log('PASS: 10 independent image files, 2 topics, hashes, dimensions, mappings, source transparency and JS syntax.');
