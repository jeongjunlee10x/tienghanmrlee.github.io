/* Chromium suite: Game Arena selection, room codes, public lobbies, wallet G and fullscreen. */
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
  const p=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const target=path.resolve(root,"."+p);
  if(!target.startsWith(root+path.sep))throw Error("outside root");
  const data=await readFile(target);
  res.writeHead(200,{"Content-Type":mime[path.extname(target)]||"application/octet-stream"});res.end(data);
 }catch{res.writeHead(404);res.end("Not Found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
const mock=String.raw;
const fakeApi=