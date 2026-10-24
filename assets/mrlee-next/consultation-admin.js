/* MR LEE consultation desk — RLS-protected Supabase Admin only. */
(()=>{'use strict';
const d=document,bridge=()=>window.MRLEE_ADMIN_PLACEMENT_BRIDGE||null,client=()=>bridge()?.getClient()||null;
const menu=d.querySelector('.side-menu'),main=d.querySelector('.main-pad');if(!menu||!main)return;
const el=(tag,cls,txt)=>{const v=d.createElement(tag);if(cls)v.className=cls;if(txt!==undefined)v.textContent=String(txt);return v};
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nav=el('button','', '✉  Yêu cầu tư vấn');nav.type='button';nav.dataset.nav='consultations';
const anchor=menu.querySelector('[data-nav="all-attempts"]')||menu.querySelector('[data-nav="placements"]')||menu.lastElementChild;
anchor?.after(nav);
const page=el('section','page');page.id='page-consultations';page.hidden=true;
page.innerHTML='<div class="panel mrlee-consult-admin"><div class="panel-head"><div><h3>Yêu cầu tư vấn học tiếng Hàn & du học</h3><p>Phiếu gửi thành công từ website qua Cloudflare Turnstile và Supabase. Chỉ tài khoản Admin có quyền xem số điện thoại.</p></div><button class="btn soft" id="mrleeLeadsReload" type="button">↻ Tải lại</button></div><div class="mrlee-lead-summary" id="mrleeLeadsSummary">Đang tải dữ liệu...</div><div class="mrlee-lead-filter"><input type="search" id="mrleeLeadsSearch" placeholder="Tìm tên, chương trình hoặc số điện thoại…" aria-label="Tìm tư vấn"><select id="mrleeLeadsFilter" aria-label="Lọc trạng thái"><option value="">Tất cả trạng thái</option><option value="new">Mới tiếp nhận</option><option value="contacting">Đang liên hệ</option><option value="consulted">Đã tư vấn</option><option value="closed">Đã đóng</option></select></div><p role="status" id="mrleeLeadsStatus" class="footnote"></p><div class="table-scroll"><table class="data-table"><thead><tr><th>Tiếp nhận</th><th>Học viên</th><th>Chương trình</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="mrleeLeadsRows"><tr><td colspan="5">Chưa tải dữ liệu</td></tr></tbody></table></div><button id="mrleeLeadsMore" type="button" class="btn soft" hidden>Tải thêm</button></div>';
main.append(page);
const detail=el('div','mrlee-lead-backdrop');detail.hidden=true;detail.id='mrleeLeadDetail';
detail.innerHTML='<div class="mrlee-lead-dialog" role="dialog" aria-modal="true" aria-labelledby="mrleeLeadTitle"><div class="mrlee-lead-top"><h3 id="mrleeLeadTitle">Chi tiết tư vấn</h3><button class="btn soft" type="button" id="mrleeLeadClose">Đóng ×</button></div><div id="mrleeLeadInfo"></div><form id="mrleeLeadEditor"><label>Trạng thái<select id="mrleeLeadStatus"><option value="new">Mới tiếp nhận</option><option value="contacting">Đang liên hệ</option><option value="consulted">Đã tư vấn</option><option value="closed">Đã đóng</option></select></label><label>Nhân sự phụ trách<input id="mrleeLeadAssignee" maxlength="120"></label><label>Ghi chú nội bộ<textarea id="mrleeLeadNotes" rows="5" maxlength="3000"></textarea></label><button type="submit" class="btn" id="mrleeLeadSave">Lưu cập nhật</button><p role="status" id="mrleeLeadSaveStatus"></p></form></div>';
d.body.append(detail);
const $=id=>d.getElementById(id);let data=[],offset=0,done=false,loading=false,current=null;
const labels={new:'Mới',contacting:'Đang liên hệ',consulted:'Đã tư vấn',closed:'Đã đóng'};
function render(){
 const filter=$('mrleeLeadsFilter').value,q=$('mrleeLeadsSearch').value.toLocaleLowerCase('vi').trim();
 const rows=data.filter(x=>(!filter||x.status===filter)&&(!q||[x.full_name,x.phone,x.program,x.region].some(t=>String(t||'').toLocaleLowerCase('vi').includes(q))));
 $('mrleeLeadsRows').innerHTML=rows.map(x=>'<tr><td>'+safe(new Date(x.created_at).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}))+'</td><td><strong>'+safe(x.full_name)+'</strong><br><small>'+safe(x.phone)+'</small></td><td>'+safe(x.program)+'</td><td>'+safe(labels[x.status]||x.status)+'</td><td><button class="btn sm soft" type="button" data-lead="'+safe(x.id)+'">Xem & xử lý</button></td></tr>').join('')||'<tr><td colspan="5">Chưa có phiếu phù hợp bộ lọc.</td></tr>';
 const newCount=data.filter(x=>x.status==='new').length,contacting=data.filter(x=>x.status==='contacting').length;
 $('mrleeLeadsSummary').textContent='Đã tải '+data.length+' phiếu | Mới '+newCount+' | Đang liên hệ '+contacting+'. Bộ lọc áp dụng cho các phiếu đã tải.';
 $('mrleeLeadsStatus').textContent='Dữ liệu chỉ hiển thị cho Admin được cấp quyền Supabase.';
 $('mrleeLeadsMore').hidden=done;
}
async function load(reset=true){
 const db=client();if(!db){$('mrleeLeadsStatus').textContent='Cần đăng nhập bằng tài khoản Admin Supabase.';return}
 if(loading)return;loading=true;if(reset){data=[];offset=0;done=false}
 $('mrleeLeadsStatus').textContent='Đang tải danh sách tư vấn...';
 try{
 const {data:found,error}=await db.from('mrlee_consultation_requests')
 .select('id,public_id,full_name,phone,email,program,region,message,preferred_contact,created_at,status,assigned_to,admin_note')
 .order('created_at',{ascending:false}).range(offset,offset+49);
 if(error)throw error;data.push(...found);offset+=found.length;done=found.length<50;render();
 }catch(e){$('mrleeLeadsStatus').textContent='Không thể tải: '+(e.message||String(e))}
 finally{loading=false}
}
function show(id){
 current=data.find(x=>x.id===id);if(!current)return;
 $('mrleeLeadTitle').textContent='Tư vấn • '+current.full_name;
 const info=$('mrleeLeadInfo');info.replaceChildren();
 const entries=[['Mã yêu cầu',current.public_id],['Tiếp nhận',new Date(current.created_at).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})],['Họ tên',current.full_name],['Điện thoại',current.phone],['Email',current.email||'—'],['Chương trình',current.program],['Khu vực',current.region||'—'],['Kênh liên hệ',current.preferred_contact],['Mục tiêu',current.message||'Không ghi']];
 for(const [k,v] of entries){const row=el('p','mrlee-lead-entry');row.append(el('strong','',k+': '),d.createTextNode(String(v)));info.append(row)}
 $('mrleeLeadStatus').value=current.status;$('mrleeLeadAssignee').value=current.assigned_to||'';$('mrleeLeadNotes').value=current.admin_note||'';$('mrleeLeadSaveStatus').textContent='';
 detail.hidden=false;$('mrleeLeadClose').focus();
}
nav.addEventListener('click',()=>{if(bridge()?.openPage?.('consultations'))void load(true);else $('mrleeLeadsStatus').textContent='Vui lòng đăng nhập Admin trước.'});
$('mrleeLeadsReload').addEventListener('click',()=>void load(true));
$('mrleeLeadsMore').addEventListener('click',()=>void load(false));
$('mrleeLeadsSearch').addEventListener('input',render);
$('mrleeLeadsFilter').addEventListener('change',render);
$('mrleeLeadsRows').addEventListener('click',e=>{const b=e.target.closest('[data-lead]');if(b)show(b.dataset.lead)});
function close(){detail.hidden=true;current=null;nav.focus()}
$('mrleeLeadClose').addEventListener('click',close);
detail.addEventListener('click',e=>{if(e.target===detail)close()});
d.addEventListener('keydown',e=>{if(e.key==='Escape'&&!detail.hidden)close()});
$('mrleeLeadEditor').addEventListener('submit',async e=>{
e.preventDefault();const db=client();if(!db||!current)return;
const button=$('mrleeLeadSave');button.disabled=true;
try{const update={status:$('mrleeLeadStatus').value,assigned_to:$('mrleeLeadAssignee').value.trim()||null,admin_note:$('mrleeLeadNotes').value.trim()||null,updated_at:new Date().toISOString()};
const {data:rows,error}=await db.from('mrlee_consultation_requests').update(update).eq('id',current.id).select('id').single();
if(error||!rows)throw error||Error('Không có quyền cập nhật');
Object.assign(current,update);$('mrleeLeadSaveStatus').textContent='✓ Đã lưu. Chỉ Admin có thể xem nội dung.';render();
}catch(err){$('mrleeLeadSaveStatus').textContent='Không lưu được: '+(err.message||String(err))}
finally{button.disabled=false}
});
})();