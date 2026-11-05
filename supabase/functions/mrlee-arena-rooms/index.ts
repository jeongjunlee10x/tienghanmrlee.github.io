/* MR LEE Arena Rooms — Firebase-verified server-authoritative PvP.
 * All state (including hidden opponents' cards) remains private in Postgres.
 * Clients send only requested actions, never results, turns or reward changes.
 * WARNING: game gold is a non-wagered local/demo match tier; no real rewards.
 */
import {createRemoteJWKSet,jwtVerify} from "npm:jose@6.1.0";
import {createClient} from "npm:@supabase/supabase-js@2";
import * as Chess from "./chess-engine.js";
import * as TienLen from "./tienlen-engine.js";
import * as Colors from "./color-engine.js";
const PROJECT="tieng-han-mr-lee";
const JWKS=createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
 {timeoutDuration:5000,cooldownDuration:30000,cacheMaxAge:3600000});
const ORIGINS=new Set(["https://jeongjunlee10x.github.io","https://mrlee-b6a.pages.dev"]);
const GAME_SLOTS:Record<string,number>={chess:2,tienlen:4,colors:4};
const GOLD_TIERS=new Set([5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000]);
const RISK_CARDS:Record<string,number>={chess:1,tienlen:13,colors:20};
const exposure=(game:string,stake:number)=>stake*RISK_CARDS[game];
const CODE_LETTERS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
type Member={uid:string,name:string,seat:number,ready:boolean};
type Room={code:string,game:string,visibility:string,min_gold:number,status:string,
 members:Member[],state:any,version:number,expires_at:string,created_at:string,updated_at:string};
type Body=Record<string,any>;
function headers(req:Request){
 const origin=req.headers.get("Origin")||"";
 return {"Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://mrlee-b6a.pages.dev",
  "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":"authorization,content-type",
  "Access-Control-Max-Age":"600","Cache-Control":"no-store","Vary":"Origin",
  "Content-Type":"application/json; charset=utf-8"};
}
function reply(req:Request,status:number,json:unknown){
 return new Response(JSON.stringify(json),{status,headers:headers(req)});
}
function fail(text:string,status=400):never{throw Object.assign(new Error(text),{status});}
function db(){
 const url=Deno.env.get("SUPABASE_URL")||"",key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key)fail("Máy chủ chưa cấu hình.",503);
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
async function identity(req:Request){
 const authorization=req.headers.get("Authorization")||"";
 if(!authorization.startsWith("Bearer "))fail("Hãy đăng nhập học viên trước khi vào phòng.",401);
 const token=authorization.slice(7);
 if(token.length>6500)fail("Phiên xác thực không hợp lệ.",401);
 try{
  const {payload}=await jwtVerify(token,JWKS,{issuer:"https://securetoken.google.com/"+PROJECT,
    audience:PROJECT,algorithms:["RS256"],clockTolerance:30});
  const uid=payload.sub,authTime=payload.auth_time;
  if(typeof uid!=="string"||uid.length<8||uid.length>128||payload.email_verified!==true||
     typeof authTime!=="number"||authTime>Math.floor(Date.now()/1000)+30||
     (payload.firebase as {sign_in_provider?:string}|undefined)?.sign_in_provider==="anonymous")throw new Error("Firebase uid/email not verified");
  return uid;
 }catch{fail("Phiên Firebase chưa được xác minh. Hãy đăng nhập lại.",401);}
}
function gameName(value:unknown){
 if(typeof value!=="string"||!(value in GAME_SLOTS))fail("Trò chơi không hợp lệ.");
 return value;
}
function roomCode(value:unknown){
 const text=String(value||"").trim().toUpperCase().replace(/[\s-]/g,"");
 if(!/^[A-Z2-9]{8}$/.test(text))fail("Mã phòng cần 8 ký tự hợp lệ.");
 return text;
}
function name(value:unknown){
 const text=typeof value==="string"?value.normalize("NFKC").replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,24):"";
 return text.length>=2?text:"Học viên";
}
function roomTier(value:unknown){
 if(typeof value!=="number"||!GOLD_TIERS.has(value))fail("Mức bàn G không hợp lệ.");
 return value;
}
function randomCode(){
 const a=new Uint8Array(8);crypto.getRandomValues(a);
 return [...a].map(x=>CODE_LETTERS[x%CODE_LETTERS.length]).join("");
}
const secureRandom=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
const now=()=>new Date().toISOString();
const expires=()=>new Date(Date.now()+90*60*1000).toISOString();
function membership(room:Room,uid:string){
 const m=room.members.find(x=>x.uid===uid);
 if(!m)fail("Bạn không thuộc phòng này.",403);
 return m;
}
function isExpired(room:Room){return room.expires_at<=now();}
function safeRoom(room:Room,uid:string){
 const player=membership(room,uid),game=room.game;
 const result:any={code:room.code,game,visibility:room.visibility,minGold:room.min_gold,
  status:room.status,seat:player.seat,capacity:GAME_SLOTS[game],
  players:room.members.map(m=>({name:m.name,seat:m.seat,ready:m.ready})),
  version:room.version,expiresAt:room.expires_at,requiredGold:exposure(game,room.min_gold)};
 if(room.status!=="playing"&&room.status!=="finished")return result;
 const state=room.state;
 if(room.status==="finished"&&state.settlement)result.settlement=state.settlement;
 if(game==="chess"){
  const position=state.history.at(-1),detail=Chess.status(state.history);
  result.gameState={position,notation:state.notation,turn:position.t===1?0:1,
    winner:detail.done?(detail.winner===1?0:detail.winner===-1?1:null):null,
    done:detail.done,reason:detail.reason,claim:!!detail.claim};
 }else if(game==="tienlen"){
  result.gameState={myHand:state.hands[player.seat],counts:state.hands.map((hand:any[])=>hand.length),
    turn:state.turn,played:state.played,last:state.last?{player:state.last.player,combo:state.last.combo}:null,
    first:state.first,passed:state.passed,history:state.history.slice(-12),
    winner:state.winner};
 }else if(game==="colors"){
  result.gameState={myHand:state.hands[player.seat],counts:state.hands.map((hand:any[])=>hand.length),
    turn:state.turn,top:Colors.topCard(state),activeColor:state.activeColor,
    drawnCardId:state.turn===player.seat?state.drawnCardId:null,
    events:state.events.slice(-12),direction:state.direction,winner:state.winner};
 }
 return result;
}
async function selectRoom(database:any,code:string):Promise<Room>{
 const {data,error}=await database.from("mrlee_arena_rooms").select("*").eq("code",code).maybeSingle();
 if(error)fail("Không tải được phòng đấu.",503);
 if(!data||isExpired(data))fail("Phòng không còn hoạt động hoặc mã không tồn tại.",404);
 return data as Room;
}
async function cas(database:any,row:Room,patch:Partial<Room>):Promise<Room>{
 const {data,error}=await database.from("mrlee_arena_rooms")
 .update({...patch,version:row.version+1,updated_at:now(),expires_at:expires()})
 .eq("code",row.code).eq("version",row.version).select("*").maybeSingle();
 if(error)fail("Không thể cập nhật phòng.",503);
 if(!data)fail("Phòng vừa thay đổi. Tải lại rồi thao tác tiếp.",409);
 return data as Room;
}
function createState(game:string){
 if(game==="chess"){
  const position=Chess.start();return {history:[position],notation:[]};
 }
 return game==="tienlen"?TienLen.start(secureRandom):Colors.newGame(secureRandom);
}
async function wallet(database:any,uid:string){
 const {data,error}=await database.rpc("mrlee_arena_wallet_status",{p_uid:uid});
 if(error||!data)fail("Không thể xác minh ví G và nguồn điểm học.",503);
 return data as {gold:number,earnedPoints:number,convertedPoints:number,availablePoints:number};
}
async function requireGold(database:any,uid:string,game:string,tier:number){
 const w=await wallet(database,uid);
 const necessary=exposure(game,tier);
 if(w.gold<necessary)fail("Cần tối thiểu "+necessary.toLocaleString("vi-VN")+
  "G để bảo đảm thanh toán ván này. Hãy đổi điểm đã xác minh hoặc chọn mức bàn thấp hơn.",403);
 return w;
}
async function freshRoom(database:any,uid:string,game:string,visibility:string,tier:number,nickname:string){
 await requireGold(database,uid,game,tier);
 const {count,error:countError}=await database.from("mrlee_arena_rooms").select("code",{head:true,count:"exact"})
  .in("status",["waiting","playing"]).contains("members",[{uid}]).gt("expires_at",now());
 if(countError)fail("Không kiểm tra được phòng hiện có.",503);
 if((count||0)>=3)fail("Bạn đang tham gia quá nhiều phòng. Hãy rời bớt phòng trước.",429);
 for(let attempt=0;attempt<6;attempt++){
  const code=randomCode();
  const {data,error}=await database.from("mrlee_arena_rooms").insert({
   code,game,visibility,min_gold:tier,status:"waiting",
   members:[{uid,name:nickname,seat:0,ready:false}],state:{}
  }).select("*").maybeSingle();
  if(!error&&data)return data as Room;
  if(error?.code!=="23505")fail("Không tạo được phòng. Hãy thử lại.",503);
 }
 fail("Chưa tạo được mã phòng duy nhất. Hãy thử lại.",503);
}
async function joinRoom(database:any,row:Room,uid:string,nickname:string){
 if(row.members.some(x=>x.uid===uid))return row;
 if(row.status!=="waiting")fail("Bàn này đã bắt đầu hoặc đóng.",409);
 if(row.members.length>=GAME_SLOTS[row.game])fail("Bàn đã đủ số người.",409);
 await requireGold(database,uid,row.game,row.min_gold);
 const members=[...row.members,{uid,name:nickname,seat:row.members.length,ready:false}];
 return cas(database,row,{members});
}
async function listRooms(database:any,game:string,uid:string){
 const {data,error}=await database.from("mrlee_arena_rooms")
 .select("code,game,visibility,min_gold,status,members,created_at,expires_at")
 .eq("game",game).eq("visibility","public").eq("status","waiting")
 .gt("expires_at",now()).order("created_at",{ascending:true}).limit(60);
 if(error)fail("Không lấy được danh sách bàn.",503);
 return (data||[]).filter((r:Room)=>r.members.length<GAME_SLOTS[r.game]).map((r:Room)=>({
  code:r.code,game:r.game,minGold:r.min_gold,status:r.status,
  capacity:GAME_SLOTS[r.game],count:r.members.length,
  host:r.members[0]?.name||"Học viên",alreadyIn:r.members.some(m=>m.uid===uid)
 }));
}
function actionChess(state:any,seat:number,action:Body){
 const p=state.history.at(-1),who=p.t===1?0:1;
 if(seat!==who)fail("Chưa tới lượt bạn.",409);
 if(typeof action.uci!=="string"||! /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(action.uci))
  fail("Nước cờ không hợp lệ.");
 const move=Chess.fromUci(p,action.uci);
 if(!move)fail("Nước cờ sai luật.",409);
 const notation=Chess.san(p,move);
 state.history.push(Chess.apply(p,move));
 state.notation.push(notation);
 if(state.history.length>350){
  // Avoid unlimited room payload growth.
  state.history=state.history.slice(-200);
  state.notation=state.notation.slice(-200);
 }
 const result=Chess.status(state.history);
 return {finished:result.done};
}
function actionTienLen(state:any,seat:number,action:Body){
 if(state.turn!==seat)fail("Chưa đến lượt bạn.",409);
 if(action.kind==="pass"){TienLen.pass(state,seat);return {finished:state.winner!==null};}
 if(action.kind!=="play"||!Array.isArray(action.ids)||action.ids.length<1||action.ids.length>13||
 action.ids.some((id:unknown)=>typeof id!=="string"||!/^(?:[3-9]|1[0-5])-[0-3]$/.test(id)))
  fail("Bộ bài không hợp lệ.");
 if(!TienLen.canPlay(state,seat,action.ids))fail("Bộ bài sai luật hoặc không đủ mạnh.",409);
 TienLen.play(state,seat,action.ids);
 return {finished:state.winner!==null};
}
function actionColors(state:any,seat:number,action:Body){
 if(state.turn!==seat)fail("Chưa đến lượt bạn.",409);
 if(action.kind==="draw"){Colors.beginDraw(state,seat,secureRandom);}
 else if(action.kind==="pass"){Colors.pass(state,seat);}
 else if(action.kind==="play"){
  if(!Number.isInteger(action.cardId)||action.cardId<0||action.cardId>107)fail("Lá bài sai.");
  const color=action.color===null||action.color===undefined?null:action.color;
  if(color!==null&&!Colors.COLORS.includes(color))fail("Màu được chọn không hợp lệ.");
  const card=state.hands[seat].find((c:any)=>c.id===action.cardId);
  if(!Colors.canPlay(state,card,seat))fail("Lá bài không hợp lệ.",409);
  Colors.play(state,seat,action.cardId,color,secureRandom);
 }else fail("Hành động không hợp lệ.");
 return {finished:state.winner!==null};
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(req)});
 const origin=req.headers.get("Origin");
 if(origin&&!ORIGINS.has(origin))return reply(req,403,{ok:false,error:"Nguồn truy cập không được phép."});
 try{
  const uid=await identity(req),database=db(),url=new URL(req.url),kind=url.searchParams.get("action");
  if(req.method==="GET"){
   if(kind==="wallet")return reply(req,200,{ok:true,wallet:await wallet(database,uid)});
   if(kind==="list"){
    const game=gameName(url.searchParams.get("game"));
    return reply(req,200,{ok:true,rooms:await listRooms(database,game,uid)});
   }
   if(kind==="state"){
    const row=await selectRoom(database,roomCode(url.searchParams.get("code")));
    return reply(req,200,{ok:true,room:safeRoom(row,uid)});
   }
   fail("Không tìm thấy API.",404);
  }
  if(req.method!=="POST")fail("Yêu cầu không hỗ trợ.",405);
  if(Number(req.headers.get("content-length")||0)>4096)fail("Yêu cầu quá lớn.",413);
  const raw=await req.text();
  if(raw.length>4096)fail("Yêu cầu quá lớn.",413);
  let body:Body;try{body=JSON.parse(raw);}catch{fail("Dữ liệu JSON không hợp lệ.");}
  if(!body||typeof body!=="object"||Array.isArray(body))fail("Dữ liệu không hợp lệ.");
  const nickname=name(body.nickname);
  if(kind==="convert"){
   if(!Number.isInteger(body.points)||body.points<1||body.points>10000)
     fail("Chọn từ 1 đến 10.000 điểm đã xác minh mỗi lần đổi.");
   const {data,error}=await database.rpc("mrlee_arena_convert",{
    p_uid:uid,p_points:body.points
   });
   if(error){
    if(error.code==="P0001")fail("Không đủ điểm học tập đã xác minh để đổi.",403);
    fail("Không chuyển đổi được điểm sang G.",503);
   }
   return reply(req,200,{ok:true,conversion:data,wallet:await wallet(database,uid)});
  }
  if(kind==="create"){
   const game=gameName(body.game),tier=roomTier(body.minGold),visibility=body.visibility;
   if(visibility!=="private"&&visibility!=="public")fail("Kiểu phòng không hợp lệ.");
   const row=await freshRoom(database,uid,game,visibility,tier,nickname);
   return reply(req,200,{ok:true,room:safeRoom(row,uid)});
  }
  if(kind==="quick"){
   const game=gameName(body.game),balance=(await wallet(database,uid)).gold;
   const rooms=await listRooms(database,game,uid);
   const options=rooms.filter(x=>exposure(game,x.minGold)<=balance)
      .sort((a,b)=>b.count-a.count||b.minGold-a.minGold);
   for(const room of options.slice(0,12)){
    try{
     const current=await selectRoom(database,room.code);
     const joined=await joinRoom(database,current,uid,nickname);
     return reply(req,200,{ok:true,room:safeRoom(joined,uid),match:"joined"});
    }catch(e){
     if(![404,409].includes((e as {status?:number}).status||0))throw e;
    }
   }
   const suitable=[...GOLD_TIERS].filter(x=>exposure(game,x)<=balance)
      .sort((a,b)=>a-b);
   if(!suitable.length)fail("Bạn chưa đủ G vào bàn thấp nhất. Hãy đổi điểm học tập đã xác minh sang G.",403);
   const created=await freshRoom(database,uid,game,"public",suitable[0],nickname);
   return reply(req,200,{ok:true,room:safeRoom(created,uid),match:"created"});
  }
  const code=roomCode(body.code);
  const room=await selectRoom(database,code);
  if(kind==="join"){
   const joined=await joinRoom(database,room,uid,nickname);
   return reply(req,200,{ok:true,room:safeRoom(joined,uid)});
  }
  const me=membership(room,uid);
  if(kind==="leave"){
   if(room.status==="waiting"){
    const members=room.members.filter(x=>x.uid!==uid).map((m,seat)=>({...m,seat}));
    if(!members.length){
     // Retain status for diagnostics; no public room data after closure.
     await cas(database,room,{members:[],status:"closed"});
    }else await cas(database,room,{members});
    return reply(req,200,{ok:true,left:true});
   }
   if(room.status==="playing"){
    const {data,error}=await database.rpc("mrlee_arena_abort_match",{
     p_code:code,p_expected_version:room.version
    });
    if(error||data!==true)fail("Bàn đã đổi trạng thái. Hãy cập nhật trước khi rời.",409);
   }
   return reply(req,200,{ok:true,left:true});
  }
  if(kind==="ready"){
   if(room.status!=="waiting")fail("Bàn đã bắt đầu, không thể đổi sẵn sàng.",409);
   if(typeof body.ready!=="boolean")fail("Trạng thái sẵn sàng không hợp lệ.");
   const members=room.members.map(m=>m.uid===uid?{...m,ready:body.ready}:m);
   const allReady=members.length===GAME_SLOTS[room.game]&&members.every(m=>m.ready);
   await requireGold(database,uid,room.game,room.min_gold);
   const changed=await cas(database,room,{members});
   if(allReady){
    const {error}=await database.rpc("mrlee_arena_start_match",{
     p_code:code,p_expected_version:changed.version,p_state:createState(room.game)
    });
    if(error){
     // Prevent a room from remaining stuck with all ready after insufficient funds.
     try{await cas(database,changed,{members:members.map(x=>x.uid===uid?{...x,ready:false}:x)});}catch{}
     if(error.code==="P0001")fail("Chưa đủ G để bắt đầu. Mỗi người phải có đủ G bảo đảm cho số lá còn lại tối đa.",403);
     fail("Không thể khóa số dư G để bắt đầu ván.",503);
    }
    const started=await selectRoom(database,code);
    return reply(req,200,{ok:true,room:safeRoom(started,uid)});
   }
   return reply(req,200,{ok:true,room:safeRoom(changed,uid)});
  }
  if(kind==="move"){
   if(room.status!=="playing")fail("Phòng chưa ở trạng thái chơi.",409);
   if(!Number.isInteger(body.version)||body.version!==room.version)
    fail("Phòng đã đổi lượt. Hãy cập nhật rồi thử lại.",409);
   const state=structuredClone(room.state);
   const result=room.game==="chess"?actionChess(state,me.seat,body):
    room.game==="tienlen"?actionTienLen(state,me.seat,body):actionColors(state,me.seat,body);
   if(result.finished){
    let winner=-1,remaining:number[];
    if(room.game==="chess"){
      const end=Chess.status(state.history);
      winner=end.winner===1?0:end.winner===-1?1:-1;
      remaining=[0,0];
    }else{
      winner=state.winner;
      remaining=state.hands.map((cards:unknown[])=>cards.length);
    }
    state.settlement={winner,remaining,rate:room.min_gold};
    const {error}=await database.rpc("mrlee_arena_settle_match",{
     p_code:code,p_expected_version:room.version,p_state:state,
     p_winner:winner,p_remaining:remaining
    });
    if(error){
      if(error.code==="P0001")fail("Kết quả vừa được xử lý hoặc trận đã đổi lượt.",409);
      fail("Không ghi nhận được kết quả và giao dịch G.",503);
    }
   }else await cas(database,room,{state,status:"playing"});
   const updated=await selectRoom(database,code);
   return reply(req,200,{ok:true,room:safeRoom(updated,uid)});
  }
  fail("Không tìm thấy thao tác.",404);
 }catch(error){
  const status=(error as {status?:number})?.status||500;
  const message=status===500?"Máy chủ có lỗi xử lý. Hãy thử lại.":String((error as Error)?.message||"Có lỗi");
  return reply(req,status,{ok:false,error:message});
 }
});
