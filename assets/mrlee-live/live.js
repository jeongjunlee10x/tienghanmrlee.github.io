/** TIẾNG HÀN MR LEE — live update notifications v3, without public PII. */
import { firebaseConfig, isFirebaseConfigured } from '../../firebase-config.js';

const prefix = 'mrlee-live-v3';
const safeGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
const safePut = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
const safeJSON = text => { try { return JSON.parse(text) || []; } catch { return []; } };
const now = () => Date.now();
const root = new URL('../../', import.meta.url);
const storageKey = `${prefix}:public`;
let items = Array.isArray(safeJSON(safeGet(storageKey))) ? safeJSON(safeGet(storageKey)).slice(0,60) : [];
let userId = '';
let ownItems = [];
let stopOwn = [];
let initialized = false;
let toastTimeout;
const make = (tag,attrs={},text='') => {const el=document.createElement(tag);for(const [key,val] of Object.entries(attrs)){if(key==='className') el.className=val;else el.setAttribute(key,val);}el.textContent=text;return el;};
const bell = make('button',{type:'button',id:'mrlee-live-bell','aria-label':'Mở thông báo cập nhật','aria-expanded':'false'},'🔔');
const count = make('span',{id:'mrlee-live-count','aria-hidden':'true'});
count.hidden = true;bell.append(count);
const panel = make('section',{id:'mrlee-live-panel','aria-label':'Thông báo cập nhật'});panel.hidden=true;
const head=make('div',{className:'mrlee-live-head'});
const title=make('strong',{},'Thông báo mới');
const mark=make('button',{type:'button',className:'mrlee-live-action'},'Đánh dấu đã đọc');
const close=make('button',{type:'button',className:'mrlee-live-action','aria-label':'Đóng thông báo'},'×');
head.append(title,mark,close);
const list=make('div',{className:'mrlee-live-list'});
const foot=make('div',{className:'mrlee-live-foot'},'Dữ liệu Firestore đồng bộ khi có mạng. Bản cập nhật website yêu cầu tải lại khi bạn sẵn sàng.');
panel.append(head,list,foot);
const toast=make('div',{id:'mrlee-live-toast',role:'status','aria-live':'polite'});toast.hidden=true;
function mount(){if(document.body.contains(panel)) return; const header=document.querySelector('.site-header .header-inner');const menu=header?.querySelector('#menuToggle'); if(header)header.insertBefore(bell,menu||null);else {bell.classList.add('mrlee-live-floating');document.body.append(bell);}document.body.append(panel,toast);render();}
function save(){safePut(storageKey,JSON.stringify(items.slice(0,60)));if(userId)safePut(`${prefix}:user:${userId}`,JSON.stringify(ownItems.slice(0,40)));}
function allItems(){return [...ownItems,...items].sort((a,b)=>b.time-a.time).slice(0,80);}
function render(){const unread=allItems().filter(x=>!x.read).length;count.hidden=!unread;count.textContent=unread>99?'99+':String(unread);list.replaceChildren();const recent=allItems();if(!recent.length){list.append(make('div',{className:'mrlee-live-foot'},'Chưa có thông báo. Những cập nhật tiếp theo sẽ xuất hiện ở đây.'));return;}for(const x of recent){const btn=make('button',{type:'button',className:'mrlee-live-item','data-unread':String(!x.read)});btn.append(make('b',{},x.title),make('span',{},x.body));btn.addEventListener('click',()=>{x.read=true;save();render();if(x.href && x.href.startsWith(root.href)) location.assign(x.href);});list.append(btn);}}
function showToast(titleText){toast.textContent=titleText;toast.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.hidden=true,5000);}
function addNotice({id,title,body='',href='',scope='public',quiet=false}){
 if(!id || !title)return;
 const bag=scope==='user' && userId?ownItems:items;
 if(bag.some(x=>x.id===id))return;
 bag.unshift({id:String(id).slice(0,180),title:String(title).slice(0,145),body:String(body).slice(0,400),href:String(href).slice(0,450),read:false,time:now()});
 if(bag.length>60)bag.length=60;
 save();render();if(!quiet)showToast(title);
}
window.MRLEEUpdates = Object.freeze({notify:({id,title,body,href})=>addNotice({id:id||`local:${now()}`,title,body,href}),checkWebsite:()=>checkStatic(true)});
window.addEventListener('mrlee:data-updated',event=>{
 const data=event.detail||{};
 if(data.title && typeof data.title==='string') addNotice({id:data.id||`event:${now()}`,title:data.title,body:data.body||'Dữ liệu trên website đã thay đổi.'});
});
bell.addEventListener('click',()=>{panel.hidden=!panel.hidden;bell.setAttribute('aria-expanded',String(!panel.hidden));});close.addEventListener('click',()=>{panel.hidden=true;bell.setAttribute('aria-expanded','false');});mark.addEventListener('click',()=>{allItems().forEach(x=>x.read=true);save();render();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;bell.setAttribute('aria-expanded','false');}});

// Static GitHub Pages assets do not auto-refresh themselves. Check for changed
// published HTML / university data, and invite user to reload without losing work.
const resources = [new URL('index.html',root),new URL('university-map/universities.json',root)];
const activePage = new URL(location.href);
if(activePage.origin===root.origin && activePage.pathname.startsWith(root.pathname) && activePage.pathname.endsWith('.html') && !resources.some(x=>x.pathname===activePage.pathname)) resources.push(new URL(activePage.pathname,root.origin));
const encoder=new TextEncoder();
async function digest(text){const buffer=await crypto.subtle.digest('SHA-256',encoder.encode(text));return [...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,32);}
let checking=false;
async function checkStatic(manual=false){if(checking||!navigator.onLine)return;checking=true;try{for(const res of resources){const url=new URL(res);url.searchParams.set('_mrlee_updated',String(now()));const r=await fetch(url.href,{cache:'no-store'});if(!r.ok||r.status>=400)continue;const type=r.headers.get('content-type')||'';if(res.pathname.endsWith('.json')&&!type.includes('json'))continue;const body=await r.text();if(body.length>2000000)continue;const hash=await digest(body);const key=`${prefix}:hash:${res.pathname}`;const previous=safeGet(key);if(previous && previous!==hash){addNotice({id:`site:${res.pathname}:${hash}`,title:res.pathname.endsWith('index.html')?'Trang chủ vừa được cập nhật':res.pathname.endsWith('.json')?'Danh mục trường đại học vừa được cập nhật':'Trang nội dung đang xem vừa được cập nhật',body:'Nội dung mới đã được xuất bản. Tải lại trang để xem dữ liệu mới nhất.',href:location.href.split('#')[0]});}safePut(key,hash);}if(manual)showToast('Đã kiểm tra phiên bản website.');}catch(err){if(manual)showToast('Chưa kết nối được để kiểm tra cập nhật.');}finally{checking=false;}}
setInterval(()=>{if(!document.hidden)checkStatic();},120000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkStatic();});
window.addEventListener('online',()=>checkStatic());

function documentSignature(snapshot){if(!snapshot.exists())return 'missing';const d=snapshot.data();let s='';for(const k of ['updatedAt','balance','points','streak','highSchoolStatus','program','status']){const v=d[k];s+=k+':'+(v?.toMillis?.()??(typeof v==='string'||typeof v==='number'?v:''))+'|';}return s;}
function watchOwn(db, uid, onSnapshotFn, docFn){stopOwn.forEach(f=>f());stopOwn=[];if(!uid)return;for(const [name,route,titleText] of [['Điểm học tập',`users/${uid}/studyPoints/wallet`,'Điểm học tập đã được cập nhật'],['Hồ sơ đăng ký',`studentRegistrations/${uid}`,'Hồ sơ đăng ký của bạn đã thay đổi'],['Hồ sơ học viên',`users/${uid}`,'Thông tin tài khoản đã thay đổi']]){let primed=false,last='';const unsub=onSnapshotFn(docFn(db,route),s=>{if(s.metadata.fromCache)return;const sig=documentSignature(s);if(!primed){primed=true;last=sig;return;}if(sig!==last){last=sig;addNotice({id:`own:${route}:${now()}`,title:titleText,body:'Thông tin của bạn đã được đồng bộ từ máy chủ.',scope:'user'});}},e=>{console.info('[MRLEE] Không theo dõi được mục riêng:',name,e.code||'unknown');});stopOwn.push(unsub);}}
async function initFirebase(){if(!isFirebaseConfigured)return;try{
  const [appSdk,authSdk,storeSdk] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
  ]);
  const {initializeApp,getApps}=appSdk;
  const {getAuth,onAuthStateChanged}=authSdk;
  const {getFirestore,collection,doc,query,limit,orderBy,onSnapshot}=storeSdk;
  const app=getApps().find(a=>a.options.projectId===firebaseConfig.projectId)||initializeApp(firebaseConfig);const db=getFirestore(app);const auth=getAuth(app);
  let primed=false,last='';
  onSnapshot(query(collection(db,'mrleePublicLeaderboard'),limit(100)),s=>{if(s.metadata.fromCache)return;const raw=s.docs.map(d=>{const x=d.data();return `${d.id}:${x.points??''}:${x.streak??''}:${x.updatedAt?.toMillis?.()??''}`;}).sort().join('~');const stamp=raw.length+':'+raw;const key=`${prefix}:publicRankSignature`;const saved=safeGet(key);if(primed||saved){if(saved!==stamp)addNotice({id:`ranking:${now()}`,title:'Bảng xếp hạng vừa được cập nhật',body:'Điểm hoặc thứ hạng công khai có thay đổi.',href:new URL('bang-xep-hang.html',root).href});}primed=true;safePut(key,stamp);},e=>console.info('[MRLEE] Bảng điểm realtime chưa khả dụng',e.code||'unknown'));
  // Admin-only publishing via Firebase Console / trusted backend. No public client writes.
  let firstPublic=true;
  onSnapshot(query(collection(db,'siteAnnouncements'),orderBy('createdAt','desc'),limit(25)),s=>{const changes=s.docChanges();for(const change of changes){if(change.type==='removed')continue;const data=change.doc.data();if(data.active!==true)continue;const id='announcement:'+change.doc.id+':'+(data.updatedAt?.toMillis?.()||'0');addNotice({id,title:data.title||'Thông báo từ MR LEE',body:data.message||'',href: typeof data.href==='string'&&data.href.startsWith(root.href)?data.href:'',quiet:firstPublic});}firstPublic=false;},e=>console.info('[MRLEE] siteAnnouncements chưa có quyền đọc; cần triển khai Rules',e.code||'unknown'));
  onAuthStateChanged(auth,user=>{stopOwn.forEach(f=>f());stopOwn=[];userId=user?.emailVerified?user.uid:'';ownItems=userId?safeJSON(safeGet(`${prefix}:user:${userId}`)):[];if(!Array.isArray(ownItems))ownItems=[];render();if(userId)watchOwn(db,userId,onSnapshot,doc);},()=>{userId='';ownItems=[];render();});
 }catch(err){console.warn('[MRLEE] Không khởi tạo được realtime notifications',err);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
checkStatic();initFirebase();
