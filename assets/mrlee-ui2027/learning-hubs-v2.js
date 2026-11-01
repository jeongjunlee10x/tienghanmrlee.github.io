/* MR LEE 2027 subpage redesign: presentation only, no changes to scoring/auth/data. */
(()=>{'use strict';
const root=document.documentElement;
if(!root.dataset.mrleeHubV2)return;
const init=()=>{
 // Legacy compact-shell V5 hides every sibling after its own dynamically prepended shell.
 // Disable only that presentation fold here; our scoped V2 CSS controls native content.
 if(root.dataset.mrleeV4){root.dataset.mrleeV4Folded='false';root.dataset.mrleeV4Compact='false';}
 const hub=document.querySelector('.mrlee27-subhub');
 const expand=document.getElementById('mrlee27HubExpand');
 const setExpanded=()=>{
  if(!expand)return;
  const v=root.dataset.mrleeHubExpanded==='true';
  expand.textContent=v?'Thu gọn trang ↑':'Xem thêm nội dung và tiện ích ↓';
  expand.setAttribute('aria-expanded',String(v));
 };
 expand?.addEventListener('click',()=>{
  root.dataset.mrleeHubExpanded=String(root.dataset.mrleeHubExpanded!=='true');
  if(root.dataset.mrleeV4)root.dataset.mrleeV4Folded='false';
  setExpanded();
  if(root.dataset.mrleeHubExpanded!=='true'&&hub){
    hub.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
 });
 setExpanded();
 document.getElementById('mrlee27HubTheme')?.addEventListener('click',()=>{
  try{sessionStorage.removeItem('MRLEE.THEME.ENTRY.V1')}catch{}
  /* The native picker is on home and remains the only one. */
  location.assign('index.html?select-theme=1');
 });
 document.querySelectorAll('.mrlee27-subhub .mr27-item img,.mrlee27-subhub .mr27-subphoto img,.mrlee27-workintro img').forEach(img=>{
  img.addEventListener('error',()=>{
   img.hidden=true;
   img.closest('.mr27-item,.mr27-subphoto,.mrlee27-workintro')?.classList.add('mr27-photo-fallback');
  },{once:true});
 });
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();