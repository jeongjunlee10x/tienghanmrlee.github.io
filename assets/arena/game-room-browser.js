/* MR LEE game-room browser — real server-owned public waiting rooms only.
 * No fabricated seats, house names, active matches, wallets or opponent data.
 */
import {roomRequest,requiredGold,formatG,gameCapacity} from "./room-api.js?v=20261111-xq-pvp-v1";
const GAMES=Object.freeze({
 colors:{label:"Bài Màu Đại Chiến",page:"game-bai-mau.html",icon:"🃏"},
 chess:{label:"Cờ Vua",page:"game-co-vua.html",icon:"♟️"},
 xiangqi:{label:"Cờ Tướng / Cờ Úp",page:"game-co-tuong.html",icon:"♜"},
 tienlen:{label:"Tiến Lên Miền Nam",page:"game-tien-len.html",icon:"🂡"}
});
const $=id=>document.getElementById(id);
const mk=(tag,cls="",value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=String(value);return x;};
const params=new URL(location.href).searchParams,game=params.get("game");
const selected=GAMES[game];
if(!selected){
 const status=$("browserStatus");status.textContent="Chế độ chọn bàn hỗ trợ Bài Màu, Cờ Vua, Cờ Tướng/Cờ Úp và Tiến Lên.";
 document.querySelector(".room-browser-main").hidden=true;
 const alert=mk("p","room-browser-error","Trò chơi không hỗ trợ danh sách bàn PvP. Vui lòng quay về Game Arena.");
 document.querySelector(".room-browser-shell").append(alert);
}else{
 document.documentElement.dataset.browserGame=game;
 $("browserGameName").textContent=selected.label;
 $("browserTitle").textContent=selected.label+" · Chọn bàn";
 const backUrl=new URL(selected.page,location.href).pathname.split("/").pop();
 for(const id of ["browserBack","browserGameReturn"])$(id).href=backUrl;
 $("browserNewRoom").href=backUrl+"?popup=create";
 $("browserCreate").addEventListener("click",()=>location.assign(backUrl+"?popup=create"));
 $("browserQuick").addEventListener("click",()=>location.assign(backUrl+"?mode=quick"));
 const selectedFilter={value:"all"};
 let wallet=null,rooms=[],pending=false,requestId=0;
 const fmtAmount=n=>Math.round(Number(n)||0).toLocaleString("vi-VN");
 const nickname=()=>($("browserPlayer").textContent||"Học viên").trim().slice(0,24)||"Học viên";
 async function account(){
  try{
   const data=await roomRequest("wallet",{},"GET");
   wallet=data.wallet;
   $("browserGold").textContent=fmtAmount(wallet.gold)+"G";
   $("browserPoints").textContent=fmtAmount(wallet.availablePoints??0);
   render();
  }catch(error){
   $("browserGold").textContent="—";$("browserPoints").textContent="—";
   $("browserStatus").textContent=error?.message||"Không thể xác minh ví G.";
  }
 }
 function render(){
  const target=$("browserRooms");target.replaceChildren();
  // API only returns public, unexpired, waiting rooms with at least one vacant seat.
  // Therefore all three tabs can legitimately show the same set of rooms.
  const visible=rooms.filter(r=>selectedFilter.value==="all"||
   selectedFilter.value==="open"&&r.count<r.capacity||
   selectedFilter.value==="waiting"&&r.status==="waiting");
  const count=$("browserRoomCount");count.textContent=rooms.length+" bàn công khai đang chờ";
  const makeCard=mk("a","room-browser-tile room-browser-new");
  makeCard.href=backUrl+"?popup=create";makeCard.setAttribute("aria-label","Tạo bàn mới");
  makeCard.append(mk("span","room-browser-tile-graphic","＋"),mk("strong","","Tạo bàn mới"),
   mk("small","","Chọn mức G và mời bạn bè"));
  target.append(makeCard);
  if(!visible.length){
   const empty=mk("div","room-browser-empty");
   empty.append(mk("strong","","Chưa có bàn công khai đang chờ."),
    mk("p","","Bạn có thể tạo bàn mới, chơi nhanh, hoặc vào phòng riêng tư bằng mã bạn bè gửi."));
   const joinLink=mk("a","room-browser-join-link","Nhập mã vào bàn");
   joinLink.href=backUrl+"?popup=join";empty.append(joinLink);target.append(empty);
  }
  for(const item of visible){
   const tier=Number(item.minGold),needed=requiredGold(game,tier);
   const hasGold=!!wallet&&wallet.gold>=needed;
   const canEnter=item.alreadyIn||hasGold;
   const card=mk("article","room-browser-tile room-browser-table");
   card.dataset.roomCode=item.code;
   const art=mk("div","room-browser-table-art");
   const chip=mk("span","room-browser-stake","🪙 "+formatG(tier));
   const table=mk("div","room-browser-board-icon");
   const player=mk("span","room-browser-players-icon","👤 "+item.count+"/"+item.capacity);
   if(!canEnter){card.classList.add("room-browser-locked");table.append(mk("span","room-browser-padlock","🔒"));}
   art.append(chip,table,player);
   const title=mk("strong","room-browser-host",String(item.host||"Học viên").slice(0,36));
   const info=mk("small","room-browser-table-meta",formatG(tier)+(["chess","xiangqi"].includes(game)?"/ván":"/lá")+" · Bảo đảm "+formatG(needed));
   const action=mk("button","room-browser-enter",item.alreadyIn?"TRỞ LẠI BÀN":canEnter?"VÀO BÀN":"THIẾU G");
   action.type="button";action.disabled=!canEnter;
   action.setAttribute("aria-label",item.alreadyIn?"Quay về phòng "+item.code:"Vào phòng của "+title.textContent+" "+formatG(tier));
   action.addEventListener("click",()=>void enter(item,action));
   card.append(art,title,info,action);target.append(card);
  }
  if(!pending)$("browserStatus").textContent=visible.length+" bàn đang chờ · chỉ hiển thị phòng công khai còn ghế · cập nhật khi nhấn Làm mới.";
 }
 async function refresh(){
  if(pending)return;
  pending=true;$("browserRefresh").disabled=true;
  $("browserStatus").textContent="Đang tải phòng công khai từ máy chủ...";
  const token=++requestId;
  try{
   const response=await roomRequest("list",{game},"GET");
   if(token!==requestId)return;
   rooms=Array.isArray(response.rooms)?response.rooms.filter(r=>
    r.game===game&&r.status==="waiting"&&Number(r.count)<Number(r.capacity)):[];render();
  }catch(error){
   $("browserStatus").textContent=error?.message||"Chưa kết nối được danh sách phòng.";
  }finally{pending=false;$("browserRefresh").disabled=false;}
 }
 async function enter(room,button){
  if(pending)return;
  if(!room.alreadyIn&&wallet&&wallet.gold<requiredGold(game,room.minGold))return;
  button.disabled=true;button.textContent="ĐANG VÀO...";
  $("browserStatus").textContent="Đang vào bàn "+room.code+"...";
  try{
   const result=await roomRequest("join",{code:room.code,nickname:nickname()});
   if(result.room?.game!==game)throw new Error("Mã bàn thuộc trò chơi khác.");
   const url=new URL(selected.page,location.href);
   url.searchParams.set("room",result.room.code);
   location.assign(url.href);
  }catch(error){
   $("browserStatus").textContent=error?.message||"Không thể vào phòng.";
   button.disabled=false;button.textContent="VÀO BÀN";
   void refresh();
  }
 }
 document.querySelectorAll("[data-browser-filter]").forEach(b=>{
  b.addEventListener("click",()=>{
   selectedFilter.value=b.dataset.browserFilter;
   for(const a of document.querySelectorAll("[data-browser-filter]"))
    a.setAttribute("aria-pressed",String(a===b));
   render();
  });
 });
 $("browserRefresh").addEventListener("click",()=>void refresh());
 async function setUser(){
  try{
   const [{getApps},{getAuth}]=await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")
   ]);
   const instance=getApps()[0];if(!instance)return;
   const auth=getAuth(instance);if(typeof auth.authStateReady==="function")await auth.authStateReady();
   const user=auth.currentUser;
   if(!user?.emailVerified)return;
   $("browserPlayer").textContent=(user.displayName||user.email?.split("@")[0]||"Học viên").slice(0,32);
   if(/^https:\/\//.test(user.photoURL||"")){
    const avatar=document.querySelector(".room-browser-avatar");
    const image=mk("img");image.src=user.photoURL;image.alt="";image.loading="lazy";
    image.onerror=()=>image.remove();avatar.replaceChildren(image);
   }
  }catch{}
 }
 void setUser();void account();void refresh();
 window.addEventListener("focus",()=>{void account();void refresh();});
 document.addEventListener("visibilitychange",()=>{
  if(!document.hidden){void account();void refresh();}
 });
}
