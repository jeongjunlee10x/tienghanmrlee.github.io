/* MR LEE Home Rebuild V2 — behaviour only; all module links are native HTML. */
(()=>{'use strict';
const doc=document,root=doc.documentElement;
if(!root.matches('[data-mrlee-redesign="v2"]'))return;
const start=()=>{
 const section=doc.getElementById('mrleeNewHome');
 if(!section)return;
 root.dataset.mrleeRedesignReady='true';
 const change=doc.getElementById('mrlee27ThemeChange');
 const expand=doc.getElementById('mrlee27Expand');
 change?.addEventListener('click',()=>{
  /* Reopen the pre-existing theme picker instead of introducing a second modal. */
  try{sessionStorage.removeItem('MRLEE.THEME.ENTRY.V1')}catch{}
  location.reload();
 });
 function syncExpand(){
  if(!expand)return;
  const open=root.dataset.mrleeSmartExpanded==='true';
  expand.textContent=open?'Thu gọn trang chủ ↑':'Xem thêm nội dung ↓';
  expand.setAttribute('aria-expanded',String(open));
 }
 expand?.addEventListener('click',()=>{
  const open=root.dataset.mrleeSmartExpanded!=='true';
  root.dataset.mrleeSmartExpanded=String(open);
  syncExpand();
  if(!open && !matchMedia('(prefers-reduced-motion: reduce)').matches)
   section.scrollIntoView({block:'start',behavior:'smooth'});
 });
 new MutationObserver(syncExpand).observe(root,{attributes:true,attributeFilter:['data-mrlee-smart-expanded']});
 syncExpand();
 for(const image of section.querySelectorAll('.mr27-tile img,.mr27-hero-media img')){
  image.addEventListener('error',()=>{
    image.style.display='none';
    image.closest('.mr27-tile,.mr27-hero-media')?.classList.add('mr27-missing-photo');
  },{once:true});
 }
};
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();