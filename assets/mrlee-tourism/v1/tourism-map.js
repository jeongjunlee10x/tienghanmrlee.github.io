/* TIẾNG HÀN MR LEE — Korea Tourism Illustrated Map v1.0
 * Static, privacy friendly; no APIs, no external JS dependencies.
 * Illustration pins approximate: directions open official Google Maps search separately.
 */
(() => {
  'use strict';
  const root = document.getElementById('mrlee-tourism-v1');
  if (!root || root.dataset.ready === '1') return;
  root.dataset.ready = '1';
  const A = 'images/tourism-map/places/';
  const places = [
    {id:'gyeongbokgung',name:'Cung điện Gyeongbokgung',ko:'경복궁',region:'Seoul',kind:'Di sản',x:20,y:9,query:'Gyeongbokgung Palace Seoul South Korea',desc:'Cung điện hoàng gia nổi tiếng tại Seoul, lý tưởng để tìm hiểu triều đại Joseon và trải nghiệm hanbok.',tip:'Đi bộ tham quan Gwanghwamun, Gyeongbokgung và các bảo tàng gần đó.',video:'seoul'},
    {id:'bukchon',name:'Làng cổ Bukchon Hanok',ko:'북촌한옥마을',region:'Seoul',kind:'Di sản',x:34,y:14,query:'Bukchon Hanok Village Seoul South Korea',desc:'Những con hẻm với nhà hanok truyền thống nằm giữa lòng Seoul. Đây là khu dân cư đang sinh sống.',tip:'Giữ trật tự, tôn trọng cư dân và kiểm tra giới hạn giờ tham quan.',video:'seoul'},
    {id:'n-seoul',name:'Tháp N Seoul',ko:'남산서울타워',region:'Seoul',kind:'Thành phố',x:40,y:5.5,query:'N Seoul Tower South Korea',desc:'Điểm quan sát nổi bật trên núi Namsan, có tầm nhìn đẹp ra toàn cảnh Seoul.',tip:'Đến cuối chiều để ngắm hoàng hôn và cảnh đêm.',video:'seoul'},
    {id:'everland',name:'Công viên Everland',ko:'에버랜드',region:'Gyeonggi',kind:'Giải trí',x:19,y:23.5,query:'Everland Yongin South Korea',desc:'Công viên giải trí nổi tiếng tại Yongin với các khu trò chơi và cảnh quan theo mùa.',tip:'Xem lịch hoạt động và mua vé qua kênh chính thức.',video:null},
    {id:'incheon',name:'Incheon',ko:'인천',region:'Incheon',kind:'Thành phố',x:25,y:35.5,query:'Incheon Chinatown South Korea',desc:'Thành phố cửa ngõ Hàn Quốc, nổi bật với khu phố Tàu, cảng biển và nhiều điểm trải nghiệm.',tip:'Có thể kết hợp tham quan Songdo và Chinatown.',video:null},
    {id:'suwon',name:'Pháo đài Suwon Hwaseong',ko:'수원화성',region:'Gyeonggi',kind:'Di sản',x:37,y:42.5,query:'Hwaseong Fortress Suwon South Korea',desc:'Quần thể thành cổ nổi tiếng của Suwon, kết hợp kiến trúc phòng thủ và cảnh quan đô thị.',tip:'Dành thời gian đi bộ một đoạn đường thành.',video:null},
    {id:'seoraksan',name:'Vườn quốc gia Seoraksan',ko:'설악산국립공원',region:'Gangwon',kind:'Thiên nhiên',x:59,y:18.0,query:'Seoraksan National Park South Korea',desc:'Núi đá và rừng ở phía đông bắc Hàn Quốc, đặc biệt hấp dẫn vào mùa thu.',tip:'Kiểm tra thời tiết và độ khó của đường mòn trước khi đi.',video:null},
    {id:'sokcho',name:'Bãi biển Sokcho',ko:'속초해수욕장',region:'Gangwon',kind:'Biển đảo',x:76,y:22.4,query:'Sokcho Beach Gangwon South Korea',desc:'Bãi biển tại Sokcho, thuận tiện kết hợp khám phá Seoraksan và chợ địa phương.',tip:'Đi dạo bờ biển và thưởng thức hải sản địa phương.',video:null},
    {id:'gangneung',name:'Bãi biển Gangneung',ko:'강릉해변',region:'Gangwon',kind:'Biển đảo',x:76,y:29.0,query:'Gyeongpo Beach Gangneung South Korea',desc:'Thành phố biển thuộc Gangwon, được yêu thích nhờ các bãi biển và quán cà phê ven biển.',tip:'Tham khảo Gyeongpo và Anmok Coffee Street.',video:null},
    {id:'pyeongchang',name:'Pyeongchang',ko:'평창',region:'Gangwon',kind:'Thiên nhiên',x:78,y:34,query:'Pyeongchang Ski Resort South Korea',desc:'Vùng núi nổi tiếng với các trải nghiệm mùa đông và khu trượt tuyết.',tip:'Lịch mở cửa trượt tuyết tùy thời tiết và mùa.',video:null},
    {id:'daejeon',name:'Khu Expo Daejeon',ko:'엑스포과학공원',region:'Chungcheong',kind:'Thành phố',x:46,y:55,query:'Expo Science Park Daejeon South Korea',desc:'Khu vực gắn liền với khoa học, công nghệ và các hoạt động trải nghiệm tại Daejeon.',tip:'Kết hợp tham quan công viên và bảo tàng khoa học.',video:'daejeon'},
    {id:'jeonju',name:'Làng Jeonju Hanok',ko:'전주한옥마을',region:'Jeolla',kind:'Di sản',x:30,y:68.6,query:'Jeonju Hanok Village South Korea',desc:'Khu phố hanok quy mô lớn, nổi tiếng về di sản, ẩm thực truyền thống và trải nghiệm trang phục.',tip:'Thử bibimbap Jeonju, đi bộ trong những con phố cổ.',video:'jeonju'},
    {id:'gyeongju',name:'Di sản Gyeongju',ko:'경주',region:'Gyeongsang',kind:'Di sản',x:79,y:59,query:'Gyeongju Donggung Palace Wolji Pond South Korea',desc:'Thành phố di sản gắn với vương quốc Silla, có đền chùa và khu di tích lịch sử.',tip:'Khám phá Bulguksa, Daereungwon và Donggung–Wolji.',video:null},
    {id:'busan',name:'Bãi biển Haeundae — Busan',ko:'해운대해수욕장',region:'Gyeongsang',kind:'Biển đảo',x:78,y:71.8,query:'Haeundae Beach Busan South Korea',desc:'Biển Haeundae là điểm nhấn du lịch Busan, thích hợp ngắm biển, đi dạo và khám phá thành phố cảng.',tip:'Có thể kết hợp Gwangalli, Marine City và chợ hải sản.',video:'busan'},
    {id:'tongyeong',name:'Đảo và biển Tongyeong',ko:'통영',region:'Gyeongsang',kind:'Biển đảo',x:64,y:77.7,query:'Tongyeong South Korea tourism',desc:'Thành phố biển với hệ thống đảo đẹp ở phía nam Hàn Quốc.',tip:'Kiểm tra lịch tàu và thời tiết khi tham quan đảo.',video:null},
    {id:'jeju-hallasan',name:'Đỉnh Hallasan — Jeju',ko:'한라산',region:'Jeju',kind:'Thiên nhiên',x:76,y:87,query:'Hallasan National Park Jeju South Korea',desc:'Ngọn núi biểu tượng của đảo Jeju, có cảnh sắc và đường leo núi thay đổi theo mùa.',tip:'Một số tuyến cần đăng ký trước; xem thông báo từ ban quản lý.',video:null},
    {id:'jeju-cheonjiyeon',name:'Thác Cheonjiyeon',ko:'천지연폭포',region:'Jeju',kind:'Thiên nhiên',x:64,y:91,query:'Cheonjiyeon Falls Seogwipo Jeju',desc:'Thác nước nổi bật gần Seogwipo, phù hợp cho chuyến tham quan thiên nhiên nhẹ nhàng.',tip:'Đi giày thoải mái và kiểm tra giờ mở cửa.',video:null},
    {id:'jeju-seongsan',name:'Seongsan Ilchulbong',ko:'성산일출봉',region:'Jeju',kind:'Biển đảo',x:89,y:94.5,query:'Seongsan Ilchulbong Jeju South Korea',desc:'Đỉnh núi lửa sát biển ở phía đông đảo Jeju, đặc biệt nổi tiếng với cảnh bình minh.',tip:'Nếu đi ngắm bình minh, kiểm tra giờ mở cửa và thời tiết.',video:null}
  ];
  // These are verified promotional uploads by the Korea Tourism Organization/VISITKOREA.
  // They are watched on YouTube or optionally embedded after a click. Never download/rehost.
  const videos = {
    seoul:{id:'3P1CnWI62Ik',title:'Feel the Rhythm of KOREA: SEOUL',area:'Seoul'},
    busan:{id:'NLxgGRElMbs',title:'Feel the Rhythm of Korea with BTS — BUSAN BLUES',area:'Busan'},
    jeonju:{id:'dQ_lCmB2hfk',title:'Feel the Rhythm of KOREA: JEONJU',area:'Jeonju'},
    daejeon:{id:'-OLHggNGP4A',title:'Feel the Rhythm of Korea with BTS — DAEJEON',area:'Daejeon'}
  };
  const q = id => root.querySelector('#'+id);
  const listEl=q('tm-results'), pinsEl=q('tm-pins'), viewport=q('tm-viewport'), canvas=q('tm-canvas');
  const search=q('tm-search'), region=q('tm-region'), kind=q('tm-kind');
  const keys={seoul:'서울',busan:'부산',jeju:'제주'};
  const state={selected:null,results:places.slice(),zoom:1,x:0,y:0,w:0,h:0,dragged:false, pointers:new Map(), pinch:null};
  const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const locImg=(p,n=1)=>`${A}${p.id}-${String(n).padStart(2,'0')}.webp`;
  const googleLink=p=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.query)}`;
  const videoLink=v=>`https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}`;
  const pinById=new Map();
  places.forEach((p,i)=>{
    const btn=document.createElement('button');btn.type='button';btn.className='tm-pin';btn.style.left=p.x+'%';btn.style.top=p.y+'%';btn.title=p.name;
    btn.setAttribute('aria-label',`Xem ${p.name}`);btn.dataset.id=p.id;
    btn.innerHTML=`<span class="tm-pin-icon" aria-hidden="true">${i+1}</span>`;
    btn.addEventListener('click',e=>{e.stopPropagation();choose(p.id,true);});
    pinsEl.appendChild(btn);pinById.set(p.id,btn);
  });
  function clamp(){
    const cw=state.w*state.zoom,ch=state.h*state.zoom;
    const vw=viewport.clientWidth,vh=viewport.clientHeight;
    state.x = cw<=vw ? (vw-cw)/2 : Math.max(vw-cw,Math.min(0,state.x));
    state.y = ch<=vh ? (vh-ch)/2 : Math.max(vh-ch,Math.min(0,state.y));
  }
  function paint(){clamp();canvas.style.transform=`translate3d(${state.x}px,${state.y}px,0) scale(${state.zoom})`;q('tm-zoom-label').textContent=Math.round(state.zoom*100)+'%';}
  function fit(){const vw=viewport.clientWidth,vh=viewport.clientHeight;if(!vw||!vh)return;
    state.w=Math.min(vw,vh*2/3);state.h=state.w*1.5;
    canvas.style.width=state.w+'px';canvas.style.height=state.h+'px';
    state.zoom=1;state.x=(vw-state.w)/2;state.y=(vh-state.h)/2;paint();
  }
  function zoomTo(z,px=viewport.clientWidth/2,py=viewport.clientHeight/2){
    const nz=Math.max(1,Math.min(4.5,z));const r=nz/state.zoom;
    state.x=px-(px-state.x)*r;state.y=py-(py-state.y)*r;state.zoom=nz;paint();
  }
  function focus(p){
    const z=Math.max(state.zoom,2.25);state.zoom=z;
    state.x=viewport.clientWidth/2-state.w*p.x/100*z;
    state.y=viewport.clientHeight/2-state.h*p.y/100*z;paint();
  }
  q('tm-zoom-in').addEventListener('click',()=>zoomTo(state.zoom*1.35));
  q('tm-zoom-out').addEventListener('click',()=>zoomTo(state.zoom/1.35));
  q('tm-fit').addEventListener('click',fit);
  viewport.addEventListener('wheel',e=>{e.preventDefault();const r=viewport.getBoundingClientRect();zoomTo(state.zoom*(e.deltaY<0?1.18:1/1.18),e.clientX-r.left,e.clientY-r.top);},{passive:false});
  viewport.addEventListener('pointerdown',e=>{
    if(e.target.closest('.tm-pin'))return;
    viewport.setPointerCapture(e.pointerId);state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(state.pointers.size===2){const ar=Array.from(state.pointers.values());state.pinch={dist:Math.hypot(ar[0].x-ar[1].x,ar[0].y-ar[1].y),zoom:state.zoom};}
    state.dragged=false;
  });
  viewport.addEventListener('pointermove',e=>{
    if(!state.pointers.has(e.pointerId))return;
    const prev=state.pointers.get(e.pointerId);
    state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(state.pointers.size===2&&state.pinch){
      const v=Array.from(state.pointers.values());const dist=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);
      const r=viewport.getBoundingClientRect();const mx=(v[0].x+v[1].x)/2-r.left,my=(v[0].y+v[1].y)/2-r.top;
      zoomTo(state.pinch.zoom*dist/Math.max(1,state.pinch.dist),mx,my);
    }else {state.x+=e.clientX-prev.x;state.y+=e.clientY-prev.y;paint();}
    state.dragged=true;
  });
  const end=e=>{state.pointers.delete(e.pointerId);if(state.pointers.size<2)state.pinch=null;};
  viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
  viewport.addEventListener('keydown',e=>{
    if(e.target!==viewport)return;
    const step=45;
    if(e.key==='ArrowLeft')state.x+=step;
    else if(e.key==='ArrowRight')state.x-=step;
    else if(e.key==='ArrowUp')state.y+=step;
    else if(e.key==='ArrowDown')state.y-=step;
    else if(e.key==='+'||e.key==='='){zoomTo(state.zoom*1.2);e.preventDefault();return;}
    else if(e.key==='-'){zoomTo(state.zoom/1.2);e.preventDefault();return;}
    else return;
    e.preventDefault();paint();
  });
  const baseRegions=['Tất cả vùng',...new Set(places.map(p=>p.region))];
  for(const r of baseRegions){const opt=document.createElement('option');opt.value=r==='Tất cả vùng'?'':r;opt.textContent=r;region.appendChild(opt);}
  const kinds=['Tất cả chủ đề',...new Set(places.map(p=>p.kind))];
  for(const k of kinds){const opt=document.createElement('option');opt.value=k==='Tất cả chủ đề'?'':k;opt.textContent=k;kind.appendChild(opt);}
  function renderList(){listEl.innerHTML='';
    for(const p of state.results){
      const btn=document.createElement('button');btn.type='button';btn.className='tm-result';btn.dataset.id=p.id;
      btn.innerHTML=`<img loading="lazy" src="${locImg(p)}" alt="Minh họa AI: ${escapeHtml(p.name)}"><span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.ko)} · ${escapeHtml(p.region)}</small></span><span aria-hidden="true">›</span>`;
      btn.addEventListener('click',()=>choose(p.id,true));listEl.appendChild(btn);
    }
    if(!state.results.length)listEl.innerHTML='<p class="tm-empty">Không tìm thấy địa danh. Hãy thử từ khóa khác.</p>';
    q('tm-count').textContent=state.results.length+' / '+places.length+' điểm';
    for(const p of places){const pin=pinById.get(p.id);pin.hidden=!state.results.includes(p);}
  }
  function filter(){const needle=norm(search.value),r=region.value,k=kind.value;
    state.results=places.filter(p=>(!needle||norm([p.name,p.ko,p.region,p.kind,p.desc].join(' ')).includes(needle))&&(!r||p.region===r)&&(!k||p.kind===k));
    renderList();if(state.results.length&&!state.results.some(p=>p.id===state.selected))choose(state.results[0].id,false);
  }
  for(const e of [search,region,kind])e.addEventListener(e===search?'input':'change',filter);
  q('tm-clear').addEventListener('click',()=>{search.value='';region.value='';kind.value='';filter();fit();});
  q('tm-random').addEventListener('click',()=>{if(state.results.length)choose(state.results[Math.floor(Math.random()*state.results.length)].id,true);});
  function choose(id,reposition){const p=places.find(v=>v.id===id);if(!p)return;state.selected=p.id;
    for(const [key,pin] of pinById)pin.classList.toggle('is-active',key===id);
    for(const btn of listEl.querySelectorAll('.tm-result'))btn.classList.toggle('is-active',btn.dataset.id===id);
    q('tm-place-region').textContent=p.region+' · '+p.kind;
    q('tm-place-name').textContent=p.name;
    q('tm-place-ko').textContent=p.ko;
    q('tm-place-desc').textContent=p.desc;
    q('tm-place-tip').textContent=p.tip;
    q('tm-photo-main').src=locImg(p,1);q('tm-photo-main').alt=`Tranh minh họa AI: ${p.name}`;
    q('tm-photo-secondary').src=locImg(p,2);q('tm-photo-secondary').alt=`Chi tiết tranh minh họa AI: ${p.name}`;
    q('tm-maps-link').href=googleLink(p);
    q('tm-detail-video').replaceChildren();
    if(p.video&&videos[p.video]){
      const v=videos[p.video],section=q('tm-detail-video');section.className='tm-video-panel';
      const title=document.createElement('strong');title.textContent='🎬 Video quảng bá '+v.area+' · VISITKOREA';
      const note=document.createElement('p');note.textContent='Video quảng bá khu vực, không phải video riêng của điểm tham quan.';
      const buttons=document.createElement('div');buttons.className='tm-video-buttons';
      const play=document.createElement('button');play.type='button';play.textContent='▶ Xem video';
      const go=document.createElement('a');go.href=videoLink(v);go.target='_blank';go.rel='noopener noreferrer';go.textContent='YouTube ↗';
      play.addEventListener('click',()=>{
        section.querySelector('iframe')?.remove();const iframe=document.createElement('iframe');iframe.title=v.title;
        iframe.loading='lazy';iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allowFullscreen=true;
        iframe.src=`https://www.youtube-nocookie.com/embed/${v.id}?rel=0`;
        section.appendChild(iframe);play.textContent='↻ Phát lại';
      });
      buttons.append(play,go);section.append(title,note,buttons);
    } else {
      const s=q('tm-detail-video');s.className='tm-video-panel';
      s.innerHTML='<strong>🎬 Video quảng bá</strong><p>Chưa có video riêng được xác minh cho địa điểm này.</p><a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/c/imagineyourkorea">Kênh du lịch chính thức VISITKOREA ↗</a>';
    }
    if(reposition)focus(p);
  }
  for(const id of ['tm-photo-main','tm-photo-secondary']){
    const img=q(id),fallback='images/tourism-map/mrlee-korea-tourism-map.webp';
    img.addEventListener('error',()=>{if(!img.src.endsWith(fallback))img.src=fallback;});
  }
  renderList();choose('gyeongbokgung',false);
  requestAnimationFrame(fit);
  window.addEventListener('resize',()=>{clearTimeout(window.mrleeTourismResize);window.mrleeTourismResize=setTimeout(fit,130);});
})();
