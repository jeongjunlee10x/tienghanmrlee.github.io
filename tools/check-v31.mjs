/* MR LEE v31 smoke checks: no external services or secrets needed. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const scripts=[
'assets/v31/premium-gallery.js','assets/v31/lesson-practice.js',
'assets/v31/admin-inbox.js','assets/v31/official-sources.js',
'assets/mrlee-next/consultation.js','assets/mrlee-next/consultation-admin.js'];
const pages=['index.html','tuyen-sinh.html','hoc-tieng-han.html','kiem-tra-topik.html',
'van-hoa-han-quoc.html','giao-tiep-theo-chu-de.html','giao-tiep-phong-van.html',
'ban-do-dai-hoc-han-quoc.html','bo-sach.html','mrlee-bai-tap-pro.html',
'bang-xep-hang.html','dang-ky-tu-van.html','hoc-theo-bai.html','admin.html'];
for(const path of [...scripts,...pages]){
 assert(existsSync(path),'Missing '+path);
 if(path.endsWith('.js')){
  const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});
  assert.equal(result.status,0,'Invalid JS '+path+': '+result.stderr);
 }
}
for(const page of pages){
 const html=readFileSync(page,'utf8');
 if(page==='admin.html'){assert(html.includes('assets/v31/admin-inbox.js'),'Admin inbox missing');continue}
 assert(html.includes('assets/v31/premium-gallery.js'),'Image gallery missing from '+page);
 if(page==='dang-ky-tu-van.html'){
  for(const field of ['dossier_academic_level','dossier_target_university','dossier_budget','dossier_document_progress']){
   assert(html.includes('name="'+field+'"'),'Intake field missing: '+field);
  }
 }
 if(page==='hoc-theo-bai.html')assert(html.includes('assets/v31/lesson-practice.js'),'Extended lesson missing');
}
const images=['learning-hangeul','learning-roadmap','learning-listening','learning-topik',
'learning-books','learning-cap-1','learning-cap-2','learning-cap-3','learning-cap-4',
'learning-cap-5','learning-cap-6','culture','feature-8-doi-song','feature-1-tuyen-sinh'];
for(const img of images){
 const path='assets/v306/images/'+img+'.webp';assert(existsSync(path),'Gallery image missing: '+path);
 const b=readFileSync(path);assert.equal(b.toString('ascii',0,4),'RIFF','Not a WebP RIFF: '+path);
 const type=b.toString('ascii',12,16);let width=0,height=0;
 if(type==='VP8 '){width=b.readUInt16LE(26)&0x3fff;height=b.readUInt16LE(28)&0x3fff}
 else if(type==='VP8X'){width=1+b.readUIntLE(24,3);height=1+b.readUIntLE(27,3)}
 else if(type==='VP8L'){let x=b.readUInt32LE(21);width=(x&0x3fff)+1;height=((x>>14)&0x3fff)+1}
 assert(width>=1000&&height>=600,'Image is below source quality target: '+path+' '+width+'x'+height);
}
const lead=readFileSync('assets/mrlee-next/consultation-admin.js','utf8');
assert(lead.includes('profile_details'),'Admin dossier fields missing');
const send=readFileSync('assets/mrlee-next/consultation.js','utf8');
assert(send.includes('data.profile_details=profile_details'),'Consultation profile data missing');
console.log('PASS: v31 JS syntax, '+pages.length+' pages, '+images.length+' high-resolution original local images, dossier integration.');
