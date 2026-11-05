/* MR LEE GAME ZONE: browser client for verified server-only XP challenges.
 * Not an authority: answers, score and rewards are validated in PostgreSQL RPC.
 */
// Load Firebase SDK only when the learner opts into server scoring.
// A blocked CDN must not prevent any of the ten local learning games.
import {firebaseConfig,isFirebaseConfigured} from "../../firebase-config.js";
import {el,button} from "./core.js";
const ENDPOINT="https://pkxqsboyotlyoizzxizb.supabase.co/functions/v1/mrlee-game-zone";
const $=id=>document.getElementById(id);
const state={session:null,answers:[],i:0,working:false,ready:false,expiry:null};
const safe=(x)=>String(x??"");
async function token(){
 if(!isFirebaseConfigured)throw Error("Firebase chưa được cấu hình.");
 const [{initializeApp,getApps},{getAuth}]=await Promise.all([
  import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
  import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")
 ]);
 const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(firebaseConfig);
 const user=getAuth(app).currentUser;
 if(!user||!user.emailVerified)throw Error("Cần đăng nhập và xác minh email học viên trước khi nhận XP.");
 return user.getIdToken();
}
async function request(action,{method="GET",body,auth=false}={}){
 const headers={};
 if(body!==undefined)headers["Content-Type"]="application/json";
 if(auth)headers.Authorization="Bearer "+await token();
 const query="?action="+encodeURIComponent(action);
 const res=await fetch(ENDPOINT+query,{
  method,headers,body:body!==undefined?JSON.stringify(body):undefined,cache:"no-store"
 });
 let result=null;
 try{result=await res.json();}catch{throw Error("Máy chủ trả dữ liệu không hợp lệ.");}
 if(!res.ok||result.ok===false)throw Error(result.error||"Lỗi kết nối Game Zone.");
 return result;
}
const note=(message,bad=false)=>{
 const x=$("mzVerifiedStatus");
 if(x){x.textContent=message;x.dataset.error=String(bad);}
};
export async function refreshGameRanking(){
 const root=$("mzVerifiedRanking");
 if(!root)return;
 root.replaceChildren(el("p","mz-minor","Đang tải bảng thành tích..."));
 try{
  const result=await request("leaderboard");
  root.replaceChildren();
  const week=el("p","mz-minor","Tuần bắt đầu "+result.week_start+" · giờ Việt Nam");
  root.append(week);
  if(!result.leaderboard.length){
    root.append(el("p","mz-minor","Chưa có bài đạt XP xác minh trong tuần này."));
    return;
  }
  const list=el("ol","mz-ranked-list");
  for(const row of result.leaderboard){
    const line=el("li","mz-rank-row");
    line.append(el("span","",safe(row.alias)),el("strong","",Number(row.xp||0)+" XP"));
    list.append(line);
  }
  root.append(list);
 }catch(err){
  root.replaceChildren(el("p","mz-minor","Bảng điểm xác minh chưa sẵn sàng: "+err.message));
 }
}
async function refreshMine(){
 const root=$("mzMyVerified");
 try{
  const me=await request("me",{auth:true});
  root.textContent="Điểm xác minh tuần này: "+me.xp+" XP · "+me.awarded_lessons+" bài đã đạt";
 }catch{root.textContent="Đăng nhập học viên để xem XP đã xác minh.";}
}
function showQuestion(){
 const root=$("mzVerifiedQuestion");
 if(!state.session)return;
 if(Date.now()>new Date(state.expiry).getTime()){
  state.session=null;root.replaceChildren();
  note("Đề xác minh đã hết hạn. Bắt đầu một đề mới.",true);return;
 }
 const q=state.session.questions[state.i];
 root.replaceChildren();
 root.append(el("p","mz-minor","Câu "+(state.i+1)+"/5 · "+q.kind));
 const prompt=el("div","mz-prompt",safe(q.prompt));
 root.append(prompt);
 const opts=el("div","mz-option-grid");
 for(let n=0;n<4;n++){
  const b=button((n+1)+". "+safe(q.options[n]),"mz-option",()=>{
   if(state.working)return;
   state.answers[state.i]=n;
   state.i++;
   if(state.i===5)showFinish();
   else showQuestion();
  });
  opts.append(b);
 }
 root.append(opts);
}
function showFinish(){
 const root=$("mzVerifiedQuestion");
 root.replaceChildren(el("h3","","Đã trả lời 5/5 câu"));
 const b=button("Nộp và nhận kết quả từ máy chủ","mz-primary",async()=>{
  if(state.working||!state.session)return;
  state.working=true;b.disabled=true;
  note("Đang để máy chủ đối chiếu đáp án...");
  try{
   const result=await request("finish",{method:"POST",auth:true,body:{
    session_id:state.session.session_id,answers:state.answers
   }});
   state.session=null;
   const r=result.result;
   root.replaceChildren(
    el("h3","","🏅 Kết quả máy chủ: "+r.correct+"/"+r.total+" câu"),
    el("p","","+"+r.xp+" XP xác minh • Không cộng vào TOPIK Spark."),
    el("p","mz-minor",r.xp===0?"Chưa đủ điều kiện, đã nhận thưởng bài này trong tuần, hoặc đạt giới hạn XP/ngày.":"Đã ghi điểm riêng vào bảng xếp hạng Game Zone.")
   );
   note("Máy chủ đã chấm kết quả. Tài khoản sẽ không được cộng trùng cùng bài trong tuần.");
   await Promise.all([refreshGameRanking(),refreshMine()]);
  }catch(err){
   note("Không nộp được: "+err.message,true);
   b.disabled=false;
  }finally{state.working=false;}
 });
 root.append(b);
}
export function initVerifiedChallenge(getScope){
 const start=$("mzVerifiedStart");
 if(!start)return;
 start.disabled=true;
 request("status").then(res=>{
  state.ready=res.status==="ready";
  if(state.ready){
   start.disabled=false;
   note(res.verifiedQuestionCount+" câu đã duyệt trong ngân hàng tính điểm. Bài hiện tại cần ít nhất 5 câu.");
  }else{
   note("Chưa đủ câu hỏi đã duyệt cho hệ thống điểm xác minh. 10 trò chơi vẫn luyện tập bình thường.");
  }
 }).catch(err=>note("Hệ thống điểm máy chủ chưa sẵn sàng: "+err.message,true));
 start.addEventListener("click",async()=>{
  if(state.working||!state.ready)return;
  const {cap,bai}=getScope();
  state.working=true;start.disabled=true;
  note("Đang lấy đề máy chủ cho Cấp "+cap+" – Bài "+bai+"...");
  try{
   const data=await request("start",{method:"POST",auth:true,body:{cap,bai}});
   state.session=data;state.answers=[];state.i=0;state.expiry=data.expires_at;
   note("Đã cấp 5 câu từ ngân hàng riêng. Lưu ý: thời gian nộp tối đa 10 phút.");
   showQuestion();
  }catch(err){note("Chưa mở được thử thách: "+err.message,true);}
  finally{state.working=false;start.disabled=!state.ready;}
 });
 refreshGameRanking();refreshMine();
}
