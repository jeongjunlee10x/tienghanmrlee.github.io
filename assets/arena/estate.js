/* Địa Ốc Đại Chiến — 4-player turn-based property strategy, entirely demo.
 * Board credits are not verified G, cannot be cashed out, and do not touch XP. */
const $=id=>document.getElementById(id);
const el=(tag,cl="",t)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(t!==undefined)x.textContent=String(t);return x;};
const btn=(t,cl,handler)=>{const b=el("button",cl,t);b.type="button";if(handler)b.addEventListener("click",handler);return b;};
const names=["Bạn","Minh","Lan","Jun"],icons=["🧑","👩🏻","🧑🏻","👩🏽"];
const MONEY=n=>Math.round(n).toLocaleString("vi-VN")+" xu";
const items=[
 ["start","XUẤT PHÁT",0],["property","Seoul",180],["bonus","Học bổng",130],
 ["property","Busan",155],["tax","Phí dịch vụ",105],["property","Daegu",140],
 ["property","Incheon",175],["chance","Vận may",0],["property","Jeju",195],
 ["property","Suwon",145],["free","Nghỉ ngơi",0],["property","Gwangju",135],
 ["bonus","Phúc lợi",110],["property","Daejeon",160],["tax","Thuế nhà đất",140],
 ["property","Ulsan",145],["chance","Vận may",0],["property","Chuncheon",115],
 ["property","Gangneung",140],["free","Công viên",0],["property","Sejong",155],
 ["bonus","Khuyến học",120],["property","Pohang",130],["chance","Vận may",0]
];
export const ESTATE_PATH=(()=>{const a=[];for(let c=0;c<7;c++)a.push([0,c]);for(let r=1;r<7;r++)a.push([r,6]);for(let c=5;c>=0;c--)a.push([6,c]);for(let r=5;r>0;r--)a.push([r,0]);return a;})();
const dice=()=>Math.floor(Math.random()*6)+1;
export function newEstate(roundLimit=16){
 if(![8,16,24].includes(roundLimit))throw Error("Chọn 8, 16 hoặc 24 vòng.");
 return {tiles:items.map(([kind,name,price])=>({kind,name,price,owner:-1,level:0})),
  players:names.map((name,i)=>({name,at:0,cash:1800,bankrupt:false,index:i})),
  turn:0,phase:"roll",roll:[0,0],turns:0,roundLimit,winner:null,offer:-1,
  history:["Mỗi người có 1.800 xu demo. Qua XUẤT PHÁT nhận 200 xu. Tối đa "+roundLimit+" vòng."]};
}
export function estateAssets(g,player){
 const p=g.players[player];
 return p.cash+g.tiles.filter(t=>t.owner===player)
  .reduce((s,t)=>s+t.price+Math.round(t.price*.55)*t.level,0);
}
export function estateRent(tile){return Math.round(tile.price*.24*(1+tile.level*.85));}
function freeAssets(g,who){g.tiles.forEach(t=>{if(t.owner===who){t.owner=-1;t.level=0;}});}
function debit(g,who,amount,to=-1){
 const p=g.players[who],paid=Math.min(p.cash,Math.max(0,amount));
 p.cash-=paid;if(to>=0)g.players[to].cash+=paid;
 if(paid<amount){
  freeAssets(g,who);p.bankrupt=true;p.cash=0;
  g.history.push("💥 "+p.name+" phá sản, tài sản trả về ngân hàng.");
 }
 return paid;
}
export function estateRoll(g,a=dice(),b=dice()){
 if(g.phase!=="roll"||g.winner!==null)throw Error("Không phải lúc tung xúc xắc.");
 if(![a,b].every(n=>Number.isInteger(n)&&n>=1&&n<=6))throw Error("Xúc xắc không hợp lệ.");
 const p=g.players[g.turn];g.roll=[a,b];const next=p.at+a+b;
 if(next>=24){p.cash+=200;g.history.push("💰 "+p.name+" nhận 200 xu qua XUẤT PHÁT.");}
 p.at=next%24;
 const tile=g.tiles[p.at];
 g.history.push("🎲 "+p.name+" tung "+a+" + "+b+" → "+tile.name+".");
 if(tile.kind==="property"){
  if(tile.owner===-1){g.offer=p.at;g.phase="offer";return g;}
  if(tile.owner!==g.turn){
   const rent=estateRent(tile),paid=debit(g,g.turn,rent,tile.owner);
   g.history.push("🏠 Tiền thuê "+tile.name+": "+MONEY(paid)+" trả cho "+names[tile.owner]+".");
  }else g.history.push("🏡 Đã sở hữu "+tile.name+".");
 }else if(tile.kind==="bonus"){p.cash+=tile.price;g.history.push("🎁 Nhận "+MONEY(tile.price)+".");}
 else if(tile.kind==="tax"){
  const paid=debit(g,g.turn,tile.price);g.history.push("🧾 Đóng phí "+MONEY(paid)+".");
 }else if(tile.kind==="chance"){
  const delta=[200,120,80,-80,-125,-180][Math.floor(Math.random()*6)];
  if(delta>=0)p.cash+=delta;else debit(g,g.turn,-delta);
  g.history.push("✨ Vận may: "+(delta>=0?"+":"")+MONEY(delta)+".");
 }
 endTurn(g);return g;
}
export function estateBuy(g,yes){
 if(g.phase!=="offer"||g.offer<0)throw Error("Không có bất động sản chờ mua.");
 const tile=g.tiles[g.offer],p=g.players[g.turn];
 if(tile.owner!==-1)throw Error("Bất động sản đã có chủ.");
 if(yes&&p.cash>=tile.price){
  p.cash-=tile.price;tile.owner=g.turn;
  g.history.push("✅ "+p.name+" mua "+tile.name+" với "+MONEY(tile.price)+".");
 }else g.history.push("⏭ "+p.name+" bỏ qua "+tile.name+".");
 g.offer=-1;endTurn(g);return g;
}
export function estateUpgrade(g,idx){
 const tile=g.tiles[idx],p=g.players[g.turn];
 if(g.phase!=="roll"||!tile||tile.owner!==g.turn||tile.level>=3||p.bankrupt)
  throw Error("Chỉ nâng cấp đất của bạn trong lượt chờ tung.");
 const cost=Math.round(tile.price*.55);
 if(p.cash<cost)throw Error("Không đủ xu demo để nâng cấp.");
 p.cash-=cost;tile.level++;g.history.push("🏗 "+p.name+" nâng cấp "+tile.name+" lên cấp "+tile.level+".");
 return g;
}
function endTurn(g){
 g.turns++;
 const active=g.players.filter(p=>!p.bankrupt);
 if(active.length<=1||g.turns>=4*g.roundLimit){
  const ranks=g.players.map((p,i)=>({i,total:p.bankrupt?-1:estateAssets(g,i)}))
   .sort((a,b)=>b.total-a.total);
  g.winner=ranks[0].i;g.phase="end";g.offer=-1;
  g.history.push("🏆 "+names[g.winner]+" thắng theo tổng tài sản sau "+Math.ceil(g.turns/4)+" vòng.");
  return;
 }
 do{g.turn=(g.turn+1)%4;}while(g.players[g.turn].bankrupt);
 g.phase="roll";g.roll=[0,0];g.offer=-1;
}
// Estate opponents select legal buying and construction decisions from a
// visible valuation model; difficulty adjusts reserves and risk tolerance.
export function estateBotPlan(g,difficulty="normal",rng=Math.random){
 const who=g.turn,p=g.players[who];
 const reserve=difficulty==="hard"?460:difficulty==="normal"?260:100;
 const candidates=g.tiles.map((tile,index)=>({tile,index}))
  .filter(({tile})=>tile.kind==="property"&&tile.owner===who&&tile.level<3)
  .filter(({tile})=>p.cash>=Math.round(tile.price*.55)+reserve)
  .sort((a,b)=>{
   const gain=x=>estateRent({...x.tile,level:x.tile.level+1})-estateRent(x.tile);
   return gain(b)-gain(a);
  });
 const chance=difficulty==="hard"?.68:difficulty==="normal"?.34:.12;
 const upgrade=candidates.length&&rng()<chance?candidates[0].index:-1;
 const tile=g.phase==="offer"?g.tiles[g.offer]:null;
 const afford=Boolean(tile&&tile.kind==="property"&&tile.owner===-1&&
  p.cash>=tile.price+reserve);
 const buy=afford&&(difficulty==="hard"||
  rng()<(difficulty==="normal"?.91:.62));
 return {upgrade,buy};
}
import {animateBoardMove} from "./drag-gestures.js?v=20261107-v19";
import {emitArenaFX} from "./game-visuals-v19.js?v=20261107-approved-v20";
export function mountEstate({onStart,onFinish,onExit}){
 const root=$("arenaEstate"),board=$("estateBoard"),status=$("estateStatus");
 const requested=Number(new URL(location.href).searchParams.get("rounds"));
 if([8,16,24].includes(requested)&&$("estateDuration"))$("estateDuration").value=String(requested);
 let g=null,timer=null,epoch=0,done=false;
 function stop(){epoch++;if(timer!==null)clearTimeout(timer);timer=null;if($("estateDuration"))$("estateDuration").disabled=false;}
 function exit(){stop();g=null;root.hidden=true;onExit();}
 function finish(){
  if(done||!g||g.winner===null)return;
  done=true;stop();onFinish(g.winner===0?"win":"loss","Địa Ốc Đại Chiến",root);
 }
 function start(){
  if(!onStart())return;
  stop();done=false;g=newEstate(Number($("estateDuration")?.value||16));
  if($("estateDuration"))$("estateDuration").disabled=true;
  root.querySelector(".arena-game-result")?.remove();
  root.hidden=false;render();root.scrollIntoView({behavior:"smooth",block:"start"});
 }
 function roll(){
  if(!g||g.turn!==0||g.phase!=="roll"||done)return;
  const actor=g.turn,from=board.querySelector('[data-player="'+actor+'"]');
  estateRoll(g);
  if(g.players[actor].at!==Number(from?.dataset.position)){
   const to=board.querySelector('[data-path-index="'+g.players[actor].at+'"]');
   animateBoardMove({from,to,piece:from,kind:"estate-pawn"});
  }
  render();bumpDice();if(g.winner!==null)finish();else schedule();
 }
 function bumpDice(){
  for(const target of [$("estateDice"),board.querySelector(".estate-middle-dice")]){
   if(!target)return;
   target.classList.remove("arena-dice-rolling","arena-v22-dice-rolling");
   void target.offsetWidth;target.classList.add("arena-v22-dice-rolling");
   setTimeout(()=>target.classList.remove("arena-v22-dice-rolling"),760);
  }
 }
 function buy(yes){
  if(!g||g.turn!==0||g.phase!=="offer"||done)return;
  const index=g.offer;estateBuy(g,yes);render();
  if(yes&&g.tiles[index]?.owner===0)emitArenaFX("estate",board.querySelector('[data-path-index="'+index+'"]'),"ĐÃ MUA ĐẤT");
  if(g.winner!==null)finish();else schedule();
 }
 function schedule(){
  if(!g||g.turn===0||done||timer!==null)return;
  const stamp=epoch;
  timer=setTimeout(()=>{
   timer=null;if(!g||root.hidden||stamp!==epoch||done||g.turn===0)return;
   const who=g.turn,p=g.players[who];
   if(g.phase==="roll"){
    const decision=estateBotPlan(g,$("estateLevel")?.value||"normal");
    if(decision.upgrade>=0)estateUpgrade(g,decision.upgrade);
    const from=board.querySelector('[data-player="'+who+'"]');
    estateRoll(g);
    if(g.players[who].at!==Number(from?.dataset.position)){
     const to=board.querySelector('[data-path-index="'+g.players[who].at+'"]');
     animateBoardMove({from,to,piece:from,kind:"estate-pawn"});
    }
   }
   if(g.phase==="offer"){
    const land=g.tiles[g.offer];
    estateBuy(g,estateBotPlan(g,$("estateLevel")?.value||"normal").buy);
   }
   render();bumpDice();if(g.winner!==null)finish();else schedule();
  },360);
 }
 function render(){
  if(!g||root.hidden)return;
  const p=g.players[g.turn],yourTurn=g.turn===0&&!done;
  const oppBar=$("estateOppBar"),meBar=$("estateMeBar");
  oppBar?.classList.toggle("is-turn",g.turn!==0&&g.winner===null);
  meBar?.classList.toggle("is-turn",g.turn===0&&g.winner===null);
  const oppTitle=oppBar?.querySelector("strong");
  if(oppTitle)oppTitle.textContent=g.turn===0?"🤖 3 ĐỐI THỦ MÁY":"🤖 "+p.name+" ĐANG CHƠI";
  const myTitle=meBar?.querySelector("strong");
  if(myTitle)myTitle.textContent="THẦY LEE · "+MONEY(g.players[0].cash)+" (MÔ PHỎNG)";
  for(const [bar,active] of [[oppBar,g.turn!==0],[meBar,g.turn===0]]){
   const badge=bar?.querySelector(".arena-v20-turn-badge");
   if(badge)badge.textContent=g.winner!==null?"KẾT THÚC":active?"● ĐANG ĐÁNH":"ĐANG CHỜ";
  }
  status.textContent=g.winner!==null?"🏆 "+names[g.winner]+" thắng theo tổng tài sản!":
   yourTurn?(g.phase==="offer"?"Bạn có thể mua bất động sản hoặc bỏ qua.":"🎲 Lượt bạn · tung xúc xắc để đi."):
    "⏳ "+p.name+" đang chơi.";
  $("estateRound").textContent="Vòng "+Math.min(g.roundLimit,Math.floor(g.turns/4)+1)+"/"+g.roundLimit;
  $("estateDice").textContent=g.roll[0]?g.roll.join(" + "):"🎲 🎲";
  $("estateRoll").disabled=!yourTurn||g.phase!=="roll";
  const prompt=$("estateOffer");
  prompt.hidden=!(yourTurn&&g.phase==="offer");
  if(!prompt.hidden){
   const tile=g.tiles[g.offer];
   $("estateOfferText").textContent="🏠 "+tile.name+" · Giá "+MONEY(tile.price)+
    " · Thuê "+MONEY(estateRent(tile))+" / lượt ghé.";
   $("estateBuy").disabled=g.players[0].cash<tile.price;
  }
  const all=Array.from({length:49},()=>el("div","estate-cell"));
  g.tiles.forEach((t,i)=>{
   const [r,c]=ESTATE_PATH[i],tile=el("div","estate-tile type-"+t.kind+(t.owner>=0?" owned owner-"+t.owner:""));
   tile.dataset.pathIndex=String(i);
   const title=el("strong","",t.name),detail=el("small","",
    t.kind==="property"?(t.owner>=0?"🏠 "+names[t.owner]+(t.level?" ⭐"+t.level:""):"💰 "+t.price):
    t.kind==="bonus"?"+"+t.price:t.kind==="tax"?"−"+t.price:"");
   tile.append(title,detail);
   const pawns=g.players.filter(p=>!p.bankrupt&&p.at===i);
   if(pawns.length){
    const holder=el("span","estate-tokens");
    for(const player of pawns){
     const person=el("span","estate-pawn",icons[player.index]);
     person.dataset.player=String(player.index);
     person.dataset.position=String(i);
     person.setAttribute("aria-label",player.name+" ở "+t.name);
     holder.append(person);
    }
    tile.append(holder);
   }
   all[r*7+c]=tile;
  });
  const center=el("div","estate-center");
  center.append(el("strong","","🏙️ ĐỊA ỐC ĐẠI CHIẾN"),
   el("small","","Tung xúc xắc · Mua đất · Thu tiền thuê · Nâng cấp"),
   el("span","estate-middle-dice",g.roll[0]?g.roll.join(" + "):"🎲"));
  center.append(el("small","estate-ticker",g.history.at(-1)));
  board.replaceChildren(...all,center);
  $("estatePlayers").replaceChildren(...g.players.map((player,i)=>{
   const row=el("div","estate-player"+(g.turn===i?" active":"")+(player.bankrupt?" bankrupt":""));
   row.append(el("strong","",icons[i]+" "+player.name),
    el("small","","💰 "+MONEY(player.cash)+" · 🏘️ "+g.tiles.filter(t=>t.owner===i).length+" đất"),
    el("b","","Tổng: "+MONEY(player.bankrupt?0:estateAssets(g,i))));
   return row;
  }));
  const upgrades=$("estateUpgrades");upgrades.replaceChildren();
  if(yourTurn&&g.phase==="roll"){
   g.tiles.forEach((t,i)=>{
    const cost=Math.round(t.price*.55);
    if(t.owner===0&&t.level<3){
     const b=btn("⬆ "+t.name+" ("+MONEY(cost)+")","arena-soft",()=>{
      try{estateUpgrade(g,i);render();emitArenaFX("estate",board.querySelector('[data-path-index="'+i+'"]'),"NÂNG CẤP");}
      catch(err){status.textContent=err.message;}
     });
     b.disabled=g.players[0].cash<cost;upgrades.append(b);
    }
   });
  }
  $("estateHistory").replaceChildren(...g.history.slice(-5).reverse().map(x=>el("p","",x)));
 }
 $("estateRoll").addEventListener("click",roll);
 $("estateBuy").addEventListener("click",()=>buy(true));
 $("estateSkip").addEventListener("click",()=>buy(false));
 $("estateNew").addEventListener("click",start);
 $("estateExit").addEventListener("click",exit);
 return {start,stop};
}
