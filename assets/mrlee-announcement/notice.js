/* MR LEE - One ranking announcement per Firebase sign-in on the main page. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, getIdTokenResult } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from '../../firebase-config.js';

const ID = 'mrleeRankingAnnouncement';
const NOTICE_ID = 'ranking-update-20261018-0200-v1';
let activeStorageKey = null;
let lastUserUid = null;
let lastFocused = null;
const store = {
  get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
  set(key) { try { sessionStorage.setItem(key,'1'); } catch { /* private browsing */ } },
  del(key) { try { sessionStorage.removeItem(key); } catch { /* private browsing */ } }
};

function markup() {
  return `<div class="mrla-card" role="document">
    <div class="mrla-top">
      <button type="button" class="mrla-close" aria-label="Đóng thông báo" title="Đóng thông báo">×</button>
      <div class="mrla-heading"><img class="mrla-logo" alt="Logo MR LEE" src="assets/branding/logo-mrlee.png">
        <div><span class="mrla-eyebrow">Thông báo chính thức · MR LEE</span>
          <h2 id="mrlaTitle">Cập nhật quy chế xếp hạng học viên</h2></div>
      </div>
      <div class="mrla-date">Có hiệu lực từ 02:00, Chủ nhật ngày 18/10/2026 · Giờ Việt Nam (UTC+7)</div>
    </div>
    <div class="mrla-content">
      <p>Kính gửi Quý học viên,</p>
      <p>Nhằm bảo đảm tính <strong>minh bạch, công bằng và ghi nhận đúng nỗ lực học tập</strong>, MR LEE thông báo điều chỉnh quy chế tích điểm, xếp hạng và xét thưởng hằng tuần kể từ thời điểm nêu trên.</p>
      <div class="mrla-steps">
        <div class="mrla-step"><b>Thứ Hai – Thứ Sáu</b><span>Tích điểm từ hoạt động học tập hợp lệ</span></div>
        <div class="mrla-step"><b>Thứ Bảy</b><span>Thống kê, đối soát và công bố xếp hạng tuần</span></div>
        <div class="mrla-step"><b>Chủ nhật</b><span>Chuyển điểm tuần về 0, lưu lịch sử toàn khóa</span></div>
      </div>
      <p><strong>Nguyên tắc tính điểm:</strong> Mỗi bài học chỉ được ghi nhận điểm một lần trong toàn khóa. Học viên vẫn có thể học lại không giới hạn để củng cố kiến thức, nhưng không được cộng lại điểm của bài đã hoàn thành.</p>
      <div class="mrla-prizes"><h3>🏆 Chính sách khích lệ học tập</h3>
        <ul><li>🥇 <strong>Top 1:</strong> 20.000 VNĐ.</li>
        <li>🥈 <strong>Top 2:</strong> 10.000 VNĐ.</li>
        <li>🥉 <strong>Top 3:</strong> 01 gói bim bim.</li></ul>
      </div>
      <p><strong>Điều kiện xét thưởng:</strong> Học viên phải đạt <strong>trên 40 điểm trong tuần</strong>, đồng thời thuộc Top 1, Top 2 hoặc Top 3 theo kết quả đã được quản trị viên đối soát. Học viên đủ điều kiện sẽ nhận thông báo và hướng dẫn hoàn thiện phiếu nhận thưởng khi kết quả được xác nhận.</p>
      <div class="mrla-note">Lưu ý: Phần thưởng do MR LEE trao trực tiếp. Điểm đã kết thúc theo tuần vẫn được bảo lưu trong lịch sử để phục vụ tổng kết cuối khóa. Các kết quả nhận thưởng chỉ có giá trị sau khi được xác nhận chính thức.</div>
      <div class="mrla-footer"><span class="mrla-signature">Trân trọng,<br><strong>Ban quản trị TIẾNG HÀN MR LEE</strong></span>
        <button type="button" class="mrla-confirm">Tôi đã đọc thông báo</button></div>
    </div>
  </div>`;
}
function getDialog() {
  let el = document.getElementById(ID);
  if (el) return el;
  el = document.createElement('section');
  el.id = ID;
  el.hidden = true;
  el.setAttribute('role','dialog');
  el.setAttribute('aria-modal','true');
  el.setAttribute('aria-labelledby','mrlaTitle');
  el.innerHTML = markup();
  document.body.append(el);
  const dismiss = () => {
    if (el.hidden) return;
    if (activeStorageKey) store.set(activeStorageKey);
    el.hidden = true;
    document.body.classList.remove('mrla-open');
    if (lastFocused && lastFocused.isConnected) lastFocused.focus();
  };
  el.querySelector('.mrla-close').addEventListener('click',dismiss);
  el.querySelector('.mrla-confirm').addEventListener('click',dismiss);
  el.addEventListener('keydown',event=>{
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
    if (event.key !== 'Tab' || el.hidden) return;
    const buttons = [el.querySelector('.mrla-close'),el.querySelector('.mrla-confirm')];
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[1].focus(); }
    else if (!event.shiftKey && document.activeElement === buttons[1]) { event.preventDefault(); buttons[0].focus(); }
  });
  return el;
}
function showNotice(storageKey) {
  if (store.get(storageKey)) return;
  const el = getDialog();
  activeStorageKey = storageKey;
  if (!el.hidden) return;
  lastFocused = document.activeElement;
  el.hidden = false;
  document.body.classList.add('mrla-open');
  el.querySelector('.mrla-close').focus();
}
async function bootstrap() {
  if (!isFirebaseConfigured) return;
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    onAuthStateChanged(auth, async user => {
      if (!user) {
        if (activeStorageKey) store.del(activeStorageKey);
        lastUserUid = null;
        activeStorageKey = null;
        const el = document.getElementById(ID);
        if (el && !el.hidden) { el.hidden=true; document.body.classList.remove('mrla-open'); }
        return;
      }
      lastUserUid = user.uid;
      try {
        const token = await getIdTokenResult(user);
        if (auth.currentUser?.uid !== user.uid) return;
        const authTime = token.authTime || String(user.metadata?.lastSignInTime || 'session');
        const key = ['mrlee','notice',NOTICE_ID,user.uid,authTime].join(':');
        showNotice(key);
      } catch (error) { console.warn('[MR LEE Notice] Cannot check sign-in session:',error); }
    });
  } catch(error) {console.warn('[MR LEE Notice] Firebase authentication unavailable:',error);}
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',bootstrap,{once:true});
else bootstrap();
