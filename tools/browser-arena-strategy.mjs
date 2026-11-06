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
  const data=await readFile(target);
  res.writeHead(200,{"Content-Type":mime[path.extname(target)]||"application/octet-stream"});res.end(data);
 }catch{res.writeHead(404);res.end("Not Found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const width of [1440,390])for(const theme of ["fresh","future"]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:920}});
  await context.addInitScript(value=>localStorage.setItem("MRLEE.THEME.V1",value),theme);
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route("**/auth-guard.js",route=>route.fulfill({
   status:200,contentType:"text/javascript",
   body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"
  }));
  try{
   await page.goto(origin+"/mrlee-game-arena.html",{waitUntil:"domcontentloaded",timeout:20000});
   assert.equal(await page.locator(".arena-game-card.playable").count(),6);
   await page.evaluate(()=>document.querySelector('#arenaCatalog button[data-game="chess"]')?.click());
   await page.locator("#chessBoard .chess-square").first().waitFor({timeout:6000});
   assert.equal(await page.locator("#chessBoard .chess-square").count(),64);
   assert.equal((await page.locator("#arenaTickets").textContent()).trim(),"2");
   await page.locator('#chessBoard .chess-square[data-square="e2"]').click();
   await page.locator('#chessBoard .chess-square[data-square="e4"]').click();
   assert.match((await page.locator('#chessBoard .chess-square[data-square="e4"]').getAttribute("aria-label"))||"",/P/);
   await page.locator("#chessExit").click();
   await page.evaluate(()=>document.querySelector('#arenaCatalog button[data-game="tienlen"]')?.click());
   await page.locator("#tlHand .tl-hand-card").first().waitFor({timeout:6000});
   assert.equal(await page.locator("#tlHand .tl-hand-card").count(),13);
   assert.equal(await page.locator("#tlOpponents .tl-opponent").count(),3);
   assert.equal((await page.locator("#arenaTickets").textContent()).trim(),"1");
   const widthOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert.ok(widthOverflow<=2,"Horizontal overflow at "+width+": "+widthOverflow);
   await page.locator("#tlExit").click();
   assert.equal(await page.locator('[data-game="colors"]').count(),1);
   assert.deepEqual(errors,[],"Browser runtime errors: "+errors.join("; "));
   console.log("PASS strategy browser "+width+"px "+theme+" — chess e2-e4, Tien Len 13 cards, wallet and lobby.");
  }finally{await context.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
