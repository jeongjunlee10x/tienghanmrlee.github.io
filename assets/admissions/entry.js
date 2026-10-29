/* Admissions landing: two-step local guidance followed by grounded school discovery.
   NOT an eligibility check. No personal information transmitted or saved. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),dialog=$('mrleeAdmissionsDialog'),form=$('mrleeAdmissionsForm');
 const fit=window.MRLEE_ADMISSIONS_FIT;
 if(!dialog||!form||!fit)return;
 const store='MRLEE.ADMISSIONS.NONPERSONAL.V1';
 const stage1=$('apStep1'),stage2=$('apStep2'),error=$('apError');
 const summary=$('apSummary'),results=$('mrleeAdmissionsResults'),cards=$('apSchools'),caption=$('apResultsHeading');
 const isReload=performance.getEntriesByType('navigation')?.[0]?.type==='reload';
 let catalog=null,last=null,pending=false;
 const options=fit.normalizeProfile({});
 let prev=null;
 try{prev=fit.normalizeProfile(JSON.parse(sessionStorage.getItem(store)||'null'))}catch(e){prev=null}
 if(prev){
  for(const [key,value] of Object.entries(prev)){
   const field=form.elements.namedItem(key);if(!field)continue;
   if(typeof field.value==='string')field.value=value;
   else if(typeof field.length==='number')for(const input of field)input.checked=input.value===value;
  }
 }
 function step(n){
  dialog.dataset.step=String(n);stage1.hidden=n!==1;stage2.hidden=n!==2;
  $('apCounter').textContent='BƯỚC 0'+n+' / 02';
  $('apStepName').textContent=n===1?'Hiểu mục tiêu của bạn':'Sở thích và khu vực ưu tiên';
  error.textContent='';
  (n===1?$('[apStart]'):null);
 }
 // Prevent a second blocking modal from fighting the per-tab interface chooser.
 function openAfterTheme(){
  if(dialog.open)return;
  const theme=document.getElementById('mrlee-theme-entry');
  if(theme?.open){
   const watcher=new MutationObserver(()=>{
    if(!document.getElementById('mrlee-theme-entry')?.open){watcher.disconnect();if(!dialog.open)dialog.showModal()}
   });
   watcher.observe(theme,{attributes:true,attributeFilter:['open']});
  }else dialog.showModal();
  step(1);
 }
 function close(){
  if(dialog.open)dialog.close();
  try{history.replaceState({...history.state,mrleeAdmissionsDone:true},'',location.href)}catch(e){}
 }
 dialog.addEventListener('cancel',e=>{e.preventDefault();error.textContent='Vui lòng hoàn thành định hướng để xem gợi ý. Bạn có thể chọn “Cần định hướng” nếu chưa rõ mục tiêu.'});
 $('apNext').addEventListener('click',()=>{
  const goal=form.querySelector('input[name="goal"]:checked'),stage=form.querySelector('input[name="stage"]:checked');
  if(!goal||!stage){error.textContent='Hãy chọn chương trình và giai đoạn học tập trước khi tiếp tục.';return}
  step(2);$('apRegion').focus();
 });
 $('apBack').addEventListener('click',()=>{step(1);form.querySelector('input[name="goal"]:checked')?.focus()});
 function fillConsult(p){
  const program=$('tsProgram'),education=$('tsEducation'),msg=$('tsMessage');
  const map={language:'Học tiếng D-4-1',college:'Đại học / Cao đẳng D-2',
    university:'Đại học / Cao đẳng D-2',graduate:'Sau đại học D-2',undecided:'Chưa xác định'};
  const stage={highschool:'Đang học THPT',graduated:'Đã tốt nghiệp THPT',undergrad:'Đang học CĐ/ĐH',degree:'Đã tốt nghiệp CĐ/ĐH'};
  if(program)program.value=map[p.goal];
  if(education)education.value=stage[p.stage]||'';
  if(msg&&!msg.value.trim()){
   msg.value='Định hướng tham khảo: '+fit.goals[p.goal]+' · '+fit.korean[p.korean]+
      ' · Khu vực '+fit.regions[p.region]+' · Ngành quan tâm '+fit.fields[p.field]+'. Cần xác nhận ngành, học phí và điều kiện tuyển sinh thực tế.';
  }
 }
 function card(item){
  const article=document.createElement('article');article.className='ap-school-card';
  const badge=document.createElement('span');badge.className='ap-school-kind';
  badge.textContent=item.type==='college'?'CAO ĐẲNG · THAM KHẢO':'ĐẠI HỌC · THAM KHẢO';
  const h=document.createElement('h3');h.textContent=item.name;
  const sub=document.createElement('p');sub.textContent=(item.ko&&item.ko!==item.name?item.ko+' · ':'')+item.regionLabel;
  const hint=document.createElement('p');hint.textContent='Đối chiếu ngành học, hình thức đào tạo, học phí, ngoại ngữ và kỳ tuyển sinh tại trường.';
  const link=document.createElement('a');link.href='ban-do-dai-hoc-han-quoc.html';
  link.textContent='Tra cứu bản đồ MR LEE ↗';link.title='Mở danh mục bản đồ trường';
  article.append(badge,h,sub,hint,link);
  if(item.website){
   const official=document.createElement('a');official.href=item.website;
   official.target='_blank';official.rel='noopener noreferrer';
   official.textContent=' Website trường ↗';official.style.marginLeft='11px';
   article.append(official);
  }
  return article;
 }
 async function getCatalog(){
  if(catalog)return catalog;
  const response=await fetch('university-map/universities.json',{cache:'force-cache'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(!Array.isArray(data.schools))throw Error('Dữ liệu trường không hợp lệ');
  return catalog=data.schools;
 }
 async function display(raw){
  const p=fit.normalizeProfile(raw);last=p;fillConsult(p);
  results.hidden=false;cards.replaceChildren();
  caption.textContent='Trường nên tìm hiểu tiếp theo';
  summary.textContent='Mục tiêu: '+fit.goals[p.goal]+' · Giai đoạn: '+fit.stages[p.stage]+
   ' · Tiếng Hàn: '+fit.korean[p.korean]+' · Khu vực: '+fit.regions[p.region]+
   '. Đây là danh sách để khám phá, chưa phải đánh giá đủ điều kiện hay xác nhận ngành/chương trình của trường.';
  const waiting=document.createElement('p');waiting.textContent='Đang đối chiếu danh mục trường hiện có…';cards.append(waiting);
  try{
   const all=await getCatalog();
   const rec=fit.recommend(all,p,6);
   cards.replaceChildren();
   if(!rec.items.length){
    caption.textContent='Chưa tìm thấy trường theo bộ lọc';
    const el=document.createElement('p');el.textContent='Thử chọn “Toàn Hàn Quốc” hoặc đổi bậc học; dữ liệu hiện tại chưa xác minh đầy đủ từng campus.';cards.append(el);
   }else{
    rec.items.forEach(item=>cards.append(card(item)));
    caption.textContent='Gợi ý '+rec.items.length+' trường để tham khảo · '+rec.total+' trường thuộc nhóm lọc';
   }
  }catch(e){
   cards.replaceChildren();
   const fail=document.createElement('p');fail.textContent='Chưa tải được danh mục trường. Bạn vẫn có thể dùng bản đồ hoặc gửi yêu cầu tư vấn. Lỗi: '+String(e.message||e);
   cards.append(fail);
  }
 }
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(pending)return;
  if(!form.querySelector('input[name="goal"]:checked')||!form.querySelector('input[name="stage"]:checked')){step(1);error.textContent='Bạn cần chọn đầy đủ hai câu hỏi.';return}
  const p=fit.normalizeProfile(Object.fromEntries(new FormData(form).entries()));
  try{sessionStorage.setItem(store,JSON.stringify(p))}catch(e){}
  pending=true;$('apFinish').disabled=true;
  close();
  try{await display(p)}finally{pending=false;$('apFinish').disabled=false}
  results.scrollIntoView({block:'start',behavior:'smooth'});
 });
 $('apRetake').addEventListener('click',()=>{step(1);openAfterTheme()});
 // Reload in the same history entry does not force repeated selection; new
 // navigation into /tuyen-sinh.html presents the modal again.
 if(isReload && history.state?.mrleeAdmissionsDone){
  if(prev)display(prev);
 }else{
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',openAfterTheme,{once:true});
  else openAfterTheme();
 }
 window.MRLEE_ADMISSIONS_ENTRY={display,open:openAfterTheme,getCurrent:()=>last};
})();
