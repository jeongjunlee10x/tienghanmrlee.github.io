'use strict';
/* Pure, no-credentials regression tests. All thresholds come from the same JSON shown on the website. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {score,weekOf,vnDate,POLICY}=require('../scripts/mrlee-score-spark/points-v12-core.cjs');
assert.equal(POLICY.version,'MRLEE-SPARK-2026-10-28');
const cases=[
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
const runner=fs.readFileSync('scripts/mrlee-score-spark/runner.cjs','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');
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
