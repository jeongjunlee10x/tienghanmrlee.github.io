import assert from "node:assert/strict";
import {TRACK,STARTS,newLudo,ludoMoves,rollLudo,moveLudo} from "../assets/arena/ludo.js";
import {newXiangqi,xiangqiLegal,xiangqiMove,isXiangqiCheck} from "../assets/arena/xiangqi.js";
import {ESTATE_PATH,newEstate,estateAssets,estateRent,estateRoll,estateBuy,estateUpgrade} from "../assets/arena/estate.js";
assert.equal(TRACK.length,52);assert.equal(new Set(TRACK.map(x=>x.join(","))).size,52);
assert.deepEqual(STARTS,[0,13,26,39]);
const l=newLudo();assert.equal(ludoMoves(l).length,0);
rollLudo(l,6);assert.deepEqual(ludoMoves(l),[0,1,2,3]);
moveLudo(l,0);assert.equal(l.pawns[0][0],0);assert.equal(l.turn,0);
rollLudo(l,3);moveLudo(l,0);assert.equal(l.pawns[0][0],3);assert.equal(l.turn,1);
const capture=newLudo();capture.turn=0;capture.phase="choose";capture.die=1;
capture.pawns[0][0]=19;capture.pawns[1][0]=7;
moveLudo(capture,0);assert.equal(capture.pawns[1][0],-1);
const finish=newLudo();finish.pawns[0]=[58,58,58,57];finish.turn=0;finish.phase="choose";finish.die=1;
moveLudo(finish,3);assert.equal(finish.winner,0);
for(const variant of ["xiangqi","up"]){
 const g=newXiangqi(variant);
 assert.equal(g.b.length,90);
 assert.ok(xiangqiLegal(g).length>20);
 assert.equal(isXiangqiCheck(g,1),false);
 for(let n=0;n<24&&g.winner===null;n++){
  const options=xiangqiLegal(g);assert.ok(options.length);
  xiangqiMove(g,...options[n%options.length]);
  if(g.winner===null)assert.equal(isXiangqiCheck(g,-g.turn),false);
 }
}
assert.equal(ESTATE_PATH.length,24);assert.equal(new Set(ESTATE_PATH.map(x=>x.join(","))).size,24);
const e=newEstate();assert.equal(e.players[0].cash,1800);
estateRoll(e,1,2);assert.equal(e.phase,"offer");assert.equal(e.offer,3);
const price=e.tiles[3].price;
estateBuy(e,true);assert.equal(e.tiles[3].owner,0);
assert.equal(e.players[0].cash,1800-price);assert.equal(e.turn,1);
assert.ok(estateAssets(e,0)>=e.players[0].cash);
e.turn=0;e.phase="roll";estateUpgrade(e,3);assert.equal(e.tiles[3].level,1);
assert.ok(estateRent(e.tiles[3])>0);
console.log("PASS final three Arena games: 52-track Ludo, Xiangqi/Úp rules, 24-tile Estate economy.");
