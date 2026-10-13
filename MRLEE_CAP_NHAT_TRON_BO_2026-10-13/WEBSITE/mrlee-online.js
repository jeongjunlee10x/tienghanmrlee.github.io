// MR.LEE - kiểm tra Online: giao diện dùng API chấm điểm phía máy chủ.
// Không nhập mrlee-online-bank.js vào trình duyệt.
import { LEVELS } from './mrlee-online-catalog.js';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, reload } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const $ = id => document.getElementById(id);
const LETTERS = ['A', 'B', 'C', 'D'];
const TITLE = { sc1: 'Sơ cấp 1', sc2: 'Sơ cấp 2' };
const DURATION_SECONDS = 15 * 60;
let selectedLevel = 'sc1';
try { if (localStorage.getItem('mrlee-online-level') === 'sc2') selectedLevel = 'sc2'; } catch {}
const deepLink = new URLSearchParams(location.search);
if (['sc1', 'sc2'].includes(deepLink.get('level'))) selectedLevel = deepLink.get('level');
let activeBatch = -1;
let examItems = [];
let responses = [];
let ticket = null;
let deadline = 0;
let interval = null;
let completed = false;
let submitting = false;
let starting = false;

function safe(str) { return String(str).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch])); }
function show(id) {
  for (const view of ['select-view', 'exam-view', 'result-box']) $(view).classList.toggle('hidden', view !== id);
  window.scrollTo(0, 0);
}
function notify(message) {
  let el = document.getElementById('mrlee-quiz-alert');
  if (!el) {
    el = document.createElement('p');
    el.id = 'mrlee-quiz-alert';
    el.setAttribute('role', 'alert');
    el.style.cssText = 'padding:12px 15px;margin:15px 0;border:1px solid #f0c1bb;border-radius:10px;background:#fff6f4;color:#962b22;font-weight:600;line-height:1.6';
    $('main')?.prepend(el);
    if (!el.parentNode) document.body.prepend(el);
  }
  el.textContent = message;
  el.hidden = !message;
}
function getBatch(level, i) {
  const from = i * 2;
  const selected = LEVELS[level].slice(from, from + 2);
  return { number: i + 1, lessons: selected, range: selected.length === 1 ? 'Bài 15' : `Bài ${from + 1}–${from + 2}` };
}
function makeBatches() {
  const list = $('test-list'); list.replaceChildren();
  $('level-title').textContent = `Các lần kiểm tra – ${TITLE[selectedLevel]}`;
  document.querySelectorAll('[data-level]').forEach(el => {
    const active = el.dataset.level === selectedLevel;
    el.classList.toggle('is-active', active);
    el.setAttribute('aria-pressed', String(active));
  });
  for (let i = 0; i < 8; i++) {
    const batch = getBatch(selectedLevel, i);
    const card = document.createElement('article'); card.className = 'test-card';
    const lessons = batch.lessons.map((lesson, j) => `Bài ${i * 2 + j + 1}: <span lang="ko">${safe(lesson.ko)}</span> – ${safe(lesson.title)}`).join('<br>');
    card.innerHTML = `<div class="test-card-head"><span class="test-index">KIỂM TRA LẦN ${batch.number}</span><span class="lesson-range">${batch.range}</span></div><div><h3>${safe(TITLE[selectedLevel])} · ${batch.range}</h3><p>${lessons}</p></div><div class="test-meta"><span>10 câu trắc nghiệm</span><span>15 phút</span><span>Chấm điểm máy chủ</span></div><button type="button" class="start-btn" data-batch="${i}">Bắt đầu kiểm tra →</button>`;
    list.append(card);
  }
}
async function firebaseToken() {
  if (!isFirebaseConfigured) throw new Error('Firebase chưa được cấu hình.');
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error('Bạn cần đăng nhập trước khi làm bài.');
  await reload(user);
  if (!auth.currentUser?.emailVerified) throw new Error('Vui lòng xác minh email trước khi làm bài.');
  return auth.currentUser.getIdToken(true);
}
async function quizApi(body) {
  const bearer = await firebaseToken();
  const response = await fetch('./api/mrlee-online', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${bearer}` },
    body: JSON.stringify(body),
    cache: 'no-store',
    credentials: 'same-origin'
  });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error('API chưa sẵn sàng trên Cloudflare. Không chuyển bài sang GitHub Pages cũ.');
  const data = await response.json();
  if (!response.ok) {
    const explanation = {
      'firebase-sign-in-required-or-unverified': 'Phiên đăng nhập hoặc xác minh email chưa hợp lệ. Hãy đăng nhập lại.',
      'quiz-api-not-configured': 'Cloudflare chưa có QUIZ_SIGNING_SECRET.',
      'attempt-expired-or-invalid': 'Phiên thi đã hết hạn. Hãy trở lại danh sách và làm lại.',
      'invalid-answers': 'Dữ liệu câu trả lời không hợp lệ.'
    }[data.error] || `Máy chủ báo lỗi: ${String(data.error || response.status).slice(0, 100)}`;
    throw new Error(explanation);
  }
  return data;
}
function formatTime(sec) { return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; }
function updateProgress() {
  const count = responses.filter(x => x !== null).length;
  $('answered-count').textContent = `${count}/${examItems.length}`;
  $('completion-bar').style.width = `${examItems.length ? count / examItems.length * 100 : 0}%`;
}
function renderQuestions() {
  const container = $('questions'); container.replaceChildren();
  for (let i = 0; i < examItems.length; i++) {
    const q = examItems[i];
    const card = document.createElement('article'); card.className = 'question-card';
    const top = document.createElement('div'); top.className = 'question-top';
    top.innerHTML = `<span>CÂU ${i + 1}/${examItems.length} · BÀI ${q.lessonNumber}</span><span class="kind">${safe(q.type)}</span>`;
    const h = document.createElement('h3'); h.textContent = q.text;
    card.append(top, h);
    q.choices.forEach((choice, j) => {
      const label = document.createElement('label'); label.className = 'answer-choice';
      const input = document.createElement('input'); input.type = 'radio'; input.name = `answer-${i}`; input.value = String(j);
      input.checked = responses[i] === j;
      input.addEventListener('change', () => { responses[i] = j; updateProgress(); });
      const letter = document.createElement('span'); letter.className = 'choice-letter'; letter.textContent = (LETTERS[j] || String(j + 1)) + '.';
      const text = document.createElement('span'); text.textContent = choice.label;
      label.append(input, letter, text); card.append(label);
    });
    container.append(card);
  }
  updateProgress();
}
function tick() {
  if (completed || activeBatch < 0 || submitting) return;
  const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  $('timer').textContent = formatTime(remaining);
  if (remaining <= 0) void finish(true);
}
async function startBatch(index) {
  if (index < 0 || index > 7 || starting || submitting) return;
  starting = true;
  notify('');
  document.querySelectorAll('.start-btn').forEach(el => { el.disabled = true; });
  try {
    const level = selectedLevel;
    const data = await quizApi({ action: 'start', level, batch: index });
    if (typeof data.ticket !== 'string' || !Array.isArray(data.questions) || data.questions.length < 1 || data.questions.length > 10 ||
        !data.questions.every(q => Array.isArray(q.options) && q.options.length >= 2 && q.options.length <= 8)) {
      throw new Error('Máy chủ trả về đề thi không hợp lệ.');
    }
    clearInterval(interval);
    activeBatch = index;
    ticket = data.ticket;
    examItems = data.questions.map(q => ({
      lessonNumber: q.lessonNumber, lessonTitle: q.lessonTitle,
      type: q.type, text: q.text,
      choices: q.options.map(label => ({ label }))
    }));
    responses = Array(examItems.length).fill(null);
    completed = false;
    deadline = Date.now() + Math.min(DURATION_SECONDS, Number(data.durationSeconds) || DURATION_SECONDS) * 1000;
    const batch = getBatch(level, index);
    $('exam-title').textContent = `Kiểm tra lần ${batch.number} · ${TITLE[level]} · ${batch.range}`;
    $('exam-subtitle').textContent = 'Chọn một đáp án cho mỗi câu. Bạn có 15 phút để hoàn thành.';
    renderQuestions();
    $('timer').textContent = '15:00';
    show('exam-view');
    interval = setInterval(tick, 1000);
  } catch (error) { notify(`Không thể bắt đầu bài kiểm tra: ${error.message}`); }
  finally {
    starting = false;
    document.querySelectorAll('.start-btn').forEach(el => { el.disabled = false; });
  }
}
function goToList() {
  if (submitting) return;
  if (!completed && activeBatch >= 0 && !confirm('Bạn đang làm bài. Thoát sẽ mất các lựa chọn chưa nộp. Bạn có chắc không?')) return;
  clearInterval(interval); completed = true; activeBatch = -1; ticket = null;
  notify(''); show('select-view');
}
function renderResults(data, expired) {
  const { score, total, review } = data;
  const batch = getBatch(selectedLevel, activeBatch);
  $('result-title').textContent = `Hoàn thành Kiểm tra lần ${batch.number} · ${TITLE[selectedLevel]}`;
  $('result-description').textContent = (expired ? 'Đã hết thời gian làm bài. ' : '') +
    (score === total ? 'Bạn làm đúng tất cả! Hãy duy trì phong độ.' : score >= 7 ? 'Kết quả tốt! Hãy ôn lại những câu còn sai.' : 'Bạn nên ôn lại từ vựng và ngữ pháp của các bài này trước khi làm lại.');
  $('result-score').textContent = `${score}/${total}`;
  $('result-percent').textContent = `${Math.round(score * 100 / total)}%`;
  const durationSeconds = Math.max(0, Math.min(900, Number(data.durationSeconds) || 0));
  $('result-duration').textContent = `${Math.floor(durationSeconds / 60)} phút ${durationSeconds % 60} giây`;
  const grouped = new Map();
  review.forEach(q => {
    if (!grouped.has(q.lessonNumber)) grouped.set(q.lessonNumber, { total: 0, score: 0 });
    const g = grouped.get(q.lessonNumber); g.total++;
    if (q.selectedIndex === q.correctIndex) g.score++;
  });
  $('lesson-breakdown').replaceChildren();
  [...grouped.entries()].sort((a, b) => a[0] - b[0]).forEach(([lesson, summary]) => {
    const tag = document.createElement('span'); tag.textContent = `Bài ${lesson}: ${summary.score}/${summary.total} câu đúng`;
    $('lesson-breakdown').append(tag);
  });
  $('review-toggle').setAttribute('aria-expanded', 'false'); $('review-toggle').textContent = 'Xem đáp án và giải thích';
  $('answer-review').classList.add('hidden'); $('answer-review').replaceChildren();
  review.forEach((q, i) => {
    const ok = q.selectedIndex === q.correctIndex;
    const card = document.createElement('article'); card.className = 'review-card' + (ok ? ' ok' : '');
    const stat = document.createElement('strong');
    stat.textContent = `Câu ${i + 1} · Bài ${q.lessonNumber} · ${ok ? 'ĐÚNG' : q.selectedIndex === null ? 'CHƯA TRẢ LỜI' : 'SAI'}`;
    const title = document.createElement('h3'); title.textContent = q.question;
    const picked = document.createElement('p'); picked.textContent = `Bạn chọn: ${q.selectedIndex === null ? 'Chưa trả lời' : q.choices[q.selectedIndex]}`;
    const right = document.createElement('p'); right.textContent = `Đáp án đúng: ${q.choices[q.correctIndex]}`;
    const note = document.createElement('p'); note.className = 'note'; note.textContent = `Giải thích: ${q.explanation}`;
    card.append(stat, title, picked, right, note); $('answer-review').append(card);
  });
  $('next-btn').classList.toggle('hidden', activeBatch === 7);
  show('result-box');
  // learning-tracker.js: đây vẫn là điểm luyện tập do client gửi, không phải điểm xếp hạng được server chứng thực.
  window.dispatchEvent(new CustomEvent('mrlee:practice-finished', { detail: {
    examId: `online-${selectedLevel}-lan-${batch.number}`,
    examTitle: `Kiểm tra lần ${batch.number} · ${TITLE[selectedLevel]} · ${batch.range}`,
    level: selectedLevel, score, total, durationSeconds,
    review: review.map(q => ({
      question: String(q.question ?? '').slice(0, 500),
      choices: q.choices.map(c => String(c ?? '').slice(0, 300)),
      selectedIndex: Number.isInteger(q.selectedIndex) ? q.selectedIndex : -1,
      correctIndex: q.correctIndex,
      explanation: String(q.explanation ?? '').slice(0, 700),
      lessonNumber: q.lessonNumber, type: String(q.type ?? '').slice(0, 60)
    }))
  } }));
}
async function finish(expired = false) {
  if (completed || activeBatch < 0 || submitting || !ticket) return;
  const unanswered = responses.filter(v => v === null).length;
  if (!expired && unanswered > 0 && !confirm(`Còn ${unanswered} câu chưa chọn đáp án. Bạn vẫn muốn nộp bài?`)) return;
  submitting = true; notify('');
  $('submit-top').disabled = true; $('submit-bottom').disabled = true;
  try {
    const data = await quizApi({ action: 'submit', ticket, answers: responses });
    if (!Array.isArray(data.review) || data.review.length !== examItems.length ||
        !Number.isInteger(data.score) || !Number.isInteger(data.total) || data.total !== examItems.length ||
        data.score < 0 || data.score > data.total) throw new Error('Máy chủ trả về kết quả không hợp lệ.');
    completed = true; clearInterval(interval);
    renderResults(data, expired);
  } catch (error) {
    notify(`Không thể nộp bài: ${error.message}`);
  } finally {
    submitting = false; $('submit-top').disabled = false; $('submit-bottom').disabled = false;
  }
}

document.querySelectorAll('[data-level]').forEach(tab => tab.addEventListener('click', () => {
  if (starting || submitting) return;
  selectedLevel = tab.dataset.level;
  try { localStorage.setItem('mrlee-online-level', selectedLevel); } catch {}
  makeBatches();
}));
$('test-list').addEventListener('click', e => { const btn = e.target.closest('[data-batch]'); if (btn) void startBatch(Number(btn.dataset.batch)); });
$('submit-top').addEventListener('click', () => void finish());
$('submit-bottom').addEventListener('click', () => void finish());
$('back-to-tests').addEventListener('click', goToList);
$('return-btn').addEventListener('click', goToList);
$('retry-btn').addEventListener('click', () => void startBatch(activeBatch));
$('next-btn').addEventListener('click', () => void startBatch(activeBatch + 1));
$('review-toggle').addEventListener('click', () => {
  const hidden = $('answer-review').classList.toggle('hidden');
  $('review-toggle').setAttribute('aria-expanded', String(!hidden));
  $('review-toggle').textContent = hidden ? 'Xem đáp án và giải thích' : 'Ẩn đáp án';
});
window.addEventListener('beforeunload', e => {
  if (activeBatch >= 0 && !completed) { e.preventDefault(); e.returnValue = ''; }
});
makeBatches();
const reviewBatch = Number(deepLink.get('batch'));
if (Number.isInteger(reviewBatch) && reviewBatch >= 1 && reviewBatch <= 8) {
  const target = document.querySelector(`[data-batch="${reviewBatch - 1}"]`);
  if (target) { target.focus({ preventScroll: true }); target.scrollIntoView({ behavior: 'auto', block: 'center' }); }
}
