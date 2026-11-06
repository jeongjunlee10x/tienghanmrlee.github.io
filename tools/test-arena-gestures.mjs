/* MR LEE Arena — static and synthetic pointer-flow QA, no live accounts or G. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {enablePointerDrag} from "../assets/arena/drag-gestures.js";

const source=async name=>readFile(new URL("../assets/arena/"+name,import.meta.url),"utf8");
const [app,gesture,chess,xiangqi,ludo,estate,localTL,remote,fx,css]=await Promise.all([
 "app.js","drag-gestures.js","chess-ui.js","xiangqi.js","ludo.js","estate.js",
 "tienlen-ui.js","rooms-play.js","tienlen-fx.js","gesture-motion.css"
].map(source));
assert.match(app,/tickets:Infinity/,"Bot sessions are no longer capped at 3 trials");
assert.doesNotMatch(app,/state\.tickets--;/,"Offline play never consumes a ticket");
assert.match(gesture,/pointerdown/);
assert.match(gesture,/pointermove/);
assert.match(gesture,/pointerup/);
assert.match(chess,/enablePointerDrag\(/);
assert.match(xiangqi,/enablePointerDrag\(/);
assert.match(ludo,/enablePointerDrag\(/);
assert.match(localTL,/enablePointerDrag\(/);
assert.equal((remote.match(/enablePointerDrag\(/g)||[]).length,3,
 "All three server-validated PvP games use real drag-and-drop");
assert.match(app,/targetSelector:"\.arena-board-center"/,"Colors vs bot accepts a real card drop");
assert.match(fx,/visualDeals=.*24:32/,"Reduce paint work during initial 52-card dealing");
assert.match(estate,/animateBoardMove/,"Estate pieces animate along the map");
assert.match(css,/arena-drag-ghost/);
assert.match(css,/prefers-reduced-motion/,"Provide reduced-motion support");

// Execute a real simulated pointerdown -> move -> release on a mock visual board.
// This proves drag does not only decorate the card with CSS.
function classes(){
 const elements=new Set();
 return {add:v=>elements.add(v),remove:v=>elements.delete(v),
  toggle:(v,force)=>{if(force)elements.add(v);else elements.delete(v);},
  contains:v=>elements.has(v)};
}
const rootListeners={},winListeners={},docListeners={};
let removed=false,dropped=false;
const item={dataset:{cardId:"7"},classList:classes(),style:{},
 getBoundingClientRect:()=>({left:0,top:0,width:50,height:75}),
 closest:sel=>sel==="[disabled]"?null:item,
 querySelector:()=>null,
 cloneNode(){return {classList:classes(),style:{},setAttribute(){},removeAttribute(){},remove(){removed=true;}}}
};
const target={dataset:{zone:"table"},classList:classes(),
 getBoundingClientRect:()=>({left:120,top:70,width:120,height:90}),
 closest:()=>target};
const root={classList:classes(),contains:n=>n===item||n===target,
 querySelectorAll:()=>[target],
 addEventListener:(type,cb)=>rootListeners[type]=cb};
globalThis.document={documentElement:{classList:classes()},
 body:{append(){}},elementFromPoint:(x,y)=>x>100?target:item,
 addEventListener:(type,cb)=>docListeners[type]=cb,
 removeEventListener:(type)=>delete docListeners[type]};
globalThis.window={matchMedia:()=>({matches:true}),
 addEventListener:(type,cb)=>winListeners[type]=cb};
enablePointerDrag({root,itemSelector:".hand",targetSelector:".zone",
 onDrop:(from,to)=>{dropped=from===item&&to===target;return true;}});
const point=(type,x,y)=>({type,button:0,pointerId:1,pointerType:"mouse",
 isPrimary:true,clientX:x,clientY:y,cancelable:true,
 target:item,preventDefault(){}});
rootListeners.pointerdown(point("pointerdown",10,10));
winListeners.pointermove(point("pointermove",160,105));
winListeners.pointerup(point("pointerup",160,105));
assert.ok(dropped,"Successful release calls real engine handler");
assert.ok(removed,"Reduced-motion pointer ghost cleans up");
console.log("PASS Arena: unlimited bot play, touch/mouse chess, xiangqi, Ludo and card drag, 3 PvP gestures, mobile FX optimization.");
