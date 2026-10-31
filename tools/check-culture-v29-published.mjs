import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const data=JSON.parse(fs.readFileSync('assets/culture/v29-inventory.json','utf8'));
assert.equal(data.images.length,10);
assert.equal(data.stage,'photos_committed_and_live_routes_enabled');
const seen=new Set(),perTopic={'lac-duong':0,'mat-vi':0};
for(const x of data.images){
  assert(x.topic in perTopic);perTopic[x.topic]++;
  assert(fs.existsSync(x.file),'Missing photo: '+x.file);
  const b=fs.readFileSync(x.file);
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WEBP');
  assert.equal(b.length,x.bytes);
  assert.equal(createHash('sha256').update(b).digest('hex'),x.sha256);
  const type=b.toString('ascii',12,16);
  let w=0,h=0;
  if(type==='VP8 '){w=b.readUInt16LE(26)&16383;h=b.readUInt16LE(28)&16383;}
  else if(type==='VP8X'){w=1+b.readUIntLE(24,3);h=1+b.readUIntLE(27,3);}
  else if(type==='VP8L'){const v=b.readUInt32LE(21);w=1+(v&16383);h=1+((v>>>14)&16383);}
  assert.equal(w,1536);assert.equal(h,1024);
  assert(!seen.has(x.sha256),'Duplicate image sha');seen.add(x.sha256);
}
assert.deepEqual(perTopic,{'lac-duong':5,'mat-vi':5});
const js=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
assert(js.includes("const V29='images/culture-v29-photo/';"));
assert(js.includes("const NEW_V29=new Set(['lac-duong','mat-vi']);"));
assert(js.includes('NEW_V29.has(id)?V29'));
assert(js.includes('V29_CAPTIONS[ID]?.[i-1]'));
assert(js.includes("const V28='images/culture-v28-safe/';"));
const captions=fs.readFileSync('mrlee-culture-v29-captions.js','utf8');
assert(captions.includes('window.MRLEE_CULTURE_V29_CAPTIONS='));
for(const p of ['van-hoa-bai-hoc.html','van-hoa-han-quoc.html']){
 const html=fs.readFileSync(p,'utf8');
 const a=html.indexOf('mrlee-culture-v29-captions.js');
 const b=html.indexOf('mrlee-culture-hd-v19.js?v=20261031-v27-b7-v29');
 assert(a>=0&&b>a,'Caption must be loaded before image controller: '+p);
}
for(const p of ['mrlee-culture-hd-v19.js','mrlee-culture-v29-captions.js']){
 const r=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr||'JS syntax failure: '+p);
}
console.log('PASS Culture V29: 10 photorealistic AI WebP assets, SHA256, 1536x1024, live 2-topic captions and routing.');
