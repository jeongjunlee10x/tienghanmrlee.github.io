/* MR LEE V30.6: swap only photo src on dynamically created V23 editorial cards.
   Do not create cards, change URLs, or affect student/exam/business logic. */
(()=>{'use strict';
 const prefix='assets/v306/images/';
 const byPage={
  'hoc-tieng-han.html':['learning-hangeul','learning-roadmap','learning-listening','learning-topik'],
  'bo-sach.html':['learning-books','learning-cap-1','learning-cap-2','learning-listening'],
  'kiem-tra-topik.html':['learning-topik','learning-topik','learning-hangeul','learning-books'],
  'van-hoa-han-quoc.html':['culture','feature-8-doi-song','learning-hangeul','feature-1-tuyen-sinh']
 };
 const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 const names=byPage[page];if(!names)return;
 const apply=()=>{
   const gallery=document.querySelector('[data-v23-gallery]');if(!gallery)return false;
   const imgs=[...gallery.querySelectorAll('a img')];
   if(imgs.length!==4)return false;
   imgs.forEach((el,i)=>{
     const next=new URL(prefix+names[i]+'.webp',document.baseURI).href;
     if(el.src!==next){el.src=next;el.decoding='async';}
   });
   return true;
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
   if(apply())return;
   const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});
   observer.observe(document.body,{subtree:true,childList:true});
   window.addEventListener('load',()=>observer.disconnect(),{once:true});
 },{once:true});
 else apply();
})();
