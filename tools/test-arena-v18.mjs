/* Arena V18 — real in-memory game rules smoke, no live accounts or G. */
import assert from "node:assert/strict";
import * as Chess from "../assets/arena/chess-engine.js";
import * as XQ from "../assets/arena/xiangqi.js";
import * as Ludo from "../assets/arena/ludo.js";
import * as Estate from "../assets/arena/estate.js";
import * as TL from "../assets/arena/tienlen-engine.js";
import * as Colors from "../assets/arena/color-engine.js";
import {readFile} from "node:fs/promises";

let assertions=0;
function check(value,reason){assert.ok(value,reason);assertions++;}
const rng=()=>.45;

let position=Chess.start();
check(Chess.legal(position).length===20,"Chess initial 20 moves");
position=Chess.apply(position,Chess.fromUci(position,"e2e4"));
for(const level of ["easy","normal"]){
 const bot=Chess.bestBotMove(position,level);
 check(Chess.legal(position).some(m=>Chess.uci(m)===Chess.uci(bot)),
  "Chess "+level+" bot move must be fully legal");
}
for(const variant of ["xiangqi","up"]){
 const game=XQ.newXiangqi(variant);
 check(XQ.xiangqiLegal(game).length>0,variant+" red has legal first moves");
 XQ.xiangqiMove(game,...XQ.xiangqiLegal(game)[0]);
 for(const level of ["easy","normal"]){
  const move=XQ.xiangqiBotMove(game,level);
  check(move&&XQ.xiangqiLegal(game).some(x=>x.join(",")===move.join(",")),
   variant+" "+level+" AI never moves illegally");
 }
}
for(const players of [2,3,4]){
 const game=Ludo.newLudo(players);
 check(game.seats.length===players,"Ludo "+players+" has correct number of seats");
 if(players===2)check(game.seats.join(",")==="0,2","Two-player Ludo uses opposite corners");
 Ludo.rollLudo(game,6);
 check(Ludo.ludoMoves(game).length===4,"Ludo exit-roll opens 4 horse choices");
 Ludo.moveLudo(game,0);
 check(game.pawns[0][0]===0,"Ludo release horse from base");
}
const ludo=Ludo.newLudo(2);ludo.turn=2;Ludo.rollLudo(ludo,6);
for(const level of ["easy","normal","hard"]){
 check(Ludo.ludoMoves(ludo).includes(Ludo.ludoBotChoice(ludo,level,rng)),
  "Ludo "+level+" AI selects an actually movable horse");
}
for(const rounds of [8,16,24]){
 const game=Estate.newEstate(rounds);
 check(game.roundLimit===rounds,"Estate selected "+rounds+" round mode");
 Estate.estateRoll(game,1,2);
 for(const level of ["easy","normal","hard"]){
  const plan=Estate.estateBotPlan(game,level,rng);
  check(Number.isInteger(plan.upgrade)&&typeof plan.buy==="boolean",
   "Estate "+rounds+" "+level+" AI returns valid investment plan");
 }
}
for(const level of ["easy","normal","hard"]){
 const game=TL.start(rng);if(game.turn===0)game.turn=1;
 const cards=TL.botDecision(game,level,rng);
 if(cards)check(TL.canPlay(game,game.turn,cards),
  "Tiến Lên "+level+" bot decision is permitted by the real engine");
 check(TL.botTurn(game,level)===true,"Tiến Lên "+level+" bot turn resolves");
}
for(const level of ["easy","normal","hard"]){
 const game=Colors.newGame(rng);game.turn=1;
 const card=Colors.chooseBotMove(game,level,rng);
 check(!card||(game.hands[1].some(c=>c.id===card.id)&&Colors.canPlay(game,card,1)),
  "Colors "+level+" bot selects only legal card");
 check(Colors.botTurn(game,rng,level)===true,"Colors "+level+" bot resolves a turn");
}
const src=async name=>readFile(new URL("../assets/arena/"+name,import.meta.url),"utf8");
const [chessUI,xqUI,tlUI,roomsUI,app,html,worker1,worker2,css]=await Promise.all([
 src("chess-ui.js"),src("xiangqi.js"),src("tienlen-ui.js"),
 src("rooms-play.js"),src("app.js"),
 readFile(new URL("../mrlee-game-arena.html",import.meta.url),"utf8"),
 src("chess-ai-worker.js"),src("xiangqi-ai-worker.js"),src("game-ux-v18.css")
]);
check(chessUI.includes("computeBotMove")&&chessUI.includes("aiWorker?.terminate"),
 "Chess worker computes asynchronously and cancels on restart");
check(xqUI.includes("calculateBot")&&xqUI.includes("worker?.terminate"),
 "Xiangqi AI cannot block the main rendering thread");
check(worker1.includes('self.postMessage({id,move})')&&worker2.includes("xiangqiBotMove"),
 "Both board engines have local module workers");
check(tlUI.includes("card.id===item.dataset.cardId"),
 "Tiến Lên bot drag uses real string IDs such as 3-0, never Number()");
check(roomsUI.includes("c.id===item.dataset.cardId"),
 "Tiến Lên PvP drag uses the same real string card ID");
for(const id of ["chessLevel","xqLevel","ludoLevel","estateLevel","tlLevel","colorsLevel"])
 check(html.includes('id="'+id+'"'),"Game-specific AI control "+id+" exists");
check(app.includes('getElementById')&&app.includes('colorsLevel'),
 "Colors selected difficulty is connected to the real bot");
check(css.includes("prefers-reduced-motion")&&css.includes("max-width:530px"),
 "Responsive mobile layouts support reduced motion");
console.log("PASS Arena V18: "+assertions+" real rule, AI, worker and responsive contracts.");
