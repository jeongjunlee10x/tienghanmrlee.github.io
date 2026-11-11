/* Original MR LEE same-origin embedded Arena bridge.
 * No rules copied; existing controller mounts, then initiates the selected mode.
 * Parent may request exit, but actual PvP leave + escrow release stays on server.
 */
const params=new URL(location.href).searchParams;
if(params.get("embed")==="1"&&window.parent!==window){
 const ids={colors:"arenaTable",chess:"arenaChess",tienlen:"arenaTienLen",
  ludo:"arenaLudo",xiangqi:"arenaXiangqi",estate:"arenaEstate"};
 const game=params.get("game"),mode=params.get("mode");
 const online=["colors","chess","xiangqi","tienlen"].includes(game);
 const supported=game in ids&&(
  mode==="bot"||online&&["quick","friends","browse"].includes(mode));
 const marker="mrlee-game-room";
 const send=(event,message)=>{
  window.parent.postMessage({marker,event,game,message},location.origin);
 };
 // The embedded board shares its parent game's exact cover image.
 if(game in ids)document.documentElement.style.setProperty("--arena-cover",'url("assets/arena/covers/'+game+'.svg")');
 const lobby=document.getElementById("arenaLobby");
 let launched=false,hasGoneIn=false,attempted=false;
 const active=()=>[...Object.values(ids),"arenaRoomHub","arenaRoomLobby","arenaPvPBoard"]
  .some(id=>{const el=document.getElementById(id);return el&&!el.hidden;});
 function checkState(){
  if(!launched)return;
  const inGame=active();
  if(inGame&&!hasGoneIn){
   hasGoneIn=true;send("started");
  }else if(hasGoneIn&&lobby&&!lobby.hidden&&!inGame){
   hasGoneIn=false;send("returned");
  }
 }
 function boot(){
  if(attempted||document.documentElement.dataset.arenaAppReady!=="1")return;
  attempted=true;
  if(!supported){send("error","Trò chơi hoặc chế độ không được hỗ trợ.");return;}
  const invite=String(params.get("room")||"").trim().toUpperCase();
  if(/^[A-Z2-9]{8}$/.test(invite)&&online){
   // rooms-ui.tryInvite already opened the correct room.
   launched=true;checkState();return;
  }
  const selector=mode==="bot"?
   '#arenaCatalog [data-game="'+game+'"]':
   '#arenaCatalog [data-room-action="'+mode+'"][data-room-game="'+game+'"]';
  const control=document.querySelector(selector);
  if(!control){send("error","Không tìm thấy nút vào bàn của trò chơi.");return;}
  launched=true;
  // Existing real click handler starts bot / PvP; no parallel game logic.
  control.click();
  checkState();
  setTimeout(checkState,180);
 }
 // A broken game engine or blocked module must be visible to the parent;
 // it must never strand the player behind a blank loading screen forever.
 window.addEventListener("error",event=>{
  if(!hasGoneIn)send("error","Bàn chơi gặp lỗi khởi động. Hãy bấm Thử lại.");
 });
 window.addEventListener("unhandledrejection",()=>{
  if(!hasGoneIn)send("error","Chưa tải đủ dữ liệu trò chơi. Hãy bấm Thử lại.");
 });
 setTimeout(()=>{
  if(!hasGoneIn){
   send("error",document.documentElement.dataset.arenaAppReady==="1"?
    "Bàn chơi chưa xuất hiện. Hãy thử mở lại.":
    "Không thể khởi tạo bộ luật trò chơi. Hãy bấm Thử lại.");
  }
 },10500);
 window.addEventListener("mrlee:arena-ready",boot);
 if(document.documentElement.dataset.arenaAppReady==="1")boot();
 if(lobby)new MutationObserver(checkState).observe(lobby,{attributes:true,attributeFilter:["hidden"]});
 for(const id of Object.values(ids).concat(["arenaRoomHub","arenaRoomLobby","arenaPvPBoard"])){
  const section=document.getElementById(id);
  if(section)new MutationObserver(checkState).observe(section,{attributes:true,attributeFilter:["hidden"]});
 }
 window.addEventListener("message",event=>{
  if(event.origin!==location.origin||event.source!==window.parent)return;
  if(event.data?.marker!==marker||event.data.command!=="leave")return;
  const buttons=[
   ["arenaPvPBoard","roomBoardExit"],["arenaRoomLobby","roomLobbyExit"],["arenaRoomHub","roomHubExit"],
   ["arenaTable","arenaExit"],["arenaChess","chessExit"],["arenaTienLen","tlExit"],
   ["arenaLudo","ludoExit"],["arenaXiangqi","xqExit"],["arenaEstate","estateExit"]
  ];
  const found=buttons.find(([id])=>!document.getElementById(id)?.hidden);
  const button=found&&document.getElementById(found[1]);
  if(button)button.click();
  else if(hasGoneIn)send("error","Không tìm thấy nút rời bàn. Vui lòng thoát ngay trong game.");
  else send("returned");
 });
 // The child is the inviter. Share a link to this game's dedicated page.
 const copy=document.getElementById("roomCopyLink");
 const page={
  colors:"game-bai-mau.html",chess:"game-co-vua.html",tienlen:"game-tien-len.html"
 }[game];
 if(copy&&page){
  // Intercept this single action in capture phase; preserve room code and
  // keep private invitation on the same origin without leaking auth tokens.
  copy.addEventListener("click",event=>{
   const code=document.getElementById("roomLobbyCode")?.textContent?.trim()||"";
   if(!/^[A-Z2-9]{8}$/.test(code))return;
   event.stopImmediatePropagation();
   const url=new URL(page,location.href);
   url.searchParams.set("room",code);
   void navigator.clipboard.writeText(url.href);
  },true);
 }
}
