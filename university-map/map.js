/* MR LEE Korea University Explorer V4 — verified official registry + campus review. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escapeHtml = text => String(text ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const norm = text => String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'').trim();
  const validUrl = url => /^https:\/\//i.test(String(url ?? '')) ? url : '#';
  const safeText = text => escapeHtml(text || '—');
  const hasPin = c => Number.isFinite(c.lat) && Number.isFinite(c.lng) && c.lat>=32 && c.lat<=39 && c.lng>=124 && c.lng<=132;
  const pinStatus = c => hasPin(c) ? (c.accuracy==='verified' ? 'Đã xác minh tọa độ' : 'Ghim tham khảo — chưa xác minh') : 'Chưa xác minh tọa độ — có địa chỉ';
  const mapsQuery = c => 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(c.address || [c.school.ko,c.cityKo,regionName(c.region)].filter(Boolean).join(' '));
  const state = {regions:[], schools:[], campuses:[], region:null, city:null, query:'', type:'all', selected:null, map:null, mapReady:false, polygonReady:false, campusSourceReady:false, cityFeatures:[], selectedSchoolId:null};
  const regionById = id => state.regions.find(r => r.id === id);
  const regionName = id => regionById(id)?.vi || (id==='unknown'?'Chưa rõ khu vực':id);
  const campusName = c => c.ko ? `${c.ko} · ${c.en}` : c.en;
  const allSchoolCampuses = id => state.campuses.filter(c=>c.school.id === id);
  const schoolQueryText = s => norm([s.ko,s.vi,s.en,...(s.aliases||[])].join(' '));
  function campQueryText(c) {return norm([c.ko,c.en,c.vi,c.city,c.cityKo,c.address,c.officialBranch,regionName(c.region),regionById(c.region)?.ko,...(regionById(c.region)?.aliases||[])].join(' '));}
  function matchesSchool(s,q) {return schoolQueryText(s).includes(q) || [s.ko,s.vi,s.en,...(s.aliases||[])].some(n=>norm(n).includes(q));}
  function matchesCampus(c,q) {return campQueryText(c).includes(q) || [c.ko,c.en,c.vi,c.city,c.cityKo].some(n=>norm(n).includes(q));}
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
  const schoolCampuses = school => state.campuses.filter(c=>c.school.id===school.id);
  const byName = (a,b) => a.localeCompare(b, 'vi');
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
    if(!campuses.length){results.innerHTML='<div class="empty">Không có cơ sở phù hợp trong dữ liệu đã nhập. Điều này không có nghĩa khu vực không có trường.</div>';slides.innerHTML='<div class="empty">Hãy đổi khu vực hoặc tên tìm kiếm.</div>';return;}
    for(const c of campuses){
      const nSchool=schoolCampuses(c.school).length;
      const res=document.createElement('button');res.type='button';res.className='result'+(state.selected===c.uid?' selected':'');res.setAttribute('data-campus',c.uid);
      res.innerHTML=`<div><strong>${safeText(c.school.vi||c.school.en)}</strong><small>${safeText(c.school.ko)} · ${safeText(c.ko||c.en)}</small><small>${safeText(c.city)} · ${safeText(regionName(c.region))}</small><small>${safeText(pinStatus(c))}</small></div><b>${nSchool>1?nSchool+' CS':hasPin(c)?'📍':'⌕'}</b>`;
      res.onclick=()=>chooseCampus(c.uid);results.append(res);
      const slide=document.createElement('article');slide.className='slide'+(state.selected===c.uid?' selected':'');slide.setAttribute('data-campus',c.uid);slide.tabIndex=0;slide.role='button';
      slide.innerHTML=`<span class="small-tag">${nSchool>1?nSchool+' cơ sở thuộc trường':'Cơ sở'} · ${safeText(regionName(c.region))}</span><h3>${safeText(c.school.vi||c.school.en)}</h3><p>${safeText(c.school.ko)}<br>${safeText(c.ko||c.en)} · ${safeText(c.city)}<br>${safeText(c.address || '')}</p><small class="pin-status">${safeText(pinStatus(c))}</small><a href="${escapeHtml(mapsQuery(c))}" target="_blank" rel="noopener noreferrer">Tìm địa chỉ trên Google Maps ↗</a>${c.school.website?`<a href="${escapeHtml(validUrl(c.school.website))}" target="_blank" rel="noopener noreferrer">Website trường ↗</a>`:''}`;
      slide.onclick=(e)=>{if(e.target.closest('a'))return;chooseCampus(c.uid)};slide.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseCampus(c.uid);}};
      slides.append(slide);
    }
  }
  function render(){renderCrumb();renderRegions();renderCities();renderCards();updateMapMarkers();updateBoundaryStyles();}
  function setSearch(s){if(s.trim()){state.region=null;state.city=null;}state.query=s;state.selected=null;state.selectedSchoolId=null;render();showSuggestions();}
  function resetNavigation(clearSearch=true){state.region=null;state.city=null;state.selected=null;state.selectedSchoolId=null;if(clearSearch){state.query='';$('mapSearch').value='';}render();fitCountry();}
  function chooseRegion(id){state.region=id;state.city=null;state.selected=null;state.selectedSchoolId=null;state.query='';$('mapSearch').value='';render();$('searchMatches').hidden=true;const r=regionById(id);if(r && state.mapReady)state.map.flyTo({center:r.center,zoom:r.zoom,duration:900});}
  function chooseCity(city){state.city=city;state.selected=null;state.query='';state.selectedSchoolId=null;$('mapSearch').value='';render();if(city)fitCampuses(getFilteredCampuses());}
  function chooseSchool(id){const school=state.schools.find(s=>s.id===id);if(!school)return;state.region=null;state.city=null;state.query='';$('mapSearch').value='';state.selectedSchoolId=id;state.selected=null;render();const campuses=allSchoolCampuses(id);fitCampuses(campuses);showSchoolPanel(school,campuses);$('searchMatches').hidden=true;}
  function showSchoolPanel(school,campuses){
    // Show all campuses for a school as suggestions without discarding global search/filter state.
    const ul=$('searchMatches');ul.innerHTML='';
    const head=document.createElement('div');head.className='match';head.innerHTML=`<strong>${safeText(school.vi||school.en)} · ${campuses.length} cơ sở</strong>`;ul.append(head);
    const all=document.createElement('button');all.type='button';all.className='match';all.innerHTML='<span><strong>⌗ Xem tất cả cơ sở trên bản đồ</strong></span>';all.onclick=()=>fitCampuses(campuses);ul.append(all);
    campuses.forEach(c=>{const b=document.createElement('button');b.className='match';b.type='button';b.innerHTML=`<span><strong>${safeText(c.ko||c.en)}</strong><small>${safeText(c.city)} · ${safeText(regionName(c.region))} · ${safeText(pinStatus(c))}</small></span><em>Xem cơ sở ↗</em>`;b.onclick=()=>chooseCampus(c.uid);ul.append(b);});ul.hidden=false;
    $('mapSearch').setAttribute('aria-expanded','true');
  }
  function chooseCampus(uid){
    const c=state.campuses.find(c=>c.uid===uid);if(!c)return;
    if(!getFilteredCampuses().some(x=>x.uid===uid)){state.region=null;state.city=null;state.query='';$('mapSearch').value='';}
    state.selected=uid;state.selectedSchoolId=c.school.id;render();
    const res=$('resultsList').querySelector(`[data-campus="${CSS.escape(uid)}"]`);res?.scrollIntoView({block:'nearest'});
    $('campusSlides').querySelector(`[data-campus="${CSS.escape(uid)}"]`)?.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
    if(state.mapReady && hasPin(c)){state.map.flyTo({center:[c.lng,c.lat],zoom:13.5,duration:900});openPopup(c);}
    $('searchMatches').hidden=true;$('mapSearch').setAttribute('aria-expanded','false');
  }
  function suggestionItems(q){
    if(!q)return[];
    const region=regionSearch(q);const items=[];
    if(region)items.push({kind:'region',id:region.id,title:`${region.vi} · ${region.ko}`,description:'Lọc trường theo khu vực',rank:100});
    for(const s of state.schools){if(matchesSchool(s,q))items.push({kind:'school',id:s.id,title:s.vi||s.en,description:`${s.ko} · ${schoolCampuses(s).length} cơ sở`,rank:norm(s.ko)===q||norm(s.en)===q?90:70});}
    for(const c of state.campuses){if(matchesCampus(c,q))items.push({kind:'campus',id:c.uid,title:`${c.school.vi||c.school.en} — ${c.vi||c.en}`,description:`${c.city}, ${regionName(c.region)}`,rank:norm(c.ko)===q||norm(c.city)===q?65:40});}
    return items.sort((a,b)=>b.rank-a.rank).slice(0,14);
  }
  function showSuggestions(){
    const q=norm(state.query),items=suggestionItems(q),el=$('searchMatches');el.innerHTML='';
    if(!q||!items.length){el.hidden=true;$('mapSearch').setAttribute('aria-expanded','false');return;}
    for(const item of items){const b=document.createElement('button');b.type='button';b.className='match';b.setAttribute('role','option');b.innerHTML=`<span><strong>${safeText(item.title)}</strong><small>${safeText(item.description)}</small></span><em>${item.kind==='school'?'Trường':item.kind==='campus'?'Cơ sở':'Khu vực'}</em>`;b.onclick=()=>{if(item.kind==='school')chooseSchool(item.id);else if(item.kind==='region')chooseRegion(item.id);else chooseCampus(item.id);};el.append(b);}
    el.hidden=false;$('mapSearch').setAttribute('aria-expanded','true');
  }
  function flyToCampuses(campuses){const m=state.map;if(!state.mapReady||!campuses.length)return;const pts=campuses.filter(hasPin);if(!pts.length)return;const lons=pts.map(c=>c.lng),lats=pts.map(c=>c.lat);if(pts.length===1||Math.abs(Math.max(...lons)-Math.min(...lons))<0.0005&&Math.abs(Math.max(...lats)-Math.min(...lats))<0.0005){m.flyTo({center:[pts[0].lng,pts[0].lat],zoom:12,duration:850});return;}m.fitBounds([[Math.min(...lons),Math.min(...lats)],[Math.max(...lons),Math.max(...lats)]],{padding:85,maxZoom:12,duration:900});}
  function fitCampuses(campuses){flyToCampuses(campuses);}
  function fitCountry(){if(state.mapReady)state.map.fitBounds([[124.5,32.8],[131.2,38.9]],{padding:33,duration:800});}
  function mapFeatures(){return {type:'FeatureCollection',features:getFilteredCampuses().filter(hasPin).map(c=>({type:'Feature',geometry:{type:'Point',coordinates:[c.lng,c.lat]},properties:{uid:c.uid,title:c.school.en,city:c.city}}))};}
  function updateMapMarkers(){if(!state.mapReady||!state.campusSourceReady)return;state.map.getSource('university-campus-points')?.setData(mapFeatures());}
  function openPopup(c){if(!state.mapReady)return;
    const html=`<div class="pin-popup"><strong>${safeText(c.school.vi||c.school.en)}</strong><small>${safeText(c.school.ko)} · ${safeText(c.ko||c.en)}</small><small>${safeText(c.city)}, ${safeText(regionName(c.region))}</small><small>${safeText(c.address)}</small><small>${safeText(pinStatus(c))}</small><a href="${escapeHtml(validUrl(c.school.website))}" target="_blank" rel="noopener noreferrer">Website chính thức ↗</a></div>`;
    new maplibregl.Popup({offset:16,maxWidth:'280px'}).setLngLat([c.lng,c.lat]).setHTML(html).addTo(state.map);
  }
  function initMap(){
    if(typeof maplibregl==='undefined'){fallback('Không tải được thư viện bản đồ. Tìm kiếm và danh sách trường vẫn sử dụng được.');return;}
    try{
      const m=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:[127.8,36.3],zoom:6.25,minZoom:5,maxZoom:18,attributionControl:true});
      state.map=m;m.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'bottom-right');
      m.on('load',()=>{state.mapReady=true;const fallbackEl=$('mapFallback');if(fallbackEl)fallbackEl.remove();
        m.addSource('university-campus-points',{type:'geojson',data:mapFeatures(),cluster:true,clusterRadius:48,clusterMaxZoom:12});
        m.addLayer({id:'campus-clusters',type:'circle',source:'university-campus-points',filter:['has','point_count'],paint:{'circle-color':'#165482','circle-radius':['step',['get','point_count'],18,10,23,50,28],'circle-stroke-width':3,'circle-stroke-color':'#fff'}});
        m.addLayer({id:'campus-cluster-count',type:'symbol',source:'university-campus-points',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':12},paint:{'text-color':'#ffffff'}});
        m.addLayer({id:'campus-points',type:'circle',source:'university-campus-points',filter:['!', ['has','point_count']],paint:{'circle-color':'#e46d40','circle-radius':8,'circle-stroke-width':2,'circle-stroke-color':'#fff'}});
        state.campusSourceReady=true;
        m.on('click','campus-clusters',e=>{const features=m.queryRenderedFeatures(e.point,{layers:['campus-clusters']});const f=features[0];if(!f)return;m.getSource('university-campus-points').getClusterExpansionZoom(f.properties.cluster_id).then(z=>m.easeTo({center:f.geometry.coordinates,zoom:z,duration:700})).catch(()=>{});});
        m.on('click','campus-points',e=>{const f=e.features?.[0];if(f)chooseCampus(f.properties.uid);});
        ['campus-clusters','campus-points'].forEach(id=>{m.on('mouseenter',id,()=>m.getCanvas().style.cursor='pointer');m.on('mouseleave',id,()=>m.getCanvas().style.cursor='');});
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
      ['campus-clusters','campus-cluster-count','campus-points'].forEach(id=>{if(m.getLayer(id))m.moveLayer(id);});
      m.on('click','korea-province-fills',e=>{const regionId=e.features?.[0]?.properties?.__regionId;if(regionId)chooseRegion(regionId);});
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
      ['campus-clusters','campus-cluster-count','campus-points'].forEach(id=>{if(m.getLayer(id))m.moveLayer(id);});
      m.on('click','korea-district-fills',e=>{const p=e.features?.[0]?.properties;if(p?.__cityKo){if(state.region!==p.__regionId)chooseRegion(p.__regionId);chooseCity(p.__cityKo);}});
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
    $('mapSearch').addEventListener('keydown',e=>{if(e.key==='Escape'){$('searchMatches').hidden=true;$('mapSearch').setAttribute('aria-expanded','false');}if(e.key==='Enter'){const q=norm(state.query);const suggestions=suggestionItems(q);if(suggestions.length){e.preventDefault();if(suggestions[0].kind==='school')chooseSchool(suggestions[0].id);else if(suggestions[0].kind==='region')chooseRegion(suggestions[0].id);else chooseCampus(suggestions[0].id);}}});
    $('clearSearch').onclick=()=>{setSearch('');$('mapSearch').value='';$('mapSearch').focus();};
    document.addEventListener('click',e=>{if(!$('searchMatches').contains(e.target)&&!e.target.closest('.match')&&e.target!==$('mapSearch')){$('searchMatches').hidden=true;$('mapSearch').setAttribute('aria-expanded','false');}});
    document.querySelectorAll('[data-type]').forEach(btn=>btn.onclick=()=>{state.type=btn.dataset.type;document.querySelectorAll('[data-type]').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});render();});
    $('backBtn').onclick=()=>{if(state.city)chooseCity(null);else resetNavigation(false);};
    $('homeView').onclick=()=>resetNavigation(true);
    $('showAllMatches').onclick=()=>fitCampuses(state.selectedSchoolId?allSchoolCampuses(state.selectedSchoolId):getFilteredCampuses());
    $('slidePrev').onclick=()=>$('campusSlides').scrollBy({left:-245,behavior:'smooth'});
    $('slideNext').onclick=()=>$('campusSlides').scrollBy({left:245,behavior:'smooth'});
  }
  async function main(){
    initEvents();
    try{const [reg,sch]=await Promise.all([fetch('university-map/regions.json').then(r=>{if(!r.ok)throw Error('Cannot load regions');return r.json()}),fetch('university-map/universities.json').then(r=>{if(!r.ok)throw Error('Cannot load universities');return r.json()})]);
      state.regions=reg.regions;state.schools=sch.schools;state.campuses=[];
      const ids=new Set();
      for(const s of state.schools){for(const c of s.campuses || []){
        if(!regionById(c.region) && c.region!=='unknown')continue;const uid=s.id+'::'+c.id;if(ids.has(uid))continue;ids.add(uid);
        const lat=c.lat===null||c.lat===undefined||c.lat===''?null:Number(c.lat);
        const lng=c.lng===null||c.lng===undefined||c.lng===''?null:Number(c.lng);
        const campus={...c,lat,lng,uid,school:s};
        if(!hasPin(campus)){campus.lat=null;campus.lng=null;campus.accuracy='unverified';}
        state.campuses.push(campus);
      }}
      const total=state.campuses.length, pinCount=state.campuses.filter(hasPin).length;
      $('statSchools').textContent=String(uniqueSchools(state.campuses));$('statCampuses').textContent=String(total);
      if($('statPins'))$('statPins').textContent=String(pinCount);
      const imported=sch.coverage==='national-official-registry-imported-not-independently-audited';
      $('dataNotice').textContent= imported
        ? `Đã nhập ${uniqueSchools(state.campuses)} trường / ${total} địa chỉ từ nguồn công. ${pinCount} vị trí có ghim; ${total-pinCount} cơ sở chỉ hiển thị trong danh sách chờ xác minh tọa độ. Danh mục gốc không nhất thiết liệt kê mọi campus nhỏ.`
        : `Dữ liệu khởi tạo ${uniqueSchools(state.campuses)} trường / ${total} cơ sở mẫu, ${pinCount} ghim tham khảo. CHƯA nhập danh mục trường toàn quốc. Muốn cập nhật hãy chạy công cụ nhập nguồn chính thức trong gói V2.`;
      render();initMap();
      const params=new URLSearchParams(location.search);if(params.has('q')){$('mapSearch').value=params.get('q').slice(0,100);setSearch($('mapSearch').value);}
    }catch(err){$('dataNotice').textContent='Không đọc được danh sách trường. Hãy chạy trên web server (không mở file://) và kiểm tra tệp JSON.';fallback('Không tải được dữ liệu: '+err.message);console.error(err);}
  }
  main();
})();
