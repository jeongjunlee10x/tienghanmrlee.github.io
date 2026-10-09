# TIẾNG HÀN MR LEE - TÍCH HỢP ẢNH ĐẠI DIỆN - MỘT FILE CÀI ĐẶT
# Dùng PowerShell trên Windows, mở Terminal trong thư mục website rồi chạy:
# powershell -ExecutionPolicy Bypass -File .\CAI-ANH-DAI-DIEN.ps1
# Không thay logo / ảnh bìa; không thay cấu hình Firebase; có sao lưu HTML.
$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$login = Join-Path $root 'dang-nhap.html'
if (-not (Test-Path -LiteralPath $login)) {
  throw 'Khong tim thay dang-nhap.html. Hay mo Terminal ngay trong thu muc website.'
}
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Write-UTF8($path, $content) {
  [System.IO.File]::WriteAllText($path, $content, $utf8)
}
function Save-Backup($path) {
  $suffix = Get-Date -Format 'yyyyMMdd-HHmmss'
  $backup = "$path.bak-avatar-$suffix"
  Copy-Item -LiteralPath $path -Destination $backup -Force
  Write-Host "Da sao luu: $backup" -ForegroundColor DarkGray
}
$js = @'
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
'@
$css = @'
/* Ảnh đại diện học viên — chỉ tác động các thành phần mrlee-avatar */
.mrlee-avatar-box{margin:0 0 19px;padding:20px;border:1px solid #e0e8f0;border-radius:17px;background:linear-gradient(140deg,#f5f9ff,#fff)}
.mrlee-avatar-row{display:flex;align-items:center;gap:19px;flex-wrap:wrap}
.mrlee-avatar-frame{width:108px;height:108px;border-radius:50%;border:4px solid #fff;background:linear-gradient(140deg,#e5edf8,#cfdeed);box-shadow:0 5px 16px rgba(15,42,80,.13);overflow:hidden;display:flex;align-items:center;justify-content:center;flex:none}
.mrlee-avatar-frame img{width:100%;height:100%;object-fit:cover}
.mrlee-avatar-frame img[hidden],.mrlee-avatar-frame span[hidden]{display:none!important}
.mrlee-avatar-placeholder{font-size:52px;line-height:1}
.mrlee-avatar-side{flex:1;min-width:180px}
.mrlee-avatar-side h3{font-size:16px;color:#142b4c;margin:0 0 7px;font-weight:800}
.mrlee-avatar-side p{font-size:12px;color:#65758a;margin:0 0 12px;line-height:1.6}
.mrlee-avatar-buttons{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
.mrlee-avatar-upload{position:relative;display:inline-flex;align-items:center;gap:7px;justify-content:center;padding:10px 13px;border-radius:10px;background:#142b4c;color:#fff;cursor:pointer;font-size:12px;font-weight:800}
.mrlee-avatar-upload:hover{background:#284e7b}
.mrlee-avatar-upload:focus-within{outline:3px solid #ee8740;outline-offset:3px}
.mrlee-avatar-upload input{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden}
.mrlee-avatar-button{padding:10px 13px;border-radius:10px;font-size:12px;font-weight:800;line-height:1.5;border:1px solid #cad7e5;background:#fff;color:#173c62;cursor:pointer}
.mrlee-avatar-button:hover:not(:disabled){background:#edf4fc}
.mrlee-avatar-button:disabled,.mrlee-avatar-upload:has(input:disabled){opacity:.5;cursor:not-allowed}
.mrlee-avatar-message{margin:11px 0 0;font-size:12px;line-height:1.5;color:#0b7552}
.mrlee-avatar-message:empty{display:none}
.mrlee-avatar-message.is-error{color:#b22537}
.mrlee-avatar-dashboard{display:flex;align-items:center;gap:11px;flex:none}
.mrlee-avatar-dashboard .mrlee-avatar-frame{width:66px;height:66px;border-width:3px}
.mrlee-avatar-dashboard .mrlee-avatar-placeholder{font-size:31px}
.mrlee-avatar-dashboard a{font-size:12px;font-weight:800;color:#245781;text-decoration:underline}
@media(max-width:520px){.mrlee-avatar-box{padding:16px 12px}.mrlee-avatar-row{gap:13px}.mrlee-avatar-frame{width:85px;height:85px}.mrlee-avatar-placeholder{font-size:40px}.mrlee-avatar-buttons{gap:6px}.mrlee-avatar-upload,.mrlee-avatar-button{padding:9px 11px}}
'@
$accountUI = @'

<!-- MRLEE_AVATAR_ACCOUNT_BEGIN -->
<section class="mrlee-avatar-box" id="mrlee-avatar-box" aria-label="Ảnh đại diện học viên" hidden>
  <div class="mrlee-avatar-row">
    <div class="mrlee-avatar-frame"><img data-mrlee-avatar-img alt="Ảnh đại diện của bạn" hidden><span data-mrlee-avatar-placeholder class="mrlee-avatar-placeholder" aria-hidden="true">👤</span></div>
    <div class="mrlee-avatar-side">
      <h3>Ảnh đại diện của bạn</h3>
      <p>Chọn JPG, PNG hoặc WebP (tối đa 8 MB). Ảnh được tự động cắt vuông và thu nhỏ trước khi lưu.</p>
      <div class="mrlee-avatar-buttons">
        <label class="mrlee-avatar-upload">📷 Chọn ảnh <input id="mrlee-avatar-file" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Tải ảnh đại diện từ thiết bị"></label>
        <button type="button" class="mrlee-avatar-button" id="mrlee-avatar-save" disabled>Lưu ảnh đại diện</button>
        <button type="button" class="mrlee-avatar-button" id="mrlee-avatar-remove" disabled>Xóa ảnh</button>
      </div>
      <p class="mrlee-avatar-message" id="mrlee-avatar-message" role="status" aria-live="polite"></p>
    </div>
  </div>
</section>
<!-- MRLEE_AVATAR_ACCOUNT_END -->
'@
$dashboardUI = @'

<!-- MRLEE_AVATAR_DASHBOARD_BEGIN -->
<div class="mrlee-avatar-dashboard" id="mrlee-avatar-dashboard" hidden>
  <div class="mrlee-avatar-frame"><img data-mrlee-avatar-img alt="Ảnh đại diện học viên" hidden><span data-mrlee-avatar-placeholder class="mrlee-avatar-placeholder" aria-hidden="true">👤</span></div>
  <a href="dang-nhap.html" title="Thay ảnh đại diện trong thông tin học viên">Thay ảnh đại diện</a>
</div>
<!-- MRLEE_AVATAR_DASHBOARD_END -->
'@
$rulesSnippet = @'
// DÁN KHỐI NÀY VÀO BÊN TRONG match /users/{uid} { ... }
// Không dán ở ngoài service cloud.firestore.
// ===== MRLEE AVATAR RULES BEGIN =====
match /avatars/{avatarId} {
  // Học viên phải đăng nhập, xác minh email, và là chủ UID.
  allow get: if request.auth != null
    && request.auth.token.email_verified == true
    && request.auth.uid == uid
    && avatarId == 'profile';
  allow list: if false;
  allow create, update: if request.auth != null
    && request.auth.token.email_verified == true
    && request.auth.uid == uid
    && avatarId == 'profile'
    && request.resource.data.keys().hasOnly(['imageData', 'updatedAt'])
    && request.resource.data.keys().hasAll(['imageData', 'updatedAt'])
    && request.resource.data.imageData is string
    && request.resource.data.imageData.size() <= 145000
    && request.resource.data.imageData.matches('^data:image/jpeg;base64,[A-Za-z0-9+/=]+$')
    && request.resource.data.updatedAt == request.time;
  allow delete: if request.auth != null
    && request.auth.token.email_verified == true
    && request.auth.uid == uid
    && avatarId == 'profile';
}
// ===== MRLEE AVATAR RULES END =====
'@
Write-UTF8 (Join-Path $root 'mrlee-avatar.js') $js
Write-UTF8 (Join-Path $root 'mrlee-avatar.css') $css
Write-UTF8 (Join-Path $root 'FIRESTORE-QUY-TAC-ANH-DAI-DIEN.txt') $rulesSnippet

function Patch-HTML($path, $kind) {
  if (-not (Test-Path -LiteralPath $path)) { return }
  $text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
  $original = $text
  if ($text -notmatch 'href=["'']mrlee-avatar.css["'']') {
    if ($text -notmatch '(?i)</head>') { throw "Khong tim thay </head> trong $path" }
    $text = [regex]::Replace($text, '(?i)</head>', "  <link rel=`"stylesheet`" href=`"mrlee-avatar.css`">`r`n</head>", 1)
  }
  if ($kind -eq 'account' -and $text -notmatch 'id=["'']mrlee-avatar-box["'']') {
    if ($text -notmatch '(?i)id=["'']account-view["'']') { throw "Khong tim thay id=account-view trong $path" }
    $pattern = '(?i)(<div\s+class=["'']account-list["''][^>]*>)'
    if ($text -notmatch $pattern) { throw "Khong tim thay class=account-list trong $path" }
    $text = [regex]::Replace($text, $pattern, ($accountUI + '$1'))
  }
  if ($kind -eq 'dashboard' -and $text -notmatch 'id=["'']mrlee-avatar-dashboard["'']') {
    $pattern = '(?i)(<div\s+class=["'']intro["'']>)'
    if ($text -match $pattern) {
      $text = [regex]::Replace($text, $pattern, ('$1' + $dashboardUI))
    } else { Write-Warning "Khong tim thay vung intro; bo qua anh dai dien trang Trung tam." }
  }
  if ($text -notmatch 'src=["'']mrlee-avatar.js["'']') {
    if ($text -notmatch '(?i)</body>') { throw "Khong tim thay </body> trong $path" }
    $text = [regex]::Replace($text, '(?i)</body>', "<script type=`"module`" src=`"mrlee-avatar.js`"></script>`r`n</body>", 1)
  }
  if ($text -ne $original) {
    Save-Backup $path
    Write-UTF8 $path $text
    Write-Host "Da cap nhat: $path" -ForegroundColor Green
  } else { Write-Host "Da cai san, khong chen trung: $path" -ForegroundColor DarkGray }
}
Patch-HTML $login 'account'
Patch-HTML (Join-Path $root 'trung-tam-hoc-vien.html') 'dashboard'

# Tao ban Rules THAM KHAO (khong ghi de ban goc!)
# Can sao chep/doi chieu voi Rules DANG DUOC publish tren Firebase Console.
$rulesFile = Join-Path $root 'firestore.rules'
if (-not (Test-Path -LiteralPath $rulesFile)) {
  $rulesFile = Join-Path $root 'firestore-admin.rules'
}
if (Test-Path -LiteralPath $rulesFile) {
  $rules = [System.IO.File]::ReadAllText($rulesFile, [System.Text.Encoding]::UTF8)
  if ($rules -match 'MRLEE AVATAR RULES BEGIN') {
    Write-Host 'Quy tac avatar da co trong Rules nguon.' -ForegroundColor DarkGray
  } elseif ($rules -match 'match\s+/users/\{uid\}\s*\{') {
    $rules = [regex]::Replace($rules, '(match\s+/users/\{uid\}\s*\{)', ('$1' + "`r`n" + $rulesSnippet), 1)
    $output = Join-Path $root 'firestore-CO-ANH-DAI-DIEN.rules'
    Write-UTF8 $output $rules
    Write-Host "Da tao Rules de tham khao: $output" -ForegroundColor Yellow
  } else { Write-Warning 'Khong tim thay match /users/{uid} trong Rules. Hay ghep thu cong snippet.' }
}
Write-Host ''
Write-Host 'HOAN THANH BO CAI ANH DAI DIEN (GIAO DIEN + JAVASCRIPT).' -ForegroundColor Green
Write-Host 'BAT BUOC: Vao Firebase Console -> Firestore Database -> Rules.' -ForegroundColor Yellow
Write-Host 'Dan khoi trong FIRESTORE-QUY-TAC-ANH-DAI-DIEN.txt vao ben trong match /users/{uid}.' -ForegroundColor Yellow
Write-Host 'Neu da tao firestore-CO-ANH-DAI-DIEN.rules, kiem tra va dung de so sanh.' -ForegroundColor Yellow
Write-Host 'Chon Publish. Neu khong publish Rules, nut Luu anh se bi permission-denied.' -ForegroundColor Yellow
Write-Host 'Sau khi thu local, git add dang-nhap.html trung-tam-hoc-vien.html mrlee-avatar.js mrlee-avatar.css' -ForegroundColor Cyan
