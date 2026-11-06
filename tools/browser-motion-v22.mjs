/* Live-DOM animation QA without authentication, G, or fake server actions.
 * 390 portrait, 844 landscape, 1440 desktop. Checks the actual V22 FX modules.
 */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const html=`<!doctype html><html lang="vi" class="arena-reference-v1 arena-embedded"
data-embedded-game="tienlen" data-arena-visuals="full"><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/assets/arena/tienlen-live.css">
<link rel="stylesheet" href="/assets/arena/gameplay-cards-v20.css">
<link rel="stylesheet" href="/assets/arena/arena-fidelity-v22.css">
<style>body{margin:0;color:#fff;background:#081629}
#tlBoard{position:relative;width:100%;height:min(80dvh,650px);margin:auto}
.tl-center{position:absolute;left:20%;right:20%;top:30%;height:25%;display:grid;place-items:center}
.tl-player-hud{position:absolute;left:12px;bottom:10px}
.tl-opponent{position:absolute;top:2%;left:40%}
.tl-opponent[data-seat="left"]{left:5%;top:28%}
.tl-opponent[data-seat="right"]{left:auto;right:5%;top:28%}</style>
</head><body><main><section id="arenaTienLen">
<div id="tlBoard" class="tl-board" data-fx-phase="idle">
 <div class="tl-opponent" data-seat="top">AI 1</div>
 <div class="tl-opponent" data-seat="left">AI 2</div>
 <div class="tl-opponent" data-seat="right">AI 3</div>
 <div class="tl-center"><div id="tlPile" class="tl-pile"></div></div>
 <div class="tl-player-hud">Bạn</div>
</div></section></main><script type="module">
import {createTableEffects,showChopPopup} from "/assets/arena/tienlen-fx.js";
import {showRoomDeal,isDealing} from "/assets/arena/arena-deal-v22.js";
window.motion={createTableEffects,showChopPopup,showRoomDeal,isDealing};
</script></body></html>`;
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,"http://127.0.0.1");
  if(url.pathname==="/__motion_v22__"){
   res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});res.end(html);return;
  }
  const f=path.resolve(root,"."+decodeURIComponent(url.pathname));
  if(!f.startsWith(root+path.sep))throw Error("Traversal");
  const b=await readFile(f);
  res.writeHead(200,{"Content-Type":path.extname(f)===".css"?"text/css":"text/javascript"});
  res.end(b);
 }catch{res.writeHead(404);res.end("Not found")}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const size of [{width:390,height:844},{width:844,height:390},{width:1440,height:900}]){
  const page=await browser.newPage({viewport:size,reducedMotion:"no-preference"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.address().port+"/__motion_v22__");
  await page.waitForFunction(()=>Boolean(window.motion?.createTableEffects));
  await page.evaluate(()=>{
   const b=document.querySelector("#tlBoard"),pile=document.querySelector("#tlPile");
   const fx=window.motion.createTableEffects(b,pile);
   window.fx=fx;window.dealPromise=fx.deal();
  });
  assert.equal(await page.locator("#tlBoard").getAttribute("data-fx-phase"),"shuffle");
  await page.waitForFunction(()=>document.querySelector("#tlBoard").dataset.fxPhase==="deal",{timeout:3000});
  assert.equal(await page.locator(".tl-deal-sprite").count(),52,
   "ALL 52 public backs are animated, not a sampled fake distribution");
  await page.evaluate(()=>window.dealPromise);
  assert.equal(await page.locator("#tlBoard").getAttribute("data-fx-phase"),"ready");
  const chop=page.evaluate(()=>window.motion.showChopPopup("TỨ QUÝ CHẶT!",{duration:920}));
  await page.locator(".arena-chop-v22-title").waitFor({state:"visible"});
  const rect=await page.locator(".arena-chop-v22-title").boundingBox();
  assert.ok(rect,"Bomb title exists");
  assert.ok(Math.abs((rect.x+rect.width/2)-(size.width/2))<size.width*.12,
   "Chop explodes in the middle of the actual viewport");
  await chop;
  assert.equal(await page.locator(".arena-chop-v22").count(),0,
   "Chop layer cleans up without blocking play");
  await page.evaluate(()=>{
   const readyAt=new Date(Date.now()+1250).toISOString();
   window.motion.showRoomDeal(document.querySelector("#tlBoard"),
    {roundReadyAt:readyAt,roundIndex:3});
  });
  await page.locator(".arena-v22-deal-mask").waitFor({state:"visible"});
  await page.waitForTimeout(1450);
  assert.equal(await page.locator(".arena-v22-deal-mask").count(),0,
   "Online shuffle layer disappears at server ready timestamp");
  assert.deepEqual(errors,[],"No browser exceptions: "+errors.join(" | "));
  console.log("PASS Arena V22 52 cards + chop + online timer "+size.width+"x"+size.height);
  await page.close();
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
