/* MR LEE Arena: interactive online chess / Tiến lên / color-card views.
 * Client-side rules are hints only; the Edge Function always validates legal turns.
 * Draw only the authenticated player's hand. Never invent opponent card faces.
 */
import * as Chess from "./chess-engine.js";
import * as TL from "./tienlen-engine.js";
import * as Colors from "./color-engine.js";
import {playingCard} from "./tienlen-fx.js";
function el(tag,cls="",content){
 const result=document.createElement(tag);
 if(cls)result.className=cls;
 if(content!==undefined)result.textContent=String(content);
 return result;
}
function btn(label,cls,click){
 const b=el("button",cls,label);b.type="button";if(click)b.addEventListener("click",click);return b;
}
const RELATIVE=["bottom","left","top","right"];
function relative(real,viewer){return RELATIVE[(real-viewer+4)%4];}
const portraits=["🧑","👩🏻","🧑🏻","👩🏽"];
function seatCard(player,room,counts){
 const players=room.players.length;
 const pos=room.game==="chess"||players===2?"top":
  players===3?(player.seat-room.seat+players)%players===1?"left":"right":
  relative(player.seat,room.seat);
 const holder=el("div","arena-pvp-seat"+(room.gameState.turn===player.seat?" active":""));
 holder.dataset.position=pos;holder.dataset.seat=String(player.seat);
 holder.append(el("span","",portraits[player.seat]),el("strong","",player.name),
  el("small","","🂠 "+(counts[player.seat]??0)+" lá còn lại"));
 const backs=el("div","arena-pvp-backs");
 for(let i=0;i<Math.min(5,counts[player.seat]??0);i++)backs.append(el("span","arena-back-mini"));
 if(room.status==="finished"&&Array.isArray(room.gameState?.revealedHands)){
  // The server reveals hidden cards only AFTER a verified settlement.
  backs.remove();
  const revealed=el("div","arena-pvp-seat-revealed");
  for(const card of room.gameState.revealedHands[player.seat]||[]){
   const label=room.game==="tienlen"?TL.label(card):Colors.cardLabel(card);
   const face=el("span","arena-next-round-card"+
    (room.game==="tienlen"&&card.suit>=2?" red":"")+
    (room.game==="colors"?" color":""),label);
   revealed.append(face);
  }
  if(!revealed.children.length)revealed.append(el("small","","✓ Hết bài"));
  holder.append(revealed);
 }else holder.append(backs);
 return holder;
}
function statusBanner(room){
 const state=room.gameState,turnName=room.players.find(p=>p.seat===state.turn)?.name||"đối thủ";
 return room.status==="finished"?
  ((state.winner===null||state.winner===-1)?"🤝 Ván hòa":state.winner===room.seat?"🏆 Bạn chiến thắng!":"🏆 "+(room.players.find(x=>x.seat===state.winner)?.name||"Đối thủ")+" thắng"):
  state.turn===room.seat?"✨ Đến lượt bạn":"⏳ Lượt của "+turnName;
}
export function mountOnlineCanvas(root,onMove){
 let chosenSquare=-1,chosenCards=new Set(),chosenWild=null,locked=false,lastCode="",lastVersion=-1,sortBy="rank";
 let shownRoom=null,clockOffset=0;
 const chessClockText=(seat)=>{
  const state=shownRoom?.gameState,clock=state?.clock;
  if(!clock)return "∞";
  let remaining=Number(clock.remaining?.[seat]||0);
  if(shownRoom.status==="playing"&&state.turn===seat&&clock.since)
   remaining-=Math.max(0,Date.now()+clockOffset-Date.parse(clock.since));
  remaining=Math.max(0,Math.ceil(remaining/1000));
  return Math.floor(remaining/60).toString().padStart(2,"0")+":"+
   (remaining%60).toString().padStart(2,"0");
 };
 const paintChessClock=()=>{
  if(!shownRoom||shownRoom.game!=="chess")return;
  for(const node of root.querySelectorAll("[data-chess-clock-seat]")){
   const seat=Number(node.dataset.chessClockSeat);
   node.textContent=chessClockText(seat);
   const remain=shownRoom.gameState?.clock?.remaining?.[seat];
   node.classList.toggle("urgent",Number.isFinite(remain)&&remain<30000&&
    shownRoom.status==="playing"&&shownRoom.gameState?.turn===seat);
   node.classList.toggle("active",shownRoom.status==="playing"&&shownRoom.gameState?.turn===seat);
  }
 };
 setInterval(paintChessClock,200);
 function clear(){
  chosenSquare=-1;chosenCards.clear();chosenWild=null;locked=false;lastCode="";lastVersion=-1;sortBy="rank";
  root.replaceChildren();shownRoom=null;
 }
 async function submit(action){
  if(locked)return;
  locked=true;
  try{
   await onMove(action);
   chosenCards.clear();chosenSquare=-1;chosenWild=null;
  }catch(error){
    // onMove renders the error in the board status overlay.
    console.warn("Arena move rejected:",error?.message||error);
  }finally{locked=false;}
 }
 function waiting(room,actions={}){
  // The room remains on the actual green card table while players join.
  // No hidden cards are rendered before the server creates the deal.
  const table=el("div",room.game==="chess"?"arena-chess-waiting":"arena-pvp-card-table arena-pvp-waiting");
  const count=room.players.length, max=room.capacity;
  const posFor=(seat)=>{
   if(seat===room.seat)return "bottom";
   const offset=(seat-room.seat+max)%max;
   if(max===2)return "top";
   if(max===3)return offset===1?"left":"right";
   return RELATIVE[offset]||"top";
  };
  for(let seat=0;seat<max;seat++){
   const player=room.players.find(p=>p.seat===seat),mine=seat===room.seat;
   const slot=el("div","arena-pvp-seat arena-pvp-wait-seat"+(player?.ready?" ready":"")+
    (!player?" vacant":""));
   slot.dataset.position=posFor(seat);
   slot.append(el("span","arena-pvp-wait-avatar",player?(mine?"🧑":"👤"):"＋"),
    el("strong","",player?.name||(room.locked?"Ghế đã khóa":"Đang chờ người...")),
    el("small","",player?(player.ready?"✓ Sẵn sàng":"Chưa sẵn sàng"):"Ghế "+(seat+1)));
   table.append(slot);
  }
  const middle=el("div","arena-pvp-wait-center");
  middle.append(el("div","arena-pvp-wait-eyebrow","🃏 PHÒNG ĐẤU TRỰC TUYẾN"),
   el("h3","",room.game==="tienlen"?"TIẾN LÊN MIỀN NAM":room.game==="chess"?"CỜ VUA":"BÀI MÀU"),
   el("div","arena-pvp-wait-code","Mã bàn: "+room.code),
   el("p","arena-pvp-wait-meta",count+"/"+max+" người · "+room.minGold+
    "G"+(room.game==="chess"?"/ván":"/lá")+(room.locked?" · 🔒 Đã khóa":" · 🔓 Đang mở")));
  const controls=el("div","arena-pvp-wait-actions");
  const click=(label,cls,handler,disabled=false)=>{
   const b=btn(label,cls,handler);b.disabled=disabled;controls.append(b);return b;
  };
  const mine=room.players.find(p=>p.seat===room.seat);
  click(mine?.ready?"↩ Bỏ sẵn sàng":"✓ Sẵn sàng","arena-primary",()=>actions.ready?.());
  if(room.game==="tienlen"&&room.isHost){
   click("▶ Bắt đầu ("+count+" người)","arena-action",()=>actions.start?.(),
    count<2||!room.players.every(p=>p.ready));
  }
  if(room.isHost)click(room.locked?"🔓 Mở khóa bàn":"🔒 Khóa bàn","arena-soft",()=>actions.lock?.());
  click("📋 Sao chép mã","arena-soft",()=>actions.copy?.());
  click("🔗 Mời bạn","arena-soft",()=>actions.invite?.());
  click("↻ Làm mới","arena-soft",()=>actions.refresh?.());
  if(room.game==="chess"){
   const position=Chess.start(),preview=el("div","arena-chess-preview");
   for(let rank=0;rank<8;rank++)for(let file=0;file<8;file++){
    const p=position.b[rank*16+file];
    preview.append(el("span",(rank+file)%2?"dark":"light",Chess.GLYPHS[p]||""));
   }
   middle.append(preview);
   middle.querySelector(".arena-pvp-wait-meta").textContent=
    room.timeControl==="none"?"♟ Không đồng hồ · "+room.minGold+"G/ván":
    "♟ "+(room.timeControl||"10+0")+" · "+room.minGold+"G/ván";
  }
  middle.append(controls,
   el("p","arena-pvp-wait-tip",room.game==="tienlen"?
    "Từ 2 người có thể chơi. Mọi người nhấn Sẵn sàng, chủ bàn nhấn Bắt đầu.":
    "Mọi người nhấn Sẵn sàng. Khi đủ người, trận sẽ bắt đầu."));
  table.append(middle);
  root.replaceChildren(table);
  lastCode=room.code;lastVersion=room.version;
 }
 function renderChess(room){
  const state=room.gameState,position=state.position;
  const myColor=room.seat===0?1:-1,mine=state.turn===room.seat&&room.status==="playing";
  const frame=el("div","arena-pvp-chess"),board=el("div","chess-board"),sidebar=el("aside","arena-panel");
  board.setAttribute("aria-label","Bàn cờ PvP, "+(room.seat===0?"trắng":"đen")+" ở dưới");
  const allowed=mine?Chess.legal(position):[];
  const hits=allowed.filter(m=>m[0]===chosenSquare).map(m=>m[1]);
  const reverse=room.seat===1;
  for(let rr=0;rr<8;rr++)for(let cc=0;cc<8;cc++){
   const row=reverse?7-rr:rr,col=reverse?7-cc:cc,index=row*16+col,piece=position.b[index];
   const tile=btn("","chess-square "+((row+col)%2?"dark":"light")+
     (chosenSquare===index?" chosen":"")+(hits.includes(index)?" target":""),()=>{
    if(!mine||locked)return;
    const choices=allowed.filter(m=>m[0]===chosenSquare&&m[1]===index);
    if(choices.length===1){void submit({uci:Chess.uci(choices[0])});return;}
    if(choices.length>1){
     const promotion=sidebar.querySelector(".arena-pvp-options");
     promotion.replaceChildren(el("strong","","Chọn quân phong cấp:"));
     for(const type of ["q","r","b","n"]){
      const selected=choices.find(m=>m[2]===type);
      if(selected)promotion.append(btn(Chess.GLYPHS[myColor===1?type.toUpperCase():type],
       "arena-soft",()=>void submit({uci:Chess.uci(selected)})));
     }
     return;
    }
    chosenSquare=Chess.side(piece)===myColor?(chosenSquare===index?-1:index):-1;
    render(room,true);
   });
   tile.dataset.square=Chess.square(index);
   tile.setAttribute("aria-label",Chess.square(index)+(piece==="."?" trống":" "+piece));
   if(piece!==".")tile.append(el("span",Chess.side(piece)===1?"chess-white":"chess-black",Chess.GLYPHS[piece]));
   if(hits.includes(index)&&piece===".")tile.append(el("span","chess-dot"));
   if(cc===0)tile.append(el("small","chess-rank",String(8-row)));
   if(rr===7)tile.append(el("small","chess-file","abcdefgh"[col]));
   board.append(tile);
  }
  sidebar.append(el("h3","","♟ "+statusBanner(room)),
   el("p","arena-pvp-info","Bạn cầm quân "+(room.seat===0?"trắng":"đen")+". Chọn quân và ô đích, máy chủ xác nhận nước đi."));
  const opts=el("div","arena-pvp-options");sidebar.append(opts);
  const log=el("div","arena-pvp-moves");
  state.notation.forEach((n,i)=>log.append(el("p","",Math.floor(i/2)+1+(i%2?"... ":" . ")+n)));
  sidebar.append(el("h3","","Biên bản"),log);
  if(room.status==="finished")sidebar.append(el("p","arena-pvp-game-over",statusBanner(room)));
  const boardStack=el("div","arena-chess-board-stack");
  const makeClockPlayer=(seat,label)=>{
   const bar=el("div","arena-chess-player-bar"+(state.turn===seat?" active":""));
   const identity=el("div","arena-chess-player-identity");
   identity.append(el("span","arena-chess-player-avatar",seat===0?"♔":"♚"),
     el("strong","",room.players.find(p=>p.seat===seat)?.name||label));
   const clock=el("time","arena-chess-digital-clock",chessClockText(seat));
   clock.dataset.chessClockSeat=String(seat);
   clock.setAttribute("role","timer");
   clock.setAttribute("aria-label","Đồng hồ "+(seat===0?"quân trắng":"quân đen"));
   bar.append(identity,clock);return bar;
  };
  const topSeat=room.seat===0?1:0;
  boardStack.append(makeClockPlayer(topSeat,"Đối thủ"),board,makeClockPlayer(room.seat,"Bạn"));
  const timeBadge=el("div","arena-chess-time-badge","⏱ "+
    (room.timeControl==="none"?"Luyện tập · không đồng hồ":room.timeControl));
  sidebar.prepend(timeBadge);
  frame.append(boardStack,sidebar);
  root.replaceChildren(frame);
 }
 function renderSeats(room,counts,board){
  const viewer=room.seat;
  for(const player of room.players){
   if(player.seat===viewer)continue;
   board.append(seatCard(player,room,counts));
  }
 }
 function renderTienLen(room){
  const state=room.gameState,myTurn=state.turn===room.seat&&room.status==="playing";
  const board=el("div","arena-pvp-card-table online-tl-board");
  renderSeats(room,state.counts,board);
  const center=el("div","arena-pvp-center"),current=el("div","arena-pvp-current");
  if(!state.played?.length)current.append(el("span","arena-pvp-info","Vòng mới · chưa có bài trên bàn"));
  else for(const c of state.played)current.append(playingCard(c));
  center.append(el("strong","",statusBanner(room)),current,
   el("small","",""+(state.last?.combo?.type||"Vòng mở")+" · "+(state.last?.player!==undefined?
    "Bộ trước: "+(room.players.find(x=>x.seat===state.last.player)?.name||"người chơi"):"")));
  const lastEvent=state.history?.at(-1);
  if(lastEvent)center.append(el("p","arena-online-tl-notice",lastEvent));
  board.append(center);
  const bottom=el("div","arena-pvp-human");
  const name=room.players.find(p=>p.seat===room.seat)?.name||"Bạn";
  bottom.append(el("div","arena-pvp-human-hud","🧑 "+name+" · Bàn "+room.minGold+"G/lá · 🂠 "+state.myHand.length+" lá"));
  const hand=el("div","arena-pvp-hand");
  const dummy={winner:state.winner,turn:state.turn,first:state.first,last:state.last,
   hands:[[],[],[],[]]};
  dummy.hands[room.seat]=state.myHand;
  const sortedHand=[...state.myHand].sort((a,b)=>sortBy==="suit"?
   a.suit-b.suit||a.rank-b.rank:a.rank-b.rank||a.suit-b.suit);
  for(const c of sortedHand){
   const card=btn("",""+(chosenCards.has(c.id)?"selected":""),()=>{
    if(!myTurn||locked)return;
    if(chosenCards.has(c.id))chosenCards.delete(c.id);else chosenCards.add(c.id);
    render(room,true);
   });
   card.disabled=!myTurn||locked;card.dataset.cardId=c.id;
   card.setAttribute("aria-label",TL.label(c));
   card.append(playingCard(c));hand.append(card);
  }
  bottom.append(hand);
  const actions=el("div","arena-pvp-actions");
  const legal=chosenCards.size>0&&TL.canPlay(dummy,room.seat,[...chosenCards]);
  const play=btn("🃏 Đánh bài","arena-primary",()=>void submit({kind:"play",ids:[...chosenCards]}));
  play.disabled=!myTurn||!legal||locked;
  const pass=btn("Bỏ lượt","arena-soft",()=>void submit({kind:"pass"}));
  pass.disabled=!myTurn||!state.last||locked;
  const suggest=btn("💡 Gợi ý","arena-action",()=>{
   const matches=TL.options(state.myHand).filter(cs=>TL.canPlay(dummy,room.seat,cs.map(c=>c.id)));
   if(!matches.length)return;
   matches.sort((a,b)=>state.last?a.length-b.length||TL.analyze(a).high-TL.analyze(b).high:
    b.length-a.length||TL.analyze(a).high-TL.analyze(b).high);
   chosenCards=new Set(matches[0].map(c=>c.id));render(room,true);
  });
  suggest.disabled=!myTurn||locked;
  const sort=btn(sortBy==="rank"?"⇅ Xếp theo chất":"⇅ Xếp theo giá trị","arena-soft",()=>{
   sortBy=sortBy==="rank"?"suit":"rank";render(room,true);
  });
  const clearSelection=btn("✕ Bỏ chọn","arena-soft",()=>{
   chosenCards.clear();render(room,true);
  });
  clearSelection.disabled=chosenCards.size===0||locked;
  actions.append(play,pass,suggest,sort,clearSelection);bottom.append(actions);
  board.append(bottom);
  const events=el("div","arena-pvp-events");
  (state.history||[]).slice(-5).reverse().forEach(line=>events.append(el("p","",line)));
  root.replaceChildren(board,events);
 }
 function colorFace(c,small=false){
  const label=Colors.cardLabel(c);
  const face=el("span","arena-pvp-color-card "+(c.color||"wild"),label);
  face.setAttribute("aria-label",label+(c.color?" "+Colors.COLOR_VI[c.color]:""));
  if(small)face.classList.add("small");
  return face;
 }
 function renderColors(room){
  const state=room.gameState,myTurn=state.turn===room.seat&&room.status==="playing";
  const board=el("div","arena-pvp-card-table online-color-board");
  renderSeats(room,state.counts,board);
  const center=el("div","arena-pvp-center"),top=el("div","arena-pvp-current");
  top.append(colorFace(state.top));
  center.append(el("strong","",statusBanner(room)),top,
   el("small","","Màu hiện tại: "+Colors.COLOR_VI[state.activeColor]+
    (state.direction===-1?" • Hướng ngược chiều":"")));
  board.append(center);
  const hand=el("div","arena-pvp-hand"),bottom=el("div","arena-pvp-human");
  const me=room.players.find(p=>p.seat===room.seat)?.name||"Bạn";
  bottom.append(el("div","arena-pvp-human-hud","🧑 "+me+" • Bàn "+room.minGold+"G/lá • 🃏 "+state.myHand.length+" lá"));
  const dummy={winner:state.winner,turn:state.turn,hands:[[],[],[],[]],
   discard:[state.top],activeColor:state.activeColor,drawnCardId:state.drawnCardId};
  dummy.hands[room.seat]=state.myHand;
  for(const card of state.myHand){
   const legal=myTurn&&Colors.canPlay(dummy,card,room.seat);
   const b=btn("","",()=>{
    if(!legal||locked)return;
    if(card.type==="wild"||card.type==="wild4"){
     chosenWild=card.id;render(room,true);
    }else void submit({kind:"play",cardId:card.id});
   });
   b.disabled=!legal||locked;b.dataset.cardId=String(card.id);
   b.setAttribute("aria-label",Colors.cardLabel(card));b.append(colorFace(card));
   hand.append(b);
  }
  bottom.append(hand);
  if(chosenWild!==null){
   const choices=el("div","arena-pvp-options");
   choices.append(el("strong","","Chọn màu:"));
   for(const color of Colors.COLORS){
    const b=btn(Colors.COLOR_VI[color],"arena-soft",()=>void submit({kind:"play",cardId:chosenWild,color}));
    choices.append(b);
   }
   choices.append(btn("Hủy","arena-soft",()=>{chosenWild=null;render(room,true);}));
   bottom.append(choices);
  }else{
   const actions=el("div","arena-pvp-actions");
   const draw=btn("🃏 Rút 1 lá","arena-primary",()=>void submit({kind:"draw"}));
   draw.disabled=!myTurn||state.drawnCardId!==null||locked;
   const pass=btn("Qua lượt","arena-soft",()=>void submit({kind:"pass"}));
   pass.disabled=!myTurn||state.drawnCardId===null||locked;
   actions.append(draw,pass);bottom.append(actions);
  }
  board.append(bottom);
  const log=el("div","arena-pvp-events");
  (state.events||[]).slice(-5).reverse().forEach(e=>log.append(el("p","",e)));
  root.replaceChildren(board,log);
 }
 function render(room,force=false){
  if(!room?.gameState)return;
  shownRoom=room;
  clockOffset=Date.parse(room.serverTime||"")-Date.now()||0;
  if(room.code!==lastCode){chosenSquare=-1;chosenCards.clear();chosenWild=null;lastVersion=-1;}
  if(!force&&room.code===lastCode&&room.version===lastVersion)return;
  if(room.version!==lastVersion&&!force){chosenSquare=-1;chosenCards.clear();chosenWild=null;}
  lastCode=room.code;lastVersion=room.version;
  if(room.game==="chess")renderChess(room);
  else if(room.game==="tienlen")renderTienLen(room);
  else renderColors(room);
 }
 return {render,waiting,clear};
}
