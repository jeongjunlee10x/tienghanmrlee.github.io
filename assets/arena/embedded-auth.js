/* MR LEE Game Arena: same-origin embedded authentication bridge.
 * A standalone game page is already gated by auth-guard.js. Do not force a
 * second Firebase reload/token refresh inside its same-origin iframe.
 * All real PvP wallet and move requests still require verified JWT at server.
 * A standalone (top-level) Arena must complete the full original guard.
 */
const params=new URL(location.href).searchParams;
const slugs={
 chess:"game-co-vua",xiangqi:"game-co-tuong",tienlen:"game-tien-len",
 colors:"game-bai-mau",ludo:"game-co-ca-ngua",estate:"game-dia-oc"
};
let trustedParent=false;
if(params.get("embed")==="1"&&window.parent!==window){
 try{
  const ancestor=window.parent;
  const parentPath=ancestor.location.pathname.split("/").at(-1)?.replace(/\.html$/i,"");
  trustedParent=ancestor.location.origin===location.origin &&
   slugs[params.get("game")]===parentPath &&
   ancestor.document.documentElement.dataset.mrleeAuth==="verified";
 }catch{trustedParent=false;}
}
if(trustedParent){
 document.documentElement.dataset.mrleeAuth="verified";
 document.getElementById("mrlee-auth-hide")?.remove();
}else{
 // Never accept embed=1 alone as an authentication bypass.
 await import("../../auth-guard.js");
}
