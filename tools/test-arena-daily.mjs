import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {prizeLayout} from "../assets/arena/daily-rewards.js";
const prizes=[100,200,300,500,800,1000,1500,2000,3000,5000];
for(let n=0;n<100;n++){
 const layout=prizeLayout();
 assert.equal(layout.length,10);
 assert.deepEqual([...layout].sort((a,b)=>a-b),prizes);
 for(let i=0;i<layout.length-1;i++)
  assert.notEqual(layout[i]>=1000,layout[i+1]>=1000,"Wheel must alternate low and high rewards");
}
const sql=await readFile(new URL("../supabase/manual-sql/MRLEE_ARENA_DAILY_REWARDS.sql",import.meta.url),"utf8");
const api=await readFile(new URL("../supabase/functions/mrlee-arena-rooms/index.ts",import.meta.url),"utf8");
const arena=await readFile(new URL("../mrlee-game-arena.html",import.meta.url),"utf8");
const zone=await readFile(new URL("../tro-choi-tieng-han.html",import.meta.url),"utf8");
assert.match(sql,/primary key\(firebase_uid,reward_day\)/i);
assert.match(sql,/Asia\/Ho_Chi_Minh/);
assert.match(sql,/for update/);
assert.match(sql,/gift:=1000;points:=1/);
assert.match(sql,/when p_kind='checkin' then 'daily_checkin' else 'lucky_spin'/);
assert.match(sql,/array\[100,200,300,500,800,1000,1500,2000,3000,5000\]/);
assert.match(sql,/mrlee_arena_verified_study_points/);
assert.match(sql,/mrlee_arena_convert/);
assert.match(sql,/revoke all on function public.mrlee_arena_daily_claim\(text,text\) from public,anon,authenticated/);
assert.match(api,/await identity\(req\)/);
assert.match(api,/kind==="daily_checkin"\|\|kind==="daily_spin"/);
assert.match(api,/mrlee_arena_daily_claim/);
assert.match(api,/mrlee_arena_daily_status/);
for(const html of [arena,zone]){
 assert.match(html,/daily-rewards\.js/);
 assert.match(html,/daily-rewards\.css/);
 assert.match(html,/class="arena-daily-launch"|id="arenaDailyOpen" class="arena-ref-gift-launch"/);
}
console.log("PASS 100 alternating wheels, server-only daily limits, daily points/1:10 G contract and both entry pages.");
