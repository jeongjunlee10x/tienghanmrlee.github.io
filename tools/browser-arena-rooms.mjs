/* Chromium Arena matchmaking: 12 rates, wallet, random room code, ready flow and fullscreen. */
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
  const target=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(!target.startsWith(root+path.sep))throw Error("Unsafe path");
  const content=await readFile(target);
  res.writeHead(200,{"Content-Type":mime[path.extname(target)]||"application/octet-stream"});res.end(content);
 }catch{res.writeHead(404);res.end("Not Found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
const mockApi="export const GOLD_TIERS=[5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000];\nexport const GOLD_PER_POINT=10;\nexport const GAME_LABELS={chess:'Cờ vua',tienlen:'Tiến lên miền Nam',colors:'Bài Màu Đại Chiến'};\nexport const gameCapacity=g=>g==='chess'?2:4;\nexport const requiredGold=(g,n)=>(g==='chess'?1:g==='tienlen'?13:20)*n;\nexport const affordableTier=(gold,game)=>GOLD_TIERS.filter(x=>requiredGold(game,x)<=gold).at(-1)||0;\nexport const normalizeRoomCode=s=>String(s||'').trim().toUpperCase().replace(/[\\s-]/g,'');\nexport function formatG(n){return n<1000?n+'G':Number((n/(n>=1e6?1e6:1e3)).toFixed(2))+(n>=1e6?'M':'K')+' G';}\nlet gold=150000,points=40,room=null;\nconst newRoom=(p)=>({code:'ABCDEFGH',game:p.game||'tienlen',visibility:p.visibility||'private',minGold:p.minGold||5,requiredGold:requiredGold(p.game||'tienlen',p.minGold||5),status:'waiting',seat:0,version:1,capacity:gameCapacity(p.game||'tienlen'),players:[{seat:0,name:p.nickname||'Học viên',ready:false}]});\nexport async function roomRequest(action,p={},method='POST'){\nif(action==='wallet')return {ok:true,wallet:{gold,availablePoints:points,convertedPoints:4,earnedPoints:44}};\nif(action==='convert'){if(p.points>points)throw Error('insufficient');gold+=p.points*10;points-=p.points;return {ok:true};}\nif(action==='list')return {ok:true,rooms:[{code:'EFGH2345',game:p.game,minGold:5,count:1,capacity:gameCapacity(p.game),host:'Min-ji',alreadyIn:false}]};\nif(action==='create'||action==='quick'){room=newRoom(p);return {ok:true,room};}\nif(action==='join'){room=newRoom({...p,game:room?.game||'tienlen'});return {ok:true,room};}\nif(action==='state')return {ok:true,room};\nif(action==='ready'){room.players[0].ready=p.ready;room.version++;return {ok:true,room};}\nif(action==='leave'){room=null;return {ok:true,left:true};}\nthrow Error('Unmocked '+action);}";
let browser,passed=0;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const width of [1440,390])for(const theme of ["fresh","future"]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:940}});
  await context.addInitScript(value=>localStorage.setItem("MRLEE.THEME.V1",value),theme);
  const page=await context.newPage(),errs=[];page.on("pageerror",e=>errs.push(e.message));
  await page.route("**/auth-guard.js",r=>r.fulfill({status:200,contentType:"text/javascript",
   body:"document.documentElement.dataset.mrleeAuth='verified';document.getElementById('mrlee-auth-hide')?.remove();"}));
  await page.route("**/assets/arena/room-api.js",r=>r.fulfill({status:200,contentType:"text/javascript",body:mockApi}));
  try{
   await page.goto(origin+"/mrlee-game-arena.html",{waitUntil:"domcontentloaded",timeout:20000});
   assert.equal(await page.locator(".arena-game-card.playable").count(),6);
   // Master lobby hides advanced room actions; validate this preserved engine by direct click.
   await page.evaluate(()=>document.querySelector('[data-room-game="tienlen"][data-room-action="friends"]')?.click());
   await page.locator("#roomMinGold option").first().waitFor({state:"attached"});
   assert.equal(await page.locator("#roomMinGold option").count(),12);
   await page.waitForFunction(()=>document.getElementById("roomAvailableGold")?.textContent==="150K G");
   assert.equal((await page.locator("#roomVerifiedPoints").textContent()).trim(),"40");
   await page.locator("#roomExchangePoints").fill("2");
   page.once("dialog",d=>d.accept());
   await page.locator("#roomExchange").click();
   await page.waitForFunction(()=>document.getElementById("roomVerifiedPoints")?.textContent==="38");
   await page.locator("#roomMinGold").selectOption("10");
   await page.locator("#roomCreate").click();
   await page.locator("#arenaPvPBoard .arena-pvp-waiting").waitFor({state:"visible"});
   assert.equal((await page.locator("#roomLobbyCode").textContent()).trim(),"ABCDEFGH");
   await page.locator("#arenaPvPBoard .arena-pvp-wait-actions button").filter({hasText:"Sẵn sàng"}).click();
   await page.waitForFunction(()=>document.getElementById("roomToggleReady")?.textContent==="Bỏ sẵn sàng");
   await page.locator("#roomBoardExit").click();
   // Game-page integration is checked separately by the six dedicated-page QA.
   await page.evaluate(()=>document.querySelector('[data-room-game="chess"][data-room-action="browse"]')?.click());
   await page.locator("#roomBrowserList .arena-room-list-row").first().waitFor();
   assert.match(await page.locator("#roomBrowserList").textContent(),/EFGH2345/);
   await page.locator("#roomHubExit").click();
   await page.evaluate(()=>document.querySelector('#arenaCatalog button[data-game="chess"]')?.click());
   await page.locator("#chessBoard").waitFor({state:"visible"});
   await page.locator('[data-fullscreen-target="arenaChess"]').click();
   await page.waitForFunction(()=>{
     const x=document.getElementById("arenaChess");
     return x?.classList.contains("arena-fallback-fullscreen")||document.fullscreenElement===x;
   },null,{timeout:3000});
   await page.keyboard.press("Escape");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=3,"Horizontal overflow "+overflow);
   assert.deepEqual(errs,[]);
   passed++;
   console.log("PASS Arena room "+width+"px "+theme+": wallet + 12 tiers + create + ready + browse + fullscreen");
  }finally{await context.close();}
 }
 console.log("PASS Arena PvP room browser "+passed+"/4.");
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
