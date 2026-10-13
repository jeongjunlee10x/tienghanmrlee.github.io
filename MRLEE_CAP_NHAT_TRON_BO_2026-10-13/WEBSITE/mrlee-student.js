/** Student dashboard: chỉ truy vấn các subcollection của UID đã đăng nhập. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, reload } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const $ = id => document.getElementById(id);
const vocabulary = {
  vi:{home:'Trang chủ',history:'Lịch sử',account:'Tài khoản',eyebrow:'TRUNG TÂM HỌC VIÊN',heading:'Hành trình học tập của bạn',authWaiting:'Đang xác minh tài khoản...',level:'Trình độ',all:'Tất cả',sc1:'Sơ cấp 1',sc2:'Sơ cấp 2',tc1:'Trung cấp 1',general:'Tổng hợp',refresh:'Làm mới',loading:'Đang tải lịch sử trên Firebase...',attempts:'Lượt kiểm tra',average:'Điểm trung bình',unique:'Đề đã luyện',events:'Hoạt động gần đây',latest:'Điểm luyện tập gần đây',viewAll:'Xem tất cả →',practiceNote:'Đây là điểm luyện tập tự chấm trong trình duyệt, không phải điểm thi được xác nhận bởi giáo viên.',quickLinks:'Học nhanh',test:'Kiểm tra Online',speaking:'Luyện giao tiếp',activity:'Hoạt động học gần đây',privacy:'Bảo vệ dữ liệu',privacyDesc:'Điểm và hoạt động ở trang này chỉ được truy vấn theo UID của tài khoản đang đăng nhập. Quyền đọc do Firestore Security Rules quyết định.',footer:'Trung tâm học viên',emptyAttempts:'Chưa có điểm luyện tập đã lưu.',emptyEvents:'Chưa có hoạt động học được lưu.',saved:'Đã đồng bộ dữ liệu của bạn.',error:'Không thể tải dữ liệu. Kiểm tra Internet, Firestore Rules và trạng thái xác minh email.',kindVisit:'Mở trang',kindLesson:'Xem bài',kindPractice:'Luyện tập',kindTopic:'Chủ đề',unnamed:'Bài kiểm tra'},
  ko:{home:'홈',history:'학습 기록',account:'내 계정',eyebrow:'학생 대시보드',heading:'나의 한국어 학습 기록',authWaiting:'로그인 확인 중...',level:'수준',all:'전체',sc1:'초급 1',sc2:'초급 2',tc1:'중급 1',general:'종합',refresh:'새로고침',loading:'Firebase에서 기록을 불러오는 중...',attempts:'연습 시험 횟수',average:'평균 점수',unique:'연습한 시험',events:'최근 활동',latest:'최근 연습 점수',viewAll:'모두 보기 →',practiceNote:'브라우저에서 채점한 연습 점수이며, 교사가 확인한 공식 시험 성적은 아닙니다.',quickLinks:'바로 학습하기',test:'온라인 평가',speaking:'회화 연습',activity:'최근 학습 활동',privacy:'데이터 보호',privacyDesc:'현재 로그인한 UID의 기록만 조회합니다. 접근 권한은 Firestore 보안 규칙이 확인합니다.',footer:'학생 대시보드',emptyAttempts:'저장된 연습 점수가 없습니다.',emptyEvents:'저장된 학습 활동이 없습니다.',saved:'기록을 동기화했습니다.',error:'기록을 가져올 수 없습니다. 네트워크와 Firestore 규칙을 확인하세요.',kindVisit:'페이지 열기',kindLesson:'수업 보기',kindPractice:'연습',kindTopic:'주제',unnamed:'연습 시험'},
  en:{home:'Home',history:'History',account:'Account',eyebrow:'STUDENT DASHBOARD',heading:'Your Korean learning journey',authWaiting:'Checking your account...',level:'Level',all:'All',sc1:'Beginner 1',sc2:'Beginner 2',tc1:'Intermediate 1',general:'General',refresh:'Refresh',loading:'Loading your Firebase records...',attempts:'Practice attempts',average:'Average score',unique:'Tests practiced',events:'Recent activities',latest:'Recent practice scores',viewAll:'View all →',practiceNote:'These are browser-graded practice scores, not official teacher-verified exam results.',quickLinks:'Quick learning',test:'Online Tests',speaking:'Conversation',activity:'Recent learning activity',privacy:'Data protection',privacyDesc:'This page queries records belonging only to the signed-in UID. Access is enforced by Firestore Security Rules.',footer:'Student Dashboard',emptyAttempts:'No saved practice scores yet.',emptyEvents:'No saved learning activities yet.',saved:'Your records are up to date.',error:'Unable to read records. Check Internet, Firestore Rules and email verification.',kindVisit:'Page visit',kindLesson:'Lesson',kindPractice:'Practice',kindTopic:'Topic',unnamed:'Practice Test'}
};
let lang='vi', user=null, attempts=[], events=[], inFlight=false;
function locale(){try{const v=localStorage.getItem('mrlee-language');return vocabulary[v]?v:'vi';}catch{return 'vi';}}
const t = key => vocabulary[lang][key]||key;
function translate(){lang=locale();document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(vocabulary[lang][key])el.textContent=t(key);});document.title=t('eyebrow')+' | Tiếng Hàn Mr Lee';render();}
function report(msg,error=false){$('status').textContent=msg;$('status').classList.toggle('error',error);}
function fmtDate(stamp){try {const d=stamp?.toDate?.();return d instanceof Date&&!isNaN(d)?new Intl.DateTimeFormat(lang==='ko'?'ko-KR':lang==='en'?'en-US':'vi-VN',{dateStyle:'short',timeStyle:'short'}).format(d):'—';}catch{return '—';}}
function make(tag,css='',content=''){const el=document.createElement(tag);if(css)el.className=css;if(content!==undefined)el.textContent=String(content);return el;}
function resetText(id,text){$(id).textContent=text;}
function render(){const key=$('levelFilter').value;const view=attempts.filter(x=>key==='all'||x.level===key);const percentages=view.map(x=>x.score/x.total*100);resetText('statAttempts',view.length);resetText('statAverage',view.length?`${Math.round(percentages.reduce((a,b)=>a+b,0)/view.length)}%`:'—');resetText('statUnique',new Set(view.map(x=>x.examId)).size);resetText('statEvents',events.length);
 const aBox=$('attemptRows');aBox.replaceChildren();if(!view.length)aBox.append(make('div','empty',t('emptyAttempts')));
 for(const x of view.slice(0,6)){const row=make('div','row'),info=make('div'),h=make('h3','',x.examTitle||t('unnamed')),desc=make('small','',`${t(x.level)||x.level} · ${fmtDate(x.createdAt)}`),bar=make('div','bar-track'),fill=make('div','bar-fill');fill.style.width=`${Math.max(0,Math.min(100,100*x.score/x.total))}%`;bar.append(fill);info.append(h,desc,bar);const score=make('strong','score',`${x.score}/${x.total}`);row.append(info,score);aBox.append(row);}
 const eBox=$('eventRows');eBox.replaceChildren();if(!events.length)eBox.append(make('div','empty',t('emptyEvents')));
 for(const x of events.slice(0,8)){const row=make('div','row'),info=make('div'),h=make('h3','',x.title||'—'),kind={visit:'kindVisit',lesson:'kindLesson',practice:'kindPractice',topic:'kindTopic'}[x.kind]||'kindVisit',desc=make('small','',`${t(kind)} · ${fmtDate(x.createdAt)}`);info.append(h,desc);row.append(info);eBox.append(row);}
}
async function refresh(){if(!user||inFlight)return;inFlight=true;$('refreshBtn').disabled=true;report(t('loading'));
 try{await user.getIdToken(true);const db=getFirestore(getApps()[0]);const uid=user.uid;
  const [a,e]=await Promise.all([
    getDocs(query(collection(db,'users',uid,'practiceAttempts'),orderBy('createdAt','desc'),limit(60))),
    getDocs(query(collection(db,'users',uid,'learningEvents'),orderBy('createdAt','desc'),limit(80)))
  ]);
  attempts=a.docs.map(d=>d.data()).filter(x=>Number.isInteger(x.score)&&Number.isInteger(x.total)&&x.total>0&&x.score>=0&&x.score<=x.total);
  events=e.docs.map(d=>d.data()).filter(x=>typeof x.title==='string');render();report(t('saved'));
 }catch(error){console.warn('Student dashboard Firestore',error);report(t('error')+(error.code?` (${error.code})`:''),true);}finally{inFlight=false;$('refreshBtn').disabled=false;}
}
$('refreshBtn').addEventListener('click',refresh);$('levelFilter').addEventListener('change',render);
document.addEventListener('mrlee:languagechange',()=>{translate();});translate();
if(!isFirebaseConfigured){report('Firebase config is not set.',true);}else{
 const app=getApps().length?getApps()[0]:initializeApp(firebaseConfig);
 onAuthStateChanged(getAuth(app),async current=>{
  if(!current){location.replace('dang-nhap.html?next=trung-tam-hoc-vien.html');return;}
  try{await reload(current);const a=getAuth(app).currentUser;if(!a?.emailVerified||(await a.getIdTokenResult(true)).claims.email_verified!==true){location.replace('dang-nhap.html?next=trung-tam-hoc-vien.html');return;}user=a;resetText('studentEmail',a.email||'');await refresh();}
  catch(err){console.warn('Firebase Auth:',err);report(t('error'),true);}
 },err=>{console.warn('Firebase state:',err);report(t('error'),true);});
}
