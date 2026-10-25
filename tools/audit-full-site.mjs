/**
 * MR LEE full-site read-only preflight.
 * Scans every root HTML page (including legacy routes), checks local files,
 * the original logo, JS parsing, and navigational integrity. No dependencies.
 *
 * Usage:
 *   node tools/audit-full-site.mjs
 *   node tools/audit-full-site.mjs --json > audit.json
 *
 * Audio media not stored in this git repo are warnings, not fake success.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve('.');
const htmlFiles=fs.readdirSync(root).filter(x=>x.toLowerCase().endsWith('.html')).sort();
const exists=p=>fs.existsSync(path.join(root,p));
const reports={timestamp:new Date().toISOString(),pages:htmlFiles.length,jsFiles:0,
  references:0,errors:[],warnings:[],allMissing:[],counts:{}};
const error=(type,file,target,details='')=>reports.errors.push({type,file,target,details});
const warning=(type,file,target,details='')=>reports.warnings.push({type,file,target,details});
const attr=(tag,name)=>tag.match(new RegExp('(?:^|\\s)'+name+'\\s*=\\s*["\\x27]([^"\\x27]*)["\\x27]','i'))?.[1]||'';
const pages=new Map(htmlFiles.map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')]));
const safeDecode=v=>{try{return decodeURIComponent(v)}catch{return v}};
const allAssets=new Set;
for(const [file,html] of pages){
 // Ignore embedded JavaScript template strings, which are not static DOM nodes.
 // Preserve <script src="..."> tags themselves for actual asset validation.
 const documentMarkup=html.replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi,'$1$2');
 const ids=new Map();
 for(const m of documentMarkup.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)){
  const key=m[1];ids.set(key,(ids.get(key)||0)+1);
 }
 for(const [id,count] of ids)if(count>1)warning('DUPLICATE_ID',file,'#'+id,String(count));
 if(/(?:HÃ n|Tiáº¿ng|á»‡|â€”|â–|ðŸ|âœ|Æ°)/.test(html)){
  warning('ENCODING_SUSPECT',file,'',html.match(/(?:HÃ n|Tiáº¿ng|á»‡|â€”|â–|ðŸ|âœ|Æ°).{0,40}/)?.[0]||'');
 }
 const tagRegex=/<(script|link|img|source|video|audio|iframe|a)\b[^>]*>/gi;
 let tag;
 while((tag=tagRegex.exec(documentMarkup))){
  const name=tag[1].toLowerCase(),markup=tag[0],raw=attr(markup,name==='a'||name==='link'?'href':'src').trim();
  if(!raw)continue;
  if(raw==='/'||raw.startsWith('#')){if(raw.startsWith('#')&&name==='a'&&!ids.has(raw.slice(1)))warning('DYNAMIC_OR_MISSING_ANCHOR',file,raw);continue}
  if(/^(?:https?:|mailto:|tel:|data:|blob:|javascript:|about:|\/\/)/i.test(raw))continue;
  if(/[<>{}]/.test(raw)||raw.startsWith('$')||raw.startsWith('/')){warning('DYNAMIC_LINK',file,raw);continue}
  const clean=safeDecode(raw.split(/[?#]/)[0].replace(/\\/g,'/'));
  if(!clean)continue;
  const target=path.normalize(path.join(path.dirname(file),clean)).replace(/\\/g,'/');
  if(target.startsWith('..')||path.isAbsolute(target)){error('PATH_ESCAPE',file,raw);continue}
  reports.references++;allAssets.add(target);
  if(!exists(target)){
   const metadata={type:'MISSING_LINK',file,target,details:name};
   reports.allMissing.push(metadata);
   if(/\.(?:mp3|wav|ogg|m4a)$/i.test(target)||/^(?:topik-audio|MRLEE_AUDIO|MRLEE_PRO_AUDIO)\//i.test(target))warning('AUDIO_NOT_BUNDLED',file,target,name);
   else error('MISSING_LINK',file,target,name);
  }
 }
}
// Read top-level JS as well as actual deployed source (skip old archive copies and MP3).
const dirs=['.','assets','tools','scripts','functions','leaderboard-functions'];
const scripts=[];
function walk(dir){
 const absolute=path.join(root,dir);
 if(!fs.existsSync(absolute)||!fs.statSync(absolute).isDirectory())return;
 for(const item of fs.readdirSync(absolute,{withFileTypes:true})){
  if(['.git','node_modules','vendor','dist','.next','backup','old'].includes(item.name))continue;
  const p=path.join(dir,item.name);
  if(item.isDirectory()){if(dir!=='.'||dirs.includes(item.name))walk(p)}
  else if(/\.(?:js|mjs|cjs)$/i.test(item.name))scripts.push(p);
 }
}
for(const dir of dirs){if(dir==='.')continue;walk(dir)}
for(const x of fs.readdirSync(root)){if(/\.(?:js|mjs|cjs)$/i.test(x)&&fs.statSync(path.join(root,x)).isFile())scripts.push(x)}
reports.jsFiles=scripts.length;
for(const f of scripts){
 const run=spawnSync(process.execPath,['--check',path.join(root,f)],{encoding:'utf8',timeout:12000});
 if(run.status!==0)error('JS_SYNTAX',f,'',(run.stderr||run.error?.message||'').slice(0,500));
}
for(const page of ['index.html','hoc-tieng-han.html','admin.html','mrlee-bai-tap-pro.html','kiem-tra-topik.html']){
 const s=pages.get(page)||'';
 if(!s.includes('assets/branding/logo-mrlee.png')&&!s.includes('site-logo.js'))warning('BRAND_NOT_DIRECTLY_REFERENCED',page,'assets/branding/logo-mrlee.png');
}
reports.counts=Object.fromEntries([...new Set([...reports.errors,...reports.warnings].map(x=>x.type))].map(type=>[type,{errors:reports.errors.filter(e=>e.type===type).length,warnings:reports.warnings.filter(e=>e.type===type).length}]));
if(process.argv.includes('--json'))console.log(JSON.stringify(reports,null,2));
else{
 console.log('MRLEE FULL QA: '+reports.pages+' root pages; '+reports.jsFiles+' JS; '+reports.references+' local references.');
 console.log('Errors '+reports.errors.length+'; warnings '+reports.warnings.length+'.');
 console.log('ERROR TYPES '+JSON.stringify(reports.counts));
 reports.errors.slice(0,160).forEach(e=>console.error('FAIL '+e.type+': '+e.file+' -> '+e.target+' '+e.details));
 if(reports.errors.length>160)console.error('... '+(reports.errors.length-160)+' additional errors, use --json for full report.');
 reports.warnings.slice(0,30).forEach(e=>console.warn('WARN '+e.type+': '+e.file+' -> '+e.target+' '+e.details));
 if(reports.warnings.length>30)console.warn('... '+(reports.warnings.length-30)+' more warnings.');
}
if(reports.errors.length)process.exitCode=1;
