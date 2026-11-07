/* MR LEE Arena pointer gestures — original mouse, pen & touch drag control.
 * Pure interaction only. Legality remains with each game engine / PvP server.
 * User can still tap/click the same buttons; drag never triggers an extra click.
 */
const preciseEvent=event=>event.isPrimary&&event.button===0;
const reduceMotion=()=>Boolean(document.documentElement?.dataset)&&document.documentElement.dataset.arenaVisuals==="off"||
 window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
function centerOf(rect){return {x:rect.left+rect.width/2,y:rect.top+rect.height/2};}
// A floating clone moves outside the original board's CSS scope. Preserve its
// computed piece/card styling (including nested rank/suit glyphs) so it never
// turns into a plain rectangle or shrinks to default text when lifted.
function snapshotVisual(source,copy){
 if(typeof window.getComputedStyle!=="function")return;
 const properties=["fontFamily","fontSize","fontWeight","lineHeight","color",
  "backgroundColor","backgroundImage","backgroundSize","backgroundPosition",
  "border","borderRadius","boxShadow","textShadow","padding","display",
  "alignItems","justifyContent","position","inset","opacity"];
 const originals=[source,...source.querySelectorAll("*")];
 const duplicates=[copy,...copy.querySelectorAll("*")];
 for(let i=0;i<Math.min(originals.length,duplicates.length);i++){
  const computed=window.getComputedStyle(originals[i]);
  for(const prop of properties)duplicates[i].style[prop]=computed[prop];
 }
}
function easeOut(ms){return {duration:ms,easing:"cubic-bezier(.18,.85,.28,1)",fill:"forwards"};}
function moveGhost(node,rect,x,y){
 const left=x-rect.width/2,top=y-rect.height/2;
 node.style.transform="translate3d("+Math.round(left)+"px,"+Math.round(top)+"px,0)";
}
function animateGhost(node,rect,from,to,done){
 if(reduceMotion()||!node.animate){done();return;}
 const deltaX=to.x-from.x,deltaY=to.y-from.y;
 const motion=node.animate([
  {transform:"translate3d("+(from.x-rect.width/2)+"px,"+(from.y-rect.height/2)+"px,0) rotate(-2deg) scale(1.08)",opacity:1},
  {transform:"translate3d("+(to.x-rect.width/2)+"px,"+(to.y-rect.height/2)+"px,0) rotate(0deg) scale(.91)",opacity:.85}
 ],easeOut(Math.min(290,170+Math.hypot(deltaX,deltaY)*.14)));
 motion.finished.catch(()=>{}).then(done);
}
export function enablePointerDrag({
 root,itemSelector,targetSelector,canStart=()=>true,canDrop=()=>true,
 onDrop,dropHint="Thả để chơi",previewSelector=null
}){
 if(!root||!itemSelector||!targetSelector)throw Error("Missing drag board selectors");
 let gesture=null;
 const locate=(x,y)=>{
  const hit=document.elementFromPoint(x,y);
  const target=hit?.closest?.(targetSelector);
  return target&&root.contains(target)?target:null;
 };
 function clean(result="cancel",x=null,y=null){
  const g=gesture;if(!g)return;gesture=null;
  document.documentElement.classList.remove("arena-pointer-moving");
  root.classList.remove("arena-dragging");
  g.item.classList.remove("arena-drag-source");
  g.targets.forEach(el=>el.classList.remove("arena-drop-legal","arena-drop-over"));
  if(g.ghost){
   const finish=()=>g.ghost.remove();
   let dest=centerOf(g.rect);
   if(result==="placed"&&g.dropRect)dest=centerOf(g.dropRect);
   animateGhost(g.ghost,g.rect,{x:x??g.x,y:y??g.y},dest,finish);
   // A dragging gesture must not be replayed as a button click after pointerup.
   const stopClick=event=>{event.preventDefault();event.stopImmediatePropagation();};
   document.addEventListener("click",stopClick,true);
   setTimeout(()=>document.removeEventListener("click",stopClick,true),90);
  }
 }
 function down(event){
  if(!preciseEvent(event)||gesture||event.target?.closest?.("[disabled]"))return;
  const item=event.target.closest?.(itemSelector);
  if(!item||!root.contains(item)||!canStart(item,event))return;
  const renderItem=previewSelector?item.querySelector(previewSelector)||item:item;
  const rect=renderItem.getBoundingClientRect();
  gesture={item,rect,x:event.clientX,y:event.clientY,startX:event.clientX,
   startY:event.clientY,pointerId:event.pointerId,ghost:null,targets:[],dropRect:null};
 }
 function move(event){
  const g=gesture;if(!g||event.pointerId!==g.pointerId)return;
  g.x=event.clientX;g.y=event.clientY;
  if(!g.ghost){
   if(Math.hypot(g.x-g.startX,g.y-g.startY)<(event.pointerType==="touch"?9:5))return;
   if(event.cancelable)event.preventDefault();
   const clone=(previewSelector?g.item.querySelector(previewSelector)||g.item:g.item).cloneNode(true);
   snapshotVisual(previewSelector?g.item.querySelector(previewSelector)||g.item:g.item,clone);
   clone.classList.add("arena-drag-ghost");
   clone.removeAttribute("id");
   clone.style.width=g.rect.width+"px";clone.style.height=g.rect.height+"px";
   clone.setAttribute("aria-hidden","true");
   document.body.append(clone);g.ghost=clone;
   g.item.classList.add("arena-drag-source");
   root.classList.add("arena-dragging");
   document.documentElement.classList.add("arena-pointer-moving");
   g.targets=[...root.querySelectorAll(targetSelector)].filter(el=>canDrop(g.item,el));
   g.targets.forEach(el=>el.classList.add("arena-drop-legal"));
  }
  if(event.cancelable)event.preventDefault();
  moveGhost(g.ghost,g.rect,g.x,g.y);
  const current=locate(g.x,g.y);
  g.targets.forEach(el=>el.classList.toggle("arena-drop-over",el===current));
 }
 function up(event){
  const g=gesture;if(!g||event.pointerId!==g.pointerId)return;
  const hit=g.ghost?locate(event.clientX,event.clientY):null;
  const ok=Boolean(hit&&canDrop(g.item,hit));
  if(ok)g.dropRect=hit.getBoundingClientRect();
  let placed=false;
  if(ok)try{
   const result=onDrop(g.item,hit,event);
   placed=result!==false;
   if(result&&typeof result.catch==="function")result.catch(e=>console.warn("Drag move rejected",e));
  }catch(error){console.warn("Illegal drag ignored",error);}
  clean(placed?"placed":"cancel",event.clientX,event.clientY);
 }
 root.addEventListener("pointerdown",down,{passive:true});
 window.addEventListener("pointermove",move,{passive:false});
 window.addEventListener("pointerup",up);
 window.addEventListener("pointercancel",event=>{
  if(gesture&&gesture.pointerId===event.pointerId)clean("cancel");
 });
 window.addEventListener("blur",()=>clean("cancel"));
 return {cancel:()=>clean("cancel")};
}
// The accepted game move remains authoritative; sprites never hold the turn.
const movingSprites=new Set();
export function animateBoardMove({from,to,piece,kind="piece"}){
 if(!from||!to||!piece||reduceMotion()||!piece.animate||document.hidden)return;
 const before=from.getBoundingClientRect(),after=to.getBoundingClientRect();
 const r=piece.getBoundingClientRect();if(!r.width||!r.height)return;
 for(const stale of movingSprites)if(movingSprites.size>=24){stale.remove();movingSprites.delete(stale);}
 const clone=piece.cloneNode(true);snapshotVisual(piece,clone);
 clone.classList.add("arena-move-sprite",kind);
 clone.setAttribute("aria-hidden","true");
 clone.style.width=r.width+"px";clone.style.height=r.height+"px";
 clone.style.left=r.left+"px";clone.style.top=r.top+"px";
 document.body.append(clone);movingSprites.add(clone);
 const dx=after.left+after.width/2-r.left-r.width/2;
 const dy=after.top+after.height/2-r.top-r.height/2;
 const settings={
  "chess-piece":{duration:340,lift:10,scale:1.07,spin:0},
  "xiangqi-piece":{duration:330,lift:14,scale:1.12,spin:0},
  "ludo-piece":{duration:540,lift:24,scale:1.18,spin:0},
  "estate-pawn":{duration:610,lift:27,scale:1.11,spin:0},
  "color-card":{duration:360,lift:35,scale:1.08,spin:-10},
  "piece":{duration:370,lift:12,scale:1.09,spin:0}
 };
 const p=settings[kind]||settings.piece;
 const max=Math.hypot(dx,dy);
 const duration=Math.min(p.duration+Math.min(120,max*.13),750);
 const middle={transform:"translate3d("+(dx*.47)+"px,"+(dy*.47-p.lift)+"px,0) rotate("+
  p.spin*.6+"deg) scale("+p.scale+")",opacity:1,offset:.53};
 const frames=kind==="ludo-piece"||kind==="estate-pawn"?[
  {transform:"translate3d(0,0,0) scale(1)",opacity:1},
  {transform:"translate3d("+(dx*.26)+"px,"+(dy*.26-p.lift)+"px,0) scale("+p.scale+")",opacity:1,offset:.25},
  {transform:"translate3d("+(dx*.52)+"px,"+(dy*.52)+"px,0) scale(1)",opacity:1,offset:.49},
  {transform:"translate3d("+(dx*.76)+"px,"+(dy*.76-p.lift*.7)+"px,0) scale(1.07)",opacity:1,offset:.74},
  {transform:"translate3d("+dx+"px,"+dy+"px,0) scale(1)",opacity:.08}
 ]:[
  {transform:"translate3d(0,0,0) scale(1)",opacity:1},
  middle,
  {transform:"translate3d("+dx+"px,"+dy+"px,0) rotate(0deg) scale(1)",opacity:.12}
 ];
 const animation=clone.animate(frames,{
  duration,easing:"cubic-bezier(.22,.79,.25,1)",fill:"forwards"
 });
 const cleanup=()=>{clone.remove();movingSprites.delete(clone);};
 animation.finished.catch(()=>{}).then(cleanup);
 setTimeout(cleanup,duration+200);
}

/** Real color-card travel: move the newly visible face from the previous
 * player's avatar/deck to the center of the table. No hidden opponent hand
 * is ever queried. Engine/state has already approved the play. */
export function animateCardTransfer({from,to,face,duration=430}={}){
 if(!from||!to||!face||reduceMotion()||document.hidden)return;
 const origin=from.getBoundingClientRect(),dest=to.getBoundingClientRect();
 const r=face.getBoundingClientRect();
 if(!origin.width||!dest.width||!r.width||!r.height)return;
 if(movingSprites.size>=24)return;
 const clone=face.cloneNode(true);
 snapshotVisual(face,clone);clone.classList.add("arena-move-sprite","color-card");
 clone.setAttribute("aria-hidden","true");
 clone.style.width=r.width+"px";clone.style.height=r.height+"px";
 const x=origin.left+origin.width/2-r.width/2,y=origin.top+origin.height/2-r.height/2;
 clone.style.left=x+"px";clone.style.top=y+"px";
 document.body.append(clone);movingSprites.add(clone);
 const dx=dest.left+dest.width/2-(x+r.width/2);
 const dy=dest.top+dest.height/2-(y+r.height/2);
 const animation=clone.animate([
  {transform:"translate3d(0,0,0) rotate(-12deg) scale(.8)",opacity:.9},
  {transform:"translate3d("+(dx*.6)+"px,"+(dy*.6-20)+"px,0) rotate(4deg) scale(1.15)",opacity:1,offset:.68},
  {transform:"translate3d("+dx+"px,"+dy+"px,0) rotate(0deg) scale(1)",opacity:.06}
 ],{duration,easing:"cubic-bezier(.18,.78,.2,1)",fill:"forwards"});
 const cleanup=()=>{clone.remove();movingSprites.delete(clone);};
 animation.finished.catch(()=>{}).then(cleanup);setTimeout(cleanup,duration+200);
}
