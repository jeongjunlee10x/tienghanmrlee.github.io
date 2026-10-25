/* TIẾNG HÀN MR LEE — V2 R2 experience system.
 * Safe progressive enhancement only: no database reads/writes and no score changes.
 * Original branded logo and every native learning form remain intact.
 */
(()=>{'use strict';
const d=document,html=d.documentElement;
const page=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
// Standalone pages do not load the global theme controller; share the same safe AI loader.
const aiLoader=d.createElement('script');aiLoader.defer=true;aiLoader.src='assets/mrlee-ai/v1/loader.js?v=20261025-r3';d.head.append(aiLoader);
if(page==='admin.html')return;
const appPages={
 'index.html':['Một hành trình học tiếng Hàn có định hướng','Từ bảng chữ cái, từ vựng và ngữ pháp đến giao tiếp, TOPIK và du học. Chọn mục tiêu phù hợp, theo dõi hành trình của bạn từng ngày.','Bắt đầu học','hoc-tieng-han.html','Kiểm tra đầu vào','kiem-tra-dau-vao.html','home','6 cấp độ học · Luyện thi TOPIK I/II'],
 'hoc-tieng-han.html':['Học tiếng Hàn từ nền tảng đến nâng cao','Khám phá lộ trình sáu cấp độ, học từ vựng, ngữ pháp, phát âm và luyện tập theo bài. Nội dung học được sắp xếp theo trình độ.','Xem lộ trình 6 cấp','hoc-theo-bai.html','Mở WORKBOOK','mrlee-bai-tap-pro.html','learning','Từ vựng · Ngữ pháp · Nghe · Nói'],
 'hoc-theo-bai.html':['Chọn bài học phù hợp trình độ','Học theo bài, luyện nghe và luyện tập. Kết quả luyện tập chỉ được tính khi hệ thống thực sự ghi nhận bài làm.','Mở WORKBOOK','mrlee-bai-tap-pro.html','Học bảng chữ cái','bang-chu-cai-tieng-han.html','learning','6 cấp độ · Luyện tập có hướng dẫn'],
 'giao-tiep-theo-chu-de.html':['Giao tiếp tiếng Hàn trong đời sống','Luyện phản xạ giao tiếp qua tình huống ăn uống, mua sắm, giao thông, trường học và cuộc sống hằng ngày.','Thực hành hội thoại','hoi-thoai-tap-noi.html','Luyện nói nâng cao','luyen-noi-nang-cao.html','speaking','Hội thoại · Phát âm · Phản xạ'],
 'giao-tiep-phong-van.html':['Tự tin trong buổi phỏng vấn tiếng Hàn','Thực hành tự giới thiệu, mục tiêu học tập, lý do chọn trường và các câu hỏi tình huống.','Bắt đầu phỏng vấn','on-luyen-phong-van.html','Luyện hội thoại','hoi-thoai-tap-noi.html','interview','Tự giới thiệu · Hỏi đáp · Phản xạ'],
 'kiem-tra-topik.html':['Luyện TOPIK I và TOPIK II bài bản','Kiểm tra đầu vào, tìm hiểu dạng đề, luyện nghe–đọc–viết và tự đánh giá tiến bộ. Kết quả thi thử không phải chứng chỉ TOPIK chính thức.','Mở lộ trình TOPIK','lo-trinh-topik.html','Vào phòng luyện đề','topik-v11.html','topik','TOPIK I · TOPIK II · PBT / IBT'],
 'mrlee-bai-tap-pro.html':['15 bộ WORKBOOK cho từng bài học','Rèn luyện từ vựng, ngữ pháp, dịch câu, sắp xếp câu và đọc hiểu. Xem đáp án chỉ để học, không tự động tạo điểm thưởng.','Chọn bài để luyện','hoc-theo-bai.html','Xem lịch sử học','lich-su-hoc-tap.html','workbook','Bài tập hỗn hợp · Tự luyện · Xem lời giải'],
 'van-hoa-han-quoc.html':['Khám phá văn hóa và kỹ năng sống tại Hàn Quốc','Tìm hiểu lễ nghi, đời sống, ẩm thực, lễ hội và tình huống thực tế để chuẩn bị hành trang du học.','Khám phá chủ đề','van-hoa-bai-hoc.html','Xem bản đồ khám phá','ban-do-han-quoc.html','culture','Văn hóa · Đời sống · Kỹ năng'],
 'ban-do-dai-hoc-han-quoc.html':['Khám phá hệ thống trường đại học Hàn Quốc','Tra cứu theo khu vực và tên trường, tìm hiểu thông tin trường và lựa chọn hướng đi. Kiểm tra thông tin tuyển sinh mới nhất trực tiếp với trường.','Tìm kiếm trường','tim-truong.html','Đăng ký tư vấn','dang-ky-tu-van.html','universities','Bản đồ tương tác · Dữ liệu trường'],
 'trung-tam-hoc-vien.html':['Hồ sơ và hành trình học tập của bạn','Xem thông tin cá nhân, lịch sử học tập và thành tích luyện tập. Điểm động lực được phân biệt với điểm đã xác minh.','Lịch sử học tập','lich-su-hoc-tap.html','Mở bảng xếp hạng','bang-xep-hang.html','profile','Tài khoản · Luyện tập · Theo dõi'],
 'bang-xep-hang.html':['Xếp hạng học tập minh bạch','Theo dõi điểm động lực và thứ hạng toàn server. Điểm luyện tập trên trình duyệt không tương đương điểm thi hay phần thưởng đã xác minh.','Quy tắc tính điểm','quy-tac-diem-mrlee.html','Tiếp tục học','hoc-tieng-han.html','admin','Điểm động lực ≠ Điểm đã xác minh'],
 'tuyen-sinh.html':['Lộ trình du học Hàn Quốc cùng MR LEE','Từ tìm trường, chọn chương trình, chuẩn bị hồ sơ đến định hướng trước khi nhập học — các bước được trình bày dễ hiểu.','Đăng ký tư vấn','dang-ky-tu-van.html','Khám phá đại học','ban-do-dai-hoc-han-quoc.html','consultation','Tư vấn định hướng · Chuẩn bị hồ sơ'],
 'dang-ky-tu-van.html':['Bắt đầu kế hoạch học tập và du học','Gửi yêu cầu tư vấn tới MR LEE. Sau khi hệ thống xác nhận, hãy lưu mã phiếu để thuận tiện đối chiếu.','Đi tới biểu mẫu','#mrleeConsultForm','Xem lộ trình học','hoc-tieng-han.html','consultation','Chỉ báo thành công khi hệ thống cấp mã phiếu']
};
function kind(){
 if(/van-hoa|ban-do-han-quoc/.test(page))return 'culture';
 if(/ban-do|tim-truong|hoc-bong/.test(page))return 'universities';
 if(/giao-tiep|hoi-thoai|luyen-noi/.test(page))return 'speaking';
 if(/phong-van/.test(page))return 'interview';
 if(/topik|kiem-tra|luyen-de/.test(page))return 'topik';
 if(/workbook|bai-tap/.test(page))return 'workbook';
 if(/hoc-vien|lich-su|xep-hang/.test(page))return 'profile';
 return 'learning';
}
const safeRoute=s=>/^([a-z0-9-]+\.html(?:\?[^<>"']*)?|#[A-Za-z][\w-]*)$/.test(s);
const create=(tag,cls,txt)=>{const e=d.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const link=(text,url,cls)=>{const a=create('a',cls,text);a.href=safeRoute(url)?url:'index.html';return a};
function ensureNav(){
 if(d.querySelector('.mrlee-v2-primary-nav'))return;
 const defs=[['Học tiếng Hàn','hoc-tieng-han.html'],['Giao tiếp','giao-tiep-theo-chu-de.html'],['TOPIK','kiem-tra-topik.html'],['Phỏng vấn','giao-tiep-phong-van.html'],['Văn hóa','van-hoa-han-quoc.html'],['Bản đồ các trường ĐH Hàn Quốc','ban-do-dai-hoc-han-quoc.html']];
 const nav=create('nav','mrlee-v2-primary-nav');nav.setAttribute('aria-label','Sáu chuyên mục TIẾNG HÀN MR LEE');
 nav.append(create('span','mrlee-v2-nav-label','KHÁM PHÁ MR LEE'));
 const ul=create('ul','mrlee-v2-nav-list');defs.forEach(([text,url],i)=>{const li=create('li');const a=link(text,url);a.prepend(create('small','',String(i+1).padStart(2,'0')));if(page===url)a.setAttribute('aria-current','page');li.append(a);ul.append(li)});nav.append(ul);
 const control=d.querySelector('.mrlee-theme-switch');if(control?.parentElement)control.after(nav);else d.querySelector('main')?.before(nav);
}
function context(){
 if(d.querySelector('.mrlee-v2-context'))return;
 const data=appPages[page]||['Học và khám phá cùng TIẾNG HÀN MR LEE','Chọn đúng nội dung để tiếp tục hành trình học, luyện tập và định hướng du học.','Quay lại học tiếng Hàn','hoc-tieng-han.html','Khám phá TOPIK','kiem-tra-topik.html',kind(),'Lộ trình rõ ràng · Nội dung thực tế'];
 const [title,desc,cta,url,cta2,url2,scene,tag]=data;
 const block=create('section','mrlee-v2-context');block.dataset.page=scene;block.setAttribute('aria-label','Định hướng nội dung '+page);
 block.style.setProperty('--mrlee-v2-context-art','url("assets/mrlee-next/scenes/'+scene+'.svg")');
 const copy=create('div','mrlee-v2-context-copy');copy.append(create('small','mrlee-v2-eyebrow','TIẾNG HÀN MR LEE · HÀNH TRÌNH CỦA BẠN'));
 copy.append(create('h2','',title),create('p','',desc));
 const actions=create('div','mrlee-v2-context-actions');actions.append(link(cta+' →',url),link(cta2+' ↗',url2,'secondary'));copy.append(actions);
 const side=create('aside','mrlee-v2-context-side');side.append(create('strong','',tag),create('span','',''));
 side.lastElementChild.textContent='Học tập theo mục tiêu của bạn. Chọn chuyên mục để mở chức năng thật của website.';
 side.append(link('Liên hệ bộ phận tư vấn ↗','dang-ky-tu-van.html'));block.append(copy,side);
 const main=d.querySelector('main');
 const hero=main?.querySelector('.hero,.section-hero,.page-hero,.v10-hero,.pro-header');
 if(hero&&hero.parentNode)hero.after(block);else if(main)main.prepend(block);else d.body.append(block);
}
function footer(){
 if(d.querySelector('.mrlee-v2-site-footer'))return;
 const ft=create('footer','mrlee-v2-site-footer');ft.append(create('strong','','TIẾNG HÀN MR LEE'));
 ft.append(create('p','','Học tiếng Hàn · Luyện thi TOPIK · Định hướng du học Hàn Quốc. Nội dung học và dữ liệu cá nhân tuân theo phân quyền hệ thống.'));
 const nav=create('nav','mrlee-v2-footer-links');nav.setAttribute('aria-label','Liên kết cuối trang');
 [['Trang chủ','index.html'],['Học tiếng Hàn','hoc-tieng-han.html'],['TOPIK','kiem-tra-topik.html'],['Bản đồ đại học','ban-do-dai-hoc-han-quoc.html'],['Bảng xếp hạng','bang-xep-hang.html'],['Đăng ký tư vấn','dang-ky-tu-van.html']].forEach(([t,u])=>nav.append(link(t,u)));ft.append(nav);
 const native=d.querySelector('footer:not(.mrlee-v2-site-footer)');if(native)native.before(ft);else d.body.append(ft);
}
function backtotop(){
 if(d.querySelector('.mrlee-v2-backtotop'))return;
 const b=create('button','mrlee-v2-backtotop','↑');b.type='button';b.setAttribute('aria-label','Về đầu trang');b.dataset.visible='false';d.body.append(b);
 const show=()=>{b.dataset.visible=String(window.scrollY>600)};window.addEventListener('scroll',show,{passive:true});show();
 b.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
}
function boot(){ensureNav();context();footer();backtotop()}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();