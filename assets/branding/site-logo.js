/* MR LEE — single source of truth. Không thay logo đối tác/trường. */
(()=>{'use strict';
 const current=document.currentScript;
 const OFFICIAL=new URL('logo-mrlee.png?v=20261026-meme1',current.src).href;
 const MARK=/^(?:L|MR|MR\.|🎓)$/i;
 const PICTURE=/(?:^|\/)assets\/branding\/logo-mrlee\.png(?:[?#].*)?$|(?:^|\/)images\/logo\.png(?:[?#].*)?$|(?:^|\/)assets\/v(?:16|17|18|19|192|193|20)\/brand\.svg(?:[?#].*)?$|(?:^|\/)assets\/mrlee-admissions-mark\.svg(?:[?#].*)?$/i;
 function setLogo(img){
  if(!img||img.tagName!=='IMG')return;
  if(img.src!==OFFICIAL){img.onerror=null;img.src=OFFICIAL;}
  img.classList.add('mrlee-approved-logo');img.setAttribute('alt','Logo meme chính thức TIẾNG HÀN MR LEE');
  const anchor=img.closest('a');if(anchor&&/\b(?:brand|logo|site-logo|tv-brand|ts-brand|m10-brand|ml-ai-brand)\b/i.test(anchor.className||''))anchor.dataset.mrleeOfficialBrand='1';
 }
 function applyElement(el){
  if(!el||el.nodeType!==1)return;
  if(el.tagName==='IMG'){
   const src=el.getAttribute('src')||'';
   const isBrandSrc=PICTURE.test(src)||src===OFFICIAL;
   const brandContext=el.closest('a.brand,a.site-logo,a.logo,a.tv-brand,a.m10-brand,a.ml-ai-brand,.ts-brand-symbol,#siteLogo,#brandLogo');
   if(isBrandSrc||(brandContext&&/logo|brand|MR.?LEE|tiếng hàn/i.test(src+' '+(el.alt||''))))setLogo(el);
  }
  const nodes=el.matches?.('.auth-head .brandmark,.sidebrand .brandmark,.top a.brand .brandmark,.site-logo .logo-symbol,.ts-brand-symbol .ts-logo-fallback')?[el]:[];
  if(el.querySelectorAll)nodes.push(...el.querySelectorAll('.auth-head .brandmark,.sidebrand .brandmark,.top a.brand .brandmark,.site-logo .logo-symbol,.ts-brand-symbol .ts-logo-fallback'));
  for(const holder of nodes){
   if(holder.dataset.mrleeOfficialBrand==='1')continue;
   if(!MARK.test((holder.textContent||'').trim()))continue;
   const logo=document.createElement('img');logo.alt='Logo meme chính thức TIẾNG HÀN MR LEE';
   holder.replaceChildren(logo);holder.dataset.mrleeOfficialBrand='1';setLogo(logo);
  }
  if(el.querySelectorAll){
   const candidates=el.querySelectorAll('img[src*="logo.png"],img[src*="brand.svg"],#siteLogo,#brandLogo,.ts-brand-symbol img,header .brand img,header .site-logo img,header .logo img');
   for(const img of candidates)applyElement(img);
  }
 }
 function favicon(){
  let found=false;for(const link of document.querySelectorAll('link[rel~="icon"]')){link.href=OFFICIAL;link.type='image/png';found=true;}
  if(!found){const link=document.createElement('link');link.rel='icon';link.type='image/png';link.href=OFFICIAL;document.head.appendChild(link);}
 }
 function start(){applyElement(document.body);favicon();
  const observer=new MutationObserver(changes=>{for(const change of changes){if(change.type==='attributes'){applyElement(change.target);}else for(const child of change.addedNodes)applyElement(child);}});
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
