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
  const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const target=path.resolve(root,"."+pathname);
  if(!target.startsWith(root+path.sep))throw Error("Path traversal");
  const buf=await readFile(target);
  res.writeHead(200,{"Content-Type":mime[path.extname(target)]||"application/octet-stream"});res.end(buf);
 }catch{res.writeHead(404);res.end("Not Found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
let browser;let count=0;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const width of [1400,390])for(const theme of ["fresh","future"]){
  const ctx=await browser.newContext({viewport:{width,height:width===390?844:880}});
  await ctx.addInitScript(mode=>localStorage.setItem("MRLEE.THEME.V1",mode),theme);
  const page=await ctx.newPage();
  const errs=[];page.on("pageerror",e=>errs.push(e.message));
  await page.route("**/auth-guard.js",route=>route.fulfill({
   status:200,contentType:"text/javascript",
   body:"document.documentElement.dataset.mrleeAuth='verified';document.querySelector('#mrlee-auth-hide')?.remove();"
  }));
  try{
   await page.goto(origin+"/mrlee-game-arena.html",{waitUntil:"domcontentloaded",timeout:20000});
   await page.locator("#arenaRefColorsAccess").waitFor();
   assert.equal(await page.locator(".arena-game-card").count(),6);
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.mrleeTheme),theme);
   await page.evaluate(()=>document.querySelector('#arenaCatalog button[data-game="colors"]')?.click());
   await page.locator(".arena-hand-card").first().waitFor({timeout:6000});
   assert.equal(await page.locator(".arena-hand-card").count(),7);
   assert.equal(await page.locator(".arena-opponent").count(),3);
   assert.equal((await page.locator("#arenaTickets").textContent()).trim(),"∞");
   await page.locator("#arenaRules").click();
   assert.equal(await page.locator("#arenaRulesDialog").evaluate(d=>d.open),true);
   await page.locator("#arenaRulesClose").click();
   const legal=page.locator(".arena-hand-card.playable");
   if(await legal.count()){
    await legal.first().click();
    if(await page.locator("#arenaColorPicker").isVisible())
     await page.locator(".arena-choose").first().click();
   }else{
    await page.locator("#arenaDraw").click();
    if(await page.locator("#arenaPass").isVisible())
      await page.locator("#arenaPass").click();
   }
   assert.ok(await page.locator("#arenaEventLog p").count()>0);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert.ok(overflow<=2,"Overflow "+overflow+"px @ "+width);
   assert.deepEqual(errs,[]);
   console.log("PASS Arena "+width+"px "+theme);
   count++;
  }finally{await ctx.close();}
 }
 console.log("PASS Arena browser "+count+"/4 configurations.");
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
