'use strict';
// MR LEE Spark V13: GitHub Actions runner. Admin key comes ONLY from GitHub Secret.
const crypto = require('node:crypto');
const admin = require('firebase-admin');
const keys = require('./v12-answer-keys.json');
const {vnDate, weekOf, score} = require('./points-v12-core.cjs');
const privateKey = process.env.MRLEE_FIREBASE_SERVICE_ACCOUNT;
if (!privateKey) { console.error('Thieu GitHub Secret MRLEE_FIREBASE_SERVICE_ACCOUNT. Khong cham diem.'); process.exit(3); }
let creds;
try { creds = JSON.parse(privateKey); } catch (_) { console.error('Firebase Service Account JSON khong hop le.'); process.exit(3); }
if (creds.project_id !== 'tieng-han-mr-lee') { console.error('SAI PROJECT! Tu choi cham diem.'); process.exit(3); }
admin.initializeApp({credential:admin.credential.cert(creds),projectId:creds.project_id});
const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp;
const idHash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0,40);
function hasValidAnswers(expected, submitted) {
  if (!Array.isArray(submitted) || submitted.length !== expected.length) return null;
  const choices = new Map();
  for (const x of submitted) {
    if (!x || typeof x.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(x.id) || !Number.isSafeInteger(x.selected) || choices.has(x.id)) return null;
    choices.set(x.id,x.selected);
  }
  let correct=0;
  for (const q of expected) {
    const a=choices.get(q.id);
    if (a===undefined || a < -1 || a>=q.choices) return null;
    if (a===q.answer) correct++;
  }
  return {correct,total:expected.length};
}
function mockExpected(level,format,mode) {
  const cfg=keys.mock?.[String(level)]?.[format];
  if(!cfg) return null;
  const all=Object.entries(keys.mockQuestions).map(([id,q])=>({...q,id})).filter(x=>x.level===level);
  const listening=all.filter(x=>x.kind==='listening'), reading=all.filter(x=>x.kind==='reading');
  if(mode==='mock') return [...listening.slice(0,cfg.listening),...reading.slice(0,cfg.reading)];
  if(mode==='mock-listening') return listening.slice(0,20);
  if(mode==='mock-reading') return reading.slice(0,20);
  return null;
}
function analyze(data,ts) {
  const date=new Date(ts.toMillis());
  if(vnDate(date)!==data.dayKey) throw Error('Ngay gui khong khop gio may chu');
  const level=data.level,day=data.day,type=data.type,format=data.format;
  let item='',grade={correct:0,total:0};
  if(type==='attendance') {
    if(data.activityKey!=='attendance' || level!==0 || day!==0 || data.answers.length) throw Error('Sai du lieu diem danh');
    item='attendance-'+data.dayKey;
  } else if(type==='quiz'||type==='listening') {
    if(![1,2].includes(level) || !Number.isSafeInteger(day) || day<1 || day>(level===1?30:60) || data.activityKey!==`${type}-${level}-${day}`) throw Error('Sai ma ngay hoc');
    const required=keys.daily?.[`${level}-${day}`]?.[type];
    if(!required) throw Error('Khong tim thay bo dap an cho ngay hoc');
    grade=hasValidAnswers(required,data.answers);
    item=`topik-${level}-${day}-${type}`;
  } else if(['mock','mock-listening','mock-reading'].includes(type)) {
    if(![1,2].includes(level)||!['PBT','IBT'].includes(format)||data.activityKey!==`${type}-${level}-${format}`) throw Error('Sai ma de thi');
    const required=mockExpected(level,format,type);
    if(!required || !required.length) throw Error('Bo dap an thi khong du');
    grade=hasValidAnswers(required,data.answers);
    item=`topik-${level}-${format}-${type}`;
  } else throw Error('Loai bai khong ho tro');
  if(!grade) throw Error('Dap an gui len khong hop le');
  return {week:weekOf(date),type,item,grade,points:score(type,grade.correct,grade.total)};
}
async function settle(ref,payload) {
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists || snap.data().status!=='pending') return;
    const d=snap.data();
    if (ref.id !== `${d.uid}-${d.dayKey}-${d.activityKey}` || typeof d.uid !== 'string' || !/^[A-Za-z0-9_-]{6,128}$/.test(d.uid)) {
      tx.update(ref,{status:'rejected',reason:'Sai dinh danh ho so',processedAt:timestamp()}); return;
    }
    let g;
    try { g=analyze(d,d.createdAt); } catch(err) {
      tx.update(ref,{status:'rejected',reason:String(err.message).slice(0,130),processedAt:timestamp()}); return;
    }
    if(!g.points) {tx.update(ref,{status:'not-passed',correct:g.grade.correct,total:g.grade.total,processedAt:timestamp()});return;}
    const eventId=idHash(`${g.week}|${g.type}|${g.item}`);
    const event=db.doc(`mrleeV12Ledger/${d.uid}/events/${eventId}`);
    const weekly=db.doc(`mrleeV12Weekly/${g.week}/members/${d.uid}`);
    const lifetime=db.doc(`mrleeV12AllTime/${d.uid}`);
    const [existing,w,a]=await Promise.all([tx.get(event),tx.get(weekly),tx.get(lifetime)]);
    if(existing.exists){tx.update(ref,{status:'already',correct:g.grade.correct,total:g.grade.total,processedAt:timestamp()});return;}
    const alias=typeof a.data()?.alias==='string' ? a.data().alias : 'Học viên '+d.uid.slice(0,6).toUpperCase();
    tx.create(event,{week:g.week,type:g.type,item:g.item,correct:g.grade.correct,total:g.grade.total,points:g.points,source:'spark-github-actions',createdAt:timestamp()});
    tx.set(weekly,{uid:d.uid,alias,points:(Number(w.data()?.points)||0)+g.points,updatedAt:timestamp()},{merge:true});
    tx.set(lifetime,{uid:d.uid,alias,points:(Number(a.data()?.points)||0)+g.points,updatedAt:timestamp()},{merge:true});
    tx.update(ref,{status:'saved',awarded:g.points,correct:g.grade.correct,total:g.grade.total,processedAt:timestamp()});
  });
}
async function buildReport(week,status) {
 const snap=await db.collection(`mrleeV12Weekly/${week}/members`).orderBy('points','desc').limit(10).get();
 return {week,status,top:snap.docs.map((r,i)=>({alias:String(r.data().alias||'Học viên').slice(0,40),points:r.data().points,rank:i+1})),generatedAt:timestamp()};
}
function vietnamClock(date) {
 const parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
 const get=k=>Number(parts.find(p=>p.type===k)?.value||0);
 const yyyy=get('year'), mm=get('month'), dd=get('day');
 const dow=new Date(Date.UTC(yyyy,mm-1,dd)).getUTCDay();
 return {dow,hour:get('hour'),minute:get('minute')};
}
async function maybeReport(now) {
 const vn=vietnamClock(now), currentWeek=weekOf(now);
 // Preview after 20:00 Sunday; catch-up early Monday, if scheduling is delayed.
 if((vn.dow===0 && vn.hour>=20) || (vn.dow===1 && vn.hour<4)) {
   const w=vn.dow===0?currentWeek:weekOf(new Date(now.getTime()-86400000));
   const path=db.doc(`mrleeV12Notices/${w}-preview`);
   if(!(await path.get()).exists) await path.create(await buildReport(w,'Tạm tính · Chủ nhật'));
 }
 // Close after 00:05 Monday; catch-up through Tuesday if GitHub Action was delayed.
 if((vn.dow===1 && (vn.hour>0||vn.minute>=5)) || vn.dow===2) {
    const w=weekOf(new Date(now.getTime() - (vn.dow===1?86400000:2*86400000)));
    const path=db.doc(`mrleeV12Reports/${w}`);
    if(!(await path.get()).exists) await path.create(await buildReport(w,'Chung cuộc · Đã chốt'));
    const notice=db.doc(`mrleeV12Notices/${w}-final`);
    if(!(await notice.get()).exists) await notice.create(await buildReport(w,'Chung cuộc · Mở tuần mới'));
 }
}
async function main() {
 let done=0,rejected=0;
 for(let round=0;round<5;round++) {
   const docs=await db.collection('mrleeV12SparkQueue').where('status','==','pending').limit(80).get();
   if(docs.empty) break;
   for(const row of docs.docs) {
     try {await settle(row.ref,row.data()); done++}catch(err){rejected++;console.error('Xu ly loi '+row.id+': '+String(err.message).slice(0,160));}
   }
   if(docs.size<80) break;
 }
 await maybeReport(new Date());
 console.log(`MR LEE V13 Spark: da xu ly ${done}, loi tam thoi ${rejected}.`);
 if(rejected) process.exitCode=1;
}
main().catch(e=>{console.error('Loi tong quat: '+e.message); process.exitCode=1});
