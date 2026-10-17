/* V25: Optional navigation of real pages; intentionally never reads scores, auth, MP3 or form values. */
(()=>{'use strict';
const kind=document.documentElement.dataset.mrleeV25;
const groups={
 conversation:[['Luyện theo chủ đề','giao-tiep-theo-chu-de.html'],['Hội thoại tương tác','hoi-thoai-tap-noi.html'],['Ôn phỏng vấn','on-luyen-phong-van.html'],['Giao tiếp phỏng vấn','giao-tiep-phong-van.html'],['Nói nâng cao','luyen-noi-nang-cao.html']],
 'culture-story':[['Khám phá văn hóa','van-hoa-han-quoc.html'],['Học bảng chữ cái','bang-chu-cai-tieng-han.html'],['Giao tiếp chủ đề','giao-tiep-theo-chu-de.html']],
 'topik-library':[['Bộ đề TOPIK','de-thi-topik.html'],['TOPIK I','topik-i-lo-trinh.html'],['TOPIK II','topik-ii-lo-trinh.html'],['Học mỗi ngày','topik-hoc-moi-ngay.html'],['Luyện viết 51–54','topik-viet-51-54.html']],
 'topik-listening':[['Nghe TOPIK 24 câu','topik-nghe-24-cau.html'],['Kiểm âm TOPIK','topik-nghe-124-cau.html'],['Bộ đề TOPIK','de-thi-topik.html']],
 hangeul:[['Bảng chữ cái','bang-chu-cai-tieng-han.html'],['Học tiếng Hàn','hoc-tieng-han.html'],['Giao tiếp chủ đề','giao-tiep-theo-chu-de.html']]
};
function init(){
 if(!groups[kind]||document.querySelector('[data-v25-route-tray]'))return;
 const main=document.querySelector('main');if(!main)return;
 const tray=document.createElement('nav');tray.className='v25-route-tray';tray.dataset.v25RouteTray='1';tray.setAttribute('aria-label','Đi tới các nội dung liên quan');
 const title=document.createElement('strong');title.textContent='KHÁM PHÁ THÊM';tray.append(title);
 const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 for(const [label,href] of groups[kind]){const link=document.createElement('a');link.href=href;link.textContent=label+' ↗';if(current===href.toLowerCase())link.setAttribute('aria-current','page');tray.append(link)}
 // Place alongside the content, not inside test question content or restricted admin UI.
 main.insertAdjacentElement('beforebegin',tray);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
