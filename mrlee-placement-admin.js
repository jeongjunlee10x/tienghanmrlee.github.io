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
  function adminClient(){
    // client/account are top-level lexical names of admin.html's existing classic script.
    // Accessing them after login avoids a second Auth client or exposing admin credentials.
    try{return typeof client!=='undefined' && typeof account!=='undefined' && account && client ? client : null}
    catch{return null}
  }
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
    </tr>`).join('')||'<tr><td colspan="6">Chưa tìm thấy bài làm.</td></tr>';
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
      reviewed_at:new Date().toISOString(),reviewed_by:account.id};
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
  nav.addEventListener('click',()=>{navigate('placements');void load(true)});
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
