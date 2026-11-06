/* Real Chromium smoke for all 6 independent game rooms.
 * All G balances and PvP responses are mocked in this test only.
 */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".json":"application/json",".mp3":"audio/mpeg"};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const file=path.resolve(ROOT,"."+pathname);
  if(!file.startsWith(ROOT+path.sep))throw Error("Path traversal");
  const data=await readFile(file);
  res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
  res.end(data);
 }catch{res.writeHead(404);res.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const ORIGIN="http://127.0.0.1:"+server.address().port;
const fakeAPI=[
 'export const GOLD_TIERS=[5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000];',
 'export const GOLD_PER_POINT=10;',
 'export const GAME_LABELS={chess:"Cờ vua",tienlen:"Tiến lên miền Nam",colors:"Bài Màu Đại Chiến"};',
 'export const gameCapacity=g=>g==="chess"?2:4;',
 'export const requiredGold=(g,n)=>n*(g==="chess"?1:g==="tienlen"?13:20);',
 'export const affordableTier=()=>5;',
 'export const normalizeRoomCode=s=>String(s||"").trim().toUpperCase();',
 'export function formatG(n){n=Math.trunc(Number(n)||0);return n<1000?n+"G":Number((n/(n>=1000000?1000000:1000)).toFixed(2))+(n>=1000000?"M":"K")+" G";}',
 'let gold=6507,points=8,checked=true,spun=true;',
 'const wallet=()=>({gold,availablePoints:points});',
 'const daily=()=>({day:"2026-11-06",checkedIn:checked,spun,spinGold:500});',
 'const room=g=>({code:"ABCD1234",game:g||"chess",status:"waiting",minGold:5,',
 '  requiredGold:g==="chess"?5:g==="tienlen"?65:100,capacity:g==="chess"?2:4,seat:0,version:1,',
 '  players:[{name:"Học viên",seat:0,ready:false}]});',
 'export async function roomRequest(action,p={}){',
 ' if(action==="wallet")return {ok:true,wallet:wallet()};',
 ' if(action==="daily")return {ok:true,daily:daily(),wallet:wallet()};',
 ' if(action==="quick"||action==="create")return {ok:true,room:room(p.game)};',
 ' if(action==="list")return {ok:true,rooms:[]};',
 ' if(action==="leave")return {ok:true};',
 ' if(action==="state")return {ok:true,room:room("chess")};',
 ' if(action==="convert"){gold+=Number(p.points)*10;points-=Number(p.points);return {ok:true,wallet:wallet()};}',
 ' throw Error("Mock API did not provide "+action);',
 '}'
].join("\n");
const GAMES=[
 ["game-bai-mau.html","colors","arenaTable",true],
 ["game-co-vua.html","chess","arenaChess",true],
 ["game-tien-len.html","tienlen","arenaTienLen",true],
 ["game-co-ca-ngua.html","ludo","arenaLudo",false],
 ["game-co-tuong.html","xiangqi","arenaXiangqi",false],
 ["game-dia-oc.html","estate","arenaEstate",false]
];
await mkdir(path.join(ROOT,"artifacts","game-rooms"),{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const [width,height] of [[844,390],[390,844]]){
  for(const [pageFile,game,section,online] of GAMES){
   const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:"reduce"});
   await context.addInitScript(()=>localStorage.setItem("MRLEE.THEME.V1","future"));
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.route(/https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
   await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
    body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"}));
   await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:fakeAPI}));
   try{
    await page.goto(ORIGIN+"/"+pageFile,{waitUntil:"domcontentloaded",timeout:25000});
    await page.locator("#roomWalletGold").waitFor({state:"visible",timeout:5000});
    await page.waitForFunction(()=>document.querySelector("#roomWalletGold")?.textContent==="6.507G",null,{timeout:10000});
    assert.equal(await page.locator("#roomWalletPoints").textContent(),"8");
    assert.equal(await page.locator("#roomMenu .game-room-tile").count(),4);
    assert.equal(await page.locator('#roomMenu [data-play-mode="friends"]').isEnabled(),online);
    assert.equal(await page.locator('#roomMenu [data-play-mode="browse"]').isEnabled(),online);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=4,"Horizontal overflow on "+pageFile+" at "+width+": "+overflow);
    const tiles=await page.locator(".game-room-tiles").boundingBox();
    assert.ok(tiles&&tiles.height<=height,"Oversized tiles in "+pageFile+": "+tiles?.height);
    if(game==="tienlen"||game==="chess"){
     await page.screenshot({path:path.join(ROOT,"artifacts","game-rooms",game+"-"+width+".png")});
    }
    await page.locator("#roomBotPlay").click();
    const iframe=page.frameLocator("#roomGameFrame");
    await iframe.locator("#"+section).waitFor({state:"visible",timeout:14000});
    assert.equal(await page.locator("#roomLobby").isVisible(),false);
    assert.equal(await page.locator("#roomPlay").isVisible(),true);
    assert.equal(await iframe.locator("html").evaluate(el=>el.classList.contains("arena-embedded")),true);
    await page.locator("#roomExitGame").click();
    await page.locator("#roomLobby").waitFor({state:"visible",timeout:10000});
    assert.equal(await page.locator("#roomPlay").isVisible(),false);
    assert.deepEqual(errors,[],"JS exceptions for "+pageFile+": "+errors.join(" | "));
    console.log("PASS "+pageFile+" "+width+"x"+height+" verified G and playable bot + return");
   }finally{await context.close();}
  }
 }
 // Online room action: create/join interface and server-authoritative quick room.
 const context=await browser.newContext({viewport:{width:900,height:550},reducedMotion:"reduce"});
 await context.addInitScript(()=>localStorage.setItem("MRLEE.THEME.V1","future"));
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.route(/https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
 await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
  body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"}));
 await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:fakeAPI}));
 try{
  await page.goto(ORIGIN+"/game-tien-len.html",{waitUntil:"domcontentloaded"});
  await page.locator('[data-play-mode="friends"]').click();
  const frame=page.frameLocator("#roomGameFrame");
  await frame.locator("#arenaRoomHub").waitFor({state:"visible",timeout:11000});
  await frame.locator("#roomFriends").waitFor({state:"visible",timeout:7000});
  await page.locator("#roomExitGame").click();
  await page.locator("#roomLobby").waitFor({state:"visible",timeout:7000});
  await page.locator('[data-play-mode="browse"]').click();
  await frame.locator("#roomBrowser").waitFor({state:"visible",timeout:10000});
  await page.locator("#roomExitGame").click();
  await page.locator("#roomLobby").waitFor({state:"visible",timeout:7000});
  await page.locator('[data-play-mode="quick"]').click();
  await frame.locator("#arenaRoomLobby").waitFor({state:"visible",timeout:10000});
  assert.equal(await frame.locator("#roomLobbyCode").textContent(),"ABCD1234");
  await page.locator("#roomExitGame").click();
  await page.locator("#roomLobby").waitFor({state:"visible",timeout:8000});
  assert.deepEqual(errors,[]);
  console.log("PASS Tiến Lên standalone online quick, friends, room browser and safe exit");
 }finally{await context.close();}
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
