/**
 * TIẾNG HÀN MR LEE — Cổng giao diện Firebase Authentication.
 * Yêu cầu email đã xác minh, chuyển tới trang đăng nhập khi chưa đủ điều kiện.
 * CẢNH BÁO: Mã này KHÔNG bảo vệ nguồn HTML/PDF được GitHub Pages phát công khai.
 * Dữ liệu riêng phải lưu trong Firestore với Security Rules máy chủ.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, reload } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const rootURL = new URL('./', import.meta.url);
const loginURL = new URL('dang-nhap.html', rootURL);
let done = false;

function requestedPage() {
  const here = new URL(location.href);
  if (here.origin !== rootURL.origin || !here.pathname.startsWith(rootURL.pathname)) return 'index.html';
  // Chỉ đưa về các trang HTML trong thư mục gốc, tránh open redirect.
  const page = here.pathname.slice(rootURL.pathname.length);
  if (!/^[a-z\d_-]+\.html$/i.test(page)) return 'index.html';
  return page + here.search + here.hash;
}
loginURL.searchParams.set('next', requestedPage());

function unblock() {
  document.getElementById('mrlee-auth-hide')?.remove();
  document.documentElement.dataset.mrleeAuth = 'verified';
  done = true;
}
function goToLogin() {
  done = true;
  location.replace(loginURL.href);
}
function errorScreen() {
  if (done) return;
  done = true;
  document.body.replaceChildren();
  document.getElementById('mrlee-auth-hide')?.remove();
  const main = document.createElement('main');
  main.style.cssText = 'min-height:100vh;background:#f4f7fb;color:#142b4c;display:grid;place-content:center;text-align:center;padding:28px;font:16px/1.65 Arial,sans-serif';
  const h = document.createElement('h1');
  h.textContent = 'Không thể kiểm tra quyền truy cập';
  const p = document.createElement('p');
  p.textContent = 'Nội dung đang được khóa. Vui lòng kiểm tra Internet hoặc quay lại trang đăng nhập.';
  const a = document.createElement('a');
  a.href = loginURL.href;
  a.textContent = 'Đến trang đăng nhập';
  main.append(h,p,a);
  document.body.append(main);
}

// Lỗi mạng/CDN: không mở nội dung khi chưa xác thực.
const fallback = setTimeout(errorScreen, 12000);
try {
  if (!isFirebaseConfigured) throw new Error('Firebase config is missing');
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  onAuthStateChanged(auth, async user => {
    // Nếu người dùng đăng xuất trong tab khác, trang hiện tại phải rời nội dung.
    if (done && !user) return goToLogin();
    if (done) return;
    if (!user) { clearTimeout(fallback); goToLogin(); return; }
    try {
      // Kiểm tra trạng thái email và cập nhật token, tránh dựa vào cache cũ.
      await reload(user);
      const current = auth.currentUser;
      if (!current || !current.emailVerified) { clearTimeout(fallback); goToLogin(); return; }
      const token = await current.getIdTokenResult(true);
      if (token.claims.email_verified !== true) { clearTimeout(fallback); goToLogin(); return; }
      clearTimeout(fallback);
      unblock();
    } catch (e) {
      console.warn('Firebase security check failed', e);
      clearTimeout(fallback);
      errorScreen();
    }
  }, e => { console.warn('Firebase Auth error',e); clearTimeout(fallback); errorScreen(); });
} catch (e) {
  console.warn('Firebase security initialization failed',e);
  clearTimeout(fallback);
  errorScreen();
}
