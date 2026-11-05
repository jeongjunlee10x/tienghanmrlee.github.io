/* Live-safe public API smoke test. No student token, no writes, no personal data. */
import assert from "node:assert/strict";
const base="https://pkxqsboyotlyoizzxizb.supabase.co/functions/v1/mrlee-game-zone";
const origin="https://jeongjunlee10x.github.io";
async function check(action,init){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),18000);
 try{
  const response=await fetch(base+"?action="+action,{...init,headers:{"Origin":origin,...(init?.headers||{})},signal:controller.signal});
  const data=await response.json();
  return {response,data};
 }finally{clearTimeout(timeout);}
}
const status=await check("status");
assert.equal(status.response.status,200,"GET status should work without login");
assert.equal(status.data.ok,true);
assert.ok(Number.isInteger(status.data.verifiedQuestionCount));
assert.ok(status.data.verifiedQuestionCount>=0);
const ranking=await check("leaderboard");
assert.equal(ranking.response.status,200,"GET leaderboard public summary should work");
assert.ok(Array.isArray(ranking.data.leaderboard));
assert.ok(ranking.data.leaderboard.every(x=>!Object.hasOwn(x,"firebase_uid")),
 "Never expose full Firebase UID in public ranking");
const me=await check("me");
assert.equal(me.response.status,401,"Personal history must require Firebase JWT");
const start=await check("start",{
 method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({cap:1,bai:1})
});
assert.equal(start.response.status,401,"Issue of ranked session must require Firebase JWT");
const noOrigin=await fetch(base+"?action=status",{headers:{"Origin":"https://untrusted.example"}});
assert.equal(noOrigin.status,403,"Untrusted origin must not issue authorized requests");
console.log("PASS Game Zone remote Edge API: public status="+status.data.verifiedQuestionCount+" approved, leaderboard read-only, authenticated actions 401, origin deny 403.");
