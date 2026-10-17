/* MR LEE V23 | Non-intrusive visual gallery. No API, network, storage, tracking or app logic. */
(()=>{'use strict';
 const html=document.documentElement;
 const kind=html.getAttribute('data-mrlee-v23')||'other';
 if(!['learning','culture'].includes(kind))return;
 const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 const hubs={
  'hoc-tieng-han.html': [
    ['Bắt đầu từ Hangeul','Bảng chữ cái & ghép âm','bang-chu-cai-tieng-han.html','korean-learning.webp'],
    ['Lộ trình 6 cấp','Học từ sơ cấp đến cao cấp','lo-trinh-1-6.html','korean-campus.webp'],
    ['Luyện nghe tiếng Hàn','Thư viện nghe theo chủ đề','nghe-toan-bo.html','korean-life.webp'],
    ['Luyện thi TOPIK','Chinh phục mục tiêu học tập','kiem-tra-topik.html','korean-graduate.webp']
  ],
  'bo-sach.html':[
    ['Giáo trình tiếng Hàn','Khám phá các nội dung đang có','hoc-tieng-han.html','korean-learning.webp'],
    ['Sơ cấp 1','Học bài và luyện tập','so-cap-1.html','korean-campus.webp'],
    ['Sơ cấp 2','Học bài và luyện tập','so-cap-2.html','korean-paperwork.webp'],
    ['Luyện nghe','Phát âm và hội thoại','nghe-toan-bo.html','korean-life.webp']
  ],
  'van-hoa-han-quoc.html':[
    ['Khám phá Hàn Quốc','Tìm hiểu văn hóa và đời sống','van-hoa-bai-hoc.html','korean-culture.webp'],
    ['Luyện giao tiếp','Các tình huống hàng ngày','giao-tiep-theo-chu-de.html','korean-life.webp'],
    ['Học tiếng Hàn','Theo bài, theo trình độ','hoc-tieng-han.html','korean-learning.webp'],
    ['Du học Hàn Quốc','Lộ trình 5 bước cùng MR LEE','tuyen-sinh.html','korean-campus.webp']
  ],
  'kiem-tra-topik.html':[
    ['Lộ trình TOPIK','Học theo mục tiêu','lo-trinh-topik.html','korean-learning.webp'],
    ['Luyện đề TOPIK','Luyện tập qua đề thi','topik-luyen-de.html','korean-paperwork.webp'],
    ['Học tiếng Hàn','Ôn nền tảng','hoc-tieng-han.html','korean-campus.webp'],
    ['Kiểm tra đầu vào','Đánh giá trình độ','kiem-tra-dau-vao.html','korean-graduate.webp']
  ]
 };
 const items=hubs[page];if(!items)return;
 function enhance(){
  if(document.querySelector('[data-v23-gallery]'))return;
  const main=document.querySelector('main');if(!main)return;
  const section=document.createElement('nav');section.className='v23-editorial';section.setAttribute('aria-label','Khám phá chuyên mục MR LEE');section.dataset.v23Gallery='1';
  const pathPrefix=new URL('assets/v23/images/',document.baseURI).href;
  for(const [title,subtitle,href,imageFile] of items){
   const a=document.createElement('a');a.href=href;
   const img=document.createElement('img');img.src=pathPrefix+imageFile;img.alt='';img.loading='lazy';img.decoding='async';img.width=480;img.height=270;
   const cap=document.createElement('span');cap.className='v23-text';
   const strong=document.createElement('strong');strong.textContent=title;const small=document.createElement('small');small.textContent=subtitle;
   cap.append(strong,small);
   const arrow=document.createElement('span');arrow.className='v23-chevron';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
   a.append(img,cap,arrow);section.appendChild(a);
  }
  const anchor=main.querySelector('.section-hero');if(anchor&&anchor.parentElement===main)anchor.insertAdjacentElement('afterend',section);
  else main.prepend(section);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
