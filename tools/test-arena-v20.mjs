/* MR LEE Game Arena V20 — approved responsive design contract.
 * No external account, wallet, premium currency or network access.
 */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import * as Ludo from "../assets/arena/ludo.js";
import * as Estate from "../assets/arena/estate.js";
import * as Xiangqi from "../assets/arena/xiangqi.js";
const read=file=>readFile(new URL("../"+file,import.meta.url),"utf8");
const [cardCss,boardCss,shellCss,shellJs,html,app]=await Promise.all([
 "assets/arena/gameplay-cards-v20.css",
 "assets/arena/gameplay-boards-v20.css",
 "assets/arena/game-room-v20.css",
 "assets/arena/game-room-shell.js",
 "mrlee-game-arena.html",
 "assets/arena/app.js"
].map(read));
let checks=0;
const check=(value,why)=>{assert.ok(value,why);checks++};
for(const [name,source] of [
 ["card gameplay",cardCss],["portrait boards",boardCss],["parent room",shellCss]
]){
 let brace=0,paren=0;
 for(const ch of source){
  if(ch==="{")brace++;
  else if(ch==="}")brace--;
  if(ch==="(")paren++;
  else if(ch===")")paren--;
  assert.ok(brace>=0&&paren>=0,name+" cannot close unmatched CSS syntax");
 }
 check(brace===0,name+" CSS must have balanced declarations");
 check(paren===0,name+" CSS must have balanced selector functions");
 check(source.includes("@media"),name+" supports responsive viewports");
 check(source.includes("!important"),name+" overrides legacy design CSS");
}
check(shellJs.includes('!["tienlen","colors"].includes(game)'),
 "Only Tiến Lên and Bài Màu request landscape; all four other games stay portrait");
check(shellJs.includes('dataset.roomLayout=portraitBoard?"portrait":"landscape"'),
 "Standalone room tells CSS which orientation to use");
check(shellJs.includes('roomOrientationTip')&&shellJs.includes('tryLandscape()'),
 "Card orientation guidance is wired to the actual fullscreen/lock flow");
check(shellCss.includes('html[data-room-layout="portrait"] #roomTryLandscape{display:none!important}'),
 "No Rotate button for portrait board games");
check(shellCss.includes('and (pointer:coarse)'),
 "Card rotate advice is shown only for actual touch devices");
check(!shellCss.includes("rotate(90deg)"),
 "No CSS-rotated iframe — touch hit testing and card drag remain accurate");
for(const slug of ["tienlen","colors"]){
 check(cardCss.includes('[data-embedded-game="'+slug+'"]'),
  slug+" has its own horizontal board");
}
for(const slug of ["chess","xiangqi","ludo","estate"]){
 check(boardCss.includes('[data-embedded-game="'+slug+'"]'),
  slug+" has its own upright board");
}
check(cardCss.includes(".tl-hand-card")&&cardCss.includes(".arena-pvp-hand"),
 "Cards remain individually selectable in both bot/PvP gameplay");
check(cardCss.includes(".arena-card-turn-popup")&&cardCss.includes('[hidden]'),
 "Play/Pass controls show only when it is the user's turn");
check(boardCss.includes(".arena-v20-turn-badge")&&boardCss.includes(".is-turn"),
 "Real game state animates player bars instead of decorative badges");
for(const id of ["xqOppBar","xqMeBar","ludoOppBar","ludoMeBar","estateOppBar","estateMeBar"])
 check(html.includes('id="'+id+'"'),"Upright participant HUD "+id);
for(const id of ["xqOppBar","ludoOppBar","estateOppBar"]){
 const code=await read(id.startsWith("xq")?"assets/arena/xiangqi.js":
  id.startsWith("ludo")?"assets/arena/ludo.js":"assets/arena/estate.js");
 check(code.includes('$("'+id+'")')&&code.includes(".classList.toggle(\"is-turn\""),
  "Participant HUD "+id+" is driven by the live engine");
}
check(html.includes('gameplay-cards-v20.css?v=20261107-approved-v20')&&
 html.includes('gameplay-boards-v20.css?v=20261107-approved-v20'),
 "Standalone iframe loads both approved design layers last");
check(app.includes("xiangqi.js?v=20261107-approved-v20b")&&
 app.includes("ludo.js?v=20261107-approved-v20b")&&
 app.includes("estate.js?v=20261107-approved-v20b"),
 "HUD engine JavaScript cannot remain stale in browser cache");
for(const name of ["game-bai-mau.html","game-tien-len.html","game-co-vua.html",
 "game-co-tuong.html","game-co-ca-ngua.html","game-dia-oc.html"]){
 const page=await read(name);
 check(page.includes('game-room-v20.css?v=20261107-approved-v20')&&
 page.includes('game-room-shell.js?v=20261107-approved-v20'),
 name+" includes the new standalone room layout and script");
}
// Game rules still apply in the unchanged engines.
const l=Ludo.newLudo(2);check(l.seats.join(",")==="0,2","Ludo two-player opposing corners still legal");
Ludo.rollLudo(l,6);Ludo.moveLudo(l,0);check(l.pawns[0][0]===0,"Ludo release horse works");
const e=Estate.newEstate(8);check(e.roundLimit===8,"Estate match duration unaffected");
const x=Xiangqi.newXiangqi("xiangqi");check(Xiangqi.xiangqiLegal(x,1).length>0,
 "Cờ Tướng keeps valid opening moves");
console.log("PASS Arena V20: "+checks+" CSS, portrait/landscape, dynamic HUD, cache and game-rule checks.");
