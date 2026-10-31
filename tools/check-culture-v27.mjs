import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const data=JSON.parse(fs.readFileSync('assets/culture/v27-manifest.json','utf8'));
const subjects=['lich-su','hien-dai'];
assert.equal(data.version,'27.0');
assert.equal(data.batch,6);
assert.equal(data.total,10);
assert.equal(data.images.length,10);
assert.deepEqual(Object.keys(data.topics).sort(),subjects.slice().sort());
const files=new Set(),digests=new Set();
for(const image of data.images){
 assert(subjects.includes(image.topic),'Unexpected topic');
 assert(Number.isInteger(image.index)&&image.index>=1&&image.index<=5);
 const file='images/culture-v27-art/'+image.topic+'/'+String(image.index).padStart(2,'0')+'.webp';
 assert.equal(image.file,file,'Wrong asset path');
 assert(fs.existsSync(file),'Missing image file '+file);
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.length,image.bytes,'File size changed '+file);
 assert.equal(bytes.toString('ascii',0,4),'RIFF','Not a RIFF image');
 assert.equal(bytes.toString('ascii',8,12),'WEBP','Not a WebP image');
 const format=bytes.toString('ascii',12,16);
 let w=0,h=0;
 if(format==='VP8 '){w=bytes.readUInt16LE(26)&16383;h=bytes.readUInt16LE(28)&16383}
 else if(format==='VP8X'){w=1+bytes.readUIntLE(24,3);h=1+bytes.readUIntLE(27,3)}
 else if(format==='VP8L'){const v=bytes.readUInt32LE(21);w=1+(v&16383);h=1+((v>>14)&16383)}
 else throw Error('Unexpected WebP encoding '+file);
 assert.equal(w,1536,'Below width target '+file);
 assert.equal(h,1024,'Below height target '+file);
 const checksum=createHash('sha256').update(bytes).digest('hex');
 assert.equal(checksum,image.sha256,'Checksum mismatch '+file);
 assert(!digests.has(checksum),'Duplicate image bytes '+file);
 digests.add(checksum);files.add(image.topic+'-'+image.index);
 assert.equal(image.source,'original-procedural-SVG-illustration');
 assert(image.caption?.length>10);
}
for(const topic of subjects){
 assert.equal(data.topics[topic],5);
 assert.equal(data.labels[topic]?.length,5);
 for(let i=1;i<=5;i++)assert(files.has(topic+'-'+i),'Missing topic image '+topic+' '+i);
}
assert(fs.existsSync('tools/culture-v27-render.py'),'Reproducible generator is missing');
const code=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
assert(code.includes("const V27='images/culture-v27-art/';"),'V27 source path missing');
assert(code.includes("const NEW_V27=new Set(['lich-su','hien-dai']);"),'Topic mapping missing');
assert(code.includes('V27_CAPTIONS[ID]?.[i-1]'),'Per-image captions not mounted');
assert(code.includes('NEW_V26.has(id)'),'Old media fallback preserved');
const captions=fs.readFileSync('mrlee-culture-v27-captions.js','utf8');
assert(captions.includes('window.MRLEE_CULTURE_V27_CAPTIONS='));
for(const page of ['van-hoa-han-quoc.html','van-hoa-bai-hoc.html']){
 const html=fs.readFileSync(page,'utf8');
 assert(html.includes('mrlee-culture-v27-captions.js'),'Caption script absent: '+page);
 assert(html.includes('mrlee-culture-hd-v19.js?v=20261031-v27'),'Cache version absent: '+page);
}
for(const path of ['mrlee-culture-hd-v19.js','mrlee-culture-v27-captions.js','tools/browser-smoke.mjs']){
 const process=spawnSync(processPath(),['--check',path],{encoding:'utf8'});
 assert.equal(process.status,0,'Invalid JS: '+path+' '+process.stderr);
}
function processPath(){return process.execPath;}
console.log('PASS Culture V27: 10 verified original vector illustrations, 5/topic, SHA-256, exact paths, captions and page integration.');
