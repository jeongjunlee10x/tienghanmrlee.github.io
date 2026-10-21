/* MR LEE CULTURE V17 — rigorous media gate.
   Runs after V16 and preserves the original learning content and scores.
   Never downloads, reposts or silently embeds third-party videos.
*/
(()=>{'use strict';
 const registry=window.MRLEE_CULTURE_V17_MEDIA;
 if(!registry || typeof registry!=='object')return;
 const qs=(s,n=document)=>n.querySelector(s);
 const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e;};
 const full=(path)=>new URL(path,document.baseURI).href;
 const slug=()=>new URL(location.href).searchParams.get('chu-de')||Object.keys(registry)[0];
 const mark=(title,body)=>{const div=mk('div','mr17Info');div.append(mk('strong','',title),mk('span','',body));return div;};
 function buildImage(card,item,index){
  const figure=mk('figure','mr17Image '+(item.display?'mr17Ready':'mr17Pending'));
  if(item.display && item.path){
   const img=mk('img');img.src=item.path;img.alt=item.title;img.loading='lazy';img.decoding='async';
   img.addEventListener('error',()=>{img.remove();figure.prepend(mk('div','mr17Missing','Ảnh tạm không tải được'))},{once:true});
   figure.append(img);
  } else {figure.append(mk('div','mr17Missing',item.kind==='missing'?'Đang tìm ảnh đúng chủ đề':'Chờ xác minh quyền ảnh'))}
  const cap=mk('figcaption');cap.append(mk('span','mr17Number','Ảnh '+index+' / 6'),mk('strong','',item.title),mk('small','',item.captionVi||'Chưa có chú thích'));
  if(item.display && item.captionKo)cap.append(mk('span','mr17Korean',item.captionKo));
  figure.append(cap);return figure;
 }
 function buildVideo(t){
  const s=mk('section','lessonBlock mr17Block mr17Video');s.id='cultureVideoV17';
  s.append(mk('h2','','V. Video đúng chủ đề'));
  const video=t.video;
  if(!video){s.append(mark('Video đang được tuyển chọn','Chưa có nguồn đạt đủ 85 điểm và điều kiện quyền sử dụng. Không phát video du lịch hoặc video không liên quan để lấp chỗ trống.'));return s;}
  const v=mk('div','mr17VideoCard');
  v.append(mk('span','mr17Label','Đã kiểm tra nội dung nguồn • '+video.score+'/100'),mk('h3','',video.title),mk('p','',video.description));
  const a=mk('a','mr17Watch','▶ Xem video trên trang nguồn ↗');a.href=video.url;a.target='_blank';a.rel='noopener noreferrer';
  const source=mk('p','mr17Source','Nguồn: '+video.owner+' · '+video.license);
  v.append(a,source);s.append(v);
  s.append(mark('Quyền sử dụng','Chỉ mở liên kết gốc. Chưa sao chép, tự lưu trữ hoặc nhúng lại video từ nền tảng khác.'));
  return s;
 }
 function buildGallery(t){
  const sec=mk('section','lessonBlock mr17Block mr17Gallery');sec.id='cultureImagesV17';
  sec.append(mk('h2','','II. Thư viện hình ảnh theo bài'),mk('p','mr17Lead','Sáu vị trí minh họa được kiểm kê riêng. Chỉ hiển thị hình đã có cơ sở quyền sử dụng; các vị trí còn thiếu được ghi rõ.'));
  const readyItems=t.images.map((item,index)=>({item,index:index+1})).filter(x=>x.item.display);
  const pending=t.images.map((item,index)=>({item,index:index+1})).filter(x=>!x.item.display);
  const grid=mk('div','mr17Grid'+(readyItems.length===1?' mr17Single':''));
  readyItems.forEach(x=>grid.append(buildImage(t,x.item,x.index)));sec.append(grid);
  if(pending.length){
   const more=mk('details','mr17PendingDetails');const summary=mk('summary','',pending.length+' hình còn chờ nguồn/kiểm duyệt');
   const list=mk('ul');pending.forEach(x=>{const li=mk('li','',`Ảnh ${x.index}: ${x.item.title} — ${x.item.state==='pending_license'?'Chưa có giấy phép từng tệp':'Chưa đủ điều kiện xuất bản'}`);list.append(li);});
   more.append(summary,list);sec.append(more);
  }
  sec.append(mark('Trạng thái ảnh',readyItems.length+'/6 vị trí ảnh đủ điều kiện hiển thị trong bản kiểm kê này. Những hình đang chờ duyệt không bị đưa lên trang để lấp chỗ trống.'));
  return sec;
 }
 function initLesson(){
  const box=qs('#lessonContent');if(!box)return;
  const t=registry[slug()];if(!t)return;
  // V16 inserted a shared video in nine topics; remove all duplicate V16 panels.
  qs('#cultureVideoV16')?.remove();qs('#cultureImagesV16')?.remove();
  const orig=qs('#image');if(orig)orig.hidden=true;
  if(!qs('#cultureImagesV17')){
   const before=qs('#read')||qs('#how')||box.firstElementChild;
   const section=buildGallery(t);if(before)box.insertBefore(section,before);else box.append(section);
  }
  if(!qs('#cultureVideoV17')){
    const el=buildVideo(t);const sources=qs('#sources');if(sources)box.insertBefore(el,sources);else box.append(el);
  }
  const hero=qs('#topicHero img');if(hero && t.images[0]?.path){hero.src=t.images[0].path;hero.alt='Minh họa chuyên biệt: '+t.title;}
  document.querySelectorAll('.sidePanel a[href="#cultureImagesV16"],.sidePanel a[href="#image"],.sidePanel a[href="#realPhotos"]').forEach(a=>{a.href='#cultureImagesV17';a.textContent='Thư viện 6 vị trí ảnh';});
  document.querySelectorAll('.sidePanel a[href="#cultureVideoV16"],.sidePanel a[href="#sources"]').forEach(a=>{a.href='#cultureVideoV17';a.textContent='Video theo đúng chủ đề';});
 }
 function initHub(){
  const grid=qs('#topics');if(!grid)return;
  const check=()=>grid.querySelectorAll('a.topic').forEach(a=>{
   const id=new URL(a.href,document.baseURI).searchParams.get('chu-de');const t=registry[id];if(!t)return;
   const img=qs('img',a);if(img && t.images[0]?.path && img.dataset.mrleeV17!=='1'){
    img.dataset.mrleeV17='1';img.src=t.images[0].path;img.alt='Đồ họa riêng chủ đề '+t.title;
   }
   if(a.dataset.mrleeV17Card!=='1'){
    a.dataset.mrleeV17Card='1';
    const tag=mk('span','mr17TopicBadge',t.video?'Video theo chủ đề ✓':'Video đang tuyển chọn');
    (qs('.topicText',a)||a).append(tag);
   }
  });
  check();if(window.MutationObserver)new MutationObserver(check).observe(grid,{childList:true});
 }
 function init(){initHub();initLesson();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
