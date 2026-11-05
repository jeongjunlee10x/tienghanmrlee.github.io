/* MR LEE GAME ZONE — Admin Supabase Auth only, never Firebase student identity. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const URL_DEFAULT="https://pkxqsboyotlyoizzxizb.supabase.co";
const KEY_DEFAULT="sb_publishable_3BacezFjGR1-l6-1_E5tRg_o2qauZIz";
const FORMATS=new Set(["vocabulary","grammar","reading"]);
let client=null,ready=false,pending=[],user=null;
const notice=(text,error=false)=>{const el=$("mzAdminStatus");el.textContent=text;el.dataset.error=String(error);};
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
function weekStartVN(){
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
 const f=key=>parts.find(x=>x.type===key)?.value||"";
 const date=new Date([f("year"),f("month"),f("day")].join("-")+"T00:00:00Z");
 date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
 return date.toISOString().slice(0,10);
}
function empty(text){const p=document.createElement("p");p.textContent=text;return p;}
function card(title,subtitle){
 const container=document.createElement("div");container.className="mz-admin-item";
 const item=document.createElement("div");
 const h=document.createElement("strong");h.textContent=title;
 const s=document.createElement("small");s.textContent=subtitle;
 item.append(h,s);container.append(item);
 return container;
}
function validate(data){
 if(!data||Array.isArray(data)||typeof data!=="object")throw Error("Mỗi dòng phải là một đối tượng.");
 const {cap,bai,kind,prompt,options,answer_index,explanation}=data;
 if(!integer(cap,1,6)||!integer(bai,1,15)||!FORMATS.has(kind))
  throw Error("Cấp, bài hoặc loại câu hỏi không hợp lệ.");
 if(typeof prompt!=="string"||prompt.trim().length<3||prompt.length>500)
  throw Error("Đề bài phải dài từ 3 đến 500 ký tự.");
 if(!Array.isArray(options)||options.length!==4||options.some(x=>typeof x!=="string"||!x.trim()||x.length>250))
  throw Error("Cần bốn đáp án có nội dung hợp lệ.");
 const normalized=options.map(x=>x.normalize("NFKC").trim().toLowerCase());
 if(new Set(normalized).size!==4)throw Error("Bốn đáp án không được trùng nhau.");
 if(!integer(answer_index,0,3))throw Error("answer_index phải nằm trong 0–3.");
 if(typeof explanation!=="string"||explanation.length>500)
  throw Error("Thiếu hoặc lỗi phần giải thích.");
 return {cap,bai,kind,prompt:prompt.trim(),options:options.map(x=>x.trim()),answer_index,explanation:explanation.trim(),approved:false};
}
async function refreshCounts(){
 const [{count:total,error:a},{count:approved,error:b},{count:awarded,error:c}]=await Promise.all([
  client.from("mrlee_game_questions").select("id",{count:"exact",head:true}),
  client.from("mrlee_game_questions").select("id",{count:"exact",head:true}).eq("approved",true),
  client.from("mrlee_game_awards").select("session_id",{count:"exact",head:true}).eq("week_start",weekStartVN())
 ]);
 if(a||b||c)throw a||b||c;
 $("mzQTotal").textContent=String(total||0);
 $("mzQApproved").textContent=String(approved||0);
 $("mzWeekPlays").textContent=String(awarded||0);
}
async function refreshBank(){
 if(!ready)return;
 const cap=Number($("mzBankCap").value),bai=Number($("mzBankBai").value),root=$("mzBankList");
 root.replaceChildren(empty("Đang tải câu hỏi..."));
 const {data,error}=await client.from("mrlee_game_questions")
   .select("id,kind,prompt,options,answer_index,approved")
   .eq("cap",cap).eq("bai",bai).order("created_at",{ascending:false}).limit(100);
 if(error){root.replaceChildren(empty("Không đọc được ngân hàng: "+error.message));return;}
 root.replaceChildren();
 if(!data?.length){root.append(empty("Bài này chưa có câu hỏi. Có thể nhập bên dưới."));return;}
 for(const row of data){
  const item=card(row.prompt,(row.approved?"✓ Đã duyệt":"Chưa duyệt")+" · "+row.kind+" · Đáp án: "+String(row.options?.[row.answer_index]||""));
  const b=document.createElement("button");b.className="mz-ghost";b.type="button";b.textContent=row.approved?"Bỏ duyệt":"Duyệt câu";
  b.addEventListener("click",async()=>{
   b.disabled=true;
   const {error:err}=await client.from("mrlee_game_questions").update({approved:!row.approved}).eq("id",row.id);
   if(err)notice("Không cập nhật được: "+err.message,true);
   else {notice("Đã cập nhật trạng thái câu hỏi.");await Promise.all([refreshBank(),refreshCounts()]);}
   b.disabled=false;
  });
  item.append(b);root.append(item);
 }
}
async function refreshWeekly(){
 const list=$("mzAdminRanking");
 list.replaceChildren(empty("Đang tải bảng tuần..."));
 const {data,error}=await client.from("mrlee_game_weekly")
   .select("alias,xp,awarded_lessons")
   .eq("week_start",weekStartVN()).order("xp",{ascending:false}).limit(30);
 list.replaceChildren();
 if(error){list.append(empty("Chưa tải được bảng điểm: "+error.message));return;}
 if(!data?.length){list.append(empty("Chưa có XP xác minh nào trong tuần này."));return;}
 data.forEach((x,i)=>list.append(card((i+1)+". "+x.alias,
   x.xp+" XP · "+x.awarded_lessons+" bài đạt trong tuần")));
}
function parseLines(value){
 const lines=value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!lines.length)throw Error("Chưa nhập dòng JSON nào.");
 if(lines.length>50)throw Error("Tối đa 50 câu/lượt.");
 const found=new Set(),items=[];
 for(let i=0;i<lines.length;i++){
  let obj;
  try{obj=JSON.parse(lines[i]);}catch{throw Error("Dòng "+(i+1)+" không đúng JSON.");}
  let item;
  try{item=validate(obj);}catch(e){throw Error("Dòng "+(i+1)+": "+e.message);}
  const key=[item.cap,item.bai,item.kind,item.prompt.normalize("NFKC").toLowerCase()].join("|");
  if(found.has(key))throw Error("Dòng "+(i+1)+" trùng câu hỏi trong lượt nhập.");
  found.add(key);items.push(item);
 }
 return items;
}
async function init(){
 for(let n=1;n<=15;n++)$("mzBankBai").append(new Option("Bài "+n,String(n)));
 const url=localStorage.getItem("mrlee_admin_supabase_url")||URL_DEFAULT;
 const key=localStorage.getItem("mrlee_admin_supabase_publishable")||KEY_DEFAULT;
 try {
  if(!window.supabase?.createClient)throw Error("Không tải được thư viện Supabase.");
  client=window.supabase.createClient(url,key);
  const {data:{session},error}=await client.auth.getSession();
  if(error)throw error;
  if(!session?.user)throw Error("Chưa đăng nhập tài khoản Admin Supabase.");
  const {data:allowed,error:checkError}=await client.from("mrlee_admins").select("user_id")
     .eq("user_id",session.user.id).maybeSingle();
  if(checkError)throw checkError;
  if(!allowed?.user_id)throw Error("Tài khoản chưa được cấp quyền Admin.");
  user=session.user;ready=true;
  $("mzAdminBody").hidden=false;$("mzAdminLocked").hidden=true;
  notice("✓ Đã xác minh quyền quản trị: "+(user.email||"Admin"));
  await Promise.all([refreshCounts(),refreshBank(),refreshWeekly()]);
 }catch(e){
  $("mzAdminBody").hidden=true;$("mzAdminLocked").hidden=false;
  notice("Không truy cập được: "+(e.message||e),true);
 }
}
$("mzReload").addEventListener("click",()=>{if(ready)Promise.all([refreshCounts(),refreshBank(),refreshWeekly()]).catch(e=>notice(e.message,true));});
$("mzBankCap").addEventListener("change",refreshBank);
$("mzBankBai").addEventListener("change",refreshBank);
$("mzImportInput").addEventListener("input",()=>{$("mzImport").disabled=true;pending=[];});
$("mzPreview").addEventListener("click",()=>{
 try {
  pending=parseLines($("mzImportInput").value);
  $("mzImportStatus").textContent="✓ "+pending.length+" câu hợp lệ về định dạng. Vẫn cần giáo viên duyệt phạm vi bài và chất lượng ngôn ngữ.";
  $("mzImport").disabled=!ready;
 }catch(e){pending=[];$("mzImport").disabled=true;$("mzImportStatus").textContent="⚠ "+e.message;}
});
$("mzImport").addEventListener("click",async()=>{
 if(!ready||!pending.length)return;
 $("mzImport").disabled=true;
 const {error}=await client.from("mrlee_game_questions").insert(pending);
 if(error){$("mzImportStatus").textContent="Không nhập được: "+error.message;return;}
 $("mzImportStatus").textContent="Đã nhập "+pending.length+" câu CHƯA duyệt. Kiểm tra từng câu trước khi bật điểm xác minh.";
 $("mzImportInput").value="";pending=[];
 await Promise.all([refreshCounts(),refreshBank()]);
});
init();
})();