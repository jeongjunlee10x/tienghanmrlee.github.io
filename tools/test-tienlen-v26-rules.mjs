/* V26 opening-order + three-spades finish proof.
 * Pure unit tests; no real wallets/accounts touched.
 */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import * as Local from "../assets/arena/tienlen-engine.js";
import * as Server from "../supabase/functions/mrlee-arena-rooms/tienlen-engine.js";
const c=(id)=>Local.deck().find(card=>card.id===id);
for(const [name,Engine] of [["local",Local],["server",Server]]){
 const first=name==="local"?Engine.start(()=>.47):Engine.start(()=>.47,4);
 assert.equal(first.ruleVersion,2,name+" should use new rule version");
 assert.equal(first.first,true,name+" first game must enforce opening card");
 assert.ok(first.hands[first.turn].some(c=>c.id==="3-1"),name+" opens with 3♣");
 assert.equal(Engine.canPlay(first,first.turn,[first.hands[first.turn].find(c=>c.id!=="3-1").id]),false);
 assert.equal(Engine.canPlay(first,first.turn,["3-1"]),true);
 Engine.play(first,first.turn,["3-1"]);
 assert.equal(first.first,false);
 assert.equal(first.specialFinish,false);
 for(const n of [2,3,4]){
  if(name==="local"&&n!==4)continue;
  for(const winnerSeat of Array.from({length:n},(_,i)=>i)){
   const game=name==="local"?Engine.start(()=>.51,winnerSeat):Engine.start(()=>.51,n,winnerSeat);
   assert.equal(game.turn,winnerSeat,name+" previous winner opens next "+n+"-seat round");
   assert.equal(game.first,false,name+" rematch has no forced 3♣");
   const id=game.hands[winnerSeat][0].id;
   assert.equal(Engine.canPlay(game,winnerSeat,[id]),true);
   assert.equal(game.history.some(x=>x.includes("thắng ván trước")),true);
  }
  const opening=name==="local"?Engine.start(()=>.73):Engine.start(()=>.73,n);
  assert.equal(opening.first,true);
  assert.ok(opening.hands[opening.turn].some(x=>x.id==="3-1"),
   name+" always brings 3♣ into 2–4 seat first deal");
 }
 for(const [lastIds,expected] of [
  [["3-0"],true],
  [["3-0","3-1"],false],
  [["3-1"],false]
 ]){
  const game=name==="local"?Engine.start(()=>.44,1):Engine.start(()=>.44,4,1);
  game.turn=1;game.first=false;game.last=null;game.winner=null;
  game.hands[1]=lastIds.map(c);game.passed=game.passed.map(()=>false);
  const combo=Engine.play(game,1,lastIds);
  assert.equal(game.winner,1);
  assert.equal(game.specialFinish,expected,name+" must validate last 3♠ singleton only");
  assert.equal(combo.type,lastIds.length===1?"single":"pair");
 }
}
const sql=await readFile(new URL("../supabase/manual-sql/MRLEE_ARENA_RULE_3_CHUON_3_BICH_X3_V26.sql",import.meta.url),"utf8");
assert.equal((sql.match(/then 16/gi)||[]).length,2,"both start and next-round escrows reserve 16× table G");
assert.match(sql,/special_charge:=3\*r\.min_gold::bigint/);
assert.match(sql,/jsonb_array_length\(p_state->'played'\)=1/);
assert.match(sql,/state=p_state \|\| jsonb_build_object/);
assert.match(sql,/least\(escrow_amount,loss\+special_charge\)/);
assert.match(sql,/r\.state->>'ruleVersion'\)='2'/);
const api=await readFile(new URL("../assets/arena/room-api.js",import.meta.url),"utf8");
assert.match(api,/tienlen:16/);
const edge=await readFile(new URL("../supabase/functions/mrlee-arena-rooms/index.ts",import.meta.url),"utf8");
assert.match(edge,/nextWinnerSeat>=0\?nextWinnerSeat:null/);
assert.match(edge,/tienlen:16/);
assert.match(edge,/specialFinish:state\.specialFinish===true/);
const results=await readFile(new URL("../assets/arena/rooms-ui.js",import.meta.url),"utf8");
assert.match(results,/detail\.threeSpadesFinish===true/,
 "The result dialog reads only the server-verified special finish");
assert.match(results,/const extra=threeBich\?/,
 "The 3× tier bonus appears in the actual G outcome");
assert.match(results,/\+extra\),0\):0;/,
 "All opponents' bonuses are summed into the winner's G display");
console.log("PASS V26 Tiến Lên: first 3♣, previous winner leads, singleton 3♠ special finish, escrow 16× stake.");
