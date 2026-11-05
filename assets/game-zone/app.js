/* MR LEE GAME ZONE phase 1. Session practice XP is not an official reward. */
import {MODES, LEVELS, el, button} from "./core.js";
import {loadLesson, loadWordAudio} from "./content.js";
import {GAME_RUNNERS} from "./games.js";
import {PHASE2_RUNNERS} from "./phase2.js";
import {PHASE3_RUNNERS} from "./phase3.js";
import {initVerifiedChallenge} from "./verified.js";
const ALL_RUNNERS=Object.freeze({...GAME_RUNNERS,...PHASE2_RUNNERS,...PHASE3_RUNNERS});

const $=id=>document.getElementById(id);
const state={cap:1,bai:1,lesson:null,xp:0,wins:0,sequence:0,cleanup:null,mode:null};
const params=new URLSearchParams(location.search);
function clamp(v,maximum) {const n=Number(v);return Number.isInteger(n)&&n>=1&&n<=maximum?n:1;}
state.cap=clamp(params.get("cap"),6);state.bai=clamp(params.get("bai"),15);
$("mzLevel").value=String(state.cap);
function fillLessons(){
  const picker=$("mzLesson");picker.replaceChildren();
  for(let i=1;i<=15;i++)picker.append(new Option("Bài "+i,String(i)));
  picker.value=String(state.bai);
}
function notice(message,error=false){
  $("mzNotice").textContent=message;$("mzNotice").dataset.error=String(error);
}
function showLobby() {
  stopGame();
  $("mzLobby").hidden=false;$("mzArena").hidden=true;
}
function stopGame() {
  state.sequence++;
  if(typeof state.cleanup==="function")state.cleanup();
  state.cleanup=null;
  const audio=$("mzGame").querySelector("audio");
  if(audio)audio.pause();
  $("mzGame").replaceChildren();
  $("mzFeedback").textContent="";
  $("mzResult").hidden=true;$("mzResult").replaceChildren();
}
function feedback(message,good) {
  $("mzFeedback").textContent=message;
  if(good===null)delete $("mzFeedback").dataset.good;
  else $("mzFeedback").dataset.good=String(good);
}
function updateScore(){
  $("mzXP").textContent=String(state.xp);
  $("mzWins").textContent=String(state.wins);
}
function renderModes(){
  const root=$("mzCards");root.replaceChildren();
  for(const mode of MODES) {
    const card=button("","mz-card");
    card.dataset.gameMode=mode.id;
    card.setAttribute("aria-label","Chơi "+mode.label);
    const art=el("span","mz-cover-art");
    art.setAttribute("aria-hidden","true");
    art.append(el("span","mz-cover-label","✦ MR LEE GAME ZONE"),
               el("span","mz-cover-glow",mode.icon));
    card.append(art,el("strong","",mode.label),
                el("small","",mode.ko),el("p","",mode.desc));
    card.addEventListener("click",()=>beginGame(mode.id));
    root.append(card);
  }
}
function linkParams(){
  $("mzStudy").href="hoc-theo-bai.html?cap="+state.cap+"&bai="+state.bai;
  const url=new URL(location.href);
  url.searchParams.set("cap",String(state.cap));url.searchParams.set("bai",String(state.bai));
  url.searchParams.delete("game");history.replaceState(null,"",url);
}
async function selectLesson(){
  showLobby();linkParams();
  const sequence=++state.sequence;
  state.lesson=null;
  notice("Đang kiểm tra nội dung "+LEVELS[state.cap-1]+" – Bài "+state.bai+"...");
  $("mzCards").querySelectorAll("button").forEach(b=>b.disabled=true);
  try {
    const lesson=await loadLesson(state.cap,state.bai);
    if(state.sequence!==sequence)return;
    state.lesson=lesson;
    notice("Đã tải "+LEVELS[state.cap-1]+" · Bài "+state.bai+" ("+lesson.title+") · "+lesson.words.length+" từ, "+lesson.sentences.length+" câu mẫu.");
  } catch(err) {
    if(state.sequence!==sequence)return;
    notice("Không tải được bài: "+String(err?.message||err),true);
  } finally {
    if(state.sequence===sequence)$("mzCards").querySelectorAll("button").forEach(b=>b.disabled=!state.lesson);
  }
}
async function beginGame(id){
  const mode=MODES.find(m=>m.id===id),run=ALL_RUNNERS[id];
  if(!mode || !run || !state.lesson){notice("Vui lòng tải bài học trước khi chơi.",true);return;}
  stopGame();
  state.mode=id;
  const sequence=state.sequence,lesson=state.lesson;
  $("mzLobby").hidden=true;$("mzArena").hidden=false;
  $("mzArena").dataset.gameMode=id;
  $("mzArenaTitle").textContent=mode.label;
  $("mzMode").textContent=mode.ko+" · "+LEVELS[state.cap-1]+" – Bài "+state.bai;
  $("mzGame").append(el("p","","Đang chuẩn bị trò chơi..."));
  $("mzArena").scrollIntoView({behavior:"smooth",block:"start"});
  try {
    const audio=id==="listening"?await loadWordAudio(state.cap,state.bai):null;
    if(sequence!==state.sequence)return;
    $("mzGame").replaceChildren();
    let ended=false;
    state.cleanup=run({
      host:$("mzGame"),lesson,audio,
      active:()=>sequence===state.sequence && !ended,
      feedback,
      finish:result=>{
        if(ended || sequence!==state.sequence)return;
        ended=true;
        const correct=Number(result.correct)||0,total=Number(result.total)||0;
        const mistakes=Math.max(0,Number(result.mistakes)||0);
        const skips=Math.max(0,Number(result.skips)||0);
        const earned=Math.max(0,Math.min(50,correct*7-mistakes*2-skips));
        state.xp+=earned;state.wins++;updateScore();
        const root=$("mzResult");root.hidden=false;root.replaceChildren();
        root.append(el("strong","", "🏆 Hoàn thành!"),
                    el("p","",correct+"/"+total+" mục đúng • "+mistakes+" lần thử sai • +"+earned+" XP luyện tập"),
                    el("p","", "XP chỉ tính trong phiên trình duyệt, chưa ghi vào hồ sơ học viên hoặc bảng điểm tuần."),
                    button("Chơi lại","mz-primary",()=>beginGame(id)));
        feedback("Đã hoàn thành! Bạn có thể chơi lại hoặc chọn bài khác.",true);
      }
    });
  } catch(err){
    if(sequence!==state.sequence)return;
    $("mzGame").replaceChildren(el("h3","","Không thể mở trò chơi"),el("p","",String(err?.message||err)));
    feedback("Chưa tính điểm. Kiểm tra nội dung hoặc tệp nghe rồi thử lại.",false);
  }
}
$("mzLevel").addEventListener("change",()=>{
  state.cap=clamp($("mzLevel").value,6);state.bai=1;fillLessons();selectLesson();
});
$("mzLesson").addEventListener("change",()=>{
  state.bai=clamp($("mzLesson").value,15);selectLesson();
});
$("mzBack").addEventListener("click",showLobby);
$("mzReplay").addEventListener("click",()=>{if(state.mode)beginGame(state.mode);});
// Brand every learning-game table with the approved MR LEE logo.
const brand=el("span","mz-play-brand");
const logo=document.createElement("img");
logo.src="assets/branding/logo-mrlee.png?v=20261026-meme1";
logo.alt="";logo.width=28;logo.height=28;
brand.append(logo,el("span","","MR LEE · GAME ZONE"));
$("mzArena").querySelector(".mz-arena-top")?.append(brand);
fillLessons();renderModes();updateScore();selectLesson();
initVerifiedChallenge(()=>({cap:state.cap,bai:state.bai}));
