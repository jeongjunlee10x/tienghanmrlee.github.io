/* MR LEE Game Arena — local sandbox. Wins/XP/gold here are not official rewards. */
import {newGame,canPlay,play,beginDraw,pass,botTurn,cardLabel,topCard,
  COLOR_VI,COLORS,PLAYER_NAMES} from "./color-engine.js";
import {mountChess} from "./chess-ui.js?v=20261106-gesture-r13";
import {mountTienLen} from "./tienlen-ui.js?v=20261106-turn-v16";
import {mountArenaRooms} from "./rooms-ui.js?v=20261106-turn-v16";
import {mountLudo} from "./ludo.js?v=20261106-gesture-r13";
import {mountXiangqi} from "./xiangqi.js?v=20261106-gesture-r13";
import {mountEstate} from "./estate.js?v=20261106-gesture-r13";
import {enablePointerDrag,animateBoardMove} from "./drag-gestures.js?v=20261106-drag-r2";
const $=id=>document.getElementById(id);
const state={game:null,tickets:Infinity,gold:0,xp:0,wins:0,losses:0,pending:null,
  timer:null,epoch:0,settled:false,leaving:false};
function updateWallet(){
 $("arenaGold").textContent=state.gold.toLocaleString("vi-VN");
 $("arenaXp").textContent=state.xp.toLocaleString("vi-VN");
 $("arenaTickets").textContent="∞";
 $("arenaRecord").textContent=state.wins+" / "+state.losses;
}
function el(tag,cl,text){
 const x=document.createElement(tag);if(cl)x.className=cl;
 if(text!==undefined)x.textContent=String(text);return x;
}
function button(text,cl,onclick){
 const b=el("button",cl,text);b.type="button";
 if(onclick)b.addEventListener("click",onclick);
 return b;
}
function flash(text){
 const turn=$("arenaTurn");turn.textContent=text;
}
function presentCard(card,small=false){
 const span=el("span","arena-card-symbol",cardLabel(card));
 const cardEl=el("span","arena-card-face arena-card-"+(card.color||"wild"));
 const motif=el("span","arena-card-motif",card.type==="number"?String(card.value):"✦");
 cardEl.append(span,motif);
 cardEl.dataset.type=card.type;
 if(small)cardEl.classList.add("small");
 return cardEl;
}
function showTable(){
 $("arenaLobby").hidden=true;$("arenaTable").hidden=false;
 $("arenaOutcome").hidden=true;
 $("arenaTable").scrollIntoView({behavior:"smooth",block:"start"});
}
let chessController=null,tienLenController=null;
let ludoController=null,xiangqiController=null,estateController=null;
const extraSections=["arenaLudo","arenaXiangqi","arenaEstate"];
function hideExtraGames(){
 ludoController?.stop();xiangqiController?.stop();estateController?.stop();
 extraSections.forEach(id=>$(id).hidden=true);
}
function showLobby(){
 if(state.timer){clearTimeout(state.timer);state.timer=null;}
 chessController?.stop();tienLenController?.stop();hideExtraGames();
 $("arenaChess").hidden=true;$("arenaTienLen").hidden=true;
 roomController?.stop();
 state.epoch++;
 state.pending=null;state.game=null;state.settled=false;
 $("arenaTable").hidden=true;$("arenaLobby").hidden=false;
 $("arenaLobby").scrollIntoView({behavior:"smooth",block:"start"});
}
function start(){
 if(state.tickets<1){
  $("arenaLobby").scrollIntoView({behavior:"smooth",block:"start"});
  const alert=el("p","arena-empty-tickets",
   "Đã dùng hết 3 vé thử trong phiên này. Chưa hỗ trợ đổi điểm học tập thành vé. Hãy quay về học để tiếp tục.");
  $("arenaCatalog").after(alert);
  setTimeout(()=>alert.remove(),7000);
  return;
 }
 if(state.timer)clearTimeout(state.timer);
 state.epoch++;
 /* Đấu máy luyện tập miễn phí: không trừ vé chơi thử. */
 state.pending=null;
 state.game=newGame();
 state.settled=false;
 $("arenaChess").hidden=true;$("arenaTienLen").hidden=true;hideExtraGames();
 updateWallet();showTable();render();
}
function colorChoice(card){
 state.pending=card.id;
 const container=$("arenaColorPicker"),list=$("arenaColorOptions");
 list.replaceChildren();
 for(const color of COLORS){
  const b=button(COLOR_VI[color],"arena-choose arena-card-"+color,()=>{
   if(state.pending===null||!state.game)return;
   try{
    play(state.game,0,state.pending,color);
    state.pending=null;container.hidden=true;render();
   }catch(err){flash(err.message);}
  });
  list.append(b);
 }
 container.hidden=false;container.scrollIntoView({block:"nearest"});
}
function settle(){
 if(!state.game||state.settled||state.game.winner===null)return;
 state.settled=true;
 const won=state.game.winner===0;
 if(won){state.gold+=100;state.xp+=50;state.tickets++;state.wins++;}
 else {state.xp+=10;state.losses++;}
 updateWallet();
 const winName=PLAYER_NAMES[state.game.winner];
 const outcome=$("arenaOutcome");outcome.hidden=false;outcome.replaceChildren();
 const headline=el("h2","",won?"🏆 CHIẾN THẮNG!":"💫 KẾT THÚC VÁN");
 const summary=el("p","",won?
   "Bạn đã hết bài trước cả 3 đối thủ. +100 vàng và +50 EXP demo. Có thể chơi tiếp miễn phí.":
   winName+" đã về nhất. Bạn nhận +10 EXP demo và có thể chơi tiếp miễn phí.");
 const caution=el("p","arena-disclaimer",
   "Không trừ điểm học tập; vàng, EXP và vé chỉ tồn tại trong phiên này. Không có chuyển đổi tiền thật.");
 const actions=el("div","arena-outcome-actions");
 const replay=button("🔄 Chơi tiếp","arena-primary",start);
 const exit=button("Về sảnh","arena-soft",showLobby);
 actions.append(replay,exit);outcome.append(headline,summary,caution,actions);
 outcome.classList.add("arena-match-result");
 $("arenaTable").querySelector(".arena-board").append(outcome);
 flash(won?"Bạn đã chiến thắng!":"Người thắng: "+winName);
}
function renderOpponents(g){
 const area=$("arenaOpponents");area.replaceChildren();
 for(let i=1;i<=3;i++){
  const panel=el("div","arena-opponent"+(g.turn===i?" active":""));
  const avatar=el("div","arena-avatar",["","👩🏻","🧑🏻","👩🏽"][i]);
  if(g.turn===i&&g.winner===null){
   avatar.classList.add("arena-avatar-active");
   avatar.append(el("span","arena-avatar-turn-sign","LƯỢT"));
  }
  const detail=el("div","arena-opponent-info");
  detail.append(el("strong","",PLAYER_NAMES[i]),el("small","",g.hands[i].length+" lá bài"));
  panel.append(avatar,detail);
  if(g.turn===i)panel.append(el("em","arena-thinking","● ĐANG ĐÁNH"));
  area.append(panel);
 }
}
function render(){
 const g=state.game;
 if(!g||$("arenaTable").hidden)return;
 renderOpponents(g);
 const top=$("arenaTopCard");top.replaceChildren(presentCard(topCard(g)));
 top.setAttribute("aria-label","Lá trên bàn: "+cardLabel(topCard(g))+"; màu "+COLOR_VI[g.activeColor]);
 const active=$("arenaActiveColor");active.textContent=COLOR_VI[g.activeColor];active.dataset.color=g.activeColor;
 const humanTurn=g.turn===0&&g.winner===null;
 $("arenaHandCount").textContent=g.hands[0].length+" lá · "+(humanTurn?"✨ ĐẾN LƯỢT BẠN":"Đang chờ");
 const meLabel=$("arenaHand").previousElementSibling;
 meLabel?.classList.toggle("is-turn",humanTurn);
 const controls=$("arenaDraw").closest(".arena-turn-controls");
 if(controls){
  controls.classList.add("arena-card-turn-popup");
  controls.hidden=!humanTurn;
  controls.setAttribute("aria-label","Thao tác khi đến lượt bạn");
  if(controls.parentElement!==$("arenaHand").parentElement)
   $("arenaHand").after(controls);
 }

 const list=$("arenaHand");list.replaceChildren();
 g.hands[0].forEach(card=>{
  const legal=humanTurn&&canPlay(g,card,0);
  const b=button("","arena-hand-card"+(legal?" playable":""),()=>{
   if(!state.game||state.pending!==null)return;
   try{
    if(card.type==="wild"||card.type==="wild4")colorChoice(card);
    else {
     const from=b,to=$("arenaTopCard");
     animateBoardMove({from,to,piece:b.querySelector(".arena-card-face"),kind:"color-card"});
     play(state.game,0,card.id);render();
    }
   }catch(err){flash(err.message);}
  });
  b.disabled=!legal||state.pending!==null;b.dataset.cardId=String(card.id);
  b.append(presentCard(card));
  b.setAttribute("aria-label",cardLabel(card)+" "+(card.color?COLOR_VI[card.color]:"đặc biệt"));
  list.append(b);
 });
 const draw=$("arenaDraw"),go=$("arenaPass");
 draw.disabled=!humanTurn||g.drawnCardId!==null||state.pending!==null;
 go.hidden=!humanTurn||g.drawnCardId===null;
 go.disabled=state.pending!==null;
 const winner=g.winner;
 if(winner!==null){
  flash(PLAYER_NAMES[winner]+" đã thắng ván!");
 }else if(humanTurn){
  flash(g.drawnCardId===null?"Lượt của bạn: kéo lá hợp lệ vào giữa bàn, chạm đánh hoặc rút bài.":
   "Bạn đã rút 1 lá. Có thể đánh lá vừa rút nếu hợp lệ, hoặc bỏ lượt.");
 }else flash("Đang chờ "+PLAYER_NAMES[g.turn]+" ra bài…");
 const history=$("arenaEventLog");history.replaceChildren();
 g.events.slice(-7).reverse().forEach(message=>history.append(el("p","",message)));
 if(winner!==null){settle();return;}
 if(!humanTurn&&state.pending===null)scheduleBot();
}
function scheduleBot(){
 if(!state.game||state.timer)return;
 const epoch=state.epoch;
 state.timer=setTimeout(()=>{
  state.timer=null;
  if(epoch!==state.epoch||!state.game||state.game.turn===0||state.game.winner!==null)return;
  try{botTurn(state.game,Math.random,$("colorsLevel")?.value||"normal");render();}
  catch(err){flash("Đối thủ tạm dừng: "+err.message);}
 },650);
}
// Lift a colored card, move it across the table and release over the pile.
// The original color-engine checks legality; invalid drops return to the hand.
enablePointerDrag({
 root:$("arenaTable"),itemSelector:"#arenaHand .arena-hand-card[data-card-id]",
 targetSelector:".arena-board-center",previewSelector:".arena-card-face",
 canStart:item=>{
  const g=state.game,id=Number(item.dataset.cardId);
  return Boolean(g&&g.turn===0&&g.winner===null&&state.pending===null&&
   g.hands[0].some(card=>card.id===id&&canPlay(g,card,0)));
 },
 canDrop:(item)=>Boolean(state.game&&state.game.turn===0&&state.game.winner===null&&
  state.game.hands[0].some(card=>card.id===Number(item.dataset.cardId)&&canPlay(state.game,card,0))),
 onDrop:item=>{
  const g=state.game,id=Number(item.dataset.cardId);
  const card=g?.hands[0]?.find(c=>c.id===id);
  if(!card||!canPlay(g,card,0))return false;
  try{
   if(card.type==="wild"||card.type==="wild4")colorChoice(card);
   else{play(g,0,id);render();}
   return true;
  }catch(error){flash(error.message);return false;}
 }
});
$("arenaCatalog").querySelector("[data-game=colors]").addEventListener("click",start);
$("arenaExit").addEventListener("click",showLobby);
$("arenaDraw").addEventListener("click",()=>{
 const g=state.game;if(!g||g.turn!==0||state.pending!==null)return;
 try{beginDraw(g,0);render();}catch(err){flash(err.message);}
});
$("arenaPass").addEventListener("click",()=>{
 const g=state.game;if(!g||g.turn!==0||state.pending!==null)return;
 try{pass(g,0);render();}catch(err){flash(err.message);}
});
$("arenaColorCancel").addEventListener("click",()=>{
 state.pending=null;$("arenaColorPicker").hidden=true;render();
});
$("arenaRules").addEventListener("click",()=>$("arenaRulesDialog").showModal());
$("arenaRulesClose").addEventListener("click",()=>$("arenaRulesDialog").close());
$("arenaRulesDialog").addEventListener("click",e=>{
 if(e.target===$("arenaRulesDialog"))$("arenaRulesDialog").close();
});
updateWallet();


// Independent strategy games share only the demo wallet; no grade/SQL writes.
function startStrategy(mode){
 if(state.tickets<1){
  const warn=document.createElement("p");warn.className="arena-empty-tickets";
  warn.textContent="Bạn đã dùng hết vé demo. Không trừ điểm học tập để mua thêm.";
  $("arenaCatalog").after(warn);setTimeout(()=>warn.remove(),7000);
  showLobby();return false;
 }
 if(state.timer!==null)clearTimeout(state.timer);state.timer=null;
 state.epoch++;/* Đấu máy luyện tập miễn phí: không trừ vé chơi thử. */state.pending=null;state.game=null;
 $("arenaLobby").hidden=true;$("arenaTable").hidden=true;
 $("arenaChess").hidden=mode!=="chess";$("arenaTienLen").hidden=mode!=="tienlen";
 extraSections.forEach(id=>$(id).hidden=id!=="arena"+({ludo:"Ludo",xiangqi:"Xiangqi",estate:"Estate"}[mode]||"__none__"));
 [ludoController,xiangqiController,estateController].forEach((controller,i)=>{
  if(["ludo","xiangqi","estate"][i]!==mode)controller?.stop();
 });
 updateWallet();return true;
}
function settleStrategy(result,label,root){
 if(root.querySelector(".arena-game-result"))return;
 if(result==="win"){state.gold+=100;state.xp+=50;state.tickets++;state.wins++;}
 else if(result==="draw"){state.xp+=20;}
 else {state.xp+=10;state.losses++;}
 updateWallet();
 const panel=document.createElement("div");panel.className="arena-outcome arena-game-result";
 const title=document.createElement("h2");title.textContent=result==="win"?"🏆 BẠN CHIẾN THẮNG":
  result==="draw"?"🤝 VÁN HÒA":"💫 HẾT VÁN";
 const note=document.createElement("p");note.textContent=label+" · "+
  (result==="win"?"+100 vàng demo, +50 EXP demo · chơi tiếp miễn phí":
   result==="draw"?"+20 EXP demo":" +10 EXP demo");
 const caution=document.createElement("p");caution.className="arena-disclaimer";
 caution.textContent="Vàng và EXP chỉ dùng trong phiên. Không ảnh hưởng điểm kiểm tra, TOPIK Spark hoặc điểm thưởng học tập.";
 const actions=document.createElement("div");actions.className="arena-outcome-actions";
 const restartByGame={
  arenaChess:()=>chessController?.start(),arenaTienLen:()=>tienLenController?.start(),
  arenaLudo:()=>ludoController?.start(),arenaXiangqi:()=>xiangqiController?.start(),
  arenaEstate:()=>estateController?.start()
 };
 const playAgain=restartByGame[root.id];
 if(playAgain)actions.append(button("▶ CHƠI VÁN TIẾP","arena-primary",playAgain));
 const exit=button("← Về sảnh","arena-soft",showLobby);
 actions.append(exit);panel.append(title,note,caution,actions);
 panel.classList.add("arena-match-result");
 (root.querySelector(".tl-board, .chess-main, .ludo-board, .xq-board-wrap, .estate-board")||root).append(panel);
}
ludoController=mountLudo({
 onStart:()=>startStrategy("ludo"),onFinish:settleStrategy,onExit:showLobby
});
xiangqiController=mountXiangqi({
 onStart:()=>startStrategy("xiangqi"),onFinish:settleStrategy,onExit:showLobby
});
estateController=mountEstate({
 onStart:()=>startStrategy("estate"),onFinish:settleStrategy,onExit:showLobby
});
chessController=mountChess({
 onStart:()=>startStrategy("chess"),
 onFinish:settleStrategy,
 onExit:showLobby
});
tienLenController=mountTienLen({
 onStart:()=>startStrategy("tienlen"),
 onFinish:settleStrategy,
 onExit:showLobby,
 getGold:()=>state.gold,
 getPlayerName:()=>"Bạn"
});
$("arenaCatalog").querySelector('[data-game="chess"]').addEventListener("click",()=>chessController.start());
$("arenaCatalog").querySelector('[data-game="tienlen"]').addEventListener("click",()=>tienLenController.start());
for(const [game,controller] of [["ludo",ludoController],["xiangqi",xiangqiController],["estate",estateController]]){
 $("arenaCatalog").querySelector('[data-game="'+game+'"]').addEventListener("click",()=>controller.start());
}


// Shared PvP lobby runs separately from the local bot economy. All remote G is
// read from the Firebase-verified Edge API, never from demo state.gold.
let roomController=mountArenaRooms({
 onEnter:()=>{
  if(state.timer)clearTimeout(state.timer);state.timer=null;
  chessController?.stop();tienLenController?.stop();hideExtraGames();
  $("arenaLobby").hidden=true;$("arenaTable").hidden=true;
  $("arenaChess").hidden=true;$("arenaTienLen").hidden=true;
  state.game=null;state.epoch++;
 },
 onExit:showLobby,
 onWallet:()=>{}
});
void roomController.refreshWallet().catch(()=>{});

function toast(message){
 const node=$("arenaToast");if(!node)return;
 node.textContent=message;node.hidden=false;
 clearTimeout(toast._timer);
 toast._timer=setTimeout(()=>node.hidden=true,2300);
}
function openPseudoFullscreen(target){
 target.classList.add("arena-fallback-fullscreen");
 document.body.classList.add("arena-fullscreen-active");
 toast("⛶ Toàn màn hình · Nhấn ESC để thoát");
}
function leavePseudoFullscreen(){
 document.querySelector(".arena-fallback-fullscreen")?.classList.remove("arena-fallback-fullscreen");
 document.body.classList.remove("arena-fullscreen-active");
}
document.querySelectorAll("[data-fullscreen-target]").forEach(control=>{
 control.addEventListener("click",async()=>{
  const target=$(control.dataset.fullscreenTarget);
  if(!target)return;
  if(document.fullscreenElement===target){await document.exitFullscreen();return;}
  if(target.classList.contains("arena-fallback-fullscreen")){leavePseudoFullscreen();return;}
  try{
   if(!target.requestFullscreen)throw Error("not supported");
   await target.requestFullscreen();
  }catch{openPseudoFullscreen(target);}
 });
});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape")leavePseudoFullscreen();
});
document.addEventListener("fullscreenchange",()=>{
 document.querySelectorAll("[data-fullscreen-target]").forEach(control=>{
  control.textContent=document.fullscreenElement?.id===control.dataset.fullscreenTarget?
   "↙ Thu nhỏ":"⛶ Toàn màn hình";
 });
});
// Ready signal for the six dedicated game pages; original controllers remain authoritative.
document.documentElement.dataset.arenaAppReady="1";
window.dispatchEvent(new Event("mrlee:arena-ready"));

