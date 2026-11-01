import { LEVELS,ROADMAP_UNITS } from './mrlee-roadmap-bank.js';
import {waitForUser,loadWallet,claimDailyLogin,recentAttempts,SETTINGS} from './mrlee-points-core.js';
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);let chosen=Math.min(6,Math.max(1,Number(params.get('level'))||1));
const e=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=String(txt);return el;};
const detail=(l,n)=>ROADMAP_UNITS.find(x=>x.level===l&&x.number===n);
const qs=(l,n)=>`lo-trinh-1-6.html?level=${l}&lesson=${n}`;
function renderLevels(){
 const container=$('rmLevelGrid');container.replaceChildren();
 for(const lvl of LEVELS){
  const b=e('button','level-card');b.type='button';b.setAttribute('aria-pressed',String(lvl.level===chosen));
  const first=e('div','level-line');const chip=e('span','level-chip',`CẤP ${lvl.level} · ${lvl.badge}`);chip.style.background=lvl.color;first.append(chip,e('span','level-band',lvl.band));
  b.append(first,e('div','level-title',lvl.name),e('div','level-ko',lvl.ko),e('div','level-summary',lvl.summary));
  const foot=e('div','level-foot');foot.append(e('span','',`${15} bài học`),e('span','','Xem lộ trình →'));b.append(foot);
  b.addEventListener('click',()=>selectLevel(lvl.level));container.append(b);
 }
}
function renderUnits(){
 const lvl=LEVELS.find(x=>x.level===chosen);$('rmChosenTitle').textContent=`Cấp ${chosen} · ${lvl.name}`;
 $('rmChosenDesc').textContent=`${lvl.speaking} · ${lvl.source}`;
 const grid=$('rmLessonGrid');grid.replaceChildren();
 for(const unit of ROADMAP_UNITS.filter(x=>x.level===chosen)){
  const card=e('article','unit');card.append(e('span','unit-index',`BÀI ${String(unit.number).padStart(2,'0')} · ${unit.ko}`),e('strong','',unit.title),e('small','',unit.goal));
  const actions=e('div','unit-actions');const learn=e('a','primary','📖 Vào bài');learn.href=unit.lessonUrl;
  const speaking=e('a','','🎤 Luyện nói');speaking.href=unit.speakingUrl;
  actions.append(learn,speaking);card.append(actions);grid.append(card);
 }
}
function selectLevel(n){chosen=n;history.replaceState(null,'',`${location.pathname}?level=${n}#levels`);renderLevels();renderUnits();$('rmDetail').classList.add('hidden');}
function play(text){if(!window.speechSynthesis){$('rmStatus').textContent='Trình duyệt không hỗ trợ phát giọng nói.';return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';u.rate=.85;const v=speechSynthesis.getVoices().find(x=>x.lang?.toLowerCase().startsWith('ko'));if(v)u.voice=v;speechSynthesis.speak(u);}
function showUnit(unit){
 const box=$('rmDetail');$('rmDetailTag').textContent=`CẤP ${unit.level} · BÀI ${unit.number} / 15 · ${unit.ko}`;
 $('rmDetailTitle').textContent=unit.title;$('rmDetailGoal').textContent=unit.goal;
 $('rmGrammar').textContent=unit.grammar;$('rmPrompt').textContent=unit.prompt;
 const samples=$('rmSamples');samples.replaceChildren();
 for(const sample of unit.samples){const row=e('div','sample');row.append(e('div','ko',sample.ko),e('div','vi',sample.vi));const button=e('button','','🔊 Nghe mẫu');button.type='button';button.addEventListener('click',()=>play(sample.ko));row.append(button);samples.append(row);}
 $('rmDoSpeaking').href=unit.speakingUrl;$('rmOriginalLesson').href=unit.source==='existing'?unit.lessonUrl:unit.speakingUrl;
 $('rmOriginalLesson').textContent=unit.source==='existing'?'📖 Mở bài học gốc':'🎤 Luyện tiếp 4 câu';
 box.classList.remove('hidden');requestAnimationFrame(()=>box.scrollIntoView({behavior:'smooth',block:'start'}));
}
function drawStats(wallet,student){
 $('rmPoints').textContent=`${wallet.balance.toLocaleString("vi-VN")} điểm`;$('rmStreak').textContent=wallet.loginStreak||0;
 $('rmBest').textContent=`Chuỗi dài nhất: ${wallet.bestStreak||0}`;$('rmLoginDays').textContent=wallet.loginDays||0;
 $('rmSpeakingCount').textContent=wallet.attempts||0;$('rmStudent').textContent=student?.displayName||student?.email||'Học viên';
}
async function init(){
 renderLevels();renderUnits();const lesson=Number(params.get('lesson'));
 if(Number.isInteger(lesson)&&lesson>=1&&lesson<=15){const unit=detail(chosen,lesson);if(unit)showUnit(unit);}
 try{
  const user=await waitForUser();let award=null;
  try{award=await claimDailyLogin(user);}catch(err){console.warn('Điểm danh chưa thành công:',err?.code||err?.message)}
  const wallet=await loadWallet(user);drawStats(wallet,user);
  if(award?.status==='saved')$('rmStatus').textContent=`🎁 Điểm danh: +${award.delta} điểm hôm nay (UTC) · Streak ${award.streak} ngày. Chúc bạn học tốt!`;
  else $('rmStatus').textContent=wallet.balance<SETTINGS.minimum?`Điểm của bạn còn ${wallet.balance}; hãy luyện phục hồi để tiếp tục. Bạn vẫn có thể xem lộ trình.`:`✅ Chào mừng quay lại! Bạn đang có ${wallet.balance} điểm và streak ${wallet.loginStreak} ngày.`;
  if(award?.status!=='saved'&&wallet.loginDays===0)$('rmStatus').textContent+=' Để thưởng đăng nhập hoạt động, cần xuất bản Firestore Rules mới.';
 }catch(error){$('rmStatus').textContent='Bạn có thể khám phá toàn bộ chương trình. Đăng nhập và xác minh email để luyện nói tích điểm. '+(error?.message||'');}
}
init();
