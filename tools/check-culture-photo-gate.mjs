import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const v29=read('assets/culture/v29-inventory.json');
const v30=read('assets/culture/v30-shotlist.json');
assert.equal(v29.count,10);assert.equal(v30.count,20);
assert.equal(v29.images.length,10);assert.equal(v30.images.length,20);
const expected29={'lac-duong':5,'mat-vi':5};
const expected30={'tau-dien-ngam':5,'xe-buyt':5,'benh-vien':5,'hoa-hoan':5};
function manifestCheck(data,topics){
  assert.deepEqual(data.topics,topics);
  const paths=new Set();
  for(const [topic,total] of Object.entries(topics)){
    const arr=data.images.filter(x=>x.topic===topic);
    assert.equal(arr.length,total);
    for(let i=0;i<total;i++){
      const x=arr[i]; assert.equal(x.index,i+1);
      const expected='images/culture-v'+data.version.slice(0,2)+'-photo/'+topic+'/'+String(i+1).padStart(2,'0')+'.webp';
      assert.equal(x.file,expected);
      assert(!paths.has(x.file)); paths.add(x.file);
      assert(typeof x.caption==='string'&&x.caption.length>12);
    }
  }
}
manifestCheck(v29,expected29);manifestCheck(v30,expected30);
function dimensions(bytes){
  const fmt=bytes.toString('ascii',12,16);
  if(fmt==='VP8 ') return [bytes.readUInt16LE(26)&16383,bytes.readUInt16LE(28)&16383];
  if(fmt==='VP8X') return [1+bytes.readUIntLE(24,3),1+bytes.readUIntLE(27,3)];
  if(fmt==='VP8L'){const x=bytes.readUInt32LE(21);return [1+(x&16383),1+((x>>>14)&16383)];}
  throw Error('Unsupported WebP encoding');
}
function audit(data,requireHash){
  const present=data.images.filter(x=>fs.existsSync(x.file));
  if(present.length===0){console.log('STAGED V'+data.version+': 0/'+data.count+' images published; no live references enabled.');return false;}
  assert.equal(present.length,data.count,'Partial image upload is not publishable for V'+data.version);
  const hashes=new Set();
  for(const image of data.images){
    const bytes=fs.readFileSync(image.file);
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    const [w,h]=dimensions(bytes);
    assert(w>=1536&&h>=1024,'Image resolution too low: '+image.file);
    if(requireHash){
      assert.equal(bytes.length,image.bytes,'Byte size mismatch '+image.file);
      assert.equal(createHash('sha256').update(bytes).digest('hex'),image.sha256,'SHA-256 mismatch '+image.file);
    }
    const sha=createHash('sha256').update(bytes).digest('hex');
    assert(!hashes.has(sha),'Duplicate photo bytes '+image.file);hashes.add(sha);
  }
  console.log('READY V'+data.version+': '+data.count+' distinct WebP images verified. Publishing still requires explicitly enabling the image engine.');
  return true;
}
const all29=audit(v29,true),all30=audit(v30,false);
const pagePaths=['van-hoa-bai-hoc.html','van-hoa-han-quoc.html'];
for(const p of pagePaths){
  const html=fs.readFileSync(p,'utf8');
  assert(html.includes('mrlee-culture-hd-v19.js'),p+' has no main image engine');
}
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
assert(engine.includes('const V28='),'Existing batch 7 mapping missing');
if(!all29)assert(!engine.includes("const NEW_V29=new Set(['lac-duong','mat-vi']);"),'V29 binary files are absent but live routes are enabled');
if(!all30)assert(!engine.includes("const NEW_V30=new Set(['tau-dien-ngam'"),'V30 binary files are absent but live routes are enabled');
console.log('PASS: no partial uploads, no duplicate images, image-integrity staging and live-page safety.');
