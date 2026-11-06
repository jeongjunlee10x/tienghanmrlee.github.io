/* MR LEE Arena — mobile landscape and on-table notices.
 * A website may request screen.orientation.lock only where the browser permits it.
 * Never claim to rotate hardware on iOS Safari or outside a user gesture.
 * Game state, scoring and move validation remain in their existing controllers.
 */
const $=id=>document.getElementById(id);
const arena=!!$("arenaLobby"),zone=!!$("mzLobby");
const entries=arena?[
 ["arenaTable",".arena-board",["arenaTurn"]],
 ["arenaChess",".chess-main",["chessStatus"]],
 ["arenaTienLen",".tl-board",["tlStatus","tlTableEvent"]],
 ["arenaLudo",".arena-extra-stage",["ludoStatus"]],
 ["arenaXiangqi",".arena-extra-stage",["xqStatus"]],
 ["arenaEstate",".arena-extra-stage",["estateStatus"]],
 ["arenaPvPBoard","#arenaPvPBoard",["roomBoardStatus"]]
]:zone?[["mzArena","#mzArena",["mzFeedback"]]]:[];
let currentId="",rotateDismissed=false,portraitPrompt=null,requested=false;
const playing=id=>!!$(id)&&!$(id).hidden;
const phone=()=>matchMedia("(pointer: coarse)").matches&&
  (matchMedia("(max-width: 980px)").matches||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
const portrait=()=>matchMedia("(orientation: portrait)").matches;
const shade=(message,kind)=>{
 if(kind==="win"||/thắng|chiến thắng|hoàn thành/i.test(message))return "success";
 if(kind==="error"||/lỗi|thua|không thể|không đủ|không hợp lệ|thất bại/i.test(message))return "error";
 return "info";
};
const timeouts=new Map();
function hudFor(id,selector){
 const section=$(id);if(!section)return null;
 const board=section.querySelector(selector)||section;
 let hud=board.querySelector(':scope > .arena-live-hud');
 if(!hud){
  hud=document.createElement("div");
  hud.className="arena-live-hud";
  hud.setAttribute("role","status");hud.setAttribute("aria-live","polite");
  hud.hidden=true;
  board.append(hud);
 }
 return hud;
}
function announce(id,text,kind){
 if(!playing(id))return;
 const def=entries.find(v=>v[0]===id);if(!def)return;
 const hud=hudFor(id,def[1]);if(!hud)return;
 let content=String(text||"").replace(/\s+/g," ").trim();
 if(!content)return;
 if(content.length>140)content=content.slice(0,137)+"…";
 if(hud.dataset.message===content&&hud.hidden===false)return;
 hud.dataset.message=content;hud.dataset.kind=shade(content,kind);
 hud.textContent=content;hud.hidden=false;
 clearTimeout(timeouts.get(id));
 timeouts.set(id,setTimeout(()=>{hud.hidden=true;hud.dataset.message="";},/thắng|thua|hòa|hoàn thành/i.test(content)?5500:3000));
}
function syncOrientationPrompt(){
 const show=phone()&&portrait()&&!!currentId&&!rotateDismissed;
 if(!show){portraitPrompt?.remove();portraitPrompt=null;return;}
 if(!portraitPrompt){
  portraitPrompt=document.createElement("div");
  portraitPrompt.className="arena-rotate-prompt";
  portraitPrompt.setAttribute("role","status");
  const message=document.createElement("span");
  message.textContent="📱 Xoay điện thoại ngang để chơi thoải mái hơn";
  const retry=document.createElement("button");
  retry.type="button";retry.textContent="⛶ Thử ngang";
  retry.addEventListener("click",()=>{void requestMobileLandscape();});
  const close=document.createElement("button");
  close.type="button";close.textContent="Chơi dọc";
  close.setAttribute("aria-label","Tiếp tục chơi dọc và ẩn hướng dẫn xoay ngang");
  close.addEventListener("click",()=>{rotateDismissed=true;syncOrientationPrompt();});
  portraitPrompt.append(message,retry,close);
 }
 // Append to the currently active game, not a panel below the board.
 const section=$(currentId);
 if(section&&portraitPrompt.parentElement!==section)section.append(portraitPrompt);
}
function refreshActive(){
 const next=entries.find(entry=>playing(entry[0]))?.[0]||"";
 if(next!==currentId){
  currentId=next;rotateDismissed=false;
  if(!next){
   portraitPrompt?.remove();portraitPrompt=null;
   document.body.classList.remove("arena-mobile-playing");
  }
 }
 if(next&&phone())document.body.classList.add("arena-mobile-playing");
 syncOrientationPrompt();
}
async function requestMobileLandscape(){
 // Standalone game pages own fullscreen/orientation at the parent level.
 // A nested iframe must not enter a second fullscreen top layer and cover
 // the parent's safe-exit controls on touch devices.
 if(document.documentElement.classList.contains("arena-embedded"))return;
 if(!phone())return;
 refreshActive();
 if(!currentId&&!(arena&&playing("arenaRoomLobby")))return;
 try{
  if(!document.fullscreenElement&&document.documentElement.requestFullscreen){
   // Called from a tap or click, while transient user activation is still valid.
   await document.documentElement.requestFullscreen({navigationUI:"hide"});
  }
 }catch{
  // Safari and some in-app browsers refuse full-screen on arbitrary elements.
 }
 try{
  if(screen.orientation?.lock)await screen.orientation.lock("landscape");
 }catch{
  // Browser/user policy blocked lock; the unobtrusive rotate prompt remains.
 }
 syncOrientationPrompt();
}
function leaveMobilePlay(){
 if(document.fullscreenElement){
  void document.exitFullscreen().catch(()=>{});
 }
 // Orientation unlock is optional and must not throw on unsupported browsers.
 try{screen.orientation?.unlock?.();}catch{}
 document.body.classList.remove("arena-mobile-playing");
 portraitPrompt?.remove();portraitPrompt=null;
}
// Attach to stable source nodes; never observe a whole game tree and loop on its own HUD.
for(const [id,anchor,sources] of entries){
 for(const name of sources){
  const source=$(name);if(!source)continue;
  let last="";
  const sync=()=>{
   if(!playing(id))return;
   const message=source.textContent.replace(/\s+/g," ").trim();
   if(!message||message===last)return;
   last=message;
   announce(id,message,source.dataset.good==="false"||source.dataset.error==="true"?"error":undefined);
  };
  const observer=new MutationObserver(sync);
  observer.observe(source,{subtree:true,childList:true,characterData:true,attributes:true,
   attributeFilter:["data-good","data-error"]});
 }
}
// Game buttons have existing direct handlers: document bubble runs after their
// synchronous state change, preserving the browser's trusted click activation.
document.addEventListener("click",event=>{
 const target=event.target instanceof Element?event.target:null;
 if(!target)return;
 const startsArena=arena&&!!target.closest('#arenaCatalog button[data-game]');
 const startsZone=zone&&!!target.closest("#mzCards button");
 const entersPvP=arena&&!!target.closest("#roomToggleReady,#roomJoin,#roomCreate,#roomLobbyRefresh");
 const exits=!!target.closest('#arenaExit,#chessExit,#tlExit,#ludoExit,#xqExit,#estateExit,#roomBoardExit,#roomLobbyExit,#roomHubExit,#mzBack');
 if(exits){leaveMobilePlay();refreshActive();return;}
 if(startsArena||startsZone||entersPvP){
  refreshActive();
  // PvP readiness is a direct user gesture before the async server begins the game.
  if(phone()&&(currentId||entersPvP))void requestMobileLandscape();
 }
 if(target.closest('[data-fullscreen-target]')){
  // The existing fullscreen controller handles the target. Lock orientation
  // when its fullscreenchange event arrives.
  refreshActive();
 }
});
document.addEventListener("fullscreenchange",()=>{
 if(document.fullscreenElement&&phone()){
  try{void screen.orientation?.lock?.("landscape").catch(()=>{});}catch{}
 }
 refreshActive();
});
window.addEventListener("orientationchange",syncOrientationPrompt);
window.addEventListener("resize",syncOrientationPrompt);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)refreshActive();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!document.fullscreenElement)syncOrientationPrompt();});
if(arena){
 for(const [id] of entries){
  const section=$(id);if(!section)continue;
  new MutationObserver(refreshActive).observe(section,{attributes:true,attributeFilter:["hidden"]});
 }
 // Hidden state may change on the next microtask after a PvP response.
}
if(zone){
 const section=$("mzArena");
 if(section)new MutationObserver(refreshActive).observe(section,{attributes:true,attributeFilter:["hidden"]});
}
refreshActive();
window.MRLeeArenaLive={announce,refreshActive,requestMobileLandscape};
