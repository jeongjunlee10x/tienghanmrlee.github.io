(() => {
'use strict';
const items=Array.isArray(window.MRLEE_TOPIK_LIBRARY_121)?window.MRLEE_TOPIK_LIBRARY_121:[];
const K='mrlee_topik_121_audio_review';
let grades={}; try {grades=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch{}
const el=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let pg=0;
function filtered(){const level=el('level').value, search=el('query').value.trim().toLowerCase(),status=el('status').value;
return items.filter(x=>(level==='all'||String(x.level)===level)&&(!search||(x.id+' '+x.script).toLowerCase().includes(search))&&(status==='all'||(grades[x.id]||'unchecked')===status));}
function render(){const a=filtered(),pageCount=Math.max(1,Math.ceil(a.length/12));pg=Math.min(pg,pageCount-1);const ok=Object.values(grades).filter(x=>x==='ok').length,redo=Object.values(grades).filter(x=>x==='redo').length;
el('overview').textContent=`Đã kiểm âm đạt: ${ok}/${items.length} · Cần sửa: ${redo} · Đang hiển thị: ${a.length} câu`;el('items').innerHTML=a.slice(pg*12,(pg+1)*12).map(x=>{const status=grades[x.id]||'unchecked';return `<article class="card" data-id="${esc(x.id)}"><h2>${esc(x.id)}</h2><div class="meta">TOPIK ${x.level===1?'I':'II'} · ${status==='ok'?'Đã đạt':status==='redo'?'Cần sửa':'Chưa kiểm'}</div><audio controls preload="none" data-src="topik-audio/${encodeURIComponent(x.id)}.mp3?v=122" src="topik-audio/${encodeURIComponent(x.id)}.mp3?v=122"></audio><div class="row"><button data-action="slow">Nghe chậm 0,8×</button><button data-action="normal">Tốc độ 1×</button><button data-action="ok">✓ Đã đạt</button><button data-action="redo">↻ Cần sửa</button><span class="state ${status==='ok'?'ok':status==='redo'?'redo':''}" aria-live="polite">${status==='ok'?'Đạt':status==='redo'?'Cần sửa':'Chưa đánh giá'}</span></div><details><summary>Hiện lời thoại tiếng Hàn</summary><p lang="ko" class="ko">${esc(x.script)}</p></details><div class="meta error" aria-live="polite"></div></article>`}).join('')||'<p>Không có câu nào phù hợp.</p>';
el('pager').innerHTML=`<button data-page="-1" ${pg===0?'disabled':''}>← Trước</button><span>Trang ${pg+1}/${pageCount}</span><button data-page="1" ${pg===pageCount-1?'disabled':''}>Sau →</button>`;}
['level','status'].forEach(id=>el(id).addEventListener('change',()=>{pg=0;render()}));el('query').addEventListener('input',()=>{pg=0;render()});
el('pager').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b){pg+=Number(b.dataset.page);render();}});
el('items').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const card=b.closest('[data-id]'),a=card.querySelector('audio'),act=b.dataset.action,id=card.dataset.id;
if(act==='slow'||act==='normal'){a.playbackRate=act==='slow'?.8:1;a.play().catch(()=>{card.querySelector('.error').textContent='Không phát được file âm thanh. Kiểm tra tên file MP3 và chạy trên localhost.';});return;}
if(act==='ok'||act==='redo'){grades[id]=act;localStorage.setItem(K,JSON.stringify(grades));render();}});
el('items').addEventListener('error',e=>{if(e.target.matches('audio'))e.target.closest('.card').querySelector('.error').textContent='Không tải được MP3 tương ứng. Kiểm tra đường dẫn topik-audio/ và file thực tế.'},true);
el('export').addEventListener('click',()=>{const csv=[['id','level','status'],...items.map(x=>[x.id,'TOPIK '+(x.level===1?'I':'II'),grades[x.id]||'unchecked'])].map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='MRLEE_KIEM_AM_124_CAU.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);});
render();
})();
