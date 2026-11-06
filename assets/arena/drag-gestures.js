/* MR LEE Arena pointer gestures — original mouse, pen & touch drag control.
 * Pure interaction only. Legality remains with each game engine / PvP server.
 * User can still tap/click the same buttons; drag never triggers an extra click.
 */
const preciseEvent=event=>event.isPrimary&&event.button===0;
const reduceMotion=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
function centerOf(rect){return {x:rect.left+rect.width/2,y:rect.top+rect.height/2};}
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
// Animate the accepted move after model state updates. Never delays engine logic.
export function animateBoardMove({from,to,piece,kind="piece"}){
 if(!from||!to||!piece||reduceMotion()||!piece.animate)return;
 const before=from.getBoundingClientRect(),after=to.getBoundingClientRect();
 const r=piece.getBoundingClientRect();if(!r.width||!r.height)return;
 const clone=piece.cloneNode(true);clone.classList.add("arena-move-sprite",kind);
 clone.setAttribute("aria-hidden","true");
 clone.style.width=r.width+"px";clone.style.height=r.height+"px";
 clone.style.left=r.left+"px";clone.style.top=r.top+"px";
 document.body.append(clone);
 const dx=after.left+after.width/2-r.left-r.width/2;
 const dy=after.top+after.height/2-r.top-r.height/2;
 const a=clone.animate([
  {transform:"translate3d(0,0,0) scale(1)",opacity:1},
  {transform:"translate3d("+(dx*.55)+"px,"+(dy*.55-9)+"px,0) scale(1.14)",opacity:1,offset:.56},
  {transform:"translate3d("+dx+"px,"+dy+"px,0) scale(1)",opacity:.15}
 ],easeOut(Math.min(420,240+Math.hypot(dx,dy)*.28)));
 a.finished.catch(()=>{}).then(()=>clone.remove());
}
