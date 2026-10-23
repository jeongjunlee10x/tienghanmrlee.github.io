/* TIENG HAN MR LEE | Culture V17.2.1
   Scoped display/re-render repair for V17.2's EXISTING 110 WebP files.
   No changes to media content, scores, video or login. */
(()=>{'use strict';
 const prefix='images/culture-v18-hd/';
 const localSVG='images/culture-v13/';
 const registry=window.MRLEE_CULTURE_V17_MEDIA||{};
 const fallbackTopics=Array.isArray(window.MRLEE_CULTURE_V13)?window.MRLEE_CULTURE_V13:[];
 const entries=Object.keys(registry).length===22 ? registry : Object.fromEntries(fallbackTopics.map(t=>[t.slug,t]));
 const all=new Set(Object.keys(entries));
 const get=id=>entries[id]||{title:id,ko:''};
 const path=(id,k)=>prefix+encodeURIComponent(id)+'/'+String(k).padStart(2,'0')+'.webp?v=1721';
 const svg=id=>localSVG+encodeURIComponent(id)+'.svg?v=171';
 const one=(s,p=document)=>p.querySelector(s);
 let scheduled=false, hubObserver=null, lessonObserver=null;
 const selectId=(a)=>{try{return new URL(a.href,document.baseURI).searchParams.get('chu-de')}catch{return null}};
 const slug=new URLSearchParams(location.search).get('chu-de')||Object.keys(entries)[0];
 function cover(img,id){
  if(!img||!all.has(id))return;
  const ai=path(id,1);
  // Remove stale V15/V16 error handler, keep listener for SVG and accessible text.
  img.onerror=null;
  if(img.dataset.mrlee1721!==id){
   img.dataset.mrlee1721=id;
   img.addEventListener('error',function(){
    if(img.dataset.mrlee1721Fallback==='yes')return;
    img.dataset.mrlee1721Fallback='yes';
    img.src=svg(id);
    img.alt='Minh họa dự phòng: '+get(id).title;
   });
  }
  img.hidden=false;img.style.removeProperty('display');
  if(img.dataset.mrlee1721Fallback!=='yes' && img.getAttribute('src')!==ai){
   img.src=ai;img.alt='Ảnh AI minh họa: '+get(id).title;
  }
 }
 function repairHub(){
  const grid=one('#topics');if(!grid)return;
  grid.querySelectorAll('a.topic').forEach(a=>{
   const id=selectId(a);if(all.has(id))cover(one('img',a),id);
  });
  if(!hubObserver){
   hubObserver=new MutationObserver(()=>schedule());
   hubObserver.observe(grid,{childList:true,subtree:false});
  }
 }
 function gallery(id){
  const t=get(id),section=document.createElement('section');
  section.id='cultureImagesV172';
  section.className='lessonBlock mr17Block mr172Block mr1721Ready';
  const h=document.createElement('h2');h.textContent='II. Ảnh minh họa theo chủ đề';section.append(h);
  const note=document.createElement('p');note.className='mr172Lead';note.textContent='5 ảnh minh họa AI riêng cho bài và 1 đồ họa dự phòng. Đây không phải ảnh chụp thực tế hoặc hướng dẫn cấp cứu.';section.append(note);
  const grid=document.createElement('div');grid.className='mr172Grid';
  for(let i=1;i<=6;i++){
   const fig=document.createElement('figure');fig.className='mr172Card';
   const img=document.createElement('img');img.loading='eager';img.decoding='async';
   if(i===6){img.src=svg(id);img.alt='Đồ họa: '+t.title}
   else {img.src=path(id,i);img.alt='Minh họa AI '+i+'/5: '+t.title;
    img.addEventListener('error',()=>{if(img.dataset.fallback)return;img.dataset.fallback='yes';img.src=svg(id)});
   }
   const cap=document.createElement('figcaption');
   const b=document.createElement('strong');b.textContent=i===6?'Ảnh bìa dự phòng':'Ảnh AI '+i+'/5';cap.append(b);
   const label=document.createElement('span');label.textContent=t.title;cap.append(label);
   if(t.ko){const ko=document.createElement('small');ko.textContent=t.ko;cap.append(ko)}
   fig.append(img,cap);grid.append(fig);
  }
  section.append(grid);
  const caution=document.createElement('p');caution.className='mr172Note';caution.textContent='Ảnh minh họa do AI tạo riêng cho TIẾNG HÀN MR LEE. Không dùng làm chỉ dẫn thực tế trong tình huống khẩn cấp.';section.append(caution);
  return section;
 }
 function repairLesson(){
  const box=one('#lessonContent');if(!box||!all.has(slug))return;
  let sec=one('#cultureImagesV172');
  if(!sec){
   sec=gallery(slug);
   const reference=one('#cultureImagesV17')||one('#read')||box.firstElementChild;
   if(reference)reference.insertAdjacentElement('beforebegin',sec);else box.append(sec);
  }
  sec.hidden=false;sec.classList.add('mr1721Ready');sec.style.removeProperty('display');sec.style.removeProperty('visibility');
  const images=sec.querySelectorAll('.mr172Grid img');
  // Recover a missing gallery if another script partially rewrote its contents.
  if(images.length!==6){sec.replaceWith(gallery(slug));sec=one('#cultureImagesV172');}
  if(sec){sec.querySelectorAll('img').forEach(img=>{img.hidden=false;img.style.removeProperty('display');img.style.removeProperty('visibility')})}
  ['cultureImagesV17','cultureImagesV16'].forEach(id=>{const old=document.getElementById(id);if(old)old.hidden=true});
  const hero=one('#topicHero img');if(hero)cover(hero,slug);
  document.querySelectorAll('.sidePanel a[href="#cultureImagesV17"],.sidePanel a[href="#cultureImagesV16"],.sidePanel a[href="#image"]').forEach(a=>{a.href='#cultureImagesV172';a.textContent='Thư viện ảnh minh họa'});
  if(!lessonObserver){
   lessonObserver=new MutationObserver(()=>schedule());
   lessonObserver.observe(box,{childList:true,subtree:false});
  }
 }
 function repair(){scheduled=false;repairHub();repairLesson()}
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(repair)}
 function init(){repair();window.addEventListener('load',schedule,{once:true});[400,1200,3000].forEach(ms=>setTimeout(schedule,ms));
  console.info('[MR LEE Culture 17.2.1] Display repair active; only existing topic image assets are used.');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
