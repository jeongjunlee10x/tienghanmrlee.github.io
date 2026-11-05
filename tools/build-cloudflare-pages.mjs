/**
 * MR LEE — optional Cloudflare Pages static export.
 *
 * Run: node tools/build-cloudflare-pages.mjs
 * Cloudflare Pages: production branch main, build command above, output dist.
 *
 * The GitHub Pages source is never modified; only an untracked /dist directory
 * is created. Existing /tienghanmrlee.github.io/ URLs are rewritten in that
 * output, while source HTML/JS and the old GitHub URL remain unchanged.
 */
import { readdir, lstat, mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises';
import { join, relative, resolve, dirname, extname, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
const excludedDirs = new Set([
  '.git','.github','.vscode','.idea','node_modules','dist','archive',
  'tools','docs','scripts','leaderboard-functions','functions','supabase',
  'coverage','artifacts','.cache','.wrangler'
]);
const allowedExt = new Set([
  '.html','.htm','.css','.js','.mjs','.json','.geojson','.webmanifest',
  '.csv','.xml','.txt','.mp3','.wav','.mp4','.webm','.ogg','.webp','.png',
  '.jpg','.jpeg','.gif','.avif','.ico','.svg','.pdf','.woff','.woff2',
  '.ttf','.otf','.vtt','.srt','.gltf','.glb','.bin'
]);
const textExt = new Set(['.html','.htm','.js','.mjs','.json','.css','.xml','.webmanifest']);
const denyName = /(?:^\.(?!well-known)|(?:^|[-_.])(?:secret|credentials|private-key|service-account)(?:[-_.]|$)|\.env(?:\.|$)|\.(?:pem|key|p12|pfx|sqlite|db|bak|zip|sql|rules|ps1|cmd|md)$)/i;
const oldOrigin = 'https://jeongjunlee10x.github.io/tienghanmrlee.github.io';
const oldRoot = '/tienghanmrlee.github.io/';
// CF_PAGES_URL is set by Cloudflare on both production and previews.
// MRLEE_SITE_ORIGIN overrides it when a final domain is assigned.
const configuredOrigin = String(process.env.MRLEE_SITE_ORIGIN || process.env.CF_PAGES_URL ||
  'https://mrlee-b6a.pages.dev').replace(/\/+$/,'');
// Cloudflare assigned mrlee-b6a.pages.dev; preserve the legacy mistaken dashboard
// value until an administrator edits it, without modifying the GitHub site.
const origin = configuredOrigin === 'https://mrlee.pages.dev'
  ? 'https://mrlee-b6a.pages.dev' : configuredOrigin;
if(!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin)){
 throw new Error('Invalid MRLEE_SITE_ORIGIN / CF_PAGES_URL: use an https:// origin without path');
}

const maxFiles = 19500; // safety headroom below Cloudflare Free's 20,000 files
const maxFileBytes = 25*1024*1024;
const input=[];
async function scan(folder){
 for(const ent of await readdir(folder,{withFileTypes:true})){
  if(ent.name.startsWith('.') && ent.name!=='.well-known')continue;
  const abs=join(folder,ent.name);
  if(ent.isSymbolicLink())throw new Error('Symlinks are not allowed: '+relative(root,abs));
  if(ent.isDirectory()){
   if(excludedDirs.has(ent.name))continue;
   await scan(abs);
  }else if(ent.isFile()){
   const ext=extname(ent.name).toLowerCase();
   const rel=relative(root,abs);
   if(!allowedExt.has(ext)||denyName.test(ent.name))continue;
   const st=await lstat(abs);
   if(st.size>maxFileBytes)throw new Error('Cloudflare Pages 25 MiB file limit: '+rel);
   input.push({abs,rel,ext,size:st.size});
  }
 }
}
await scan(root);
if(input.length>maxFiles)throw new Error('Free Pages file count unsafe: '+input.length+'/'+maxFiles);
if(!input.some(x=>x.rel==='index.html'))throw new Error('Homepage index.html missing');
for(const essential of ['hoc-tieng-han.html','hoc-theo-bai.html','kiem-tra-topik.html',
 'mrlee-bai-tap-pro.html','van-hoa-han-quoc.html','admin.html','auth-guard.js']){
 if(!input.some(x=>x.rel===essential))throw new Error('Missing site route: '+essential);
}

// Limit concurrent file reads/copies to avoid exhausting CI file descriptors.
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
const queue=input.slice();
const workers=Array.from({length:16},async()=>{
 while(queue.length){
  const item=queue.pop();
  if(!item)break;
  const target=join(out,item.rel);
  await mkdir(dirname(target),{recursive:true});
  if(!textExt.has(item.ext)){
   await copyFile(item.abs,target);
   continue;
  }
  const original=await readFile(item.abs,'utf8');
  let next=original.replaceAll(oldOrigin+'/',origin+'/')
                   .replaceAll(oldOrigin,origin)
                   .replaceAll(oldRoot,'/');
  // Only Cloudflare's generated homepage gets canonical SEO metadata.
  if(item.rel==='index.html' && !/<link\b[^>]*rel=["']canonical["']/i.test(next)){
    next=next.replace(/<\/head>/i,
      `<link rel="canonical" href="${origin}/">\n</head>`);
  }
  // Existing GitHub Pages root is unchanged; only Cloudflare output differs.
  await writeFile(target,next,'utf8');
 }
});
await Promise.all(workers);

// The rewrite handles long-standing absolute links to the original project path.
await writeFile(join(out,'_redirects'),
  '# Old GitHub-project prefix accidentally used on Cloudflare\n'+
  '/tienghanmrlee.github.io/* /:splat 301\n','utf8');
const sitemapPages=['','hoc-tieng-han.html','giao-tiep-theo-chu-de.html',
 'kiem-tra-topik.html','van-hoa-han-quoc.html','tuyen-sinh.html',
 'ban-do-dai-hoc-han-quoc.html','giao-tiep-phong-van.html',
 'hoc-bong-han-quoc.html'];
const available=new Set(input.map(x=>x.rel));
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n'+
 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
 sitemapPages.filter(p=>!p||available.has(p)).map(p=>`  <url><loc>${origin}/${p}</loc></url>`).join('\n')+
 '\n</urlset>\n';
await writeFile(join(out,'sitemap.xml'),sitemap,'utf8');
await writeFile(join(out,'robots.txt'),
 'User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /trung-tam-hoc-vien.html\n'+
 `Sitemap: ${origin}/sitemap.xml\n`,'utf8');
const count=input.length+3; // _redirects, sitemap.xml, robots.txt
if(count>maxFiles)throw new Error('Output exceeds Cloudflare free safety threshold');
const bytes=input.reduce((n,f)=>n+f.size,0);
const mp3=input.filter(f=>f.ext==='.mp3').length;
const summary={
 files:count,mp3,miB:+(bytes/1048576).toFixed(2),
 headroom:20000-count,origin,
 publicRoot:'dist',
 excluded:'archive, docs, tools, GitHub Actions, backend source, ZIP/SQL/secrets'
};
console.log('CLOUDFLARE PAGES STATIC BUILD OK '+JSON.stringify(summary));
