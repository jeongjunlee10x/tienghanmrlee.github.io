/** TIENG HAN MR LEE - Points + daily login + speaking streak (client-side practice only).
 * IMPORTANT: these points/scores are submitted by the browser and are not authoritative.
 * Do not use for paid benefits, certificates or punitive academic decisions.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, reload } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, collection, getDoc, getDocs, runTransaction, query, orderBy, limit, serverTimestamp, addDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

export const SETTINGS=Object.freeze({initial:100,minimum:20,lowPenalty:-3,good:6,excellent:10,recovery:15,loginBase:2});
const app=getApps().find(x=>x.name==='[DEFAULT]') || (isFirebaseConfigured ? initializeApp(firebaseConfig) : null);
const auth=app ? getAuth(app) : null;
const db=app ? getFirestore(app) : null;
export const speechSupported=Boolean(window.SpeechRecognition||window.webkitSpeechRecognition);
export const pointsConfigured=Boolean(app&&db&&auth);
export function waitForUser(){
  if(!auth)return Promise.reject(new Error('Firebase chưa được cấu hình.'));
  return new Promise((resolve,reject)=>{
    const unsubscribe=onAuthStateChanged(auth,async user=>{
      unsubscribe();
      if(!user)return reject(new Error('Vui lòng đăng nhập tài khoản học viên.'));
      try{await reload(user);await user.getIdToken(true);if(!user.emailVerified)throw new Error('Bạn cần xác minh email trước khi nhận điểm.');resolve(user);}catch(e){reject(e)}
    },reject);
  });
}
const walletRef=user=>doc(db,'users',user.uid,'studyPoints','wallet');
const attemptRef=(user,id)=>doc(db,'users',user.uid,'speakingAttempts',id);
const lessonRewardRef=(user,id)=>doc(db,'users',user.uid,'lessonRewards',id);
const attendanceRef=(user,id)=>doc(db,'users',user.uid,'dailyCheckins',id);
const utcDay=(d=new Date())=>d.toISOString().slice(0,10);
const dayTimestamp=day=>Timestamp.fromDate(new Date(day+'T00:00:00.000Z'));
export const localDay=()=>utcDay(); // UTC controls awards consistently across time zones.
const tsDate=v=>v&&typeof v.toDate==='function'?v.toDate():null;
const emptyWallet=()=>({balance:SETTINGS.initial,earned:0,lost:0,attempts:0,lastAttemptId:'',lastLessonId:'',lastDelta:0,lastEventType:'speaking',loginStreak:0,bestStreak:0,loginDays:0,lastLoginId:'',lastLoginAt:Timestamp.fromDate(new Date('2000-01-01T00:00:00Z'))});
function hydrated(data={}){return {...emptyWallet(),...data}}
export async function loadWallet(user){
  const snap=await getDoc(walletRef(user));return {...hydrated(snap.exists()?snap.data():{}),firstVisit:!snap.exists()};
}
export const streakBonus=streak=>streak===3?1:streak===7?3:streak===14?5:streak===30?8:0;
export const speechStreakBonus=streak=>streak>=30?3:streak>=14?2:streak>=7?1:0;
export function computeLoginReward(today,lastDay,streak,balance){
  if(today===lastDay)return {status:'already',streak,delta:0,bonus:0};
  const expectedPrevious=new Date(today+'T00:00:00.000Z');expectedPrevious.setUTCDate(expectedPrevious.getUTCDate()-1);
  const currentStreak=lastDay===utcDay(expectedPrevious)?streak+1:1;
  const bonus=streakBonus(currentStreak);
  const delta=SETTINGS.loginBase+bonus;
  return {status:'saved',streak:currentStreak,delta,bonus};
}
/** Transactionally claim at most once per UTC day. Server rules require request.time.date(). */
export async function claimDailyLogin(user){
  if(!db||!user)throw new Error('Vui lòng đăng nhập để nhận thưởng.');
  const day=utcDay(),att=attendanceRef(user,day),wallet=walletRef(user);
  return runTransaction(db,async tx=>{
    const [oldWallet,oldAtt]=await Promise.all([tx.get(wallet),tx.get(att)]);
    const state=hydrated(oldWallet.exists()?oldWallet.data():{});
    const oldDate=tsDate(state.lastLoginAt);
    const lastDay=oldDate?utcDay(oldDate):'';
    const outcome=computeLoginReward(day,lastDay,state.loginStreak,state.balance);
    if(oldAtt.exists()||outcome.status==='already')return {...outcome,status:'already',balance:state.balance};
    const delta=outcome.delta;
    const next={
      ...state,balance:state.balance+delta,earned:state.earned+delta,
      loginStreak:outcome.streak,bestStreak:Math.max(state.bestStreak,outcome.streak),loginDays:state.loginDays+1,
      lastLoginId:day,lastLoginAt:serverTimestamp(),lastEventType:'login',lastDelta:delta,
      createdAt:oldWallet.exists()?state.createdAt:serverTimestamp(),updatedAt:serverTimestamp()
    };
    if(oldWallet.exists())tx.update(wallet,next);else tx.set(wallet,next);
    tx.set(att,{day,dayAt:dayTimestamp(day),streak:outcome.streak,bonus:outcome.bonus,delta,claimedAt:serverTimestamp()});
    return {...outcome,status:'saved',balance:next.balance,day};
  });
}
export function normalizeKorean(raw){return String(raw||'').normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/[^\p{Script=Hangul}\p{Number}a-z]/gu,'');}
export function similarity(reference,spoken){
  const a=Array.from(normalizeKorean(reference)),b=Array.from(normalizeKorean(spoken));
  if(!a.length||!b.length)return 0;
  let row=Array.from({length:b.length+1},(_,j)=>j);
  for(let i=1;i<=a.length;i++){
    const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(row[j]+1,next[j-1]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next;
  }
  return Math.max(0,Math.min(100,Math.round(100*(1-row[b.length]/Math.max(a.length,b.length)))));
}
export function calculateDelta(score,mode='normal',streak=0){
  if(mode==='recovery')return score>=65?SETTINGS.recovery:0;
  return score>=60?1:0; // Mỗi bài tối đa +1 một lần, qua lessonRewards.
}
export async function commitSpeaking(user,task,score,transcripts,seconds,mode='normal'){
  if(!Number.isInteger(score)||score<0||score>100)throw new Error('Điểm bài nói không hợp lệ.');
  if(!Array.isArray(transcripts)||transcripts.length!==task.items.length)throw new Error('Dữ liệu câu nói không hợp lệ.');
  const day=utcDay(),id=`${task.id}-${day}`;
  if(!/^(sc[1-6]-\d{2}|topic-[a-z0-9-]{2,45}|recovery-[12])-\d{4}-\d{2}-\d{2}$/.test(id))throw new Error('Mã bài học không hợp lệ.');
  const attempt=attemptRef(user,id),wallet=walletRef(user);
  const result=await runTransaction(db,async tx=>{
    const [oldAttempt,oldWallet]=await Promise.all([tx.get(attempt),tx.get(wallet)]);
    const state=hydrated(oldWallet.exists()?oldWallet.data():{});
    if(oldAttempt.exists())return {status:'already',delta:0,balance:state.balance};
    if(mode!=='recovery'&&state.balance<SETTINGS.minimum)return {status:'locked',delta:0,balance:state.balance};
    const currentStreak=utcDay(tsDate(state.lastLoginAt)||new Date('2000-01-01'))===day?state.loginStreak:0;
    const delta=mode==='recovery'?calculateDelta(score,mode,currentStreak):0; // Bài nói thường ghi điểm riêng; +1 được cấp một lần qua lessonRewards.
    if(mode==='recovery'&&delta===0)return {status:'not-passed',delta:0,balance:state.balance};
    if(mode==='recovery'&&state.balance>=SETTINGS.minimum)return {status:'locked',delta:0,balance:state.balance};
    const newBalance=Math.max(0,state.balance+delta);
    const actualDelta=newBalance-state.balance;
    const next={...state,balance:newBalance,earned:state.earned+Math.max(actualDelta,0),lost:state.lost+Math.max(-actualDelta,0),attempts:state.attempts+1,lastAttemptId:id,lastDelta:actualDelta,lastEventType:'speaking',createdAt:oldWallet.exists()?state.createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
    if(oldWallet.exists())tx.update(wallet,next);else tx.set(wallet,next);
    tx.set(attempt,{taskId:task.id,taskTitle:task.title.slice(0,110),mode,day,score,delta:actualDelta,total:task.items.length,matched:transcripts.filter(x=>typeof x?.heard==='string'&&x.heard.trim()).length,transcriptJson:JSON.stringify(transcripts).slice(0,16000),createdAt:serverTimestamp()});
    return {status:'saved',delta:actualDelta,balance:newBalance,docId:id,streakBonus:currentStreak?speechStreakBonus(currentStreak):0};
  });
  if(result.status!=='saved')return result;
  if(mode==='normal'&&score>=60){
    try{
      const bonus=await claimLessonPoint(user,task.id);
      result.delta=bonus.delta||0; result.balance=bonus.balance; result.lessonRewardStatus=bonus.status;
    }catch(error){ result.lessonRewardStatus='error'; result.lessonRewardError=error?.code||error?.message||'unknown'; }
  }
  const level=String(task.level||'').startsWith('sc')?task.level:'general';
  try{
    await addDoc(collection(db,'users',user.uid,'practiceAttempts'),{
      examId:`speaking-${task.id}`.slice(0,60),examTitle:`Luyện nói: ${task.title}`.slice(0,110),level,score,total:100,durationSeconds:Math.max(0,Math.min(7200,Math.floor(seconds||0))),source:'client_practice',createdAt:serverTimestamp()
    });result.historySaved=true;
  }catch(e){result.historySaved=false;result.historyError=e?.code||e?.message||'unknown';}
  return result;
}
export async function recentAttempts(user){
  const ref=collection(db,'users',user.uid,'speakingAttempts');const snap=await getDocs(query(ref,orderBy('createdAt','desc'),limit(12)));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

/** Cộng +1 một lần duy nhất cho mỗi bài/câu chuyện, không giới hạn 200 điểm. */
export async function claimLessonPoint(user,lessonId){
  if(!db||!user)throw new Error('Vui lòng đăng nhập để nhận điểm.');
  if(!/^(sc[1-6]-(0[1-9]|1[0-5])|topic-[a-z0-9-]{2,45})$/.test(lessonId))throw new Error('Mã bài học không hợp lệ.');
  const claim=lessonRewardRef(user,lessonId),wallet=walletRef(user);
  return runTransaction(db,async tx=>{
    const [oldClaim,oldWallet]=await Promise.all([tx.get(claim),tx.get(wallet)]);
    const state=hydrated(oldWallet.exists()?oldWallet.data():{});
    if(oldClaim.exists())return {status:'already',delta:0,balance:state.balance};
    if(state.balance<SETTINGS.minimum)return {status:'locked',delta:0,balance:state.balance};
    const next={...state,balance:state.balance+1,earned:state.earned+1,
      lastLessonId:lessonId,lastEventType:'lesson',lastDelta:1,
      createdAt:oldWallet.exists()?state.createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
    if(oldWallet.exists())tx.update(wallet,next);else tx.set(wallet,next);
    tx.set(claim,{lessonId,points:1,claimedAt:serverTimestamp()});
    return {status:'saved',delta:1,balance:next.balance};
  });
}
export async function lessonAlreadyRewarded(user,id){
  return (await getDoc(lessonRewardRef(user,id))).exists();
}
