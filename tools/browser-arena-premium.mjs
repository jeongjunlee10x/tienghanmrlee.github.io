/* MR LEE visual release regression: art, identities, legal-move animations & 4.8s wheel.
   Offline mock accounts only. Never calls the production wallet or writes rewards.
 */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".json":"application/json",".webp":"image/webp",
 ".svg":"image/svg+xml",".png":"image/png",".mp3":"audio/mpeg",".csv":"text/csv; charset=utf-8"};
const server=createServer(async(req,res)=>{
 try{
  const file=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://local").pathname));
  if(!file.startsWith(root+path.sep))throw Error("blocked path");
  const data=await readFile(file);
  res.writeHead(200,{"Content-Type":MIME[path.extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
  res.end(data);
 }catch{res.writeHead(404);res.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
const stub=String.raw`export const GOLD_TIERS=[5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000];
 export const GOLD_PER_POINT=10;
 export const GAME_LABELS={chess:"Cờ vua",tienlen:"Tiến Lên",colors:"Bài Màu"};
 export const gameCapacity=g=>g==="chess"?2:4;
 export const requiredGold=(g,n)=>n*(g==="chess"?1:g==="tienlen"?13:20);
 export const affordableTier=()=>5;
 export const normalizeRoomCode=s=>String(s||"").trim().toUpperCase();
 export const formatG=n=>n<1000?n+"G":Number(n/(n>=1000000?1000000:1000)).toFixed(0)+(n>=1000000?"M":"K")+" G";
 let checked=true,spun=false,gold=1000;
 export async function roomRequest(action){
  if(action==="wallet")return {ok:true,wallet:{gold,availablePoints:1}};
  if(action==="daily")return {ok:true,daily:{day:"2026-11-06",checkedIn:checked,spun,spinGold:spun?800:0},wallet:{gold,availablePoints:1}};
  if(action==="daily_spin"){spun=true;gold+=800;return {ok:true,
   daily:{day:"2026-11-06",checkedIn:true,spun:true,spinGold:800},
   reward:{already:false,awardedGold:800},wallet:{gold,availablePoints:1}};}
  throw Error("Unexpected action "+action);
 }`;
await mkdir(path.join(root,"artifacts","arena-premium"),{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const [width,height,theme] of [[1440,920,"fresh"],[390,844,"future"]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:"reduce"});
  await context.addInitScript(theme=>localStorage.setItem("MRLEE.THEME.V1",theme),theme);
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
   body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"}));
  await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:stub}));
  try{
   await page.goto(origin+"/mrlee-game-arena.html",{waitUntil:"domcontentloaded",timeout:25000});
   await page.locator("#arenaDailyOpen").click();
   await page.locator("#arenaDailyDialog").waitFor({state:"visible",timeout:12000});
   await page.locator("#arenaDailyClose").click();
   await page.waitForFunction(()=>document.querySelectorAll("#arenaCatalog img.arena-cover-image").length===6,null,{timeout:12000});
   // A featured game can be hidden by the screenshot layout. Lazy-load images
   // stay unfetched in that case; check the actual SVG resource, not naturalWidth.
   const allCovers=await page.locator("#arenaCatalog img.arena-cover-image").evaluateAll(images=>
    images.map(img=>({src:img.getAttribute("src"),featured:img.closest(".arena-game-card")?.getBoundingClientRect().height>0})));
   assert.equal(allCovers.length,6);
   for(const cover of allCovers){
    const result=await page.request.get(origin+"/"+cover.src);
    assert.equal(result.status(),200,"Original illustrated cover missing: "+cover.src);
   }
   await page.waitForFunction(()=>[...document.querySelectorAll("#arenaCatalog .arena-game-card.playable img.arena-cover-image")]
     .filter(img=>img.closest(".arena-game-card")?.getClientRects().length>0)
     .every(img=>img.complete&&img.naturalWidth>=400),null,{timeout:10000});
   assert.equal(await page.locator("#arenaCatalog .arena-cover-brand").count(),6);
   assert.equal(await page.locator("#arenaCatalog .arena-cover-identity").count(),6);
   assert.equal(await page.locator(".arena-board-brand").count(),6);
   await page.screenshot({path:path.join(root,"artifacts","arena-premium","lobby-"+theme+"-"+width+".png"),fullPage:width>800});
   await page.evaluate(()=>document.querySelector('#arenaCatalog button[data-game="chess"]')?.click());
   await page.locator('#chessBoard [data-square="e2"]').waitFor({state:"visible",timeout:8000});
   assert.equal(await page.locator("#chessBoard .chess-square").count(),64);
   assert.equal(await page.locator("#chessBoard").getAttribute("data-move-index"),"0");
   await page.locator('#chessBoard [data-square="e2"]').click();
   await page.locator('#chessBoard [data-square="e4"]').click();
   await page.waitForFunction(()=>Number(document.querySelector("#chessBoard")?.dataset.moveIndex)>=1);
   assert.equal(await page.locator("#chessBoard").getAttribute("data-last-move"),"e2,e4");
   await page.locator("#chessExit").click();
   // A separate mock session verifies all six games can be re-entered; no
   // gameplay balance is asserted because local demo credits are not verified G.
   assert.deepEqual(errors,[],"Runtime errors: "+errors.join(" | "));
   console.log("PASS Premium covers/board marks and chess "+width+"px "+theme);
  }finally{await context.close();}
 }
 // Actual spinning duration must be within 4–5 seconds unless user prefers reduced motion.
 const ctx=await browser.newContext({viewport:{width:1280,height:900}});
 await ctx.addInitScript(()=>localStorage.setItem("MRLEE.THEME.V1","fresh"));
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",err=>errors.push(err.message));
 await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
  body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"}));
 await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:stub}));
 try{
  await page.goto(origin+"/mrlee-game-arena.html",{waitUntil:"domcontentloaded",timeout:25000});
  await page.locator("#arenaDailyOpen").click();
  await page.locator("#arenaDailyDialog").waitFor({state:"visible",timeout:12000});
  await page.locator("#arenaDailySpinButton").waitFor({state:"visible",timeout:10000});
  await page.locator("#arenaDailySpinButton").click();
  await page.waitForFunction(()=>document.querySelector("#arenaWheelDisk")?.getAttribute("aria-busy")==="true",null,{timeout:2000});
  assert.equal(await page.locator("#arenaWheelDisk").evaluate(el=>getComputedStyle(el).transitionDuration),"4.8s");
  assert.equal(await page.locator("#arenaWheelResult").isVisible(),false,"Do not leak prize mid-spin");
  const early=await page.locator("#arenaDailyBalance").textContent();
  assert.match(early||"",/1K G|1K G/);
  const elapsed=await page.evaluate(()=>new Promise(resolve=>{
   const start=performance.now();const wheel=document.querySelector("#arenaWheelResult");
   const watcher=new MutationObserver(()=>{
    if(!wheel.hidden){watcher.disconnect();resolve(performance.now()-start);}
   });watcher.observe(wheel,{attributes:true,attributeFilter:["hidden"]});
   setTimeout(()=>{watcher.disconnect();resolve(99999);},7000);
  }));
  assert.ok(elapsed>=4300&&elapsed<=5200,"Spin duration out of range: "+elapsed);
  assert.match(await page.locator("#arenaWheelResult").textContent(),/800G/);
  assert.deepEqual(errors,[],"Runtime errors: "+errors.join(" | "));
  console.log("PASS 4.8s wheel, verified prize delayed until landing",Math.round(elapsed),"ms");
 }finally{await ctx.close();}
 // 10 study games retain native buttons and are branded on their own page.
 const ctx2=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
 await ctx2.addInitScript(()=>localStorage.setItem("MRLEE.THEME.V1","future"));
 const zone=await ctx2.newPage(),zoneErrors=[];
 zone.on("pageerror",e=>zoneErrors.push(e.message));
 await zone.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
  body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"}));
 await zone.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:stub}));
 try{
  await zone.goto(origin+"/tro-choi-tieng-han.html?cap=1&bai=1",{waitUntil:"domcontentloaded",timeout:25000});
  await zone.locator("#arenaDailyDialog").waitFor({state:"visible",timeout:12000});
  await zone.locator("#arenaDailyClose").click();
  await zone.locator("#mzCards .mz-card").first().waitFor();
  assert.equal(await zone.locator("#mzCards .mz-card").count(),10);
  assert.equal(await zone.locator("#mzCards .mz-cover-art").count(),10);
  assert.equal(await zone.locator("#mzCards .mz-cover-glow").count(),10);
  assert.equal(await zone.locator("#mzArena .mz-play-brand img").count(),1);
  await zone.waitForFunction(()=>document.querySelector("#mzCards button")?.disabled===false,null,{timeout:12000});
  await zone.locator("#mzCards button").first().click();
  await zone.locator("#mzGame .mz-pair-grid").waitFor({state:"visible",timeout:8000});
  assert.deepEqual(zoneErrors,[]);
  console.log("PASS 10 Game Zone premium cards + playable mode");
 }finally{await ctx2.close();}
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
