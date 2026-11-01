/* MR LEE 2027 Phase 3: light interaction & compatibility only.
 * Does not read private data, affect authentication, scoring, form submissions,
 * map filtering, or invent administrative statistics. */
(()=>{'use strict';
const root=document.documentElement;
const scope=root.dataset.mrleePhase3;
if(!['map','admission','student','admin'].includes(scope))return;
function ready(){
 if(scope==='map'||scope==='student'){
  // The pre-existing V4/V5 launcher folds main siblings. The redesigned layout
  // explicitly opts out without deleting its original functional sections.
  const release=()=>{
   if(root.dataset.mrleeV4Folded==='true')root.dataset.mrleeV4Folded='false';
   if(root.dataset.mrleeV4Compact==='true')root.dataset.mrleeV4Compact='false';
  };
  release();
  new MutationObserver(release).observe(root,{
    attributes:true,attributeFilter:['data-mrlee-v4-folded','data-mrlee-v4-compact']
  });
 }
 if(scope==='admin'){
  const area=document.getElementById('page-overview');
  const info=document.getElementById('mrlee27AdminNotice');
  if(!area||!info)return;
  area.querySelectorAll('[data-mrlee27-nav]').forEach(button=>{
   button.addEventListener('click',()=>{
    const key=button.dataset.mrlee27Nav;
    // Use the original menu handler; never bypass Supabase authorization.
    if(document.getElementById('app')?.classList.contains('hidden'))return;
    const menu=document.querySelector('#app .side-menu');
    const target=menu?.querySelector('[data-nav="'+key+'"]');
    if(!target||target.disabled){
      info.textContent='Chức năng này chưa sẵn sàng ở phiên quản trị hiện tại. Kiểm tra mục tương ứng trong menu bên trái.';
      return;
    }
    info.textContent='';
    target.click();
   });
  });
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
})();