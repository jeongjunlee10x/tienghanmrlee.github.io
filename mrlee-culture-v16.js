/* MR LEE CULTURE V16 – distinct topic covers, unified media gallery, verified official videos.
 * No Firebase, scores, logins or learner records touched.
 */
(function(){'use strict';
  const topics=Array.isArray(window.MRLEE_CULTURE_V13)?window.MRLEE_CULTURE_V13:[];
  const ai=(window.MRLEE_CULTURE_V15_AI&&typeof window.MRLEE_CULTURE_V15_AI==='object')?window.MRLEE_CULTURE_V15_AI:{};
  const valid=window.MRLEE_CULTURE_V145_AVAILABLE||{};
  const bySlug=new Map(topics.map(t=>[t.slug,t]));
  const $=(sel,node=document)=>node.querySelector(sel);
  const videos={
    'le-hoi':{id:'6xIrLNMn55A',title:'Korean History & Tradition – VISITKOREA',note:'Video giới thiệu văn hóa truyền thống; không thay thế hướng dẫn riêng về nghi lễ.'},
    'truyen-thong':{id:'6xIrLNMn55A',title:'Korean History & Tradition – VISITKOREA',note:'Khám phá hanbok và kiến trúc truyền thống Hàn Quốc.'},
    'lich-su':{id:'6xIrLNMn55A',title:'Korean History & Tradition – VISITKOREA',note:'Video minh họa du lịch di sản; nội dung lịch sử trong bài cần đối chiếu nguồn.'},
    'phe-lich-su':{id:'6xIrLNMn55A',title:'Korean History & Tradition – VISITKOREA',note:'Chỉ mang tính hình ảnh văn hóa, không phải bài hướng dẫn nghi thức cúi chào.'},
    'am-thuc':{id:'-ckhl9OPF9o',title:'Echoes of Korea – Jeolla – VISITKOREA',note:'Video vùng Jeolla có cảnh ẩm thực, trà đạo và nghệ thuật truyền thống.'},
    'du-lich':{id:'GApF74TayJM',title:'Begin to Hear Korea – VISITKOREA',note:'Video quảng bá Hàn Quốc qua âm thanh của đời sống và điểm đến.'},
    'doi-song':{id:'GApF74TayJM',title:'Begin to Hear Korea – VISITKOREA',note:'Nghe âm thanh sinh hoạt, đường phố và văn hóa trong đời sống.'},
    'hien-dai':{id:'GApF74TayJM',title:'Begin to Hear Korea – VISITKOREA',note:'Video giới thiệu đời sống đương đại và điểm đến tại Hàn Quốc.'},
    'tau-dien-ngam':{id:'GApF74TayJM',title:'Begin to Hear Korea – VISITKOREA',note:'Có âm thanh thông báo tàu điện; không phải video hướng dẫn sử dụng tàu.'},
  };
  const docs={
    'tau-dien-ngam':'https://english.visitkorea.or.kr/svc/planYourTravel/travelInfo/subTransportation.do',
    'xe-buyt':'https://english.visitkorea.or.kr/svc/planYourTravel/travelInfo/subTransportation.do',
    'am-thuc':'https://english.visitkorea.or.kr/svc/contents/contentsView.do?dataSetId=286&menuSn=911&vcontsId=1593009'
  };
  const covers=new Map();let used=new Set();
  topics.forEach(t=>{
    const aiList=Array.isArray(ai[t.slug])?ai[t.slug]:[];
    const photos=(t.realPhotos||[]).filter(p=>p.local&&valid[p.local]===true);
    const candidates=[...aiList.map(v=>v.file),...photos.map(p=>p.local)];
    const unique=candidates.find(p=>!used.has(p));
    const cover=unique||t.image;
    covers.set(t.slug,cover);
    used.add(cover);
  });
  function fallbackImage(img,candidates){
    const choices=[...new Set(candidates.filter(Boolean))];let next=0;
    img.onerror=function(){
      next++;
      if(next<choices.length)img.src=choices[next];
      else {img.onerror=null;img.hidden=true;img.closest('figure')?.classList.add('cultureV16NoImage');}
    };
    if(choices.length)img.src=choices[0];
  }
  function make(tag,klass,content){const el=document.createElement(tag);if(klass)el.className=klass;if(content!=null)el.textContent=String(content);return el;}
  function imageItems(t){
    const photos=(t.realPhotos||[]).filter(p=>p.local&&valid[p.local]===true);
    const ais=Array.isArray(ai[t.slug])?ai[t.slug]:[];
    const seq=[];const take=Math.min(3,photos.length);
    photos.slice(0,take).forEach(p=>seq.push({src:p.local,title:p.title||t.title,caption:p.explanation||'',type:'ẢNH TƯ LIỆU',kind:'real',source:p.source}));
    ais.slice(0,6-seq.length).forEach(p=>seq.push({src:p.file,title:p.title||t.title,caption:p.caption||'',type:'ẢNH AI MINH HỌA',kind:'ai'}));
    if(!seq.length)seq.push({src:t.image,title:t.title,caption:'Hình đồ họa khái quát nội dung học.',type:'ĐỒ HỌA',kind:'illustration'});
    return seq;
  }
  function viewer(src,title){
    const prev=document.activeElement, overlay=make('div','cultureV16Viewer'),close=make('button','cultureV16Close','✕ Đóng ảnh');
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Xem ảnh văn hóa');
    const im=make('img');im.src=src;im.alt=title;const label=make('p','',title);close.type='button';
    function exit(){document.removeEventListener('keydown',key);overlay.remove();document.body.classList.remove('cultureV16Locked');if(prev&&prev.focus)prev.focus();}
    function key(e){if(e.key==='Escape')exit();if(e.key==='Tab'){e.preventDefault();close.focus()}}
    close.addEventListener('click',exit);overlay.addEventListener('click',e=>{if(e.target===overlay)exit()});document.addEventListener('keydown',key);
    overlay.append(close,im,label);document.body.append(overlay);document.body.classList.add('cultureV16Locked');close.focus();
  }
  function applyCovers(){
    const grid=$('#topics');if(!grid)return;
    grid.querySelectorAll('a.topic').forEach(a=>{
      const slug=new URL(a.href,document.baseURI).searchParams.get('chu-de');const t=bySlug.get(slug);if(!t)return;
      const img=$('img',a);if(!img||img.dataset.cultureV16==='1')return;
      img.dataset.cultureV16='1';img.alt='Ảnh riêng cho chủ đề '+t.title;
      const p=(t.realPhotos||[]).filter(x=>valid[x.local]===true).map(x=>x.local);
      fallbackImage(img,[covers.get(slug),...p,t.image]);
      a.classList.add('cultureV16Topic');a.dataset.cultureGroup=t.category==='life'?'life':'culture';
      const count=imageItems(t).length;
      const chip=make('span','cultureV16TopicTag',`🖼 ${count} hình`);
      const target=$('.topicText .openLink',a)||$('.topicText',a);
      if(target)target.append(chip);
    });
  }
  function initHub(){const grid=$('#topics');if(!grid)return;applyCovers();new MutationObserver(applyCovers).observe(grid,{childList:true});}
  function initLesson(){
    const box=$('#lessonContent');if(!box)return;
    const slug=new URLSearchParams(location.search).get('chu-de')||topics[0]?.slug;const t=bySlug.get(slug);if(!t)return;
    $('#realPhotos')?.remove();$('#mrleeAiPhotos')?.remove();
    const orig=$('#image');if(orig)orig.hidden=true;
    const media=make('section','lessonBlock cultureV16Gallery');media.id='cultureImagesV16';
    media.append(make('h2',null,'🖼️ Hình ảnh theo chủ đề'),make('p','cultureV16Subtitle','Ảnh tư liệu và ảnh AI được ghi nhãn rõ. Chọn ảnh để phóng to; xem chú thích và nguồn bên dưới.'));
    const grid=make('div','cultureV16GalleryGrid');
    imageItems(t).forEach((p,i)=>{
      const fig=make('figure','cultureV16Figure');const img=make('img');img.alt=p.type+': '+p.title;img.loading='lazy';img.decoding='async';
      fallbackImage(img,[p.src,t.image]);
      const caption=make('figcaption');caption.append(make('span','cultureV16Kind',p.type),make('h3',null,p.title),make('p',null,p.caption));
      if(p.kind==='real' && /^https:\/\/commons\.wikimedia\.org\/wiki\//.test(p.source||'')){
        const a=make('a',null,'Nguồn ảnh, tác giả và giấy phép ↗');a.href=p.source;a.target='_blank';a.rel='noopener noreferrer';caption.append(a);
      }
      img.addEventListener('click',()=>viewer(img.currentSrc||img.src,p.title));
      img.tabIndex=0;img.setAttribute('role','button');img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();viewer(img.currentSrc||img.src,p.title)}});
      fig.append(img,caption);grid.append(fig);
    });
    media.append(grid);
    const before=$('#talk')||$('#how')||box.firstElementChild;
    if(before)box.insertBefore(media,before);else box.append(media);
    const video=videos[slug], panel=make('section','lessonBlock cultureV16Video');panel.id='cultureVideoV16';
    panel.append(make('h2',null,'🎬 Video và nguồn chính thức'));
    if(video){
      panel.append(make('p','cultureV16Subtitle',video.note));
      const player=make('div','cultureV16VideoPlayer');
      const launch=make('button','cultureV16VideoLaunch','▶ Xem video VISITKOREA');launch.type='button';
      launch.addEventListener('click',()=>{
        const iframe=make('iframe');iframe.src='https://www.youtube-nocookie.com/embed/'+video.id+'?rel=0';iframe.title=video.title;
        iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;iframe.loading='lazy';
        player.replaceChildren(iframe);
      });
      const direct=make('a','cultureV16VideoLink','Mở video gốc trên YouTube ↗');direct.href='https://www.youtube.com/watch?v='+video.id;direct.target='_blank';direct.rel='noopener noreferrer';
      player.append(launch);panel.append(player,direct);
    }else{panel.append(make('p','cultureV16Subtitle','Chưa có video hướng dẫn được xác minh riêng cho bài này. Không sử dụng video không liên quan hoặc không có quyền nhúng.'));}
    if(docs[slug]){const guide=make('a','cultureV16VideoLink','Xem nguồn hướng dẫn chính thức ↗');guide.href=docs[slug];guide.target='_blank';guide.rel='noopener noreferrer';panel.append(guide)}
    const anchor=$('#sources');if(anchor)box.insertBefore(panel,anchor);else box.append(panel);
    const hero=$('#topicHero img');if(hero){const ps=(t.realPhotos||[]).filter(p=>valid[p.local]===true).map(p=>p.local);fallbackImage(hero,[covers.get(slug),...ps,t.image]);hero.alt='Ảnh riêng chủ đề '+t.title;}
    const shortcuts=document.querySelectorAll('.sidePanel a[href="#realPhotos"],.sidePanel a[href="#image"]');shortcuts.forEach(a=>{a.href='#cultureImagesV16';a.textContent='Ảnh và chú thích';});
    document.querySelectorAll('.sidePanel a[href="#sources"]').forEach(a=>{a.href='#cultureVideoV16';a.textContent='Video chính thức';});
  }
  function start(){if(!topics.length)return;initHub();initLesson();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
