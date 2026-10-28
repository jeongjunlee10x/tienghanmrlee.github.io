/* Home only: integrate existing live weekly point badge into ranking title.
   Does not create new point listeners, change Firestore records or duplicate widgets. */
(()=>{'use strict';
 const mount=()=>{
  const rank=document.getElementById('ranking');
  const title=rank?.querySelector('.rank-title');
  const badge=document.getElementById('mrleeV12Widget');
  if(!title||!badge)return false;
  if(badge.parentNode!==title)title.append(badge);
  rank.dataset.mrleeBadgeEmbedded='true';
  return true;
 };
 function start(){
  if(mount())return;
  // The async Firebase ES module may inject its badge after the DOM is ready.
  const observer=new MutationObserver(()=>{
   if(mount())observer.disconnect();
  });
  observer.observe(document.body,{childList:true});
  window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
