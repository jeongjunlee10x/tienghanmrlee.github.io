/* Browser smoke: landscape request is best-effort, notifications stay inside boards.
 * Uses a mocked browser orientation API and local mock wallet, never live points.
 */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".mp3":"audio/mpeg",".webp":"image/webp",".png":"image/png",".svg":"image/svg+xml"};
const server=createServer(async(req,res)=>{
 try{
  const filename=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(!filename.startsWith(root+path.sep))throw Error("Traversal");
  const body=await readFile(filename);
  res.writeHead(200,{"Content-Type":MIME[path.extname(filename)]||"application/octet-stream"});
  res.end(body);
 }catch{res.writeHead(404);res.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
const walletStub=[
 'export const GOLD_TIERS=[5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000];',
 'export const GOLD_PER_POINT=10;',
 'export const GAME_LABELS={chess:"Cờ Vua",tienlen:"Tiến lên",colors:"Bài Màu"};',
 'export const gameCapacity=g=>g==="chess"?2:4;',
 'export const requiredGold=(g,n)=>n*(g==="chess"?1:g==="tienlen"?13:20);',
 'export const affordableTier=()=>5;',
 'export const normalizeRoomCode=s=>String(s||"").trim().toUpperCase();',
 'export function formatG(n){return n<1000?n+"G":Number(n/1000)+"K G";}',
 'export async function roomRequest(a){if(a==="wallet")return {ok:true,wallet:{gold:1500,availablePoints:2}};if(a==="daily")return {ok:true,daily:{day:"2026-11-05",checkedIn:true,spun:true,spinGold:100},wallet:{gold:1500,availablePoints:2}};throw Error("Mock "+a);}'
].join("\n");
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const [width,height,theme] of [[390,844,"fresh"],[844,390,"future"]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await context.addInitScript(theme=>{
   localStorage.setItem("MRLEE.THEME.V1",theme);
   window.__mrleeOrientation={fullscreen:0,lock:0};
   // Fullscreen mock is installed after goto, once documentElement exists.
  },theme);
  const page=await context.newPage(),runtimeErrors=[];
  page.on("pageerror",err=>runtimeErrors.push(err.message));
  await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
   body:"document.documentElement.dataset.mrleeAuth='verified';document.getElementById('mrlee-auth-hide')?.remove();"}));
  await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:walletStub}));
  try{
   await page.goto(origin+"/mrlee-game-arena.html",{waitUntil:"domcontentloaded",timeout:30000});
   // Install a deterministic orientation/fullscreen probe after DOM creation.
   // addInitScript can run before document.documentElement exists on mobile Chromium.
   await page.evaluate(()=>{
    window.__mrleeOrientation={fullscreen:0,lock:0};
    document.documentElement.requestFullscreen=()=>{window.__mrleeOrientation.fullscreen++;return Promise.resolve();};
    try{Object.defineProperty(screen.orientation,"lock",{configurable:true,
     value:async()=>{window.__mrleeOrientation.lock++;throw Error("mock lock unavailable");}});}catch{}
   });
   await page.locator("#arenaRefColorsAccess").click();
   await page.waitForFunction(()=>document.body.classList.contains("arena-mobile-playing"),null,{timeout:7000});
   await page.locator("#arenaTable .arena-live-hud").waitFor({state:"visible",timeout:7000});
   assert.match((await page.locator("#arenaTable .arena-live-hud").textContent())||"",/lượt|chờ|bài/i);
   const attempts=await page.evaluate(()=>window.__mrleeOrientation);
   assert.ok(attempts.fullscreen>=1,"Must request fullscreen from a real game click");
   assert.equal(await page.locator('#arenaTable > .arena-events').evaluate(n=>getComputedStyle(n).display),"none");
   assert.equal(await page.locator("#arenaTable .arena-live-hud").evaluate(n=>!!n.closest(".arena-board")),true);
   if(height>width)assert.equal(await page.locator("#arenaTable .arena-rotate-prompt").isVisible(),true);
   else assert.equal(await page.locator("#arenaTable .arena-rotate-prompt").isVisible(),false);
   await page.locator("#arenaExit").click();
   assert.equal(await page.locator("#arenaTable").isVisible(),false);
   await page.locator('.arena-ref-play[data-ref-play="chess"]').click();
   await page.locator("#chessBoard .chess-square").first().waitFor({state:"visible",timeout:7000});
   await page.locator("#chessStatus").evaluate(n=>n.textContent="Chiếu! Đến lượt bạn.");
   await page.locator("#arenaChess .arena-live-hud").waitFor({state:"visible",timeout:4000});
   assert.match((await page.locator("#arenaChess .arena-live-hud").textContent())||"",/Chiếu/);
   await page.locator("#chessExit").click();
   await page.locator('.arena-ref-play[data-ref-play="tienlen"]').click();
   await page.locator("#tlBoard .arena-live-hud").waitFor({state:"visible",timeout:12000});
   assert.equal(await page.locator("#tlBoard .arena-live-hud").evaluate(n=>!!n.closest(".tl-board")),true);
   assert.equal(await page.locator('#arenaTienLen > .arena-events').evaluate(n=>getComputedStyle(n).display),"none");
   if(width>height){
    const h=await page.locator("#tlBoard").evaluate(n=>Math.round(n.getBoundingClientRect().height));
    assert.ok(h>=310&&h<=400,"Landscape table height "+h);
   }
   await page.locator("#tlExit").click();
   assert.deepEqual(runtimeErrors,[],"Browser runtime errors: "+runtimeErrors.join(" | "));
   console.log("PASS Arena mobile "+width+"×"+height+" "+theme+" • fullscreen request, overlay, responsive boards");
  }finally{await context.close();}
 }
 // Game Zone retains lesson-specific feedback in the on-board overlay.
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await ctx.addInitScript(()=>{
  localStorage.setItem("MRLEE.THEME.V1","fresh");
  // No DOM references here: init scripts may execute before <html> exists.
 });
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
  body:"document.documentElement.dataset.mrleeAuth='verified';document.getElementById('mrlee-auth-hide')?.remove();"}));
 await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:walletStub}));
 try{
  await page.goto(origin+"/tro-choi-tieng-han.html?cap=1&bai=1",{waitUntil:"domcontentloaded",timeout:30000});
  await page.evaluate(()=>{document.documentElement.requestFullscreen=async()=>{};});
  await page.waitForFunction(()=>document.querySelector("#mzCards button")?.disabled===false,null,{timeout:15000});
  await page.locator("#mzCards button").first().click();
  await page.locator("#mzGame .mz-pair-grid").waitFor({state:"visible",timeout:10000});
  await page.locator("#mzFeedback").evaluate(n=>n.textContent="Đáp án đúng! +7 điểm");
  await page.locator("#mzArena .arena-live-hud").waitFor({state:"visible",timeout:4000});
  assert.match(await page.locator("#mzArena .arena-live-hud").textContent(),/Đáp án đúng/);
  const overlay=await page.locator("#mzArena .arena-live-hud").evaluate(n=>n.parentElement.id==="mzArena");
  assert.equal(overlay,true);
  await page.locator("#mzBack").click();
  assert.equal(await page.locator("#mzArena").isVisible(),false);
  assert.deepEqual(errors,[]);
  console.log("PASS Game Zone 390×844 • on-board learning feedback");
 }finally{await ctx.close();}
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
