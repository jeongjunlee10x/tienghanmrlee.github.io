/** MR LEE - diem LUYEN TAP, khong phai ket qua thi chinh thuc.
 * Diem Web Speech API do TRINH DUYET tinh, khong duoc xac thuc tren may chu.
 * Khong dung diem nay de thu phi, cap chung chi hay xet duyet quan trong.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, reload } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, collection, getDoc, getDocs, runTransaction, query, orderBy, limit, serverTimestamp, addDoc } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

export const SETTINGS = Object.freeze({ initial:100, minimum:20, maximum:200, lowPenalty:-3, good:6, excellent:10, recovery:15 });
const app = getApps().find(a=>a.name==='[DEFAULT]') || (isFirebaseConfigured ? initializeApp(firebaseConfig) : null);
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
export const speechSupported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
export const pointsConfigured = Boolean(app && db && auth);
export function waitForUser() {
  if (!auth) return Promise.reject(new Error('Firebase chưa được cấu hình.'));
  return new Promise((resolve,reject)=> {
    const unsubscribe = onAuthStateChanged(auth, async user=>{
      unsubscribe();
      if (!user) return reject(new Error('Vui lòng đăng nhập tài khoản học viên.'));
      try {
        await reload(user);
        await user.getIdToken(true);
        if (!user.emailVerified) throw new Error('Bạn cần xác minh email trước khi tích điểm.');
        resolve(user);
      } catch(e) { reject(e); }
    },reject);
  });
}
const walletRef=user=>doc(db,'users',user.uid,'studyPoints','wallet');
const attemptRef=(user,id)=>doc(db,'users',user.uid,'speakingAttempts',id);
function emptyWallet() {
  return { balance:SETTINGS.initial, earned:0, lost:0, attempts:0, lastAttemptId:'', lastDelta:0 };
}
export async function loadWallet(user) {
  const snapshot = await getDoc(walletRef(user));
  if (!snapshot.exists()) return {...emptyWallet(), firstVisit:true};
  return {...snapshot.data(), firstVisit:false};
}
// Avoid local timezone collision for the daily score key: date in user's current browser timezone.
export function localDay() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function normalizeKorean(raw) {
  return String(raw || '').normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/[^\p{Script=Hangul}\p{Number}a-z]/gu,'');
}
export function similarity(reference, spoken) {
  const a=Array.from(normalizeKorean(reference)), b=Array.from(normalizeKorean(spoken));
  if (!a.length || !b.length) return 0;
  let previous=Array.from({length:b.length+1},(_,i)=>i);
  for (let i=1;i<=a.length;i++) {
    const current=[i];
    for (let j=1;j<=b.length;j++) current[j]=Math.min(previous[j]+1,current[j-1]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));
    previous=current;
  }
  return Math.max(0,Math.min(100,Math.round(100*(1-previous[b.length]/Math.max(a.length,b.length)))));
}
export function calculateDelta(score,mode) {
  if(mode==='recovery') return score>=65 ? SETTINGS.recovery : 0;
  return score>=85 ? SETTINGS.excellent : score>=60 ? SETTINGS.good : SETTINGS.lowPenalty;
}
export async function commitSpeaking(user,task,score,transcripts,seconds,mode='normal') {
  if (!Number.isInteger(score) || score<0 || score>100) throw new Error('Điểm bài nói không hợp lệ.');
  if (!Array.isArray(transcripts) || transcripts.length!==task.items.length) throw new Error('Dữ liệu câu nói không hợp lệ.');
  const day=localDay();
  const docId=`${task.id}-${day}`;
  const safeDocId=docId.replace(/[^a-z0-9-]/g,'');
  const total=task.items.length;
  const delta=calculateDelta(score,mode);
  if(mode==='recovery' && delta===0) return {status:'not-passed',delta:0};
  const attempt=attemptRef(user,safeDocId);
  const wallet=walletRef(user);
  const result=await runTransaction(db,async transaction=>{
    const [oldAttempt,oldWallet]=await Promise.all([transaction.get(attempt),transaction.get(wallet)]);
    if(oldAttempt.exists()) return {status:'already',delta:0,balance:(oldWallet.exists()?oldWallet.data().balance:SETTINGS.initial)};
    const current=oldWallet.exists()?oldWallet.data():emptyWallet();
    if (mode!=='recovery' && current.balance < SETTINGS.minimum) return {status:'locked',delta:0,balance:current.balance};
    const balance=Math.max(0,Math.min(SETTINGS.maximum,current.balance+delta));
    const realDelta=balance-current.balance;
    const next={
      balance,earned:current.earned+Math.max(0,realDelta),lost:current.lost+Math.max(0,-realDelta),
      attempts:current.attempts+1,lastAttemptId:safeDocId,lastDelta:realDelta,
      createdAt:oldWallet.exists()?current.createdAt:serverTimestamp(),updatedAt:serverTimestamp()
    };
    if(oldWallet.exists()) transaction.update(wallet,next);
    else transaction.set(wallet,next);
    const payload={
      taskId:task.id,taskTitle:task.title,mode,day,score,delta:realDelta,total,
      matched:transcripts.filter(x=>typeof x.heard==='string' && x.heard.trim()).length,
      transcriptJson:JSON.stringify(transcripts).slice(0,16000),
      createdAt:serverTimestamp()
    };
    transaction.set(attempt,payload);
    return {status:'saved',delta:realDelta,balance,docId:safeDocId};
  });
  if(result.status!=='saved') return result;
  // Best-effort backward-compatible export for existing history and Supabase sync.
  // The speakingAttempts and studyPoints transaction above is the source of truth.
  const durationSeconds=Math.max(0,Math.min(7200,Math.floor(seconds)));
  const level=['sc1','sc2'].includes(task.level)?task.level:'general';
  const history={
    examId:`speaking-${task.id}`.slice(0,60),examTitle:`Luyện nói: ${task.title}`.slice(0,110),
    level,score,total:100,durationSeconds,source:'client_practice',createdAt:serverTimestamp()
  };
  try {
    await addDoc(collection(db,'users',user.uid,'practiceAttempts'),history);
    result.historySaved=true;
  } catch(e) {
    result.historySaved=false;
    result.historyError=e?.code || e?.message || 'unknown';
  }
  return result;
}
export async function recentAttempts(user) {
  const ref=collection(db,'users',user.uid,'speakingAttempts');
  const snap=await getDocs(query(ref,orderBy('createdAt','desc'),limit(12)));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
