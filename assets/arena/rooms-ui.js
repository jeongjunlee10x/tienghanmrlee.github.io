/* Arena room controller: verified-G matching, code invites, public tables, ready flow,
   server-authoritative moves and short on-board overlays. */
import {roomRequest,normalizeRoomCode,GOLD_TIERS,GOLD_PER_POINT,formatG,requiredGold,
 GAME_LABELS,gameCapacity,affordableTier} from "./room-api.js";
import {mountOnlineCanvas} from "./rooms-play.js";
const $=id=>document.getElementById(id);
const el=(tag,cl="",text)=>{
 const node=document.createElement(tag);if(cl)node.className=cl;
 if(text!==undefined)node.textContent=String(text);return node;
};
const btn=(text,cl,handler)=>{
 const b=el("button",cl,text);b.type="button";if(handler)b.addEventListener("click",handler);return b;
};
const sections=["arenaRoomHub","arenaRoomLobby","arenaPvPBoard"];
export function mountArenaRooms({onEnter,onExit,onWallet}){
 let game="chess",mode="friends",room=null,account=null,poll=null,working=false,epoch=0;
 const canvas=mountOnlineCanvas($("roomGameCanvas"),move);
 const show=active=>sections.forEach(id=>$(id).hidden=id!==active);
 const name=()=>String($("roomNickname").value||"Học viên").trim().slice(0,24)||"Học viên";
 const status=(target,message,error=false)=>{
  const n=$(target);n.textContent=message||"";n.dataset.error=String(error);
 };
 const risk=stake=>requiredGold(game,stake);
 const gameName=()=>GAME_LABELS[game]||game;
 function stop(){
  epoch++;
  if(poll!==null){clearInterval(poll);poll=null;}
  room=null;working=false;canvas.clear();
  sections.forEach(id=>$(id).hidden=true);
 }
 function leaveUI(){
  stop();onExit();
 }
 async function refreshWallet(){
  const data=await roomRequest("wallet",{},"GET");
  account=data.wallet;
  $("arenaVerifiedGold").textContent=formatG(account.gold);
  $("roomVerifiedPoints").textContent=String(account.availablePoints||0);
  $("roomAvailableGold").textContent=formatG(account.gold);
  onWallet?.(account);
  const select=$("roomMinGold");
  for(const option of select.options){
   const stake=Number(option.value),minimum=risk(stake);
   option.textContent=formatG(stake)+" / lá · cần "+formatG(minimum)+" bảo đảm";
   option.disabled=account.gold<minimum;
  }
  if(!GOLD_TIERS.some(s=>risk(s)<=account.gold))select.selectedIndex=0;
  else if(select.selectedOptions[0].disabled)
   select.value=String(affordableTier(account.gold,game));
  return account;
 }
 async function withBusy(task){
  if(working)return;
  working=true;
  try{await task();}catch(error){
   const message=error?.message||"Máy chủ chưa phản hồi.";
   const id=$("arenaPvPBoard").hidden?$("arenaRoomLobby").hidden?"roomHubStatus":"roomLobbyStatus":"roomBoardStatus";
   status(id,message,true);
  }finally{working=false;}
 }
 function setTab(next){
  mode=next;
  document.querySelectorAll("[data-room-tab]").forEach(b=>{
   b.setAttribute("aria-selected",String(b.dataset.roomTab===next));
  });
  $("roomFriends").hidden=next!=="friends";
  $("roomBrowser").hidden=next!=="browse";
  if(next==="browse")void browse();
  if(next==="quick")void quick();
  if(next==="friends")status("roomHubStatus","Tạo bàn để lấy mã, hoặc nhập mã bạn bè.");
 }
 function openHub(selectedGame,nextMode="friends"){
  if(!(selectedGame in GAME_LABELS))return;
  stop();game=selectedGame;
  onEnter();show("arenaRoomHub");
  $("arenaRoomHubTitle").textContent=gameName()+" · Chọn chế độ";
  $("roomGamePill").textContent=gameName();
  status("roomHubStatus","Đang kiểm tra ví G...");
  const requested=nextMode;
  void withBusy(async()=>{
   await refreshWallet();
   if(requested==="quick"){
    // Complete the first quick action while UI remains responsive.
    mode="quick";document.querySelectorAll("[data-room-tab]").forEach(b=>b.setAttribute("aria-selected",
     String(b.dataset.roomTab==="quick")));
    $("roomFriends").hidden=true;$("roomBrowser").hidden=true;
    await quickAction();
   }else setTab(requested);
  });
 }
 async function browse(){
  if(game==="")return;
  status("roomHubStatus","Đang tải danh sách bàn...");
  const target=$("roomBrowserList");target.replaceChildren();
  try{
   await refreshWallet();
   const result=await roomRequest("list",{game},"GET");
   const listed=result.rooms||[];
   if(!listed.length){target.append(el("p","arena-room-help","Chưa có bàn công khai đang chờ. Bạn có thể tự tạo bàn."));}
   for(const item of listed){
    const row=el("div","arena-room-list-row"),info=el("div");
    info.append(el("strong","",item.host+" · "+item.code),
     el("small","",formatG(item.minGold)+"/lá · "+item.count+"/"+item.capacity+
       " người · cần "+formatG(requiredGold(game,item.minGold))));
    const enter=btn(item.alreadyIn?"Trở lại":"Vào bàn","arena-action",
      ()=>void withBusy(async()=>{await join(item.code);}));
    enter.disabled=!item.alreadyIn&&account.gold<requiredGold(game,item.minGold);
    row.append(info,enter);target.append(row);
   }
   status("roomHubStatus",listed.length+" bàn đang chờ");
  }catch(err){status("roomHubStatus",err.message,true);}
 }
 async function quickAction(){
  const lowest=requiredGold(game,5);
  if(!account||account.gold<lowest)
   throw new Error("Ví cần tối thiểu "+formatG(lowest)+". Hãy đổi điểm học tập xác minh sang G.");
  status("roomHubStatus","⚡ Đang tìm bàn phù hợp với "+formatG(account.gold)+"...");
  const result=await roomRequest("quick",{game,nickname:name()});
  acceptRoom(result.room);
 }
 async function quick(){await withBusy(async()=>{await refreshWallet();await quickAction();});}
 async function join(code){
  const normalized=normalizeRoomCode(code);
  if(!/^[A-Z2-9]{8}$/.test(normalized))throw new Error("Nhập mã gồm 8 ký tự.");
  status("roomHubStatus","Đang vào phòng "+normalized+"...");
  const response=await roomRequest("join",{code:normalized,nickname:name()});
  acceptRoom(response.room);
 }
 function acceptRoom(value){
  room=value;
  $("roomJoinCode").value=value.code;
  if(value.status==="waiting")drawLobby();
  else drawGame();
  if(poll!==null)clearInterval(poll);
  const snapshot=++epoch;
  poll=setInterval(()=>{
   if(epoch!==snapshot||!room||working)return;
   void pull().catch(err=>{
    if(epoch!==snapshot)return;
    status(room?.status==="waiting"?"roomLobbyStatus":"roomBoardStatus",err.message,true);
   });
  },2400);
 }
 async function pull(){
  if(!room)return;
  const value=await roomRequest("state",{code:room.code},"GET");
  if(!room||value.room.code!==room.code)return;
  if(value.room.version!==room.version||value.room.status!==room.status){
   room=value.room;
   if(room.status==="waiting")drawLobby();
   else if(room.status==="playing"||room.status==="finished")drawGame();
   else {status("roomBoardStatus","Trận đã đóng. Về sảnh để chơi ván mới.",true);}
  }
 }
 function drawLobby(){
  if(!room)return;
  show("arenaRoomLobby");
  $("roomLobbyCode").textContent=room.code;
  $("roomLobbyGame").textContent=gameName();
  $("roomLobbyGold").textContent=formatG(room.minGold)+"/lá · Bảo đảm "+formatG(room.requiredGold);
  $("roomLobbyCount").textContent=room.players.length+"/"+room.capacity+" người";
  const players=$("roomLobbyPlayers");players.replaceChildren();
  const mine=room.players.find(p=>p.seat===room.seat);
  for(let index=0;index<room.capacity;index++){
   const current=room.players.find(p=>p.seat===index);
   const block=el("div","arena-room-player"+(current?.ready?" ready":""));
   block.append(el("span","",current?"🧑":"◌"),
    el("strong","",current?.name||"Đang đợi..."),
    el("small","",current?(current.ready?"✓ Sẵn sàng":"Chưa sẵn sàng"):"Ghế "+(index+1)));
   players.append(block);
  }
  $("roomToggleReady").textContent=mine?.ready?"Bỏ sẵn sàng":"✓ Tôi đã sẵn sàng";
  status("roomLobbyStatus","Chờ "+(room.capacity-room.players.length)+
   " người nữa. Tất cả cần có đủ "+formatG(room.requiredGold)+" và nhấn sẵn sàng.");
 }
 function drawGame(){
  if(!room)return;
  show("arenaPvPBoard");
  $("roomBoardTitle").textContent=gameName()+" · "+(room.status==="finished"?"Kết thúc":"PvP trực tuyến");
  $("roomBoardCode").textContent=room.code;
  canvas.render(room);
  let message=room.status==="finished"?"Trận đã kết thúc. Kết quả được máy chủ xác nhận.":
   "Đã vào ván · "+formatG(room.minGold)+"/lá";
  status("roomBoardStatus",message);
  $("roomGameCanvas").querySelector(".arena-match-result")?.remove();
  if(room.status==="finished"&&room.settlement){
   const detail=room.settlement;
   const cardCount=detail.remaining?.[room.seat]||0;
   const winner=detail.winner===room.seat,drawn=detail.winner===-1;
   const loss=winner||drawn?0:room.game==="chess"?room.minGold:
    room.minGold*Math.min(cardCount,room.game==="colors"?20:13);
   const gain=winner?detail.remaining.reduce((sum,n,i)=>sum+(i===room.seat?0:
     room.minGold*(room.game==="chess"?1:Math.min(n,room.game==="colors"?20:13))),0):0;
   const node=el("div","arena-match-result"),headline=el("h2","",
     drawn?"🤝 HÒA":winner?"🏆 CHIẾN THẮNG":"💫 THUA VÁN");
   node.append(headline,el("p","",drawn?"Hoàn lại toàn bộ G đã giữ":
    winner?"+"+formatG(gain)+" vào ví G":
     "Còn "+cardCount+" lá · -"+formatG(loss)+" ("+formatG(room.minGold)+"/lá)"));
   const close=btn("Về sảnh","arena-action",()=>void leave());
   node.append(close);$("roomGameCanvas").append(node);
   void refreshWallet().catch(()=>{});
  }
 }
 async function move(action){
  if(!room||room.status!=="playing")return;
  const previous=room;
  try{
   const response=await roomRequest("move",{code:previous.code,version:previous.version,...action});
   if(!room||room.code!==previous.code)return;
   room=response.room;drawGame();
  }catch(error){
   status("roomBoardStatus",error.message,true);
   if(error.status===409)await pull();
   throw error;
  }
 }
 async function leave(){
  if(!room){leaveUI();return;}
  const value=room;
  if(value.status==="playing"&&!window.confirm(
   "Rời giữa ván sẽ hủy trận và hoàn G đã giữ cho mọi người. Bạn chắc chắn?"))return;
  await withBusy(async()=>{
   try{await roomRequest("leave",{code:value.code});}finally{leaveUI();}
  });
 }
 function tryInvite(){
  const params=new URLSearchParams(location.search);
  const code=normalizeRoomCode(params.get("room"));
  const requested=params.get("game");
  if(/^[A-Z2-9]{8}$/.test(code)&&requested in GAME_LABELS){
   openHub(requested,"friends");
   const wait=setInterval(()=>{
    if(!account)return;
    clearInterval(wait);
    $("roomJoinCode").value=code;
    void withBusy(async()=>join(code));
   },300);
   setTimeout(()=>clearInterval(wait),10000);
  }
 }
 document.querySelectorAll("[data-room-action]").forEach(node=>{
  node.addEventListener("click",()=>openHub(node.dataset.roomGame,node.dataset.roomAction));
 });
 document.querySelectorAll("[data-room-tab]").forEach(node=>
  node.addEventListener("click",()=>setTab(node.dataset.roomTab)));
 $("roomHubExit").addEventListener("click",leaveUI);
 $("roomLobbyExit").addEventListener("click",()=>void leave());
 $("roomBoardExit").addEventListener("click",()=>void leave());
 $("roomRefreshList").addEventListener("click",()=>void browse());
 $("roomJoin").addEventListener("click",()=>void withBusy(async()=>join($("roomJoinCode").value)));
 $("roomJoinCode").addEventListener("keydown",event=>{
  if(event.key==="Enter")$("roomJoin").click();
 });
 $("roomCreate").addEventListener("click",()=>void withBusy(async()=>{
  if(!account)await refreshWallet();
  const stake=Number($("roomMinGold").value);
  if(!GOLD_TIERS.includes(stake))throw new Error("Mức bàn G không hợp lệ.");
  if(account.gold<risk(stake))throw new Error("Cần "+formatG(risk(stake))+
   "G để vào bàn "+formatG(stake)+"/lá.");
  const result=await roomRequest("create",{
   game,nickname:name(),minGold:stake,visibility:$("roomPublic").checked?"public":"private"
  });
  acceptRoom(result.room);
 }));
 $("roomCopyCode").addEventListener("click",()=>void navigator.clipboard.writeText(room?.code||""));
 $("roomCopyLink").addEventListener("click",()=>{
  if(!room)return;
  const url=new URL(location.href);url.searchParams.set("room",room.code);url.searchParams.set("game",room.game);
  void navigator.clipboard.writeText(url.href);
 });
 $("roomToggleReady").addEventListener("click",()=>void withBusy(async()=>{
  if(!room)return;
  const mine=room.players.find(p=>p.seat===room.seat);
  const response=await roomRequest("ready",{code:room.code,ready:!mine?.ready});
  room=response.room;
  if(room.status==="waiting")drawLobby();else drawGame();
  await refreshWallet();
 }));
 $("roomLobbyRefresh").addEventListener("click",()=>void withBusy(pull));
 $("roomExchange").addEventListener("click",()=>void withBusy(async()=>{
  if(!account)await refreshWallet();
  const points=Number($("roomExchangePoints").value);
  if(!Number.isInteger(points)||points<1||points>10000)throw new Error("Nhập số điểm từ 1 đến 10.000.");
  if(points>account.availablePoints)throw new Error("Không đủ điểm học tập đã được máy chủ xác minh.");
  if(!window.confirm("Đổi "+points+" điểm Game Zone xác minh thành "+formatG(points*GOLD_PER_POINT)+
    "? Điểm học tập gốc không giảm, nhưng số điểm này không thể đổi thành G lần hai."))return;
  await roomRequest("convert",{points});
  await refreshWallet();
  status("roomHubStatus","Đã đổi "+points+" điểm thành "+formatG(points*10)+".");
 }));
 // A valid invitation link can deep-link into the hub; Firebase auth still gates API.
 tryInvite();
 return {openHub,stop,refreshWallet};
}
