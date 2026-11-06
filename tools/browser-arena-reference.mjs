import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {chromium} from "playwright";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".mp3":"audio/mpeg",".json":"application/json"};
const server=createServer(async(req,res)=>{
 try{const file=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(!file.startsWith(root+path.sep))throw Error("Path");
  const body=await readFile(file);res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream"});res.end(body);
 }catch{res.writeHead(404);res.end("Not found");}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin="http://127.0.0.1:"+server.address().port;
const stub=[
 'export const GOLD_TIERS=[5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000];',
 'export const GOLD_PER_POINT=10;',
 'export const GAME_LABELS={chess:"Cờ Vua",tienlen:"Tiến Lên",colors:"Bài Màu"};',
 'export const gameCapacity=g=>g==="chess"?2:4;',
 'export const requiredGold=(g,n)=>n*(g==="chess"?1:g==="tienlen"?13:20);',
 'export const affordableTier=()=>5;',
 'export const normalizeRoomCode=s=>String(s||"").toUpperCase();',
 'export function formatG(n){return n<1000?n+"G":Number(n/1000).toFixed(2).replace(/\\.00$/,"")+"K G";}',
 'let gold=1240,points=12,checked=false,spun=false;',
 'const wallet=()=>({gold,availablePoints:points});',
 'const daily=()=>({day:"2026-11-06",checkedIn:checked,spun,spinGold:spun?500:0});',
 'export async function roomRequest(action){',
 ' if(action==="wallet")return {ok:true,wallet:wallet()};',
 ' if(action==="daily")return {ok:true,daily:daily(),wallet:wallet()};',
 ' if(action==="daily_checkin"){const already=checked;if(!already){checked=true;gold+=1000;points+=1;}return {ok:true,daily:daily(),wallet:wallet(),reward:{already,awardedGold:already?0:1000,awardedPoints:already?0:1}};}',
 ' if(action==="daily_spin"){const already=spun;if(!already){spun=true;gold+=500;}return {ok:true,daily:daily(),wallet:wallet(),reward:{already,awardedGold:already?0:500}};}',
 ' if(action==="convert"){points-=2;gold+=20;return {ok:true,wallet:wallet()};}',
 ' throw Error("Unmocked "+action);',
 '}'
].join("\n");
await mkdir(path.join(root,"artifacts","arena-reference"),{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const [width,height,theme] of [[1672,941,"future"],[1440,900,"fresh"],[390,844,"future"]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:"reduce"});
  await ctx.addInitScript(t=>localStorage.setItem("MRLEE.THEME.V1",t),theme);
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:"document.documentElement.dataset.mrleeAuth='verified';document.getElementById('mrlee-auth-hide')?.remove();"}));
  await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:stub}));
  try{
   await page.goto(origin+"/mrlee-game-arena.html",{waitUntil:"domcontentloaded",timeout:25000});
   await page.locator("#arenaRefHero").waitFor({state:"visible",timeout:12000});
   await page.waitForFunction(()=>document.querySelectorAll(".arena-ref-play").length===6);
   await page.waitForFunction(()=>document.getElementById("arenaRefTopGold")?.textContent.includes("1.24"));
   assert.equal(await page.locator("#arenaDailyDialog").isVisible(),false);
   assert.equal(await page.locator("#arenaCatalog .arena-game-card.playable").count(),6);
   assert.equal(await page.locator("#arenaCatalog .arena-game-card.playable:visible").count(),5);
   assert.equal(await page.locator("#arenaRefLearning:visible").count(),1);
   assert.equal(await page.locator("#arenaRefWheelPreview .arena-ref-wheel-label").count(),10);
   const metrics=await page.evaluate(()=>{
    const r=selector=>{const b=document.querySelector(selector)?.getBoundingClientRect();return b&&{x:b.x,y:b.y,w:b.width,h:b.height};};
    return {header:r(".arena-ref-header"),hero:r("#arenaRefHero"),sidebar:r(".arena-ref-categories"),dock:r("#arenaRefDock")};
   });
   if(width===1672){
    assert.ok(Math.abs(metrics.header.h-80)<3,"Header "+JSON.stringify(metrics.header));
    assert.ok(Math.abs(metrics.hero.h-274)<3,"Hero "+JSON.stringify(metrics.hero));
    assert.ok(Math.abs(metrics.sidebar.w-250)<3,"Sidebar "+JSON.stringify(metrics.sidebar));
    assert.ok(metrics.dock.y>=790&&metrics.dock.y<=870,"Dock y "+metrics.dock.y);
   }
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=5,"Horizontal overflow "+overflow+" at "+width);
   await page.screenshot({path:path.join(root,"artifacts","arena-reference","lobby-"+width+"-"+theme+".png"),fullPage:width<600});
   await page.locator('[data-arena-panel="stats"]').first().click();
   await page.locator("#arenaRefDialog").waitFor({state:"visible",timeout:4000});
   assert.match(await page.locator("#arenaRefDialogBody").textContent(),/EXP demo/);
   await page.locator("#arenaRefDialogClose").click();
   await page.locator('[data-arena-filter="fun"]').click();
   assert.equal(await page.locator(".arena-game-card.playable:visible").count(),3);
   await page.locator('[data-arena-filter="all"]').click();
   await page.locator("#arenaGameSearch").fill("bài màu");
   assert.equal(await page.locator('[data-game-id="colors"]:visible').count(),1);
   await page.locator("#arenaGameSearch").fill("");
   await page.locator('.arena-ref-play[data-ref-play="chess"]').click();
   await page.locator('#chessBoard [data-square="e2"]').waitFor({state:"visible",timeout:9000});
   await page.locator("#chessExit").click();
   assert.equal(await page.locator("#arenaRefHero").isVisible(),true);
   await page.locator("#arenaRefColorsAccess").click();
   await page.locator("#arenaTopCard").waitFor({state:"visible",timeout:9000});
   await page.locator("#arenaExit").click();
   assert.deepEqual(errors,[],"Runtime errors "+errors.join(" | "));
   console.log("PASS reference dashboard "+width+"x"+height+" "+theme+" "+JSON.stringify(metrics));
  }finally{await ctx.close();}
 }
}finally{if(browser)await browser.close();await new Promise(done=>server.close(done));}
