// Admin-only local migration. No public HTTP endpoint; never changes wallets.
const {initializeApp,applicationDefault}=require('firebase-admin/app');
const {getFirestore,FieldValue,FieldPath}=require('firebase-admin/firestore');
const {syncUser}=require('./sync.cjs');
const project='tieng-han-mr-lee';
if(!process.argv.includes('--apply')){console.error('Run: node backfill.cjs --apply (writes public rankings only)');process.exit(1);}
initializeApp({credential:applicationDefault(),projectId:project});
const db=getFirestore();
async function main(){
 let cursor=null,count=0;
 // collectionGroup finds wallets even when their parent user document is missing.
 for(;;){
  let q=db.collectionGroup('studyPoints').orderBy(FieldPath.documentId()).limit(200);
  if(cursor)q=q.startAfter(cursor);
  const page=await q.get();if(page.empty)break;
  for(const d of page.docs){
   const parts=d.ref.path.split('/');
   if(parts.length===4&&parts[0]==='users'&&parts[2]==='studyPoints'&&parts[3]==='wallet'){
    await syncUser(db,parts[1],()=>FieldValue.serverTimestamp());count++;
   }
  }
  cursor=page.docs.at(-1);console.log('Processed wallets:',count);
 }
 // Remove obsolete public rows using the same current-state transaction.
 cursor=null;
 for(;;){
  let q=db.collection('mrleePublicLeaderboard').orderBy(FieldPath.documentId()).limit(200);
  if(cursor)q=q.startAfter(cursor);
  const page=await q.get();if(page.empty)break;
  for(const d of page.docs)await syncUser(db,d.id,()=>FieldValue.serverTimestamp());
  cursor=page.docs.at(-1);
 }
 console.log('DONE. Wallets unchanged. Public rankings synchronized:',count);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
