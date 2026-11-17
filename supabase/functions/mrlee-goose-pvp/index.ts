/* Goose Mystery — Firebase-verified and Postgres-CAS authoritative multiplayer.
   The browser never chooses roles, locations, victims, votes or score outcomes. */
import {createRemoteJWKSet,jwtVerify} from "npm:jose@6.1.0";
import {createClient} from "npm:@supabase/supabase-js@2.119.0";
import {MIN_PLAYERS,MAX_PLAYERS,ruleError,newMatch,advance,apply,view,winnerCheck,randInt}
 from "./engine.mjs";

const PROJECT="tieng-han-mr-lee";
const JWKS=createRemoteJWKSet(
 new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
 {timeoutDuration:5000,cooldownDuration:30000,cacheMaxAge:3600000}
);
const ORIGINS=new Set(["https://mrlee-b6a.pages.dev","https://jeongjunlee10x.github.io"]);
const ALPHABET="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const NAME_LIMIT=24;
const allowedActions=new Set(["status","list","create","quick","join","ready","start","lock","leave","rematch",
 "move","task","answer","kill","report","emergency","vote","chat"]);
const jsonHeaders=req=>{
 const origin=req.headers.get("origin")||"";
 return {"Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://mrlee-b6a.pages.dev",
  "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":"authorization,content-type",
  "Access-Control-Max-Age":"600","Cache-Control":"no-store","Vary":"Origin",
  "Content-Type":"application/json; charset=utf-8"};
};
const response=(req,status,data)=>new Response(JSON.stringify(data),{status,headers:jsonHeaders(req)});
function fail(message,status=400){throw ruleError(message,status)}
function db(){
 const url=Deno.env.get("SUPABASE_URL")||"";
 const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key)
  fail("Máy chủ Supabase chưa cấu hình.",503);
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
async function userId(req){
 const header=req.headers.get("authorization")||"";
 if(!header.startsWith("Bearer ")||header.length>6507)fail("Cần đăng nhập để chơi PvP.",401);
 try{
  const {payload}=await jwtVerify(header.slice(7),JWKS,{
   issuer:"https://securetoken.google.com/"+PROJECT,
   audience:PROJECT,algorithms:["RS256"],clockTolerance:30
  });
  if(typeof payload.sub!=="string"||payload.sub.length<8||payload.sub.length>128||
     payload.email_verified!==true||
     (payload.firebase&&payload.firebase.sign_in_provider==="anonymous"))
   throw new Error("unverified");
  return payload.sub;
 }catch{fail("Tài khoản Firebase chưa xác minh. Vui lòng đăng nhập lại.",401)}
}
function nickname(value){
 const s=typeof value==="string"?value.normalize("NFKC").replace(/[<>\x00-\x1f\x7f]/g,"").trim().slice(0,NAME_LIMIT):"";
 return s.length>=2?s:"Học viên";
}
function codeOf(value){
 const s=String(value??"").toUpperCase().replace(/[\s-]/g,"").trim();
 if(!/^[A-Z2-9]{8}$/.test(s))fail("Mã phòng gồm 8 ký tự.",400);
 return s;
}
function makeCode(){return Array.from({length:8},()=>ALPHABET[randInt(ALPHABET.length)]).join("")}
function member(room,uid){
 const m=room.members.find(p=>p.uid===uid);
 if(!m)fail("Bạn không ở trong phòng này.",403);
 return m;
}
function host(room,uid){
 if(room.members.find(m=>!room.state?.players?.[m.uid]?.left)?.uid!==uid)
  fail("Chỉ chủ phòng được thao tác.",403);
}
async function load(database,code){
 const {data,error}=await database.from("mrlee_goose_rooms").select("*").eq("code",code).maybeSingle();
 if(error)fail("Không đọc được dữ liệu phòng. Kiểm tra migration Goose.",503);
 if(!data||new Date(data.expires_at).getTime()<=Date.now()||data.status==="closed")
  fail("Phòng không tồn tại hoặc đã hết hạn.",404);
 return data;
}
async function cas(database,room,next){
 const {data,error}=await database.rpc("mrlee_goose_cas",{
  p_code:room.code,p_expected_version:room.version,
  p_members:next.members,p_state:next.state,
  p_status:next.status,p_locked:next.locked
 });
 if(error){
  if(error.code==="P0001")fail("ROOM_CHANGED",409);
  fail("Không lưu được trạng thái trận. Kiểm tra migration Goose.",503);
 }
 return data;
}
async function change(database,code,mutator){
 for(let i=0;i<6;i++){
  const row=await load(database,code);
  const state=structuredClone(row.state),members=structuredClone(row.members);
  const next={members,state,status:row.status,locked:row.locked};
  let changed=false;
  if(["playing","meeting","reveal"].includes(next.status)&&advance(state,Date.now())){
   next.status=state.phase;changed=true;
  }
  const actionChange=await mutator(row,next);
  if(actionChange===true)changed=true;
  if(!changed)return row;
  try{return await cas(database,row,next)}
  catch(e){if(e?.status===409&&e.message==="ROOM_CHANGED")continue;throw e}
 }
 fail("Phòng được cập nhật đồng thời. Hãy thử lại.",409);
}
function nextSeat(members){
 for(let n=0;n<MAX_PLAYERS;n++)if(!members.some(m=>m.seat===n))return n;
 fail("Phòng đã đầy.");
}
function waitingView(room,uid){
 const active=room.members.filter(m=>!room.state?.players?.[m.uid]?.left);
 const my=member(room,uid);
 return {code:room.code,status:room.status,visibility:room.visibility,locked:room.locked,
  seat:my.seat,role:null,alive:true,version:room.version,capacity:MAX_PLAYERS,
  minPlayers:MIN_PLAYERS,isHost:active[0]?.uid===uid,
  players:active.map(m=>({seat:m.seat,name:m.name,ready:m.ready,alive:true})),
  ready:my.ready,serverTime:Date.now(),
  ...(room.status==="finished"&&room.state?.players?view(room.state,room.members,uid,room):{})};
}
function safeView(room,uid){
 member(room,uid);
 const game=room.status!=="waiting"&&room.status!=="closed"&&room.state?.players;
 if(!game)return waitingView(room,uid);
 const stateView=view(room.state,room.members,uid,room);
 return {...stateView,capacity:MAX_PLAYERS,minPlayers:MIN_PLAYERS,
  isHost:room.members.find(m=>!room.state?.players?.[m.uid]?.left)?.uid===uid,
  ready:room.members.find(m=>m.uid===uid)?.ready};
}
async function create(database,uid,name,visibility){
 if(!["public","private"].includes(visibility))fail("Kiểu phòng không hợp lệ.");
 for(let attempt=0;attempt<8;attempt++){
  const code=makeCode();
  const row={code,visibility,locked:false,status:"waiting",
   members:[{uid,name,seat:0,ready:false}],state:{phase:"waiting"},version:1};
  const {data,error}=await database.from("mrlee_goose_rooms").insert(row).select("*").single();
  if(!error)return data;
  if(error.code!=="23505")fail("Không thể tạo phòng. Hãy kiểm tra migration và quyền máy chủ.",503);
 }
 fail("Không tạo được mã phòng mới.",503);
}
async function join(database,code,uid,name){
 return await change(database,code,(row,next)=>{
  if(row.members.some(m=>m.uid===uid))return false;
  if(row.status!=="waiting"||row.locked)fail("Phòng đã bắt đầu hoặc bị khóa.");
  if(row.members.length>=MAX_PLAYERS)fail("Phòng đã đủ 16 người.");
  next.members.push({uid,name,seat:nextSeat(next.members),ready:false});return true;
 });
}
async function lobbyList(database){
 const {data,error}=await database.from("mrlee_goose_rooms")
  .select("code,visibility,locked,status,members,updated_at,expires_at")
  .eq("visibility","public").eq("locked",false).eq("status","waiting")
  .gt("expires_at",new Date().toISOString()).order("updated_at",{ascending:false}).limit(30);
 if(error)fail("Không lấy được danh sách phòng.",503);
 return (data||[]).filter(r=>r.members.length<MAX_PLAYERS)
  .map(r=>({code:r.code,players:r.members.length,capacity:MAX_PLAYERS,updatedAt:r.updated_at}));
}
async function roomAction(database,uid,code,action,body){
 if(action==="status"){
  const row=await change(database,code,()=>false);
  return {ok:true,room:safeView(row,uid)};
 }
 if(action==="join"){
  const row=await join(database,code,uid,nickname(body.name));
  return {ok:true,room:safeView(row,uid)};
 }
 if(action==="leave"){
  await change(database,code,(row,next)=>{
   member(row,uid);
   if(row.status==="waiting"){
    next.members=next.members.filter(m=>m.uid!==uid);
    if(!next.members.length)next.status="closed";
   }else if(row.state?.players?.[uid]){
    const me=next.state.players[uid];
    if(me.left)return false;
    me.left=true;me.alive=false;me.task=null;winnerCheck(next.state);
    next.status=next.state.phase;
   }
   return true;
  });
  return {ok:true,left:true};
 }
 const row=await change(database,code,(current,next)=>{
  const me=member(current,uid),state=next.state;
  if(action==="ready"){
   if(current.status!=="waiting"||typeof body.ready!=="boolean")
    fail("Chỉ có thể sẵn sàng trong phòng chờ.");
   next.members=next.members.map(m=>m.uid===uid?{...m,ready:body.ready}:m);
   return true;
  }
  if(action==="lock"){
   host(current,uid);
   if(current.status!=="waiting"||typeof body.locked!=="boolean")fail("Chỉ khóa phòng khi đang chờ.");
   next.locked=body.locked;return true;
  }
  if(action==="start"){
   host(current,uid);
   if(current.status!=="waiting")fail("Phòng không ở trạng thái chờ.");
   if(current.members.length<MIN_PLAYERS)fail("Cần đủ ít nhất 4 người.");
   if(!current.members.every(m=>m.ready))fail("Mọi thành viên phải nhấn sẵn sàng.");
   next.state=newMatch(current.members,Date.now());next.status="playing";return true;
  }
  if(action==="rematch"){
   if(current.status!=="finished")fail("Ván chưa kết thúc.");
   if(!state.players?.[uid]||state.players[uid].left)fail("Bạn đã rời trận.",403);
   next.members=next.members.map(m=>m.uid===uid?{...m,ready:true}:m);
   const active=next.members.filter(m=>!state.players[m.uid]?.left);
   if(active.every(m=>m.ready)){
    next.members=active.map(m=>({...m,ready:false}));
    if(active.length>=MIN_PLAYERS){next.state=newMatch(next.members,Date.now());next.status="playing";}
    else{next.state={phase:"waiting"};next.status="waiting";next.members=active;}
   }
   return true;
  }
  if(!["playing","meeting"].includes(current.status)&&
     !["playing","meeting"].includes(next.status))
   fail("Ván chưa bắt đầu hoặc đã kết thúc.");
  const changed=apply(state,current.members,uid,action,body,Date.now());
  next.status=state.phase;return changed;
 });
 return {ok:true,room:safeView(row,uid)};
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:jsonHeaders(req)});
 if(!["GET","POST"].includes(req.method))return response(req,405,{ok:false,error:"Phương thức không hỗ trợ."});
 try{
  const url=new URL(req.url),action=url.searchParams.get("action")||"status";
  if(action==="health"){
   const database=db();
   const {error}=await database.from("mrlee_goose_rooms").select("code",{head:true}).limit(1);
   if(error)fail("Chưa cài đặt migration Goose PvP.",503);
   return response(req,200,{ok:true,service:"goose-pvp",mode:"server-authoritative"});
  }
  if(!allowedActions.has(action))fail("Thao tác không hợp lệ.",404);
  const uid=await userId(req),database=db();
  const body=req.method==="POST"?await req.json().catch(()=>({})):
   Object.fromEntries(url.searchParams);
  if(action==="list")return response(req,200,{ok:true,rooms:await lobbyList(database)});
  if(action==="create"){
   const row=await create(database,uid,nickname(body.name),
    body.visibility==="public"?"public":"private");
   return response(req,200,{ok:true,room:safeView(row,uid)});
  }
  if(action==="quick"){
   const rooms=await lobbyList(database),name=nickname(body.name);
   for(const available of rooms.slice(0,12)){
    try{
     const row=await join(database,available.code,uid,name);
     return response(req,200,{ok:true,room:safeView(row,uid),match:"joined"});
    }catch(e){if(![404,409].includes(e?.status||0))throw e}
   }
   const row=await create(database,uid,name,"public");
   return response(req,200,{ok:true,room:safeView(row,uid),match:"created"});
  }
  const code=codeOf(body.code);
  return response(req,200,await roomAction(database,uid,code,action,body));
 }catch(err){
  const status=Number(err?.status)||500;
  return response(req,status,{ok:false,error:status===500?
   "Máy chủ chưa xử lý được yêu cầu. Vui lòng thử lại.":String(err?.message||"Lỗi")});
 }
});
