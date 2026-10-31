/* MR LEE V32: supplementary images only on the admissions editorial page.
 * Avoid generic galleries in lessons, tests, cultural topics and dashboards. */
(()=>{'use strict';
const page=decodeURIComponent(location.pathname.split('/').pop()||'index.html').toLowerCase();
if(page!=='tuyen-sinh.html')return;
const images=[
 ['assets/v306/images/feature-1-tuyen-sinh.webp','Định hướng du học'],
 ['assets/v306/images/feature-3-tim-truong.webp','Tìm hiểu trường đại học'],
 ['assets/v306/images/feature-7-ky-tuc-xa.webp','Đời sống ký túc xá — hình minh họa'],
 ['assets/v306/images/step-4-xuat-canh.webp','Chuẩn bị xuất cảnh']
];
function build(){
 const main=document.querySelector('main');if(!main||document.getElementById('mrleeV31Gallery'))return;
 const section=document.createElement('section');section.id='mrleeV31Gallery';section.className='mrlee-v31-gallery';
 section.setAttribute('aria-label','Hình ảnh minh họa du học Hàn Quốc');
 const head=document.createElement('div');head.className='mrlee-v31-gallery-head';
 head.innerHTML='<div><small>DU HỌC HÀN QUỐC</small><h2>Hình ảnh theo từng giai đoạn</h2><p>Hình minh họa định hướng, không xác nhận một trường hay ký túc xá cụ thể.</p></div>';
 const track=document.createElement('div');track.className='mrlee-v31-gallery-track';track.setAttribute('role','list');
 for(const [src,caption] of images){
   const figure=document.createElement('figure');figure.className='mrlee-v31-photo';figure.setAttribute('role','listitem');
   const img=document.createElement('img');img.src=src;img.alt=caption;img.loading='lazy';img.decoding='async';img.width=700;img.height=480;
   img.addEventListener('error',()=>{figure.remove();if(!track.children.length)section.remove()},{once:true});
   const label=document.createElement('span');label.textContent=caption;figure.append(img,label);track.append(figure);
 }
 section.append(head,track);main.append(section);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();
