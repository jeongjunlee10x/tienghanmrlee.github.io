/** Firestore: ghi chú riêng của học viên theo UID, rules phân quyền phía máy chủ. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app), db = getFirestore(app);
const note = document.getElementById('note'), msg=document.getElementById('msg');
const saveBtn=document.getElementById('save');
let currentUser=null, alreadyExists=false, originalCreatedAt=null;
function status(text,error=false){msg.textContent=text;msg.className=error?'error':'ok';}
async function load(u){
  currentUser=u?.emailVerified?u:null;
  if(!currentUser)return;
  saveBtn.disabled=true;
  try{
    await currentUser.getIdToken(true);
    const snap=await getDoc(doc(db,'users',currentUser.uid,'notes','main'));
    alreadyExists=snap.exists();
    if(alreadyExists){note.value=String(snap.data().text||'');originalCreatedAt=snap.data().createdAt;}
    status('Đã tải sổ tay riêng của bạn.');
  }catch(e){console.warn(e);status('Không tải được. Kiểm tra Firestore đã bật và Rules đã xuất bản.',true);}
  finally{saveBtn.disabled=false;}
}
onAuthStateChanged(auth,load);
saveBtn.addEventListener('click',async()=>{
  if(!currentUser){status('Cần đăng nhập lại.',true);return;}
  const text=note.value.trim();
  if(!text||text.length>2000){status('Ghi chú phải từ 1 đến 2000 ký tự.',true);return;}
  saveBtn.disabled=true;
  try{
    await currentUser.getIdToken(true);
    const path=doc(db,'users',currentUser.uid,'notes','main');
    const payload={text,updatedAt:serverTimestamp()};
    if(!alreadyExists)payload.createdAt=serverTimestamp();
    await setDoc(path,payload,{merge:true});
    alreadyExists=true;
    status('Ghi chú đã lưu an toàn trong tài khoản.');
  }catch(e){console.warn(e);status('Lưu thất bại. Kiểm tra quyền truy cập Firestore.',true);}
  finally{saveBtn.disabled=false;}
});
