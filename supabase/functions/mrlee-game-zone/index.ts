/**
 * MR LEE GAME ZONE: isolated verified educational-XP challenge.
 * The student's Firebase JWT is verified cryptographically; no Supabase Auth token
 * is accepted as Firebase identity. Never put service_role in the browser.
 *
 * Deploy verify_jwt=false: this function validates Firebase JWT itself.
 * IMPORTANT: SQL MRLEE_GAME_ZONE_SETUP.sql must be installed first.
 */
import {createRemoteJWKSet,jwtVerify} from "npm:jose@6.1.0";
import {createClient} from "npm:@supabase/supabase-js@2";
const FIREBASE_PROJECT="tieng-han-mr-lee";
const jwks=createRemoteJWKSet(new URL(
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
),{timeoutDuration:5000,cooldownDuration:30000,cacheMaxAge:3600000});
const allowedOrigins=new Set([
 "https://jeongjunlee10x.github.io",
 "https://mrlee-b6a.pages.dev"
]);
type Json=Record<string,unknown>;
function headers(req:Request) {
 const origin=req.headers.get("Origin")||"";
 return {
  "Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"https://mrlee-b6a.pages.dev",
  "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":"authorization,content-type",
  "Access-Control-Max-Age":"600",
  "Content-Type":"application/json; charset=utf-8",
  "Vary":"Origin",
  "Cache-Control":"no-store"
 };
}
function response(req:Request,status:number,obj:unknown) {
 return new Response(JSON.stringify(obj),{status,headers:headers(req)});
}
function httpError(message:string,status:number){return Object.assign(new Error(message),{status});}
function db(){
 const url=Deno.env.get("SUPABASE_URL")||"";
 const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key)
   throw httpError("Hệ thống điểm chưa được cấu hình.",503);
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
function vnToday(){
 const items=new Intl.DateTimeFormat("en-CA",{
  timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"
 }).formatToParts(new Date());
 const get=(kind:string)=>items.find(x=>x.type===kind)?.value||"";
 return [get("year"),get("month"),get("day")].join("-");
}
function vnWeek(){
 const day=vnToday();
 const date=new Date(day+"T00:00:00Z");
 const mondayOffset=(date.getUTCDay()+6)%7;
 date.setUTCDate(date.getUTCDate()-mondayOffset);
 return date.toISOString().slice(0,10);
}
async function verifiedFirebaseUid(req:Request) {
 const authorization=req.headers.get("Authorization")||"";
 if(!authorization.startsWith("Bearer "))throw httpError("Vui lòng đăng nhập học viên.",401);
 const token=authorization.slice(7);
 if(token.length>6500)throw httpError("Phiên đăng nhập không hợp lệ.",401);
 try {
  const {payload}=await jwtVerify(token,jwks,{
   issuer:"https://securetoken.google.com/"+FIREBASE_PROJECT,
   audience:FIREBASE_PROJECT,algorithms:["RS256"],clockTolerance:30
  });
  const uid=payload.sub;
  const now=Math.floor(Date.now()/1000);
  if(typeof uid!=="string"||uid.length<10||uid.length>128 ||
     payload.email_verified!==true ||
     typeof payload.auth_time!=="number"||payload.auth_time>now+30||
     (payload.firebase as {sign_in_provider?:string}|undefined)?.sign_in_provider==="anonymous")
    throw new Error("Unverified Firebase account");
  return uid;
 }catch{throw httpError("Hãy đăng nhập và xác minh email Firebase.",401);}
}
function validScope(data:Json){
 const cap=data.cap,bai=data.bai;
 if(typeof cap!=="number"||!Number.isInteger(cap)||cap<1||cap>6||
    typeof bai!=="number"||!Number.isInteger(bai)||bai<1||bai>15)
  throw httpError("Cấp độ hoặc bài học không hợp lệ.",400);
 return {cap,bai};
}
function shuffle<T>(values:T[]):T[]{
 const array=values.slice();
 for(let i=array.length-1;i>0;i--){
  const cryptoIndex=new Uint32Array(1);
  crypto.getRandomValues(cryptoIndex);
  const j=cryptoIndex[0]%(i+1);
  [array[j],array[i]]=[array[i],array[j]];
 }
 return array;
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(req)});
 const origin=req.headers.get("Origin");
 if(origin && !allowedOrigins.has(origin))return response(req,403,{error:"Origin không được phép."});
 const url=new URL(req.url),action=url.searchParams.get("action")||"status";
 try {
  if(req.method==="GET"&&action==="status") {
   const {count,error}=await db().from("mrlee_game_questions")
     .select("id",{head:true,count:"exact"}).eq("approved",true);
   if(error)throw httpError("Ngân hàng điểm chưa được kích hoạt.",503);
   return response(req,200,{ok:true,verifiedQuestionCount:count||0,
     timezone:"Asia/Ho_Chi_Minh",status:count&&count>=5?"ready":"awaiting_approved_bank"});
  }
  if(req.method==="GET"&&action==="leaderboard"){
   const week=vnWeek();
   const {data,error}=await db().from("mrlee_game_weekly")
     .select("alias,xp,awarded_lessons")
     .eq("week_start",week).order("xp",{ascending:false}).limit(20);
   if(error)throw httpError("Chưa đọc được bảng Game Zone.",503);
   return response(req,200,{ok:true,week_start:week,leaderboard:data||[]});
  }
  if(req.method==="GET"&&action==="me"){
   const uid=await verifiedFirebaseUid(req),week=vnWeek();
   const database=db();
   const [{data:summary,error:errorSummary},{data:attempts,error:errorAttempts}]=await Promise.all([
    database.from("mrlee_game_weekly").select("xp,awarded_lessons")
      .eq("firebase_uid",uid).eq("week_start",week).maybeSingle(),
    database.from("mrlee_game_attempts").select("cap,bai,correct,total,xp,finished_at")
      .eq("firebase_uid",uid).order("finished_at",{ascending:false}).limit(12)
   ]);
   if(errorSummary||errorAttempts)throw httpError("Không đọc được điểm Game Zone.",503);
   return response(req,200,{ok:true,week_start:week,xp:summary?.xp||0,
    awarded_lessons:summary?.awarded_lessons||0,attempts:attempts||[]});
  }
  if(req.method!=="POST"||!["start","finish"].includes(action))
   return response(req,404,{error:"API không tồn tại."});
  const uid=await verifiedFirebaseUid(req);
  if(Number(req.headers.get("content-length")||0)>10000)
   throw httpError("Yêu cầu quá lớn.",413);
  const raw=await req.text();
  if(raw.length>10000)throw httpError("Yêu cầu quá lớn.",413);
  let body:Json={};
  try{body=JSON.parse(raw);}catch{throw httpError("JSON không hợp lệ.",400);}
  if(!body||typeof body!=="object"||Array.isArray(body))
   throw httpError("Dữ liệu yêu cầu không hợp lệ.",400);
  const database=db();
  if(action==="start"){
   const {cap,bai}=validScope(body);
   const since=new Date(Date.now()-86400000).toISOString();
   const {count:tries,error:tryError}=await database.from("mrlee_game_sessions")
     .select("id",{count:"exact",head:true}).eq("firebase_uid",uid).gte("started_at",since);
   if(tryError)throw httpError("Lỗi kiểm tra lượt chơi.",503);
   if((tries||0)>=15)throw httpError("Đã đạt 15 lượt nhận đề trong 24 giờ. Hãy thử vào ngày sau.",429);
   const {data:bank,error}=await database.from("mrlee_game_questions")
     .select("id,kind,prompt,options").eq("cap",cap).eq("bai",bai).eq("approved",true).limit(500);
   if(error)throw httpError("Không tải được câu hỏi đã duyệt.",503);
   if(!Array.isArray(bank)||bank.length<5)
     throw httpError("Bài này chưa đủ 5 câu hỏi được giáo viên duyệt để nhận XP xác minh.",409);
   const chosen=shuffle(bank).slice(0,5);
   const {data:created,error:createError}=await database.from("mrlee_game_sessions")
     .insert({firebase_uid:uid,cap,bai,question_ids:chosen.map(q=>q.id)})
     .select("id,expires_at").single();
   if(createError)throw httpError("Không tạo được lượt chơi.",503);
   return response(req,200,{ok:true,session_id:created.id,expires_at:created.expires_at,
     questions:chosen.map(q=>({id:q.id,kind:q.kind,prompt:q.prompt,options:q.options}))});
  }
  // Finish is scored atomically inside PostgreSQL. Client score is never accepted.
  const sessionId=String(body.session_id||"");
  if(!/^[0-9a-f-]{36}$/i.test(sessionId)||!Array.isArray(body.answers)||
    body.answers.length!==5||!body.answers.every(v=>Number.isInteger(v)&&v>=0&&v<=3))
    throw httpError("Phiên hoặc đáp án không hợp lệ.",400);
  const {data,error}=await database.rpc("mrlee_game_finish",{
    p_session_id:sessionId,p_firebase_uid:uid,p_answers:body.answers
  });
  if(error){
    if(/expired|not found|Invalid/i.test(error.message))
      throw httpError("Phiên đã hết hạn hoặc không hợp lệ.",409);
    throw httpError("Chưa chấm được bài trên máy chủ.",503);
  }
  return response(req,200,{ok:true,result:data});
 }catch(e){
  const status=typeof (e as {status?:unknown})?.status==="number"?(e as {status:number}).status:500;
  return response(req,status,{ok:false,error:status===500?"Có lỗi xử lý yêu cầu.":String((e as Error)?.message||"Lỗi không xác định.")});
 }
});
