import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {makeDeck,newGame,shuffle,canPlay,play,beginDraw,pass,botTurn,
 COLORS,topCard,cardsRemaining} from "../assets/arena/color-engine.js";
const cards=makeDeck();
assert.equal(cards.length,108);
assert.equal(new Set(cards.map(x=>x.id)).size,108);
assert.equal(cards.filter(x=>x.type==="wild4").length,4);
assert.equal(shuffle([1,2,3,4],()=>0).length,4);
function setup(){
 const g=newGame(()=>0.43);
 assert.deepEqual(cardsRemaining(g),[7,7,7,7]);
 assert.equal(g.pile.length,79);
 assert.equal(topCard(g).type,"number");
 return g;
}
function prepared(card,other={id:10001,color:"green",type:"number",value:9}){
 const g=setup();g.discard=[{id:9999,color:"red",type:"number",value:5}];
 g.activeColor="red";g.hands[0]=[card,other];return g;
}
{
 const g=prepared({id:10000,color:"red",type:"skip"});
 play(g,0,10000);assert.equal(g.turn,2);
}
{
 const g=prepared({id:10000,color:"red",type:"reverse"});
 play(g,0,10000);assert.equal(g.direction,-1);assert.equal(g.turn,3);
}
{
 const g=prepared({id:10000,color:"red",type:"draw2"});
 const before=g.hands[1].length;
 play(g,0,10000);assert.equal(g.hands[1].length,before+2);assert.equal(g.turn,2);
}
{
 const g=prepared({id:10000,color:null,type:"wild4"});
 assert.ok(canPlay(g,g.hands[0][0]));
 assert.throws(()=>play(g,0,10000,null),/chọn một màu/);
 play(g,0,10000,"blue");
 assert.equal(g.activeColor,"blue");assert.equal(g.hands[1].length,11);
}
{
 const g=prepared({id:10000,color:null,type:"wild4"},
  {id:10001,color:"red",type:"number",value:2});
 assert.equal(canPlay(g,g.hands[0][0]),false);
}
{
 const g=prepared({id:10000,color:"red",type:"number",value:9});
 g.hands[0]=[{id:10000,color:"red",type:"number",value:9}];
 play(g,0,10000);assert.equal(g.winner,0);
}
{
 const g=prepared({id:10000,color:"green",type:"number",value:9});
 const before=g.hands[0].length;
 const card=beginDraw(g,0,()=>0.7);
 assert.equal(g.hands[0].length,before+1);
 assert.equal(g.drawnCardId,card.id);
 assert.equal(canPlay(g,g.hands[0][0]),false);
 pass(g,0);assert.equal(g.turn,1);
}
{
 const g=setup();let rounds=0;
 while(g.winner===null&&rounds<420){
  if(g.turn===0){
   const choices=g.hands[0].filter(c=>canPlay(g,c,0));
   if(choices.length){
    const c=choices[0];play(g,0,c.id,c.color?null:COLORS[0]);
   }else{
    const drawn=beginDraw(g,0);
    if(drawn&&canPlay(g,drawn,0))play(g,0,drawn.id,drawn.color?null:"blue");
    else pass(g,0);
   }
  }else botTurn(g);
  rounds++;
 }
 assert.ok(g.winner!==null,"Must reach game outcome");
 assert.ok(rounds<=400,"Turn cap");
}
const html=await readFile(new URL("../mrlee-game-arena.html",import.meta.url),"utf8");
const app=await readFile(new URL("../assets/arena/app.js",import.meta.url),"utf8");
const css=await readFile(new URL("../assets/arena/arena.css",import.meta.url),"utf8");
// The standalone Arena imports the same auth guard through the secure
// same-origin iframe bridge; embed=1 alone cannot bypass login.
const bridge=await readFile(new URL("../assets/arena/embedded-auth.js",import.meta.url),"utf8");
assert.match(html,/embedded-auth\.js/);
assert.match(bridge,/await import\("\.\.\/\.\.\/auth-guard\.js"\)/);
assert.match(html,/data-game="colors"/);
assert.match(app,/Không trừ điểm học tập/);
assert.doesNotMatch(app,/service_role|supabase\.from\(/i);
assert.match(css,/prefers-reduced-motion/);
console.log("PASS Arena engine: 108 unique cards, AI, special actions, fair wild+4, terminal match and demo economy.");
