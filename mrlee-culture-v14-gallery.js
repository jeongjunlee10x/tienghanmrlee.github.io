/* MR LEE V14 - anh chup thuc te va thuyet minh ngay duoi tung anh. Khong tac dong du lieu hoc vien. */
(function () {
  'use strict';
  const topics=Array.isArray(window.MRLEE_CULTURE_V13)?window.MRLEE_CULTURE_V13:[];
  if(!topics.length) return;
  function loadPhoto(img, photo, fallback){
    let phase=0;
    img.loading='lazy';
    img.decoding='async';
    img.referrerPolicy='no-referrer';
    img.alt=photo.title+' — ảnh chụp thực tế, nguồn Wikimedia Commons';
    img.addEventListener('error',function(){
      phase++;
      if(phase===1){img.src=photo.remote;}
      else if(phase===2){img.src='https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(photo.filename)+'?width=540';}
      else{img.style.display='none';img.dataset.photoUnavailable='1';img.parentElement.classList.add('photoUnavailable');}
    });
    img.src=photo.local;
  }
  function renderPhotoCard(photo,t,index){
    const figure=document.createElement('figure');figure.className='mrphoto';
    const img=document.createElement('img');loadPhoto(img,photo,t.image);figure.appendChild(img);
    const cap=document.createElement('figcaption');
    const tag=document.createElement('span');tag.className='mrphotoTag';tag.textContent='ẢNH THỰC TẾ '+String(index+1).padStart(2,'0');
    const title=document.createElement('strong');title.textContent=photo.title;
    const explain=document.createElement('p');explain.textContent=photo.explanation;
    const link=document.createElement('a');link.href=photo.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Nguồn ảnh · Tác giả & giấy phép (Wikimedia Commons) ↗';
    cap.append(tag,title,explain,link);figure.appendChild(cap);return figure;
  }
  function showLesson(){
    const content=document.querySelector('#lessonContent');if(!content)return;
    const slug=new URLSearchParams(location.search).get('chu-de')||topics[0]?.slug;
    const t=topics.find(x=>x.slug===slug);if(!t||!t.realPhotos||document.querySelector('#realPhotos'))return;
    const section=document.createElement('section');section.className='lessonBlock mrPhotoSection';section.id='realPhotos';
    const h=document.createElement('h2');h.textContent='📷 Hình ảnh thực tế – nhìn, hiểu và ghi nhớ';
    const intro=document.createElement('p');intro.className='mrPhotoIntro';intro.textContent='Mỗi ảnh là tư liệu thực, có giải thích ngay phía dưới và đường dẫn đến nguồn, tác giả, giấy phép. Một số ảnh kỹ năng sống minh họa thao tác ở ngoài Hàn Quốc và được ghi rõ trong chú thích.';
    const grid=document.createElement('div');grid.className='mrPhotoGrid';
    t.realPhotos.forEach((p,i)=>grid.appendChild(renderPhotoCard(p,t,i)));
    const note=document.createElement('p');note.className='mrPhotoNote';note.textContent='Bộ ảnh: 34 ảnh chụp tư liệu phục vụ 66 thẻ chú thích. Ảnh được lưu tại images/culture-v14 sau khi chạy bộ tải ảnh. Nếu một ảnh không hiện, nhấn Nguồn ảnh để xem bản chụp gốc. Ảnh y tế/cứu hộ chỉ minh họa, không thay đào tạo thực hành.';
    section.append(h,intro,grid,note);
    const before=document.querySelector('#how')||document.querySelector('#image');
    if(before)content.insertBefore(section,before);else content.prepend(section);
    const old=document.querySelector('#image h2');if(old)old.textContent='🗺️ Sơ đồ minh họa bổ trợ';
    const quick=document.querySelector('.sidePanel a[href="#image"]');
    if(quick){quick.textContent='Ảnh thực tế & lời giải thích';quick.href='#realPhotos';}
    const hero=document.querySelector('#topicHero img');
    if(hero&&t.realPhotos[0])loadPhoto(hero,t.realPhotos[0],t.image);
  }
  function showHub(){
    const cards=document.querySelector('#topics');if(!cards)return;
    function replaceImages(){
      Array.from(cards.querySelectorAll('a.topic')).forEach(a=>{
        const u=new URL(a.getAttribute('href'),'https://mrlee.example/');
        const slug=u.searchParams.get('chu-de');const t=topics.find(t=>t.slug===slug);
        const img=a.querySelector('img');
        if(t&&t.realPhotos&&t.realPhotos[0]&&img&&!img.dataset.v14){
          img.dataset.v14='1';loadPhoto(img,t.realPhotos[0],t.image);
        }
      });
    }
    const observer=new MutationObserver(replaceImages);observer.observe(cards,{childList:true});replaceImages();
  }
  document.addEventListener('DOMContentLoaded',function(){showLesson();showHub();});
})();
