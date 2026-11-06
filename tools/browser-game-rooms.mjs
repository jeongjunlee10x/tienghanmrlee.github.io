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
 'const room=g=>({code:"ABCD2345",game:g||"chess",status:"waiting",minGold:5,',
 '  requiredGold:g==="chess"?5:g==="tienlen"?65:100,capacity:g==="chess"?2:4,seat:0,version:1,',
 '  players:[{name:"Học viên",seat:0,ready:false}]});',
 'export async function roomRequest(action,p={}){',
 ' if(action==="wallet")return {ok:true,wallet:wallet()};',
 ' if(action==="daily")return {ok:true,daily:daily(),wallet:wallet()};',
 ' if(action==="quick"||action==="create")return {ok:true,room:room(p.game)};',
 ' if(action==="join")return {ok:true,room:room(new URL(location.href).searchParams.get("game")||document.documentElement.dataset.roomGame||"tienlen")};',
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
 for(const [width,height] of [[844,390],[390,844],[1440,900]]){
  for(const [pageFile,game,section,online] of GAMES){
   const context=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900,reducedMotion:"reduce"});
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
    assert.ok(tiles.x>=-1&&tiles.x+tiles.width<=width+2,
     "Game menu cropped horizontally on "+pageFile+": "+JSON.stringify(tiles));
    const positions=await page.locator(".game-room-tile").evaluateAll(nodes=>nodes.map(n=>{
     const r=n.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width};
    }));
    assert.ok(positions.every(b=>b.x>=-1&&b.right<=width+2),
     "Game buttons clipped on "+pageFile+" "+width+"px: "+JSON.stringify(positions));
    if(game==="tienlen"||game==="chess"){
     await page.screenshot({path:path.join(ROOT,"artifacts","game-rooms",game+"-"+width+".png")});
    }
    if(game==="chess")await page.locator("#roomChessTime").selectOption("3+2");
    if(game==="ludo")await page.locator("#roomLocalMode").selectOption("2");
    if(game==="xiangqi")await page.locator("#roomLocalMode").selectOption("up");
    if(game==="estate")await page.locator("#roomLocalMode").selectOption("8");
    await page.locator("#roomBotPlay").click();
    const iframe=page.frameLocator("#roomGameFrame");
    await iframe.locator("#"+section).waitFor({state:"visible",timeout:14000});
    if(game==="chess")assert.equal(await iframe.locator("#chessTime").inputValue(),"3+2",
     "Chess game received the exact Blitz increment");
    if(game==="ludo"){
     assert.equal(await iframe.locator("#ludoPlayers").inputValue(),"2");
     assert.equal(await iframe.locator("#ludoMoves .ludo-player").count(),2,
      "Two-player Ludo hides extra opponents");
    }
    if(game==="xiangqi")assert.equal(await iframe.locator("#xqVariant").inputValue(),"up",
     "Cờ Úp must be selected from standalone lobby");
    if(game==="estate"){
     assert.equal(await iframe.locator("#estateDuration").inputValue(),"8");
     assert.ok((await iframe.locator("#estateRound").textContent()).includes("1/8"),
      "Estate fast mode uses eight rounds");
    }
    assert.equal(await page.locator("#roomLobby").isVisible(),false);
    assert.equal(await page.locator("#roomPlay").isVisible(),true);
    // Verify a real pointer gesture completes a legal move, not just CSS hover.
    if(width===390&&game==="chess"){
     await iframe.locator('#chessBoard .chess-square[data-index="100"]').dragTo(
      iframe.locator('#chessBoard .chess-square[data-index="68"]'),{timeout:10000});
     await iframe.locator("#chessMoves").waitFor({state:"visible"});
     const notation=await iframe.locator("#chessMoves").textContent();
     assert.match(notation,/e4/,"Drag e2→e4 must be played and recorded by engine");
     for(let round=0;round<4;round++){
      await iframe.locator("#chessRestart").click();
      assert.equal(await iframe.locator("#chessBoard .chess-square").count(),64,
       "Unlimited bot rematch still renders 64 chess squares");
     }
     assert.equal(await iframe.locator("#arenaTickets").textContent(),"∞",
      "Bot practice no longer runs out of tickets");
    }
    if(width===390&&game==="ludo"){
     // Deterministic test die, only inside the isolated browser QA iframe.
     await iframe.locator("#ludoBoard").evaluate(()=>{Math.random=()=>.999999;});
     await iframe.locator("#ludoRoll").click();
     await iframe.locator('#ludoBoard .ludo-pawn.legal[data-pawn="0-0"]').dragTo(
      iframe.locator('#ludoBoard .ludo-cell[data-cell="0-0"]'),{timeout:10000});
     assert.equal(await iframe.locator('#ludoBoard .ludo-pawn[data-pawn="0-0"]').getAttribute("data-progress"),"0",
      "Cờ Cá Ngựa: physically drag the released horse to its exact target square");
    }
    if(width===1440&&game==="colors"){
     const playable=iframe.locator('#arenaHand .arena-hand-card.playable:not(:has(.arena-card-wild))');
     if(await playable.count()){
      await playable.first().dragTo(iframe.locator(".arena-board-center"),{timeout:10000});
      assert.equal(await iframe.locator("#arenaHand .arena-hand-card").count(),6,
       "Bài Màu: dragging a playable colored card must actually play it");
     }
    }
    if(width===1440&&game==="tienlen"){
     // Bot may own the 3♠ and start first; verify pickup only when user opens.
     await iframe.locator("#tlDealNotice").waitFor({state:"hidden",timeout:12000});
     const hand=iframe.locator("#tlHand .tl-hand-card:not(:disabled)");
     if(await hand.count()){
      await hand.first().dragTo(iframe.locator("#tlPile"),{timeout:10000});
      assert.ok(await iframe.locator("#tlPile .tl-real-card").count()>=1,
       "Tiến Lên: dropping the first legal lead into the pile is a real move");
     }
    }
    if(width===390&&game==="xiangqi"){
     await iframe.locator('#xqBoard .xq-square[data-index="54"]').dragTo(
      iframe.locator('#xqBoard .xq-square[data-index="45"]'),{timeout:10000});
     assert.match(await iframe.locator("#xqMoveCount").textContent(),/[1-9][0-9]* nước/,
      "Drag a red pawn one row: Cờ Tướng/Cờ Úp engine records the legal move");
    }
    assert.equal(await iframe.locator("html").evaluate(el=>el.classList.contains("arena-embedded")),true);
    if(game==="chess"||game==="xiangqi"){
     // These are portrait-first games: the user never has to turn the phone.
     assert.equal(await page.locator("#roomTryLandscape").isVisible(),false);
     const square=await iframe.locator(game==="chess"?"#chessBoard":"#xqBoard").evaluate(el=>{
      const b=el.getBoundingClientRect();
      return {width:b.width,left:b.left,right:b.right,viewport:document.documentElement.clientWidth,
       overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
     });
     assert.ok(square.width>120&&square.left>=-2&&square.right<=square.viewport+3,
      "Portrait chess board clipped "+pageFile+" "+width+": "+JSON.stringify(square));
     assert.ok(square.overflow<=5,"Iframe horizontal overflow "+pageFile+": "+JSON.stringify(square));
     if(width===390)assert.equal(await iframe.locator(".arena-rotate-prompt").count(),0,
      "Portrait chess/xiangqi must not show rotate prompt");
    }
    if(width>=1000){
     const desktop=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,
      screen:document.querySelector(".game-room-play").getBoundingClientRect().width,
      iframe:document.querySelector("#roomGameFrame").getBoundingClientRect().width}));
     assert.ok(desktop.overflow<=4,"Desktop horizontal overflow "+JSON.stringify(desktop));
     assert.ok(desktop.iframe>=desktop.screen*.92,"Desktop iframe width clipped "+JSON.stringify(desktop));
    }
    if(game==="colors"&&width===844){
     const layout=await page.evaluate(()=>{
      const r=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}};
      const button=document.getElementById("roomExitGame"),iframe=document.getElementById("roomGameFrame");
      const b=button.getBoundingClientRect();
      return {fullscreen:document.fullscreenElement?.tagName||null,
       childFullscreen:iframe.contentDocument?.fullscreenElement?.tagName||null,
       exit:r(button),frame:r(iframe),
       atExit:document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.tagName};
     });
     console.log("ROOM MOBILE LAYERS",JSON.stringify(layout));
    }
    await page.locator("#roomExitGame").click({timeout:9000});
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
  await page.locator("#roomFriendsPopup").waitFor({state:"visible",timeout:7000});
  assert.equal(await page.locator("#arenaSocialCreate input[type=radio]").count(),12);
  await page.locator('#arenaSocialCreate input[value="10"]').check();
  await page.locator("#arenaSocialCreate .arena-social-submit").click();
  const frame=page.frameLocator("#roomGameFrame");
  await frame.locator("#arenaPvPBoard .arena-pvp-waiting").waitFor({state:"visible",timeout:12000});
  assert.equal((await frame.locator("#roomLobbyCode").textContent()).trim(),"ABCD2345");
  await page.locator("#roomExitGame").click();
  await page.locator("#roomLobby").waitFor({state:"visible",timeout:9000});
  await page.locator('[data-play-mode="browse"]').click();
  await frame.locator("#arenaRoomHub").waitFor({state:"visible",timeout:12000});
  await frame.locator("#roomBrowserList").getByText("Chưa có bàn công khai").waitFor({state:"visible",timeout:7000});
  assert.match(page.url(),/game-tien-len\.html/,"Browsing must stay on the game page");
  await page.locator("#roomExitGame").click();
  await page.locator("#roomLobby").waitFor({state:"visible",timeout:9000});
  await page.locator('[data-play-mode="quick"]').click();
  await frame.locator("#arenaPvPBoard .arena-pvp-waiting").waitFor({state:"visible",timeout:10000});
  assert.equal(await frame.locator("#roomLobbyCode").textContent(),"ABCD2345");
  await page.locator("#roomExitGame").click();
  await page.locator("#roomLobby").waitFor({state:"visible",timeout:8000});
  assert.deepEqual(errors,[]);
  console.log("PASS Tiến Lên standalone online quick, friends, room browser and safe exit");
 }finally{await context.close();}
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
