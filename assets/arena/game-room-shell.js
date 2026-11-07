/* MR LEE standalone room menus: existing Arena engines run in a same-origin iframe.
 * G/points are read exclusively from the Firebase-verified Arena Edge API.
 */
import {roomRequest,formatG} from "./room-api.js";
import {mountArenaFriendPopup} from "./game-room-social.js?v=20261106-chess-r7";
const $=id=>document.getElementById(id);
const GAME_PAGES=Object.freeze({
 colors:{name:"Bài Màu Đại Chiến",online:true,description:"Trò chơi sắc màu bốn người"},
 chess:{name:"Cờ Vua",online:true,description:"Bàn cờ chiến thuật hai người"},
 tienlen:{name:"Tiến Lên Miền Nam",online:true,description:"Đánh bài bốn người"},
 ludo:{name:"Cờ Cá Ngựa",online:false,description:"Lắc xúc xắc, đưa ngựa về đích"},
 xiangqi:{name:"Cờ Tướng / Cờ Úp",online:false,description:"Chiến thuật và bày binh bố trận"},
 estate:{name:"Địa Ốc Đại Chiến",online:false,description:"Xây dựng và mua bán bất động sản ảo"}
});
const game=document.documentElement.dataset.roomGame,current=GAME_PAGES[game];
const portraitBoard=!["tienlen","colors"].includes(game);
document.documentElement.dataset.roomLayout=portraitBoard?"portrait":"landscape";
const CHESS_TIMES=[
 ["1+0","Bullet · 1 phút"],["2+1","Bullet · 2 phút + 1 giây"],
 ["3+0","Blitz · 3 phút"],["3+2","Blitz · 3 phút + 2 giây"],
 ["5+0","Blitz · 5 phút"],["5+3","Blitz · 5 phút + 3 giây"],
 ["10+0","Rapid · 10 phút"],["10+5","Rapid · 10 phút + 5 giây"],
 ["15+10","Rapid · 15 phút + 10 giây"],["30+0","Rapid · 30 phút"],
 ["none","Luyện tập · không đồng hồ"]
];
let chessTimeSelect=null;
if(game==="chess"){
 const box=document.createElement("label");box.className="room-chess-time-picker";
 const title=document.createElement("span");title.textContent="♟ CHỌN THỜI GIAN CỜ VUA";
 chessTimeSelect=document.createElement("select");chessTimeSelect.id="roomChessTime";
 for(const [value,label] of CHESS_TIMES)chessTimeSelect.append(new Option(label,value));
 const cached=localStorage.getItem("mrlee.chess.time");
 chessTimeSelect.value=CHESS_TIMES.some(x=>x[0]===cached)?cached:"10+0";
 chessTimeSelect.addEventListener("change",()=>{
  localStorage.setItem("mrlee.chess.time",chessTimeSelect.value);
  document.getElementById("roomQuickCaption").textContent="Ghép bàn "+chessTimeSelect.value+" · đúng thời gian";
 });
 box.append(title,chessTimeSelect);
 const menu=document.getElementById("roomMenu");menu.parentElement.insertBefore(box,menu);
}
const LOCAL_GAME_MODES={
 xiangqi:{param:"variant",label:"♜ CHỌN LOẠI CỜ",default:"xiangqi",
  choices:[["xiangqi","Cờ Tướng tiêu chuẩn"],["up","Cờ Úp"]]},
 ludo:{param:"players",label:"🐴 SỐ NGƯỜI CHƠI",default:"4",
  choices:[["2","2 người · đối kháng"],["3","3 người · chiến thuật"],["4","4 người · đại chiến"]]},
 estate:{param:"rounds",label:"🏙️ THỜI LƯỢNG TRẬN",default:"16",
  choices:[["8","8 vòng · nhanh"],["16","16 vòng · tiêu chuẩn"],["24","24 vòng · dài"]]}
};
let localModeSelect=null;
if(LOCAL_GAME_MODES[game]){
 const config=LOCAL_GAME_MODES[game],box=document.createElement("label");
 box.className="room-chess-time-picker room-game-mode-picker";
 const title=document.createElement("span");title.textContent=config.label;
 localModeSelect=document.createElement("select");localModeSelect.id="roomLocalMode";
 for(const [value,label] of config.choices)localModeSelect.append(new Option(label,value));
 const cached=localStorage.getItem("mrlee."+game+".mode");
 localModeSelect.value=config.choices.some(([value])=>value===cached)?cached:config.default;
 localModeSelect.addEventListener("change",()=>{
  localStorage.setItem("mrlee."+game+".mode",localModeSelect.value);
  document.getElementById("roomQuickCaption").textContent=
   "Đấu máy · "+localModeSelect.selectedOptions[0]?.textContent;
 });
 box.append(title,localModeSelect);
 const menu=document.getElementById("roomMenu");menu.parentElement.insertBefore(box,menu);
}
if(!current)throw Error("Mã trò chơi không hợp lệ");
const frame=$("roomGameFrame"),lobby=$("roomLobby"),stage=$("roomPlay"),panel=$("roomModeHint");
// Layout advice stays outside the iframe, so auth/loading issues never hide it.
const orientationTip=document.createElement("aside");
orientationTip.id="roomOrientationTip";
orientationTip.className="arena-v20-orientation";
orientationTip.setAttribute("role","status");
orientationTip.setAttribute("aria-label","Gợi ý hướng màn hình cho game bài");
const orientationIcon=document.createElement("span");
orientationIcon.className="arena-v20-orientation-icon";
orientationIcon.textContent="↻";
const orientationText=document.createElement("span");
orientationText.innerHTML="<strong>Xoay ngang điện thoại</strong><small>Bàn bài, avatar và tay bài được tối ưu theo tỷ lệ ngang 16:9.</small>";
const orientationButton=document.createElement("button");
orientationButton.type="button";
orientationButton.textContent="⛶ Toàn màn hình ngang";
orientationButton.addEventListener("click",()=>void tryLandscape());
orientationTip.append(orientationIcon,orientationText,orientationButton);
stage.append(orientationTip);
let verifiedWallet=null,playingMode="",hasBooted=false,openAttempt=0,frameLoaded=false;
const compact=n=>Number(n).toLocaleString("vi-VN");
const txt=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el;};
document.documentElement.style.setProperty("--room-cover",'url("assets/arena/covers/'+game+'.svg")');
const quickCaption=$("roomQuickCaption");
if(quickCaption)quickCaption.textContent=game==="chess"?"Ghép bàn "+chessTimeSelect.value+" · đúng thời gian":localModeSelect?"Đấu máy · "+localModeSelect.selectedOptions[0]?.textContent:current.online?"Ghép bàn theo G phù hợp":"Đấu máy miễn phí";
for(const mode of ["friends","browse"]){
 const action=document.querySelector('[data-play-mode="'+mode+'"]');
 if(!current.online){
  action.disabled=true;
  action.setAttribute("aria-disabled","true");
  action.title="PvP đang phát triển. Hãy chọn Chơi nhanh hoặc Đấu với máy.";
  $(mode==="friends"?"roomFriendsCaption":"roomBrowseCaption").textContent="Sắp hỗ trợ PvP";
 }
}
$("roomModeHint").textContent=current.online?
 "Chơi nhanh, tạo phòng, chọn mức bàn G hoặc đấu máy. G chỉ dùng trong trò chơi.":
 "Đấu máy hiện đã hỗ trợ. PvP chưa mở cho trò này.";
function status(message){panel.textContent=String(message||"");}
function activeMobile(){return matchMedia("(pointer:coarse)").matches||/iPhone|iPad|Android/i.test(navigator.userAgent);}
function portrait(){return matchMedia("(orientation:portrait)").matches;}
function playStatus(message){
 let node=$("roomPlayStatus");
 if(!node){node=txt("small","");node.id="roomPlayStatus";node.setAttribute("role","status");node.className="game-room-play-status";$("roomPlayHeading").after(node);}
 node.textContent=String(message||"");
}
async function tryLandscape(){
 if(portraitBoard||!activeMobile())return;
 try{
  if(!document.fullscreenElement&&document.documentElement.requestFullscreen){
   await document.documentElement.requestFullscreen({navigationUI:"hide"});
  }
 }catch{}
 try{if(screen.orientation?.lock)await screen.orientation.lock("landscape");}catch{}
 if(portrait())playStatus("📱 Xoay điện thoại ngang để có bàn chơi rộng hơn.");
}
function inviteCode(){
 const code=String(new URL(location.href).searchParams.get("room")||"").trim().toUpperCase();
 return /^[A-Z2-9]{8}$/.test(code)?code:"";
}
function frameFailure(message){
 const loader=$("roomFrameLoading");
 loader.hidden=false;
 loader.replaceChildren();
 const p=txt("strong",message||"Không thể tải bàn chơi.");p.className="game-room-error-detail";
 const row=document.createElement("div");row.className="game-room-recovery-actions";
 const retry=txt("button","↻ Thử tải lại");retry.type="button";
 retry.addEventListener("click",()=>start(playingMode||"bot",{code:inviteCode()}));
 const back=txt("button","← Chọn chế độ");back.type="button";
 back.addEventListener("click",reset);
 row.append(retry,back);loader.append(p,row);
 playStatus("Bàn chơi chưa mở được. Có thể thử lại mà không bị trừ G.");
}
function start(mode,{auto=false,code=""}={}){
 if(mode==="quick"&&!current.online)mode="bot";
 if(mode!=="bot"&&!current.online){status("⚠️ "+current.name+" hiện mới hỗ trợ đấu máy.");return;}
 if(!["bot","quick","friends","browse"].includes(mode))return;
 playingMode=mode;hasBooted=false;frameLoaded=false;openAttempt++;
 const url=new URL("mrlee-game-arena.html",location.href);
 url.searchParams.set("embed","1");
 url.searchParams.set("game",game);
 url.searchParams.set("mode",mode);
  if(game==="chess")url.searchParams.set("time",chessTimeSelect.value);
  if(localModeSelect)url.searchParams.set(LOCAL_GAME_MODES[game].param,localModeSelect.value);
 const invite=code||inviteCode();
 if(invite&&current.online)url.searchParams.set("room",invite);
 $("roomPlayHeading").textContent=current.name+" · "+(mode==="bot"?"Đấu máy":mode==="quick"?"Chơi nhanh":mode==="browse"?"Chọn bàn":"Chơi với bạn");
 lobby.hidden=true;stage.hidden=false;document.body.classList.add("game-room-in-play");
 $("roomFrameLoading").textContent="Đang mở bàn chơi…";
 $("roomFrameLoading").hidden=false;
 frame.src=url.href;
 // Automatic rotation is requested only from an explicit user gesture.
 // If the browser refuses orientation lock, the interface stays playable.
 if(!auto&&!portraitBoard&&activeMobile()&&portrait())void tryLandscape();
 if(auto&&activeMobile()&&portrait()&&!portraitBoard)playStatus("📱 Có thể xoay ngang để mở rộng bàn chơi.");
 else playStatus("");
 const seq=openAttempt;
 setTimeout(()=>{if(seq===openAttempt&&!hasBooted&&!stage.hidden){
  frameFailure("Bàn chơi chưa phản hồi. Hãy thử tải lại hoặc quay về chọn chế độ.");
 }},11000);
}
function reset(){
 playingMode="";hasBooted=false;frameLoaded=false;openAttempt++;
 frame.src="about:blank";
 stage.hidden=true;lobby.hidden=false;document.body.classList.remove("game-room-in-play");
 $("roomFrameLoading").textContent="Đang mở bàn chơi…";$("roomFrameLoading").hidden=false;
 playStatus("");
 try{screen.orientation?.unlock?.();}catch{}
 if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});
 void loadWallet();
}
function leave(){
 if(stage.hidden)return;
 if(!frameLoaded||!frame.contentWindow){reset();return;}
 frame.contentWindow.postMessage({marker:"mrlee-game-room",command:"leave"},location.origin);
 playStatus(playingMode==="bot"?"Đang trở về chọn chế độ…":"Đang rời phòng an toàn. Nếu có G đã giữ, vui lòng xác nhận thoát trong bàn.");
}
frame.addEventListener("load",()=>{
 frameLoaded=true;
 if(hasBooted)return;
 try{
  const child=frame.contentWindow?.location;
  if(child?.pathname.endsWith("/dang-nhap.html")){
   frameFailure("Phiên đăng nhập cần xác minh lại. Vui lòng đăng nhập ở trang chính.");
   return;
  }
 }catch{}
 if(frame.src==="about:blank")return;
 playStatus("Đang chuẩn bị luật chơi và kiểm tra quyền truy cập…");
});
window.addEventListener("message",event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
 const msg=event.data;if(msg?.marker!=="mrlee-game-room"||msg.game!==game)return;
 if(msg.event==="started"){hasBooted=true;$("roomFrameLoading").hidden=true;playStatus("");}
 if(msg.event==="returned")reset();
 if(msg.event==="error"&&!hasBooted)frameFailure(msg.message||"Không thể mở bàn chơi.");
});
const friendPopup=current.online?mountArenaFriendPopup({
 game,gameName:current.name,
 getWallet:()=>verifiedWallet,
  getTimeControl:()=>chessTimeSelect?.value||"10+0",
 nickname:()=>($("roomPlayer")?.textContent||"Học viên").trim().slice(0,24)||"Học viên",
 onWallet:updateWallet,
 onAccepted:room=>{void loadWallet();start("friends",{code:room.code});}
}):null;
// V24: real tier cards open the authenticated create-room dialog.
if(game==="tienlen"){
 document.querySelectorAll("[data-tl-tier]").forEach(tile=>tile.addEventListener("click",()=>{
  if(!friendPopup)return;
  friendPopup.open("create",Number(tile.dataset.tlTier));
 }));
 document.querySelectorAll("[data-tl-daily]").forEach(btn=>btn.addEventListener("click",()=>$("roomDaily")?.click()));
}
document.querySelectorAll("[data-play-mode]").forEach(btn=>btn.addEventListener("click",()=>{
 if(btn.disabled)return;
 const mode=btn.dataset.playMode;
 if(mode==="friends"){friendPopup?.open("create");return;}
 if(mode==="browse"){start("browse");return;}
 start(mode);
}));
$("roomBotPlay").addEventListener("click",()=>start("bot"));
$("roomExitGame").addEventListener("click",leave);
$("roomTryLandscape").addEventListener("click",()=>void tryLandscape());
if(portraitBoard){
 const rotate=$("roomTryLandscape");rotate.hidden=true;rotate.disabled=true;
 rotate.setAttribute("aria-hidden","true");
 $("roomPlayHeading").title="Bàn cờ tối ưu cho màn hình dọc; không cần xoay ngang";
 $("roomModeHint").textContent="Bàn cờ ưu tiên chiều dọc, không bắt buộc xoay điện thoại. Giữ nguyên luật và thao tác kéo-thả.";
}
$("roomTryFullscreen").addEventListener("click",async()=>{
 try{
  if(document.fullscreenElement)await document.exitFullscreen();
  else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen({navigationUI:"hide"});
 }catch{playStatus("Trình duyệt không hỗ trợ toàn màn hình.");}
});
$("roomMoreGames").addEventListener("click",()=>location.assign("mrlee-game-arena.html"));
function updateWallet(wallet){
 if(!wallet||!Number.isFinite(Number(wallet.gold)))return;
 verifiedWallet=wallet;
 $("roomWalletGold").textContent=compact(wallet.gold)+"G";
 $("roomWalletPoints").textContent=compact(wallet.availablePoints??0);
 $("roomWalletGold").title=formatG(wallet.gold)+" trong ví đã xác minh";
}
async function loadWallet(){
 try{
  const data=await roomRequest("wallet",{},"GET");
  updateWallet(data.wallet);
 }catch(e){
  if(!verifiedWallet){
   $("roomWalletGold").textContent="—";$("roomWalletPoints").textContent="—";
   $("roomWalletGold").title=e?.message||"Không thể truy cập ví G.";
  }
 }
}
void loadWallet();
window.addEventListener("focus",()=>{if(stage.hidden)void loadWallet();});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&stage.hidden)void loadWallet();});
async function userName(){
 try{
  const [{getApps},{getAuth}]=await Promise.all([
   import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
   import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")
  ]);
  const instance=getApps()[0];if(!instance)return;
  const auth=getAuth(instance);if(auth.authStateReady)await auth.authStateReady();
  const user=auth.currentUser;if(!user?.emailVerified)return;
  $("roomPlayer").textContent=(user.displayName||user.email?.split("@")[0]||"Học viên MR LEE").slice(0,30);
  if(/^https:\/\//.test(user.photoURL||"")){
   const avatar=document.querySelector(".game-room-avatar");
   const img=document.createElement("img");img.src=user.photoURL;img.alt="";img.loading="lazy";
   img.onerror=()=>img.remove();avatar.replaceChildren(img);
  }
 }catch{}
}
void userName();
const dialog=$("roomDialog"),dialogBody=$("roomDialogContent");
function openDialog(title){
 $("roomDialogTitle").textContent=title;dialogBody.replaceChildren();
 if(!dialog.open)dialog.showModal();
}
function addText(value){dialogBody.append(txt("p",value));}
$("roomDialogClose").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
$("roomShowRules").addEventListener("click",()=>{
 openDialog("📖 Cách chơi "+current.name);
 addText(current.description+". Hãy chọn chế độ chơi phù hợp.");
 if(current.online){
  addText("Chơi nhanh ghép vào phòng có mức G phù hợp. Chơi với bạn tạo phòng/mã mời. Chọn bàn xem phòng, giá G/lá và số người.");
  addText("Máy chủ xác minh ví, giữ G bảo đảm và kết toán sau mỗi ván.");
 }else addText("Trò này hiện hỗ trợ đấu máy miễn phí, không giới hạn lượt. Xu/EXP đấu máy chỉ mang tính demo, không phải G xác minh.");
 const a=document.createElement("a");a.href="mrlee-game-arena.html";a.textContent="Xem Game Arena";dialogBody.append(a);
});
$("roomOpenExchange").addEventListener("click",()=>{
 openDialog("🪙 Đổi điểm học tập thành G");
 addText("1 điểm học tập Game Zone đã xác minh = 10G. Điểm đã đổi không thể đổi lại. Không đổi ra tiền thật.");
 const balance=txt("p","Điểm có thể đổi: "+(verifiedWallet?.availablePoints??"—"));dialogBody.append(balance);
 const label=txt("label","Số điểm muốn đổi");const input=document.createElement("input");
 input.type="number";input.min="1";input.max="10000";input.step="1";input.value="1";label.append(input);dialogBody.append(label);
 const feedback=txt("p","");feedback.setAttribute("role","status");
 const submit=txt("button","Xác nhận đổi điểm");submit.type="button";
 submit.addEventListener("click",async()=>{
  const points=Number(input.value);
  if(!Number.isInteger(points)||points<1||points>10000){feedback.textContent="Nhập số điểm nguyên từ 1 đến 10.000.";return;}
  if(verifiedWallet&&points>verifiedWallet.availablePoints){feedback.textContent="Không đủ điểm có thể đổi.";return;}
  if(!window.confirm("Đổi "+points+" điểm thành "+formatG(points*10)+"?"))return;
  submit.disabled=true;feedback.textContent="Đang kiểm tra trên máy chủ…";
  try{
   await roomRequest("convert",{points});await loadWallet();
   balance.textContent="Điểm có thể đổi: "+(verifiedWallet?.availablePoints??"—");
   feedback.textContent="✓ Đã đổi "+points+" điểm thành "+formatG(points*10)+".";
  }catch(e){feedback.textContent=e?.message||"Đổi điểm thất bại.";}
  finally{submit.disabled=false;}
 });
 dialogBody.append(submit,feedback);
});
$("roomDaily").addEventListener("click",()=>{
 // The daily module may initialize after this module; attach only when its
 // dialog exists, and refresh the verified G after all close methods.
 const rewardDialog=document.getElementById("arenaDailyDialog");
 if(rewardDialog&&!rewardDialog.dataset.roomWalletBound){
  rewardDialog.dataset.roomWalletBound="1";
  rewardDialog.addEventListener("close",()=>void loadWallet());
 }
 $("arenaDailyOpen")?.click();
});
const mode=new URL(location.href).searchParams.get("mode");
const popup=new URL(location.href).searchParams.get("popup");
if(inviteCode()&&current.online)start("friends",{auto:true});
else if(mode==="friends"&&current.online)friendPopup?.open("create");
else if(mode==="browse"&&current.online)start("browse",{auto:true});
else if(["quick","bot"].includes(mode))start(mode,{auto:true});
else if(popup==="create"&&current.online)friendPopup?.open("create");
else if(popup==="join"&&current.online)friendPopup?.open("join");
