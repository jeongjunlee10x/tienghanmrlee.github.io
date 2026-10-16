/* MR LEE — Clickable Korea province atlas V10. No API key, no map server, no changes to university dataset. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const normal = x => String(x ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'').trim();
 const https = x => {try{const u=new URL(String(x));return u.protocol==='https:'&&u.hostname.includes('.')?u.href:'';}catch(_){return '';}};
 const imgSrc = x => {const value=String(x??'');return https(value)||(/^(?:images|assets|university-map)\/[a-z0-9_./-]+$/i.test(value)?value:'');};
 const validCoords = c => Number.isFinite(+c.lat)&&Number.isFinite(+c.lng)&&+c.lat>=32&&+c.lat<=39&&+c.lng>=124&&+c.lng<=132;
 const area = {
  seoul:{ko:'서울',vi:'Seoul',x:260,y:250,c:'#f8d784',r:11},busan:{ko:'부산',vi:'Busan',x:489,y:603,c:'#73528e',r:12},
  daegu:{ko:'대구',vi:'Daegu',x:433,y:482,c:'#e8aa28',r:12},incheon:{ko:'인천',vi:'Incheon',x:206,y:249,c:'#449a9d',r:11},
  daejeon:{ko:'대전',vi:'Daejeon',x:310,y:399,c:'#cc7b84',r:11},ulsan:{ko:'울산',vi:'Ulsan',x:487,y:538,c:'#8067a5',r:11},
  sejong:{ko:'세종',vi:'Sejong',x:309,y:348,c:'#ad7b79',r:9},gwangju:{ko:'광주',vi:'Gwangju',x:248,y:559,c:'#4e8490',r:11},
  gyeonggi:{ko:'경기도',vi:'Gyeonggi',x:260,y:218,c:'#8dc7e6'},gangwon:{ko:'강원도',vi:'Gangwon',x:399,y:186,c:'#81ba86'},
  chungnam:{ko:'충청남도',vi:'Chungnam',x:232,y:348,c:'#edaaad'},chungbuk:{ko:'충청북도',vi:'Chungbuk',x:347,y:337,c:'#f5a751'},
  gyeongbuk:{ko:'경상북도',vi:'Gyeongbuk',x:430,y:400,c:'#f2df6d'},jeonbuk:{ko:'전북',vi:'Jeonbuk',x:265,y:466,c:'#bcb075'},
  jeonnam:{ko:'전남',vi:'Jeonnam',x:256,y:588,c:'#86b0b2'},gyeongnam:{ko:'경상남도',vi:'Gyeongnam',x:406,y:554,c:'#9c89be'},
  jeju:{ko:'제주도',vi:'Jeju',x:167,y:762,c:'#b2aba6'}
 };
 const svgNS='http://www.w3.org/2000/svg';
 const major=['gyeonggi','gangwon','chungnam','chungbuk','gyeongbuk','jeonbuk','jeonnam','gyeongnam','jeju'];
 const cityIds=['incheon','seoul','sejong','daejeon','gwangju','daegu','ulsan','busan'];
 const vm={schools:[],campuses:[],schoolByKey:new Map(),region:'all',query:'',type:'all',selectedKey:null,chosenCampus:null,loaded:0,shapes:{},regions:[],directoryExpanded:false,coverage:"",contacts:{schools:[]}};
 function remap(c,s){
  let id=String(c.region||s?.region||'').trim().toLowerCase().replace(/_/g,'-');
  if(id==='jeonnam-gwangju'||id==='jeonnamgwangju'||id==='gwangju-jeonnam'){
   const t=normal([c.city,c.cityKo,c.address,c.en,c.ko].filter(Boolean).join(' '));
   return t.includes(normal('광주'))||t.includes('gwangju')? 'gwangju':'jeonnam';
  }
  if(id==='jeonbuk-special')return 'jeonbuk';
  if(id in area)return id;
  // Generic national import: map known Korean administrative address names if region omitted.
  const t=normal([c.address,c.cityKo,c.city,s?.address,s?.cityKo,s?.city].filter(Boolean).join(' '));
  for(const [key,words] of Object.entries({seoul:['서울','seoul'],busan:['부산','busan'],daegu:['대구','daegu'],incheon:['인천','incheon'],daejeon:['대전','daejeon'],ulsan:['울산','ulsan'],sejong:['세종','sejong'],gwangju:['광주','gwangju'],gyeonggi:['경기','gyeonggi'],gangwon:['강원','gangwon'],chungnam:['충남','충청남'],chungbuk:['충북','충청북'],gyeongnam:['경남','경상남'],gyeongbuk:['경북','경상북'],jeonnam:['전남','전라남'],jeonbuk:['전북','전라북'],jeju:['제주','jeju']})){
   if(words.some(w=>t.includes(normal(w))))return key;
  }
  return '';
 }
 function schoolLabel(s){return s.vi||s.en||s.ko||'Trường chưa đặt tên';}
 function campusLabel(c){return c.vi||c.en||c.ko||'Cơ sở chính';}
 function googleMaps(c){
  const q=[c.school.ko||c.school.en||c.school.vi, c.ko||c.en, c._details?.address_ko || c.address || [c.cityKo,c.city,area[c._region]?.ko].filter(Boolean).join(' '),'대한민국'].filter(Boolean).join(' ');
  const p=String(c.google_place_id||'');
  return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q)+( /^[a-zA-Z0-9_-]{8,}$/.test(p)?'&query_place_id='+encodeURIComponent(p):'');
 }
 function googleWebsiteSearch(s){return 'https://www.google.com/search?q='+encodeURIComponent([s.ko||s.en,'대학교 공식 홈페이지'].filter(Boolean).join(' '));}
 function groupSchools(){
  const arr=vm.schools.map(s=>{
   const matching=(s._campuses||[]).filter(c=>vm.region==='all'||(vm.region==='unknown'?!c._region:c._region===vm.region));
   return {school:s,campuses:matching};
  }).filter(x=>x.campuses.length && (vm.type==='all'||x.school.type===vm.type) && (!vm.query||hits(x.school,x.campuses,vm.query)));
  arr.sort((a,b)=>schoolLabel(a.school).localeCompare(schoolLabel(b.school),'vi'));
  return arr;
 }
 function hits(s,cs,q){
  const names=[s.ko,s.en,s.vi,...(s.aliases||[])];
  const others=cs.flatMap(c=>[c.ko,c.en,c.vi,c.city,c.cityKo,c.address,...(c.aliases||[])]);
  return [...names,...others].some(x=>normal(x).includes(q));
 }
 function getRegionSchools(id){const found=new Set(vm.campuses.filter(c=>id==='all'||(id==='unknown'?!c._region:c._region===id)).map(c=>c.school._key));return [...found].map(k=>vm.schoolByKey.get(k)).filter(Boolean);}
 function elsvg(name,attrs){const el=document.createElementNS(svgNS,name);for(const [k,v] of Object.entries(attrs||{}))el.setAttribute(k,String(v));return el;}
 function updateAtlas(){
  const grp=$('regionShapes');const lab=$('regionLabels');grp.replaceChildren();lab.replaceChildren();
  // Use silhouettes traced from the user's reference as an illustration, NOT official cadastral boundaries.
  for(const k of major){
   if(!vm.shapes[k])continue;
   const p=elsvg('path',{d:vm.shapes[k],fill:area[k].c,class:'province'+(vm.region===k?' selected':vm.region!=='all'?' dimmed':''),'data-area':k,'aria-label':area[k].vi+' — '+getRegionSchools(k).length+' trường',tabindex:'0',role:'button'});
   p.addEventListener('click',()=>selectRegion(k));p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectRegion(k)}});grp.append(p);
  }
  for(const id of cityIds){
   const info=area[id];const g=elsvg('g',{class:'region-dot','data-area':id,role:'button',tabindex:'0','aria-label':info.vi+' — '+getRegionSchools(id).length+' trường'});
   const shape=elsvg('circle',{cx:info.x,cy:info.y,r:info.r,fill:info.c});
   g.append(shape);g.addEventListener('click',()=>selectRegion(id));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectRegion(id)}});
   if(vm.region!=='all'&&vm.region!==id)g.style.opacity='.42';grp.append(g);
  }
  for(const [id,info] of Object.entries(area)){
   const count=getRegionSchools(id).length;
   if(cityIds.includes(id)){
    const isLeft=id==='incheon'||id==='seoul'||id==='sejong'||id==='daejeon'||id==='gwangju';
    const shift=isLeft?-22:21,dy=id==='seoul'?-19:id==='sejong'?-16:0;
    const x=info.x+shift,y=info.y+dy;
    const text=elsvg('text',{x,y,'text-anchor':isLeft?'end':'start',class:'region-label',style:'font-size:12px'});
    text.textContent=info.ko;
    const small=elsvg('text',{x,y:y+12,'text-anchor':isLeft?'end':'start',class:'region-count'});small.textContent=count+' trường';
    lab.append(text,small);
   }else{
    const name=elsvg('text',{x:info.x,y:info.y,'text-anchor':'middle',class:'region-label'});name.textContent=info.ko;
    const sub=elsvg('text',{x:info.x,y:info.y+18,'text-anchor':'middle',class:'region-count'});sub.textContent=count+' trường';lab.append(name,sub);
   }
  }
 }
 function renderOptions(){
  const select=$('regionSelect');select.replaceChildren(new Option('Tất cả Hàn Quốc','all'));
  const byName=Object.entries(area).sort((a,b)=>a[1].vi.localeCompare(b[1].vi,'vi'));
  byName.forEach(([id,r])=>select.append(new Option(r.ko+' · '+r.vi,id)));select.append(new Option('Chưa xác định tỉnh','unknown'));
  select.value=vm.region;
 }
 function selectRegion(id){
  vm.region=(id in area||id==='unknown')?id:'all';vm.loaded=0;vm.selectedKey=null;$('detail').hidden=true;$('regionSelect').value=vm.region;
  render();
 }
 function renderQuick(groups){
  const quick=$('schoolQuickLinks');quick.replaceChildren();
  const show=groups;
  $('mapSelectionTitle').textContent=vm.region==='all'?'Trường trên bản đồ Hàn Quốc':vm.region==='unknown'?'Trường chưa xác định tỉnh':`Các trường tại ${area[vm.region]?.ko||vm.region}`;
  $('mapSelectionCount').textContent=show.length+' trường — không ẩn tên';
  show.forEach(item=>{
   const b=document.createElement('button');b.type='button';b.textContent=schoolLabel(item.school);
   b.onclick=()=>selectSchool(item.school._key,item.campuses[0]?._id);quick.append(b);
  });
  if(!show.length)quick.innerHTML='<small style="color:#8598aa">Không có trường phù hợp với bộ lọc hiện tại.</small>';
 }
 function renderList(groups){
  const list=$('schoolResults');list.replaceChildren();
  $('resultCount').textContent=groups.length+' / '+vm.schools.length+' trường';
  $('resultTitle').textContent=vm.query?'Kết quả tìm kiếm':(vm.region==='all'?'Tất cả trường hiện có':'Trường tại '+(area[vm.region]?.vi||(vm.region==='unknown'?'chưa xác định tỉnh':vm.region)));
  if(!groups.length){list.innerHTML='<p class="empty-state">Không tìm thấy trong danh mục hiện có. Hãy thử tên tiếng Hàn, tiếng Anh hoặc chọn Tất cả Hàn Quốc.</p>';return;}
  // No 50-item pagination: every matching school must have a visible, clickable row.
  const fragment=document.createDocumentFragment();
  groups.forEach((entry,i)=>{
   const s=entry.school;
   const row=document.createElement('button');row.className='school-row'+(vm.selectedKey===s._key?' active':'');row.type='button';row.setAttribute('aria-label',schoolLabel(s)+' — mở thông tin Google Maps và website');
   row.innerHTML=`<span class="school-index">${String(i+1).padStart(2,'0')}</span><span class="school-text"><strong>${esc(schoolLabel(s))}</strong><small>${esc(s.ko||s.en||'')} · ${s._campuses.length} campus / cơ sở</small></span><span class="row-chevron">›</span>`;
   row.onclick=()=>selectSchool(s._key,entry.campuses[0]?._id);fragment.append(row);
  });list.append(fragment);
 }
 // All university names, by province, including campuses not yet matched to a province.
 function renderDirectory(groups){
  const dir=$('atlasSchoolDirectory');dir.replaceChildren();
  const byRegion=new Map();
  groups.forEach(({school,campuses})=>{
   const unique=new Set();
   campuses.forEach(c=>{
    const region=c._region||'unknown';if(unique.has(region))return;unique.add(region);
    if(!byRegion.has(region))byRegion.set(region,[]);
    byRegion.get(region).push({school,campus:c});
   });
  });
  $('directoryTotal').textContent=`(${groups.length} trường / ${[...byRegion.values()].reduce((a,x)=>a+x.length,0)} lượt theo khu vực)`;
  const keys=Object.keys(area).filter(k=>byRegion.has(k));
  if(byRegion.has('unknown'))keys.push('unknown');
  const fragment=document.createDocumentFragment();
  for(const key of keys){
   const entries=byRegion.get(key);const section=document.createElement('section');section.className='directory-group';
   const h=document.createElement('h3');h.textContent=(area[key]?.ko||'CHƯA XÁC ĐỊNH TỈNH')+' · '+entries.length+' trường';section.append(h);
   const items=document.createElement('div');items.className='directory-school-grid';
   entries.sort((a,b)=>schoolLabel(a.school).localeCompare(schoolLabel(b.school),'vi'));
   entries.forEach(({school,campus})=>{
    const button=document.createElement('button');button.type='button';button.className='directory-school';
    button.textContent=schoolLabel(school);button.title=(school.ko||school.en||'')+' — chọn trường';
    button.onclick=()=>selectSchool(school._key,campus._id);items.append(button);
   });section.append(items);fragment.append(section);
  }
  if(!keys.length){const p=document.createElement('p');p.className='empty-state';p.textContent='Không có trường phù hợp';fragment.append(p);}
  dir.append(fragment);
 }
 function render(){
  const groups=groupSchools();renderList(groups);renderQuick(groups);renderDirectory(groups);updateAtlas();
  $('countSchools').textContent=vm.schools.length.toLocaleString('vi-VN');
  $('countCampuses').textContent=vm.campuses.length.toLocaleString('vi-VN');
  $('countRegions').textContent=Object.keys(area).length;
 }
 function selectSchool(key,campusId){
  const school=vm.schoolByKey.get(key);if(!school)return;
  vm.selectedKey=key;
  const branches=school._campuses; // Always show every campus, even those in other provinces.
  const campus=branches.find(c=>c._id===campusId)||(vm.region!=='all'?branches.find(c=>c._region===vm.region):null)||branches[0];if(!campus)return;
  vm.chosenCampus=campus._id;
  const d=$('detail');d.hidden=false;
  const tags=branches.map(c=>`<button type="button" class="campus-tab${c._id===campus._id?' active':''}" data-campus="${esc(c._id)}">${esc(campusLabel(c))} · ${esc(area[c._region]?.vi||c.city||'')}</button>`).join('');
  const image=imgSrc(campus.photo_url||campus.image_url||campus.photo);
  const cd=campus._details||{}, sd=school._details||{};
  const nameKo=school.ko||sd.name_ko||'';
  const nameEn=school.en||sd.name_en||'';
  const addressKo=cd.address_ko||campus.address_ko||campus.address||(branches.length===1?sd.address_ko:'')||'';
  const addressEn=cd.address_en||campus.address_en||(branches.length===1?sd.address_en:'')||'';
  const phoneCampus=cd.phone||campus.phone||campus.phone_label||'';
  const faxCampus=cd.fax||campus.fax||'';
  const phoneSchool=sd.phone||school.phone||'';
  const faxSchool=sd.fax||school.fax||'';
  const phone=phoneCampus||phoneSchool;
  const fax=faxCampus||faxSchool;
  const status=validCoords(campus)&&campus.accuracy==='verified'?'Tọa độ đã xác minh trong danh mục':validCoords(campus)?'Tọa độ tham khảo':'Google Maps tìm theo tên trường và địa chỉ';
  const site=https(cd.website||campus.website||sd.website||school.website||school.official_website||'');
  const websiteLink=site?`<a href="${esc(site)}" target="_blank" rel="noopener noreferrer">🌐 Website chính thức ↗</a>`:`<a href="${esc(googleWebsiteSearch(school))}" target="_blank" rel="noopener noreferrer">🔎 Tìm website trường ↗</a>`;
  const value=x=>x?esc(x):'<span class="detail-missing">Chưa có dữ liệu xác minh</span>';
  const tax=cd.tax_id||sd.tax_id||'';
  const taxSource=https(cd.tax_source_url||sd.tax_source_url||'');
  const taxEntity=cd.tax_entity||sd.tax_entity||'';
  const addressSource=https(cd.source_url||sd.source_url||'');
  const labelSchoolContact=(!phoneCampus&&phoneSchool)?' (tổng đài trường)':'';
  const labelSchoolFax=(!faxCampus&&faxSchool)?' (fax trường)':'';
  $('detailBody').innerHTML=`<h3>${esc(schoolLabel(school))}</h3>
  <div class="campus-tab-list" role="group" aria-label="Chọn campus">${tags}</div>
  <div class="campus-card">
  <div class="campus-type">📍 ${esc(campusLabel(campus))} · ${esc(area[campus._region]?.vi||'')}</div>
  <div class="profile-grid">
    <div class="profile-field"><span class="profile-label">TÊN TRƯỜNG · 한국어</span><strong lang="ko">${value(nameKo)}</strong></div>
    <div class="profile-field"><span class="profile-label">TÊN TRƯỜNG · ENGLISH</span><strong lang="en">${value(nameEn)}</strong></div>
    <div class="profile-field"><span class="profile-label">ĐỊA CHỈ · 한국어</span><span lang="ko">${value(addressKo)}</span></div>
    <div class="profile-field"><span class="profile-label">ADDRESS · ENGLISH</span><span lang="en">${value(addressEn)}</span></div>
    <div class="profile-field"><span class="profile-label">ĐIỆN THOẠI${labelSchoolContact}</span>${phone?`<a href="tel:${esc(String(phone).replace(/[^0-9+]/g,''))}">${esc(phone)}</a>`:value('')}</div>
    <div class="profile-field"><span class="profile-label">FAX${labelSchoolFax}</span>${value(fax)}</div>
    <div class="profile-field profile-wide"><span class="profile-label">MÃ SỐ ĐĂNG KÝ KINH DOANH HÀN QUỐC · 사업자등록번호</span><strong>${value(tax)}</strong>${taxEntity?`<small>Pháp nhân đăng ký: ${esc(taxEntity)}</small>`:''}${taxSource?`<a class="evidence-link" target="_blank" rel="noopener noreferrer" href="${esc(taxSource)}">Nguồn kiểm chứng MST ↗</a>`:''}</div>
  </div>
  <p class="profile-footnote">${tax?'Mã số thuế có nguồn đối chiếu; cần kiểm tra pháp nhân ghi trên nguồn.':'Chưa công bố mã số thuế trong nguồn đã đối chiếu. Không dùng mã doanh nghiệp khác để thay thế.'}</p>
  <p class="status">${esc(status)}${addressSource?` · <a href="${esc(addressSource)}" target="_blank" rel="noopener noreferrer">Nguồn địa chỉ/liên hệ ↗</a>`:''}</p>
  ${image?`<img class="campus-photo" alt="Hình campus" loading="lazy" src="${esc(image)}">`:''}
  <div class="detail-actions"><a href="${esc(googleMaps(campus))}" target="_blank" rel="noopener noreferrer">📍 Google Maps ↗</a>${websiteLink}</div>
  ${!site?'<small class="secondary-link">Chưa có URL website trường được đối chiếu; liên kết trên mở tìm kiếm.</small>':''}
  </div>`;
  $('detailBody').querySelectorAll('[data-campus]').forEach(b=>b.onclick=()=>selectSchool(key,b.dataset.campus));
  if(vm.region==='all'&&campus._region&&campus._region in area){
   // Highlight the right province without hiding all other schools.
   document.querySelectorAll('.province,.region-dot').forEach(p=>{if(p.dataset.area===campus._region)p.classList.add('selected');else p.classList.remove('selected')});
  }
  // Preserve shareable selection without forcing a page reload.
  try{history.replaceState(null,'','#'+encodeURIComponent(key)+'/'+encodeURIComponent(campus._id));}catch(_){/* ignore */}
  const row=[...document.querySelectorAll('.school-row')].find(r=>r.textContent.includes(title));if(row){document.querySelectorAll('.school-row').forEach(x=>x.classList.remove('active'));row.classList.add('active')}
  if(window.innerWidth<1100)d.scrollIntoView({behavior:'smooth',block:'nearest'});
 }
 async function loadData(){
  try{
   const [shapes,res,regions,contacts]=await Promise.all([
    fetch('university-map/province-shapes.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Thiếu dữ liệu hình tỉnh');return r.json()}),
    fetch('university-map/universities.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Thiếu university-map/universities.json');return r.json()}),
    fetch('university-map/regions.json',{cache:'no-store'}).then(r=>r.ok?r.json():{regions:[]}).catch(()=>({regions:[]})),
    fetch('university-map/contact-details.json',{cache:'no-store'}).then(r=>r.ok?r.json():{schools:[]}).catch(()=>({schools:[]}))
   ]);
   vm.shapes=shapes;vm.regions=regions.regions||[];vm.contacts=contacts||{schools:[]};
   const schools=Array.isArray(res.schools)?res.schools:[];vm.coverage=String(res.coverage||'không rõ');
   schools.forEach((s,idx)=>{
    if(!s||typeof s!=='object')return;
    const key=String(s.id||'school-'+idx);s._key=key+'::'+idx;
    // Overlay records are bound to the current school identity, not just an array index.
    const sr=(vm.contacts.schools||[]).find(e=>String(e.school_id)===String(s.id)&&
      ((s.ko&&e.school_ko&&normal(s.ko)===normal(e.school_ko))||
       (s.en&&e.school_en&&normal(s.en)===normal(e.school_en))));
    s._details=sr?.details||{};
    s._campuses=[];
    (Array.isArray(s.campuses)?s.campuses:[]).forEach((c,i)=>{
     if(!c||typeof c!=='object')return;
     const record=sr?.campuses?.find(e=>String(e.campus_id)===String(c.id??i)&&
       ((!c.ko&&!c.en)|| (c.ko&&e.campus_ko&&normal(c.ko)===normal(e.campus_ko)) ||
       (c.en&&e.campus_en&&normal(c.en)===normal(e.campus_en))));
     const item={...c,school:s,_details:record?.details||{},_id:String(c.id??i)+'::'+i,_region:remap(c,s)};
     s._campuses.push(item);vm.campuses.push(item);
    });
    if(!s._campuses.length){ // a school without campus must still be searchable
     const item={school:s,_id:'main::0',_details:sr?.campuses?.[0]?.details||{},en:'Main Campus',_region:remap({},s),address:String(s.address||''),lat:null,lng:null};s._campuses.push(item);vm.campuses.push(item);
    }
    vm.schools.push(s);vm.schoolByKey.set(s._key,s);
   });
   if(!vm.schools.length)throw Error('Dữ liệu trường trống. Hãy kiểm tra bộ nhập danh mục V4/V7/V9.');
   $('notice').textContent=`Đang hiển thị ĐẦY ĐỦ ${vm.schools.length} trường / ${vm.campuses.length} campus trong universities.json (nguồn: ${vm.coverage}). Trường chưa có trong tệp gốc không thể tự xuất hiện: cần nhập thêm dữ liệu chính thức. Thông tin liên hệ được ghép từ CSV chính thức nếu đã nhập. Mã số thuế chỉ hiển thị khi có nguồn xác minh.`;
   renderOptions();render();
   const hash=decodeURIComponent(location.hash.slice(1)).split('/');if(hash[0]&&vm.schoolByKey.has(hash[0]))selectSchool(hash[0],hash[1]);
  }catch(e){
   $('notice').textContent='Không tải được danh mục: '+e.message+'. Cần chạy trang bằng http://localhost:8000 hoặc GitHub Pages, không mở HTML bằng file://.';
   $('schoolResults').innerHTML='<p class="empty-state">Không thể nạp dữ liệu. Vui lòng kiểm tra universities.json có tồn tại trong thư mục university-map.</p>';
   $('resultCount').textContent='Lỗi nạp';
   if(vm.shapes&&Object.keys(vm.shapes).length)updateAtlas();
  }
 }
 $('searchInput').addEventListener('input',e=>{vm.query=normal(e.target.value);vm.loaded=0;if(vm.query){vm.region='all';$('regionSelect').value='all';}render();});
 $('clearSearch').onclick=()=>{vm.query='';vm.loaded=0;$('searchInput').value='';render()};
 $('regionSelect').onchange=e=>selectRegion(e.target.value);
 $('resetRegion').onclick=()=>{vm.region='all';vm.type='all';vm.query='';vm.loaded=0;$('searchInput').value='';$('detail').hidden=true;document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));renderOptions();render();};
 $('closeDetail').onclick=()=>{$('detail').hidden=true;vm.selectedKey=null;try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}};
 $('expandDirectory').onclick=()=>{vm.directoryExpanded=!vm.directoryExpanded;const el=$('atlasSchoolDirectory');el.classList.toggle('expanded',vm.directoryExpanded);$('expandDirectory').setAttribute('aria-expanded',String(vm.directoryExpanded));$('expandDirectory').textContent=vm.directoryExpanded?'↕ Thu gọn (vẫn cuộn xem đủ)':'↕ Mở rộng toàn bộ';};
 $('showAllSchools').onclick=()=>{vm.region='all';vm.query='';vm.type='all';vm.loaded=0;$('searchInput').value='';document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));$('detail').hidden=true;renderOptions();render();$('atlasSchoolDirectory').scrollTop=0;};
 document.querySelectorAll('.filter-btn').forEach(b=>b.onclick=()=>{vm.type=b.dataset.filter;vm.loaded=0;document.querySelectorAll('.filter-btn').forEach(x=>x.classList.toggle('active',x===b));render()});
 loadData();
})();
