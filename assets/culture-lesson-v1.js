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
        if (action && action.textContent !== 'Vào bài giảng · Lý thuyết · Luyện nói') action.textContent = 'Vào bài giảng · Lý thuyết · Luyện nói';
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
      ['00–05', 'Khởi động bằng hình ảnh', '5 phút', 'Quan sát ảnh và dự đoán hai người cần trao đổi điều gì.'],
      ['05–15', 'Lý thuyết văn hóa', '10 phút', 'Đọc kiến thức, giải thích hoàn cảnh áp dụng và phân tích một ngoại lệ.'],
      ['15–21', 'Từ vựng trọng tâm', '6 phút', 'Nghe, nhắc lại và đặt câu với các từ khóa trong tình huống.'],
      ['21–29', 'Nghe và hỏi đáp', '8 phút', 'Nghe mẫu thứ nhất, trả lời theo cặp rồi kiểm tra với bản dịch.'],
      ['29–40', 'Đóng vai và xử lý tình huống', '11 phút', 'Luyện hai mẫu còn lại, đổi vai và thực hiện biến thể.'],
      ['40–45', 'Đánh giá tiết 45 phút', '5 phút', 'Thực hiện nhiệm vụ đầu ra và chấm theo bảng tiêu chí.'],
      ['40–55', 'Luyện phản xạ mở rộng', '15 phút', 'Với tiết 60 phút, thay lượt đánh giá ở phút 40 bằng lượt nói tự do và thảo luận.'],
      ['55–60', 'Đánh giá tiết 60 phút', '5 phút', 'Thực hiện nhiệm vụ đầu ra và chấm theo bảng tiêu chí.']
    ];
    return blocks.map((b, i) =>
      '<div class="mcl-time-row ' + (i < 6 ? 'mcl-core' : 'mcl-extension') + '">' +
      '<span class="mcl-time">' + b[0] + '</span><div><strong>' + b[1] + '</strong><p>' + b[3] + '</p></div>' +
      '<span class="mcl-minutes">' + b[2] + '</span></div>'
    ).join('');
  }

  function buildPlan(plan) {
    const section = document.createElement('section');
    section.id = 'mrleeLessonPlan';
    section.className = 'mcl-lesson-plan';
    section.innerHTML =
      '<div class="mcl-section-head"><span class="mcl-eyebrow">BÀI GIẢNG MR LEE</span><h2>Tiến trình tiết học 45–60 phút</h2>' +
      '<p>Học theo trình tự: quan sát → hiểu văn hóa → ghi nhớ ngôn ngữ → thực hành → vận dụng.</p></div>' +
      '<div class="mcl-duration-grid"><article><span class="mcl-duration">45 phút</span><strong>Tiết học cốt lõi</strong><p>Dành 5 phút cuối để đánh giá nhiệm vụ nói.</p></article>' +
      '<article><span class="mcl-duration">60 phút</span><strong>Tiết học mở rộng</strong><p>Thêm 15 phút luyện phản xạ, sau đó thực hiện cùng nhiệm vụ đánh giá.</p></article></div>' +
      '<div class="mcl-timeline">' + renderTimeline() + '</div>' +
      '<div class="mcl-outcomes"><div><h3>🎯 Sau bài học, học viên có thể</h3><ul>' +
      (plan.goals || []).map((g) => '<li>' + esc(g) + '</li>').join('') +
      '</ul></div><div><h3>📚 Trọng tâm cần nắm</h3><ul>' +
      plan.focus.map((f) => '<li>' + esc(f) + '</li>').join('') +
      '</ul></div></div>' +
      '<div class="mcl-patterns"><h3>Áp dụng vào tình huống</h3><p>' + esc(plan.context) + '</p></div>' +
      '<div class="mcl-patterns"><h3>🧩 Cấu trúc và câu nói cần nhớ</h3>' +
      (plan.patterns || []).map((p) => '<p>' + esc(p) + '</p>').join('') + '</div>';
    return section;
  }

  function imageMarkup(image, label) {
    if (!image || !image.src) return '';
    return '<figure class="mcl-practice-image"><a href="' + esc(image.src) + '" target="_blank" rel="noopener noreferrer" title="Mở ảnh lớn">' +
      '<img loading="lazy" decoding="async" width="1536" height="1024" src="' + esc(image.src) + '" alt="' + esc(image.alt) + '"></a>' +
      '<figcaption>' + esc((image.caption || label || image.alt).slice(0, 170)) + '</figcaption></figure>';
  }

  function buildPractice(plan, photos) {
    const section = document.createElement('section');
    section.id = 'mrleeSpeakingLab';
    section.className = 'mcl-speaking-lab';
    const formats = ['Hỏi đáp', 'Đóng vai', 'Xử lý tình huống và phản xạ'];
    const directions = [
      'Nghe một lượt, che bản dịch rồi hỏi lại bạn cùng cặp. Người trả lời thay ít nhất một thông tin.',
      'Chọn vai A hoặc B và nói ở lượt của mình. Lặp lại với vai còn lại và dùng biến thể bên dưới.',
      'Bạn cùng cặp đổi một dữ kiện ngay trước lượt nói. Dành tối đa 5 giây để hỏi lại, xác nhận hoặc đề xuất cách xử lý.'
    ];
    const cards = plan.practice.map((sample, sampleIndex) => {
      const selected = sample.photo ? [sample.photo] : sample.images.map((index) => photos[index]).filter(Boolean);
      const pictures = selected.map((photo, i) => imageMarkup(photo, 'Ảnh tình huống ' + (i + 1))).join('');
      const lines = (sample.dialogue || []).map((line, lineIndex) =>
        '<div class="mcl-dialogue-line" data-speaker="' + esc(line[0]) + '">' +
        '<span class="mcl-speaker">' + (line[0] === 'A' ? esc(sample.roles[0]) : esc(sample.roles[1])) + '</span>' +
        '<div class="mcl-line-copy"><strong lang="ko">' + esc(line[1]) + '</strong><span class="mcl-translation">' + esc(line[2]) + '</span></div>' +
        '<button type="button" class="mcl-line-audio" data-mcl-line="' + sampleIndex + ':' + lineIndex + '" aria-label="Nghe câu tiếng Hàn">🔊</button></div>'
      ).join('');
      return '<article class="mcl-practice-card" data-sample="' + sampleIndex + '" data-role="none">' +
        '<div class="mcl-practice-top"><span class="mcl-sample-number">MẪU ' + String(sampleIndex + 1).padStart(2, '0') + '</span><span class="mcl-practice-kind">' + formats[sampleIndex] + '</span></div>' +
        '<h3>' + esc(sample.title) + '</h3><p class="mcl-scene">' + esc(sample.scene) + '</p><p class="mcl-instruction">' + directions[sampleIndex] + '</p>' +
        '<div class="mcl-practice-images">' + pictures + '</div>' +
        '<div class="mcl-role-row"><span class="mcl-role-a">A · ' + esc(sample.roles[0]) + '</span><span class="mcl-role-b">B · ' + esc(sample.roles[1]) + '</span></div>' +
        '<div class="mcl-dialogue">' + lines + '</div>' +
        '<div class="mcl-practice-actions"><button type="button" class="mcl-primary-action" data-mcl-play="' + sampleIndex + '">▶ Nghe cả hội thoại</button>' +
        '<button type="button" class="mcl-secondary-action" data-mcl-stop disabled>Dừng</button>' +
        '<button type="button" class="mcl-secondary-action" data-mcl-translate aria-pressed="true">Bản dịch tiếng Việt</button>' +
        '<button type="button" class="mcl-secondary-action" data-mcl-swap>Vai của bạn: Chưa chọn</button>' +
        '<button type="button" class="mcl-secondary-action" data-mcl-rehearse disabled>Luyện theo vai</button></div>' +
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
      '<p>Thảo luận dành cho tiết 60 phút. Nhiệm vụ đầu ra áp dụng cho cả hai thời lượng.</p></div>' +
      '<div class="mcl-application-grid"><article><h3>💬 Thảo luận mở</h3><ol>' +
      (plan.discussion || []).map((q) => '<li>' + esc(q) + '</li>').join('') +
      '</ol></article><article><h3>🏁 Nhiệm vụ đầu ra</h3><p>' + esc(plan.exit || 'Tóm tắt điều quan trọng nhất của bài học.') +
      '</p><fieldset class="mcl-rubric"><legend>Tiêu chí đánh giá (1 điểm mỗi mục)</legend>' +
      [
        'Hoàn thành đủ yêu cầu trong nhiệm vụ.',
        'Dùng cách xưng hô và đuôi câu phù hợp.',
        'Nói rõ để người nghe hiểu thông tin chính.',
        'Phản hồi phù hợp hoặc hỏi lại khi chưa rõ.'
      ].map((criterion) => '<label><input type="checkbox"> ' + criterion + '</label>').join('') +
      '<output aria-live="polite">0/4 điểm</output></fieldset></article></div>';
    const rubric = $('.mcl-rubric', section);
    rubric.addEventListener('change', () => {
      $('output', rubric).textContent = $$('input:checked', rubric).length + '/4 điểm';
    });
    return section;
  }

  function wirePractice(section, plan) {
    const synthesis = window.speechSynthesis;
    let session;

    function stop(message = 'Đã dừng.') {
      if (!session) return;
      const current = session;
      session = null;
      synthesis?.cancel();
      current.card.querySelector('[data-mcl-stop]').disabled = true;
      current.card.querySelector('[data-mcl-rehearse]').textContent = 'Luyện theo vai';
      current.card.querySelector('.mcl-audio-status').textContent = message;
      current.card.querySelector('.mcl-dialogue-line.is-current')?.classList.remove('is-current');
    }

    function start(card, turns, role) {
      stop();
      const voice = synthesis?.getVoices().find((entry) => /^ko([-_]|$)/i.test(entry.lang));
      const status = $('.mcl-audio-status', card);
      if (!voice || !window.SpeechSynthesisUtterance) {
        status.textContent = 'Chưa tìm thấy giọng tiếng Hàn. Hãy bật giọng 한국어 trên thiết bị rồi thử lại.';
        return;
      }
      const rows = $$('.mcl-dialogue-line', card);
      const nextButton = $('[data-mcl-rehearse]', card);
      const current = { card, advance: null };
      session = current;
      $('[data-mcl-stop]', card).disabled = false;

      function advance() {
        if (session !== current) return;
        $('.is-current', card)?.classList.remove('is-current');
        const turn = turns.shift();
        if (!turn) {
          nextButton.textContent = 'Luyện theo vai';
          stop('Đã hoàn thành lượt luyện.');
          return;
        }
        const { line, index } = turn;
        rows[index].classList.add('is-current');
        if (line[0] === role) {
          status.textContent = 'Đến lượt bạn nói. Chọn « Tiếp tục » khi đã nói xong.';
          nextButton.textContent = 'Tiếp tục';
          current.advance = advance;
          return;
        }
        current.advance = null;
        nextButton.textContent = 'Luyện theo vai';
        status.textContent = 'Đang phát câu ' + (index + 1) + '.';
        const utterance = new SpeechSynthesisUtterance(line[1]);
        utterance.lang = 'ko-KR';
        utterance.voice = voice;
        utterance.rate = 0.88;
        utterance.onend = advance;
        utterance.onerror = () => {
          if (session === current) stop('Không phát được âm thanh. Hãy kiểm tra giọng tiếng Hàn và thử lại.');
        };
        synthesis.speak(utterance);
      }

      advance();
    }

    section.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      const card = button?.closest('.mcl-practice-card');
      if (!card) return;
      const sample = plan.practice[Number(card.dataset.sample)];
      const turns = sample.dialogue.map((line, index) => ({ line, index }));
      const status = $('.mcl-audio-status', card);
      if (button.hasAttribute('data-mcl-translate')) {
        const show = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(show));
        $$('.mcl-translation', card).forEach((line) => { line.hidden = !show; });
      } else if (button.hasAttribute('data-mcl-swap')) {
        if (session?.card === card) stop();
        const role = card.dataset.role === 'A' ? 'B' : 'A';
        card.dataset.role = role;
        button.textContent = 'Vai của bạn: ' + role + ' · ' + sample.roles[role === 'A' ? 0 : 1];
        $('[data-mcl-rehearse]', card).disabled = false;
        status.textContent = 'Đã chọn vai ' + role + '.';
      } else if (button.hasAttribute('data-mcl-stop')) {
        stop();
      } else if (button.hasAttribute('data-mcl-line')) {
        start(card, [turns[Number(button.dataset.mclLine.split(':')[1])]]);
      } else if (button.hasAttribute('data-mcl-play')) {
        start(card, turns);
      } else if (button.hasAttribute('data-mcl-rehearse')) {
        if (session?.card === card && session.advance) session.advance();
        else if (session?.card !== card) start(card, turns, card.dataset.role);
      }
    });
    window.addEventListener('pagehide', () => stop());
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
    const plan = topic && plans[topic.slug];
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
    const lessonPlan = buildPlan(plan);
    if (read) box.insertBefore(lessonPlan, read);
    else box.insertBefore(lessonPlan, box.firstChild);

    const photos = getLessonImages(topic, topicIndex);
    const practice = buildPractice(plan, photos);
    const talk = $('#talk', box);
    const words = $('#words', box);
    if (talk && words) {
      words.insertAdjacentElement('afterend', talk);
      talk.insertAdjacentElement('afterend', practice);
    } else if (talk) talk.insertAdjacentElement('afterend', practice);
    else if (words) words.insertAdjacentElement('afterend', practice);
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
  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
