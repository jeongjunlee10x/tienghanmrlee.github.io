import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,onSnapshot} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {firebaseConfig,isFirebaseConfigured} from './firebase-config.js';
import {rankEntries,searchable} from './mrlee-ranking-utils.mjs?v=server-v3';
const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const full=document.getElementById('mrlee-public-ranking');
const root=full||el('aside','mlb-sidebar');root.id=full?'mrlee-public-ranking':'mrlee-leaderboard';
root.setAttribute('aria-label','Bảng xếp hạng toàn server');
const head=el('div','mlb-head'),heading=el('div','mlb-title');
heading.append(el('small','','TIẾNG HÀN MR LEE'),el(full?'h1':'h2','','🏆 Xếp hạng toàn server'));head.append(heading);
const caption=el('p','mlb-sub','Điểm tích lũy từ ví học tập · Bằng điểm, cùng thứ hạng');
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
const size=50;
function render(){
 const mine=rows.find(x=>x.id===uid);
 personal.textContent=uid?(mine?`Bạn đứng thứ #${fmt(mine.rank)} · ${fmt(mine.points)} điểm`:'Chưa có tên của bạn. Điểm sẽ xuất hiện sau khi ví học tập được đồng bộ.'): 'Mọi người đều xem được bảng điểm. Đăng nhập để đánh dấu thứ hạng của bạn.';
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
retry.onclick=connect;
if(isFirebaseConfigured){
 const app=getApps().find(a=>a.name==='[DEFAULT]')||initializeApp(firebaseConfig);db=getFirestore(app);
 onAuthStateChanged(getAuth(app),u=>{uid=u?.uid||null;render();});connect();
}else{status.textContent='Chưa cấu hình kết nối Firebase.';}
