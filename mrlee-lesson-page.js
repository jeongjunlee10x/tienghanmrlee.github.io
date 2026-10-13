import {LEVELS, ROADMAP_UNITS} from './mrlee-roadmap-bank.js';
import {LEVEL_VOCAB, LEVEL_TIPS} from './mrlee-vocab-bank.js';
import {SC_LESSONS} from './mrlee-sc-lesson-data.js?v=20261013-direct-v1';
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

/* Từ vựng 30 bài: tạo 10 câu tự luyện BÁM SÁT BÀI ĐANG MỞ.
   Không thay đổi hệ thống tính điểm toàn server. */
function makeScQuestions(items){
  const unique=[],seen=new Set();
  for(const [ko,vi] of items){
    const k=String(ko||'').trim(),v=String(vi||'').trim();
    // Chỉ chọn biểu thức rõ dạng tiếng Hàn để tránh đố các dòng bị đảo cột từ nguồn gốc.
    if(!/^[가-힣\s]{2,30}$/.test(k)||!v||v.length>110||seen.has(k)) continue;
    seen.add(k);unique.push({ko:k,vi:v});
  }
  if(unique.length<12) return [];
  const selected=[];
  const step=Math.max(1,Math.floor(unique.length/12));
  for(let j=0;j<unique.length&&selected.length<10;j+=step){selected.push(unique[j]);}
  const allV=[...new Set(unique.map(x=>x.vi))];
  const allK=[...new Set(unique.map(x=>x.ko))];
  const questions=[];
  for(let i=0;i<Math.min(10,selected.length);i++){
    const item=selected[i];
    if(i===3||i===7){
      questions.push({type:'write',label:'Viết từ tiếng Hàn tương ứng',prompt:item.vi,correct:item.ko,help:`${item.ko} — ${item.vi}`});
      continue;
    }
    const askKorean=i%2===1;
    const correct=askKorean?item.ko:item.vi;
    const possibilities=askKorean?allK:allV;
    const distract=[];
    for(let d=1;d<possibilities.length&&distract.length<3;d++){
      const candidate=possibilities[(i*7+d*11)%possibilities.length];
      if(candidate!==correct&&!distract.includes(candidate))distract.push(candidate);
    }
    const values=[correct,...distract];
    const rot=i%values.length;
    questions.push({type:'choice',label:askKorean?'Chọn từ tiếng Hàn phù hợp':'Chọn nghĩa tiếng Việt chính xác',
       prompt:askKorean?item.vi:item.ko,answers:[...values.slice(rot),...values.slice(0,rot)],correct,help:`${item.ko} — ${item.vi}`});
  }
  return questions;
}
function renderScGrammar(lesson){
  $('lessonGrammar').innerHTML=`<div class="mr-sc-summary">${lesson.grammar.length} cấu trúc ngữ pháp · ${esc(lesson.title)} · Sơ cấp ${lesson.cap}</div>
    <div class="mr-sc-grammar-list">${lesson.grammar.map(g=>`<article class="mr-sc-grammar-card">
    <div class="mr-sc-grammar-head"><strong>${esc(g.formula)}</strong><span>${esc(g.meaning)}</span></div>
    <p><b>Cách dùng:</b> ${esc(g.usage)}</p><p class="mr-sc-example"><b>Ví dụ:</b> ${esc(g.example)}</p></article>`).join('')}</div>`;
}
function renderScVocab(lesson){
  const target=$('lessonVocab');
  target.innerHTML=`<div class="mr-sc-vocab-tools"><input class="mr-sc-search" type="search" placeholder="Tìm từ tiếng Hàn hoặc nghĩa tiếng Việt" aria-label="Tìm từ vựng trong bài">
    <button class="mr-sc-mini-btn" type="button" data-toggle-meaning aria-pressed="false">Ẩn nghĩa tiếng Việt</button>
    <span class="mr-sc-summary" data-vocab-count></span></div><div class="mr-sc-vocab-grid" data-vocab-list></div>`;
  const list=target.querySelector('[data-vocab-list]');
  const count=target.querySelector('[data-vocab-count]');
  const search=target.querySelector('.mr-sc-search');
  const button=target.querySelector('[data-toggle-meaning]');
  function render(){
    const q=search.value.trim().normalize('NFKC').toLocaleLowerCase('vi');
    const rows=lesson.vocab.filter(([ko,vi])=>`${ko} ${vi}`.normalize('NFKC').toLocaleLowerCase('vi').includes(q));
    count.textContent=`${rows.length}/${lesson.vocab.length} mục từ`;
    list.innerHTML=rows.length?rows.map(([ko,vi])=>`<div class="mr-sc-vocab-card"><div><div class="mr-sc-vocab-word" lang="ko">${esc(ko)}</div><div class="mr-sc-vocab-meaning">${esc(vi)}</div></div><button type="button" data-ko="${esc(ko)}" aria-label="Nghe phát âm ${esc(ko)}">🔊</button></div>`).join(''):'<p class="mr-sc-empty">Không tìm thấy từ vựng phù hợp.</p>';
  }
  search.addEventListener('input',render);
  button.addEventListener('click',()=>{
    const hidden=target.classList.toggle('mr-sc-meaning-hidden');
    button.textContent=hidden?'Hiện nghĩa tiếng Việt':'Ẩn nghĩa tiếng Việt';
    button.setAttribute('aria-pressed',String(hidden));
  });
  list.addEventListener('click',e=>{
    const b=e.target.closest('button[data-ko]');if(b)utter(b.dataset.ko);
  });
  render();
}

function norm(s){return String(s||'').normalize('NFKC').replace(/[.?!。！？,，\s]+/g,'').toLowerCase();}
function renderLesson(){
  const unit=pool.find(x=>x.number===lessonNo);
  if(!unit){$('lessonTitle').textContent='Không tìm thấy bài';$('lessonIntro').textContent='Chọn lại cấp độ và bài học.';return;}
  const scLesson=level<=2?SC_LESSONS.find(x=>x.cap===level&&x.bai===lessonNo):null;
  const sentences=uniqueSamples(unit);
  const scQuestions=scLesson?makeScQuestions(scLesson.vocab):[];
  const questions=scQuestions.length===10?scQuestions:makeQuestions(sentences);
  document.title=`Bài ${unit.number}: ${unit.title} | Mr Lee`;
  $('lessonTitle').textContent=`${name} · Bài ${unit.number}: ${unit.title}`;
  $('lessonIntro').textContent=unit.goal;
  $('lessonContent').classList.remove('mr-new-hidden');$('lessonCards').classList.add('mr-new-hidden');
  $('lessonTip').textContent=LEVEL_TIPS[level];
  if(scLesson){
    renderScGrammar(scLesson);
    renderScVocab(scLesson);
    $('lessonVocabHeading').textContent=`📚 Từ vựng Bài ${lessonNo} · ${scLesson.title}`;
    $('lessonVocabHint').textContent=`Đầy đủ ${scLesson.vocab.length} mục từ đúng bài theo giáo trình Sơ cấp ${level}; có tìm kiếm, ẩn nghĩa và nghe phát âm.`;
    $('lessonContentNote').textContent='Nguồn: sách Sơ cấp 1–2 do giáo viên cung cấp; đã sửa chọn lọc 13 mục từ và chuẩn hóa 95 cấu trúc ngữ pháp. Nội dung chưa được xác nhận là hiệu đính thủ công toàn bộ từ vựng.';
  }else{
    $('lessonGrammar').textContent=unit.grammar;
    const vocabulary=LEVEL_VOCAB[level]||[];
    $('lessonVocab').innerHTML=Array.from({length:6},(_,i)=>vocabulary[((unit.number-1)*3+i)%vocabulary.length]).map(([ko,vi])=>`<div class="mr-new-row"><strong class="mr-new-korean" lang="ko">${esc(ko)}</strong><span>${esc(vi)}</span></div>`).join('');
    $('lessonVocabHeading').textContent='📚 Từ vựng bổ trợ cùng cấp';
    $('lessonVocabHint').textContent='6 từ/cụm từ tham khảo cùng cấp độ.';
    $('lessonContentNote').textContent='Mỗi bài sử dụng 4 câu mẫu trọng tâm sẵn có và 6 câu ôn tập cùng cấp từ các bài khác.';
  }
  $('lessonSpeak').innerHTML=sentences.map((x,i)=>`<div class="mr-new-row"><div><strong>Câu ${i+1} <small>${esc(x.origin)}</small></strong><div class="mr-new-korean" lang="ko">${esc(x.ko)}</div><div>${esc(x.vi)}</div></div><button class="mr-new-btn" type="button" data-speak="${i}">🔊 Nghe</button></div>`).join('');
  $('lessonSpeak').addEventListener('click',ev=>{const btn=ev.target.closest('[data-speak]');if(btn)utter(sentences[Number(btn.dataset.speak)].ko)});
  $('lessonPracticeHint').textContent=scLesson?'10 câu thực hành từ vựng ĐÚNG BÀI: chọn nghĩa, chọn từ tiếng Hàn và tự nhập đáp án. Lưu kết quả cục bộ, không cộng điểm server.':'10 bài tập gồm chọn nghĩa, chọn câu tiếng Hàn, điền từ và viết lại câu. Kết quả lưu cục bộ trên trình duyệt, không cộng điểm server.';
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
