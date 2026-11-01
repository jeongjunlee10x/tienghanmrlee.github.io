/* MRLEE CULTURE V1 — 12 chủ đề; không thay đổi tài khoản, Firebase hay điểm server. */
(function () {
  'use strict';
  const topics = Array.isArray(window.MRLEE_CULTURE_DATA) ? window.MRLEE_CULTURE_DATA : [];
  const progressKey = 'mrlee-cultural-lessons-completed-v1';
  const categoryNames = {traditional:'TRUYỀN THỐNG',everyday:'ĐỜI SỐNG',modern:'HIỆN ĐẠI'};
  const palettes = { traditional:['#98506c','#d98b75'], everyday:['#245c81','#5ba4b4'], modern:['#454a86','#a17acc']};
  function getCompleted() {
    try {
      const value = JSON.parse(localStorage.getItem(progressKey) || '[]');
      return Array.isArray(value) ? new Set(value.filter(x => typeof x === 'string')) : new Set();
    } catch (_) { return new Set(); }
  }
  function saveComplete(slug) {
    const completed = getCompleted();
    completed.add(slug);
    try { localStorage.setItem(progressKey,JSON.stringify([...completed])); return true; }
    catch (_) { return false; }
  }
  function countCompleted() { const completed = getCompleted();return topics.filter(t=>completed.has(t.slug)).length; }
  function progressDisplay() {
    const count = countCompleted();
    const countNode = document.getElementById('culture-completed-count');
    if(countNode) countNode.textContent = count + '/' + topics.length;
    const lessonNode = document.getElementById('lesson-progress-text');
    if(lessonNode) lessonNode.textContent = count + '/' + topics.length + ' bài hoàn thành';
    const bar = document.getElementById('lesson-progress-bar');
    if(bar) bar.style.width = (topics.length ? count/topics.length*100 : 0) + '%';
  }
  function norm(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); }
  function escapeText(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function palette(t) { return palettes[t.group] || palettes.traditional; }
  function hubInit() {
    const list = document.getElementById('culture-topics');
    if(!list) return;
    const search = document.getElementById('culture-search');
    const filters = [...document.querySelectorAll('[data-filter]')];
    let currentFilter='all';
    function render() {
      const query = norm(search.value);
      const done = getCompleted();
      const visible = topics.filter(t => (currentFilter==='all'||t.group===currentFilter) && norm([t.title,t.ko,t.description,t.short,...t.words.map(w=>w.ko+' '+w.vi)].join(' ')).includes(query));
      list.innerHTML = visible.map(t => {
        const p=palette(t), completed=done.has(t.slug);
        return `<a class="topic-card" href="van-hoa-bai-hoc.html?chu-de=${encodeURIComponent(t.slug)}" aria-label="Học chủ đề ${escapeText(t.title)}">
          <div class="topic-art" style="--tone-a:${p[0]};--tone-b:${p[1]}" data-ko="${escapeText(t.ko)}"><span class="topic-emoji" aria-hidden="true">${t.icon}</span></div>
          <div class="topic-body"><div class="topic-eyebrow">${categoryNames[t.group] || 'VĂN HÓA'}</div>
          <h3>${escapeText(t.title)}<span lang="ko">${escapeText(t.ko)}</span></h3><p>${escapeText(t.description)}</p>
          <div class="topic-end"><span>${completed ? '<span class="topic-done">✓ Đã hoàn thành</span>' : 'Đọc bài học →'}</span><span>6 từ · 5 câu hỏi</span></div></div></a>`;
      }).join('');
      document.getElementById('culture-empty').hidden = visible.length !== 0;
      progressDisplay();
    }
    // Nhấn / ngoài ô nhập để tập trung tìm kiếm (không ảnh hưởng các ô nhập khác).
    document.addEventListener('keydown', event => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      search.focus();
    });
    search.addEventListener('input',render);
    filters.forEach(btn => btn.addEventListener('click',() => {currentFilter=btn.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));render();}));
    render();
  }
  function speakKorean(text) {
    if(!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      alert('Trình duyệt không hỗ trợ tính năng đọc tiếng Hàn.');return;
    }
    try { window.speechSynthesis.cancel();const utterance = new SpeechSynthesisUtterance(text);utterance.lang='ko-KR';utterance.rate=.84;window.speechSynthesis.speak(utterance); }
    catch (_) { alert('Không thể phát âm thanh trên trình duyệt này.'); }
  }
  function lessonInit() {
    const root = document.getElementById('lesson-layout');
    if(!root) return;
    const slug = new URLSearchParams(window.location.search).get('chu-de') || topics[0]?.slug;
    const t = topics.find(t => t.slug === slug);
    if(!t){ root.innerHTML='<section class="lesson-block"><h2>Không tìm thấy chủ đề</h2><p>Liên kết bài học không hợp lệ hoặc chủ đề chưa được tạo.</p><a href="van-hoa-han-quoc.html">← Quay lại danh sách chủ đề</a></section>';return; }
    const p=palette(t), header=document.getElementById('lesson-head');
    document.title=t.title+' – Văn hóa Hàn Quốc | Tiếng Hàn Mr Lee';
    document.getElementById('lesson-breadcrumb').textContent=t.title;
    header.style.setProperty('--tone-a',p[0]);header.style.setProperty('--tone-b',p[1]);header.dataset.ko=t.ko;
    header.innerHTML=`<div class="lesson-tag">${escapeText(categoryNames[t.group] || 'VĂN HÓA')} · 1/1 BÀI HỌC</div><h1>${t.icon} ${escapeText(t.title)} <span class="lesson-korean" lang="ko">${escapeText(t.ko)}</span></h1><p>${escapeText(t.description)}</p>`;
    document.getElementById('lesson-paragraphs').innerHTML=t.paragraphs.map(p=>`<p>${escapeText(p)}</p>`).join('');
    document.getElementById('lesson-facts').innerHTML=t.facts.map(f=>`<li>${escapeText(f)}</li>`).join('');
    document.getElementById('lesson-words').innerHTML=t.words.map((w,i)=>`<tr><td lang="ko">${escapeText(w.ko)}</td><td>${escapeText(w.vi)}</td><td><button type="button" class="speaker" data-word="${i}" aria-label="Nghe từ ${escapeText(w.ko)}">🔊 Nghe</button></td></tr>`).join('');
    document.querySelectorAll('[data-word]').forEach(b=>b.addEventListener('click',()=>speakKorean(t.words[+b.dataset.word].ko)));
    document.getElementById('lesson-dialogue').innerHTML=t.dialogue.map((d,i)=>`<div class="conversation-line"><strong lang="ko">${i%2 ? 'B' : 'A'}: ${escapeText(d.ko)}</strong><span>${escapeText(d.vi)}</span></div>`).join('');
    const choices = document.getElementById('quiz-options');
    const feedback = document.getElementById('quiz-feedback');
    const markBtn = document.getElementById('lesson-mark-complete');
    const markHelp = document.getElementById('complete-help');
    const quizQuestions=[t.quiz];
    // Bốn câu từ vựng thêm vào cho từng bài: tổng cộng 5 câu / chủ đề.
    for(let i=0;i<Math.min(4,t.words.length);i++){
      const w=t.words[i];
      const alternatives=topics.flatMap(row=>row.words.map(x=>x.vi)).filter(x=>x!==w.vi);
      const distractors=[...new Set(alternatives)].slice(i*5,i*5+3);
      const choices=[w.vi,...distractors];
      const shift=i%choices.length;
      const rotated=[...choices.slice(shift),...choices.slice(0,shift)];
      quizQuestions.push({question:`Từ tiếng Hàn “${w.ko}” có nghĩa là gì?`,choices:rotated,correct:rotated.indexOf(w.vi),explanation:`${w.ko} = ${w.vi}.`});
    }
    let questionNo=0,score=0,passed=false;
    const advance=document.createElement('button');advance.type='button';advance.className='quiz-option';advance.style.marginTop='12px';advance.hidden=true;
    choices.after(advance);
    function displayExisting(){if(getCompleted().has(t.slug)){markBtn.textContent='✓ Đã hoàn thành bài học';markBtn.disabled=true;markHelp.textContent='Tiến độ đã được lưu trên trình duyệt này.';}}
    function renderQuiz(){
      const q=quizQuestions[questionNo];
      document.getElementById('quiz-question').textContent=`Câu ${questionNo+1}/${quizQuestions.length}: ${q.question}`;
      feedback.className='quiz-feedback';feedback.textContent='';advance.hidden=true;
      choices.innerHTML=q.choices.map((choice,i)=>`<button class="quiz-option" type="button" data-choice="${i}"><span class="letter">${String.fromCharCode(65+i)}</span><span>${escapeText(choice)}</span></button>`).join('');
      choices.querySelectorAll('[data-choice]').forEach(btn=>btn.addEventListener('click',()=>{
        const correct=Number(btn.dataset.choice)===q.correct;
        if(correct)score++;
        choices.querySelectorAll('[data-choice]').forEach(b=>{b.disabled=true;if(Number(b.dataset.choice)===q.correct)b.classList.add('correct');});
        if(!correct)btn.classList.add('incorrect');
        feedback.className='quiz-feedback show'+(correct?'':' wrong');
        feedback.textContent=(correct?'Đúng! ':'Chưa đúng. ')+(q.explanation||'')+` · Điểm hiện tại: ${score}/${questionNo+1}`;
        advance.textContent=questionNo===quizQuestions.length-1?'Xem kết quả':'Câu tiếp theo →';advance.hidden=false;
      }));
    }
    advance.addEventListener('click',()=>{
      if(questionNo>=quizQuestions.length){score=0;questionNo=0;renderQuiz();return;}
      questionNo++;
      if(questionNo<quizQuestions.length){renderQuiz();return;}
      passed=score>=4;
      choices.innerHTML='';advance.hidden=false;
      feedback.className='quiz-feedback show'+(passed?'':' wrong');
      feedback.textContent=`Bạn đúng ${score}/${quizQuestions.length} câu. ${passed?'Đạt yêu cầu (ít nhất 4/5).':'Cần đạt ít nhất 4/5. Vui lòng làm lại.'}`;
      if(passed){advance.hidden=true;markBtn.disabled=false;markHelp.textContent='Đạt từ 4/5. Nhấn nút để lưu tiến độ.';}
      else {advance.textContent='Làm lại 5 câu hỏi';}
    });
    markBtn.addEventListener('click',()=>{
      if(!passed)return;
      const saved=saveComplete(t.slug);
      markBtn.textContent=saved?'✓ Đã hoàn thành bài học':'✓ Đã trả lời đúng';
      markHelp.textContent=saved?'Đã lưu tiến độ trên trình duyệt này.':'Không thể lưu tiến độ; bạn vẫn có thể tiếp tục học.';
      markBtn.disabled=true;progressDisplay();
    });
    renderQuiz();displayExisting();
    const sourceNode = document.getElementById('lesson-sources');
    const official=t.source?`<a href="${escapeText(t.source.url)}" rel="noopener noreferrer" target="_blank">↗ ${escapeText(t.source.label)}</a>`:'';
    const video=t.video?`<a href="${escapeText(t.video.url)}" rel="noopener noreferrer" target="_blank">▶ ${escapeText(t.video.label)}</a>`:'';
    const searchUrl='https://www.youtube.com/results?search_query='+encodeURIComponent(t.ko+' 한국 문화');
    sourceNode.innerHTML=official+video+`<a href="${searchUrl}" rel="noopener noreferrer" target="_blank">▶ Tìm video về ${escapeText(t.title)} trên YouTube</a>`;
    const nextIdx=(topics.findIndex(x=>x.slug===t.slug)+1)%topics.length;
    document.getElementById('lesson-next').href='van-hoa-bai-hoc.html?chu-de='+encodeURIComponent(topics[nextIdx].slug);
    document.getElementById('lesson-next').textContent='Tiếp: '+topics[nextIdx].title+' →';
    progressDisplay();
  }
  hubInit();lessonInit();
})();
