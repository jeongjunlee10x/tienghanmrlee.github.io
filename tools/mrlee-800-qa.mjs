#!/usr/bin/env node
// MR LEE 800: strict, truthful media audit. Node 22, no dependencies.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/images/MRLEE_800_MANIFEST.json'),'utf8'));
const fail=s=>{console.error('MRLEE 800 QA FAILED:',s);process.exitCode=1;};
const categoryCounts={heroes:30,menu:120,'sub-menu':240,topics:250,icons:100,backgrounds:60};
if(manifest.total_planned!==800||manifest.assets.length!==800)fail('Manifest must contain precisely 800 slots');
const seenPaths=new Set(),seenWebP=new Set(),seenSVG=new Set(),cats={};
let ready=0,vector=0,covered=0;
for(const asset of manifest.assets){
 if(seenPaths.has(asset.path))fail('Duplicate target '+asset.path);
 seenPaths.add(asset.path);
 cats[asset.category]=(cats[asset.category]||0)+1;
 if(asset.status==='ready'){
   ready++;
   const file=path.join(root,asset.path);
   if(!fs.existsSync(file)){fail('Missing WebP: '+asset.path);continue;}
   const data=fs.readFileSync(file);
   if(asset.path.endsWith('.webp')===false||data.subarray(0,4).toString()!=='RIFF'||data.subarray(8,12).toString()!=='WEBP'||data.length<20000)fail('Invalid WebP '+asset.path);
   const sha=crypto.createHash('sha256').update(data).digest('hex');
   if(seenWebP.has(sha))fail('Reused identical WebP '+asset.path);
   seenWebP.add(sha);
   if(asset.sha256&&asset.sha256!==sha)fail('WebP SHA mismatch '+asset.path);
 }
 if(asset.vector_status==='ready'){
   vector++;
   const f=asset.vector_fallback;
   if(!f||!f.endsWith('.svg')){fail('Invalid vector reference '+asset.path);continue;}
   const abs=path.join(root,f);
   if(!fs.existsSync(abs)){fail('Missing vector '+f);continue;}
   const svg=fs.readFileSync(abs,'utf8');
   if(!svg.startsWith('<svg')||!svg.includes('viewBox="0 0 1920 1080"')||!svg.includes('</svg>'))fail('Invalid 1920x1080 SVG '+f);
   if(/<script|<foreignObject|onload\s*=|xlink:href\s*=|href\s*=|url\(https?:\/\//i.test(svg))fail('Unsafe or externally linked SVG '+f);
   const hash=crypto.createHash('sha256').update(svg).digest('hex');
   if(seenSVG.has(hash))fail('Duplicate vector design '+f);
   seenSVG.add(hash);
 }
 if(asset.category==='heroes'&&(asset.status==='ready'||asset.vector_status==='ready'))covered++;
}
for(const [key,n] of Object.entries(categoryCounts))if(cats[key]!==n)fail('Category '+key+' should contain '+n+' slots, found '+(cats[key]||0));
if(manifest.ready!==ready||manifest.pending!==800-ready)fail('Count mismatch: manifest must report WebP only');
if(manifest.vector_ready!==vector||manifest.hero_slots_covered!==covered)fail('Vector or covered-hero count mismatch');
if(covered!==30)fail('All 30 hero variants must have either original WebP or SVG vector fallback');
const loader=fs.readFileSync(path.join(root,'assets/images/system/mrlee800-hero-loader.js'),'utf8');
if(!loader.includes("heroURL(t,'svg')")||!loader.includes("let uri=heroURL(t)"))fail('WebP-first fallback loader missing');
for(const p of ['tuyen-sinh.html','dang-ky-tu-van.html','bang-xep-hang.html','bang-chu-cai-tieng-han.html','topik-nghe-24-cau.html','topik-nghe-124-cau.html','topik-viet-51-54.html']){
 if(!fs.readFileSync(path.join(root,p),'utf8').includes('mrlee800-hero-loader.js'))fail('Missing loader hook '+p);
}
console.log('MRLEE 800 QA:',{planned:800,webp_ready:ready,vector_fallback_ready:vector,hero_covered:covered,missing_webp:800-ready,categories:cats});
if(process.exitCode)process.exit(process.exitCode);
