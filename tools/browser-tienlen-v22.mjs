/* Live local Tiến Lên regression. Uses the ACTUAL HTML section/engine,
 * no login, no real G, no mock card action callbacks.
 */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {chromium} from "playwright";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const main=await readFile(path.join(ROOT,"mrlee-game-arena.html"),"utf8");
const match=main.match(/<section id="arenaTienLen"[\s\S]*?<\/section>/);
assert.ok(match,"Production Tiến Lên section is in main Arena HTML");
const testHtml=`<!doctype html><html lang="vi"
class="arena-reference-v1 arena-embedded" data-embedded-game="tienlen"
data-mrlee-auth="verified" data-arena-visuals="full"><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/assets/arena/arena.css">
<link rel="stylesheet" href="/assets/arena/tienlen-live.css">
<link rel="stylesheet" href="/assets/arena/rooms.css">
<link rel="stylesheet" href="/assets/arena/card-turn-v2.css">
<link rel="stylesheet" href="/assets/arena/game-visuals-v19.css">
<link rel="stylesheet" href="/assets/arena/gameplay-cards-v20.css">
<link rel="stylesheet" href="/assets/arena/arena-fidelity-v22.css">
<style>body{margin:0;background:#121b39}.arena-expanded-game{padding:0}</style>
</head><body>${match[0]}<script type="module">
import {mountTienLen} from "/assets/arena/tienlen-ui.js";
window.__tl=mountTienLen({onStart:()=>true,onFinish:()=>{},onExit:()=>{},
getGold:()=>0,getPlayerName:()=>"Bạn"});
window.__tl.start();
</script></body></html>`;
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,"http://127.0.0.1");
  if(url.pathname==="/__local_tl_v22__"){
   res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});res.end(testHtml);return;
  }
  const p=path.resolve(ROOT,"."+decodeURIComponent(url.pathname));
  if(!p.startsWith(ROOT+path.sep))throw Error("Traversal");
  const data=await readFile(p);
  res.writeHead(200,{"Content-Type":path.extname(p)===".css"?"text/css":"text/javascript"});res.end(data);
 }catch{res.writeHead(404);res.end("Not Found")}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const size of [{width:390,height:844},{width:844,height:390},{width:1440,height:900}]){
  const page=await browser.newPage({viewport:size,reducedMotion:"no-preference"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.address().port+"/__local_tl_v22__");
  await page.locator("#tlHand .tl-hand-card").first().waitFor({state:"attached"});
  const phase=await page.locator("#tlBoard").getAttribute("data-fx-phase");
  assert.ok(["shuffle","deal","spread"].includes(phase),
   "Human cards must be dealt before the actual first turn");
  const visibility=await page.locator("#tlHand .tl-hand-card").first()
   .evaluate(el=>getComputedStyle(el).visibility);
  assert.equal(visibility,"hidden","Real card faces are concealed while shuffling");
  assert.equal(await page.locator(".tl-avatar-turn-clock").count(),0,
   "No turn clock while the cards are still being shuffled");
  await page.waitForFunction(()=>document.querySelector("#tlBoard")?.dataset.fxPhase==="ready",
   null,{timeout:9000});
  await page.locator("#tlDealNotice").waitFor({state:"hidden"});
  assert.equal(await page.locator("#tlHand .tl-hand-card").count(),13,
   "Each real human hand receives exactly 13 cards");
  const post=await page.locator("#tlHand .tl-hand-card").first()
   .evaluate(el=>getComputedStyle(el).visibility);
  assert.notEqual(post,"hidden","Human cards reveal only after complete shuffle and deal");
  assert.equal(await page.locator(".tl-avatar-turn-clock").count(),1,
   "Exactly one active player's avatar owns the 20s clock");
  const active=await page.locator(".tl-avatar-turn-clock").first().textContent();
  assert.match(active,/^(?:20|19|18)s$/,"Bot-game clock begins after dealing");
  await page.locator("#tlNew").click();
  await page.locator("#tlDealNotice").waitFor({state:"visible"});
  assert.equal(await page.locator(".tl-avatar-turn-clock").count(),0,
   "A new round re-enters shuffle before any timed turn");
  assert.deepEqual(errors,[],"No browser errors: "+errors.join(" | "));
  console.log("PASS production Tiến Lên shuffles before play, 13 private faces and 20s clock "+size.width+"x"+size.height);
  await page.close();
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
