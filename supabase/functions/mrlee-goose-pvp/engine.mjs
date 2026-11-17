/* Goose Mystery: deterministic rules, server-only authority. MIT-style original MR LEE code.
   No authentication, SQL or network access in this file; all callers must authenticate first. */
export const WORLD={width:960,height:610,radius:20,speed:170};
export const WALLS=[
 {x:260,y:90,w:28,h:165},{x:260,y:350,w:28,h:160},
 {x:650,y:90,w:28,h:170},{x:650,y:352,w:28,h:160},
 {x:360,y:180,w:210,h:25},{x:360,y:408,w:210,h:25},
 {x:95,y:270,w:150,h:24},{x:715,y:270,w:150,h:24}
];
export const STATIONS=[
 {x:530,y:310,name:"Khởi động liên lạc"},{x:470,y:110,name:"Kiểm tra radar"},
 {x:815,y:135,name:"Phân loại hồ sơ"},{x:145,y:475,name:"Kết nối điện"},
 {x:470,y:520,name:"Hiệu chỉnh thiết bị"},{x:810,y:465,name:"Bảo trì hệ thống"}
];
export const PHRASES=[
 {ko:"안녕하세요",vi:"Xin chào"},{ko:"감사합니다",vi:"Cảm ơn"},
 {ko:"죄송합니다",vi:"Xin lỗi"},{ko:"네",vi:"Vâng"},
 {ko:"아니요",vi:"Không"},{ko:"괜찮아요",vi:"Không sao"},
 {ko:"안녕히 가세요",vi:"Tạm biệt (người đi)"},{ko:"잘 먹겠습니다",vi:"Tôi sẽ ăn ngon miệng"}
];
export const MIN_PLAYERS=4,MAX_PLAYERS=16;
export const MATCH_LIMIT_MS=15*60_000,MEETING_MS=45_000,REVEAL_MS=8_000;
export function ruleError(message,status=409){return Object.assign(new Error(message),{status})}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function obstructed(x,y,r=WORLD.radius){
 return x<46+r||x>WORLD.width-46-r||y<46+r||y>WORLD.height-46-r||
  WALLS.some(w=>x+r>w.x&&x-r<w.x+w.w&&y+r>w.y&&y-r<w.y+w.h);
}
export function randInt(max){
 const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);
 const limit=Math.floor(2**32/max)*max;let n;
 do{crypto.getRandomValues(bytes);n=bytes[0]}while(n>=limit);
 return n%max;
}
export function shuffle(items,rand=randInt){
 const arr=[...items];
 for(let i=arr.length-1;i>0;i--){const j=rand(i+1);[arr[i],arr[j]]=[arr[j],arr[i]]}
 return arr;
}
function spawn(seat){
 const spots=[
 [445,310],[510,350],[375,300],[565,310],[446,355],[525,275],
 [340,320],[610,320],[405,265],[555,360],[315,400],[630,395],
 [320,225],[625,225],[410,365],[580,265]];
 const [x,y]=spots[seat%spots.length];return {x,y};
}
export function newMatch(members,now=Date.now(),rand=randInt){
 if(members.length<MIN_PLAYERS||members.length>MAX_PLAYERS)throw ruleError("Cần 4–16 người để bắt đầu.");
 if(new Set(members.map(m=>m.uid)).size!==members.length)throw ruleError("Trùng tài khoản.",400);
 const count=members.length>=13?3:members.length>=8?2:1;
 const bad=new Set(shuffle(members.map(m=>m.uid),rand).slice(0,count));
 const players={};let totalTasks=0;
 for(const m of members){
  const badRole=bad.has(m.uid),position=spawn(m.seat);
  const jobs=badRole?[]:shuffle(STATIONS.map((_,i)=>i),rand).slice(0,3);
  if(!badRole)totalTasks+=jobs.length;
  players[m.uid]={...position,alive:true,evil:badRole,left:false,seat:m.seat,
   jobs,done:[],task:null,emergency:false,lastMoveAt:now,lastKillAt:now,
   lastChatAt:0};
 }
 return {phase:"playing",startedAt:now,deadline:now+MATCH_LIMIT_MS,players,
  totalTasks,doneTasks:0,bodies:[],votes:{},messages:[],meetingDeadline:0,
  revealDeadline:0,meetingResult:null,meetingNumber:0,winner:null,reason:null,
  events:[{type:"start",at:now,text:"Ván bắt đầu. Giữ bí mật vai trò!"}]};
}
export function winnerCheck(s){
 if(s.phase==="finished")return s;
 const living=Object.values(s.players).filter(p=>p.alive&&!p.left);
 const evil=living.filter(p=>p.evil).length,good=living.length-evil;
 if(evil===0){s.phase="finished";s.winner="good";s.reason="Tất cả kẻ phá hoại đã bị loại."}
 else if(good<=evil){s.phase="finished";s.winner="evil";s.reason="Phe phá hoại chiếm ưu thế."}
 else if(s.totalTasks>0&&s.doneTasks>=s.totalTasks){s.phase="finished";s.winner="good";s.reason="Toàn bộ nhiệm vụ hoàn thành."}
 return s;
}
function player(s,uid){
 const p=s.players[uid];if(!p||p.left)throw ruleError("Không tham gia ván này.",403);
 return p;
}
function living(s,uid){
 const p=player(s,uid);if(!p.alive)throw ruleError("Người đã bị loại chỉ được theo dõi.",403);
 return p;
}
function playing(s){if(s.phase!=="playing")throw ruleError("Trận không ở giai đoạn di chuyển.");}
function log(s,type,text,now){s.events.push({type,text,at:now});s.events=s.events.slice(-18)}
function openMeeting(s,now,text){
 s.phase="meeting";s.votes={};s.messages=[];s.meetingDeadline=now+MEETING_MS;s.meetingNumber++;
 for(const p of Object.values(s.players))p.task=null;
 log(s,"meeting",text,now);
}
function finishVote(s,now){
 if(s.phase!=="meeting")return;
 const voteCounts=new Map(),livingPlayers=Object.values(s.players).filter(p=>p.alive&&!p.left);
 const tally={skip:0};for(const p of livingPlayers)tally[String(p.seat)]=0;
 for(const p of livingPlayers){
  const selection=s.votes[String(p.seat)];
  if(selection===undefined||selection===null){tally.skip++;continue}
  if(livingPlayers.some(q=>q.seat===selection))tally[String(selection)]++;
  else tally.skip++;
 }
 for(const [seat,votes] of Object.entries(tally))voteCounts.set(seat,votes);
 const ranked=[...voteCounts].filter(([key])=>key!=="skip").sort((a,b)=>b[1]-a[1]);
 const leader=ranked[0],runner=ranked[1];
 const removed=leader&&leader[1]>tally.skip&&leader[1]>(runner?.[1]||0)?Number(leader[0]):null;
 let ejected=null,wasEvil=null;
 if(removed!==null){
  const match=livingPlayers.find(p=>p.seat===removed);
  if(match){match.alive=false;ejected=match.seat;wasEvil=match.evil}
 }
 s.meetingResult={ejected,wasEvil,tally,at:now};s.bodies=[];s.votes={};
 s.phase="reveal";s.revealDeadline=now+REVEAL_MS;
 log(s,"vote",ejected===null?"Không ai bị loại.":"Người chơi #"+(ejected+1)+" bị loại.",now);
 winnerCheck(s);
}
export function advance(s,now=Date.now()){
 if(s.phase==="finished")return false;
 if(now>=s.deadline){s.phase="finished";s.winner="draw";s.reason="Trận kết thúc khi hết giờ.";return true}
 if(s.phase==="meeting"&&now>=s.meetingDeadline){finishVote(s,now);return true}
 if(s.phase==="reveal"&&now>=s.revealDeadline){s.phase="playing";s.meetingResult=null;return true}
 return false;
}
export function apply(s,members,uid,action,data={},now=Date.now(),rand=randInt){
 const p=living(s,uid);
 if(!["playing","meeting"].includes(s.phase))throw ruleError("Hãy chờ giai đoạn tiếp theo.");
 const name=members.find(m=>m.uid===uid)?.name||"Người chơi";
 if(action==="move"){
  playing(s);
  const dx=Number(data.dx),dy=Number(data.dy);
  if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.abs(dx)>1||Math.abs(dy)>1)
   throw ruleError("Hướng di chuyển không hợp lệ.",400);
  const dt=Math.max(0,Math.min(now-p.lastMoveAt,350));
  if(dt<90)return false;
  p.lastMoveAt=now;const d=Math.hypot(dx,dy);if(d<.1)return true;
  const length=WORLD.speed*dt/1000,ux=dx/d,uy=dy/d,steps=Math.ceil(length/7);
  for(let i=0;i<steps;i++){
   const nx=p.x+ux*length/steps,ny=p.y+uy*length/steps;
   if(!obstructed(nx,p.y))p.x=nx;
   if(!obstructed(p.x,ny))p.y=ny;
  }
  return true;
 }
 if(action==="task"){
  playing(s);if(p.evil)throw ruleError("Kẻ phá hoại không thể hoàn thành nhiệm vụ.",403);
  const station=Number(data.station);
  if(!Number.isInteger(station)||!p.jobs.includes(station)||p.done.includes(station))
   throw ruleError("Nhiệm vụ không hợp lệ.",400);
  if(distance(p,STATIONS[station])>72)throw ruleError("Bạn chưa đứng gần trạm.");
  if(!p.task||p.task.station!==station){
   p.task={station,index:0,order:shuffle(PHRASES.map((_,i)=>i),rand).slice(0,3)};
  }
  return true;
 }
 if(action==="answer"){
  playing(s);if(p.evil||!p.task)throw ruleError("Chưa bắt đầu nhiệm vụ.",400);
  if(distance(p,STATIONS[p.task.station])>72)throw ruleError("Bạn đã rời quá xa trạm.");
  if(typeof data.word!=="string"||data.word.length>64)throw ruleError("Đáp án không hợp lệ.",400);
  const right=PHRASES[p.task.order[p.task.index]].ko;
  if(data.word!==right){p.task.index=0;return true}
  p.task.index++;
  if(p.task.index>=p.task.order.length){
   p.done.push(p.task.station);p.task=null;s.doneTasks++;
   log(s,"task",name+" đã hoàn thành một trạm.",now);
   winnerCheck(s);
  }
  return true;
 }
 if(action==="kill"){
  playing(s);if(!p.evil)throw ruleError("Chỉ kẻ phá hoại được thực hiện.",403);
  const seat=Number(data.seat),target=Object.values(s.players).find(q=>q.seat===seat);
  if(!Number.isInteger(seat)||!target||!target.alive||target.evil||target.left)
   throw ruleError("Mục tiêu không hợp lệ.",400);
  if(now-p.lastKillAt<15000||now-s.startedAt<15000)throw ruleError("Chiêu chưa hồi.");
  if(distance(p,target)>62)throw ruleError("Mục tiêu ở quá xa.");
  target.alive=false;p.lastKillAt=now;
  s.bodies.push({seat:target.seat,x:target.x,y:target.y});
  winnerCheck(s);return true;
 }
 if(action==="report"){
  playing(s);
  const body=s.bodies.find(b=>distance(p,b)<=90);
  if(!body)throw ruleError("Không tìm thấy người bị hạ ở gần.");
  openMeeting(s,now,name+" phát hiện người bị hạ.");return true;
 }
 if(action==="emergency"){
  playing(s);if(p.emergency)throw ruleError("Bạn đã dùng lượt họp khẩn.");
  p.emergency=true;openMeeting(s,now,name+" triệu tập cuộc họp.");return true;
 }
 if(action==="vote"){
  if(s.phase!=="meeting")throw ruleError("Chưa mở bỏ phiếu.");
  if(Object.hasOwn(s.votes,String(p.seat)))throw ruleError("Bạn đã bỏ phiếu.");
  const seat=data.seat===null?null:Number(data.seat);
  if(seat!==null&&(!Number.isInteger(seat)||!Object.values(s.players).some(q=>q.seat===seat&&q.alive&&!q.left)))
   throw ruleError("Phiếu không hợp lệ.",400);
  s.votes[String(p.seat)]=seat;
  if(Object.values(s.players).filter(q=>q.alive&&!q.left).every(q=>Object.hasOwn(s.votes,String(q.seat))))finishVote(s,now);
  return true;
 }
 if(action==="chat"){
  if(s.phase!=="meeting")throw ruleError("Chỉ được chat trong cuộc họp.");
  const text=typeof data.text==="string"?data.text.normalize("NFKC").replace(/[\x00-\x1f\x7f]/g," ").trim().slice(0,160):"";
  if(!text||text.length<2)throw ruleError("Tin nhắn quá ngắn.",400);
  if(now-p.lastChatAt<1800)throw ruleError("Gửi quá nhanh.",429);
  p.lastChatAt=now;s.messages.push({seat:p.seat,text,at:now});
  s.messages=s.messages.slice(-25);return true;
 }
 throw ruleError("Thao tác không được hỗ trợ.",404);
}
export function view(s,members,uid,room){
 const me=s.players[uid],isFinished=s.phase==="finished";
 if(!me)throw ruleError("Không thuộc phòng.",403);
 const list=members.map(m=>{
  const p=s.players[m.uid];
  return {seat:m.seat,name:m.name,alive:p?.alive??false,left:p?.left??false,
   x:Math.round(p?.x??0),y:Math.round(p?.y??0),
   ...(isFinished?{role:p?.evil?"evil":"good"}:{})};
 });
 const myTasks=(me.jobs||[]).map(id=>({id,...STATIONS[id],done:me.done.includes(id)}));
 const task=me.task&&s.phase==="playing"?{
  station:me.task.station,index:me.task.index,
  sequence:me.task.order.map(id=>PHRASES[id].vi),
  options:me.task.order.map(id=>PHRASES[id].ko)}:null;
 return {code:room.code,visibility:room.visibility,locked:room.locked,
   status:s.phase,version:room.version,serverTime:Date.now(),
   players:list,seat:me.seat,role:me.evil?"evil":"good",alive:me.alive,
   tasks:myTasks,task,doneTasks:s.doneTasks,totalTasks:s.totalTasks,
   bodies:s.bodies.map(b=>({...b})),meetingDeadline:s.phase==="meeting"?s.meetingDeadline:null,
   meetingNumber:s.meetingNumber,hasVoted:Object.hasOwn(s.votes,String(me.seat)),
   votesReceived:Object.keys(s.votes).length,
   revealDeadline:s.phase==="reveal"?s.revealDeadline:null,
   meetingResult:s.meetingResult,
   messages:s.phase==="meeting"?s.messages:[],
   startedAt:s.startedAt,deadline:s.deadline,
   canEmergency:!me.emergency&&me.alive,
   killReadyAt:me.evil?Math.max(me.lastKillAt+15000,s.startedAt+15000):null,
   winner:s.winner,reason:s.reason,events:s.events.slice(-6)};
}
