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



  const classroomReferences = {
  "am-thuc": [
    [
      "Bibimbap (비빔밥) & Dolsot-bibimbap (돌솥비빔밥)",
      "6QQ67F8y2b8"
    ]
  ],
  "du-lich": [
    [
      "Your ULTIMATE KOREA TRAVEL GUIDE for 2025 🇰🇷 Best of Seoul, Busan & Jeju Island!",
      "Uz9PDwfsbfg"
    ]
  ],
  "cong-so": [
    [
      "Korean Workplace Conversations – Beginner Level Office Korean Practice",
      "GTVoGYAtQ2A"
    ],
    [
      "10 Korean Conversation for beginners | Daily Life at the Office",
      "_496jppDCRg"
    ]
  ],
  "tro-choi": [
    [
      "Squid Game? Nope — Real Korean Traditional Games 🇰🇷 | Tuho, Jegi & Yutnori",
      "ebBhsALzFXc"
    ],
    [
      "3 KOREAN TRADITIONAL GAMES ( #YUTNORI #GONGGI #JEGICHAGI) |  #talktalkkorea2022  #TTK_enjoy",
      "EUzuE-HqpFQ"
    ]
  ],
  "lich-su": [
    [
      "Capture the Best Moments : Korean Heritage Series | EP.1 한국의 문화유산(Cultural Heritage of Korea)",
      "EpeRdoGwM74"
    ],
    [
      "Life in the Joseon Dynasty, 1904",
      "ixUuIqa-qr8"
    ]
  ],
  "so-cap-cuu": [
    [
      "How to do CPR on an Adult - First Aid Training - St John Ambulance",
      "BQNNOh8c8ks"
    ]
  ],
  "goi-cuu-ho": [
    [
      "[스페셜클립- Ep.164 ] - 🌎글로벌 시대! 글로벌한 🚑119서비스🚒를 소개해드립니다 📞외국인1️⃣1️⃣9️⃣신고 실시간 통역서비스(전라북도 소방본부 제작)",
      "wqYJZU9MFBE"
    ]
  ],
  "lac-duong": [
    [
      "How to Ask for Directions in Korean?",
      "mw1vqrYjiVA"
    ],
    [
      "EASY Real-Life Korean: Asking for Directions 🗺️ for Beginners 길 찾기 (TOPIK 1-2)",
      "asrUqXFI25k"
    ]
  ],
  "tau-dien-ngam": [
    [
      "How to Ride the Seoul Subway (Complete Beginner's Guide)",
      "noFTudZyJ1g"
    ],
    [
      "How to Ride the Subway in Seoul, South Korea (Step-by-Step Guide!)",
      "vPAeEYWU7Ls"
    ]
  ],
  "xe-buyt": [
    [
      "🇰🇷 How to Ride the Bus in Seoul | Fares, Transfers, and Using Transportation Cards",
      "DA9wscYilUI"
    ],
    [
      "How to Ride the Bus in Korea | Getting Around in Korea",
      "r5HWG-mgwq4"
    ]
  ]
};

  function slideResources(topic, samples) {
    const foundational = topic.dialogue.map((line, i) => [i % 2 ? 'B' : 'A', line.ko, line.vi]);
    const dialogues = [
      { title: 'Hội thoại nền tảng', dialogue: foundational },
      ...samples,
      ...(window.MRLEE_CULTURE_EXTRA_DIALOGUES?.[topic.slug] || [])
    ].filter((sample) => sample.dialogue.length >= 2);
    const clips = (window.MRLEE_CULTURE_EXTRA_DIALOGUES?.[topic.slug] || []).slice(0, 4);
    const clipList = clips.map((clip, index) => '<details class="mcl-classroom-clip"><summary>' +
      esc(clip.title) + '</summary><video controls playsinline preload="none" style="display:block;width:min(100%,768px);margin:.7em auto" aria-label="' +
      esc(clip.title) + '" src="media/culture-dialogues/' + encodeURIComponent(topic.slug) + '/' + (index + 1) + '.mp4"></video></details>').join('');
    const references = classroomReferences[topic.slug] || [];
    const links = references.map(([title, id]) => '<p><a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=' +
      esc(id) + '">' + esc(title) + '</a></p>').join('');
    return '<details class="mcl-slide-library"><summary>Video theo chủ đề · ' + (clips.length + references.length) +
      '</summary><p>Clip đọc theo vai · 18 giây/clip · phụ đề Hàn–Việt, không lời. Tạm dừng trước lượt B để học viên trả lời.</p>' +
      clipList + (links ? '<h3>Video tham khảo</h3>' + links : '') + '</details>' +
      '<details class="mcl-slide-library"><summary>Luyện hội thoại · ' + dialogues.length + ' bài</summary>' +
      dialogues.map((sample) => '<details><summary>' + esc(sample.title) + '</summary>' +
        sample.dialogue.map((line) => '<p><strong lang="ko">' + esc(line[0] + ' · ' + line[1]) + '</strong> ' +
          '<button type="button" data-speak="' + esc(line[1]) + '" aria-label="Nghe câu tiếng Hàn">🔊</button>' +
          '<br>' + esc(line[2]) + '</p>').join('') + '</details>').join('') + '</details>';
  }

  const metroSceneCaptions = [
  "역 입구 · Lối xuống ga",
  "엘리베이터 · Thang máy ở lối vào",
  "출구 번호 · Số cửa ra",
  "역 주변 지도 · Bản đồ khu vực quanh ga",
  "관광 안내소 · Quầy thông tin du lịch",
  "에스컬레이터 · Thang cuốn",
  "점자 블록 · Dải gạch dẫn hướng",
  "자전거 보관대 · Giá để xe đạp",
  "휠체어 진입로 · Lối vào dành cho xe lăn",
  "교통카드 구입 · Mua thẻ giao thông",
  "지폐 투입구 · Khe nhận tiền giấy",
  "교통카드 충전기 · Máy nạp thẻ",
  "카드 올려놓기 · Đặt thẻ lên khay",
  "언어 선택 · Chọn ngôn ngữ trên máy",
  "승차권 받기 · Nhận vé tàu",
  "닫힌 개찰구 · Cổng soát vé đang đóng",
  "넓은 개찰구 · Cổng rộng cho xe đẩy",
  "역무원에게 문의하기 · Hỏi nhân viên nhà ga",
  "승강장 안전문 · Cửa chắn sân ga",
  "도착 안내 화면 · Màn hình báo tàu đến",
  "방향 물어보기 · Hỏi hướng tàu chạy",
  "노선 색깔 · Màu nhận diện tuyến",
  "줄 서서 기다리기 · Xếp hàng chờ tàu",
  "승객이 먼저 내리기 · Đợi hành khách xuống trước",
  "환승 표지판 · Biển chỉ hướng chuyển tuyến",
  "환승 통로 · Hành lang chuyển tuyến",
  "양쪽 승강장 · Hai phía của sân ga",
  "손잡이 잡기 · Nắm tay vịn",
  "교통약자 배려석 · Ghế ưu tiên",
  "이어폰 사용 · Dùng tai nghe",
  "짐 챙기기 · Giữ hành lý bên mình",
  "휠체어 공간 · Vị trí dành cho xe lăn",
  "유모차와 함께 타기 · Lên tàu cùng xe đẩy trẻ em",
  "열차 출입문 · Cửa ra vào toa tàu",
  "차내 노선도 · Sơ đồ tuyến trong toa",
  "창밖 승강장 · Nhìn sân ga qua cửa sổ",
  "유실물 센터 · Quầy đồ thất lạc",
  "분실 신고 · Trình báo mất đồ",
  "물품 보관함 · Tủ gửi hành lý",
  "화장실 안내 · Biển chỉ nhà vệ sinh",
  "출구 찾기 · Tìm cửa ra",
  "보증금 환급기 · Máy hoàn tiền đặt cọc vé",
  "주변 지도 확인 · Xem bản đồ quanh ga",
  "출구에서 만나기 · Hẹn gặp ở cửa ga",
  "야간 역 입구 · Lối vào ga buổi tối"
];

  const metroRoleCards = [
    [10, 'Mua thẻ', 'A muốn mua thẻ giao thông lần đầu. B đóng vai nhân viên bán thẻ.',
      '교통카드 한 장 주세요.', 'Cho tôi một thẻ giao thông ạ.', '네. 충전도 해 드릴까요?', 'Vâng. Anh/chị có muốn nạp tiền luôn không ạ?'],
    [12, 'Nạp tiền', 'A cần nạp tiền nhưng chưa biết dùng máy nào. B chỉ máy trong ảnh.',
      '교통카드는 어디에서 충전해요?', 'Tôi nạp thẻ giao thông ở đâu ạ?', '여기 있는 기계에서 충전하시면 돼요.', 'Anh/chị có thể nạp ở máy này ạ.'],
    [16, 'Qua cổng soát vé', 'A đã chạm thẻ nhưng cổng vẫn đóng. B là nhân viên đến hỗ trợ.',
      '카드를 찍었는데 문이 안 열려요.', 'Tôi đã chạm thẻ nhưng cửa không mở ạ.', '카드를 잠깐 보여 주시겠어요?', 'Anh/chị cho tôi xem thẻ một chút được không ạ?'],
    [21, 'Hỏi hướng tàu', 'A muốn đến ga SEOUL nhưng chưa chắc mình đứng đúng phía. B xác nhận hướng đi trong tình huống giả định.',
      '서울역에 가려면 이쪽에서 타면 돼요?', 'Muốn tới ga SEOUL thì tôi lên tàu phía này được không ạ?', '네, 이쪽에서 타시면 돼요.', 'Vâng, anh/chị lên tàu phía này là được ạ.'],
    [24, 'Lên tàu', 'Cửa tàu vừa mở. A định bước vào. B nhắc bạn chú ý người đang xuống.',
      '우리 지금 탈까요?', 'Bây giờ mình lên nhé?', '잠깐만요. 사람들이 먼저 내리면 타요.', 'Chờ chút nhé. Mình đợi mọi người xuống rồi lên.'],
    [25, 'Chuyển tuyến', 'A cần đổi sang tuyến số 2. B dùng biển chỉ dẫn để hướng dẫn bạn.',
      '2호선으로 갈아타려면 어디로 가야 해요?', 'Muốn chuyển sang tuyến số 2 thì tôi phải đi lối nào ạ?', '저 환승 표지판을 따라가세요.', 'Anh/chị đi theo biển chỉ dẫn chuyển tuyến kia nhé.'],
    [37, 'Tìm đồ thất lạc', 'A bỏ quên một chiếc túi trên tàu. B trực quầy đồ thất lạc và cần biết đặc điểm của túi.',
      '지하철에 가방을 두고 내렸어요.', 'Tôi xuống tàu mà để quên túi trên tàu ạ.', '어떤 색 가방이에요?', 'Túi của anh/chị màu gì ạ?'],
    [44, 'Hẹn bạn ở cửa ra', 'A gọi điện hẹn bạn ở ga. B chọn cửa ra để hai người dễ tìm nhau.',
      '우리 몇 번 출구에서 만날까요?', 'Mình gặp nhau ở cửa ra số mấy nhé?', '3번 출구 앞에서 만나요.', 'Mình gặp nhau trước cửa ra số 3 nhé.']
  ];

  const busRoleCards = [
    [1, 'Chọn tuyến ở trạm', 'A cần tới thư viện. B biết số tuyến. Sau lượt đầu, đổi thư viện thành bưu điện.',
      '도서관에 가려면 몇 번 버스를 타야 해요?', 'Muốn đến thư viện thì tôi phải đi xe buýt số mấy ạ?', '여기서 12번 버스를 타세요.', 'Anh/chị đi xe số 12 từ đây nhé.'],
    [2, 'Kiểm tra chiều đi', 'A đang chờ xe về phía trường đại học. B phát hiện A đứng nhầm bên đường.',
      '대학교 쪽으로 가는 버스가 여기 서요?', 'Xe đi về phía trường đại học có dừng ở đây không ạ?', '길 건너편 정류장에서 타셔야 해요.', 'Anh/chị phải đón xe ở trạm bên kia đường ạ.'],
    [1, 'Đọc bảng giờ xe', 'A muốn biết còn phải chờ bao lâu. B nhìn bảng và trả lời. Đổi vai rồi thay số phút.',
      '다음 버스는 언제 와요?', 'Khi nào chuyến xe tiếp theo tới ạ?', '전광판을 보니까 5분 후에 온대요.', 'Theo bảng điện tử thì năm phút nữa xe tới ạ.'],
    [3, 'Chạm thẻ lần đầu', 'A vừa lên xe và cầm sẵn thẻ. B chỉ vị trí máy đọc thẻ.',
      '카드를 어디에 찍으면 돼요?', 'Tôi chạm thẻ vào đâu ạ?', '기사님 옆에 있는 단말기에 찍으세요.', 'Anh/chị chạm thẻ vào máy cạnh bác tài nhé.'],
    [3, 'Thẻ chưa được nhận', 'A đã chạm cả ví vào máy nhưng thẻ chưa được nhận. B gợi ý lấy riêng một thẻ ra.',
      '지갑을 댔는데 카드가 안 찍혀요.', 'Tôi đã áp ví vào máy nhưng máy không nhận thẻ ạ.', '카드 한 장만 꺼내서 다시 찍어 보세요.', 'Anh/chị lấy riêng một thẻ ra rồi thử chạm lại nhé.'],
    [4, 'Nhường ghế', 'A đang ngồi và muốn nhường chỗ cho B, người đang xách đồ. B đáp lại lời mời.',
      '짐이 많으시네요. 여기 앉으세요.', 'Bác mang nhiều đồ quá. Bác ngồi đây ạ.', '고마워요. 덕분에 편하게 가겠네요.', 'Cảm ơn cháu. Nhờ cháu mà bác đi xe thoải mái hơn rồi.'],
    [2, 'Nghe hụt tên trạm', 'A nghe chưa rõ thông báo và sắp xuống ở chợ. B cho biết còn một trạm nữa.',
      '죄송한데, 이번 정류장이 시장이에요?', 'Xin lỗi, trạm này là trạm chợ phải không ạ?', '아니요, 다음 정류장에서 내리시면 돼요.', 'Chưa đâu ạ, anh/chị xuống ở trạm tiếp theo là được.'],
    [2, 'Báo hiệu xuống xe', 'A sắp tới điểm cần xuống nhưng chưa biết báo cho tài xế. B chỉ nút bấm.',
      '다음 정류장에서 내리려면 어떻게 해요?', 'Muốn xuống ở trạm tới thì tôi làm thế nào ạ?', '옆에 있는 하차 버튼을 누르세요.', 'Anh/chị bấm nút báo xuống ở bên cạnh nhé.'],
    [5, 'Tìm điểm chuyển tuyến', 'A cần chuyển sang tàu điện ngầm. B chỉ điểm xuống và cách tìm lối vào ga.',
      '지하철로 갈아타려면 어디에서 내려요?', 'Tôi xuống ở đâu để chuyển sang tàu điện ngầm ạ?', '다음 정류장에서 내리세요. 바로 앞에 역 입구가 있어요.', 'Anh/chị xuống ở trạm tới nhé. Ngay phía trước có lối vào ga.'],
    [2, 'Đi quá điểm dừng', 'A nhận ra mình đã đi quá một trạm. B gợi ý cách quay lại. Đổi vai và nói lại bằng lời của mình.',
      '내릴 곳을 지나쳤어요. 어떻게 돌아가요?', 'Tôi đi quá điểm cần xuống rồi. Tôi quay lại thế nào ạ?', '다음 정류장에서 내려서 반대 방향 버스를 타세요.', 'Anh/chị xuống ở trạm kế tiếp rồi bắt xe buýt chiều ngược lại nhé.']
  ];

  const busSceneCaptions = ['Số tuyến và bảng thông tin', 'Chiều đi và điểm dừng',
    'Thanh toán bằng thẻ giao thông', 'Tay vịn và ghế ưu tiên', 'Chuyển tuyến'];

  function roleCardMarkup(cards, index, isBus) {
    const [scene, title, task, koA, viA, koB, viB] = cards[index];
    const caption = (isBus ? busSceneCaptions : metroSceneCaptions)[scene - 1];
    const directory = isBus ? 'images/culture-v20-hd/xe-buyt/' : 'images/culture-metro-scenes/';
    const line = (role, ko, vi) => '<p><strong lang="ko">' + role + ' · ' + esc(ko) +
      '</strong> <button type="button" data-speak="' + esc(ko) + '" aria-label="Nghe lời vai ' + role +
      '">🔊</button><br>' + esc(vi) + '</p>';
    return '<section data-role-card aria-label="Thẻ luyện nói"><div class="mcl-scene-layout"><div class="mcl-deck-pictures">' +
      imageMarkup({src: directory + String(scene).padStart(2, '0') + '.webp',
        alt: caption, caption: caption + ' · Minh họa AI'}) +
      '</div><div><h3 aria-live="polite">Thẻ ' + (index + 1) + '/' + cards.length + ' · ' + esc(title) +
      '</h3><p>' + esc(task) + '</p><details><summary>Mở hội thoại mẫu</summary>' +
      line('A', koA, viA) + line('B', koB, viB) + '</details></div></div>' +
      '<p><button type="button" data-card-step="-1"' + (index === 0 ? ' disabled' : '') +
      '>← Thẻ trước</button> <button type="button" data-card-step="1"' +
      (index === cards.length - 1 ? ' disabled' : '') + '>Thẻ sau →</button></p></section>';
  }

  function addPresentation(lessonPlan, topic, plan, photos) {
    const video = window.MRLEE_CULTURE_V17_MEDIA?.[topic.slug]?.video;
    const samples = plan.practice;
    const artwork = Array.from({length: 5}, (_, n) => ({
      src: 'images/culture-v20-hd/' + encodeURIComponent(topic.slug) + '/0' + (n + 1) + '.webp',
      alt: topic.title + ' · ' + topic.ko,
      caption: 'Minh họa · ' + topic.title
    }));
    const additional = [...photos.filter((photo) => /\bAI\b/i.test(photo.alt) && /^images\//.test(photo.src)),
      ...samples.map((sample) => sample.photo).filter(Boolean)];
    for (const photo of additional) {
      if (!artwork.some((existing) => existing.src.split('?')[0] === photo.src.split('?')[0])) artwork.push(photo);
    }
    if (topic.slug === 'tau-dien-ngam') artwork.unshift({src: 'images/culture-speaking/metro-card-reader.jpg', alt: 'Hành khách dùng thẻ tại cổng tàu điện', caption: '교통카드를 찍어요. · Chạm thẻ giao thông vào đầu đọc. Ảnh minh họa AI.'});
    if (topic.slug === 'tau-dien-ngam') {
      metroSceneCaptions.forEach((caption, index) => artwork.push({
        src: 'images/culture-metro-scenes/' + String(index + 1).padStart(2, '0') + '.webp',
        alt: caption, caption: caption + ' · Minh họa AI'
      }));
    }
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
      ['00–05', topic.title, '<p lang="ko">' + esc(topic.ko) + '</p>' +
        prompt(samples[0].scene) + prompt('Quan sát ảnh, dự đoán cách ứng xử và trao đổi với bạn bên cạnh.')],
      ['05–15', 'Khám phá chủ đề', bullets(plan.focus) + media],
      ['15–23', 'Từ vựng và câu mẫu', bullets(topic.words.map((word) => word.ko + ' — ' + word.vi)) +
        bullets(plan.patterns) + prompt('Đọc theo giáo viên rồi thay một thông tin trong câu mẫu.')],
      ['23–33', samples[0].title, prompt('Nghe và xác định vai của hai người. Sau đó mở bản dịch để đối chiếu.') +
        samples[0].dialogue.map((line) => '<p lang="ko">' + esc(line[0] + ' · ' + line[1]) +
          ' <button type="button" data-speak="' + esc(line[1]) + '" aria-label="Nghe câu tiếng Hàn">🔊</button></p>').join('') +
        '<details><summary>Hiện bản dịch</summary>' + bullets(samples[0].dialogue.map((line) => line[2])) + '</details>'],
      ['33–48', 'Đóng vai và đổi tình huống', samples.slice(1).map((sample) =>
        '<h3>' + esc(sample.title) + '</h3>' +
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
      '.mcl-scene-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(16px,3vw,40px);align-items:start}.mcl-scene-layout .mcl-deck-pictures img{height:auto;max-height:52vh;object-fit:contain}.mcl-deck-shell{overflow:hidden}@media(max-width:720px){.mcl-scene-layout{grid-template-columns:1fr}.mcl-scene-layout .mcl-deck-pictures img{max-height:32vh}}' +
      '</style><div class="mcl-deck-shell"><header class="mcl-deck-bar"><strong>MR LEE · 60 phút</strong>' +
      '<span><button type="button" data-full>Toàn màn hình</button> <button type="button" data-close>Đóng</button></span></header>' +
      '<main tabindex="-1"></main><footer class="mcl-deck-bar"><button type="button" data-prev>← Trước</button>' +
      '<span data-progress aria-live="polite"></span><button type="button" data-next>Tiếp →</button></footer></div>';
    const buttonHost = document.querySelector('#topicHero .lessonHeroText') || lessonPlan;
    buttonHost.append(launch);
    document.body.append(dialog);
    const content = $('main', dialog);
    const previous = $('[data-prev]', dialog);
    const next = $('[data-next]', dialog);
    let active = 0;
    const isBus = topic.slug === 'xe-buyt';
    const cards = isBus ? busRoleCards : topic.slug === 'tau-dien-ngam' ? metroRoleCards : [];
    let cardIndex = 0;
    let transition;
    const phaseImage = topic.slug === 'tau-dien-ngam'
      ? [0, 18, 6, 20, 24, 37, 42].map((n) => n ? artwork.length - metroSceneCaptions.length + n : 0)
      : [0, 1, 2, 0, 3, 4, 1];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function showSlide(index) {
      if (index < 0 || index >= slides.length) return;
      window.speechSynthesis?.cancel();
      const direction = Math.sign(index - active);
      transition?.cancel();
      active = index;
      const [minutes, heading, body] = slides[index];
      const image = (index === 3 && samples[0].photo) || artwork[phaseImage[index]];
      content.innerHTML = '<h2 id="mcl-deck-title">' + esc(heading) + '</h2>' +
        (cards.length && index === 5
          ? '<p>Chọn một thẻ. Hai bạn đóng vai A và B, sau đó đổi vai và thay một chi tiết trong lời thoại.</p>' + roleCardMarkup(cards, cardIndex, isBus)
          : '<div class="mcl-scene-layout">' + pictures([image]) + '<div>' + body + '</div></div>') +
        '<details><summary>Xem ảnh minh họa của bài (' + artwork.length + ')</summary>' + pictures(artwork) + '</details>' +
        slideResources(topic, samples);
      content.scrollTop = 0;
      if (!reducedMotion.matches && content.animate) {
        transition = content.animate([
          { opacity: 0.08, transform: 'translateX(' + (direction || 1) * 72 + 'px)' },
          { opacity: 1, transform: 'translateX(0)' }
        ], { duration: 420, easing: 'cubic-bezier(.2,.7,.25,1)' });
      }
      $('[data-progress]', dialog).textContent = (index + 1) + '/' + slides.length + ' · Phút ' + minutes;
      previous.disabled = index === 0;
      next.disabled = index === slides.length - 1;
    }
    launch.addEventListener('click', () => {
      dialog.showModal();
      showSlide(active);
      content.focus();
    });
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'slides') {
      const slide = Number(params.get('slide'));
      if (Number.isInteger(slide) && slide >= 1 && slide <= slides.length) active = slide - 1;
      launch.click();
    }
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
      content.querySelectorAll('video').forEach((video) => video.pause());
      window.speechSynthesis?.cancel();
      if (document.fullscreenElement === shell) document.exitFullscreen().catch(() => {});
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showSlide(active + (event.key === 'ArrowRight' ? 1 : -1));
      content.focus();
    });
    content.addEventListener('toggle', (event) => {
      const details = event.target;
      if (!details.open) details.querySelectorAll('video').forEach((video) => video.pause());
    }, true);
    content.addEventListener('click', (event) => {
      const step = event.target.closest('[data-card-step]');
      if (step) {
        const card = step.closest('[data-role-card]');
        const target = cardIndex + Number(step.dataset.cardStep);
        if (!card || target < 0 || target >= cards.length) return;
        window.speechSynthesis?.cancel();
        cardIndex = target;
        card.outerHTML = roleCardMarkup(cards, cardIndex, isBus);
        const updated = $('[data-role-card]', content);
        const same = updated.querySelector('[data-card-step="' + step.dataset.cardStep + '"]');
        (same.disabled ? updated.querySelector('button[data-card-step]:enabled') : same).focus({preventScroll:true});
        if (!reducedMotion.matches) updated.animate?.([{opacity:0.25}, {opacity:1}], {duration:260});
        return;
      }
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
      meta.innerHTML = '<span>◷ 60 phút</span><span>10 hội thoại · 3 mẫu trên lớp</span><span>Thực hành theo cặp</span>';
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
