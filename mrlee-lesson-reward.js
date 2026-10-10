/** Complete lesson: +1 only once for the same lesson/task. Self-declared completion (not an exam). */
import {waitForUser,claimLessonPoint,lessonAlreadyRewarded} from './mrlee-points-core.js';
const page=location.pathname.split('/').pop();
const lessonPattern=/^sc[1-6]-(0[1-9]|1[0-5])$/;
let currentUser=null;
const makeButton=id=>{
 const wrap=document.createElement('div');wrap.className='mlr-reward';wrap.dataset.lessonId=id;
 const btn=document.createElement('button');btn.type='button';btn.className='mlr-button';btn.textContent='✓ Tôi đã hoàn thành bài · +1 điểm';
 const status=document.createElement('span');status.className='mlr-status';status.setAttribute('aria-live','polite');
 wrap.append(btn,status);
 const update=async()=>{
   if(!currentUser){status.textContent='Đăng nhập để nhận điểm';return}
   try{if(await lessonAlreadyRewarded(currentUser,id)){btn.disabled=true;btn.textContent='✓ Đã nhận +1 điểm cho bài này';status.textContent='Không cộng lặp khi học lại.'}}
   catch(e){status.textContent='Không tải được trạng thái: '+(e?.code||e?.message)}
 };
 btn.addEventListener('click',async()=>{
   btn.disabled=true;status.textContent='Đang lưu vào Firebase…';
   try{
     const user=currentUser||await waitForUser();
     const res=await claimLessonPoint(user,id);
     if(res.status==='saved'){btn.textContent='✓ Đã nhận +1 điểm';status.textContent=`Số dư mới: ${res.balance.toLocaleString('vi-VN')} điểm. Một bài chỉ nhận 1 lần.`}
     else if(res.status==='already'){btn.textContent='✓ Đã nhận thưởng trước đó';status.textContent='Không cộng điểm trùng.'}
     else if(res.status==='locked'){status.textContent='Điểm dưới 20: hãy hoàn thành bài phục hồi trước.';btn.disabled=false}
   }catch(error){status.textContent='Chưa cộng được điểm: '+(error?.code||error?.message||'Lỗi');btn.disabled=false}
 });
 if(currentUser)update();return wrap;
};
function populateBasic(){
 const level=page==='so-cap-1.html'?1:2;
 document.querySelectorAll('article.lesson[id^="bai-"]').forEach(article=>{
  const n=Number(article.id.replace('bai-',''));
  if(!Number.isInteger(n)||n<1||n>15||article.querySelector('.mlr-reward'))return;
  const id=`sc${level}-${String(n).padStart(2,'0')}`;
  const where=article.querySelector('.lesson-head')||article.querySelector('h2')||article;
  where.insertAdjacentElement('afterend',makeButton(id));
 });
}
function populateRoadmap(){
 const detail=document.getElementById('rmDetail');const tag=document.getElementById('rmDetailTag');if(!detail||!tag)return;
 const update=()=>{
   const match=(tag.textContent||'').match(/CẤP\s+(\d)\s*·\s*BÀI\s+(\d+)/i);
   if(!match)return;const lvl=Number(match[1]),n=Number(match[2]);if(lvl<1||lvl>6||n<1||n>15)return;
   const id=`sc${lvl}-${String(n).padStart(2,'0')}`;
   const existing=detail.querySelector('.mlr-reward');if(existing?.dataset.lessonId===id)return;
   existing?.remove();detail.append(makeButton(id));
 };
 const obs=new MutationObserver(update);obs.observe(tag,{childList:true,characterData:true,subtree:true});update();
}
if(page==='so-cap-1.html'||page==='so-cap-2.html')populateBasic();
if(page==='lo-trinh-1-6.html')populateRoadmap();
waitForUser().then(user=>{
 currentUser=user;
 document.querySelectorAll('.mlr-reward').forEach(w=>{
   // Update is accomplished by re-evaluating the saved claim in the button's own handler.
   const id=w.dataset.lessonId;
   lessonAlreadyRewarded(user,id).then(done=>{if(done){const b=w.querySelector('button');b.disabled=true;b.textContent='✓ Đã nhận +1 điểm cho bài này';w.querySelector('.mlr-status').textContent='Không cộng lặp.'}}).catch(()=>{});
 });
}).catch(()=>{});
