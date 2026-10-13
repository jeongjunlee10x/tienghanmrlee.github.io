/** Tiếng Hàn Mr Lee — Email/Password Authentication cho GitHub Pages (không cần SMS). */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, sendEmailVerification,
  sendPasswordResetEmail, reload, updateProfile, signOut
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

// Chỉ cho phép quay về các trang HTML trong chính website, tránh chuyển hướng độc hại.
function verifiedReturnURL() {
  const raw = new URLSearchParams(location.search).get('next');
  if (!raw || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) return null;
  try {
    const root = new URL('./', location.href);
    const url = new URL(raw, root);
    if (url.origin !== location.origin || !url.pathname.startsWith(root.pathname)) return null;
    const subpath = url.pathname.slice(root.pathname.length);
    if (!subpath || subpath.includes('/') || !/^[a-z0-9_-]+\.html$/i.test(subpath)) return null;
    if (['dang-nhap.html','index.html'].includes(subpath.toLowerCase())) return null;
    return url.href;
  } catch { return null; }
}
const returnURL = verifiedReturnURL();
function openRequestedPage() {
  if (!returnURL) return false;
  location.replace(returnURL);
  return true;
}

const $ = id => document.getElementById(id);
let auth = null;
let selectedMode = 'login';
let processing = false;
let lastVerificationSend = 0;

const allViews = ['form-view', 'verify-view', 'account-view'];
function showView(id) { allViews.forEach(view => $(view).classList.toggle('hidden', view !== id)); }
function message(target, text = '', type = '') { const node = $(target); node.textContent = text; node.className = `status ${type}`.trim(); }
function busy(id, yes, label) { const button = $(id); if (yes && !button.dataset.label) button.dataset.label = button.textContent; button.disabled = yes; button.textContent = yes ? label : (button.dataset.label || button.textContent); if (!yes) delete button.dataset.label; }
function errText(err) {
  const messages = {
    'auth/email-already-in-use': 'Email đã được đăng ký. Hãy chuyển sang Đăng nhập hoặc dùng Quên mật khẩu.',
    'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
    'auth/weak-password': 'Mật khẩu quá yếu. Hãy đặt từ 10 ký tự, gồm chữ hoa, chữ thường và số.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/wrong-password': 'Email hoặc mật khẩu không đúng.',
    'auth/user-not-found': 'Email hoặc mật khẩu không đúng.',
    'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
    'auth/too-many-requests': 'Yêu cầu quá nhiều lần. Hãy thử lại sau.',
    'auth/operation-not-allowed': 'Cần bật Email/Password trong Firebase → Authentication → Sign-in method.',
    'auth/unauthorized-domain': 'Cần thêm jeongjunlee10x.github.io vào danh sách Authorized domains.',
    'auth/network-request-failed': 'Không kết nối được đến Firebase. Hãy kiểm tra mạng.',
    'auth/invalid-api-key': 'Mã cấu hình Firebase chưa chính xác.',
    'auth/requires-recent-login': 'Phiên đăng nhập cần được làm mới. Vui lòng đăng xuất và đăng nhập lại.'
  };
  return messages[err?.code] || `Không thực hiện được yêu cầu${err?.code ? ` (${err.code})` : ''}.`;
}
function setMode(mode) {
  selectedMode = mode;
  const signup = mode === 'register';
  $('mode-login').setAttribute('aria-selected', String(!signup));
  $('mode-register').setAttribute('aria-selected', String(signup));
  $('name-field').classList.toggle('hidden', !signup);
  $('confirm-field').classList.toggle('hidden', !signup);
  $('consent-field').classList.toggle('hidden', !signup);
  $('password-hint').classList.toggle('hidden', !signup);
  $('forgot-button').classList.toggle('hidden', signup);
  $('full-name').required = signup;
  $('confirm-password').required = signup;
  $('consent').required = signup;
  $('password').minLength = signup ? 10 : 6;
  $('password').autocomplete = signup ? 'new-password' : 'current-password';
  $('form-title').textContent = signup ? 'Đăng ký học viên' : 'Đăng nhập học viên';
  $('form-subtitle').textContent = signup ? 'Tạo tài khoản và xác minh email miễn phí.' : 'Dùng email và mật khẩu đã đăng ký.';
  $('submit-button').textContent = signup ? 'Tạo tài khoản' : 'Đăng nhập';
  message('message');
}
function renderAccount(user) {
  if (openRequestedPage()) return;
  showView('account-view');
  $('account-name').textContent = user.displayName || 'Chưa cập nhật';
  $('account-email').textContent = user.email || '—';
  $('display-name').value = user.displayName || '';
}
function renderVerification(user) {
  showView('verify-view');
  $('verify-email').textContent = user.email || '';
}
function renderCurrentUser(user) {
  if (!user) { showView('form-view'); return; }
  if (!user.emailVerified) renderVerification(user);
  else renderAccount(user);
}

$('mode-login').addEventListener('click', () => setMode('login'));
$('mode-register').addEventListener('click', () => setMode('register'));
$('auth-form').addEventListener('submit', async e => {
  e.preventDefault();
  if (processing || !auth) return;
  const email = $('email').value.trim().toLowerCase();
  const password = $('password').value;
  if (!email) return message('message', 'Vui lòng nhập email.', 'error');
  if (selectedMode === 'register') {
    if ($('full-name').value.trim().length < 2) return message('message', 'Hãy nhập họ và tên.', 'error');
    if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return message('message', 'Mật khẩu cần ít nhất 10 ký tự, có chữ hoa, chữ thường và số.', 'error');
    if (password !== $('confirm-password').value) return message('message', 'Hai lần nhập mật khẩu không giống nhau.', 'error');
    if (!$('consent').checked) return message('message', 'Vui lòng xác nhận đồng ý với điều khoản xác thực.', 'error');
  }
  processing = true;
  busy('submit-button', true, 'Đang xử lý...');
  try {
    if (selectedMode === 'register') {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: $('full-name').value.trim() });
      await sendEmailVerification(credential.user);
      lastVerificationSend = Date.now();
      renderVerification(credential.user);
      message('verify-message', 'Đã gửi email xác minh. Hãy mở hộp thư của bạn (kiểm tra cả Spam).', 'success');
      $('password').value = '';
      $('confirm-password').value = '';
    } else {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await reload(credential.user);
      renderCurrentUser(auth.currentUser);
      $('password').value = '';
      if (!auth.currentUser.emailVerified) message('verify-message', 'Tài khoản chưa được xác minh. Hãy kiểm tra email hoặc gửi lại liên kết.', 'error');
    }
  } catch (error) {
    const target = auth?.currentUser && !auth.currentUser.emailVerified ? 'verify-message' : 'message';
    if (auth?.currentUser && !auth.currentUser.emailVerified) renderVerification(auth.currentUser);
    message(target, errText(error), 'error');
  } finally {
    busy('submit-button', false);
    processing = false;
  }
});
$('forgot-button').addEventListener('click', async () => {
  if (!auth) return;
  const email = $('email').value.trim();
  if (!email || !$('email').checkValidity()) { message('message', 'Nhập email của bạn vào ô Email rồi nhấn Quên mật khẩu.', 'error'); $('email').focus(); return; }
  busy('forgot-button', true, 'Đang gửi...');
  try {
    await sendPasswordResetEmail(auth, email);
    message('message', 'Nếu email có tài khoản hợp lệ, Firebase sẽ gửi hướng dẫn đặt lại mật khẩu. Hãy kiểm tra hộp thư và Spam.', 'success');
  } catch (error) { message('message', errText(error), 'error'); }
  finally { busy('forgot-button', false); }
});
$('check-email-button').addEventListener('click', async () => {
  if (!auth?.currentUser) return showView('form-view');
  busy('check-email-button', true, 'Đang kiểm tra...');
  try {
    await reload(auth.currentUser);
    if (auth.currentUser.emailVerified) {
      message('verify-message');
      renderAccount(auth.currentUser);
    } else {
      message('verify-message', 'Email chưa được xác minh. Hãy mở liên kết trong thư rồi thử lại.', 'error');
    }
  } catch (error) { message('verify-message', errText(error), 'error'); }
  finally { busy('check-email-button', false); }
});
$('resend-email-button').addEventListener('click', async () => {
  if (!auth?.currentUser) return;
  if (Date.now() - lastVerificationSend < 60000) return message('verify-message', 'Hãy đợi ít nhất 60 giây trước khi gửi lại.', 'error');
  busy('resend-email-button', true, 'Đang gửi...');
  try {
    await sendEmailVerification(auth.currentUser);
    lastVerificationSend = Date.now();
    message('verify-message', 'Đã yêu cầu gửi lại liên kết. Hãy kiểm tra hộp thư và Spam.', 'success');
  } catch (error) { message('verify-message', errText(error), 'error'); }
  finally { busy('resend-email-button', false); }
});
async function logOut() {
  if (!auth) return;
  try { await signOut(auth); showView('form-view'); setMode('login'); message('message', 'Bạn đã đăng xuất thành công.', 'success'); }
  catch (error) { message('message', errText(error), 'error'); }
}
$('verify-logout-button').addEventListener('click', logOut);
$('logout-button').addEventListener('click', logOut);
$('profile-form').addEventListener('submit', async e => {
  e.preventDefault();
  if (!auth?.currentUser?.emailVerified) return;
  const name = $('display-name').value.trim();
  if (name.length < 2) return message('profile-message', 'Hãy nhập họ tên từ 2 ký tự.', 'error');
  busy('save-name', true, 'Đang lưu...');
  try { await updateProfile(auth.currentUser, { displayName: name }); renderAccount(auth.currentUser); message('profile-message', 'Đã cập nhật họ và tên.', 'success'); }
  catch (error) { message('profile-message', errText(error), 'error'); }
  finally { busy('save-name', false); }
});

if (!isFirebaseConfigured) {
  $('setup-alert').classList.remove('hidden');
  $('submit-button').disabled = true;
  message('message', 'Quản trị viên cần cấu hình firebase-config.js.', 'error');
} else {
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    onAuthStateChanged(auth, user => renderCurrentUser(user), err => message('message', errText(err), 'error'));
  } catch (error) {
    $('setup-alert').classList.remove('hidden');
    message('message', errText(error), 'error');
  }
}
