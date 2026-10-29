/* V31 — authenticated Admin notification center; no browser credentials stored.
 * Browser Notification only while the Admin page is running. External push needs an authorized server provider. */
(()=>{'use strict';
const d=document,app=d.getElementById('app'),host=d.querySelector('.main-pad');
if(!app||!host)return;
const bridge=()=>window.MRLEE_ADMIN_PLACEMENT_BRIDGE;
const api=()=>bridge()?.getClient?.();
const shell=d.createElement('section');shell.className='mrlee-v31-inbox panel';shell.id='mrleeV31Inbox';
shell.innerHTML='<div class="mrlee-v31-notice-head"><div><small>TRUNG TÂM THÔNG BÁO • CHỈ ADMIN</small><h3>Hòm thư & bài gửi mới <span id="mrleeV31Unread" aria-live="polite">0</span></h3><p>Tự kiểm tra khi trang Admin đang mở. Gmail/Messenger/Zalo chưa được kích hoạt nếu chưa cấu hình dịch vụ thông báo máy chủ.</p></div><div class="mrlee-v31-notice-actions"><button class="btn soft" id="mrleeV31Reload" type="button">↻ Làm mới</button><button class="btn soft" id="mrleeV31OS" type="button">Bật thông báo trên thiết bị</button></div></div><div class="mrlee-v31-notice-status" id="mrleeV31Status" role="status"></div><div id="mrleeV31Items" class="mrlee-v31-notice-items"></div>';
let loaded=false,seen=new Set(),busy=false;host.prepend(shell);shell.hidden=true;
const $=id=>d.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
function moment(t){const d=new Date(t);return Number.isNaN(d.getTime())?'—':pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes())}
function authorized(){return Boolean(api()&&app&&!app.classList.contains('hidden')&&!app.hidden)}
function fill(items){
 const unread=items.filter(x=>!x.read_at).length;$('mrleeV31Unread').textContent=String(unread);
 const root=$('mrleeV31Items');root.replaceChildren();
 if(!items.length){root.textContent='Chưa có thông báo mới trong hệ thống.';return}
 for(const item of items){
  const div=d.createElement('article');div.className='mrlee-v31-notice-row'+(item.read_at?'':' is-unread');
  const title=d.createElement('strong');title.textContent=(item.source_kind==='placement'?'📝 ':'✉ ')+item.headline;
  const date=d.createElement('small');date.textContent=moment(item.created_at);
  const btn=d.createElement('button');btn.type='button';btn.className='btn sm soft';btn.textContent='Xem & đánh dấu đã đọc';
  btn.addEventListener('click',()=>void openItem(item,btn));
  div.append(title,date,btn);root.append(div);
 }
}
async function openItem(item,btn){
 const db=api();if(!db)return;btn.disabled=true;
 try{if(!item.read_at){const {error}=await db.from('mrlee_admin_notifications').update({read_at:new Date().toISOString()}).eq('id',item.id);if(error)throw error;}
 const target=item.source_kind==='placement'?'placements':'consultations';if(!bridge()?.openPage?.(target)){const nav=d.querySelector('[data-nav="'+target+'"]');nav?.click()}
 await refresh(false);
 }catch(e){$('mrleeV31Status').textContent='Không thể đánh dấu đã đọc: '+(e.message||String(e))}
 finally{btn.disabled=false}
}
async function refresh(announce=true){
 if(!authorized()){shell.hidden=true;return}
 shell.hidden=false;if(busy)return;busy=true;
 try{const {data,error}=await api().from('mrlee_admin_notifications').select('id,source_kind,source_id,headline,created_at,read_at').order('created_at',{ascending:false}).limit(50);
 if(error)throw error;
 fill(data||[]);$('mrleeV31Status').textContent='Cập nhật lần cuối: '+new Date().toLocaleTimeString('vi-VN');
 if(loaded && d.visibilityState==='visible' && window.Notification?.permission==='granted'){
  for(const item of (data||[]).filter(x=>!x.read_at&&!seen.has(x.id)).slice(0,3)){new Notification('MR LEE • Hòm thư Admin',{body:item.headline,tag:'mrlee-notice-'+item.id});}
 }
 loaded=true;seen=new Set((data||[]).map(x=>x.id));
 }catch(e){$('mrleeV31Status').textContent='Không tải được thông báo: '+(e.message||String(e))}
 finally{busy=false}
}
$('mrleeV31Reload').addEventListener('click',()=>void refresh());
$('mrleeV31OS').addEventListener('click',async()=>{
 if(!('Notification'in window)){$('mrleeV31Status').textContent='Trình duyệt này không hỗ trợ thông báo trên thiết bị.';return}
 const permission=await Notification.requestPermission();$('mrleeV31Status').textContent=permission==='granted'?'Đã bật thông báo khi trang Admin đang mở.':'Thiết bị chưa cấp quyền thông báo.';
});
d.addEventListener('visibilitychange',()=>{if(d.visibilityState==='visible')void refresh(false)});
setInterval(()=>{if(d.visibilityState==='visible')void refresh(false)},45000);
setTimeout(()=>void refresh(false),1500);
})();