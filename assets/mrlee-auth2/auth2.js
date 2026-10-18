/** MR LEE consultation CTA state: same modular Firebase Auth SDK as restored login. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from '../../firebase-config.js';
const root=document.documentElement;
if(isFirebaseConfigured){
 try{
  const app=getApps().length?getApps()[0]:initializeApp(firebaseConfig);
  onAuthStateChanged(getAuth(app),user=>{
   root.dataset.mrleeAuth2=user?.emailVerified?'verified':'guest';
  },error=>{
   console.warn('MR LEE auth2: không xác nhận được đăng nhập',error?.code||error);
   root.dataset.mrleeAuth2='guest';
  });
 }catch(error){
  console.warn('MR LEE auth2: Firebase chưa sẵn sàng',error?.code||error);
  root.dataset.mrleeAuth2='guest';
 }
}else root.dataset.mrleeAuth2='guest';
