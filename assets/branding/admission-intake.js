/* MR LEE · Admissions discovery gate V1. No PII, no backend changes. */
(()=>{'use strict';
 const doc=document, ROOT='mrleeAdmissionGate', CACHE='MRLEE.ADMISSION.INTAKE.V1';
 const options={
  goal:[['language','🇰🇷 Học tiếng Hàn'],['college','🎓 Cao đẳng'],['university','🏛️ Đại học'],['graduate','📘 Sau đại học'],['advice','💬 Cần tư vấn']],
  stage:[['highschool','Đang học THPT'],['graduated','Đã tốt nghiệp THPT'],['undergrad','Đang học CĐ/ĐH'],['degree','Đã tốt nghiệp CĐ/ĐH']],
  region:[['all','Chưa xác định khu vực'],['seoul','Seoul'],['busan','Busan'],['gyeonggi','Gyeonggi'],['incheon','Incheon'],['daegu','Daegu'],['daejeon','Daejeon'],['chungnam','Chungnam'],['chungbuk','Chungbuk'],['gangwon','Gangwon'],['gyeongbuk','Gyeongbuk'],['gyeongnam','Gyeongnam'],['jeonbuk','Jeonbuk'],['jeonnam-gwangju','Jeonnam / Gwangju'],['jeju','Jeju'],['ulsan','Ulsan'],['sejong','Sejong']]
 };
 const label=(field,value)=>options[field]?.find(x=>x[0]===value)?.[1]||value;
 const e=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 const state={open:false,selected:null};
 let previouslyFocused=null;
 const isCollege=s=>s.type==='college'&&!/대학원|전문대학원|graduate school|law school|medical school/i.test([s.ko,s.en].join(' '))&&/대학|college|polytech|institute/i.test([s.ko,s.en].join(' '));
 const isUni=s=>s.type==='university'&&!/사이버|cyber|방송통신/i.test([s.ko,s.en].join(' '));
 function matchSchools(list,choice){
   const region=choice.region;
   const regional=s=>region==='all'||(s.campuses||[]).some(c=>c.region===region);
   let valid=list.filter(s=>s&&((choice.goal==='college'&&isCollege(s))||(['university','graduate','language','advice'].includes(choice.goal)&&isUni(s))));
   const local=valid.filter(regional);
   if(region!=='all'&&local.length)valid=local;
   return valid.slice().sort((a,b)=>{
    const k=s=>(s.en||s.ko||'').toLocaleLowerCase();
    return k(a).localeCompare(k(b));
   }).slice(0,6);
 }
 function makeChoice(field,required=true){
   const fieldset=e('fieldset','mrlee-adm-field'),legend=e('legend','',field==='goal'?'01 · Chương trình bạn quan tâm':field==='stage'?'02 · Trình độ hiện tại':'03 · Khu vực muốn tìm hiểu (tùy chọn)');
   fieldset.append(legend);const wrap=e('div',field==='region'?'mrlee-adm-regions':'mrlee-adm-choices');
   if(field==='region'){
    const select=e('select');select.name=field;select.id='mrleeAdmRegion';
    options.region.forEach(([value,title])=>{const o=e('option','',title);o.value=value;select.append(o)});
    wrap.append(select);
   }else options[field].forEach(([value,title])=>{
    const labelEl=e('label','mrlee-adm-choice'),input=e('input');input.type='radio';input.name=field;input.value=value;input.required=required;
    labelEl.append(input,e('span','',title));wrap.append(labelEl);
   });
   fieldset.append(wrap);return fieldset;
 }
 function remember(value){try{sessionStorage.setItem(CACHE,JSON.stringify(value))}catch(_){}}
 function drawGate(){
  const overlay=e('div','mrlee-adm-overlay');overlay.id=ROOT;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','mrleeAdmTitle');overlay.hidden=true;
  const card=e('div','mrlee-adm-card'),aside=e('aside','mrlee-adm-intro');
  aside.append(e('span','mrlee-adm-eyebrow','STUDY IN KOREA · MR LEE'),e('h2','','Chọn mục tiêu.\nKhám phá trường Hàn Quốc.'),e('p','','Chỉ cần 2 lựa chọn để tìm danh mục trường theo hướng học tập. Bạn có thể bổ sung khu vực quan tâm.'));
  const note=e('p','mrlee-adm-notice','Gợi ý tham khảo từ danh mục trường trên website; chưa xác minh ngành, học phí, kỳ tuyển sinh hoặc điều kiện nhập học.');
  aside.append(note);
  const form=e('form','mrlee-adm-form');form.id='mrleeAdmForm';
  const header=e('div','mrlee-adm-formhead');header.append(e('span','','ĐỊNH HƯỚNG CÁ NHÂN'),e('strong','','Bước 01 / 02'));
  form.append(header,makeChoice('goal'),makeChoice('stage'),makeChoice('region',false));
  const actions=e('div','mrlee-adm-actions');const back=e('button','mrlee-adm-back','Để sau');back.type='button';back.addEventListener('click',()=>close(false));const submit=e('button','mrlee-adm-submit','Xem gợi ý trường phù hợp →');submit.type='submit';
  actions.append(back,submit);form.append(actions);
  const feedback=e('p','mrlee-adm-feedback','Gợi ý không thay thế xét tuyển chính thức.');form.append(feedback);
  form.addEventListener('submit',ev=>{
   ev.preventDefault();if(!form.reportValidity())return;
   const data=new FormData(form);
   const choice={goal:String(data.get('goal')),stage:String(data.get('stage')),region:String(data.get('region')||'all')};
   state.selected=choice;remember(choice);close(true);
   applyIntake(choice);
  });
  card.append(aside,form);overlay.append(card);
  overlay.addEventListener('keydown',ev=>{
   if(ev.key==='Escape'){ev.preventDefault();close(false)}
   if(ev.key!=='Tab')return;
   const focusable=[...overlay.querySelectorAll('button:not([disabled]),input,select')].filter(el=>el.getClientRects().length);
   if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];
   if(ev.shiftKey&&doc.activeElement===first){ev.preventDefault();last.focus()}
   else if(!ev.shiftKey&&doc.activeElement===last){ev.preventDefault();first.focus()}
  });
  doc.body.append(overlay);return overlay;
 }
 function close(hasChoice){const el=doc.getElementById(ROOT);if(el){el.hidden=true;doc.body.classList.remove('mrlee-adm-locked')}state.open=false;previouslyFocused?.focus?.();if(!hasChoice){const msg=doc.getElementById('mrleeAdmissionResults');if(msg){msg.hidden=false;msg.textContent='Bạn có thể chọn lại định hướng bất cứ lúc nào bằng nút “Chọn lại mục tiêu”.'}}}
 function open(){let el=doc.getElementById(ROOT)||drawGate();previouslyFocused=doc.activeElement;el.hidden=false;state.open=true;doc.body.classList.add('mrlee-adm-locked');el.querySelector('input[name="goal"]')?.focus()}
 async function applyIntake(choice){
  const results=doc.getElementById('mrleeAdmissionResults');if(!results)return;
  results.hidden=false;results.replaceChildren(e('p','mrlee-adm-loading','Đang đọc danh mục trường để đề xuất...'));
  const program=doc.getElementById('tsProgram'),education=doc.getElementById('tsEducation');
  const programMap={language:'Học tiếng D-4-1',college:'Đại học / Cao đẳng D-2',university:'Đại học / Cao đẳng D-2',graduate:'Sau đại học D-2',advice:'Chưa xác định'};
  const stageMap={highschool:'Đang học THPT',graduated:'Đã tốt nghiệp THPT',undergrad:'Đang học CĐ/ĐH',degree:'Đã tốt nghiệp CĐ/ĐH'};
  if(program)program.value=programMap[choice.goal]||'Chưa xác định';
  if(education)education.value=stageMap[choice.stage]||'';
  try{
   const response=await fetch('university-map/universities.json');if(!response.ok)throw Error('Không đọc được danh mục trường');
   const data=await response.json(),arr=Array.isArray(data.schools)?data.schools:[];
   const matches=matchSchools(arr,choice);results.replaceChildren();
   const title=e('div','mrlee-adm-result-head');title.append(e('h3','','Gợi ý trường để bạn tìm hiểu'),e('p','',label('goal',choice.goal)+' · '+label('stage',choice.stage)+' · '+label('region',choice.region)));
   results.append(title);
   const disclaimer=e('p','mrlee-adm-result-note','Danh sách được lọc từ dữ liệu công khai, theo loại trường và khu vực; chưa đánh giá học lực, chứng chỉ TOPIK, ngành tuyển sinh, tình trạng hoạt động hay khả năng cấp visa. Không phải quyết định đủ điều kiện nhập học.');
   results.append(disclaimer);
   const grid=e('div','mrlee-adm-recommendations');
   matches.forEach(s=>{
    const card=e('article','mrlee-adm-school');card.append(e('strong','',s.vi||s.en||s.ko),e('span','',s.ko||''),e('small','',((s.campuses||[])[0]?.address)||'Cần xác minh địa chỉ/cơ sở'));
    const link=e('a','','Xem danh mục và bản đồ ↗');link.href='ban-do-dai-hoc-han-quoc.html';card.append(link);grid.append(card);
   });
   if(!matches.length)grid.append(e('p','mrlee-adm-result-note','Không có kết quả đúng bộ lọc này. Hãy chọn một khu vực khác hoặc liên hệ tư vấn.'));
   results.append(grid);
   const more=e('div','mrlee-adm-result-actions');const change=e('button','','↻ Chọn lại mục tiêu');change.type='button';change.addEventListener('click',open);
   const contact=e('a','','Gửi hồ sơ để tư vấn →');contact.href='#dang-ky';
   more.append(change,contact);results.append(more);
   results.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){results.replaceChildren(e('p','mrlee-adm-result-note','Chưa tải được dữ liệu trường. Bạn vẫn có thể xem danh mục và liên hệ tư vấn.'))}
 }
 doc.addEventListener('DOMContentLoaded',()=>{
  const target=doc.querySelector('#chon-truong .ts-wrap');
  if(target){
   const section=e('section','mrlee-adm-results');section.id='mrleeAdmissionResults';section.hidden=true;target.prepend(section);
   const intro=doc.querySelector('.ts-school-intro');if(intro){const btn=e('button','mrlee-adm-reopen','✦ Chọn mục tiêu để tìm trường');btn.type='button';btn.addEventListener('click',open);intro.append(btn)}
  }
  // Every entry into the admissions page displays the gate, even when a previous
  // selection was made. Only deliberate anchor jumps to consultation are exempt.
  const directAnchor=location.hash&&['#dang-ky','#chuan-bi','#ky-tuc-xa','#hoi-dap','#lo-trinh','#chuong-trinh'].includes(location.hash);
  if(!directAnchor)open();
 });
 window.MRLEE_ADMISSION_INTAKE={open,matchSchools};
})();
