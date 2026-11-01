/* Tiếng Hàn Mr Lee - luyện phát âm miễn phí qua Web Speech API.
 * Không dùng khóa API. Nhận dạng giọng nói phụ thuộc trình duyệt và có thể dùng máy chủ nhà cung cấp.
 * KHÔNG phải công cụ chấm từng âm vị/tông giọng.
 */
(() => {
  'use strict';
  if (window.__mrLeeVoiceLoaded) return;
  window.__mrLeeVoiceLoaded = true;

  const RECOGNITION = window.SpeechRecognition || window.webkitSpeechRecognition;
  const HANGUL = /[\uAC00-\uD7AF\u1100-\u11FF]/;
  let currentRecognition = null;
  let modal = null;
  let elements = {};
  let activeTarget = '';
  let previousFocus = null;

  const $ = (name) => elements[name];
  const node = (tag, cls, txt) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (txt !== undefined) el.textContent = txt;
    return el;
  };
  const makeButton = (label, title, type) => {
    const b = node('button', 'mrlee-voice-btn', label);
    b.type = 'button';
    b.title = title;
    b.setAttribute('aria-label', title);
    b.dataset.voice = type;
    return b;
  };
  const clean = (t) => String(t || '').normalize('NFC').trim().replace(/\s+/g, ' ');
  const speakable = (t) => clean(t).split(/[=＝]/)[0].replace(/\s*\([^)]*\)\s*$/, '').trim();
  const noSpaces = (t) => clean(t).normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/[^\p{L}\p{N}]/gu, '');
  function editDistance(a, b) {
    const xs = [...a]; const ys = [...b];
    let row = Array.from({length: ys.length + 1}, (_, n) => n);
    xs.forEach((x, i) => {
      const next = [i + 1];
      ys.forEach((y, j) => next.push(Math.min(next[j] + 1, row[j + 1] + 1, row[j] + (x === y ? 0 : 1))));
      row = next;
    });
    return row[ys.length];
  }
  function feedback(reference, recognized) {
    const a = noSpaces(reference), b = noSpaces(recognized);
    if (!a || !b) return {level: 'neutral', text: 'Chưa đủ dữ liệu nhận diện để so sánh. Bạn có thể thử lại ở nơi yên tĩnh.'};
    const similarity = Math.max(0, Math.round((1 - editDistance(a, b) / Math.max(a.length, b.length)) * 100));
    if (similarity >= 92) return {level: 'good', text: `Nội dung nhận diện khớp rất tốt (${similarity}%). Hãy nghe mẫu thêm một lần và chú ý ngữ điệu tự nhiên.`};
    if (similarity >= 65) return {level: 'mid', text: `Nội dung nhận diện khớp khoảng ${similarity}%. Hãy đọc chậm hơn, tách rõ các cụm từ rồi thử lại.`};
    return {level: 'low', text: `Nội dung nhận diện khớp khoảng ${similarity}%. Hãy nghe giọng mẫu, nói gần micro và thử từng từ/cụm ngắn.`};
  }
  function tell(message, level = 'neutral') {
    if (!modal) return;
    $('status').textContent = message;
    $('status').dataset.level = level;
  }
  function stopAll() {
    try { currentRecognition?.abort(); } catch (_e) {}
    currentRecognition = null;
    try { window.speechSynthesis?.cancel(); } catch (_e) {}
  }
  function listen(text, speed = 0.86) {
    if (!('speechSynthesis' in window)) {
      tell('Thiết bị chưa hỗ trợ đọc văn bản. Hãy thử Chrome hoặc Edge.', 'low');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = speed;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const ko = voices.find(v => v.lang.toLowerCase() === 'ko-kr') || voices.find(v => v.lang.toLowerCase().startsWith('ko'));
    if (ko) utterance.voice = ko;
    utterance.onerror = () => tell('Không đọc được bằng giọng máy trên thiết bị này. Hãy kiểm tra giọng tiếng Hàn trong cài đặt hệ điều hành.', 'low');
    window.speechSynthesis.speak(utterance);
  }
  function createModal() {
    const backdrop = node('div', 'mrlee-voice-backdrop');
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <section class="mrlee-voice-dialog" role="dialog" aria-modal="true" aria-labelledby="mrlee-pr-title" tabindex="-1">
        <div class="mrlee-voice-heading">
          <div><span class="mrlee-voice-kicker">TIẾNG HÀN MR LEE · MIỄN PHÍ</span><h2 id="mrlee-pr-title">Luyện nói tiếng Hàn</h2></div>
          <button type="button" class="mrlee-voice-close" aria-label="Đóng cửa sổ">×</button>
        </div>
        <p class="mrlee-voice-reference" lang="ko" id="mrlee-pr-target"></p>
        <p class="mrlee-voice-sub">Nghe giọng mẫu rồi bấm micro để đọc lại.</p>
        <div class="mrlee-voice-controls">
          <button type="button" class="mrlee-voice-primary" id="mrlee-pr-listen">🔊 Nghe mẫu</button>
          <button type="button" class="mrlee-voice-primary" id="mrlee-pr-repeat">🐢 Nghe chậm</button>
          <button type="button" class="mrlee-voice-record" id="mrlee-pr-mic">🎤 Bắt đầu nói</button>
        </div>
        <div class="mrlee-voice-result"><strong>Trình duyệt nghe thành:</strong><p id="mrlee-pr-heard" lang="ko">Chưa có kết quả.</p></div>
        <p id="mrlee-pr-status" class="mrlee-voice-status" role="status" aria-live="polite">Sẵn sàng luyện tập.</p>
        <p class="mrlee-voice-privacy">Kết quả chỉ so sánh <strong>văn bản được nhận diện</strong> với câu mẫu, <strong>không phải điểm phát âm từng âm</strong>. Khi dùng micro, âm thanh có thể được nhà cung cấp trình duyệt xử lý; website không lưu bản ghi âm.</p>
      </section>`;
    document.body.append(backdrop);
    elements = {
      backdrop, dialog: backdrop.querySelector('.mrlee-voice-dialog'),
      target: backdrop.querySelector('#mrlee-pr-target'),
      heard: backdrop.querySelector('#mrlee-pr-heard'),
      status: backdrop.querySelector('#mrlee-pr-status'),
      mic: backdrop.querySelector('#mrlee-pr-mic'),
      close: backdrop.querySelector('.mrlee-voice-close')
    };
    backdrop.querySelector('#mrlee-pr-listen').addEventListener('click', () => listen(activeTarget));
    backdrop.querySelector('#mrlee-pr-repeat').addEventListener('click', () => listen(activeTarget, 0.68));
    $('mic').addEventListener('click', startRecognition);
    $('close').addEventListener('click', closeModal);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', e => {
      if (!backdrop.hidden && e.key === 'Escape') closeModal();
      if (!backdrop.hidden && e.key === 'Tab') {
        const buttons = [...backdrop.querySelectorAll('button:not([disabled])')];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    if (!RECOGNITION) {
      $('mic').disabled = true;
      $('mic').title = 'Trình duyệt này chưa hỗ trợ nhận diện giọng nói tiếng Hàn';
    }
    modal = backdrop;
  }
  function openModal(text) {
    activeTarget = speakable(text);
    if (!HANGUL.test(activeTarget)) return;
    if (!modal) createModal();
    stopAll();
    previousFocus = document.activeElement;
    $('target').textContent = activeTarget;
    $('heard').textContent = 'Chưa có kết quả.';
    $('mic').textContent = '🎤 Bắt đầu nói';
    tell(RECOGNITION ? 'Bạn có thể nghe mẫu hoặc bấm micro để luyện nói.' : 'Trình duyệt chưa hỗ trợ nhận diện giọng nói. Bạn vẫn có thể nghe mẫu; để luyện micro hãy thử Chrome hoặc Edge.', RECOGNITION ? 'neutral' : 'low');
    modal.hidden = false;
    $('close').focus();
  }
  function closeModal() {
    if (!modal) return;
    stopAll();
    modal.hidden = true;
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  }
  function startRecognition() {
    if (!RECOGNITION) return;
    if (currentRecognition) {
      stopAll();
      $('mic').textContent = '🎤 Bắt đầu nói';
      tell('Đã dừng micro.');
      return;
    }
    try { window.speechSynthesis?.cancel(); } catch (_e) {}
    const rec = new RECOGNITION();
    rec.lang = 'ko-KR'; rec.continuous = false; rec.interimResults = false; rec.maxAlternatives = 1;
    currentRecognition = rec;
    rec.onstart = () => { $('mic').textContent = '■ Dừng nghe'; tell('Đang nghe tiếng Hàn… Bạn hãy đọc câu trong khung.'); };
    rec.onresult = e => {
      const text = clean(e.results?.[0]?.[0]?.transcript || '');
      $('heard').textContent = text || 'Không có nội dung nhận diện.';
      const result = feedback(activeTarget, text);
      tell(result.text, result.level);
    };
    rec.onerror = e => {
      const errs = {
        'not-allowed': 'Micro bị từ chối. Hãy cho phép micro trong thanh địa chỉ, sau đó thử lại.',
        'service-not-allowed': 'Dịch vụ nhận diện giọng nói không được trình duyệt cho phép.',
        'no-speech': 'Không nghe thấy giọng nói. Hãy thử lại và nói gần micro.',
        'network': 'Kết nối mạng không ổn định hoặc dịch vụ nhận diện không khả dụng.',
        'audio-capture': 'Không truy cập được micro. Hãy kiểm tra thiết bị đầu vào.',
        'language-not-supported': 'Trình duyệt không hỗ trợ nhận diện tiếng Hàn trên thiết bị này.'
      };
      tell(errs[e.error] || `Không nhận diện được (${e.error || 'lỗi chưa xác định'}). Hãy thử lại.`, 'low');
    };
    rec.onend = () => {
      if (currentRecognition === rec) currentRecognition = null;
      if (modal && !modal.hidden) $('mic').textContent = '🎤 Nói lại';
    };
    try { rec.start(); } catch (_e) { currentRecognition = null; tell('Không thể bắt đầu micro lúc này. Hãy thử lại.', 'low'); }
  }

  function enhanceVocabulary(root = document) {
    for (const td of root.querySelectorAll('.vocab-table td.ko')) {
      if (td.dataset.mrleeVoice) continue;
      td.dataset.mrleeVoice = '1';
      const text = speakable([...td.childNodes].filter(c => c.nodeType === 3).map(c => c.textContent).join('') || td.textContent);
      if (!HANGUL.test(text) || text.length > 100) continue;
      const wrap = node('span', 'mrlee-word-actions');
      wrap.append(makeButton('🔊', `Nghe phát âm ${text}`, 'listen'));
      wrap.append(makeButton('🎤', `Luyện phát âm ${text}`, 'practice'));
      wrap.dataset.target = text;
      td.append(wrap);
      td.setAttribute('lang', 'ko');
    }
  }
  function enhanceQuestions(root = document) {
    for (const q of root.querySelectorAll('.lesson .quiz-form .question')) {
      if (q.dataset.mrleeHint) continue;
      q.dataset.mrleeHint = '1';
      const hint = node('button', 'mrlee-hint-btn', '💡 Gợi ý cách làm');
      hint.type = 'button'; hint.setAttribute('aria-expanded', 'false');
      const output = node('p', 'mrlee-hint-text'); output.hidden = true;
      const question = clean(q.querySelector('.q-text')?.textContent);
      const korean = clean(q.querySelector('.q-ko')?.textContent);
      let advice = 'Xem lại phần từ vựng và ngữ pháp phía trên, tìm từ khóa trong câu hỏi và loại trừ phương án không phù hợp.';
      if (q.querySelector('.text-answer')) advice = 'Đây là câu điền đáp án. Hãy để ý gốc từ, tiểu từ, 받침 và đuôi câu; nhập chính xác bằng bàn phím tiếng Hàn.';
      else if (/받침|은\/는|이\/가|을\/를/.test(question)) advice = 'Hãy kiểm tra từ đứng trước có 받침 (phụ âm cuối) hay không trước khi chọn tiểu từ.';
      else if (korean) advice = `Hãy tìm lại “${korean}” trong bảng từ vựng, sau đó so sánh các lựa chọn. Bạn có thể nhấn nút 🔊 để nghe mẫu.`;
      output.textContent = advice;
      hint.addEventListener('click', () => {
        output.hidden = !output.hidden;
        hint.setAttribute('aria-expanded', String(!output.hidden));
      });
      q.append(hint, output);
    }
    for (const section of root.querySelectorAll('.lesson-section')) {
      const title = clean(section.querySelector('h3')?.textContent);
      if (!/IV\.\s*Bài tập|Bài tập luyện tập/i.test(title)) continue;
      if (section.querySelector('.quiz-form') || section.querySelector('.mrlee-practice-note')) continue;
      const note = node('p', 'mrlee-practice-note', '💡 Mẹo tự luyện: chọn từ mới trong bảng phía trên, bấm 🔊 để nghe, bấm 🎤 để nói lại; sau đó tự đặt một câu ngắn với từ đó.');
      section.insertBefore(note, section.children[1] || null);
    }
  }
  function enhanceConversations(root = document) {
    for (const card of root.querySelectorAll('.phrase-card')) {
      const actions = card.querySelector('.mini-actions');
      const phrase = clean(card.querySelector('.ko[lang="ko"]')?.textContent || card.querySelector('p.ko')?.textContent);
      if (!actions || !HANGUL.test(phrase) || actions.querySelector('.mrlee-talk-action')) continue;
      const b = node('button', 'mini-btn mrlee-talk-action', '🎤 Luyện nói');
      b.type = 'button'; b.setAttribute('aria-label', `Luyện phát âm câu: ${phrase}`);
      b.addEventListener('click', () => openModal(phrase));
      actions.append(b);
    }
  }
  function enhanceInterviews() {
    for (const id of ['questionKo', 'sampleKo']) {
      const target = document.getElementById(id);
      if (!target || target.dataset.mrleeMic) continue;
      target.dataset.mrleeMic = '1';
      const b = node('button', 'mrlee-interview-mic', id === 'questionKo' ? '🎤 Luyện đọc câu hỏi' : '🎤 Luyện đọc câu trả lời');
      b.type = 'button';
      b.addEventListener('click', () => openModal(target.textContent));
      target.insertAdjacentElement('afterend', b);
    }
  }
  function boot() {
    if (document.querySelector('.vocab-table')) { enhanceVocabulary(); enhanceQuestions(); }
    if (document.getElementById('questionKo')) enhanceInterviews();
    const phrases = document.getElementById('phraseGrid');
    if (phrases) {
      enhanceConversations(phrases);
      let queued = false;
      const obs = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        queueMicrotask(() => { queued = false; enhanceConversations(phrases); });
      });
      obs.observe(phrases, {childList: true, subtree: true});
    }
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-voice]');
      if (!b) return;
      const target = b.closest('.mrlee-word-actions')?.dataset.target;
      if (!target) return;
      if (b.dataset.voice === 'listen') listen(target);
      if (b.dataset.voice === 'practice') openModal(target);
    });
    window.addEventListener('pagehide', stopAll);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
