/* MR LEE Game Arena progressive visual motion.
 * Visual-only FLIP / path keyframes after rule-validating game engines render.
 * Animation never delays server scoring, never mutates rules and supports reduced motion.
 */
import {TRACK,STARTS,LANE} from "./ludo.js";
const $=id=>document.getElementById(id);
const lowMotion=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
const center=rect=>({x:rect.left+rect.width/2,y:rect.top+rect.height/2});
const position=n=>center(n.getBoundingClientRect());
function translateKey(x,y,scale=1,offset){
 const frame={transform:"translate3d("+Math.round(x)+"px,"+Math.round(y)+"px,0) scale("+scale+")"};
 if(offset!==undefined)frame.offset=offset;
 return frame;
}
function animateToken(el,frames,duration=480){
 if(lowMotion()||!el?.animate||frames.length<2)return;
 try{el.animate(frames,{duration,easing:"ease-in-out",composite:"replace"}).finished.catch(()=>{});}
 catch{}
}
function pulse(el,cls,ms=620){
 if(!el||lowMotion())return;
 el.classList.remove(cls);
 void el.offsetWidth;
 el.classList.add(cls);
 setTimeout(()=>el.classList.remove(cls),ms);
}
function flight(piece,source,landing,duration=430){
 if(!piece||!source||!landing||lowMotion())return;
 const a=position(source),b=position(landing),dx=a.x-b.x,dy=a.y-b.y;
 if(!Number.isFinite(dx+dy)||Math.hypot(dx,dy)>1400)return;
 animateToken(piece,[translateKey(dx,dy,.92),translateKey(dx*.28,dy*.22,1.06,.75),translateKey(0,0)],duration);
}
// Cờ Vua & Cờ Tướng: animate only when an actual legal move is recorded.
// Redrawing selection/hints/board flip never replays move FX.
function watchMoves(board,selector,kind){
 if(!board)return;
 let previous=0;
 new MutationObserver(()=>{
  const count=Number(board.dataset.moveIndex)||0;
  if(count<=previous){previous=count;return;}
  previous=count;
  const pair=(board.dataset.lastMove||"").split(",");if(pair.length!==2)return;
  const src=board.querySelector(selector(pair[0]));
  const dest=board.querySelector(selector(pair[1]));
  const piece=dest?.querySelector(kind==="chess"?".chess-white,.chess-black":".xq-piece");
  if(!src||!dest||!piece)return;
  flight(piece,src,dest,kind==="chess"?380:470);
  pulse(dest,kind==="chess"?"chess-arrive":"xq-arrive",510);
 }).observe(board,{attributes:true,attributeFilter:["data-move-index"]});
}
watchMoves($("chessBoard"),square=>'[data-square="'+CSS.escape(square)+'"]',"chess");
watchMoves($("xqBoard"),idx=>'[data-index="'+String(Number(idx))+'"]',"xiangqi");
// Bài Màu: show the actual played face animating into the discard pile;
// newly drawn cards fan in from the right. No fake move/success FX.
const top=$("arenaTopCard");
if(top){
 let previous="",handSize=0;
 new MutationObserver(()=>{
  if($("arenaTable")?.hidden)return;
  const label=top.getAttribute("aria-label")||"";
  if(!label||label===previous)return;previous=label;
  pulse(top,"arena-top-fx",550);
 }).observe(top,{attributes:true,attributeFilter:["aria-label"]});
 const hand=$("arenaHand");
 if(hand)new MutationObserver(()=>{
  if($("arenaTable")?.hidden)return;
  const cards=hand.querySelectorAll(".arena-hand-card");
  if(cards.length>handSize){
   const added=cards.length-handSize;
   cards.forEach((card,i)=>{if(i>=cards.length-added)pulse(card,"arena-card-drawn",530);});
  }
  handSize=cards.length;
 }).observe(hand,{childList:true});
}
function ludoCoord(who,progress,pawn){
 if(progress===-1)return null;
 if(progress===58)return [6+(who>=2?1:0),6+(who===1||who===2?1:0)];
 if(progress>=52)return LANE[who]?.[progress-52]||null;
 if(progress>=0&&progress<52)return TRACK[(STARTS[who]+progress)%52];
 return null;
}
function watchLudo(){
 const board=$("ludoBoard");if(!board)return;
 let old=new Map();
 const probe=()=>{
  const fresh=new Map(),nodes=board.querySelectorAll("[data-pawn][data-progress]");
  for(const pawn of nodes){
   const id=pawn.dataset.pawn,p=Number(pawn.dataset.progress);
   fresh.set(id,{p,point:position(pawn),node:pawn});
   const prev=old.get(id);
   if(!prev||prev.p===p||p<0||p-prev.p>12||lowMotion())continue;
   const [who]=id.split("-").map(Number),end=position(pawn);
   const frames=[translateKey(prev.point.x-end.x,prev.point.y-end.y,1,0)];
   const steps=Math.max(1,p-prev.p);
   for(let progress=prev.p+1;progress<=p;progress++){
    const xy=ludoCoord(who,progress);
    const cell=xy&&board.querySelector('[data-cell="'+xy[0]+'-'+xy[1]+'"]');
    if(!cell)continue;
    const point=position(cell);
    const t=(progress-prev.p)/steps;
    frames.push(translateKey(point.x-end.x,point.y-end.y,t<1?1.1:1,t));
   }
   if(frames.at(-1)?.offset!==1)frames.push(translateKey(0,0,1,1));
   animateToken(pawn,frames,Math.min(1150,360+steps*90));
   pulse(pawn,"arena-arrive",520);
  }
  old=fresh;
 };
 new MutationObserver(probe).observe(board,{childList:true});
}
watchLudo();
// Địa Ốc: each avatar follows the actual perimeter tiles one step at a time.
function watchEstate(){
 const board=$("estateBoard");if(!board)return;
 let old=new Map();
 const getTiles=()=>[...board.querySelectorAll("[data-path-index]")].reduce((map,node)=>
  map.set(Number(node.dataset.pathIndex),node),new Map());
 const probe=()=>{
  const fresh=new Map(),tiles=getTiles();
  for(const pawn of board.querySelectorAll("[data-player][data-position]")){
   const id=pawn.dataset.player,at=Number(pawn.dataset.position),pos=position(pawn);
   fresh.set(id,{at,pos});
   const before=old.get(id);if(!before||before.at===at||lowMotion())continue;
   const steps=(at-before.at+24)%24;if(steps<1||steps>12)continue;
   const frames=[translateKey(before.pos.x-pos.x,before.pos.y-pos.y,1,0)];
   for(let step=1;step<=steps;step++){
    const idx=(before.at+step)%24;
    const cell=tiles.get(idx);if(!cell)continue;
    const target=step===steps?pos:position(cell);
    frames.push(translateKey(target.x-pos.x,target.y-pos.y,step===steps?1:1.11,step/steps));
   }
   animateToken(pawn,frames,Math.min(1200,300+steps*79));
   pulse(pawn,"arena-arrive",480);
  }
  old=fresh;
 };
 new MutationObserver(probe).observe(board,{childList:true});
}
watchEstate();
// Actual dice values are committed by engines immediately; only the visuals tumble.
for(const id of ["ludoDie","estateDice"]){
 const die=$(id);if(!die)continue;
 let value=die.textContent;
 new MutationObserver(()=>{
  const next=die.textContent;
  if(next===value)return;value=next;
  pulse(die,"arena-dice-roll",650);
 }).observe(die,{childList:true,characterData:true,subtree:true});
}
// Online room DOM is replaced on verified server moves. Reconstruct movement
// from the previous/new visible chess positions; selection redraws have no diff.
const canvas=$("roomGameCanvas");
if(canvas){
 let lastChess=null,lastHand="",lastTop="";
 const chessSnapshot=()=>{
  const map=new Map();
  for(const tile of canvas.querySelectorAll(".arena-pvp-chess .chess-square")){
   const glyph=tile.querySelector(".chess-white,.chess-black");
   map.set(tile.dataset.square,{glyph:glyph?(glyph.className+"|"+glyph.textContent):"",point:position(tile),node:tile});
  }
  return map;
 };
 const probe=()=>{
  const board=canvas.querySelector(".arena-pvp-chess");
  if(board){
   const next=chessSnapshot();
   if(lastChess&&next.size===64){
    const donors=[...lastChess.entries()].filter(([square,data])=>data.glyph&&next.get(square)?.glyph!==data.glyph);
    for(const [square,data] of next){
     if(!data.glyph||data.glyph===lastChess.get(square)?.glyph)continue;
     const from=donors.find(([src,old])=>old.glyph===data.glyph&&src!==square);
     if(!from)continue;
     // Previous DOM was replaced; retain the old snapshot coordinates.
     const a=from[1].point,b=data.point;
     animateToken(data.node.querySelector(".chess-white,.chess-black"),[
      translateKey(a.x-b.x,a.y-b.y,.94),
      translateKey((a.x-b.x)*.28,(a.y-b.y)*.28,1.07,.72),
      translateKey(0,0)],420);
     pulse(data.node,"chess-arrive",480);
    }
   }
   lastChess=next;lastHand="";lastTop="";return;
  }
  lastChess=null;
  const live=canvas.querySelector(".arena-pvp-current");
  if(live){
   const signature=[...live.children].map(x=>x.dataset.card||x.textContent).join("|");
   if(signature&&signature!==lastTop){
    if(lastTop&&live.firstElementChild)pulse(live,"arena-top-fx",570);
    lastTop=signature;
   }
  }
  const hand=canvas.querySelector(".arena-pvp-hand");
  if(hand){
   const sig=hand.children.length+" "+[...hand.children].map(x=>x.dataset.card||x.textContent.slice(0,5)).join("");
   if(lastHand&&sig!==lastHand&&hand.children.length) pulse(hand,"arena-card-drawn",530);
   lastHand=sig;
  }
 };
 new MutationObserver(probe).observe(canvas,{childList:true});
}
// Game Zone answers animate positively/negatively without overriding marks.
const feedback=$("mzFeedback");
if(feedback){
 let prior="";
 new MutationObserver(()=>{
  const value=feedback.textContent.trim();if(!value||value===prior)return;prior=value;
  const panel=$("mzArena");if(!panel||panel.hidden)return;
  const chosen=panel.querySelector(".mz-option[aria-pressed='true'],.mz-tile[aria-pressed='true'],.mz-memory-card:not([disabled])");
  if(chosen)pulse(chosen,feedback.dataset.good==="false"?"mz-answer-error":"mz-answer-success",520);
 }).observe(feedback,{childList:true,subtree:true,characterData:true});
}
