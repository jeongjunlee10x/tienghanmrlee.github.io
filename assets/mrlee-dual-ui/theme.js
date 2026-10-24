/* MR LEE Dual Theme — keeps URLs/content/auth identical. */
(()=>{'use strict';
const KEY='MRLEE.THEME.V1',ROOT='assets/mrlee-dual-ui/cards/',doc=document,html=doc.documentElement;
const path=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
const admin=path==='admin.html';
const sceneNames=['learning','speaking','topik','interview','culture','universities','home','admin'];
function which(t){t=String(t).toLowerCase();if(/admin|xep-hang|ranking/.test(t))return 'admin';if(/van-hoa|culture|du-lich|kham-pha/.test(t))return 'culture';if(/phong-van/.test(t))return 'interview';if(/ban-do|dai-hoc|truong/.test(t))return 'universities';if(/giao-tiep|hoi-thoai|noi/.test(t))return 'speaking';if(/topik|kiem-tra|luyen-de|thi|nghe/.test(t))return 'topik';if(/hoc-|bai-tap|workbook|hoc-vien/.test(t))return 'learning';return 'home'}
function asset(n){return ROOT+n+'.svg'}
let theme='fresh';try{theme=localStorage.getItem(KEY)==='future'?'future':'fresh'}catch{}
function update(v){theme=v==='future'?'future':'fresh';html.dataset.mrleeTheme=theme;try{localStorage.setItem(KEY,theme)}catch{}
 doc.querySelectorAll('.mrlee-theme-switch button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===theme)));
 doc.querySelectorAll('[data-mrlee-original]').forEach(el=>{el.src=theme==='future'?el.dataset.mrleeFuture:el.dataset.mrleeOriginal});
}
function cardTheme(link){
 const href=link.getAttribute('href')||'',params=new URL(link.href,location.href).searchParams,cap=params.get('cap');
 if(cap&&/^[1-6]$/.test(cap))return ['','elementary1','elementary2','intermediate1','intermediate2','advanced1','advanced2'][Number(cap)];
 if(/kiem-tra-dau-vao/.test(href))return 'placement';
 if(/lo-trinh-topik|topik-i-lo-trinh|topik-ii-lo-trinh/.test(href))return 'roadmap';
 if(/thi-topik|topik-v11|topik-phong-luyen/.test(href))return 'mock';
 if(/lich-su/.test(href))return 'history';
 if(/workbook|bai-tap-pro/.test(href))return 'workbook';
 if(/luyen-nghe|nghe-/.test(href))return 'listening';
 if(/viet-51-54/.test(href))return 'writing';
 if(/van-hoa-bai-hoc/.test(href))return 'daily';
 if(/hoc-bong|tim-truong/.test(href))return 'schools';
 return which(href+' '+link.textContent);
}
function decorate(){
 html.style.setProperty('--mrlee-scene','url("'+asset(which(path))+'")');
 doc.querySelectorAll('.destination-grid a.destination,.quick-links a,.shortcuts a.shortcut,.mr-new-grid a,.mrlee-topik-shortcuts a').forEach(a=>{
  if(a.querySelector('.mrlee-card-visual'))return;if(!a.matches('.destination'))a.classList.add('mrlee-custom-future-card');
  const s=doc.createElement('span');s.className='mrlee-card-visual';s.setAttribute('aria-hidden','true');
  s.style.setProperty('--mrlee-card-art','url("'+asset(cardTheme(a))+'")');a.append(s);
 });
 doc.querySelectorAll('.feature-card img,.mrlee-topik-card>img').forEach((el,i)=>{
  if(el.dataset.mrleeOriginal)return;const a=el.closest('a');
  el.dataset.mrleeOriginal=el.getAttribute('src')||'';el.dataset.mrleeFuture=asset(cardTheme(a||el));
 });
 const host=doc.querySelector('.section-hero .hero-text,.v10-hero,.pro-header .pro-wrap');
 if(host&&!host.querySelector('.mrlee-future-kicker')){const x=doc.createElement('span');x.className='mrlee-future-kicker';x.textContent='KOREAN LANGUAGE · GLOBAL FUTURE';host.prepend(x)}
}
function controls(){
 if(doc.querySelector('.mrlee-theme-switch'))return;
 const nav=doc.createElement('nav');nav.className='mrlee-theme-switch';nav.setAttribute('aria-label','Chọn giao diện MR LEE');
 nav.innerHTML='<strong>Chọn giao diện</strong><button type="button" data-theme="fresh" aria-pressed="false">☀ 1. Tươi mới</button><button type="button" data-theme="future" aria-pressed="false">✦ 2. Viễn tưởng</button>';
 nav.addEventListener('click',e=>{const b=e.target.closest('button[data-theme]');if(b)update(b.dataset.theme)});
 const head=admin?doc.querySelector('.content>.topbar'):doc.querySelector('.site-header,.site-top,header.head,.v10-header,.topbar,.pro-header,.mlb-topbar');
 if(head&&head.parentNode)head.after(nav);else doc.body.prepend(nav);
}
function run(){controls();decorate();update(theme)}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();