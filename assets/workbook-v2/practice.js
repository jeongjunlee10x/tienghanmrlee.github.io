/* MR LEE Workbook 10K — supplemental, strictly current-lesson practice.
 * No Spark award or forged grade events: existing verified 15 units are untouched.
 */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const root=$('work10kPanel'),cap=$('workLevel'),lesson=$('workLesson'),profile=$('workProfile');
 if(!root||!cap||!lesson||!profile)return;
 const cache=new Map(),normalize=s=>String(s||'').trim();
 let session=null,serial=0;
 const bankKey=()=>cap.value+'-'+lesson.value;
 const historyKey=()=>['MRLEE','WB10K','V1',profile.value.trim().replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,48)||'hocvien-001',cap.value,lesson.value].join('.');
 function getSeen(){try{return new Set(JSON.parse(localStorage.getItem(historyKey())||'[]'))}catch{return new Set()}}
 function putSeen(seen){try{localStorage.setItem(historyKey(),JSON.stringify([...seen]))}catch{}}
 function shuffle(list){const items=list.slice();for(let i=items.length-1;i>0;i--){let j;
   if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);j=a[0]%(i+1)}
   else j=Math.floor(Math.random()*(i+1));
   [items[i],items[j]]=[items[j],items[i]]}return items}
 async function loadCap(c){
   if(!cache.has(c))cache.set(c,fetch('assets/workbook-v2/bank-cap-'+c+'.json')
      .then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()})
      .then(x=>{if(x.version!=='WB10K-20261105'||!x.lessons)throw Error('Sai phiên bản ngân hàng');return x})
      .catch(e=>{cache.delete(c);throw e}));
   return cache.get(c);
 }
 const message=(s)=>{$('wb10kStatus').textContent=s};
 const area=$('wb10kGame');
 function resetGame(){session=null;area.hidden=true;area.replaceChildren();$('wb10kStart').disabled=false}
 async function refresh(){
  const id=++serial;resetGame();message('Đang kiểm tra ngân hàng câu hỏi theo bài…');
  try{
   const pack=await loadCap(cap.value);
   if(id!==serial)return;
   const items=pack.lessons[lesson.value]||[],seen=getSeen();
   const left=items.filter(x=>!seen.has(x.id)).length;
   message('Cấp '+cap.value+' · Bài '+lesson.value+' · '+items.length+' câu được duyệt theo dữ liệu bài học · '
    +left+' câu chưa luyện trong vòng hiện tại. Mỗi lượt ưu tiên câu và từ chưa gặp.');
   $('wb10kStart').disabled=!left;
   $('wb10kReset').hidden=seen.size===0;
  }catch(e){if(id===serial){message('Chưa tải được ngân hàng: '+String(e.message||e));$('wb10kStart').disabled=true}}
 }
 function choose(pool,n){
   const picked=[],concepts=new Set(),selected=new Set();
   const candidates=shuffle(pool);
   // Multiple study skills, but avoid reusing a word/concept within a session
   // until the current lesson cannot supply enough disjoint questions.
   for(const strict of [true,false]){
    for(const q of candidates){
     if(picked.length>=n)break;
     if(selected.has(q.id))continue;
     if(strict&&q.refs.some(s=>concepts.has(s)))continue;
     picked.push(q);selected.add(q.id);
     for(const ref of q.refs)concepts.add(ref);
    }
   }
   return picked;
 }
 function markSeen(q){
   const seen=getSeen();seen.add(q.id);putSeen(seen);
 }
 function make(tag,className,textContent){
   const el=document.createElement(tag);if(className)el.className=className;
   if(textContent!==undefined)el.textContent=textContent;return el;
 }
 function next(){
   if(!session)return;
   session.answered=false;
   if(session.index>=session.questions.length){finish();return}
   const q=session.questions[session.index],index=session.index,container=area;
   markSeen(q);container.replaceChildren();
   const head=make('div','wb10k-game-head');
   head.append(make('strong','', 'Câu '+(index+1)+'/'+session.questions.length),
     make('span','wb10k-kind',({
       'word-ko-vi':'Từ Hàn → Việt','word-vi-ko':'Từ Việt → Hàn',
       'pair-ko-vi':'Ghép nghĩa hai từ','pair-vi-ko':'Ghép hai từ Hàn',
       grammar:'Nhận diện ngữ pháp'})[q.type]||'Luyện tập'));
   container.append(head,make('p','wb10k-prompt',q.prompt));
   const choices=make('div','wb10k-choices');
   const feedback=make('p','wb10k-feedback','');feedback.setAttribute('role','status');
   const advance=make('button','wb10k-next','Câu tiếp theo →');
   advance.type='button';advance.hidden=true;
   advance.addEventListener('click',()=>{session.index++;next()});
   q.options.forEach((option,i)=>{
     const btn=make('button','wb10k-option',String.fromCharCode(65+i)+'. '+option);
     btn.type='button';
     btn.addEventListener('click',()=>{
       if(!session||session.index!==index||session.answered)return;
       session.answered=true;session.total++;
       const ok=i===q.answer;if(ok)session.correct++;
       choices.querySelectorAll('button').forEach((b,j)=>{
        b.disabled=true;if(j===q.answer)b.classList.add('wb10k-correct');
        else if(j===i)b.classList.add('wb10k-wrong')
       });
       feedback.textContent=(ok?'✓ Chính xác. ':'✗ Chưa đúng. ')
          +'Đáp án: '+q.options[q.answer]+'. '+q.explain;
       advance.hidden=false;
       advance.textContent=index===session.questions.length-1?'Xem kết quả':'Câu tiếp theo →';
     });
     choices.append(btn);
   });
   container.append(choices,feedback,advance);
 }
 function finish(){
  const {questions,correct,total}=session;session=null;area.replaceChildren();
  area.append(make('h3','','Hoàn thành lượt luyện mở rộng'),
   make('p','wb10k-result','Đúng '+correct+'/'+total+' câu. Nội dung này dùng để ôn tập, không tính điểm Spark hay TOPIK chính thức.'));
  const again=make('button','wb10k-next','Luyện lượt mới');
  again.type='button';again.addEventListener('click',()=>{$('wb10kStart').click()});
  area.append(again);void refreshStatusOnly();
 }
 async function refreshStatusOnly(){
   try{
    const pack=await loadCap(cap.value),items=pack.lessons[lesson.value]||[],seen=getSeen();
    const left=items.filter(q=>!seen.has(q.id)).length;
    message('Đã gặp '+(items.length-left)+'/'+items.length+' câu trong vòng này · Còn '+left+' câu chưa luyện.');
    $('wb10kStart').disabled=!left;$('wb10kReset').hidden=seen.size===0;
   }catch{}
 }
 $('wb10kStart').addEventListener('click',async()=>{
   const requested=Number($('wb10kCount').value)||12,id=++serial;
   $('wb10kStart').disabled=true;
   try{
    const pack=await loadCap(cap.value);if(id!==serial)return;
    const unseen=(pack.lessons[lesson.value]||[]).filter(q=>!getSeen().has(q.id));
    if(!unseen.length){message('Đã luyện hết bộ câu hỏi của bài này. Có thể mở vòng mới khi muốn ôn lại.');return}
    const list=choose(unseen,Math.min(requested,unseen.length));
    session={questions:list,index:0,correct:0,total:0,answered:false};
    area.hidden=false;area.scrollIntoView({behavior:'smooth',block:'start'});
    message('Đang luyện '+list.length+' câu mới; đáp án lấy từ nội dung bài học hiện tại.');
    next();
   }catch(e){message('Không thể bắt đầu: '+String(e.message||e))}
   finally{$('wb10kStart').disabled=false}
 });
 $('wb10kReset').addEventListener('click',()=>{
   if(!confirm('Mở vòng luyện mới cho Bài '+lesson.value+'? Lịch sử kết quả của 15 bộ Spark sẽ không bị xóa.'))return;
   try{localStorage.removeItem(historyKey())}catch{}
   void refresh();
 });
 for(const el of [cap,lesson])el.addEventListener('change',()=>{void refresh()});
 profile.addEventListener('change',()=>{void refresh()});
 void refresh();
})();
