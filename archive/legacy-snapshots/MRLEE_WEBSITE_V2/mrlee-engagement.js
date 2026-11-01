/** MR LEE 2026.10 — daily welcome, visible study points & ethical sharing.
 * All point values are read from the existing Firebase wallet. No fabricated points.
 * Client-side practice points are motivational only, not TOPIK certification.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, reload } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';
import { claimDailyLogin, loadWallet, SETTINGS } from './mrlee-points-core.js';

const RELEASE = Object.freeze({version:'2026.10', title:'Bản cập nhật học tập tháng 10/2026', notes:[
 'Lộ trình Cấp 1–6 ngay trong Bài học tiếng Hàn.',
 'Thêm 12 tình huống giao tiếp Cấp 3–6 và 240 mẫu câu mới.',
 'Bảng tên, điểm học tập và thành tích streak ở trang chủ.',
 'Chào mừng, thống kê số ngày điểm danh và thông tin phiên bản.'
]});
const $=(id)=>document.getElementById(id);
const dayUTC=()=>new Date().toISOString().slice(0,10);
const safeStore={get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,val){try{localStorage.setItem(key,val)}catch{}}};
function node(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x;}
const badgeForPoints=(p)=>p>=2000?['Huyền thoại','👑']:p>=1000?['Bậc thầy','🏆']:p>=500?['Tinh anh','💎']:p>=200?['Xuất sắc','🌟']:p>=100?['Tăng tốc','🚀']:['Khởi động','🌱'];
const fmt=(n)=>Number.isFinite(n)?String(n):'—';
const shareURL='https://jeongjunlee10x.github.io/tienghanmrlee.github.io/';
let lastUser='';

function renderHome(user, name, wallet){
 const panel=$('mrleeStudentPanel');if(!panel)return;
 panel.hidden=false;panel.replaceChildren();
 const meta=node('div','mrlee-student-meta');
 const portrait=node('span','mrlee-avatar-initial', (name.trim()[0]||'H').toLocaleUpperCase('vi-VN'));
 const identity=node('div','mrlee-student-identity');
 identity.append(node('span','mrlee-identity-overline','HỒ SƠ HỌC VIÊN · 학생 프로필'),node('strong','mrlee-student-name',name));
 meta.append(portrait,identity);
 const stats=node('div','mrlee-student-stats');
 const [rank,rankIcon]=badgeForPoints(wallet.balance);
 const rows=[['⭐','Điểm động lực',fmt(wallet.balance)],['🔥','Streak',fmt(wallet.loginStreak)+' ngày'],['📅','Ngày đã điểm danh',fmt(wallet.loginDays)], [rankIcon,'Hạng học tập',rank]];
 for(const [icon,label,value] of rows){const card=node('div','mrlee-stat');card.append(node('span','mrlee-stat-icon',icon),node('div','mrlee-stat-label',label),node('strong','mrlee-stat-value',value));stats.append(card);}
 const actions=node('div','mrlee-student-actions');
 const open=node('a','mrlee-action-primary','🎓 Tiếp tục lộ trình');open.href='bai-hoc.html';
 const share=node('button','mrlee-action-share','↗ Chia sẻ thành tích');share.type='button';
 share.addEventListener('click',async()=>{
   // Do not include student name/email by default: sharing is explicit and private-by-default.
   const msg=`Tôi đang luyện tiếng Hàn tại Tiếng Hàn Mr Lee 🇰🇷 · Streak ${wallet.loginStreak} ngày · ${wallet.balance} điểm động lực!\n${shareURL}`;
   try{await navigator.clipboard.writeText(msg);share.textContent='✓ Đã sao chép';setTimeout(()=>{share.textContent='↗ Chia sẻ thành tích'},2300)}
   catch{const input=window.prompt('Sao chép nội dung để chia sẻ (không chứa tên/email):',msg);if(input===null)return;}
 });
 const fine=node('p','mrlee-student-disclaimer','Điểm động lực là thành tích luyện tập, không phải cấp độ TOPIK hay kết quả thi chính thức.');
 actions.append(open,share);panel.append(meta,stats,actions,fine);
}
function renderHomeError(message){
 const panel=$('mrleeStudentPanel');if(!panel)return;
 panel.hidden=false;panel.replaceChildren();
 const p=node('p','mrlee-error-message',`Đã đăng nhập nhưng chưa tải được điểm: ${message}`);
 const a=node('a','mrlee-action-primary','Mở trang điểm & luyện nói');a.href='luyen-noi-tinh-diem.html';panel.append(p,a);
}
function modal(user,name,wallet,reward){
 const unique=`mrlee.welcome.${user.uid}.${dayUTC()}`;
 if(safeStore.get(unique))return;
 const layer=node('div','mrlee-modal-mask');layer.id='mrleeDailyOverlay';
 layer.setAttribute('role','presentation');
 const dialog=node('section','mrlee-modal');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','mrleeModalTitle');dialog.setAttribute('aria-describedby','mrleeModalDesc');dialog.tabIndex=-1;
 const header=node('div','mrlee-modal-top');
 const symbol=node('span','mrlee-modal-spark','✦');symbol.setAttribute('aria-hidden','true');
 const close=node('button','mrlee-modal-close','×');close.type='button';close.setAttribute('aria-label','Đóng thông báo');
 header.append(symbol,close);
 const eyebrow=node('div','mrlee-modal-eyebrow','오늘도 함께 공부해요 · CÙNG HỌC MỖI NGÀY');
 const title=node('h2','',`Chào mừng trở lại, ${name}!`);title.id='mrleeModalTitle';
 const desc=node('p','mrlee-modal-lead','Đây là thống kê điểm danh được ghi nhận kể từ khi tính năng được kích hoạt.');desc.id='mrleeModalDesc';
 const stats=node('div','mrlee-modal-stats');
 for(const [label,val] of [['Đã điểm danh',`${wallet.loginDays} ngày`],['Chuỗi hiện tại',`${wallet.loginStreak} ngày`],['Điểm đang có',`${wallet.balance} điểm`]]){
   const cell=node('div','mrlee-modal-stat');cell.append(node('strong','',val),node('span','',label));stats.append(cell);
 }
 const awardMsg=reward?.status==='saved' ? `🎁 Điểm danh hôm nay: +${reward.delta} điểm${reward.bonus?` (có ${reward.bonus} điểm mốc streak)`:''}.`:
  reward?.status==='already'?'✅ Hôm nay đã được ghi nhận, điểm không cộng lần hai.':
  'ℹ️ Không xác định được thưởng điểm danh; hãy kiểm tra kết nối Firebase.';
 const award=node('p','mrlee-modal-award',awardMsg);
 const version=node('div','mrlee-modal-version');version.append(node('span','mrlee-release-badge',`MỚI · ${RELEASE.version}`),node('h3','',RELEASE.title));
 const list=node('ul','mrlee-release-list');for(const s of RELEASE.notes)list.append(node('li','',s));version.append(list);
 const action=node('div','mrlee-modal-actions');const go=node('a','mrlee-action-primary','Khám phá bài học 1–6 →');go.href='bai-hoc.html';const dismiss=node('button','mrlee-action-share','Đóng thông báo');dismiss.type='button';action.append(go,dismiss);
 dialog.append(header,eyebrow,title,desc,stats,award,version,action);layer.append(dialog);document.body.append(layer);
 const previous=document.activeElement;
 const finish=()=>{layer.remove();document.body.classList.remove('mrlee-modal-open');document.removeEventListener('keydown',onKey);if(previous&&previous.focus)previous.focus();};
 const onKey=(e)=>{if(e.key==='Escape')finish();if(e.key==='Tab'){
   const focusables=Array.from(dialog.querySelectorAll('button,a[href]')).filter(x=>!x.disabled);if(!focusables.length)return;
   if(e.shiftKey&&document.activeElement===focusables[0]){e.preventDefault();focusables[focusables.length-1].focus()}
   else if(!e.shiftKey&&document.activeElement===focusables[focusables.length-1]){e.preventDefault();focusables[0].focus()}
 }};
 close.addEventListener('click',finish);dismiss.addEventListener('click',finish);
 layer.addEventListener('pointerdown',e=>{if(e.target===layer)finish()});
 document.addEventListener('keydown',onKey);document.body.classList.add('mrlee-modal-open');
 safeStore.set(unique,RELEASE.version);close.focus();
}
async function getName(user,db){
 let name=(user.displayName||'').trim();if(name)return name.slice(0,70);
 try{const snap=await getDoc(doc(db,'users',user.uid));if(snap.exists()){name=String(snap.data()?.displayName||'').trim()}}catch(e){/* Profile is optional */}
 return (name || user.email?.split('@')[0] || 'học viên').slice(0,70);
}
if(isFirebaseConfigured){
 const app=getApps().find(a=>a.name==='[DEFAULT]')||initializeApp(firebaseConfig);
 const auth=getAuth(app),db=getFirestore(app);
 onAuthStateChanged(auth,async user=>{
   if(!user){lastUser='';const p=$('mrleeStudentPanel');if(p)p.hidden=true;return;}
   if(lastUser===user.uid)return;lastUser=user.uid;
   try{
     await reload(user);await user.getIdToken(true);
     if(!user.emailVerified)return;
     const name=await getName(user,db);
     let reward=null, wallet;
     try{reward=await claimDailyLogin(user)}catch(e){console.warn('Điểm danh hôm nay:',e?.code||e?.message)}
     try{wallet=await loadWallet(user)}catch(e){renderHomeError(e?.code||e?.message||'Không có quyền đọc');return;}
     renderHome(user,name,wallet);
     modal(user,name,wallet,reward);
   }catch(e){renderHomeError(e?.code||e?.message||'Không thể xác minh tài khoản')}
 });
}
