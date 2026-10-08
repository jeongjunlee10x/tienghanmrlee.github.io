/** Đồng bộ tên / trạng thái đăng nhập trên menu trang chủ Tiếng Hàn Mr Lee. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';
const link = document.getElementById('mrlee-auth-nav');
if (link && isFirebaseConfigured) {
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    let label = link.querySelector('.auth-status-label');
    if (!label) {
      // Giữ nguyên biểu tượng SVG trong HTML gốc.
      [...link.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).forEach(n => n.remove());
      label = document.createElement('span');
      label.className = 'auth-status-label';
      link.appendChild(label);
    }
    onAuthStateChanged(getAuth(app), user => {
      const verified = !!user?.emailVerified;
      label.textContent = verified ? (user.displayName || 'Tài khoản của tôi') : 'Đăng ký / Đăng nhập';
      link.title = verified ? 'Xem tài khoản học viên' : 'Đăng ký hoặc đăng nhập bằng email';
    });
  } catch (error) {
    console.warn('Chưa thể hiển thị trạng thái đăng nhập:', error?.code || error);
  }
}
