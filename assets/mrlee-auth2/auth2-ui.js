/* Standalone public UI, intentionally works even if Firebase CDN is slow/unavailable. */
(()=>{
'use strict';
const root=document.documentElement;
const dialog=document.getElementById('mrlee-auth2-dialog');
const canConsult=()=>root.dataset.mrleeAuth2==='verified';
function openNotice(){
  if(dialog && typeof dialog.showModal==='function'){
    if(!dialog.open)dialog.showModal();
  }else location.assign('dang-nhap.html');
}
['mrlee-auth2-locked-hero','mrlee-auth2-locked-top'].forEach(id=>document.getElementById(id)?.addEventListener('click',openNotice));
document.getElementById('mrlee-auth2-dialog-close')?.addEventListener('click',()=>dialog?.close());
dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
// Existing V20 consultation launchers require sign-in. Use capture to override existing listeners.
document.addEventListener('click',event=>{
  if(!event.target.closest?.('#openContactTop,#openContactHero') || canConsult())return;
  event.preventDefault();event.stopImmediatePropagation();openNotice();
},true);
document.getElementById('consultFormV21')?.addEventListener('submit',event=>{
  if(canConsult())return;
  event.preventDefault();event.stopImmediatePropagation();openNotice();
},true);
})();
