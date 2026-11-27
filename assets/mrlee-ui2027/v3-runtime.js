/* MR LEE V3 — minimal visual boot, no account or gameplay changes.
 * Reads the existing theme preference ONLY on pages without the shared theme
 * controller. All buttons, menus and page content remain owned by original JS.
 */
(()=>{'use strict';
 const root=document.documentElement;
 if(!root.hasAttribute('data-mrlee-v3-ui'))root.setAttribute('data-mrlee-v3-ui','1');
 if(!root.dataset.mrleeV3Scope){
  const path=location.pathname.split('/').filter(Boolean).pop()||'index.html';
  root.dataset.mrleeV3Scope=/^(?:admin)(?:\.html)?$/i.test(path)?'admin':
   /^(?:game-[\w-]+|mrlee-game-arena|tro-choi-tieng-han|quan-tri-tro-choi)(?:\.html)?$/i.test(path)?'game':'site';
 }
 // Shared Fresh/Future controller takes precedence wherever installed.
 const hasSharedTheme=!!document.querySelector('script[src*="mrlee-dual-ui/theme.js"]');
 if(!hasSharedTheme){
  let theme='fresh';
  try{theme=localStorage.getItem('MRLEE.THEME.V1')==='future'?'future':'fresh'}catch{}
  root.dataset.mrleeTheme=theme;
 }
})();

/* MR LEE UI40: load visual-only theme pack for public pages */
(()=>{'use strict';
 const name=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
 if(['fresh','future'].includes(document.documentElement.dataset.mrleeHomeMode))return; // Dedicated home pages use their own static artwork and switch links.
 if(/^(?:admin|dang-nhap|quan-tri-tro-choi|kiem-thu-chuc-nang|kiem-tra-website|noi-dung-bao-mat|game-[\w-]+)(?:\.html)?$/i.test(name))return;
 if(document.querySelector('link[data-mr4-launch]'))return;
 const root='assets/mrlee-skinpack/';
 const link=document.createElement('link');link.rel='stylesheet';link.href=root+'skinpack.css?v=20261123';link.dataset.mr4Launch='1';document.head.append(link);
 const load=(f,next)=>{const el=document.createElement('script');el.src=root+f+'?v=20261123';el.onload=()=>{if(next)next()};el.onerror=()=>console.warn('MRLEE4 asset missing:',f);document.head.append(el)};
 load('theme-default.js',()=>load('page-images.js',()=>load('skinpack.js')));
})();
