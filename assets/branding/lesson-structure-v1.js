/* MR LEE lesson experience: compact playback, foldable items and speech matching. */
(()=>{'use strict';
 const root=document.getElementById('mrleeLessonDirectory');
 if(!root||!new URLSearchParams(location.search).get('bai'))return;
 const RATE=.85, spoken=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^가-힣0-9a-z]/g,'');
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const score=(a,b)=>{
   const x=Array.from(spoken(a)),y=Array.from(spoken(b));
   if(!x.length||!y.length)return 0;
   let old=Array.from({length:y.length+1},(_,i)=>i);
   for(let i=1;i<=x.length;i++){const next=[i];for(let j=1;j<=y.length;j++)next[j]=Math.min(next[j-1]+1,old[j]+1,old[j-1]+(x[i-1]===y[j-1]?0:1));old=next;}
   return Math.round(Math.max(0,1-old[y.length]/Math.max(x.length,y.length))*100);
 };
 const recClass=window.SpeechRecognition||window.webkitSpeechRecognition;
 let active=null;
 function stopActive(){if(active){try{active.rec.stop()}catch{};if(active.btn){active.btn.disabled=false;active.btn.textContent='🎙️ Ghi âm & chấm điểm';}active=null;}}
 function addPlay(container,text,existingAudio,label){
   if(container.querySelector('.mr-lesson-play'))return;
   const b=document.createElement('button');b.type='button';b.className='mr-lesson-action mr-lesson-play';b.textContent=label||'🔊 Nghe mẫu';b.setAttribute('aria-label','Nghe tiếng Hàn với tốc độ 0,85x');
   b.addEventListener('click',()=>{
     if(existingAudio&&existingAudio.getAttribute('src')){
       try{
         if(!existingAudio.paused){existingAudio.pause();return}
         document.querySelectorAll('audio').forEach(a=>{if(a!==existingAudio&&!a.paused)a.pause()});
         existingAudio.playbackRate=RATE;existingAudio.currentTime=0;
         const promise=existingAudio.play();if(promise?.catch)promise.catch(()=>fallback());
       }catch{fallback()}
     }else fallback();
     function fallback(){
       if(!('speechSynthesis' in window)){alert('Trình duyệt chưa hỗ trợ giọng Hàn.');return}
       speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';u.rate=RATE;
       const voice=speechSynthesis.getVoices().find(v=>v.lang?.toLowerCase()==='ko-kr');if(voice)u.voice=voice;
       speechSynthesis.speak(u);
     }
   });
   container.append(b);
 }
 function enhanceGrammar(){
   const wrap=document.querySelector('#lessonGrammar .mr-sc-grammar-list');
   if(!wrap||wrap.dataset.lessonReady)return;wrap.dataset.lessonReady='1';
   [...wrap.children].forEach((card,i)=>{
     if(!card.matches('.mr-sc-grammar-card'))return;
     const title=card.querySelector('.mr-sc-formula')?.textContent?.trim()||'Cấu trúc '+(i+1);
     const detail=document.createElement('details');detail.className='mr-lesson-fold';if(i===0)detail.open=true;
     const summary=document.createElement('summary');const name=document.createElement('span');name.lang='ko';name.textContent=(i+1)+'. '+title;
     const note=document.createElement('span');note.className='mr-lesson-fold-note';note.textContent='Ngữ pháp';summary.append(name,note);
     const body=document.createElement('div');body.className='mr-lesson-fold-body';card.before(detail);body.append(card);detail.append(summary,body);
     const head=card.querySelector('.mr-sc-grammar-head');if(head)addPlay(head,title,null,'🔊 Nghe cấu trúc');
     const example=card.querySelector('.mr-sc-example');const ko=example?.querySelector('.mr-sc-example-ko')?.textContent?.trim();
     if(ko&&example){const row=document.createElement('div');row.className='mr-lesson-audio-row';example.after(row);addPlay(row,ko,null,'🔊 Nghe ví dụ');}
   });
 }
 function enhanceVocab(){
   const grid=document.querySelector('#lessonVocab [data-vocab-list]');if(!grid)return;
   grid.querySelectorAll('.mr-sc-vocab-card').forEach(card=>{
     const btn=card.querySelector('button[data-ko]');if(!btn||btn.dataset.lessonRateReady)return;
     btn.dataset.lessonRateReady='1';btn.title='Nghe ở tốc độ 0,85x';btn.setAttribute('aria-label','Nghe từ vựng với tốc độ cố định 0,85x');
   });
 }
 function gradeSpeech(card,btn,expected){
   if(active&&active.btn===btn){stopActive();return}
   stopActive();
   let result=card.querySelector('.mr-lesson-score');
   if(!result){result=document.createElement('div');result.className='mr-lesson-score';result.setAttribute('role','status');result.setAttribute('aria-live','polite');card.querySelector('.mr-v5-speak-tools')?.append(result);}
   if(!recClass){
     result.textContent='Trình duyệt chưa hỗ trợ chấm nói trực tiếp. Dùng Chrome hoặc Edge và cho phép quyền micro. Không có điểm giả lập.';return;
   }
   const r=new recClass();r.lang='ko-KR';r.interimResults=true;r.continuous=false;r.maxAlternatives=5;
   let final='',best='',closed=false;
   const current={rec:r,btn};active=current;
   btn.textContent='⏹ Dừng & chấm';result.textContent='🎙️ Đang nghe tiếng Hàn… Đọc rõ câu mẫu rồi dừng, hoặc chờ hệ thống tự kết thúc.';
   const finish=(error)=>{
     if(closed)return;closed=true;
     if(active===current)active=null;
     btn.textContent='🎙️ Ghi âm & chấm điểm';
     const heard=final||best;
     if(!heard){result.textContent=error||'Chưa nhận diện được câu nói. Vui lòng thử lại, kiểm tra micro và nói chậm, rõ.';return;}
     const candidates=[heard,...(current.alternatives||[])].filter(Boolean);
     const graded=candidates.map(s=>({transcript:s,match:score(expected,s)})).sort((a,b)=>b.match-a.match)[0];
     const pct=graded.match;
     const advice=pct>=90?'Rất sát câu mẫu. Hãy tiếp tục giữ nhịp và ngữ điệu.':pct>=70?'Khá tốt. Chú ý các âm tiết chưa được nhận diện chính xác.':'Hãy nghe lại câu mẫu, chia nhỏ từng cụm và thử đọc lại.';
     result.innerHTML='<strong>'+pct+'/100 · Độ khớp câu nói</strong><div class="mr-lesson-progress"><span style="width:'+pct+'%"></span></div><div><b>Nhận diện:</b> <span lang="ko">'+esc(graded.transcript)+'</span></div><div><b>Câu mẫu:</b> <span lang="ko">'+esc(expected)+'</span></div><small>'+advice+' Điểm chỉ dựa vào văn bản được nhận diện, không đo âm sắc, chất giọng hoặc phát âm từng âm vị.</small>';
   };
   r.onresult=e=>{
     const alternatives=[];
     for(let i=0;i<e.results.length;i++){
       const item=e.results[i];if(!item)continue;
       if(item.isFinal)final+=item[0]?.transcript||'';
       for(let n=0;n<item.length;n++)if(item[n]?.transcript)alternatives.push(item[n].transcript);
     }
     current.alternatives=alternatives;
     best=alternatives[0]||best;
     result.textContent='Đã nghe: '+(final||best||'Đang xử lý…');
   };
   r.onerror=e=>{const msg=e.error==='not-allowed'?'Quyền micro bị từ chối. Hãy bật micro trong trình duyệt.':e.error==='network'?'Dịch vụ nhận diện giọng nói đang mất kết nối.':e.error==='no-speech'?'Chưa phát hiện giọng nói. Hãy thử lại.':'Không thể nhận diện giọng nói ('+e.error+').';finish(msg)};
   r.onend=()=>finish();
   try{r.start()}catch(e){finish('Không thể mở micro: '+(e?.message||'Hãy thử lại.'))}
 }
 function enhanceSpeaking(){
   const host=document.getElementById('lessonSpeak');if(!host||host.dataset.lessonReady||!host.querySelector('.mr-v5-speaking-card'))return;
   host.dataset.lessonReady='1';
   host.querySelectorAll('.mr-v5-speaking-card').forEach((card,i)=>{
     const audio=card.querySelector('audio.mr-v5-audio-main'),group=card.querySelector('.mr-v5-audio-group'),ko=card.querySelector('.mr-v5-sentence-ko')?.textContent?.trim(),btn=card.querySelector('[data-record]');
     if(!group||!ko)return;
     if(audio){audio.playbackRate=RATE;audio.defaultPlaybackRate=RATE;audio.addEventListener('play',()=>{audio.playbackRate=RATE;});audio.addEventListener('ratechange',()=>{if(Math.abs(audio.playbackRate-RATE)>.001)audio.playbackRate=RATE;});}
     addPlay(group,ko,audio,'🔊 Phát câu mẫu 0,85×');
     if(btn){btn.textContent='🎙️ Ghi âm & chấm điểm';btn.setAttribute('aria-label','Ghi âm và chấm mức độ khớp câu '+(i+1));btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();gradeSpeech(card,btn,ko)},{capture:true});}
     const fallback=card.querySelector('.mr-v5-fallback');if(fallback)fallback.remove();
   });
   window.addEventListener('pagehide',stopActive,{once:true});
 }
 function enhanceWorkbook(){
   const container=document.getElementById('lessonWorkbook');if(!container||container.dataset.lessonReady||container.children.length<15)return;
   container.dataset.lessonReady='1';const links=[...container.querySelectorAll(':scope > a')];
   for(let k=0;k<3;k++){
     const fold=document.createElement('details');fold.className='mr-lesson-fold';if(k===0)fold.open=true;
     const s=document.createElement('summary');s.innerHTML='<span>Nhóm '+(k+1)+' · Bộ '+(k*5+1)+'–'+(k*5+5)+'</span><span class="mr-lesson-fold-note">5 bộ luyện tập</span>';fold.append(s);
     const body=document.createElement('div');body.className='mr-lesson-fold-body';
     const grid=document.createElement('div');grid.className='mr-lesson-workbook-grid';links.slice(k*5,k*5+5).forEach(a=>grid.append(a));body.append(grid);fold.append(body);container.append(fold);
   }
 }
 function moveExtraPractice(){
   const extra=document.getElementById('mrleeV31ExtraPractice'),section=document.getElementById('lessonSectionWorkbook');
   if(extra&&section&&!section.contains(extra)){section.append(extra)}
 }
 function tick(){enhanceGrammar();enhanceVocab();enhanceSpeaking();enhanceWorkbook();moveExtraPractice();}
 let pending=false;
 const obs=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;tick()})});
 obs.observe(root,{childList:true,subtree:true});
 tick();document.addEventListener('DOMContentLoaded',tick,{once:true});
})();
