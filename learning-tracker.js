/**
 * Tiếng Hàn Mr Lee — theo dõi lịch sử học tập & điểm LUYỆN TẬP.
 * Dữ liệu ghi tại /users/{uid}/learningEvents và /practiceAttempts.
 * Không lưu họ tên/ngày sinh và KHÔNG dùng điểm từ client để xếp hạng chính thức.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, reload } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, addDoc, collection, doc, setDoc, getDocFromServer, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
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

// Đọc người dùng tại thời điểm lưu, KHÔNG cố định kết quả đăng nhập lúc mở trang.
// Nếu người dùng đăng nhập sau khi JS tải, lần nộp bài tiếp theo vẫn lưu được.
async function currentVerifiedUser() {
  if (!auth) return null;
  // Firebase Auth v12: xác nhận trạng thái đăng nhập đầu tiên đã được khôi phục.
  await auth.authStateReady();
  const user=auth.currentUser;
  if (!user) return null;
  if (!user.emailVerified) await reload(user);
  if (!user.emailVerified) return null;
  const token=await user.getIdTokenResult(true);
  if (token.claims.email_verified !== true || auth.currentUser?.uid !== user.uid) return null;
  return user;
}
function saveFailureMessage(error) {
  const code=String(error?.code||'').split('/').pop().slice(0,45);
  if (code==='permission-denied') return 'Firebase từ chối quyền lưu lịch sử luyện tập (permission-denied). Hãy kiểm tra tài khoản đã xác minh email và Firestore Rules. Bài đã làm vẫn được giữ trên thiết bị; điểm Spark được xử lý riêng.';
  if (code==='unavailable' || code==='deadline-exceeded') return 'Không kết nối được Firestore ('+code+'). Kết quả Workbook vẫn lưu trên thiết bị; kiểm tra mạng trước khi thử đồng bộ lịch sử.';
  if (code==='resource-exhausted') return 'Firebase đang giới hạn lượt ghi (resource-exhausted). Không nên làm bài lại liên tục; điểm Spark được xử lý riêng.';
  if (code==='invalid-argument') return 'Firebase từ chối định dạng bài làm (invalid-argument). Cần kiểm tra nội dung và báo quản trị; kết quả ở thiết bị vẫn còn.';
  if (error?.message==='Bạn cần đăng nhập và xác minh email để lưu điểm.') return error.message+' Kết quả Workbook đã lưu trên thiết bị; điểm Spark được xử lý riêng.';
  return 'Không lưu được lịch sử bài tập vào Firebase'+(code?' ('+code+')':'')+'. Kết quả Workbook vẫn lưu trên thiết bị. Việc cộng điểm Spark có trạng thái riêng ở phần kết quả bài.';
}

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
    const user = await currentVerifiedUser();
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'learningEvents'), {
      kind, page, title, detail, createdAt: serverTimestamp()
    });
  } catch (error) {
    console.warn('Chưa ghi được lịch sử học tập:', error.code || error.message);
    recentlySaved.delete(key);
  }
}

function saveFeedback(message, isError = false, onRetry = null) {
  const box = document.getElementById('results') || document.getElementById('result-box') || document.getElementById('workGame') || document.getElementById('v11App') || document.getElementById('v10-room') || document.getElementById('v10-app');
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
  if (isError && typeof onRetry === 'function') {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = '↻ Thử lưu lại bài vừa làm';
    retry.setAttribute('aria-label', 'Thử lưu lại lịch sử bài tập vừa làm mà không cần trả lời lại');
    retry.style.cssText = 'display:inline-block;margin:10px 0 0 8px;padding:9px 14px;border:1px solid currentColor;border-radius:10px;color:inherit;background:#fff;cursor:pointer;font:inherit;font-weight:700;';
    retry.addEventListener('click', () => {retry.disabled = true;void onRetry();}, {once:true});
    output.appendChild(retry);
  }
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
  if (Array.isArray(data.review) && data.review.length >= 1 && data.review.length <= 120) {
    const questions = data.review.map(q => ({
      question:String(q.question??'').slice(0,500),
      choices:Array.isArray(q.choices)?q.choices.slice(0,8).map(v=>String(v).slice(0,300)):[],
      selectedIndex:Number(q.selectedIndex),
      correctIndex:Number(q.correctIndex),
      explanation:String(q.explanation??'').slice(0,700),
      answerText: q.type === 'writing' ? String(q.answerText??'').slice(0,5000) : undefined,
      lessonNumber:Number.isInteger(q.lessonNumber)?q.lessonNumber:null,
      type:String(q.type??'').slice(0,60)
    }));
    const valid = questions.every(q=>q.question && (q.type === 'writing' ? q.choices.length===0 : q.choices.length>=2 && q.choices.length<=8)
      && (q.type === 'writing'
         ? q.correctIndex === -1 && q.selectedIndex === -1 && typeof q.answerText === 'string'
         : (Number.isInteger(q.correctIndex) && q.correctIndex>=0 && q.correctIndex<q.choices.length
            && Number.isInteger(q.selectedIndex) && q.selectedIndex>=-1 && q.selectedIndex<q.choices.length)));
    if (valid) {
      const serialized=JSON.stringify({version:1,questions});
      if (new TextEncoder().encode(serialized).length<=112000) reviewJson=serialized;
    }
  }
  const score = data.score, total = data.total;
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || total > 100 || score < 0 || score > total) return;
  const examId = clean(data.examId, 60).toLowerCase();
  const examTitle = clean(data.examTitle, 110);
  const level = clean(data.level, 20).toLowerCase();
  const durationSeconds = Number.isInteger(data.durationSeconds)
    ? Math.max(0, Math.min(7200, data.durationSeconds)) : 0;
  if (!/^[a-z0-9-]+$/.test(examId) || !examTitle || !['sc1', 'sc2', 'sc3', 'sc4', 'sc5', 'sc6', 'tc1', 'general'].includes(level)) return;
  // Giữ một ID ổn định cho lượt làm này: thử lại không tạo nhiều bản ghi.
  // Không lưu thông tin nhạy cảm trong localStorage.
  let attemptRef = null, attemptUid = '';
  async function saveThisAttempt() {
    saveFeedback('Đang lưu lịch sử và bài làm chi tiết vào tài khoản...');
    try {
      const user = await currentVerifiedUser();
      if (!user) throw new Error('Bạn cần đăng nhập và xác minh email để lưu điểm.');
      if (attemptUid && attemptUid !== user.uid) throw new Error('Đã đổi tài khoản; không thể chuyển bài làm sang tài khoản khác.');
      if (!attemptRef) {
        attemptRef = doc(collection(db, 'users', user.uid, 'practiceAttempts'));
        attemptUid = user.uid;
      }
      await setDoc(attemptRef, {
        examId, examTitle, level, score, total, durationSeconds,
        source: 'client_practice', createdAt: serverTimestamp(),
        ...(reviewJson ? {reviewJson} : {})
      });
      saveFeedback(reviewJson || !Array.isArray(data.review)
        ? 'Đã lưu lịch sử luyện tập và kết quả bài làm lên Firebase.'
        : 'Đã lưu kết quả, nhưng chưa thể đồng bộ đáp án chi tiết vì dữ liệu quá lớn.');
    } catch (error) {
      console.warn('Không lưu được lịch sử luyện tập:', error?.code || error?.message);
      // If the server wrote the fixed-ID attempt but acknowledgement was lost,
      // verify the exact document remotely before suggesting any retry.
      if (attemptRef && error?.code === 'permission-denied') {
        try {
          const verified = await getDocFromServer(attemptRef);
          if (verified.exists()) {
            saveFeedback('Đã xác nhận Firebase đã lưu bài làm này. Không cần nộp lại.');
            return;
          }
        } catch (_) { /* History read may also be offline/denied. */ }
      }
      saveFeedback(saveFailureMessage(error), true, saveThisAttempt);
    }
  }
  await saveThisAttempt();
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
