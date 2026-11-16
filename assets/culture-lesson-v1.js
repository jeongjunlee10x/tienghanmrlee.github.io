/* MR LEE Culture Lesson V1 · 45–60 minute classroom flow */
(function () {
  'use strict';
  const topics = Array.isArray(window.MRLEE_CULTURE_V13) ? window.MRLEE_CULTURE_V13 : [];
  const plans = window.MRLEE_CULTURE_LESSON_V1 || {};
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[c]);
  const textOnly = (node) => node ? String(node.textContent || '').replace(/\s+/g, ' ').trim() : '';

  function addHubIntro() {
    const section = $('#topicSection');
    const heading = $('.sectionHeading', section || document);
    const grid = $('#topics');
    if (!section || !heading || !grid) return;
    const desc = $('p', heading);
    if (desc) desc.textContent = '22 chủ đề văn hóa và kỹ năng sống. Mỗi chủ đề được thiết kế thành bài giảng 45–60 phút, có lý thuyết, hình ảnh tình huống và luyện nói theo vai.';
    if (!$('#mclHubIntro')) {
      const intro = document.createElement('section');
      intro.id = 'mclHubIntro';
      intro.className = 'mcl-hub-intro';
      intro.innerHTML =
        '<div class="mcl-hub-intro-copy"><span class="mcl-eyebrow">MR LEE · CLASSROOM SERIES</span>' +
        '<h2>Học văn hóa bằng tình huống thực tế</h2>' +
        '<p>Mỗi bài có mục tiêu rõ ràng, kiến thức nền, từ vựng, hội thoại mẫu và hoạt động đóng vai. Có thể dạy gọn trong 45 phút hoặc mở rộng thành 60 phút.</p></div>' +
        '<div class="mcl-hub-stats"><div><strong>22</strong><span>chủ đề</span></div><div><strong>45–60’</strong><span>mỗi bài</span></div><div><strong>3</strong><span>mẫu luyện nói</span></div><div><strong>5+</strong><span>ảnh tình huống</span></div></div>';
      heading.insertAdjacentElement('afterend', intro);
    }
    const decorate = () => {
      $$('.topic', grid).forEach((card) => {
        if (!$('.mcl-card-meta', card)) {
          const meta = document.createElement('div');
          meta.className = 'mcl-card-meta';
          meta.innerHTML = '<span>◷ 45–60 phút</span><span>3 mẫu hội thoại</span><span>Ảnh theo tình huống</span>';
          const open = $('.openLink', card);
          if (open) open.insertAdjacentElement('beforebegin', meta);
          else card.append(meta);
        }
        const action = $('.openLink span:first-child', card);
        if (action) action.textContent = 'Vào bài giảng · Lý thuyết · Luyện nói';
      });
    };
    decorate();
    if (window.MutationObserver) {
      const observer = new MutationObserver(decorate);
      observer.observe(grid, { childList: true, subtree: true });
    }
  }

  function getLessonImages(topic, index) {
    const galleryId = index < 2 ? 'cultureImagesV19' : 'cultureImagesV19Topic' + (index + 1);
    const gallery = document.getElementById(galleryId);
    let items = gallery ? $$('img', gallery).map((img) => {
      const figure = img.closest('figure');
      const cap = figure ? $('figcaption', figure) : null;
      return {
        src: img.getAttribute('src') || img.src,
        alt: img.getAttribute('alt') || topic.title,
        caption: textOnly(cap)
      };
    }).filter((item) => item.src) : [];
    if (items.length < 5) {
      (topic.realPhotos || []).forEach((photo) => {
        if (items.length >= 5 || !photo.local) return;
        items.push({
          src: photo.local,
          alt: photo.title || topic.title,
          caption: photo.explanation || ''
        });
      });
    }
    if (items.length < 5 && topic.image) {
      items.push({ src: topic.image, alt: topic.title, caption: topic.description || '' });
    }
    return items.slice(0, 5);
  }

  function renderTimeline() {
    const blocks = [
      ['00–05', 'Khởi động bằng hình ảnh', '5 phút', 'Quan sát ảnh, dự đoán bối cảnh và trả lời câu hỏi dẫn nhập.'],
      ['05–17', 'Lý thuyết văn hóa', '12 phút', 'Đọc kiến thức, giải thích bối cảnh, quy tắc và điểm cần lưu ý.'],
      ['17–23', 'Từ vựng trọng tâm', '6 phút', 'Ôn từ khóa, cụm từ và cách dùng trong tình huống.'],
      ['23–35', 'Giáo viên làm mẫu', '12 phút', 'Nghe, đọc theo và phân tích 3 mẫu hội thoại trong bài.'],
      ['35–45', 'Luyện nói theo cặp', '10 phút', 'Đổi vai, thay thông tin và thực hiện thử thách giao tiếp.'],
      ['45–55', 'Vận dụng mở rộng', '10 phút', 'Thảo luận, xử lý tình huống mới và liên hệ Việt Nam–Hàn Quốc.'],
      ['55–60', 'Kiểm tra cuối giờ', '5 phút', 'Trả lời câu hỏi đầu ra và tự đánh giá mức độ hiểu bài.']
    ];
    return blocks.map((b, i) =>
      '<div class="mcl-time-row ' + (i < 5 ? 'mcl-core' : 'mcl-extension') + '">' +
      '<span class="mcl-time">' + b[0] + '</span><div><strong>' + b[1] + '</strong><p>' + b[3] + '</p></div>' +
      '<span class="mcl-minutes">' + b[2] + '</span></div>'
    ).join('');
  }

  function buildPlan(topic, plan) {
    const section = document.createElement('section');
    section.id = 'mrleeLessonPlan';
    section.className = 'mcl-lesson-plan';
    section.innerHTML =
      '<div class="mcl-section-head"><span class="mcl-eyebrow">BÀI GIẢNG MR LEE</span><h2>Tiến trình tiết học 45–60 phút</h2>' +
      '<p>Học theo trình tự: quan sát → hiểu văn hóa → ghi nhớ ngôn ngữ → thực hành → vận dụng.</p></div>' +
      '<div class="mcl-duration-grid"><article><span class="mcl-duration">45 phút</span><strong>Tiết học cốt lõi</strong><p>Hoàn thành 5 hoạt động đầu, phù hợp một tiết học tiêu chuẩn.</p></article>' +
      '<article><span class="mcl-duration">60 phút</span><strong>Tiết học mở rộng</strong><p>Thêm thảo luận, xử lý tình huống và đánh giá đầu ra.</p></article></div>' +
      '<div class="mcl-timeline">' + renderTimeline() + '</div>' +
      '<div class="mcl-outcomes"><div><h3>🎯 Sau bài học, học viên có thể</h3><ul>' +
      (plan.goals || []).map((g) => '<li>' + esc(g) + '</li>').join('') +
      '</ul></div><div><h3>📚 Trọng tâm cần nắm</h3><ul>' +
      (plan.focus || []).map((f) => '<li>' + esc(f) + '</li>').join('') +
      '</ul></div></div>' +
      '<div class="mcl-patterns"><h3>🧩 Cấu trúc và câu nói cần nhớ</h3>' +
      (plan.patterns || []).map((p) => '<p>' + esc(p) + '</p>').join('') + '</div>';
    return section;
  }

  function imageMarkup(image, label) {
    if (!image || !image.src) return '';
    return '<figure class="mcl-practice-image"><img loading="lazy" decoding="async" src="' + esc(image.src) + '" alt="' + esc(image.alt) + '">' +
      '<figcaption>' + esc((image.caption || label || image.alt).slice(0, 170)) + '</figcaption></figure>';
  }

  function buildPractice(topic, plan, photos) {
    const section = document.createElement('section');
    section.id = 'mrleeSpeakingLab';
    section.className = 'mcl-speaking-lab';
    const cards = (plan.practice || []).map((sample, sampleIndex) => {
      const selected = (sample.images || []).map((n) => photos[n]).filter(Boolean);
      const pictures = selected.map((photo, i) => imageMarkup(photo, 'Ảnh tình huống ' + (i + 1))).join('');
      const lines = (sample.dialogue || []).map((line, lineIndex) =>
        '<div class="mcl-dialogue-line" data-speaker="' + esc(line[0]) + '">' +
        '<span class="mcl-speaker">' + (line[0] === 'A' ? esc(sample.roles[0]) : esc(sample.roles[1])) + '</span>' +
        '<div class="mcl-line-copy"><strong lang="ko">' + esc(line[1]) + '</strong><span>' + esc(line[2]) + '</span></div>' +
        '<button type="button" class="mcl-line-audio" data-mcl-line="' + sampleIndex + ':' + lineIndex + '" aria-label="Nghe câu tiếng Hàn">🔊</button></div>'
      ).join('');
      return '<article class="mcl-practice-card" data-sample="' + sampleIndex + '" data-swapped="0">' +
        '<div class="mcl-practice-top"><span class="mcl-sample-number">MẪU ' + String(sampleIndex + 1).padStart(2, '0') + '</span><span class="mcl-practice-kind">LUYỆN NÓI THEO VAI</span></div>' +
        '<h3>' + esc(sample.title) + '</h3><p class="mcl-scene">' + esc(sample.scene) + '</p>' +
        '<div class="mcl-practice-images">' + pictures + '</div>' +
        '<div class="mcl-role-row"><span class="mcl-role-a">A · ' + esc(sample.roles[0]) + '</span><span class="mcl-role-b">B · ' + esc(sample.roles[1]) + '</span></div>' +
        '<div class="mcl-dialogue">' + lines + '</div>' +
        '<div class="mcl-practice-actions"><button type="button" class="mcl-primary-action" data-mcl-play="' + sampleIndex + '">▶ Nghe cả hội thoại</button>' +
        '<button type="button" class="mcl-secondary-action" data-mcl-swap="' + sampleIndex + '">⇄ Đổi vai</button></div>' +
        '<p class="mcl-audio-status" aria-live="polite"></p>' +
        '<details class="mcl-variation"><summary>🔁 Thay thông tin để luyện thêm</summary><p>' + esc(sample.variation) + '</p></details>' +
        '<div class="mcl-challenge"><strong>🎤 Thử thách nói</strong><p>' + esc(sample.challenge) + '</p></div></article>';
    }).join('');
    section.innerHTML =
      '<div class="mcl-section-head"><span class="mcl-eyebrow">SPEAKING PRACTICE</span><h2>Thực hành nói qua tình huống</h2>' +
      '<p>Mỗi mẫu có hình ảnh gợi bối cảnh, hội thoại song ngữ, nghe từng câu, đổi vai và nhiệm vụ biến đổi thông tin.</p></div>' +
      '<div class="mcl-practice-grid">' + cards + '</div>';
    return section;
  }

  function buildApplication(plan) {
    const section = document.createElement('section');
    section.id = 'mrleeApplication';
    section.className = 'mcl-application';
    section.innerHTML =
      '<div class="mcl-section-head"><span class="mcl-eyebrow">APPLY & REFLECT</span><h2>Vận dụng và phản xạ cuối bài</h2>' +
      '<p>Dành cho 10–15 phút mở rộng của tiết học 60 phút.</p></div>' +
      '<div class="mcl-application-grid"><article><h3>💬 Thảo luận mở</h3><ol>' +
      (plan.discussion || []).map((q) => '<li>' + esc(q) + '</li>').join('') +
      '</ol></article><article><h3>🏁 Nhiệm vụ đầu ra</h3><p>' + esc(plan.exit || 'Tóm tắt điều quan trọng nhất của bài học.') +
      '</p><p class="mcl-teacher-note">Gợi ý đánh giá: đúng bối cảnh · dùng câu lịch sự phù hợp · phát âm rõ · phản hồi tự nhiên.</p></article></div>';
    return section;
  }

  function getKoreanVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find((v) => /^ko([-_]|$)/i.test(v.lang)) || null;
  }

  function playKorean(lines, status) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      if (status) status.textContent = 'Trình duyệt chưa hỗ trợ phát giọng đọc. Hãy đọc theo mẫu câu trên màn hình.';
      return;
    }
    const voice = getKoreanVoice();
    if (!voice && status) status.textContent = 'Thiết bị chưa có giọng tiếng Hàn ko-KR. Bạn vẫn có thể đọc theo từng câu.';
    window.speechSynthesis.cancel();
    lines.forEach((line) => {
      const utterance = new SpeechSynthesisUtterance(line);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.88;
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    });
  }

  function wirePractice(section, plan) {
    section.addEventListener('click', (event) => {
      const play = event.target.closest('[data-mcl-play]');
      const line = event.target.closest('[data-mcl-line]');
      const swap = event.target.closest('[data-mcl-swap]');
      if (play) {
        const index = Number(play.dataset.mclPlay);
        const card = play.closest('.mcl-practice-card');
        const status = $('.mcl-audio-status', card);
        const sample = plan.practice[index];
        playKorean(sample.dialogue.map((x) => x[1]), status);
      }
      if (line) {
        const parts = line.dataset.mclLine.split(':').map(Number);
        const sample = plan.practice[parts[0]];
        const status = $('.mcl-audio-status', line.closest('.mcl-practice-card'));
        playKorean([sample.dialogue[parts[1]][1]], status);
      }
      if (swap) {
        const card = swap.closest('.mcl-practice-card');
        const next = card.dataset.swapped !== '1';
        card.dataset.swapped = next ? '1' : '0';
        const roles = plan.practice[Number(swap.dataset.mclSwap)].roles;
        $$('.mcl-dialogue-line', card).forEach((row) => {
          const speaker = row.dataset.speaker;
          const label = $('.mcl-speaker', row);
          label.textContent = (speaker === 'A' ? (next ? roles[1] : roles[0]) : (next ? roles[0] : roles[1]));
        });
        const a = $('.mcl-role-a', card);
        const b = $('.mcl-role-b', card);
        a.textContent = 'A · ' + (next ? roles[1] : roles[0]);
        b.textContent = 'B · ' + (next ? roles[0] : roles[1]);
      }
    });
  }

  function addQuickLinks() {
    const panel = $$('.sidePanel').find((node) => /Mở nhanh/.test(textOnly($('h3', node))));
    if (!panel) return;
    const links = [
      ['#mrleeLessonPlan', 'Tiến trình 45–60 phút'],
      ['#mrleeSpeakingLab', '3 mẫu thực hành nói'],
      ['#mrleeApplication', 'Vận dụng cuối bài']
    ];
    links.forEach((item) => {
      if (!$('a[href="' + item[0] + '"]', panel)) {
        const a = document.createElement('a');
        a.href = item[0];
        a.textContent = item[1];
        panel.insertBefore(a, $('a[href="van-hoa-han-quoc.html"]', panel) || null);
      }
    });
  }

  function buildLesson() {
    const box = $('#lessonContent');
    if (!box) return;
    const slug = new URLSearchParams(window.location.search).get('chu-de') || (topics[0] && topics[0].slug);
    const topicIndex = topics.findIndex((t) => t.slug === slug);
    const topic = topics[topicIndex];
    const plan = plans[slug];
    if (!topic || !plan) return;
    if ($('#mrleeLessonPlan', box)) return;

    const heroText = $('.lessonHeroText', $('#topicHero'));
    if (heroText && !$('.mcl-hero-meta', heroText)) {
      const meta = document.createElement('div');
      meta.className = 'mcl-hero-meta';
      meta.innerHTML = '<span>◷ 45–60 phút</span><span>3 mẫu hội thoại</span><span>Thực hành theo cặp</span>';
      heroText.append(meta);
    }

    const read = $('#read', box);
    const lessonPlan = buildPlan(topic, plan);
    if (read) box.insertBefore(lessonPlan, read);
    else box.insertBefore(lessonPlan, box.firstChild);

    const photos = getLessonImages(topic, topicIndex);
    const practice = buildPractice(topic, plan, photos);
    const talk = $('#talk', box);
    const words = $('#words', box);
    if (talk) talk.insertAdjacentElement('afterend', practice);
    else if (words) box.insertBefore(practice, words);
    else box.append(practice);

    const application = buildApplication(plan);
    const quiz = $('#quiz', box);
    if (quiz) quiz.insertAdjacentElement('beforebegin', application);
    else box.append(application);

    const talkTitle = $('h2', talk);
    if (talkTitle) talkTitle.textContent = '💬 Câu mẫu nền tảng';
    wirePractice(practice, plan);
    addQuickLinks();
  }

  function init() {
    addHubIntro();
    buildLesson();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
