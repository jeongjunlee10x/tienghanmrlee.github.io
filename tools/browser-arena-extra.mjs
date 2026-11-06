import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
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
  const ctx=await browser.newContext({viewport:{width,height:width===390?844:900}});
  await ctx.addInitScript(value=>localStorage.setItem("MRLEE.THEME.V1",value),theme);
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
   body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"}));
  try{
   await page.goto(origin+"/mrlee-game-arena.html",{waitUntil:"domcontentloaded",timeout:20000});
   assert.equal(await page.locator(".arena-game-card.playable").count(),6);
   await page.locator('.arena-ref-play[data-ref-play="ludo"]').click();
   await page.locator("#ludoBoard .ludo-cell").first().waitFor();
   assert.equal(await page.locator("#ludoBoard .ludo-cell").count(),196);
   assert.equal(await page.locator("#ludoBoard .ludo-pawn").count(),16);
   await page.locator("#ludoRoll").click();
   await page.locator("#ludoExit").click();
   await page.locator('.arena-ref-play[data-ref-play="xiangqi"]').click();
   assert.equal(await page.locator("#xqBoard .xq-square").count(),90);
   await page.locator('#xqBoard [data-index="54"]').click();
   await page.locator('#xqBoard [data-index="45"]').click();
   assert.ok(await page.locator("#xqMoveLog p").count()>=1);
   await page.locator("#xqExit").click();
   await page.locator('.arena-ref-play[data-ref-play="estate"]').click();
   assert.equal(await page.locator("#estateBoard .estate-tile").count(),24);
   await page.locator("#estateRoll").click();
   assert.equal((await page.locator("#arenaTickets").textContent()).trim(),"0");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=2,"Overflow "+overflow+" at "+width);
   assert.deepEqual(errors,[],"Browser runtime errors: "+errors.join("; "));
   console.log("PASS remaining Arena games "+width+"px "+theme);
  }finally{await ctx.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
