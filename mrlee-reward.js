// MR LEE Reward V2: no privileged key, no browser-supplied rank or score.
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';
const $ = id => document.getElementById(id);
const app = getApps()[0] || initializeApp(firebaseConfig);
const auth = getAuth(app);
let user = null, awards = [], busy = false;
const endpoint = window.MRLEE_REWARD_V2?.endpoint || '';
function note(s, style='') { const e=$('message');e.textContent=s;e.className='notice '+style; }
function dateVN(value) { return new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(value+'T00:00:00+07:00')); }
function selected() { return awards.find(a => a.week_start === $('week').value); }
async function request(method,body) {
  if (!user) throw new Error('Bạn chưa đăng nhập.');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/mrlee-reward-v2$/.test(endpoint)) throw new Error('Chưa thiết lập đúng Supabase URL. Liên hệ quản trị viên.');
  const idToken = await user.getIdToken();
  const response = await fetch(endpoint, {method, headers:{Authorization:'Bearer '+idToken,...(method==='POST'?{'Content-Type':'application/json'}:{})}, ...(body?{body:JSON.stringify(body)}:{}), cache:'no-store'});
  let data={};try{data=await response.json()}catch(_e){}
  if(!response.ok)throw new Error(data.error||`Lỗi ${response.status}`);
  return data;
}
function render() {
  const a=selected();if(!a)return;
  const money=a.prize_type==='money';
  $('summary').replaceChildren();
  const h=document.createElement('div');h.textContent=`Tuần bắt đầu ${dateVN(a.week_start)} · TOP ${a.rank}`;h.style.fontWeight='800';
  const p=document.createElement('p');p.textContent=`${a.points} điểm · ${a.prize} · ${a.claim_status==='not_submitted'?'Chưa gửi phiếu':'Phiếu: '+a.claim_status}`;
  $('summary').append(h,p);
  $('bankArea').hidden=!money;$('itemMessage').hidden=money;
  $('bankName').required=money;$('accountNumber').required=money;
  $('submitBtn').disabled=busy||a.claim_status!=='not_submitted';
  $('submitBtn').textContent=a.claim_status==='not_submitted'?'Gửi phiếu nhận thưởng →':'Đã gửi phiếu';
}
$('week').addEventListener('change', render);
$('claimForm').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;
  const a=selected();if(!a||a.claim_status!=='not_submitted')return;
  if(!$('consent').checked){note('Vui lòng xác nhận đồng ý sử dụng thông tin để trao thưởng.','error');return;}
  busy=true;render();note('Đang gửi phiếu qua kết nối bảo mật...');
  try {
    await request('POST', {week_start:a.week_start,full_name:$('fullName').value.trim(),bank_name:a.prize_type==='money'?$('bankName').value.trim():'',account_number:a.prize_type==='money'?$('accountNumber').value.trim():''});
    a.claim_status='pending';$('accountNumber').value='';$('bankName').value='';$('consent').checked=false;
    note('Đã nhận phiếu! Admin MR LEE có thể xem và xét duyệt trong trang quản trị.','success');
  } catch(e) { note(e.message||'Chưa gửi được phiếu.','error'); }
  finally { busy=false;render(); }
});
$('vnTime').textContent = new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())+' · UTC+7';
onAuthStateChanged(auth,async u=>{
  user=u;
  $('loading').hidden=true;$('claimForm').hidden=true;
  $('loginArea').hidden=!!u&&u.emailVerified;
  $('authStatus').textContent=u?.emailVerified?'Đã xác minh tài khoản Firebase':'Cần đăng nhập / xác minh email';
  if(!u?.emailVerified){note('Vui lòng đăng nhập học viên và xác minh email để tiếp tục.');return;}
  note('Đang tải giải thưởng đã chốt...');
  try {
    const data=await request('GET');awards=Array.isArray(data.awards)?data.awards:[];
    $('week').replaceChildren(...awards.map(a=>{const opt=document.createElement('option');opt.value=a.week_start;opt.textContent=`Tuần ${dateVN(a.week_start)} · TOP ${a.rank}`;return opt;}));
    if(!awards.length){note('Hiện chưa có giải thưởng đã được Admin chốt và công bố cho tài khoản của bạn.');return;}
    $('fullName').value=u.displayName||awards[0].full_name||'';
    $('claimForm').hidden=false;render();note('Kiểm tra thông tin và gửi phiếu để nhận thưởng.');
  } catch(e){note(e.message||'Lỗi kết nối với máy chủ nhận thưởng.','error');}
});
