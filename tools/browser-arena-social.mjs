/* MR LEE native friend popup and real public-room browser regression.
 * Offline mocked Firebase and wallet; no production G or rooms are modified.
 */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".json":"application/json",".mp3":"audio/mpeg"};
const server=createServer(async(req,res)=>{
 try{
  const file=path.resolve(ROOT,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(!file.startsWith(ROOT+path.sep))throw Error("Traversal");
  const bytes=await readFile(file);
  res.writeHead(200,{"Content-Type":MIME[path.extname(file)]||"application/octet-stream"});res.end(bytes);
 }catch{res.writeHead(404);res.end("Not Found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const ORIGIN="http://127.0.0.1:"+server.address().port;
const MOCK=[
 'export const GOLD_TIERS=[5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000];',
 'export const GOLD_PER_POINT=10;',
 'export const GAME_LABELS={chess:"Cờ vua",tienlen:"Tiến lên",colors:"Bài Màu"};',
 'export const gameCapacity=g=>g==="chess"?2:4;',
 'export const requiredGold=(g,n)=>n*(g==="chess"?1:g==="tienlen"?13:20);',
 'export const affordableTier=()=>5;',
 'export const normalizeRoomCode=s=>String(s||"").trim().toUpperCase().replace(/[\\s-]/g,"");',
 'export const formatG=n=>Number(n)<1000?n+"G":Number((n/(n>=1e6?1e6:1e3)).toFixed(2))+(n>=1e6?"M":"K")+" G";',
 'let gold=1200,points=3;',
 'const wallet=()=>({gold,availablePoints:points});',
 'const safe=(game="tienlen",code="ABCD2345",tier=5)=>({code,game,minGold:tier,requiredGold:tier*(game==="chess"?1:game==="tienlen"?13:20),status:"waiting",visibility:"private",version:1,capacity:game==="chess"?2:4,seat:0,players:[{name:"Học viên",seat:0,ready:false}]});',
 'export async function roomRequest(action,p={}){',
 ' if(action==="wallet")return {ok:true,wallet:wallet()};',
 ' if(action==="daily")return {ok:true,daily:{day:"2026-11-06",checkedIn:true,spun:true,spinGold:100},wallet:wallet()};',
 ' if(action==="create")return {ok:true,room:safe(p.game,"ABCD2345",p.minGold)};',
 ' if(action==="join")return {ok:true,room:safe(new URL(location.href).searchParams.get("game")||document.documentElement.dataset.roomGame||"tienlen",p.code,5)};',
 ' if(action==="quick")return {ok:true,room:safe(p.game)};',
 ' if(action==="list")return {ok:true,rooms:[{code:"QRST2345",game:p.game,status:"waiting",minGold:10,host:"Học viên A",count:1,capacity:p.game==="chess"?2:4,alreadyIn:false},{code:"ABCD2345",game:p.game,status:"waiting",minGold:500,host:"Học viên B",count:2,capacity:4,alreadyIn:false}]};',
 ' if(action==="state")return {ok:true,room:safe("tienlen")};',
 ' if(action==="leave")return {ok:true,left:true};',
 ' if(action==="convert"){points-=Number(p.points);gold+=Number(p.points)*10;return {ok:true,wallet:wallet()};}',
 ' throw Error("Unhandled "+action);',
 '}'
].join("\n");
await mkdir(path.join(ROOT,"artifacts","arena-social"),{recursive:true});
const games=[["game-tien-len.html","tienlen"],["game-co-vua.html","chess"],["game-bai-mau.html","colors"]];
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const [w,h] of [[844,390],[390,844]]){
  for(const [file,game] of games){
   const ctx=await browser.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true,reducedMotion:"reduce"});
   await ctx.addInitScript(()=>localStorage.setItem("MRLEE.THEME.V1","future"));
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.route(/https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
   await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
    body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"}));
   await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:MOCK}));
   try{
    await page.goto(ORIGIN+"/"+file,{waitUntil:"domcontentloaded",timeout:30000});
    await page.locator('[data-play-mode="friends"]').click();
    await page.locator("#roomFriendsPopup").waitFor({state:"visible",timeout:5000});
    assert.equal(await page.locator("#arenaSocialCreate").isVisible(),true);
    assert.equal(await page.locator("#arenaSocialJoin").isVisible(),false);
    assert.equal(await page.locator("#arenaSocialCreate input[type=radio]").count(),12);
    await page.waitForFunction(()=>document.querySelector('#arenaSocialCreate input[value="5000"]')?.disabled);
    assert.equal(await page.locator('#arenaSocialCreate input[value="100"]').isDisabled(),game!=="chess");
    assert.equal(await page.locator('#arenaSocialCreate input[value="5000"]').isDisabled(),true);
    const box=await page.locator("#roomFriendsPopup").boundingBox();
    assert.ok(box&&box.x>=0&&box.x+box.width<=w+1&&box.y>=0&&box.y+box.height<=h+1,
     "Popup clipped "+w+"x"+h+": "+JSON.stringify(box));
    if(game==="tienlen")await page.screenshot({path:path.join(ROOT,"artifacts","arena-social","popup-create-"+w+".png")});
    await page.locator('[data-social-tab="join"]').click();
    assert.equal(await page.locator("#arenaSocialJoin").isVisible(),true);
    await page.locator("#arenaSocialCode").fill("abcd2345");
    assert.equal(await page.locator("#arenaSocialCode").inputValue(),"ABCD2345");
    if(game==="tienlen")await page.screenshot({path:path.join(ROOT,"artifacts","arena-social","popup-join-"+w+".png")});
    await page.locator(".arena-social-close").click();
    assert.equal(await page.locator("#roomFriendsPopup").isVisible(),false);
    assert.equal(await page.locator("#roomLobby").isVisible(),true);
    assert.deepEqual(errors,[],"Popup errors "+file+": "+errors.join(" | "));
    console.log("PASS Friends popup "+file+" "+w+"x"+h);
   }finally{await ctx.close();}
  }
 }
 const ctx=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,reducedMotion:"reduce"});
 await ctx.addInitScript(()=>localStorage.setItem("MRLEE.THEME.V1","future"));
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.route(/https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
 await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
  body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"}));
 await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:MOCK}));
 try{
  await page.goto(ORIGIN+"/game-chon-ban.html?game=tienlen",{waitUntil:"domcontentloaded",timeout:30000});
  await page.locator("#browserRooms .room-browser-table").first().waitFor({state:"visible",timeout:7000});
  await page.waitForFunction(()=>document.querySelector("#browserGold")?.textContent==="1.200G");
  assert.equal(await page.locator("#browserRooms .room-browser-table").count(),2);
  assert.equal(await page.locator("#browserRooms .room-browser-enter:enabled").count(),1);
  assert.equal(await page.locator("#browserRooms .room-browser-enter:disabled").count(),1);
  assert.equal(await page.locator("#browserRooms .room-browser-locked").count(),1);
  await page.screenshot({path:path.join(ROOT,"artifacts","arena-social","room-browser-844.png")});
  await page.locator('[data-browser-filter="open"]').click();
  assert.equal(await page.locator("#browserRooms .room-browser-table").count(),2);
  await page.locator('[data-browser-filter="waiting"]').click();
  assert.equal(await page.locator("#browserRooms .room-browser-table").count(),2);
  assert.deepEqual(errors,[]);
  console.log("PASS Public room browser with verified wallet, real labels and server list");
 }finally{await ctx.close();}
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
