/* MR LEE Image Quality V3 — delivery and visibility enhancement, never fake upscale.
   Real image dimensions are logged for diagnostics. Do not replace lesson art
   or mutate image URLs; respect V3 artwork verification and approved mascot. */
(()=>{'use strict';
if(window.__mrleeImageQualityV3)return;window.__mrleeImageQualityV3=true;
const seen=new WeakSet(),observe=new MutationObserver(records=>{
  for(const rec of records)for(const node of rec.addedNodes){
    if(node.nodeType!==1)continue;
    if(node.tagName==='IMG')prepare(node);
    node.querySelectorAll?.('img').forEach(prepare);
  }
});
const critical='main > .hero img, .mrlee-next-hero img, .mrlee-v4-hero-photo, .ts-hero img, main .hero-photo, .mrlee-hero-photo-pane img, .mrlee-smart-home-grid > a:first-child img';
const decorative='img:not(.mrlee-approved-logo)';
function prepare(img){
 if(!img||seen.has(img))return;
 seen.add(img);
 if(img.dataset.fallbackSrc){
  img.addEventListener('error',()=>{const fallback=img.dataset.fallbackSrc;if(!fallback)return;delete img.dataset.fallbackSrc;img.src=fallback;},{once:true});
 }
 if(!img.hasAttribute('decoding'))img.decoding='async';
 if(img.matches('.mrlee-approved-logo')||img.closest('a.brand,.site-logo,.ts-logo,.mrlee-next-brand')){img.loading='eager';return}
 if(img.matches(critical)){
  img.loading='eager';try{img.fetchPriority='high'}catch{}
 }else if(!img.hasAttribute('loading')){
  img.loading='lazy';
 }
 img.addEventListener('load',()=>{const b=img.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
  if(b.width>=320&&img.naturalWidth>0&&img.naturalWidth<b.width*dpr*.65)img.dataset.mrleeLowres='1';
  else delete img.dataset.mrleeLowres;
 },{passive:true});
}
function go(){
 document.querySelectorAll(decorative).forEach(prepare);
 observe.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true});else go();
})();
