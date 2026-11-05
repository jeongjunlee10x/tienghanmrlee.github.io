/* Run: node tools/test-game-zone.mjs (Node 22+) */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {MODES, shuffled, uniqueWords, parseCsv, pickWords} from "../assets/game-zone/core.js";
import {GAME_RUNNERS} from "../assets/game-zone/games.js";
import {PHASE2_RUNNERS,availableMarketProducts,marketOrderCorrect,grammarCards} from "../assets/game-zone/phase2.js";
import {loadLesson, collectSentences} from "../assets/game-zone/content.js";

assert.deepEqual(new Set(MODES.map(x=>x.id)),new Set([...Object.keys(GAME_RUNNERS),...Object.keys(PHASE2_RUNNERS)]));
assert.equal(MODES.length,8);
const store=new Map();
const oldStorage=globalThis.sessionStorage;
globalThis.sessionStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
const wordsForRepeat=Array.from({length:12},(_,i)=>({ko:"가".repeat(i+1),vi:"số "+i}));
const round1=pickWords(wordsForRepeat,4,"anti-repeat-test"),round2=pickWords(wordsForRepeat,4,"anti-repeat-test");
assert.equal(round2.filter(x=>round1.some(y=>y.ko===x.ko)).length,0,"Immediate repetition must be avoided if enough words exist");
if(oldStorage===undefined)delete globalThis.sessionStorage;else globalThis.sessionStorage=oldStorage;
assert.ok(grammarCards([{formula:"N은/는",meaning:"chủ đề"},{formula:"N이/가",meaning:"chủ ngữ"},{formula:"N을/를",meaning:"tân ngữ"}]).length===3);
assert.ok(marketOrderCorrect(new Set(["책","펜"]),["펜","책"]));
assert.ok(!marketOrderCorrect(new Set(["책"]),["책","펜"]));
assert.equal(shuffled([1,2,3],()=>0).length,3);
assert.equal(uniqueWords([{ko:"책",vi:"sách"},{ko:"책",vi:"sách"},{ko:"물",vi:"nước"}]).length,2);
assert.deepEqual(parseCsv('\uFEFFfile,text,old,male\n"v1.mp3","한국",,False\n')[1],["v1.mp3","한국","","False"]);
const html=await readFile(new URL("../tro-choi-tieng-han.html",import.meta.url),"utf8");
const app=await readFile(new URL("../assets/game-zone/app.js",import.meta.url),"utf8");
const css=await readFile(new URL("../assets/game-zone/game-zone.css",import.meta.url),"utf8");
assert.match(html,/auth-guard\.js/);
assert.match(html,/id="mzCards"/);
assert.match(app,/XP chỉ tính trong phiên/);
assert.match(css,/data-mrlee-theme="future"/);
let totalWords=0, totalSentences=0, weaker=[];
for(let cap=1;cap<=6;cap++)for(let bai=1;bai<=15;bai++){
  const lesson=await loadLesson(cap,bai);
  assert.equal(lesson.cap,cap);assert.equal(lesson.bai,bai);
  assert.ok(Array.isArray(lesson.words)&&Array.isArray(lesson.sentences));
  assert.ok(lesson.words.every(x=>typeof x.ko==="string"&&typeof x.vi==="string"));
  assert.deepEqual(new Set(lesson.words.map(x=>x.ko)).size,lesson.words.length);
  assert.ok(Array.isArray(lesson.grammar)&&Array.isArray(lesson.marketWords));
  assert.ok(lesson.marketWords.some(x=>lesson.words.some(y=>y.ko===x.ko)));
  const available=availableMarketProducts(lesson.marketWords);
  const allowed=new Set(lesson.marketWords.map(x=>x.ko));
  assert.ok(available.every(x=>allowed.has(x.ko)),"Market must not introduce future vocabulary");
  totalWords+=lesson.words.length;totalSentences+=lesson.sentences.length;
  if(lesson.words.length<4 || lesson.sentences.length===0)weaker.push(cap+"-"+bai);
}
console.log("GAME ZONE phase2: 8 games; 90 lessons; "+totalWords+" usable vocab entries; "+totalSentences+" sentence examples.");
if(weaker.length)console.log("Needs lesson content review for one or more modes: "+weaker.join(", "));
console.log("PASS: adapters, registry, access gate, themes, and basic content checks.");
