/* Firebase-authenticated Arena room API.
 * Tokens stay in Authorization header; no service_role key or hidden opponent cards in browser.
 */
import {firebaseConfig,isFirebaseConfigured} from "../../firebase-config.js";
const BASE="https://pkxqsboyotlyoizzxizb.supabase.co/functions/v1/mrlee-arena-rooms";
let sdk=null;
async function getAuthSDK(){
 if(sdk)return sdk;
 sdk=Promise.all([
  import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
  import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")
 ]).then(([app,auth])=>({app,auth})).catch(err=>{sdk=null;throw err;});
 return sdk;
}
async function credential(){
 if(!isFirebaseConfigured)throw new Error("Chưa có cấu hình đăng nhập Firebase.");
 const {app,auth}=await getAuthSDK();
 const instance=app.getApps().find(x=>x.name==="[DEFAULT]")||app.initializeApp(firebaseConfig);
 const user=auth.getAuth(instance).currentUser;
 if(!user||!user.emailVerified)throw new Error("Cần đăng nhập và xác minh email để tham gia PvP.");
 return "Bearer "+await user.getIdToken();
}
export async function roomRequest(action,params={},method="POST"){
 const headers={Authorization:await credential()};
 const url=new URL(BASE);url.searchParams.set("action",action);
 if(method==="GET")for(const [key,value] of Object.entries(params))url.searchParams.set(key,String(value));
 else headers["Content-Type"]="application/json";
 const response=await fetch(url.href,{
  method,headers,
  body:method==="GET"?undefined:JSON.stringify(params),
  cache:"no-store"
 });
 let data;
 try{data=await response.json();}catch{throw new Error("Máy chủ phòng trả dữ liệu không hợp lệ.");}
 if(!response.ok||!data.ok){
  const err=new Error(data.error||"Không thể thao tác với phòng.");
  err.status=response.status;throw err;
 }
 return data;
}
export function normalizeRoomCode(value){
 return String(value||"").trim().toUpperCase().replace(/[\s-]+/g,"");
}
export const GOLD_TIERS=Object.freeze([0,100,500,1000]);
export function affordableTier(gold){
 const amount=Math.max(0,Number(gold)||0);
 return GOLD_TIERS.filter(x=>x<=amount).at(-1)||0;
}
export function gameCapacity(game){return game==="chess"?2:4;}
export const GAME_LABELS=Object.freeze({chess:"Cờ vua",tienlen:"Tiến lên miền Nam",colors:"Bài Màu Đại Chiến"});
