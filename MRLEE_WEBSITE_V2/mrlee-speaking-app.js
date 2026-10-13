import { SPEAKING_BANK } from './mrlee-speaking-bank.js';
import { ADVANCED_SPEAKING_BANK } from './mrlee-speaking-advanced.js';
import { DEEP_SPEAKING_BANK } from './mrlee-speaking-deep.js';
import { SETTINGS, speechSupported, waitForUser, loadWallet, similarity, commitSpeaking, recentAttempts, calculateDelta, claimDailyLogin, speechStreakBonus } from './mrlee-points-core.js';

const $ = id=>document.getElementById(id);
const catalogue=[...SPEAKING_BANK,...ADVANCED_SPEAKING_BANK,...DEEP_SPEAKING_BANK];
const recoveryTasks=[
  {id:'recovery-1',kind:'recovery',level:'recovery',title:'Phục hồi điểm · Bài A',subtitle:'Đọc 3 câu cơ bản để lấy lại 15 điểm',returnUrl:'luyen-noi-tinh-diem.html',items:[
    {ko:'안녕하세요. 만나서 반갑습니다.',vi:'Xin chào. Rất vui được gặp bạn.'},
    {ko:'저는 한국어를 열심히 공부합니다.',vi:'Tôi chăm chỉ học tiếng Hàn.'},
    {ko:'오늘도 좋은 하루 보내세요.',vi:'Chúc bạn một ngày tốt lành.'}
  ]},
  {id:'recovery-2',kind:'recovery',level:'recovery',title:'Phục hồi điểm · Bài B',subtitle:'Đọc 3 câu giao tiếp để lấy lại 15 điểm',returnUrl:'luyen-noi-tinh-diem.html',items:[
    {ko:'천천히 말씀해 주시겠어요?',vi:'Bạn có thể nói chậm lại được không?'},
    {ko:'도와주셔서 정말 감사합니다.',vi:'Xin chân thành cảm ơn vì đã giúp đỡ.'},
    {ko:'저는 매일 조금씩 연습하고 있어요.',vi:'Tôi luyện tập từng chút mỗi ngày.'}
  ]}
];
const tasks=[...catalogue,...recoveryTasks];
let tab='sc1', user=null, wallet=null, active=null, answers=[], startedAt=0, listening=null, submitting=false, recordingAllowed=speechSupported;
let cachedHistory=[];
const e=(tag,cls,txt)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=String(txt);return node;};
function message(t,type='warning'){
  const el=$('mpStatus');el.textContent=t;el.className=type==='success'?'mp-success':type==='error'?'mp-error':'mp-warning';
}
function pointsBar(){
  if (!wallet) return;
  $('mpBalance').textContent=wallet.balance;
  $('mpEarned').textContent=wallet.earned;
  $('mpLost').textContent=wallet.lost;
  $('mpCount').textContent=wallet.attempts;
  if($('mpStreak'))$('mpStreak').textContent=wallet.loginStreak||0;
  if($('mpBestStreak'))$('mpBestStreak').textContent=wallet.bestStreak||0;
  if($('mpLoginDays'))$('mpLoginDays').textContent=wallet.loginDays||0;
}
function isLocked(){return Boolean(wallet && wallet.balance < SETTINGS.minimum);}
function openTab(next){
  tab=next;
  for(const btn of $('mpTabs').querySelectorAll('button'))btn.setAttribute('aria-pressed',String(btn.dataset.tab===tab));
  $('mpPractice').classList.add('mp-hidden');
  $('mpCatalogSection').classList.remove('mp-hidden');
  const grid=$('mpCatalog');grid.replaceChildren();
  const pool=tasks.filter(t=>t.level===tab);
  for(const task of pool){
    const card=e('article','mp-task');
    card.append(e('strong','',task.title),e('small','',`${task.subtitle} · ${task.items.length} câu`));
    const btn=e('button','mp-btn primary',task.kind==='recovery'?'Luyện phục hồi (+15)':'Bắt đầu luyện nói');btn.type='button';
    const disabled=(!user || !recordingAllowed || isLocked() && task.kind!=='recovery');
    btn.disabled=disabled;
    if(isLocked() && task.kind!=='recovery') card.append(e('small','',`🔒 Cần ít nhất ${SETTINGS.minimum} điểm. Vào bài phục hồi.`));
    btn.addEventListener('click',()=>selectTask(task.id));
    card.append(btn);grid.append(card);
  }
}
function speak(text){
  if (!('speechSynthesis' in window)) return message('Trình duyệt không hỗ trợ đọc văn bản.', 'error');
  window.speechSynthesis.cancel();
  const utter=new SpeechSynthesisUtterance(text);utter.lang='ko-KR';utter.rate=.85;
  const voices=window.speechSynthesis.getVoices();
  const korean=voices.find(v=>v.lang?.toLowerCase()==='ko-kr') || voices.find(v=>v.lang?.toLowerCase().startsWith('ko'));
  if(korean)utter.voice=korean;
  window.speechSynthesis.speak(utter);
}
function updateProgress(){
  const done=answers.filter(x=>x!==null).length, percent=Math.round(done/answers.length*100);
  $('mpProgressFill').style.width=`${percent}%`;
  $('mpProgress').setAttribute('aria-valuenow',String(percent));
  const heard=answers.filter(x=>x?.heard?.trim()).length;
  $('mpFinish').disabled=!user || !speechSupported || done!==answers.length || heard<Math.ceil(answers.length/2) || submitting;
}
function selectTask(id){
  const task=tasks.find(t=>t.id===id);if(!task)return;
  if (!user) return message('Bạn cần đăng nhập và xác minh email để tính điểm.', 'error');
  if(!speechSupported)return message('Trình duyệt chưa hỗ trợ micro nhận diện tiếng Hàn. Hãy thử Chrome hoặc Edge.', 'error');
  if(isLocked() && task.kind!=='recovery')return openTab('recovery');
  if(listening){try{listening.abort();}catch{}listening=null;}
  active=task;answers=task.items.map(()=>null);startedAt=Date.now();
  $('mpPracticeTitle').textContent=task.title;
  $('mpPracticeMeta').textContent=task.kind==='recovery'?'Hoàn thành ≥65/100 để phục hồi +15 điểm; thất bại không bị trừ. Mỗi bài phục hồi thưởng tối đa một lần/ngày.':`Nói lại ${task.items.length} câu. ≥85: +10; ≥60: +6; dưới 60: −3. Streak từ 7 ngày: cộng thêm 1–3 điểm khi làm tốt. Một lần tính điểm mỗi bài/ngày (UTC).`;
  $('mpReturn').href=task.returnUrl;
  $('mpFeedback').replaceChildren();
  $('mpCatalogSection').classList.add('mp-hidden');$('mpPractice').classList.remove('mp-hidden');
  const container=$('mpWords');container.replaceChildren();
  task.items.forEach((item,i)=>{
    const card=e('article','mp-word');card.dataset.index=String(i);
    card.append(e('div','mp-small',`Câu ${i+1} / ${task.items.length}`),e('div','ko',item.ko),e('p','',item.vi));
    const actions=e('div','mp-actions');
    const play=e('button','mp-btn','🔊 Nghe mẫu');play.type='button';play.addEventListener('click',()=>speak(item.ko));
    const mic=e('button','mp-btn primary','🎤 Nói lại');mic.type='button';mic.addEventListener('click',()=>record(i,mic));
    const skip=e('button','mp-btn','Bỏ qua');skip.type='button';skip.addEventListener('click',()=>{if(listening)return;answers[i]={heard:'',score:0,skipped:true};card.classList.add('mp-low');card.querySelector('.mp-result').textContent='Đã bỏ qua: 0 điểm câu này.';updateProgress();});
    actions.append(play,mic,skip);card.append(actions,e('div','mp-result'));container.append(card);
  });
  updateProgress();
  $('mpPractice').scrollIntoView({behavior:'smooth',block:'start'});
}
function record(i,btn){
  if(listening)return message('Micro đang nhận diện câu khác. Hãy chờ hoàn thành.', 'warning');
  if(!active || !speechSupported)return;
  try{window.speechSynthesis?.cancel();}catch{}
  const Speech=window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec=new Speech();rec.lang='ko-KR';rec.interimResults=false;rec.continuous=false;rec.maxAlternatives=1;
  const card=$('mpWords').querySelector(`[data-index="${i}"]`);
  const status=card.querySelector('.mp-result');
  let hasResult=false;listening=rec;
  btn.disabled=true;btn.textContent='🎙️ Đang nghe…';status.textContent='Hãy nói rõ câu tiếng Hàn vào micro.';
  rec.onresult=event=>{
    hasResult=true;
    const heard=event.results?.[0]?.[0]?.transcript || '';
    const score=similarity(active.items[i].ko,heard);
    answers[i]={heard,score,skipped:false};
    card.classList.toggle('mp-done',score>=60);
    card.classList.toggle('mp-low',score<60);
    status.replaceChildren(e('strong','',`Mức khớp ${score}/100 · `),e('em','',`Máy nghe được: ${heard || '(trống)'}`));
    updateProgress();
  };
  rec.onerror=event=>{
    let reason=event.error || 'unknown';
    const notes={'not-allowed':'Micro bị từ chối quyền truy cập.','no-speech':'Chưa phát hiện giọng nói.',network:'Lỗi dịch vụ nhận diện hoặc kết nối mạng.','language-not-supported':'Trình duyệt chưa hỗ trợ tiếng Hàn.'};
    status.textContent=notes[reason] || `Không nhận diện được (${reason}). Thử lại hoặc bỏ qua.`;
  };
  rec.onend=()=>{if(listening===rec)listening=null;btn.disabled=false;btn.textContent='🎤 Nói lại';if(!hasResult && status.textContent.includes('Đang nghe')) status.textContent='Không nhận diện được. Hãy thử lại.';};
  try{rec.start();}catch(e){listening=null;btn.disabled=false;btn.textContent='🎤 Nói lại';status.textContent=`Không mở được micro: ${e.message}`;}
}
function currentAverage(){return Math.round(answers.reduce((n,x)=>n+(x?.score || 0),0)/answers.length);}
async function finish(){
  if(!active||!user||submitting)return;
  if(answers.some(x=>x===null)||answers.filter(x=>x?.heard).length<Math.ceil(answers.length/2)) return;
  submitting=true;$('mpFinish').disabled=true;
  const score=currentAverage(),delta=calculateDelta(score,active.kind==='recovery'?'recovery':'normal',wallet?.loginStreak||0);
  const summary=e('div',score>=60?'mp-success':'mp-warning',`Kết quả ${score}/100. ${active.kind==='recovery'?(delta>0?'Dự kiến phục hồi +'+delta:'Chưa đạt mức phục hồi.'):(score>=60?'Có thể nhận +1 điểm nếu chưa nhận thưởng cho bài này.':'Chưa đạt 60/100, không trừ điểm.')} Đang lưu…`);
  $('mpFeedback').replaceChildren(summary);
  try{
    const response=await commitSpeaking(user,active,score,answers,Math.floor((Date.now()-startedAt)/1000),active.kind==='recovery'?'recovery':'normal');
    if(response.status==='saved'){
      summary.textContent=`Đã lưu: ${score}/100 · ${response.delta>=0?'+':''}${response.delta} điểm · Số dư ${response.balance.toLocaleString("vi-VN")} điểm.`;
      wallet=await loadWallet(user);pointsBar();await refreshRecent();
      if(response.lessonRewardStatus==='already')summary.textContent+=' Bài này đã nhận +1 điểm trước đó.'; if(response.lessonRewardStatus==='error')summary.textContent+=' Lưu bài nói thành công nhưng chưa cộng được +1 điểm (kiểm tra Firestore Rules).'; if(!response.historySaved){summary.textContent+=' Lưu sổ điểm thành công, nhưng lịch sử/Supabase chưa cập nhật (cần kiểm tra quyền practiceAttempts).';}
      message(isLocked()?'Điểm dưới mức tối thiểu. Hãy vào bài phục hồi để mở khóa.':`Bạn còn ${wallet.balance} điểm. Có thể chọn bài học mới.`,isLocked()?'warning':'success');
    }else if(response.status==='already'){
      summary.textContent=`Bạn đã nộp bài này hôm nay. Lượt làm lại chỉ để ôn tập; thưởng +1 chỉ một lần cho mỗi bài. Số dư ${response.balance}.`;
    }else if(response.status==='locked'){
      summary.textContent='Điểm đang dưới ngưỡng mở khóa. Vui lòng luyện bài phục hồi.';
    }else if(response.status==='not-passed'){
      summary.textContent=`Đạt ${score}/100; cần ≥65 điểm để nhận thưởng phục hồi. Không bị trừ điểm, có thể thử lại.`;
    }
    openTab(isLocked()?'recovery':active.level==='recovery'?'recovery':active.level);
    // Preserve grading feedback: show at status even when returning to catalog.
    message(summary.textContent,response.status==='saved'?'success':'warning');
  }catch(e){summary.textContent=`Chưa lưu được điểm: ${e?.message||e}. Giữ nguyên bài để thử lưu lại.`;message(summary.textContent,'error');}
  finally{submitting=false;updateProgress();}
}
async function refreshRecent(){
  if(!user)return;
  const place=$('mpHistory');
  try{
    cachedHistory=await recentAttempts(user);place.replaceChildren();
    if(!cachedHistory.length){place.textContent='Chưa có bài nói được tính điểm.';return;}
    for(const item of cachedHistory){
      const row=e('div','',`${item.taskTitle} · ${item.score}/100 · ${item.delta>=0?'+':''}${item.delta} điểm · ${item.createdAt?.toDate?.()?.toLocaleString('vi-VN')||'mới lưu'}`);
      row.style.padding='9px 0';row.style.borderBottom='1px solid #edf2f8';
      const view=e('button','mp-btn','👁 Xem từng câu');view.type='button';view.style.marginLeft='10px';
      view.addEventListener('click',()=>reviewAttempt(item));row.append(view);place.append(row);
    }
  }catch(e){place.textContent=`Không đọc được lịch sử nói: ${e?.code||e?.message}`;}
}
function reviewAttempt(record){
  const target=tasks.find(t=>t.id===record.taskId);
  const body=$('mpReviewDetails');body.replaceChildren();
  let spoken=[];try{spoken=JSON.parse(record.transcriptJson||'[]')}catch{}
  if(!target || !Array.isArray(spoken)){body.textContent='Không đọc được nội dung chi tiết.';}
  else target.items.forEach((item,i)=>{
    const reply=spoken[i]||{};const piece=e('div','mp-word');piece.style.marginBottom='10px';
    piece.append(e('div','ko',item.ko),e('p','',item.vi),e('div','mp-small',`Máy nghe được: ${reply.heard||'(bỏ qua)'} · Mức khớp ${Number(reply.score)||0}/100`));
    const hear=e('button','mp-btn','🔊 Nghe lại câu mẫu');hear.type='button';hear.addEventListener('click',()=>speak(item.ko));piece.append(hear);body.append(piece);
  });
  $('mpReview').classList.remove('mp-hidden');$('mpReview').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function attach(){
  $('mpTabs').addEventListener('click',ev=>{const b=ev.target.closest('[data-tab]');if(b)openTab(b.dataset.tab);});
  $('mpBack').addEventListener('click',()=>{if(listening){try{listening.abort()}catch{}listening=null;}openTab(active?.level==='recovery'?'recovery':active?.level||'sc1');});
  $('mpFinish').addEventListener('click',finish);
  $('mpReviewClose').addEventListener('click',()=>$('mpReview').classList.add('mp-hidden'));
}
async function init(){
  attach();openTab('sc1');
  if(!speechSupported) message('Trình duyệt không hỗ trợ nhận diện giọng nói tiếng Hàn. Hãy mở bằng Chrome hoặc Edge và cấp quyền micro. Bạn vẫn có thể xem danh mục và nghe mẫu, nhưng không thể tính điểm.','error');
  try{
    user=await waitForUser();
    let checkin=null;try{checkin=await claimDailyLogin(user);}catch(err){console.warn('Chưa thưởng đăng nhập:',err?.code||err?.message);}
    wallet=await loadWallet(user);pointsBar();
    const loginAnnouncement=checkin?.status==='saved'?`🎁 Điểm danh +${checkin.delta} điểm · Streak ${checkin.streak} ngày! `:'';
    message(isLocked()?`Bạn đang có ${wallet.balance} điểm, dưới mức tối thiểu ${SETTINGS.minimum}. Bài mới tạm khóa; hãy làm bài phục hồi để mở lại.`:
      `${loginAnnouncement}Xin chào ${user.displayName||user.email}. Bạn có ${wallet.balance} điểm. Chọn một bài nói để bắt đầu.`,isLocked()?'warning':'success');
    openTab(isLocked()?'recovery':(['sc1','sc2','sc3','sc4','sc5','sc6','topic','recovery'].includes(new URLSearchParams(location.search).get('tab')) ? new URLSearchParams(location.search).get('tab') : 'sc1'));await refreshRecent();
    const selected=new URLSearchParams(location.search).get('task');
    if(selected&&tasks.some(t=>t.id===selected)) {
      const found=tasks.find(t=>t.id===selected);
      if(!isLocked() || found.kind==='recovery') selectTask(selected);
    }
  }catch(e){message(`${e.message}  Mở trang Tài khoản để đăng nhập.`, 'error');
    const link=eNode('a','mp-btn primary','Đăng nhập học viên');link.href='dang-nhap.html';$('mpStatus').append(' ',link);
  }
}
function eNode(tag,cls,text){return e(tag,cls,text);}
init();
