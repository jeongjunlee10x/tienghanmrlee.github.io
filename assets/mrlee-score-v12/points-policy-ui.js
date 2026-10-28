/* Single-source scoring policy display. Public JSON; no credentials or mutations. */
(()=>{'use strict';
const $=s=>document.querySelector(s);
const scriptUrl=document.currentScript?.src||new URL('assets/mrlee-score-v12/points-policy-ui.js',location.href).href;
const formatPercent=n=>Math.round(100*n)+'%';
const keys=['quiz','listening','mock','mock-listening','mock-reading','attendance'];
function set(element,value){if(element)element.textContent=String(value)}
async function init(){
 let policy;
 try{const res=await fetch(new URL('points-policy.json?v=20261028-1',scriptUrl),{cache:'no-cache'});if(!res.ok)throw Error('HTTP '+res.status);policy=await res.json();}
 catch(e){set($('#mrlee-policy-loaded'),'Chưa tải được cấu hình tự động. Bảng tóm tắt bên dưới vẫn là thông báo tham khảo.');return;}
 if(!policy?.types||!policy?.legacy||!keys.every(k=>policy.types[k]))return;
 const table=$('#mrleePolicyTable');if(table){
  const body=table.querySelector('tbody');body.replaceChildren();
  for(const key of keys){
   const item=policy.types[key],tr=document.createElement('tr');
   for(const value of [item.label,item.maxPoints>0?'Đúng ≥ '+formatPercent(item.threshold):'Không thưởng',item.maxPoints>0?('Tối đa '+item.maxPoints+' điểm'):'0 điểm']){
    const td=document.createElement('td');td.textContent=value;tr.append(td);
   }
   body.append(tr);
  }
 }
 const old=$('#mrleeLegacyTable');if(old){
  const l=policy.legacy;const rows=[
   ['Số dư ban đầu của ví cũ',l.initial+' điểm (không phải thưởng thi TOPIK)'],
   ['Đăng nhập mới theo ngày UTC','+'+l.loginBase+' điểm; mỗi ngày tối đa 1 lần'],
   ['Mốc chuỗi ngày liên tiếp','Ngày 3: +'+l.streakBonuses['3']+'; ngày 7: +'+l.streakBonuses['7']+'; ngày 14: +'+l.streakBonuses['14']+'; ngày 30: +'+l.streakBonuses['30']+' (cộng thêm điểm cơ bản, chỉ đúng ngày đạt mốc)'],
   ['Hoàn thành bài học / bài nói','+'+l.lessonPoint+' điểm/mã bài duy nhất; bài nói nhận khi đạt ≥ '+l.speakingMinimumScore+'%'],
   ['Phục hồi ví điểm','+'+l.recoveryPoints+' điểm khi số dư dưới '+l.recoveryBelowBalance+' và bài phục hồi đạt ≥ '+l.recoveryMinimumScore+'%']
  ];
  const body=old.querySelector('tbody');body.replaceChildren();for(const row of rows){let tr=document.createElement('tr');for(const value of row){let td=document.createElement('td');td.textContent=value;tr.append(td)}body.append(tr)}
 }
 const version=$('#mrlee-policy-version');set(version,'Phiên bản quy tắc: '+policy.version+' · Giờ Việt Nam (UTC+7)');
 const widget=$('#mrlee-policy-loaded');set(widget,'Đã đồng bộ quy tắc hiển thị với chương trình chấm điểm Spark.');
 const select=$('#mrleePolicyType'),correct=$('#mrleePolicyCorrect'),total=$('#mrleePolicyTotal'),result=$('#mrleePolicyEstimate');
 if(select&&correct&&total&&result){
  const render=()=>{
   const c=Number(correct.value),n=Number(total.value),t=policy.types[select.value];
   if(!Number.isSafeInteger(c)||!Number.isSafeInteger(n)||n<1||n>110||c<0||c>n){result.textContent='Nhập số câu đúng từ 0 đến tổng câu để dự tính điểm.';return;}
   const ratio=c/n;const award=t.maxPoints>0&&ratio>=t.threshold?Math.min(t.maxPoints,Math.round(t.maxPoints*ratio)):0;
   result.textContent='Đúng '+c+'/'+n+' ('+Math.round(ratio*100)+'%) → '+award+' điểm Spark. Đây là ví dụ tính toán; điểm chỉ ghi khi bài nộp được hệ thống xử lý hợp lệ và chưa được thưởng trùng.';
  };
  [select,correct,total].forEach(x=>x.addEventListener('input',render));render();
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
