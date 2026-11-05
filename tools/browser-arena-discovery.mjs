/* MR LEE Arena independent discovery + chess + Tiến Lên browser smoke. */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png",".svg":"image/svg+xml"};
const server=createServer(async(req,res)=>{
 try{
  const file=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(!file.startsWith(root+path.sep))throw Error("Path escape");
  const data=await readFile(file);
  res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream"});res.end(data);
 }catch{res.writeHead(404);res.end("Not Found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
const roomStub=[
 'export const GOLD_TIERS=[5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000];',
 'export const GOLD_PER_POINT=10;',
 'export const GAME_LABELS={chess:"Cờ vua",tienlen:"Tiến Lên",colors:"Bài Màu"};',
 'export const gameCapacity=g=>g==="chess"?2:4;',
 'export const requiredGold=(g,n)=>n*(g==="chess"?1:g==="tienlen"?13:20);',
 'export const affordableTier=(g,n)=>5;',
 'export const normalizeRoomCode=s=>String(s||"").trim().toUpperCase();',
 'export function formatG(n){return n<1000?n+"G":Number(n/1000)+"K G";}',
 'export async function roomRequest(a){if(a==="wallet")return {ok:true,wallet:{gold:2000,availablePoints:4}};if(a==="daily")return {ok:true,daily:{day:"2026-11-05",checkedIn:true,spun:true,spinGold:100},wallet:{gold:2000,availablePoints:4}};throw Error("Not mocked: "+a);}'
].join("\n");
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const width of [1440,390])for(const theme of ["fresh","future"]){
  const ctx=await browser.newContext({viewport:{width,height:width===390?844:940}});
  await ctx.addInitScript(t=>localStorage.setItem("MRLEE.THEME.V1",t),theme);
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
   body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"}));
  await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:roomStub}));
  try{
   await page.goto(origin+"/mrlee-game-arena.html",{waitUntil:"domcontentloaded",timeout:20000});
   assert.equal(await page.locator(".arena-game-card.playable").count(),6);
   assert.equal(await page.locator(".arena-game-card.playable:visible").count(),6);
   const fav=page.locator('[data-game-id="chess"] .arena-game-favorite');
   await fav.click();
   assert.equal(await fav.getAttribute("aria-pressed"),"true");
   await page.locator('[data-arena-filter="favorite"]').click();
   assert.equal(await page.locator(".arena-game-card.playable:visible").count(),1);
   await page.locator('[data-arena-filter="online"]').click();
   assert.equal(await page.locator(".arena-game-card.playable:visible").count(),3);
   await page.locator('[data-arena-filter="all"]').click();
   await page.locator("#arenaGameSearch").fill("tien");
   assert.equal(await page.locator(".arena-game-card.playable:visible").count(),1);
   assert.equal(await page.locator('[data-game-id="tienlen"]:visible').count(),1);
   await page.locator("#arenaGameSearch").fill("");
   await page.locator('#arenaGameSort').selectOption("alphabetic");
   assert.equal(await page.locator(".arena-game-card.playable:visible").count(),6);
   await page.locator('[data-game="chess"]').click();
   await page.locator('#chessBoard .chess-square[data-square="e2"]').waitFor({state:"visible",timeout:9000});
   assert.equal(await page.locator("#chessBoard .chess-square").count(),64);
   assert.equal((await page.locator("#chessWhiteClock").textContent()).trim(),"10:00");
   await page.locator("#chessBoardTheme").selectOption("wood");
   assert.equal(await page.locator("#chessBoard").getAttribute("data-theme"),"wood");
   await page.locator("#chessFlip").click();
   assert.equal(await page.locator("#chessBoard .chess-square").first().getAttribute("data-square"),"h1");
   await page.locator("#chessHint").click();
   assert.match(await page.locator("#chessStatus").textContent(),/Gợi ý/);
   await page.locator('#chessBoard .chess-square[data-square="e2"]').click();
   await page.locator('#chessBoard .chess-square[data-square="e4"]').click();
   assert.match(await page.locator('#chessBoard .chess-square[data-square="e4"]').getAttribute("aria-label"),/P/);
   await page.locator("#chessUndo").click();
   assert.match(await page.locator('#chessBoard .chess-square[data-square="e2"]').getAttribute("aria-label"),/P/);
   await page.locator("#chessExit").click();
   await page.locator('[data-arena-filter="recent"]').click();
   assert.equal(await page.locator(".arena-game-card.playable:visible").count(),1);
   await page.locator('[data-arena-filter="all"]').click();
   await page.locator('[data-game="tienlen"]').click();
   await page.locator("#tlHand .tl-hand-card").first().waitFor({state:"visible",timeout:12000});
   assert.equal(await page.locator("#tlHand .tl-hand-card").count(),13);
   await page.locator("#tlSort").click({timeout:20000});
   assert.match((await page.locator("#tlSort").textContent())||"",/giá trị/);
   assert.match((await page.locator("#tlRoundBadge").textContent())||"",/Lượt/);
   assert.ok((await page.locator("#tlTableEvent").textContent()).trim().length>0);
   await page.locator("#tlExit").click();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=3,"Horizontal scroll overflow "+overflow+" at "+width);
   assert.deepEqual(errors,[],"Runtime errors: "+errors.join("; "));
   console.log("PASS MR LEE discovery/chess/tienlen "+width+"px "+theme);
  }finally{await ctx.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
