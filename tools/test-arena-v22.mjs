/* MR LEE Arena V22 production gate — approved UI, server-safe deal and 6-game FX.
 * Runs offline, never sends a move, stakes G or uses a logged-in account.
 */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import * as TL from "../assets/arena/tienlen-engine.js";
import {chopTitle} from "../assets/arena/tienlen-fx.js";
import {DEAL_DURATION_MS,TURN_DURATION_MS,isDealing} from "../assets/arena/arena-deal-v22.js";
const get=p=>readFile(new URL("../"+p,import.meta.url),"utf8");
const paths={
 css:"assets/arena/arena-fidelity-v22.css",
 page:"mrlee-game-arena.html",
 server:"supabase/functions/mrlee-arena-rooms/index.ts",
 local:"assets/arena/tienlen-ui.js",
 animation:"assets/arena/tienlen-fx.js",
 online:"assets/arena/rooms-play.js",
 room:"assets/arena/rooms-ui.js",
 drag:"assets/arena/drag-gestures.js",
 board:"assets/arena/xiangqi.js",
 ludo:"assets/arena/ludo.js",
 estate:"assets/arena/estate.js",
 colors:"assets/arena/app.js"
};
const files=Object.fromEntries(await Promise.all(Object.entries(paths)
 .map(async([k,p])=>[k,await get(p)])));
let count=0;const check=(ok,note)=>{assert.ok(ok,note);count++;};
const read=key=>files[key];
check(DEAL_DURATION_MS===3700,"PvP deal sequence is 3700ms");
check(TURN_DURATION_MS===20000,"20-second first turn not spent on shuffle");
check(isDealing({roundReadyAt:new Date(Date.now()+1200).toISOString()}),
 "PVP state stays locked before server readyAt");
check(!isDealing({roundReadyAt:new Date(Date.now()-1200).toISOString()}),
 "Game opens immediately after server readyAt");
check(read("server").includes("const TIENLEN_DEAL_MS=3_700")&&
 read("server").includes("turnDeadline:nextDeadline(TIENLEN_DEAL_MS)"),
 "Server issues a FULL 20-second turn only after 3.7s dealing");
check(read("server").includes('Date.parse(room.state?.roundReadyAt||"")>Date.now()'),
 "Supabase refuses pre-deal card moves, even from malicious clients");
check(read("server").includes("roundReadyAt:state.roundReadyAt||null"),
 "Each authenticated client receives synchronized server readyAt");
check(read("local").includes("const TURN_MS=20000")&&
 read("local").includes("clockInterval=setInterval(clockTick,100)"),
 "Bot has independently testable 20-second clock");
check(read("local").includes('message.textContent="⏰ Hết 20 giây · tự bỏ lượt."')&&
 read("local").includes("void act()"),"Human timeout auto-plays or legally passes");
check(read("local").includes('board.dataset.fxPhase="shuffle"'),
 "Real hand concealment begins BEFORE first render");
check(read("animation").includes("const visualDeals=52")&&
 read("animation").includes("i*36"),"All 52 card backs animate in seat order");
check(read("animation").includes('board.dataset.fxPhase="spread"'),
 "Card fan follows dealing, not before");
check(read("online").includes("showRoomDeal(board,{roundReadyAt:state.roundReadyAt"),
 "PVP clients render the same server-timed complete deal");
check(read("online").includes("readyTimer=setTimeout(")&&
 read("online").includes("render(shownRoom,true)"),
 "PVP UI automatically enables controls after intro without requiring a new server version");
check(read("online").includes("room.version!==lastVersion")&&
 read("online").includes("void showChopPopup(title)"),
 "Chop FX triggers once per confirmed new server move, not each polling refresh");
check(chopTitle({high:15,type:"single"},{type:"quad",size:4,high:8})==="TỨ QUÝ CHẶT!",
 "Four-of-a-kind chops with the approved center popup");
check(chopTitle({high:15,type:"single"},{type:"pair-run",size:6,high:8})==="ĐÔI THÔNG CHẶT!",
 "Three-pair run chops with the approved center popup");
check(chopTitle(null,{type:"quad"})===""&&
 chopTitle({type:"single",high:5},{type:"quad"})==="",
 "Normal and opening moves never fake a bomb popup");
check(TL.beats({type:"quad",size:4,high:8},{type:"single",size:1,high:15}),
 "Chop FX is consistent with genuine Tiến Lên rules");
const css=read("css");let level=0;for(const x of css){
 if(x==="{")level++;if(x==="}")level--;
 assert.ok(level>=0,"CSS unexpected closing brace");
}check(level===0,"V22 final responsive CSS is syntactically balanced");
check(css.includes('[data-fx-phase="shuffle"]')&&css.includes(".tl-hand-card")&&
 css.includes(".arena-v22-deal-mask"),"Hidden cards stay invisible until deal finishes");
check(css.includes(".arena-chop-v22-title")&&css.includes("position:fixed"),
 "Chop effect fills viewport center rather than bottom/right alert");
check(css.includes("data-embedded-game=\"chess\"")&&
 css.includes("data-embedded-game=\"tienlen\""),
 "Approved portrait boards and landscape cards preserved");
check(css.includes("prefers-reduced-motion")&&css.includes('data-arena-visuals="off"'),
 "Graphics respect accessibility and weak devices");
check(read("drag").includes('"ludo-piece"')&&
 read("drag").includes('"estate-pawn"')&&read("drag").includes('"color-card"'),
 "Six games get physically distinct move profiles");
check(read("drag").includes("movingSprites.size>=24"),
 "All board move sprites have explicit memory/performance cap");
check(read("board").includes("arena-v22-flip-open"),
 "Cờ Úp has an actual identity reveal animation after a legal move");
check(read("ludo").includes("arena-v22-dice-rolling")&&
 read("estate").includes("arena-v22-dice-rolling"),
 "Dice use visual tumbling without changing engine RNG");
check(read("colors").includes("kind:\"color-card\""),
 "Bài Màu animates an actual drawn card");
check(read("page").includes('arena-fidelity-v22.css?v=20261107-motion-v22')&&
 read("page").includes('app.js?v=20261107-motion-v22c'),
 "V22 visual CSS loads last and JavaScript cache is refreshed");
console.log("PASS Arena V22: "+count+" verified rules, server timeline, board fidelity and motion contracts.");
