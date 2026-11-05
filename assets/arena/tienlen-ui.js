/* Tiến lên miền Nam UI: selectable legal combinations, four seats, opponent bots. */
import {start,label,analyze,canPlay,play,pass,botTurn,options,NAMES,SUIT_NAMES} from "./tienlen-engine.js";
const $=id=>document.getElementById(id);
const el=(tag,cl,text)=>{
 const node=document.createElement(tag);if(cl)node.className=cl;
 if(text!==undefined)node.textContent=String(text);
 return node;
};
const button=(title,cl,handler)=>{
 const b=el("button",cl,title);b.type="button";
 if(handler)b.addEventListener("click",handler);
 return b;
};
const kind={single:"Bài lẻ",pair:"Đôi",triple:"Sám cô",quad:"Tứ quý",
 straight:"Sảnh","pair-run":"Đôi thông"};
function face(card){
 const outer=el("span","tl-card-face"+(card.suit>=2?" red":" black"));
 outer.append(el("strong","",label(card)),el("small","",SUIT_NAMES[card.suit]));
 return outer;
}
export function mountTienLen({onStart,onFinish,onExit}){
 const root=$("arenaTienLen"),hand=$("tlHand"),enemies=$("tlOpponents"),pile=$("tlPile");
 const status=$("tlStatus"),message=$("tlHint"),count=$("tlCount"),logs=$("tlEvents");
 let game=null,selected=new Set(),timer=null,epoch=0,done=false;
 function stop(){epoch++;if(timer!==null)clearTimeout(timer);timer=null;}
 function exit(){stop();root.hidden=true;game=null;onExit();}
 function begin(){
  if(!onStart())return;
  stop();game=start();selected=new Set();done=false;
  root.hidden=false;root.scrollIntoView({behavior:"smooth",block:"start"});
  render();schedule();
 }
 function finish(){
  if(done||!game||game.winner===null)return;
  done=true;stop();
  const won=game.winner===0;
  const otherTwo=game.hands.filter((h,i)=>i!==game.winner).flat().filter(c=>c.rank===15).length;
  message.textContent=(won?"Bạn về nhất!":NAMES[game.winner]+" về nhất!")+
   (otherTwo?" · Còn "+otherTwo+" lá 2 trong tay người thua (thối heo, chỉ thông báo).":"");
  onFinish(won?"win":"loss","Tiến lên miền Nam",root);
  render();
 }
 function selectedValid(){
  if(!game||game.turn!==0||game.winner!==null)return false;
  return canPlay(game,0,[...selected]);
 }
 function selectCard(id){
  if(!game||game.turn!==0||done)return;
  if(selected.has(id))selected.delete(id);else selected.add(id);
  render();
 }
 function suggest(){
  if(!game||game.turn!==0||done)return;
  const choices=options(game.hands[0]).filter(cards=>canPlay(game,0,cards.map(c=>c.id)));
  if(!choices.length){message.textContent="Không có bộ bài hợp lệ. Hãy bỏ lượt (nếu vòng đã mở).";return;}
  choices.sort((a,b)=>{
   // Lower card strength when responding, shed more when leading.
   const A=analyze(a),B=analyze(b);
   return game.last?A.high-B.high||a.length-b.length: b.length-a.length||A.high-B.high;
  });
  selected=new Set(choices[0].map(c=>c.id));render();
  message.textContent="Gợi ý: "+choices[0].map(label).join(" ");
 }
 function act(){
  if(!selectedValid())return;
  try{
   play(game,0,[...selected]);selected.clear();render();
   if(game.winner!==null)finish();else schedule();
  }catch(err){message.textContent=err.message;}
 }
 function skip(){
  if(!game||game.turn!==0||!game.last||done)return;
  try{
   pass(game,0);selected.clear();render();schedule();
  }catch(err){message.textContent=err.message;}
 }
 function schedule(){
  if(!game||done||game.winner!==null||game.turn===0||timer!==null)return;
  const snapshot=epoch;
  timer=setTimeout(()=>{
   timer=null;if(snapshot!==epoch||!game||done||root.hidden||game.turn===0)return;
   try{
    botTurn(game);render();
    if(game.winner!==null)finish();else schedule();
   }catch(err){message.textContent="Bot gặp lỗi: "+err.message;}
  },470);
 }
 function render(){
  if(!game||root.hidden)return;
  const canAct=game.turn===0&&game.winner===null;
  enemies.replaceChildren();
  for(let i=1;i<4;i++){
   const card=el("div","tl-opponent"+(game.turn===i?" active":""));
   card.append(el("span","tl-avatar",["","👩🏻","🧑🏻","👩🏽"][i]),
    el("strong","",NAMES[i]),el("small","",game.hands[i].length+" lá"));
   enemies.append(card);
  }
  const head=game.last?.combo;
  pile.replaceChildren();
  if(!game.played.length)pile.append(el("p","tl-empty","Lượt mở mới • Chưa có bài trên bàn"));
  else for(const c of game.played)pile.append(face(c));
  count.textContent="Bạn: "+game.hands[0].length+" lá · "+(head?kind[head.type]:"Vòng tự do");
  if(!done)status.textContent=canAct?
    (game.first?"Bạn có 3♠ nên phải dùng lá 3♠ trong lượt đầu.":"Đến lượt bạn chọn bài hợp lệ."):
    "Đang đến lượt "+NAMES[game.turn]+".";
  hand.replaceChildren();
  for(const card of game.hands[0]){
   const chosen=selected.has(card.id);
   const b=button("","tl-hand-card"+(chosen?" selected":""),
    ()=>selectCard(card.id));
   b.disabled=!canAct;b.setAttribute("aria-label",label(card)+", "+SUIT_NAMES[card.suit]);
   b.setAttribute("aria-pressed",String(chosen));
   b.append(face(card));hand.append(b);
  }
  const combo=analyze(game.hands[0].filter(c=>selected.has(c.id)));
  const ok=selectedValid();
  $("tlPlay").disabled=!ok;$("tlPass").disabled=!canAct||!game.last;
  $("tlSuggest").disabled=!canAct;
  $("tlSelected").textContent=combo?
    "Đã chọn: "+kind[combo.type]+" ("+selected.size+" lá)"+
      (ok?" · Có thể đánh":" · Chưa đủ mạnh hoặc cần 3♠"):
    selected.size?"Bộ bài chưa hợp lệ.":"Chọn các lá cần đánh.";
  logs.replaceChildren();
  for(const line of game.history.slice(-9).reverse())logs.append(el("p","",line));
 }
 $("tlPlay").addEventListener("click",act);
 $("tlPass").addEventListener("click",skip);
 $("tlSuggest").addEventListener("click",suggest);
 $("tlNew").addEventListener("click",begin);
 $("tlExit").addEventListener("click",exit);
 return {start:begin,stop};
}
