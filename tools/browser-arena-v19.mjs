/* Arena V19 real Chromium visual regression; no accounts, Supabase or G.
 * Renders the actual V19 module and CSS at phone and desktop sizes.
 */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const markup=`<!doctype html><html lang="vi" class="arena-reference-v1"><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/assets/arena/arena.css">
<link rel="stylesheet" href="/assets/arena/extra-games.css">
<link rel="stylesheet" href="/assets/arena/game-visuals-v19.css">
<style>body{margin:0;background:#13253a;color:#f2ecd9;font:14px system-ui}
main{max-width:1050px;margin:auto;padding:10px}
#arenaChess{margin-top:16px}
#arenaChess .chess-main{max-width:620px}
#arenaChess .chess-board{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));width:100%;aspect-ratio:1}
#arenaChess .chess-square{aspect-ratio:1;display:grid;place-items:center;border:0;font-size:clamp(19px,4vw,39px)}
#arenaXiangqi .xq-board{max-width:540px}
.arena-expanded-game{max-width:100%}</style>
</head><body><main>
<section id="arenaLobby"><div class="arena-catalog">
<article class="arena-game-card"><div class="arena-card-banner chess">♔ ♘ ♜</div><div class="arena-card-body"><strong>Cờ Vua</strong></div></article>
<article class="arena-game-card"><div class="arena-card-banner xiangqi">帥 車 馬</div><div class="arena-card-body"><strong>Cờ Tướng</strong></div></article>
<article class="arena-game-card"><div class="arena-card-banner colors">🔴 🔵 🟡</div><div class="arena-card-body"><strong>Bài Màu</strong></div></article>
</div></section>
<section id="arenaChess" class="arena-expanded-game">
<div class="arena-table-heading"><h2>Cờ Vua</h2></div>
<div class="chess-main"><div class="chess-board" id="mockChess">
<button class="chess-square light"><span class="chess-white">♔</span></button>
<button class="chess-square dark"><span class="chess-black">♚</span></button>
</div></div></section>
<section id="arenaXiangqi" class="arena-expanded-game">
<div class="arena-table-heading"><h2>Cờ Tướng</h2></div>
<div class="xq-board-wrap"><div class="xq-board"><button class="xq-square"><span class="xq-piece red">帥</span></button></div></div></section>
<section id="arenaLudo" class="arena-expanded-game">
<div class="arena-table-heading"><h2>Cờ Cá Ngựa</h2></div>
<div class="ludo-board" style="width:min(100%,320px)"><div class="ludo-cell base-red"><button class="ludo-pawn red">1</button></div></div></section>
<section id="arenaEstate" class="arena-expanded-game">
<div class="arena-table-heading"><h2>Địa Ốc</h2></div>
<div class="estate-board" style="width:min(100%,330px)"><div class="estate-tile type-property"><strong>Hà Nội</strong></div></div></section>
<section id="arenaTable" class="arena-expanded-game"><div class="arena-table-heading"><h2>Bài Màu</h2></div><div class="arena-board"><span class="arena-card-face arena-card-red">7</span></div></section>
<section id="arenaTienLen" class="arena-expanded-game"><div class="arena-table-heading"><h2>Tiến Lên</h2></div><div class="tl-board"><div class="tl-real-card">A♠</div></div></section>
<section id="arenaPvPBoard"></section>
</main><script type="module">
import {getArenaFXMode,emitArenaFX} from "/assets/arena/game-visuals-v19.js";
window.v19={getArenaFXMode,emitArenaFX};
</script></body></html>`;
const server=createServer(async(req,res)=>{
 try{
  const target=new URL(req.url,"http://127.0.0.1");
  if(target.pathname==="/__arena_v19__"){
   res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});res.end(markup);return;
  }
  const file=path.resolve(root,"."+decodeURIComponent(target.pathname));
  if(!file.startsWith(root+path.sep))throw Error("Blocked traversal");
  const bytes=await readFile(file);
  res.writeHead(200,{"Content-Type":path.extname(file)===".css"?"text/css":"text/javascript"});
  res.end(bytes);
 }catch{res.writeHead(404);res.end("Not Found")}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850},hasTouch:width===390,isMobile:width===390});
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  const url="http://127.0.0.1:"+server.address().port+"/__arena_v19__";
  await page.goto(url);
  await page.evaluate(()=>localStorage.setItem("mrlee.arena.visuals.v19","full"));
  await page.reload();
  await page.locator("#arenaChess .arena-visual-quality").waitFor({state:"visible"});
  assert.equal(await page.locator(".arena-visual-quality").count(),6,
   "All six games have a reachable quality toggle");
  assert.equal(await page.locator("html").getAttribute("data-arena-visuals"),"full");
  const board=page.locator("#arenaChess .chess-main");
  const border=await board.evaluate(node=>getComputedStyle(node).borderTopWidth);
  assert.ok(parseFloat(border)>=2,"Chess board renders physical frame");
  assert.equal(await page.locator("#arenaXiangqi .xq-piece").count(),1);
  const hand=await page.locator("#arenaTable .arena-card-face").first().boundingBox();
  assert.ok(hand&&hand.width>0&&hand.height>0,"Card graphics remain visible");
  await page.evaluate(()=>window.v19.emitArenaFX("chess",document.querySelector("#mockChess"),"ĂN QUÂN"));
  assert.ok(await page.locator(".arena-vfx-spark").count()>0,
   "Confirmed chess capture creates particle sprites in full mode");
  const quality=page.locator("#arenaChess .arena-visual-quality");
  await quality.click();assert.equal(await page.locator("html").getAttribute("data-arena-visuals"),"lite");
  await quality.click();assert.equal(await page.locator("html").getAttribute("data-arena-visuals"),"off");
  await page.waitForTimeout(1200);
  await page.evaluate(()=>window.v19.emitArenaFX("win",document.querySelector("#mockChess"),"THẮNG"));
  assert.equal(await page.locator(".arena-vfx-spark").count(),0,
   "Effects Off mode never spawns decorative animation");
  await page.evaluate(()=>{
   const header=document.createElement("div");header.className="arena-table-heading";
   document.querySelector("#arenaPvPBoard").append(header);
  });
  await page.locator("#arenaPvPBoard .arena-visual-quality").waitFor({state:"visible"});
  const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2);
  assert.ok(noOverflow,"Visual themes must not cause horizontal viewport overflow at "+width);
  assert.deepEqual(errors,[],"No browser exceptions: "+errors.join(" | "));
  console.log("PASS V19 responsive board graphics, FX quality, dynamic PvP headers: "+width+"px");
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/__arena_v19__");
 await page.locator("#arenaChess .arena-visual-quality").waitFor({state:"visible"});
 assert.equal(await page.locator("html").getAttribute("data-arena-visuals"),"off",
  "Operating-system reduced motion must override full FX preference");
 await page.close();
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
