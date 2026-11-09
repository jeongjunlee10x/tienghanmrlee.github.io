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
 function loadImageQuality(){
  // Several primary pages already include the image loader in their HTML.
  // Compare by resource URL instead of only by the dataset marker, otherwise
  // one page fetches and executes the same script twice.
  const hasAsset=(selector,file,attribute)=>Array.from(document.querySelectorAll(selector)).some(node=>{
   const raw=node.getAttribute(attribute)||'';
   try{return new URL(raw,document.baseURI).pathname.endsWith('/assets/branding/'+file)}
   catch{return false}
  });
  if(!hasAsset('link[rel~="stylesheet"]','media-quality-v3.css','href')){
   const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('media-quality-v3.css?v=20261109-media3',current.src).href;
   css.dataset.mrleeImageQuality='css';document.head.append(css);
  }
  if(!hasAsset('script[src]','media-quality-v3.js','src')){
   const script=document.createElement('script');script.src=new URL('media-quality-v3.js?v=20261109-media3',current.src).href;
   script.defer=true;script.dataset.mrleeImageQuality='js';document.head.append(script);
  }
 }
 function loadContactDock(){
  if(location.pathname.toLowerCase().endsWith('/admin.html'))return;
  // Native details/summary exists in HTML on main pages and is generated here on
  // other public pages. It is visible and toggleable without any second JS bundle.
  if(!document.getElementById('mrleeContactNative')){
   document.body.insertAdjacentHTML('beforeend',"<!-- MR LEE contact V5: native HTML, visible even if contact JavaScript does not load. -->\n<details id=\"mrleeContactNative\" aria-label=\"Liên hệ nhanh MR LEE\" style=\"position:fixed!important;right:14px!important;bottom:96px!important;z-index:10020!important;display:block!important;visibility:visible!important;opacity:1!important\">\n <summary style=\"display:list-item;min-height:46px;background:#094a86;color:#fff;border:2px solid #fff;border-radius:999px;padding:12px 15px;font-weight:850;cursor:pointer\"><span class=\"mrlee-native-open-label\">☎ Liên hệ</span><span class=\"mrlee-native-close-label\">− Thu gọn liên hệ</span></summary>\n <nav class=\"mrlee-native-links\" aria-label=\"Sáu kênh liên hệ MR LEE\">\n  <a data-channel=\"call\" href=\"tel:+84376991180\">☎ Gọi 0376 991 180</a>\n  <a data-channel=\"zalo\" href=\"https://zalo.me/0376991180\" target=\"_blank\" rel=\"noopener noreferrer\">Z · Zalo MR LEE</a>\n  <a data-channel=\"messenger\" href=\"https://m.me/MRLEEKR10\" target=\"_blank\" rel=\"noopener noreferrer\">M · Messenger MR LEE</a>\n  <a data-channel=\"tiktok\" href=\"https://www.tiktok.com/@hankuc_chemi\" target=\"_blank\" rel=\"noopener noreferrer\">♪ TikTok @hankuc_chemi</a>\n  <a data-channel=\"email\" href=\"mailto:tienghanmrlee@gmail.com\">@ Email MR LEE</a>\n  <button data-channel=\"kakao\" type=\"button\" onclick=\"if(navigator.clipboard){navigator.clipboard.writeText('ycleeee').then(()=>{this.textContent='KakaoTalk: đã sao chép ycleeee'}).catch(()=>{this.textContent='KakaoTalk: ycleeee'})}\">K · KakaoTalk: ycleeee</button>\n </nav>\n</details>\n<!-- /MR LEE contact V5 -->");
  }
  if(!document.querySelector('link[data-mrlee-contact-native]')){
   const css=document.createElement('link');
   css.rel='stylesheet';
   css.href=new URL('contact-native-v5.css?v=20261104-native-v5',current.src).href;
   css.dataset.mrleeContactNative='v5';
   document.head.appendChild(css);
  }
  // Retire only the old floating dock; the native menu holds every original channel.
  document.getElementById('mrleeContactDock')?.remove();
 }
 function favicon(){
  let found=false;for(const link of document.querySelectorAll('link[rel~="icon"]')){link.href=OFFICIAL;link.type='image/png';found=true;}
  if(!found){const link=document.createElement('link');link.rel='icon';link.type='image/png';link.href=OFFICIAL;document.head.appendChild(link);}
 }
 function start(){applyElement(document.body);favicon();loadImageQuality();loadContactDock();
  const observer=new MutationObserver(changes=>{for(const change of changes){if(change.type==='attributes'){applyElement(change.target);}else for(const child of change.addedNodes)applyElement(child);}});
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
