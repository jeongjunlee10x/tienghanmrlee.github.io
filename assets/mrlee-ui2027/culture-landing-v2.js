/* MR LEE Culture V2 compatibility layer.
 * Keep the native 22-topic filters and cards visible despite previous V4/V5
 * one-screen folding. No changes to topic data, events, scoring or photos.
 */
(()=>{'use strict';
const root=document.documentElement;
if(root.dataset.mrleeCultureV2!=='1')return;
const start=()=>{
 const release=()=>{
   if(root.dataset.mrleeV4Folded==='true')root.dataset.mrleeV4Folded='false';
   if(root.dataset.mrleeV4Compact==='true')root.dataset.mrleeV4Compact='false';
 };
 release();
 new MutationObserver(release).observe(root,{
  attributes:true,attributeFilter:['data-mrlee-v4-folded','data-mrlee-v4-compact']
 });
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();