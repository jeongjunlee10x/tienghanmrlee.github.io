/* V31 educational reinforcement — strict current-lesson vocab and example bank.
 * Practice-only, deliberately not connected to the rewards/grades API. */
import { SC_LESSONS } from '../../mrlee-sc-lesson-data.js';
import { ADVANCED_LESSONS } from '../../mrlee-advanced-lesson-data.js';
const qp=new URLSearchParams(location.search),cap=Number(qp.get('cap')),bai=Number(qp.get('bai'));
if(Number.isInteger(cap)&&Number.isInteger(bai)&&cap>=1&&cap<=6&&bai>=1&&bai<=15){
 const lesson=[...SC_LESSONS,...ADVANCED_LESSONS].find(x=>x.cap===cap&&x.bai===bai);
 const parent=document.getElementById('lessonWorkbook');
 if(lesson&&parent){
 const known=new Set();
 const vocab=(lesson.vocab||[]).map(x=>[String(x?.[0]||'').trim(),String(x?.[1]||'').trim()])
  .filter(([ko,vi])=>ko&&vi&&!known.has(ko)&&known.add(ko));
 const grammar=(lesson.grammar||[]).map(g=>String(g.example||'').split('→').map(s=>s.trim())).filter(x=>x.length>=2&&x[0]&&x[1]&&/[가-힣]/.test(x[0]));
 const tasks=[];
 const words=vocab.slice(0,90);
 for(const [i,[ko,vi]] of words.entries()){
  tasks.push({kind:'write',name:'Dịch Việt → Hàn',prompt:vi,answer:ko,src:'Từ vựng bài hiện tại'});
  tasks.push({kind:'write',name:'Dịch Hàn → Việt',prompt:ko,answer:vi,src:'Từ vựng bài hiện tại'});
  if(vocab.length>=4){
   const options=[vi];for(let j=1;j<=3;j++){const candidate=vocab[(i+j*7)%vocab.length][1];if(!options.includes(candidate))options.push(candidate)}
   if(options.length>=2)tasks.push({kind:'choice',name:'Nhận diện nghĩa',prompt:ko,answer:vi,options:options.slice(0,4),src:'Từ vựng bài hiện tại'});
  }
 }
 for(const [ko,vi] of grammar)tasks.push({kind:'write',name:'Dịch ví dụ ngữ pháp Hàn → Việt',prompt:ko,answer:vi,src:'Ví dụ ngữ pháp bài hiện tại'});
 if(!tasks.length)return;
 // Round-robin across sections; no content from future lessons.
 const capped=tasks.slice(0,Math.min(180,tasks.length));
 const section=document.createElement('section');section.id='mrleeV31ExtraPractice';section.className='mrlee-v31-extra';
 section.innerHTML='<div class="mrlee-v31-extra-head"><div><small>MR LEE • LUYỆN THÊM THEO BÀI</small><h2>Bộ bài tập mở rộng</h2><p>Chỉ sử dụng từ vựng và ví dụ đã có trong bài này. Luyện tập tự kiểm tra, không tự động cộng điểm thưởng. Đáp án dịch tự do cần giáo viên nhận xét.</p></div><strong id="mrleeV31Total"></strong></div><div class="mrlee-v31-extra-controls"><label>Chọn dạng bài<select id="mrleeV31Filter"><option value="all">Tất cả</option><option value="Dịch Việt → Hàn">Dịch Việt → Hàn</option><option value="Dịch Hàn → Việt">Dịch Hàn → Việt</option><option value="Nhận diện nghĩa">Nhận diện nghĩa</option><option value="Dịch ví dụ ngữ pháp Hàn → Việt">Ví dụ ngữ pháp</option></select></label><span id="mrleeV31Progress" role="status"></span></div><div class="mrlee-v31-extra-question" id="mrleeV31Question"></div><div class="mrlee-v31-extra-answer" id="mrleeV31Answer"></div><p class="mrlee-v31-extra-feedback" id="mrleeV31Feedback" role="status" aria-live="polite"></p><div class="mrlee-v31-extra-actions"><button type="button" id="mrleeV31Reveal">Xem đáp án</button><button type="button" id="mrleeV31Next">Câu tiếp theo →</button></div>';
 parent.after(section);
 const $=id=>document.getElementById(id),filter=$('mrleeV31Filter');
 $('mrleeV31Total').textContent=capped.length+' lượt bài tập';
 const safe=s=>String(s).normalize('NFKC').trim().replace(/[\s.!?,。？！]+/g,'').toLowerCase();
 let selected=capped,index=0,checked=0;
 const status=()=>{$('mrleeV31Progress').textContent='Câu '+Math.min(index+1,selected.length)+'/'+selected.length+' · Đã kiểm tra '+checked};
 function show(){
  const task=selected[index];$('mrleeV31Question').replaceChildren();$('mrleeV31Answer').replaceChildren();$('mrleeV31Feedback').textContent='';
  if(!task){$('mrleeV31Question').textContent='Hoàn thành lượt luyện. Chọn dạng bài khác để tiếp tục.';status();return}
  const heading=document.createElement('strong');heading.textContent=task.name;
  const prompt=document.createElement('p');prompt.textContent=task.prompt;prompt.lang=/[가-힣]/.test(task.prompt)?'ko':'vi';
  const source=document.createElement('small');source.textContent=task.src;
  $('mrleeV31Question').append(heading,prompt,source);
  const check=v=>{
   checked++;const ok=safe(v)===safe(task.answer);
   $('mrleeV31Feedback').textContent=(ok?'✓ Chính xác. ':'Cần đối chiếu với đáp án mẫu. ')+task.answer+' — Trường hợp cách dịch khác phù hợp, giáo viên có thể chấp nhận.';
   status();
  };
  if(task.kind==='choice'){
   // Rotate options for different positions while preserving the correct choice.
   const opts=task.options.slice(),rot=index%opts.length;
   for(const option of [...opts.slice(rot),...opts.slice(0,rot)]){const b=document.createElement('button');b.type='button';b.textContent=option;b.addEventListener('click',()=>{if($('mrleeV31Feedback').textContent)return;check(option)});$('mrleeV31Answer').append(b)}
  }else{
   const input=document.createElement('input');input.type='text';input.maxLength=220;input.placeholder='Nhập đáp án';input.lang=task.name.includes('Việt → Hàn')?'ko':'vi';
   const btn=document.createElement('button');btn.type='button';btn.textContent='Kiểm tra';btn.addEventListener('click',()=>{if(!$('mrleeV31Feedback').textContent)check(input.value)});
   input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();btn.click()}});
   $('mrleeV31Answer').append(input,btn);
  }
  status();
 }
 filter.addEventListener('change',()=>{selected=capped.filter(t=>filter.value==='all'||t.name===filter.value);index=0;checked=0;show()});
 $('mrleeV31Reveal').addEventListener('click',()=>{if(selected[index])$('mrleeV31Feedback').textContent='Đáp án tham khảo: '+selected[index].answer});
 $('mrleeV31Next').addEventListener('click',()=>{index=index+1>=selected.length?0:index+1;show()});
 show();
 }
}