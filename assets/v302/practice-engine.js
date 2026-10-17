/**
 * TIẾNG HÀN MR LEE — Bộ làm bài LUYỆN TẬP cho GitHub Pages.
 * Dùng nguyên ngân hàng câu hỏi hiện có. Không phải chấm điểm tin cậy,
 * không ghi điểm ví / bảng xếp hạng. Không thay Firebase Rules hoặc API.
 */
let sourcePromise;
const sessions = new Map();
const TIME_LIMIT_MS = 15 * 60 * 1000;

function rand(max) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;
    do { crypto.getRandomValues(arr); } while (arr[0] >= limit);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}
function shuffled(input) {
  const list = input.slice();
  for (let i = list.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
async function bank() {
  if (!sourcePromise) sourcePromise = import('../../mrlee-online-bank.js').then(m => m.LEVELS).catch(e => {
    sourcePromise = null;
    throw new Error('Không tải được ngân hàng câu hỏi hiện có: ' + e.message);
  });
  return sourcePromise;
}
export async function startPracticeExam(level, batch) {
  if (!['sc1', 'sc2'].includes(level) || !Number.isInteger(batch) || batch < 0 || batch > 7)
    throw new Error('Cấp độ hoặc đợt kiểm tra không hợp lệ.');
  const LEVELS = await bank();
  const lessons = LEVELS?.[level];
  if (!Array.isArray(lessons) || lessons.length !== 15)
    throw new Error('Ngân hàng đề thiếu một trong 15 bài của cấp độ này.');
  const pool = [];
  for (let li = batch * 2; li < Math.min(batch * 2 + 2, 15); li++) {
    const lesson = lessons[li];
    if (!Array.isArray(lesson?.questions)) throw new Error('Dữ liệu Bài ' + (li + 1) + ' bị thiếu.');
    for (const q of lesson.questions) {
      if (typeof q.text !== 'string' || !Array.isArray(q.options) || q.options.length < 2 ||
        q.options.length > 8 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
        throw new Error('Dữ liệu câu hỏi Bài ' + (li + 1) + ' không hợp lệ.');
      pool.push({ q, lessonNumber: li + 1, lessonTitle: lesson.title });
    }
  }
  if (pool.length < 10) throw new Error('Đợt kiểm tra chưa đủ 10 câu hỏi.');
  const selected = shuffled(pool).slice(0, 10).map((entry, id) => {
    const indices = shuffled(entry.q.options.map((_, i) => i));
    return {
      id,
      question: entry.q.text,
      type: entry.q.type,
      lessonNumber: entry.lessonNumber,
      lessonTitle: entry.lessonTitle,
      options: indices.map(i => entry.q.options[i]),
      correctIndex: indices.indexOf(entry.q.answer),
      explanation: entry.q.explain || ''
    };
  });
  const startedAt = Date.now();
  const ticket = 'practice.' + level + '.' + batch + '.' + startedAt + '.' + rand(1000000000);
  sessions.clear();
  sessions.set(ticket, { startedAt, selected });
  return {
    ticket,
    level,
    batch,
    durationSeconds: 900,
    questions: selected.map(({ id, lessonNumber, lessonTitle, type, question, options }) =>
      ({ id, lessonNumber, lessonTitle, type, text: question, options }))
  };
}
export function finishPracticeExam(ticket, answers) {
  const session = sessions.get(ticket);
  if (!session) throw new Error('Không tìm thấy phiên luyện tập. Vui lòng mở lại đề.');
  if (Date.now() - session.startedAt > TIME_LIMIT_MS + 30000)
    throw new Error('Phiên luyện tập đã hết hạn. Vui lòng mở lại đề.');
  if (!Array.isArray(answers) || answers.length !== session.selected.length)
    throw new Error('Dữ liệu trả lời không hợp lệ.');
  const review = session.selected.map((q, i) => {
    const selectedIndex = answers[i];
    if (selectedIndex !== null && (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= q.options.length))
      throw new Error('Lựa chọn ở câu ' + (i + 1) + ' không hợp lệ.');
    return {
      question: q.question,
      choices: q.options,
      selectedIndex,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      lessonNumber: q.lessonNumber,
      type: q.type
    };
  });
  sessions.delete(ticket);
  const score = review.filter(q => q.selectedIndex === q.correctIndex).length;
  return {
    score,
    total: review.length,
    durationSeconds: Math.max(0, Math.min(900, Math.round((Date.now() - session.startedAt) / 1000))),
    review
  };
}
