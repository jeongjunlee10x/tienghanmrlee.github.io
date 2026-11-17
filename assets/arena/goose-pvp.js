/* MR LEE Goose Mystery PvP client — snapshots only; all rules live on Supabase Edge.
   Never trust, transmit or store opponent roles or gold in the browser. */
import {firebaseConfig,isFirebaseConfigured} from "../../firebase-config.js";
import {WORLD,getMap} from "./goose-maps.mjs";
const ENDPOINT="https://pkxqsboyotlyoizzxizb.supabase.co/functions/v1/mrlee-goose-pvp";
const $=id=>document.getElementById(id);
const COLORS=["#79e7f7","#ffdc8a","#fe9bc7","#b7a2fc","#89ebbb","#ff9b6a","#dfe3fb","#edb38d","#f79be5","#85daf7","#b2d47f","#ffdaae","#c3b9f6","#86beeb","#ffb7b0","#d7e6cc"];
const keys=new Set(),touch=new Set(),lerps=new Map();
const MAP=$("gmMap"),ctx=MAP.getContext("2d");
let room=null,roomCode="",networkReady=false,authSdk=null,authPromise=null;
let pollInFlight=false,moveInFlight=false,actionInFlight=false,taskOpen=false,serverOffset=0;
let lastError="",lastRoomListAt=0,connectPending=false;
const CAMERA_ZOOM=1.45;
const camera={x:WORLD.width/2,y:WORLD.height/2,mapId:null};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
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
 if(camera.mapId!==view.mapId&&view.mapId){
  camera.mapId=view.mapId;
  const own=view.players?.find(p=>p.seat===view.seat);
  if(own?.x!==undefined){camera.x=own.x;camera.y=own.y}
  lerps.clear();
 }
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
 return room.players.filter(p=>p.seat!==room.seat&&p.visible&&p.alive&&!p.left)
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
  const marker=p.alive===true?"🪿 ":p.alive===false?"💀 ":"❔ ";
  const div=makeText("div",marker+p.name+(p.seat===room.seat?" (Bạn)":"")+
   (room.status==="finished"?" · "+(p.role==="evil"?"Phá hoại":"Phe tốt"):""),"gm-compact-player");
  el.append(div);
 }
}
function renderBallot(){
 const box=$("gmBallot");box.replaceChildren();
 if(room.status!=="meeting")return;
 // Everyone alive can be voted on, not only players in local visual range.
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
 $("gmPuzzleTitle").textContent="⚙ "+(getMap(room.mapId).stations[p.station]?.name||"Nhiệm vụ");
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
 $("gmPlayerCount").textContent=(room.aliveCount===null?"?":room.aliveCount)+" / "+room.players.length+" còn sống";
 $("gmMapName").textContent="🗺 "+(room.mapName||getMap(room.mapId).name)+" · Camera theo nhân vật";
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
 const near=nearestPlayers()[0];if(!near||near.d>WORLD.killRange)return status("Bạn chưa đứng đủ gần nhân vật nào.");
 await action("kill",{seat:near.p.seat});
}
async function report(){
 const me=myPlayer();
 if(!me)return;
 const body=(room.bodies||[]).find(b=>dist(me,b)<90);
 if(!body||dist(me,body)>WORLD.reportRange)return status("Không phát hiện thi thể trong tầm báo cáo.");
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
function drawWorld(map,left,top,right,bottom){
 floorFill(left,top,right-left,bottom-top,map.colors.floor);
 ctx.strokeStyle="#ffffff12";ctx.lineWidth=1;
 for(let x=Math.floor(left/64)*64;x<=right;x+=64)
  for(let y=Math.floor(top/64)*64;y<=bottom;y+=64)ctx.strokeRect(x,y,64,64);
 for(const [x,y,w,h,label] of map.zones){
  if(x+w<left||x>right||y+h<top||y>bottom)continue;
  ctx.fillStyle=map.colors.zone;ctx.beginPath();ctx.roundRect(x,y,w,h,22);ctx.fill();
  ctx.strokeStyle=map.colors.border+"9a";ctx.lineWidth=3;ctx.stroke();
  ctx.textAlign="left";ctx.font="bold 17px system-ui";ctx.fillStyle="#e6faffad";
  ctx.fillText(label,x+16,y+31);
  ctx.fillStyle="#ffffff13";
  for(let rx=x+30;rx<x+w-20;rx+=130)ctx.fillRect(rx,y+h-34,42,8);
 }
 for(const w of map.walls){
  if(w.x+w.w<left||w.x>right||w.y+w.h<top||w.y>bottom)continue;
  floorFill(w.x,w.y,w.w,w.h,"#56758d");
  floorFill(w.x+3,w.y+3,w.w-6,Math.min(7,w.h-4),"#b2ecf9");
 }
 ctx.strokeStyle=map.colors.border;ctx.lineWidth=9;ctx.strokeRect(46,46,WORLD.width-92,WORLD.height-92);
}
function drawMiniMap(map,person){
 const x=765,y=15,w=178,h=113;
 ctx.fillStyle="#061b32e8";ctx.beginPath();ctx.roundRect(x,y,w,h,12);ctx.fill();
 ctx.strokeStyle=map.colors.border;ctx.lineWidth=2;ctx.stroke();
 const scale=Math.min((w-14)/WORLD.width,(h-13)/WORLD.height);
 const ox=x+(w-WORLD.width*scale)/2,oy=y+(h-WORLD.height*scale)/2;
 ctx.fillStyle="#447890b3";
 for(const zone of map.zones){ctx.fillRect(ox+zone[0]*scale,oy+zone[1]*scale,zone[2]*scale,zone[3]*scale)}
 // Only own position is revealed; the minimap never displays opponents or hidden bodies.
 if(person?.x!==undefined){
  ctx.fillStyle="#ffe981";ctx.beginPath();ctx.arc(ox+person.x*scale,oy+person.y*scale,4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#ffe98199";ctx.lineWidth=2;ctx.stroke();
 }
 ctx.font="bold 10px system-ui";ctx.fillStyle="#ddf9ff";ctx.textAlign="left";ctx.fillText("BẢN ĐỒ",x+12,y+13);
}
function draw(){
 if(!ctx){requestAnimationFrame(draw);return}
 ctx.setTransform(1,0,0,1,0,0);
 ctx.clearRect(0,0,960,610);
 ctx.fillStyle="#061a30";ctx.fillRect(0,0,960,610);
 const map=getMap(room?.mapId||"orbital");
 const me=isMatch()?myPlayer():null;
 if(me&&Number.isFinite(me.x)&&Number.isFinite(me.y)){
  camera.x+=(me.x-camera.x)*.17;
  camera.y+=(me.y-camera.y)*.17;
 }
 const vw=960/CAMERA_ZOOM,vh=610/CAMERA_ZOOM;
 const left=clamp(camera.x-vw/2,0,WORLD.width-vw);
 const top=clamp(camera.y-vh/2,0,WORLD.height-vh);
 ctx.save();ctx.scale(CAMERA_ZOOM,CAMERA_ZOOM);ctx.translate(-left,-top);
 drawWorld(map,left,top,left+vw,top+vh);
 if(room&&isMatch()){
  const pulse=Math.sin(performance.now()*.003)*3;
  const tasks=room.tasks||[];
  for(const task of tasks){
   if(task.x<left-45||task.x>left+vw+45||task.y<top-45||task.y>top+vh+45)continue;
   ctx.beginPath();ctx.arc(task.x,task.y,24+pulse,0,Math.PI*2);
   ctx.fillStyle=task.done?"#468a6670":"#25c8a080";ctx.fill();
   ctx.strokeStyle=map.colors.accent;ctx.lineWidth=3;ctx.stroke();
   ctx.textAlign="center";ctx.font="bold 21px system-ui";ctx.fillStyle="#fff";
   ctx.fillText(task.done?"✓":"⚙",task.x,task.y+7);
  }
  for(const body of room.bodies||[]){
   if(body.x<left-40||body.x>left+vw+40||body.y<top-40||body.y>top+vh+40)continue;
   ctx.font="26px system-ui";ctx.textAlign="center";ctx.fillText("💀",body.x,body.y+8);
  }
  for(const p of room.players.filter(p=>p.visible&&p.alive&&!p.left&&Number.isFinite(p.x)&&Number.isFinite(p.y))){
   const prev=lerps.get(p.seat)||{x:p.x,y:p.y};
   prev.x+=(p.x-prev.x)*.36;prev.y+=(p.y-prev.y)*.36;
   lerps.set(p.seat,prev);
   if(prev.x>=left-45&&prev.x<=left+vw+45&&prev.y>=top-55&&prev.y<=top+vh+45)
    drawGoose(p,prev.x,prev.y);
  }
 }
 ctx.restore();
 // Vignette limits vision even when a large map can fit in the canvas.
 const centerX=(camera.x-left)*CAMERA_ZOOM;
 const centerY=(camera.y-top)*CAMERA_ZOOM;
 const fog=ctx.createRadialGradient(centerX,centerY,105,centerX,centerY,WORLD.vision*CAMERA_ZOOM+35);
 fog.addColorStop(0,"#020b1d00");fog.addColorStop(.62,"#020b1d18");
 fog.addColorStop(1,"#020b1df7");
 ctx.fillStyle=fog;ctx.fillRect(0,0,960,610);
 drawMiniMap(map,me);
 ctx.font="bold 14px system-ui";ctx.fillStyle="#e6f9ff";ctx.textAlign="left";
 ctx.fillText(map.name+"  ·  Tầm nhìn gần",17,31);
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
