/* MR LEE · Tuyển sinh: 2-step local orientation before admissions page.
   No personal data sent or stored. Public catalog is exploratory only. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const goals=[['language','🇰🇷 Học tiếng D-4-1'],['college','🏫 Cao đẳng'],['university','🎓 Đại học'],['graduate','✧ Sau đại học'],['unsure','💬 Cần tư vấn']];
const stages=[['highschool','Đang học THPT'],['graduated-highschool','Đã tốt nghiệp THPT'],['undergraduate','Đang học CĐ/ĐH'],['graduated-degree','Đã tốt nghiệp CĐ/ĐH']];
const languages=[['none','Chưa học tiếng Hàn'],['basic','Sơ cấp / đang học'],['topik12','TOPIK 1–2'],['topik34','TOPIK 3–4'],['topik56','TOPIK 5–6']];
const areas=[['all','Chưa chọn khu vực'],['seoul','Seoul'],['gyeonggi','Gyeonggi'],['busan','Busan'],['incheon','Incheon'],['daegu','Daegu'],['daejeon','Daejeon'],['jeonnam-gwangju','Gwangju · Jeonnam'],['gyeongnam','Gyeongnam'],['gyeongbuk','Gyeongbuk'],['chungnam','Chungnam'],['chungbuk','Chungbuk'],['gangwon','Gangwon'],['jeonbuk','Jeonbuk'],['jeju','Jeju'],['sejong','Sejong'],['ulsan','Ulsan']];
const fields=[['all','Chưa xác định ngành'],['engineering','Kỹ thuật / công nghệ'],['business','Kinh doanh / quản trị'],['health','Y tế / điều dưỡng'],['arts','Nghệ thuật / thiết kế'],['education','Giáo dục / ngôn ngữ']];
const labels=a=>Object.fromEntries(a);
const buildOptions=(name,choices)=>choices.map(([value,label])=>'<label><input type="radio" name="'+name+'" value="'+value+'"><span>'+label+'</span></label>').join('');
const selectOptions=choices=>choices.map(([v,label])=>'<option value="'+v+'">'+label+'</option>').join('');
const overlay=document.createElement('div');
overlay.className='ts-intake-overlay';
overlay.id='tsIntakeOverlay';overlay.hidden=true;
overlay.innerHTML=`
 <section class="ts-intake-modal" role="dialog" aria-modal="true" aria-labelledby="tsIntakeTitle" aria-describedby="tsIntakeDesc">
 <div class="ts-intake-intro"><div><small>MR LEE • STUDY IN KOREA</small><h2 id="tsIntakeTitle">Mục tiêu của bạn.<br><span>Hành trình dành cho bạn.</span></h2>
 <p id="tsIntakeDesc">Chọn thông tin học tập để tìm hướng chuẩn bị phù hợp và khám phá trường cao đẳng, đại học trong danh mục MR LEE.</p></div>
 <div class="ts-intake-mark">한국 유학 ✦ YOUR NEXT CHAPTER</div></div>
 <div class="ts-intake-main"><div class="ts-intake-progress" id="tsIntakeProgress">BƯỚC 01 / 02 · Mục tiêu và học vấn</div>
 <h3 id="tsIntakeStepTitle">Bắt đầu từ dự định của bạn</h3><p>Không cần họ tên, số điện thoại hay tài liệu cá nhân.</p>
 <form id="tsIntakeForm">
 <div class="ts-intake-step" data-step="1">
 <fieldset class="ts-intake-field"><legend>1. Bạn muốn học chương trình nào?</legend><div class="ts-intake-options">${buildOptions('goal',goals)}</div></fieldset>
 <fieldset class="ts-intake-field"><legend>2. Trình độ học vấn hiện tại?</legend><div class="ts-intake-options">${buildOptions('stage',stages)}</div></fieldset>
 </div>
 <div class="ts-intake-step" data-step="2" hidden>
 <fieldset class="ts-intake-field"><legend>3. Trình độ tiếng Hàn hiện tại?</legend><div class="ts-intake-options">${buildOptions('language',languages)}</div></fieldset>
 <div class="ts-intake-field"><label for="tsIntakeArea">4. Bạn quan tâm khu vực nào?</label><select id="tsIntakeArea" name="area">${selectOptions(areas)}</select></div>
 <div class="ts-intake-field"><label for="tsIntakeField">5. Ngành học mong muốn (tùy chọn)</label><select id="tsIntakeField" name="field">${selectOptions(fields)}</select></div>
 </div>
 <p class="ts-intake-feedback" id="tsIntakeError" role="status" aria-live="polite"></p>
 <div class="ts-intake-actions"><button type="button" id="tsIntakeBack" class="ts-intake-secondary" hidden>← Quay lại</button>
 <button type="submit" id="tsIntakeNext" class="ts-intake-primary">Tiếp tục →</button>
 <button type="button" id="tsIntakeSkip" class="ts-intake-secondary">Xem trang tuyển sinh</button></div>
 <p class="ts-intake-note">Gợi ý để tham khảo, không phải kết quả xét tuyển. Điều kiện ngành học, TOPIK, học phí, học bổng và kỳ nhập học phải xác minh trực tiếp tại trường.</p>
 </form></div></section>`;
const result=document.createElement('section');result.id='tsPersonalRecommendations';result.className='ts-intake-result ts-wrap';result.hidden=true;result.setAttribute('aria-live','polite');
const main=document.getElementById('noi-dung');
if(!main)return;
main.prepend(result);document.body.append(overlay);
const form=$('tsIntakeForm'),step1=overlay.querySelector('[data-step="1"]'),step2=overlay.querySelector('[data-step="2"]');
const error=$('tsIntakeError'),next=$('tsIntakeNext'),back=$('tsIntakeBack');
let step=1;let lastFocus=null;
const chosen=(name)=>form.querySelector('input[name="'+name+'"]:checked')?.value||'';
function showStep(n){step=n;step1.hidden=n!==1;step2.hidden=n!==2;back.hidden=n===1;next.textContent=n===1?'Tiếp tục →':'Xem gợi ý và vào Tuyển sinh →';$('tsIntakeProgress').textContent=n===1?'BƯỚC 01 / 02 · Mục tiêu và học vấn':'BƯỚC 02 / 02 · Ngoại ngữ và trường học';$('tsIntakeStepTitle').textContent=n===1?'Bắt đầu từ dự định của bạn':'Thu hẹp lựa chọn trường';error.textContent='';overlay.querySelector('[data-step="'+n+'"] input')?.focus({preventScroll:true});}
function close(){overlay.hidden=true;document.body.classList.remove('ts-intake-active');lastFocus?.focus?.({preventScroll:true});}
function open(){lastFocus=document.activeElement;overlay.hidden=false;document.body.classList.add('ts-intake-active');showStep(1)}
function valid(s){if(s===1){if(!chosen('goal')||!chosen('stage')){error.textContent='Vui lòng chọn chương trình và trình độ học vấn.';return false}}else if(!chosen('language')){error.textContent='Vui lòng chọn trình độ tiếng Hàn hiện tại.';return false}return true}
function category(s){
 const ko=String(s.ko||''),en=String(s.en||'');
 if(/대학원|전문대학원|Graduate School|Law School|School of Medicine|School of Dentistry|Graduate University/i.test(ko+' '+en))return 'graduate';
 if(s.type==='university')return 'university';
 // Import labels some graduate colleges as junior-college. Explicitly exclude above.
 if(s.type==='college'&&s.subType==='junior-college')return 'college';
 return 'other';
}
const fieldTokens={
 engineering:/공과|공업|기술|과학|tech|engineering|science|polytechnic|industrial/i,
 business:/경상|경영|상경|business|management|commerce|econom|finance/i,
 health:/보건|간호|의과|health|nurs|medical|medicine/i,
 arts:/예술|미술|디자인|방송|arts|design|media|film|music/i,
 education:/교육|어학|외국어|사범|education|language|foreign/i
};
function score(s,answers){
 const cat=category(s),target=answers.goal;
 if(target==='college'&&cat!=='college'||target==='university'&&cat!=='university'||target==='graduate'&&cat!=='graduate')return -1;
 if((target==='language'||target==='unsure')&&cat==='graduate')return -1;
 let n=cat==='university'?12:cat==='college'?10:6;
 const regs=(s.campuses||[]).map(c=>c.region);
 if(answers.area!=='all'&&regs.includes(answers.area))n+=35;
 if(answers.area!=='all'&&!regs.includes(answers.area))n-=22;
 if(answers.field!=='all'&&fieldTokens[answers.field]?.test((s.ko||'')+' '+(s.en||'')))n+=15;
 if(/사이버|cyber|online university/i.test((s.ko||'')+' '+(s.en||'')))n-=25;
 return n;
}
const name=s=>String(s.vi||s.en||s.ko||'Trường chưa có tên');
function fillLead(a){
 const select=$('tsProgram'),education=$('tsEducation'),msg=$('tsMessage');
 const program={language:'Học tiếng D-4-1',college:'Đại học / Cao đẳng D-2',university:'Đại học / Cao đẳng D-2',graduate:'Sau đại học D-2',unsure:'Chưa xác định'};
 const stage={'highschool':'Đang học THPT','graduated-highschool':'Đã tốt nghiệp THPT',undergraduate:'Đang học CĐ/ĐH','graduated-degree':'Đã tốt nghiệp CĐ/ĐH'};
 if(select)select.value=program[a.goal]||'Chưa xác định';
 if(education)education.value=stage[a.stage]||'';
 if(msg&&!msg.value.trim())msg.value='Mong muốn: '+labels(goals)[a.goal]+'; tiếng Hàn: '+labels(languages)[a.language]+'; khu vực: '+labels(areas)[a.area]+'; ngành: '+labels(fields)[a.field]+'. Xin tư vấn điều kiện thực tế và trường phù hợp.';
}
async function recommendations(a){
 const heading=document.createElement('h2');heading.textContent='Lộ trình tham khảo dành cho bạn';
 const eyebrow=document.createElement('small');eyebrow.textContent='ĐỊNH HƯỚNG MR LEE · KẾT QUẢ BAN ĐẦU';
 const summary=document.createElement('p');summary.className='ts-intake-summary';summary.textContent='Mục tiêu: '+labels(goals)[a.goal]+' · '+labels(stages)[a.stage]+' · '+labels(languages)[a.language]+' · Khu vực: '+labels(areas)[a.area]+'.';
 const notice=document.createElement('p');notice.className='ts-intake-disclaimer';
 notice.textContent='Các trường sau chỉ được chọn theo loại trường, khu vực và từ khóa ngành trong tên trường thuộc danh mục công khai của website. Dữ liệu chưa xác minh học phí, chuyên ngành đang mở, quyền cấp visa, nhận hồ sơ quốc tế hoặc điều kiện nhập học; KHÔNG phải xếp hạng trường hay xác nhận bạn đủ điều kiện.';
 const grid=document.createElement('div');grid.className='ts-intake-grid';
 const info=document.createElement('p');info.className='ts-intake-summary';info.textContent='Đang đọc danh mục trường...';
 const actions=document.createElement('div');actions.className='ts-intake-buttons';
 const consult=document.createElement('a');consult.href='#dang-ky';consult.textContent='Nhận tư vấn cá nhân ↗';
 const all=document.createElement('a');all.href='ban-do-dai-hoc-han-quoc.html';all.textContent='Xem danh mục trường ↗';
 const redo=document.createElement('button');redo.type='button';redo.textContent='Điều chỉnh lựa chọn';redo.addEventListener('click',open);
 actions.append(consult,all,redo);result.replaceChildren(eyebrow,heading,summary,info,grid,notice,actions);result.hidden=false;
 try{
  const res=await fetch('university-map/universities.json',{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);
  const data=await res.json(),schools=Array.isArray(data.schools)?data.schools:[];
  const ranked=schools.map(s=>({s,rank:score(s,a)})).filter(x=>x.rank>=0).sort((x,y)=>y.rank-x.rank||name(x.s).localeCompare(name(y.s),'ko')).slice(0,6);
  info.textContent=ranked.length?'Gợi ý khám phá '+ranked.length+' cơ sở trong danh mục (không phải kết quả tuyển sinh):':'Chưa tìm được trường khớp bộ lọc; bạn có thể xem toàn bộ danh mục hoặc nhận tư vấn riêng.';
  for(const {s} of ranked){
   const card=document.createElement('article');card.className='ts-intake-school';
   const title=document.createElement('strong');title.textContent=name(s);
   const desc=document.createElement('small');const type=category(s)==='college'?'Cao đẳng (phân loại dữ liệu)':category(s)==='graduate'?'Sau đại học (phân loại dữ liệu)':'Đại học (phân loại dữ liệu)';
   desc.textContent=type+' · '+(s.campuses?.[0]?.address||s.campuses?.[0]?.region||'Chưa rõ khu vực')+' · Cần xác minh tại trường';
   const link=document.createElement('a');link.href='ban-do-dai-hoc-han-quoc.html';link.textContent='Tra cứu trên bản đồ ↗';
   card.append(title,desc,link);grid.append(card);
  }
 }catch(e){info.textContent='Không tải được danh mục trường. Vui lòng sử dụng bản đồ hoặc liên hệ tư vấn để tra cứu.';}
}
form.addEventListener('submit',async e=>{
 e.preventDefault();if(!valid(step))return;
 if(step===1){showStep(2);return;}
 const a={goal:chosen('goal'),stage:chosen('stage'),language:chosen('language'),area:$('tsIntakeArea').value,field:$('tsIntakeField').value};
 close();fillLead(a);await recommendations(a);
 result.scrollIntoView({behavior:'smooth',block:'start'});
});
back.addEventListener('click',()=>showStep(1));
document.querySelectorAll('a[href="#tu-van-nhanh"],a[href="#tsPersonalRecommendations"]').forEach(a=>{
 a.addEventListener('click',e=>{if(!result.hidden)return;e.preventDefault();open()});
});
$('tsIntakeSkip').addEventListener('click',close);
overlay.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();close();return}
 if(e.key!=='Tab')return;
 const controls=[...overlay.querySelectorAll('button:not([hidden]),input:not([disabled]),select:not([disabled])')].filter(el=>!el.closest('[hidden]'));
 if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
// New navigations to admissions show the selector; reloading the same page retains the current
// page view, while navigating in from a menu shows it again. No personal details persisted.
const nav=performance.getEntriesByType?.('navigation')?.[0]?.type||'navigate';
if(nav!=='reload')open();
else{try{const a=sessionStorage.getItem('MRLEE.ADMISSIONS.INIT');if(!a)open()}catch(_){open()}}
try{sessionStorage.setItem('MRLEE.ADMISSIONS.INIT','1')}catch(_){}
})();
