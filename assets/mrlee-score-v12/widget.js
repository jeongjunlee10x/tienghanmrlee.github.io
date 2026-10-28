/* TIENG HAN MR LEE V12 — weekly points, verified server grading only. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, collection, onSnapshot, query, orderBy, limit, getDocs, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, isFirebaseConfigured } from '../../firebase-config.js';
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const h = str => String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Number(n || 0).toLocaleString('vi-VN');
function weekOf(d = new Date()) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
  const y = +p.find(x => x.type === 'year').value, m = +p.find(x => x.type === 'month').value, day = +p.find(x => x.type === 'day').value;
  const t = new Date(Date.UTC(y,m-1,day));
  t.setUTCDate(t.getUTCDate() - (t.getUTCDay()+6)%7 + 3);
  const yr = t.getUTCFullYear(), first = new Date(Date.UTC(yr,0,4));
  first.setUTCDate(first.getUTCDate() - (first.getUTCDay()+6)%7 + 3);
  return `${yr}-W${String(1+Math.round((t-first)/604800000)).padStart(2,'0')}`;
}
const week = weekOf();
const root = document.createElement('aside');
root.id = 'mrleeV12Widget';
root.innerHTML = `<a href="bang-diem-tuan-v12.html" aria-label="Bảng điểm toàn website">🏆 <strong id="mrleeV12WidgetScore">Bảng điểm tuần</strong></a><span id="mrleeV12Status" role="status"></span>`;
(document.body || document.documentElement).append(root);
let user = null, db = null, stopMine = null;
function toast(text, problem = false) {
  const s = $('#mrleeV12Status');
  if (!s) return;
  s.textContent = text;
  s.classList.toggle('v12-bad', problem);
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => s.textContent = '', 6500);
}
// Spark: ghi yeu cau cham diem (khong ghi diem tuy y tu trinh duyet).
function vnToday() {
  const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get = k => p.find(x=>x.type===k).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function activityFor(data) {
  const type = data.type;
  const level = Number(data.level||0), day = Number(data.day||0), format = String(data.format||'');
  if(type==='attendance') return {key:'attendance',level:0,day:0,format:'',answers:[]};
  if(['quiz','listening'].includes(type)) {
    if(![1,2].includes(level)||!Number.isInteger(day)||day<1||day>(level===1?30:60)) throw Error('Cap/ngay hoc khong hop le');
    return {key:`${type}-${level}-${day}`,level,day,format:'',answers:data.answers||[]};
  }
  if(['mock','mock-listening','mock-reading'].includes(type)) {
    if(![1,2].includes(level)||!['PBT','IBT'].includes(format)) throw Error('De thi khong hop le');
    return {key:`${type}-${level}-${format}`,level,day:0,format,answers:data.answers||[]};
  }
  throw Error('Hoat dong chua duoc ho tro tren Spark');
}
async function queueAward(data) {
  const target=activityFor(data);
  const dayKey=vnToday();
  const id=`${user.uid}-${dayKey}-${target.key}`;
  const ref=doc(db,'mrleeV12SparkQueue',id);
  const value={uid:user.uid,dayKey,activityKey:target.key,type:data.type,
    level:target.level,day:target.day,format:target.format,answers:target.answers,
    status:'pending',createdAt:serverTimestamp()};
  try {
    await setDoc(ref,value);
    return {status:'queued'};
  } catch(err) {
    const existing=await getDoc(ref).catch(()=>null);
    if(existing?.exists() && existing.data()?.uid===user.uid) return {status:'already',state:existing.data()?.status};
    throw err;
  }
}
async function award(data) {
  if (!user) return toast('Vui long dang nhap de gui bai cham diem.', true);
  if (!user.emailVerified) return toast('Can xac minh email truoc khi gui bai.', true);
  try {
    toast('Dang ghi bai cho he thong cham diem mien phi…');
    const res = await queueAward(data);
    if (res.status === 'queued') toast('Da ghi nhan bai. GitHub Actions se cham va cap nhat diem theo dot (thuong 30-60 phut).');
    else if (res.state === 'saved') toast('Đã nhận điểm Spark trong tuần; không cộng trùng.');
    else if (res.state === 'not-passed') toast('Bài hôm nay chưa đạt ngưỡng. Có thể luyện và gửi lại ngày khác; xem Quy tắc điểm.',true);
    else if (res.state === 'rejected') toast('Bài trước không hợp lệ; hãy kiểm tra dữ liệu hoặc liên hệ quản trị.',true);
    else if (res.state === 'pending') toast('Bai da duoc gui, dang cho he thong cham.');
    else toast('Bai nay da duoc gui hom nay. Khong cong trung.');
  } catch (e) { toast('Chua gui duoc bai: '+String(e.message||e.code||'Loi mang'),true); }
}
window.MRLEE_SCORE_V12 = Object.freeze({ award, week });
function selectedRows(area) {
  return $$('.v10-question[data-id]', area).map(node => {
    const checked = $('input:checked',node);
    return { id: node.getAttribute('data-id'), selected: checked ? Number(checked.value) : -1 };
  });
}
// Bridge for TOPIK V11: only after its own grading handler has finished.
document.addEventListener('click', event => {
  const btn = event.target.closest('button');
  if (!btn || !['v10-grade-quiz','v10-grade-listen','v10-submit-exam'].includes(btn.id)) return;
  const type = btn.id === 'v10-grade-quiz' ? 'quiz' : btn.id === 'v10-grade-listen' ? 'listening' : 'mock';
  const level = Number($('#v10-level')?.value || $('#v10-exam-level')?.value || 1);
  const day = Number($('#v10-day')?.value || 1);
  const format = $('#v10-exam-format')?.value || 'PBT';
  const mode = $('#v10-exam-mode')?.value || 'mock';
  window.setTimeout(() => {
    let area;
    if (type === 'quiz') area = $('#v10-quiz');
    else if (type === 'listening') area = $('#v10-listening');
    else area = $('#v10-room');
    if (!area) return;
    // Do not submit if the V11 submit/grade did not run.
    if (type !== 'mock' && area.dataset.graded !== 'true') return;
    if (type === 'mock' && !$('#v10-submit-exam')?.disabled) return;
    const answers = selectedRows(area);
    if (!answers.length) return;
    const payload = type === 'mock'
      ? { type: mode === 'listening' ? 'mock-listening' : mode === 'reading' ? 'mock-reading' : 'mock', level, format, answers }
      : { type, level, day, answers };
    award(payload);
  }, 150);
}, true);
// Legacy event stays in legacy practice log. Its browser-supplied score is NOT server-verified.
window.addEventListener('mrlee:practice-finished', () => {
  const a = $('#mrleeV12WidgetScore');
  if (a) a.title = 'Điểm luyện tập cũ tiếp tục lưu riêng. Hệ thống V12 chỉ cộng điểm khi đáp án được chấm từ bộ đề xác thực.';
});
function initUI() {
  const dashboard = $('#mrleeV12Dashboard');
  if (!dashboard) return;
  const show = (el, text) => { if (el) el.textContent = text; };
  const mine = $('#v12mine'), history = $('#v12history'), podium = $('#v12podium'), notice = $('#v12notice'), all = $('#v12all'), old = $('#v12old'), attendance = $('#v12attendance');
  if (attendance) { attendance.disabled = true; attendance.title = 'Chi bam diem danh khong duoc cong diem'; attendance.textContent = 'Diem danh: 0 diem'; }
  let stopL = null, stopW = null, stopH = null, stopOld = null;
  function loadCurrent(u) {
    if (stopL) stopL(); if (stopW) stopW(); if (stopH) stopH(); if (stopOld) { stopOld(); stopOld = null; }
    if (!u) { show(mine,'Đăng nhập để xem điểm của bạn.');show(old,'—');show(history,'');return; }
    stopL = onSnapshot(doc(db,`mrleeV12AllTime/${u.uid}`),snap=>show(all,fmt(snap.data()?.points||0)),()=>show(all,'—'));
    stopW = onSnapshot(doc(db,`mrleeV12Weekly/${week}/members/${u.uid}`),snap=>show(mine,fmt(snap.data()?.points||0)+' điểm trong '+week),()=>show(mine,'Lỗi tải điểm'));
    stopH = onSnapshot(query(collection(db,`mrleeV12Ledger/${u.uid}/events`),orderBy('createdAt','desc'),limit(30)),snap=> {
      history.replaceChildren();
      if (snap.empty) history.textContent='Chưa có lần cộng điểm nào trong hệ thống V12.';
      snap.forEach(d=>{const item=d.data(), p=document.createElement('li');p.textContent=`+${fmt(item.points)} · ${item.type} · ${item.item} (${item.week})`;history.append(p);});
    },()=>show(history,'Chưa đọc được lịch sử điểm.'));
    stopOld = onSnapshot(doc(db,`users/${u.uid}/studyPoints/wallet`),snap=>show(old,fmt(snap.data()?.balance || 0)),()=>show(old,'—'));
  }
  onAuthStateChanged(getAuth(),loadCurrent);
  onSnapshot(query(collection(db,`mrleeV12Weekly/${week}/members`),orderBy('points','desc'),limit(30)),snap=> {
    podium.replaceChildren();let count=0;let previous=null, rank=0;
    snap.forEach(d=>{const r=d.data();count++;if(r.points!==previous)rank=count;previous=r.points;const item=document.createElement('li');item.textContent=`#${rank} · ${r.alias || 'Học viên'} · ${fmt(r.points)} điểm`;podium.append(item);});
    if(!count) podium.textContent='Chưa có điểm trong tuần này.';
  }, e=>show(podium,'Không tải được bảng điểm: '+e.code));
  onSnapshot(query(collection(db,'mrleeV12Notices'),orderBy('generatedAt','desc'),limit(1)),snap=> {
    if(snap.empty) return show(notice,'Chưa có thông báo tuần mới.');
    const item=snap.docs[0].data();show(notice,`${item.status || 'Bảng xếp hạng'} · ${item.week} · ${item.top?.map(r=>`${r.rank}. ${r.alias}: ${fmt(r.points)}đ`).join(' · ')||'Chưa có dữ liệu.'}`);
  },()=>show(notice,'Chưa có thông báo công khai.'));
}
if(isFirebaseConfigured){
  const app=getApps().find(x=>x.name==='[DEFAULT]') || initializeApp(firebaseConfig);
  db = getFirestore(app);
  onAuthStateChanged(getAuth(app), u=>{
    user=u;
    if(stopMine){stopMine();stopMine=null;}
    if(!u){$('#mrleeV12WidgetScore').textContent='Điểm tuần · Đăng nhập';return;}
    stopMine=onSnapshot(doc(db,`mrleeV12Weekly/${week}/members/${u.uid}`),snap=>{$('#mrleeV12WidgetScore').textContent=`${fmt(snap.data()?.points || 0)} điểm · Tuần ${week}`;},()=>{$('#mrleeV12WidgetScore').textContent='Điểm tuần · Xem chi tiết';});
  });
  // Live in-site notification on any page; no email/FCM push permission requested.
  onSnapshot(query(collection(db,'mrleeV12Notices'),orderBy('generatedAt','desc'),limit(1)), snapshot => {
    const latest = snapshot.docs[0];
    if (!latest) return;
    const id = latest.id;
    let seen = '';
    try { seen = localStorage.getItem('MRLEE_V12_LAST_NOTICE') || ''; } catch (_) {}
    if (seen === id) return;
    const n = latest.data();
    const bell = document.createElement('div');
    bell.className = 'mrleeV12Popup';
    bell.innerHTML = `<strong>📣 ${h(n.status || 'Thông báo cuối tuần')}</strong><p>Tuần ${h(n.week)}: đã cập nhật bảng xếp hạng MR LEE.</p><a href="bang-diem-tuan-v12.html">Xem kết quả →</a><button aria-label="Đóng thông báo" type="button">×</button>`;
    bell.querySelector('button').onclick = () => bell.remove();
    document.body.append(bell);
    try { localStorage.setItem('MRLEE_V12_LAST_NOTICE', id); } catch (_) {}
  }, () => {});
  initUI();
  window.setInterval(() => {
    if (weekOf() !== week && $('#mrleeV12Dashboard')) { location.reload(); return; }
    if (weekOf() !== week && !$('#mrleeV12NewWeek')) {
      const link = document.createElement('a');
      link.id = 'mrleeV12NewWeek';
      link.href = 'bang-diem-tuan-v12.html';
      link.textContent = '🎉 Đã sang tuần mới · Xem bảng điểm →';
      root.append(link);
    }
  }, 60000);
}else{toast('Chưa cấu hình Firebase.',true);}
