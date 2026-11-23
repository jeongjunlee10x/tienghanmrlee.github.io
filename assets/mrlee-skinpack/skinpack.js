
/* MR LEE 4.0 -- safe visual enhancement: never changes account, scoring or games */
(()=>{'use strict';
 const doc=document,root=doc.documentElement;
 if(root.dataset.mr4Booted==='1')return;root.dataset.mr4Booted='1';
 const KEY='MRLEE.SKINPACK.THEME.V1';const LEGACY='MRLEE.THEME.V1';
 const choices=['fresh','future','campus'];
 const preview=new URLSearchParams(location.search).get('mr4preview');
 const rawPage=(location.pathname.split('/').pop()||'index.html').replace(/^mrlee-preview-(home|.*)\.html$/,(x,k)=>k==='home'?'index.html':k+'.html');const page=rawPage.endsWith('.html')?rawPage:rawPage+'.html';
 let saved;try{saved=localStorage.getItem(KEY)}catch{}
 let theme=choices.includes(preview)?preview:choices.includes(saved)?saved:(choices.includes(window.MRLEE4_DEFAULT_THEME)?window.MRLEE4_DEFAULT_THEME:'fresh');
 function apply(){
  root.dataset.mr4Theme=theme;
  root.dataset.mrleeTheme=theme==='future'?'future':'fresh';
  const sources={fresh:'home-fresh.webp',future:'home-future.webp',campus:'home-campus.webp'};
  root.style.setProperty('--mr4-hero-art','url("assets/mrlee-skinpack/images/'+sources[theme]+'")');
  doc.querySelectorAll('#mr4-switcher-menu button[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===theme)));
 }
 apply();
 const meta=window.MRLEE4_PAGE_IMAGES||{};
 const secured=/^(?:admin|dang-nhap|quan-tri-tro-choi|kiem-thu-chuc-nang|kiem-tra-website|noi-dung-bao-mat|google[\da-f]+|game-[\w-]+)\.html$/i;
 function installBanner(){
  if(page==='index.html'||/^(?:lo-trinh-|so-cap-|hoc-theo-bai|bai-hoc)/.test(page)||secured.test(page)||!meta[page]||doc.getElementById('mr4-page-banner'))return;
  const hdr=doc.querySelector('body > header,header.site-header,header.head');
  const main=doc.querySelector('main,#mainContent');
  if(!hdr&&!main)return;
  const section=doc.createElement('section');section.id='mr4-page-banner';section.className='mr4-page-banner';
  section.setAttribute('aria-label','Hình ảnh chuyên mục');
  section.style.setProperty('--mr4-banner-photo','url("'+meta[page]+'")');
  const b=doc.createElement('div');b.className='mr4-page-banner-text';
  const p=doc.createElement('span');p.className='mr4-page-banner-kicker';p.textContent='TIẾNG HÀN MR LEE · KOREAN LEARNING';
  const h=doc.createElement('h2');h.textContent=(doc.title||page.replace('.html','')).split('|')[0].trim().slice(0,90);
  const sub=doc.createElement('p');sub.textContent='Học chắc kiến thức · Rèn kỹ năng · Chinh phục tương lai';
  b.append(p,h,sub);section.append(b);
  if(hdr)hdr.insertAdjacentElement('afterend',section);else main.insertAdjacentElement('beforebegin',section);
 }
 function switcher(){
  if(secured.test(page)||doc.getElementById('mr4-switcher'))return;
  const wrap=doc.createElement('div');wrap.id='mr4-switcher';
  const btn=doc.createElement('button');btn.type='button';btn.id='mr4-switcher-toggle';btn.textContent='◐ Giao diện';btn.setAttribute('aria-expanded','false');
  const menu=doc.createElement('div');menu.id='mr4-switcher-menu';menu.hidden=true;
  [['fresh','☀ Fresh'],['future','✦ Future'],['campus','❖ Campus']].forEach(([key,label])=>{
   const item=doc.createElement('button');item.type='button';item.textContent=label;item.dataset.theme=key;item.setAttribute('aria-pressed',String(theme===key));
   item.addEventListener('click',()=>{
    if(choices.includes(preview)){const u=new URL(location.href);u.searchParams.set('mr4preview',key);location.assign(u.href);return;}
    theme=key;try{localStorage.setItem(KEY,key);localStorage.setItem(LEGACY,key==='future'?'future':'fresh');sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',key==='future'?'future':'fresh')}catch{}
    location.reload();
   });menu.append(item);
  });
  btn.addEventListener('click',()=>{menu.hidden=!menu.hidden;btn.setAttribute('aria-expanded',String(!menu.hidden))});
  doc.addEventListener('pointerdown',e=>{if(!wrap.contains(e.target)){menu.hidden=true;btn.setAttribute('aria-expanded','false')}});
  doc.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;btn.setAttribute('aria-expanded','false')}});
  wrap.append(btn,menu);doc.body.append(wrap);
 }
 function init(){apply();installBanner();switcher()}
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
