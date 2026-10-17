/* MR LEE V26 — in-browser checks of same-origin PUBLIC static resources only.
   No token, no Firebase access, no form data, no third-party endpoint, no writes. */
(()=>{'use strict';
const groups=[
 {title:'Trang chủ & Học tập',icon:'📚',files:[['Trang chủ','index.html'],['Học tiếng Hàn','hoc-tieng-han.html'],['Bài học','bai-hoc.html'],['Thư viện nghe','nghe-toan-bo.html'],['Giao tiếp','giao-tiep-theo-chu-de.html']]},
 {title:'Luyện thi & Học viên',icon:'🎓',files:[['TOPIK PRO','mrlee-topik-pro.html'],['Thi TOPIK','thi-topik-online.html'],['Bảng xếp hạng','bang-xep-hang.html'],['Trung tâm học viên','trung-tam-hoc-vien.html'],['Đăng nhập','dang-nhap.html']]},
 {title:'Du học & Bản đồ',icon:'🗺',files:[['Bản đồ SVG','ban-do-dai-hoc-han-quoc.html'],['Danh mục trường','university-map/universities.json'],['Vùng bản đồ','university-map/province-shapes.json'],['Tư vấn định hướng','du-hoc-buoc-1-tu-van-dinh-huong.html'],['Chuẩn bị hồ sơ','du-hoc-buoc-2-chuan-bi-ho-so.html'],['Nộp hồ sơ & visa','du-hoc-buoc-3-nop-ho-so-visa.html'],['Xuất cảnh & nhập học','du-hoc-buoc-4-xuat-canh-nhap-hoc.html'],['Sau nhập học','du-hoc-buoc-5-ho-tro-sau-nhap-hoc.html']]},
 {title:'Nhận diện & Tài nguyên',icon:'✦',files:[['Logo chính thức','assets/branding/logo-mrlee.png'],['CSS V23','assets/v23/design-system.css'],['CSS V24','assets/v24/deep-ui.css'],['CSS V25','assets/v25/experience.css'],['CSS V26','assets/v26/health.css'],['JavaScript V26','assets/v26/health.js']]}
];
const $=id=>document.getElementById(id),rows=[],results=[];
for(const [g,group] of groups.entries()){
 const box=document.createElement('section');box.className='check-group';
 const title=document.createElement('div');title.className='check-title';
 const ico=document.createElement('span');ico.className='group-icon';ico.textContent=group.icon;
 const bold=document.createElement('b');bold.textContent=group.title;
 const small=document.createElement('small');small.id='group'+g;small.textContent=group.files.length+' hạng mục';
 title.append(ico,bold,small);box.append(title);
 for(const [label,path] of group.files){
  const line=document.createElement('div');line.className='check-item';line.dataset.state='idle';
  const a=document.createElement('a');a.href=path;a.textContent=label;
  const st=document.createElement('span');st.className='state';st.textContent='Chưa kiểm tra';
  line.append(a,st);box.append(line);rows.push({group:g,label,path,line,state:st});
 }
 $('checks').append(box);
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function check(item){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),11000);
 try{
  // No cache-busting query on URLs: use HTTP request cache mode instead.
  // GET works on GitHub Pages; stream is cancelled as soon as response arrives.
  const res=await fetch(item.path,{cache:'no-store',credentials:'omit',signal:controller.signal});
  try{await res.body?.cancel();}catch{}
  return {ok:res.ok,status:res.status,error:res.ok?'':`HTTP ${res.status}`};
 }catch(e){return {ok:false,status:0,error:e.name==='AbortError'?'Quá thời gian':'Mạng/CORS: '+String(e.message||e).slice(0,110)};}
 finally{clearTimeout(timeout)}
}
async function run(){if($('runTest').disabled)return;
 const b=$('runTest');b.disabled=true;$('saveTest').disabled=true;results.length=0;
 for(const o of rows){o.line.dataset.state='idle';o.state.textContent='Chờ kiểm tra';}
 const start=new Date().toISOString(),total=rows.length;let n=0,ok=0,bad=0;
 for(let i=0;i<rows.length;i+=4){
  const batch=rows.slice(i,i+4);batch.forEach(x=>{x.line.dataset.state='run';x.state.textContent='Đang kiểm tra…';});
  const values=await Promise.all(batch.map(check));
  values.forEach((v,j)=>{const x=batch[j];x.line.dataset.state=v.ok?'ok':'fail';x.state.textContent=v.ok?'HTTP '+v.status:'LỖI: '+v.error;
   results.push({group:groups[x.group].title,name:x.label,path:x.path,...v});v.ok?ok++:bad++;n++;
  });
  $('totalCount').textContent=n;$('okCount').textContent=ok;$('badCount').textContent=bad;$('doneCount').textContent=Math.round(n*100/total)+'%';
  $('runStatus').textContent=`Đã kiểm tra ${n}/${total} tài nguyên. ${bad} cần xem lại.`;
 }
 b.disabled=false;$('saveTest').disabled=false;
 $('runStatus').textContent=`Hoàn tất: ${ok}/${total} tải thành công, ${bad} cần xem lại. Các chức năng cần kiểm thử thủ công.`;
 window.__mrleeV26LastReport={version:'V26',checked_at:start,origin:location.origin,description:'HTTP same-origin read-only resource availability; not functional verification',summary:{total,ok,bad},results};
}
$('runTest').addEventListener('click',run);
$('saveTest').addEventListener('click',()=>{
 const report=window.__mrleeV26LastReport;if(!report)return;
 const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='MRLEE_V26_TRINH_DUYET_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
});
})();
