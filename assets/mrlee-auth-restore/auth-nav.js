/** MR LEE - Account button and optional early click redirect for study pages. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from '../../firebase-config.js';

const links=[document.getElementById('mrlee-auth-nav'),document.getElementById('mrlee-auth-nav-mobile')].filter(Boolean);
let verified=null;
const STUDY=new Set([
  'hoc-tieng-han.html','hoc-theo-bai.html','bai-hoc.html','bang-chu-cai-tieng-han.html',
  'lo-trinh-1-6.html','so-cap-1.html','so-cap-2.html','bo-sach.html',
  'trung-tam-hoc-vien.html','lich-su-hoc-tap.html','giao-tiep-phong-van.html',
  'giao-tiep-theo-chu-de.html','hoi-thoai-tap-noi.html','on-luyen-phong-van.html',
  'luyen-noi-tinh-diem.html','luyen-noi-nang-cao.html','mrlee-bai-tap-pro.html',
  'kiem-tra-online.html',
  'de-thi-topik.html','thi-topik-online.html','topik-luyen-de.html',
  'mrlee-topik-pro.html','lo-trinh-topik.html','topik-i-lo-trinh.html',
  'topik-ii-lo-trinh.html','topik-v10.html','topik-v11.html','topik-v12.html',
  'topik-hoc-moi-ngay.html','topik-nghe-24-cau.html','topik-nghe-124-cau.html',
  'topik-viet-51-54.html','topik-kiem-tra-am-thanh.html','nghe-toan-bo.html',
  'van-hoa-bai-hoc.html','so-tay-rieng.html','noi-dung-bao-mat.html'
]);
function setLabel(user){
  const label=user?.emailVerified ? (user.displayName?.trim() || 'Tài khoản của tôi') : 'Đăng ký / Đăng nhập';
  for(const link of links){
    link.textContent='👤 '+label;
    link.title=user?.emailVerified?'Mở hồ sơ và đăng xuất':'Đăng ký hoặc đăng nhập';
  }
}
setLabel(null);
if(isFirebaseConfigured){
  try{
    const app=getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    onAuthStateChanged(getAuth(app),user=>{verified=!!user?.emailVerified;setLabel(user);},e=>console.warn('MR LEE Auth:',e));
  }catch(e){ console.warn('MR LEE Firebase Auth unavailable:',e); }
}
// Public pages (admissions, map, leaderboard, contact) remain public.
document.addEventListener('click',e=>{
  if(verified!==false || e.defaultPrevented || e.button!==0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)return;
  const a=e.target.closest?.('a[href]');
  if(!a || a.target==='_blank' || a.hasAttribute('download'))return;
  const url=new URL(a.href,location.href),root=new URL('./',location.href);
  if(url.origin!==root.origin || !url.pathname.startsWith(root.pathname))return;
  const relative=url.pathname.slice(root.pathname.length);
  if(!STUDY.has(relative))return;
  e.preventDefault();
  const login=new URL('dang-nhap.html',root);
  login.searchParams.set('next',relative+url.search+url.hash);
  location.assign(login.href);
},true);
