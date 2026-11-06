/* Real Chromium regression: active seat avatar timers and readable hand,
 * no Firebase sign-in, live rooms, Supabase credentials or official G.
 */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".js":"text/javascript;charset=utf-8",".css":"text/css;charset=utf-8"};
const html=`<!doctype html><html class="arena-reference-v1 arena-embedded"><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/assets/arena/rooms.css">
<link rel="stylesheet" href="/assets/arena/card-turn-v2.css">
<style>body{margin:0;background:#091c2d;color:white;font:14px system-ui}
#arenaPvPBoard{padding:5px}#roomGameCanvas{max-width:1200px;margin:auto}</style>
</head><body><section id="arenaPvPBoard"><div id="roomGameCanvas"></div></section></body></html>`;
const server=createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,"http://localhost").pathname;
  if(pathname==="/_arena_card_turns"){
   res.writeHead(200,{"Content-Type":"text/html"});res.end(html);return;
  }
  const file=path.resolve(root,"."+decodeURIComponent(pathname));
  if(!file.startsWith(root+path.sep))throw Error("Traversal");
  const bytes=await readFile(file);
  res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream"});
  res.end(bytes);
 }catch{res.writeHead(404);res.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850},hasTouch:width===390,
   isMobile:width===390,reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",err=>errors.push(err.message));
  await page.goto("http://127.0.0.1:"+server.address().port+"/_arena_card_turns");
  await page.evaluate(async()=>{
   const {mountOnlineCanvas}=await import("/assets/arena/rooms-play.js");
   const TL=await import("/assets/arena/tienlen-engine.js");
   const COLORS=await import("/assets/arena/color-engine.js");
   const canvas=mountOnlineCanvas(document.getElementById("roomGameCanvas"),async()=>{});
   const players=Array.from({length:4},(_,seat)=>({seat,name:["Bạn","Mai","Lan","Ngọc"][seat]}));
   const base={code:"TEST2345",version:1,seat:0,minGold:10,status:"playing",
    capacity:4,serverTime:new Date().toISOString(),players};
   const t=TL.start(()=>.5);
   window.TURN_TEST={
    canvas,
    tl:{...base,game:"tienlen",gameState:{
     turn:0,winner:null,first:false,last:null,played:[],
     myHand:t.hands[0],counts:t.hands.map(x=>x.length),
     history:["Bắt đầu ván"],turnDeadline:new Date(Date.now()+20000).toISOString()
    }},
    colors:{...base,game:"colors",gameState:(()=>{
     const g=COLORS.newGame(()=>.5);
     return {turn:0,winner:null,myHand:g.hands[0],counts:g.hands.map(x=>x.length),
      top:COLORS.topCard(g),activeColor:g.activeColor,direction:1,
      drawnCardId:null,events:["Bắt đầu ván"],turnDeadline:new Date(Date.now()+20000).toISOString()};
    })()}
   };
   canvas.render(window.TURN_TEST.tl);
  });
  const ownClock=page.locator('.arena-pvp-me.active .arena-card-turn-clock[data-clock-seat="0"]');
  assert.equal(await ownClock.count(),1,"Your turn is counted inside your own avatar");
  assert.equal(await page.locator(".arena-card-turn-popup").count(),1,
   "Turn actions appear as popup, not persistent buttons");
  assert.equal(await page.locator(".arena-pvp-hand>button").count(),13,
   "All 13 cards remain visible in own hand");
  const cardWidth=await page.locator(".arena-pvp-hand .tl-real-card").first()
   .evaluate(el=>el.getBoundingClientRect().width);
  assert.ok(cardWidth>=35,"Readable card face "+cardWidth+"px at "+width);
  const aligned=await ownClock.evaluate(el=>{
   const clock=el.getBoundingClientRect(),avatar=el.parentElement.getBoundingClientRect();
   return Math.abs((clock.left+clock.width/2)-(avatar.left+avatar.width/2))<=3 &&
    Math.abs((clock.top+clock.height/2)-(avatar.top+avatar.height/2))<=3;
  });
  assert.equal(aligned,true,"Clock centered in active avatar");
  await page.evaluate(()=>{
   const r=window.TURN_TEST.tl;
   r.version=2;r.gameState.turn=1;
   window.TURN_TEST.canvas.render(r);
  });
  assert.equal(await page.locator(".arena-card-turn-popup").count(),0,
   "Play/pass popup closes immediately when someone else moves");
  assert.equal(await page.locator('.arena-pvp-seat.active[data-seat="1"] .arena-card-turn-clock[data-clock-seat="1"]').count(),1,
   "Clock moves with the active opponent's avatar");
  await page.evaluate(()=>{
   const r=window.TURN_TEST.colors;r.version=3;r.gameState.turn=0;
   window.TURN_TEST.canvas.render(r);
  });
  assert.equal(await page.locator(".arena-card-turn-popup").count(),1,
   "Color card actions appear only when it is your turn");
  assert.equal(await page.locator(".arena-pvp-hand>button").count(),7,
   "Color game shows seven real cards in own hand");
  await page.evaluate(()=>{
   const r=window.TURN_TEST.colors;r.version=4;r.gameState.turn=2;
   window.TURN_TEST.canvas.render(r);
  });
  assert.equal(await page.locator(".arena-card-turn-popup").count(),0);
  assert.equal(await page.locator('.arena-pvp-seat.active[data-seat="2"] .arena-card-turn-clock').count(),1);
  assert.deepEqual(errors,[],"Browser must not throw while switching seats: "+errors.join(" | "));
  console.log("PASS server-style card avatars and popup "+width+"px");
  await page.close();
 }
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
