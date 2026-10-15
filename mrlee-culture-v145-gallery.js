/* MR LEE V14.5: only locally verified REAL photographs; never show broken images or remote fallbacks. */
(function () {
  'use strict';
  var topics=Array.isArray(window.MRLEE_CULTURE_V13)?window.MRLEE_CULTURE_V13:[];
  var available=window.MRLEE_CULTURE_V145_AVAILABLE;
  if(!topics.length || !available || typeof available!=='object') {
    console.warn('MR LEE V14.5: photo manifest missing. Re-run 01_CAP_NHAT_ANH_DA_CO.cmd');
    return;
  }
  function isGood(p){return !!(p&&typeof p.local==='string'&&available[p.local]===true);}
  var all=0,unique=new Set();
  topics.forEach(function(t){
    t.realPhotos=(Array.isArray(t.realPhotos)?t.realPhotos:[]).filter(isGood);
    t.realPhotos.forEach(function(p){all++;unique.add(p.local);});
  });
  function element(tag,klass,txt){
    var n=document.createElement(tag);
    if(klass)n.className=klass;
    if(txt!==undefined)n.textContent=txt;
    return n;
  }
  function setPhoto(img,p){
    img.loading='lazy';img.decoding='async';img.alt=p.title+' — ảnh chụp tư liệu';
    img.onerror=function(){
      // Unexpected runtime failure: remove the card instead of a broken picture or irrelevant replacement.
      var figure=img.closest('figure.mrphoto');
      if(figure){figure.remove();}
      else{img.style.display='none';}
    };
    img.src=p.local;
  }
  function photoCard(p,index){
    var figure=element('figure','mrphoto');
    var img=document.createElement('img');setPhoto(img,p);
    var caption=document.createElement('figcaption');
    caption.appendChild(element('span','mrphotoTag','ẢNH CHỤP THỰC TẾ '+String(index+1).padStart(2,'0')));
    caption.appendChild(element('strong','',p.title||'Ảnh tư liệu'));
    caption.appendChild(element('p','',p.explanation||'Xem chú thích tại nguồn ảnh.'));
    if(/^https:\/\/commons\.wikimedia\.org\/wiki\//.test(p.source||'')){
      var a=element('a','','Xem ảnh gốc, tác giả và giấy phép ↗');
      a.href=p.source;a.target='_blank';a.rel='noopener noreferrer';caption.appendChild(a);
    }
    figure.append(img,caption);return figure;
  }
  function lesson(){
    var box=document.getElementById('lessonContent');
    if(!box)return;
    var slug=new URLSearchParams(location.search).get('chu-de') || (topics[0]&&topics[0].slug);
    var t=topics.find(function(v){return v.slug===slug;});
    if(!t)return;
    if(!t.realPhotos.length){
      // no invalid placeholders and keep existing V13 teaching illustration
      return;
    }
    var section=element('section','lessonBlock mrPhotoSection');section.id='realPhotos';
    section.appendChild(element('h2','','📷 Ảnh chụp thực tế và giải thích từng ảnh'));
    section.appendChild(element('p','mrPhotoIntro','Chỉ hiển thị ảnh đã tải thành công. Đọc phần giải thích ngay dưới từng hình, xem tác giả và giấy phép qua liên kết nguồn.'));
    var grid=element('div','mrPhotoGrid');
    t.realPhotos.forEach(function(p,i){grid.appendChild(photoCard(p,i));});
    section.appendChild(grid);
    section.appendChild(element('p','mrPhotoNote','Phiên bản V14.5: đang sử dụng '+unique.size+' ảnh chụp có sẵn, xuất hiện ở '+all+' vị trí giải thích trong 22 bài. Các ảnh chưa tải được đã được bỏ qua; không sử dụng ảnh giả thay thế.'));
    var before=document.getElementById('how')||document.getElementById('image');
    if(before)box.insertBefore(section,before);else box.prepend(section);
    var old=document.querySelector('#image h2');if(old)old.textContent='🗺️ Sơ đồ minh họa bổ trợ';
    var shortcut=document.querySelector('.sidePanel a[href="#image"]');
    if(shortcut){shortcut.href='#realPhotos';shortcut.textContent='Ảnh thực tế & giải thích';}
    var hero=document.querySelector('#topicHero img');
    if(hero)setPhoto(hero,t.realPhotos[0]);
  }
  function hub(){
    var grid=document.getElementById('topics');if(!grid)return;
    function update(){
      Array.from(grid.querySelectorAll('a.topic')).forEach(function(a){
        var url=new URL(a.getAttribute('href'),document.baseURI);
        var slug=url.searchParams.get('chu-de');
        var t=topics.find(function(x){return x.slug===slug;});
        var img=a.querySelector('img');
        if(img&&t&&t.realPhotos.length&&img.dataset.v145!=='1'){
          img.dataset.v145='1';setPhoto(img,t.realPhotos[0]);
        }
      });
    }
    var observer=new MutationObserver(update);observer.observe(grid,{childList:true});update();
  }
  document.addEventListener('DOMContentLoaded',function(){lesson();hub();});
})();
