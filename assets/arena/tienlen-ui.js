/* MR LEE Tiến Lên — four-seat cinematic table, original authoritative local rules.
 * Deck/deal/play/chop are visual only. The rules and winners remain in tienlen-engine.js.
 */
import {start,label,analyze,canPlay,play,pass,botTurn,options,NAMES} from "./tienlen-engine.js";
import {playingCard,cardBack,chopTitle,createTableEffects} from "./tienlen-fx.js";
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
const seat=["bottom","top","left","right"];
const avatar=["🧑","👩🏻","🧑🏻","👩🏽"];
const formattedGold=v=>(Math.max(0,Number(v)||0)).toLocaleString("vi-VN");
export function mountTienLen({onStart,onFinish,onExit,getGold=()=>0,getPlayerName=()=> "Bạn"}){
 const root=$("arenaTienLen"),board=$("tlBoard"),hand=$("tlHand"),opponents=$("tlOpponents"),pile=$("tlPile");
 const status=$("tlStatus"),message=$("tlHint"),count=$("tlCount"),logs=$("tlEvents");
 const fx=createTableEffects(board,pile);
 let game=null,selected=new Set(),timer=null,epoch=0,done=false,busy=false;
 function stop(){
  epoch++;if(timer!==null)clearTimeout(timer);
  timer=null;busy=false;fx.cancel();
  $("tlDealNotice").hidden=true;
 }
 function exit(){stop();root.hidden=true;game=null;onExit();}
 async function begin(){
  if(!onStart())return;
  stop();
  const current=epoch;game=start();selected=new Set();done=false;busy=true;
  board.dataset.fxCount="0";board.dataset.lastFx="";
  root.querySelector(".arena-game-result")?.remove();
  root.hidden=false;root.scrollIntoView({behavior:"smooth",block:"start"});
  $("tlDealNotice").hidden=false;
  render();
  try{await fx.deal();}
  catch(err){message.textContent="Không thể chạy hoạt ảnh: "+err.message;}
  if(current!==epoch||root.hidden||!game)return;
  $("tlDealNotice").hidden=true;
  busy=false;render();schedule();
 }
 function finish(){
  if(done||!game||game.winner===null)return;
  done=true;stop();
  const won=game.winner===0;
  const otherTwos=game.hands.filter((h,i)=>i!==game.winner).flat().filter(c=>c.rank===15).length;
  message.textContent=(won?"Bạn về nhất!":NAMES[game.winner]+" về nhất!")+
   (otherTwos?" · Còn "+otherTwos+" lá 2 trong tay người thua (thối heo, chỉ thông báo).":"");
  onFinish(won?"win":"loss","Tiến lên miền Nam",root);
  render();
 }
 const selectedValid=()=>!!game&&!busy&&!done&&game.turn===0&&game.winner===null&&canPlay(game,0,[...selected]);
 function toggleCard(id){
  if(!game||busy||game.turn!==0||done)return;
  if(selected.has(id))selected.delete(id);else selected.add(id);
  render();
 }
 function suggest(){
  if(!game||busy||game.turn!==0||done)return;
  const choices=options(game.hands[0]).filter(cards=>canPlay(game,0,cards.map(c=>c.id)));
  if(!choices.length){message.textContent="Không có bộ bài hợp lệ. Hãy bỏ lượt nếu vòng đã mở.";return;}
  choices.sort((a,b)=>{
   const A=analyze(a),B=analyze(b);
   return game.last?A.high-B.high||a.length-b.length:b.length-a.length||A.high-B.high;
  });
  selected=new Set(choices[0].map(c=>c.id));render();
  message.textContent="Gợi ý: "+choices[0].map(label).join(" ");
 }
 async function animatePlayed(cards,who,previous,current,rects){
  // Position of the cards is measured before mutating the visible hand.
  board.dataset.lastMoveSeat=seat[who];
  const chop=chopTitle(previous,current);
  await fx.throwCards(cards,who,rects,chop);
 }
 async function act(){
  if(!selectedValid())return;
  const ids=[...selected],cards=ids.map(id=>game.hands[0].find(c=>c.id===id));
  const rectangles=ids.map(id=>hand.querySelector('[data-card-id="'+id+'"]')?.getBoundingClientRect());
  const previous=game.last?.combo||null;
  try{
   const combo=play(game,0,ids);
   selected.clear();busy=true;const current=epoch;
   const flight=animatePlayed(cards,0,previous,combo,rectangles);
   render();
   await flight;
   if(current!==epoch||!game||root.hidden)return;
   busy=false;render();
   if(game.winner!==null)finish();else schedule();
  }catch(err){busy=false;message.textContent="Không đánh được: "+err.message;render();}
 }
 function skip(){
  if(!game||busy||game.turn!==0||!game.last||done)return;
  try{
   pass(game,0);selected.clear();
   fx.passer(NAMES[0],0);render();schedule();
  }catch(err){message.textContent=err.message;}
 }
 function schedule(){
  if(!game||busy||done||game.winner!==null||game.turn===0||timer!==null)return;
  const snapshot=epoch;
  timer=setTimeout(async()=>{
   timer=null;
   if(snapshot!==epoch||!game||done||root.hidden||game.turn===0)return;
   const who=game.turn,previous=game.last?.combo||null;
   try{
    botTurn(game);
    if(game.last?.player===who&&game.played.length){
     busy=true;
     const moveCards=game.played.slice();
     const combo=game.last.combo;
     const flight=animatePlayed(moveCards,who,previous,combo,[]);
     render();
     await flight;
     if(snapshot!==epoch||!game||done||root.hidden)return;
     busy=false;
    }else fx.passer(NAMES[who],who);
    render();
    if(game.winner!==null)finish();
    else schedule();
   }catch(err){busy=false;message.textContent="Lỗi lượt máy: "+err.message;render();}
  },550);
 }
 function renderSeat(who){
  const div=el("div","tl-opponent"+(game.turn===who?" active":""));
  div.dataset.seat=seat[who];div.dataset.player=String(who);
  const identity=el("div","tl-seat-id"),avatarNode=el("span","tl-avatar",avatar[who]);
  const info=el("span","tl-seat-meta");
  info.append(el("strong","",NAMES[who]),el("small","","🪙 0 vàng demo"));
  identity.append(avatarNode,info);
  const fan=el("div","tl-back-fan");fan.setAttribute("aria-label",game.hands[who].length+" lá bài úp");
  // Actual opponent cards are NEVER displayed face-up, even briefly while dealing.
  const layers=Math.min(5,Math.max(0,game.hands[who].length));
  for(let i=0;i<layers;i++){
   const back=cardBack();
   back.style.setProperty("--fan",String(i-(layers-1)/2));
   fan.append(back);
  }
  const count=el("small","tl-seat-count","🂠 ×"+game.hands[who].length+" lá");
  const state=el("small","tl-seat-state",done?"Đã kết thúc":game.turn===who?"⏳ Đang suy nghĩ":"Đang chờ");
  div.append(identity,fan,count,state);
  return div;
 }
 function render(){
  if(!game||root.hidden)return;
  const playable=game.turn===0&&game.winner===null&&!busy&&!done;
  opponents.replaceChildren(...[1,2,3].map(renderSeat));
  const previous=game.last?.combo;
  pile.replaceChildren();
  if(!game.played.length)pile.append(el("p","tl-empty","Vòng mới · Chưa có bài trên bàn"));
  else for(const c of game.played)pile.append(playingCard(c));
  $("tlPlayerName").textContent=String(getPlayerName()||"Bạn").slice(0,35);
  $("tlPlayerGold").textContent="🪙 "+formattedGold(getGold())+" vàng demo";
  count.textContent="🃏 "+game.hands[0].length+" lá · "+(previous?kind[previous.type]:"Vòng mới");
  if(!done)status.textContent=busy?
   board.dataset.fxPhase==="shuffle"?"🃏 Đang xáo bài…":
    board.dataset.fxPhase==="deal"?"🃏 Đang chia bài…":"🃏 Đang đánh bài ra giữa bàn…":
   playable?(game.first?"Bạn có 3♠, lượt mở đầu phải dùng lá này.":"✨ Lượt của bạn · chọn bài và đánh ra giữa bàn.") :
    "⏳ Đến lượt "+NAMES[game.turn]+"…";
  hand.replaceChildren();
  for(const card of game.hands[0]){
   const chosen=selected.has(card.id);
   const b=button("","tl-hand-card"+(chosen?" selected":""),()=>toggleCard(card.id));
   b.dataset.cardId=card.id;
   b.disabled=!playable;b.setAttribute("aria-label",label(card)+", lá bài thật");
   b.setAttribute("aria-pressed",String(chosen));
   b.append(playingCard(card));hand.append(b);
  }
  const combo=analyze(game.hands[0].filter(c=>selected.has(c.id)));
  $("tlPlay").disabled=!selectedValid();
  $("tlPass").disabled=!playable||!game.last;
  $("tlSuggest").disabled=!playable;
  $("tlSelected").textContent=combo?
   "Đã chọn: "+kind[combo.type]+" ("+selected.size+" lá)"+
    (selectedValid()?" · ĐỦ ĐIỀU KIỆN ĐÁNH":" · chưa hợp lệ/chưa đủ mạnh"):
   selected.size?"Bộ bài đang chọn chưa hợp lệ.":"Chọn một hoặc nhiều lá trên tay để đánh.";
  logs.replaceChildren();
  for(const text of game.history.slice(-9).reverse())logs.append(el("p","",text));
 }
 $("tlPlay").addEventListener("click",act);
 $("tlPass").addEventListener("click",skip);
 $("tlSuggest").addEventListener("click",suggest);
 $("tlNew").addEventListener("click",begin);
 $("tlExit").addEventListener("click",exit);
 return {start:begin,stop,refreshHUD:()=>{if(game&&!root.hidden)render();}};
}
