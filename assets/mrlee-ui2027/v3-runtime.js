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
