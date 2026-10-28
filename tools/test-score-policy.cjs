'use strict';
/* Pure, no-credentials regression tests. All thresholds come from the same JSON shown on the website. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {score,weekOf,vnDate,POLICY}=require('../scripts/mrlee-score-spark/points-v12-core.cjs');
const {execFileSync}=require('node:child_process');
for(const file of ['scripts/mrlee-score-spark/runner.cjs','mrlee-bai-tap-pro.js','mrlee-lesson-page.js','assets/mrlee-score-v12/widget.js','assets/mrlee-score-v12/points-policy-ui.js'])execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
assert.equal(POLICY.version,'MRLEE-SPARK-2026-10-28-LESSON');
const cases=[
 ['workbook',3,6,0],['workbook',4,6,4],['workbook',5,6,5],['workbook',6,6,6],
 ['quiz',5,10,0],['quiz',6,10,7],['quiz',8,10,10],['quiz',10,10,12],
 ['listening',5,10,0],['listening',6,10,12],['listening',9,10,18],['listening',10,10,20],
 ['mock',24,50,0],['mock',25,50,20],['mock',50,50,40],
 ['mock-listening',5,10,0],['mock-listening',6,10,7],['mock-reading',7,10,8],
 ['attendance',0,0,0],['attendance',1,1,0],['unknown',10,10,0],
 ['quiz',-1,10,0],['quiz',11,10,0],['quiz',4,0,0],['quiz',NaN,10,0]
];
for(const [type,correct,total,expected] of cases)assert.equal(score(type,correct,total),expected,type+': '+correct+'/'+total);
const before=new Date('2026-10-25T16:59:59Z'); // Sunday 23:59:59 Vietnam
const after=new Date('2026-10-25T17:00:00Z'); // Monday 00:00:00 Vietnam
assert.equal(vnDate(before),'2026-10-25');assert.equal(vnDate(after),'2026-10-26');
assert.notEqual(weekOf(before),weekOf(after));
assert.equal(POLICY.types.quiz.maxPoints,12);
assert.equal(POLICY.types.listening.maxPoints,20);
assert.equal(POLICY.types.mock.maxPoints,40);
for(const type of ['quiz','listening','mock','mock-listening','mock-reading'])assert.ok(POLICY.types[type].threshold>0);
assert.equal(POLICY.types.attendance.maxPoints,0);
assert.equal(POLICY.types.workbook.maxPoints,6);
assert.equal(POLICY.lessonCompletion.setsRequired,2);
assert.equal(POLICY.lessonCompletion.bonusPoints,3);
const catalog=require('../mrlee-pro-lessons.json');
let units=0;
for(let level=1;level<=6;level++)for(let lesson=1;lesson<=15;lesson++){
 const entry=catalog[level+'-'+String(lesson).padStart(2,'0')];
 assert.ok(entry,'Missing Workbook for lesson '+level+'/'+lesson);
 assert.equal(entry.exercises?.length,15,'Each lesson has 15 independent Workbook sets');
 for(let i=0;i<15;i++){
  const set=entry.exercises[i];assert.equal(Number(set.number),i+1,'Unit numbering must match submitted format');
  assert.equal(set.questions?.length,6,'Six answer items per unit are required');
  set.questions.forEach(q=>{assert.ok(Number.isSafeInteger(q.answer)&&Array.isArray(q.options)&&q.answer>=0&&q.answer<q.options.length,'Invalid answer key in Workbook');});
  units++;
 }
}
assert.equal(units,1350);
const runner=fs.readFileSync('scripts/mrlee-score-spark/runner.cjs','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');
const workClient=fs.readFileSync('mrlee-bai-tap-pro.js','utf8');
const legacyBridge=fs.readFileSync('mrlee-learning-legacy-bridge.js','utf8');
const workHtml=fs.readFileSync('mrlee-bai-tap-pro.html','utf8');
execFileSync(process.execPath,['--check','mrlee-learning-legacy-bridge.js'],{stdio:'pipe'});
assert.match(workHtml,/mrlee-learning-legacy-bridge\.js/,'Workbook must load legacy fallback');
assert.match(legacyBridge,/claimLessonPoint\(user,lessonId\)/,'Legacy credits use protected Firestore receipt once per lesson');
assert.match(legacyBridge,/d\.score<4/,'Only completion meeting 4\/6 receives a point');

const scoreWidget=fs.readFileSync('assets/mrlee-score-v12/widget.js','utf8');
assert.match(workClient,/type:'workbook'/,'Workbook page must send actual answers to Spark queue');
assert.match(scoreWidget,/type==='workbook'/,'Spark queue must recognize lesson activity');
assert.match(rules,/d.type == 'workbook'/,'Firestore security rules must permit bounded Workbook requests');
assert.match(runner,/function workbookExpected\(/,'Server must grade the real question catalog');
assert.match(runner,/completionBonus/,'Verified two-set lesson completion bonus must be applied once');


const web=fs.readFileSync('quy-tac-diem-mrlee.html','utf8');
const client=fs.readFileSync('assets/mrlee-score-v12/widget.js','utf8');
assert.match(runner,/policyVersion:POLICY\.version/);
assert.match(runner,/tx\.create\(event,/,'One immutable event document for the awarded activity');
assert.match(runner,/if\(existing\.exists\)/,'Per-week duplicate receipt guard');
assert.match(rules,/match \/mrleeV12SparkQueue\/\{entry\}/);
assert.match(rules,/allow update, delete: if false;/);
assert.match(web,/id="mrleePolicyTable"/);
assert.match(web,/id="mrleeLegacyTable"/);
assert.match(web,/points-policy-ui\.js/);
assert.match(client,/res\.state === 'not-passed'/);
assert.match(client,/res\.state === 'rejected'/);
console.log('PASS MR LEE Spark point policy:',cases.length,'arithmetic cases, Monday rollover, versioned ledger, duplicate guard, legacy separation, public rules.');
