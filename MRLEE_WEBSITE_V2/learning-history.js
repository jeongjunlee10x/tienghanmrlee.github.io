import { createReviewAction } from './mrlee-history-review.js';
/** Trang lịch sử của CHÍNH học viên; quyền đọc do Firestore Rules kiểm tra theo UID. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, reload } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const $ = id => document.getElementById(id);
const LIMIT_ATTEMPTS = 60;
const LIMIT_EVENTS = 100;
let attempts = [], events = [];
let currentUser = null;
let loading = false;

function status(message, error = false) {
  $('pageStatus').textContent = message;
  $('pageStatus').classList.toggle('error', error);
}
function humanDate(timestamp) {
  try { return timestamp?.toDate()?.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) || 'Đang đồng bộ'; }
  catch { return 'Không rõ'; }
}
function labelLevel(level) {
  return ({sc1: 'Sơ cấp 1', sc2: 'Sơ cấp 2', tc1: 'Trung cấp 1', general: 'Tổng hợp'})[level] || 'Khác';
}
function eventType(kind) {
  return ({visit: 'Mở trang', lesson: 'Xem bài', topic: 'Chọn chủ đề', practice: 'Luyện tập'})[kind] || 'Hoạt động';
}
function emptyBox(text) {
  const p = document.createElement('p');
  p.className = 'empty';
  p.textContent = text;
  return p;
}
function cell(text, cls = '') {
  const span = document.createElement('span');
  span.className = cls;
  span.textContent = String(text);
  return span;
}
function render() {
  const level = $('levelFilter').value;
  const view = attempts.filter(x => level === 'all' || x.level === level);
  $('countAttempts').textContent = view.length;
  $('countActivities').textContent = events.length;
  $('countTests').textContent = new Set(view.map(x => x.examId)).size;
  const best = view.length ? Math.max(...view.map(x => Math.round(x.score / x.total * 100))) : 0;
  $('bestScore').textContent = view.length ? `${best}%` : '—';
  const list = $('attemptList');
  list.replaceChildren();
  if (!view.length) list.append(emptyBox('Chưa có điểm luyện tập ở trình độ này. Hãy làm một bài kiểm tra để lưu điểm.'));
  for (const item of view) {
    const row = document.createElement('article');
    row.className = 'history-row';
    const info = document.createElement('div');
    info.append(cell(item.examTitle, 'entry-title'), cell(`${labelLevel(item.level)} · ${humanDate(item.createdAt)}`, 'entry-meta'));
    const grade = document.createElement('div');
    grade.className = 'grade';
    grade.append(cell(`${item.score}/${item.total}`, 'grade-big'), cell(`${Math.round(item.score / item.total * 100)}%`, 'grade-small'));
    row.append(info, grade);
    createReviewAction(row, item); // mrlee-review-v1
    list.append(row);
  }
  const activity = $('activityList');
  activity.replaceChildren();
  if (!events.length) activity.append(emptyBox('Chưa có lịch sử học tập. Hãy mở bài học hoặc luyện giao tiếp.'));
  for (const item of events) {
    const row = document.createElement('article');
    row.className = 'history-row';
    const info = document.createElement('div');
    info.append(cell(item.title, 'entry-title'), cell(`${eventType(item.kind)} · ${humanDate(item.createdAt)}`, 'entry-meta'));
    if (item.detail) info.append(cell(item.detail, 'entry-sub'));
    const label = cell(eventType(item.kind), 'tag');
    row.append(info, label);
    activity.append(row);
  }
}

async function refresh() {
  if (!currentUser || loading) return;
  loading = true;
  $('reloadBtn').disabled = true;
  status('Đang tải dữ liệu Firestore của bạn...');
  try {
    await currentUser.getIdToken(true);
    const db = getFirestore(getApps()[0]);
    const uid = currentUser.uid;
    const [a, e] = await Promise.all([
      getDocs(query(collection(db, 'users', uid, 'practiceAttempts'), orderBy('createdAt', 'desc'), limit(LIMIT_ATTEMPTS))),
      getDocs(query(collection(db, 'users', uid, 'learningEvents'), orderBy('createdAt', 'desc'), limit(LIMIT_EVENTS)))
    ]);
    attempts = a.docs.map(d => d.data()).filter(x => Number.isInteger(x.score) && Number.isInteger(x.total) && x.total > 0);
    events = e.docs.map(d => d.data());
    render();
    status(`Đã đồng bộ ${attempts.length} kết quả và ${events.length} hoạt động gần nhất.`);
  } catch (error) {
    console.warn('Không đọc được lịch sử học tập:', error);
    status(`Không tải được lịch sử (${error.code || 'lỗi kết nối'}). Kiểm tra Firestore Rules, đăng nhập và Internet.`, true);
  } finally {
    loading = false;
    $('reloadBtn').disabled = false;
  }
}

$('levelFilter').addEventListener('change', render);
$('reloadBtn').addEventListener('click', refresh);

if (!isFirebaseConfigured) {
  status('Chưa cấu hình Firebase. Kiểm tra file firebase-config.js.', true);
} else {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  onAuthStateChanged(auth, async user => {
    if (!user) {
      status('Bạn cần đăng nhập để xem lịch sử. Đang mở trang đăng nhập...');
      location.replace('dang-nhap.html?next=lich-su-hoc-tap.html');
      return;
    }
    try {
      await reload(user);
      const latest = auth.currentUser;
      if (!latest?.emailVerified || (await latest.getIdTokenResult(true)).claims.email_verified !== true) {
        location.replace('dang-nhap.html?next=lich-su-hoc-tap.html');
        return;
      }
      currentUser = latest;
      $('studentEmail').textContent = latest.email || 'Học viên';
      await refresh();
    } catch (error) {
      console.warn(error);
      status('Không xác minh được phiên đăng nhập. Hãy đăng nhập lại.', true);
    }
  }, error => { console.warn(error); status('Không kết nối được Firebase Authentication.', true); });
}
