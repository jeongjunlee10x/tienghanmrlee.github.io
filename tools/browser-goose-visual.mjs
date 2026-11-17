import {readFile,mkdir} from "node:fs/promises";
import {createServer} from "node:http";
import {resolve,extname} from "node:path";
import {chromium} from "playwright";
import assert from "node:assert/strict";
const root=resolve(".");
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".svg":"image/svg+xml"};
const server=createServer(async(req,res)=>{
 try{const rel=new URL(req.url,"http://localhost").pathname;
  const path=resolve(root,"."+rel);
  if(!path.startsWith(root+"/")){res.writeHead(403).end();return}
  const data=await readFile(path);res.writeHead(200,{"Content-Type":mime[extname(path)]||"application/octet-stream"}).end(data);
 }catch{res.writeHead(404).end("404")}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const origin="http://127.0.0.1:"+server.address().port;
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const folder=resolve("artifacts/goose-visual");await mkdir(folder,{recursive:true});
async function inspect(width,height,name){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errs=[];
 page.on("pageerror",e=>errs.push(String(e)));
 await page.route("https://pkxqsboyotlyoizzxizb.supabase.co/**",
  r=>r.fulfill({status:503,contentType:"application/json",body:'{"ok":false,"error":"Visual QA runs without live accounts"}'}));
 await page.goto(origin+"/game-goose-pvp.html",{waitUntil:"load"});
 await page.waitForTimeout(800);
 assert.equal(await page.locator(".gm-hero").isVisible(),true);
 assert.equal(await page.locator(".gm-map-preview").count(),3);
 assert.equal(await page.locator("#gmQuick").isVisible(),true);
 const bg=await page.locator(".gm-hero").evaluate(el=>getComputedStyle(el).backgroundImage);
 assert.ok(bg.includes("goose-space-hangar.svg"),"Cinematic background must be applied");
 const heroResource=await page.request.get(origin+"/assets/arena/goose-space-hangar.svg");
 assert.equal(heroResource.status(),200);
 assert.match(heroResource.headers()["content-type"],/image\/svg/);
 const cssResource=await page.request.get(origin+"/assets/arena/goose-pvp-skin.css");
 assert.equal(cssResource.status(),200);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(overflow<5,"Page overflows by "+overflow+"px");
 await page.screenshot({path:resolve(folder,name+"-lobby.png"),fullPage:true});
 assert.deepEqual(errs,[]);
 await page.close();
}
try{
 await inspect(1440,900,"desktop");
 await inspect(390,844,"mobile");
 console.log("GOOSE VISUAL QA PASS: cinematic hero, 3 map previews, room actions, CSS/SVG, 390px responsive");
}catch(e){console.error("GOOSE VISUAL QA FAILED",e);process.exitCode=1}
finally{await browser.close();await new Promise(ok=>server.close(ok))}
