/* MR LEE 800 – Hero images are independent WEBP assets, not screen mockups.
 * Zero fabricated score/profile values. Keeps official logo and all existing business logic.
 * Replace only if the corresponding file actually exists and decodes.
 */
(()=>{'use strict';
if(window.__MRLEE_800_HERO_READY)return;
window.__MRLEE_800_HERO_READY=true;
const page=(decodeURIComponent(location.pathname.split('/').pop()||'index.html')).toLowerCase();
const names={
 'index.html':'01-trang-chu',
 'hoc-tieng-han.html':'02-hoc-tieng-han',
 'giao-tiep-theo-chu-de.html':'03-giao-tiep',
 'kiem-tra-topik.html':'04-topik',
 'mrlee-topik-pro.html':'04-topik',
 'giao-tiep-phong-van.html':'05-phong-van',
 'van-hoa-han-quoc.html':'06-van-hoa',
 'ban-do-dai-hoc-han-quoc.html':'07-ban-do-dai-hoc',
 'mrlee-bai-tap-pro.html':'08-workbook',
 'trung-tam-hoc-vien.html':'09-ho-so-hoc-vien',
 'admin.html':'10-admin',
 'tuyen-sinh.html':'11-tuyen-sinh',
 'dang-ky-tu-van.html':'11-tuyen-sinh',
 'bang-xep-hang.html':'12-bang-xep-hang',
 'bang-chu-cai-tieng-han.html':'13-hangul',
 'topik-nghe-24-cau.html':'14-topik-nghe',
 'topik-nghe-124-cau.html':'14-topik-nghe',
 'topik-viet-51-54.html':'15-topik-viet'
};
const slot=names[page];if(!slot)return;
const doc=document,root=doc.documentElement;
const theme=()=>root.getAttribute('data-mrlee-theme')==='future'?'future':'fresh';
const states=new Map();
const heroURL=(t,ext='webp')=>'assets/images/heroes/'+slot+'-'+t+'.'+ext;
function valid(url){
 if(!states.has(url)){
  states.set(url,new Promise(resolve=>{
   const img=new Image();
   img.onload=()=>resolve(img.naturalWidth>=1100&&img.naturalHeight>=500);
   img.onerror=()=>resolve(false);
   img.src=url;
  }));
 }
 return states.get(url);
}
let applyToken=0;
async function updateHero(){
 const token=++applyToken,t=theme();
 let uri=heroURL(t);
 if(!(await valid(uri)))uri=heroURL(t,'svg');
 if(!(await valid(uri))||token!==applyToken)return;
 const home=page==='index.html';
 if(home){
  const hero=doc.querySelector('#mainContent>.hero');
  if(!hero)return;
  const fog=t==='future'
   ?'linear-gradient(90deg,rgba(3,13,36,.91) 0%,rgba(3,15,40,.71) 40%,transparent 81%)'
   :'linear-gradient(90deg,rgba(246,251,255,.96) 0%,rgba(235,246,255,.79) 42%,transparent 82%)';
  hero.style.setProperty('background-image',fog+',url("'+uri+'")','important');
  hero.classList.add('mrlee800-has-hero');
  hero.dataset.mrlee800Image=uri;
 }else{
  const photo=doc.querySelector('.mrlee-v4-hero-photo,.mrlee-v4-hero img,.mrlee-smart-admin-hero img');
  if(photo && photo.tagName==='IMG'){
   photo.src=uri;photo.dataset.mrlee800Image=uri;
  }else{
   const backdrop=doc.querySelector('main .mrlee-v4-hero,main .hero,main [class*="-hero"],.mast .hero');
   if(backdrop){const fog=t==='future'?'linear-gradient(90deg,rgba(4,14,39,.88),rgba(4,14,39,.13))':'linear-gradient(90deg,rgba(246,251,255,.91),rgba(246,251,255,.10))';backdrop.style.setProperty('background-image',fog+',url("'+uri+'")');backdrop.style.setProperty('background-size','cover');backdrop.style.setProperty('background-position','center');backdrop.dataset.mrlee800Image=uri;}
  }
 }
}
function boot(){
 updateHero();
 if(page!=='index.html'){
  let observer=new MutationObserver(()=>{if(doc.querySelector('.mrlee-v4-hero-photo,.mrlee-v4-hero img,.mrlee-smart-admin-hero img'))updateHero()});
  observer.observe(doc.body,{subtree:true,childList:true});
  setTimeout(()=>{observer.disconnect();observer=null},8000);
 }
 new MutationObserver((changes)=>{
  if(changes.some(c=>c.attributeName==='data-mrlee-theme'))updateHero();
 }).observe(root,{attributes:true,attributeFilter:['data-mrlee-theme']});
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();