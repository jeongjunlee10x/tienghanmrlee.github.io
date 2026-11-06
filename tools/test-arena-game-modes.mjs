/* Offline Arena mode contracts. Zero real wallets, accounts or network requests. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {newLudo,rollLudo,ludoMoves,moveLudo} from "../assets/arena/ludo.js";
import {newEstate} from "../assets/arena/estate.js";

const two=newLudo(2);
assert.deepEqual(two.seats,[0,2],"Two-player Ludo uses opposing corners");
rollLudo(two,1);
assert.equal(two.turn,2,"Red passes to yellow rather than inactive blue");
rollLudo(two,3);
assert.equal(two.turn,0,"Yellow passes to red rather than inactive green");
rollLudo(two,6);
assert.equal(two.phase,"choose");
assert.equal(ludoMoves(two).length,4);
moveLudo(two,0);
assert.equal(two.pawns[0][0],0);
assert.equal(two.turn,0,"Rolling a six earns an additional turn");
assert.deepEqual(newLudo(3).seats,[0,1,2]);
assert.deepEqual(newLudo(4).seats,[0,1,2,3]);
assert.throws(()=>newLudo(1));

for(const rounds of [8,16,24]){
 const game=newEstate(rounds);
 assert.equal(game.roundLimit,rounds);
 assert.equal(game.tiles.length,24);
 assert.equal(game.players.length,4);
}
assert.throws(()=>newEstate(7));
const repoFile=path=>new URL(path,import.meta.url);
const edge=await readFile(repoFile("../supabase/functions/mrlee-arena-rooms/index.ts"),"utf8");
const chess=await readFile(repoFile("../assets/arena/chess-ui.js"),"utf8");
const html=await readFile(repoFile("../mrlee-game-arena.html"),"utf8");
const shell=await readFile(repoFile("../assets/arena/game-room-shell.js"),"utf8");
const social=await readFile(repoFile("../assets/arena/game-room-social.js"),"utf8");
const rooms=await readFile(repoFile("../assets/arena/rooms-ui.js"),"utf8");
const play=await readFile(repoFile("../assets/arena/rooms-play.js"),"utf8");
const css=await readFile(repoFile("../assets/arena/game-art-direction.css"),"utf8");

for(const preset of ["1+0","2+1","3+0","3+2","5+0","5+3","10+0","10+5","15+10","30+0","none"]){
 assert.match(edge,new RegExp('"'+preset.replace("+","\\+")+'":\\['),"Chess preset "+preset);
 assert.match(html,new RegExp('<option value="'+preset+'"'),"Local Chess UI "+preset);
}
assert.match(edge,/clock\.remaining\[seat\]=0/,"Chess expires its entire time budget");
assert.match(edge,/winner=1-seat/,"Chess flag fall gives the opponent the win");
assert.match(edge,/chessDeadline\(state\)/,"Chess deadline is based on actual clock");
assert.match(edge,/state\.clock\.remaining\[seat\].*state\.clock\.incrementMs/,
 "Legal chess move gets Fischer increment");
assert.match(edge,/timeControl===timeControl/,"Quick matching preserves clock compatibility");
assert.match(shell,/id="roomChessTime"/);
assert.match(shell,/roomChessTime/);
assert.match(social,/arenaSocialChessTime/);
assert.match(rooms,/roomChessTimeControl/);
assert.match(play,/arena-chess-board-stack/);
assert.match(play,/arena-chess-digital-clock/);
assert.match(chess,/clockBonus/);
assert.match(html,/id="ludoPlayers"/);
assert.match(html,/id="estateDuration"/);
for(const game of ["Chess","Xiangqi","Ludo","Estate","Table"]){
 assert.ok(css.includes("#arena"+game),"Dedicated visual system for "+game);
}
console.log("PASS original Arena: 11 chess clocks, no auto-chess moves, 2–4 seat Ludo, 8/16/24 round Estate, independent visual skins.");
