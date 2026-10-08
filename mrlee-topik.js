import { TOPIK_EXAMS, TOPIK_LEVELS, VERIFIED_KEYS, hasKey } from './topik-bank.js';

const $ = id => document.getElementById(id);
const page = document.body.dataset.topikPage;
const opt = new URLSearchParams(location.search);
const circled = ['','①','②','③','④'];
function el(tag, cls='', text='') { const a=document.createElement(tag);if(cls)a.className=cls;if(text!==null)a.textContent=String(text);return a; }
function makeLink(text,href,cls='button ghost'){let a=el('a',cls,text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;}
function examination(level,num){return TOPIK_EXAMS.find(x=>x.number===num) && TOPIK_LEVELS[level];}

if(page==='catalog'){
  let selected='I';
  function render(){
    ['I','II'].forEach(level=>{$('tab-'+level).setAttribute('aria-selected',String(level===selected));});
    $('levelInfo').textContent=selected==='I'?'TOPIK I · Nghe 30 câu + Đọc 40 câu · Tổng 100 phút · 200 điểm':'TOPIK II · Nghe 50 câu + Viết 4 câu + Đọc 50 câu · Tổng 180 phút · 300 điểm (phần Viết chưa chấm tự động)';
    const grid=$('examCards');grid.replaceChildren();
    TOPIK_EXAMS.forEach(data=>{
      const card=el('article','card');
      const head=el('header');const title=el('h2','',`Đề TOPIK ${data.number}`);
      const checked=hasKey(selected,data.number);
      const status=el('span',checked?'status':'status pending',checked?'Đã nạp đáp án':'Chưa nạp đáp án');head.append(title,status);
      const desc=el('p','',checked?'Có đồng hồ, phiếu trả lời và chấm điểm Nghe/Đọc theo bảng đáp án đã đối chiếu.': 'Có đồng hồ và phiếu trả lời để luyện tập; chưa hiển thị điểm do chưa đối chiếu bảng đáp án của kỳ này.');
      const actions=el('div','card-buttons');
      const start=el('a','button','Vào phòng thi');start.href=`topik-luyen-de.html?level=${selected}&exam=${data.number}`;
      actions.append(start,makeLink('Xem tài liệu',data.source,'button ghost'));
      card.append(head,desc,actions);grid.append(card);
    });
  }
  document.querySelectorAll('[data-level]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.level;render();}));
  render();
}

if(page==='quiz'){
  const level=opt.get('level');const examNo=Number(opt.get('exam'));
  const data=TOPIK_EXAMS.find(x=>x.number===examNo);
  if(!data||!TOPIK_LEVELS[level]) {$('pageError').hidden=false;}
  else boot(level,data);
}

function boot(level,exam){
  const config=TOPIK_LEVELS[level];const key=VERIFIED_KEYS[`${level}-${exam.number}`]||null;
  const STORAGE=`mrlee.topik.practice.${level}.${exam.number}`;
  $('examContent').hidden=false;
  $('examTitle').textContent=`TOPIK ${level} · Đề ${exam.number}`;
  $('crumbCurrent').textContent=`TOPIK ${level} · ${exam.number}`;
  $('examDesc').textContent=`${config.subtitle} · ${config.durationMinutes} phút · ${key?'Tự chấm phần trắc nghiệm theo bảng điểm gốc':'Chưa có bảng đáp án xác minh cho kỳ này'}`;
  $('paperLink').href=level==='I'?(exam.paperI||exam.source):(exam.paperII||exam.source);
  $('sourceLink').href=exam.source;
  $('keyNotice').textContent=key
    ? 'Đã có đáp án đối chiếu cho Nghe và Đọc của kỳ 35. TOPIK II: 4 câu Viết cần giáo viên đánh giá, không nằm trong điểm tự chấm.'
    : 'Bộ đề này đang ở chế độ phiếu trả lời: chưa có đáp án và thang điểm đã kiểm chứng, vì vậy sẽ KHÔNG đưa ra điểm tự động. Mở trang nguồn để lấy PDF, audio và bảng đáp án.';
  $('submitBtn').textContent=key?'Nộp bài & chấm trắc nghiệm':'Nộp phiếu luyện (không chấm điểm)';
  $('submitHint').textContent=key?'Điểm luyện tập được tính theo đáp án và điểm từng câu (không phải chứng chỉ TOPIK).':'Chỉ ghi nhận số câu đã làm, không giả lập kết quả TOPIK.';

  let state;
  try {state=JSON.parse(localStorage.getItem(STORAGE))||{};} catch {state={};}
  if(!state || typeof state!=='object')state={};
  if(!state.answers || typeof state.answers!=='object')state.answers={};
  if(!state.essays || typeof state.essays!=='object')state.essays={};
  if(!Number.isFinite(state.startedAt))state.startedAt=0;
  if(!Number.isFinite(state.deadline))state.deadline=0;
  let activeSection=config.sections[0].key;
  let interval=null;

  const startButton=el('button','button','Bắt đầu tính giờ');startButton.id='startTimer';
  $('clockStatus').before(startButton);
  startButton.addEventListener('click',()=>{
    if(state.finished||state.startedAt)return;
    state.startedAt=Date.now();state.deadline=Date.now()+config.durationMinutes*60000;save();renderTimer();startClock();
  });
  $('resetBtn').addEventListener('click',()=>{
    if(!confirm('Xóa toàn bộ đáp án và bắt đầu lại đề này?')) return;
    localStorage.removeItem(STORAGE);location.reload();
  });
  $('submitBtn').addEventListener('click',()=>finish(false));

  const tabs=$('sectionTabs');
  config.sections.forEach(section=>{
    const btn=el('button','',section.label);btn.type='button';btn.dataset.section=section.key;
    btn.setAttribute('role','tab');btn.addEventListener('click',()=>{activeSection=section.key;renderSection();});
    tabs.append(btn);
  });
  function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch(e){console.warn('Không lưu được phiên làm bài tại thiết bị',e);}}
  function answered(section){if(section.key==='writing')return Object.values(state.essays).filter(v=>String(v||'').trim()).length;
    const group=state.answers[section.key]||{};return Object.keys(group).filter(n=>[1,2,3,4].includes(Number(group[n]))).length;}
  function renderStats(){const stats=$('sectionStats');stats.replaceChildren();
    config.sections.forEach(section=>{const row=el('div','stat');row.append(el('span','',section.label),el('strong','',`${answered(section)}/${section.count}`));stats.append(row);});}
  function renderSection(){
    tabs.querySelectorAll('button').forEach(btn=>btn.setAttribute('aria-selected',String(btn.dataset.section===activeSection)));
    const section=config.sections.find(s=>s.key===activeSection);
    $('sectionTitle').textContent=`${section.label} · ${section.count} câu`;
    $('sectionDesc').textContent=`Đối chiếu nội dung trong PDF của đúng kỳ thi. ${section.key==='writing'?'Viết nội dung trả lời để luyện tập; hệ thống chưa chấm Viết.':'Chọn một đáp án ①, ②, ③ hoặc ④ cho từng câu.'}`;
    const grid=$('questions'), essays=$('essays');grid.replaceChildren();essays.replaceChildren();
    if(section.key==='writing'){
      for(let i=0;i<section.count;i++){
        const number=section.firstNumber+i;
        const block=el('div','essay');const label=el('label','',`Câu ${number} · Bài viết`);
        const area=el('textarea');area.setAttribute('aria-label',`Câu viết số ${number}`);area.placeholder='Nhập bài viết tiếng Hàn theo đề PDF...';area.value=state.essays[number]||'';area.disabled=!!state.finished;
        area.addEventListener('input',()=>{state.essays[number]=area.value;save();renderStats();});
        block.append(label,area);essays.append(block);
      }
    } else {
      if(!state.answers[section.key])state.answers[section.key]={};
      for(let i=0;i<section.count;i++){
        const num=section.firstNumber+i;const item=el('div','question');
        item.append(el('div','question-label',`Câu ${num}`));const row=el('div','choice-row');
        for(let choice=1;choice<=4;choice++){
          const label=el('label','choice');const input=el('input');input.type='radio';input.name=`${section.key}-${num}`;input.value=String(choice);
          input.checked=Number(state.answers[section.key][num])===choice;input.disabled=!!state.finished;
          input.addEventListener('change',()=>{state.answers[section.key][num]=choice;save();renderStats();});
          label.append(input,el('span','',circled[choice]));row.append(label);
        }
        item.append(row);grid.append(item);
      }
    }
    renderStats();
  }
  function formatTime(ms){const s=Math.max(0,Math.ceil(ms/1000));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;}
  function renderTimer(){
    const remaining=state.startedAt?state.deadline-Date.now():config.durationMinutes*60000;
    $('clock').textContent=formatTime(state.finished?0:remaining);
    $('clock').classList.toggle('low',remaining<=5*60000 && !state.finished);
    $('clockStatus').textContent=state.finished?'Đã nộp bài':state.startedAt?'Đồng hồ đang chạy':'Nhấn “Bắt đầu tính giờ”';
    startButton.hidden=!!(state.startedAt||state.finished);
    if(state.startedAt&&!state.finished&&remaining<=0)finish(true);
  }
  function startClock(){if(interval)clearInterval(interval);interval=setInterval(renderTimer,1000);}
  function appendP(parent,text,cls=''){parent.append(el('p',cls,text));}
  function showResults(auto){
    const node=$('results');node.hidden=false;node.replaceChildren();node.append(el('h2','',auto?'Đã hết giờ – tự động nộp bài':'Kết quả nộp bài'));
    const stats=el('div','result-stats');
    if(key){
      let points=0,correct=0;
      for(const section of config.sections.filter(x=>x.key!=='writing')){
        const a=key[section.key]||[], group=state.answers[section.key]||{};
        let sectionPoints=0,sectionRight=0;
        for(let i=0;i<section.count;i++){
          const num=section.firstNumber+i;
          if(Number(group[num])===a[i][0]){sectionRight++;sectionPoints+=a[i][1];}
        }
        correct+=sectionRight;points+=sectionPoints;
        const box=el('div');box.append(el('strong','',`${sectionPoints}/100 điểm`),el('span','tiny',`${section.label}: đúng ${sectionRight}/${section.count} câu`));stats.append(box);
      }
      node.append(el('div','result-big',level==='I'?`${points}/200 điểm`:`${points}/200 điểm trắc nghiệm`));
      if(level==='I'){
        const rank=points>=140?'Ước tính TOPIK 2급':points>=80?'Ước tính TOPIK 1급':'Chưa đạt ngưỡng TOPIK I';appendP(node,rank);
      } else {appendP(node,'Chưa có điểm phần Viết (100 điểm). Không thể kết luận cấp TOPIK 3–6 chỉ từ hai phần trắc nghiệm.');}
      node.append(stats);
      appendP(node,'Điểm này là kết quả LUYỆN TẬP trên trình duyệt, không phải điểm thi chứng chỉ TOPIK.');
      if(!state.eventEmitted){
        state.eventEmitted=true; save();
        const elapsed=Math.max(0,Math.floor(((state.finishedAt||Date.now())-state.startedAt)/1000));
        // Existing Firestore practice rules accept durations <=7200 seconds and total <=100.
        window.dispatchEvent(new CustomEvent('mrlee:practice-finished',{detail:{
          examId:`topik-${exam.number}-${level.toLowerCase()}`,examTitle:`TOPIK ${level} · Đề ${exam.number} (số câu đúng)`,
          level:'general',score:correct,total:level==='I'?70:100,
          durationSeconds:Math.min(7200,elapsed),source:'client_practice'
        }}));
      }
    } else {
      const total=config.sections.filter(s=>s.key!=='writing').reduce((n,s)=>n+s.count,0);
      const selected=config.sections.filter(s=>s.key!=='writing').reduce((n,s)=>n+answered(s),0);
      node.append(el('div','result-big',`${selected}/${total} câu đã trả lời`));
      appendP(node,'Chưa nạp bảng đáp án được xác minh của kỳ này. Không hiển thị điểm và không ghi nhận điểm thi giả.');
      node.append(makeLink('Kiểm tra tài liệu/đáp án gốc',exam.source,'button ghost'));
    }
  }
  function finish(auto){
    if(state.finished)return;
    if(!auto&&!state.startedAt){alert('Hãy nhấn “Bắt đầu tính giờ” trước khi nộp bài.');return;}
    const done=config.sections.reduce((n,s)=>n+answered(s),0);
    const max=config.sections.reduce((n,s)=>n+s.count,0);
    if(!auto&&!confirm(`Bạn đã làm ${done}/${max} câu. Bạn chắc chắn muốn nộp bài?`))return;
    state.finished=true;state.finishedAt=Date.now();save();
    $('submitBtn').disabled=true;
    if(interval)clearInterval(interval);renderTimer();renderSection();showResults(auto);
    $('results').scrollIntoView({behavior:'smooth',block:'start'});
  }
  renderSection();renderTimer();
  if(state.finished){$('submitBtn').disabled=true;showResults(false);}
  else if(state.startedAt)startClock();
}
