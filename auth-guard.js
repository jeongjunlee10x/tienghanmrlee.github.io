/** Mr Lee - Kiểm tra đăng nhập và xác minh email trên các trang chức năng.
 * Đây là chặn giao diện phía trình duyệt, KHÔNG bảo mật tài liệu tĩnh trên GitHub Pages.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, reload } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const baseURL = new URL('./', import.meta.url);
const loginURL = new URL('dang-nhap.html', baseURL);
const relativeURL = location.pathname.startsWith(baseURL.pathname)
  ? location.pathname.slice(baseURL.pathname.length) + location.search + location.hash
  : 'index.html';
loginURL.searchParams.set('next', relativeURL);

function reveal() {
  const hide = document.getElementById('mrlee-auth-hide');
  if (hide) hide.remove();
  document.documentElement.dataset.mrleeAuth = 'verified';
}
function goToLogin() { location.replace(loginURL.href); }
function showProblem() {
  // Không cho thấy trang học nếu không thể kết nối Firebase.
  document.body.innerHTML = '';
  const main = document.createElement('main');
  main.style.cssText = 'min-height:100vh;display:grid;place-content:center;text-align:center;gap:12px;padding:30px;font:16px/1.7 Arial,sans-serif;color:#142b4c;background:#f4f7fb';
  const title = document.createElement('h1');
  title.textContent = 'Chưa thể xác minh tài khoản';
  const desc = document.createElement('p');
  desc.textContent = 'Vui lòng kiểm tra Internet hoặc cấu hình Firebase rồi thử lại.';
  const link = document.createElement('a');
  link.href = loginURL.href;
  link.textContent = 'Đến trang đăng nhập';
  main.append(title, desc, link);
  document.body.append(main);
  reveal();
}

try {
  if (!isFirebaseConfigured) throw new Error('Missing Firebase configuration');
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  onAuthStateChanged(auth, async user => {
    if (!user) return goToLogin();
    try {
      await reload(user); // lấy trạng thái emailVerified mới nhất từ Firebase
      if (!auth.currentUser?.emailVerified) return goToLogin();
      reveal();
    } catch (err) { console.warn('Firebase verify failed', err); showProblem(); }
  }, err => { console.warn('Firebase Auth error', err); showProblem(); });
} catch (err) {
  console.warn('Authentication bootstrap failed', err);
  showProblem();
}
