/* V14: Add admissions link to existing MR LEE home nav; fallback to compact visible link. */
(() => {
  'use strict';
  if(document.getElementById('mrlee-admissions-nav-link'))return;
  const link=document.createElement('a');
  link.id='mrlee-admissions-nav-link';link.href='tuyen-sinh.html';link.textContent='🎓 Tuyển sinh';
  link.setAttribute('aria-label','Mở trang tuyển sinh du học Hàn Quốc MR LEE');
  // Pick a navigation area that is already visible; avoid altering login/dropdown widgets.
  const candidates=[...document.querySelectorAll('header nav, nav[aria-label], header .nav-links, header .menu, header .navbar-nav, .main-nav, .navbar nav')];
  const nav=candidates.find(n=>n.querySelector('a[href]') && !n.closest('[hidden]'));
  if(nav){link.className='mrlee-admissions-added-link';nav.append(link);}
  else{link.className='mrlee-admissions-floating-link';document.body.append(link);}
})();
