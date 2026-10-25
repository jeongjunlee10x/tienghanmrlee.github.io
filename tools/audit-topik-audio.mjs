/* Read-only TOPIK audio diagnostic for legacy 24 audio elements. */
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),page=fs.readFileSync(path.join(root,'topik-nghe-24-cau.html'),'utf8');
const originals=[...page.matchAll(/<audio\b[^>]*src="(topik-audio\/[^"]+\.mp3)"/g)].map(m=>m[1]);
let catalog=[];
try{catalog=JSON.parse(fs.readFileSync(path.join(root,'MRLEE_AUDIO/catalog.json'),'utf8'))}catch(err){
 console.error('CATALOG READ ERROR: '+err.message);process.exit(1);
}
const map=new Map();
if(Array.isArray(catalog))for(const row of catalog)if(row?.old&&row?.file)map.set(String(row.old).replace(/^\.\//,'').split('?')[0],String(row.file));
let mapped=0,verified=0,broken=0;
for(const src of originals){
 const file=map.get(src);if(file)mapped++;
 const target=file?'MRLEE_AUDIO/'+file:null;
 let ok=false;
 if(target){
  const absolute=path.resolve(root,target);
  if(absolute.startsWith(root+path.sep)&&fs.existsSync(absolute)){
   const stats=fs.statSync(absolute);
   ok=stats.isFile()&&stats.size>1000;
  }
 }
 if(ok)verified++;else broken++;
 console.log((ok?'OK ':'MISSING ')+src+' => '+(target||'(unmapped)'));
}
console.log('TOPIK 24 sources: '+originals.length+'; mapped: '+mapped+'; verified MP3: '+verified+'; unresolved: '+broken);
if(originals.length!==24||broken)process.exitCode=1;
