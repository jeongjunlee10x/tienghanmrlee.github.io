/* MR LEE: one-time legacy motivation point for a real Workbook completion.
 * Client practice only, NEVER an authoritative Spark grade or paid reward.
 * Existing Firebase wallet transaction and receipt prevent duplicate +1 across all 90 lessons.
 */
import {waitForUser,claimLessonPoint} from './mrlee-points-core.js';
const seen=new Set();
window.addEventListener('mrlee:practice-finished',async event=>{
 const d=event.detail||{},m=/^workbook-([1-6])-([1-9]|1[0-5])-([1-9]|1[0-5])$/.exec(String(d.examId||''));
 if(!m||d.total!==6||!Number.isSafeInteger(d.score)||d.score<4||d.score>6||
    !Array.isArray(d.review)||d.review.length!==6)return;
 const level=Number(m[1]),lesson=Number(m[2]);
 const lessonId='sc'+level+'-'+String(lesson).padStart(2,'0');
 if(seen.has(lessonId))return;
 seen.add(lessonId);
 let message='';
 try{
   const user=await waitForUser();
   const result=await claimLessonPoint(user,lessonId);
   if(result.status==='saved')message='⭐ Đã cộng +1 điểm động lực cũ khi hoàn thành Workbook của bài này (một lần duy nhất/mã bài).';
   else if(result.status==='already')message='ℹ Bài này đã nhận +1 điểm động lực cũ trước đây; không cộng lặp.';
   else if(result.status==='locked')message='ℹ Ví động lực dưới 20 điểm: hãy dùng bài phục hồi; điểm Spark (nếu có) vẫn được chấm riêng.';
 }catch(err){seen.delete(lessonId);message='ℹ Chưa cộng được +1 ví động lực cũ: '+String(err?.message||err);}
 const place=document.getElementById('workbookLegacyStatus')||document.getElementById('workbookSparkStatus');
 if(place&&message){const p=document.createElement('p');p.textContent=message;p.className='pro-muted';place.after(p);}
});
