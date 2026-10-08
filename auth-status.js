/** Hiển thị tên học viên trên nút tài khoản ở trang chủ. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';
const link = document.querySelector('#mrlee-auth-nav');
if (link && isFirebaseConfigured) {
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    onAuthStateChanged(getAuth(app), user => {
      link.textContent = user ? `👤 ${user.displayName || 'Tài khoản của tôi'}` : '👤 Đăng ký / Đăng nhập';
      link.title = user ? 'Xem tài khoản / Đăng xuất' : 'Đăng nhập bằng SMS';
    });
  } catch (error) {
    // Nút liên kết vẫn hoạt động ngay cả khi Firebase tạm thời không sẵn sàng.
    console.warn('Firebase Authentication chưa sẵn sàng:', error?.code || error);
  }
}
