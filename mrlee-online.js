import { LEVELS } from './mrlee-online-bank.js';

const $ = id => document.getElementById(id);
const LETTERS = ['A','B','C','D'];
const TITLE = {sc1:'Sơ cấp 1',sc2:'Sơ cấp 2'};
const DURATION_SECONDS = 15 * 60;
let selectedLevel = 'sc1';
try { if (localStorage.getItem('mrlee-online-level') === 'sc2') selectedLevel = 'sc2'; } catch {}
let activeBatch = -1;
let examItems = [];
let responses = [];
let deadline = 0;
let interval = null;
let completed = false;
let examStartedAt = 0;

function safe(str){return String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function show(id){for(const view of ['select-view','exam-view','result-box']) $(view).classList.toggle('hidden',view!==id);window.scrollTo(0,0);}
function getBatch(level,i){
  const from = i*2;
  const selected = LEVELS[level].slice(from,from+2);
  return {number:i+1,lessons:selected,range:selected.length===1?`Bài 15`:`Bài ${from+1}–${from+2}`};
}
function makeBatches(){
  const list=$('test-list'); list.replaceChildren();
  $('level-title').textContent=`Các lần kiểm tra – ${TITLE[selectedLevel]}`;
  document.querySelectorAll('[data-level]').forEach(el=>{
    let active=el.dataset.level===selectedLevel;
    el.classList.toggle('is-active',active);
    el.setAttribute('aria-pressed',String(active));
  });
  for(let i=0;i<8;i++){
    const batch=getBatch(selectedLevel,i);
    const card=document.createElement('article');card.className='test-card';
    const lessons=batch.lessons.map((lesson,j)=>`Bài ${i*2+j+1}: <span lang="ko">${safe(lesson.ko)}</span> – ${safe(lesson.title)}`).join('<br>');
    card.innerHTML=`<div class="test-card-head"><span class="test-index">KIỂM TRA LẦN ${batch.number}</span><span class="lesson-range">${batch.range}</span></div><div><h3>${safe(TITLE[selectedLevel])} · ${batch.range}</h3><p>${lessons}</p></div><div class="test-meta"><span>10 câu trắc nghiệm</span><span>15 phút</span><span>Tự chấm điểm</span></div><button type="button" class="start-btn" data-batch="${i}">Bắt đầu kiểm tra →</button>`;
    list.append(card);
  }
}
function shuffled(arr){
  const copy=arr.slice();
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
}
function buildExam(level,batchIndex){
  let result=[];
  for(let n=batchIndex*2;n<Math.min(batchIndex*2+2,15);n++){
    const lesson=LEVELS[level][n];
    for(const question of lesson.questions){
      const choices=shuffled(question.options.map((label,i)=>({label,correct:i===question.answer})));
      result.push({...question,lessonNumber:n+1,lessonTitle:lesson.title,choices,correctIndex:choices.findIndex(item=>item.correct)});
    }
  }
  return shuffled(result);
}
function formatTime(sec){return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
function updateProgress(){
  const count=responses.filter(x=>x!==null).length;
  $('answered-count').textContent=`${count}/${examItems.length}`;
  $('completion-bar').style.width=`${count/examItems.length*100}%`;
}
function renderQuestions(){
  const container=$('questions');container.replaceChildren();
  for(let i=0;i<examItems.length;i++){
    const q=examItems[i];
    const card=document.createElement('article');card.className='question-card';
    const title=document.createElement('div');title.className='question-top';title.innerHTML=`<span>CÂU ${i+1}/${examItems.length} · BÀI ${q.lessonNumber}</span><span class="kind">${safe(q.type)}</span>`;
    const h=document.createElement('h3');h.textContent=q.text;
    card.append(title,h);
    for(let j=0;j<q.choices.length;j++){
      const label=document.createElement('label');label.className='answer-choice';
      const input=document.createElement('input');input.type='radio';input.name=`answer-${i}`;input.value=String(j);input.checked=responses[i]===j;
      input.addEventListener('change',()=>{responses[i]=j;updateProgress();});
      const letter=document.createElement('span');letter.className='choice-letter';letter.textContent=LETTERS[j]+'.';
      const span=document.createElement('span');span.textContent=q.choices[j].label;
      label.append(input,letter,span);card.append(label);
    }
    container.append(card);
  }
  updateProgress();
}
function tick(){
  if(completed)return;
  const remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));
  $('timer').textContent=formatTime(remaining);
  if(remaining<=0)finish(true);
}
function startBatch(index){
  if(index<0||index>7)return;
  clearInterval(interval);
  activeBatch=index;
  examItems=buildExam(selectedLevel,index);
  responses=Array(examItems.length).fill(null);
  completed=false;
  examStartedAt=Date.now();
  deadline=examStartedAt+DURATION_SECONDS*1000;
  let batch=getBatch(selectedLevel,index);
  $('exam-title').textContent=`Kiểm tra lần ${batch.number} · ${TITLE[selectedLevel]} · ${batch.range}`;
  $('exam-subtitle').textContent='Chọn một đáp án cho mỗi câu. Bạn có 15 phút để hoàn thành.';
  renderQuestions();
  $('timer').textContent='15:00';
  show('exam-view');
  interval=setInterval(tick,1000);
}
function goToList(){
  if(!completed&&activeBatch>=0&&!confirm('Bạn đang làm bài. Thoát sẽ mất các lựa chọn chưa nộp. Bạn có chắc không?'))return;
  clearInterval(interval);completed=true;activeBatch=-1;show('select-view');
}
function finish(expired=false){
  if(completed||activeBatch<0)return;
  const unanswered=responses.filter(v=>v===null).length;
  if(!expired&&unanswered>0&&!confirm(`Còn ${unanswered} câu chưa chọn đáp án. Bạn vẫn muốn nộp bài?`))return;
  completed=true;clearInterval(interval);
  const score=examItems.reduce((sum,q,i)=>sum+(responses[i]===q.correctIndex?1:0),0);
  const durationSeconds=Math.min(DURATION_SECONDS,Math.max(0,Math.round((Date.now()-examStartedAt)/1000)));
  const batch=getBatch(selectedLevel,activeBatch);
  const total=examItems.length;
  $('result-title').textContent=`Hoàn thành Kiểm tra lần ${batch.number} · ${TITLE[selectedLevel]}`;
  $('result-description').textContent=(expired?'Đã hết thời gian làm bài. ':'')+(
    score===total?'Bạn làm đúng tất cả! Hãy duy trì phong độ.' : score>=7?'Kết quả tốt! Hãy ôn lại những câu còn sai.':'Bạn nên ôn lại từ vựng và ngữ pháp của các bài này trước khi làm lại.');
  $('result-score').textContent=`${score}/${total}`;
  $('result-percent').textContent=`${Math.round(score*100/total)}%`;
  $('result-duration').textContent=`${Math.floor(durationSeconds/60)} phút ${durationSeconds%60} giây`;
  const grouped=new Map();
  examItems.forEach((q,i)=>{if(!grouped.has(q.lessonNumber))grouped.set(q.lessonNumber,{total:0,score:0});const g=grouped.get(q.lessonNumber);g.total++;if(responses[i]===q.correctIndex)g.score++;});
  $('lesson-breakdown').replaceChildren();
  [...grouped.entries()].sort((a,b)=>a[0]-b[0]).forEach(([lesson,summary])=>{const tag=document.createElement('span');tag.textContent=`Bài ${lesson}: ${summary.score}/${summary.total} câu đúng`;$('lesson-breakdown').append(tag);});
  $('review-toggle').setAttribute('aria-expanded','false');$('review-toggle').textContent='Xem đáp án và giải thích';
  $('answer-review').classList.add('hidden');
  $('answer-review').replaceChildren();
  examItems.forEach((q,i)=>{
    const ok=responses[i]===q.correctIndex;
    const card=document.createElement('article');card.className='review-card'+(ok?' ok':'');
    const stat=document.createElement('strong');stat.textContent=`Câu ${i+1} · Bài ${q.lessonNumber} · ${ok?'ĐÚNG':responses[i]===null?'CHƯA TRẢ LỜI':'SAI'}`;
    const title=document.createElement('h3');title.textContent=q.text;
    const picked=document.createElement('p');picked.textContent=`Bạn chọn: ${responses[i]===null?'Chưa trả lời':q.choices[responses[i]].label}`;
    const right=document.createElement('p');right.textContent=`Đáp án đúng: ${q.choices[q.correctIndex].label}`;
    const note=document.createElement('p');note.className='note';note.textContent=`Giải thích: ${q.explain}`;
    card.append(stat,title,picked,right,note);$('answer-review').append(card);
  });
  $('next-btn').classList.toggle('hidden',activeBatch===7);
  show('result-box');
  // learning-tracker.js xác minh email và ghi theo UID; đây là điểm luyện tập chấm tại client, không dùng cho kỳ thi chính thức.
  window.dispatchEvent(new CustomEvent('mrlee:practice-finished',{detail:{
    examId:`online-${selectedLevel}-lan-${batch.number}`,
    examTitle:`Kiểm tra lần ${batch.number} · ${TITLE[selectedLevel]} · ${batch.range}`,
    level:selectedLevel,score,total,durationSeconds
  }}));
}

document.querySelectorAll('[data-level]').forEach(tab=>tab.addEventListener('click',()=>{
  selectedLevel=tab.dataset.level;
  try{localStorage.setItem('mrlee-online-level',selectedLevel);}catch{}
  makeBatches();
}));
$('test-list').addEventListener('click',event=>{const btn=event.target.closest('[data-batch]');if(btn)startBatch(Number(btn.dataset.batch));});
$('submit-top').addEventListener('click',()=>finish());
$('submit-bottom').addEventListener('click',()=>finish());
$('back-to-tests').addEventListener('click',goToList);
$('return-btn').addEventListener('click',goToList);
$('retry-btn').addEventListener('click',()=>startBatch(activeBatch));
$('next-btn').addEventListener('click',()=>startBatch(activeBatch+1));
$('review-toggle').addEventListener('click',()=>{
  const hidden=$('answer-review').classList.toggle('hidden');
  $('review-toggle').setAttribute('aria-expanded',String(!hidden));
  $('review-toggle').textContent=hidden?'Xem đáp án và giải thích':'Ẩn đáp án';
});
window.addEventListener('beforeunload',event=>{if(activeBatch>=0&&!completed){event.preventDefault();event.returnValue='';}});
makeBatches();
