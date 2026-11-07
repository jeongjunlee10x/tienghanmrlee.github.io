/* MR LEE Tiến lên — shared visual FX queue. All game decisions stay in tienlen-engine.js.
 * Cards physically travel to the table; any current animation is safely canceled on exit.
 * No real-money effects, score writes or external assets.
 */
import {label,SUITS,beats} from "./tienlen-engine.js";

export function playingCard(card){
 const rank=card.rank===15?"2":card.rank===14?"A":card.rank===13?"K":card.rank===12?"Q":card.rank===11?"J":String(card.rank);
 const suit=SUITS[card.suit],red=card.suit>=2;
 const element=document.createElement("span");
 element.className="tl-card-face tl-real-card "+(red?"red":"black");
 element.dataset.card=card.id;
 const corner=document.createElement("span");corner.className="tl-card-corner";
 const r=document.createElement("strong");r.textContent=rank;
 const s=document.createElement("span");s.textContent=suit;
 corner.append(r,s);
 const center=document.createElement("span");center.className="tl-card-art";
 const mark=document.createElement("span");mark.className="tl-card-art-suit";
 mark.textContent=suit;center.append(mark);
 if(card.rank>=11&&card.rank<=14){
  const royal=document.createElement("span");royal.className="tl-card-royal";
  royal.textContent=card.rank===11?"♞":card.rank===12?"♛":card.rank===13?"♚":"♕";
  center.append(royal);
 }else{
  const emboss=document.createElement("span");emboss.className="tl-card-emboss";
  emboss.textContent=rank;center.append(emboss);
 }
 const foot=corner.cloneNode(true);foot.className="tl-card-corner tl-card-foot";
 element.append(corner,center,foot);
 element.setAttribute("aria-label",label(card));
 return element;
}
export function cardBack(){
 const back=document.createElement("span");
 back.className="tl-card-back";
 const inner=document.createElement("span");inner.className="tl-card-back-inner";
 const crest=document.createElement("span");crest.className="tl-back-crest";crest.textContent="♠";
 inner.append(crest);back.append(inner);
 back.setAttribute("aria-hidden","true");
 return back;
}
export function chopTitle(previous,next){
 if(!previous||!next||!(next.type==="quad"||next.type==="pair-run"))return "";
 const two=previous.high===15&&(previous.type==="single"||previous.type==="pair");
 const special=previous.type==="quad"||previous.type==="pair-run";
 if(!two&&!special||!beats(next,previous))return "";
 // Guard the popup with the exact same rule engine as the accepted move:
 // a repeated/equal or illegal combo must never be displayed as a chop.
 return next.type==="quad"?"TỨ QUÝ CHẶT!":next.type==="pair-run"?"ĐÔI THÔNG CHẶT!":"CHẶT HEO!";
}
/** Visual category from the ACCEPTED move. No independent rule validation here.
 * chopTitle still checks beats() before any "chặt" banner.
 */
export function comboTitle(previous,next){
 const chopped=chopTitle(previous,next);
 if(chopped)return chopped;
 if(!next)return "";
 if(next.type==="quad")return "TỨ QUÝ!";
 if(next.type==="pair-run")return next.size>=8?"4 ĐÔI THÔNG!":"3 ĐÔI THÔNG!";
 if(next.type==="straight")return "SẢNH!";
 return "";
}
/** Screen-centered, noninteractive blast, also used by authenticated PvP.
 * Does not alter deck, clocks, moves or G. */
export function showChopPopup(message,{duration=980,signal}={}){
 if(!message||typeof document==="undefined"||signal?.aborted)return Promise.resolve();
 const overlay=document.createElement("div");
 overlay.className="arena-chop-v22";
  overlay.dataset.kind=/SẢNH/i.test(message)?"straight":/ĐÔI THÔNG/i.test(message)?"pairs":/THẮNG/i.test(message)?"win":"quad";
 overlay.setAttribute("role","presentation");
 overlay.setAttribute("aria-hidden","true");
 const ring=document.createElement("div");ring.className="arena-chop-v22-ring";
 const title=document.createElement("strong");title.className="arena-chop-v22-title";
 title.textContent=String(message).slice(0,45);
 overlay.append(ring,title);
 for(let i=0;i<24;i++){
  const spark=document.createElement("i");spark.className="arena-chop-v22-spark";
  spark.style.setProperty("--a",i*15+"deg");
  spark.style.setProperty("--d",(75+(i%5)*22)+"px");
  overlay.append(spark);
 }
 document.body.append(overlay);
 return new Promise(resolve=>{
  let finished=false;
  const stop=()=>{
   if(finished)return;finished=true;
   clearTimeout(timer);overlay.remove();
   signal?.removeEventListener("abort",stop);resolve();
  };
  signal?.addEventListener("abort",stop,{once:true});
  const timer=setTimeout(stop,document.documentElement.dataset.arenaVisuals==="off"?100:duration);
 });
}
export function createTableEffects(board,area){
 const overlay=document.createElement("div");
 overlay.className="tl-effect-layer";overlay.setAttribute("aria-hidden","true");
 board.append(overlay);
 let serial=0;
 const animations=new Set(),timers=new Map();
 let chopController=null;
 const reduced=()=>document.documentElement.dataset.arenaVisuals==="off"||
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
 const wait=ms=>new Promise(resolve=>{
  const id=setTimeout(()=>{timers.delete(id);resolve();},ms);
  timers.set(id,resolve);
 });
 function cancel(){
  serial++;
  chopController?.abort();chopController=null;
  for(const a of animations)try{a.cancel();}catch{}
  animations.clear();
  for(const [id,resolve] of timers){clearTimeout(id);resolve();}
  timers.clear();
  overlay.replaceChildren();
  board.classList.remove("tl-is-dealing","tl-is-throwing","tl-chop-shake");
  board.dataset.fxPhase="idle";
 }
 const localRect=element=>{
  const r=element.getBoundingClientRect(),b=board.getBoundingClientRect();
  return {x:r.left-b.left+r.width/2,y:r.top-b.top+r.height/2,w:r.width,h:r.height};
 };
 function spawn(node,x,y,cl=""){
  node.classList.add("tl-flying-card");
  if(cl)node.classList.add(cl);
  node.style.left=x+"px";node.style.top=y+"px";
  overlay.append(node);return node;
 }
 function animate(node,delta,duration,delay=0,rotation=0,scale=.9){
  const a=node.animate([
   {transform:"translate3d(-50%,-50%,0) rotate(0deg) scale(.93)",opacity:.96},
   {transform:"translate3d(calc(-50% + "+(delta.x*.6)+"px),calc(-50% + "+(delta.y*.6)+"px),0) rotate("+(rotation*.55)+"deg) scale(1.05)",opacity:1,offset:.64},
   {transform:"translate3d(calc(-50% + "+delta.x+"px),calc(-50% + "+delta.y+"px),0) rotate("+rotation+"deg) scale("+scale+")",opacity:.98}
  ],{duration,delay,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
  animations.add(a);
  return a.finished.catch(()=>{}).then(()=>{animations.delete(a);node.remove();});
 }
 async function deal(){
  cancel();const stamp=serial;
  board.dataset.fxPhase="shuffle";
  board.dataset.dealCount="52";board.dataset.dealtCards="0";
  board.classList.add("tl-is-dealing");
  if(reduced()){await wait(350);if(serial===stamp){board.dataset.dealtCards="52";board.classList.remove("tl-is-dealing");board.dataset.fxPhase="ready";}return;}
  const origin=localRect(area);
  const stack=spawn(cardBack(),origin.x,origin.y,"tl-dealing-stack");
  const backs=Array.from({length:3},(_,i)=>{
   const n=spawn(cardBack(),origin.x+i*3-3,origin.y+i*2-2,"tl-shuffle-card");
   n.style.animationDelay=(i*110)+"ms";return n;
  });
  await wait(document.documentElement.dataset.arenaVisuals==="lite"?600:1100);
  stack.remove();backs.forEach(x=>x.remove());
  if(serial!==stamp)return;
  board.dataset.fxPhase="deal";
  const seats=[
   board.querySelector(".tl-player-hud"),
   board.querySelector('[data-seat="top"]'),
   board.querySelector('[data-seat="left"]'),
   board.querySelector('[data-seat="right"]')
  ];
  const flights=[],received=[0,0,0,0];
  const notice=board.querySelector("#tlDealNotice");
  const piles=seats.map((seatNode,seatIndex)=>{
   const point=localRect(seatNode||area);
   const pile=document.createElement("div");
   pile.className="tl-deal-receipt";
   pile.dataset.seat=String(seatIndex);
   pile.style.left=point.x+"px";pile.style.top=point.y+"px";
   const counter=document.createElement("small");
   counter.className="tl-deal-receipt-count";counter.textContent="0/13";
   pile.append(counter);overlay.append(pile);
   return {pile,counter};
  });
  // Deal all 52 anonymous backs individually: round-robin, 13 per seat.
  // Private real cards already live in the engine, hidden until complete.
  const visualDeals=52;
  for(let i=0;i<visualDeals;i++){
   const seat=i%4,which=Math.floor(i/4);
   const destination=localRect(seats[seat]||area);
   const spread=seat===0?(which-6)*8:((which%3)-1)*5;
   const extraX=(seat===0||seat===1)?spread:seat===3?-spread:spread;
   const sprite=spawn(cardBack(),origin.x,origin.y,"tl-deal-sprite");
   const arrival=animate(sprite,{x:destination.x-origin.x+extraX,y:destination.y-origin.y},
    600,i*64,seat===2?64:seat===3?-64:((which%3)-1)*7,.58);
   flights.push(arrival.then(()=>{
    if(serial!==stamp)return;
    received[seat]++;
    const {pile,counter}=piles[seat];
    counter.textContent=received[seat]+"/13";
    if(received[seat]<=4){
     const back=cardBack();
     back.classList.add("tl-deal-received-back");
     back.style.setProperty("--stack",String(received[seat]-1));
     pile.insertBefore(back,counter);
    }
    const total=received.reduce((sum,n)=>sum+n,0);
    board.dataset.dealtCards=String(total);
    if(notice)notice.textContent="🂠 ĐANG PHÁT BÀI "+total+"/52";
   }));
  }
  await Promise.all(flights);
  if(serial!==stamp)return;
  board.dataset.fxPhase="spread";
  if(notice)notice.textContent="✨ MỖI NGƯỜI 13 LÁ · MỞ BÀI";
  await wait(480);
  piles.forEach(({pile})=>pile.remove());
  if(serial!==stamp)return;
  board.classList.remove("tl-is-dealing");board.dataset.fxPhase="ready";
 }
 async function throwCards(cards,player,fromRects=[],message=""){
  if(!cards?.length)return;
  const stamp=serial;
  const isChop=!!message;
  board.dataset.fxPhase=isChop?"chop":"play";
  board.dataset.lastFx=isChop?"chop":"play";
  board.dataset.fxCount=String((Number(board.dataset.fxCount)||0)+1);
  board.classList.add("tl-is-throwing");
  const target=localRect(area),boardRect=board.getBoundingClientRect();
  const from=player===0?board.querySelector(".tl-player-hud"):
   board.querySelector('[data-seat="'+(["bottom","top","left","right"][player])+'"]');
  const original=localRect(from||area);
  if(reduced()){
   await wait(50);
  }else{
   const flights=cards.map((card,i)=>{
    const rect=fromRects[i];
    const source=rect?{
     x:rect.left-boardRect.left+rect.width/2,
     y:rect.top-boardRect.top+rect.height/2
    }:original;
    const destination={x:target.x-source.x+(i-(cards.length-1)/2)*Math.min(20,230/Math.max(cards.length,1)),
     y:target.y-source.y};
    const sprite=spawn(playingCard(card),source.x,source.y,"tl-play-sprite");
    return animate(sprite,destination,860,i*145,(i-(cards.length-1)/2)*4,1.03);
   });
   await Promise.all(flights);
  }
  if(stamp!==serial)return;
  board.classList.remove("tl-is-throwing");
  board.dataset.fxPhase="ready";
  if(isChop)await burst(message);
 }
 async function burst(message){
  const stamp=serial;
  board.classList.add("tl-chop-shake");
  board.dataset.lastFx="chop";
  chopController?.abort();chopController=new AbortController();
  await showChopPopup(message,{signal:chopController.signal});
  if(stamp===serial){board.classList.remove("tl-chop-shake");chopController=null;}
 }
 function passer(name,seat){
  const target=seat===0?board.querySelector(".tl-player-hud"):
    board.querySelector('[data-seat="'+(["bottom","top","left","right"][seat])+'"]');
  if(!target)return;
  const pos=localRect(target),n=document.createElement("span");
  n.className="tl-pass-badge";n.textContent="BỎ LƯỢT";
  n.style.left=pos.x+"px";n.style.top=(pos.y-43)+"px";
  overlay.append(n);setTimeout(()=>n.remove(),850);
 }
 return {deal,throwCards,cancel,passer};
}
