/* MR LEE CULTURE V17.2 — locally generated, per-topic AI image gallery.
 * Non-destructive visual patch; never changes educational data, scores, videos or auth.
 * Five new AI variants + original topic SVG (backup), for each of 22 topics.
 * Generated illustrations must not be mistaken for real photos or safety instructions.
 */
(()=>{'use strict';
 const data=window.MRLEE_CULTURE_V17_MEDIA||{};
 const topicNames=Object.keys(data);
 if(topicNames.length!==22){console.warn('[MRLEE V17.2] Data mismatch: expected 22 topics');return;}
 const one=(s,p=document)=>p.querySelector(s);
 const mk=(tag,cl,t)=>{const e=document.createElement(tag);if(cl)e.className=cl;if(t!==undefined)e.textContent=String(t);return e;};
 const params=new URLSearchParams(location.search);
 const current=params.get('chu-de')||topicNames[0];
 const ai=(id,k)=>`images/culture-v18-hd/${encodeURIComponent(id)}/${String(k).padStart(2,'0')}.webp?v=172`;
 const svg=id=>`images/culture-v13/${encodeURIComponent(id)}.svg?v=171`;
 const safety=new Set(['so-cap-cuu','goi-cuu-ho','hoa-hoan','benh-vien','an-toan-giao-thong']);
 function photo(id,k,hero=false){
  const img=mk('img');img.src=ai(id,k);img.loading='eager';img.decoding='async';
  img.alt=`Ảnh minh họa AI ${k}/5: ${data[id].title}`;
  img.addEventListener('error',function(){
   if(img.dataset.fallback==='1')return;
   img.dataset.fallback='1';img.src=svg(id);img.alt=`Hình dự phòng: ${data[id].title}`;
  });
  return img;
 }
 function topicId(card){try{return new URL(card.href,document.baseURI).searchParams.get('chu-de')}catch{return null}}
 function refreshHub(){
  const heading=one('#topicSection .sectionHeading');
  if(heading){
   const h=one('h2',heading),p=one('p',heading);
   if(h && /ảnh chụp thực tế/i.test(h.textContent))h.textContent='Khám phá văn hóa qua ảnh minh họa AI';
   if(p && /ảnh chụp thực tế|3 ảnh/i.test(p.textContent))p.textContent='Mỗi bài có 5 ảnh AI minh họa chuyên biệt và 1 đồ họa SVG. Ảnh không phải ảnh chụp thực tế.';
  }
  const grid=one('#topics');if(!grid)return;
  grid.querySelectorAll('a.topic').forEach(card=>{
   const id=topicId(card);if(!data[id])return;
   let img=one('img',card);if(!img)return;
   // Older V17.1 may re-select the SVG, but we install last in the script chain.
   if(img.dataset.mr172Topic!==id){
    img.dataset.mr172Topic=id;
    img.src=ai(id,1);img.alt=`Ảnh minh họa AI: ${data[id].title}`;
   }
   if(!one('.mr172AiTag',card)){
    const tag=mk('span','mr172AiTag','Ảnh minh họa AI');
    const where=one('.topicText',card)||card;
    where.append(tag);
   }
  });
 }
 function buildGallery(id){
  const t=data[id];const section=mk('section','lessonBlock mr17Block mr172Block');section.id='cultureImagesV172';
  section.append(mk('h2','','II. Ảnh minh họa theo chủ đề'));
  section.append(mk('p','mr172Lead','Bộ ảnh AI được tạo riêng cho nội dung bài này: 5 hình minh họa và 1 ảnh bìa SVG. Các biến thể minh họa có thể mô tả những cảnh tương tự, không phải ảnh chụp sự kiện thực.'));
  const gallery=mk('div','mr172Grid');
  for(let k=1;k<=6;k++){
   const fig=mk('figure','mr172Card');const img=(k===6?mk('img'):photo(id,k));
   if(k===6){img.src=svg(id);img.alt=`Đồ họa biểu tượng: ${t.title}`;img.loading='eager';}
   const cap=mk('figcaption');
   cap.append(mk('strong','', k===6?'Đồ họa của chủ đề':`Minh họa AI ${k}/5`));
   cap.append(mk('span','',t.title));
   if(t.ko)cap.append(mk('small','',t.ko));
   fig.append(img,cap);gallery.append(fig);
  }
  section.append(gallery);
  section.append(mk('p','mr172Note',safety.has(id)?'Lưu ý: Hình AI chỉ hỗ trợ nhận biết tình huống; không thay thế quy trình hướng dẫn từ cơ quan chuyên môn.':'Nguồn hình: ảnh minh họa do AI tạo cho TIẾNG HÀN MR LEE; không phải ảnh tư liệu hay ảnh chụp thực tế.'));
  return section;
 }
 function lesson(){
  const box=one('#lessonContent');if(!box||!data[current])return;
  const old=one('#cultureImagesV17');
  // Keep original gallery node in DOM for legacy scripts, but avoid duplicate pictures.
  if(old)old.hidden=true;
  const older=one('#cultureImagesV16');if(older)older.hidden=true;
  if(!one('#cultureImagesV172')){
   const next=buildGallery(current);
   if(old&&old.parentElement)old.insertAdjacentElement('beforebegin',next);
   else box.insertBefore(next,one('#read')||one('#how')||box.firstElementChild);
  }
  const hero=one('#topicHero img');
  if(hero && hero.dataset.mr172Topic!==current){hero.dataset.mr172Topic=current;hero.src=ai(current,1);hero.alt=`Minh họa AI cho bài ${data[current].title}`;}
  document.querySelectorAll('.sidePanel a[href="#cultureImagesV17"],.sidePanel a[href="#cultureImagesV16"],.sidePanel a[href="#image"]').forEach(a=>{
   a.href='#cultureImagesV172';a.textContent='Thư viện ảnh minh họa';
  });
 }
 function init(){refreshHub();lesson();
  const grid=one('#topics');
  if(grid&&window.MutationObserver){
   new MutationObserver(()=>refreshHub()).observe(grid,{childList:true});
  }
  console.info('[MRLEE CULTURE V17.2] 22 topics, five generated AI photos + original SVG per topic.');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
