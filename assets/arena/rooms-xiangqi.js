/* MR LEE Arena — online Xiangqi/Cờ Úp board. Server validates every action.
 * `covered` identities are deliberately masked in the payload. */
import {xiangqiLegal,camp,GLYPH,isXiangqiCheck} from "./xiangqi-engine.js";
import {animateBoardMove,enablePointerDrag} from "./drag-gestures.js?v=20261107-motion-v22b";
const el=(tag,cls="",content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=String(content);return n;};
const action=(label,handler)=>{const b=el("button","arena-online-xq-action",label);b.type="button";b.addEventListener("click",handler);return b;};
const fmt=ms=>{if(!Number.isFinite(ms))return "--:--";const total=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(total/60)).padStart(2,"0")+":"+String(total%60).padStart(2,"0");};
export function mountOnlineXiangqi(root,submit){
 let chosen=-1,shown=null,offset=0,locked=false;
 const displayedClock=seat=>{
  const state=shown?.gameState,clock=state?.clock;
  if(!clock)return "∞";
  let remaining=Number(clock.remaining?.[seat])||0;
  if(shown?.status==="playing"&&state.turn===seat&&clock.since)
   remaining-=Math.max(0,Date.now()+offset-Date.parse(clock.since));
  return fmt(remaining);
 };
 setInterval(()=>{
  if(!shown||shown.game!=="xiangqi")return;
  root.querySelectorAll("[data-xq-clock]").forEach(node=>{
   const seat=Number(node.dataset.xqClock);node.textContent=displayedClock(seat);
   node.classList.toggle("urgent",shown?.status==="playing"&&shown.gameState?.turn===seat&&
    shown.gameState?.clock?.remaining?.[seat]<30000);
  });
 },250);
 async function send(payload){
  if(locked||!shown||shown.status!=="playing")return;
  locked=true;
  try{await submit(payload);chosen=-1;}
  finally{locked=false;}
 }
 function clear(){chosen=-1;shown=null;root.replaceChildren();}
 function render(room,force=false){
  const prev=shown,state=room.gameState,position=state.position;
  if(!position||!Array.isArray(position.b)||position.b.length!==90)throw Error("Bàn Cờ Tướng sai dữ liệu.");
  const side=room.seat===0?1:-1;
  const mine=room.status==="playing"&&state.turn===room.seat;
  const turnChanged=prev?.code===room.code&&prev?.roundIndex===room.roundIndex&&
   prev?.gameState?.position?.last?.join()!==position.last?.join()&&room.version!==prev.version;
  if(turnChanged&&position.last){
   const [f,t]=position.last,from=root.querySelector('.arena-online-xq-board [data-index="'+f+'"]'),
    to=root.querySelector('.arena-online-xq-board [data-index="'+t+'"]');
   if(from&&to)animateBoardMove({from,to,piece:from.querySelector(".arena-online-xq-piece"),kind:"xiangqi-piece"});
  }
  if(!force&&(prev?.code!==room.code||prev?.version!==room.version))chosen=-1;
  shown=room;offset=Date.parse(room.serverTime||"")-Date.now()||0;
  const valid=mine?xiangqiLegal(position,side):[];
  const targets=new Set(valid.filter(x=>x[0]===chosen).map(x=>x[1]));
  const main=el("section","arena-online-xq"),
    top=el("header","arena-online-xq-heading");
  const heading=el("div");
  heading.append(el("strong","",state.variant==="up"?"CỜ ÚP · PvP":"CỜ TƯỚNG · PvP"),
   el("small","",room.code+" · "+room.minGold+"G/ván · "+(state.timeControl==="none"?"Không đồng hồ":state.timeControl)));
  top.append(heading,el("span","arena-online-xq-turn",room.status==="finished"?
   (state.winner===-1?"🤝 Hòa":state.winner===room.seat?"🏆 Bạn thắng":"Đối thủ thắng"):
   mine?"● LƯỢT CỦA BẠN":"⏳ Chờ đối thủ"));
  const boardArea=el("div","arena-online-xq-layout"),stack=el("div","arena-online-xq-stack");
  const playerBar=seat=>{
   const person=room.players.find(x=>x.seat===seat),
    bar=el("div","arena-online-xq-player"+(state.turn===seat&&room.status==="playing"?" active":""));
   bar.append(el("span","arena-online-xq-player-icon",seat===0?"帥":"將"),
    el("strong","",person?.name||"Người chơi"),
    el("time","arena-online-xq-clock",displayedClock(seat)));
   bar.lastElementChild.dataset.xqClock=String(seat);
   return bar;
  };
  const enemy=room.seat===0?1:0;stack.append(playerBar(enemy));
  const board=el("div","arena-online-xq-board");
  board.setAttribute("role","group");board.setAttribute("aria-label",
   "Bàn cờ 9 cột 10 hàng, quân "+(side===1?"đỏ":"đen")+" ở dưới");
  for(let rr=0;rr<10;rr++)for(let cc=0;cc<9;cc++){
   const row=side===1?rr:9-rr,col=side===1?cc:8-cc,
    index=row*9+col,p=position.b[index],selected=chosen===index,hit=targets.has(index);
   const tile=el("button","arena-online-xq-cell"+(selected?" selected":"")+(hit?" target":"")+
    (row===4?" river-top":row===5?" river-bottom":""));
   tile.type="button";tile.dataset.index=String(index);
   const label=p?.covered?"Quân úp":p?GLYPH[p.p]:"trống";
   tile.setAttribute("aria-label","Hàng "+(row+1)+" cột "+(col+1)+": "+label);
   tile.setAttribute("aria-pressed",String(selected));
   tile.addEventListener("click",()=>{
    if(!mine||locked)return;
    if(chosen>=0&&valid.some(m=>m[0]===chosen&&m[1]===index)){
     const from=board.querySelector('[data-index="'+chosen+'"]');
     animateBoardMove({from,to:tile,piece:from?.querySelector(".arena-online-xq-piece"),kind:"xiangqi-piece"});
     void send({kind:"play",from:chosen,to:index});return;
    }
    chosen=camp(p)===side?(chosen===index?-1:index):-1;
    render(room,true);
   });
   if(p){
    const token=el("span","arena-online-xq-piece "+(camp(p)===1?"red":"black")+
     (p.covered?" covered":""),p.covered?"棋":GLYPH[p.p]);
    tile.append(token);
   }else if(hit)tile.append(el("span","arena-online-xq-target",""));
   board.append(tile);
  }
  stack.append(board,playerBar(room.seat));
  const sidebar=el("aside","arena-online-xq-sidebar");
  if(room.status==="playing"){
   const controls=el("div","arena-online-xq-actions");
   if(state.drawOfferedBy===enemy){
    controls.append(el("p","arena-online-xq-invite","Đối thủ đề nghị hòa."),
     action("✓ Chấp nhận hòa",()=>void send({kind:"accept_draw"})),
     action("✕ Từ chối",()=>void send({kind:"decline_draw"})));
   }else{
    const offer=action("🤝 Đề nghị hòa",()=>void send({kind:"offer_draw"}));
    offer.disabled=!mine||state.drawOfferedBy===room.seat;
    controls.append(offer);
    if(state.drawOfferedBy===room.seat)controls.append(el("small","","Đã gửi đề nghị hòa."));
   }
   controls.append(action("🏳️ Đầu hàng",()=>{
    if(window.confirm("Đầu hàng sẽ kết thúc ván và mất mức cược G theo luật. Xác nhận?"))
     void send({kind:"resign"});
   }));
   sidebar.append(controls);
  }else sidebar.append(el("p","arena-online-xq-result",
   state.reason||"Ván đã kết thúc; G được máy chủ quyết toán."));
  if(mine&&isXiangqiCheck(position,side))sidebar.append(el("strong","arena-online-xq-check","⚠️ Tướng đang bị chiếu!"));
  const log=el("div","arena-online-xq-history");
  (state.notation||[]).slice(-20).forEach((m,i)=>log.append(el("p","",m)));
  sidebar.append(el("h3","","Biên bản nước đi"),log,
   el("small","",state.variant==="up"?
    "Quân úp chỉ lộ mặt khi di chuyển; danh tính chưa mở được giữ kín trên máy chủ.":
    "Đi quân đúng luật. Máy chủ xác nhận mỗi nước đi."));
  boardArea.append(stack,sidebar);main.append(top,boardArea);
  root.replaceChildren(main);
 }
 enablePointerDrag({
  root,itemSelector:".arena-online-xq-board .arena-online-xq-cell[data-index]",
  targetSelector:".arena-online-xq-board .arena-online-xq-cell[data-index]",
  previewSelector:".arena-online-xq-piece",
  canStart:item=>{
   if(!shown||locked||shown.status!=="playing"||shown.gameState.turn!==shown.seat)return false;
   const i=Number(item.dataset.index);
   return camp(shown.gameState.position.b[i])===(shown.seat===0?1:-1);
  },
  canDrop:(from,to)=>Boolean(shown&&!locked&&shown.status==="playing"&&
   shown.gameState.turn===shown.seat&&xiangqiLegal(shown.gameState.position).some(m=>
    m[0]===Number(from.dataset.index)&&m[1]===Number(to.dataset.index))),
  onDrop:(from,to)=>{
   const a=Number(from.dataset.index),b=Number(to.dataset.index);
   if(!shown||locked)return false;
   chosen=-1;void send({kind:"play",from:a,to:b});return true;
  }
 });
 return {render,clear};
}
