import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import * as Xiangqi from "../assets/arena/xiangqi-engine.js";
import * as Server from "../supabase/functions/mrlee-arena-rooms/xiangqi-engine.js";

const root=resolve(fileURLToPath(import.meta.url),"../..");
const read=path=>readFile(join(root,path),"utf8");
let checks=0;
const test=(condition,message)=>{assert.ok(condition,message);checks++;};
const same=(a,b,message)=>{assert.deepEqual(a,b,message);checks++;};

for(const engine of [Xiangqi,Server]){
 const initial=engine.newXiangqi();
 test(initial.variant==="xiangqi"&&initial.b.length===90,"Xiangqi must use a 9 by 10 board");
 test(initial.b.filter(Boolean).length===32,"Exactly 32 pieces");
 test(initial.turn===1&&initial.winner===null,"Red moves first");
 const legal=engine.xiangqiLegal(initial);
 test(legal.length>30&&legal.some(([f,t])=>f===54&&t===45),"Red pawn advances");
 test(!legal.some(([f,t])=>f===54&&t===53),"Pawn cannot move sideways before river");
 test(!legal.some(([f,t])=>f===0),"Black cannot play red's turn");
 assert.throws(()=>engine.xiangqiMove(initial,27,36),/không hợp lệ/);
 checks++;
 const move=engine.xiangqiMove(initial,54,45);
 test(move.turn===-1&&move.last[0]===54&&move.last[1]===45,"Server turn changes exactly once");
 test(move.b[54]===null&&move.b[45]?.p==="P","Moved pawn persists");
 test(engine.xiangqiLegal(move).some(([f,t])=>f===27&&t===36),"Black gets legal response");
 engine.xiangqiMove(move,27,36);
 test(move.turn===1,"Alternating moves");
 const up=engine.newXiangqi("up");
 const covered=up.b.filter(p=>p?.covered);
 test(covered.length===30,"All non-general pieces begin covered");
 test(up.b[85].p==="K"&&up.b[4].p==="k","Generals remain visible");
 test(covered.every(p=>typeof p.slot==="string"&&p.slot.length===1),"Public initial movement slots retained");
 const upLegal=engine.xiangqiLegal(up);
 test(upLegal.length>0,"Covered mode has legal moves");
 const target=upLegal.find(([f])=>up.b[f]?.covered);
 test(Boolean(target),"A covered piece can move");
 const [from,to]=target;
 engine.xiangqiMove(up,from,to);
 test(up.b[to]?.covered===false,"First covered move reveals the hidden piece");
 // Pure rule engine is reusable server side and cannot inspect DOM.
 const captureEngine=engine.newXiangqi();
 for(let ply=0;ply<90&&captureEngine.winner===null;ply++){
  const valid=engine.xiangqiLegal(captureEngine);
  test(valid.length>0,"A game with no legal moves must be terminal");
  const [f,t]=valid[ply%valid.length];
  const before=captureEngine.turn;
  engine.xiangqiMove(captureEngine,f,t);
  test(captureEngine.turn===-before,"Alternating legal turns in deterministic game");
 }
}
const [serverEngine,clientEngine,edge,sql,play,api,shell,room,board,main]=await Promise.all([
 read("supabase/functions/mrlee-arena-rooms/xiangqi-engine.js"),
 read("assets/arena/xiangqi-engine.js"),
 read("supabase/functions/mrlee-arena-rooms/index.ts"),
 read("supabase/manual-sql/MRLEE_ARENA_XIANGQI_PVP_20261111.sql"),
 read("assets/arena/rooms-play.js"),
 read("assets/arena/room-api.js"),
 read("assets/arena/game-room-shell.js"),
 read("assets/arena/rooms-ui.js"),
 read("assets/arena/rooms-xiangqi.js"),
 read("mrlee-game-arena.html")
]);
test(serverEngine===clientEngine,"Client and server legal move engine must match byte for byte");
test(edge.includes('import * as Xiangqi from "./xiangqi-engine.js"'),"Server must import authoritative Xiangqi");
test(edge.includes('game==="xiangqi"?actionXiangqi(state,me.seat,body)'),"All Xiangqi moves must be checked on server");
test(edge.includes('Xiangqi.xiangqiLegal(position)'),"Server validates legal move before committing");
test(edge.includes('state.result={done:true,winner:1-me.seat'),"Exit must forfeit instead of refund");
test(edge.includes('const publicBoard=position.b.map')&&
 edge.includes('{p:piece.slot,slot:piece.slot,covered:true}'),"Public payload must hide all unrevealed Cờ Úp identities");
test(edge.includes('game==="xiangqi"?{variant:xiangqiVariant(room.state?.variant)}'),"Do not mix variants");
test(edge.includes('boardDeadline(state,room.game)'),"Clock server-owned");
test(edge.includes('p_expected_version:room.version'),"Atomic match result version check");
test(sql.includes("CHECK (game IN ('chess','tienlen','colors','xiangqi'))"),"Room schema includes Xiangqi");
test(sql.includes("r.game in ('chess','xiangqi') then 1"),"Escrow settles each Xiangqi match as one whole stake");
test(sql.includes("r.game IN ('chess','xiangqi') THEN 2"),"Rematch needs two people");
test(sql.includes("r.game in ('chess','xiangqi') and n<>2"),"Two-player enforcement");
test(api.includes('xiangqi:1')&&api.includes('xiangqi:"Cờ Tướng / Cờ Úp"'),"Wallet stake and public game names");
test(shell.includes('xiangqi:{name:"Cờ Tướng / Cờ Úp",online:true'),"Standalone room lobby allows PvP");
test(room.includes('game==="xiangqi"')&&room.includes('variant:variant()'),"Room UI sends variant to server");
test(play.includes('xiangqiCanvas.render(room,force)'),"PvP canvas actually renders Xiangqi");
test(board.includes('xiangqiLegal(position,side)')&&board.includes('kind:"play",from:chosen,to:index'),"The board submits moves only, never claims a win");
test(main.includes('data-room-action="friends" data-room-game="xiangqi"'),"Lobby has a working friend-room action");
test(main.includes('rooms-xiangqi.css'),"Portrait board stylesheet loaded");
console.log("PASS Xiangqi PvP: "+checks+" legal-move/security/room/escrow checks.");
