/* MR LEE CULTURE V19: static integrity and actual WebP dimensions.
 * Describes real intrinsic image sizes; does not claim that re-encoding creates detail.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const media=fs.readFileSync('mrlee-culture-v17-media.js','utf8');
const slugs=[...media.matchAll(/"slug":"([^"]+)","title":/g)].map(m=>m[1]);
assert.equal(slugs.length,22,'22 distinct Culture topics required');
assert.equal(new Set(slugs).size,22,'Unique Culture topic slugs required');
const size=b=>{
 if(b.subarray(0,4).toString()!=='RIFF'||b.subarray(8,12).toString()!=='WEBP')return null;
 const f=b.subarray(12,16).toString();
 if(f==='VP8X'&&b.length>29)return [b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1];
 if(f==='VP8 '&&b.length>29)return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
 if(f==='VP8L'&&b.length>25){const p=b.readUInt32LE(21);return [(p&0x3fff)+1,((p>>>14)&0x3fff)+1]}
 return null;
};
let count=0;const low=[],dimensions={};
for(const slug of slugs){
 for(let k=1;k<=5;k++){
  const p=path.join('images/culture-v18-hd',slug,String(k).padStart(2,'0')+'.webp');
  assert.ok(fs.existsSync(p),'Missing '+p);
  const b=fs.readFileSync(p),wh=size(b);
  assert.ok(wh,'Invalid WebP header '+p);
  dimensions[p]=wh;count++;
  if(wh[0]<800||wh[1]<500)low.push(p+' '+wh.join('x'));
 }
 assert.ok(fs.existsSync(path.join('images/culture-v13',slug+'.svg')),'Missing vector fallback '+slug);
}
for(const p of ['van-hoa-han-quoc.html','van-hoa-bai-hoc.html']){
 const html=fs.readFileSync(p,'utf8');
 assert.ok(html.includes('mrlee-culture-hd-v19.js'),'V19 image engine missing '+p);
 assert.ok(html.includes('mrlee-culture-hd-v19.css'),'V19 style missing '+p);
 assert.ok(!html.includes('mrlee-culture-v1721-visibility.js'),'Legacy image rewrite still loaded');
 assert.ok(!html.includes('mrlee-culture-v172-gallery.js'),'Duplicate gallery still loaded');
 assert.ok(!html.includes('mrlee-culture-v171-image-fix.js'),'Old SVG override still loaded');
}
assert.ok(fs.readFileSync('mrlee-culture-hd-v19.js','utf8').includes("window.MRLEE_CULTURE_V17_MEDIA"));
console.log('CULTURE V19 QA: '+count+'/110 image files present, '+slugs.length+' topics, '+low.length+' resolution warnings.');
console.log('Sample intrinsic sizes: '+JSON.stringify(Object.entries(dimensions).filter(([p])=>p.endsWith('01.webp')).map(([p,v])=>[p,v])));
if(low.length)console.error('Photos need genuine higher-resolution source (NOT software enlargement):\n'+low.slice(0,40).join('\n'));
if(low.length)process.exitCode=1;
