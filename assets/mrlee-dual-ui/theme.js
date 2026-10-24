/* MR LEE Dual Theme — keeps URLs/content/auth identical. */
(()=>{'use strict';
const KEY='MRLEE.THEME.V1',ROOT='assets/mrlee-dual-ui/cards/',doc=document,html=doc.documentElement;
const path=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
// V2 cinematic artwork complements existing approved SVGs and keeps original branding untouched.
const cinematicCss=doc.createElement('link');cinematicCss.rel='stylesheet';cinematicCss.href='assets/mrlee-dual-ui/cinematic-v2.css?v=20261024-2';cinematicCss.dataset.mrleeCinematic='v2';doc.head.append(cinematicCss);
const premiumCss=doc.createElement('link');premiumCss.rel='stylesheet';premiumCss.href='assets/mrlee-next/premium.css?v=20261024c';doc.head.append(premiumCss);
// Dedicated R1 navigation layer, shown only in the optional futuristic theme.
const navCss=doc.createElement('link');navCss.rel='stylesheet';navCss.href='assets/mrlee-v2/primary-nav.css?v=20261025-r1';doc.head.append(navCss);
// Production-ready V2 experience: page-specific real CTAs and accessible site footer.
const experienceCss=doc.createElement('link');experienceCss.rel='stylesheet';experienceCss.href='assets/mrlee-v2/experience.css?v=20261025-r2';doc.head.append(experienceCss);
const experienceScript=doc.createElement('script');experienceScript.src='assets/mrlee-v2/experience.js?v=20261025-r2';doc.head.append(experienceScript);
const admin=path==='admin.html';
const sceneNames=['learning','speaking','topik','interview','culture','universities','home','admin'];
function which(t){t=String(t).toLowerCase();if(/mrlee-bai-tap-pro|workbook/.test(t))return 'workbook';if(/trung-tam-hoc-vien|ho-so-hoc-vien/.test(t))return 'profile';if(/admin|xep-hang|ranking/.test(t))return 'admin';if(/van-hoa|culture|du-lich|kham-pha/.test(t))return 'culture';if(/phong-van/.test(t))return 'interview';if(/ban-do|dai-hoc|truong/.test(t))return 'universities';if(/giao-tiep|hoi-thoai|noi/.test(t))return 'speaking';if(/topik|kiem-tra|luyen-de|thi|nghe/.test(t))return 'topik';if(/hoc-|bai-tap|workbook|hoc-vien/.test(t))return 'learning';return 'home'}
function asset(n){
 const list=['home','learning','speaking','topik','interview','culture','universities','workbook','profile','admin','consultation'];
 if(list.includes(n))return 'assets/mrlee-next/scenes/'+n+'.svg';
 if(/^(elementary|intermediate|advanced)/.test(n))return 'assets/mrlee-next/scenes/learning.svg';
 if(['mock','roadmap','placement','listening','writing'].includes(n))return 'assets/mrlee-next/scenes/topik.svg';
 if(n==='schools')return 'assets/mrlee-next/scenes/universities.svg';
 if(n==='history')return 'assets/mrlee-next/scenes/profile.svg';
 if(['food','daily','life'].includes(n))return 'assets/mrlee-next/scenes/culture.svg';
 return 'assets/mrlee-next/scenes/learning.svg';
}
const photos={profile:'learning-roadmap.webp',elementary1:'learning-cap-1.webp',elementary2:'learning-cap-2.webp',intermediate1:'learning-cap-3.webp',intermediate2:'learning-cap-4.webp',advanced1:'learning-cap-5.webp',advanced2:'learning-cap-6.webp',learning:'learning-books.webp',workbook:'learning-books.webp',speaking:'learning-cap-2.webp',topik:'feature-6-thi-topik.webp',mock:'learning-topik.webp',placement:'learning-topik.webp',roadmap:'learning-roadmap.webp',history:'learning-roadmap.webp',listening:'learning-listening.webp',writing:'learning-books.webp',interview:'step-1-tu-van.webp',culture:'culture.webp',daily:'culture.webp',food:'culture.webp',life:'culture.webp',universities:'feature-2-ban-do.webp',schools:'feature-3-tim-truong.webp',home:'feature-1-tuyen-sinh.webp',admin:'learning-roadmap.webp'};
let theme='fresh';try{theme=localStorage.getItem(KEY)==='future'?'future':'fresh'}catch{}
function update(v){theme=v==='future'?'future':'fresh';html.dataset.mrleeTheme=theme;try{localStorage.setItem(KEY,theme)}catch{}
 doc.querySelectorAll('.mrlee-theme-switch button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===theme)));
 doc.querySelectorAll('[data-mrlee-original]').forEach(el=>{el.src=theme==='future'?el.dataset.mrleeFuture:el.dataset.mrleeOriginal});
}
function cardTheme(link){
 const href=link.getAttribute('href')||'',params=new URL(link.href,location.href).searchParams,cap=params.get('cap');
 if(cap&&/^[1-6]$/.test(cap))return ['','elementary1','elementary2','intermediate1','intermediate2','advanced1','advanced2'][Number(cap)];
 if(/kiem-tra-dau-vao/.test(href))return 'placement';
 if(/lo-trinh-topik|topik-i-lo-trinh|topik-ii-lo-trinh/.test(href))return 'roadmap';
 if(/thi-topik|topik-v11|topik-phong-luyen/.test(href))return 'mock';
 if(/lich-su/.test(href))return 'history';
 if(/workbook|bai-tap-pro/.test(href))return 'workbook';
 if(/luyen-nghe|nghe-/.test(href))return 'listening';
 if(/viet-51-54/.test(href))return 'writing';
 if(/van-hoa-bai-hoc/.test(href))return 'daily';
 if(/hoc-bong|tim-truong/.test(href))return 'schools';
 return which(href+' '+link.textContent);
}
function decorate(){
 html.dataset.mrleeScene=which(path);
 html.style.setProperty('--mrlee-scene','url("'+asset(which(path))+'")');
 html.style.setProperty('--mrlee-scene-photo','url("assets/v306/images/'+(photos[which(path)]||'learning-roadmap.webp')+'")');
 doc.querySelectorAll('.destination-grid a.destination,.quick-links a,.shortcuts a.shortcut,.mr-new-grid a,.mrlee-topik-shortcuts a').forEach(a=>{
  if(a.querySelector('.mrlee-card-visual'))return;if(!a.matches('.destination'))a.classList.add('mrlee-custom-future-card');
  const s=doc.createElement('span');s.className='mrlee-card-visual';s.setAttribute('aria-hidden','true');
  const kind=cardTheme(a);
  s.style.setProperty('--mrlee-card-art','url("'+asset(kind)+'")');
  s.style.setProperty('--mrlee-card-photo','url("assets/v306/images/'+(photos[kind]||'learning-roadmap.webp')+'")');a.append(s);
 });
 // Decorate native topic tiles without replacing their content, links or images.
 doc.querySelectorAll('.topic-menu a[href],.phrase-grid a[href],.cards a[href],.subject-grid a[href],.course-grid a[href]').forEach((link,i)=>{
  if(i>=32||link.querySelector('.mrlee-topic-photo')||link.querySelector('.mrlee-card-visual'))return;
  link.classList.add('mrlee-themed-tile');
  const kind=cardTheme(link);
  const el=doc.createElement('span');el.className='mrlee-topic-photo';el.setAttribute('aria-hidden','true');
  el.style.setProperty('--mrlee-tile-svg','url("'+asset(kind)+'")');
  el.style.setProperty('--mrlee-tile-photo','url("'+asset(kind)+'")');
  link.append(el);
 });
 doc.querySelectorAll('.feature-card img').forEach((el,i)=>{
  if(el.dataset.mrleeOriginal)return;const a=el.closest('a');
  el.dataset.mrleeOriginal=el.getAttribute('src')||'';el.dataset.mrleeFuture=asset(cardTheme(a||el));
 });
 const host=doc.querySelector('.section-hero .hero-text,.v10-hero,.pro-header .pro-wrap');
 if(host&&!host.querySelector('.mrlee-future-kicker')){const x=doc.createElement('span');x.className='mrlee-future-kicker';x.textContent='KOREAN LANGUAGE · GLOBAL FUTURE';host.prepend(x)}
}
function controls(){
 if(doc.querySelector('.mrlee-theme-switch'))return;
 const nav=doc.createElement('nav');nav.className='mrlee-theme-switch';nav.setAttribute('aria-label','Chọn giao diện MR LEE');
 nav.innerHTML='<strong>Chọn giao diện</strong><button type="button" data-theme="fresh" aria-pressed="false">☀ 1. Giao diện tươi mới</button><button type="button" data-theme="future" aria-pressed="false">✦ 2. Giao diện viễn tưởng</button>';
 nav.addEventListener('click',e=>{const b=e.target.closest('button[data-theme]');if(b)update(b.dataset.theme)});
 const head=admin?doc.querySelector('.content>.topbar'):doc.querySelector('.site-header,.site-top,header.head,.v10-header,.topbar,.pro-header,.mlb-topbar');
 if(head&&head.parentNode)head.after(nav);else doc.body.prepend(nav);
}
function pageGallery(){
 const sets={
  'hoc-tieng-han.html':[['6 cấp độ','Học theo cấp độ từ sơ cấp đến cao cấp','hoc-theo-bai.html','learning-cap-1.webp','learning'],['Luyện nghe · Luyện nói','Học phát âm và hội thoại thực tế','nghe-toan-bo.html','learning-listening.webp','listening'],['15 bộ WORKBOOK','Luyện từng bài học và lưu câu trả lời','mrlee-bai-tap-pro.html','learning-books.webp','workbook']],
  'giao-tiep-theo-chu-de.html':[['Hội thoại theo chủ đề','Chào hỏi, nhà hàng, mua sắm, công sở','hoi-thoai-tap-noi.html','learning-cap-2.webp','speaking'],['Phản xạ · Luyện nói','Luyện phát âm, hội thoại và phản xạ','luyen-noi-nang-cao.html','learning-listening.webp','listening'],['Phỏng vấn thực tế','Tình huống du học và công việc','giao-tiep-phong-van.html','step-1-tu-van.webp','interview']],
  'kiem-tra-topik.html':[['Kiểm tra đầu vào','Lưu 50 câu trả lời để giáo viên xếp lớp','kiem-tra-dau-vao.html','feature-5-hoc-tieng-han.webp','placement'],['TOPIK I · TOPIK II','Lộ trình và ngân hàng đề luyện tập','de-thi-topik.html','learning-topik.webp','topik'],['Thi thử PBT · IBT','Phòng thi mô phỏng có lịch sử kết quả','topik-v11.html','feature-6-thi-topik.webp','mock']],
  'giao-tiep-phong-van.html':[['Phỏng vấn du học','Tự giới thiệu, kế hoạch học tập','on-luyen-phong-van.html','step-1-tu-van.webp','interview'],['Hội thoại tình huống','Hỏi đáp phỏng vấn và phản xạ','hoi-thoai-tap-noi.html','learning-cap-2.webp','speaking'],['Củng cố tiếng Hàn','Luyện nói và sửa lỗi thường gặp','luyen-noi-nang-cao.html','learning-listening.webp','listening']],
  'van-hoa-han-quoc.html':[['Văn hóa theo chủ đề','Ẩm thực, phong tục, ứng xử Hàn Quốc','van-hoa-bai-hoc.html','culture.webp','culture'],['Khám phá Hàn Quốc','Đời sống, bản đồ du lịch và trải nghiệm','ban-do-han-quoc.html','feature-8-doi-song.webp','travel'],['Trường đại học','Khám phá đời sống học đường Hàn Quốc','ban-do-dai-hoc-han-quoc.html','feature-2-ban-do.webp','universities']],
  'ban-do-dai-hoc-han-quoc.html':[['Tra cứu trường','Tìm trường theo tên và khu vực','tim-truong.html','feature-3-tim-truong.webp','schools'],['Bản đồ chi tiết','Xem vị trí và thông tin các trường','ban-do-dai-hoc-han-quoc-chi-tiet.html','feature-2-ban-do.webp','universities'],['Học bổng Hàn Quốc','Tìm hiểu điều kiện học bổng','hoc-bong-han-quoc.html','feature-1-tuyen-sinh.webp','schools']],
  'trung-tam-hoc-vien.html':[['Tiến độ học tập','Xem lịch sử và hoạt động cá nhân','lich-su-hoc-tap.html','learning-roadmap.webp','history'],['Bài luyện TOPIK','Lộ trình, bài kiểm tra và thi thử','kiem-tra-topik.html','learning-topik.webp','topik'],['WORKBOOK','Các bộ bài tập và kết quả luyện tập','mrlee-bai-tap-pro.html','learning-books.webp','workbook']],
  'mrlee-bai-tap-pro.html':[['Bộ bài tập theo bài','15 bộ WORKBOOK của từng bài học','hoc-theo-bai.html','learning-books.webp','workbook'],['Luyện nghe','Nghe theo trình độ và từng chủ đề','nghe-toan-bo.html','learning-listening.webp','listening'],['Xem kết quả','Lịch sử bài làm đã đồng bộ','lich-su-hoc-tap.html','learning-roadmap.webp','history']]
 };
 const items=sets[path];if(!items||doc.querySelector('.mrlee-cinematic-gallery'))return;
 const holder=doc.createElement('section');holder.className='mrlee-cinematic-gallery';holder.setAttribute('aria-label','Khám phá nội dung '+which(path));
 const title=doc.createElement('div');title.className='mrlee-cinematic-title';title.innerHTML='<h2>◈ KHÁM PHÁ NỘI DUNG LIÊN QUAN</h2><small>Mỗi mục có hình ảnh riêng · giữ nguyên bài học và chức năng</small>';holder.append(title);
 const grid=doc.createElement('nav');grid.className='mrlee-cinematic-grid';grid.setAttribute('aria-label','Các chức năng liên quan');
 items.forEach(([title,description,url,photo,kind])=>{
  const link=doc.createElement('a');link.className='mrlee-cinematic-card';link.href=url;
  link.style.setProperty('--mrlee-tile-photo','url("assets/v306/images/'+photo+'")');
  link.style.setProperty('--mrlee-tile-svg','url("'+asset(kind)+'")');
  const content=doc.createElement('span');content.className='mrlee-cinematic-content';
  const name=doc.createElement('b');name.textContent=title;
  const detail=doc.createElement('small');detail.textContent=description;content.append(name,detail);
  const arrow=doc.createElement('span');arrow.className='mrlee-cinematic-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
  link.append(content,arrow);grid.append(link);
 });
 holder.append(grid);
 const hero=doc.querySelector('.section-hero,.page-hero,.hero,.v10-hero,.pro-header,.intro');
 if(hero&&hero.parentNode)hero.after(holder);
 else{const main=doc.querySelector('main,.shell,.pro-wrap');if(main)main.prepend(holder)}
}


function portal(){
 const allowed=new Set(['index.html','hoc-tieng-han.html','giao-tiep-theo-chu-de.html','kiem-tra-topik.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html','ban-do-dai-hoc-han-quoc.html','trung-tam-hoc-vien.html','mrlee-bai-tap-pro.html']);
 if(admin||!allowed.has(path)||doc.querySelector('.mrlee-next-portal'))return;
 const groups={
 home:[['Học tiếng Hàn','hoc-tieng-han.html','learning'],['Giao tiếp','giao-tiep-theo-chu-de.html','speaking'],['TOPIK','kiem-tra-topik.html','topik'],['Phỏng vấn','giao-tiep-phong-van.html','interview'],['Văn hóa Hàn Quốc','van-hoa-han-quoc.html','culture'],['Bản đồ trường đại học','ban-do-dai-hoc-han-quoc.html','universities'],['WORKBOOK','mrlee-bai-tap-pro.html','workbook'],['Hồ sơ học viên','trung-tam-hoc-vien.html','profile'],['Đăng ký tư vấn','dang-ky-tu-van.html','consultation']],
 learning:[['Sơ cấp 1','hoc-theo-bai.html?cap=1','learning'],['Sơ cấp 2','hoc-theo-bai.html?cap=2','learning'],['Trung cấp 1','hoc-theo-bai.html?cap=3','learning'],['Trung cấp 2','hoc-theo-bai.html?cap=4','learning'],['Cao cấp 1','hoc-theo-bai.html?cap=5','learning'],['Cao cấp 2','hoc-theo-bai.html?cap=6','learning'],['WORKBOOK','mrlee-bai-tap-pro.html','workbook']],
 speaking:[['Hội thoại thực tế','hoi-thoai-tap-noi.html','speaking'],['Luyện nói nâng cao','luyen-noi-nang-cao.html','speaking'],['Luyện nghe','nghe-toan-bo.html','speaking'],['Phỏng vấn','giao-tiep-phong-van.html','interview'],['Luyện TOPIK','kiem-tra-topik.html','topik']],
 topik:[['Kiểm tra đầu vào','kiem-tra-dau-vao.html','topik'],['Lộ trình ôn thi','lo-trinh-topik.html','topik'],['Luyện đề TOPIK I / II','de-thi-topik.html','topik'],['Thi thử PBT / IBT','topik-v11.html','topik'],['Lịch sử kết quả','lich-su-hoc-tap.html','profile']],
 interview:[['Luyện phỏng vấn','on-luyen-phong-van.html','interview'],['Phỏng vấn du học','giao-tiep-phong-van.html','interview'],['Hội thoại mẫu','hoi-thoai-tap-noi.html','speaking'],['Luyện phản xạ','luyen-noi-nang-cao.html','speaking'],['Tư vấn du học','dang-ky-tu-van.html','consultation']],
 culture:[['Văn hóa theo chủ đề','van-hoa-bai-hoc.html','culture'],['Bản đồ du lịch Hàn Quốc','ban-do-han-quoc.html','culture'],['Bản đồ đại học','ban-do-dai-hoc-han-quoc.html','universities'],['Giao tiếp đời sống','giao-tiep-theo-chu-de.html','speaking'],['Định hướng du học','dang-ky-tu-van.html','consultation']],
 universities:[['Tìm trường','tim-truong.html','universities'],['Bản đồ chi tiết','ban-do-dai-hoc-han-quoc-chi-tiet.html','universities'],['Học bổng','hoc-bong-han-quoc.html','universities'],['Thông tin tuyển sinh','tuyen-sinh.html','consultation'],['Đăng ký tư vấn','dang-ky-tu-van.html','consultation']],
 workbook:[['Bài tập theo bài','mrlee-bai-tap-pro.html','workbook'],['Bài học','hoc-tieng-han.html','learning'],['Luyện nghe','nghe-toan-bo.html','speaking'],['Thi thử TOPIK','topik-v11.html','topik'],['Lịch sử bài làm','lich-su-hoc-tap.html','profile']],
 profile:[['Tiến độ và lịch sử','lich-su-hoc-tap.html','profile'],['Học tiếng Hàn','hoc-tieng-han.html','learning'],['Luyện thi TOPIK','kiem-tra-topik.html','topik'],['WORKBOOK','mrlee-bai-tap-pro.html','workbook'],['Tư vấn định hướng','dang-ky-tu-van.html','consultation']]
 };
 const kind=which(path),items=path==='index.html'?groups.home:(groups[kind]||[]);if(!items.length)return;
 const section=doc.createElement('section');section.className='mrlee-next-portal';
 const head=doc.createElement('div');head.className='mrlee-next-portal-heading';
 const h=doc.createElement('h2');h.textContent=path==='index.html'?'KHÁM PHÁ HỆ SINH THÁI MR LEE':'CHỌN CHỨC NĂNG HỌC TẬP';
 const desc=doc.createElement('p');desc.textContent='Điều hướng trực tiếp đến nội dung thật · Hai giao diện dùng chung kết quả và tài khoản.';head.append(h,desc);section.append(head);
 const nav=doc.createElement('nav');nav.className='mrlee-next-portal-grid';nav.setAttribute('aria-label','Chuyên mục chính');
 items.forEach(([name,url,category],i)=>{
 const a=doc.createElement('a');a.className='mrlee-next-portal-card';a.href=url;
 a.style.setProperty('--mrlee-next-image','url("'+asset(category)+'")');
 const visual=doc.createElement('span');visual.className='image-layer';const num=doc.createElement('span');num.className='number';num.textContent=String(i+1).padStart(2,'0');visual.append(num);
 const caption=doc.createElement('span');caption.className='caption-layer';
 const title=doc.createElement('strong');title.textContent=name;
 const subtitle=doc.createElement('small');subtitle.textContent=name==='Đăng ký tư vấn'?'Phiếu trực tuyến lưu vào Admin':'Học và thực hành trên hệ thống MR LEE';
 const go=doc.createElement('em');go.textContent='Mở chức năng ↗';caption.append(title,subtitle,go);a.append(visual,caption);nav.append(a);
 });section.append(nav);
 const hero=doc.querySelector('.section-hero,.hero,.page-hero,.v10-hero,.pro-header,.intro');
 const content=doc.querySelector('main,.shell,.pro-wrap,.content-section');
 if(hero?.parentElement)hero.after(section);else if(content)content.prepend(section);
}


function primaryNav(){
 const supported=new Set(['index.html','hoc-tieng-han.html','giao-tiep-theo-chu-de.html','kiem-tra-topik.html','giao-tiep-phong-van.html','van-hoa-han-quoc.html','ban-do-dai-hoc-han-quoc.html','trung-tam-hoc-vien.html','mrlee-bai-tap-pro.html']);
 if(admin||!supported.has(path)||doc.querySelector('.mrlee-v2-primary-nav'))return;
 const links=[
  ['Học tiếng Hàn','hoc-tieng-han.html','learning'],
  ['Giao tiếp','giao-tiep-theo-chu-de.html','speaking'],
  ['TOPIK','kiem-tra-topik.html','topik'],
  ['Phỏng vấn','giao-tiep-phong-van.html','interview'],
  ['Văn hóa','van-hoa-han-quoc.html','culture'],
  ['Bản đồ các trường ĐH Hàn Quốc','ban-do-dai-hoc-han-quoc.html','universities']
 ];
 const nav=doc.createElement('nav');nav.className='mrlee-v2-primary-nav';nav.setAttribute('aria-label','Sáu chuyên mục chính của TIẾNG HÀN MR LEE');
 const intro=doc.createElement('span');intro.className='mrlee-v2-nav-label';intro.textContent='KHÁM PHÁ MR LEE';nav.append(intro);
 const list=doc.createElement('ul');list.className='mrlee-v2-nav-list';
 links.forEach(([label,url,group],i)=>{
  const li=doc.createElement('li'),a=doc.createElement('a');a.href=url;
  const num=doc.createElement('small');num.textContent=String(i+1).padStart(2,'0');
  const name=doc.createElement('span');name.textContent=label;
  a.append(num,name);if(path===url)a.setAttribute('aria-current','page');
  li.append(a);list.append(li);
 });
 nav.append(list);
 const switcher=doc.querySelector('.mrlee-theme-switch');
 if(switcher?.parentNode)switcher.after(nav);else doc.body.prepend(nav);
}
function run(){controls();primaryNav();decorate();portal();update(theme)}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();