/* MR LEE GAME ARENA V19 — visual-only, GPU-friendly scene feedback.
 * No game logic, network requests, wallet or result mutations.
 */
const STORE="mrlee.arena.visuals.v19";
const isBrowser=typeof document!=="undefined"&&typeof window!=="undefined";
const root=isBrowser?document.documentElement:null;
const reduce=()=>isBrowser&&window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
const lowSpec=()=>isBrowser&&typeof navigator!=="undefined"&&(
 navigator.connection?.saveData===true||
 (typeof navigator.deviceMemory==="number"&&navigator.deviceMemory<=3));
const MODES=["full","lite","off"];
let mode="full";
try{
 const saved=localStorage.getItem(STORE);
 mode=MODES.includes(saved)?saved:(lowSpec()?"lite":"full");
}catch{mode=lowSpec()?"lite":"full";}
if(reduce())mode="off";
if(root)root.dataset.arenaVisuals=mode;
const title={full:"✨ Sống động",lite:"⚡ Tiết kiệm",off:"○ Tắt hiệu ứng"};
function refreshButtons(){
 document.querySelectorAll(".arena-visual-quality").forEach(btn=>{
  btn.textContent=title[mode];
  btn.dataset.quality=mode;
  btn.setAttribute("aria-label","Chất lượng hiệu ứng: "+(mode==="full"?"Sống động":mode==="lite"?"Tiết kiệm":"Tắt")+". Nhấn để thay đổi.");
  btn.setAttribute("aria-pressed",String(mode!=="off"));
 });
}
function setMode(value){
 if(reduce())value="off";
 if(!MODES.includes(value))return;
 mode=value;if(root)root.dataset.arenaVisuals=value;
 try{localStorage.setItem(STORE,value);}catch{}
 refreshButtons();
}
function addControlTo(header){
 if(!header||header.querySelector(".arena-visual-quality"))return;
 const button=document.createElement("button");
 button.type="button";button.className="arena-visual-quality";
 button.title="Chỉnh hiệu ứng hình ảnh. Không ảnh hưởng tốc độ lượt hay kết quả chơi.";
 button.addEventListener("click",()=>setMode(MODES[(MODES.indexOf(mode)+1)%MODES.length]));
 header.append(button);refreshButtons();
}
function controls(){
 document.querySelectorAll("#arenaTable>.arena-table-heading,#arenaChess>.arena-table-heading,#arenaTienLen>.arena-table-heading,#arenaXiangqi>.arena-table-heading,#arenaLudo>.arena-table-heading,#arenaEstate>.arena-table-heading,#arenaPvPBoard>.arena-table-heading").forEach(addControlTo);
}
if(isBrowser)controls();
const pvp=isBrowser?document.getElementById("arenaPvPBoard"):null;
if(pvp)new MutationObserver(controls).observe(pvp,{childList:true});
if(isBrowser)window.addEventListener("storage",event=>{
 if(event.key!==STORE||!MODES.includes(event.newValue))return;
 mode=reduce()?"off":event.newValue;if(root)root.dataset.arenaVisuals=mode;refreshButtons();
});
const overlay=isBrowser?document.createElement("div"):null;
if(overlay){
 overlay.className="arena-vfx-canvas";
 overlay.setAttribute("aria-hidden","true");
 document.body.append(overlay);
}
const colors={
 card:"#f5cf82",chess:"#e4c587",xiangqi:"#e6b67d",ludo:"#78dbff",
 estate:"#95c7ff",colors:"#c9a0ff",win:"#ffde82",capture:"#f9a174"
};
let prev=-Infinity,active=0;
function fx({kind="card",element=null,label="",count}={}){
 if(!isBrowser||!overlay||mode==="off"||reduce()||document.hidden||active>=40)return;
 const now=performance.now();
 if(kind!=="win"&&now-prev<95)return;prev=now;
 const anchor=typeof element==="string"?document.querySelector(element):element;
 if(!anchor||!anchor.isConnected)return;
 const bounds=anchor.getBoundingClientRect();
 if(!bounds.width||!bounds.height||bounds.bottom<0||bounds.top>innerHeight)return;
 const x=Math.max(20,Math.min(innerWidth-20,bounds.left+bounds.width/2));
 const y=Math.max(20,Math.min(innerHeight-20,bounds.top+bounds.height/2));
 const accent=colors[kind]||colors.card;
 const amount=Math.max(0,Math.min(40-active,25,mode==="lite"?4:(count|| (kind==="win"?17:8))));
 for(let i=0;i<amount;i++){
  const spark=document.createElement("span");spark.className="arena-vfx-spark";
  spark.style.setProperty("--pc",accent);
  spark.style.setProperty("--ps",(4+i%4*2)+"px");
  overlay.append(spark);active++;
  const angle=(i/amount*Math.PI*2)+(i%3)*.21;
  const travel=kind==="win"?70+(i%6)*24:28+(i%4)*17;
  const dx=Math.cos(angle)*travel,dy=Math.sin(angle)*travel;
  const opts={duration:(mode==="lite"?320:490)+(i%5)*32,delay:i%4*23,
   easing:"cubic-bezier(.18,.72,.3,1)",fill:"both"};
  const anim=spark.animate([
   {transform:"translate3d("+x+"px,"+y+"px,0) scale(.4)",opacity:0},
   {transform:"translate3d("+(x+dx*.38)+"px,"+(y+dy*.38)+"px,0) scale(1.2)",opacity:.98,offset:.3},
   {transform:"translate3d("+(x+dx)+"px,"+(y+dy+19)+"px,0) scale(.22)",opacity:0}
  ],opts);
  anim.finished.catch(()=>{}).then(()=>{spark.remove();active=Math.max(0,active-1);});
 }
 if(label&&mode==="full"){
  const badge=document.createElement("span");
  badge.className="arena-vfx-label";badge.textContent=String(label).slice(0,45);
  overlay.append(badge);
  const anim=badge.animate([
   {transform:"translate3d("+(x-65)+"px,"+(y+8)+"px,0) scale(.78)",opacity:0},
   {transform:"translate3d("+(x-65)+"px,"+(y-29)+"px,0) scale(1.09)",opacity:1,offset:.4},
   {transform:"translate3d("+(x-65)+"px,"+(y-53)+"px,0) scale(.99)",opacity:0}
  ],{duration:kind==="win"?1550:950,easing:"cubic-bezier(.2,.8,.25,1)",fill:"both"});
  anim.finished.catch(()=>{}).then(()=>badge.remove());
 }
}
if(isBrowser)document.addEventListener("mrlee:arena-fx",event=>{
 try{fx(event.detail||{});}catch(error){console.warn("Visual effect skipped:",error);}
});
export function emitArenaFX(kind,element,label=""){
 if(!isBrowser)return;
 document.dispatchEvent(new CustomEvent("mrlee:arena-fx",{detail:{kind,element,label}}));
}
export function getArenaFXMode(){return mode;}
