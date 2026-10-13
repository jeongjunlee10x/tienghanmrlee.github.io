import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged,reload} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,doc,getDoc,setDoc,onSnapshot,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {firebaseConfig,isFirebaseConfigured} from './firebase-config.js';
import {rankEntries,searchable} from './mrlee-ranking-utils.mjs?v=spark-v4';
const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const full=document.getElementById('mrlee-public-ranking');
const root=full||el('aside','mlb-sidebar');root.id=full?'mrlee-public-ranking':'mrlee-leaderboard';
root.setAttribute('aria-label','Bảng xếp hạng toàn server');
const head=el('div','mlb-head'),heading=el('div','mlb-title');
heading.append(el('small','','TIẾNG HÀN MR LEE'),el(full?'h1':'h2','','🏆 Xếp hạng toàn server'));head.append(heading);
const caption=el('p','mlb-sub','Điểm động lực từ ví học tập · Bằng điểm, cùng thứ hạng · Firebase Spark');
const status=el('p','mlb-status','Đang kết nối bảng điểm…');status.setAttribute('role','status');
const personal=el('p','mlb-personal','Đăng nhập để đánh dấu thứ hạng của bạn.');
const search=el('input','mlb-input');search.type='search';search.placeholder='Tìm tên học viên…';search.setAttribute('aria-label','Tìm tên trong bảng xếp hạng toàn server');
const list=el('ol','mlb-list');list.setAttribute('aria-label','Thứ hạng, học viên và tổng điểm');
const nav=el('nav','mlb-pagination');nav.setAttribute('aria-label','Trang bảng xếp hạng');
const prev=el('button','mlb-join','← Trước'),next=el('button','mlb-join','Tiếp →'),pageLabel=el('span');prev.type=next.type='button';nav.append(prev,pageLabel,next);
const retry=el('button','mlb-join','Thử kết nối lại');retry.type='button';retry.hidden=true;
root.append(head,caption,status,personal);if(full)root.append(search);root.append(list);if(full)root.append(nav);root.append(retry);
if(!full){
 const link=el('a','mlb-all','Xem tất cả học viên →');link.href='bang-xep-hang.html';root.append(link);
 const close=el('button','mlb-close','×');close.type='button';close.setAttribute('aria-label','Thu gọn bảng xếp hạng');head.append(close);
 const toggle=el('button','mlb-toggle','🏆 Xếp hạng');toggle.type='button';toggle.setAttribute('aria-controls',root.id);toggle.setAttribute('aria-expanded','false');
 const open=v=>{root.classList.toggle('mlb-open',v);toggle.setAttribute('aria-expanded',String(v));};
 toggle.onclick=()=>open(!root.classList.contains('mlb-open'));close.onclick=()=>{open(false);toggle.focus();};document.addEventListener('keydown',e=>{if(e.key==='Escape')open(false);});
 document.body.append(root,toggle);document.body.classList.add('mlb-enabled');
}
let rows=[],uid=null,page=0,stop=null,db=null,connected=false,fromCache=false;
let authVersion=0,stopWallet=null,authUser=null,syncRunning=false,pendingWallet=null,lastSyncError='';
const size=50;
function render(){
 const mine=rows.find(x=>x.id===uid);
 personal.textContent=uid?(mine?`Bạn đứng thứ #${fmt(mine.rank)} · ${fmt(mine.points)} điểm`:'Chưa có tên của bạn. Hãy đăng nhập và mở trang để đồng bộ ví điểm.'): 'Mọi người đều xem được bảng điểm. Đăng nhập để đánh dấu thứ hạng của bạn.';
 const filtered=full?rows.filter(x=>searchable(x.alias).includes(searchable(search.value.trim()))):rows;
 const pages=Math.max(1,Math.ceil(filtered.length/size));page=Math.min(page,pages-1);
 list.replaceChildren();
 const visible=full?filtered.slice(page*size,(page+1)*size):rows.slice(0,10);
 for(const row of visible){
  const item=el('li','mlb-item'+(row.id===uid?' mlb-is-me':''));
  const rank=el('span','mlb-position',`#${fmt(row.rank)}`);
  const profile=el('div','mlb-profile');profile.append(el('strong','',row.alias+(row.id===uid?' (Bạn)':'')),el('small','',row.rank<=3?['🥇 Hạng nhất','🥈 Hạng nhì','🥉 Hạng ba'][row.rank-1]:`🔥 ${fmt(row.streak)} ngày liên tiếp`));
  item.append(rank,profile,el('strong','mlb-points',`${fmt(row.points)} điểm`));list.append(item);
 }
 if(connected)status.textContent=(fromCache?'Dữ liệu tạm lưu · Chờ kết nối server. ': 'Đã đồng bộ · ')+`${fmt(rows.length)} học viên`+(full&&search.value?` · ${fmt(filtered.length)} kết quả`:'')+(!rows.length?' · Chưa có dữ liệu xếp hạng.':'');
 if(connected&&rows.length&&!filtered.length)list.append(el('li','mlb-empty','Không tìm thấy tên phù hợp.'));
 pageLabel.textContent=`${page+1} / ${pages}`;prev.disabled=page===0;next.disabled=page>=pages-1;nav.hidden=pages===1;
}
search.addEventListener('input',()=>{page=0;render();});prev.onclick=()=>{page--;render();};next.onclick=()=>{page++;render();};
function connect(){
 if(stop)stop();retry.hidden=true;status.textContent='Đang kết nối bảng điểm…';
 stop=onSnapshot(collection(db,'mrleePublicLeaderboard'),{includeMetadataChanges:true},snapshot=>{
  rows=rankEntries(snapshot.docs.map(d=>({id:d.id,...d.data()})));connected=true;fromCache=snapshot.metadata.fromCache;render();
 },error=>{
  connected=false;rows=[];render();retry.hidden=false;
  status.textContent=error.code==='permission-denied'?'Chưa mở quyền đọc bảng xếp hạng trên Firebase. Quản trị viên cần cài quy tắc đi kèm.':'Chưa kết nối được bảng điểm. Hãy kiểm tra mạng rồi thử lại.';
 });
}
// Firebase Spark: website tự đồng bộ bản ghi công khai từ VÍ THẬT của chính người đăng nhập.
// Không tạo dữ liệu thưởng; không thay đổi ví; không dùng Cloud Functions.
function safeAlias(value){
  const text=typeof value==='string'?value.trim():'';
  return text.length>=2?text.slice(0,30):'';
}
async function synchronizeSelf(user,wallet,version){
  if(!authUser||authUser.uid!==user.uid||version!==authVersion)return;
  const points=wallet.balance,streak=wallet.loginStreak;
  if(!Number.isSafeInteger(points)||points<0||!Number.isSafeInteger(streak)||streak<0)return;
  const rankingRef=doc(db,'mrleePublicLeaderboard',user.uid);
  // Không công bố email. Tên lấy từ hồ sơ, hoặc tên tài khoản, hoặc biệt danh mặc định.
  let alias=safeAlias(user.displayName);
  try{
    const profile=await getDoc(doc(db,'users',user.uid));
    alias=safeAlias(profile.data()?.displayName)||alias;
  }catch(err){ /* Hồ sơ có thể chưa tồn tại; vẫn đồng bộ ví với biệt danh mặc định. */ }
  if(!authUser||authUser.uid!==user.uid||version!==authVersion)return;
  const previous=await getDoc(rankingRef);
  alias=alias||safeAlias(previous.data()?.alias)||('Học viên '+user.uid.slice(0,6).toUpperCase());
  // Tránh ghi liên tục, tiết kiệm hạn mức Spark.
  if(previous.exists()&&previous.data().points===points&&previous.data().streak===streak&&previous.data().alias===alias)return;
  if(!authUser||authUser.uid!==user.uid||version!==authVersion)return;
  await setDoc(rankingRef,{alias,points,streak,updatedAt:serverTimestamp()});
}
function queueWalletSync(user,wallet,version){
  if(!wallet)return;
  pendingWallet={user,wallet,version};
  if(syncRunning)return;
  syncRunning=true;
  (async()=>{
    try{
      while(pendingWallet){
        const job=pendingWallet;pendingWallet=null;
        if(job.version!==authVersion)continue;
        try{await synchronizeSelf(job.user,job.wallet,job.version);lastSyncError='';}
        catch(e){
          lastSyncError=e?.code||e?.message||'unknown';
          console.warn('[MRLEE Spark] Đồng bộ bảng xếp hạng:',e);
        }
        render();
      }
    }finally{syncRunning=false;}
  })();
}
function stopCurrentWallet(){
  if(stopWallet){stopWallet();stopWallet=null;}
  pendingWallet=null;
}
async function handleLogin(user){
  const version=++authVersion;
  stopCurrentWallet();
  authUser=null;uid=user?.uid||null;lastSyncError='';render();
  if(!user)return;
  try{
    await reload(user);
    await user.getIdToken(true);
    if(!user.emailVerified)throw new Error('Cần xác minh email để đồng bộ điểm.');
  }catch(err){
    if(version===authVersion)personal.textContent=err?.message||'Chưa xác minh email';
    return;
  }
  if(version!==authVersion)return;
  authUser=user;
  stopWallet=onSnapshot(
    doc(db,'users',user.uid,'studyPoints','wallet'),
    {includeMetadataChanges:true},
    snapshot=>{
      if(version!==authVersion)return;
      if(!snapshot.exists()){
        personal.textContent='Chưa có ví điểm. Hãy đăng nhập/điểm danh để khởi tạo ví trước.';
        return;
      }
      // Chỉ công bố điểm đã xác nhận từ server, không dùng dữ liệu đang ghi cục bộ.
      if(snapshot.metadata.fromCache||snapshot.metadata.hasPendingWrites)return;
      queueWalletSync(user,snapshot.data(),version);
    },
    error=>{if(version===authVersion)personal.textContent='Không đọc được ví điểm: '+(error?.code||'Lỗi kết nối');}
  );
}
retry.onclick=connect;
if(isFirebaseConfigured){
 const app=getApps().find(a=>a.name==='[DEFAULT]')||initializeApp(firebaseConfig);db=getFirestore(app);
 onAuthStateChanged(getAuth(app),handleLogin);connect();
}else{status.textContent='Chưa cấu hình kết nối Firebase.';}
