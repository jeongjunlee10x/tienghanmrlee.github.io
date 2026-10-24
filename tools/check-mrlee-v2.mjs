#!/usr/bin/env node
/**
 * MR LEE V2: repository-only, read-only QA preflight.
 * Node >= 20, no external dependencies, no credentials, no network.
 * Usage: node tools/check-mrlee-v2.mjs [--json] [--strict]
 *
 * This is NOT a browser/screenshot test and does NOT prove a form was submitted.
 */
import {existsSync,readFileSync} from 'node:fs';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const json=process.argv.includes('--json'),strict=process.argv.includes('--strict');
const reports=[];
function add(status,area,detail){reports.push({status,area,detail})}
function exists(rel){return existsSync(resolve(root,rel))}
function read(rel){return readFileSync(resolve(root,rel),'utf8')}
function assert(file,label){if(exists(file))add('PASS',label,file);else add('FAIL',label,'THIẾU: '+file)}
function checkString(file,needle,label){
 if(!exists(file)){add('FAIL',label,'THIẾU FILE: '+file);return}
 const text=read(file);
 if(text.includes(needle))add('PASS',label,file);else add('FAIL',label,file+' thiếu: '+needle)
}
const routes=[
 'index.html','hoc-tieng-han.html','giao-tiep-theo-chu-de.html',
 'kiem-tra-topik.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html',
 'ban-do-dai-hoc-han-quoc.html','mrlee-bai-tap-pro.html','trung-tam-hoc-vien.html',
 'dang-ky-tu-van.html','tuyen-sinh.html','admin.html','kiem-tra-dau-vao.html'
];
routes.forEach(p=>assert(p,'Đường dẫn trang chính'));
assert('assets/branding/logo-mrlee.png','Logo chính thức');
assert('assets/mrlee-dual-ui/theme.js','Chuyển 2 giao diện');
assert('assets/mrlee-dual-ui/theme.css','CSS 2 giao diện');
assert('assets/mrlee-dual-ui/admin-charts.js','Biểu đồ Admin');
const scenes=['home','learning','speaking','topik','interview','culture',
 'universities','workbook','profile','admin','consultation'];
scenes.forEach(p=>assert('assets/mrlee-next/scenes/'+p+'.svg','Ảnh chủ đề Viễn tưởng'));
checkString('assets/mrlee-dual-ui/theme.js','MRLEE.THEME.V1','Khóa lưu theme');
checkString('assets/mrlee-dual-ui/theme.js','Giao diện tươi mới','Tùy chọn theme cũ');
checkString('assets/mrlee-dual-ui/theme.js','Giao diện viễn tưởng','Tùy chọn theme mới');
checkString('index.html','assets/branding/logo-mrlee.png','Logo gốc trên Trang chủ');
checkString('admin.html','assets/branding/logo-mrlee.png','Logo gốc Admin');
checkString('admin.html','admin-charts.js','Biểu đồ trên Admin');
checkString('dang-ky-tu-van.html','mrleeConsultForm','Form tư vấn');
checkString('assets/mrlee-next/consultation.js','mrlee-consultation-submit','Tư vấn gửi server');
checkString('assets/mrlee-next/consultation-admin.js','mrlee_consultation_requests','Tư vấn trong Admin');
checkString('kiem-tra-dau-vao.html','mrlee-placement-client.js','Lưu bài đầu vào');
checkString('mrlee-placement-admin.js','mrlee_placement_submissions','Admin kiểm tra đầu vào');

const visited=new Set();
function relativeTarget(raw,source){
 if(!raw||raw[0]==='#'||/^(?:https?:|data:|mailto:|tel:|javascript:|\/\/)/i.test(raw))return null;
 if(/[<>{}]/.test(raw))return null;
 const clean=raw.split(/[?#]/,1)[0];
 if(!clean)return null;
 // Root-relative website paths cannot be inferred with certainty on Github Pages.
 if(clean.startsWith('/'))return null;
 return resolve(root,dirname(source),decodeURIComponent(clean));
}
for(const page of routes){
 if(!exists(page))continue;
 const html=read(page);
 const attrs=[...html.matchAll(/<(?:a|img|script|link|source)\b[^>]*?\b(?:href|src)=["']([^"']+)["']/gi)];
 for(const [,url] of attrs){
  let target=null;
  try{target=relativeTarget(url,page)}catch{add('WARN','Liên kết',page+' có URI lỗi: '+url);continue}
  if(!target)continue;
  if(!target.startsWith(root))continue;
  const ext=extname(target).toLowerCase();
  if(!['.html','.css','.js','.png','.jpg','.jpeg','.webp','.svg','.json','.mp3','.avif'].includes(ext))continue;
  const key=page+' -> '+url;
  if(visited.has(key))continue;visited.add(key);
  if(!existsSync(target))add('WARN','Liên kết/tài nguyên',key+' chưa tồn tại trong bản sao local');
 }
}
if(exists('assets/mrlee-dual-ui/theme.js')){
 const script=read('assets/mrlee-dual-ui/theme.js');
 const found=new Set();
 for(const m of script.matchAll(/['"]([^'"]+\.html)(?:\?[^'"]*)?['"]/g)){
  const file=m[1];if(found.has(file))continue;found.add(file);
  if(!exists(file))add('WARN','Liên kết chủ đề','Không tìm thấy: '+file);
 }
 add('INFO','Kiểm tra điều hướng','Đã rà soát '+found.size+' đích trang trong theme.js');
}
const sums=['PASS','WARN','FAIL'].map(status=>[status,reports.filter(r=>r.status===status).length]);
if(json){
 console.log(JSON.stringify({project:'MR LEE V2',root,summary:Object.fromEntries(sums),checks:reports},null,2));
}else{
 for(const e of reports){if(e.status!=='PASS')console.log('['+e.status+'] '+e.area+': '+e.detail)}
 console.log('MR LEE V2 — QA SOURCE: '+sums.map(([a,b])=>a+'='+b).join(' | '));
 console.log('Đây chỉ là kiểm tra mã nguồn. Cần thử giao diện, đăng nhập, bài làm, tư vấn, rewards và Pages thực tế.');
}
process.exitCode=reports.some(x=>x.status==='FAIL')||strict&&reports.some(x=>x.status==='WARN')?1:0;
