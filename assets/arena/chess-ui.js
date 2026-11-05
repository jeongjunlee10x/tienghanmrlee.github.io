/* Chess gameplay UI – white below, black AI above. Every move goes through chess-engine. */
import {GLYPHS,start,legal,apply,san,side,square,status,bestBotMove} from "./chess-engine.js";
const $=id=>document.getElementById(id);
const make=(tag,cl,text)=>{
 const x=document.createElement(tag);if(cl)x.className=cl;
 if(text!==undefined)x.textContent=String(text);return x;
};
const btn=(name,cl,click)=>{
 const b=make("button",cl,name);b.type="button";if(click)b.addEventListener("click",click);return b;
};
export function mountChess({onStart,onFinish,onExit}){
 const root=$("arenaChess"),board=$("chessBoard"),note=$("chessStatus"),moveList=$("chessMoves");
 const promotion=$("chessPromotion"),level=$("chessLevel");
 let history=[],labels=[],picked=-1,timer=null,token=0,done=false,pending=null;
 const stop=()=>{
  token++;if(timer!==null)clearTimeout(timer);timer=null;
  pending=null;promotion.hidden=true;
 };
 function exit(){stop();root.hidden=true;onExit();}
 function begin(){
  if(!onStart())return;
  stop();history=[start()];labels=[];picked=-1;done=false;
  root.querySelector(".arena-game-result")?.remove();
  root.hidden=false;root.scrollIntoView({behavior:"smooth",block:"start"});
  draw();
 }
 const active=()=>history.length>0&&root.hidden===false&&!done;
 function finish(end){
  if(done)return;done=true;stop();
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
  labels.push((s.t===1?s.full+". ":s.full+"... ")+san(s,actual));
  history.push(apply(s,actual));picked=-1;
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
  draw();
 }
 function draw(){
  if(root.hidden||!history.length)return;
  const s=history.at(-1),allowed=legal(s),targets=new Set(allowed.filter(m=>m[0]===picked).map(m=>m[1]));
  board.replaceChildren();
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
   const index=r*16+c,piece=s.b[index];
   const target=targets.has(index),isPicked=picked===index;
   const tile=btn("","chess-square"+(((r+c)%2)?" dark":" light")+
     (isPicked?" chosen":"")+(target?" target":""),
     ()=>choose(index));
   tile.dataset.square=square(index);
   tile.setAttribute("aria-label",square(index)+": "+(piece==="."?"trống":piece));
   tile.setAttribute("aria-pressed",String(isPicked));
   if(piece!=="."){
    const glyph=make("span",side(piece)===1?"chess-white":"chess-black",GLYPHS[piece]);
    tile.append(glyph);
   }
   if(target&&piece===".")tile.append(make("span","chess-dot",""));
   if(c===0)tile.append(make("small","chess-rank",String(8-r)));
   if(r===7)tile.append(make("small","chess-file","abcdefgh"[c]));
   board.append(tile);
  }
  const verdict=status(history);
  if(!done)note.textContent=verdict.reason+(s.t===1?" · Chọn quân rồi chọn ô đích.":" · Máy đang tính nước đi…");
  moveList.replaceChildren();
  for(let i=0;i<labels.length;i+=2){
   const p=make("p","",labels[i]+(labels[i+1]?"  "+labels[i+1]:""));
   moveList.append(p);
  }
  $("chessClaim").hidden=!verdict.claim||done||s.t!==1;
  $("chessLevel").disabled=!done&&history.length>1;
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
    labels.push(s.full+"... "+san(s,move));
    history.push(apply(s,move));
    const verdict=status(history);
    draw();
    if(verdict.done)finish(verdict);
   }catch(err){note.textContent="Lỗi bot: "+err.message;}
  },350);
 }
 $("chessExit").addEventListener("click",exit);
 $("chessRestart").addEventListener("click",begin);
 $("chessClaim").addEventListener("click",()=>{
  if(!active()||!status(history).claim)return;
  finish({winner:0,reason:"Hòa theo yêu cầu người chơi"});
 });
 return {start:begin,stop};
}
