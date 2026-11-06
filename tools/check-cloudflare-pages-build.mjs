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
 'assets/branding/site-logo.js','_redirects','robots.txt','sitemap.xml'
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
const configuredOrigin=String(process.env.MRLEE_SITE_ORIGIN||
 'https://mrlee-b6a.pages.dev').replace(/\/+$/,'');
const expectedOrigin=configuredOrigin==='https://mrlee.pages.dev'
 ? 'https://mrlee-b6a.pages.dev' : configuredOrigin;
assert(share.includes(expectedOrigin+'/'),
 'Sharing still points to a different Cloudflare hostname');
assert(!share.includes('https://mrlee.pages.dev/'),
 'Unassigned mrlee.pages.dev link leaked into the generated website');
assert(index.includes(`<link rel="canonical" href="${expectedOrigin}/">`),
 'Canonical homepage URL is missing or inconsistent');
const robots=await readFile(join(dist,'robots.txt'),'utf8');
const sitemap=await readFile(join(dist,'sitemap.xml'),'utf8');
assert(robots.includes(`Sitemap: ${expectedOrigin}/sitemap.xml`), 'robots.txt sitemap mismatch');
assert(sitemap.includes(`<loc>${expectedOrigin}/</loc>`), 'sitemap root URL mismatch');

const noindexOnlyPaths=[
 'hoc-tieng-han.html','kiem-tra-online.html','mrlee-bai-tap-pro.html',
 'giao-tiep-theo-chu-de.html','giao-tiep-phong-van.html',
 'on-luyen-phong-van.html','mrlee-game-arena.html',
 'admin.html','trung-tam-hoc-vien.html','dang-nhap.html'
];
for(const privatePath of noindexOnlyPaths){
 assert(!sitemap.includes(`<loc>${expectedOrigin}/${privatePath}</loc>`),
  'Login-restricted page leaked into public sitemap: '+privatePath);
 assert(paths.has(privatePath),'Protected page omitted from Cloudflare output: '+privatePath);
 const content=await readFile(join(dist,privatePath),'utf8');
 const robotsMeta=content.match(/<meta\b(?=[^>]*\bname\s*=\s*["']robots["'])[^>]*>/gi)||[];
 assert(robotsMeta.some(tag=>/noindex/i.test(tag)),
  'Protected page missing noindex metadata: '+privatePath);
}
assert(!/Disallow:\s*\/(?:admin\.html|trung-tam-hoc-vien\.html)/i.test(robots),
 'robots.txt must not prevent crawlers seeing the noindex directive');
const brandMatch=index.match(/<script type="application\/ld\+json" data-mrlee-brand-jsonld="v1">([\s\S]*?)<\/script>/);
assert(brandMatch,'Homepage missing MR LEE structured data');
const brandGraph=JSON.parse(brandMatch[1]);
assert(brandGraph['@context']==='https://schema.org','Structured data has invalid context');
assert(brandGraph['@graph'].some(x=>x['@type']==='Organization' && x.url===expectedOrigin+'/'),
 'Missing correctly linked MR LEE organization');
assert(brandGraph['@graph'].some(x=>x['@type']==='WebSite' && x.url===expectedOrigin+'/'),
 'Missing correctly linked MR LEE website');


const sitemapUrls=[...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(m=>m[1].trim());
const publicGuidePages=[
 'huong-dan-hoc-tieng-han.html',
 'lo-trinh-so-cap-1.html','lo-trinh-so-cap-2.html',
 'lo-trinh-trung-cap-1.html','lo-trinh-trung-cap-2.html',
 'lo-trinh-cao-cap-1.html','lo-trinh-cao-cap-2.html'
];
assert(sitemapUrls.length>=21,'Public sitemap lost core SEO landing pages');
// Number of sitemap URLs is now governed by public accessibility, not private lesson links.
const publicTopicGuides=[
 'huong-dan-on-thi-topik-i.html','huong-dan-on-thi-topik-ii.html',
 'ngu-phap-tieng-han-co-ban.html','cau-hoi-phong-van-du-hoc-han-quoc.html'
];
for(const guidePath of publicTopicGuides){
 assert(sitemapUrls.includes(`${expectedOrigin}/${guidePath}`),'Topic guide omitted from sitemap: '+guidePath);
 assert(paths.has(guidePath),'Topic guide missing from output: '+guidePath);
 const guide=await readFile(join(dist,guidePath),'utf8');
 assert(guide.includes('<main id="main"')&&guide.includes('<h1>'),
  'Topic guide missing semantic readable content: '+guidePath);
 assert(!guide.includes('auth-guard.js')&&!guide.includes('mrlee-auth-hide'),
  'Topic guide must remain a public preview: '+guidePath);
 assert(guide.includes('dang-nhap.html'),
  'Topic guide has no learning account entry point: '+guidePath);
}

for(const guidePath of publicGuidePages){
 const guideUrl=`${expectedOrigin}/${guidePath}`;
 assert(sitemapUrls.includes(guideUrl),'Missing public learning guide in sitemap: '+guidePath);
 assert(paths.has(guidePath),'Missing generated public learning guide: '+guidePath);
 const guide=await readFile(join(dist,guidePath),'utf8');
 assert(guide.includes('<main id="main"')&&guide.includes('<h1>'),
  'Learning guide missing semantic public content: '+guidePath);
 assert(!guide.includes('auth-guard.js')&&!guide.includes('mrlee-auth-hide'),
  'Public learning preview is incorrectly gated: '+guidePath);
 assert(guide.includes('hoc-theo-bai.html?cap=')||guidePath==='huong-dan-hoc-tieng-han.html',
  'Public learning preview does not lead to the protected lesson route');
 if(guidePath!=='huong-dan-hoc-tieng-han.html'){
  assert((guide.match(/class="seo-lesson-card"/g)||[]).length===15,
   'Expected exactly 15 lesson previews: '+guidePath);
 }
}
const publicGuideHome=await readFile(join(dist,'index.html'),'utf8');
assert(publicGuideHome.includes('href="huong-dan-hoc-tieng-han.html"'),
 'Homepage missing public learning guide link');

const seenSeoPaths=new Set();
for(const href of sitemapUrls){
 const url=new URL(href);
 assert(url.origin===expectedOrigin,'Sitemap URL has a different domain: '+href);
 const pagePath=url.pathname==='/'?'index.html':url.pathname.slice(1);
 assert(paths.has(pagePath),'Sitemap lists a missing HTML page: '+pagePath);
 assert(!seenSeoPaths.has(pagePath),'Duplicate sitemap page: '+pagePath);
 seenSeoPaths.add(pagePath);
 const page=await readFile(join(dist,pagePath),'utf8');
 const canonicalTags=page.match(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/gi)||[];
 assert(canonicalTags.length===1&&canonicalTags[0].includes(`href="${href}"`),
  'Incorrect or duplicate canonical URL on '+pagePath);
 assert(page.includes(`property="og:url" content="${href}"`),
  'Missing page-specific social sharing URL on '+pagePath);
 assert(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:title["'])[^>]*>/i.test(page),
  'Missing social sharing title on '+pagePath);
 assert(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:image["'])[^>]*>/i.test(page),
  'Missing social sharing image on '+pagePath);
}

assert(!share.includes('https://jeongjunlee10x.github.io/tienghanmrlee.github.io/'),
 'Sharing still uses GitHub project URL');
assert(redirects.includes('/tienghanmrlee.github.io/* /:splat 301'),
 'Missing old-project-path compatibility redirect');
assert(files.some(f=>f.path.startsWith('assets/')&&f.path.endsWith('.css')));
assert(files.some(f=>f.path.startsWith('images/')&&f.path.endsWith('.webp')));
const MiB=(files.reduce((sum,f)=>sum+f.size,0)/1048576).toFixed(1);
console.log('CLOUDFLARE DEPLOY PRECHECK PASSED '+JSON.stringify({
 files:files.length,mp3:audio.length,MiB,
 remaining:20000-files.length,staticAssets:'OK',legacyGitHub:'unchanged',origin:expectedOrigin
}));
