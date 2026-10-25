/** MR LEE CSS asset check: all stylesheets referenced by root HTML pages. */
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),seen=new Set(),broken=[],warnings=[];
const clean=s=>s.split('?')[0].split('#')[0].trim().replace(/\\/g,'/');
const fileExists=s=>fs.existsSync(path.join(root,s));
const normalize=(folder,name)=>path.normalize(path.join(folder,name)).replace(/\\/g,'/');
function checkCSS(rel){
 if(seen.has(rel)||!fileExists(rel))return;seen.add(rel);
 const source=fs.readFileSync(path.join(root,rel),'utf8');
 const folder=path.dirname(rel);
 for(const m of source.matchAll(/(?:^|[;\s])@import\s+(?:url\()?["']([^"'()]+\.css(?:\?[^"']*)?)["']\)?/gm)){
  const name=clean(m[1]);if(/^(https?:|\/\/|data:|\/)/.test(name))continue;
  const target=normalize(folder,name);if(fileExists(target))checkCSS(target);
  else broken.push({css:rel,missing:target,source:'@import'});
 }
 for(const m of source.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^'")\s][^)]*))\s*\)/g)){
  const raw=(m[1]||m[2]||m[3]||'').trim();
  if(!raw||raw.startsWith('#')||/^(https?:|\/\/|data:|blob:|var\(|about:)/i.test(raw))continue;
  const url=clean(raw);if(!url||/[{}$<>]/.test(url)){warnings.push({css:rel,url:raw});continue}
  if(url.startsWith('/')){warnings.push({css:rel,url:raw,reason:'absolute path: check Pages prefix'});continue}
  const target=normalize(folder,url);
  if(target.startsWith('..')||path.isAbsolute(target)){broken.push({css:rel,missing:target,source:'path-escape'});continue}
  if(!fileExists(target))broken.push({css:rel,missing:target,source:'url'});
 }
}
const roots=fs.readdirSync(root).filter(x=>x.endsWith('.html'));
for(const page of roots){
 const html=fs.readFileSync(path.join(root,page),'utf8');
 for(const m of html.matchAll(/<link\b[^>]*href=["']([^"']+\.css(?:\?[^"']*)?)["'][^>]*>/gi)){
  const href=clean(m[1]);if(!href||/^(https?:|\/\/|data:|\/)/.test(href))continue;
  if(fileExists(href))checkCSS(href);
 }
}
console.log('CSS AUDIT: '+seen.size+' linked CSS files, '+broken.length+' broken background/font paths, '+warnings.length+' complex/absolute URLs');
broken.slice(0,100).forEach(x=>console.error('BROKEN CSS '+x.css+' -> '+x.missing+' '+x.source));
if(broken.length>100)console.error('... '+(broken.length-100)+' more');
warnings.slice(0,15).forEach(x=>console.warn('WARN CSS '+x.css+' '+x.url));
if(broken.length)process.exitCode=1;
