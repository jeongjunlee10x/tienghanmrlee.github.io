/* Validate the Cloudflare Pages build artifact, never the GitHub Pages source.
 * Run after: node tools/build-cloudflare-pages.mjs.
 */
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {readdir,stat,readFile} from 'node:fs/promises';
import {join,relative,resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(import.meta.url),'../..');
const dist=join(root,'dist');
const files=[];
async function walk(dir){
 for(const e of await readdir(dir,{withFileTypes:true})){
  const abs=join(dir,e.name);
  if(e.isDirectory())await walk(abs);
  else if(e.isFile())files.push({path:relative(dist,abs).replaceAll('\\','/'),
   size:(await stat(abs)).size});
  else throw Error('Unexpected generated file type '+abs);
 }
}
await walk(dist);
const paths=new Set(files.map(f=>f.path));
const required=[
 'index.html','hoc-tieng-han.html','hoc-theo-bai.html',
 'kiem-tra-topik.html','mrlee-bai-tap-pro.html','van-hoa-han-quoc.html',
 'tuyen-sinh.html','ban-do-dai-hoc-han-quoc.html','admin.html',
 'auth-guard.js','firebase-config.js',
 'mrlee-sc-lesson-data.js','MRLEE_AUDIO','MRLEE_PRO_AUDIO',
 'assets/branding/site-logo.js','_redirects'
];
for(const p of required){
 const isDir=!p.includes('.') && !p.startsWith('_');
 assert(isDir?[...paths].some(x=>x.startsWith(p+'/')):paths.has(p),
  'A required website feature was omitted: '+p);
}
assert(files.length<=19500,'Cloudflare Free has 20,000-file cap; leave headroom');
assert(files.every(f=>f.size<=25*1024*1024),
 'Cloudflare Pages assets cannot exceed 25 MiB');
assert(files.some(f=>f.path.startsWith('MRLEE_PRO_AUDIO/')&&f.path.endsWith('.mp3')),
 'TOPIK Pro/lesson MP3 files were omitted');
const audio=files.filter(f=>f.path.endsWith('.mp3'));
assert(audio.length>=14000,'Original site audio files missing: '+audio.length);
for(const p of files.map(x=>x.path)){
 assert(!/(^|\/)(?:\.git|\.github|archive|docs|tools|scripts|supabase|functions|leaderboard-functions|node_modules)(?:\/|$)/.test(p),
  'Archive or backend file made public: '+p);
 assert(!/\.(?:zip|sql|pem|pfx|bak|ps1|cmd|rules)$/i.test(p),
  'Sensitive or unnecessary source file published: '+p);
}
// Prevent a recurring contact dock JavaScript parse error from reaching Cloudflare.
new Script(await readFile(join(dist,'assets/branding/contact-dock.js'),'utf8'),
 {filename:'assets/branding/contact-dock.js'});
const index=await readFile(join(dist,'index.html'),'utf8');
const share=await readFile(join(dist,'mrlee-engagement.js'),'utf8');
const redirects=await readFile(join(dist,'_redirects'),'utf8');
assert(index.includes('<html')&&index.includes('mrleeNewHome'),'Homepage lost functionality');
assert(share.includes('https://mrlee.pages.dev/')||
 share.includes((process.env.MRLEE_SITE_ORIGIN||process.env.CF_PAGES_URL||'https://mrlee.pages.dev').replace(/\/+$/,'')+'/'),
 'Old share URL was not translated for the new hostname');
assert(!share.includes('https://jeongjunlee10x.github.io/tienghanmrlee.github.io/'),
 'Sharing still uses GitHub project URL');
assert(redirects.includes('/tienghanmrlee.github.io/* /:splat 301'),
 'Missing old-project-path compatibility redirect');
assert(files.some(f=>f.path.startsWith('assets/')&&f.path.endsWith('.css')));
assert(files.some(f=>f.path.startsWith('images/')&&f.path.endsWith('.webp')));
const MiB=(files.reduce((sum,f)=>sum+f.size,0)/1048576).toFixed(1);
console.log('CLOUDFLARE DEPLOY PRECHECK PASSED '+JSON.stringify({
 files:files.length,mp3:audio.length,MiB,
 remaining:20000-files.length,headersAndRoutes:'OK',legacyGitHub:'unchanged'
}));
