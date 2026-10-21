/* MR LEE CULTURE V17.1 — self-healing image covers.
 * Scope: ONLY the two Culture pages and existing V17 images.
 * Uses locally packaged, user-provided, unique SVGs for 22 topics.
 * Does NOT enable pending-license photos or modify Firebase/scores.
 */
(()=>{'use strict';
 const data=window.MRLEE_CULTURE_V17_MEDIA||{};
 const get=(slug)=>data[slug]||null;
 const root=(slug)=>'images/culture-v13/'+encodeURIComponent(slug)+'.svg';
 const getSlug=(a)=>{try{return new URL(a.href,document.baseURI).searchParams.get('chu-de')}catch{return null}};
 const esc=(s)=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
 const fallbackSVG=(slug,title)=>{
  // Last-resort self-contained image; text remains accessible if data URIs are blocked.
  const name=esc(title||slug);
  const bg=slug==='so-cap-cuu'||slug==='goi-cuu-ho'||slug==='hoa-hoan'?'#9f254b':'#153a72';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" role="img"><rect width="600" height="400" fill="${bg}"/><circle cx="460" cy="100" r="110" fill="#ffffff" opacity=".12"/><text x="36" y="90" font-family="Arial,sans-serif" font-weight="700" font-size="26" fill="#fff">MR LEE · CULTURE</text><text x="36" y="220" font-family="Arial,sans-serif" font-size="32" font-weight="700" fill="#fff">${name}</text><text x="36" y="275" font-family="Arial,sans-serif" font-size="18" fill="#fff">Ảnh minh họa đang được kiểm tra</text></svg>`);
 };
 const ensured=new WeakMap();
 function protect(img,slug,title){
  if(!img||!get(slug))return;
  const primary=root(slug); const last=fallbackSVG(slug,title||get(slug).title);
  const prev=ensured.get(img);if(prev&&prev.slug===slug)return;
  // Old V15/V16 inline error handlers can hide an image permanently. Disable them.
  img.onerror=null;img.hidden=false;img.style.removeProperty('display');
  const state={slug,step:0};ensured.set(img,state);
  img.alt='Minh họa chuyên biệt: '+(title||get(slug).title);
  img.addEventListener('error',ev=>{
    if(ensured.get(img)!==state)return;
    ev.stopImmediatePropagation(); // V17 old listener otherwise removes broken gallery image.
    if(state.step===0){state.step=1; img.src=last;img.hidden=false;img.style.removeProperty('display');}
    else {state.step=2;img.hidden=true;img.style.display='none';const p=img.parentElement;
      if(p && !p.querySelector('.mr171FallbackText')){
       const el=document.createElement('div');el.className='mr171FallbackText';el.textContent='Hình minh họa chưa tải được: '+(title||get(slug).title);p.prepend(el);
      }
    }
  },true);
  // Show source-local SVG, not a possibly broken URL selected by older V15.
  if(!img.getAttribute('src') || !img.getAttribute('src').replace(/^\.\//,'').includes('images/culture-v13/'+slug+'.svg'))img.src=primary;
  if(img.complete && img.naturalWidth===0){ // Image could have failed before this file ran.
    img.dispatchEvent(new Event('error'));
  }
 }
 function coverGrid(){
  const grid=document.getElementById('topics');if(!grid)return;
  grid.querySelectorAll('a.topic').forEach(a=>{
   const slug=getSlug(a);if(!slug||!get(slug))return;
   const img=a.querySelector('img');if(img)protect(img,slug,get(slug).title);
  });
 }
 function lesson(){
  const box=document.getElementById('lessonContent');if(!box)return;
  const slug=new URLSearchParams(location.search).get('chu-de')||Object.keys(data)[0];
  if(!get(slug))return;
  const hero=document.querySelector('#topicHero img');if(hero)protect(hero,slug,get(slug).title);
  // V17 gallery: only V17-approved artwork, never activate pending-license items.
  const gal=document.getElementById('cultureImagesV17');
  if(gal)gal.querySelectorAll('img').forEach(img=>protect(img,slug,get(slug).title));
  // Historical galleries shouldn't show repeated or broken unapproved images.
  ['cultureImagesV16','mrleeAiPhotos','realPhotos'].forEach(id=>{
   const el=document.getElementById(id);if(el&&gal)el.remove();
  });
 }
 function init(){coverGrid();lesson();
  const grid=document.getElementById('topics');
  if(grid && window.MutationObserver){
   // V13 re-renders card nodes during filtering. This only observes child list, not src.
   new MutationObserver(()=>coverGrid()).observe(grid,{childList:true});
  }
  console.info('[MRLEE Culture V17.1] 22 distinct safe covers enabled; 110 pending positions remain unpublished.');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
