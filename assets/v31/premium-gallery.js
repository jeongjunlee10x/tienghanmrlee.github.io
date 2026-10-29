/* MR LEE V31 — curated, nonduplicating gallery of repository-owned images.
 * Adds image density without modifying auth, hero, grade, or source datasets. */
(()=>{'use strict';
const page=decodeURIComponent(location.pathname.split('/').pop()||'index.html').toLowerCase();
// Homepage already has eight image-rich navigation cards; preserve its compact first fold.
if(page==='index.html')return;
const lessons=['learning-hangeul','learning-roadmap','learning-listening','learning-cap-1','learning-cap-2','learning-cap-3','learning-cap-4','learning-topik'];
const cultures=['culture','feature-8-doi-song','learning-hangeul','learning-books','learning-cap-3','learning-cap-4','learning-cap-5','learning-cap-6'];
const admissions=['feature-1-tuyen-sinh','culture','learning-topik','learning-cap-1','learning-cap-2','learning-cap-3','learning-cap-4','learning-cap-5'];
const pages={
'index.html':admissions,'tuyen-sinh.html':admissions,'dang-ky-tu-van.html':admissions,
'hoc-tieng-han.html':lessons,'hoc-theo-bai.html':lessons,'bo-sach.html':lessons,
'kiem-tra-topik.html':['learning-topik','learning-listening','learning-books','learning-cap-1','learning-cap-2','learning-cap-3','learning-cap-5','learning-cap-6'],
'giao-tiep-theo-chu-de.html':['learning-listening','learning-hangeul','feature-8-doi-song','culture','learning-cap-1','learning-cap-2','learning-cap-3','learning-cap-4'],
'giao-tiep-phong-van.html':['learning-topik','learning-hangeul','learning-roadmap','learning-cap-1','learning-cap-2','learning-cap-3','learning-cap-4','learning-cap-5'],
'van-hoa-han-quoc.html':cultures,'ban-do-dai-hoc-han-quoc.html':admissions,
'mrlee-bai-tap-pro.html':lessons,'bang-xep-hang.html':lessons
};
if(!pages[page])return;
const titles={'learning-hangeul':'Bảng chữ cái Hangeul','learning-roadmap':'Lộ trình học tiếng Hàn','learning-listening':'Luyện kỹ năng nghe','learning-topik':'Luyện thi TOPIK','learning-books':'Tài liệu học tập','culture':'Khám phá văn hóa','feature-8-doi-song':'Sinh hoạt tại Hàn Quốc','feature-1-tuyen-sinh':'Định hướng du học',
'learning-cap-1':'Sơ cấp 1','learning-cap-2':'Sơ cấp 2','learning-cap-3':'Trung cấp 1','learning-cap-4':'Trung cấp 2','learning-cap-5':'Cao cấp 1','learning-cap-6':'Cao cấp 2'};
const urls={'learning-hangeul':'bang-chu-cai-tieng-han.html','learning-roadmap':'hoc-tieng-han.html','learning-listening':'hoc-theo-bai.html?cap=1&bai=1','learning-topik':'kiem-tra-topik.html','learning-books':'bo-sach.html','culture':'van-hoa-han-quoc.html','feature-8-doi-song':'van-hoa-han-quoc.html','feature-1-tuyen-sinh':'tuyen-sinh.html'};
for(let i=1;i<=6;i++)urls['learning-cap-'+i]='hoc-theo-bai.html?cap='+i;
function build(){
 if(document.querySelector('#mrleeV31Gallery'))return;
 const main=document.querySelector('main');if(!main)return;
 const section=document.createElement('section');section.id='mrleeV31Gallery';section.className='mrlee-v31-gallery';section.setAttribute('aria-label','Thư viện hình ảnh minh họa theo chủ đề');
 const head=document.createElement('div');head.className='mrlee-v31-gallery-head';
 head.innerHTML='<div><small>THƯ VIỆN HÌNH ẢNH MR LEE</small><h2>Khám phá bằng hình ảnh</h2><p>Ảnh minh họa chủ đề học tập, không phải ảnh xác nhận cơ sở vật chất hoặc trường cụ thể.</p></div>';
 const track=document.createElement('div');track.className='mrlee-v31-gallery-track';track.setAttribute('role','list');
 for(const [i,key] of [...new Set(pages[page])].entries()){
  const card=document.createElement('a');card.href=urls[key]||'hoc-tieng-han.html';card.className='mrlee-v31-photo';card.setAttribute('role','listitem');
  const img=document.createElement('img');img.src='assets/v306/images/'+key+'.webp';img.alt='Hình minh họa: '+(titles[key]||'Khám phá');img.loading=i<2?'eager':'lazy';img.decoding='async';img.fetchPriority=i===0?'high':'low';img.width=700;img.height=480;
  img.addEventListener('error',()=>{card.remove();if(!track.children.length)section.remove()},{once:true});
  const label=document.createElement('span');label.textContent=titles[key]||'Khám phá MR LEE';card.append(img,label);track.append(card);
 }
 section.append(head,track);
 // Gallery stays horizontally scrollable, so homepage remains compact.
 const footer=main.querySelector(':scope > footer');
 if(footer)footer.before(section);else main.append(section);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();