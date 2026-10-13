/* MR LEE - 30 bài SC1/SC2; áp dụng tăng cường vào trang đang có,
   KHÔNG thay thế trang chủ, bài kiểm tra, bảng xếp hạng hay trạng thái đăng nhập. */
(function () {
  'use strict';
  function make(tag, cls, text) {
    const el=document.createElement(tag);
    if (cls) el.className=cls;
    if (text!==undefined) el.textContent=text;
    return el;
  }
  function boot() {
    const data=window.MRLEE_SC_CURRICULUM;
    if (!data || !Array.isArray(data.lessons)) return;
    const m=(window.location.pathname || '').match(/so-cap-([12])\.html$/i);
    const level=m?Number(m[1]):(document.title.includes('Sơ cấp 2')?2:1);
    document.querySelectorAll('article.lesson').forEach((article,i)=>{
      const lessonNo=Number((article.id||'').match(/\d+/)?.[0] || (i+1));
      const record=data.lessons.find(x=>x.cap===level && x.bai===lessonNo);
      if (!record) return;
      const target=article.querySelector('.grammar-clean, .mrlee-sc-grammar-grid');
      if (target && Array.isArray(record.grammar)) {
        const grid=make('div','mrlee-sc-grammar-grid');
        grid.dataset.source='van-ban-giao-trinh-2026-10-13';
        record.grammar.forEach(g=>{
          const card=make('section','mrlee-sc-grammar-card');
          const head=make('div','mrlee-sc-grammar-head');
          const f=make('strong','',g.formula); f.lang='ko'; head.append(f,make('span','',g.meaning));
          card.append(head,make('p','mrlee-sc-usage',g.usage),make('p','mrlee-sc-example',g.example));
          grid.append(card);
        });
        target.replaceWith(grid);
      }
      const corrections=data.vocab_corrections.filter(x=>x.cap===level&&x.bai===lessonNo);
      if(corrections.length){
        const entries=Array.from(article.querySelectorAll('.vocab-table tbody tr'));
        corrections.forEach(c=>{
          for(const row of entries){
            const cells=Array.from(row.querySelectorAll('td'));
            for(const col of [0,2]){
              if(cells.length>col+1 && cells[col].textContent.trim()===c.tu_cu){
                cells[col].textContent=c.tu_moi;
                cells[col+1].textContent=c.nghia_moi;
                cells[col].classList.add('mrlee-sc-corrected');
                cells[col+1].classList.add('mrlee-sc-corrected');
              }
            }
          }
        });
      }
    });
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
