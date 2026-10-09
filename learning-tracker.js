/**
 * Tiếng Hàn Mr Lee — theo dõi lịch sử học tập & điểm LUYỆN TẬP.
 * Dữ liệu ghi tại /users/{uid}/learningEvents và /practiceAttempts.
 * Không lưu họ tên/ngày sinh và KHÔNG dùng điểm từ client để xếp hạng chính thức.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, reload } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const page = location.pathname.split('/').pop().toLowerCase();
const TRACKED_PAGES = new Map([
  ['bai-hoc.html', 'Danh mục bài học'],
  ['so-cap-1.html', 'Giáo trình Sơ cấp 1'],
  ['so-cap-2.html', 'Giáo trình Sơ cấp 2'],
  ['bo-sach.html', 'Bộ sách Tiếng Hàn'],
  ['de-thi-topik.html', 'Bộ đề TOPIK'],
  ['thi-topik-online.html', 'Thi TOPIK Online'],
  ['kiem-tra-dau-vao.html', 'Kiểm tra đầu vào'],
  ['kiem-tra-online.html', 'Kiểm tra Online'],
  ['on-luyen-phong-van.html', 'Ôn luyện phỏng vấn'],
  ['giao-tiep-theo-chu-de.html', 'Giao tiếp theo chủ đề'],
  ['noi-dung-bao-mat.html', 'Bài học riêng'],
  ['so-tay-rieng.html', 'Sổ tay học tập']
]);

const app = isFirebaseConfigured ? (getApps().length ? getApps()[0] : initializeApp(firebaseConfig)) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Khóa xác thực được kiểm tra lại; Rules phía server vẫn luôn quyết định quyền ghi.
const verifiedUser = auth ? new Promise(resolve => {
  const stop = onAuthStateChanged(auth, async user => {
    stop();
    if (!user) return resolve(null);
    try {
      await reload(user);
      if (!auth.currentUser?.emailVerified) return resolve(null);
      const token = await auth.currentUser.getIdTokenResult(true);
      resolve(token.claims.email_verified === true ? auth.currentUser : null);
    } catch (error) { console.warn('Không thể xác minh tài khoản để lưu học tập', error); resolve(null); }
  }, error => { console.warn('Firebase Auth', error); resolve(null); });
}) : Promise.resolve(null);

const clean = (text, max = 110) => String(text ?? '').trim().slice(0, max);
const recentlySaved = new Map();

async function recordEvent(kind, title, detail = '') {
  if (!TRACKED_PAGES.has(page)) return;
  if (!['visit', 'lesson', 'topic', 'practice'].includes(kind)) return;
  title = clean(title, 110);
  detail = clean(detail, 110);
  if (!title) return;
  const key = `${kind}|${page}|${title}|${detail}`;
  const last = recentlySaved.get(key) || 0;
  if (Date.now() - last < 20000) return;
  recentlySaved.set(key, Date.now());
  try {
    const user = await verifiedUser;
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'learningEvents'), {
      kind, page, title, detail, createdAt: serverTimestamp()
    });
  } catch (error) {
    console.warn('Chưa ghi được lịch sử học tập:', error.code || error.message);
    recentlySaved.delete(key);
  }
}

function saveFeedback(message, isError = false) {
  const box = document.getElementById('results') || document.getElementById('result-box');
  if (!box) return;
  let output = document.getElementById('mrlee-save-status');
  if (!output) {
    output = document.createElement('div');
    output.id = 'mrlee-save-status';
    output.setAttribute('role', 'status');
    output.style.cssText = 'margin:18px 0;padding:12px 14px;border-radius:12px;border:1px solid #d4e2ee;background:#f4f8fc;color:#17365c;font-size:14px;line-height:1.65;';
    box.appendChild(output);
  }
  output.replaceChildren();
  output.textContent = message;
  if (isError) {
    output.style.borderColor = '#efb6b2';
    output.style.color = '#9d2820';
  } else {
    output.style.borderColor = '#b8dfce';
    output.style.color = '#146044';
  }
  if (!isError && message.startsWith('Đã lưu')) {
    const a = document.createElement('a');
    a.href = 'lich-su-hoc-tap.html';
    a.textContent = ' Xem lịch sử học tập →';
    a.style.cssText = 'color:inherit;font-weight:700;display:inline-block;margin-left:6px;';
    output.append(a);
  }
}

window.addEventListener('mrlee:practice-finished', async event => {
  const data = event.detail || {};
  // mrlee-review-v1: optional snapshot for a saved practice attempt.
  // Older quizzes can continue saving scores with no review details.
  let reviewJson = '';
  if (Array.isArray(data.review) && data.review.length >= 1 && data.review.length <= 100) {
    const questions = data.review.map(q => ({
      question:String(q.question??'').slice(0,500),
      choices:Array.isArray(q.choices)?q.choices.slice(0,8).map(v=>String(v).slice(0,300)):[],
      selectedIndex:Number(q.selectedIndex),
      correctIndex:Number(q.correctIndex),
      explanation:String(q.explanation??'').slice(0,700),
      lessonNumber:Number.isInteger(q.lessonNumber)?q.lessonNumber:null,
      type:String(q.type??'').slice(0,60)
    }));
    const valid = questions.every(q=>q.question && q.choices.length>=2 && q.choices.length<=8
      && Number.isInteger(q.correctIndex) && q.correctIndex>=0 && q.correctIndex<q.choices.length
      && Number.isInteger(q.selectedIndex) && q.selectedIndex>=-1 && q.selectedIndex<q.choices.length);
    if (valid) {
      const serialized=JSON.stringify({version:1,questions});
      if (serialized.length<=120000) reviewJson=serialized;
    }
  }
  const score = data.score, total = data.total;
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || total > 100 || score < 0 || score > total) return;
  const examId = clean(data.examId, 60).toLowerCase();
  const examTitle = clean(data.examTitle, 110);
  const level = clean(data.level, 20).toLowerCase();
  const durationSeconds = Number.isInteger(data.durationSeconds)
    ? Math.max(0, Math.min(7200, data.durationSeconds)) : 0;
  if (!/^[a-z0-9-]+$/.test(examId) || !examTitle || !['sc1', 'sc2', 'tc1', 'general'].includes(level)) return;
  saveFeedback('Đang lưu điểm luyện tập vào tài khoản...');
  try {
    const user = await verifiedUser;
    if (!user) throw new Error('Bạn cần đăng nhập và xác minh email để lưu điểm.');
    await addDoc(collection(db, 'users', user.uid, 'practiceAttempts'), {
      examId, examTitle, level, score, total, durationSeconds,
      source: 'client_practice', createdAt: serverTimestamp(),
      ...(reviewJson ? {reviewJson} : {})
    });
    saveFeedback('Đã lưu điểm luyện tập vào tài khoản.');
  } catch (error) {
    console.warn('Không lưu được điểm luyện tập:', error);
    saveFeedback('Chưa lưu được điểm lên Firebase. Hãy kiểm tra Internet, đăng nhập và Firestore Rules, rồi làm bài lại.', true);
  }
});

// Ghi nhận mở trang một lần khi truy cập; không ghi nhận thông tin nhận dạng.
if (TRACKED_PAGES.has(page)) recordEvent('visit', TRACKED_PAGES.get(page));

// Khi xem các bài Sơ cấp 1/2 qua #bai-1 ... #bai-15, ghi nhận từng bài.
function captureLessonHash() {
  const match = /^#bai-(\d{1,2})$/.exec(location.hash);
  if (!match || !['so-cap-1.html', 'so-cap-2.html'].includes(page)) return;
  const n = Number(match[1]);
  if (n < 1 || n > 15) return;
  const level = page === 'so-cap-1.html' ? 'Sơ cấp 1' : 'Sơ cấp 2';
  const article = document.getElementById('bai-' + n);
  const title = clean(article?.querySelector('h2,h3')?.textContent || `Bài ${n}`, 110);
  recordEvent('lesson', `${level} · Bài ${n}`, title);
}
window.addEventListener('hashchange', captureLessonHash);
if (location.hash) captureLessonHash();

// Tương tác học tập có chủ đích (không tự suy diễn học xong khi chỉ mở trang).
document.addEventListener('click', e => {
  const btn = e.target.closest?.('button');
  if (!btn) return;
  if (page === 'on-luyen-phong-van.html' && btn.id === 'markBtn') {
    const q = clean(document.getElementById('questionKo')?.textContent, 100);
    if (q) recordEvent('practice', 'Luyện câu hỏi phỏng vấn', q);
  }
  if (page === 'giao-tiep-theo-chu-de.html' && btn.dataset.action === 'learned') {
    const sentence = clean(btn.closest('.phrase-card')?.querySelector('.ko')?.textContent, 100);
    if (sentence) recordEvent('practice', 'Ôn câu giao tiếp', sentence);
  }
});
