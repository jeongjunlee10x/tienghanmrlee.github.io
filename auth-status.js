/** Mr Lee — Nhận biết tài khoản và chuyển khách đến đăng nhập trước khi mở bài học. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const accountLink = document.getElementById('mrlee-auth-nav');
let verified = false;

function updateLabel(text) {
  if (!accountLink) return;
  let label = accountLink.querySelector('.auth-status-label');
  if (!label) {
    for (const n of [...accountLink.childNodes]) {
      if (n.nodeType === Node.TEXT_NODE) n.remove();
    }
    label = document.createElement('span');
    label.className = 'auth-status-label';
    accountLink.appendChild(label);
  }
  label.textContent = text;
}
function loginFor(url) {
  const login = new URL('dang-nhap.html', location.href);
  login.searchParams.set('next', url.pathname.split('/').pop() + url.search + url.hash);
  location.assign(login.href);
}
// Chặn sớm cả trước khi Firebase tải xong. Các trang đích cũng kiểm tra độc lập.
const MRLEE_PROTECTED_PAGES = new Set(["bai-hoc.html", "bang-chu-cai-tieng-han.html", "bo-sach.html", "de-thi-topik.html", "giao-tiep-phong-van.html", "giao-tiep-theo-chu-de.html", "hoc-theo-bai.html", "hoc-tieng-han.html", "hoi-thoai-tap-noi.html", "kiem-tra-online.html", "lich-su-hoc-tap.html", "lo-trinh-1-6.html", "lo-trinh-topik.html", "luyen-noi-nang-cao.html", "luyen-noi-tinh-diem.html", "mrlee-bai-tap-pro.html", "mrlee-topik-pro.html", "nghe-toan-bo.html", "noi-dung-bao-mat.html", "on-luyen-phong-van.html", "so-cap-1.html", "so-cap-2.html", "so-tay-rieng.html", "thi-topik-online.html", "topik-hoc-moi-ngay.html", "topik-i-lo-trinh.html", "topik-ii-lo-trinh.html", "topik-kiem-tra-am-thanh.html", "topik-luyen-de.html", "topik-nghe-124-cau.html", "topik-nghe-24-cau.html", "topik-v10.html", "topik-v11.html", "topik-v12.html", "topik-viet-51-54.html", "trung-tam-hoc-vien.html", "van-hoa-bai-hoc.html"]);
document.addEventListener('click', event => {
  const anchor = event.target.closest?.('a[href]');
  if (!anchor || event.defaultPrevented) return;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return;
  const root = new URL('./', location.href);
  if (!url.pathname.startsWith(root.pathname)) return;
  const relative = url.pathname.slice(root.pathname.length);
  if (!/^[a-z0-9_-]+\.html$/i.test(relative)) return;
  if (!MRLEE_PROTECTED_PAGES.has(relative.toLowerCase())) return;
  if (!verified) {
    event.preventDefault();
    loginFor(url);
  }
}, true);

updateLabel('Đăng ký / Đăng nhập');
if (isFirebaseConfigured) {
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    onAuthStateChanged(getAuth(app), user => {
      verified = Boolean(user && user.emailVerified);
      updateLabel(verified ? (user.displayName || 'Tài khoản của tôi') : 'Đăng ký / Đăng nhập');
      if (accountLink) accountLink.title = verified ? 'Xem tài khoản' : 'Đăng ký hoặc đăng nhập để học';
    }, () => { verified = false; });
  } catch (error) { console.warn('Không tải được Firebase Auth', error); }
}
