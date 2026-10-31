import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const v30=JSON.parse(fs.readFileSync('assets/culture/v30-shotlist.json','utf8'));
const v31=JSON.parse(fs.readFileSync('assets/culture/v31-shotlist.json','utf8'));
assert.equal(v30.count,20);assert.equal(v31.count,10);
assert.equal(v30.images.length,20);assert.equal(v31.images.length,10);
assert.equal(v30.stage,'in_production_1_valid_photo_staged_of_20_not_live');
assert.equal(v31.stage,'awaiting_10_individual_ai_photos');
const p=v30.preview;
const bytes=fs.readFileSync(p.path);
assert.equal(bytes.length,p.bytes);
assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
const t=bytes.toString('ascii',12,16);let w=0,h=0;
if(t==='VP8 '){w=bytes.readUInt16LE(26)&16383;h=bytes.readUInt16LE(28)&16383;}
else if(t==='VP8X'){w=1+bytes.readUIntLE(24,3);h=1+bytes.readUIntLE(27,3);}
else if(t==='VP8L'){const v=bytes.readUInt32LE(21);w=1+(v&16383);h=1+((v>>>14)&16383);}
assert.equal(w,p.width);assert.equal(h,p.height);
assert.equal(createHash('sha256').update(bytes).digest('hex'),p.sha256);
for(const page of ['van-hoa-han-quoc.html','van-hoa-bai-hoc.html']){const html=fs.readFileSync(page,'utf8');assert(!html.includes('culture-v30-preview'),'No partial photo release');}
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');assert(!engine.includes("const V30PREVIEW="),"No partial photo release");assert(engine.includes("const V29="));
for(const manifest of [v30,v31]){for(const image of manifest.images){assert(image.caption?.length>10);assert(!image.file.includes('..'));}}
console.log('PASS: one original 1536×1024 AI subway photo staged safely, 20+10 planned; no partial live rollout');
