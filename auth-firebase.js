/**
 * TIẾNG HÀN MR LEE — Đăng ký/đăng nhập SMS (Firebase Authentication Web).
 * Tài khoản được Firebase Authentication tạo tự động ở lần xác thực số điện thoại đầu tiên.
 * Vì vậy lựa chọn Đăng nhập với số mới cũng tạo tài khoản; không thể phân biệt 100%
 * đăng ký / đăng nhập trước khi kiểm tra OTP nếu không dùng backend bổ sung.
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithPhoneNumber,
  RecaptchaVerifier, updateProfile, signOut, getAdditionalUserInfo
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const $ = (id) => document.getElementById(id);
const formView = $('form-view');
const accountView = $('account-view');
const status = $('message');
let auth = null;
let captcha = null;
let captchaWidgetId = null;
let confirmation = null;
let phoneInFlight = '';
let selectedMode = 'login';
let signupName = '';
let resendCounter = 0;
let resendInterval = null;
let sending = false;

function showMessage(message, type = '') {
  status.textContent = message;
  status.className = `status ${type}`.trim();
}
function setBusy(button, busy, busyText) {
  if (!button) return;
  if (busy) button.dataset.originalText = button.textContent;
  button.disabled = busy;
  button.textContent = busy ? busyText : (button.dataset.originalText || button.textContent);
}
function normalizeVietnamPhone(raw) {
  const input = String(raw).trim().replace(/[\s().-]/g, '');
  let digits = input;
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (/^0[35789]\d{8}$/.test(digits)) return '+84' + digits.substring(1);
  if (/^84[35789]\d{8}$/.test(digits)) return '+' + digits;
  return null;
}
function errorText(error) {
  const code = error?.code || '';
  const common = {
    'auth/invalid-phone-number': 'Số điện thoại chưa đúng định dạng. Hãy nhập số di động Việt Nam 10 chữ số.',
    'auth/missing-phone-number': 'Bạn cần nhập số điện thoại.',
    'auth/invalid-verification-code': 'Mã OTP không chính xác. Vui lòng kiểm tra và thử lại.',
    'auth/code-expired': 'Mã OTP đã hết hiệu lực. Bạn hãy gửi lại mã.',
    'auth/too-many-requests': 'Có quá nhiều yêu cầu. Hãy thử lại sau.',
    'auth/quota-exceeded': 'Đã vượt giới hạn SMS của dự án Firebase.',
    'auth/operation-not-allowed': 'Chưa bật Phone Authentication hoặc cấu hình SMS của Firebase chưa sẵn sàng.',
    'auth/unauthorized-domain': 'Tên miền chưa được cho phép trong Firebase Authentication.',
    'auth/billing-not-enabled': 'Dự án Firebase chưa bật thanh toán để gửi SMS.',
    'auth/captcha-check-failed': 'Xác minh reCAPTCHA không thành công. Vui lòng thử lại.',
    'auth/invalid-app-credential': 'Xác thực ứng dụng hoặc reCAPTCHA không hợp lệ. Kiểm tra tên miền và thiết lập Firebase.',
    'auth/network-request-failed': 'Không kết nối được Firebase. Hãy kiểm tra mạng Internet.',
    'auth/invalid-api-key': 'Firebase API key không đúng. Vui lòng kiểm tra firebase-config.js.'
  };
  return common[code] || `Không thể thực hiện yêu cầu. ${code ? `Mã lỗi: ${code}` : 'Kiểm tra cấu hình Firebase hoặc kết nối mạng.'}`;
}
function chooseMode(mode) {
  selectedMode = mode;
  $('mode-login').setAttribute('aria-selected', String(mode === 'login'));
  $('mode-register').setAttribute('aria-selected', String(mode === 'register'));
  $('registration-fields').classList.toggle('hidden', mode !== 'register');
  $('full-name').required = mode === 'register';
  $('form-title').textContent = mode === 'register' ? 'Tạo tài khoản học viên' : 'Đăng nhập';
  showMessage('');
}
function resetCaptcha() {
  try { if (captchaWidgetId != null && typeof window.grecaptcha?.reset === 'function') window.grecaptcha.reset(captchaWidgetId); }
  catch (_) { /* Firebase có thể chủ động đặt lại captcha */ }
}
async function getCaptcha() {
  if (!captcha) {
    captcha = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'normal' });
    captchaWidgetId = await captcha.render();
  }
  return captcha;
}
function startResendCooldown() {
  clearInterval(resendInterval);
  resendCounter = 60;
  const update = () => {
    $('resend-button').disabled = resendCounter > 0;
    $('resend-button').textContent = resendCounter > 0 ? `Gửi lại mã sau ${resendCounter}s` : 'Gửi lại mã SMS';
  };
  update();
  resendInterval = setInterval(() => {
    resendCounter = Math.max(0, resendCounter - 1);
    update();
    if (!resendCounter) clearInterval(resendInterval);
  }, 1000);
}
function showCode(phone) {
  $('send-form').classList.add('hidden');
  $('code-view').classList.remove('hidden');
  $('target-phone').textContent = phone;
  $('otp').value = '';
  $('otp').focus();
}
function showPhoneForm() {
  confirmation = null;
  $('code-view').classList.add('hidden');
  $('send-form').classList.remove('hidden');
  $('otp').value = '';
  showMessage('');
  resetCaptcha();
}
function renderAccount(user) {
  formView.classList.add('hidden');
  accountView.classList.remove('hidden');
  $('account-name').textContent = user.displayName || 'Chưa cập nhật';
  $('account-phone').textContent = user.phoneNumber || '—';
  $('display-name').value = user.displayName || '';
}
function renderSignedOut() {
  accountView.classList.add('hidden');
  formView.classList.remove('hidden');
}
async function sendCode(phone, isResend = false) {
  if (sending) return;
  sending = true;
  const button = isResend ? $('resend-button') : $('send-button');
  setBusy(button, true, 'Đang yêu cầu SMS...');
  try {
    const captchaVerifier = await getCaptcha();
    const response = await signInWithPhoneNumber(auth, phone, captchaVerifier);
    confirmation = response;
    phoneInFlight = phone;
    showCode(phone);
    startResendCooldown();
    showMessage('Đã yêu cầu gửi mã SMS. Hãy kiểm tra tin nhắn và nhập mã xác minh.', 'success');
  } catch (error) {
    showMessage(errorText(error), 'error');
    resetCaptcha();
  } finally {
    sending = false;
    setBusy(button, false);
    if (resendCounter > 0) $('resend-button').disabled = true;
  }
}

$('mode-login').addEventListener('click', () => chooseMode('login'));
$('mode-register').addEventListener('click', () => chooseMode('register'));
$('send-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!auth) return showMessage('Chưa thiết lập Firebase. Quản trị viên cần kết nối dự án trước.', 'error');
  const phone = normalizeVietnamPhone($('phone').value);
  if (!phone) return showMessage('Số điện thoại không hợp lệ. Ví dụ: 0912345678 hoặc +84912345678.', 'error');
  if (!$('consent').checked) return showMessage('Bạn cần đồng ý với thông báo xử lý số điện thoại.', 'error');
  signupName = selectedMode === 'register' ? $('full-name').value.trim() : '';
  if (selectedMode === 'register' && signupName.length < 2) return showMessage('Vui lòng nhập họ và tên (ít nhất 2 ký tự).', 'error');
  await sendCode(phone);
});
$('verify-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!confirmation) return showMessage('Bạn cần yêu cầu gửi mã SMS trước.', 'error');
  const code = $('otp').value.trim();
  if (!/^\d{6}$/.test(code)) return showMessage('Mã OTP cần đủ 6 chữ số.', 'error');
  setBusy($('verify-button'), true, 'Đang xác minh...');
  try {
    const result = await confirmation.confirm(code);
    const isNewUser = getAdditionalUserInfo(result)?.isNewUser === true;
    // Chỉ thêm tên đăng ký khi tài khoản mới, tránh ghi đè tên người dùng đã tồn tại.
    if (isNewUser && signupName) {
      await updateProfile(result.user, { displayName: signupName });
    }
    confirmation = null;
    clearInterval(resendInterval);
    renderAccount(result.user);
    if (isNewUser && !result.user.displayName) {
      $('profile-message').textContent = 'Tài khoản mới đã được tạo. Bạn có thể điền tên hiển thị bên dưới.';
      $('profile-message').className = 'status';
    }
  } catch (error) {
    showMessage(errorText(error), 'error');
  } finally {
    setBusy($('verify-button'), false);
  }
});
$('resend-button').addEventListener('click', async () => {
  if (!phoneInFlight || resendCounter > 0) return;
  await sendCode(phoneInFlight, true);
});
$('change-phone').addEventListener('click', showPhoneForm);
$('profile-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!auth?.currentUser) return;
  const name = $('display-name').value.trim();
  if (name.length < 2) return;
  setBusy($('save-name'), true, 'Đang lưu...');
  try {
    await updateProfile(auth.currentUser, { displayName: name });
    renderAccount(auth.currentUser);
    $('profile-message').textContent = 'Đã lưu tên hiển thị.';
    $('profile-message').className = 'status success';
  } catch (error) {
    $('profile-message').textContent = errorText(error);
    $('profile-message').className = 'status error';
  } finally {
    setBusy($('save-name'), false);
  }
});
$('logout-button').addEventListener('click', async () => {
  if (!auth) return;
  setBusy($('logout-button'), true, 'Đang đăng xuất...');
  try {
    await signOut(auth);
    renderSignedOut();
    showPhoneForm();
  } catch (error) {
    $('profile-message').textContent = errorText(error);
  } finally {
    setBusy($('logout-button'), false);
  }
});

if (!isFirebaseConfigured) {
  $('setup-alert').classList.remove('hidden');
  $('send-button').disabled = true;
  showMessage('Để gửi SMS thật, chủ website cần cấu hình Firebase trong file firebase-config.js.', 'error');
} else {
  try {
    auth = getAuth(initializeApp(firebaseConfig));
    auth.languageCode = 'vi';
    onAuthStateChanged(auth, user => user ? renderAccount(user) : renderSignedOut(), error => {
      showMessage(errorText(error), 'error');
    });
  } catch (error) {
    $('setup-alert').classList.remove('hidden');
    $('send-button').disabled = true;
    showMessage(errorText(error), 'error');
  }
}
