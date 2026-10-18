/** Extended registration fields + private per-user profile stored in Firestore. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, isFirebaseConfigured } from '../../firebase-config.js';

const $=id=>document.getElementById(id);
const form=$('auth-form'),box=$('mrlee-signup-details'),register=$('mode-register');
const STORAGE_KEY='mrlee-registration-pending-v2';
if(!form || !box || !register){throw new Error('MR LEE: Đăng ký thiếu vùng giao diện.');}
let auth=null,db=null,busy=false;
function registerMode(){return register.getAttribute('aria-selected')==='true';}
function toggle(){
  const show=registerMode();
  box.hidden=!show;
  box.querySelectorAll('[data-mrlee-required]').forEach(el=>{el.required=show;});
  $('mrlee-guardian').required=show && isMinor($('mrlee-birth').value);
}
function isMinor(str){
  if(!str)return false;
  const date=new Date(str+'T12:00:00');
  if(Number.isNaN(date.valueOf()))return false;
  const today=new Date();
  let age=today.getFullYear()-date.getFullYear();
  if(today.getMonth()<date.getMonth() || (today.getMonth()===date.getMonth() && today.getDate()<date.getDate()))age--;
  return age<18;
}
function validBirth(str){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(str))return false;
  const dt=new Date(str+'T12:00:00');
  return !Number.isNaN(dt.valueOf()) && dt.toISOString().slice(0,10)===str && dt<=new Date() && dt.getFullYear()>=1900;
}
function feedback(text,kind='error'){
  const el=$('mrlee-reg-feedback');if(el){el.textContent=text;el.dataset.kind=kind;}
  const target=$('verify-view') && !$('verify-view').classList.contains('hidden') ? $('verify-message') : $('message');
  if(target){target.textContent=text;target.className='status '+kind;}
}
function collect(){
  return {
    fullName:$('full-name').value.trim(),email:$('email').value.trim().toLowerCase(),
    birthDate:$('mrlee-birth').value,phone:$('mrlee-phone').value.replace(/\s+/g,'').trim(),
    program:$('mrlee-program').value,
    highSchool:$('mrlee-high-school').value.trim(),
    highSchoolStatus:box.querySelector('[name="mrlee-high-status"]:checked')?.value||'',
    higherSchool:$('mrlee-higher-school').value.trim(),
    higherSchoolStatus:box.querySelector('[name="mrlee-higher-status"]:checked')?.value||'',
    guardianConsent:$('mrlee-guardian').checked,
    consentAt:new Date().toISOString()
  };
}
function valid(d){
  if(!d.fullName || d.fullName.length<2) return 'Họ tên cần ít nhất 2 ký tự.';
  if(!validBirth(d.birthDate))return 'Ngày sinh không hợp lệ hoặc ở tương lai.';
  if(!/^[+]?[0-9.\-]{9,16}$/.test(d.phone))return 'Số điện thoại không hợp lệ.';
  if(!d.program || !d.highSchool || !d.highSchoolStatus || !d.higherSchoolStatus)return 'Hãy điền đủ ba bước thông tin học viên.';
  if(d.higherSchoolStatus!=='Chưa học CĐ/ĐH' && !d.higherSchool)return 'Hãy nhập tên trường CĐ/Đại học hoặc chọn Chưa học.';
  if(isMinor(d.birthDate) && !d.guardianConsent)return 'Học viên dưới 18 tuổi cần xác nhận sự đồng ý của phụ huynh/người giám hộ.';
  return null;
}
function pending(){
  try{let p=JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'null');
    return p && typeof p.at==='number' && Date.now()-p.at<86400000 ? p : null;
  }catch{return null;}
}
async function saveFor(user){
  const value=pending();
  if(busy || !db || !value || !user || user.email?.toLowerCase()!==value.data?.email)return;
  busy=true;
  try{
    const {email,...fields}=value.data; // Account email belongs to Firebase Authentication; avoid duplicating it.
    const ref=doc(db,'studentRegistrations',user.uid);
    const old=await getDoc(ref);
    if(old.exists()){
      await updateDoc(ref,{...fields,updatedAt:serverTimestamp()});
    }else{
      await setDoc(ref,{...fields,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    }
    sessionStorage.removeItem(STORAGE_KEY);
    feedback('Đã lưu thông tin đăng ký học viên vào hồ sơ riêng tư. Hãy xác minh email để bắt đầu học.','success');
  }catch(e){
    console.warn('MR LEE registration profile save:',e);
    feedback('Tài khoản đã được tạo nhưng chưa lưu được thông tin bổ sung ('+(e?.code||'lỗi kết nối')+'). Cần triển khai Firestore Rules mới. Không đăng ký lại bằng email này; sau khi sửa quyền lưu, quay lại trang và bấm “Tôi đã xác minh” để thử lưu.','error');
  }finally{busy=false;}
}
form.addEventListener('submit',e=>{
  if(!registerMode())return;
  const d=collect(),error=valid(d);
  if(error){e.preventDefault();e.stopImmediatePropagation();feedback(error);return;}
  // Retained only in this browser tab until secure Firestore write succeeds.
  try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify({at:Date.now(),data:d}));}
  catch(storageError){e.preventDefault();e.stopImmediatePropagation();feedback('Trình duyệt chặn lưu tạm dữ liệu. Hãy bật bộ nhớ phiên để hoàn tất đăng ký.');}
},true);
for(const id of ['mode-login','mode-register'])$(id)?.addEventListener('click',()=>queueMicrotask(toggle));
$('mrlee-birth').addEventListener('change',toggle);
$('verify-view')?.addEventListener('click',e=>{
  if(e.target.id==='check-email-button' && auth?.currentUser)saveFor(auth.currentUser);
});
for(const id of ['logout-button','verify-logout-button'])$(id)?.addEventListener('click',()=>sessionStorage.removeItem(STORAGE_KEY));
if(isFirebaseConfigured){
  try{
    const app=getApps().length?getApps()[0]:initializeApp(firebaseConfig);
    auth=getAuth(app);db=getFirestore(app);
    onAuthStateChanged(auth,user=>{if(user)saveFor(user);});
  }catch(e){console.warn('MR LEE student profile initialization',e);}
}
// Direct link to registration from CTA or account button.
if(new URLSearchParams(location.search).get('mode')==='register'){
  register.click();
}
toggle();
