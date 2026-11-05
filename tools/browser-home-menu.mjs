/* MR LEE homepage hamburger regression: no giant white page-pushing menu. */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png",".svg":"image/svg+xml",".webp":"image/webp",".json":"application/json"};
const server=createServer(async(req,res)=>{
 try{
  const filename=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(!filename.startsWith(root+path.sep))throw Error("path not allowed");
  const content=await readFile(filename);
  res.writeHead(200,{"Content-Type":mime[path.extname(filename)]||"application/octet-stream","Cache-Control":"no-store"});
  res.end(content);
 }catch{res.writeHead(404);res.end("Not Found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const width of [1500,390])for(const theme of ["fresh","future"]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:"reduce"});
  await context.addInitScript(theme=>{
   sessionStorage.setItem("MRLEE.THEME.ENTRY.V1",theme);
   localStorage.setItem("MRLEE.THEME.V1",theme);
  },theme);
  const page=await context.newPage();
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
  try{
   await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:30000});
   const button=page.locator("#menuToggle");
   const menu=page.locator("#mobileNav");
   await button.waitFor({state:"visible",timeout:15000});
   assert.equal(await menu.isVisible(),false,"Menu must be closed initially");
   assert.equal(await page.locator("#mrleeNewHome .mr27-tile").count(),8);
   const yBefore=await page.locator("#mrleeNewHome").evaluate(el=>el.getBoundingClientRect().top);
   await button.click();
   assert.equal(await button.getAttribute("aria-expanded"),"true");
   await menu.waitFor({state:"visible",timeout:3000});
   const measured=await page.evaluate(()=>{
    const panel=document.getElementById("mobileNav");
    const box=panel.getBoundingClientRect();
    const header=document.querySelector(".site-header").getBoundingClientRect();
    const text=panel.querySelector('a[href="index.html"]');
    return {panel:{x:box.x,y:box.y,width:box.width,height:box.height,right:box.right},
     headerBottom:header.bottom,display:getComputedStyle(panel).display,
     position:getComputedStyle(panel).position,
     bg:getComputedStyle(panel).backgroundColor,
     color:getComputedStyle(text).color,
     anchorBackground:getComputedStyle(text).backgroundColor,
     bodyScrollWidth:document.documentElement.scrollWidth};
   });
   assert.equal(measured.position,"absolute","Dropdown must float, not stretch document");
   assert.ok(measured.panel.width<=400,"Dropdown width "+measured.panel.width);
   assert.ok(measured.panel.height<=605,"Dropdown height "+measured.panel.height);
   assert.ok(measured.panel.y>=measured.headerBottom-3,"Dropdown must be beneath header");
   assert.ok(measured.panel.x>=0&&measured.panel.right<=width+1,"Menu must fit viewport");
   assert.ok(measured.bodyScrollWidth<=width+4,"No horizontal overflow");
   assert.equal(await page.locator('#mobileNav a[href="mrlee-game-arena.html"]').isVisible(),true);
   assert.notEqual(measured.color,measured.anchorBackground,"Menu text must differ from background");
   const yAfter=await page.locator("#mrleeNewHome").evaluate(el=>el.getBoundingClientRect().top);
   assert.ok(Math.abs(yAfter-yBefore)<=3,"Menu must not push homepage: "+(yAfter-yBefore));
   await page.keyboard.press("Escape");
   assert.equal(await menu.isVisible(),false,"Escape must close menu");
   assert.equal(await button.getAttribute("aria-expanded"),"false");
   assert.equal(await button.textContent(),"☰");
   assert.equal(await button.evaluate(el=>el===document.activeElement),true);
   await button.click();await page.locator(".mr27-overline").click();
   assert.equal(await menu.isVisible(),false,"Outside click must close dropdown");
   console.log("PASS home hamburger "+width+"px "+theme+", "+Math.round(measured.panel.width)+"x"+Math.round(measured.panel.height));
  }finally{await context.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
