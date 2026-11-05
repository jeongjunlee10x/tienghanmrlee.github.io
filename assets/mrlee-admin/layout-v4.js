/* Admin V4: reorder existing nav nodes, keep every listener and RLS gate. */
(()=>{'use strict';
const titles={
overview:['Tổng quan','Tình hình học viên, kết quả và tác vụ cần xử lý'],
students:['Học viên','Danh sách, trạng thái và cập nhật hồ sơ'],
scores:['Kết quả học tập','Tra cứu điểm và nhận xét'],
'all-attempts':['Bài làm toàn hệ thống','Xem bài nộp và nhận xét giáo viên'],
activity:['Hoạt động học tập','Lịch sử truy cập và luyện tập'],
placements:['Kiểm tra đầu vào','Bài làm 50 câu, đánh giá và xếp lớp'],
consultations:['Yêu cầu tư vấn','Theo dõi và xử lý phiếu đăng ký'],
rewards:['Phiếu thưởng','Đối soát và trạng thái nhận thưởng'],
settings:['Hệ thống','Đồng bộ, cấu hình và xuất nhập dữ liệu']
};
const order=[
['Tổng quan',['overview']],
['Học viên & học tập',['students','scores','all-attempts','activity']],
['Tuyển sinh & tiếp nhận',['placements','consultations']],
['Vận hành hệ thống',['rewards','settings']]
];
function ready(){
 const app=document.getElementById('app');
 const menu=app?.querySelector('.side-menu'),heading=document.getElementById('pageTitle'),desc=document.getElementById('pageSubtitle');
 if(!menu||!heading||!desc)return;
 const buttons=[...menu.querySelectorAll('button[data-nav]')];
 const byKey=new Map(buttons.map(b=>[b.dataset.nav,b])),seen=new Set(),groups=[];
 for(const [label,keys] of order){
   const box=document.createElement('div');box.className='admin-nav-group';box.setAttribute('role','group');box.setAttribute('aria-label',label);
   const cap=document.createElement('span');cap.className='admin-nav-label';cap.textContent=label;box.append(cap);
   for(const key of keys){const button=byKey.get(key);if(button){box.append(button);seen.add(button)}}
   groups.push(box);
 }
 const extra=buttons.filter(b=>!seen.has(b));
 if(extra.length){
   const box=document.createElement('div');box.className='admin-nav-group';box.setAttribute('role','group');box.setAttribute('aria-label','Khác');
   const cap=document.createElement('span');cap.className='admin-nav-label';cap.textContent='Chức năng khác';box.append(cap,...extra);groups.push(box);
 }
 menu.replaceChildren(...groups);
 const sync=()=>{
   const page=Object.keys(titles).find(k=>{const el=document.getElementById('page-'+k);return el&&!el.hidden})||'overview';
   heading.textContent=titles[page][0];desc.textContent=titles[page][1];
   menu.querySelectorAll('button[data-nav]').forEach(b=>{
     const active=b.dataset.nav===page;b.classList.toggle('active',active);
     if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
   });
 };
 menu.addEventListener('click',()=>queueMicrotask(sync));
 const main=app.querySelector('.main-pad');
 if(main)new MutationObserver(sync).observe(main,{attributes:true,subtree:true,attributeFilter:['hidden']});
 sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
