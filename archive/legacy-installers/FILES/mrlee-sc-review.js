/* MR LEE: add reading support to the existing 15 lessons on each page.
   Phase 1 DOES NOT change Korean words, Vietnamese meanings or grammar content. */
(function(){
  'use strict';
  const boot = () => {
    document.querySelectorAll('article.lesson').forEach((lesson) => {
      if (lesson.querySelector('.mrlee-sc-toolbox')) return;
      const table = lesson.querySelector('.vocab-table');
      if (!table) return;
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      if (!rows.length) return;
      const section = table.closest('.lesson-section');
      const wrap = table.closest('.vocab-table-wrap') || table;
      if (!section || !wrap || !wrap.parentNode) return;
      const tools = document.createElement('div');
      tools.className = 'mrlee-sc-toolbox';
      tools.setAttribute('aria-label', 'Cong cu hoc tu vung');
      const label=document.createElement('label');
      const search=document.createElement('input');
      search.type='search';
      search.placeholder='Tìm tiếng Hàn hoặc nghĩa tiếng Việt';
      search.setAttribute('aria-label','Tìm từ vựng trong bài này');
      const id='mrlee-sc-search-'+lesson.id;
      search.id=id;
      label.htmlFor=id;
      label.textContent='Tra từ vựng';
      const toggle=document.createElement('button');
      toggle.type='button';
      toggle.textContent='Ẩn nghĩa để tự kiểm tra';
      toggle.setAttribute('aria-pressed','false');
      const counter=document.createElement('span');
      counter.className='mrlee-sc-count';
      counter.setAttribute('role','status');
      counter.setAttribute('aria-live','polite');
      const note=document.createElement('p');
      note.className='mrlee-sc-noresults';
      note.textContent='Không có từ phù hợp. Hãy thử cách viết khác.';
      note.hidden=true;
      const update=()=>{
        const q=search.value.trim().normalize('NFKC').toLocaleLowerCase('vi');
        let visible=0;
        rows.forEach((row)=>{
          const match=row.textContent.normalize('NFKC').toLocaleLowerCase('vi').includes(q);
          row.hidden=!match;
          if(match) visible++;
        });
        counter.textContent=visible+'/'+rows.length+' dòng';
        note.hidden=visible!==0;
      };
      search.addEventListener('input',update);
      toggle.addEventListener('click',()=>{
        const isHidden=lesson.classList.toggle('mrlee-sc-hidden-meaning');
        toggle.textContent=isHidden?'Hiện nghĩa tiếng Việt':'Ẩn nghĩa để tự kiểm tra';
        toggle.setAttribute('aria-pressed',String(isHidden));
      });
      tools.append(label,search,toggle,counter);
      wrap.parentNode.insertBefore(tools,wrap);
      wrap.parentNode.insertBefore(note,wrap.nextSibling);
      update();
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
