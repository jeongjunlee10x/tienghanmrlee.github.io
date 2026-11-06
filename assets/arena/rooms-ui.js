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
 let game="chess",mode="friends",room=null,account=null,poll=null,working=false,epoch=0,serverClockOffset=0;
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
  // Waiting is an in-table state, not a separate lobby screen.
  show("arenaPvPBoard");
  $("roomBoardTitle").textContent=gameName()+" · Đang chờ "+room.players.length+"/"+room.capacity;
  $("roomBoardCode").textContent=room.code;
  $("roomLobbyCode").textContent=room.code;
  $("roomLobbyGame").textContent=gameName();
  $("roomLobbyGold").textContent=formatG(room.minGold)+"/lá · Bảo đảm "+formatG(room.requiredGold);
  $("roomLobbyCount").textContent=room.players.length+"/"+room.capacity+" người";
  const mine=room.players.find(p=>p.seat===room.seat);
  $("roomToggleReady").textContent=mine?.ready?"Bỏ sẵn sàng":"✓ Tôi đã sẵn sàng";
  canvas.waiting(room,{
   ready:()=>$("roomToggleReady").click(),
   lock:()=>void withBusy(async()=>{
    if(!room?.isHost)throw Error("Chỉ chủ bàn được khóa hoặc mở khóa.");
    const response=await roomRequest("lock",{code:room.code,locked:!room.locked});
    room=response.room;drawLobby();
   }),
   start:()=>void withBusy(async()=>{
    if(!room?.isHost||room.game!=="tienlen")throw Error("Chỉ chủ bàn Tiến Lên mới bắt đầu được.");
    const response=await roomRequest("start",{code:room.code});
    room=response.room;
    if(room.status==="playing")drawGame();else drawLobby();
    await refreshWallet();
   }),
   copy:()=>void navigator.clipboard?.writeText(room.code).catch(e=>
    status("roomBoardStatus",e?.message||"Không sao chép được mã.",true)),
   invite:()=>void navigator.clipboard?.writeText(new URL(({
    chess:"game-co-vua.html",tienlen:"game-tien-len.html",colors:"game-bai-mau.html"
   })[room.game]+"?room="+room.code,location.href).href).catch(e=>
    status("roomBoardStatus",e?.message||"Không sao chép được liên kết.",true)),
   refresh:()=>void withBusy(pull)
  });
  status("roomBoardStatus",room.locked?"🔒 Chủ bàn đã khóa. Người đang ngồi vẫn có thể chơi.":
   room.game==="tienlen"?"Từ 2 người có thể chơi: mọi người Sẵn sàng, chủ bàn Bắt đầu.":
   "Chờ mọi người sẵn sàng để bắt đầu ván.");
 }
 function drawGame(){
  if(!room)return;
  if(room.serverTime)serverClockOffset=Date.parse(room.serverTime)-Date.now();
  show("arenaPvPBoard");
  $("roomBoardTitle").textContent=gameName()+" · "+(room.status==="finished"?"Kết thúc · Đợi ván sau":"Đang đấu PvP");
  $("roomBoardCode").textContent=room.code;
  canvas.render(room);
  if(room.game==="tienlen"&&room.status==="playing"&&room.gameState?.turnDeadline){
   const hud=el("div","arena-turn-clock");hud.id="roomTurnClock";
   hud.setAttribute("role","timer");hud.setAttribute("aria-label","Thời gian còn lại trong lượt đánh");
   $("roomGameCanvas").append(hud);
  }
  status("roomBoardStatus",room.status==="finished"?"Ván đã được máy chủ kết toán G; xem bài và chọn Tiếp tục.":
   "Đang chơi ván "+(room.roundIndex||1)+" · "+formatG(room.minGold)+"/lá");
  $("roomGameCanvas").querySelector(".arena-next-round-dialog")?.remove();
  if(room.status!=="finished"||!room.settlement)return;
  const detail=room.settlement,remaining=detail.remaining||[];
  const cardCount=remaining[room.seat]||0;
  const winner=detail.winner===room.seat,drawn=detail.winner===-1;
  const loss=winner||drawn?0:room.game==="chess"?room.minGold:
   room.minGold*Math.min(cardCount,room.game==="colors"?20:13);
  const gain=winner?remaining.reduce((sum,n,i)=>sum+(i===room.seat?0:
   room.minGold*(room.game==="chess"?1:Math.min(n,room.game==="colors"?20:13))),0):0;
  const dialog=el("div","arena-next-round-dialog");
  dialog.setAttribute("role","dialog");dialog.setAttribute("aria-label","Kết quả ván và tiếp tục");
  dialog.append(el("h2","",drawn?"🤝 HÒA":winner?"🏆 BẠN THẮNG!":"💫 KẾT THÚC VÁN"),
   el("p","arena-next-round-score",drawn?"Đã hoàn G giữ cược":
    winner?"+"+formatG(gain)+" vào ví G":
    "Còn "+cardCount+" lá · -"+formatG(loss)));
  const revealed=room.gameState?.revealedHands;
  if(Array.isArray(revealed)&&room.game!=="chess"){
   const reveal=el("div","arena-next-round-reveal");
   reveal.append(el("h3","","🃏 BÀI CÒN LẠI CỦA MỌI NGƯỜI"));
   const grid=el("div","arena-next-round-hands");
   room.players.forEach(player=>{
    const section=el("section","arena-next-round-player");
    section.append(el("strong","",player.name+" · "+(revealed[player.seat]?.length||0)+" lá"));
    const cards=el("div","arena-next-round-cards");
    (revealed[player.seat]||[]).forEach(card=>{
     if(room.game==="tienlen"){
      const label=(card.rank===15?"2":card.rank===14?"A":card.rank===13?"K":
       card.rank===12?"Q":card.rank===11?"J":String(card.rank))+
       ["♠","♣","♦","♥"][card.suit];
      cards.append(el("span","arena-next-round-card"+(card.suit>=2?" red":""),label));
     }else{
      const label=card?.value??card?.symbol??"🃏";
      cards.append(el("span","arena-next-round-card color",String(label)));
     }
    });
    if(!cards.children.length)cards.append(el("span","arena-next-round-empty","Đã hết bài"));
    section.append(cards);grid.append(section);
   });
   reveal.append(grid);dialog.append(reveal);
  }
  const confirmed=room.players.filter(p=>p.continueReady).length;
  dialog.append(el("p","arena-next-round-count",confirmed+"/"+room.players.length+
   " người đã nhấn Tiếp tục"));
  const myVote=room.players.find(p=>p.seat===room.seat)?.continueReady;
  const next=btn(myVote?"✓ ĐÃ XÁC NHẬN · ĐỢI NGƯỜI KHÁC":"▶ TIẾP TỤC","arena-next-round-confirm",()=>void withBusy(async()=>{
   if(!room||room.status!=="finished")return;
   const result=await roomRequest("continue",{code:room.code,version:room.version});
   room=result.room;drawGame();
   await refreshWallet();
  }));
  next.disabled=!!myVote;
  dialog.append(next,el("small","arena-next-round-help",
   "Khi tất cả nhấn Tiếp tục, bàn sẽ tự chia bài ván sau, không về sảnh."));
  $("roomGameCanvas").append(dialog);
  void refreshWallet().catch(()=>{});
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
 // The display is informational. Only the verified Supabase Edge Function
 // decides when a turn expires and performs the legal automatic action.
 setInterval(()=>{
  const node=$("roomTurnClock");
  if(!node||!room||room.game!=="tienlen"||room.status!=="playing")return;
  const deadline=Date.parse(room.gameState?.turnDeadline||"");
  if(!Number.isFinite(deadline)){node.textContent="⏱ Đang đồng bộ...";return;}
  const seconds=Math.max(0,Math.ceil((deadline-Date.now()-serverClockOffset)/1000));
  node.textContent="⏱ "+seconds+"s"+(seconds===0?" · Đang tự xử lý...":"");
  node.classList.toggle("urgent",seconds<=5);
 },200);
 // A valid invitation link can deep-link into the hub; Firebase auth still gates API.
 tryInvite();
 return {openHub,stop,refreshWallet};
}
