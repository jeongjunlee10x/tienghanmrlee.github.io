/** MR LEE official Korean universities & colleges importer. Node >= 18, no dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const base=path.dirname(fileURLToPath(import.meta.url));
const src='https://www.data.go.kr/data/15107736/standard.do';
const names={school:['학교명','SCHL_NM','schlNm'],en:['학교 영문명','학교영문명','SCHL_ENG_NM','schlEngNm'],branch:['본분교구분명','MAINBRANCH_NM','mainbranchNm'],kind:['대학구분명','UNIV_SE_NM','univSeNm'],schoolKind:['학교구분명','SCHL_SE_NM','schlSeNm'],owner:['설립형태구분명','FNDN_FORM_SE_NM','fndnFormSeNm'],code:['시도코드','CTPV_CD','ctpvCd'],region:['시도명','CTPV_NM','ctpvNm'],address:['소재지도로명주소','LCTN_ROAD_NM_ADDR','lctnRoadNmAddr'],lot:['소재지지번주소','LCTN_LOTNO_ADDR','lctnLotnoAddr'],website:['홈페이지주소','HMPG_ADDR','hmpgAddr'],date:['데이터기준일자','CRTR_YMD','crtrYmd']};
const regionCodes={'11':'seoul','26':'busan','27':'daegu','28':'incheon','29':'jeonnam-gwangju','30':'daejeon','31':'ulsan','36':'sejong','41':'gyeonggi','42':'gangwon','43':'chungbuk','44':'chungnam','45':'jeonbuk','46':'jeonnam-gwangju','47':'gyeongbuk','48':'gyeongnam','50':'jeju','51':'gangwon','52':'jeonbuk'};
const regionNames={'서울':'seoul','부산':'busan','대구':'daegu','인천':'incheon','대전':'daejeon','울산':'ulsan','세종':'sejong','경기':'gyeonggi','강원':'gangwon','충북':'chungbuk','충남':'chungnam','충청북':'chungbuk','충청남':'chungnam','전북':'jeonbuk','전라북':'jeonbuk','광주':'jeonnam-gwangju','전남':'jeonnam-gwangju','전라남':'jeonnam-gwangju','전남광주':'jeonnam-gwangju','경북':'gyeongbuk','경상북':'gyeongbuk','경남':'gyeongnam','경상남':'gyeongnam','제주':'jeju'};
const clean=x=>String(x??'').trim().replace(/\s+/g,' ');
const norm=x=>clean(x).normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex').slice(0,14);
const get=(row,key)=>names[key].map(n=>clean(row[n])).find(Boolean)||'';
function parseCSV(s, requireSchool=true){
  let rows=[], row=[],field='',quoted=false;
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(ch==='"'){
      if(quoted && s[i+1]==='"'){field+='"';i++;}
      else quoted=!quoted;
    }else if(ch===','&&!quoted){row.push(field);field='';}
    else if((ch==='\n'||ch==='\r')&&!quoted){
      if(ch==='\r'&&s[i+1]==='\n')i++;
      row.push(field);field='';
      if(row.some(x=>x.trim())) rows.push(row);
      row=[];
    }else field+=ch;
  }
  if(quoted)throw Error('CSV co dau nhay chua dong');
  if(field.length||row.length){row.push(field);rows.push(row);}
  if(rows.length<2)throw Error('CSV khong co du lieu');
  const headers=rows[0].map(x=>clean(x).replace(/^\uFEFF/,''));
  if(requireSchool&&!names.school.some(h=>headers.includes(h)))throw Error('Khong co cot 학교명/SCHL_NM: tep khong dung nguon');
  return rows.slice(1).map(fields=>Object.fromEntries(headers.map((h,i)=>[h,fields[i]||''])));
}
function readRows(file){
  if(!fs.existsSync(file))throw Error('Khong tim thay file: '+file);
  if(file.toLowerCase().endsWith('.json')){
    const r=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
    const inner=x=>Array.isArray(x)?x:(x&&typeof x==='object' ? ['response','body','items','item','data','records','rows','result'].map(k=>inner(x[k])).find(a=>a.length):[]) || [];
    return inner(r);
  }
  if(!file.toLowerCase().endsWith('.csv'))throw Error('Chi nhan file CSV/JSON');
  const bytes=fs.readFileSync(file);
  const utf=new TextDecoder('utf-8',{fatal:true});
  let s;
  try{s=utf.decode(bytes);}catch{s=new TextDecoder('euc-kr',{fatal:true}).decode(bytes);}
  return parseCSV(s);
}
function regionFor(r){
  const code=get(r,'code').slice(0,2);
  if(regionCodes[code])return regionCodes[code];
  const value=get(r,'region')||get(r,'address')||get(r,'lot');
  return Object.keys(regionNames).sort((a,b)=>b.length-a.length).map(k=>value.startsWith(k)?regionNames[k]:null).find(Boolean)||null;
}
function cityFor(addr,region){
  if(region==='sejong')return '세종시';
  const parts=clean(addr).split(' ');
  return parts.slice(1,5).find(p=>p.length>1&&/[시군구]$/.test(p)) || parts[1] || '';
}
function baseName(raw){
  const m=raw.match(/^(.*?(?:대학교|대학|교육대학교|대학원대학교))\s*\(([^()]*)\)$/);
  return m && m[2].length<=12 && !/법인|폐교|개교|전문|사이버/.test(m[2]) ? m[1] : raw;
}
function typeFor(kind,schoolKind,name){
  const z=kind+' '+schoolKind;
  if(name.includes('대학원대학교'))return ['university','graduate-university'];
  if(z.includes('전문대학')||name.includes('전문대학'))return ['college','junior-college'];
  if(z.includes('대학원'))return [null,null];
  if(/대학|산업대학|교육대학|기술대학|사이버|원격|각종학교/.test(z))return ['university',kind||schoolKind];
  return [null,null];
}
function httpsWebsite(s){
  let u=clean(s);
  if(!u)return '';
  if(!/^https?:\/\//i.test(u))u='https://'+u.replace(/^\/+/, '');
  try{const obj=new URL(u);return obj.protocol==='https:'&&obj.hostname?u:'';}catch{return '';}
}
function importRows(rows){
  const schools=new Map(),seen=new Set(),skipped=[],dates=new Set();
  for(let index=0;index<rows.length;index++){
    const r=rows[index];if(!r||typeof r!=='object')continue;
    const raw=get(r,'school'),[type,subType]=typeFor(get(r,'kind'),get(r,'schoolKind'),raw);
    if(!raw||!type){skipped.push([index+2,raw,'ngoai pham vi dai hoc/cao dang']);continue;}
    const region=regionFor(r),address=get(r,'address')||get(r,'lot');
    if(!region||!address){skipped.push([index+2,raw,!region?'khong xac dinh tinh':'thieu dia chi']);continue;}
    const ko=baseName(raw),id='kr-'+hash(norm(ko)),en=get(r,'en');
    if(!schools.has(id)) schools.set(id,{id,ko,en:en||ko,vi:'',aliases:[],type,subType,website:httpsWebsite(get(r,'website')),officialSource:src,campuses:[]});
    const school=schools.get(id);
    if(en&&school.en===school.ko)school.en=en;
    if(!school.website)school.website=httpsWebsite(get(r,'website'));
    if(raw!==ko&&!school.aliases.includes(raw))school.aliases.push(raw);
    const branch=get(r,'branch'),lbl=branch||'캠퍼스';
    const key=[id,norm(address),norm(lbl)].join('|');
    if(seen.has(key))continue;
    seen.add(key);
    const city=cityFor(address,region);
    school.campuses.push({id:'c-'+hash(key),ko:lbl,en:branch||'Campus',vi:'',region,city,cityKo:city,address,
      lat:null,lng:null,accuracy:'unverified',positionSource:'',officialBranch:branch,source:'data.go.kr/15107736'});
    if(get(r,'date'))dates.add(get(r,'date'));
  }
  return {schools:[...schools.values()],skipped,dates:[...dates].sort()};
}
function parseCoordinates(file,schools){
  if(!file)return {pins:0,warnings:[]};
  const rows=readCoordinates(file),byID=new Map(schools.flatMap(s=>s.campuses.map(c=>[s.id+'::'+c.id,c])));
  let pins=0;const warnings=[];
  rows.forEach((r,i)=>{
    const uid=clean(r.campus_uid),campus=byID.get(uid),lat=Number(r.lat),lng=Number(r.lng),url=clean(r.source_url),date=clean(r.verified_at);
    if(!campus){warnings.push(`Dong ${i+2}: khong co campus ${uid}`);return;}
    if(!r.lat||!r.lng||!Number.isFinite(lat)||!Number.isFinite(lng)||lat<32||lat>39||lng<124||lng>132||!url.startsWith('https://')||!/^\d{4}-\d{2}-\d{2}$/.test(date)){
      warnings.push(`Dong ${i+2}: thieu/sai lat,lng,source_url,verified_at cho ${uid}`);return;
    }
    campus.lat=lat;campus.lng=lng;campus.accuracy='verified';campus.positionSource=url;campus.verifiedAt=date;pins++;
  });
  return {pins,warnings};
}
function readCoordinates(file){
  const buf=fs.readFileSync(file);let s;
  try{s=new TextDecoder('utf-8',{fatal:true}).decode(buf);}catch{s=new TextDecoder('euc-kr').decode(buf);}
  return parseCSV(s.replace(/^\uFEFF/,''),false);
}
function csvCell(x){const s=String(x??'');return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function csv(rows){return '\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n';}
function safeWrite(file,content){const tmp=file+'.tmp-'+process.pid;fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(tmp,content,'utf8');fs.renameSync(tmp,file);}
function argsParser(){const r={};for(let i=2;i<process.argv.length;i++){
  if(process.argv[i].startsWith('--')){const [k,v]=process.argv[i].slice(2).split('=',2);r[k]=v!==undefined?v:process.argv[++i];}}
  return r;
}
function run(){
  const opts=argsParser(),input=opts.source;
  if(!input)throw Error('Dung: node import_official.mjs --source "duong-dan-CSV" [--coordinates file.csv]');
  const rows=readRows(input),{schools,skipped,dates}=importRows(rows);
  const minSchools=Number(opts['min-schools'] || 20);
  if(!Number.isInteger(minSchools)||minSchools<1||minSchools>10000)throw Error('min-schools khong hop le');
  if(schools.length<minSchools)throw Error(`Chi nhap duoc ${schools.length} truong, yeu cau >=${minSchools}: khong ghi de universities.json`);
  const {pins,warnings}=parseCoordinates(opts.coordinates,schools),n=schools.reduce((t,s)=>t+s.campuses.length,0);
  const data={version:'2026-10-16-official-import-v2',coverage:'national-official-registry-imported-not-independently-audited',
    notice:`Danh muc ${schools.length} truong, ${n} campus/dia chi tu data.go.kr; ${pins} da xac minh toa do. Khong tu gan toa do, khong dam bao danh muc co tat ca phan hieu nho.`,
    source:src,sourceDates:dates,importedAt:new Date().toISOString().slice(0,10),
    stats:{sourceRecords:rows.length,schools:schools.length,campusRecords:n,verifiedPins:pins,skippedRecords:skipped.length},schools};
  const output=path.resolve(opts.output||path.join(base,'universities.json')),
    review=path.resolve(opts.review||path.join(base,'toa_do_can_xac_minh.csv')),
    audit=path.resolve(opts.audit||path.join(base,'nhat_ky_nhap.json'));
  // Avoid publishing a damaged replacement: write only after the structural checks above.
  const reviewRows=[['campus_uid','school_ko','school_en','campus_label','region','city','official_address','lat','lng','source_url','verified_at','status']];
  for(const s of schools)for(const c of s.campuses)reviewRows.push([s.id+'::'+c.id,s.ko,s.en,c.ko,c.region,c.city,c.address,c.lat||'',c.lng||'',c.positionSource||'',c.verifiedAt||'',c.accuracy]);
  safeWrite(review,csv(reviewRows));safeWrite(audit,JSON.stringify({skipped,coordinateWarnings:warnings},null,2));
  safeWrite(output,JSON.stringify(data,null,2)+'\n');
  console.log(`NHAP THANH CONG: ${schools.length} truong, ${n} co so/dia chi, ${pins} toa do da kiem chung.`);
  console.log('Ngay nguon:',dates.join(', ')||'khong co','| Ban ghi loai:',skipped.length,'| Canh bao:',warnings.length);
  console.log('Bang toa do can kiem duyet:',review);
}
try{run();}catch(e){console.error('DUNG AN TOAN:',e.message);process.exitCode=1;}
