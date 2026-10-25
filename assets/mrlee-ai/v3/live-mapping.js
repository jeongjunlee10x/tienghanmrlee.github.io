/* MR LEE V3 — image-only release mapping for index and 9 sections.
 * Never points a live <img> to missing V3 WebP; every change is gated by successful decoding.
 * Keeps the authoritative logo and business logic untouched. No synthetic user statistics.
 */
(()=>{'use strict';
if(window.__MRLEE_V3_MAP_BOOT)return;
window.__MRLEE_V3_MAP_BOOT=true;
const root='assets/mrlee-ai/v3/',d=document,html=d.documentElement;
const pages={
 'index.html':{folder:'01_trang_chu',cards:{
  'tuyen-sinh.html':'feature-admission','kiem-tra-topik.html':'feature-topik',
  'mrlee-bai-tap-pro.html':'feature-workbook','bang-xep-hang.html':'feature-leaderboard',
  'ban-do-dai-hoc-han-quoc.html':'feature-university-map',
  'van-hoa-han-quoc.html':'feature-culture','trung-tam-hoc-vien.html':'feature-profile',
  'hoc-tieng-han.html':'02_hoc_tieng_han/level-01','giao-tiep-theo-chu-de.html':'feature-speaking',
  'giao-tiep-phong-van.html':'feature-interview','admin.html':'feature-admin'
 }},
 'hoc-tieng-han.html':{folder:'02_hoc_tieng_han',cards:[
  'level-01','level-02','level-03','level-04','level-05','level-06'],tools:[
  'tool-vocabulary','tool-listening','tool-speaking','tool-lesson-exercises',
  'tool-workbook','tool-grammar']},
 'giao-tiep-theo-chu-de.html':{folder:'03_giao_tiep',cards:[
  'topic-greetings','topic-restaurant','topic-shopping','topic-office'],tools:[
  'method-dialogue','method-listen-repeat','method-situations','method-reaction']},
 'kiem-tra-topik.html':{folder:'04_topik',cards:[
  'entry-test','roadmap','practice-tests','mock-exam','results-history'],tools:[
  'topic-vocab','topic-skills','topic-grammar']},
 'giao-tiep-phong-van.html':{folder:'05_phong_van',cards:[
  'self-introduction','study-abroad','employment','common-questions'],tools:[
  'video-interview','ai-evaluation','checklist']},
 'van-hoa-han-quoc.html':{folder:'06_van_hoa',cards:[
  'food','festivals','transport','greetings'],tools:[
  'school','daily-life','part-time']},
 'ban-do-dai-hoc-han-quoc.html':{folder:'07_ban_do_dai_hoc',cards:[
  'campus-seoul','map-illustration','campus-daejeon','campus-busan'],tools:[
  'campus-gwangju','campus-incheon','campus-jeju']},
 'mrlee-bai-tap-pro.html':{folder:'08_workbook',cards:[
  'category-vocabulary','category-grammar','category-particles','category-ordering',
  'category-reading','category-translation','category-listening'],tools:[
  'featured-packs','progress','achievements']},
 'trung-tam-hoc-vien.html':{folder:'09_ho_so_hoc_vien',cards:[
  'scores','overview','workbook','achievements'],tools:[
  'recommended','topik','overview']},
 'admin.html':{folder:'10_admin'}
};
const filename=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
const config=pages[filename];if(!config)return;
const cache=new Map();
const normalizedTheme=()=>html.dataset.mrleeTheme==='future'?'future':'fresh';
const url=(name)=>root+config.folder+'/'+name+'.webp';
function verified(u){
 if(!cache.has(u)){
  cache.set(u,new Promise(resolve=>{
   const image=new Image();image.decoding='async';
   image.onload=()=>resolve(image.naturalWidth>=300&&image.naturalHeight>=160);
   image.onerror=()=>resolve(false);
   image.src=u;
  }));
 }
 return cache.get(u);
}
async function setImage(img,u){
 if(!img)return;
 if(!await verified(u))return;
 if(img.dataset.mrleeV3Art===u)return;
 img.src=u;img.dataset.mrleeV3Art=u;
}
async function setBackground(element,u){
 if(!element||!await verified(u))return;
 const tint=normalizedTheme()==='future'
   ?'linear-gradient(90deg,rgba(2,10,28,.89),rgba(5,19,49,.62) 44%,rgba(5,22,55,.03) 83%)'
   :'linear-gradient(90deg,rgba(240,250,255,.91),rgba(234,246,255,.59) 43%,rgba(240,249,255,.02) 82%)';
 // Source image has no fake logo, metrics or text; these remain proper HTML elements.
 element.style.setProperty('background-image',tint+',url("'+u+'")','important');
 element.style.setProperty('background-size','cover','important');
 element.style.setProperty('background-position','center','important');
 element.dataset.mrleeV3Art=u;
}
function applyCards(){
 if(filename==='index.html'){
  const map=pages['index.html'].cards;
  // The live homepage uses feature-card and mrlee-future-mod-card,
  // not mrlee-smart-home-card (which was a stale selector).
  const sourceMap={
   'feature-1-tuyen-sinh.webp':'feature-admission',
   'feature-2-ban-do.webp':'feature-university-map',
   'feature-3-tim-truong.webp':'07_ban_do_dai_hoc/campus-busan',
   'feature-5-hoc-tieng-han.webp':'02_hoc_tieng_han/level-01',
   'feature-6-thi-topik.webp':'feature-topik',
   'feature-7-ky-tuc-xa.webp':'03_giao_tiep/topic-dorm',
   'feature-8-doi-song.webp':'feature-culture',
   'learning-topik.webp':'feature-topik',
   'learning-books.webp':'feature-workbook'
  };
  const cards=d.querySelectorAll(
   '.feature-card[href], .mrlee-future-mod-card[href], .mrlee-smart-home-card[href]'
  );
  cards.forEach(a=>{
   const img=a.querySelector('img');
   if(!img)return;
   const original=(img.getAttribute('src')||'').split('/').pop();
   const basename=(a.getAttribute('href')||'').split(/[?#]/)[0];
   const course=/[?&]cap=([1-6])(?:&|$)/.exec(a.getAttribute('href')||'');
   const level=course?'02_hoc_tieng_han/level-0'+course[1]:null;
   const slug=level||sourceMap[original]||map[basename];
   if(slug)setImage(img,slug.includes('/')?root+slug+'.webp':url(slug));
  });
  return;
 }
 // Card positions here map to the existing V4 page-system.js definitions.
 d.querySelectorAll('.mrlee-v4-directory-grid .mrlee-v4-card').forEach((item,index)=>{
  const slug=config.cards?.[index];
  if(slug)setImage(item.querySelector('img'),url(slug));
 });
 d.querySelectorAll('.mrlee-v4-tools .mrlee-v4-tool').forEach((item,index)=>{
  const slug=config.tools?.[index];
  if(slug)setImage(item.querySelector('img'),url(slug));
 });
}
function apply(){
 const theme=normalizedTheme(),hero=url('hero-'+theme);
 const photograph=d.querySelector('main .mrlee-v4-hero-photo');
 if(photograph)setImage(photograph,hero);
 if(filename==='index.html'){
  setBackground(d.querySelector('#mainContent > .hero'),hero);
  const futureCopy=d.querySelector('.mrlee-future-hero-copy');
  if(futureCopy)futureCopy.style.position='relative';
 }
 if(filename==='admin.html')setBackground(d.querySelector('.mrlee-smart-admin-hero'),hero);
 applyCards();
}
let runs=0;function boot(){
 apply();
 // V4 cards are injected on DOMContentLoaded by another script. Mutation observing
 // only until the card tree is available avoids a background observer forever.
 if(config.cards&&runs++===0){
  if(!d.querySelector('.mrlee-v4-root')){
   const watch=new MutationObserver(()=>{
    if(d.querySelector('.mrlee-v4-root')){watch.disconnect();applyCards();}
   });
   watch.observe(d.body,{childList:true,subtree:true});
   setTimeout(()=>watch.disconnect(),9000);
  }
 }
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
new MutationObserver((list)=>{
 if(list.some(x=>x.attributeName==='data-mrlee-theme'))apply();
}).observe(html,{attributes:true,attributeFilter:['data-mrlee-theme']});
})();