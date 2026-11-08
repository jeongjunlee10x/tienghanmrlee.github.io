/**
 * MR LEE media QA — read-only inspection of actual binary headers.
 * No transcoding, no TTS calls, no renaming and no file writes outside artifacts.
 * Run from repository root: node tools/audit-media-integrity.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.cwd();
const OUT=path.join(ROOT,'artifacts/media-integrity');
const SKIP=new Set(['.git','.github','archive','node_modules','dist','tools','scripts','docs','coverage','artifacts']);
const AUDIO_EXT=new Set(['.mp3']);
const IMAGE_EXT=new Set(['.png','.jpg','.jpeg','.webp','.gif','.avif']);
const report={checkedAt:new Date().toISOString(),audio:{count:0,bytes:0},images:{count:0,bytes:0},
  errors:[],warnings:[],duplicates:[],largeImages:[],lowResolution:[],byGroup:{}};
const seen=new Map();
const error=(file,reason)=>report.errors.push({file,reason});
const warning=(file,reason)=>{if(report.warnings.length<100)report.warnings.push({file,reason})};
function dimensions(buffer,ext){
 if(ext==='.png' && buffer.length>=24 && buffer.subarray(0,8).equals(
    Buffer.from([137,80,78,71,13,10,26,10])))return [buffer.readUInt32BE(16),buffer.readUInt32BE(20)];
 if(ext==='.webp' && buffer.length>30 && buffer.toString('ascii',0,4)==='RIFF' &&
    buffer.toString('ascii',8,12)==='WEBP'){
   const fmt=buffer.toString('ascii',12,16);
   if(fmt==='VP8X')return [buffer.readUIntLE(24,3)+1,buffer.readUIntLE(27,3)+1];
   if(fmt==='VP8 ')return [buffer.readUInt16LE(26)&0x3fff,buffer.readUInt16LE(28)&0x3fff];
   if(fmt==='VP8L'){
     const bits=buffer.readUInt32LE(21);
     return [1+(bits&0x3fff),1+((bits>>>14)&0x3fff)];
   }
 }
 if(ext==='.gif' && buffer.length>=10)return [buffer.readUInt16LE(6),buffer.readUInt16LE(8)];
 return null;
}
function readHeader(file,bytes=64){
 const fd=fs.openSync(file,'r');
 try{const b=Buffer.allocUnsafe(bytes);const size=fs.readSync(fd,b,0,bytes,0);return b.subarray(0,size)}
 finally{fs.closeSync(fd)}
}
function isMP3(header){
 if(header.length<3)return false;
 if(header.toString('ascii',0,3)==='ID3')return header.length>10;
 return header[0]===0xff && (header[1]&0xe0)===0xe0 && (header[1]&0x18)!==0x08;
}
function inspect(file){
 const relative=path.relative(ROOT,file).replaceAll('\\','/');
 const ext=path.extname(file).toLowerCase();
 const stat=fs.statSync(file);
 if(!stat.isFile())return;
 const group=relative.startsWith('MRLEE_PRO_AUDIO/')?'Pro audio':
   relative.startsWith('MRLEE_AUDIO/')?'Learning audio':
   relative.startsWith('assets/topik-v10/audio/')?'TOPIK V10':'Site images/other';
 report.byGroup[group]=(report.byGroup[group]||0)+1;
 if(AUDIO_EXT.has(ext)){
   report.audio.count++;report.audio.bytes+=stat.size;
   if(stat.size<1000){error(relative,'MP3 smaller than 1000 bytes');return}
   if(!isMP3(readHeader(file,64)))error(relative,'Not a recognized MP3 ID3 or MPEG frame header');
   return;
 }
 if(!IMAGE_EXT.has(ext))return;
 report.images.count++;report.images.bytes+=stat.size;
 if(stat.size<200){error(relative,'Image smaller than 200 bytes');return}
 const header=readHeader(file,64);
 const sig=header.toString('ascii');
 const valid=ext==='.png'?header.length>=24 && header.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):
   ext==='.webp'?sig.slice(0,4)==='RIFF'&&sig.slice(8,12)==='WEBP':
   ext==='.gif'?sig.startsWith('GIF87a')||sig.startsWith('GIF89a'):
   (ext==='.jpeg'||ext==='.jpg')?header[0]===0xff&&header[1]===0xd8:
   ext==='.avif'?sig.includes('ftypavif')||sig.includes('ftypavis'):false;
 if(!valid){error(relative,'Image header does not match its extension');return}
 const d=dimensions(header,ext);
 if(d && (d[0]<1||d[1]<1||d[0]>40000||d[1]>40000))error(relative,'Invalid pixel dimensions');
 if(d && (d[0]<360||d[1]<240) && /(?:hero|feature|cover|culture|gallery)/i.test(relative)){
   if(report.lowResolution.length<80)report.lowResolution.push({file:relative,width:d[0],height:d[1]});
 }
 if(stat.size>450000){
   if(report.largeImages.length<80)report.largeImages.push({file:relative,kb:Math.round(stat.size/1024)});
 }
 // Detect identical binary images; never delete images automatically.
 const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 if(seen.has(hash)){
   if(report.duplicates.length<80)report.duplicates.push({first:seen.get(hash),duplicate:relative});
 }else seen.set(hash,relative);
}
function walk(dir){
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
   if(ent.name.startsWith('.')||SKIP.has(ent.name))continue;
   const abs=path.join(dir,ent.name);
   if(ent.isSymbolicLink()){error(path.relative(ROOT,abs),'Symbolic links are not expected in public media');continue}
   if(ent.isDirectory())walk(abs);
   else if(ent.isFile())inspect(abs);
 }
}
walk(ROOT);
const essentials=[
 'assets/images/heroes/01-trang-chu-fresh.webp',
 'assets/images/heroes/01-trang-chu-future.webp',
 'assets/branding/logo-mrlee.png'
];
for(const file of essentials)if(!fs.existsSync(path.join(ROOT,file)))error(file,'Essential image file is missing');
if(report.audio.count<14000)error('MP3 collection','Expected at least 14000 MP3, got '+report.audio.count);
if(report.images.count<600)error('Images collection','Expected at least 600 images, got '+report.images.count);
report.audio.mb=+(report.audio.bytes/1048576).toFixed(1);
report.images.mb=+(report.images.bytes/1048576).toFixed(1);
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('MR LEE MEDIA INTEGRITY '+JSON.stringify({
 audio:report.audio.count,images:report.images.count,errors:report.errors.length,
 duplicates:report.duplicates.length,largeImages:report.largeImages.length,
 lowResolution:report.lowResolution.length
}));
for(const item of report.errors.slice(0,25))console.error('MEDIA FAIL '+item.file+': '+item.reason);
if(report.errors.length)process.exitCode=1;
