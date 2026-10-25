/* MR LEE V4 — photographic, accessible child-page shell. Client-side UX only.
 * Uses existing repository WebP assets. Does NOT invent students, scores, popularity or rankings.
 */
(()=>{'use strict';
const d=document,html=d.documentElement,page=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
const R='assets/v306/images/';
const defs={
 'hoc-tieng-han.html':{
 id:'learning',eyebrow:'KOREAN LANGUAGE · GLOBAL FUTURE',title:'HỌC TIẾNG HÀN',lead:'Lộ trình từ Sơ cấp đến Cao cấp',description:'Học bài bản theo trình độ, ôn từ vựng và ngữ pháp, luyện nghe – nói và thực hành WORKBOOK theo bài.',
 image:'learning-roadmap.webp',cta:['Bắt đầu học','hoc-theo-bai.html?cap=1'],secondary:['Mở WORKBOOK','mrlee-bai-tap-pro.html'],section:'6 cấp độ học tiếng Hàn',hint:'Chọn trình độ để mở bài học thực tế',
 cards:[['Sơ cấp 1','Bảng chữ cái và nền tảng','hoc-theo-bai.html?cap=1','learning-cap-1.webp'],['Sơ cấp 2','Giao tiếp đời sống','hoc-theo-bai.html?cap=2','learning-cap-2.webp'],['Trung cấp 1','Mở rộng vốn từ và cách diễn đạt','hoc-theo-bai.html?cap=3','learning-cap-3.webp'],['Trung cấp 2','Vận dụng cấu trúc nâng cao','hoc-theo-bai.html?cap=4','learning-cap-4.webp'],['Cao cấp 1','Đọc, viết và diễn đạt học thuật','hoc-theo-bai.html?cap=5','learning-cap-5.webp'],['Cao cấp 2','Hoàn thiện năng lực tiếng Hàn','hoc-theo-bai.html?cap=6','learning-cap-6.webp']],
 tools:[['Từ vựng & ngữ pháp','hoc-theo-bai.html?cap=1','learning-books.webp'],['Luyện nghe','nghe-toan-bo.html','step-1-tu-van.webp'],['Luyện hội thoại','hoi-thoai-tap-noi.html','learning-hangeul.webp'],['Luyện nói nâng cao','luyen-noi-nang-cao.html','step-5-ho-tro.webp'],['WORKBOOK','mrlee-bai-tap-pro.html','feature-4-ho-so-visa.webp'],['Sách & tài liệu','bo-sach.html','step-2-ho-so.webp']]},
 'giao-tiep-theo-chu-de.html':{
 id:'speaking',eyebrow:'REAL KOREAN · EVERYDAY COMMUNICATION',title:'GIAO TIẾP TIẾNG HÀN',lead:'Hội thoại theo tình huống đời sống thực tế',description:'Luyện mẫu câu, nghe phát âm, ghi nhớ bằng thẻ và tự tin giao tiếp trong sinh hoạt, trường học, công việc.',
 image:'learning-cap-2.webp',cta:['Chọn chủ đề giao tiếp','#topicMenu'],secondary:['Luyện hội thoại','hoi-thoai-tap-noi.html'],section:'Luyện giao tiếp theo chủ đề',hint:'Mở bài học và chọn chủ đề ngay bên dưới',
 cards:[['Chào hỏi','Giới thiệu và kết bạn','#topicMenu','learning-cap-1.webp'],['Nhà hàng','Gọi món và trò chuyện','#topicMenu','culture.webp'],['Mua sắm','Hỏi giá và thanh toán','#topicMenu','feature-3-tim-truong.webp'],['Giao tiếp trường học','Học tập và lớp học','#topicMenu','learning-cap-3.webp']],
 tools:[['Hội thoại mẫu','hoi-thoai-tap-noi.html','step-1-tu-van.webp'],['Luyện nghe','nghe-toan-bo.html','learning-listening.webp'],['Phỏng vấn','giao-tiep-phong-van.html','step-2-ho-so.webp'],['Luyện TOPIK','kiem-tra-topik.html','feature-6-thi-topik.webp']]},
 'kiem-tra-topik.html':{
 id:'topik',eyebrow:'TOPIK I · TOPIK II · PBT · IBT',title:'TOPIK MR LEE',lead:'Ôn thi bài bản, luyện đề theo năng lực',description:'Khám phá các dạng đề, luyện kỹ năng và theo dõi tiến độ bài thi từ kết quả thực tế của bạn.',
 image:'feature-6-thi-topik.webp',cta:['Lộ trình TOPIK','lo-trinh-topik.html'],secondary:['Kiểm tra đầu vào','kiem-tra-dau-vao.html'],section:'Bắt đầu luyện thi TOPIK',hint:'Truy cập trực tiếp từng công cụ có thật',
 cards:[['Kiểm tra đầu vào','Xác định trình độ ban đầu','kiem-tra-dau-vao.html','learning-hangeul.webp'],['Lộ trình ôn TOPIK','Học có kế hoạch','lo-trinh-topik.html','learning-roadmap.webp'],['Luyện đề TOPIK','Nghe, đọc, viết','topik-v11.html','step-2-ho-so.webp'],['Thi thử PBT / IBT','Mô phỏng phòng thi','topik-v11.html','learning-cap-3.webp'],['Lịch sử kết quả','Xem bài luyện đã lưu','lich-su-hoc-tap.html','learning-books.webp']],
 tools:[['Học từ vựng','hoc-tieng-han.html','learning-cap-1.webp'],['Luyện nghe','nghe-toan-bo.html','learning-listening.webp'],['WORKBOOK','mrlee-bai-tap-pro.html','learning-cap-5.webp']]},
 'giao-tiep-phong-van.html':{
 id:'interview',eyebrow:'KOREAN INTERVIEW · STUDY ABROAD',title:'PHỎNG VẤN TIẾNG HÀN',lead:'Tự tin trước mọi câu hỏi',description:'Luyện tự giới thiệu, lý do chọn trường, kế hoạch học tập, mục tiêu tương lai và tình huống phỏng vấn.',
 image:'step-5-ho-tro.webp',cta:['Luyện phỏng vấn','on-luyen-phong-van.html'],secondary:['Hội thoại mẫu','hoi-thoai-tap-noi.html'],section:'Chủ đề phỏng vấn nổi bật',hint:'Tình huống thực tế theo đúng nhu cầu',
 cards:[['Tự giới thiệu','Giới thiệu bản thân','on-luyen-phong-van.html','step-1-tu-van.webp'],['Phỏng vấn du học','Lý do và kế hoạch học tập','on-luyen-phong-van.html','step-2-ho-so.webp'],['Phỏng vấn công việc','Tác phong và kinh nghiệm','giao-tiep-theo-chu-de.html','learning-cap-5.webp'],['Câu hỏi tình huống','Luyện phản xạ','luyen-noi-nang-cao.html','learning-cap-3.webp']],
 tools:[['Tập nói và ghi âm','hoi-thoai-tap-noi.html','learning-listening.webp'],['WORKBOOK','mrlee-bai-tap-pro.html','learning-books.webp'],['Đăng ký tư vấn','dang-ky-tu-van.html','feature-1-tuyen-sinh.webp']]},
 'van-hoa-han-quoc.html':{
 id:'culture',eyebrow:'KOREAN CULTURE · LIFE · TRADITION',title:'VĂN HÓA HÀN QUỐC',lead:'Khám phá con người và cuộc sống xứ kim chi',description:'Từ phong tục, lễ hội, ẩm thực tới trường học, giao thông và kỹ năng sống thiết yếu ở Hàn Quốc.',
 image:'feature-7-ky-tuc-xa.webp',cta:['Khám phá 22 chủ đề','#topicSection'],secondary:['Bản đồ khám phá','ban-do-han-quoc.html'],section:'Khám phá văn hóa và kỹ năng sống',hint:'Các bài thực tế và hướng dẫn hiện có ở bên dưới',
 cards:[['Ẩm thực','Văn hóa ăn uống Hàn Quốc','#topicSection','culture.webp'],['Lễ hội','Phong tục và truyền thống','#topicSection','feature-1-tuyen-sinh.webp'],['Đời sống','Sinh hoạt và giao thông','#topicSection','step-4-xuat-canh.webp'],['Kỹ năng sống','Sơ cứu, giấy tờ và hỗ trợ','#topicSection','step-5-ho-tro.webp']],
 tools:[['Bài văn hóa','van-hoa-bai-hoc.html','feature-4-ho-so-visa.webp'],['Bản đồ du lịch','ban-do-han-quoc.html','feature-2-ban-do.webp'],['Giao tiếp đời sống','giao-tiep-theo-chu-de.html','learning-cap-2.webp']]},
 'ban-do-dai-hoc-han-quoc.html':{
 id:'universities',eyebrow:'KOREA UNIVERSITIES · DISCOVER',title:'BẢN ĐỒ CÁC TRƯỜNG ĐẠI HỌC HÀN QUỐC',lead:'Tìm trường theo tên, khu vực và loại hình',description:'Khám phá thông tin từng trường qua danh mục và bản đồ. Vị trí và tuyển sinh cần được đối chiếu nguồn chính thức.',
 image:'feature-2-ban-do.webp',cta:['Tra cứu trường','#universitySearch'],secondary:['Đăng ký tư vấn','dang-ky-tu-van.html'],section:'Công cụ tìm hiểu đại học',hint:'Bộ lọc và bản đồ thật nằm ngay bên dưới',
 cards:[['Tìm trường','Lọc theo tên và khu vực','#universitySearch','feature-4-ho-so-visa.webp'],['Bản đồ đại học','Khám phá theo vùng','#mrleeRegionList','feature-3-tim-truong.webp'],['Điều kiện và học phí','Tìm hiểu trường chi tiết','#universityCards','feature-7-ky-tuc-xa.webp'],['Tư vấn chọn trường','Lên lộ trình phù hợp','dang-ky-tu-van.html','feature-1-tuyen-sinh.webp']],
 tools:[['Tuyển sinh du học','tuyen-sinh.html','step-1-tu-van.webp'],['Học tiếng Hàn','hoc-tieng-han.html','feature-5-hoc-tieng-han.webp'],['Luyện TOPIK','kiem-tra-topik.html','feature-6-thi-topik.webp']]},
 'mrlee-bai-tap-pro.html':{
 id:'workbook',eyebrow:'WORKBOOK · PRACTICE · PROGRESS',title:'BÀI TẬP WORKBOOK',lead:'Thực hành theo cấp độ và từng bài học',description:'Chọn trình độ, bài học và bộ WORKBOOK phù hợp; hệ thống lưu kết quả theo các cơ chế hiện có.',
 image:'learning-books.webp',cta:['Chọn cấp độ và bài học','#workLevel'],secondary:['Học theo bài','hoc-theo-bai.html'],section:'Danh mục luyện tập',hint:'Chọn cấp độ ngay dưới đây để mở 15 bộ bài tập thực tế',
 cards:[['Từ vựng','Ghi nhớ theo ngữ cảnh','#workLevel','learning-cap-1.webp'],['Ngữ pháp','Thực hành cấu trúc câu','#workLevel','learning-hangeul.webp'],['Điền trợ từ','Chọn thành phần phù hợp','#workLevel','learning-cap-2.webp'],['Sắp xếp câu','Hình thành câu tiếng Hàn','#workLevel','step-2-ho-so.webp'],['Đọc hiểu','Luyện phân tích văn bản','#workLevel','learning-cap-5.webp'],['Dịch câu','Việt – Hàn theo từng bài','#workLevel','learning-cap-3.webp'],['Luyện nghe','Nghe và trả lời','#workLevel','learning-listening.webp']],
 tools:[['Xem 15 bộ bài tập','#workListPanel','step-1-tu-van.webp'],['Lộ trình học','hoc-tieng-han.html','learning-roadmap.webp'],['Lịch sử luyện tập','lich-su-hoc-tap.html','feature-6-thi-topik.webp']]},
 'trung-tam-hoc-vien.html':{
 id:'profile',eyebrow:'MY MR LEE · LEARNING JOURNEY',title:'HỒ SƠ HỌC VIÊN',lead:'Theo dõi tiến độ và kết quả học tập',description:'Tài khoản học viên, kết quả luyện tập, nhật ký hoạt động và thứ hạng được hiển thị từ hồ sơ thực của bạn.',
 image:'learning-roadmap.webp',cta:['Xem kết quả của tôi','#statAttempts'],secondary:['Bảng xếp hạng','bang-xep-hang.html'],section:'Hành trình học tập cá nhân',hint:'Đăng nhập để xem số liệu chính xác của chính bạn',
 cards:[['Kết quả luyện tập','Điểm và lịch sử đã lưu','#attemptRows','learning-cap-3.webp'],['Tiến độ học tập','Nhật ký hoạt động','#eventRows','learning-cap-4.webp'],['WORKBOOK','Làm bài tập theo bài','mrlee-bai-tap-pro.html','learning-books.webp'],['Bảng xếp hạng','So sánh điểm động lực','bang-xep-hang.html','feature-6-thi-topik.webp']],
 tools:[['Tiếp tục học','hoc-tieng-han.html','learning-cap-1.webp'],['Luyện TOPIK','kiem-tra-topik.html','learning-cap-5.webp'],['Đăng nhập','dang-nhap.html','feature-5-hoc-tieng-han.webp']]}
};
const cfg=defs[page];if(!cfg)return;
const allowedTarget=s=>s.startsWith('#')?/^#[A-Za-z][\w-]*$/.test(s):/^[a-z0-9-]+\.html(?:\?[^"'<>]*)?$/.test(s);
const make=(tag,cls,txt)=>{const o=d.createElement(tag);if(cls)o.className=cls;if(txt!==undefined)o.textContent=txt;return o};
function link(t,u,c){const a=make('a',c,t);a.href=allowedTarget(u)?u:'index.html';return a}
function sectionTitle(title,hint){const h=make('div','mrlee-v4-section-title');h.append(make('h2','',title),make('small','',hint));return h}
function card([title,hint,url,file],index){
 const a=link('',url,'mrlee-v4-card');a.setAttribute('aria-label',title+' — '+hint);
 const img=make('img');img.src=R+file;img.alt='';img.loading='lazy';img.decoding='async';
 img.width=600;img.height=360;img.addEventListener('error',()=>{img.src='assets/mrlee-next/scenes/'+cfg.id+'.svg';},{once:true});
 const meta=make('span','mrlee-v4-card-copy');const number=make('small','mrlee-v4-card-index',String(index+1).padStart(2,'0'));
 meta.append(number,make('strong','',title),make('small','mrlee-v4-card-caption',hint));a.append(img,meta,make('span','mrlee-v4-card-arrow','→'));return a
}
function doBoot(){
 const main=d.querySelector('main');if(!main||main.querySelector('.mrlee-v4-root'))return;
 const shell=make('div','mrlee-v4-root');shell.dataset.section=cfg.id;const hero=make('section','mrlee-v4-hero');
 const art=make('img','mrlee-v4-hero-photo');art.src=R+cfg.image;art.alt='';art.fetchPriority='high';
 art.decoding='async';art.width=1280;art.height=720;art.addEventListener('error',()=>{art.src='assets/mrlee-next/scenes/'+cfg.id+'.svg'},{once:true});hero.append(art);
 const words=make('div','mrlee-v4-hero-words');words.append(make('small','mrlee-v4-eyebrow',cfg.eyebrow));
 words.append(make('h1','',cfg.title),make('h2','',cfg.lead),make('p','',cfg.description));
 const actions=make('div','mrlee-v4-actions');actions.append(link(cfg.cta[0]+' →',cfg.cta[1],'mrlee-v4-button'),link(cfg.secondary[0]+' ↗',cfg.secondary[1],'mrlee-v4-button mrlee-v4-button-secondary'));words.append(actions);hero.append(words);
 shell.append(hero);
 const directory=make('section','mrlee-v4-directory');directory.append(sectionTitle(cfg.section,cfg.hint));
 const grid=make('nav','mrlee-v4-directory-grid');grid.setAttribute('aria-label','Chuyên mục '+cfg.title);cfg.cards.forEach((c,i)=>grid.append(card(c,i)));directory.append(grid);shell.append(directory);
 const tools=make('nav','mrlee-v4-tools');tools.setAttribute('aria-label','Lối tắt học tập');
 cfg.tools.forEach(([text,url,image])=>{const a=link('',url,'mrlee-v4-tool');const img=make('img');img.src=R+image;img.alt='';img.loading='lazy';img.width=240;img.height=150;a.append(img,make('span','',text),make('span','mrlee-v4-tool-arrow','↗'));tools.append(a)});shell.append(tools);
 // Native forms, maps, grading tools, account dashboards remain below.
 const live=make('div','mrlee-v4-live-intro');live.append(make('strong','','CÔNG CỤ ĐANG HOẠT ĐỘNG'),make('span','','Dữ liệu, bộ lọc và bài tập thật được giữ nguyên bên dưới.'));
 shell.append(live);
 main.prepend(shell);
 html.dataset.mrleeV4=cfg.id;
 if(page==='van-hoa-han-quoc.html'){
  const nativeHero=main.querySelector(':scope > .hero');if(nativeHero)nativeHero.classList.add('mrlee-v4-old-hero');
 } else if(page==='ban-do-dai-hoc-han-quoc.html'){
  const nativeHero=main.querySelector(':scope > .mrlee-next-hero');if(nativeHero)nativeHero.classList.add('mrlee-v4-old-hero');
 } else if(page!=='trung-tam-hoc-vien.html'){
  const nativeHero=main.querySelector(':scope > .section-hero, :scope > .page-hero');
  if(nativeHero)nativeHero.classList.add('mrlee-v4-old-hero');
 }
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',doBoot,{once:true});else doBoot();
})();