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

// Search engines and social crawlers should see one stable, public URL
// for each page explicitly listed in the sitemap, on the Cloudflare output only.
const sourceSitemap=await readFile(join(root,'sitemap.xml'),'utf8');
const sourceUrls=[...sourceSitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
  .map(match=>match[1].trim());
if(!sourceUrls.length)throw new Error('Source sitemap.xml contains no URLs');
const sourceOrigin=new URL(sourceUrls[0]).origin;
const sitemapPages=[...new Set(sourceUrls.map(href=>{
 const url=new URL(href);
 if(url.origin!==sourceOrigin||url.search||url.hash){
  throw new Error('Invalid source sitemap URL: '+href);
 }
 return decodeURI(url.pathname).replace(/^\/+/, '');
}))];
if(!sitemapPages.includes(''))throw new Error('Source sitemap must include homepage');
const seoPaths=new Set(sitemapPages.map(p=>p||'index.html'));

const authSource=await readFile(join(root,'auth-status.js'),'utf8');
const protectedMatch=authSource.match(/const MRLEE_PROTECTED_PAGES = new Set\((\[[\s\S]*?\])\);/);
if(!protectedMatch)throw new Error('Protected lesson page list not found; refusing unsafe SEO build');
const privatePaths=new Set([
 ...JSON.parse(protectedMatch[1]),
 'admin.html','dang-nhap.html','mrlee-game-arena.html'
]);
for(const path of seoPaths){
 if(privatePaths.has(path))throw new Error('Private page must not be in sitemap: '+path);
}
// Robots metadata is not an authentication mechanism: actual access stays
// enforced by the existing application guard and backend permissions.
function protectSearchIndex(html,pathname){
 if(!privatePaths.has(pathname)||!/<\/head>/i.test(html))return html;
 const robotsTags=html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']robots["'])[^>]*>/gi)||[];
 if(robotsTags.some(tag=>/noindex/i.test(tag)))return html;
 return html.replace(/<\/head>/i,'<meta name="robots" content="noindex,follow">\n</head>');
}
function addBrandStructuredData(html,pathname){
 if(pathname!=='index.html'||!/<\/head>/i.test(html))return html;
 if(/data-mrlee-brand-jsonld/.test(html))return html;
 const graph={
  '@context':'https://schema.org',
  '@graph':[
   {'@type':'Organization','@id':origin+'/#organization',
    'name':'Tiếng Hàn MR LEE','url':origin+'/',
    'logo':origin+'/assets/branding/logo-mrlee.png',
    'sameAs':['https://www.tiktok.com/@hankuc_chemi']},
   {'@type':'WebSite','@id':origin+'/#website',
    'name':'Tiếng Hàn MR LEE','url':origin+'/',
    'inLanguage':'vi-VN','publisher':{'@id':origin+'/#organization'}}
  ]
 };
 const json=JSON.stringify(graph).replace(/</g,'\\u003c');
 return html.replace(/<\/head>/i,
  '<script type="application/ld+json" data-mrlee-brand-jsonld="v1">'+json+'</script>\n</head>');
}

const escapeMeta = text => String(text).replace(/&(?!(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);)/gi,'&amp;')
  .replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function enhanceSeoHead(html,pathname){
 if(!seoPaths.has(pathname)||!/<\/head>/i.test(html))return html;
 const url=origin+'/'+(pathname==='index.html'?'':pathname);
 const title=html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()||'Tiếng Hàn MR LEE';
 const descriptionTag=html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>/i)?.[0]||'';
 const description=descriptionTag.match(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i)?.[2]?.trim()||'';
 const tags=[];
 const add=(pattern,tag)=>{if(!pattern.test(html))tags.push(tag);};
 add(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/i,
   `<link rel="canonical" href="${url}">`);
 add(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:type["'])[^>]*>/i,
   '<meta property="og:type" content="website">');
 add(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:site_name["'])[^>]*>/i,
   '<meta property="og:site_name" content="Tiếng Hàn MR LEE">');
 add(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:locale["'])[^>]*>/i,
   '<meta property="og:locale" content="vi_VN">');
 add(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:title["'])[^>]*>/i,
   `<meta property="og:title" content="${escapeMeta(title)}">`);
 if(description)add(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:description["'])[^>]*>/i,
   `<meta property="og:description" content="${escapeMeta(description)}">`);
 add(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:url["'])[^>]*>/i,
   `<meta property="og:url" content="${url}">`);
 add(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:image["'])[^>]*>/i,
   `<meta property="og:image" content="${origin}/assets/branding/logo-mrlee.png">`);
 add(/<meta\b(?=[^>]*\bname\s*=\s*["']twitter:card["'])[^>]*>/i,
   '<meta name="twitter:card" content="summary_large_image">');
 return html.replace(/<\/head>/i,tags.join('\n')+'\n</head>');
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
  next=enhanceSeoHead(next,item.rel);
  next=protectSearchIndex(next,item.rel);
  next=addBrandStructuredData(next,item.rel);
  // Existing GitHub Pages root is unchanged; only Cloudflare output differs.
  await writeFile(target,next,'utf8');
 }
});
await Promise.all(workers);

// The rewrite handles long-standing absolute links to the original project path.
await writeFile(join(out,'_redirects'),
  '# Old GitHub-project prefix accidentally used on Cloudflare\n'+
  '/tienghanmrlee.github.io/* /:splat 301\n','utf8');
// Generate the same public URL list used for Cloudflare-only SEO metadata.
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
