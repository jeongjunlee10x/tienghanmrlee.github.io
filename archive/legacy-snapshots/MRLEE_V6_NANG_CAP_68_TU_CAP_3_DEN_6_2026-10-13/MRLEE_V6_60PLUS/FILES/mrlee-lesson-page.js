/* MR LEE FULL 1–6 V5 | nội dung theo bài, không truy xuất bài tương lai.
 * Câu luyện nói, câu hỏi, phương án nhiễu chỉ được lấy từ chính bài hoặc bài đã học.
 * Những câu có sẵn từ lộ trình nên được giáo viên duyệt ngôn ngữ khi xuất bản.
 */
import { LEVELS, ROADMAP_UNITS } from './mrlee-roadmap-bank.js';
import { LEVEL_TIPS } from './mrlee-vocab-bank.js';
import { SC_LESSONS } from './mrlee-sc-lesson-data.js?v=mrlee6-v6';
import { ADVANCED_LESSONS } from './mrlee-advanced-lesson-data.js?v=mrlee6-v6';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s??'').normalize('NFKC').trim().replace(/[\s,.?!。！？，]+/g,'').toLowerCase();
const p=new URLSearchParams(location.search);
const cap=Math.max(1,Math.min(6,Math.trunc(Number(p.get('cap')))||1));
const bai=Math.trunc(Number(p.get('bai')))||0;
const levelInfo=LEVELS.find(x=>x.level===cap), levelName=levelInfo?.name||`Cấp ${cap}`;
const currentPool=ROADMAP_UNITS.filter(x=>x.level===cap);
const data=[...SC_LESSONS,...ADVANCED_LESSONS].map(x=>({...x,ordinal:(x.cap-1)*15+x.bai})).sort((a,b)=>a.ordinal-b.ordinal);
const findData=(a,b)=>data.find(x=>x.cap===a&&x.bai===b);
const findRoadmap=(a,b)=>ROADMAP_UNITS.find(x=>x.level===a&&x.number===b);
function speak(ko){if(!('speechSynthesis' in window)){alert('Trình duyệt chưa hỗ trợ giọng đọc.');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(ko);u.lang='ko-KR';u.rate=.82;u.pitch=1;speechSynthesis.speak(u);}
function grammarExamples(g){
  const t=String(g.example||'');
  if(!t)return [];
  const ix=t.indexOf('→');
  if(ix<0)return [];
  const ko=t.slice(0,ix).trim();
  let vi=t.slice(ix+1).trim();
  const extraKorean=vi.search(/[가-힣]/); if(extraKorean>=0)vi=vi.slice(0,extraKorean).trim();
  if(!/[가-힣]/.test(ko)||!vi)return [];
  return [{ko,vi}];
}
const firstSc=[
  ['안녕하세요.','Xin chào.'],['저는 학생입니다.','Tôi là học sinh.'],['저는 대학생입니다.','Tôi là sinh viên đại học.'],
  ['저는 베트남 사람입니다.','Tôi là người Việt Nam.'],['제 이름은 민수입니다.','Tên tôi là Min-su.'],
  ['선생님입니까?','Bạn là giáo viên phải không?'],['학생입니까?','Bạn là học sinh phải không?'],
  ['저는 회사원입니다.','Tôi là nhân viên công ty.'],['이 사람은 의사입니다.','Người này là bác sĩ.'],
  ['저는 한국 사람입니까?','Tôi là người Hàn Quốc phải không?']
];
const firstAdvanced={
3:[
 ['기숙사 규칙을 꼭 지켜야 해요.','Phải tuân thủ nội quy ký túc xá.'],
 ['여기에서 담배를 피우면 안 돼요.','Không được hút thuốc ở đây.'],
 ['밤에는 조용히 해야 해요.','Ban đêm phải giữ yên lặng.'],
 ['공용 주방을 깨끗이 써야 해요.','Phải sử dụng bếp chung sạch sẽ.'],
 ['문을 열어 놓으면 안 돼요.','Không được để cửa mở.'],
 ['관리자에게 먼저 물어봐야 해요.','Phải hỏi người quản lý trước.']],
4:[
 ['고객이 기다리지 않도록 안내하겠습니다.','Tôi sẽ hướng dẫn để khách không phải chờ.'],
 ['문제가 발생할 경우 바로 보고하겠습니다.','Nếu phát sinh vấn đề tôi sẽ báo ngay.'],
 ['주문 내용을 다시 확인하도록 하겠습니다.','Tôi sẽ bảo đảm kiểm tra lại nội dung đặt hàng.'],
 ['고객이 요청할 경우 설명해 드리겠습니다.','Nếu khách yêu cầu tôi sẽ giải thích.'],
 ['불만이 반복되지 않도록 노력하겠습니다.','Tôi sẽ cố gắng để khiếu nại không lặp lại.'],
 ['추가 비용이 발생할 경우 미리 알리겠습니다.','Nếu có chi phí phát sinh tôi sẽ báo trước.']],
5:[
 ['교육 기회가 확대된다는 점에서 의미가 있습니다.','Điều này có ý nghĩa ở khía cạnh mở rộng cơ hội học tập.'],
 ['학습 격차를 무시할 수는 없습니다.','Không thể bỏ qua khoảng cách học tập.'],
 ['형평성도 검토하지 않을 수 없습니다.','Không thể không xem xét tính công bằng.'],
 ['접근성을 높인다는 점에서 긍정적입니다.','Tích cực ở khía cạnh nâng cao khả năng tiếp cận.'],
 ['교육 정책의 효과를 평가해야 합니다.','Cần đánh giá hiệu quả chính sách giáo dục.'],
 ['자료를 충분히 검토할 필요가 있습니다.','Cần xem xét kỹ dữ liệu.']],
6:[
 ['연구 결과에 입각하여 결론을 내렸습니다.','Chúng tôi đưa ra kết luận dựa trên kết quả nghiên cứu.'],
 ['이 연구는 가설을 검증하는 데 목적이 있습니다.','Nghiên cứu nhằm kiểm chứng giả thuyết.'],
 ['관찰 자료에 입각하여 설명하겠습니다.','Tôi sẽ giải thích dựa trên dữ liệu quan sát.'],
 ['한계를 명확히 밝히는 데 목적이 있습니다.','Mục tiêu là làm rõ giới hạn.'],
 ['이 연구는 사례를 분석하는 데 목적이 있습니다.','Nghiên cứu nhằm phân tích các trường hợp.'],
 ['분석 결과에 입각하여 평가하겠습니다.','Tôi sẽ đánh giá dựa trên kết quả phân tích.']]
};
function lessonSentences(d){
  const chosen=[],seen=new Set();
  const push=(x,source)=>{
    if(!x?.ko||!x?.vi||seen.has(normalize(x.ko))||chosen.length>=10)return;
    seen.add(normalize(x.ko));chosen.push({...x,sourceOrdinal:source.ordinal,sourceLabel:source.ordinal===d.ordinal?'Trong bài này':`Ôn cấp ${source.cap} · Bài ${source.bai}`});
  };
  if(d.cap===1&&d.bai===1){firstSc.forEach(([ko,vi])=>push({ko,vi},d));return chosen;}
  if(d.cap>=3){
    (d.samples||[]).forEach(x=>push(x,d));
    if(d.bai===1)(firstAdvanced[d.cap]||[]).forEach(([ko,vi])=>push({ko,vi},d));
  }else{
    d.grammar.flatMap(grammarExamples).forEach(x=>push(x,d));
    // Sơ cấp ưu tiên ví dụ đúng từng bài trong giáo trình giáo viên cung cấp;
    // không dùng ngân hàng câu mẫu cũ vì từng có cấu trúc vượt bài.
  }
  // Truy ngược: không bao giờ lấy từ d.ordinal+1 trở đi.
  for(let n=d.ordinal-1;n>=1&&chosen.length<10;n--){
    const prev=data[n-1];
    if(!prev||prev.ordinal>=d.ordinal)continue;
    const s=prev.cap>=3?(prev.samples||[]):prev.grammar.flatMap(grammarExamples);
    s.forEach(x=>push(x,prev));
    if(prev.cap===1&&prev.bai===1)firstSc.forEach(([ko,vi])=>push({ko,vi},prev));
    if(prev.cap>=3&&prev.bai===1)(firstAdvanced[prev.cap]||[]).forEach(([ko,vi])=>push({ko,vi},prev));
  }
  return chosen.slice(0,10);
}
function lessonVocabulary(d){
  const seen=new Set();
  return (d.vocab||[]).map(([ko,vi])=>[String(ko||'').trim(),String(vi||'').trim()]).filter(([ko,vi])=>{
   if(!/^[\uAC00-\uD7A3][\uAC00-\uD7A3\s·()\-/!?.,0-9]*$/.test(ko)||!vi||seen.has(ko)||vi.length>130)return false;
   seen.add(ko);return true;
  });
}
// Chỉ lấy ngân hàng bài hiện tại và bài trước. Dùng nguồn cụ thể để kiểm toán.
function buildQuestions(d, run=0){
  const vocab=lessonVocabulary(d), questions=[];
  if(!vocab.length)return questions;
  const rotation=(run*11) % vocab.length;
  const picked=[];
  for(let i=0;i<vocab.length;i++)picked.push(vocab[((run*6+i)*13)%vocab.length]);
  // Bài kiểm tra 10 câu: 4 trắc nghiệm từ vựng, 2 gõ tiếng Hàn,
  // 2 hiểu câu mẫu, 2 ngữ pháp. Mỗi lần luyện xoay bộ từ qua 68 mục.
  for(let i=0;i<6;i++){
    const item=picked[i],writing=i===2||i===5;
    const correct=writing?item[0]:item[1];
    if(writing){questions.push({type:'write',label:'Viết từ/cụm từ tiếng Hàn',prompt:item[1],correct,help:`${item[0]} — ${item[1]}`,sourceOrdinal:d.ordinal});continue;}
    const variants=vocab.map(x=>x[1]).filter((v,j,a)=>a.indexOf(v)===j&&v!==correct);
    const distract=[];
    for(let n=0;n<variants.length&&distract.length<3;n++){
      const v=variants[(rotation+i*13+n*19)%variants.length];
      if(!distract.includes(v))distract.push(v);
    }
    const opts=[correct,...distract],shift=(i+run)%opts.length;
    questions.push({type:'choice',label:'Chọn nghĩa tiếng Việt chính xác',prompt:item[0],correct,options:[...opts.slice(shift),...opts.slice(0,shift)],help:`${item[0]} — ${item[1]}`,sourceOrdinal:d.ordinal});
  }
  const bank=(d.cap>=3?(d.samples||[]):d.grammar.flatMap(grammarExamples));
  const sentences=bank.filter((x,i,a)=>x?.ko&&x?.vi&&a.findIndex(t=>t.ko===x.ko)===i);
  for(let i=0;i<2;i++){
    const sample=sentences[(run+i)%sentences.length];if(!sample)break;
    const correct=sample.vi;
    const alternatives=sentences.filter(x=>x.vi!==correct).map(x=>x.vi);
    for(const [_,vi] of vocab){if(alternatives.length>=3)break;if(vi!==correct&&!alternatives.includes(vi))alternatives.push(vi);}
    const opts=[correct,...alternatives.slice(0,3)],shift=(run+i+1)%opts.length;
    questions.push({type:'choice',label:'Hiểu nghĩa câu mẫu trong bài',prompt:sample.ko,correct,options:[...opts.slice(shift),...opts.slice(0,shift)],help:`${sample.ko} — ${sample.vi}`,sourceOrdinal:d.ordinal});
  }
  const gram=(d.grammar||[]).filter(g=>g.stage!=='Ôn bài trước');
  const pastGrammar=data.filter(x=>x.ordinal<=d.ordinal).flatMap(x=>x.grammar.map(g=>g.formula));
  for(let i=0;i<2;i++){
    const g=gram[(run+i)%gram.length];if(!g)break;
    const correct=g.formula,variants=[...new Set(pastGrammar.filter(f=>f!==correct))];
    const distract=variants.slice(-3),opts=[correct,...distract],shift=(run+i+2)%opts.length;
    questions.push({type:'choice',label:'Nhận diện ngữ pháp đang học',prompt:g.meaning,correct,options:[...opts.slice(shift),...opts.slice(0,shift)],help:`${g.formula}: ${g.usage}`,sourceOrdinal:d.ordinal});
  }
  for(let n=0;questions.length<10;n++){
    const item=vocab[(rotation+n+19)%vocab.length];
    questions.push({type:'write',label:'Ôn từ vựng theo bài',prompt:item[1],correct:item[0],help:`${item[0]} — ${item[1]}`,sourceOrdinal:d.ordinal});
  }
  return questions.slice(0,10);
}
function listLessons(){
  $('lessonTitle').textContent=`${levelName} – Danh sách 15 bài`;
  $('lessonIntro').textContent='Chọn bài học; nội dung được khóa theo bài hiện tại và bài đã học trước đó.';
  $('lessonGrid').innerHTML=currentPool.map(u=>{
    const d=findData(cap,u.number),count=d?.vocab?.length||0;
    return `<a class="mr-new-card" href="hoc-theo-bai.html?cap=${cap}&bai=${u.number}"><strong>Bài ${u.number}: ${esc(u.title)}</strong><span lang="ko">${esc(u.ko)}</span><span>${esc(d?.grammar?.map(g=>g.formula).join(' · ')||u.grammar)}</span><em>${count} từ · 10 câu luyện nói · 10 câu bài tập →</em></a>`;
  }).join('');
}
function renderGrammar(d){
  const core=d.grammar.filter(x=>x.stage!=='Ôn bài trước').length;
  $('lessonGrammar').innerHTML=`<div class="mr-sc-summary">${core} điểm ngữ pháp bài ${d.bai} + 1 cấu trúc ôn từ bài trước. Các ví dụ minh họa cần được ôn với từ trong bài.</div><div class="mr-sc-grammar-list">${d.grammar.map(g=>`<article class="mr-sc-grammar-card"><div class="mr-sc-grammar-head"><strong>${esc(g.formula)}</strong><span>${esc(g.stage||'Trọng tâm')}</span></div><p><b>Ý nghĩa:</b> ${esc(g.meaning)}</p><p><b>Cách dùng:</b> ${esc(g.usage)}</p><p class="mr-sc-example"><b>Ví dụ:</b> ${esc(g.example)}</p>${g.reviewFrom?`<p class="mr-v6-review">Ôn từ ${esc(g.reviewFrom)}</p>`:''}</article>`).join('')}</div>`;
}
function renderVocab(d){
  const target=$('lessonVocab'),vocab=lessonVocabulary(d),isAdvanced=d.cap>=3;
  const coreCount=isAdvanced?Math.min(d.coreCount||0,vocab.length):vocab.length;
  $('lessonVocabHeading').textContent=`📚 Từ vựng Bài ${d.bai} · ${d.title}`;
  $('lessonVocabHint').textContent=isAdvanced
    ?`${vocab.length} mục: ${coreCount} trọng tâm chủ đề, ${vocab.length-coreCount} mở rộng theo cấp. Từ mở rộng có thể lặp lại có chủ đích để ôn tập.`
    :`${vocab.length} mục từ của bài. Có tìm kiếm, nghe và ẩn nghĩa tiếng Việt.`;
  target.innerHTML=`<div class="mr-sc-vocab-tools"><input class="mr-sc-search" type="search" placeholder="Tìm từ Hàn/Việt" aria-label="Tìm từ trong bài"><button type="button" class="mr-sc-mini-btn" data-toggle-meaning>Ẩn nghĩa tiếng Việt</button><select class="mr-v6-filter" aria-label="Lọc nhóm từ"><option value="all">Tất cả từ vựng</option><option value="core">Từ trọng tâm</option><option value="extra">Từ mở rộng</option></select><span class="mr-sc-summary" data-vocab-count></span></div><div class="mr-sc-vocab-grid" data-vocab-list></div>`;
  const search=target.querySelector('.mr-sc-search'),filter=target.querySelector('.mr-v6-filter'),body=target.querySelector('[data-vocab-list]'),counter=target.querySelector('[data-vocab-count]');
  const render=()=>{
    const q=search.value.trim().toLowerCase(),section=filter.value;
    const rows=vocab.map(([ko,vi],idx)=>({ko,vi,idx})).filter(x=>`${x.ko} ${x.vi}`.toLowerCase().includes(q)).filter(x=>section==='all'||(section==='core'?x.idx<coreCount:x.idx>=coreCount));
    counter.textContent=`${rows.length}/${vocab.length} mục`;
    body.innerHTML=rows.map(({ko,vi,idx})=>`<div class="mr-sc-vocab-card"><div><div class="mr-sc-vocab-word" lang="ko">${esc(ko)} <small class="mr-v6-kind">${idx<coreCount?'Trọng tâm':'Mở rộng'}</small></div><div class="mr-sc-vocab-meaning">${esc(vi)}</div></div><button type="button" data-ko="${esc(ko)}" aria-label="Nghe tiếng Hàn">🔊</button></div>`).join('')||'<p>Không có kết quả.</p>';
  };
  search.addEventListener('input',render);filter.addEventListener('change',render);
  target.querySelector('[data-toggle-meaning]').addEventListener('click',e=>{const on=target.classList.toggle('mr-sc-meaning-hidden');e.currentTarget.textContent=on?'Hiện nghĩa tiếng Việt':'Ẩn nghĩa tiếng Việt';});
  body.addEventListener('click',e=>{const btn=e.target.closest('[data-ko]');if(btn)speak(btn.dataset.ko);});render();
}
let recorder=null,parts=[],activeAudio=null;
async function toggleRecord(btn,play){
  if(recorder&&recorder.state==='recording'){
    recorder.stop();btn.textContent='🎙️ Ghi âm';return;
  }
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){alert('Trình duyệt không hỗ trợ ghi âm hoặc chưa cấp quyền micro (yêu cầu HTTPS).');return;}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    recorder=new MediaRecorder(stream);parts=[];play.hidden=true;
    recorder.ondataavailable=e=>{if(e.data?.size)parts.push(e.data);};
    recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(activeAudio)URL.revokeObjectURL(activeAudio);activeAudio=URL.createObjectURL(new Blob(parts,{type:recorder.mimeType||'audio/webm'}));play.src=activeAudio;play.hidden=false;};
    recorder.start();btn.textContent='⏹ Dừng ghi âm';
  }catch(err){alert(`Không thể sử dụng micro: ${err?.message||'Vui lòng cấp quyền.'}`);}
}
function renderSpeaking(d,samples){
  $('lessonSpeak').innerHTML=samples.map((s,i)=>`<div class="mr-new-row mr-v5-speaking"><div><strong>Câu ${i+1} · <small>${esc(s.sourceLabel)}</small></strong><div class="mr-new-korean" lang="ko">${esc(s.ko)}</div><div>${esc(s.vi)}</div></div><div class="mr-v5-actions"><button class="mr-new-btn" data-play="${i}" type="button">🔊 Nghe</button><button class="mr-new-btn" data-record="${i}" type="button">🎙️ Ghi âm</button><audio data-audio="${i}" controls hidden></audio></div></div>`).join('');
  $('lessonSpeak').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-play'))speak(samples[Number(b.dataset.play)].ko);
    if(b.hasAttribute('data-record'))toggleRecord(b,$(`lessonSpeak`).querySelector(`[data-audio="${b.dataset.record}"]`));
  });
  $('lessonSpeakingLink').href=`luyen-noi-tinh-diem.html?task=${encodeURIComponent(findRoadmap(d.cap,d.bai).id)}`;
}
function renderQuiz(d,questions){
  const key=`mrlee.v6.quiz.${d.cap}.${d.bai}`;
  const container=$('lessonQuestion'),answers=$('lessonAnswers'),feedback=$('lessonFeedback'),next=$('lessonNext');
  const heading=document.createElement('p');heading.className='mr-new-quizhead';container.before(heading);
  let qi=0,correct=0,answered=false,run=0;
  try{run=Number(localStorage.getItem(`mrlee.v6.run.${d.cap}.${d.bai}`)||0);}catch{}
  let activeQuestions=questions;
  $('lessonPracticeHint').textContent='4 trắc nghiệm từ vựng + 2 viết từ tiếng Hàn + 2 hiểu câu mẫu + 2 ngữ pháp. Mỗi lượt luyện sẽ lấy bộ từ khác; không dùng nội dung bài sau.';
  const draw=()=>{
    if(qi===10){
      container.textContent='Đã hoàn thành!';answers.innerHTML='';heading.textContent='Hoàn thành 10/10 câu';feedback.className='mr-new-feedback';feedback.textContent=`Bạn đúng ${correct}/10 câu (${correct*10}%).`;
      next.disabled=false;next.textContent='Làm lại';next.onclick=()=>{qi=0;correct=0;run++;try{localStorage.setItem(`mrlee.v6.run.${d.cap}.${d.bai}`,String(run));}catch{}activeQuestions=buildQuestions(d,run);draw();};
      try{localStorage.setItem(key,String(Math.max(correct,Number(localStorage.getItem(key)||0))));}catch{}
      return;
    }
    answered=false;const q=activeQuestions[qi];heading.textContent=`Bài ${d.bai} · Câu ${qi+1}/10 · ${q.label} · Đúng ${correct}`;container.textContent=q.prompt;
    answers.replaceChildren();feedback.textContent='';feedback.className='';next.disabled=true;next.textContent='Câu tiếp theo →';next.onclick=()=>{qi++;draw();};
    const grade=value=>{if(answered||!String(value).trim())return;answered=true;const ok=normalize(value)===normalize(q.correct);if(ok)correct++;answers.querySelectorAll('button,input').forEach(el=>el.disabled=true);feedback.textContent=(ok?'✓ Đúng. ':'✗ Chưa chính xác. ')+`Đáp án: ${q.correct}. ${q.help}`;feedback.className=`mr-new-feedback${ok?'':' error'}`;next.disabled=false;};
    if(q.type==='choice')q.options.forEach((x,i)=>{const b=document.createElement('button');b.type='button';b.className='mr-new-btn';b.textContent=`${String.fromCharCode(65+i)}. ${x}`;b.onclick=()=>grade(x);answers.append(b);});
    else{const inp=document.createElement('input');inp.className='mr-new-input';inp.lang='ko';inp.placeholder='Nhập từ tiếng Hàn';const b=document.createElement('button');b.type='button';b.className='mr-new-btn primary';b.textContent='Kiểm tra';b.onclick=()=>grade(inp.value);inp.onkeydown=e=>{if(e.key==='Enter')grade(inp.value);};answers.append(inp,b);}
  };draw();
}
function showLesson(){
  const d=findData(cap,bai),u=findRoadmap(cap,bai);
  if(!d||!u){$('lessonIntro').textContent='Bài học không tồn tại. Vui lòng chọn bài hợp lệ.';return;}
  const samples=lessonSentences(d),questions=buildQuestions(d,0);
  if(samples.length!==10||questions.length!==10){$('lessonIntro').textContent='Dữ liệu bài học chưa đủ 10 câu. Không hiển thị câu vượt bài để bù số lượng.';return;}
  // Kiểm tra chủ động trước khi hiển thị nội dung cho học viên.
  if(samples.some(x=>x.sourceOrdinal>d.ordinal)||questions.some(x=>x.sourceOrdinal>d.ordinal)){throw Error('Phát hiện nội dung vượt bài.');}
  document.title=`${levelName} · Bài ${bai}: ${u.title} | Tiếng Hàn Mr Lee`;
  $('lessonTitle').textContent=`${levelName} · Bài ${bai}: ${u.title}`;
  $('lessonIntro').textContent=u.goal;
  $('lessonContent').classList.remove('mr-new-hidden');$('lessonCards').classList.add('mr-new-hidden');
  $('lessonTip').textContent=LEVEL_TIPS[cap];renderGrammar(d);renderVocab(d);renderSpeaking(d,samples);renderQuiz(d,questions);
  $('lessonContentNote').textContent=cap<=2?'Từ vựng và ngữ pháp dựa trên văn bản giáo trình Mr Lee cung cấp; các mục đang tiếp tục được hiệu đính.':'Nội dung Trung–Cao cấp: từ trọng tâm theo chủ đề và từ mở rộng theo cấp; biên soạn độc lập theo khung 6 cấp. Ví dụ, sắc thái từ và bài tập cần giáo viên thẩm định trước khi sử dụng chính thức.';
  $('lessonEarned').textContent='Điểm bài tập lưu trên trình duyệt; chưa cộng điểm toàn server. Nội dung bổ sung cần giáo viên rà soát trước khi dùng để đánh giá chính thức.';
  $('lessonReturn').href=`hoc-theo-bai.html?cap=${cap}`;
  $('lessonOldLink').href=u.lessonUrl||'lo-trinh-1-6.html';
  const next=bai<15?{cap,bai:bai+1}:cap<6?{cap:cap+1,bai:1}:null;
  if(next){$('lessonNextLesson').href=`hoc-theo-bai.html?cap=${next.cap}&bai=${next.bai}`;}else{$('lessonNextLesson').textContent='Hoàn thành 6 cấp';$('lessonNextLesson').href='hoc-tieng-han.html';}
}
$('levelButtons').innerHTML=LEVELS.map(l=>`<a class="mr-new-btn ${l.level===cap?'primary':''}" href="hoc-theo-bai.html?cap=${l.level}">${esc(l.name)}</a>`).join('');
listLessons();if(bai)showLesson();
// Xuất cho kiểm thử tự động về thứ tự bài và giới hạn dữ liệu.
export { lessonSentences, lessonVocabulary, buildQuestions, findData };
