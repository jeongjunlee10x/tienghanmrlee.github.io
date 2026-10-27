/* Repoint homepage entry links and school form without touching legacy learning modules. */
(()=>{'use strict';function route(){/* Keep university map links unchanged; geographic Korea map is a separate route. */
const form=document.getElementById('schoolSearchForm');if(form&&!form.dataset.mrleeRoute){form.dataset.mrleeRoute='1';form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();const v=document.getElementById('schoolSearch')?.value||'',r=document.getElementById('regionSelectMain')?.value||'',t=document.getElementById('typeSelectMain')?.value||'';const qs=new URLSearchParams();if(v.trim())qs.set('q',v.trim());if(r)qs.set('region',r);if(t)qs.set('type',t);location.href='tim-truong.html'+(qs.size?'?'+qs.toString():'')},true)}
// Dedicated scholarship entry on MAIN. Avoid replacing any learning/account elements.
document.querySelectorAll('a.scholarship').forEach(a=>{a.href='hoc-bong-han-quoc.html';a.title='Xem học bổng Chính phủ, đại học và quỹ từ nguồn chính thức'});
for(const nav of document.querySelectorAll('.main-nav,.mobile-nav')){for(const [href,label] of [['tim-truong.html','Tìm trường'],['hoc-bong-han-quoc.html','Học bổng']]){if(!nav.querySelector('a[href="'+href+'"]')){const a=document.createElement('a');a.href=href;a.textContent=label;nav.append(a)}}}
/* Dedicated scholarship card already exists beside the real ranking. No duplicated full-width injection. */
const qs=document.querySelectorAll('a[href="tim-truong.html"]');qs.forEach(a=>{a.setAttribute('aria-label',a.getAttribute('aria-label')||'Tìm trường Hàn Quốc')})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',route);else route()})();
