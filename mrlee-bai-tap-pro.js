/* MR LEE workbook: fifteen independent six-question exercise sets per lesson. */
(()=>{'use strict';
const $=id=>document.getElementById(id), enc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search);
let db={},selected=null,answered=false,progress=0,stats={correct:0,wrong:0,skipped:0},audioReady=false;
const lv=$('workLevel'),les=$('workLesson'),profile=$('workProfile');
function sprofile(){return (profile.value.trim()||'hocvien-001').replace(/[^\w-]/g,'_').slice(0,48)}
function key(){return `MRLEE.PRO.WORKBOOK.${sprofile()}.${lv.value}.${les.value}`}
function read(){try{return JSON.parse(localStorage.getItem(key())||'{}')}catch{return {}}}
function save(unitId,value){const curr=read();curr[unitId]=value;try{localStorage.setItem(key(),JSON.stringify(curr));localStorage.setItem('MRLEE.PRO.PROFILE',sprofile())}catch(e){console.warn('Khong luu duoc tien do',e)}}
function current(){return db[`${lv.value}-${String(les.value).padStart(2,'0')}`]}
function populate(){const retain=Number(les.value)||1;les.replaceChildren();for(let i=1;i<=15;i++){const opt=new Option('Bài '+i,String(i));les.add(opt)}les.value=String(retain);refresh()}
function refresh(){const d=current(),history=read();selected=null;progress=0;stats={correct:0,wrong:0,skipped:0};if(!d){$('workSummary').textContent='Chưa tìm thấy dữ liệu cấp và bài này.';return}
 document.title=`Bài ${les.value} – 15 bộ bài tập | MR LEE`;
 $('workHeading').textContent=`Cấp ${lv.value} · Bài ${les.value}: ${d.title}`;
 $('backToLesson').href=`hoc-theo-bai.html?cap=${lv.value}&bai=${les.value}`;
 const done=d.exercises.filter(e=>history[e.id]).length;
 $('workSummary').textContent=`Đã hoàn thành ${done}/15 bộ · ${d.exercises.reduce((n,e)=>n+e.questions.length,0)} câu · 10 câu nghe ở trang học.`;
 const box=$('workList');box.replaceChildren();
 for(const unit of d.exercises){const b=document.createElement('button');b.type='button';b.className='pro-work-item';const saved=history[unit.id];b.innerHTML=`<strong>${enc(String(unit.number).padStart(2,'0'))}. ${enc(unit.title)}</strong><small>${unit.questions.length} câu · ${saved?`Điểm tốt nhất ${saved.best}/${unit.questions.length}`:'Chưa làm'}</small>`;b.onclick=()=>start(unit);box.append(b)}
 $('workGame').innerHTML='<h2>Sẵn sàng luyện</h2><p>Chọn một trong 15 bộ bài tập bên trên. Mỗi bộ có kết quả độc lập.</p>';
}
function start(unit){selected=unit;progress=0;stats={correct:0,wrong:0,skipped:0};$('workGame').scrollIntoView({behavior:'smooth',block:'start'});show()}
function show(){const game=$('workGame');if(!selected)return;if(progress>=selected.questions.length){finish();return}
 const q=selected.questions[progress];answered=false;audioReady=!q.audio;
 const template=`<p><span class="pro-tag">Bộ ${selected.number}/15</span><span class="pro-tag">${enc(q.type)}</span><strong>Câu ${progress+1}/${selected.questions.length}</strong></p><div class="pro-progress"><div style="width:${100*progress/selected.questions.length}%"></div></div>${q.passage?`<div class="pro-passage" lang="ko">${enc(q.passage)}</div>`:''}<p class="pro-question">${enc(q.prompt)}</p>${q.audio?`<audio id="unitPlayer" class="pro-player" controls preload="metadata"></audio><p id="workAudioStatus">Đang kiểm tra tệp nghe...</p>`:''}<div id="workChoices" class="pro-choices">${q.options.map((x,i)=>`<button type="button" data-answer="${i}" ${q.audio?'disabled':''}>${'ABCD'[i]}. ${enc(x)}</button>`).join('')}</div><div id="workFeedback" class="pro-feedback" hidden></div><div class="pro-footeractions"><button id="workSkip" type="button">Bỏ qua</button><button id="workNext" type="button" class="pro-primary" hidden>${progress+1===selected.questions.length?'Xem kết quả':'Câu tiếp theo →'}</button></div>`;
 game.innerHTML=template;
 game.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));
 $('workSkip').onclick=()=>{if(!answered){stats.skipped++;progress++;show()}};
 $('workNext').onclick=()=>{progress++;show()};
 if(q.audio){const a=$('unitPlayer');a.src=encodeURI(q.audio);a.onloadedmetadata=()=>{audioReady=true;$('workAudioStatus').textContent='MP3 đã tải. Nhấn ▶ để nghe trước khi trả lời.';game.querySelectorAll('[data-answer]').forEach(b=>b.disabled=false)};
 a.onerror=()=>{audioReady=false;$('workAudioStatus').textContent='MP3 không tải được. Hãy bỏ qua, không bị tính sai.'};}
}
function answer(choice){if(answered||!selected||!audioReady)return;answered=true;const q=selected.questions[progress],ok=choice===q.answer;
 if(ok)stats.correct++;else stats.wrong++;
 $('workChoices').querySelectorAll('[data-answer]').forEach(b=>{b.disabled=true;const idx=Number(b.dataset.answer);if(idx===q.answer)b.classList.add('right');else if(idx===choice)b.classList.add('wrong')});
 const fb=$('workFeedback');fb.hidden=false;fb.textContent=(ok?'✓ Chính xác.':'✗ Chưa đúng.')+'\nĐáp án: '+q.options[q.answer]+'\n'+(q.explain||'');
 $('workSkip').hidden=true;$('workNext').hidden=false;
}
function finish(){const history=read()[selected.id]||{best:0,attempts:0};const graded=stats.correct+stats.wrong,pct=graded?Math.round(stats.correct/graded*100):0;
 save(selected.id,{best:Math.max(history.best,stats.correct),attempts:history.attempts+1,last:Date.now(),correct:stats.correct,wrong:stats.wrong,skipped:stats.skipped});
 $('workGame').innerHTML=`<h2>Hoàn thành bộ ${selected.number}: ${enc(selected.title)}</h2><div class="pro-stats"><div><strong>${stats.correct}/${selected.questions.length}</strong><small>Câu đúng</small></div><div><strong>${stats.wrong}</strong><small>Câu sai</small></div><div><strong>${stats.skipped}</strong><small>Bỏ qua</small></div><div><strong>${pct}%</strong><small>Đúng trên câu đã chấm</small></div></div><div class="pro-actions"><button id="workRepeat" class="pro-primary">Làm lại bộ này</button><button id="workReturn">Chọn bộ khác</button></div>`;
 const completed=selected;$('workRepeat').onclick=()=>start(completed);$('workReturn').onclick=()=>{$('workListPanel').scrollIntoView({behavior:'smooth'})};
 // Refresh badges without interrupting result display.
 const h=read();$('workSummary').textContent=`Đã hoàn thành ${current().exercises.filter(e=>h[e.id]).length}/15 bộ.`;
 const buttons=$('workList').querySelectorAll('button');current().exercises.forEach((e,i)=>{let small=buttons[i]?.querySelector('small');if(small&&h[e.id])small.textContent=`6 câu · Điểm tốt nhất ${h[e.id].best}/6`});
}
for(const x of [lv,les,profile])x.addEventListener('change',()=>{if(x===lv)populate();else refresh()});
profile.addEventListener('blur',refresh);
try{profile.value=localStorage.getItem('MRLEE.PRO.PROFILE')||'hocvien-001'}catch{}
if(/[1-6]/.test(params.get('cap')||''))lv.value=params.get('cap');
populate();if(params.get('bai')&&Number(params.get('bai'))>=1&&Number(params.get('bai'))<=15)les.value=String(Number(params.get('bai')));
fetch('mrlee-pro-lessons.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{db=d;refresh();const tap=Number(params.get('tap'));if(tap>=1&&tap<=15)start(current().exercises[tap-1])}).catch(e=>{$('workSummary').textContent='Không tải được dữ liệu: '+e.message});
})();
