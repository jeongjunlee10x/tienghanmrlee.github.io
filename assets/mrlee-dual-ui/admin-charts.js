/* MR LEE Admin Charts v1: RLS-protected real data, on EACH Admin section */
(()=>{'use strict';
const d=document,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bridge=()=>window.MRLEE_ADMIN_PLACEMENT_BRIDGE;
const pages=()=>Array.from(d.querySelectorAll('.main-pad > section.page'));
let cache=null,lastLoad=0,busy=false,period=14;
const pageNames={'page-overview':'Tổng quan hệ thống','page-students':'Học viên và tiến độ','page-scores':'Điểm và kết quả','page-activity':'Hoạt động học tập','page-rewards':'Thi đua và phần thưởng','page-settings':'Cấu hình quản trị','page-placements':'Bài kiểm tra đầu vào','page-all-attempts':'Bài làm toàn website','page-consultations':'Yêu cầu tư vấn'};
function panel(page){
 if(page.querySelector('.mrlee-admin-analytics'))return;
 const box=d.createElement('div');box.className='mrlee-admin-analytics';
 box.innerHTML='<div class="mrlee-analytics-head"><div><h3>◈ Thống kê — '+esc(pageNames[page.id]||'Trung tâm quản trị')+'</h3><small>Số tổng hợp có đối chiếu máy chủ · Các biểu đồ có giới hạn mẫu, không phải toàn bộ dữ liệu</small></div><div><label for="mrleePeriod'+esc(page.id)+'">Khoảng thời gian:</label> <select class="mrlee-chart-period" id="mrleePeriod'+esc(page.id)+'"><option value="7">7 ngày</option><option value="14" selected>14 ngày</option><option value="30">30 ngày</option></select> <button type="button" class="btn soft mrlee-chart-reload">↻ Cập nhật</button></div></div><div class="mrlee-admin-kpis"><div><small>Tổng học viên (theo RLS)</small><strong data-stat="students">—</strong></div><div><small>Học viên hoạt động 7 ngày</small><strong data-stat="active">—</strong></div><div><small>Bài luyện tập đã lưu</small><strong data-stat="attempts">—</strong></div><div><small>Kiểm tra đầu vào</small><strong data-stat="placements">—</strong></div><div><small>Yêu cầu tư vấn</small><strong data-stat="consultations">—</strong></div><div><small>Tư vấn mới / đang liên hệ</small><strong data-stat="openLeads">—</strong></div><div><small>Bài làm có chi tiết đáp án</small><strong data-stat="reviewable">—</strong></div><div><small>Bài đạt từ 70% (mẫu bài gần nhất)</small><strong data-stat="passed">—</strong></div></div><div class="mrlee-admin-charts"><div class="mrlee-chart-panel"><strong>Hoạt động theo ngày — tối đa 1.500 bản ghi mỗi nguồn</strong><div data-chart="activity"><p>Đang tải số liệu...</p></div></div><div class="mrlee-chart-panel"><strong>Điểm luyện tập trung bình — mẫu bài gần nhất</strong><div data-chart="levels"><p>Đang tải số liệu...</p></div></div><div class="mrlee-chart-panel mrlee-chart-progress"><strong>Tiến độ hoạt động học tập theo trình độ</strong><div data-chart="learning-progress"><p>Đang tải dữ liệu học tập...</p></div></div></div><p class="mrlee-chart-note" style="font-size:11px;opacity:.75;margin-top:9px">Dữ liệu Supabase thực tế, không chèn số ảo. Điểm tự chấm không phải điểm TOPIK chính thức; số lượt học không phải % hoàn thành giáo trình. Biểu đồ dùng tối đa 2.000 hồ sơ và 1.500 bản ghi gần nhất mỗi loại; KPI tổng học viên và hoạt động 7 ngày dùng phép đếm từ máy chủ. <span class="mrlee-v2-stats-updated" aria-live="polite">Chưa tải dữ liệu.</span></p>';
 page.prepend(box);
 box.querySelector('select').addEventListener('change',e=>{period=Number(e.target.value)||14;d.querySelectorAll('.mrlee-chart-period').forEach(s=>{s.value=String(period)});if(cache)renderAll()});
 box.querySelector('button').addEventListener('click',()=>void load(true));
}
function ensure(){pages().forEach(panel)}
function day(x){const t=new Date(x);return Number.isFinite(t.getTime())?new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(t):''}
function rows(n){const out=[];const now=new Date(Date.now()+7*3600000);for(let i=n-1;i>=0;i--){const t=new Date(now);t.setUTCHours(12,0,0,0);t.setUTCDate(t.getUTCDate()-i);out.push(t.toISOString().slice(0,10))}return out}
function chartActivity(scores,events){
 const days=rows(period),smap=Object.fromEntries(days.map(d=>[d,0])),emap={...smap};
 for(const s of scores){let k=day(s.created_at||s.exam_date);if(k in smap)smap[k]++}
 for(const e of events){let k=day(e.happened_at||e.created_at);if(k in emap)emap[k]++}
 const sv=days.map(k=>smap[k]),ev=days.map(k=>emap[k]),mx=Math.max(1,...sv,...ev);
 const graph=(a,color)=>'<polyline points="'+a.map((v,i)=>[31+i*(455/(days.length-1)),155-115*v/mx].join(',')).join(' ')+'" fill="none" stroke="'+color+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+a.map((v,i)=>'<circle cx="'+(31+i*455/(days.length-1))+'" cy="'+(155-115*v/mx)+'" r="2.8" fill="'+color+'"><title>'+esc(days[i])+': '+v+'</title></circle>').join('');
 const grids=[0,.5,1].map(v=>'<line x1="29" y1="'+(155-115*v)+'" x2="488" y2="'+(155-115*v)+'" stroke="#668caf" stroke-opacity=".25"/><text x="3" y="'+(159-115*v)+'" font-size="11" fill="#83a9d3">'+Math.round(mx*v)+'</text>').join('');
 return '<svg viewBox="0 0 500 190" role="img" aria-label="Thống kê học tập '+period+' ngày; tổng '+sv.reduce((a,b)=>a+b,0)+' bài nộp, '+ev.reduce((a,b)=>a+b,0)+' lượt truy cập">'+grids+graph(sv,'#33c6ef')+graph(ev,'#ac7cff')+'<text x="26" y="178" fill="#83a9d3" font-size="11">'+esc(days[0].slice(5))+'</text><text x="436" y="178" fill="#83a9d3" font-size="11">'+esc(days.at(-1).slice(5))+'</text></svg><div class="mrlee-chart-legend"><span style="--swatch:#33c6ef">Bài làm</span><span style="--swatch:#ac7cff">Lượt hoạt động</span></div>';
}
function chartLevels(scores,students){
 const groups=['Sơ cấp 1','Sơ cấp 2','Trung cấp 1','Trung cấp 2','Cao cấp 1','Cao cấp 2'];
 const labels=['SC1','SC2','TC1','TC2','CC1','CC2'],ids=['1','2','3','4','5','6'],colors=['#25c5ee','#848bff','#b67fff','#58e0ba','#ffb86d','#f27da0'];
 const idsMap=new Map(students.map(x=>[x.id,String(x.level||'')]));
 const sums=groups.map(()=>({total:0,n:0}));
 for(const s of scores){let str=idsMap.get(s.student_id)||'',i=groups.findIndex((v,j)=>str.toLowerCase().includes(v.toLowerCase())||str==='sc'+ids[j]);if(i<0)continue;
 const total=Number(s.max_score),score=Number(s.score);if(total>0&&Number.isFinite(score)){sums[i].total+=100*score/total;sums[i].n++}}
 const contents=sums.map((x,i)=>{const pct=x.n?Math.round(x.total/x.n):0,y=24+i*28;
 return '<text x="0" y="'+(y+10)+'" font-size="12" fill="#a3c4e7">'+labels[i]+'</text><rect x="44" y="'+y+'" width="280" height="13" rx="6.5" fill="#234060"/><rect x="44" y="'+y+'" width="'+(280*pct/100)+'" height="13" rx="6.5" fill="'+colors[i]+'"/><text x="337" y="'+(y+11)+'" font-size="11" fill="#d9ebff">'+(x.n?pct+'%':'—')+'</text>';
 }).join('');
 return '<svg viewBox="0 0 380 198" role="img" aria-label="Điểm trung bình theo trình độ học viên; các cấp không có bài luyện ghi dấu gạch ngang">'+contents+'</svg><small>Chỉ tính khi có bài làm và cấp của học viên được ghi nhận.</small>';
}
/* Progress here counts actual saved learning events. It is not a fabricated
 * curriculum completion percentage; Firestore has no audited completion
 * denominator for all 90 lessons yet.
 */
function chartStudyProgress(events,students){
 const levels=['Sơ cấp 1','Sơ cấp 2','Trung cấp 1','Trung cấp 2','Cao cấp 1','Cao cấp 2','Khác'];
 const userLevels=new Map(students.map(s=>[String(s.id),String(s.level||'Khác')]));
 const counts=levels.map(()=>({lesson:0,practice:0,visit:0}));
 for(const item of events){
   const index=levels.indexOf(userLevels.get(String(item.student_id))||'Khác');
   const i=index<0?6:index;
   const k=String(item.kind||'').toLowerCase();
   const category=k==='lesson'?'lesson':(k==='practice'?'practice':'visit');
   counts[i][category]++;
 }
 const total=counts.reduce((v,x)=>v+x.lesson+x.practice+x.visit,0);
 if(!total)return '<p style="font-size:12px;color:inherit">Chưa ghi nhận hoạt động học tập để thống kê.</p>';
 const colors={lesson:'#40e0fa',practice:'#aa89ff',visit:'#5176a1'};
 const max=Math.max(1,...counts.map(x=>x.lesson+x.practice+x.visit));
 const rows=counts.map((x,i)=>{
   const n=x.lesson+x.practice+x.visit;if(!n)return '';
   let offset=0;const bars=['lesson','practice','visit'].map(k=>{
     const width=263*x[k]/max,out='<rect x="'+(109+offset)+'" y="'+(i*27+18)+'" width="'+width+'" height="16" rx="3" fill="'+colors[k]+'"><title>'+x[k]+' '+(k==='lesson'?'bài học':k==='practice'?'luyện tập':'lượt xem')+'</title></rect>';offset+=width;return out;
   }).join('');
   return '<text x="2" y="'+(i*27+30)+'" font-size="12" fill="#a5c9e7">'+levels[i]+'</text>'+bars+'<text x="379" y="'+(i*27+30)+'" font-size="12" fill="#dcecff">'+n+'</text>';
 }).join('');
 return '<svg viewBox="0 0 440 230" role="img" aria-label="Số lượt bài học, luyện tập, truy cập đã ghi nhận theo trình độ học viên">'+rows+'</svg><div class="mrlee-chart-legend"><span style="--swatch:'+colors.lesson+'">Lượt học bài</span><span style="--swatch:'+colors.practice+'">Lượt luyện tập</span><span style="--swatch:'+colors.visit+'">Lượt truy cập</span></div><small>Tiến độ hoạt động là lượt được đồng bộ; chưa phải tỷ lệ hoàn thành giáo trình. Dữ liệu hiển thị tối đa 1.500 sự kiện gần nhất.</small>';
}
function renderAll(){
 if(!cache)return;ensure();
 const {students,scores,events,total,placements,consultations,studentTotal,activeTotal,openLeads,reviewable}=cache;
 const active=activeTotal??'—';
 const validScores=scores.filter(s=>Number(s.max_score)>0&&Number.isFinite(Number(s.score)));
 const passed=validScores.filter(s=>Number(s.score)/Number(s.max_score)>=.7).length;
 const pct=validScores.length?Math.round(100*passed/validScores.length):0;
 const c1=chartActivity(scores,events),c2=chartLevels(scores,students),c3=chartStudyProgress(events,students);
 d.querySelectorAll('.mrlee-admin-analytics').forEach(el=>{
  for(const [k,v] of Object.entries({students:studentTotal??'—',active,attempts:total,placements:placements??'—',consultations:consultations??'—',openLeads:openLeads??'—',reviewable:reviewable??'—',passed:validScores.length?pct+'%':'—'})){
   const o=el.querySelector('[data-stat="'+k+'"]');if(o)o.textContent=String(v);
  }
  el.querySelector('[data-chart="activity"]').innerHTML=c1;
  el.querySelector('[data-chart="levels"]').innerHTML=c2;
  el.querySelector('[data-chart="learning-progress"]').innerHTML=c3;
  const updated=el.querySelector('.mrlee-v2-stats-updated');if(updated)updated.textContent='Lần tải dữ liệu: '+new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(lastLoad));
 });
}
async function load(force=false){
 const db=bridge()?.getClient();if(!db)return;
 if(busy)return;if(cache&&!force&&Date.now()-lastLoad<5*60*1000){renderAll();return}
 busy=true;ensure();
 try{
  const [a,b,c,placement,leads,activeCount,openLeadsCount,reviewCount]=await Promise.all([
   db.from('mrlee_students').select('id,level,last_activity_at',{count:'exact'}).limit(2000),
   db.from('mrlee_scores').select('student_id,score,max_score,created_at,exam_date',{count:'exact'}).order('created_at',{ascending:false}).limit(1500),
   db.from('mrlee_learning_events').select('student_id,kind,created_at,happened_at').order('created_at',{ascending:false}).limit(1500),
   db.from('mrlee_placement_submissions').select('id',{count:'exact',head:true}),
   db.from('mrlee_consultation_requests').select('id',{count:'exact',head:true}),
   db.from('mrlee_students').select('id',{count:'exact',head:true}).gte('last_activity_at',new Date(Date.now()-7*864e5).toISOString()),
   db.from('mrlee_consultation_requests').select('id',{count:'exact',head:true}).in('status',['new','contacting']),
   db.from('mrlee_scores').select('id',{count:'exact',head:true}).eq('review_available',true)
  ]);
  const error=a.error||b.error||c.error;if(error)throw error;
  cache={students:a.data||[],studentTotal:a.count??null,activeTotal:activeCount.error?null:activeCount.count,scores:b.data||[],events:c.data||[],total:b.count??b.data?.length??0,placements:placement.error?null:placement.count,consultations:leads.error?null:leads.count,openLeads:openLeadsCount.error?null:openLeadsCount.count,reviewable:reviewCount.error?null:reviewCount.count};lastLoad=Date.now();renderAll();
 }catch(err){cache=null;d.querySelectorAll('.mrlee-admin-analytics').forEach(el=>{el.querySelectorAll('[data-stat]').forEach(x=>{x.textContent='—'});const at=el.querySelector('.mrlee-v2-stats-updated');if(at)at.textContent='Dữ liệu chưa thể xác minh.'});d.querySelectorAll('.mrlee-admin-analytics [data-chart]').forEach(x=>{x.textContent='Không tải được dữ liệu thống kê: '+(err.message||String(err))})}
 finally{busy=false}
}
function boot(){
 ensure();const shell=d.querySelector('.layout');
 if(shell){new MutationObserver(()=>{ensure();if(!shell.classList.contains('hidden'))void load()}).observe(shell,{attributes:true,attributeFilter:['class']})}
 d.addEventListener('click',e=>{if(e.target.closest('.side-menu [data-nav]'))setTimeout(()=>{ensure();void load()},100)});
 if(shell&&!shell.classList.contains('hidden'))void load();
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();