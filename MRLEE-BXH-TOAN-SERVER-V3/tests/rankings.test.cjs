const {test}=require('node:test');const assert=require('node:assert/strict');
const {publicEntry,syncUser}=require('../payload/leaderboard-functions/sync.cjs');
test('ties, more than ten learners, safe points and accent search',async()=>{
 const {rankEntries,searchable}=await import('../payload/mrlee-ranking-utils.mjs');
 const ranked=rankEntries([{id:'b',points:120,alias:'B'},{id:'a',points:120,alias:'A'},{id:'c',points:110,alias:'C'},...Array.from({length:65},(_,i)=>({id:'x'+i,points:i,alias:'X'})),{id:'bad',points:-1}]);
 assert.equal(ranked.length,68);assert.deepEqual(ranked.slice(0,3).map(x=>[x.id,x.rank]),[['a',1],['b',1],['c',3]]);
 assert.equal(searchable('Đặng Thị Ánh'),'dang thi anh');assert.equal(ranked.find(x=>x.id==='x0').rank,68);
});
test('projection whitelists public fields and uses names without changing points',()=>{
 assert.deepEqual(publicEntry('uid',{balance:103,loginStreak:2,secret:'x'},{displayName:'  Thầy Lee ',email:'hidden'},{}),{alias:'Thầy Lee',points:103,streak:2});
 assert.equal(publicEntry('uid',{balance:0},{},{alias:'Old'}).alias,'Old');assert.throws(()=>publicEntry('x',{balance:NaN},{},{}));
});
test('sync latest wallet, repeat no-op, deleted wallet removes ranking only',async()=>{
 const data=new Map([['users/a/studyPoints/wallet',{balance:150,loginStreak:3}],['users/a',{displayName:'A'}]]);let writes=0;
 const db={doc:p=>p,runTransaction:async f=>f({getAll:async(...refs)=>refs.map(r=>({exists:data.has(r),data:()=>data.get(r)})),set:(r,v)=>{writes++;data.set(r,v);},delete:r=>{writes++;data.delete(r);}})};
 await syncUser(db,'a',()=>1);assert.equal(data.get('mrleePublicLeaderboard/a').points,150);
 await syncUser(db,'a',()=>2);assert.equal(writes,1);
 data.set('users/a/studyPoints/wallet',{balance:151,loginStreak:3});await syncUser(db,'a',()=>3);assert.equal(data.get('mrleePublicLeaderboard/a').points,151);
 assert.equal(data.get('users/a/studyPoints/wallet').balance,151);
 data.delete('users/a/studyPoints/wallet');await syncUser(db,'a',()=>4);assert.equal(data.has('mrleePublicLeaderboard/a'),false);assert.equal(data.has('users/a'),true);
});
