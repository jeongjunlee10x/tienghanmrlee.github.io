/* MR LEE: audit actual image dimensions. No simulated quality or invented pixels. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const roots=['assets/branding','assets/images','assets/mrlee-ai','assets/v306/images'];const imageExt=new Set(['.webp','.png','.jpg','.jpeg']);
let count=0,fail=[],tiny=[],duplicate=0;const fingerprints=new Set();
function scan(folder){
 if(!fs.existsSync(folder))return;
 for(const item of fs.readdirSync(folder,{withFileTypes:true})){
  const p=path.join(folder,item.name);if(item.isDirectory()){scan(p);continue}
  if(!imageExt.has(path.extname(p).toLowerCase()))continue;
  const b=fs.readFileSync(p),ext=path.extname(p).toLowerCase();count++;
  if(b.length<200){fail.push(p+': file too small');continue}
  let w=0,h=0;
  if(ext==='.png'&&b.subarray(1,4).toString()==='PNG'){w=b.readUInt32BE(16);h=b.readUInt32BE(20)}
  if(ext==='.webp'&&b.subarray(8,12).toString()==='WEBP'){
   const fmt=b.subarray(12,16).toString();
   if(fmt==='VP8X'){w=b.readUIntLE(24,3)+1;h=b.readUIntLE(27,3)+1}
   if(fmt==='VP8 '&&b.length>30){w=b.readUInt16LE(26)&0x3fff;h=b.readUInt16LE(28)&0x3fff}
   if(fmt==='VP8L'){const bits=b.readUInt32LE(21);w=1+(bits&0x3fff);h=1+((bits>>>14)&0x3fff)}
  }
  if(w>0&&h>0&&Math.min(w,h)<300)tiny.push({path:p,size:w+'x'+h});
  if((/hero|feature|ky-tuc|dorm/i.test(p))&&w>0&&w<550)tiny.push({path:p,size:w+'x'+h,reason:'featured photo too narrow'});
  const sig=crypto.createHash('sha1').update(b).digest('hex');if(fingerprints.has(sig))duplicate++;fingerprints.add(sig);
 }
}
for(const p of roots)scan(p);
console.log('MRLEE IMAGE QUALITY: '+count+' image assets audited; '+tiny.length+' resolution warnings; '+duplicate+' exact duplicate binaries; '+fail.length+' corrupt/tiny files');
if(tiny.length)console.log('Low resolution examples: '+JSON.stringify(tiny.slice(0,18)));
for(const f of fail)console.error(f);
if(fail.length)process.exitCode=1;
