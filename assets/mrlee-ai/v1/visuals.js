/* MR LEE AI V1: waits for confirmed image onload before replacing original art. */
(()=>{'use strict';
 const doc=document,base='assets/mrlee-ai/v1/';
 const names=new Set(['home','learning','speaking','topik','workbook','interview','culture','universities','profile','admin']);
 const nameOf=s=>names.has(s)?s:'learning';
 const mobile=()=>matchMedia('(max-width:760px)').matches;
 function readImage(name,callback){
  const src=base+nameOf(name)+(mobile()?'-mobile':'')+'.webp';
  const image=new Image();image.decoding='async';
  image.onload=()=>{if(image.naturalWidth>=640&&image.naturalHeight>=360)callback(src)};
  image.onerror=()=>{}; // Preserve existing sharp SVG if not uploaded.
  image.src=src;
 }
 function enhanceContext(){
  const context=doc.querySelector('.mrlee-v2-context');if(!context)return;
  readImage(context.dataset.page||'learning',url=>{
   context.style.setProperty('--mrlee-v2-context-art','url("'+url+'")');
   context.dataset.mrleeAi='ready';
  });
 }
 function enhanceAdmin(){
  if(!/admin\.html$/.test(location.pathname))return;
  const panel=doc.querySelector('#page-overview')||doc.querySelector('.main-pad');
  if(!panel||panel.querySelector('.mrlee-ai-admin-banner'))return;
  readImage('admin',url=>{
    if(panel.querySelector('.mrlee-ai-admin-banner'))return;
    const wrap=doc.createElement('div');wrap.className='mrlee-ai-admin-banner';
    wrap.setAttribute('role','img');wrap.setAttribute('aria-label','Ảnh AI minh họa giao diện quản trị; biểu đồ thực ở bên dưới');
    wrap.style.backgroundImage='linear-gradient(95deg,rgba(7,23,48,.93),rgba(7,30,57,.20)),url("'+url+'")';
    const copy=doc.createElement('div'),title=doc.createElement('strong'),desc=doc.createElement('small');
    title.textContent='TRUNG TÂM QUẢN TRỊ MR LEE';
    desc.textContent='Quản lý học viên · Bài làm · Hoạt động · Tư vấn';
    copy.append(title,desc);wrap.append(copy);panel.prepend(wrap);
  });
 }
 function start(){enhanceContext();enhanceAdmin()}
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();