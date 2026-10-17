/* MR LEE V30. Deliberately isolated UI addition. Does NOT read or write user data. */
(()=>{'use strict';
  if(!document.documentElement.hasAttribute('data-mrlee-v30'))return;
  if(document.querySelector('.mr30-top'))return;
  const b=document.createElement('button');
  b.className='mr30-top';b.type='button';b.textContent='↑ Đầu trang';
  b.setAttribute('aria-label','Quay lên đầu trang');b.dataset.visible='0';
  b.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  const tick=()=>{b.dataset.visible=(window.scrollY>650?'1':'0');};
  window.addEventListener('scroll',tick,{passive:true});
  document.body.appendChild(b);tick();
})();
