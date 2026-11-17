/* Browser smoke only: inject a server-generated snapshot into the page WITHOUT
 * exposing testing helpers in production code or contacting live Supabase. */
import assert from "node:assert/strict";
import {readFile,mkdir} from "node:fs/promises";
import {createServer} from "node:http";
import {resolve,extname} from "node:path";
import {chromium} from "playwright";
import {newMatch,view,getMap} from "../supabase/functions/mrlee-goose-pvp/engine.mjs";
const root=resolve(".");
const files={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,"http://localhost").pathname;
  const full=resolve(root,"."+path);
  if(!full.startsWith(root+"/")){res.writeHead(403).end();return}
  const body=await readFile(full);res.writeHead(200,{"Content-Type":files[extname(full)]||"application/octet-stream"}).end(body);
 }catch{res.writeHead(404).end("Not found")}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const base="http://127.0.0.1:"+server.address().port;
const client=await readFile(resolve("assets/arena/goose-pvp.js"),"utf8");
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const out=resolve("artifacts/goose-camera");await mkdir(out,{recursive:true});
const members=Array.from({length:6},(_,i)=>({uid:"qa-firebase-"+i,seat:i,name:"Ngỗng "+i,ready:true}));
const captureErrors=[];
async function setup(page){
 page.on("pageerror",e=>captureErrors.push(e.message));
 await page.route("**/assets/arena/goose-pvp.js*",r=>r.fulfill({
  contentType:"text/javascript; charset=utf-8",body:client+
   "\nwindow.__gmQa={load:accept,camera:()=>({...camera}),zoom:CAMERA_ZOOM};"
 }));
 await page.route("https://pkxqsboyotlyoizzxizb.supabase.co/functions/v1/mrlee-goose-pvp*",
  r=>r.fulfill({status:503,contentType:"application/json",body:'{"ok":false,"error":"QA offline"}'}));
 await page.goto(base+"/game-goose-pvp.html",{waitUntil:"load"});
 await page.waitForFunction(()=>Boolean(window.__gmQa));
}
function mock(mapIndex){
 let first=true;
 const rand=n=>{if(first){first=false;return mapIndex}return 0};
 const state=newMatch(members,Date.now(),rand);
 const player=members[0],s=view(state,members,player.uid,
  {code:"TEST2345",version:1,visibility:"private",locked:false});
 return {state,s};
}
try{
 const desktop=await browser.newPage({viewport:{width:1450,height:900},deviceScaleFactor:1});
 await setup(desktop);
 for(let index=0;index<3;index++){
  const {s}=mock(index);
  await desktop.evaluate(s=>window.__gmQa.load(s),s);
  await desktop.waitForTimeout(220);
  const camera=await desktop.evaluate(()=>window.__gmQa.camera());
  assert.equal(camera.mapId,s.mapId);
  assert.equal(s.world.width,2400);assert.equal(s.world.height,1500);
  assert.equal(await desktop.locator("#gmMapName").innerText().then(t=>t.includes(s.mapName)),true);
  assert.equal(await desktop.locator("#gmMatch").isVisible(),true);
  const zoom=await desktop.evaluate(()=>window.__gmQa.zoom);
  assert.ok(zoom>1.3&&zoom<2);
  await desktop.locator("#gmMatch").screenshot({path:resolve(out,s.mapId+"-desktop.png")});
 }
 const now=mock(1);now.state.phase="meeting";
 now.state.meetingDeadline=Date.now()+30000;
 const ballot=view(now.state,members,members[0].uid,
  {code:"TEST2345",version:2,visibility:"private",locked:false});
 await desktop.evaluate(b=>window.__gmQa.load(b),ballot);
 assert.equal(await desktop.locator("#gmBallot button").count(),members.length+1,
  "Every living player must remain vote-eligible regardless of camera visibility");
 await desktop.close();
 const mobile=await browser.newPage({
  viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true
 });
 await setup(mobile);
 const {s}=mock(2);
 await mobile.evaluate(s=>window.__gmQa.load(s),s);
 await mobile.waitForTimeout(260);
 assert.equal(await mobile.locator("#gmPad").isVisible(),true);
 const overflow=await mobile.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(overflow<=3,"Unexpected mobile overflow: "+overflow+"px");
 await mobile.screenshot({path:resolve(out,"garden-mobile.png"),fullPage:true});
 await mobile.close();
 assert.equal(captureErrors.length,0,"Browser JS errors: "+captureErrors.join(" | "));
 console.log("GOOSE CAMERA QA PASS: three maps, camera zoom, all-player vote, mobile");
}catch(err){console.error("GOOSE CAMERA QA FAILED",err);process.exitCode=1}
finally{await browser.close();await new Promise(ok=>server.close(ok))}
