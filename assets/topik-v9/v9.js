/* MR LEE · TOPIK PRO Daily Lesson V9. Original educational content.
   Extends V8 without reading or writing Firebase, rankings, account or private data. */
(()=>{'use strict';
const root=document.getElementById('mrleeTopikV8');if(!root)return;
const H=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q=s=>root.querySelector(s);
const storePrefix='MRLEE.TOPIK.ROADMAP.V9.';
function get(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function put(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
let payload=null,waiting=null,shown=null;
function mappedLesson(level,day,total){const list=payload?.lessons[String(level)]||[];if(!list.length)return null;const baseDay=day===total?list.length:Math.min(list.length,Math.floor((day-1)*list.length/total)+1);return list[baseDay-1]}
function scoreKey(level,day,total){return storePrefix+'CHECK.'+level+'.'+total+'.'+day}
function draftKey(level,day,total){return storePrefix+'DRAFT.'+level+'.'+total+'.'+day}
function renderGuide(g){if(!g)return '';
 return `<div class="v9-workshop"><div class="v9-kicker">CHUYÊN ĐỀ 쓰기 PBT</div><h4>${H(g.title)}</h4><p>${H(g.focus)}</p><div class="v9-columns"><div><b>Trình tự viết</b><ol>${g.steps.map(x=>`<li>${H(x)}</li>`).join('')}</ol></div><div><b>Những lỗi phải tránh</b><ul>${g.pitfalls.map(x=>`<li>${H(x)}</li>`).join('')}</ul></div></div><div class="v9-example" lang="ko">${H(g.model_ko)}<span>${H(g.model_vi)}</span></div></div>`}
function buildDetails(detail){const {level,day,days,format}=detail;
 const data=mappedLesson(level,day,days);if(!data)return '';
 const note=(format==='IBT' && level===2)?'<p class="v9-note">Bạn đang chọn IBT. Phần hướng dẫn 51–54 bên dưới áp dụng cho <strong>PBT</strong> và nhằm rèn nền tảng viết; IBT có cấu trúc Viết riêng (3 câu), không sử dụng đúng số câu 51–54.</p>':'';
 const saved=get(scoreKey(level,day,days),null);
 const vocab=`<section class="v9-section" id="v9-vocab"><div class="v9-section-title"><span>I</span><h4>TỪ VỰNG · 어휘</h4><small>${data.vocabulary.length} từ</small></div><p class="v9-sub">Học cách đọc, nghĩa và đặt câu theo chủ đề <strong>${H(data.theme)}</strong>.</p><div class="v9-wordgrid">${data.vocabulary.map((w,i)=>`<div class="v9-word"><b lang="ko">${H(w.ko)}</b><span>${H(w.vi)}</span><em>${String(i+1).padStart(2,'0')}</em></div>`).join('')}</div></section>`;
 const grammar=`<section class="v9-section" id="v9-grammar"><div class="v9-section-title"><span>II</span><h4>NGỮ PHÁP · 문법</h4><small>2 điểm</small></div><div class="v9-grammargrid">${data.grammar.map(g=>`<div class="v9-grammar"><h5 lang="ko">${H(g.pattern)}</h5><p>${H(g.meaning)}</p><p class="v9-korean" lang="ko">${H(g.example_ko)}</p><small>${H(g.example_vi)}</small></div>`).join('')}</div></section>`;
 const examples=`<section class="v9-section" id="v9-examples"><div class="v9-section-title"><span>III</span><h4>VÍ DỤ MẪU CÂU · 예문</h4><small>${data.examples.length} câu</small></div>${data.examples.map((e,i)=>`<div class="v9-example"><span class="v9-num">${i+1}</span><b lang="ko">${H(e.ko)}</b><span>${H(e.vi)}</span></div>`).join('')}</section>`;
 const quiz=`<section class="v9-section" id="v9-exercises"><div class="v9-section-title"><span>IV</span><h4>BÀI TẬP GẮN DẠNG ĐỀ THI</h4><small>${data.exercises.length} câu bổ trợ + V8</small></div><p class="v9-sub">${H(data.exam_link.skill)}. Đây là câu mô phỏng mới, không sao chép đề phát hành.</p><div class="v9-quizlist">${data.exercises.map((item,i)=>`<fieldset class="v9-question" data-v9-question="${i}"><legend>${i+1}. ${H(item.stem)}</legend>${item.choices.map((t,j)=>`<label class="v9-choice"><input type="radio" name="v9-${level}-${day}-${i}" value="${j}" ${saved?.answers?.[i]===j?'checked':''}><span>${String.fromCharCode(65+j)}. ${H(t)}</span></label>`).join('')}<div class="v9-explanation" data-v9-explanation="${i}" hidden></div></fieldset>`).join('')}</div><div class="v9-controls"><button class="v9-btn v9-check" type="button" data-v9-check>✓ Chấm bài bổ trợ</button><span class="v9-note" data-v9-result aria-live="polite"></span></div><p class="v9-note">Sau khi chấm, làm tiếp phần <b>8 câu luyện tập V8 bên dưới</b>, trong đó có luyện nghe/đọc và giải thích đáp án.</p></section>`;
 const w=data.writing;
 const writing=(level===2 && w)?`<section class="v9-section v9-writing" id="v9-writing"><div class="v9-section-title"><span>V</span><h4>CHỦ ĐỀ VIẾT · 쓰기</h4><small>Bài ${w.type} (PBT)</small></div>${note}<p class="v9-sub">${H(w.tip)}</p><div class="v9-writingtask"><div class="v9-kicker">BÀI VIẾT NGÀY ${day} · THEO CHỦ ĐỀ</div><p lang="ko">${H(w.prompt)}</p><p>${H(w.constraint)}</p></div>${data.workshop?renderGuide(data.workshop):''}<label class="v9-draftlabel" for="v9-draft">Bài viết của bạn (lưu trên trình duyệt, không tự nộp)</label><textarea id="v9-draft" class="v9-draft" rows="8" spellcheck="false" placeholder="Nhập bài viết bằng tiếng Hàn...">${H(get(draftKey(level,day,days),''))}</textarea><div class="v9-controls"><span id="v9-charcount">0 ký tự (ước lượng)</span><span class="v9-note" id="v9-save-status" role="status"></span></div><details class="v9-selfcheck"><summary>Checklist tự chữa bài & gợi ý luyện viết</summary><ul>${w.check.map(x=>`<li>${H(x)}</li>`).join('')}</ul><p>Mẫu diễn đạt tham khảo (không dùng thay thế bài riêng):</p><div class="v9-korean" lang="ko">${H(w.starter)}</div></details></section>`:'';
 return `<div id="mrleeV9Lesson" class="v9-lesson" data-v9-level="${level}" data-v9-day="${day}" data-v9-days="${days}" data-v9-mode="${H(format)}"><div class="v9-header"><div><div class="v9-kicker">MR LEE TOPIK PRO V9 · NGÀY ${day}/${days}</div><h3>Giáo án mỗi ngày · 4${level===2?' + 1':''} phần</h3><p>${H(data.title)} · Chủ đề <span lang="ko">${H(data.theme)}</span></p></div><div class="v9-version">Nội dung ${H(payload.version)}</div></div><nav class="v9-toc" aria-label="Các phần bài học"><a href="#v9-vocab">I. Từ vựng</a><a href="#v9-grammar">II. Ngữ pháp</a><a href="#v9-examples">III. Mẫu câu</a><a href="#v9-exercises">IV. Bài tập</a>${level===2?'<a href="#v9-writing">V. Viết</a>':''}</nav>${vocab}${grammar}${examples}${quiz}${writing}${data.last?'<p class="v9-endnote">Đây là ngày thi thử cuối khóa: ôn ngắn năm phần trước, sau đó nhấn <b>Bắt đầu thi thử đầy đủ</b> phía dưới.</p>':''}<footer class="v9-foot"><a target="_blank" rel="noopener noreferrer" href="https://www.niied.go.kr/web/niied/contents/niied_topik">Tham khảo định dạng TOPIK chính thức (NIIED)</a><span>Tiến độ V8 và bài viết V9 lưu riêng trên thiết bị · Không công khai dữ liệu học viên</span></footer></div>`;
}
function lessonEvent(detail){waiting=detail;if(!payload)return;const target=q('#v8-content');if(!target)return; const day=detail.day;
 // This is not a replacement of the exam engine: only augment the daily lesson section.
 if(q('#v8-timer'))return;
 const prev=q('#mrleeV9Lesson');if(prev)prev.remove();
 const lesson=document.createElement('div');lesson.innerHTML=buildDetails(detail);
 if(!lesson.firstElementChild)return;
 const first=target.querySelector('section.v8-card');if(!first)return;
 const content=lesson.firstElementChild;
 const questions=first.querySelector('#v8-questions');
 if(questions){let anchor=questions;if(anchor.previousElementSibling?.classList.contains('v8-muted'))anchor=anchor.previousElementSibling;if(anchor.previousElementSibling?.tagName==='H3')anchor=anchor.previousElementSibling;first.insertBefore(content,anchor)}else{first.appendChild(content)};
 shown={...detail};waiting=null;
 const ta=q('#v9-draft');if(ta){const counter=q('#v9-charcount');if(counter)counter.textContent=Array.from(ta.value).length+' ký tự (ước lượng)'}
}
window.addEventListener('mrlee:topik-day',e=>{if(e.detail?.level&&e.detail?.day)lessonEvent(e.detail)});
root.addEventListener('click',e=>{const b=e.target.closest('[data-v9-check]');if(!b||!shown||!payload)return;
 const data=mappedLesson(shown.level,shown.day,shown.days);let correct=0,count=0,answers={};
 data.exercises.forEach((item,i)=>{const question=q(`[data-v9-question="${i}"]`),picked=question?.querySelector('input:checked');const explanation=q(`[data-v9-explanation="${i}"]`);if(!picked){if(explanation){explanation.hidden=false;explanation.textContent='Chưa chọn đáp án.'}return}
 const choice=Number(picked.value);answers[i]=choice;count++;if(choice===item.answer)correct++;
 if(explanation){explanation.hidden=false;explanation.classList.toggle('v9-right',choice===item.answer);explanation.textContent=(choice===item.answer?'✓ Chính xác. ':'✕ Cần ôn lại. ')+item.explain;}
 });
 const result=q('[data-v9-result]');if(result)result.textContent=`Đúng ${correct}/${count} câu đã chọn · ${data.exercises.length} câu tổng cộng`;
 put(scoreKey(shown.level,shown.day,shown.days),{answers,correct,count,total:data.exercises.length,updated:new Date().toISOString()});
 });
root.addEventListener('input',e=>{if(e.target.id!=='v9-draft'||!shown)return;const val=e.target.value;
 put(draftKey(shown.level,shown.day,shown.days),val);
 const n=q('#v9-charcount'),s=q('#v9-save-status');if(n)n.textContent=Array.from(val).length+' ký tự (ước lượng)';if(s)s.textContent='Bản nháp đã lưu trên thiết bị';
 });
fetch('assets/topik-v9/lessons.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{if(d.lessons?.['1']?.length!==30||d.lessons?.['2']?.length!==60)throw Error('Dữ liệu V9 chưa đủ 90 ngày');payload=d;if(waiting)lessonEvent(waiting);
 // Notify about updated teaching content without losing the user's current work.
 const notice=document.createElement('div');notice.id='v9-notice';notice.textContent='✓ TOPIK PRO V9: mỗi ngày có Từ vựng · Ngữ pháp · Mẫu câu · Bài tập'+(true?' · Viết TOPIK II':'')+'.';
 const controls=q('#v8-controls');if(controls)controls.append(notice);
 setInterval(async()=>{try{const res=await fetch('assets/topik-v9/lessons.json?check='+Math.floor(Date.now()/300000),{cache:'no-store'});if(!res.ok)return;const next=await res.json();if(next.version!==payload.version && !q('#v9-new-version')){const div=document.createElement('div');div.id='v9-new-version';div.className='v9-update';div.textContent='Giáo án TOPIK PRO có bản cập nhật mới. Lưu bài viết rồi tải lại trang để xem.';root.prepend(div)}}catch{}},300000);
}).catch(err=>{console.error('[MRLEE V9]',err);const controls=q('#v8-controls');if(controls){const p=document.createElement('p');p.className='v9-update';p.textContent='Chưa tải được giáo án V9: '+String(err.message);controls.appendChild(p)}});
})();
