/* MR LEE V24: progressive, content-only enhancement. No accounts, storage, API, audio or scoring logic. */
(()=>{'use strict';
 const html=document.documentElement,kind=html.getAttribute('data-mrlee-v24');
 if(!kind)return;
 const ready=()=>{
  if(kind==='ranking'&&!document.querySelector('[data-v24-ranking-intro]')){
   const main=document.getElementById('mrlee-public-ranking');
   if(!main)return;
   const intro=document.createElement('section');intro.className='v24-ranking-intro';intro.dataset.v24RankingIntro='1';intro.setAttribute('aria-label','Giới thiệu bảng xếp hạng');
   const eyebrow=document.createElement('small');eyebrow.textContent='MR LEE · GLOBAL LEADERBOARD';
   const title=document.createElement('h2');title.textContent='Nỗ lực mỗi ngày, thành tích mỗi bước';
   const note=document.createElement('p');note.textContent='Bảng xếp hạng bên dưới hiển thị học viên và điểm thật từ hệ thống hiện có khi có quyền truy cập. Không dùng dữ liệu minh họa.';
   intro.append(eyebrow,title,note);main.before(intro);
  }
  if(kind==='topik-pro'&&!document.querySelector('[data-v24-pro-nav]')){
   const header=document.querySelector('.pro-header');if(!header)return;
   const links=[['Lộ trình TOPIK','lo-trinh-topik.html'],['Phòng luyện đề','topik-luyen-de.html'],['Kiểm tra âm thanh','topik-kiem-tra-am-thanh.html']];
   const bar=document.createElement('nav');bar.className='v24-pro-shortcuts';bar.dataset.v24ProNav='1';bar.setAttribute('aria-label','Các chức năng TOPIK khác');
   for(const [label,href] of links){const a=document.createElement('a');a.href=href;a.textContent=label+' ↗';bar.append(a);}
   header.insertAdjacentElement('afterend',bar);
  }
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
