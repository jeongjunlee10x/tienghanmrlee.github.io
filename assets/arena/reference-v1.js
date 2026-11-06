/* MR LEE screenshot-reference lobby — actual controls, not an image mock.
 * Links into the existing rule engines, Firebase-verified wallet, and genuine ranking page.
 * Never invents gold, study points, player counts, event prizes, or leaderboard rows.
 */
import {roomRequest,formatG} from "./room-api.js";
const $=id=>document.getElementById(id);
const root=document.documentElement;
const cards=[...document.querySelectorAll("#arenaCatalog .arena-game-card[data-game-id]")];
const gamePages=Object.freeze({colors:"game-bai-mau.html",chess:"game-co-vua.html",
 tienlen:"game-tien-len.html",ludo:"game-co-ca-ngua.html",
 xiangqi:"game-co-tuong.html",estate:"game-dia-oc.html"});
const labels=Object.freeze({
 tienlen:"🃏 4 người · PvP / máy",
 chess:"♟️ 2 người · PvP / máy",
 xiangqi:"♜ 2 người · Đấu máy",
 ludo:"🎲 4 người · Đấu máy",
 estate:"🏘️ 4 người · Đấu máy",
 colors:"🔴 4 người · PvP / máy"
});
function text(tag,className,value){
 const element=document.createElement(tag);if(className)element.className=className;
 if(value!==undefined)element.textContent=String(value);return element;
}
function button(value,className,fn){
 const b=text("button",className,value);b.type="button";if(fn)b.addEventListener("click",fn);return b;
}
function showMore(card,open){
 for(const other of cards){
  if(other!==card)other.classList.remove("arena-ref-expanded");
  const otherMore=other.querySelector(".arena-ref-more");
  if(otherMore&&other!==card)otherMore.setAttribute("aria-expanded","false");
 }
 card.classList.toggle("arena-ref-expanded",open);
 card.querySelector(".arena-ref-more")?.setAttribute("aria-expanded",String(open));
}
for(const card of cards){
 const id=card.dataset.gameId;if(!(id in labels))continue;
 const footer=text("div","arena-ref-card-footer");
 const info=text("span","",labels[id]);
 const play=button("▶ Chơi ngay","arena-ref-play",()=>{
  showMore(card,false);
  // Every game now has its own colorful, playable, mobile-first lobby.
  location.assign(gamePages[id]);
 });
 play.setAttribute("aria-label","Chơi ngay "+card.querySelector(".arena-card-body>strong")?.textContent);
 play.dataset.refPlay=id;
 const more=button("⋮","arena-ref-more",()=>showMore(card,!card.classList.contains("arena-ref-expanded")));
 more.title="Chơi nhanh, chơi với bạn, chọn bàn, đấu máy";
 more.setAttribute("aria-label","Các chế độ chơi của "+id);
 more.setAttribute("aria-expanded","false");
 footer.append(info,play,more);
 card.append(footer);
 // Catalog cards only select a game. Match setup happens on that game's
 // dedicated screen, never as a create-room action in the shared catalog.
 card.addEventListener("click",event=>{
  if(event.target.closest("button,a,input,select,textarea"))return;
  location.assign(gamePages[id]);
 });
 card.addEventListener("keydown",event=>{
  if((event.key==="Enter"||event.key===" ")&&event.target===card){
   event.preventDefault();location.assign(gamePages[id]);
  }
 });
 card.tabIndex=0;
 card.setAttribute("role","link");
 card.setAttribute("aria-label","Mở trò chơi "+(card.querySelector(".arena-card-body>strong")?.textContent||id));
 const banner=card.querySelector(".arena-card-banner");
 if(banner&&(id==="tienlen"||id==="chess")){
  banner.append(text("span","arena-ref-feature-label",id==="tienlen"?"🔥 HOT":"♟️ CHIẾN THUẬT"));
 }
}
document.addEventListener("pointerdown",event=>{
 const target=event.target;
 if(!(target instanceof Element))return;
 if(target.closest(".arena-game-card,.arena-ref-dialog"))return;
 for(const card of cards){card.classList.remove("arena-ref-expanded");
  card.querySelector(".arena-ref-more")?.setAttribute("aria-expanded","false");}
});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape")for(const card of cards)showMore(card,false);
});
$("arenaRefMoreFilters")?.addEventListener("click",()=>{
 const side=document.querySelector(".arena-ref-categories");
 const next=!side?.classList.contains("arena-ref-show-more");
 side?.classList.toggle("arena-ref-show-more",next);
 $("arenaRefMoreFilters").setAttribute("aria-expanded",String(next));
 $("arenaRefMoreFilters").textContent=next?"⌃ Thu gọn bộ lọc":"⌄ Bộ lọc nâng cao";
});
$("arenaRefColorsAccess")?.addEventListener("click",()=>location.assign(gamePages.colors));
const catalog=$("arenaCatalog"),learning=$("arenaRefLearning");
function syncLearning(){
 if(!catalog||!learning)return;
 const show=catalog.dataset.activeFilter==="all"&&catalog.dataset.hasSearch!=="true";
 learning.hidden=!show;
}
if(catalog){
 new MutationObserver(syncLearning).observe(catalog,{attributes:true,attributeFilter:["data-active-filter","data-has-search"]});
 syncLearning();
}
// The bonus wheel preview uses the same wedges and actual labels as the real
// wheel created by daily-rewards.js; its 'Quay ngay' activates that real wheel.
function fillPreview(){
 const disk=$("arenaWheelDisk"),preview=$("arenaRefWheelPreview");
 const source=$("arenaWheelLabels");
 if(!disk||!source||!preview||source.children.length!==10)return;
 preview.style.background=disk.style.background;
 preview.querySelectorAll(".arena-ref-wheel-label").forEach(el=>el.remove());
 for(const item of source.children){
  const label=text("span","arena-ref-wheel-label",item.textContent);
  label.style.left=item.style.left;label.style.top=item.style.top;
  label.style.transform=item.style.transform;preview.append(label);
 }
}
fillPreview();
setTimeout(fillPreview,350);
function syncWallet(wallet){
 if(!wallet)return;
 const gold=formatG(wallet.gold);
 const points=String(wallet.availablePoints??0);
 for(const id of ["arenaVerifiedGold","roomAvailableGold","arenaDailyBalance","arenaRefTopGold"])
  if($(id))$(id).textContent=gold;
 for(const id of ["roomVerifiedPoints","arenaDailyPoints","arenaRefTopPoints"])
  if($(id))$(id).textContent=points;
}
function fromExistingWallet(){
 const gold=$("arenaVerifiedGold")?.textContent?.trim()||"";
 const points=$("roomVerifiedPoints")?.textContent?.trim()||$("arenaDailyPoints")?.textContent?.trim()||"";
 if(gold&&gold!=="—")$("arenaRefTopGold").textContent=gold;
 if(points&&points!=="—")$("arenaRefTopPoints").textContent=points;
}
for(const id of ["arenaVerifiedGold","roomVerifiedPoints","arenaDailyPoints"]){
 const node=$(id);
 if(node)new MutationObserver(fromExistingWallet).observe(node,{childList:true,subtree:true,characterData:true});
}
fromExistingWallet();
function syncRewards(){
 const check=$("arenaDailyCheckButton"),spin=$("arenaDailySpinButton");
 const claimed=!!check&&/Đã nhận/.test(check.textContent||"");
 const spun=!!spin&&/Đã quay/.test(spin.textContent||"");
 const heroCheck=$("arenaHeroCheckin");
 if(heroCheck){
  heroCheck.disabled=claimed;
  heroCheck.textContent=claimed?"✓ Đã điểm danh":"✓ Điểm danh ngay";
 }
 if($("arenaRefCheckinStatus"))$("arenaRefCheckinStatus").textContent=
  claimed?"Đã nhận 1.000G + 1 điểm hôm nay":"Mỗi tài khoản nhận một lần mỗi ngày";
 if($("arenaRefSpinStatus"))$("arenaRefSpinStatus").textContent=
  spun?"✓ Hôm nay đã quay · Ngày mai nhận tiếp":"10 mức thưởng · 100G–5.000G";
 if($("arenaHeroWheel"))$("arenaHeroWheel").textContent=spun?"✓ Đã quay hôm nay":"Quay ngay";
}
for(const id of ["arenaDailyCheckButton","arenaDailySpinButton"]){
 const node=$(id);if(node)new MutationObserver(syncRewards).observe(node,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["disabled"]});
}
syncRewards();
const delay=ms=>new Promise(done=>setTimeout(done,ms));
async function openDaily(kind){
 const trigger=$("arenaDailyOpen");if(!trigger)return;
 trigger.click();
 const action=$(kind==="checkin"?"arenaDailyCheckButton":"arenaDailySpinButton");
 if(!action)return;
 // Allow its initial authenticated GET to finish. If already claimed, show
 // actual status rather than claiming another reward.
 for(let i=0;i<35&&action.disabled&&!/Đã nhận|Đã quay/.test(action.textContent||"");i++){
  await delay(80);
 }
 if(!action.disabled)action.click();
 else action.focus();
}
$("arenaHeroCheckin")?.addEventListener("click",()=>{void openDaily("checkin");});
$("arenaHeroWheel")?.addEventListener("click",()=>{void openDaily("spin");});
// Maintain a real account label if Firebase exposes verified auth; otherwise
// leave a neutral "Học viên MR LEE" rather than inventing an identity.
async function loadUser(){
 try{
  const module=await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js");
  const user=module.getAuth().currentUser;
  if(!user||!user.emailVerified)return;
  const name=(user.displayName||user.email?.split("@")[0]||"Học viên MR LEE").trim();
  if(name)$("arenaRefPlayerName").textContent=name.slice(0,40);
  if(/^https:\/\//i.test(user.photoURL||"")){
   const avatar=document.querySelector(".arena-ref-profile img");
   if(avatar){avatar.src=user.photoURL;avatar.onerror=()=>{avatar.src="assets/branding/logo-mrlee.png";};}
  }
 }catch{/* Firebase auth guard owns login; don't break visual fallback. */}
}
void loadUser();
// Menu and bottom action dialogs: no dead controls and no fabricated counters.
const modal=$("arenaRefDialog"),modalTitle=$("arenaRefDialogTitle"),modalBody=$("arenaRefDialogBody");
function makeLink(href,label){const a=text("a","",label);a.href=href;return a;}
function paragraph(value){return text("p","",value);}
function panel(mode){
 modalBody.replaceChildren();
 const titles={stats:"📊 Thống kê luyện tập",convert:"🪙 Đổi điểm học tập sang G",
 missions:"⭐ Nhiệm vụ có thể thực hiện",events:"🎁 Sự kiện Game Arena",guide:"❔ Hướng dẫn Game Arena"};
 modalTitle.textContent=titles[mode]||"GAME ARENA";
 switch(mode){
  case "stats":{
   modalBody.append(paragraph("Thống kê sau đây là số liệu đấu máy trong phiên trình duyệt này; không phải BXH tuần."));
   const grid=text("div","arena-ref-grid-stats");
   for(const [name,id] of [["🏆 Thắng / Thua","#arenaRecord"],["✨ EXP demo","#arenaXp"],
     ["🎫 Vé demo còn lại","#arenaTickets"],["🪙 Vàng G xác minh","#arenaVerifiedGold"]]){
    const value=document.querySelector(id)?.textContent?.trim()||"—";
    const box=text("div","");box.append(text("small","",name),text("strong","",value));grid.append(box);
   }
   modalBody.append(grid);
   const link=makeLink("bang-diem-tuan-v12.html","Xem bảng điểm học tập tuần");modalBody.append(paragraph(""),link);
   break;
  }
  case "convert":{
   modalBody.append(paragraph("Chỉ điểm học tập đã xác minh trên Game Zone mới đổi được. Quy đổi cố định 1 điểm = 10G. G không thể quy đổi ra tiền thật."));
   const status=paragraph("Điểm hiện có: "+($("arenaRefTopPoints")?.textContent||"—"));status.id="arenaRefConvertBalance";modalBody.append(status);
   const label=text("label","", "Số điểm muốn đổi");
   const input=document.createElement("input");input.id="arenaRefConvertInput";input.type="number";input.min="1";input.max="10000";input.step="1";input.value="10";input.autocomplete="off";
   label.append(input);modalBody.append(label);
   const submit=button("↻ Xác nhận đổi sang G","",async()=>{
    const points=Number(input.value);
    if(!Number.isInteger(points)||points<1||points>10000){feedback.textContent="Nhập số điểm nguyên từ 1 đến 10.000.";return;}
    submit.disabled=true;feedback.textContent="Đang xác minh điểm học tập trên máy chủ...";
    try{
     await roomRequest("convert",{points});
     const result=await roomRequest("wallet",{},"GET");
     syncWallet(result.wallet);
     status.textContent="Điểm hiện có: "+String(result.wallet.availablePoints||0);
     feedback.textContent="✓ Đã đổi "+points+" điểm thành "+formatG(points*10)+".";
    }catch(err){feedback.textContent=err.message||"Chưa thể đổi điểm. Vui lòng thử lại.";}
    finally{submit.disabled=false;}
   });
   const feedback=paragraph("");feedback.setAttribute("role","status");modalBody.append(submit,feedback);
   break;
  }
  case "missions":{
   modalBody.append(paragraph("Các hoạt động thưởng thật đang mở. Trang này không tự tạo thêm vàng hoặc điểm ngoài quy tắc hiện có."));
   const list=text("ul","");
   for(const msg of ["🗓️ Điểm danh một lần mỗi ngày: 1.000G và 1 điểm Game Zone xác minh.",
     "🎡 Quay một lần mỗi ngày: thưởng ngẫu nhiên 100G–5.000G.",
     "🎓 Luyện game tiếng Hàn; điểm đổi G chỉ tính khi được máy chủ xác minh."]){
    list.append(text("li","",msg));
   }
   modalBody.append(list);
   modalBody.append(button("🎁 Nhận thưởng hôm nay","",()=>{modal.close();$("arenaDailyOpen")?.click();}));
   modalBody.append(paragraph(""));
   modalBody.append(makeLink("tro-choi-tieng-han.html","Mở Game Zone học tiếng Hàn"));
   break;
  }
  case "events":{
   modalBody.append(paragraph("Hiện chưa có sự kiện thưởng G được công bố qua hệ thống này. Khi có sự kiện chính thức, quy tắc và thời hạn sẽ được thông báo rõ tại đây."));
   modalBody.append(makeLink("bang-diem-tuan-v12.html","Xem bảng điểm học tập tuần hiện có"));
   break;
  }
  default:{
   modalBody.append(paragraph("🎮 Chọn một game trong sảnh. Ngay trong phòng của game đó, bạn có thể chọn Chơi nhanh, Chơi với bạn, Chọn bàn hoặc Đấu máy khi trò chơi hỗ trợ."));
   const list=text("ul","");
   for(const msg of ["♟️ Cờ Vua / Cờ Tướng: chọn quân rồi chọn ô đích. Nước đi được kiểm tra đúng luật.",
    "🃏 Tiến Lên: chọn lá, đánh bài hoặc bỏ lượt; bàn PvP tính mức G/lá theo quy tắc phòng.",
    "🎲 Cờ Cá Ngựa / Địa Ốc: tung xúc xắc và làm theo các thao tác hiện trên bàn.",
    "📱 Trên điện thoại, xoay ngang nếu trình duyệt không cho website tự khóa hướng.",
    "🪙 Vàng G là đơn vị ảo trên website; không dùng để quy đổi tiền thật."]){
    list.append(text("li","",msg));
   }
   modalBody.append(list);
   modalBody.append(makeLink("quy-tac-diem-mrlee.html","Xem quy tắc điểm MR LEE"));
  }
 }
 if(!modal.open)modal.showModal();
}
document.querySelectorAll("[data-arena-panel]").forEach(control=>
 control.addEventListener("click",()=>panel(control.dataset.arenaPanel)));
$("arenaRefDialogClose")?.addEventListener("click",()=>modal?.close());
modal?.addEventListener("click",event=>{if(event.target===modal)modal.close();});
// Full dashboard only in lobby; while playing, no static hero covers the board.
const lobby=$("arenaLobby");
function syncScreen(){
 const playing=!!lobby?.hidden;
 document.body.classList.toggle("arena-ref-in-game",playing);
 $("arenaRefHero").hidden=playing;
 $("arenaRefDock").hidden=playing;
}
if(lobby)new MutationObserver(syncScreen).observe(lobby,{attributes:true,attributeFilter:["hidden"]});
syncScreen();
