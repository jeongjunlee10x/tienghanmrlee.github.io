import test from "node:test";
import assert from "node:assert/strict";
import {newMatch,view,apply,advance,winnerCheck,obstructed,MAX_PLAYERS,MIN_PLAYERS,
 STATIONS,MEETING_MS,PHRASES,ruleError} from "../supabase/functions/mrlee-goose-pvp/engine.mjs";
const people=n=>Array.from({length:n},(_,i)=>({
 uid:"firebase-user-"+String(i+1).padStart(2,"0"),seat:i,name:"Học viên "+(i+1),ready:true
}));
const zero=()=>0;
const room={code:"MRLE2345",visibility:"private",locked:false,version:1};
const roles=(s,m)=>({good:m.filter(x=>!s.players[x.uid].evil),evil:m.filter(x=>s.players[x.uid].evil)});
test("only 4–16 authenticated slots accepted; correct evil count",()=>{
 assert.throws(()=>newMatch(people(3),1,zero));
 assert.throws(()=>newMatch(people(17),1,zero));
 for(const n of [4,7,8,12,13,16]){
  const members=people(n),s=newMatch(members,1000,zero);
  const count=Object.values(s.players).filter(p=>p.evil).length;
  assert.equal(count,n>=13?3:n>=8?2:1);
  assert.equal(s.totalTasks,(n-count)*3);
 }
 assert.equal(MIN_PLAYERS,4);assert.equal(MAX_PLAYERS,16);
});
test("roles and Firebase UIDs remain private until match ends",()=>{
 const m=people(6),s=newMatch(m,1000,zero);
 for(const x of m){
  const v=view(s,m,x.uid,room);
  assert.ok(["evil","good"].includes(v.role));
  assert.ok(v.players.every(p=>p.role===undefined&&p.uid===undefined));
  assert.equal(v.seat,x.seat);
  assert.ok(v.players.every(p=>p.name));
 }
 s.phase="finished";
 const v=view(s,m,m[0].uid,room);
 assert.ok(v.players.every(p=>p.role));
});
test("server restricts input direction, speed and wall crossing",()=>{
 const m=people(4),s=newMatch(m,1000,zero),p=s.players[m[0].uid];
 const initial={x:p.x,y:p.y};
 assert.throws(()=>apply(s,m,m[0].uid,"move",{dx:700,dy:0},1250));
 assert.equal(apply(s,m,m[0].uid,"move",{dx:1,dy:0},1050),false);
 assert.equal(apply(s,m,m[0].uid,"move",{dx:1,dy:0},1250),true);
 assert.ok(Math.hypot(p.x-initial.x,p.y-initial.y)<=43);
 assert.equal(apply(s,m,m[0].uid,"move",{dx:0,dy:1},2250),true);
 assert.ok(!obstructed(p.x,p.y));
 const after={x:p.x,y:p.y};apply(s,m,m[0].uid,"move",{dx:1,dy:0},100000);
 assert.ok(Math.hypot(p.x-after.x,p.y-after.y)<=60);
});
test("task progress requires proximity and three correct Korean answers",()=>{
 const m=people(4),s=newMatch(m,1000,zero),{good}=roles(s,m),uid=good[0].uid,p=s.players[uid];
 const station=p.jobs[0];
 assert.throws(()=>apply(s,m,uid,"task",{station},2000));
 p.x=STATIONS[station].x;p.y=STATIONS[station].y;
 apply(s,m,uid,"task",{station},2000,zero);
 assert.ok(p.task&&p.task.order.length===3);
 const progress0=s.doneTasks;
 const wrong=PHRASES.find(x=>x.ko!==PHRASES[p.task.order[0]].ko).ko;
 apply(s,m,uid,"answer",{word:wrong},3000);
 assert.equal(p.task.index,0);assert.equal(s.doneTasks,progress0);
 for(let i=0;i<3;i++){
  const word=PHRASES[p.task.order[p.task.index]].ko;
  apply(s,m,uid,"answer",{word},3000+i);
 }
 assert.equal(p.task,null);
 assert.ok(p.done.includes(station));
 assert.equal(s.doneTasks,progress0+1);
 assert.throws(()=>apply(s,m,uid,"task",{station},4000));
});
test("evil cannot complete tasks; kill has distance, cooldown and victim checks",()=>{
 const m=people(5),s=newMatch(m,1000,zero),{good,evil}=roles(s,m);
 const a=s.players[evil[0].uid],victim=s.players[good[0].uid];
 assert.throws(()=>apply(s,m,evil[0].uid,"task",{station:0},5000));
 assert.throws(()=>apply(s,m,evil[0].uid,"kill",{seat:victim.seat},6000));
 victim.x=a.x;victim.y=a.y;
 assert.throws(()=>apply(s,m,evil[0].uid,"kill",{seat:victim.seat},15000));
 apply(s,m,evil[0].uid,"kill",{seat:victim.seat},16000);
 assert.equal(victim.alive,false);assert.equal(s.bodies.length,1);
 assert.throws(()=>apply(s,m,evil[0].uid,"kill",{seat:victim.seat},34000));
});
test("report starts meeting, one ballot per member and elimination settles game",()=>{
 const m=people(4),s=newMatch(m,1000,zero),{good,evil}=roles(s,m),bad=s.players[evil[0].uid];
 const victim=s.players[good[0].uid];victim.x=bad.x;victim.y=bad.y;
 apply(s,m,evil[0].uid,"kill",{seat:victim.seat},17000);
 const witness=good[1];s.players[witness.uid].x=victim.x;s.players[witness.uid].y=victim.y;
 apply(s,m,witness.uid,"report",{},18000);
 assert.equal(s.phase,"meeting");
 assert.throws(()=>apply(s,m,witness.uid,"report",{},18001));
 for(const v of [good[1],good[2],evil[0]]){
  apply(s,m,v.uid,"vote",{seat:bad.seat},19000);
  assert.throws(()=>apply(s,m,v.uid,"vote",{seat:null},19001));
 }
 assert.equal(s.phase,"finished");assert.equal(s.winner,"good");
 assert.equal(s.meetingResult.ejected,bad.seat);
});
test("meeting chat sanitized and rate-limited, reveal advances on server clock",()=>{
 const m=people(5),s=newMatch(m,1000,zero);
 apply(s,m,m[0].uid,"emergency",{},2000);
 assert.equal(s.phase,"meeting");
 apply(s,m,m[0].uid,"chat",{text:"Xin chào <ai>"},4000);
 assert.equal(s.messages.length,1);
 assert.throws(()=>apply(s,m,m[0].uid,"chat",{text:"Spam"},4001));
 const changed=advance(s,2000+MEETING_MS);
 assert.equal(changed,true);assert.equal(s.phase,"reveal");
 assert.equal(s.meetingResult.ejected,null);
 advance(s,s.revealDeadline+100);
 assert.equal(s.phase,"playing");
 assert.throws(()=>apply(s,m,m[0].uid,"emergency",{},s.revealDeadline+200));
});
test("dead players cannot act, tasks can win, timer eventually draws",()=>{
 const m=people(4),s=newMatch(m,1000,zero),{good}=roles(s,m);
 s.players[good[0].uid].alive=false;
 assert.throws(()=>apply(s,m,good[0].uid,"vote",{seat:null},8000));
 const s2=newMatch(m,1000,zero);s2.doneTasks=s2.totalTasks;
 winnerCheck(s2);assert.equal(s2.winner,"good");
 const s3=newMatch(m,1000,zero);advance(s3,s3.deadline+1);
 assert.equal(s3.winner,"draw");
});
