/* V30 manual acceptance checklist: no auth, Firebase or personal data access. */
(()=>{'use strict';
const groups=[
 {name:'MAIN & logo',intro:'Quan sát trên máy tính và điện thoại',items:[
  ['logo','Logo MR LEE duy nhất, rõ nét, không bị méo hoặc đổi màu','index.html'],
  ['links','Menu MAIN tới Học / Thi / TOPIK / Bản đồ đúng trang','index.html'],
  ['visual','Banner, 8 thẻ ảnh, lộ trình 5 bước và BXH ngang hiển thị đúng','index.html'],
  ['form','Phiếu tư vấn đủ trường bắt buộc, kiểm tra lỗi nhập thiếu','index.html'],
  ['messenger','Messenger mở Fanpage MRLEEKR10; phiếu cần do học viên tự gửi','index.html']
 ]},
 {name:'Học tập & âm thanh',intro:'Kiểm thử bài thật, không dùng dữ liệu minh họa',items:[
  ['course','Đi vào 6 cấp học và điều hướng Bài trước/Bài tiếp','hoc-tieng-han.html'],
  ['vocab','Từ vựng Hangeul, nghĩa và ví dụ hiển thị chính xác','so-cap-1.html'],
  ['audio','MP3 phát có tiếng, Pause/Play hoạt động, không tự bỏ qua bài','nghe-toan-bo.html'],
  ['media','Nghe và transcript chỉ hiển thị khi nội dung cho phép','topik-nghe-24-cau.html'],
  ['chat','Nút giao tiếp / ghi âm hoạt động theo quyền truy cập','giao-tiep-theo-chu-de.html'],
  ['reading','Các trang đọc/viết không bị tràn chữ và bảo toàn đề','topik-viet-51-54.html']
 ]},
 {name:'TOPIK & điểm số',intro:'Không thao tác trên bài thi có điểm thật nếu chưa được phép',items:[
  ['topik-load','TOPIK vào đúng đề, câu hỏi và đáp án không bị lệch','mrlee-topik-pro.html'],
  ['timer','Bộ đếm giờ và giới hạn nghe tuân thủ luật bài thi','thi-topik-online.html'],
  ['submit','Nộp bài, xác nhận, chấm điểm và xem kết quả đúng','kiem-tra-online.html'],
  ['history','Kết quả và lịch sử học tập giữ nguyên sau cập nhật','lich-su-hoc-tap.html'],
  ['rank','BXH hiển thị tên và điểm thật, đúng quyền công khai','bang-xep-hang.html']
 ]},
 {name:'Bản đồ & du học',intro:'Đối chiếu địa điểm trường với nguồn xác minh',items:[
  ['map','Bản đồ SVG 17 vùng hiển thị, hover/tap tỉnh hoạt động','ban-do-dai-hoc-han-quoc.html'],
  ['school','Tìm Hàn/Anh/Việt, hiển thị đúng trường và campus','ban-do-dai-hoc-han-quoc.html'],
  ['maps-link','Ghim trường đã xác minh, Google Maps đúng vị trí','ban-do-dai-hoc-han-quoc.html'],
  ['step1','Bước 1 tư vấn mở trang con có checklist','du-hoc-buoc-1-tu-van-dinh-huong.html'],
  ['step2','Bước 2 hồ sơ mở trang con có checklist','du-hoc-buoc-2-chuan-bi-ho-so.html'],
  ['step3','Bước 3 visa có lưu ý điều kiện thay đổi','du-hoc-buoc-3-nop-ho-so-visa.html'],
  ['step4','Bước 4 xuất cảnh/nhập học có thông tin cần thiết','du-hoc-buoc-4-xuat-canh-nhap-hoc.html'],
  ['step5','Bước 5 hỗ trợ sau nhập học rõ trách nhiệm','du-hoc-buoc-5-ho-tro-sau-nhap-hoc.html']
 ]},
 {name:'Tài khoản, AI & responsive',intro:'Chỉ dùng tài khoản hợp pháp được cấp quyền',items:[
  ['auth','Đăng nhập, đăng xuất và phân quyền giữ nguyên','dang-nhap.html'],
  ['student','Hồ sơ học viên không lộ thông tin người khác','trung-tam-hoc-vien.html'],
  ['admin','Trang quản trị không mở được với tài khoản không đủ quyền','admin.html'],
  ['ai','AI hỗ trợ có phản hồi thật, báo lỗi đúng khi mất mạng','ai-tro-ly.html'],
  ['mobile','Mobile 375px: menu, form, thẻ và bảng không bị tràn','index.html'],
  ['keyboard','Dùng phím Tab và Enter, thấy rõ vị trí focus','hoc-tieng-han.html']
 ]}
];
const $=x=>document.getElementById(x),statuses=Object.create(null),all=[],groot=$('groups');let onlyFailures=false;
function update(){let tested=0,passed=0,failed=0;for(const v of Object.values(statuses)){if(v!=='skip'){tested++;if(v==='ok')passed++;if(v==='fail')failed++;}}
 $('tested').textContent=tested;$('passed').textContent=passed;$('failed').textContent=failed;
 for(const x of all){x.row.hidden=onlyFailures&&statuses[x.id]!=='fail';}
}
for(const g of groups){const s=document.createElement('section');s.className='group';const h=document.createElement('h2');h.textContent=g.name;const p=document.createElement('p');p.textContent=g.intro;s.append(h,p);
 for(const [id,title,url] of g.items){const d=document.createElement('div');d.className='check';const col=document.createElement('div');const b=document.createElement('strong');b.textContent=title;const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Mở trang để thử ↗';col.append(b,link);const choice=document.createElement('div');choice.className='choice';choice.setAttribute('role','group');choice.setAttribute('aria-label',title);
 for(const [val,label] of [['ok','Đạt'],['fail','Lỗi'],['skip','Chưa thử']]){const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.choice=val;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{statuses[id]=val;for(const t of choice.querySelectorAll('button'))t.setAttribute('aria-pressed',String(t===button));update();});choice.append(button);}
 d.append(col,choice);s.append(d);all.push({id,title,url,row:d});
 }
 groot.append(s);
}
$('save').addEventListener('click',()=>{const report={version:'V30_COMBINED_MANUAL_QA',date:new Date().toISOString(),origin:location.origin,scope:'Manual user choices only; NOT an automated functional verdict',summary:{total:all.length,passed:0,failed:0,not_tested:0},cases:all.map(x=>({id:x.id,description:x.title,url:x.url,result:statuses[x.id]||'skip'}))};for(const c of report.cases){if(c.result==='ok')report.summary.passed++;else if(c.result==='fail')report.summary.failed++;else report.summary.not_tested++;}const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='MRLEE_V30_NGHIEM_THU_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);});
$('reset').addEventListener('click',()=>{if(!confirm('Đặt lại tất cả lựa chọn kiểm thử?'))return;for(const x of all){delete statuses[x.id];for(const b of x.row.querySelectorAll('button'))b.setAttribute('aria-pressed','false');}onlyFailures=false;$('showFailures').textContent='Chỉ xem lỗi';update();});
$('showFailures').addEventListener('click',()=>{onlyFailures=!onlyFailures;$('showFailures').textContent=onlyFailures?'Xem tất cả':'Chỉ xem lỗi';update();});update();
})();
