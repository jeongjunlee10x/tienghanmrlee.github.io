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
document.addEventListener('click', event => {
  const anchor = event.target.closest?.('a[href]');
  if (!anchor || event.defaultPrevented) return;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return;
  const root = new URL('./', location.href);
  if (!url.pathname.startsWith(root.pathname)) return;
  const relative = url.pathname.slice(root.pathname.length);
  if (!/^[a-z0-9_-]+\.html$/i.test(relative)) return;
  if (['index.html','dang-nhap.html'].includes(relative.toLowerCase())) return;
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
