/* MR LEE Arena V22 — public 52-card visual deal for Tiến Lên PvP.
 * Hands are already privately dealt by the server. This module renders ONLY
 * generic card backs and cannot read other players' secret cards.
 * Timed to the server-authoritative readyAt timestamp; never affects G.
 */
export const DEAL_DURATION_MS=3700;
export const TURN_DURATION_MS=20000;
export function isDealing(state,offset=0){
 const deadline=Date.parse(state?.roundReadyAt||"");
 return Number.isFinite(deadline)&&Date.now()+offset<deadline;
}
export function showRoomDeal(board,{roundReadyAt,offset=0,roundIndex=1}={}){
 if(!board||!roundReadyAt)return null;
 const ready=Date.parse(roundReadyAt);
 const remaining=Math.max(0,ready-Date.now()-offset);
 if(!Number.isFinite(ready)||remaining<=0)return null;
 const elapsed=Math.max(0,Math.min(DEAL_DURATION_MS,DEAL_DURATION_MS-remaining));
 const mask=document.createElement("div");
 mask.className="arena-v22-deal-mask";
 mask.setAttribute("role","status");mask.setAttribute("aria-live","polite");
 mask.setAttribute("aria-label","Đang xào và chia đủ 52 lá bài cho ván "+roundIndex);
 const title=document.createElement("strong");
 title.className="arena-v22-deal-title";
 const subtitle=document.createElement("span");
 subtitle.className="arena-v22-deal-subtitle";
 mask.append(title,subtitle);
 const stage=document.createElement("div");stage.className="arena-v22-deal-stage";
 mask.append(stage);
 const paths=[
  {x:0,y:-110,angle:-1},  // top
  {x:-260,y:-5,angle:-72}, // left
  {x:260,y:-5,angle:72},  // right
  {x:0,y:160,angle:0}    // human
 ];
 // The same exact 52 round-robin visual seats on every client, regardless
 // of which player's real, private hand sits at which table position.
 const positions=[3,0,1,2];
 const quality=document.documentElement.dataset.arenaVisuals||"full";
 const skipMotion=quality==="off"||matchMedia("(prefers-reduced-motion: reduce)").matches;
 for(let i=0;i<52&&!skipMotion;i++){
  const startAt=780+i*39;
  if(startAt+320<=elapsed)continue;
  const el=document.createElement("span");el.className="arena-v22-back";
  el.textContent="L";el.setAttribute("aria-hidden","true");
  stage.append(el);
  const place=paths[positions[i%4]];
  const spread=Math.floor(i/4)-6;
  const dx=place.x+spread*(i%4===3?8:4);
  const dy=place.y+(i%4===3?Math.floor(i/4)*-1:0);
  const animation=el.animate([
   {opacity:1,transform:"translate3d(-50%,-50%,0) rotate(0deg) scale(1)"},
   {opacity:1,transform:"translate3d(calc(-50% + "+dx*.55+"px),calc(-50% + "+dy*.55+"px),0) rotate("+(place.angle*.5)+"deg) scale(.85)",offset:.58},
   {opacity:0,transform:"translate3d(calc(-50% + "+dx+"px),calc(-50% + "+dy+"px),0) rotate("+place.angle+"deg) scale(.6)"}
  ],{duration:310,delay:startAt-elapsed,fill:"both",
    easing:"cubic-bezier(.18,.78,.24,1)"});
  animation.finished.catch(()=>{}).then(()=>el.remove());
 }
 const update=()=>{
  const left=Math.max(0,ready-Date.now()-offset);
  const elapsedNow=DEAL_DURATION_MS-left;
  title.textContent=elapsedNow<780?"🃏 ĐANG XÀO BÀI":
   elapsedNow<3100?"🂠 ĐANG CHIA ĐỦ 52 LÁ":"✨ SẮP MỞ LƯỢT";
  subtitle.textContent=left<=0?"Ván đã sẵn sàng":"Ván "+roundIndex+
   " · Đồng hồ 20 giây chỉ bắt đầu khi chia xong";
 };
 update();
 const ticker=setInterval(update,125);
 const endTimer=setTimeout(()=>{
  clearInterval(ticker);mask.remove();
 },remaining+25);
 mask.dispose=()=>{clearInterval(ticker);clearTimeout(endTimer);mask.remove();};
 board.append(mask);
 return mask;
}
