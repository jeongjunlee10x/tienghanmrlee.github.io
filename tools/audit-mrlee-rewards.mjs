#!/usr/bin/env node
/* TIẾNG HÀN MR LEE — Reward audit preflight (read-only).
 * Prints potential overlapping ledgers. This does NOT certify live points or RLS.
 */
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sources={
 browser:'mrlee-points-core.js',
 rules:'firestore.rules',
 leaderboard:'mrlee-leaderboard.js',
 scoring:'scripts/mrlee-score-spark/runner.cjs',
 rewardV2:'supabase/functions/mrlee-reward-v2/index.ts',
 rewardMigration:'MRLEE_REWARD_V2_SETUP.sql',
};
const read=(k)=>{const path=sources[k];if(!existsSync(resolve(root,path)))return '';return readFileSync(resolve(root,path),'utf8')};
const checks=[
 ['Browser wallet exists',()=>/studyPoints.*wallet/.test(read('browser')),'Client-sourced motivation points; not server-verified'],
 ['One-time lesson receipt exists',()=>/lessonRewards/.test(read('browser'))&&/claimLessonPoint/.test(read('browser')),'Inspect lessonId canonicalization before changing lesson policies'],
 ['Firestore transaction present',()=>/runTransaction/.test(read('browser')),'Transaction alone is not a complete anti-abuse proof'],
 ['Security rules pair wallet and receipt',()=>/lessonRewardCreated/.test(read('rules'))&&/getAfter/.test(read('rules')),'Confirm against Firestore Emulator prior to changes'],
 ['Public rank is marked as motivation',()=>/Điểm động lực/.test(read('leaderboard')),'Leaderboard is not an official TOPIK certificate'],
 ['Server-side TOPIK Spark scorer exists',()=>/runTransaction/.test(read('scoring'))&&/tx.create\(event/.test(read('scoring')),'Separate ledger; do not add to browser wallet without migration'],
 ['Reward claim endpoint delegates to RPC',()=>/mrlee_reward_v2_submit_claim/.test(read('rewardV2')),'External endpoint requires deployment and live grant verification'],
 ['Reward SQL is repository artifact',()=>/mrlee_reward_v2_awards/.test(read('rewardMigration')),'SQL file does not prove deployment to Supabase']
];
let missing=0;
const results=checks.map(([name,test,note])=>{const ok=test();if(!ok)missing++;return{status:ok?'FOUND':'REVIEW',name,note}});
const report={project:'TIẾNG HÀN MR LEE',mode:'READ_ONLY',timestamp:new Date().toISOString(),summary:{found:results.length-missing,review:missing},results,
next:[
 'Do not merge wallet, lessonRewards, Spark TOPIK, and Reward V2 awards into one balance without signed-off mapping',
 'Implement stable UID+kind+lesson+version idempotency keys on the server before any paid benefit',
 'Test simultaneous submissions with the Firestore Emulator and real RLS before enabling any rewards migration',
 'Never expose student PII or banking details on the public leaderboard'
]};
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else {results.forEach(r=>console.log('['+r.status+'] '+r.name+' — '+r.note));console.log('Found='+report.summary.found+' Review='+report.summary.review);console.log('No server writes were performed.')}
process.exitCode=missing?1:0;