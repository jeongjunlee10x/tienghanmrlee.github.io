// Re-read current source in a transaction: delayed/repeated events cannot roll points back.
function publicEntry(uid,wallet,profile,old) {
 if(!Number.isSafeInteger(wallet.balance)||wallet.balance<0)throw new Error('Invalid wallet: '+uid);
 const name=typeof profile.displayName==='string'?profile.displayName.trim():'';
 const alias=typeof old.alias==='string'?old.alias.trim():'';
 return {alias:(name||alias||('Học viên '+uid.slice(0,6).toUpperCase())).slice(0,80),points:wallet.balance,
 streak:Number.isSafeInteger(wallet.loginStreak)&&wallet.loginStreak>=0?wallet.loginStreak:0};
}
async function syncUser(db,uid,timestamp){
 const wallet=db.doc(`users/${uid}/studyPoints/wallet`),profile=db.doc(`users/${uid}`),legacy=db.doc(`mrleeLeaderboard/${uid}`),target=db.doc(`mrleePublicLeaderboard/${uid}`);
 return db.runTransaction(async tx=>{
  const [w,p,l,t]=await tx.getAll(wallet,profile,legacy,target);
  if(!w.exists){if(t.exists)tx.delete(target);return 'absent';}
  const row=publicEntry(uid,w.data(),p.data()||{},l.data()||{});
  const before=t.data()||{};
  if(t.exists&&Object.keys(before).length===4&&['alias','points','streak'].every(k=>before[k]===row[k]))return 'unchanged';
  tx.set(target,{...row,updatedAt:timestamp()});return 'updated';
 });
}
module.exports={publicEntry,syncUser};
