/* MR LEE Goose Mystery PvP client — snapshots only; all rules live on Supabase Edge.
   Never trust, transmit or store opponent roles or gold in the browser. */
import {firebaseConfig,isFirebaseConfigured} from "../../firebase-config.js";
const ENDPOINT="https://pkxqsboyotlyoizzxizb.supabase.co/functions/v1/mrlee-goose-pvp";
const $=id=>document.getElementById(id);
const STATIONS=[
 {x:530,y:310,name:"Khởi động liên lạc"},{x:470,y:110,name:"Kiểm tra radar"},
 {x:815,y:135,name:"Phân loại hồ sơ"},{x:145,y:475,name:"Kết nối điện"},
 {x:470,y:520,name:"Hiệu chỉnh thiết bị"},{x:810,y:465,name:"Bảo trì hệ thống"}
];
const WALLS=[
 {x:260,y:90,w:28,h:165},{x:260,y:350,w:28,h:160},
 {x:650,y:90,w:28,h:170},{x:650,y:352,w:28,h:160},
 {x:360,y:180,w:210,h:25},{x:360,y:408,w:210,h:25},
 {x:95,y:270,w:150,h:24},{x:715,y:270,w:150,h:24}
];
const COLORS=["#79e7f7","#ffdc8a","#fe9bc7","#b7a2fc","#89ebbb","#ff9b6a","#dfe3fb","#edb38d","#f79be5","#85daf7","#b2d47f","#ffdaae","#c3b9f6","#86beeb","#ffb7b0","#d7e6cc"];
const keys=new Set(),touch=new Set(),lerps=new Map();
const MAP=$("gmMap"),ctx=MAP.getContext("2d");
let room=null,roomCode="",networkReady=false,authSdk=null,authPromise=null;
let pollInFlight=false,moveInFlight=false,actionInFlight=false,taskOpen=false,serverOffset=0;
let lastError="",lastRoomListAt=0,connectPending=false;
const reqOptions={cache:"no-store",credentials:"omit"};
const timeout=(ms=11000)=>AbortSignal.timeout(ms);
function status(message,error=false){
 $("gmAlert").textContent=message;$("gmAlert").classList.toggle("gm-error",error);
}
function displayError(err){
 const msg=String(err?.message||"Không thể kết nối máy chủ.");
 if(msg!==lastError){status(msg,true);lastError=msg}
}
async function sdk(){
 if(authSdk)return authSdk;
 if(!authPromise)authPromise=Promise.all([
  import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
  import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")
 ]).then(([app,auth])=>{authSdk={app,auth};return authSdk})
 .catch(e=>{authPromise=null;throw e});
 return authPromise;
}
async function token(){
 if(!isFirebaseConfigured)throw Error("Website chưa cấu hình đăng nhập Firebase.");
 const {app,auth}=await sdk();
 const instance=app.getApps().find(x=>x.name==="[DEFAULT]")||app.initializeApp(firebaseConfig);
 const a=auth.getAuth(instance);
 if(typeof a.authStateReady==="function")await a.authStateReady();
 const user=a.currentUser;
 if(!user||!user.emailVerified)throw Error("Cần đăng nhập MR LEE và xác minh email trước khi chơi PvP.");
 return user.getIdToken();
}
async function api(action,data={},method="POST"){
 const url=new URL(ENDPOINT);url.searchParams.set("action",action);
 const headers={};
 if(action!=="health")headers.Authorization="Bearer "+await token();
 if(method==="GET")Object.entries(data).forEach(([key,value])=>url.searchParams.set(key,String(value)));
 else headers["Content-Type"]="application/json";
 const res=await fetch(url,{
  ...reqOptions,method,headers,signal:timeout(),
  ...(method==="GET"?{}:{body:JSON.stringify(data)})
 });
 let json;try{json=await res.json()}catch{throw Error("Máy chủ PvP chưa sẵn sàng hoặc trả dữ liệu không hợp lệ.")}
 if(!res.ok||!json.ok)throw Error(json.error||"Lỗi phòng trực tuyến.");
 return json;
}
async function probe(){
 try{
  await api("health",{},"GET");networkReady=true;
  $("gmOnline").textContent="● Máy chủ PvP sẵn sàng";$("gmOnline").classList.add("gm-online");
  status("Máy chủ đã kết nối. Hãy đăng nhập để tạo hoặc vào phòng.");
  await reloadRooms();
  const invite=new URL(location.href).searchParams.get("room");
  if(invite&&/^[A-Z2-9]{8}$/i.test(invite)){
   $("gmJoinCode").value=invite.toUpperCase();
   try{await joinRoom(invite.toUpperCase())}catch(err){displayError(err)}
  }
 }catch(err){
  networkReady=false;$("gmOnline").textContent="● Máy chủ chưa kích hoạt";
  $("gmOnline").classList.remove("gm-online");
  status("PvP chưa triển khai đầy đủ trên Supabase. Chế độ đấu máy vẫn hoạt động. "+String(err.message||""),true);
 }
}
function name(){return $("gmPlayerName").value.trim().slice(0,24)||"Học viên MR LEE"}
function normalizeCode(code){return String(code||"").trim().toUpperCase().replace(/[\s-]/g,"")}
function accept(view){
 if(!view?.code)return;
 if(room&&room.code===view.code&&Number(view.version)<Number(room.version))return;
 if(view.serverTime)serverOffset=view.serverTime-Date.now();
 room=view;roomCode=view.code;lastError="";
 status("Đang kết nối phòng "+room.code+" · cập nhật phiên bản "+view.version);
 render();
}
async function action(kind,options={}){
 if(actionInFlight)return;
 actionInFlight=true;
 try{
  const out=await api(kind,{code:roomCode,...options});
  if(out.left){room=null;roomCode="";keys.clear();touch.clear();taskOpen=false;render();status("Đã rời phòng.");}
  else accept(out.room);
 }catch(err){displayError(err)}finally{actionInFlight=false}
}
async function enter(kind,data){
 if(connectPending)return;
 connectPending=true;status("Đang kết nối phòng…");
 try{const out=await api(kind,{name:name(),...data});accept(out.room);
  if(history.replaceState){const u=new URL(location.href);u.searchParams.set("room",out.room.code);history.replaceState(null,"",u.href)}
 }catch(err){displayError(err)}finally{connectPending=false}
}
async function joinRoom(code){await enter("join",{code:normalizeCode(code)})}
async function reloadRooms(){
 if(!networkReady||roomCode)return;
 try{
  const data=await api("list",{},"GET");lastRoomListAt=Date.now();
  const el=$("gmRoomList");el.replaceChildren();
  if(!data.rooms.length){const p=document.createElement("p");p.textContent="Chưa có phòng công khai. Có thể tạo một phòng mới.";el.append(p);return}
  for(const r of data.rooms){
   const div=document.createElement("div");div.className="gm-roomitem";
   const text=document.createElement("div");
   const b=document.createElement("strong");b.textContent=r.code;
   const span=document.createElement("span");span.textContent=r.players+" / "+r.capacity+" người";
   text.append(b,span);const btn=document.createElement("button");btn.textContent="Tham gia";
   btn.onclick=()=>joinRoom(r.code);div.append(text,btn);el.append(div);
  }
 }catch(err){$("gmRoomList").textContent="Đăng nhập để xem phòng công khai.";if(!roomCode)displayError(err)}
}
function timer(ms){
 if(!Number.isFinite(ms))return "—";
 const seconds=Math.max(0,Math.ceil(ms/1000));
 return String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");
}
function myPlayer(){return room?.players?.find(p=>p.seat===room.seat)}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function nearestPlayers(){
 const me=myPlayer();if(!me)return[];
 return room.players.filter(p=>p.seat!==room.seat&&p.alive&&!p.left)
  .map(p=>({p,d:dist(me,p)})).sort((a,b)=>a.d-b.d);
}
function nearestTask(){
 const me=myPlayer();if(!me)return null;
 return (room.tasks||[]).filter(t=>!t.done).map(t=>({...t,d:dist(me,t)}))
  .sort((a,b)=>a.d-b.d)[0]||null;
}
function isMatch(){return room&&["playing","meeting","reveal","finished"].includes(room.status)}
function makeText(tag,value,className=""){
 const e=document.createElement(tag);e.textContent=value;if(className)e.className=className;return e;
}
function renderWaiting(){
 $("gmWaitingPlayers").replaceChildren();
 const list=room.players||[];
 $("gmReadyCount").textContent=list.filter(p=>p.ready).length+" / "+list.length+" sẵn sàng";
 for(const p of list){
  const div=makeText("div","", "gm-person");
  div.append(makeText("span","🪿"),makeText("div",p.name+(p.seat===room.seat?" (Bạn)":"")+(p.ready?" · ✓":" · …")));
  $("gmWaitingPlayers").append(div);
 }
 $("gmReady").textContent=room.ready?"↩ Hủy sẵn sàng":"✓ Sẵn sàng";
 $("gmStart").hidden=!room.isHost;
 $("gmStart").disabled=list.length<4||!list.every(p=>p.ready);
 $("gmLock").hidden=!room.isHost;
 $("gmLock").textContent=room.locked?"🔒 Mở khóa phòng":"🔓 Khóa phòng";
}
function renderTaskList(){
 const el=$("gmTasks");el.replaceChildren();
 if(room.role==="evil"){el.append(makeText("p","Giữ bí mật. Hãy hạ đối thủ nhưng tránh bị phát hiện."));return}
 for(const t of room.tasks||[]){
  const div=makeText("div",(t.done?"✓ ":"⚙ ")+t.name,t.done?"gm-task gm-done":"gm-task");
  el.append(div);
 }
}
function renderPlayers(){
 const el=$("gmPlayers");el.replaceChildren();
 for(const p of room.players){
  const div=makeText("div",(p.alive?"🪿 ":"💀 ")+p.name+(p.seat===room.seat?" (Bạn)":"")+
   (room.status==="finished"?" · "+(p.role==="evil"?"Phá hoại":"Phe tốt"):""),"gm-compact-player");
  el.append(div);
 }
}
function renderBallot(){
 const box=$("gmBallot");box.replaceChildren();
 if(room.status!=="meeting")return;
 for(const p of room.players.filter(p=>p.alive&&!p.left)){
  const btn=makeText("button","🪿 "+p.name+(p.seat===room.seat?" (Bạn)":""));
  btn.disabled=!room.alive||room.hasVoted;
  btn.onclick=()=>action("vote",{seat:p.seat});box.append(btn);
 }
 const skip=makeText("button","Bỏ qua phiếu");skip.disabled=!room.alive||room.hasVoted;
 skip.onclick=()=>action("vote",{seat:null});box.append(skip);
 if(room.hasVoted)box.append(makeText("p","✓ Đã ghi nhận phiếu. Đang chờ người chơi khác."));
}
function renderChat(){
 const log=$("gmChatLog");log.replaceChildren();
 for(const m of room.messages||[]){
  const from=room.players.find(p=>p.seat===m.seat);
  log.append(makeText("div",(from?.name||"Người chơi")+": "+m.text));
 }
 log.scrollTop=log.scrollHeight;
 $("gmSend").disabled=!room.alive||room.status!=="meeting";
 $("gmChatText").disabled=!room.alive||room.status!=="meeting";
}
function renderPuzzle(){
 const modal=$("gmPuzzle"),p=room?.task;
 if(!taskOpen||!p||room.status!=="playing"||!room.alive){
  if(modal.open)modal.close();return;
 }
 $("gmPuzzleTitle").textContent="⚙ "+(STATIONS[p.station]?.name||"Nhiệm vụ");
 $("gmPuzzleWords").textContent=p.sequence.join(" → ");
 $("gmPuzzleStep").textContent="Đáp án đúng: "+p.index+" / "+p.sequence.length;
 const options=$("gmPuzzleOptions");options.replaceChildren();
 for(const word of p.options){
  const button=makeText("button",word);
  button.onclick=()=>action("answer",{word});options.append(button);
 }
 if(!modal.open)modal.showModal();
}
function renderResults(){
 const reveal=room.status==="reveal"&&room.meetingResult;
 $("gmResult").hidden=room.status!=="reveal"&&room.status!=="finished";
 if(reveal){
  $("gmResultTitle").textContent="🗳️ Kết quả bỏ phiếu";
  $("gmResultReason").textContent=room.meetingResult.ejected===null?"Không đủ phiếu loại người chơi nào.":
  "Người chơi #"+(room.meetingResult.ejected+1)+" bị loại. "+
  (room.meetingResult.wasEvil?"Đó là phe phá hoại.":"Đó là phe tốt.");
 }else if(room.status==="finished"){
  const won=(room.winner===room.role);
  $("gmResultTitle").textContent=room.winner==="draw"?"⏱ Hòa":
   won?"🏆 PHE BẠN CHIẾN THẮNG":"💀 PHE BẠN THẤT BẠI";
  $("gmResultReason").textContent=room.reason||"Trận đã kết thúc.";
 }
 $("gmRematch").hidden=room.status!=="finished";
 $("gmRematch").disabled=Boolean(room.ready)||!room.alive&&room.winner===null;
 $("gmRematch").textContent=room.ready?"✓ Đã sẵn sàng ván tiếp":"↻ Chơi ván tiếp";
}
function render(){
 $("gmLobby").hidden=!!room;
 $("gmRoom").hidden=!room;
 if(!room)return;
 $("gmCode").textContent=room.code;
 const labels={waiting:"Đang chờ",playing:"Đang chơi",meeting:"Họp khẩn",reveal:"Công bố kết quả",finished:"Kết thúc"};
 $("gmPhase").textContent=labels[room.status]||room.status;
 $("gmWaiting").hidden=isMatch();
 $("gmMatch").hidden=!isMatch();
 $("gmMeeting").hidden=room.status!=="meeting";
 if(!isMatch()){renderWaiting();return}
 $("gmMyRole").textContent=room.role==="evil"?"🕵️ PHE PHÁ HOẠI":"🪽 PHE TỐT";
 $("gmPlayerCount").textContent=room.players.filter(p=>p.alive).length+" / "+room.players.length+" còn sống";
 $("gmProgress").style.width=(room.totalTasks?Math.min(100,Math.round(room.doneTasks/room.totalTasks*100)):0)+"%";
 $("gmProgressText").textContent=room.doneTasks+" / "+room.totalTasks+" nhiệm vụ";
 const active=room.status==="playing"&&room.alive;
 $("gmTask").hidden=room.role==="evil";
 $("gmTask").disabled=!active;
 $("gmKill").hidden=room.role!=="evil";
 $("gmKill").disabled=!active||Date.now()+serverOffset<(room.killReadyAt||0);
 $("gmReport").disabled=!active;
 $("gmEmergency").disabled=!active||!room.canEmergency;
 if(room.status==="meeting"){renderBallot();renderChat()}
 renderTaskList();renderPlayers();renderPuzzle();renderResults();
}
async function doTask(){
 const task=nearestTask();
 if(!task)return status("Bạn đã hoàn thành tất cả nhiệm vụ cá nhân.");
 if(task.d>72)return status("Hãy di chuyển gần trạm nhiệm vụ: "+task.name);
 taskOpen=true;await action("task",{station:task.id});
}
async function kill(){
 const near=nearestPlayers()[0];if(!near||near.d>62)return status("Bạn chưa đứng đủ gần nhân vật nào.");
 await action("kill",{seat:near.p.seat});
}
async function report(){
 const me=myPlayer();
 if(!me)return;
 const body=(room.bodies||[]).find(b=>dist(me,b)<90);
 if(!body)return status("Không có người bị hạ ở gần.");
 await action("report");
}
function pressed(){
 let x=0,y=0;
 const all=new Set([...keys,...touch]);
 if(all.has("left")||all.has("a"))x--;
 if(all.has("right")||all.has("d"))x++;
 if(all.has("up")||all.has("w"))y--;
 if(all.has("down")||all.has("s"))y++;
 const len=Math.hypot(x,y);return len?{dx:x/len,dy:y/len}:null;
}
async function step(){
 if(!roomCode||room.status!=="playing"||!room.alive||moveInFlight)return;
 const dir=pressed();if(!dir)return;moveInFlight=true;
 try{const res=await api("move",{code:roomCode,...dir});accept(res.room)}
 catch(err){if(!String(err.message).includes("đồng thời"))displayError(err)}
 finally{moveInFlight=false}
}
async function poll(){
 if(!roomCode||pollInFlight)return;pollInFlight=true;
 try{const res=await api("status",{code:roomCode},"GET");accept(res.room)}
 catch(err){displayError(err)}finally{pollInFlight=false}
}
function floorFill(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function drawGoose(p,x,y){
 const c=COLORS[p.seat%COLORS.length];ctx.save();ctx.translate(x,y);
 ctx.fillStyle="#0311249d";ctx.beginPath();ctx.ellipse(0,25,23,7,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#e6a04d";ctx.fillRect(-10,17,7,13);ctx.fillRect(10,17,7,13);
 ctx.fillStyle=c;ctx.strokeStyle="#102845";ctx.lineWidth=2;
 ctx.beginPath();ctx.ellipse(-1,5,22,20,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.roundRect(6,-29,19,36,10);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.arc(16,-27,15,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle="#e6a04d";ctx.beginPath();ctx.moveTo(27,-27);ctx.lineTo(40,-22);ctx.lineTo(27,-17);ctx.fill();
 ctx.fillStyle="#0b2137";ctx.beginPath();ctx.arc(20,-32,3.8,0,Math.PI*2);ctx.fill();
 if(p.seat===room.seat){ctx.lineWidth=3;ctx.strokeStyle="#ffee9c";ctx.beginPath();ctx.arc(0,2,27,0,Math.PI*2);ctx.stroke()}
 ctx.restore();ctx.textAlign="center";ctx.font="bold 13px system-ui";ctx.lineWidth=4;ctx.strokeStyle="#071629";ctx.strokeText(p.name,x,y-46);
 ctx.fillStyle="#f4feff";ctx.fillText(p.name,x,y-46);
}
function draw(){
 if(ctx){
 ctx.clearRect(0,0,960,610);floorFill(0,0,960,610,"#112a48");
 ctx.strokeStyle="#ffffff0b";ctx.lineWidth=1;
 for(let x=44;x<960;x+=44)for(let y=44;y<610;y+=44)ctx.strokeRect(x,y,44,44);
 const rooms=[
 [61,60,187,195,"#24495d","MÁY PHÁT ĐIỆN"],[300,61,335,108,"#1c4865","RADAR"],
 [686,61,209,195,"#39475d","LƯU TRỮ"],[60,330,184,194,"#1b4560","ĐIỆN"],
 [302,440,333,94,"#29516a","TRUNG TÂM"],[689,331,204,196,"#224760","BẢO TRÌ"]];
 ctx.font="bold 15px system-ui";
 for(const [x,y,w,h,c,n] of rooms){floorFill(x,y,w,h,c);ctx.fillStyle="#d4eaf1";ctx.fillText(n,x+12,y+23)}
 ctx.strokeStyle="#9fddeb";ctx.lineWidth=6;ctx.strokeRect(46,46,868,518);
 for(const wall of WALLS){floorFill(wall.x,wall.y,wall.w,wall.h,"#668ca2");floorFill(wall.x+2,wall.y+2,wall.w-4,6,"#a9c7d9")}
 if(room&&isMatch()){
  const tasks=room.tasks||[];
  for(const task of tasks){
   ctx.beginPath();ctx.arc(task.x,task.y,26,0,Math.PI*2);
   ctx.fillStyle=task.done?"#559f7a55":"#25bba77d";ctx.fill();
   ctx.strokeStyle=task.done?"#98cfac":"#60efd3";ctx.lineWidth=3;ctx.stroke();
   ctx.textAlign="center";ctx.font="bold 21px system-ui";ctx.fillStyle="#fff";ctx.fillText(task.done?"✓":"⚙",task.x,task.y+8);
  }
  for(const b of room.bodies||[]){ctx.font="26px system-ui";ctx.textAlign="center";ctx.fillText("💀",b.x,b.y+8)}
  for(const p of room.players.filter(p=>p.alive&&!p.left)){
   const prev=lerps.get(p.seat)||{x:p.x,y:p.y};
   prev.x+=(p.x-prev.x)*.34;prev.y+=(p.y-prev.y)*.34;
   lerps.set(p.seat,prev);drawGoose(p,prev.x,prev.y);
  }
 }
 }
 requestAnimationFrame(draw);
}
function bindDirection(btn){
 const d=btn.dataset.gmMove;
 btn.addEventListener("pointerdown",e=>{e.preventDefault();touch.add(d);btn.setPointerCapture(e.pointerId)});
 for(const ev of ["pointerup","pointercancel","lostpointercapture"])btn.addEventListener(ev,()=>touch.delete(d));
}
document.querySelectorAll("[data-gm-move]").forEach(bindDirection);
const mapping={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
document.addEventListener("keydown",e=>{
 const editable=e.target instanceof HTMLElement&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName);
 if(editable)return;
 const k=mapping[e.key]||e.key.toLowerCase();
 if(["up","down","left","right","w","a","s","d"].includes(k)){keys.add(k);e.preventDefault();return}
 if(e.repeat||!room||room.status!=="playing"||!room.alive)return;
 if(k==="e"&&room.role==="good")doTask();
 if(k==="k"&&room.role==="evil")kill();
 if(k==="r")report();
 if(k==="h"&&room.canEmergency)action("emergency");
});
document.addEventListener("keyup",e=>keys.delete(mapping[e.key]||e.key.toLowerCase()));
window.addEventListener("blur",()=>{keys.clear();touch.clear()});
$("gmQuick").onclick=()=>enter("quick",{});
$("gmCreate").onclick=()=>enter("create",{visibility:"private"});
$("gmCreatePublic").onclick=()=>enter("create",{visibility:"public"});
$("gmJoin").onclick=()=>joinRoom($("gmJoinCode").value);
$("gmRefreshRooms").onclick=reloadRooms;
$("gmReady").onclick=()=>action("ready",{ready:!room.ready});
$("gmStart").onclick=()=>action("start");
$("gmLock").onclick=()=>action("lock",{locked:!room.locked});
$("gmLeave").onclick=async()=>{
 if(!room)return;
 try{await action("leave");const u=new URL(location.href);u.searchParams.delete("room");history.replaceState(null,"",u.href);reloadRooms()}catch(err){displayError(err)}
};
$("gmTask").onclick=doTask;$("gmKill").onclick=kill;$("gmReport").onclick=report;
$("gmEmergency").onclick=()=>action("emergency");
$("gmRematch").onclick=()=>action("rematch");
$("gmPuzzleClose").onclick=()=>{taskOpen=false;$("gmPuzzle").close()};
$("gmSend").onclick=async()=>{
 const input=$("gmChatText"),text=input.value.trim();if(!text)return;
 input.value="";await action("chat",{text});
};
$("gmChatText").addEventListener("keydown",e=>{if(e.key==="Enter"){$("gmSend").click();e.preventDefault()}});
$("gmCopy").onclick=async()=>{
 const u=new URL(location.href);u.searchParams.set("room",roomCode);
 try{await navigator.clipboard.writeText(u.href);status("Đã sao chép đường dẫn mời bạn.")}catch{status("Mã phòng: "+roomCode)}
};
$("gmFullscreen").onclick=()=>{
 if(!document.fullscreenElement)document.querySelector(".gm-stage-card")?.requestFullscreen?.().catch(()=>{});
 else document.exitFullscreen?.();
};
window.addEventListener("pagehide",()=>{keys.clear();touch.clear()});
window.addEventListener("popstate",()=>{});
setInterval(()=>{if(room)poll();else if(networkReady&&Date.now()-lastRoomListAt>12000)reloadRooms()},1100);
setInterval(step,240);
setInterval(()=>{
 if(!room)return;
 const now=Date.now()+serverOffset;
 $("gmTime").textContent=timer((room.status==="meeting"?room.meetingDeadline:
  room.status==="reveal"?room.revealDeadline:room.deadline)-now);
 $("gmMeetingTimer").textContent=timer((room.meetingDeadline||0)-now);
 if(room.role==="evil"&&room.status==="playing")$("gmKill").disabled=!room.alive||now<(room.killReadyAt||0);
},250);
requestAnimationFrame(draw);
probe();
