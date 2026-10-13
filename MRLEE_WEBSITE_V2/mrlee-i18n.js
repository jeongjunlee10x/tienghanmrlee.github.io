/**
 * Tiếng Hàn Mr Lee — Bộ chuyển giao diện Việt / Hàn / Anh.
 * Các bản dịch áp dụng cho giao diện, KHÔNG tự dịch nội dung giảng dạy.
 * Không thay đổi xác thực Firebase, điểm số hay các liên kết học tập.
 */
(() => {
  'use strict';
  const KEY = 'mrlee-language';
  const LANGUAGES = ['vi', 'ko', 'en'];
  const STRINGS = {
    vi: {
      title: 'Tiếng Hàn Mr Lee | Học tiếng Hàn dễ hiểu, dễ nhớ',
      description: 'Tiếng Hàn Mr Lee: bài học Sơ cấp, giao tiếp theo chủ đề, ôn luyện phỏng vấn, kiểm tra trình độ và luyện thi TOPIK.',
      languageLabel: 'Ngôn ngữ',
      menuOpen: 'Mở menu', menuClose: 'Đóng menu',
      skip: 'Bỏ qua menu, đến chức năng học tập',
      brand: 'TIẾNG HÀN MR LEE',
      tagline: 'HỌC DỄ HIỂU · LUYỆN DỄ NHỚ',
      nav: ['Trang chủ', 'Bài học', 'Giao tiếp', 'Phỏng vấn', 'Đề TOPIK', 'Thi TOPIK', 'Kiểm tra đầu vào', 'Lịch sử học tập'],
      navAccount: 'Đăng ký / Đăng nhập', navMyAccount: 'Tài khoản của tôi',
      heroAria: 'Trang bìa Tiếng Hàn Mr Lee',
      imageAlt: 'Học tiếng Hàn cùng Mr Lee: học sinh, cảnh quan Hàn Quốc và tháp N Seoul',
      heroBadge: 'CHÀO MỪNG ĐẾN VỚI TIẾNG HÀN MR LEE',
      heroTitle: 'Chọn nội dung phù hợp, bắt đầu học ngay hôm nay',
      heroDesc: 'Học từ vựng, ngữ pháp, giao tiếp, phỏng vấn và luyện thi tiếng Hàn theo lộ trình rõ ràng.',
      startLearning: 'Bắt đầu học', testLevel: 'Kiểm tra trình độ',
      sectionBadge: '9 CHỨC NĂNG HỌC TẬP', sectionTitle: 'Bạn muốn học gì hôm nay?',
      sectionDesc: 'Các mục học được sắp xếp rõ ràng, dễ tìm. Chỉ cần chọn một mục để bắt đầu.',
      cards: [
        ['Bài học tiếng Hàn', 'Học từ vựng, ngữ pháp và bài tập theo từng bài Sơ cấp 1, Sơ cấp 2.', 'Xem bài học'],
        ['Giao tiếp theo chủ đề', 'Mẫu câu thực tế về quán ăn, mua sắm, sinh hoạt, công việc và nhiều tình huống.', 'Luyện giao tiếp'],
        ['Ôn luyện phỏng vấn', 'Luyện câu hỏi và đáp án mẫu, nghe phát âm và thực hành trả lời.', 'Ôn luyện ngay'],
        ['Kiểm tra đầu vào', 'Chọn trình độ, làm bài trắc nghiệm và nhận kết quả sau khi nộp bài.', 'Kiểm tra trình độ'],
        ['Kiểm tra Online', 'Kiểm tra kiến thức tiếng Hàn qua bài tập trắc nghiệm và xem đáp án.', 'Làm bài kiểm tra'],
        ['Bộ đề thi TOPIK', 'Tài liệu và đề luyện TOPIK để ôn đọc hiểu, nghe và làm quen cấu trúc thi.', 'Xem bộ đề'],
        ['Thi TOPIK Online', 'Đăng nhập để mở website TOPIK chính thức và chọn đề trong mục học tập.', 'Vào thi TOPIK'],
        ['Bộ sách & tài liệu', 'Tham khảo tài liệu học tiếng Hàn được sắp xếp theo trình độ.', 'Xem tài liệu'],
        ['Tài khoản học viên', 'Đăng ký và đăng nhập bằng email để mở các chức năng học tập.', 'Vào tài khoản']
      ],
      topikBefore: 'Đăng nhập để mở website TOPIK chính thức và chọn đề trong mục ',
      topikAfter: '.',
      noticeHeading: 'Lưu ý:',
      noticeText: 'Vui lòng đăng nhập và xác minh email trước khi mở bài học, luyện tập hoặc TOPIK. Thi TOPIK Online dẫn tới trang thi chính thức sau khi xác thực.',
      ctaTitle: 'Bắt đầu hành trình chinh phục tiếng Hàn',
      ctaAfter: ' · Cùng học tiếng Hàn mỗi ngày.', ctaButton: 'Khám phá câu giao tiếp',
      footerBrand: 'TIẾNG HÀN MR LEE', footerTag: 'Học tập · Giao tiếp · Luyện thi tiếng Hàn',
      footerNav: ['Trang chủ', 'Sơ cấp 1', 'Sơ cấp 2', 'Phỏng vấn', 'Giao tiếp', 'Kiểm tra đầu vào', 'Tài khoản'],
      contactTitle: 'Liên hệ Tiếng Hàn Mr Lee',
      contactDesc: 'Liên hệ tư vấn khóa học, bài học và hỗ trợ học viên qua điện thoại hoặc email.',
      phone1: 'Điện thoại 1', phone2: 'Điện thoại 2', email: 'Email',
      contactAria: 'Liên hệ Tiếng Hàn Mr Lee',
      noticeAria: 'Lưu ý về TOPIK và tài khoản',
      navAria: 'Điều hướng chính', footerAria: 'Liên kết ở cuối trang',
      contactPhone: 'Gọi số điện thoại', contactEmail: 'Gửi email đến'
    },
    ko: {
      title: '미스터 리 한국어 | 쉽고 재미있게 배우는 한국어',
      description: '미스터 리 한국어: 초급 수업, 상황별 회화, 면접 연습, 레벨 테스트와 TOPIK 시험 준비.',
      languageLabel: '언어 선택',
      menuOpen: '메뉴 열기', menuClose: '메뉴 닫기',
      skip: '메뉴 건너뛰고 학습 메뉴로 이동',
      brand: 'TIẾNG HÀN MR LEE',
      tagline: '쉽게 배우고 · 자신 있게 연습해요',
      nav: ['홈', '한국어 강의', '회화', '면접 연습', 'TOPIK 기출문제', 'TOPIK 온라인', '레벨 테스트', '학습 기록'],
      navAccount: '회원가입 / 로그인', navMyAccount: '내 계정',
      heroAria: '미스터 리 한국어 메인 배너',
      imageAlt: '미스터 리 한국어 학생들과 한국의 전통 건축물 및 남산서울타워',
      heroBadge: '미스터 리 한국어에 오신 것을 환영합니다',
      heroTitle: '나에게 맞는 학습을 선택하고 오늘부터 시작하세요',
      heroDesc: '체계적인 학습 과정으로 어휘, 문법, 회화, 면접과 TOPIK을 준비하세요.',
      startLearning: '학습 시작', testLevel: '레벨 테스트',
      sectionBadge: '9가지 학습 메뉴', sectionTitle: '오늘은 무엇을 공부할까요?',
      sectionDesc: '학습 메뉴를 한눈에 살펴보고 원하는 과정을 선택하세요.',
      cards: [
        ['한국어 강의', '초급 1·2의 어휘, 문법, 연습 문제를 단계별로 학습합니다.', '강의 보기'],
        ['상황별 한국어 회화', '식당, 쇼핑, 일상생활, 직장 등 다양한 상황의 표현을 익힙니다.', '회화 연습'],
        ['면접 연습', '자주 나오는 질문과 모범 답안을 듣고 직접 말해 보세요.', '면접 연습하기'],
        ['한국어 레벨 테스트', '레벨을 선택하고 객관식 시험을 풀어 결과를 확인하세요.', '실력 확인'],
        ['온라인 테스트', '한국어 객관식 문제를 풀고 정답과 해설을 확인하세요.', '시험 시작'],
        ['TOPIK 기출문제', '듣기·읽기와 시험 유형을 익히는 TOPIK 학습 자료입니다.', '문제 보기'],
        ['TOPIK 온라인', '로그인 후 TOPIK 공식 웹사이트의 학습 메뉴에서 문제를 선택하세요.', 'TOPIK 바로가기'],
        ['교재 및 자료', '학습 수준별로 정리된 한국어 교재와 자료를 살펴보세요.', '자료 보기'],
        ['학습자 계정', '이메일로 가입하고 로그인하여 학습 기능을 이용하세요.', '내 계정']
      ],
      topikBefore: '로그인 후 TOPIK 공식 사이트의 ', topikAfter: ' 메뉴에서 연습 문제를 선택하세요.',
      noticeHeading: '안내:',
      noticeText: '강의와 연습 문제를 이용하려면 로그인하고 이메일 인증을 완료하세요. TOPIK 온라인은 인증 후 공식 사이트로 연결됩니다.',
      ctaTitle: '한국어 실력 향상을 위한 첫걸음을 시작하세요',
      ctaAfter: ' · 오늘도 함께 한국어를 배워요.', ctaButton: '회화 표현 둘러보기',
      footerBrand: 'TIẾNG HÀN MR LEE', footerTag: '한국어 공부 · 회화 · TOPIK 시험 준비',
      footerNav: ['홈', '초급 1', '초급 2', '면접', '회화', '레벨 테스트', '내 계정'],
      contactTitle: '미스터 리 한국어 문의',
      contactDesc: '강의, 학습 자료, 학생 지원에 관한 문의는 전화 또는 이메일을 이용해 주세요.',
      phone1: '전화번호 1', phone2: '전화번호 2', email: '이메일',
      contactAria: '미스터 리 한국어 문의',
      noticeAria: 'TOPIK 및 계정 이용 안내',
      navAria: '기본 메뉴', footerAria: '하단 메뉴',
      contactPhone: '전화 걸기', contactEmail: '이메일 보내기:'
    },
    en: {
      title: 'Korean with Mr Lee | Learn Korean with confidence',
      description: 'Korean with Mr Lee: beginner lessons, everyday conversations, interview practice, placement tests and TOPIK preparation.',
      languageLabel: 'Language',
      menuOpen: 'Open menu', menuClose: 'Close menu',
      skip: 'Skip navigation and go to learning tools',
      brand: 'TIẾNG HÀN MR LEE',
      tagline: 'LEARN CLEARLY · PRACTISE CONFIDENTLY',
      nav: ['Home', 'Lessons', 'Conversation', 'Interviews', 'TOPIK Papers', 'TOPIK Online', 'Placement Test', 'Learning History'],
      navAccount: 'Sign up / Log in', navMyAccount: 'My Account',
      heroAria: 'Korean with Mr Lee homepage banner',
      imageAlt: 'Korean with Mr Lee: students, traditional Korean architecture and N Seoul Tower',
      heroBadge: 'WELCOME TO KOREAN WITH MR LEE',
      heroTitle: 'Choose your path and start learning today',
      heroDesc: 'Build your Korean vocabulary, grammar and conversation skills while preparing for interviews and TOPIK.',
      startLearning: 'Start Learning', testLevel: 'Check Your Level',
      sectionBadge: '9 LEARNING FEATURES', sectionTitle: 'What would you like to learn today?',
      sectionDesc: 'Browse clear learning categories and choose what suits your goals.',
      cards: [
        ['Korean Lessons', 'Study vocabulary, grammar and practice exercises in Beginner 1 and 2.', 'View Lessons'],
        ['Conversation by Topic', 'Useful phrases for restaurants, shopping, daily life, work and more.', 'Practise Speaking'],
        ['Interview Practice', 'Listen to common questions and model answers, then practise responding.', 'Practise Now'],
        ['Placement Test', 'Choose a level, answer multiple-choice questions and view your results.', 'Check Your Level'],
        ['Online Quiz', 'Test your Korean knowledge and review answers with explanations.', 'Take a Quiz'],
        ['TOPIK Practice Papers', 'Prepare with TOPIK listening, reading and exam-format practice materials.', 'View Papers'],
        ['TOPIK Online', 'Log in to access the official TOPIK website and choose questions in the study section.', 'Open TOPIK'],
        ['Books & Resources', 'Browse Korean study materials organized by learning level.', 'View Resources'],
        ['Student Account', 'Sign up and log in with your email to access learning features.', 'Open Account']
      ],
      topikBefore: 'Log in to open the official TOPIK site and choose practice questions under ', topikAfter: '.',
      noticeHeading: 'Please note:',
      noticeText: 'Log in and verify your email before opening lessons, practice materials or TOPIK. TOPIK Online links to the official exam site after verification.',
      ctaTitle: 'Start your Korean learning journey',
      ctaAfter: ' · Let’s keep learning Korean together.', ctaButton: 'Explore Conversations',
      footerBrand: 'TIẾNG HÀN MR LEE', footerTag: 'Lessons · Conversation · TOPIK Preparation',
      footerNav: ['Home', 'Beginner 1', 'Beginner 2', 'Interviews', 'Conversation', 'Placement Test', 'Account'],
      contactTitle: 'Contact Korean with Mr Lee',
      contactDesc: 'Contact us by phone or email about courses, lessons and student support.',
      phone1: 'Phone 1', phone2: 'Phone 2', email: 'Email',
      contactAria: 'Contact Korean with Mr Lee',
      noticeAria: 'TOPIK and account information',
      navAria: 'Main navigation', footerAria: 'Footer links',
      contactPhone: 'Call', contactEmail: 'Email'
    }
  };

  function languageFromStorage() {
    try {
      const stored = localStorage.getItem(KEY);
      return LANGUAGES.includes(stored) ? stored : 'vi';
    } catch (_) {
      return 'vi';
    }
  }
  let locale = languageFromStorage();
  const isHomepage = !!document.querySelector('#learning-title') && !!document.querySelector('.feature-grid .feature-card');
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  function writeText(target, value) {
    const node = typeof target === 'string' ? $(target) : target;
    if (node && typeof value === 'string') node.textContent = value;
  }
  function writeDirect(target, value) {
    const node = typeof target === 'string' ? $(target) : target;
    if (!node || typeof value !== 'string') return;
    const parts = Array.from(node.childNodes).filter(child => child.nodeType === Node.TEXT_NODE);
    const first = parts.find(p => p.nodeValue.trim()) || parts[0];
    if (first) {
      first.nodeValue = value + ' ';
      parts.filter(p => p !== first).forEach(p => { p.nodeValue = ''; });
    } else {
      node.insertBefore(document.createTextNode(value + ' '), node.firstChild);
    }
  }
  function writeMixed(target, before, after) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    const texts = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
    if (texts[0]) texts[0].nodeValue = before;
    if (texts[1]) texts[1].nodeValue = after;
  }
  function writeTailText(target, value) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    const parts = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
    if (parts.length) parts[parts.length - 1].nodeValue = value;
  }
  function setAria(selector, name, value) {
    const el = $(selector);
    if (el) el.setAttribute(name, value);
  }

  const labels = () => STRINGS[locale];
  const GUEST_WORDS = new Set([
    ...LANGUAGES.map(l => STRINGS[l].navAccount),
    ...LANGUAGES.map(l => STRINGS[l].navMyAccount),
    'Đăng ký / Đăng nhập', 'Tài khoản của tôi'
  ]);
  let adjustingAuth = false;
  function translateAuth() {
    if (adjustingAuth) return;
    const link = $('#mrlee-auth-nav');
    if (!link) return;
    const span = link.querySelector('.auth-status-label');
    if (span) {
      const text = span.textContent.trim();
      if (!GUEST_WORDS.has(text)) return; // Hiển thị tên thật của học viên, không thay đổi.
      const verifiedDefault = LANGUAGES.some(l => STRINGS[l].navMyAccount === text);
      const translated = verifiedDefault ? labels().navMyAccount : labels().navAccount;
      if (text !== translated) {
        adjustingAuth = true;
        span.textContent = translated;
        adjustingAuth = false;
      }
    } else {
      const direct = Array.from(link.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.nodeValue.trim()).join(' ').trim();
      if (direct !== labels().navAccount) writeDirect(link, labels().navAccount);
    }
  }
  function bindAuthObserver() {
    const target = $('#mrlee-auth-nav');
    if (!target) return;
    const observer = new MutationObserver(() => translateAuth());
    observer.observe(target, { childList: true, characterData: true, subtree: true });
  }

  function translateHomepage() {
    const t = labels();
    document.title = t.title;
    setAria('meta[name="description"]', 'content', t.description);
    writeText('.skip', t.skip);
    writeText('.brand-text small', t.tagline);
    setAria('.brand', 'aria-label', `${t.brand} — ${t.nav[0]}`);
    const navLinks = $$('.site-nav > a:not(#mrlee-auth-nav)');
    navLinks.forEach((a, i) => writeDirect(a, t.nav[i]));
    setAria('.site-nav', 'aria-label', t.navAria);
    const menu = $('#menuToggle');
    if (menu) menu.setAttribute('aria-label', menu.getAttribute('aria-expanded') === 'true' ? t.menuClose : t.menuOpen);
    setAria('.hero', 'aria-label', t.heroAria);
    setAria('.hero-banner img', 'alt', t.imageAlt);
    writeDirect('.eyebrow', t.heroBadge);
    writeText('.hero-overview h1', t.heroTitle);
    writeText('.hero-overview p', t.heroDesc);
    const heroButtons = $$('.hero-actions .action-btn');
    if (heroButtons[0]) writeDirect(heroButtons[0], t.startLearning);
    if (heroButtons[1]) writeDirect(heroButtons[1], t.testLevel);
    writeText('.section-pill', t.sectionBadge);
    writeText('.section-head h2', t.sectionTitle);
    writeText('.section-head p', t.sectionDesc);
    const cards = $$('.feature-grid > .feature-card');
    cards.forEach((card, i) => {
      const data = t.cards[i];
      if (!data) return;
      writeText(card.querySelector('h3'), data[0]);
      if (i === 6 && card.querySelector('p span[lang="ko"]')) {
        writeMixed(card.querySelector('p'), t.topikBefore, t.topikAfter);
      } else {
        writeText(card.querySelector('p'), data[1]);
      }
      writeDirect(card.querySelector('.card-bottom'), data[2]);
    });
    setAria('.notice', 'aria-label', t.noticeAria);
    writeText('.notice strong', t.noticeHeading);
    writeDirect('.notice p', t.noticeText);
    writeText('.bottom-cta h2', t.ctaTitle);
    writeTailText('.bottom-cta p', t.ctaAfter); // Giữ nguyên câu tiếng Hàn trong span lang="ko".
    writeDirect('.bottom-cta .action-btn', t.ctaButton);
    writeDirect('.footer-brand', t.footerBrand);
    writeText('.footer-brand small', t.footerTag);
    $$('.footer-links a').forEach((a, i) => writeText(a, t.footerNav[i]));
    setAria('.footer-links', 'aria-label', t.footerAria);
    writeText('#footer-contact-heading', t.contactTitle);
    writeText('.footer-contact > p', t.contactDesc);
    writeText('.contact-link:nth-child(1) .contact-label', t.phone1);
    writeText('.contact-link:nth-child(2) .contact-label', t.phone2);
    writeText('.contact-link:nth-child(3) .contact-label', t.email);
    setAria('.contact-link:nth-child(1)', 'aria-label', `${t.contactPhone} 0376 991 180`);
    setAria('.contact-link:nth-child(2)', 'aria-label', `${t.contactPhone} 0866 761 403`);
    setAria('.contact-link:nth-child(3)', 'aria-label', `${t.contactEmail} tienghanmrlee@gmail.com`);
    translateAuth();
  }

  // Các trang phụ: chỉ dịch các nhãn điều hướng quen thuộc; giữ nguyên nội dung bài học.
  const NAV_ALIASES = [
    [['Trang chủ', '홈', 'Home'], '0'],
    [['Bài học', '한국어 강의', 'Lessons'], '1'],
    [['Giao tiếp', '회화', 'Conversation'], '2'],
    [['Phỏng vấn', '면접 연습', 'Interviews'], '3'],
    [['Đề TOPIK', 'TOPIK 기출문제', 'TOPIK Papers'], '4'],
    [['Thi TOPIK', 'TOPIK 온라인', 'TOPIK Online'], '5'],
    [['Kiểm tra đầu vào', '레벨 테스트', 'Placement Test'], '6'],
    [['Lịch sử học tập', '학습 기록', 'Learning History'], '7'],
    [['Tài khoản', '내 계정', 'Account'], 'account'],
    [['Sơ cấp 1', '초급 1', 'Beginner 1'], 'beginner1'],
    [['Sơ cấp 2', '초급 2', 'Beginner 2'], 'beginner2'],
    [['Bộ sách', '교재', 'Books'], 'books']
  ];
  const NAV_FROM_PATH = {
    'index.html': 0, 'bai-hoc.html': 1, 'giao-tiep-theo-chu-de.html': 2,
    'on-luyen-phong-van.html': 3, 'de-thi-topik.html': 4, 'thi-topik-online.html': 5,
    'kiem-tra-dau-vao.html': 6, 'lich-su-hoc-tap.html': 7
  };
  function translateSharedNavigation() {
    const nodes = $$('header nav a, .header nav a, .quiz-header nav a, .nav a, footer nav a, .footer-links a');
    for (const a of nodes) {
      if (a.id === 'mrlee-auth-nav') continue;
      const path = a.getAttribute('href') || '';
      const filename = path.split('/').pop().split('?')[0].split('#')[0];
      const stripped = a.textContent.trim().replace(/\s+/g, ' ');
      const alias = NAV_ALIASES.find(([names]) => names.includes(stripped));
      if (!alias) continue; // Không dịch tùy tiện nội dung bài học.
      const key = alias[1];
      const navIdx = NAV_FROM_PATH[filename];
      let translated;
      if (typeof navIdx === 'number' && String(navIdx) === key) translated = labels().nav[navIdx];
      else if (key === 'account') translated = labels().footerNav[6];
      else if (key === 'beginner1') translated = labels().footerNav[1];
      else if (key === 'beginner2') translated = labels().footerNav[2];
      else if (key === 'books') translated = {vi:'Bộ sách', ko:'교재', en:'Books'}[locale];
      else if (/^[0-7]$/.test(key)) translated = labels().nav[Number(key)];
      if (translated) writeDirect(a, translated);
    }
  }

  const LOCAL_BAR = `
    <div class="mrlee-language-bar" aria-label="Choose website language">
      <span id="mrlee-language-label" class="mrlee-language-caption">Ngôn ngữ</span>
      <div class="mrlee-language-buttons" role="group" aria-labelledby="mrlee-language-label">
        <button type="button" data-mrlee-lang="vi" lang="vi">Tiếng Việt</button>
        <button type="button" data-mrlee-lang="ko" lang="ko">한국어</button>
        <button type="button" data-mrlee-lang="en" lang="en">English</button>
      </div>
    </div>`;
  function ensureLanguageBar() {
    let bar = $('.mrlee-language-bar');
    if (bar) return bar;
    const wrap = document.createElement('div');
    wrap.className = 'mrlee-language-row';
    wrap.innerHTML = LOCAL_BAR;
    const header = document.querySelector('header');
    if (header) header.insertAdjacentElement('afterend', wrap);
    else document.body.insertBefore(wrap, document.body.firstChild);
    bar = $('.mrlee-language-bar');
    return bar;
  }
  function installStyle() {
    if ($('#mrlee-i18n-styles')) return;
    const style = document.createElement('style');
    style.id = 'mrlee-i18n-styles';
    style.textContent = `
    html[lang="vi"] body {font-family:"Be Vietnam Pro","Noto Sans KR",Arial,sans-serif!important}
    html[lang="ko"] body {font-family:"Noto Sans KR","Be Vietnam Pro",Arial,sans-serif!important;word-break:keep-all}
    html[lang="en"] body {font-family:"Inter","Be Vietnam Pro",Arial,sans-serif!important}
    :lang(ko){font-family:"Noto Sans KR","Malgun Gothic",sans-serif}
    .mrlee-language-row{width:min(1180px,calc(100% - 42px));margin:12px auto 0;display:flex;justify-content:flex-end;position:relative;z-index:3}
    .mrlee-language-bar{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.96);border:1px solid #e0e8f1;border-radius:99px;padding:5px 7px 5px 13px;box-shadow:0 3px 15px rgba(16,43,77,.045)}
    .mrlee-language-caption{font-size:11px;font-weight:700;color:#5b6980;white-space:nowrap}
    .mrlee-language-buttons{display:flex;gap:3px;align-items:center}
    .mrlee-language-buttons button{border:0;background:transparent;border-radius:99px;color:#2d4a65;cursor:pointer;padding:7px 10px;font:700 11px/1.4 "Be Vietnam Pro","Noto Sans KR",Arial,sans-serif;white-space:nowrap;transition:background .15s,color .15s}
    .mrlee-language-buttons button[lang="ko"]{font-family:"Noto Sans KR",sans-serif}
    .mrlee-language-buttons button[lang="en"]{font-family:"Inter",Arial,sans-serif}
    .mrlee-language-buttons button:hover{background:#e9f1fb}
    .mrlee-language-buttons button[aria-pressed="true"]{background:#14345b;color:#fff}
    .mrlee-language-buttons button:focus-visible{outline:2px solid #e9793b;outline-offset:2px}
    .site-header .header-layout{width:min(1540px,calc(100% - 44px));max-width:none}
    @media(max-width:1450px){
      .site-header .menu-toggle{display:inline-flex}
      .site-header .site-nav{display:none;position:absolute;top:calc(100% + 1px);left:0;right:0;padding:14px 21px 18px;flex-direction:column;align-items:stretch;gap:4px;background:#fff;border-bottom:1px solid #dfe7f0;box-shadow:0 15px 28px rgba(16,43,77,.12)}
      .site-header .site-nav.is-open{display:flex}
      .site-header .site-nav a{font-size:14px;padding:12px 13px;white-space:normal}
      .site-header .site-nav .nav-account{margin:8px 0 0;max-width:none;justify-content:center}
    }
    @media(max-width:560px){.mrlee-language-row{width:calc(100% - 26px);justify-content:center;margin-top:10px}.mrlee-language-bar{width:100%;justify-content:center;padding:5px 6px;gap:7px}.mrlee-language-buttons button{padding:7px 8px;font-size:10px}.mrlee-language-caption{font-size:10px}.site-header .header-layout{width:calc(100% - 28px)}}
    `;
    document.head.appendChild(style);
    // Dùng cùng bộ font ba ngôn ngữ, không chép font vào thư mục website.
    if (!document.querySelector('link[data-mrlee-fonts]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap';
      link.dataset.mrleeFonts = 'true';
      document.head.appendChild(link);
    }
  }
  function apply(next, store = false) {
    locale = LANGUAGES.includes(next) ? next : 'vi';
    if (store) {
      try { localStorage.setItem(KEY, locale); } catch (_) { /* trình duyệt tắt lưu trữ */ }
    }
    document.documentElement.setAttribute('lang', locale);
    const t = labels();
    writeText('#mrlee-language-label', t.languageLabel);
    $$('.mrlee-language-buttons button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.mrleeLang === locale));
    });
    if (isHomepage) translateHomepage();
    else translateSharedNavigation();
    document.dispatchEvent(new CustomEvent('mrlee:languagechange', {detail:{lang:locale}}));
  }
  function main() {
    installStyle();
    ensureLanguageBar();
    bindAuthObserver();
    document.querySelectorAll('[data-mrlee-lang]').forEach(button => {
      button.addEventListener('click', () => apply(button.dataset.mrleeLang, true));
    });
    apply(locale);
    window.MrLeeI18n = Object.freeze({
      getLocale: () => locale,
      setLocale: next => apply(next, true),
      text: key => labels()[key] || ''
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main, {once:true});
  else main();
})();
