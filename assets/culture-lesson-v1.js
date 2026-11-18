/* MR LEE Culture Lesson V1 · 60 minute classroom flow */
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
    const grid = $('#topics');
    if (!section || !grid) return;
    const description = $('.sectionHeading p', section);
    if (description) description.textContent = '22 chủ đề để tìm hiểu văn hóa Hàn Quốc và luyện giao tiếp qua tình huống thực tế. Mỗi bài học kéo dài 60 phút.';
    const decorate = () => {
      $$('.topic', grid).forEach((card) => {
        if (!$('.mcl-card-meta', card)) {
          const meta = document.createElement('div');
          meta.className = 'mcl-card-meta';
          meta.innerHTML = '<span>60 phút</span><span>3 hoạt động nói</span>';
          const open = $('.openLink', card);
          if (open) open.insertAdjacentElement('beforebegin', meta);
          else card.append(meta);
        }
        const action = $('.openLink span:first-child', card);
        if (action && action.textContent !== 'Mở bài học') action.textContent = 'Mở bài học';
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
    {
      (topic.realPhotos || []).forEach((photo) => {
        if (!photo.local || items.some((item) => item.src === photo.local)) return;
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
    return items;
  }

  function renderTimeline() {
    const blocks = [
      ['00–05', 'Quan sát và dự đoán', '5 phút', 'Quan sát ảnh và nêu dự đoán theo cặp.'],
      ['05–15', 'Kiến thức và tư liệu', '10 phút', 'So sánh ảnh hoặc xem trích đoạn video rồi thảo luận.'],
      ['15–23', 'Từ vựng và câu mẫu', '8 phút', 'Nghe, nhắc lại và thay thông tin.'],
      ['23–33', 'Nghe hội thoại', '10 phút', 'Nghe, xác định vai và kiểm tra bằng bản dịch.'],
      ['33–48', 'Đóng vai', '15 phút', 'Luyện hai tình huống, đổi vai và đổi dữ kiện.'],
      ['48–55', 'Vận dụng', '7 phút', 'Thực hiện nhiệm vụ nói theo yêu cầu.'],
      ['55–60', 'Kiểm tra cuối tiết', '5 phút', 'Trả lời câu hỏi và tự đánh giá nhiệm vụ nói.']
    ];
    return blocks.map((b) =>
      '<div class="mcl-time-row mcl-core">' +
      '<span class="mcl-time">' + b[0] + '</span><div><strong>' + b[1] + '</strong><p>' + b[3] + '</p></div>' +
      '<span class="mcl-minutes">' + b[2] + '</span></div>'
    ).join('');
  }

  function buildPlan(plan) {
    const section = document.createElement('section');
    section.id = 'mrleeLessonPlan';
    section.className = 'mcl-lesson-plan';
    section.innerHTML =
      '<div class="mcl-section-head"><span class="mcl-eyebrow">BÀI GIẢNG MR LEE</span><h2>Tiến trình tiết học 60 phút</h2>' +
      '<p>Học theo trình tự: quan sát → hiểu văn hóa → ghi nhớ ngôn ngữ → thực hành → vận dụng.</p></div>' +
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
        '<div class="mcl-practice-context"><div class="mcl-practice-top"><span class="mcl-sample-number">MẪU ' + String(sampleIndex + 1).padStart(2, '0') + '</span><span class="mcl-practice-kind">' + formats[sampleIndex] + '</span></div>' +
        '<h3>' + esc(sample.title) + '</h3><p class="mcl-scene">' + esc(sample.scene) + '</p><p class="mcl-instruction">' + directions[sampleIndex] + '</p>' +
        '<div class="mcl-practice-images">' + pictures + '</div></div><div class="mcl-practice-conversation">' +
        '<div class="mcl-role-row"><span class="mcl-role-a">A · ' + esc(sample.roles[0]) + '</span><span class="mcl-role-b">B · ' + esc(sample.roles[1]) + '</span></div>' +
        '<div class="mcl-dialogue">' + lines + '</div>' +
        '<div class="mcl-practice-actions"><button type="button" class="mcl-primary-action" data-mcl-play="' + sampleIndex + '">▶ Nghe cả hội thoại</button>' +
        '<button type="button" class="mcl-secondary-action" data-mcl-stop disabled>Dừng</button>' +
        '<button type="button" class="mcl-secondary-action" data-mcl-translate aria-pressed="true">Bản dịch tiếng Việt</button>' +
        '<button type="button" class="mcl-secondary-action" data-mcl-swap>Vai của bạn: Chưa chọn</button>' +
        '<button type="button" class="mcl-secondary-action" data-mcl-rehearse disabled>Luyện theo vai</button></div>' +
        '<p class="mcl-audio-status" aria-live="polite"></p>' +
        '<details class="mcl-variation"><summary>🔁 Thay thông tin để luyện thêm</summary><p>' + esc(sample.variation) + '</p></details>' +
        '<div class="mcl-challenge"><strong>🎤 Thử thách nói</strong><p>' + esc(sample.challenge) + '</p></div></div></article>';
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
      ['#mrleeLessonPlan', 'Tiến trình 60 phút'],
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



  const mediaQueries = {
  "le-hoi": "Seollal Chuseok",
  "am-thuc": "Korean cuisine",
  "truyen-thong": "Korean traditional culture hanbok",
  "doi-song": "daily life South Korea",
  "phe-lich-su": "Korean etiquette",
  "giao-duc": "education South Korea university",
  "du-lich": "tourism South Korea",
  "kpop": "K-pop South Korea",
  "cong-so": "South Korea office workplace",
  "tro-choi": "Korean traditional games",
  "lich-su": "history of Korea",
  "hien-dai": "modern South Korea",
  "so-cap-cuu": "first aid CPR training",
  "goi-cuu-ho": "emergency services South Korea",
  "lac-duong": "street signs South Korea",
  "mat-vi": "lost and found South Korea",
  "tau-dien-ngam": "Seoul Metro",
  "xe-buyt": "buses South Korea",
  "benh-vien": "hospitals South Korea",
  "hoa-hoan": "firefighters South Korea",
  "mat-dien-thoai": "smartphones South Korea",
  "an-toan-giao-thong": "pedestrian crossings South Korea"
};
  const mediaCache = new Map();

  async function searchClassroomMedia(query, kind, limit) {
    const key = kind + ':' + query;
    if (!mediaCache.has(key)) {
      const fetchFiles = async (search) => {
        const params = new URLSearchParams({
          action: 'query', format: 'json', formatversion: '2', origin: '*',
          generator: 'search', gsrnamespace: '6', gsrlimit: String(limit),
          gsrsearch: search + ' filetype:' + kind, prop: 'imageinfo', iiprop: 'url|mime', iiurlwidth: '400'
        });
        const response = await fetch('https://commons.wikimedia.org/w/api.php?' + params, {
          credentials: 'omit', signal: AbortSignal.timeout(12000)
        });
        if (!response.ok) throw new Error('Wikimedia Commons unavailable');
        const data = await response.json();
        if (data.error) throw new Error(data.error.code);
        return (data.query?.pages || []).sort((a, b) => a.index - b.index).map((page) => ({
          title: page.title.replace(/^File:/, '').replace(/\.[^.]+$/, ''),
          info: page.imageinfo?.[0]
        })).filter(({info}) => info?.mime?.startsWith(kind === 'bitmap' ? 'image/' : 'video/'));
      };
      mediaCache.set(key, fetchFiles(query).catch((error) => {
        mediaCache.delete(key);
        throw error;
      }));
    }
    return mediaCache.get(key);
  }

  function slideResources(topic, samples) {
    const foundational = topic.dialogue.map((line, i) => [i % 2 ? 'B' : 'A', line.ko, line.vi]);
    const dialogues = [
      { title: 'Hội thoại nền tảng', dialogue: foundational },
      ...samples,
      ...samples.flatMap((sample) => [
        { title: sample.title + ' · Mở đầu', dialogue: sample.dialogue.slice(0, 2) },
        { title: sample.title + ' · Hỏi đáp tiếp', dialogue: sample.dialogue.slice(2, 4) }
      ])
    ].filter((sample) => sample.dialogue.length >= 2);
    return '<details class="mcl-slide-library"><summary>Ảnh theo chủ đề · tối đa 50</summary>' +
      '<div data-gallery="bitmap"></div></details>' +
      '<details class="mcl-slide-library"><summary>Video theo chủ đề · tối đa 6</summary>' +
      '<div data-gallery="video"></div></details>' +
      '<details class="mcl-slide-library"><summary>Luyện hội thoại · ' + dialogues.length + ' bài và đoạn luyện</summary>' +
      dialogues.map((sample) => '<details><summary>' + esc(sample.title) + '</summary>' +
        sample.dialogue.map((line) => '<p><strong lang="ko">' + esc(line[0] + ' · ' + line[1]) + '</strong> ' +
          '<button type="button" data-speak="' + esc(line[1]) + '" aria-label="Nghe câu tiếng Hàn">🔊</button>' +
          '<br>' + esc(line[2]) + '</p>').join('') + '</details>').join('') + '</details>';
  }

  async function loadSlideResources(details, topic) {
    const gallery = $('[data-gallery]', details);
    if (!gallery || gallery.dataset.loaded) return;
    gallery.dataset.loaded = 'pending';
    const render = (items) => {
      gallery.replaceChildren();
      const grid = document.createElement('div');
      grid.className = 'mcl-deck-pictures';
      gallery.append(grid);
      for (const item of items) {
        const figure = document.createElement('figure');
        const link = document.createElement('a');
        link.href = item.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.title;
        if (item.src) {
          const image = document.createElement('img');
          image.loading = 'lazy';
          image.decoding = 'async';
          image.alt = item.title;
          image.src = item.src;
          image.addEventListener('error', () => image.remove(), {once: true});
          figure.append(image);
        }
        const caption = document.createElement('figcaption');
        caption.append(link);
        figure.append(caption);
        grid.append(figure);
      }
    };
    const kind = gallery.dataset.gallery;
    const isPhoto = kind === 'bitmap';
    const video = window.MRLEE_CULTURE_V17_MEDIA?.[topic.slug]?.video;
    const local = isPhoto
      ? (topic.realPhotos || []).map((photo) => ({src: photo.local, href: photo.source || photo.local, title: photo.title}))
      : video?.url ? [{href: video.url, title: video.title}] : [];
    const cap = isPhoto ? 50 : 6;
    const query = mediaQueries[topic.slug] || topic.ko;
    if (!isPhoto && ['so-cap-cuu', 'goi-cuu-ho', 'benh-vien', 'hoa-hoan'].includes(topic.slug)) {
      render(local);
      if (!local.length) gallery.textContent = 'Đang chờ video từ cơ quan chuyên môn.';
      gallery.dataset.loaded = 'yes';
      return;
    }
    try {
      gallery.textContent = 'Đang tải tư liệu…';
      const files = await searchClassroomMedia(query, kind, cap);
      const items = [...local, ...files.map(({title, info}) => ({
        title, href: info.descriptionurl || info.url, src: isPhoto ? info.thumburl : ''
      }))];
      const seen = new Set();
      const unique = items.filter((item) => {
        if (!item.href || seen.has(item.href)) return false;
        seen.add(item.href);
        return true;
      }).slice(0, cap);
      render(unique);
      const notice = document.createElement('p');
      notice.textContent = 'Tìm thấy ' + unique.length + ' tư liệu. Kết quả Wikimedia Commons được tìm theo chủ đề. Xem trước khi chiếu.';
      gallery.prepend(notice);
      gallery.dataset.loaded = 'yes';
    } catch {
      render(local);
      const notice = document.createElement('p');
      notice.textContent = 'Chưa tải được tư liệu Wikimedia Commons. Đóng và mở lại để thử lại.';
      gallery.prepend(notice);
      delete gallery.dataset.loaded;
    }
  }

  function addPresentation(lessonPlan, topic, plan, photos) {
    const video = window.MRLEE_CULTURE_V17_MEDIA?.[topic.slug]?.video;
    const samples = plan.practice;
    const pictures = (list) => '<div class="mcl-deck-pictures">' + list.map((photo) => imageMarkup(photo)).join('') + '</div>';
    const bullets = (list) => '<ul>' + list.map((value) => '<li>' + esc(value) + '</li>').join('') + '</ul>';
    const prompt = (value) => '<p>' + esc(value) + '</p>';
    const media = video?.url && /^https:\/\//.test(video.url)
      ? '<p><a target="_blank" rel="noopener noreferrer" href="' + esc(video.url) + '">▶ ' +
        esc(video.title) + '</a> · ' + esc(video.owner) + '</p>' + prompt(video.description) +
        prompt('Xem một đoạn do giáo viên chọn. Nêu một chi tiết liên quan tới bài học và giải thích bằng lời của mình.')
      : prompt('Chọn hai ảnh. Mô tả mỗi ảnh bằng một từ khóa rồi giải thích ảnh nào liên quan nhất đến tình huống mở đầu.');
    const quiz = topic.quiz || topic.quizSet[0];
    const slides = [
      ['00–05', topic.title, '<p lang="ko">' + esc(topic.ko) + '</p>' + pictures(photos.slice(0, 2)) +
        prompt(samples[0].scene) + prompt('Quan sát ảnh, dự đoán cách ứng xử và trao đổi với bạn bên cạnh.')],
      ['05–15', 'Khám phá chủ đề', bullets(plan.focus) + media + pictures(photos.slice(2))],
      ['15–23', 'Từ vựng và câu mẫu', bullets(topic.words.map((word) => word.ko + ' — ' + word.vi)) +
        bullets(plan.patterns) + prompt('Đọc theo giáo viên rồi thay một thông tin trong câu mẫu.')],
      ['23–33', samples[0].title, prompt('Nghe và xác định vai của hai người. Sau đó mở bản dịch để đối chiếu.') +
        samples[0].dialogue.map((line) => '<p lang="ko">' + esc(line[0] + ' · ' + line[1]) +
          ' <button type="button" data-speak="' + esc(line[1]) + '" aria-label="Nghe câu tiếng Hàn">🔊</button></p>').join('') +
        '<details><summary>Hiện bản dịch</summary>' + bullets(samples[0].dialogue.map((line) => line[2])) + '</details>'],
      ['33–48', 'Đóng vai và đổi tình huống', samples.slice(1).map((sample) =>
        '<h3>' + esc(sample.title) + '</h3>' + (sample.photo ? pictures([sample.photo]) : '') +
        prompt(sample.scene) + prompt(sample.roles.join(' · ')) + prompt(sample.variation) +
        '<details><summary>Mở hội thoại gợi ý</summary>' + bullets(sample.dialogue.map((line) => line[1] + ' — ' + line[2])) +
        '</details>').join('')],
      ['48–55', 'Vận dụng theo cặp', prompt(plan.context) + bullets(samples.map((sample) => sample.challenge)) +
        prompt('Mỗi cặp chọn một nhiệm vụ, chuẩn bị 2 phút, lần lượt trình bày và góp ý theo mục tiêu bài học.')],
      ['55–60', 'Kiểm tra cuối tiết', prompt(quiz.question) + bullets(quiz.choices) +
        '<details><summary>Hiện đáp án</summary>' + prompt(quiz.choices[quiz.correct]) + prompt(quiz.explanation) +
        '</details><h3>Tự đánh giá theo mục tiêu bài học</h3>' + bullets(plan.goals)]
    ];
    const launch = document.createElement('button');
    launch.type = 'button';
    launch.className = 'mcl-primary-action';
    launch.textContent = '▶ Trình chiếu · 60 phút';
    const dialog = document.createElement('dialog');
    dialog.className = 'mcl-deck';
    dialog.setAttribute('aria-labelledby', 'mcl-deck-title');
    dialog.innerHTML = '<style>' +
      '.mcl-deck{box-sizing:border-box;width:min(96vw,1200px);height:92dvh;max-width:none;max-height:none;border:0;border-radius:18px;padding:0;color:#14213a;background:#f7faff}' +
      '.mcl-deck::backdrop{background:#09152bdd}.mcl-deck-shell:fullscreen{background:#f7faff;color:#14213a}' +
      '.mcl-deck-shell{height:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto}' +
      '.mcl-deck-bar{display:flex;justify-content:space-between;gap:.6rem;align-items:center;flex-wrap:wrap;padding:.7rem clamp(.7rem,3vw,2rem);color:#fff;background:#10294b}' +
      '.mcl-deck button{cursor:pointer;border:1px solid #9eb5d4;border-radius:.5rem;background:white;color:#14213a;padding:.45rem .7rem;font:inherit}' +
      '.mcl-deck button:disabled{opacity:.55;cursor:default}.mcl-deck main{overflow:auto;padding:clamp(1rem,4vw,3rem);font-size:clamp(1.03rem,2vw,1.5rem);line-height:1.5}' +
      '.mcl-deck h2{font-size:clamp(1.7rem,4vw,3rem);margin:0 0 .55em}.mcl-deck h3{font-size:1.15em}.mcl-deck summary{cursor:pointer}' +
      '.mcl-deck-pictures{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:1rem}' +
      '.mcl-deck-pictures figure{margin:0}.mcl-deck-pictures img{width:100%;height:clamp(150px,28vh,265px);object-fit:contain}.mcl-deck-pictures figcaption{font-size:.8em}' +
      '</style><div class="mcl-deck-shell"><header class="mcl-deck-bar"><strong>MR LEE · 60 phút</strong>' +
      '<span><button type="button" data-full>Toàn màn hình</button> <button type="button" data-close>Đóng</button></span></header>' +
      '<main tabindex="-1"></main><footer class="mcl-deck-bar"><button type="button" data-prev>← Trước</button>' +
      '<span data-progress aria-live="polite"></span><button type="button" data-next>Tiếp →</button></footer></div>';
    lessonPlan.prepend(launch);
    document.body.append(dialog);
    const content = $('main', dialog);
    const previous = $('[data-prev]', dialog);
    const next = $('[data-next]', dialog);
    let active = 0;
    function showSlide(index) {
      if (index < 0 || index >= slides.length) return;
      window.speechSynthesis?.cancel();
      active = index;
      const [minutes, heading, body] = slides[index];
      content.innerHTML = '<h2 id="mcl-deck-title">' + esc(heading) + '</h2>' + body + slideResources(topic, samples);
      content.scrollTop = 0;
      $('[data-progress]', dialog).textContent = (index + 1) + '/' + slides.length + ' · Phút ' + minutes;
      previous.disabled = index === 0;
      next.disabled = index === slides.length - 1;
    }
    launch.addEventListener('click', () => {
      showSlide(active);
      dialog.showModal();
      content.focus();
    });
    previous.addEventListener('click', () => showSlide(active - 1));
    next.addEventListener('click', () => showSlide(active + 1));
    $('[data-close]', dialog).addEventListener('click', () => dialog.close());
    const full = $('[data-full]', dialog);
    const shell = $('.mcl-deck-shell', dialog);
    full.hidden = !document.fullscreenEnabled;
    full.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === shell) await document.exitFullscreen();
        else await shell.requestFullscreen();
      } catch {
        full.textContent = 'Toàn màn hình không khả dụng';
      }
    });
    dialog.addEventListener('close', () => {
      window.speechSynthesis?.cancel();
      if (document.fullscreenElement === shell) document.exitFullscreen().catch(() => {});
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showSlide(active + (event.key === 'ArrowRight' ? 1 : -1));
      content.focus();
    });
    content.addEventListener('toggle', (event) => {
      const details = event.target;
      if (details.open && details.classList.contains('mcl-slide-library')) loadSlideResources(details, topic);
    }, true);
    content.addEventListener('click', (event) => {
      const speak = event.target.closest('[data-speak]');
      if (!speak || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
      const utterance = new SpeechSynthesisUtterance(speak.dataset.speak);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.88;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
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
      meta.innerHTML = '<span>◷ 60 phút</span><span>3 mẫu hội thoại</span><span>Thực hành theo cặp</span>';
      heroText.append(meta);
    }

    const read = $('#read', box);
    const lessonPlan = buildPlan(plan);
    if (read) box.insertBefore(lessonPlan, read);
    else box.insertBefore(lessonPlan, box.firstChild);

    const photos = getLessonImages(topic, topicIndex);
    addPresentation(lessonPlan, topic, plan, photos);
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
    const navigation = document.createElement('nav');
    navigation.className = 'mcl-lesson-nav';
    navigation.setAttribute('aria-label', 'Nội dung bài học');
    navigation.innerHTML = '<a href="#mrleeLessonPlan">Tiến trình</a><a href="#read">Kiến thức</a>' +
      '<a href="#words">Từ vựng</a><a href="#mrleeSpeakingLab">Luyện nói</a>' +
      '<a href="#mrleeApplication">Đánh giá</a>';
    $('#topicHero').after(navigation);
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
