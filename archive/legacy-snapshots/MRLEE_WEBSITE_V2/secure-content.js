/** Tải bài học riêng từ Firestore. Không dùng innerHTML với dữ liệu người dùng. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
const $ = id => document.getElementById(id);
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let user = null;
onAuthStateChanged(auth, u => { user = u?.emailVerified ? u : null; });
$('load').addEventListener('click', async () => {
  $('error').textContent='';
  $('lesson').style.display='none';
  const id = $('lessonId').value.trim();
  if (!/^[a-z0-9_-]{3,50}$/i.test(id)) { $('error').textContent='Mã bài học không hợp lệ.'; return; }
  if (!user) { $('error').textContent='Vui lòng đăng nhập và xác minh email.'; return; }
  $('load').disabled=true;
  $('status').textContent='Đang kiểm tra quyền truy cập...';
  try {
    await user.getIdToken(true);
    const snapshot = await getDoc(doc(db, 'secureLessons', id));
    if (!snapshot.exists()) { $('error').textContent='Không tìm thấy bài học.'; return; }
    const d = snapshot.data();
    $('title').textContent=String(d.title || id);
    $('level').textContent=String(d.level || '');
    $('vi').textContent=String(d.contentVi || 'Chưa có nội dung');
    $('ko').textContent=String(d.contentKo || '아직 내용이 없습니다.');
    $('lesson').style.display='block';
  } catch(e) { console.warn(e); $('error').textContent='Không truy cập được bài học. Hãy kiểm tra Firestore Rules và quyền tài khoản.'; }
  finally { $('load').disabled=false; $('status').textContent=''; }
});
