/* Real Chromium QA for cinematic Tiến Lên table, 4 seats, 52-card deal, card-to-center movement. */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png",".svg":"image/svg+xml"};
const server=createServer(async(req,res)=>{
 try {
  const target=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(!target.startsWith(root+path.sep))throw Error("Path escape");
  const buffer=await readFile(target);
  res.writeHead(200,{"Content-Type":mime[path.extname(target)]||"application/octet-stream"});res.end(buffer);
 }catch{res.writeHead(404);res.end("Not Found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
let browser,passed=0;
try {
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const width of [1440,390])for(const theme of ["fresh","future"]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900}});
  await context.addInitScript(theme=>localStorage.setItem("MRLEE.THEME.V1",theme),theme);
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route("**/auth-guard.js",route=>route.fulfill({
   status:200,contentType:"text/javascript",
   body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"
  }));
  try{
   await page.goto(origin+"/mrlee-game-arena.html",{waitUntil:"domcontentloaded",timeout:20000});
   await page.locator('.arena-ref-play[data-ref-play="tienlen"]').click();
   await page.locator("#tlHand .tl-hand-card").first().waitFor({timeout:7000});
   assert.equal(await page.locator("#tlHand .tl-hand-card").count(),13);
   assert.equal(await page.locator("#tlOpponents .tl-opponent").count(),3);
   for(const seat of ["top","left","right"]){
    const location=page.locator('#tlOpponents .tl-opponent[data-seat="'+seat+'"]');
    assert.equal(await location.count(),1);
    assert.ok((await location.locator(".tl-back-fan .tl-card-back").count())>=3,"Missing concealed stack: "+seat);
    assert.match(await location.textContent(),/vàng demo/);
    assert.match(await location.textContent(),/lá/);
    assert.equal(await location.locator(".tl-real-card").count(),0,"Opponent hand faces must stay private.");
   }
   assert.equal(await page.locator("#tlBoard .tl-player-hud").count(),1);
   assert.match(await page.locator("#tlPlayerGold").textContent(),/vàng demo/);
   assert.equal(await page.locator("#tlBoard").getAttribute("data-deal-count"),"52");
   await page.waitForFunction(()=>{
    const board=document.getElementById("tlBoard");
    return board&&board.dataset.fxPhase==="ready"&&!board.classList.contains("tl-is-dealing");
   },null,{timeout:17000});
   assert.equal(await page.locator("#tlHand .tl-real-card").count(),13);
   await page.waitForFunction(()=>{
     const board=document.getElementById("tlBoard");
     return Number(board?.dataset.fxCount)>0 || !document.getElementById("tlSuggest").disabled;
   },null,{timeout:10000});
   if(await page.locator("#tlSuggest").isEnabled()){
    await page.locator("#tlSuggest").click();
    await page.locator("#tlPlay").click();
   }
   await page.waitForFunction(()=>Number(document.getElementById("tlBoard")?.dataset.fxCount)>0,null,{timeout:12000});
   await page.waitForFunction(()=>document.getElementById("tlBoard")?.dataset.fxPhase==="ready",null,{timeout:12000});
   assert.ok(await page.locator("#tlPile .tl-real-card").count()>0,
     "Played card(s) must visually occupy the center after flying there.");
   assert.match(await page.locator("#tlBoard").getAttribute("data-last-move-seat"),/bottom|top|left|right/);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert.ok(overflow<=2,"Unexpected horizontal overflow: "+overflow+" at "+width+"px");
   await page.locator("#tlExit").click();
   assert.equal(await page.locator("#tlBoard").getAttribute("data-fx-phase"),"idle");
   assert.deepEqual(errors,[],"Browser JS errors: "+errors.join("; "));
   passed++;
   console.log("PASS Tiến Lên realistic table "+width+"px / "+theme+": 4 seats, 52-deal, backs, player HUD, flying play.");
  }finally{await context.close();}
 }
 console.log("PASS Tiến Lên cinematic browser: "+passed+"/4.");
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
