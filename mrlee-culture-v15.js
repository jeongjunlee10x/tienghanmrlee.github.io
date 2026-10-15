/* MR LEE V15: only AI topic galleries; no changes to existing site data. */
(function(){'use strict';
 const galleries=window.MRLEE_CULTURE_V15_AI||{};
 const $=(s,root=document)=>root.querySelector(s);
 const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function lightbox(img,title){
  let layer=document.createElement('div');layer.className='mrAiLightbox';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Xem hình minh họa AI');
  let close=document.createElement('button');close.type='button';close.textContent='✕ Đóng ảnh';
  let picture=document.createElement('img');picture.src=img;picture.alt=title;
  let caption=document.createElement('p');caption.textContent=title+' — ảnh do AI tạo, chỉ mang tính minh họa';
  let dismissed=false;
  function exit(){if(dismissed)return;dismissed=true;document.removeEventListener('keydown',onKey);layer.remove();document.body.classList.remove('mrAiModalOpen');}
  function onKey(e){if(e.key==='Escape')exit()}
  close.addEventListener('click',exit);layer.addEventListener('click',e=>{if(e.target===layer)exit()});document.addEventListener('keydown',onKey);
  layer.append(close,picture,caption);document.body.append(layer);document.body.classList.add('mrAiModalOpen');close.focus();
 }
 function lesson(){
  const body=$('#lessonContent');if(!body)return;
  const slug=new URLSearchParams(location.search).get('chu-de')||'le-hoi';
  const images=galleries[slug];if(!Array.isArray(images)||!images.length)return;
  const old=$('#mrleeAiPhotos');if(old)old.remove();
  // Replace historical photo gallery for upgraded topics only.
  const legacy=$('#realPhotos');if(legacy)legacy.remove();
  const svgSection=$('#image');if(svgSection)svgSection.style.display='none';
  const section=document.createElement('section');section.id='mrleeAiPhotos';section.className='lessonBlock mrleeAiSection';
  section.innerHTML='<div class="mrAiHeader"><h2>🖼️ Học văn hóa qua hình ảnh AI</h2><span class="mrAiBadge">ẢNH MINH HỌA AI</span></div><p class="mrAiIntro">Mỗi hình thể hiện một tình huống cụ thể. Đọc phần giải thích ngay bên dưới để hiểu ý nghĩa văn hóa và cách áp dụng vào đời sống.</p>';
  let grid=document.createElement('div');grid.className='mrAiGrid';
  images.forEach((item,i)=>{
   const figure=document.createElement('figure');figure.className='mrAiCard'+(/six-cards|food-reference/.test(item.file)?' wide':'');
   const im=document.createElement('img');im.src=item.file;im.alt='Ảnh AI minh họa: '+item.title;im.loading='lazy';im.decoding='async';
   im.addEventListener('click',()=>lightbox(item.file,item.title));
   const cap=document.createElement('figcaption');cap.innerHTML='<div class="mrAiNumber">HÌNH '+String(i+1).padStart(2,'0')+'</div><h3>'+esc(item.title)+'</h3><p>'+esc(item.caption)+'</p>';
   figure.append(im,cap);grid.appendChild(figure);
  });
  section.appendChild(grid);
  const notice=document.createElement('p');notice.className='mrAiNotice';notice.textContent='Lưu ý: Hình được tạo bằng AI, không phải ảnh chụp thật hoặc tài liệu chứng minh một sự kiện. Nội dung về phong tục được diễn giải để học tập; cách ứng xử thực tế có thể khác theo vùng miền, gia đình và hoàn cảnh.';
  section.appendChild(notice);
  const before=$('#how')||$('#image');if(before)body.insertBefore(section,before);else body.prepend(section);
  const quick=document.querySelector('.sidePanel a[href="#realPhotos"],.sidePanel a[href="#image"]');
  if(quick){quick.href='#mrleeAiPhotos';quick.textContent='Hình AI và giải thích';}
  const hero=$('#topicHero img');if(hero){hero.src=images[0].file;hero.alt='Ảnh AI minh họa '+images[0].title;hero.onerror=()=>{hero.style.display='none'};}
 }
 function hub(){
  const box=$('#topics');if(!box)return;
  function update(){
   box.querySelectorAll('a.topic').forEach(a=>{
    const href=a.getAttribute('href')||'';
    const slug=new URL(href,document.baseURI).searchParams.get('chu-de');
    const images=galleries[slug];const img=$('img',a);
    if(img&&images&&images.length&&img.dataset.mrleeV15Ai!=='1'){
     img.dataset.mrleeV15Ai='1';img.src=images[0].file;img.alt='Ảnh AI minh họa '+images[0].title;
     img.onerror=()=>{img.style.display='none'};
    }
   });
  }
  const obs=new MutationObserver(update);obs.observe(box,{childList:true});update();
 }
 document.addEventListener('DOMContentLoaded',()=>{lesson();hub()});
})();
