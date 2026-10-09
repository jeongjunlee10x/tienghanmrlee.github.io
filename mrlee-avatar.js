/**
 * Tiếng Hàn Mr Lee — ảnh đại diện học viên, dùng Firestore miễn phí.
 * Dữ liệu: users/{uid}/avatars/profile (KHÔNG sửa users/{uid}).
 * Cần xuất bản Rules kèm bộ cài trước khi dùng.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const box = document.getElementById('mrlee-avatar-box');
const dashboard = document.getElementById('mrlee-avatar-dashboard');
const previews = [...document.querySelectorAll('[data-mrlee-avatar-img]')];
const placeholders = [...document.querySelectorAll('[data-mrlee-avatar-placeholder]')];
const fileInput = document.getElementById('mrlee-avatar-file');
const saveBtn = document.getElementById('mrlee-avatar-save');
const removeBtn = document.getElementById('mrlee-avatar-remove');
const avatarMsg = document.getElementById('mrlee-avatar-message');

if (box || dashboard) {
  let auth;
  let db;
  let uid = null;
  let pending = null;
  let saved = null;
  let busy = false;
  let generation = 0;

  const message = (value, error = false) => {
    if (!avatarMsg) return;
    avatarMsg.textContent = value || '';
    avatarMsg.classList.toggle('is-error', error);
  };
  const show = (imageData) => {
    previews.forEach(el => {
      if (imageData) { el.src = imageData; el.hidden = false; }
      else { el.removeAttribute('src'); el.hidden = true; }
    });
    placeholders.forEach(el => { el.hidden = Boolean(imageData); });
  };
  const toggleControls = () => {
    const active = Boolean(uid) && !busy;
    if (fileInput) fileInput.disabled = !active;
    if (saveBtn) saveBtn.disabled = !active || !pending;
    if (removeBtn) removeBtn.disabled = !active || !saved;
  };
  const readableError = error => {
    if (error?.code === 'permission-denied') return 'Chưa có quyền lưu ảnh. Hãy cập nhật Firestore Rules theo hướng dẫn trong bộ cài.';
    if (error?.code === 'unavailable') return 'Không kết nối được Firestore. Hãy kiểm tra Internet và thử lại.';
    return `Không thể xử lý ảnh${error?.code ? ` (${error.code})` : ''}. Vui lòng thử lại.`;
  };
  const refFor = id => doc(db, 'users', id, 'avatars', 'profile');
  const load = async (userId, ticket) => {
    try {
      const snapshot = await getDoc(refFor(userId));
      if (ticket !== generation || uid !== userId) return;
      saved = snapshot.exists() && typeof snapshot.data().imageData === 'string' ? snapshot.data().imageData : null;
      show(saved);
      message('');
    } catch (error) {
      if (ticket !== generation || uid !== userId) return;
      message(readableError(error), true);
    } finally {
      if (ticket === generation) toggleControls();
    }
  };

  const blobToBitmap = async file => {
    if (typeof createImageBitmap === 'function') return createImageBitmap(file);
    const localUrl = URL.createObjectURL(file);
    try {
      return await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('invalid-image'));
        image.src = localUrl;
      });
    } finally { URL.revokeObjectURL(localUrl); }
  };
  const cropAndCompress = async file => {
    const supported = ['image/jpeg', 'image/png', 'image/webp'];
    if (!supported.includes(file.type)) throw new Error('type');
    if (file.size > 8 * 1024 * 1024) throw new Error('size');
    const bitmap = await blobToBitmap(file);
    try {
      const width = bitmap.width || bitmap.naturalWidth;
      const height = bitmap.height || bitmap.naturalHeight;
      if (!width || !height) throw new Error('invalid-image');
      let result = '';
      for (const [size, quality] of [[256, 0.76], [224, 0.68], [192, 0.6]]) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) throw new Error('canvas');
        const side = Math.min(width, height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(bitmap, (width - side) / 2, (height - side) / 2, side, side, 0, 0, size, size);
        result = canvas.toDataURL('image/jpeg', quality);
        if (result.startsWith('data:image/jpeg;base64,') && result.length <= 145000) return result;
      }
      throw new Error('compressed-too-large');
    } finally { if (typeof bitmap.close === 'function') bitmap.close(); }
  };

  if (fileInput) fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file || !uid) return;
    const ticket = generation;
    busy = true;
    toggleControls();
    message('Đang xử lý và thu nhỏ ảnh...');
    try {
      const data = await cropAndCompress(file);
      if (ticket !== generation) return;
      pending = data;
      show(data);
      message('Đã xem trước. Nhấn “Lưu ảnh đại diện” để lưu vào tài khoản.');
    } catch (error) {
      if (ticket !== generation) return;
      pending = null;
      show(saved);
      const text = error.message === 'size' ? 'Ảnh gốc phải nhỏ hơn 8 MB.'
        : error.message === 'type' ? 'Chỉ nhận ảnh JPG, PNG hoặc WebP.'
        : 'Không thể đọc hoặc nén ảnh này. Hãy chọn ảnh khác.';
      message(text, true);
    } finally {
      if (ticket === generation) { busy = false; toggleControls(); }
    }
  });

  if (saveBtn) saveBtn.addEventListener('click', async () => {
    if (!uid || !pending || busy) return;
    const current = uid;
    const data = pending;
    const ticket = generation;
    busy = true;
    toggleControls();
    message('Đang lưu ảnh đại diện...');
    try {
      await setDoc(refFor(current), { imageData: data, updatedAt: serverTimestamp() });
      if (ticket !== generation || uid !== current) return;
      saved = data;
      pending = null;
      if (fileInput) fileInput.value = '';
      message('Đã lưu ảnh đại diện thành công!');
    } catch (error) {
      if (ticket === generation) message(readableError(error), true);
    } finally {
      if (ticket === generation) { busy = false; toggleControls(); }
    }
  });

  if (removeBtn) removeBtn.addEventListener('click', async () => {
    if (!uid || !saved || busy) return;
    if (!confirm('Bạn muốn xóa ảnh đại diện và dùng biểu tượng mặc định?')) return;
    const current = uid;
    const ticket = generation;
    busy = true;
    toggleControls();
    message('Đang xóa ảnh...');
    try {
      await deleteDoc(refFor(current));
      if (ticket !== generation || uid !== current) return;
      saved = null;
      pending = null;
      if (fileInput) fileInput.value = '';
      show(null);
      message('Đã xóa ảnh đại diện.');
    } catch (error) {
      if (ticket === generation) message(readableError(error), true);
    } finally {
      if (ticket === generation) { busy = false; toggleControls(); }
    }
  });

  try {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    const syncUser = user => {
      generation++;
      uid = user?.emailVerified ? user.uid : null;
      pending = null;
      saved = null;
      busy = false;
      if (fileInput) fileInput.value = '';
      show(null);
      message('');
      if (box) box.hidden = !uid;
      if (dashboard) dashboard.hidden = !uid;
      toggleControls();
      if (uid) load(uid, generation);
    };
    onAuthStateChanged(auth, syncUser, error => message(readableError(error), true));
    // Nếu học viên vừa bấm “Tôi đã xác minh” mà không tải lại trang,
    // đồng bộ trạng thái và làm mới token email_verified trước khi truy cập Firestore.
    const accountView = document.getElementById('account-view');
    if (accountView) {
      new MutationObserver(() => {
        const user = auth.currentUser;
        if (!accountView.classList.contains('hidden') && user?.emailVerified && uid !== user.uid) {
          user.getIdToken(true).then(() => syncUser(user)).catch(err => message(readableError(err), true));
        }
      }).observe(accountView, { attributes: true, attributeFilter: ['class'] });
    }
  } catch (error) {
    message('Không thể khởi tạo Firebase. Hãy kiểm tra firebase-config.js.', true);
    console.error('Mr Lee avatar initialization:', error);
  }
}