/** Optional local ADMIN ONLY: one-time copy of existing user wallets into public leaderboard.
 * Does NOT change wallet, auth, or exam results. NO HTTP endpoint or Cloud Function.
 * Dry run: node spark-backfill.cjs
 * Actual:  node spark-backfill.cjs --apply
 */
'use strict';
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const PROJECT_ID='tieng-han-mr-lee';
const apply=process.argv.includes('--apply');
initializeApp({credential:applicationDefault(),projectId:PROJECT_ID});
const db=getFirestore();
function alias(text){return typeof text==='string'&&text.trim().length>=2?text.trim().slice(0,30):'';}
async function inspectUser(ref){
 const walletRef=ref.collection('studyPoints').doc('wallet');
 const rankRef=db.collection('mrleePublicLeaderboard').doc(ref.id);
 return db.runTransaction(async tx=>{
  const [w,p,r]=await tx.getAll(walletRef,ref,rankRef);
  if(!w.exists)return 'no-wallet';
  const wallet=w.data();
  if(!Number.isSafeInteger(wallet.balance)||wallet.balance<0||!Number.isSafeInteger(wallet.loginStreak)||wallet.loginStreak<0)return 'invalid';
  const previous=r.exists?r.data():{};
  const displayName=alias(p.exists?p.data()?.displayName:'')||alias(previous.alias)||('Học viên '+ref.id.slice(0,6).toUpperCase());
  if(previous.points===wallet.balance&&previous.streak===wallet.loginStreak&&previous.alias===displayName)return 'current';
  if(apply){tx.set(rankRef,{alias:displayName,points:wallet.balance,streak:wallet.loginStreak,updatedAt:FieldValue.serverTimestamp()});}
  return 'needs-sync';
 });
}
(async()=>{
 console.log(apply?'MODE: APPLY PUBLIC RANKINGS':'MODE: DRY RUN (NO WRITES)');
 const users=await db.collection('users').listDocuments();
 const summary={'no-wallet':0,invalid:0,current:0,'needs-sync':0};
 for(const ref of users){summary[await inspectUser(ref)]++;}
 console.log('Profiles:',users.length,'Summary:',JSON.stringify(summary));
 console.log(apply?'DONE - public rankings updated. Wallets untouched.':'NO CHANGES. Run with --apply only after verifying the planned changes and public-name notice.');
})().catch(error=>{console.error('ERROR:',error?.message||error);process.exitCode=1;});
