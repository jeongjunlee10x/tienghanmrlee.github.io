/* MR LEE Chess Arena — original visual client atop the existing independent chess engine.
 * Features: selectable clocks, board skins, orientation, last move, hints and one-step takeback.
 * Not affiliated with chess.com. No third-party imagery, brand assets or copied source.
 */
import {GLYPHS,start,legal,apply,san,side,square,status,bestBotMove} from "./chess-engine.js";
import {enablePointerDrag,animateBoardMove} from "./drag-gestures.js?v=20261106-drag-r2";
const $=id=>document.getElementById(id);
const make=(tag,cl,text)=>{
 const x=document.createElement(tag);if(cl)x.className=cl;
 if(text!==undefined)x.textContent=String(text);return x;
};
const btn=(name,cl,click)=>{
 const b=make("button",cl,name);b.type="button";if(click)b.addEventListener("click",click);return b;
};
const formatClock=n=>{
 if(!Number.isFinite(n))return "∞";
 const total=Math.max(0,Math.ceil(n));
 return Math.floor(total/60).toString().padStart(2,"0")+":"+(total%60).toString().padStart(2,"0");
};
export function mountChess({onStart,onFinish,onExit}){
 const root=$("arenaChess"),board=$("chessBoard"),note=$("chessStatus"),moveList=$("chessMoves");
 const promotion=$("chessPromotion"),level=$("chessLevel");
 const clockWhite=$("chessWhiteClock"),clockBlack=$("chessBlackClock");
 const clockMode=$("chessTime"),boardTheme=$("chessBoardTheme");
 let history=[],labels=[],traces=[],picked=-1,timer=null,token=0,done=false,pending=null,flip=false;
 let clockTicker=null,clockLast=0,clockRemaining={1:600,"-1":600},hintText="",clockBonus=0;
 const requestedClock=new URL(location.href).searchParams.get("time");
 if([...clockMode.options].some(o=>o.value===requestedClock))clockMode.value=requestedClock;
 const resetClocks=()=>{
  const [minutes,bonus]=clockMode.value==="none"?[Infinity,0]:
   clockMode.value.includes("+")?clockMode.value.split("+").map(Number):
   [Number(clockMode.value)/60||10,0];
  const seconds=minutes*60;clockBonus=bonus;
  clockRemaining={1:seconds,"-1":seconds};
  clockWhite.textContent=formatClock(seconds);clockBlack.textContent=formatClock(seconds);
 };
 const paintClocks=()=>{
  clockWhite.textContent=formatClock(clockRemaining[1]);
  clockBlack.textContent=formatClock(clockRemaining[-1]);
  const activeSide=history.at(-1)?.t;
  clockWhite.classList.toggle("active",activeSide===1&&!done);
  clockBlack.classList.toggle("active",activeSide===-1&&!done);
  clockWhite.classList.toggle("low",clockRemaining[1]<=30);
  clockBlack.classList.toggle("low",clockRemaining[-1]<=30);
 };
 const pauseClock=()=>{
  if(clockTicker!==null)clearInterval(clockTicker);
  clockTicker=null;clockLast=0;paintClocks();
 };
 const stop=()=>{
  token++;if(timer!==null)clearTimeout(timer);timer=null;
  pending=null;promotion.hidden=true;pauseClock();
 };
 function exit(){stop();root.hidden=true;onExit();}
 const active=()=>history.length>0&&root.hidden===false&&!done;
 function clockStep(){
  if(!active())return;
  const stamp=Date.now(),delta=Math.min(30,(stamp-clockLast)/1000);clockLast=stamp;
  if(!Number.isFinite(delta)||delta<=0)return;
  const turn=history.at(-1).t;
  if(!Number.isFinite(clockRemaining[turn]))return;
  clockRemaining[turn]=Math.max(0,clockRemaining[turn]-delta);
  paintClocks();
  if(clockRemaining[turn]===0)finish({winner:-turn,reason:"Hết giờ"});
 }
 function startClock(){
  pauseClock();clockLast=Date.now();
  clockTicker=setInterval(clockStep,250);paintClocks();
 }
 function begin(){
  if(!onStart())return;
  stop();history=[start()];labels=[];traces=[];picked=-1;done=false;hintText="";
  root.querySelector(".arena-game-result")?.remove();
  board.dataset.theme=boardTheme.value;
  resetClocks();
  root.hidden=false;root.scrollIntoView({behavior:"smooth",block:"start"});
  draw();startClock();
 }
 function finish(end){
  if(done)return;
  done=true;stop();
  const result=end.winner===1?"win":end.winner===-1?"loss":"draw";
  note.textContent=end.reason+" · "+(result==="win"?"Bạn thắng!":result==="loss"?"Máy thắng.":"Hòa.");
  onFinish(result,"Cờ vua",root);
  draw();
 }
 function humanPlay(move){
  if(!active())return;
  const s=history.at(-1),allowed=legal(s);
  const actual=allowed.find(m=>m[0]===move[0]&&m[1]===move[1]&&m[2]===move[2]);
  if(!actual)return;
  clockStep();if(!active())return;
  const from=board.querySelector('[data-index="'+actual[0]+'"]');
  const to=board.querySelector('[data-index="'+actual[1]+'"]');
  animateBoardMove({from,to,piece:from?.querySelector(".chess-white,.chess-black"),kind:"chess-piece"});
  labels.push((s.t===1?s.full+". ":s.full+"... ")+san(s,actual));
  if(Number.isFinite(clockRemaining[s.t]))clockRemaining[s.t]+=clockBonus;
  traces.push([actual[0],actual[1]]);
  history.push(apply(s,actual));picked=-1;hintText="";
  clockLast=Date.now();
  const verdict=status(history);draw();
  if(verdict.done){finish(verdict);return;}
  if(verdict.claim&&history.at(-1).t===1)note.textContent+=" · Bạn có thể xin hòa.";
  schedule();
 }
 function choose(index){
  if(!active()||pending)return;
  const s=history.at(-1);
  if(s.t!==1)return;
  const allowed=legal(s),targets=allowed.filter(m=>m[0]===picked&&m[1]===index);
  if(targets.length){
   if(targets.length>1){
    pending=targets;promotion.hidden=false;promotion.replaceChildren(
      make("strong","","Chọn quân phong cấp")
    );
    const row=make("div","chess-promotion-row");
    for(const type of ["q","r","b","n"]){
     row.append(btn(GLYPHS[type.toUpperCase()],"chess-promo-btn",()=>{
      const move=pending?.find(x=>x[2]===type);
      pending=null;promotion.hidden=true;if(move)humanPlay(move);
     }));
    }
    row.append(btn("Hủy","arena-soft",()=>{pending=null;promotion.hidden=true;draw();}));
    promotion.append(row);return;
   }
   humanPlay(targets[0]);return;
  }
  picked=side(s.b[index])===1?(picked===index?-1:index):-1;
  hintText="";draw();
 }
 function draw(){
  if(root.hidden||!history.length)return;
  const s=history.at(-1),allowed=legal(s),targets=new Set(allowed.filter(m=>m[0]===picked).map(m=>m[1]));
  const last=traces.at(-1)||[];
  board.dataset.theme=boardTheme.value;
  board.dataset.flipped=String(flip);
  board.replaceChildren();
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
   const actualRow=flip?7-r:r,actualCol=flip?7-c:c;
   const index=actualRow*16+actualCol,piece=s.b[index];
   const target=targets.has(index),isPicked=picked===index;
   const tile=btn("","chess-square"+(((actualRow+actualCol)%2)?" dark":" light")+
     (isPicked?" chosen":"")+(target?" target":"")+
     (last.includes(index)?" last-move":""),()=>choose(index));
   tile.dataset.square=square(index);tile.dataset.index=String(index);
   tile.setAttribute("aria-label",square(index)+": "+(piece==="."?"trống":piece));
   tile.setAttribute("aria-pressed",String(isPicked));
   if(piece!=="."){
    const glyph=make("span",side(piece)===1?"chess-white":"chess-black",GLYPHS[piece]);
    tile.append(glyph);
   }
   if(target&&piece===".")tile.append(make("span","chess-dot",""));
   if(c===0)tile.append(make("small","chess-rank",String(8-actualRow)));
   if(r===7)tile.append(make("small","chess-file","abcdefgh"[actualCol]));
   board.append(tile);
  }
  // Rendered position is authoritative; data tags are for visual FLIP only.
  const recent=traces.at(-1);
  board.dataset.lastMove=recent?recent.map(square).join(","):"";
  board.dataset.moveIndex=String(traces.length);
  const verdict=status(history);
  if(!done)note.textContent=hintText||verdict.reason+(s.t===1?" · Kéo quân tới ô hợp lệ hoặc chạm chọn hai ô.":" · Máy đang tính nước đi…");
  moveList.replaceChildren();
  for(let i=0;i<labels.length;i+=2){
   const p=make("p","chess-move-line",labels[i]+(labels[i+1]?"  "+labels[i+1]:""));
   moveList.append(p);
  }
  $("chessClaim").hidden=!verdict.claim||done||s.t!==1;
  $("chessUndo").disabled=done||history.length<=1;
  $("chessHint").disabled=done||s.t!==1;
  level.disabled=!done&&history.length>1;
  clockMode.disabled=!done&&history.length>1;
  paintClocks();
  if(!done&&verdict.done)finish(verdict);
 }
 function schedule(){
  if(!active()||history.at(-1).t!==-1)return;
  const current=token;
  timer=setTimeout(()=>{
   timer=null;
   if(current!==token||!active()||history.at(-1).t!==-1)return;
   try{
    const s=history.at(-1),move=bestBotMove(s,level.value);
    if(!move){finish(status(history));return;}
    clockStep();if(!active())return;
    const from=board.querySelector('[data-index="'+move[0]+'"]');
    const to=board.querySelector('[data-index="'+move[1]+'"]');
    animateBoardMove({from,to,piece:from?.querySelector(".chess-white,.chess-black"),kind:"chess-piece"});
    labels.push(s.full+"... "+san(s,move));
    if(Number.isFinite(clockRemaining[s.t]))clockRemaining[s.t]+=clockBonus;
    traces.push([move[0],move[1]]);
    history.push(apply(s,move));
    clockLast=Date.now();hintText="";
    const verdict=status(history);
    draw();
    if(verdict.done)finish(verdict);
   }catch(err){note.textContent="Lỗi bot: "+err.message;}
  },350);
 }
 function undo(){
  if(!active()||history.length<=1)return;
  stop();hintText="";picked=-1;
  // Roll back the player's move and, if present, the bot's reply.
  const removed=history.at(-1).t===-1?1:Math.min(2,history.length-1);
  for(let i=0;i<removed;i++){history.pop();labels.pop();traces.pop();}
  draw();startClock();
 }
 function hint(){
  if(!active()||history.at(-1).t!==1)return;
  const s=history.at(-1),moves=legal(s);
  if(!moves.length)return;
  const valued=[...moves].sort((a,b)=>{
   const points=m=>(s.b[m[1]]==="."?0:{p:1,n:3,b:3,r:5,q:9}[s.b[m[1]].toLowerCase()]||0)*10+
    (m[2]?80:0)+(m[1]>>4<4?3:0);
   return points(b)-points(a);
  });
  picked=valued[0][0];
  hintText="💡 Gợi ý nước hợp lệ: "+square(valued[0][0])+" → "+square(valued[0][1])+" (không phải phân tích từ engine mạnh).";
  draw();
 }
 enablePointerDrag({
  root:board,itemSelector:".chess-square[data-index]",
  targetSelector:".chess-square[data-index]",previewSelector:".chess-white,.chess-black",
  canStart:item=>{
   if(!active()||history.at(-1).t!==1||pending)return false;
   return side(history.at(-1).b[Number(item.dataset.index)])===1;
  },
  canDrop:(from,to)=>active()&&legal(history.at(-1)).some(m=>
   m[0]===Number(from.dataset.index)&&m[1]===Number(to.dataset.index)),
  onDrop:(from,to)=>{
   const src=Number(from.dataset.index),dst=Number(to.dataset.index);
   if(!legal(history.at(-1)).some(m=>m[0]===src&&m[1]===dst))return false;
   picked=src;choose(dst);return true;
  }
 });
 $("chessExit").addEventListener("click",exit);
 $("chessRestart").addEventListener("click",begin);
 $("chessFlip").addEventListener("click",()=>{flip=!flip;draw();});
 $("chessUndo").addEventListener("click",undo);
 $("chessHint").addEventListener("click",hint);
 boardTheme.addEventListener("change",draw);
 clockMode.addEventListener("change",()=>{if(!history.length||done)resetClocks();});
 $("chessClaim").addEventListener("click",()=>{
  if(!active()||!status(history).claim)return;
  finish({winner:0,reason:"Hòa theo yêu cầu người chơi"});
 });
 resetClocks();
 return {start:begin,stop};
}
