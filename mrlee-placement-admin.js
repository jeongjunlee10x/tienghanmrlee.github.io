/* MR LEE: read-only question review + teacher class assignment, existing Supabase admin session.
 * Never exposes submissions via anon key; RLS checks mrlee_admins.
 */
(()=>{'use strict';
  const app=document.getElementById('app'), menu=document.querySelector('.side-menu');
  if(!app||!menu||!document.querySelector('.main-pad'))return;
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={sc1:'Sơ cấp 1',sc2:'Sơ cấp 2',tc1:'Trung cấp 1'};
  const times=x=>x?new Date(x).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}):'—';
  const nav=document.createElement('button');nav.type='button';nav.dataset.nav='placements';
  nav.innerHTML='<b>✎</b> Bài kiểm tra đầu vào';
  const existing=menu.querySelector('[data-nav="scores"]');(existing||menu.lastElementChild).after(nav);
  const page=document.createElement('section');page.id='page-placements';page.className='page';page.hidden=true;
  page.innerHTML=`<div class="panel"><div class="panel-head"><div><h3>Bài làm kiểm tra đầu vào</h3><p>Giữ nguyên 50 câu, lựa chọn của học viên và đáp án đúng; giáo viên nhận xét và xếp lớp.</p></div><button id="placementReload" class="btn soft">↻ Tải bài</button></div>
  <div class="mrp-toolbar"><input id="placementSearch" type="search" placeholder="Tìm tên, mã bài..." aria-label="Tìm bài đầu vào">
  <select id="placementLevel"><option value="">Mọi trình độ</option><option value="sc1">Sơ cấp 1</option><option value="sc2">Sơ cấp 2</option><option value="tc1">Trung cấp 1</option></select>
  <select id="placementStatus"><option value="">Mọi trạng thái</option><option value="new">Chưa đánh giá</option><option value="reviewed">Đã đánh giá</option><option value="assigned">Đã xếp lớp</option></select></div>
  <div class="table-scroll"><table class="data-table"><thead><tr><th>Học viên</th><th>Đề</th><th>Bài làm</th><th>Thời điểm</th><th>Đánh giá</th><th>Thao tác</th></tr></thead><tbody id="placementRows"><tr><td colspan="6">Chọn mục này để tải bài làm.</td></tr></tbody></table></div>
  <p id="placementInfo" class="muted">Đây là điểm kiểm tra tham khảo. Giáo viên cần kiểm tra kỹ năng nghe, nói, viết trước khi xếp lớp.</p>
  <button id="placementMore" class="btn soft" type="button" hidden>Tải thêm bài làm</button></div>`;
  document.querySelector('.main-pad').append(page);
  const backdrop=document.createElement('div');backdrop.id='placementBackdrop';backdrop.className='mrp-backdrop';backdrop.hidden=true;
  backdrop.innerHTML=`<div class="mrp-detail" role="dialog" aria-modal="true" aria-labelledby="placementDetailTitle">
  <div class="mrp-header"><h2 id="placementDetailTitle">Chi tiết bài làm</h2><button id="placementClose" type="button" class="btn white">Đóng ×</button></div>
  <div id="placementDetailSummary"></div><div id="placementQuestions"></div>
  <form id="placementReviewForm"><h3>Đánh giá và xếp lớp (chỉ Admin)</h3>
  <div class="mrp-toolbar"><label>Trạng thái<select name="review_status"><option value="new">Chưa đánh giá</option><option value="reviewed">Đã đánh giá</option><option value="assigned">Đã xếp lớp</option></select></label>
  <label>Lớp đề xuất / lớp đã xếp<input name="assigned_class" maxlength="100" placeholder="Ví dụ: SC1-A, SC2-B..." /></label></div>
  <label>Nhận xét giáo viên<textarea name="teacher_notes" maxlength="5000" rows="5" placeholder="Nêu kiến thức đã nắm, lỗi thường gặp, phương án học phù hợp..."></textarea></label>
  <div class="mrp-actions"><button type="submit" id="placementSaveReview" class="btn">Lưu đánh giá</button>
  <button type="button" id="placementPrint" class="btn soft">In toàn bộ bài làm</button>
  <button type="button" id="placementExport" class="btn soft">Xuất JSON bài làm</button></div>
  <p id="placementReviewNotice" role="status"></p></form></div>`;
  document.body.append(backdrop);
  const $=id=>document.getElementById(id);
  let rows=[],current=null,offset=0,busy=false,end=false;
  // The main admin application runs inside an IIFE, so its client/account/navigate
  // are NOT globals. Use the explicit bridge it provides after successful login.
  function adminBridge(){return window.MRLEE_ADMIN_PLACEMENT_BRIDGE || null}
  function adminClient(){return adminBridge()?.getClient() || null}
  async function load(reset=true){
    const db=adminClient();if(!db){$('placementInfo').textContent='Hãy đăng nhập Admin Supabase trước.';return}
    if(busy)return;busy=true;
    if(reset){offset=0;end=false;rows=[]}
    $('placementInfo').textContent='Đang đọc danh sách bài làm...';
    try{
      const {data,error}=await db.from('mrlee_placement_submissions')
        .select('id,submission_id,student_name,birth_date,selected_level,submitted_at,duration_seconds,answered_count,correct_count,total_questions,review_status,assigned_class')
        .order('submitted_at',{ascending:false}).range(offset,offset+99);
      if(error)throw error;
      rows=rows.concat(data||[]);offset+=data?.length||0;end=(data||[]).length<100;
      render();
    }catch(e){$('placementInfo').textContent='Không tải được: '+(e?.message||'Lỗi không rõ');}
    finally{busy=false}
  }
  function render(){
    const search=$('placementSearch').value.trim().toLocaleLowerCase('vi');
    const level=$('placementLevel').value,status=$('placementStatus').value;
    const filtered=rows.filter(r=>(!level||r.selected_level===level)&&(!status||r.review_status===status)&&
      (!search||[r.student_name,r.submission_id,r.assigned_class].some(s=>String(s||'').toLocaleLowerCase('vi').includes(search))));
    $('placementRows').innerHTML=filtered.map(r=>`<tr>
      <td><strong>${safe(r.student_name)}</strong><div class="muted">Sinh: ${safe(r.birth_date)}</div></td>
      <td>${safe(labels[r.selected_level]||r.selected_level)}</td>
      <td><strong>${r.correct_count}/50</strong><div class="muted">Đã trả lời: ${r.answered_count}/50</div></td>
      <td>${safe(times(r.submitted_at))}</td>
      <td>${safe(({new:'Chờ đánh giá',reviewed:'Đã đánh giá',assigned:'Đã xếp lớp'})[r.review_status]||r.review_status)}<div class="muted">${safe(r.assigned_class||'')}</div></td>
      <td><button type="button" class="btn sm soft" data-placement-id="${safe(r.id)}">Xem đủ 50 câu</button></td>
    </tr>`).join('')||'<tr><td colspan="6">Chưa có bài nộp được lưu hoặc không có bài phù hợp bộ lọc. Mở trang Kiểm tra đầu vào, nộp thử và kiểm tra thông báo “Đã lưu đầy đủ bài làm”.</td></tr>';
    $('placementInfo').textContent=`Đã tải ${rows.length} bài; đang hiển thị ${filtered.length} bài phù hợp. Nhấn “Xem đủ 50 câu” để đánh giá và xếp lớp.`;
    $('placementMore').hidden=end;
  }
  async function detail(id){
    const db=adminClient();if(!db)return;
    $('placementBackdrop').hidden=false;$('placementQuestions').textContent='Đang đọc toàn bộ câu trả lời...';
    $('placementReviewForm').hidden=true;
    try{
      const {data,error}=await db.from('mrlee_placement_submissions').select('*').eq('id',id).single();
      if(error)throw error;current=data;
      $('placementDetailTitle').textContent='Bài làm: '+data.student_name;
      $('placementDetailSummary').innerHTML=`<p><b>Ngày sinh:</b> ${safe(data.birth_date)} · <b>Đề:</b> ${safe(labels[data.selected_level])} · <b>Nộp:</b> ${safe(times(data.submitted_at))}</p>
      <p><b>Kết quả tham khảo:</b> ${data.correct_count}/${data.total_questions}; <b>Đã trả lời:</b> ${data.answered_count}/50 · <b>Thời gian:</b> ${Math.ceil(data.duration_seconds/60)} phút</p>`;
      $('placementQuestions').innerHTML=(data.question_snapshot||[]).map(q=>{
        const verdict=q.selectedIndex===null?'BỎ TRỐNG':q.isCorrect?'ĐÚNG':'SAI';
        return `<article class="mrp-question ${q.isCorrect?'mrp-right':'mrp-wrong'}">
          <h4>Câu ${Number(q.number)} · ${safe(q.kind)} · ${safe(verdict)}</h4>
          <div class="muted">${safe(q.lessonTitle||'')}</div>
          ${q.context?`<blockquote>${safe(q.context)}</blockquote>`:''}
          <p><b>${safe(q.question)}</b></p>
          <ol type="A">${(q.options||[]).map((o,i)=>`<li class="${q.selectedIndex===i?'mrp-selected':''} ${q.correctIndex===i?'mrp-answer':''}">${safe(o)}${q.selectedIndex===i?' ← Học viên chọn':''}${q.correctIndex===i?' ✓ Đáp án đúng':''}</li>`).join('')}</ol>
          <p><b>Giải thích:</b> ${safe(q.explanation||'—')}</p>
        </article>`
      }).join('');
      const f=$('placementReviewForm');f.elements.namedItem('review_status').value=data.review_status||'new';
      f.elements.namedItem('assigned_class').value=data.assigned_class||'';
      f.elements.namedItem('teacher_notes').value=data.teacher_notes||'';
      $('placementReviewNotice').textContent='';f.hidden=false;
    }catch(e){$('placementQuestions').textContent='Không đọc được bài làm: '+(e?.message||'lỗi');}
  }
  async function review(event){
    event.preventDefault();if(!current)return;
    const db=adminClient();if(!db)return;
    const form=event.currentTarget;
    const data={review_status:form.elements.namedItem('review_status').value,
      assigned_class:form.elements.namedItem('assigned_class').value.trim(),teacher_notes:form.elements.namedItem('teacher_notes').value.trim(),
      reviewed_at:new Date().toISOString(),reviewed_by:adminBridge()?.getUserId() || null};
    const button=$('placementSaveReview');button.disabled=true;
    try{
      const {error}=await db.from('mrlee_placement_submissions').update(data).eq('id',current.id);
      if(error)throw error;
      $('placementReviewNotice').textContent='✓ Đã lưu nhận xét và trạng thái xếp lớp.';
      const row=rows.find(r=>r.id===current.id);if(row){Object.assign(row,data);render()}
    }catch(e){$('placementReviewNotice').textContent='Không lưu được nhận xét: '+(e?.message||'lỗi')}
    finally{button.disabled=false}
  }
  function exportJson(){
    if(!current)return;
    const blob=new Blob([JSON.stringify(current,null,2)],{type:'application/json;charset=utf-8'});
    const u=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=u;a.download=`mrlee-placement-${current.submission_id}.json`;a.click();
    setTimeout(()=>URL.revokeObjectURL(u),1000);
  }
  nav.addEventListener('click',()=>{
    if(!adminBridge()?.openPage()){
      $('placementInfo').textContent='Vui lòng đăng nhập bằng tài khoản Admin Supabase.';
      return;
    }
    void load(true);
  });
  $('placementReload').addEventListener('click',()=>void load(true));
  $('placementMore').addEventListener('click',()=>void load(false));
  ['placementSearch','placementLevel','placementStatus'].forEach(id=>$(id).addEventListener('input',render));
  $('placementRows').addEventListener('click',e=>{
    const b=e.target.closest('[data-placement-id]');if(b)void detail(b.dataset.placementId);
  });
  $('placementClose').addEventListener('click',()=>{$('placementBackdrop').hidden=true;current=null});
  $('placementReviewForm').addEventListener('submit',review);
  $('placementPrint').addEventListener('click',()=>window.print());
  $('placementExport').addEventListener('click',exportJson);
})();


/* MRLEE_ALL_ATTEMPTS_ADMIN_V1
 * Admin-only view for all saved Firebase practice grades and answer snapshots.
 * An existing Supabase-authenticated session + RLS are required to read.
 */
(()=>{'use strict';
  const bridge=()=>window.MRLEE_ADMIN_PLACEMENT_BRIDGE;
  const menu=document.querySelector('.side-menu'),main=document.querySelector('.main-pad');
  if(!menu||!main)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const d=id=>document.getElementById(id);
  const nav=document.createElement('button');nav.type='button';nav.dataset.nav='all-attempts';
  nav.innerHTML='<b>☷</b> Bài làm toàn website';
  const near=menu.querySelector('[data-nav="placements"]')||menu.querySelector('[data-nav="scores"]');
  (near||menu.lastElementChild).after(nav);
  const page=document.createElement('section');page.className='page';page.id='page-all-attempts';page.hidden=true;
  page.innerHTML='<div class="panel"><div class="panel-head"><div><h3>Bài làm và kết quả toàn website</h3><p>Kiểm tra định kỳ, WORKBOOK, luyện đề TOPIK và luyện tập đã đồng bộ Firebase. Dữ liệu có từ trình duyệt là minh chứng học tập, không phải điểm thi chính thức.</p></div><button type="button" class="btn soft" id="allAttemptsReload">↻ Tải lại</button></div><div class="mrp-toolbar"><input id="allAttemptsSearch" type="search" placeholder="Tìm học viên hoặc tên bài..." aria-label="Tìm bài làm"><select id="allAttemptsHasReview"><option value="">Tất cả bài</option><option value="yes">Có chi tiết bài làm</option><option value="no">Chỉ có điểm</option></select></div><p id="allAttemptsStatus" class="muted" role="status">Đăng nhập Admin để kiểm tra.</p><div class="table-scroll"><table class="data-table"><thead><tr><th>Học viên</th><th>Bài kiểm tra / bài tập</th><th>Kết quả</th><th>Ngày</th><th>Chi tiết</th></tr></thead><tbody id="allAttemptsRows"><tr><td colspan="5">Chưa tải dữ liệu</td></tr></tbody></table></div><button id="allAttemptsMore" type="button" class="btn soft" hidden>Tải thêm</button></div>';
  main.append(page);
  const modal=document.createElement('div');modal.className='mrp-backdrop';modal.hidden=true;modal.id='allAttemptsModal';
  modal.innerHTML='<div class="mrp-detail" role="dialog" aria-modal="true" aria-labelledby="allAttemptsTitle"><div class="mrp-header"><h2 id="allAttemptsTitle">Chi tiết bài làm</h2><button type="button" class="btn white" id="allAttemptsClose">Đóng ×</button></div><div id="allAttemptsMeta"></div><div id="allAttemptsQuestions"></div><form id="allAttemptsReviewForm" hidden><h3>Nhận xét của giáo viên (chỉ Admin)</h3><label for="allAttemptsTeacher">Nhận xét / hướng dẫn ôn tập</label><textarea id="allAttemptsTeacher" maxlength="3000" rows="5" style="width:100%;max-width:100%;padding:12px" placeholder="Những phần học viên cần ôn, lưu ý về năng lực..."></textarea><div class="mrp-actions"><button type="submit" class="btn" id="allAttemptsSave">Lưu nhận xét</button><button type="button" class="btn soft" id="allAttemptsPrint">In bài làm</button><button type="button" class="btn soft" id="allAttemptsExport">Xuất JSON</button></div><p id="allAttemptsReviewStatus" role="status"></p></form></div>';
  document.body.append(modal);
  let rows=[],people=new Map(),offset=0,busy=false,end=false,current=null;
  const client=()=>bridge()?.getClient()||null;
  const fmt=x=>x?new Date(x).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}):'—';
  async function load(reset=true){
    const db=client();if(!db){d('allAttemptsStatus').textContent='Bạn cần đăng nhập Admin trước.';return}
    if(busy)return;busy=true;
    if(reset){offset=0;end=false;rows=[];people=new Map()}
    d('allAttemptsStatus').textContent='Đang tải bài làm...';
    try{
      if(reset){
        const users=await db.from('mrlee_students').select('id,full_name').limit(2500);
        if(users.error)throw users.error;
        people=new Map((users.data||[]).map(p=>[p.id,p.full_name]));
      }
      const response=await db.from('mrlee_scores')
        .select('id,student_id,exam_title,score,max_score,exam_date,firebase_created_at,review_snapshot,teacher_review')
        .order('created_at',{ascending:false}).range(offset,offset+79);
      if(response.error)throw response.error;
      rows.push(...(response.data||[]));offset+=response.data?.length||0;end=(response.data||[]).length<80;
      draw();
    }catch(e){d('allAttemptsStatus').textContent='Không tải được bài làm: '+(e.message||String(e))}
    finally{busy=false}
  }
  function draw(){
    const q=d('allAttemptsSearch').value.toLocaleLowerCase('vi').trim(),kind=d('allAttemptsHasReview').value;
    const filtered=rows.filter(x=>(kind!=='yes'||Array.isArray(x.review_snapshot?.questions))&&(kind!=='no'||!Array.isArray(x.review_snapshot?.questions))&&
      (!q||[x.exam_title,people.get(x.student_id),x.exam_date].some(s=>String(s||'').toLocaleLowerCase('vi').includes(q))));
    d('allAttemptsRows').innerHTML=filtered.map(x=>'<tr><td>'+esc(people.get(x.student_id)||'Học viên chưa định danh')+'</td><td>'+esc(x.exam_title)+'</td><td>'+esc(x.score)+'/'+esc(x.max_score)+'</td><td>'+esc(fmt(x.firebase_created_at||x.exam_date))+'</td><td><button type="button" class="btn sm soft" data-attempt-id="'+esc(x.id)+'">'+(Array.isArray(x.review_snapshot?.questions)?'Xem bài làm':'Xem kết quả')+'</button></td></tr>').join('')||
       '<tr><td colspan="5">Không tìm thấy bài phù hợp.</td></tr>';
    const n=rows.filter(x=>Array.isArray(x.review_snapshot?.questions)).length;
    d('allAttemptsStatus').textContent='Đã tải '+rows.length+' kết quả; '+n+' bài có chi tiết, '+(rows.length-n)+' bài chỉ có điểm. Những lựa chọn không được lưu trước đây không thể suy ra từ tổng điểm.';
    d('allAttemptsMore').hidden=end;
  }
  async function open(id){
    const db=client();if(!db)return;
    modal.hidden=false;current=null;
    d('allAttemptsQuestions').textContent='Đang tải câu trả lời...';
    d('allAttemptsReviewForm').hidden=true;
    try{
      const {data,error}=await db.from('mrlee_scores').select('*').eq('id',id).single();
      if(error)throw error;
      current=data;
      d('allAttemptsTitle').textContent='Bài làm — '+(people.get(data.student_id)||'Học viên');
      d('allAttemptsMeta').innerHTML='<p><strong>Bài:</strong> '+esc(data.exam_title)+' · <strong>Ngày:</strong> '+esc(fmt(data.firebase_created_at||data.exam_date))+'</p><p><strong>Điểm luyện tập:</strong> '+esc(data.score)+'/'+esc(data.max_score)+' — do trình duyệt ghi nhận, không phải điểm thi chính thức.</p>';
      const questions=Array.isArray(data.review_snapshot?.questions)?data.review_snapshot.questions:[];
      if(!questions.length){
        d('allAttemptsQuestions').innerHTML='<p class="info warning"><strong>Phiếu cũ chỉ lưu điểm.</strong> Không có bản ghi từng phương án trong dữ liệu đã đồng bộ. Không thể khôi phục các lựa chọn không từng được lưu. Nếu Firebase chứa reviewJson, bản đồng bộ có thể bổ sung vào đây.</p>';
      }else{
        const fragment=document.createDocumentFragment();
        questions.forEach((q,i)=>{
          const el=document.createElement('article');el.className='mrp-question';
          const h=document.createElement('h4');h.textContent='Câu '+(i+1)+' · '+String(q.type||'Bài tập');
          const question=document.createElement('p');question.textContent=String(q.question||'');
          el.append(h,question);
          if(Array.isArray(q.choices)&&q.choices.length){
            const list=document.createElement('ol');list.type='A';
            q.choices.forEach((choice,j)=>{
              const item=document.createElement('li');item.textContent=String(choice);
              if(j===q.selectedIndex){item.classList.add('mrp-selected');item.textContent+=' ← Học viên chọn'}
              if(j===q.correctIndex&&q.correctIndex>=0){item.classList.add('mrp-answer');item.textContent+=' ✓ Đáp án tham khảo'}
              list.append(item);
            });el.append(list);
          }
          if(typeof q.answerText==='string'){
            const answer=document.createElement('pre');answer.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;background:#eef4fd;padding:12px;border-radius:9px';
            answer.textContent='Bài viết / câu trả lời: '+(q.answerText||'(Để trống)');el.append(answer);
          }
          if(q.explanation){const p=document.createElement('p');p.textContent='Giải thích: '+q.explanation;el.append(p)}
          fragment.append(el);
        });
        d('allAttemptsQuestions').replaceChildren(fragment);
      }
      d('allAttemptsTeacher').value=data.teacher_review||'';
      d('allAttemptsReviewStatus').textContent='';
      d('allAttemptsReviewForm').hidden=false;
    }catch(e){d('allAttemptsQuestions').textContent='Lỗi tải dữ liệu: '+(e.message||String(e))}
  }
  nav.addEventListener('click',()=>{if(bridge()?.openPage){bridge().getClient()&&window.MRLEE_ADMIN_PLACEMENT_BRIDGE.openPage('all-attempts')}void load(true)});
  d('allAttemptsReload').addEventListener('click',()=>void load(true));
  d('allAttemptsMore').addEventListener('click',()=>void load(false));
  d('allAttemptsSearch').addEventListener('input',draw);
  d('allAttemptsHasReview').addEventListener('change',draw);
  d('allAttemptsRows').addEventListener('click',e=>{const b=e.target.closest('[data-attempt-id]');if(b)void open(b.dataset.attemptId)});
  d('allAttemptsClose').addEventListener('click',()=>{modal.hidden=true;current=null});
  modal.addEventListener('click',e=>{if(e.target===modal){modal.hidden=true;current=null}});
  d('allAttemptsReviewForm').addEventListener('submit',async e=>{
    e.preventDefault();const db=client();if(!current||!db)return;
    const btn=d('allAttemptsSave');btn.disabled=true;
    try{
      const payload={teacher_review:d('allAttemptsTeacher').value.trim(),reviewed_at:new Date().toISOString(),reviewed_by:bridge()?.getUserId()};
      const {data,error}=await db.from('mrlee_scores').update(payload).eq('id',current.id).select('id').single();
      if(error||!data)throw error||Error('Không được phép sửa bản ghi');
      current.teacher_review=payload.teacher_review;
      d('allAttemptsReviewStatus').textContent='✓ Đã lưu nhận xét giáo viên.';
    }catch(err){d('allAttemptsReviewStatus').textContent='Không lưu được: '+(err.message||String(err))}
    finally{btn.disabled=false}
  });
  d('allAttemptsPrint').addEventListener('click',()=>window.print());
  d('allAttemptsExport').addEventListener('click',()=>{
    if(!current)return;const blob=new Blob([JSON.stringify(current,null,2)],{type:'application/json;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='mrlee-bai-lam-'+current.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),800);
  });
})();
