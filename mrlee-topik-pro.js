/* MR LEE TOPIK PRO: independent adaptive practice, no official score claim. */
(()=>{'use strict';
const $=s=>document.getElementById(s), els={profile:$('proProfile'),level:$('proLevel'),kind:$('proKind'),plan:$('proPlan'),size:$('proSize'),game:$('proGame')};
const enc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let bank=[],session=null,now=Date.now();
let config={profile:'hocvien-001',level:'1',kind:'all',days:'60',size:'20'};
function storageKey(){return 'MRLEE.TOPIK.PRO.V3.'+config.profile}
function defaultProgress(){return{answers:{},sessions:[],start:Date.now()}}
function readState(){try{let p=JSON.parse(localStorage.getItem(storageKey())||'null');if(p&&p.answers&&p.sessions)return p}catch{}return defaultProgress()}
let state=readState();
function save(){try{localStorage.setItem(storageKey(),JSON.stringify(state))}catch(e){console.warn('Tiến độ không được lưu:',e)}}
function syncConfig(){
 const name=(els.profile.value.trim()||'hocvien-001').replace(/[^\w-]/g,'_').slice(0,48);
 config={profile:name,level:els.level.value,kind:els.kind.value,days:els.plan.value,size:els.size.value};
 try{localStorage.setItem('MRLEE.PRO.PROFILE',name)}catch{}
 state=readState();session=null;stats();
 const elapsed=Math.max(0,Math.floor((Date.now()-state.start)/86400000));
 els.game.innerHTML=`<h2>Sẵn sàng luyện</h2><p>Lộ trình ${config.days} ngày · ngày ${Math.min(elapsed+1,Number(config.days))}/${config.days} · bài phù hợp trình độ và các câu cần ôn.</p>`;
}
function eligible(q){if(String(q.level)!==config.level)return false;
 if(config.kind==='all')return true;
 if(config.kind==='listening'||config.kind==='reading')return q.kind===config.kind;
 if(config.kind==='comprehension')return q.mode==='mô phỏng TOPIK';
 if(config.kind==='foundation')return q.mode==='luyện nền tảng MR LEE';
 return true}
function due(q){let a=state.answers[q.id];return a&&a.nextDue<=Date.now()}
function stats(){let all=bank.filter(eligible),seen=all.filter(x=>state.answers[x.id]);let total=seen.reduce((n,q)=>n+state.answers[q.id].total,0),correct=seen.reduce((n,q)=>n+state.answers[q.id].correct,0);
 $('proTotal').textContent=all.length.toLocaleString('vi-VN');$('proSeen').textContent=seen.length.toLocaleString('vi-VN');$('proAccuracy').textContent=total?Math.round(100*correct/total)+'%':'—';$('proDue').textContent=all.filter(due).length;
}
function random(){return Math.random()}
function adaptive(candidates,n,review=false){
 const elapsed=Math.max(0,Math.floor((Date.now()-state.start)/86400000));
 const planDay=Math.min(1,elapsed/Math.max(1,Number(config.days)));
 const targetDifficulty=1+Math.floor(planDay*4);
 const weights=candidates.map(q=>{let s=state.answers[q.id];
  if(!s)return review?0:(Number(q.difficulty)<=targetDifficulty?9:2);let acc=s.correct/Math.max(1,s.total);let overdue=s.nextDue<=Date.now();
  if(review&&!overdue)return 0;
  // Previous mistakes and overdue questions surface first; unseen topics remain varied.
  return 2+Math.max(0,7-7*acc)+(overdue?11:0)+(s.total<3?3:0)+(Number(q.difficulty)<=targetDifficulty?3:0);
 });
 const pool=candidates.map((q,i)=>({q,w:weights[i]})).filter(x=>x.w>0);const answer=[];
 while(pool.length&&answer.length<n){let total=pool.reduce((x,v)=>x+v.w,0),r=random()*total,j=0;for(;j<pool.length-1;j++){r-=pool[j].w;if(r<=0)break}answer.push(pool.splice(j,1)[0].q)}
 return answer}
function start(review=false){let source=bank.filter(eligible),selected=adaptive(source,+config.size,review);
 if(!selected.length){els.game.innerHTML='<h2>Không còn câu phù hợp</h2><p>Thử “Lượt luyện mới” hoặc thay đổi cấp độ và kỹ năng.</p>';return}
 session={items:selected,index:0,correct:0,skipped:0,wrong:0,started:Date.now(),review,results:[]};show();}
function piece(q){let h=`<div><span class="pro-tag">${enc(q.mode)}</span><span class="pro-tag">${enc(q.skill)}</span><span class="pro-tag">Độ khó ${enc(q.difficulty)}</span></div>`;
 if(q.audio)h+=`<audio class="pro-player" controls preload="metadata" data-audio src="${encodeURI(q.audio)}"></audio><div data-error style="color:#b45309;font-size:13px"></div>`;
 if(q.passage)h+=`<div class="pro-passage" lang="ko">${enc(q.passage)}</div>`;
 h+=`<p class="pro-question" lang="ko">${enc(q.prompt)}</p>`;
 return h;}
function show(){let s=session;if(!s)return;let q=s.items[s.index];
 if(!q){finish();return}
 let answered=s.results.length===s.index?false:true;
 els.game.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><strong>Câu ${s.index+1}/${s.items.length}</strong><span>Đúng ${s.correct} · Bỏ qua ${s.skipped}</span></div><div class="pro-progress"><div style="width:${Math.round(100*s.index/s.items.length)}%"></div></div>${piece(q)}<div class="pro-choices">${q.choices.map((x,i)=>`<button type="button" data-choice="${i}">${'ABCD'[i]}. ${enc(x)}</button>`).join('')}</div><div id="proFeedback" class="pro-feedback" hidden></div><div class="pro-footeractions"><button type="button" id="proSkip">Bỏ qua câu này</button><button type="button" class="pro-primary" id="proNext" hidden>Câu tiếp theo →</button></div>`;
 const audio=els.game.querySelector('[data-audio]');if(audio){
  els.game.querySelectorAll('[data-choice]').forEach(b=>b.disabled=true);
  const msg=els.game.querySelector('[data-error]');
  if(msg)msg.textContent='Đang kiểm tra tệp MP3...';
  audio.addEventListener('loadedmetadata',()=>{if(msg)msg.textContent='MP3 đã tải: nhấn ▶ để nghe.';els.game.querySelectorAll('[data-choice]').forEach(b=>b.disabled=false)});
  audio.addEventListener('error',()=>{if(msg)msg.textContent='Không tải được MP3. Bỏ qua câu nghe, không bị chấm sai.';els.game.querySelectorAll('[data-choice]').forEach(b=>b.disabled=true)});
 }

 els.game.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>answer(Number(b.dataset.choice))));
 $('proSkip').addEventListener('click',()=>{s.skipped++;s.results.push({id:q.id,skipped:true});s.index++;show()});
 $('proNext').addEventListener('click',()=>{s.index++;show()});
}
function answer(i){let s=session,q=s.items[s.index];if(s.results.length>s.index||els.game.querySelector(`[data-choice="${i}"]`)?.disabled)return;
 let correct=i===q.answer; s.correct+=Number(correct);s.wrong+=Number(!correct);
 let hist=state.answers[q.id]||{total:0,correct:0,streak:0,nextDue:Date.now()};hist.total++;hist.correct+=Number(correct);hist.streak=correct?hist.streak+1:0;
 let intervals=[1,3,7,14,30,60];hist.nextDue=Date.now()+86400000*(correct?intervals[Math.min(hist.streak-1,5)]:1);state.answers[q.id]=hist;save();
 s.results.push({id:q.id,chosen:i,right:q.answer,correct});
 els.game.querySelectorAll('[data-choice]').forEach(b=>{let n=Number(b.dataset.choice);b.disabled=true;if(n===q.answer)b.classList.add('right');else if(n===i)b.classList.add('wrong')});
 let feedback=$('proFeedback');feedback.hidden=false;feedback.textContent=(correct?'✓ Chính xác.':'✗ Chưa đúng.')+'\nĐáp án: '+q.choices[q.answer]+'\n'+(q.explain||'');
 $('proSkip').hidden=true;$('proNext').hidden=false;stats();}
function finish(){let s=session;let pct=Math.round(s.correct/Math.max(1,s.items.length-s.skipped)*100);state.sessions.push({when:Date.now(),level:+config.level,kind:config.kind,items:s.items.length,correct:s.correct,skipped:s.skipped});state.sessions=state.sessions.slice(-150);save();stats();
 els.game.innerHTML=`<h2>Hoàn thành lượt luyện</h2><div class="pro-stats"><div><strong>${s.correct}</strong><small>Câu đúng</small></div><div><strong>${s.wrong}</strong><small>Câu sai</small></div><div><strong>${s.skipped}</strong><small>Câu bỏ qua (không tính điểm)</small></div><div><strong>${pct}%</strong><small>Chính xác trên câu đã trả lời</small></div></div><p>Hệ thống đã cập nhật lịch ôn câu sai của hồ sơ hiện tại. Kết quả là tiến độ học tập, không phải điểm thi TOPIK chính thức.</p><div class="pro-actions"><button type="button" class="pro-primary" id="proAgain">Luyện lượt mới</button><button type="button" id="proRetry">Ôn câu sai</button></div>`;
 $('proAgain').onclick=()=>start(false);$('proRetry').onclick=()=>start(true);session=null;}
function exportProgress(){let blob=new Blob([JSON.stringify({profile:config.profile,exported:new Date().toISOString(),data:state},null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='MRLEE_TOPIK_PRO_'+config.profile+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
$('proStart').onclick=()=>start(false);$('proReview').onclick=()=>start(true);$('proExport').onclick=exportProgress;
try{els.profile.value=localStorage.getItem('MRLEE.PRO.PROFILE')||'hocvien-001'}catch{}
[els.profile,els.level,els.kind,els.plan,els.size].forEach(e=>e.addEventListener('change',syncConfig));
els.profile.addEventListener('blur',syncConfig);
fetch('mrlee-pro-topik.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{if(!Array.isArray(data)||data.length<200)throw Error('Ngân hàng không hợp lệ');bank=data;syncConfig()}).catch(e=>{els.game.innerHTML='<h2>Không tải được ngân hàng</h2><p>'+enc(e.message)+'</p><p>Kiểm tra mrlee-pro-topik.json và mở bằng localhost, không dùng file://.</p>'});
})();
