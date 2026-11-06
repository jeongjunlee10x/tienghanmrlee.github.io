/* Daily wheel browser smoke: no live account, no production gold writes. */
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
  const file=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(!file.startsWith(root+path.sep))throw Error("Path traversal");
  res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream"});
  res.end(await readFile(file));
 }catch{res.writeHead(404);res.end("Not Found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
const stub=[
 'export const GOLD_TIERS=[5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000];',
 'export const GOLD_PER_POINT=10;',
 'export const GAME_LABELS={chess:"Cờ vua",tienlen:"Tiến lên",colors:"Bài Màu"};',
 'export const normalizeRoomCode=s=>String(s||"").trim().toUpperCase();',
 'export const gameCapacity=g=>g==="chess"?2:4;',
 'export const requiredGold=(g,n)=>(g==="chess"?1:g==="tienlen"?13:20)*n;',
 'export const affordableTier=(n,g)=>GOLD_TIERS.filter(x=>requiredGold(g,x)<=n).at(-1)||0;',
 'export function formatG(n){return n<1000?n+"G":Number((n/(n>=1e6?1e6:1e3)).toFixed(2))+(n>=1e6?"M":"K")+" G";}',
 'let gold=0,points=0,checked=false,spun=false;',
 'const wallet=()=>({gold,availablePoints:points});',
 'const daily=()=>({day:"2026-11-05",checkedIn:checked,spun,spinGold:spun?1500:0});',
 'export async function roomRequest(a){',
 ' if(a==="wallet")return {ok:true,wallet:wallet()};',
 ' if(a==="daily")return {ok:true,daily:daily(),wallet:wallet()};',
 ' if(a==="daily_checkin"){const already=checked;if(!checked){checked=true;gold+=1000;points+=1;}return {ok:true,reward:{already,awardedGold:already?0:1000,awardedPoints:already?0:1},daily:daily(),wallet:wallet()};}',
 ' if(a==="daily_spin"){const already=spun;if(!spun){spun=true;gold+=1500;}return {ok:true,reward:{already,awardedGold:already?0:1500},daily:daily(),wallet:wallet()};}',
 ' throw Error("Unmocked API "+a);',
 '}'
].join("\n");
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const [pageName,width,theme] of [
  ["mrlee-game-arena.html",1440,"fresh"],
  ["mrlee-game-arena.html",390,"future"],
  ["tro-choi-tieng-han.html",390,"fresh"]]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:880}});
  await context.addInitScript(value=>localStorage.setItem("MRLEE.THEME.V1",value),theme);
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route("**/auth-guard.js",route=>route.fulfill({status:200,contentType:"text/javascript",
   body:"document.documentElement.dataset.mrleeAuth='verified';document.getElementById('mrlee-auth-hide')?.remove();"}));
  await page.route("**/assets/arena/room-api.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:stub}));
  try{
   await page.goto(origin+"/"+pageName,{waitUntil:"domcontentloaded",timeout:20000});
   if(pageName==="mrlee-game-arena.html")await page.locator("#arenaDailyOpen").click();
   const dlg=page.locator("#arenaDailyDialog");await dlg.waitFor({state:"visible",timeout:9000});
   assert.equal(await page.locator("#arenaWheelLabels .arena-wheel-label").count(),10);
   const prizes=await page.locator("#arenaWheelLabels .arena-wheel-label").allTextContents();
   assert.equal(new Set(prizes).size,10);
   await page.locator("#arenaDailyCheckButton").click();
   await page.waitForFunction(()=>document.getElementById("arenaDailyBalance")?.textContent==="1K G");
   assert.equal(await page.locator("#arenaDailyCheckButton").isDisabled(),true);
   assert.equal((await page.locator("#arenaDailyPoints").textContent()).trim(),"1");
   await page.locator("#arenaDailySpinButton").click();
   await page.locator("#arenaWheelResult").waitFor({state:"visible",timeout:9000});
   assert.match((await page.locator("#arenaWheelResult").textContent())||"",/1.5K G/);
   assert.equal((await page.locator("#arenaDailyBalance").textContent()).trim(),"2.5K G");
   assert.equal(await page.locator("#arenaDailySpinButton").isDisabled(),true);
   await page.locator("#arenaDailyClose").click();
   const openId=pageName==="mrlee-game-arena.html"?"arenaDailyOpen":"mzDailyOpen";
   await page.locator("#"+openId).click();
   await dlg.waitFor({state:"visible"});
   assert.equal(await page.locator("#arenaDailyCheckButton").isDisabled(),true);
   assert.equal(await page.locator("#arenaDailySpinButton").isDisabled(),true);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=3,"Horizontal overflow "+overflow+" at "+width);
   const relatedErrors=errors.filter(e=>e.includes("daily-rewards")||e.includes("room-api"));
   assert.deepEqual(relatedErrors,[]);
   console.log("PASS daily wheel "+pageName+" "+width+"px "+theme);
  }finally{await context.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
