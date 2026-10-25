/* MR LEE AI V2 progressive image patch; no grading/auth/data writes.
 * Images are only swapped when the image has loaded and decoded.
 * One existing WebP by theme/page; ZIP mobile variants can override later.
 */
(()=>{'use strict';
if(window.__MRLEE_AI_V2_INSTALLED)return;window.__MRLEE_AI_V2_INSTALLED=true;
const d=document,root='assets/mrlee-ai/v2/';
const routes={
 'index.html':'01_trang_chu',
 'hoc-tieng-han.html':'02_hoc_tieng_han',
 'giao-tiep-theo-chu-de.html':'03_giao_tiep',
 'kiem-tra-topik.html':'04_topik',
 'giao-tiep-phong-van.html':'05_phong_van',
 'van-hoa-han-quoc.html':'06_van_hoa',
 'ban-do-dai-hoc-han-quoc.html':'07_ban_do_dai_hoc',
 'mrlee-bai-tap-pro.html':'08_workbook',
 'trung-tam-hoc-vien.html':'09_ho_so_hoc_vien',
 'admin.html':'10_admin'
};
const path=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
const folder=routes[path];if(!folder)return;
const source=f=>root+f+'/hero/hero-desktop.webp';
const memo=new Map();
function whenReady(f,callback){
 if(!memo.has(f))memo.set(f,new Promise((resolve,reject)=>{
  const im=new Image();im.decoding='async';
  im.onload=()=>im.naturalWidth>=640&&im.naturalHeight>=360?resolve(source(f)):reject(new Error('Small image'));
  im.onerror=()=>reject(new Error('Missing image'));
  im.src=source(f);
 }));
 memo.get(f).then(callback).catch(()=>{/* Preserve original visible art. */});
}
function paintBackground(el,url){
 if(!el)return;
 const future=d.documentElement.dataset.mrleeTheme==='future';
 const tint=future?'linear-gradient(90deg,rgba(2,11,29,.90),rgba(5,20,54,.58) 50%,rgba(5,20,54,.08))'
 :'linear-gradient(90deg,rgba(11,45,80,.88),rgba(16,64,95,.50) 50%,rgba(11,64,96,.07))';
 el.style.setProperty('background-image',tint+',url("'+url+'")','important');
 el.style.setProperty('background-position','center','important');
 el.style.setProperty('background-size','cover','important');
 el.dataset.mrleeArtV2='ready';
}
function patch(){
 const hero=d.querySelector('main .mrlee-v4-hero-photo');
 if(hero)whenReady(folder,url=>{if(!hero.src.endsWith(url)){hero.src=url;hero.dataset.mrleeArtV2='ready'}});
 if(path==='index.html'){
  const cover=d.querySelector('#mainContent > .hero');if(cover)whenReady(folder,url=>paintBackground(cover,url));
  d.querySelectorAll('.mrlee-smart-home-card[href]').forEach(card=>{
   const href=card.getAttribute('href')?.split('?')[0],f=routes[href];
   const img=card.querySelector('img');if(!f||!img)return;
   whenReady(f,url=>{img.src=url;img.dataset.mrleeArtV2='ready'});
  });
 }
 if(path==='admin.html'){
  const cover=d.querySelector('.mrlee-smart-admin-hero');
  if(cover)whenReady(folder,url=>paintBackground(cover,url));
 }
}
function boot(){patch();if(!d.querySelector('.mrlee-v4-root')&&path!=='index.html'&&path!=='admin.html'){
 const observer=new MutationObserver(()=>{if(d.querySelector('.mrlee-v4-root')){observer.disconnect();patch()}});
 observer.observe(d.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),8000);
 }}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
new MutationObserver(patch).observe(d.documentElement,{attributes:true,attributeFilter:['data-mrlee-theme']});
})();
