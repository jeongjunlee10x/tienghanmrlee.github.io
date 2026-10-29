(()=>{'use strict';
const f=document.getElementById('mrleeConsultForm'),stat=document.getElementById('mrleeConsultStatus'),submit=document.getElementById('mrleeConsultSubmit'),under=document.getElementById('mrleeUnder18'),guardian=document.getElementById('mrleeGuardian'),grow=document.getElementById('mrleeGuardianRow');
document.querySelectorAll('.mrlee-theme-switch button').forEach(b=>b.addEventListener('click',()=>{const mode=b.dataset.theme==='future'?'future':'fresh';document.documentElement.dataset.mrleeTheme=mode;try{localStorage.setItem('MRLEE.THEME.V1',mode)}catch(_){}update()}));
function update(){document.querySelectorAll('.mrlee-theme-switch button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===document.documentElement.dataset.mrleeTheme)))}update();
under.addEventListener('change',()=>{grow.hidden=!under.checked;if(!under.checked)guardian.checked=false});
function status(t,success=false){stat.textContent=t;stat.className='mrlee-form-status'+(success?' success':'')}
f.addEventListener('submit',async e=>{
e.preventDefault();if(submit.disabled)return;
if(!f.reportValidity()){status('Vui lòng kiểm tra các trường bắt buộc.');return}
if(under.checked&&!guardian.checked){status('Cần có sự đồng ý của phụ huynh/người giám hộ trước khi gửi yêu cầu.');return}
const token=f.querySelector('[name="cf-turnstile-response"]')?.value||'';
if(!token){status('Hãy hoàn thành xác minh Cloudflare trước khi gửi.');return}
const data=Object.fromEntries(new FormData(f).entries());delete data['cf-turnstile-response'];
const profile_details={};for(const [key,value] of Object.entries(data)){if(key.startsWith('dossier_')){const name=key.slice(8);if(String(value).trim())profile_details[name]=String(value).trim();delete data[key];}}data.profile_details=profile_details;
data.consent=document.getElementById('mrleeConsultConsent').checked;data.under18=under.checked;data.guardian=guardian.checked;data.turnstileToken=token;
submit.disabled=true;submit.textContent='Đang lưu yêu cầu...';status('Đang gửi phiếu an toàn đến hệ thống.');
try{
const r=await fetch('https://pkxqsboyotlyoizzxizb.supabase.co/functions/v1/mrlee-consultation-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
const result=await r.json();if(!r.ok||!result?.ok)throw Error(result?.error||'Không thể lưu yêu cầu.');
// Receipt is required; never show success without an actual server-issued reference.
if(typeof result.requestId!=='string'||!/^[A-Za-z0-9_-]{8,100}$/.test(result.requestId))throw Error('Hệ thống chưa trả về mã phiếu hợp lệ. Vui lòng liên hệ bộ phận tư vấn để kiểm tra trước khi gửi lại.');
document.getElementById('mrleeConsultReceipt').hidden=false;document.getElementById('mrleeConsultReceiptId').textContent=result.requestId;
document.getElementById('mrleeConsultReceiptText').textContent=result.message||'Yêu cầu của bạn đã được tiếp nhận; hãy lưu mã phiếu.';
status('✓ Phiếu đã được lưu. Bạn có thể lưu lại mã yêu cầu để đối chiếu.',true);f.querySelectorAll('input,select,textarea').forEach(x=>{if(x.type!=='hidden'&&!x.closest('.cf-turnstile'))x.disabled=true});submit.hidden=true;
}catch(err){status(err.message||'Lỗi kết nối, vui lòng thử lại.');if(window.turnstile?.reset)window.turnstile.reset()}
finally{submit.disabled=false;if(!submit.hidden)submit.textContent='GỬI PHIẾU TƯ VẤN →'}
});
document.getElementById('mrleeCopyRequest').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.getElementById('mrleeConsultReceiptId').textContent);status('Đã sao chép mã phiếu.',true)}catch(_){status('Hãy chọn và sao chép mã phiếu thủ công.',true)}});
})();