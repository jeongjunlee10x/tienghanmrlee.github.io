/* MR LEE V5 — interactive one-screen course launcher.
 * No backend writes. Native pages are folded, never removed.
 * Actual available space is measured rather than assuming an arbitrary screen height.
 */
(()=>{'use strict';
const d=document,root=d.documentElement,selector='main > .mrlee-v4-root';
const shortTitle='Mở nội dung học tập ↓',closeTitle='Thu gọn về một màn hình ↑';
let shell=null,button=null,resizeQueued=false;
function canCompact(){
 if(!shell)return false;
 const viewportW=window.innerWidth,viewportH=window.innerHeight;
 const top=shell.getBoundingClientRect().top+window.scrollY;
 const available=Math.floor(viewportH-top-12);
 // Do not hide body scroll if screen is too small for usable targets.
 if(viewportW<980||viewportH<650||available<475)return false;
 root.style.setProperty('--v5-height',Math.min(available,820)+'px');
 shell.style.setProperty('--v5-card-count',String(shell.querySelectorAll('.mrlee-v4-card').length));
 shell.style.setProperty('--v5-tool-count',String(shell.querySelectorAll('.mrlee-v4-tool').length));
 return true;
}
function measure(){
 if(!shell)return;
 root.dataset.mrleeV4Compact=String(canCompact());
}
function folded(){return root.dataset.mrleeV4Folded==='true'}
function toggle(open,{scrollTo=null}={}){
 root.dataset.mrleeV4Folded=String(!open);
 if(button){
  button.setAttribute('aria-expanded',String(open));
  button.textContent=open?closeTitle:shortTitle;
 }
 // Native forms/maps are visible after this synchronous DOM state change.
 if(open&&scrollTo){
  requestAnimationFrame(()=>{
   const dest=d.getElementById(scrollTo);
   if(dest){
    dest.scrollIntoView({block:'start',behavior:'instant'});
    if(/^(?:INPUT|SELECT|TEXTAREA)$/.test(dest.tagName)&&typeof dest.focus==='function')dest.focus({preventScroll:true});
   }
  });
 }else if(!open){
  window.scrollTo({top:0,behavior:'instant'});
  requestAnimationFrame(measure);
 }
}
function boot(){
 shell=d.querySelector(selector);
 if(!shell||shell.dataset.mrleeV5Ready==='true')return;
 shell.dataset.mrleeV5Ready='true';
 const intro=shell.querySelector('.mrlee-v4-live-intro');
 if(!intro)return;
 button=d.createElement('button');
 button.type='button';
 button.className='mrlee-v5-open-detail';
 button.textContent=shortTitle;
 button.setAttribute('aria-expanded','false');
 button.setAttribute('aria-label','Mở toàn bộ bài học, bộ lọc và công cụ gốc');
 button.addEventListener('click',()=>toggle(folded()));
 intro.append(button);
 root.dataset.mrleeV4Folded='true';
 measure();
 // Anchor routes into hidden content unfold FIRST; native click then navigates as usual.
 d.addEventListener('click',event=>{
  if(!(event.target instanceof Element))return;
  const a=event.target.closest('a[href^="#"]');
  if(!a||!folded())return;
  const href=a.getAttribute('href')||'';
  if(!/^#[A-Za-z][\w-]*$/.test(href))return;
  const target=d.getElementById(href.slice(1));
  if(!target||shell.contains(target))return;
  toggle(true,{scrollTo:href.slice(1)});
 },true);
 window.addEventListener('hashchange',()=>{
  const id=decodeURIComponent(location.hash.slice(1));
  if(id&&d.getElementById(id)&&!shell.contains(d.getElementById(id)))toggle(true,{scrollTo:id});
 });
 window.addEventListener('resize',()=>{
  if(resizeQueued)return;
  resizeQueued=true;requestAnimationFrame(()=>{resizeQueued=false;measure()});
 },{passive:true});
 if(location.hash){
  const id=decodeURIComponent(location.hash.slice(1));
  if(d.getElementById(id)&&!shell.contains(d.getElementById(id)))toggle(true,{scrollTo:id});
 }
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();