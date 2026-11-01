/* Mr Lee 2026: tìm kiếm nhanh, học tiếp, hỗ trợ đọc. Không xử lý thông tin riêng tư. */
(() => {
  'use strict';
  if (window.__mrleeCoreReady) return;
  window.__mrleeCoreReady = true;
  const BASE_KEY = 'mrlee-last-learning-page';
  const LANG_KEY = 'mrlee-language';
  const ITEMS = [
    {id:'bai-hoc.html',vi:'Bài học tiếng Hàn',ko:'한국어 강의',en:'Lessons',sub:'Sơ cấp 1 · Sơ cấp 2',keys:'bài học lesson 초급 học từ vựng'},
    {id:'so-cap-1.html',vi:'Sơ cấp 1',ko:'초급 1',en:'Beginner 1',sub:'15 bài học',keys:'so cap 1 beginner 1'},
    {id:'so-cap-2.html',vi:'Sơ cấp 2',ko:'초급 2',en:'Beginner 2',sub:'15 bài học',keys:'so cap 2 beginner 2'},
    {id:'giao-tiep-theo-chu-de.html',vi:'Giao tiếp theo chủ đề',ko:'상황별 회화',en:'Daily Conversation',sub:'Giao tiếp, mua sắm, quán ăn',keys:'nói chuyện conversation speaking 말하기 giao tiếp'},
    {id:'on-luyen-phong-van.html',vi:'Ôn luyện phỏng vấn',ko:'면접 연습',en:'Interview Practice',sub:'Câu hỏi và đáp án mẫu',keys:'interview phỏng vấn eps 면접'},
    {id:'kiem-tra-dau-vao.html',vi:'Kiểm tra đầu vào',ko:'레벨 테스트',en:'Placement Test',sub:'Sơ cấp 1 · Sơ cấp 2 · Trung cấp 1',keys:'đầu vào placement test kiểm tra'},
    {id:'kiem-tra-online.html',vi:'Kiểm tra Online',ko:'온라인 평가',en:'Online Tests',sub:'Đề kiểm tra theo từng 2 bài',keys:'trắc nghiệm online kiểm tra 2 bài'},
    {id:'lich-su-hoc-tap.html',vi:'Lịch sử học tập',ko:'학습 기록',en:'Learning History',sub:'Điểm và các hoạt động của bạn',keys:'lịch sử điểm số kết quả history grades'},
    {id:'trung-tam-hoc-vien.html',vi:'Trung tâm học viên',ko:'학습 대시보드',en:'Student Dashboard',sub:'Tổng quan học tập',keys:'dashboard thống kê tiến độ'},
    {id:'bo-sach.html',vi:'Bộ sách và tài liệu',ko:'교재 및 자료',en:'Books & Resources',sub:'Giáo trình tiếng Hàn',keys:'sách ebook tài liệu pdf book'},
    {id:'de-thi-topik.html',vi:'Bộ đề thi TOPIK',ko:'TOPIK 기출문제',en:'TOPIK Papers',sub:'Luyện đề',keys:'topik đề thi tài liệu'},
    {id:'thi-topik-online.html',vi:'Thi TOPIK Online',ko:'TOPIK 온라인 시험',en:'Online TOPIK',sub:'Cổng TOPIK chính thức',keys:'topik thi online'},
    {id:'dang-nhap.html',vi:'Đăng ký / Đăng nhập',ko:'회원가입 / 로그인',en:'Register / Sign In',sub:'Tài khoản học viên',keys:'login email đăng nhập account'},
  ];
  const LESSON_PAGES = new Set(ITEMS.map(x => x.id).filter(x => !['dang-nhap.html','lich-su-hoc-tap.html','trung-tam-hoc-vien.html'].includes(x)));
  const TEXT = {
    vi:{search:'Tìm kiếm',placeholder:'Tìm bài học, luyện thi, giao tiếp...',nothing:'Không tìm thấy chức năng phù hợp.',hint:'Nhấn Esc để đóng · Enter để mở kết quả đầu tiên',close:'Đóng',continue:'TIẾP TỤC HỌC',recent:'Học tiếp từ mục gần nhất',recentHelp:'Lối tắt được lưu trên thiết bị này, không phải tiến độ xác nhận.',start:'Bắt đầu học Sơ cấp 1',center:'Trung tâm học viên',centerDesc:'Theo dõi điểm luyện tập và các hoạt động học của riêng bạn.',history:'Xem lịch sử',top:'Lên đầu trang',openSearch:'Mở tìm kiếm nhanh'},
    ko:{search:'검색',placeholder:'강의·회화·TOPIK 검색...',nothing:'검색 결과가 없습니다.',hint:'Esc: 닫기 · Enter: 첫 결과 열기',close:'닫기',continue:'이어 학습하기',recent:'최근 학습으로 돌아가기',recentHelp:'이 기기에 저장된 바로가기이며 공식 학습 진도는 아닙니다.',start:'초급 1 시작',center:'학습 대시보드',centerDesc:'내 연습 점수와 학습 활동을 확인하세요.',history:'학습 기록 보기',top:'맨 위로',openSearch:'빠른 검색 열기'},
    en:{search:'Search',placeholder:'Search lessons, TOPIK, conversation...',nothing:'No matching page found.',hint:'Esc closes · Enter opens first result',close:'Close',continue:'CONTINUE LEARNING',recent:'Pick up where you left off',recentHelp:'This shortcut is saved on this device, not an official completion record.',start:'Start Beginner 1',center:'Student Dashboard',centerDesc:'See your practice scores and personal learning activity.',history:'View history',top:'Back to top',openSearch:'Open quick search'}
  };
  const sIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.3"/><path d="m16.3 16.3 5 5"/></svg>';
  const aIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V4m-6 6 6-6 6 6"/></svg>';
  const page = location.pathname.split('/').pop() || 'index.html';
  const getLocale = () => {try {const v=localStorage.getItem(LANG_KEY);return ['vi','ko','en'].includes(v)?v:'vi';}catch{return 'vi';}};
  let lang = getLocale(), modal=null, input=null, results=null, topBtn=null;
  const t = key => TEXT[lang][key];
  function readLast(){try {const id=localStorage.getItem(BASE_KEY); return LESSON_PAGES.has(id)?ITEMS.find(x=>x.id===id):null;}catch{return null;}}
  function create(tag, attrs={}, content){const el=document.createElement(tag); for(const [name,value] of Object.entries(attrs)){if(name==='class') el.className=value; else if(name==='text') el.textContent=value; else el.setAttribute(name,value);} if(content)el.append(content);return el;}
  function updateLast(){if (LESSON_PAGES.has(page)){try{localStorage.setItem(BASE_KEY,page);}catch{}}}
  function homeTools(){
    if(page!=='index.html' || document.getElementById('mrlee-home-tools'))return;
    const hero = document.querySelector('.hero.page-wrap,.hero');
    if(!hero)return;
    const recent=readLast();
    const section=create('section',{class:'mrlee-home-tools',id:'mrlee-home-tools','aria-label':t('center')});
    const left=create('div',{class:'mrlee-tool-card'});
    left.append(create('span',{class:'mrlee-tool-label',text:t('continue')}));
    left.append(create('h2',{class:'mrlee-tool-title',text:recent?t('recent'):t('start')}));
    left.append(create('p',{class:'mrlee-tool-desc',text:t('recentHelp')}));
    const actions=create('div',{class:'mrlee-tool-actions'});
    actions.append(create('a',{class:'mrlee-tool-link',href:recent?recent.id:'so-cap-1.html',text:recent?recent[lang]:'Sơ cấp 1 →'}));
    const searchBtn=create('button',{type:'button',class:'mrlee-tool-link outline',text:t('search')+' ⌕'});
    searchBtn.addEventListener('click',openSearch);actions.append(searchBtn);left.append(actions);
    const right=create('div',{class:'mrlee-tool-card'});
    right.append(create('span',{class:'mrlee-tool-label',text:t('center')}));
    right.append(create('h2',{class:'mrlee-tool-title',text:t('center')}));
    right.append(create('p',{class:'mrlee-tool-desc',text:t('centerDesc')}));
    const rightActions=create('div',{class:'mrlee-tool-actions'});
    rightActions.append(create('a',{class:'mrlee-tool-link',href:'trung-tam-hoc-vien.html',text:t('center')+' →'}));
    rightActions.append(create('a',{class:'mrlee-tool-link outline',href:'lich-su-hoc-tap.html',text:t('history')}));
    right.append(rightActions);
    section.append(left,right);hero.after(section);
  }
  function addNavigation(){
    const nav=document.querySelector('.site-nav');
    if(nav && !nav.querySelector('a[href="trung-tam-hoc-vien.html"]')){
      const el=create('a',{href:'trung-tam-hoc-vien.html',class:'mrlee-nav-extras',text:t('center')});
      const before=nav.querySelector('.nav-account');if(before)before.before(el);else nav.append(el);
    }
  }
  function matches(query, item){const hay=[item.vi,item.ko,item.en,item.sub,item.keys].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const q=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();return q.split(/\s+/).every(part=>hay.includes(part));}
  function renderResults(){
    if(!results)return;
    results.replaceChildren();
    const q=input.value.trim(), match=ITEMS.filter(item=>!q||matches(q,item));
    if(!match.length){results.append(create('p',{class:'mrlee-search-empty',text:t('nothing')}));return;}
    for(const item of match){const a=create('a',{class:'mrlee-search-item',href:item.id});const group=create('span');group.append(create('strong',{text:item[lang]}),create('small',{text:item.sub}));a.append(group,create('span',{text:'↗'}));results.append(a);}
  }
  function closeSearch(){if(!modal)return;modal.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  function openSearch(){if(!modal)return;modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';input.value='';renderResults();input.focus();}
  function createSearch(){
    if(document.getElementById('mrlee-search-modal'))return;
    modal=create('div',{id:'mrlee-search-modal',class:'mrlee-modal','aria-hidden':'true'});
    const panel=create('div',{class:'mrlee-search-panel',role:'dialog','aria-modal':'true','aria-labelledby':'mrlee-search-title'});
    const header=create('div',{class:'mrlee-search-header'});
    const icon=create('span');icon.innerHTML=sIcon;
    const title=create('span',{id:'mrlee-search-title',class:'sr-only',text:t('search')});
    input=create('input',{class:'mrlee-search-input',type:'search','aria-label':t('placeholder'),placeholder:t('placeholder'),autocomplete:'off'});
    const close=create('button',{class:'mrlee-search-close',type:'button',text:t('close')});close.addEventListener('click',closeSearch);
    header.append(icon,title,input,close);results=create('div',{class:'mrlee-search-results'});
    const hint=create('div',{class:'mrlee-search-hint',text:t('hint')});panel.append(header,results,hint);modal.append(panel);document.body.append(modal);
    modal.addEventListener('mousedown',e=>{if(e.target===modal)closeSearch();});
    input.addEventListener('input',renderResults);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=results.querySelector('a');if(first)location.href=first.getAttribute('href');}});
    const inHeader=document.querySelector('.header-layout,.header-inner');
    if(inHeader && !document.querySelector('.site-nav,.nav')){const btn=create('button',{class:'mrlee-search-top',type:'button','aria-label':t('openSearch')});btn.innerHTML=sIcon+'<span></span><kbd>Ctrl K</kbd>';btn.querySelector('span').textContent=t('search');btn.addEventListener('click',openSearch);const toggle=inHeader.querySelector('.menu-toggle');if(toggle)toggle.before(btn);else inHeader.append(btn);}
    else {const btn=create('button',{class:'mrlee-search-fab',type:'button','aria-label':t('openSearch')});btn.innerHTML=sIcon;btn.addEventListener('click',openSearch);document.body.append(btn);}
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}
      else if(e.key==='Escape' && modal.getAttribute('aria-hidden')==='false'){e.preventDefault();closeSearch();}
      else if(e.key==='Tab' && modal.getAttribute('aria-hidden')==='false'){
        const focusables=[input,close,...results.querySelectorAll('a')];const i=focusables.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();focusables[focusables.length-1].focus();}else if(!e.shiftKey&&i===focusables.length-1){e.preventDefault();focusables[0].focus();}
      }
    });
  }
  function readingProgress(){
    topBtn=create('button',{class:'mrlee-to-top',type:'button','aria-label':t('top')});topBtn.innerHTML=aIcon;topBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));document.body.append(topBtn);
    let bar=null;if(['so-cap-1.html','so-cap-2.html','on-luyen-phong-van.html','giao-tiep-theo-chu-de.html','bai-hoc.html'].includes(page)){bar=create('div',{class:'mrlee-reading-progress','aria-hidden':'true'});document.body.append(bar);}
    let ticking=false;
    function update(){const scroll=window.scrollY;topBtn.classList.toggle('is-visible',scroll>380);if(bar){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);bar.style.width=Math.min(100,Math.round(scroll/max*100))+'%';}ticking=false;}
    window.addEventListener('scroll',()=>{if(!ticking){window.requestAnimationFrame(update);ticking=true;}},{passive:true});update();
  }
  function refreshLocale(){
    const chosen=window.MrLeeI18n?.getLocale?.()||getLocale(); if(lang===chosen)return;lang=chosen;
    document.getElementById('mrlee-home-tools')?.remove();homeTools();renderResults();
    const nav=document.querySelector('.mrlee-nav-extras');if(nav)nav.textContent=t('center');
    document.querySelectorAll('.mrlee-search-top span').forEach(el=>el.textContent=t('search'));
    if(input){input.placeholder=t('placeholder');input.setAttribute('aria-label',t('placeholder'));}
    if(topBtn)topBtn.setAttribute('aria-label',t('top'));
    const title=document.getElementById('mrlee-search-title');if(title)title.textContent=t('search');
    document.querySelector('.mrlee-search-close')?.replaceChildren(document.createTextNode(t('close')));
    document.querySelector('.mrlee-search-hint')?.replaceChildren(document.createTextNode(t('hint')));
  }
  function start(){ updateLast();createSearch();readingProgress();addNavigation();homeTools();document.addEventListener('mrlee:languagechange',refreshLocale);refreshLocale(); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
