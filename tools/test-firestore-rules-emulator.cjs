'use strict';
/** Compile real Firestore security rules and verify guarded learning requests.
 * Runs INSIDE firebase emulators:exec; no credentials or production writes.
 */
const fs=require('node:fs');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const firebase=require('firebase/compat/app');
require('firebase/compat/firestore');
(async()=>{
 const env=await initializeTestEnvironment({
  projectId:'demo-mrlee-points',
  firestore:{rules:fs.readFileSync('firestore.rules','utf8')}
 });
 try{
  const uid='learner_workbook_123',day='2026-10-28',activityKey='workbook-1-1-1';
  const path='mrleeV12SparkQueue/'+uid+'-'+day+'-'+activityKey;
  const data={
   uid,dayKey:day,activityKey,type:'workbook',level:1,day:1,
   format:'1',answers:Array.from({length:6},(_,i)=>({id:'q'+(i+1),selected:i%4})),
   status:'pending',createdAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  const signed=env.authenticatedContext(uid,{email_verified:true}).firestore();
  const guest=env.unauthenticatedContext().firestore();
  const unverified=env.authenticatedContext('other_reader_987',{email_verified:false}).firestore();
  await assertFails(guest.doc(path).set(data));
  await assertFails(unverified.doc(path).set({...data,uid:'other_reader_987'}));
  await assertSucceeds(signed.doc(path).set(data));
  await assertSucceeds(signed.doc(path).get());
  await assertFails(signed.doc(path).update({status:'saved'}));
  await assertFails(signed.doc(path).delete());
  await assertFails(signed.doc('mrleeV12Weekly/2026-W44/members/'+uid).set({points:9999}));
  await assertFails(guest.doc(path).get());

  // Same payload emitted by learning-tracker.js after a six-question Workbook.
  const attemptPath='users/'+uid+'/practiceAttempts';
  const reviewJson=JSON.stringify({version:1,questions:Array.from({length:6},(_,i)=>({
    question:'Câu số '+(i+1)+' - 안녕하세요?',
    choices:['Chào','Tạm biệt','Cảm ơn','Xin lỗi'],
    selectedIndex:i===0?2:0,correctIndex:0,explanation:'Đáp án tham khảo',
    lessonNumber:1,type:'choice'
  }))});
  const practice={
    examId:'workbook-1-1-1',
    examTitle:'WORKBOOK · Cấp 1 · Bài 1 · Bộ 1 · Chào hỏi',
    level:'sc1',score:5,total:6,durationSeconds:90,
    source:'client_practice',createdAt:firebase.firestore.FieldValue.serverTimestamp(),
    reviewJson
  };
  await assertSucceeds(signed.collection(attemptPath).add(practice));
  const summary={...practice};delete summary.reviewJson;
  await assertSucceeds(signed.collection(attemptPath).add(summary));
  await assertFails(guest.collection(attemptPath).add(practice));
  await assertFails(unverified.collection('users/other_reader_987/practiceAttempts').add(practice));
  await assertFails(signed.collection(attemptPath).add({...practice,score:99}));

  console.log('PASS Firestore emulator: compiled full rules, verified Workbook create/get, rejected guest, unverified user, updates/deletes and direct point writes; valid detailed + summary-only practice attempts accepted, invalid scores rejected.');
 }finally{await env.cleanup();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
