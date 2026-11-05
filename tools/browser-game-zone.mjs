/* Chromium smoke test of four Game Zone modes; local-only, no real authentication. */
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import assert from "node:assert/strict";
import {chromium} from "playwright";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".csv":"text/csv; charset=utf-8",".mp3":"audio/mpeg",".png":"image/png",".svg":"image/svg+xml"};
const server=http.createServer(async(req,res)=>{
 try {
   const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
   const target=path.resolve(root,"."+pathname);
   if(!target.startsWith(root+path.sep))throw new Error("Forbidden");
   const body=await fs.readFile(target);
   res.writeHead(200,{"Content-Type":mime[path.extname(target)]||"application/octet-stream","Cache-Control":"no-store"});
   res.end(body);
 } catch(err) {
   res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});res.end("Not Found");
 }
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
let browser;
let passed=0;
try {
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const width of [1440,390])for(const theme of ["fresh","future"]) {
  const context=await browser.newContext({viewport:{width,height:width===390?844:900}});
  await context.addInitScript(value=>localStorage.setItem("MRLEE.THEME.V1",value),theme);
  const page=await context.newPage();
  // Test-only stub. This does not change production authentication code.
  await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:"document.documentElement.dataset.mrleeAuth='verified'; document.getElementById('mrlee-auth-hide')?.remove();"}));
  try {
   await page.goto(origin+"/tro-choi-tieng-han.html?cap=1&bai=1",{waitUntil:"domcontentloaded",timeout:20000});
   await page.waitForFunction(()=>document.getElementById("mzNotice")?.textContent?.startsWith("Đã tải"),null,{timeout:15000});
   assert.equal(await page.locator("#mzCards button").count(),10);
   assert.equal(await page.locator(".mz-hero").count(),0,"No oversized landing hero");
   assert.equal(await page.locator(".mz-compact-head #mzXP").count(),1);
   assert.equal(await page.locator("#mzVerifiedFold").evaluate(n=>n.open),false);
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.mrleeTheme),theme);
   await page.locator("#mzCards button").nth(0).click();
   await page.locator("#mzFullscreen").click();
   await page.waitForFunction(()=>{
     const a=document.getElementById("mzArena");
     return document.fullscreenElement===a||a?.classList.contains("mz-fullscreen-fallback");
   },null,{timeout:3000});
   await page.keyboard.press("Escape");
   await page.locator("#mzGame .mz-pair-grid").waitFor({timeout:7000});
   assert.ok(await page.locator("#mzGame .mz-col").first().locator("button").count()>=4);
   await page.locator("#mzGame .mz-col").first().locator("button").first().click();
   await page.locator("#mzGame .mz-col").last().locator("button").first().click();
   await page.locator("#mzBack").click();
   await page.locator("#mzCards button").nth(1).click();
   await page.locator("#mzGame .mz-token-list button").first().waitFor({timeout:7000});
   await page.locator("#mzGame .mz-token-list button").first().click();
   assert.ok(await page.locator("#mzGame .mz-chosen-tokens button").count()>=1);
   await page.locator("#mzBack").click();
   await page.locator("#mzCards button").nth(2).click();
   const audio=page.locator("#mzGame audio");
   await audio.waitFor({timeout:12000});
   const audioSrc=await audio.getAttribute("src");
   assert.match(audioSrc,/^MRLEE_AUDIO\/01_HOC_TIENG_HAN\/CAP_1\/BAI_01\/01_TU_VUNG\/.*\.mp3$/);
   const sound=await page.request.get(origin+"/"+audioSrc);
   assert.equal(sound.status(),200,"First game audio must exist on disk");
   assert.equal(await page.locator("#mzGame .mz-option").count(),4);
   await page.locator("#mzBack").click();
   await page.locator("#mzCards button").nth(3).click();
   const card=page.locator("#mzGame .mz-memory-card").first();
   await card.waitFor({timeout:7000});await card.click();
   assert.notEqual((await card.textContent()).trim(),"?");
   await page.locator("#mzBack").click();
   await page.locator("#mzCards button").nth(4).click();
   const bubbles=page.locator("#mzGame .mz-bubble");
   assert.equal(await bubbles.count(),5);
   await bubbles.first().click();
   await page.locator("#mzBack").click();
   await page.locator("#mzCards button").nth(5).click();
   const suspects=page.locator("#mzGame .mz-suspect");
   assert.equal(await suspects.count(),3);
   await suspects.first().click();
   await page.locator("#mzBack").click();
   await page.locator("#mzCards button").nth(6).click();
   await page.locator("#mzGame .mz-typing-input").fill("한국");
   await page.locator("#mzGame .mz-typing-form button").first().click();
   assert.ok(await page.locator("#mzGame .mz-typing-stats").count()===1);
   await page.locator("#mzBack").click();
   await page.locator("#mzLesson").selectOption("2");
   await page.waitForFunction(()=>document.getElementById("mzNotice")?.textContent?.startsWith("Đã tải"),null,{timeout:10000});
   await page.locator("#mzCards button").nth(7).click();
   await page.locator("#mzGame .mz-product").first().waitFor({timeout:6000});
   assert.ok(await page.locator("#mzGame .mz-product").count()>=3);
   await page.locator("#mzGame .mz-product").first().click();
   assert.match(await page.locator("#mzGame .mz-mart-basket").textContent(),/1 món/);
   await page.locator("#mzBack").click();
   await page.locator("#mzLesson").selectOption("1");
   await page.waitForFunction(()=>document.getElementById("mzNotice")?.textContent?.startsWith("Đã tải"),null,{timeout:10000});
   await page.locator("#mzCards button").nth(8).click();
   const topik=page.locator("#mzGame .mz-topik-question");
   await topik.waitFor({timeout:6000});
   assert.equal(await page.locator("#mzGame .mz-option").count(),4);
   await page.locator("#mzGame .mz-option").first().click();
   await page.locator("#mzBack").click();
   await page.locator("#mzLesson").selectOption("2");
   await page.waitForFunction(()=>document.getElementById("mzNotice")?.textContent?.startsWith("Đã tải"),null,{timeout:10000});
   await page.locator("#mzCards button").nth(9).click();
   await page.locator("#mzGame .mz-travel-sign").first().waitFor({timeout:6000});
   assert.equal(await page.locator("#mzGame .mz-travel-sign").count(),4);
   await page.locator("#mzGame .mz-travel-sign").first().click();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=2,"Horizontal overflow "+overflow+"px at width "+width);
   assert.equal((await page.locator("#mzXP").textContent()).trim(),"0","No unverified official XP may be awarded");
   console.log("PASS browser Game Zone: "+width+"px / "+theme+" / ten interactive modes + real MP3");
   passed++;
  } finally{await context.close();}
 }
 console.log("PASS Game Zone browser phase3: "+passed+"/4 viewport/theme combinations");
} finally {
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
