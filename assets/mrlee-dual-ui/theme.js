/* MR LEE Dual Theme — keeps URLs/content/auth identical. */
(()=>{'use strict';
const KEY='MRLEE.THEME.V1',ROOT='assets/mrlee-dual-ui/cards/',doc=document,html=doc.documentElement;
const path=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
// V2 cinematic artwork complements existing approved SVGs and keeps original branding untouched.
const cinematicCss=doc.createElement('link');cinematicCss.rel='stylesheet';cinematicCss.href='assets/mrlee-dual-ui/cinematic-v2.css?v=20261024-2';cinematicCss.dataset.mrleeCinematic='v2';doc.head.append(cinematicCss);
const admin=path==='admin.html';
const sceneNames=['learning','speaking','topik','interview','culture','universities','home','admin'];
function which(t){t=String(t).toLowerCase();if(/mrlee-bai-tap-pro|workbook/.test(t))return 'workbook';if(/trung-tam-hoc-vien|ho-so-hoc-vien/.test(t))return 'profile';if(/admin|xep-hang|ranking/.test(t))return 'admin';if(/van-hoa|culture|du-lich|kham-pha/.test(t))return 'culture';if(/phong-van/.test(t))return 'interview';if(/ban-do|dai-hoc|truong/.test(t))return 'universities';if(/giao-tiep|hoi-thoai|noi/.test(t))return 'speaking';if(/topik|kiem-tra|luyen-de|thi|nghe/.test(t))return 'topik';if(/hoc-|bai-tap|workbook|hoc-vien/.test(t))return 'learning';return 'home'}
function asset(n){return ROOT+(n==='profile'?'learning':n)+'.svg'}
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
 html.style.setProperty('--mrlee-scene-photo','url("assets/v306/images/'+(photos[which(path)]||'feature-1-tuyen-sinh.webp')+'")');
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
  el.style.setProperty('--mrlee-tile-photo','url("assets/v306/images/'+(photos[kind]||photos[which(path)]||'learning-books.webp')+'")');
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

function run(){controls();decorate();pageGallery();update(theme)}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();