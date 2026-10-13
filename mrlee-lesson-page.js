import {LEVELS, ROADMAP_UNITS} from './mrlee-roadmap-bank.js';
import {LEVEL_VOCAB, LEVEL_TIPS} from './mrlee-vocab-bank.js';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search);
const level=Math.max(1,Math.min(6,Number(params.get('cap'))||1));
const lessonNo=Number(params.get('bai'))||0;
const info=LEVELS.find(x=>x.level===level), pool=ROADMAP_UNITS.filter(x=>x.level===level);
const name=info?.name || 'Học tiếng Hàn';
function utter(text){if(!('speechSynthesis' in window)){alert('Trình duyệt chưa hỗ trợ đọc tiếng Hàn.');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';u.rate=.84;speechSynthesis.speak(u);}
function uniqueSamples(unit){
  const picked=[],seen=new Set();
  // Bốn câu trọng tâm của chính bài; câu tiếp theo lấy từ các bài cùng cấp để ôn tập.
  const get=(v,origin)=>{if(!v?.ko||!v?.vi||seen.has(v.ko))return;seen.add(v.ko);picked.push({...v,origin});};
  unit.samples.forEach(v=>get(v,'Trọng tâm'));
  for(let offset=1;offset<pool.length&&picked.length<10;offset++){
    const next=pool[(unit.number-1+offset)%pool.length];
    next.samples.forEach(v=>{if(picked.length<10)get(v,'Ôn tập cùng cấp');});
  }
  return picked.slice(0,10);
}
function renderList(){
  $('lessonIntro').textContent=`${name} · ${pool.length} bài học. Mỗi bài có 10 câu nói và 10 câu bài tập tương tác.`;
  $('lessonTitle').textContent=`${name} — Chọn bài học`;
  $('lessonGrid').innerHTML=pool.map(u=>`<a class="mr-new-card" href="hoc-theo-bai.html?cap=${level}&bai=${u.number}"><strong>Bài ${u.number}: ${esc(u.title)}</strong><span lang="ko">${esc(u.ko)}</span><span>${esc(u.grammar)}</span><em>10 câu luyện nói · 10 câu bài tập →</em></a>`).join('');
}
function makeQuestions(sentences){
  const questions=[];
  for(let i=0;i<sentences.length;i++){
    const item=sentences[i];
    const type=i%4;
    if(type===0||type===1){
      const distract=[...sentences.filter((_,j)=>j!==i).map(x=>type===0?x.vi:x.ko)].filter((v,j,a)=>a.indexOf(v)===j).slice(0,6);
      const correct=type===0?item.vi:item.ko;
      const options=[correct,...distract.slice((i*2)%Math.max(1,distract.length),((i*2)%Math.max(1,distract.length))+3)];
      while(options.length<4){const x=distract.find(v=>!options.includes(v));if(!x)break;options.push(x);}
      const rotated=options.length?[...options.slice(i%options.length),...options.slice(0,i%options.length)]:options;
      questions.push({type:'choice',label:type===0?'Chọn nghĩa tiếng Việt chính xác':'Chọn câu tiếng Hàn phù hợp',prompt:type===0?item.ko:item.vi,answers:rotated,correct,help: `${item.ko} — ${item.vi}`});
    }else if(type===2){
      // Điền từ thiếu: chọn từ trong câu mẫu đã học.
      const parts=item.ko.trim().split(/\s+/);
      const index=Math.min(parts.length-1,Math.floor(parts.length/2));
      const word=parts[index];
      questions.push({type:'fill',label:'Điền từ còn thiếu (dựa vào câu đã học)',prompt:parts.map((x,j)=>j===index?'_____':x).join(' '),correct:word,help:`${item.ko} — ${item.vi}`});
    }else{
      questions.push({type:'write',label:'Viết lại câu tiếng Hàn theo mẫu',prompt:item.vi,correct:item.ko,help:`${item.ko} — ${item.vi}`});
    }
  }
  return questions;
}
function norm(s){return String(s||'').normalize('NFKC').replace(/[.?!。！？,，\s]+/g,'').toLowerCase();}
function renderLesson(){
  const unit=pool.find(x=>x.number===lessonNo);
  if(!unit){$('lessonTitle').textContent='Không tìm thấy bài';$('lessonIntro').textContent='Chọn lại cấp độ và bài học.';return;}
  const sentences=uniqueSamples(unit),questions=makeQuestions(sentences);
  document.title=`Bài ${unit.number}: ${unit.title} | Mr Lee`;
  $('lessonTitle').textContent=`${name} · Bài ${unit.number}: ${unit.title}`;
  $('lessonIntro').textContent=unit.goal;
  $('lessonContent').classList.remove('mr-new-hidden');$('lessonCards').classList.add('mr-new-hidden');
  $('lessonGrammar').textContent=unit.grammar;
  $('lessonTip').textContent=LEVEL_TIPS[level];
  const vocabulary=LEVEL_VOCAB[level]||[];
  $('lessonVocab').innerHTML=Array.from({length:6},(_,i)=>vocabulary[((unit.number-1)*3+i)%vocabulary.length]).map(([ko,vi])=>`<div class="mr-new-row"><strong class="mr-new-korean" lang="ko">${esc(ko)}</strong><span>${esc(vi)}</span></div>`).join('');
  $('lessonSpeak').innerHTML=sentences.map((x,i)=>`<div class="mr-new-row"><div><strong>Câu ${i+1} <small>${esc(x.origin)}</small></strong><div class="mr-new-korean" lang="ko">${esc(x.ko)}</div><div>${esc(x.vi)}</div></div><button class="mr-new-btn" type="button" data-speak="${i}">🔊 Nghe</button></div>`).join('');
  $('lessonSpeak').addEventListener('click',ev=>{const btn=ev.target.closest('[data-speak]');if(btn)utter(sentences[Number(btn.dataset.speak)].ko)});
  $('lessonPracticeHint').textContent='10 bài tập gồm chọn nghĩa, chọn câu tiếng Hàn, điền từ và viết lại câu. Kết quả lưu cục bộ trên trình duyệt, không cộng điểm server.';
  const storageKey=`mrlee.lesson.practice.2026.${unit.id}`;
  let qi=0,correct=0,answered=false;
  const shown=document.createElement('p');shown.className='mr-new-quizhead';
  $('lessonQuestion').before(shown);
  function draw(){
    if(qi>=questions.length){
      $('lessonQuestion').textContent='Đã hoàn thành 10 câu bài tập.';$('lessonAnswers').innerHTML='';
      $('lessonFeedback').textContent=`Kết quả: ${correct}/10 câu đúng (${correct*10}%).`;
      $('lessonFeedback').className='mr-new-feedback';
      $('lessonNext').textContent='Làm lại 10 câu';$('lessonNext').disabled=false;
      $('lessonNext').onclick=()=>{qi=0;correct=0;draw();};
      try{const prev=Number(localStorage.getItem(storageKey)||0);localStorage.setItem(storageKey,String(Math.max(prev,correct)));}catch{}
      shown.textContent='Hoàn thành!';return;
    }
    answered=false;$('lessonNext').disabled=true;$('lessonNext').textContent='Câu tiếp theo →';$('lessonNext').onclick=()=>{qi++;draw();};
    $('lessonFeedback').textContent='';$('lessonFeedback').className='';
    const q=questions[qi];shown.textContent=`Bài ${unit.number} · Câu ${qi+1}/10 · ${q.label} · Đã đúng ${correct}`;
    $('lessonQuestion').textContent=q.prompt;
    $('lessonAnswers').replaceChildren();
    if(q.type==='choice'){
      q.answers.forEach((opt,i)=>{const b=document.createElement('button');b.type='button';b.className='mr-new-btn';b.textContent=`${String.fromCharCode(65+i)}. ${opt}`;b.addEventListener('click',()=>grade(opt));$('lessonAnswers').append(b)});
    }else{
      const input=document.createElement('input');input.className='mr-new-input';input.placeholder='Nhập câu trả lời tiếng Hàn';input.lang='ko';input.setAttribute('aria-label','Câu trả lời tiếng Hàn');
      const check=document.createElement('button');check.className='mr-new-btn primary';check.textContent='Kiểm tra';check.type='button';check.addEventListener('click',()=>grade(input.value));input.addEventListener('keydown',e=>{if(e.key==='Enter')grade(input.value);});
      $('lessonAnswers').append(input,check);input.focus();
    }
    function grade(value){
      if(answered||!String(value).trim())return;answered=true;
      const okay=norm(value)===norm(q.correct);if(okay)correct++;
      $('lessonAnswers').querySelectorAll('button,input').forEach(el=>el.disabled=true);
      $('lessonFeedback').textContent=(okay?'✓ Đúng! ':'✗ Chưa chính xác. ')+`Đáp án: ${q.correct}. ${q.help}`;
      $('lessonFeedback').className='mr-new-feedback'+(okay?'':' error');
      $('lessonNext').disabled=false;
    }
  }
  draw();
  $('lessonReturn').href=`hoc-theo-bai.html?cap=${level}`;
  $('lessonNextLesson').href=`hoc-theo-bai.html?cap=${level}&bai=${unit.number%pool.length+1}`;
  $('lessonEarned').textContent='Hệ thống bài tập mới chưa cộng điểm vào bảng xếp hạng. Luyện nói tích điểm cũ vẫn hoạt động bình thường.';
  $('lessonSpeakingLink').href=`luyen-noi-tinh-diem.html?task=${encodeURIComponent(unit.id)}`;
  $('lessonOldLink').href=unit.lessonUrl||'lo-trinh-1-6.html';
}
$('levelButtons').innerHTML=LEVELS.map(l=>`<a class="mr-new-btn ${l.level===level?'primary':''}" href="hoc-theo-bai.html?cap=${l.level}">${esc(l.name)}</a>`).join('');
renderList();if(lessonNo)renderLesson();
