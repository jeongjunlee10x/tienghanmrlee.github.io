/** MR LEE - Public opt-in leaderboard. Only alias, motivation points and streak are published. */
import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged,reload} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,doc,getDoc,setDoc,deleteDoc,query,orderBy,limit,onSnapshot,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {firebaseConfig,isFirebaseConfigured} from './firebase-config.js';
import {loadWallet,claimDailyLogin} from './mrlee-points-core.js';

const create=(tag,cl,text)=>{const el=document.createElement(tag);if(cl)el.className=cl;if(text!==undefined)el.textContent=String(text);return el;};
const pretty=(n)=>Number(n||0).toLocaleString('vi-VN');
const aside=create('aside','mlb-sidebar');aside.id='mrlee-leaderboard';aside.setAttribute('aria-label','Bảng xếp hạng học tập');
const toggle=create('button','mlb-toggle','🏆 Xếp hạng');toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','mrlee-leaderboard');
const head=create('div','mlb-head');
const heading=create('div','mlb-title');heading.append(create('small','', 'THÀNH TÍCH HỌC TẬP'),create('h2','', '🏆 Bảng xếp hạng'));
const close=create('button','mlb-close','×');close.type='button';close.setAttribute('aria-label','Thu gọn bảng xếp hạng');head.append(heading,close);
const caption=create('p','mlb-sub','Xếp theo điểm động lực tích lũy · Không giới hạn mức điểm');
const list=create('ol','mlb-list');list.setAttribute('aria-live','polite');
const status=create('p','mlb-status','Đang tải bảng điểm…');status.setAttribute('aria-live','polite');
const area=create('section','mlb-participate');area.append(create('h3','','Tham gia xếp hạng'));
const help=create('p','mlb-help','Chỉ biệt danh, điểm và streak được hiển thị. Bạn chủ động tham gia hoặc rời bảng.');
const form=create('form','mlb-form');
const nickname=create('input','mlb-input');nickname.type='text';nickname.minLength=2;nickname.maxLength=30;nickname.placeholder='Biệt danh (2–30 ký tự)';nickname.setAttribute('aria-label','Biệt danh trên bảng xếp hạng');nickname.required=true;
const join=create('button','mlb-join','Tham gia BXH');join.type='submit';form.append(nickname,join);
const leave=create('button','mlb-leave','Ẩn tên khỏi bảng');leave.type='button';leave.hidden=true;
const personal=create('p','mlb-personal','Đăng nhập để xem điểm và tham gia.');personal.setAttribute('aria-live','polite');
area.append(help,form,leave,personal);aside.append(head,caption,status,list,area);document.body.append(aside,toggle);document.body.classList.add('mlb-enabled');
const setOpen=v=>{aside.classList.toggle('mlb-open',v);toggle.setAttribute('aria-expanded',String(v));};
toggle.addEventListener('click',()=>setOpen(!aside.classList.contains('mlb-open')));close.addEventListener('click',()=>setOpen(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
let auth=null,db=null,user=null,unsubWallet=null,refreshing=false,refreshQueued=false;
function rankRows(items){
 list.replaceChildren();status.textContent=items.length ? `Top ${items.length} học viên đã đăng ký hiển thị` : 'Chưa có học viên tham gia bảng xếp hạng.';
 items.forEach((entry,i)=>{
   const li=create('li','mlb-item');
   if(user&&entry.id===user.uid)li.classList.add('mlb-is-me');
   const rank=create('span','mlb-position',i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`);
   const profile=create('div','mlb-profile');profile.append(create('strong','',entry.alias),create('small','',`🔥 ${pretty(entry.streak)} ngày liên tiếp`));
   const points=create('strong','mlb-points',`${pretty(entry.points)} đ`);li.append(rank,profile,points);list.append(li);
 });
}
async function refreshSelf(){
 if(!user||refreshing){refreshQueued=true;return;}
 refreshing=true;
 try{
   const wallet=await loadWallet(user);
   personal.textContent=`Điểm của bạn: ${pretty(wallet.balance)} · Streak ${pretty(wallet.loginStreak)}`;
   const ref=doc(db,'mrleeLeaderboard',user.uid);const old=await getDoc(ref);
   if(!old.exists()){
     leave.hidden=true;join.textContent='Tham gia BXH';
   }else{
     const data=old.data();nickname.value=data.alias||nickname.value;
     leave.hidden=false;join.textContent='Lưu biệt danh';
     if(data.points!==wallet.balance||data.streak!==wallet.loginStreak){
       await setDoc(ref,{alias:data.alias,points:wallet.balance,streak:wallet.loginStreak,updatedAt:serverTimestamp()});
     }
   }
 }catch(error){personal.textContent='Chưa tải được điểm hoặc quyền Firebase: '+(error?.code||error?.message||'Lỗi kết nối')}
 finally{refreshing=false;if(refreshQueued){refreshQueued=false;setTimeout(refreshSelf,200)}}
}
form.addEventListener('submit',async e=>{
 e.preventDefault();
 if(!user){personal.textContent='Vui lòng đăng nhập và xác minh email trước.';return;}
 const alias=nickname.value.trim();if(alias.length<2||alias.length>30){personal.textContent='Biệt danh phải dài từ 2–30 ký tự.';return;}
 join.disabled=true;
 try{
  let wallet=await loadWallet(user);
  if(wallet.firstVisit){await claimDailyLogin(user);wallet=await loadWallet(user)}
  await setDoc(doc(db,'mrleeLeaderboard',user.uid),{alias,points:wallet.balance,streak:wallet.loginStreak,updatedAt:serverTimestamp()});
  personal.textContent=`Đã lưu biệt danh, ${pretty(wallet.balance)} điểm. Bạn có thể rời bảng bất cứ lúc nào.`;
  join.textContent='Lưu biệt danh';leave.hidden=false;
 }catch(error){personal.textContent='Không lưu được bảng xếp hạng: '+(error?.code||error?.message||'Lỗi')}
 finally{join.disabled=false}
});
leave.addEventListener('click',async()=>{
 if(!user)return;
 leave.disabled=true;
 try{await deleteDoc(doc(db,'mrleeLeaderboard',user.uid));personal.textContent='Đã ẩn biệt danh và điểm khỏi bảng công khai.';leave.hidden=true;join.textContent='Tham gia BXH';}
 catch(error){personal.textContent='Chưa ẩn được: '+(error?.code||error?.message||'Lỗi')}
 finally{leave.disabled=false}
});
if(isFirebaseConfigured){
 const app=getApps().find(a=>a.name==='[DEFAULT]')||initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);
 const q=query(collection(db,'mrleeLeaderboard'),orderBy('points','desc'),limit(10));
 onSnapshot(q,s=>rankRows(s.docs.map(d=>({id:d.id,alias:String(d.data().alias||'Học viên').slice(0,30),points:d.data().points,streak:d.data().streak}))),e=>{
   status.textContent='Không tải được BXH. Hãy Publish Firestore Rules mới: '+(e?.code||'permission-denied');list.replaceChildren();
 });
 onAuthStateChanged(auth,async next=>{
  user=null;if(unsubWallet){unsubWallet();unsubWallet=null}
  if(!next){form.hidden=true;leave.hidden=true;personal.textContent='Đăng nhập và xác minh email để tham gia.';return;}
  try{await reload(next);await next.getIdToken(true);if(!next.emailVerified)throw new Error('Bạn cần xác minh email.');}
  catch(error){form.hidden=true;personal.textContent=error?.message||'Chưa xác minh email';return}
  user=next;form.hidden=false;nickname.value='Học viên '+next.uid.slice(0,4).toUpperCase();
  unsubWallet=onSnapshot(doc(db,'users',next.uid,'studyPoints','wallet'),()=>{refreshSelf()},error=>{personal.textContent='Không đọc được ví điểm: '+(error?.code||'Lỗi')});
 });
}else{status.textContent='Firebase chưa được cấu hình.';form.hidden=true}
