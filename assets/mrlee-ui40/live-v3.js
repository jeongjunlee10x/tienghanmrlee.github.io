/* MR LEE 4.0 visible homepage controls. Never accesses user/profile/score APIs. */
(()=>{'use strict';
 const root=document.documentElement;
 if(root.dataset.mrleeUi40Live!=='v3')return;
 const KEY='MRLEE.SKINPACK.THEME.V1',LEGACY='MRLEE.THEME.V1';
 const allowed=['fresh','future','campus'];
 function selected(){
  const url=new URLSearchParams(location.search).get('mr4preview');
  if(allowed.includes(url))return url;
  try{const v=localStorage.getItem(KEY);if(allowed.includes(v))return v;if(localStorage.getItem(LEGACY)==='future')return 'future'}catch{}
  return 'fresh';
 }
 function sync(){
  const t=selected();root.dataset.mr4Theme=t;
  document.querySelectorAll('[data-mr4-choose]').forEach(b=>{b.setAttribute('aria-pressed',String(b.getAttribute('data-mr4-choose')===t))});
 }
 function init(){
  sync();
  document.querySelectorAll('[data-mr4-choose]').forEach(b=>b.addEventListener('click',()=>{
   const t=b.getAttribute('data-mr4-choose');if(!allowed.includes(t))return;
   try{localStorage.setItem(KEY,t);localStorage.setItem(LEGACY,t==='future'?'future':'fresh')}catch{}
   root.dataset.mr4Theme=t;root.dataset.mrleeTheme=t==='future'?'future':'fresh';
   document.querySelectorAll('[data-mr4-choose]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));
   if(window.MRLEE4_PAGE_IMAGES||document.querySelector('script[src*="mrlee-dual-ui/theme.js"]'))location.reload();
  }));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();