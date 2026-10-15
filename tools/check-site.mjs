/** MR LEE static site self-test. No node_modules, no network, no file writes. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(process.argv[2]||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>{if(['.git','node_modules','.env'].includes(x.name))return[];const p=path.join(d,x.name);return x.isDirectory()?walk(p):[p]});
const files=walk(root),htmls=files.filter(f=>f.endsWith('.html')),scripts=files.filter(f=>/\.(?:js|mjs|cjs)$/.test(f));
const errors=[],warnings=[];
for(const f of scripts){const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});if(r.status!==0)errors.push(`Lỗi cú pháp JS ${path.relative(root,f)}: ${r.stderr.slice(0,230)}`)}
const re=/<(?:script|link|img|source|a|audio|video)\b[^>]*?\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
for(const f of htmls){const content=fs.readFileSync(f,'utf8');let m;while((m=re.exec(content))){const raw=m[1].trim();if(!raw||/^(?:https?:|mailto:|tel:|data:|#|javascript:|\/\/)/i.test(raw))continue;
 const target=raw.split(/[?#]/)[0];if(!target)continue;const dest=path.resolve(path.dirname(f),decodeURIComponent(target));
 if(!dest.startsWith(root+path.sep)&&dest!==root){errors.push(`Liên kết ngoài thư mục: ${path.relative(root,f)} -> ${raw}`);continue}
 if(!fs.existsSync(dest)){(target.startsWith('topik-audio/')?warnings:errors).push(`${path.relative(root,f)} -> ${raw}`)}
}}
const corpus=JSON.parse(fs.readFileSync(path.join(root,'mrlee-knowledge.json'),'utf8'));
if(!Array.isArray(corpus)||corpus.length<2000)errors.push('Thiếu kho tri thức bài học (mong đợi > 2000 mục).');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'topik-audio','MANIFEST_MP3.json'),'utf8'));
if(manifest.count!==124||manifest.files.length!==124)errors.push('Manifest MP3 phải chứa đúng 124 mục.');
for(let n=1;n<=9;n++)for(const ext of ['webp','png'])if(!fs.existsSync(path.join(root,'images',`${n}.${ext}`)))errors.push(`Thiếu ảnh bìa ${n}.${ext}`);
console.log(`MRLEE QA: ${htmls.length} trang HTML | ${scripts.length} tập JS | ${corpus.length} nội dung học | ${manifest.count} tên MP3.`);
const audioStatus={ok:0,missing:0,bad:0};
for(const rec of manifest.files){
 const rel=String(rec.path||'');
 if(!/^topik-audio\/[\w.-]+\.mp3$/i.test(rel)){errors.push(`Tên MP3 không hợp lệ: ${rel}`);continue}
 const target=path.resolve(root,rel);
 if(!target.startsWith(root+path.sep)){errors.push(`MP3 ngoài thư mục: ${rel}`);continue}
 if(!fs.existsSync(target))audioStatus.missing++;
 else if(fs.statSync(target).size!==Number(rec.bytes))audioStatus.bad++;
 else audioStatus.ok++;
}
console.log(`MP3 thực tế: ${audioStatus.ok}/${manifest.files.length} tệp đúng kích thước.`);
if(audioStatus.missing)console.warn(`CẢNH BÁO: Thiếu ${audioStatus.missing} MP3 trên máy; chưa xác nhận được phần nghe.`);
if(audioStatus.bad)errors.push(`Có ${audioStatus.bad} MP3 sai kích thước.`);
if(warnings.length)console.log(`Tham chiếu MP3 bỏ qua: ${warnings.length}`);
for(const e of errors)console.error('ERROR:',e);
if(errors.length){console.error(`KHÔNG ĐẠT: ${errors.length} lỗi.`);process.exitCode=1}else console.log('ĐẠT: Không phát hiện lỗi cú pháp JS hoặc đường dẫn tĩnh cần có.');
