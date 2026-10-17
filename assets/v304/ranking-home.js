/**
 * TIẾNG HÀN MR LEE — V30.4
 * MAIN leaderboard reads the SAME public Firestore collection, ranking algorithm,
 * and Firebase project as bang-xep-hang.html. Read only; never changes scores.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getFirestore, collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, isFirebaseConfigured } from '../../firebase-config.js';
import { rankEntries } from '../../mrlee-ranking-utils.mjs?v=spark-v4';

const strip = document.getElementById('rankSlider');
const section = document.getElementById('ranking');
if (strip && section && strip.dataset.mrleeRankLive !== '1') {
  strip.dataset.mrleeRankLive = '1';
  strip.setAttribute('aria-label', 'Bảng xếp hạng học viên MR LEE cập nhật từ Firebase');
  strip.setAttribute('aria-live', 'polite');
  strip.setAttribute('aria-busy', 'true');

  const status = document.createElement('span');
  status.id = 'mrleeRankLiveStatus';
  status.className = 'mrlee-rank-live-status';
  status.setAttribute('role', 'status');
  status.textContent = 'Đang lấy BXH học viên…';
  const anchor = section.querySelector('.rank-title a');
  if (anchor) anchor.insertAdjacentElement('afterend', status);
  else section.querySelector('.rank-title')?.append(status);

  const number = value => Number(value).toLocaleString('vi-VN');
  function emptyState(title, detail) {
    strip.replaceChildren();
    const wrap = document.createElement('div');
    wrap.className = 'rank-placeholder mrlee-rank-v304-empty';
    const strong = document.createElement('b');
    strong.textContent = title;
    const note = document.createElement('small');
    note.textContent = detail;
    const link = document.createElement('a');
    link.href = 'bang-xep-hang.html';
    link.textContent = 'Xem BXH học viên đầy đủ →';
    wrap.append(strong, note, link);
    strip.append(wrap);
    strip.setAttribute('aria-busy', 'false');
  }

  function render(snapshot) {
    const ranked = rankEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    const subset = ranked.slice(0, 30);
    const fragment = document.createDocumentFragment();
    for (const person of subset) {
      const card = document.createElement('article');
      card.className = 'student-rank mrlee-rank-v304-card' + (person.rank <= 3 ? ' mrlee-rank-v304-top-' + person.rank : '');
      card.setAttribute('aria-label', `Hạng ${person.rank}, ${person.alias}, ${number(person.points)} điểm`);
      const position = document.createElement('span');
      position.className = 'position';
      position.textContent = person.rank <= 3 ? ['🥇', '🥈', '🥉'][person.rank - 1] : '#' + number(person.rank);
      position.setAttribute('title', `Hạng ${person.rank}`);
      const info = document.createElement('div');
      info.className = 'student-info';
      const name = document.createElement('b');
      name.className = 'student-name';
      name.textContent = person.alias;
      name.title = person.alias;
      const score = document.createElement('small');
      score.className = 'student-score';
      score.textContent = number(person.points) + ' điểm';
      info.append(name, score);
      card.append(position, info);
      fragment.append(card);
    }
    if (ranked.length > subset.length) {
      const link = document.createElement('a');
      link.href = 'bang-xep-hang.html';
      link.className = 'mrlee-rank-v304-more';
      link.textContent = `Xem đủ ${number(ranked.length)} học viên →`;
      fragment.append(link);
    }
    if (ranked.length === 0) {
      emptyState('Chưa có học viên trong bảng xếp hạng công khai.', 'Điểm sẽ xuất hiện khi hệ thống BXH có dữ liệu thật.');
    } else {
      const oldScroll = strip.scrollLeft;
      strip.replaceChildren(fragment);
      strip.scrollLeft = oldScroll;
      strip.setAttribute('aria-busy', 'false');
    }
    status.textContent = snapshot.metadata?.fromCache
      ? `Dữ liệu tạm lưu · ${number(ranked.length)} học viên`
      : `● BXH trực tiếp · ${number(ranked.length)} học viên`;
    status.classList.toggle('mrlee-rank-online', !snapshot.metadata?.fromCache);
  }

  if (!isFirebaseConfigured) {
    status.textContent = 'Chưa cấu hình Firebase';
    emptyState('Không tải được BXH trên MAIN.', 'Trang này chưa có cấu hình Firebase hợp lệ.');
  } else {
    try {
      const app = getApps().find(app => app.name === '[DEFAULT]') || initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const unsubscribe = onSnapshot(
        collection(db, 'mrleePublicLeaderboard'),
        { includeMetadataChanges: true },
        render,
        error => {
          console.warn('[MR LEE V30.4] Không đọc được BXH công khai:', error.code || error.message);
          status.classList.remove('mrlee-rank-online');
          status.textContent = 'Không thể đồng bộ BXH';
          emptyState('Chưa kết nối được BXH học viên thật.',
            error.code === 'permission-denied'
              ? 'Firebase chưa cấp quyền đọc BXH công khai. Cần kiểm tra quy tắc truy cập.'
              : 'Vui lòng kiểm tra mạng hoặc mở bảng xếp hạng đầy đủ.');
        }
      );
      window.addEventListener('pagehide', () => unsubscribe(), { once: true });
    } catch (error) {
      console.warn('[MR LEE V30.4] Khởi tạo Firebase:', error);
      status.textContent = 'Chưa kết nối được BXH';
      emptyState('Không tải được BXH học viên.', 'Thử làm mới trang hoặc mở BXH đầy đủ.');
    }
  }
}
