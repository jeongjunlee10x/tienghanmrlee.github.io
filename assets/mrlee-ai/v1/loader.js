/* MR LEE AI V1: no broken-image UI before the actual WebP files are published. */
(()=>{'use strict';
if(window.__MRLEE_AI_B1_PROBED)return;
window.__MRLEE_AI_B1_PROBED=true;
const base='assets/mrlee-ai/v1/';
fetch(base+'home.webp',{method:'HEAD',cache:'no-cache'})
 .then(r=>{if(!r.ok)return;const d=document;const style=d.createElement('link');style.rel='stylesheet';style.href=base+'visuals.css?v=20261025-r3';d.head.append(style);const script=d.createElement('script');script.defer=true;script.src=base+'visuals.js?v=20261025-r3';d.head.append(script)})
 .catch(()=>{ /* Keep original branded scene graphics until binary media exist. */ });
})();