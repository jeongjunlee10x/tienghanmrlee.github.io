/* MR LEE Korea University Explorer V9 — no-card OpenFreeMap + Photon optional place lookup. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let listShowAll=false;
  let autoSearchTimer=null;
  let autoSearchTicket=0;
  const escapeHtml = text => String(text ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const norm = text => String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'').trim();
  const validUrl = url => /^https:\/\/[^\s<>'"`]+$/i.test(String(url ?? '')) ? String(url) : '#';
  const safePhoto = url => /^(https:\/\/[^\s<>'"`]+|(?:images|assets|university-map)\/[a-z0-9_./-]+)$/i.test(String(url ?? '')) ? String(url) : '';
  const phoneHref = value => {const p=String(value||'').replace(/[^0-9+]/g,'');return p.length>=7 ? 'tel:'+p : '';};
  const naverQuery = c => 'https://map.naver.com/p/search/'+encodeURIComponent([c.school.ko,c.ko||c.en,c.address].filter(Boolean).join(' '));
  const researchGoogleQuery = c => [c.school.ko,c.ko||c.en,c.address].filter(Boolean).join(' ');
  const safeLink = (url,text) => url && validUrl(url)!=='#' ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)} ↗</a>` : '';
  const detailLookup = (c) => state.campusDetails[c.uid] || {};
  function findVerifiedContact(school,campus,uid){
    if(state.campusDetails[uid])return state.campusDetails[uid];
    // Fallback for V4: canonical national registry reassigns campus IDs. Match school + region + street, NEVER school name alone.
    const addr=norm(campus.address);
    if(!addr)return null;
    const exact=Object.values(state.campusDetails).filter(x=>x.school_ko===school.ko && x.region===campus.region && x.address_hint_ko && addr.includes(norm(x.address_hint_ko)));
    return exact.length===1 ? exact[0] : null;
  }
  function mergeCampusDetail(c,extra){
    if(!extra||typeof extra!=='object')return;
    for(const key of ['address','phone','phone_label','source_url','verified_at','photo_url','photo_credit','photo_license','photo_source','notes']){
      if(typeof extra[key]==='string' && extra[key].trim())c[key]=extra[key].trim();
    }
    if(extra.accuracy === 'verified' && validUrl(extra.coordinate_source_url||'')!=='#'){
      const lat=Number(extra.lat),lng=Number(extra.lng);
      if(Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=32&&lat<=39&&lng>=124&&lng<=132){
        c.lat=lat;c.lng=lng;c.accuracy='verified';c.coordinate_source_url=extra.coordinate_source_url;
      }
    }
  }
  function addressOf(c){return c.address || [c.cityKo,c.region?regionName(c.region):null].filter(Boolean).join(', ');}

  const safeText = text => escapeHtml(text || '—');
  const hasPin = c => Number.isFinite(c.lat) && Number.isFinite(c.lng) && c.lat>=32 && c.lat<=39 && c.lng>=124 && c.lng<=132;
  const pinStatus = c => hasPin(c) && c.accuracy==='verified' ? 'Tọa độ đã đối chiếu trong danh mục' : c.mapPreview ? 'Ghim tham khảo từ OpenStreetMap (chưa duyệt)' : hasPin(c) ? 'Có tọa độ tham khảo (chưa duyệt)' : 'Tra cứu vị trí nguồn mở khi chọn trường';
  const mapsQuery = c => mapSearchLink(researchGoogleQuery(c),c.google_place_id||'');
  const state = {regions:[], schools:[], campuses:[], region:null, city:null, query:'', type:'all', selected:null, map:null, mapReady:false, polygonReady:false, campusSourceReady:false, cityFeatures:[], selectedSchoolId:null, campusDetails:{}, campusGroups:new Map(), detailOpen:false, activePopup:null, mapInitialLoaded:false, searchTicket:0};
  // Photon community server is for modest, explicitly user-initiated lookups ONLY.
  // Not a full-database bulk geocoder; no request on every keypress.
  const GEO_ENDPOINT = String(window.MRLEE_PHOTON_ENDPOINT || 'https://photon.komoot.io/api/');
  let lookupController=null;
  let previousLookup=0;
  let lookupWaiter=null;
  const geocodeCache=new Map();
  const localCacheKey='mrlee-photon-cache-v9';
  try{
    const saved=JSON.parse(localStorage.getItem(localCacheKey)||'[]');
    if(Array.isArray(saved)) saved.filter(x=>x&&typeof x.key==='string'&&Date.now()-x.time<7*86400000).slice(-120).forEach(x=>geocodeCache.set(x.key,x));
  }catch(_err){}
  function cacheLookup(key,features){
    geocodeCache.set(key,{key,time:Date.now(),features:features.slice(0,8)});
    try{localStorage.setItem(localCacheKey,JSON.stringify([...geocodeCache.values()].slice(-120)));}catch(_err){}
  }
  function mapSearchLink(query){return 'https://www.openstreetmap.org/search?query='+encodeURIComponent(query);}
  function hideGoogleMap(){ // Keep former call-sites compatible; V9 never shows a Google iframe.
    clearGeoPanel();
  }
  function clearGeoPanel(){
    if(lookupController){lookupController.abort();lookupController=null;}
    if(lookupWaiter){clearTimeout(lookupWaiter.timer);lookupWaiter.resolve();lookupWaiter=null;}
    ++state.searchTicket;
    const panel=$('geoResults');if(panel){panel.hidden=true;panel.innerHTML='';}
  }
  function placeText(c){
    if(!c)return '';
    const name=c.school.ko||c.school.en||c.school.vi||'';
    const branch=(c.ko&&c.ko!==name?c.ko:'')||(c.en&&!/^(main|primary) campus$/i.test(c.en)?c.en:'');
    return [name,branch,c.cityKo||c.city,'South Korea'].filter(Boolean).join(' ');
  }
  function geoCoord(c){
    if(c.mapPreview)return {lat:c.mapPreview.lat,lng:c.mapPreview.lng};
    if(hasPin(c))return {lat:c.lat,lng:c.lng};
    return null;
  }
  function regionCheck(c,p){
    const city=norm([p.city,p.district,p.county,p.state].filter(Boolean).join(' '));
    const expected=norm([c?.city,c?.cityKo,...(c?cityEnglish(c):[])].filter(Boolean).join(' '));
    if(!expected)return 0;
    return [c?.city,c?.cityKo,...(c?cityEnglish(c):[])].filter(Boolean).some(v=>norm(v).length>3&&city.includes(norm(v))) ? 18:0;
  }
  function scoreGeo(c,f,rawQuery){
    const p=f.properties||{};
    const text=norm([p.name,p.street,p.city,p.district,p.state].filter(Boolean).join(' '));
    const names=c?[c.school.ko,c.school.en,c.school.vi,...(c.school.aliases||[]),c.ko,c.en,...(c.aliases||[])]:[rawQuery];
    const matched=names.filter(n=>n&&norm(n).length>=3&&text.includes(norm(n)));
    const relevant=['university','college','school','research_institute'].includes(String(p.osm_value||'').toLowerCase());
    const education=String(p.osm_key||'').toLowerCase()==='amenity'||String(p.osm_key||'').toLowerCase()==='building';
    const sc=(matched.some(n=>norm(n).length>=5)?60:matched.length?35:0)+(relevant?25:0)+(education?8:0)+(c?regionCheck(c,p):0);
    return sc;
  }
  function toGeoCandidates(data,c,rawQuery){
    return (data?.features||[]).map(f=>{
      const p=f.properties||{},coords=f.geometry?.coordinates||[];
      const lng=Number(coords[0]),lat=Number(coords[1]);
      if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<32||lat>39||lng<124||lng>132)return null;
      if(p.countrycode&&String(p.countrycode).toUpperCase()!=='KR')return null;
      return {lat,lng,name:String(p.name||'Địa điểm OpenStreetMap'),label:[p.city,p.district,p.state].filter(Boolean).join(' · '),osm_key:String(p.osm_key||''),osm_value:String(p.osm_value||''),osm_type:p.osm_type,osm_id:p.osm_id,score:scoreGeo(c,f,rawQuery)};
    }).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,5);
  }
  function showGeoPanel(title,content){
    const panel=$('geoResults');if(!panel)return;
    panel.hidden=false;
    panel.innerHTML=`<div class="geo-title"><strong>${safeText(title)}</strong><button type="button" class="geo-close" aria-label="Đóng kết quả địa điểm">×</button></div><div class="geo-body">${content}</div>`;
    panel.querySelector('.geo-close').onclick=()=>{clearGeoPanel();};
  }
  function previewMap(lat,lng,title,c,chosen){
    if(c){c.mapPreview={lat,lng,name:title,source:'Photon/OpenStreetMap'};}
    if(state.mapReady){
      updateMapMarkers();
      if(c&&state.map?.getLayer('selected-campus-ring'))state.map.setFilter('selected-campus-ring',['==',['get','uid'],c.uid]);
      const reduced=window.matchMedia?.('(prefers-reduced-motion:reduce)').matches;
      state.map.flyTo({center:[lng,lat],zoom:16.7,duration:reduced?0:950,essential:true,offset:matchMedia('(max-width:760px)').matches?[0,-50]:[-65,0]});
      if(c)state.map.once('moveend',()=>openPopup(c));
    }
    zoomNotice(`Đã phóng tới ${title}. Ghim nguồn mở là vị trí tham khảo, chưa xác minh campus.`);
    if(c&&state.selected===c.uid)showCampusDetail(c);
    if(chosen){const panel=$('geoResults');if(panel)panel.dataset.chosen='yes';}
  }
  function renderGeoCandidates(query,c,candidates,ticket){
    const strong=candidates.filter(x=>x.score>=55);
    if(!candidates.length || !strong.length){
      showGeoPanel('Chưa tìm được đúng campus',`<p>Chưa tìm thấy địa điểm trường đủ khớp trong OpenStreetMap. Không tự ghim một địa chỉ khác trường.</p><a href="${escapeHtml(mapSearchLink(query))}" target="_blank" rel="noopener noreferrer">Tìm trên OpenStreetMap ↗</a>${c?`<a href="${escapeHtml(naverQuery(c))}" target="_blank" rel="noopener noreferrer">Đối chiếu trên Naver ↗</a>`:''}`);
      zoomNotice('Chưa có vị trí nguồn mở đủ khớp; xem liên kết tìm kiếm để đối chiếu.');
      return;
    }
    const shown=candidates.filter(x=>x.score>=30);
    const rows=shown.map((x,i)=>`<button type="button" data-geoid="${i}" class="geo-candidate"><strong>${safeText(x.name)}</strong><small>${safeText(x.label)} · ${safeText(x.osm_value||'OSM')} · ${x.score} điểm khớp</small></button>`).join('');
    showGeoPanel(c?'Địa điểm nguồn mở — chọn đúng campus':'Kết quả tìm trường trên bản đồ',`<p class="geo-hint">Ghim màu xanh là dữ liệu tham khảo của OpenStreetMap, chưa được MR LEE kiểm chứng độc lập.</p>${rows}<a href="${escapeHtml(mapSearchLink(query))}" target="_blank" rel="noopener noreferrer">Kiểm tra OpenStreetMap ↗</a>${c?`<a href="${escapeHtml(naverQuery(c))}" target="_blank" rel="noopener noreferrer">Đối chiếu Naver ↗</a>`:''}`);
    $('geoResults').querySelectorAll('[data-geoid]').forEach((el)=>{
      const x=shown[Number(el.dataset.geoid)];
      el.onclick=()=>{
        if(ticket!==state.searchTicket)return;
        previewMap(x.lat,x.lng,x.name,c,true);
        $('geoResults').querySelectorAll('[data-geoid]').forEach(b=>b.classList.toggle('chosen',b===el));
      };
    });
    // If high confidence AND clearly ahead of other matches, zoom immediately, still provisional.
    if(strong[0].score>=70 && (strong.length===1||strong[0].score-strong[1].score>=20)) {
      previewMap(strong[0].lat,strong[0].lng,strong[0].name,c,false);
    } else zoomNotice('Có nhiều địa điểm tương tự. Vui lòng chọn đúng campus trong danh sách.');
  }
  async function locateOpenPlace(query,c=null){
    clearGeoPanel();const ticket=state.searchTicket;
    const text=String(query||'').trim();if(!text)return;
    if(c&&hasPin(c)){
      if(c.accuracy==='verified'){
        if(state.mapReady)state.map.flyTo({center:[c.lng,c.lat],zoom:17,duration:800});
        zoomNotice('Đã phóng đến campus có tọa độ được duyệt.');
      }else previewMap(c.lat,c.lng,c.school.vi||c.school.en,c,false);
      return;
    }
    showGeoPanel('Đang tìm trường trên OpenStreetMap',`<p>Đang tra cứu địa điểm: ${safeText(text)}. Không cần tài khoản, thẻ hoặc API key.</p>`);
    const cacheKey=norm(text);const cached=geocodeCache.get(cacheKey);
    if(cached){renderGeoCandidates(text,c,toGeoCandidates({features:cached.features},c,text),ticket);return;}
    const wait=Math.max(0,1800-(Date.now()-previousLookup));
    if(wait)await new Promise(resolve=>{lookupWaiter={resolve,timer:setTimeout(resolve,wait)};});
    lookupWaiter=null;
    if(ticket!==state.searchTicket)return;
    const controller=new AbortController();lookupController=controller;previousLookup=Date.now();
    try{
      const url=GEO_ENDPOINT+'?q='+encodeURIComponent(text)+'&limit=10&lang=ko';
      const response=await fetch(url,{signal:controller.signal,headers:{'Accept':'application/json'},cache:'no-store'});
      if(!response.ok)throw Error('HTTP '+response.status);
      const data=await response.json();if(ticket!==state.searchTicket)return;
      const features=Array.isArray(data.features)?data.features.slice(0,10):[];
      cacheLookup(cacheKey,features);
      renderGeoCandidates(text,c,toGeoCandidates({features},c,text),ticket);
    }catch(error){
      if(ticket!==state.searchTicket||error.name==='AbortError')return;
      showGeoPanel('Máy chủ tìm kiếm tạm thời không khả dụng',`<p>Không kết nối được dịch vụ tìm địa điểm. Danh mục MR LEE vẫn hoạt động bình thường.</p><a href="${escapeHtml(mapSearchLink(text))}" target="_blank" rel="noopener noreferrer">Mở OpenStreetMap để tìm trường ↗</a>`);
    }finally{if(lookupController===controller)lookupController=null;}
  }
  const regionById = id => state.regions.find(r => r.id === id);
  const regionName = id => regionById(id)?.vi || (id==='unknown'?'Chưa rõ khu vực':id);
  const campusName = c => c.ko ? `${c.ko} · ${c.en}` : c.en;
  const allSchoolCampuses = id => state.campusGroups.get(id) || state.campuses.filter(c=>c.school.id === id);
  const schoolQueryText = s => norm([s.ko,s.vi,s.en,...(s.aliases||[])].join(' '));
  const englishCities={
    '수원':'Suwon','용인':'Yongin','성남':'Seongnam','천안':'Cheonan','아산':'Asan','인천':'Incheon',
    '안산':'Ansan','안양':'Anyang','고양':'Goyang','남양주':'Namyangju','부천':'Bucheon',
    '춘천':'Chuncheon','원주':'Wonju','강릉':'Gangneung','청주':'Cheongju','충주':'Chungju',
    '전주':'Jeonju','익산':'Iksan','군산':'Gunsan','포항':'Pohang','경주':'Gyeongju',
    '진주':'Jinju','김해':'Gimhae','창원':'Changwon','제주':'Jeju','서귀포':'Seogwipo',
    '서울':'Seoul','부산':'Busan','대전':'Daejeon','대구':'Daegu','광주':'Gwangju','세종':'Sejong',
    '울산':'Ulsan','평택':'Pyeongtaek','화성':'Hwaseong','시흥':'Siheung','파주':'Paju',
    '홍성':'Hongseong','논산':'Nonsan','공주':'Gongju','목포':'Mokpo','순천':'Suncheon'};
  function cityEnglish(c){const x=String(c.cityKo||c.city||'');return Object.keys(englishCities).filter(k=>x.includes(k)).map(k=>englishCities[k]);}
  function campQueryText(c) {return norm([c.ko,c.en,c.vi,...(c.aliases||[]),c.city,c.cityKo,...cityEnglish(c),c.address,c.officialBranch,regionName(c.region),regionById(c.region)?.ko,...(regionById(c.region)?.aliases||[])].join(' '));}
  function matchesSchool(s,q) {return schoolQueryText(s).includes(q) || [s.ko,s.vi,s.en,...(s.aliases||[])].some(n=>norm(n).includes(q));}
  function matchesCampus(c,q) {
    const school=c.school;
    const joint=[school.ko,school.en,school.vi,...(school.aliases||[])].filter(Boolean).flatMap(name=>[c.ko,c.en,c.vi,...(c.aliases||[]),c.city,c.cityKo,...cityEnglish(c),c.address].filter(Boolean).map(place=>norm(name+' '+place)));
    return campQueryText(c).includes(q) || joint.some(item=>item.includes(q)) || [c.ko,c.en,c.vi,c.city,c.cityKo].some(n=>norm(n).includes(q));
  }
  function regionSearch(q) {return state.regions.find(r=>[r.vi,r.en,r.ko,...r.aliases].some(x=>norm(x)===q));}
  function getFilteredCampuses(){
    let list = state.campuses.filter(c => state.type==='all' || c.school.type===state.type);
    if (state.region) list=list.filter(c=>c.region===state.region);
    if (state.selectedSchoolId) list=list.filter(c=>c.school.id===state.selectedSchoolId);
    if (state.city) list=list.filter(c=>norm(c.city)===norm(state.city) || norm(c.cityKo)===norm(state.city) || norm(c.cityKo).startsWith(norm(state.city)) || norm(state.city).startsWith(norm(c.cityKo)) || norm(c.city).includes(norm(state.city)));
    if (state.query.trim()){
      const q=norm(state.query), r=regionSearch(q);
      list=list.filter(c=> (r && c.region===r.id) || matchesSchool(c.school,q) || matchesCampus(c,q));
    }
    return list;
  }
  const uniqueSchools = campuses => new Set(campuses.map(c=>c.school.id)).size;
  const schoolCampuses = school => allSchoolCampuses(school.id);
  const byName = (a,b) => a.localeCompare(b, 'vi');

  // V5: A real campus detail panel; pictures appear only when a licensed/approved image URL exists.
  function closeDetail(){state.detailOpen=false;$('campusDetail').hidden=true;$('campusDetail').innerHTML='';if(state.activePopup){state.activePopup.remove();state.activePopup=null;}}
  function detailPicture(c){
    const url=safePhoto(c.photo_url), fallback='<div class="campus-photo-empty" role="img" aria-label="Chưa có ảnh khuôn viên được xác minh"><span aria-hidden="true">🏛️</span><strong>Ảnh khuôn viên đang cập nhật</strong><small>Không dùng ảnh ngẫu nhiên không đúng trường</small></div>';
    if(!url)return fallback;
    return `<div class="campus-picture"><img src="${escapeHtml(url)}" alt="${safeText(c.school.en)} — ${safeText(c.en||c.ko||'campus')}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.classList.add('photo-failed');this.remove()"><span class="photo-credit">${safeText(c.photo_credit||'Ảnh được cấp phép sử dụng')}</span></div>`;
  }
  function detailLinks(c){
    const official=c.source_url||c.school.website||'';
    const phone=phoneHref(c.phone);
    return `<div class="campus-action-links">
      ${phone?`<a class="primary" href="${escapeHtml(phone)}">☎ Gọi trường</a>`:''}
      ${safeLink(mapsQuery(c),'OpenStreetMap')}
      ${safeLink(naverQuery(c),'Naver Map')}
      ${safeLink(validUrl(official),'Nguồn / website trường')}
    </div>`;
  }
  function showCampusDetail(c){
    const el=$('campusDetail');if(!el)return;
    const siblings=allSchoolCampuses(c.school.id);
    const pin=!!geoCoord(c),exact=hasPin(c)&&c.accuracy==='verified';
    el.innerHTML=`<div class="campus-detail-top"><strong>HỒ SƠ TRƯỜNG · ${safeText(regionName(c.region))}</strong><button type="button" id="detailClose" aria-label="Đóng thông tin trường">×</button></div>
      ${detailPicture(c)}
      <div class="campus-detail-content"><h2>${safeText(c.school.vi||c.school.en)}</h2>
      <p class="campus-school-ko">${safeText(c.school.ko)} · ${safeText(c.school.en)}</p>
      <p class="campus-campus-name">📍 ${safeText(c.vi||c.en||c.ko)} (${safeText(c.city||c.cityKo||regionName(c.region))})</p>
      <dl><div><dt>Địa chỉ campus</dt><dd>${safeText(addressOf(c))}${c.source_url?` <span class="source-badge">Đã đối chiếu nguồn</span>`:''}</dd></div>
        <div><dt>Điện thoại</dt><dd>${c.phone ? `${safeText(c.phone)}${c.phone_label?` <small>(${safeText(c.phone_label)})</small>`:''}` : '<span class="pending">Chưa xác minh – xem website chính thức</span>'}</dd></div>
        <div><dt>Bản đồ</dt><dd class="${exact?'verified':'pending'}">${safeText(pinStatus(c))}</dd></div>
      </dl>
      ${siblings.length>1?`<div class="campus-siblings"><strong>${siblings.length} cơ sở liên quan — chọn để zoom</strong><div class="campus-siblings-list">${siblings.map(x=>`<button type="button" data-choose-campus="${escapeHtml(x.uid)}" class="${x.uid===c.uid?'current':''}">${safeText(x.vi||x.en||x.ko)} · ${safeText(x.city||x.cityKo)}</button>`).join('')}</div></div>`:''}
      ${(!pin||!exact)?'<p class="location-warning">Điểm ghim từ nguồn mở hoặc tọa độ tham khảo chưa được MR LEE xác minh với địa chỉ trường. Hãy đối chiếu đúng campus và website chính thức.</p>':''}
      ${detailLinks(c)}
      ${c.photo_url?`<small class="photo-source">Ảnh: ${safeText(c.photo_credit||'Nguồn đã cung cấp')} · ${safeText(c.photo_license||'Cần kiểm tra quyền sử dụng')} ${c.photo_source?safeLink(c.photo_source,'Nguồn ảnh / giấy phép'):''}</small>`:''}
      ${c.verified_at?`<small class="checked-at">Thông tin liên hệ đối chiếu: ${safeText(c.verified_at)}</small>`:''}
      </div>`;
    state.detailOpen=true;el.hidden=false;
    el.querySelector('#detailClose').onclick=closeDetail;
    el.querySelectorAll('[data-choose-campus]').forEach(b=>b.onclick=()=>chooseCampus(b.dataset.chooseCampus));
    if(matchMedia('(max-width:760px)').matches){el.scrollIntoView({behavior:'smooth',block:'nearest'});}
  }
  function showSchoolDetail(school,campuses){
    const el=$('campusDetail');if(!el)return;
    el.innerHTML=`<div class="campus-detail-top"><strong>CHỌN CƠ SỞ ĐỂ PHÓNG TO</strong><button id="detailClose" type="button" aria-label="Đóng thông tin">×</button></div>
       <div class="campus-detail-content"><h2>${safeText(school.vi||school.en)}</h2><p>${safeText(school.ko)} · ${campuses.length} cơ sở trong dữ liệu</p>
       <p>Nhấn một campus để phóng gần và xem ảnh, địa chỉ, điện thoại.</p>
       <div class="school-options">${campuses.map(c=>`<button type="button" data-choose-campus="${escapeHtml(c.uid)}"><span>📍 <strong>${safeText(c.vi||c.en||c.ko)}</strong><small>${safeText(c.city)}, ${safeText(regionName(c.region))} · ${safeText(pinStatus(c))}</small></span>➜</button>`).join('')}</div>
       </div>`;
    state.detailOpen=true;el.hidden=false;
    el.querySelector('#detailClose').onclick=closeDetail;
    el.querySelectorAll('[data-choose-campus]').forEach(b=>b.onclick=()=>chooseCampus(b.dataset.chooseCampus));
  }

  function renderRegions(){
    const list = $('regionList'); list.innerHTML='';
    for(const r of state.regions){
      const points = state.campuses.filter(c=>c.region===r.id);
      const b=document.createElement('button');b.className='region'+(state.region===r.id?' selected':'');b.type='button';b.title=`${r.ko} – ${r.en}`;
      b.innerHTML=`<span>${safeText(r.vi)}</span><small>${safeText(r.ko)} · ${uniqueSchools(points)} trường</small>`;
      b.onclick=()=>chooseRegion(r.id);list.append(b);
    }
  }
  function renderCities(){
    const wrap=$('cityList');wrap.innerHTML='';
    if (!state.region){wrap.hidden=true;return;}
    const set = new Map();
    state.campuses.filter(c=>c.region===state.region).forEach(c=>{
      const k=norm(c.cityKo||c.city);if(!set.has(k))set.set(k,{city:c.city,ko:c.cityKo,points:[]});set.get(k).points.push(c);
    });
    // If administrative boundary data loads, show every city/district, not only cities in the initial school seed.
    for (const f of state.cityFeatures.filter(f=>f.properties?.__regionId===state.region)) {
      const ko=f.properties.__cityKo||'',en=f.properties.__cityEn||ko;
      if(!ko)continue;
      const key=norm(ko);
      if(!set.has(key))set.set(key,{city:en,ko,points:[]});
      const obj=set.get(key);
      obj.points=state.campuses.filter(c=>c.region===state.region && (norm(c.cityKo)===key||norm(ko).startsWith(norm(c.cityKo))||norm(c.city).includes(norm(en))));
    }
    const cities=[...set.values()].sort((a,b)=>byName(a.city,b.city));
    const all=document.createElement('button');all.type='button';all.className='city'+(!state.city?' selected':'');all.innerHTML=`<span>Tất cả khu vực</span><small>${state.campuses.filter(c=>c.region===state.region).length} cơ sở</small>`;all.onclick=()=>chooseCity(null);wrap.append(all);
    cities.forEach(o=>{const b=document.createElement('button');b.type='button';b.className='city'+(state.city===o.ko||state.city===o.city?' selected':'');b.innerHTML=`<span>${safeText(o.city)}</span><small>${safeText(o.ko)} · ${o.points.length} cơ sở</small>`;b.onclick=()=>chooseCity(o.ko||o.city);wrap.append(b);});
    wrap.hidden=false;
  }
  function renderCrumb(){
    const el=$('crumb');el.innerHTML='';
    const make=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;el.append(b);};
    make('Hàn Quốc',()=>resetNavigation(false));
    if(state.region)make(regionName(state.region),()=>chooseRegion(state.region));
    if(state.city)make(state.city,()=>chooseCity(state.city));
    $('backBtn').hidden=!state.region;
    $('sideTitle').textContent=!state.region?'Chọn tỉnh / thành phố cấp tỉnh':(!state.city?'Chọn thành phố hoặc quận':'Các trường tại '+state.city);
    $('regionList').hidden=!!state.region;
  }
  function renderCards(){
    const campuses=getFilteredCampuses();
    $('resultCounter').textContent=String(campuses.length);
    $('resultsTitle').textContent=state.query ? 'Kết quả tìm kiếm' : (state.city ? `Các cơ sở tại ${state.city}`: state.region?`Các cơ sở tại ${regionName(state.region)}`:'Các cơ sở có dữ liệu');
    $('slidesCount').textContent=`${uniqueSchools(campuses)} trường · ${campuses.length} cơ sở`;
    $('slidesTitle').textContent=state.selectedSchoolId ? 'Các cơ sở của trường đang chọn' : 'Khám phá các cơ sở';
    const results=$('resultsList'),slides=$('campusSlides');results.innerHTML='';slides.innerHTML='';
    const visibleCampuses=campuses.slice(0,listShowAll ? 250 : 35);
    if(!campuses.length){results.innerHTML='<div class="empty">Không có trường phù hợp trong dữ liệu MR LEE. Nhập tên và nhấn Tìm để tra cứu OpenStreetMap.</div>';slides.innerHTML='<div class="empty">Hãy đổi khu vực hoặc tên tìm kiếm.</div>';return;}
    for(const c of visibleCampuses){
      const nSchool=schoolCampuses(c.school).length;
      const res=document.createElement('button');res.type='button';res.className='result'+(state.selected===c.uid?' selected':'');res.setAttribute('data-campus',c.uid);
      res.innerHTML=`<div><strong>${safeText(c.school.vi||c.school.en)}</strong><small>${safeText(c.school.ko)} · ${safeText(c.ko||c.en)}</small><small>${safeText(c.city)} · ${safeText(regionName(c.region))}</small><small>${safeText(pinStatus(c))}</small></div><b>${nSchool>1?nSchool+' CS':hasPin(c)?'📍':'⌕'}</b>`;
      res.onclick=()=>chooseCampus(c.uid);results.append(res);
      const slide=document.createElement('article');slide.className='slide'+(state.selected===c.uid?' selected':'');slide.setAttribute('data-campus',c.uid);slide.tabIndex=0;slide.role='button';
      slide.innerHTML=`<span class="small-tag">${nSchool>1?nSchool+' cơ sở thuộc trường':'Cơ sở'} · ${safeText(regionName(c.region))}</span><h3>${safeText(c.school.vi||c.school.en)}</h3><p>${safeText(c.school.ko)}<br>${safeText(c.ko||c.en)} · ${safeText(c.city)}<br>${safeText(c.address || '')}</p><small class="pin-status">${safeText(pinStatus(c))}</small><small class="pin-status">☎ ${safeText(c.phone||'Đang cập nhật số điện thoại')}</small><a href="${escapeHtml(mapsQuery(c))}" target="_blank" rel="noopener noreferrer">Kiểm tra OpenStreetMap ↗</a>${c.school.website?`<a href="${escapeHtml(validUrl(c.school.website))}" target="_blank" rel="noopener noreferrer">Website trường ↗</a>`:''}`;
      slide.onclick=(e)=>{if(e.target.closest('a'))return;chooseCampus(c.uid)};slide.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseCampus(c.uid);}};
      slides.append(slide);
    }
    if(campuses.length>visibleCampuses.length){const hint=document.createElement('div');hint.className='empty';hint.textContent=`Đang hiển thị ${visibleCampuses.length}/${campuses.length} cơ sở. Bạn có thể tìm chính xác bằng tên trường.`;results.append(hint);if(!listShowAll){const b=document.createElement('button');b.type='button';b.className='list-more-button';b.textContent='Xem thêm trường ↓';b.onclick=()=>{listShowAll=true;renderCards();};results.append(b);}}
  }
  function render(){renderCrumb();renderRegions();renderCities();renderCards();updateMapMarkers();updateBoundaryStyles();}
  function setSearch(s){
    hideGoogleMap();
    clearTimeout(autoSearchTimer);
    const ticket=++autoSearchTicket;
    if(s.trim()){state.region=null;state.city=null;}
    listShowAll=false;state.query=s;state.selected=null;state.selectedSchoolId=null;
    closeDetail();clearZoomNotice();render();showSuggestions();
    if(!s.trim())return;
    // Tự động di chuyển khi đã đủ rõ ràng, không bay tới kết quả ngẫu nhiên khi còn nhập dở.
    autoSearchTimer=setTimeout(()=>{
      if(ticket!==autoSearchTicket || $('mapSearch').value!==s)return;
      const match=preciseAutoMatch(norm(s));
      if(match)selectSuggestion(match,true);
    },380);
  }
  function zoomNotice(text){const el=$('zoomNotice');if(!el)return;el.textContent=text;el.hidden=!text;}
  function clearZoomNotice(){zoomNotice('');}
  function campusNames(c){return [c.ko,c.en,c.vi,...(c.aliases||[])].filter(Boolean);}
  function schoolNames(s){return [s.ko,s.en,s.vi,...(s.aliases||[])].filter(Boolean);}
  function preciseAutoMatch(q){
    if(q.length<3)return null;
    const exactCampuses=state.campuses.filter(c=>campusNames(c).some(n=>norm(n)===q) || schoolNames(c.school).some(n=>campusNames(c).some(part=>norm(n+' '+part)===q)) || schoolNames(c.school).some(n=>[c.city,c.cityKo,...cityEnglish(c)].some(city=>norm(n+' '+city)===q)));
    if(exactCampuses.length===1)return {kind:'campus',id:exactCampuses[0].uid};
    const exactSchools=state.schools.filter(s=>schoolNames(s).some(n=>norm(n)===q));
    if(exactSchools.length===1)return {kind:'school',id:exactSchools[0].id};
    const r=regionSearch(q);if(r)return {kind:'region',id:r.id};
    if(q.length<5)return null;
    const matchingCampuses=state.campuses.filter(c=>matchesSchool(c.school,q)||matchesCampus(c,q));
    const ids=[...new Set(matchingCampuses.map(c=>c.school.id))];
    if(matchingCampuses.length===1)return {kind:'campus',id:matchingCampuses[0].uid};
    // Nếu tên gõ chỉ trỏ tới duy nhất một trường, tự mở campus mặc định của trường đó.
    if(ids.length===1)return {kind:'school',id:ids[0]};
    return null;
  }
  function selectSuggestion(item,fromSearch=false){
    if(!item)return false;
    clearTimeout(autoSearchTimer);++autoSearchTicket;
    if(item.kind==='school')chooseSchool(item.id,{preserveInput:fromSearch});
    else if(item.kind==='campus')chooseCampus(item.id,{preserveInput:fromSearch});
    else chooseRegion(item.id);
    return true;
  }
  function submitSearch(){
    const q=norm($('mapSearch').value);
    if(!q)return;
    const target=preciseAutoMatch(q)||suggestionItems(q)[0];
    if(target)selectSuggestion(target,true);
    else{closeDetail();state.selected=null;state.selectedSchoolId=null;locateOpenPlace($('mapSearch').value);$('searchMatches').hidden=true;}
  }
  function resetNavigation(clearSearch=true){hideGoogleMap();clearTimeout(autoSearchTimer);++autoSearchTicket;clearZoomNotice();closeDetail();state.region=null;state.city=null;state.selected=null;state.selectedSchoolId=null;if(clearSearch){state.query='';$('mapSearch').value='';}render();fitCountry();}
  function chooseRegion(id){hideGoogleMap();clearZoomNotice();closeDetail();state.region=id;state.city=null;state.selected=null;state.selectedSchoolId=null;state.query='';$('mapSearch').value='';render();$('searchMatches').hidden=true;const r=regionById(id);if(r && state.mapReady)state.map.flyTo({center:r.center,zoom:r.zoom,duration:900});}
  function chooseCity(city){hideGoogleMap();clearZoomNotice();closeDetail();state.city=city;state.selected=null;state.query='';state.selectedSchoolId=null;$('mapSearch').value='';render();if(city)fitCampuses(getFilteredCampuses());}
  function chooseSchool(id,options={}){
    const school=state.schools.find(s=>s.id===id);if(!school)return;
    state.region=null;state.city=null;state.query='';
    if(!options.preserveInput)$('mapSearch').value='';
    state.selectedSchoolId=id;state.selected=null;
    $('searchMatches').hidden=true;$('mapSearch').setAttribute('aria-expanded','false');
    const campuses=allSchoolCampuses(id);
    if(!campuses.length)return;
    // Chọn một campus thực sự có tọa độ. Không phóng ra cả nước khi tìm một tên trường.
    // Trường nhiều campus có thể đổi cơ sở trực tiếp trong thẻ hồ sơ mở sau khi zoom.
    const chosen=campuses.find(c=>hasPin(c) && c.accuracy==='verified') || campuses.find(hasPin) || campuses[0];
    chooseCampus(chosen.uid,{preserveInput:options.preserveInput});
  }
  function chooseCampus(uid,options={}){
    const c=state.campuses.find(x=>x.uid===uid);if(!c)return;
    state.region=null;state.city=null;state.query='';
    if(!options.preserveInput)$('mapSearch').value='';
    state.selected=c.uid;state.selectedSchoolId=c.school.id;render();
    if(state.mapReady && state.map.getLayer('selected-campus-ring'))state.map.setFilter('selected-campus-ring',['==',['get','uid'],uid]);
    $('searchMatches').hidden=true;$('mapSearch').setAttribute('aria-expanded','false');
    const res=Array.from($('resultsList').children).find(e=>e.dataset.campus===uid);
    if(res && !options.preserveInput)res.scrollIntoView({block:'nearest'});
    const slide=Array.from($('campusSlides').children).find(e=>e.dataset.campus===uid);
    if(slide && !options.preserveInput)slide.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
    // V9: use confirmed local positions first; otherwise lookup OSM POI on user selection.
    if(hasPin(c) && c.accuracy==='verified' && state.mapReady){
      hideGoogleMap();
      if(state.activePopup){state.activePopup.remove();state.activePopup=null;}
      const reduced=window.matchMedia?.('(prefers-reduced-motion:reduce)').matches;
      state.map.flyTo({center:[c.lng,c.lat],zoom:17,duration:reduced?0:1200,essential:true,offset:matchMedia('(max-width:760px)').matches?[0,-60]:[-65,0]});
      state.map.once('moveend',()=>openPopup(c));
      zoomNotice(`Đã zoom đến ${c.school.vi||c.school.en} — ${c.vi||c.en||c.ko}.`);
    }else{
      locateOpenPlace(placeText(c),c);
    }
    showCampusDetail(c);
  }

  function suggestionItems(q){
    if(!q)return[];
    const region=regionSearch(q);const items=[];
    if(region)items.push({kind:'region',id:region.id,title:`${region.vi} · ${region.ko}`,description:'Lọc trường theo khu vực',rank:100});
    for(const s of state.schools){if(matchesSchool(s,q))items.push({kind:'school',id:s.id,title:s.vi||s.en,description:`${s.ko} · ${schoolCampuses(s).length} cơ sở`,rank:norm(s.ko)===q||norm(s.en)===q?90:70});}
    for(const c of state.campuses){if(matchesCampus(c,q))items.push({kind:'campus',id:c.uid,title:`${c.school.vi||c.school.en} — ${c.vi||c.en}`,description:`${c.city}, ${regionName(c.region)}`,rank:(c.aliases||[]).some(a=>norm(a)===q)||norm(c.ko)===q||norm(c.city)===q?95:40});}
    return items.sort((a,b)=>b.rank-a.rank).slice(0,14);
  }
  function showSuggestions(){
    const q=norm(state.query),items=suggestionItems(q),el=$('searchMatches');el.innerHTML='';
    if(!q||!items.length){el.hidden=true;$('mapSearch').setAttribute('aria-expanded','false');return;}
    for(const item of items){const b=document.createElement('button');b.type='button';b.className='match';b.setAttribute('role','option');b.innerHTML=`<span><strong>${safeText(item.title)}</strong><small>${safeText(item.description)}</small></span><em>${item.kind==='school'?'Trường':item.kind==='campus'?'Cơ sở':'Khu vực'}</em>`;b.onclick=()=>selectSuggestion(item,true);el.append(b);}
    el.hidden=false;$('mapSearch').setAttribute('aria-expanded','true');
  }
  function flyToCampuses(campuses){const m=state.map;if(!state.mapReady||!campuses.length)return;const pts=campuses.filter(c=>geoCoord(c));if(!pts.length)return;const lons=pts.map(c=>geoCoord(c).lng),lats=pts.map(c=>geoCoord(c).lat);if(pts.length===1||Math.abs(Math.max(...lons)-Math.min(...lons))<0.0005&&Math.abs(Math.max(...lats)-Math.min(...lats))<0.0005){m.flyTo({center:[geoCoord(pts[0]).lng,geoCoord(pts[0]).lat],zoom:12,duration:850});return;}m.fitBounds([[Math.min(...lons),Math.min(...lats)],[Math.max(...lons),Math.max(...lats)]],{padding:85,maxZoom:12,duration:900});}
  function fitCampuses(campuses){flyToCampuses(campuses);}
  function fitCountry(){if(state.mapReady)state.map.fitBounds([[124.5,32.8],[131.2,38.9]],{padding:33,duration:800});}
  function mapFeatures(){return {type:'FeatureCollection',features:getFilteredCampuses().filter(c=>geoCoord(c)).map(c=>({type:'Feature',geometry:{type:'Point',coordinates:[geoCoord(c).lng,geoCoord(c).lat]},properties:{uid:c.uid,title:c.school.en,city:c.city,preview:c.accuracy==='verified'?'no':'yes'}}))};}
  function updateMapMarkers(){if(!state.mapReady||!state.campusSourceReady)return;state.map.getSource('university-campus-points')?.setData(mapFeatures());}
  function openPopup(c){if(!state.mapReady || state.selected!==c.uid)return;
    const html=`<div class="pin-popup"><strong>${safeText(c.school.vi||c.school.en)}</strong><small>${safeText(c.ko||c.en)} · ${safeText(c.city)}</small><small>${safeText(addressOf(c))}</small><small>${safeText(c.phone||'Số điện thoại chưa xác minh')}</small><small>${safeText(pinStatus(c))}</small></div>`;
    state.activePopup=new maplibregl.Popup({offset:16,maxWidth:'280px',closeOnMove:false}).setLngLat([geoCoord(c).lng,geoCoord(c).lat]).setHTML(html).addTo(state.map);
  }
  function initMap(){
    if(typeof maplibregl==='undefined'){fallback('Không tải được thư viện bản đồ. Tìm kiếm và danh sách trường vẫn sử dụng được.');return;}
    try{
      const m=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:[127.8,36.3],zoom:6.25,minZoom:5,maxZoom:18,attributionControl:true});
      state.map=m;m.addControl(new maplibregl.NavigationControl({visualizePitch:true,showZoom:true}),'bottom-right');
      m.on('load',()=>{state.mapReady=true;const fallbackEl=$('mapFallback');if(fallbackEl)fallbackEl.remove();
        m.addSource('university-campus-points',{type:'geojson',data:mapFeatures(),cluster:true,clusterRadius:48,clusterMaxZoom:12});
        m.addLayer({id:'campus-clusters',type:'circle',source:'university-campus-points',filter:['has','point_count'],paint:{'circle-color':'#165482','circle-radius':['step',['get','point_count'],18,10,23,50,28],'circle-stroke-width':3,'circle-stroke-color':'#fff'}});
        m.addLayer({id:'campus-cluster-count',type:'symbol',source:'university-campus-points',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':12},paint:{'text-color':'#ffffff'}});
        m.addLayer({id:'campus-points',type:'circle',source:'university-campus-points',filter:['!', ['has','point_count']],paint:{'circle-color':['case',['==',['get','preview'],'yes'],'#167abb','#e46d40'],'circle-radius':8,'circle-stroke-width':2,'circle-stroke-color':'#fff'}});
        m.addLayer({id:'selected-campus-ring',type:'circle',source:'university-campus-points',filter:['==',['get','uid'],'~'],paint:{'circle-color':'#2d83d1','circle-opacity':0.14,'circle-radius':21,'circle-stroke-width':3,'circle-stroke-color':'#2068b4'}});
        state.campusSourceReady=true;
        m.on('click','campus-clusters',e=>{const features=m.queryRenderedFeatures(e.point,{layers:['campus-clusters']});const f=features[0];if(!f)return;m.getSource('university-campus-points').getClusterExpansionZoom(f.properties.cluster_id).then(z=>m.easeTo({center:f.geometry.coordinates,zoom:z,duration:700})).catch(()=>{});});
        m.on('click','campus-points',e=>{const f=e.features?.[0];if(f)chooseCampus(f.properties.uid);});
        ['campus-clusters','campus-points'].forEach(id=>{m.on('mouseenter',id,()=>m.getCanvas().style.cursor='pointer');m.on('mouseleave',id,()=>m.getCanvas().style.cursor='');});
        if(state.selected)chooseCampus(state.selected);
        else if(state.selectedSchoolId)fitCampuses(allSchoolCampuses(state.selectedSchoolId));
        loadBoundary();
      });
      m.on('error',()=>{ /* transient tiles/style errors must not break the search panel */ });
    }catch(err){fallback('Không khởi tạo được bản đồ: '+err.message);}
  }
  function fallback(message){const el=$('mapFallback');if(el){el.querySelector('strong').textContent='Bản đồ tạm thời không khả dụng';el.querySelector('span').textContent=message;}}
  function administrativeRegion(feature){
    const p=feature.properties||{};const name=[p.CTP_KOR_NM,p.CTPRVN_NM,p.CTP_ENG_NM,p.name,p.NAME_1,p.sidokor,p.시도명].filter(Boolean).join(' ');
    const normalized=norm(name);
    const codes=String(p.CTPRVN_CD||p.CTP_CD||p.adm_cd||'');
    const byCode={'11':'seoul','26':'busan','27':'daegu','28':'incheon','29':'jeonnam-gwangju','30':'daejeon','31':'ulsan','36':'sejong','41':'gyeonggi','42':'gangwon','43':'chungbuk','44':'chungnam','45':'jeonbuk','46':'jeonnam-gwangju','47':'gyeongbuk','48':'gyeongnam','50':'jeju','51':'gangwon','52':'jeonbuk'};
    if(byCode[codes.slice(0,2)])return byCode[codes.slice(0,2)];
    const aliases=[['seoul',['서울']],['busan',['부산']],['daegu',['대구']],['incheon',['인천']],['daejeon',['대전']],['ulsan',['울산']],['sejong',['세종']],['gyeonggi',['경기']],['gangwon',['강원']],['chungbuk',['충북','충청북']],['chungnam',['충남','충청남']],['jeonbuk',['전북','전라북']],['jeonnam-gwangju',['광주','전남','전라남']],['gyeongbuk',['경북','경상북']],['gyeongnam',['경남','경상남']],['jeju',['제주']]];
    return aliases.find(([_,names])=>names.some(n=>normalized.includes(norm(n))))?.[0]||'';
  }
  async function loadBoundary(){
    // Source boundaries dated 2023; two former regions are grouped into one 2026 administrative selection.
    const url='https://raw.githubusercontent.com/KnellBalm/kr-admin-geojson/main/ctprvn.geojson';
    try{const resp=await fetch(url,{cache:'force-cache'});if(!resp.ok)throw Error('HTTP '+resp.status);const obj=await resp.json();
      if(obj.type!=='FeatureCollection'||!Array.isArray(obj.features))throw Error('invalid GeoJSON');
      obj.features.forEach((f,i)=>{f.properties=f.properties||{};f.properties.__regionId=administrativeRegion(f);f.properties.__id=i;});
      if(!state.mapReady)return;const m=state.map;
      m.addSource('korea-provinces',{type:'geojson',data:obj});
      m.addLayer({id:'korea-province-fills',type:'fill',source:'korea-provinces',paint:{'fill-color':['case',['==',['get','__regionId'],state.region||'~'],'#3f99c5','#7dc5f3'],'fill-opacity':['case',['==',['get','__regionId'],state.region||'~'],.26,.06]}});
      m.addLayer({id:'korea-province-lines',type:'line',source:'korea-provinces',paint:{'line-color':'#2570a3','line-width':1,'line-opacity':.58}});
      // Keep campus markers above polygons regardless of async load timing.
      ['campus-clusters','campus-cluster-count','campus-points','selected-campus-ring'].forEach(id=>{if(m.getLayer(id))m.moveLayer(id);});
      m.on('click','korea-province-fills',e=>{if(m.queryRenderedFeatures(e.point,{layers:['campus-points','campus-clusters']}).length)return;const regionId=e.features?.[0]?.properties?.__regionId;if(regionId)chooseRegion(regionId);});
      m.on('mouseenter','korea-province-fills',()=>m.getCanvas().style.cursor='pointer');
      m.on('mouseleave','korea-province-fills',()=>m.getCanvas().style.cursor='');
      state.polygonReady=true;updateBoundaryStyles();loadCityBoundaries();
    }catch(err){console.warn('Administrative boundary unavailable; list navigation remains active.',err.message);}
  }
  async function loadCityBoundaries(){
    // SIG_KOR_NM / SIG_ENG_NM are official legacy district names, available to browse after selecting a province.
    const url='https://raw.githubusercontent.com/KnellBalm/kr-admin-geojson/main/sig.geojson';
    try {
      const response=await fetch(url,{cache:'force-cache'});if(!response.ok)throw Error('HTTP '+response.status);
      const obj=await response.json();if(!Array.isArray(obj.features))throw Error('invalid district GeoJSON');
      obj.features.forEach((f,i)=>{const p=f.properties||{};const sig=String(p.SIG_CD||p.sig_cd||'');
        p.__regionId=administrativeRegion({properties:{CTPRVN_CD:sig.slice(0,2),CTP_KOR_NM:p.CTP_KOR_NM||''}});
        p.__cityKo=String(p.SIG_KOR_NM||p.SIG_NM||p.name||'');p.__cityEn=String(p.SIG_ENG_NM||p.SIG_ENG||p.__cityKo);p.__id=i;f.properties=p;});
      state.cityFeatures=obj.features;
      if(!state.mapReady)return;
      const m=state.map;
      m.addSource('korea-districts',{type:'geojson',data:obj});
      m.addLayer({id:'korea-district-fills',type:'fill',source:'korea-districts',filter:['==',['get','__regionId'],state.region||'~'],paint:{'fill-color':'#2e9ec5','fill-opacity':.075}});
      m.addLayer({id:'korea-district-lines',type:'line',source:'korea-districts',filter:['==',['get','__regionId'],state.region||'~'],paint:{'line-color':'#498cbe','line-opacity':.65,'line-width':1.1}});
      ['campus-clusters','campus-cluster-count','campus-points','selected-campus-ring'].forEach(id=>{if(m.getLayer(id))m.moveLayer(id);});
      m.on('click','korea-district-fills',e=>{if(m.queryRenderedFeatures(e.point,{layers:['campus-points','campus-clusters']}).length)return;const p=e.features?.[0]?.properties;if(p?.__cityKo){if(state.region!==p.__regionId)chooseRegion(p.__regionId);chooseCity(p.__cityKo);}});
      m.on('mouseenter','korea-district-fills',()=>m.getCanvas().style.cursor='pointer');
      m.on('mouseleave','korea-district-fills',()=>m.getCanvas().style.cursor='');
      renderCities(); updateBoundaryStyles();
    }catch(err){console.warn('District boundary unavailable; existing campus cities remain selectable.',err.message);}
  }
  function updateBoundaryStyles(){const m=state.map;if(!state.mapReady||!state.polygonReady||!m.getLayer('korea-province-fills'))return;
    ['korea-district-fills','korea-district-lines'].forEach(id=>{if(m.getLayer(id))m.setFilter(id,['==',['get','__regionId'],state.region||'~']);});
    m.setPaintProperty('korea-province-fills','fill-color',['case',['==',['get','__regionId'],state.region||'~'],'#2584c6','#78c4f4']);
    m.setPaintProperty('korea-province-fills','fill-opacity',['case',['==',['get','__regionId'],state.region||'~'],.28,.05]);
  }
  function initEvents(){
    $('mapSearch').addEventListener('input',e=>setSearch(e.target.value));
    $('searchSubmit').onclick=submitSearch;
    $('mapSearch').addEventListener('keydown',e=>{if(e.key==='Escape'){$('searchMatches').hidden=true;$('mapSearch').setAttribute('aria-expanded','false');}if(e.key==='Enter'){e.preventDefault();submitSearch();}});
    $('clearSearch').onclick=()=>{$('mapSearch').value='';setSearch('');fitCountry();$('mapSearch').focus();};
    document.addEventListener('click',e=>{if(!$('searchMatches').contains(e.target)&&!e.target.closest('.match')&&e.target!==$('mapSearch')){$('searchMatches').hidden=true;$('mapSearch').setAttribute('aria-expanded','false');}});
    document.querySelectorAll('[data-type]').forEach(btn=>btn.onclick=()=>{state.type=btn.dataset.type;document.querySelectorAll('[data-type]').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});render();});
    $('backBtn').onclick=()=>{if(state.city)chooseCity(null);else resetNavigation(false);};
    $('homeView').onclick=()=>resetNavigation(true);
    $('zoomIn').onclick=()=>{if(state.mapReady)state.map.zoomIn({duration:300});else zoomNotice('Bản đồ chưa tải xong, chưa thể thu phóng.');};
    $('zoomOut').onclick=()=>{if(state.mapReady)state.map.zoomOut({duration:300});else zoomNotice('Bản đồ chưa tải xong, chưa thể thu phóng.');};
    $('showAllMatches').onclick=()=>{hideGoogleMap();fitCampuses(state.selectedSchoolId?allSchoolCampuses(state.selectedSchoolId):getFilteredCampuses());};
    $('slidePrev').onclick=()=>$('campusSlides').scrollBy({left:-245,behavior:'smooth'});
    $('slideNext').onclick=()=>$('campusSlides').scrollBy({left:245,behavior:'smooth'});
  }
  async function main(){
    initEvents();
    $('toggleSchoolList')?.addEventListener('click',()=>{
      const panel=$('resultsList'),button=$('toggleSchoolList');if(!panel)return;
      const collapsed=panel.classList.toggle('collapsed');button.textContent=collapsed?'Hiện danh sách':'Thu gọn';button.setAttribute('aria-expanded',String(!collapsed));
    });
    try{const [reg,sch,details]=await Promise.all([fetch('university-map/regions.json').then(r=>{if(!r.ok)throw Error('Cannot load regions');return r.json()}),fetch('university-map/universities.json').then(r=>{if(!r.ok)throw Error('Cannot load universities');return r.json()}),fetch('university-map/campus-details.json?v=5').then(r=>r.ok?r.json():{campuses:{}}).catch(()=>({campuses:{}}))]);
      state.regions=reg.regions;state.schools=sch.schools;state.campuses=[];state.campusDetails=details.campuses||{};
      const ids=new Set();
      for(const s of state.schools){for(const c of s.campuses || []){
        if(!regionById(c.region) && c.region!=='unknown')continue;const uid=s.id+'::'+c.id;if(ids.has(uid))continue;ids.add(uid);
        const lat=c.lat===null||c.lat===undefined||c.lat===''?null:Number(c.lat);
        const lng=c.lng===null||c.lng===undefined||c.lng===''?null:Number(c.lng);
        const campus={...c,lat,lng,uid,school:s};mergeCampusDetail(campus,findVerifiedContact(s,c,uid));
        if(!hasPin(campus)){campus.lat=null;campus.lng=null;campus.accuracy='unverified';}
        state.campuses.push(campus);
      }}
      state.campusGroups=new Map();
      for(const c of state.campuses){if(!state.campusGroups.has(c.school.id))state.campusGroups.set(c.school.id,[]);state.campusGroups.get(c.school.id).push(c);}
      const total=state.campuses.length, pinCount=state.campuses.filter(c=>hasPin(c)&&c.accuracy==='verified').length;
      $('statSchools').textContent=String(uniqueSchools(state.campuses));$('statCampuses').textContent=String(total);
      if($('statPins'))$('statPins').textContent=String(pinCount);
      const imported=sch.coverage==='national-official-registry-imported-not-independently-audited';
      $('dataNotice').textContent= imported
        ? `Đã nhập ${uniqueSchools(state.campuses)} trường / ${total} địa chỉ từ nguồn công. ${pinCount} vị trí có ghim; ${total-pinCount} cơ sở cần đối chiếu tọa độ; khi chọn sẽ tìm điểm OSM tham khảo. Danh mục gốc không nhất thiết liệt kê mọi campus nhỏ.`
        : `Dữ liệu khởi tạo ${uniqueSchools(state.campuses)} trường / ${total} cơ sở mẫu, ${pinCount} ghim có trạng thái xác minh; các cơ sở còn lại có thể tra cứu nguồn mở khi chọn. CHƯA nhập danh mục trường toàn quốc. Muốn cập nhật hãy chạy công cụ nhập danh mục quốc gia (V4) trước khi kiểm tra bản đồ V5.`;
      render();initMap();
      const params=new URLSearchParams(location.search);if(params.has('q')){$('mapSearch').value=params.get('q').slice(0,100);setSearch($('mapSearch').value);}
    }catch(err){$('dataNotice').textContent='Không đọc được danh sách trường. Hãy chạy trên web server (không mở file://) và kiểm tra tệp JSON.';fallback('Không tải được dữ liệu: '+err.message);console.error(err);}
  }
  main();
})();
