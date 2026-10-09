/** Safe page-wide daily check-in. It never blocks navigation if rules are not published. */
import { initializeApp,getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth,onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig,isFirebaseConfigured } from './firebase-config.js';
import { claimDailyLogin } from './mrlee-points-core.js';
if(isFirebaseConfigured){
 const app=getApps().find(a=>a.name==='[DEFAULT]')||initializeApp(firebaseConfig);
 const auth=getAuth(app);
 let currentUid='';
 onAuthStateChanged(auth,async user=>{
   if(!user){currentUid='';return;}
   if(currentUid===user.uid)return;
   currentUid=user.uid;
   try{
     await user.getIdToken(true);
     if(!user.emailVerified)return;
     const claimed=await claimDailyLogin(user);
     if(claimed.status!=='saved'||claimed.delta<1)return;
     const el=document.createElement('div');el.className='mrlee-login-reward';el.setAttribute('role','status');
     el.textContent=`⭐ Đăng nhập hôm nay: +${claimed.delta} điểm · Streak ${claimed.streak} ngày!`;
     Object.assign(el.style,{position:'fixed',right:'14px',bottom:'16px',maxWidth:'min(410px,90vw)',background:'#11365a',color:'white',padding:'12px 16px',borderRadius:'14px',zIndex:'99999',boxShadow:'0 12px 28px #17365044',font:'600 14px Be Vietnam Pro, sans-serif'});
     document.body.append(el);setTimeout(()=>el.remove(),6500);
   }catch(error){console.warn('MR Lee: chưa nhận điểm đăng nhập:',error?.code||error?.message||error);}
 });
}
