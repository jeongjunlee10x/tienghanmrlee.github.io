/* Live negative-auth smoke: NEVER performs authenticated match, conversion or G transfer. */
import assert from "node:assert/strict";
const endpoint="https://pkxqsboyotlyoizzxizb.supabase.co/functions/v1/mrlee-arena-rooms";
const origin="https://jeongjunlee10x.github.io";
async function request(action,options={}){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),22000);
 try{
  const url=new URL(endpoint);url.searchParams.set("action",action);
  if(action==="list")url.searchParams.set("game","tienlen");
  const response=await fetch(url.href,{...options,headers:{Origin:origin,...options.headers},signal:ctrl.signal});
  let value={};try{value=await response.json();}catch{}
  return {response,value};
 }finally{clearTimeout(timer);}
}
const anon=await request("list");
assert.equal(anon.response.status,401,"Public room list requires verified Firebase identity");
const steal=await request("wallet");
assert.equal(steal.response.status,401,"G balance requires authenticated owner");
const convert=await request("convert",{method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({points:10})});
assert.equal(convert.response.status,401,"Anonymous point-to-G conversion is prohibited");
const start=await request("create",{method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({game:"tienlen",minGold:10,visibility:"public",nickname:"anonymous"})});
assert.equal(start.response.status,401,"Room creation requires Firebase ID token");
const pre=await fetch(endpoint+"?action=list",{method:"OPTIONS",headers:{
 Origin:origin,"Access-Control-Request-Method":"GET"}});
assert.equal(pre.status,204,"CORS preflight");
assert.equal(pre.headers.get("access-control-allow-origin"),origin);
const badOrigin=await fetch(endpoint+"?action=list",{headers:{Origin:"https://attacker.invalid"}});
assert.equal(badOrigin.status,403,"Untrusted web origin denied");
console.log("PASS Arena live Edge API: anonymous wallet/list/convert/create denied (401), CORS allowed origin, foreign origin blocked (403).");
