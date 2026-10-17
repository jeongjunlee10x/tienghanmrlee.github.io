(()=>{
  const $ = (s,p=document)=>p.querySelector(s);
  const $$ = (s,p=document)=>Array.from(p.querySelectorAll(s));
  const toast = $('#toast');
  const showToast = (msg)=>{ if(!toast) return; toast.textContent=msg; toast.hidden=false; clearTimeout(showToast._t); showToast._t=setTimeout(()=>toast.hidden=true,2200); };

  const dialog = $('#contactDialog');
  ['#openContactTop','#openContactHero'].forEach(sel=>$(sel)?.addEventListener('click',()=>dialog?.showModal()));
  $('#copyKakao')?.addEventListener('click', async()=>{
    try{ await navigator.clipboard.writeText('ycleeee'); showToast('Đã sao chép KakaoTalk: ycleeee'); }
    catch{ showToast('KakaoTalk: ycleeee'); }
  });
  $('#copyConsult')?.addEventListener('click', async()=>{
    try{ await navigator.clipboard.writeText($('#consultCopyText').value); showToast('Đã sao chép phiếu tư vấn'); }
    catch{ showToast('Không sao chép được'); }
  });
  $('#consultForm')?.addEventListener('submit', e=>{
    e.preventDefault();
    const text = [
      'MR LEE - ĐĂNG KÝ TƯ VẤN',
      `Họ tên: ${$('#consultName').value.trim()}`,
      `Số điện thoại: ${$('#consultPhone').value.trim()}`,
      `Chương trình: ${$('#consultProgram').value}`,
      'Nguồn: Trang chủ MR LEE'
    ].join('\n');
    $('#consultCopyText').value = text;
    $('#consultResult').hidden = false;
    showToast('Phiếu tư vấn đã tạo');
  });

  $('#menuToggle')?.addEventListener('click', ()=>{
    const nav = $('#mobileNav');
    const btn = $('#menuToggle');
    const open = !nav.classList.contains('show');
    nav.classList.toggle('show', open);
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });

  $('#rankPrev')?.addEventListener('click',()=> $('#rankSlider')?.scrollBy({left:-260,behavior:'smooth'}));
  $('#rankNext')?.addEventListener('click',()=> $('#rankSlider')?.scrollBy({left:260,behavior:'smooth'}));

  let schools = [];
  const normalizeText = (v='') => String(v).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const pick = (obj, keys) => {
    for(const k of keys){ if(obj && obj[k] != null && String(obj[k]).trim()) return obj[k]; }
    return '';
  };
  const inferType = (obj) => normalizeText(pick(obj,['type','schoolType','category'])).includes('college') ? 'college' : 'university';
  const inferRegion = (obj) => pick(obj,['region','province','sido','area','localRegion']);
  const inferCity = (obj) => pick(obj,['city','sigungu','campusCity','localCity']);
  const inferName = (obj) => pick(obj,['vi','en','ko','nameVi','nameEn','nameKo','name','schoolName']);
  const inferCampus = (obj) => Array.isArray(obj.campuses) ? obj.campuses : [];
  const flatten = (raw)=>raw.map(item=>({
    name: inferName(item),
    nameEn: pick(item,['en','nameEn','englishName']),
    nameKo: pick(item,['ko','nameKo','koreanName']),
    region: inferRegion(item) || inferRegion((item.campuses||[])[0]),
    city: inferCity(item) || inferCity((item.campuses||[])[0]),
    type: inferType(item),
    website: pick(item,['website','site','homepage']),
    maps: pick(item,['googleMaps','mapUrl','maps']),
    campuses: inferCampus(item)
  })).filter(x=>x.name);

  const suggestionBox = $('#searchSuggestions');
  const searchInput = $('#schoolSearch');
  const regionSelect = $('#regionSelectMain');
  const typeSelect = $('#typeSelectMain');
  const form = $('#schoolSearchForm');

  function fillRegions(){
    const regions = [...new Set(schools.map(s=>s.region).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'vi'));
    regions.forEach(r=> regionSelect?.insertAdjacentHTML('beforeend', `<option value="${String(r).replace(/"/g,'&quot;')}">${r}</option>`));
  }
  function renderSuggestions(list){
    if(!suggestionBox) return;
    if(!list.length){ suggestionBox.hidden = true; suggestionBox.innerHTML=''; return; }
    suggestionBox.innerHTML = list.slice(0,8).map(s=>`<button type="button" data-name="${(s.name||'').replace(/"/g,'&quot;')}"><strong>${s.name}</strong><br><small>${[s.region,s.city].filter(Boolean).join(' · ')}</small></button>`).join('');
    suggestionBox.hidden = false;
    $$('button', suggestionBox).forEach(btn=>btn.addEventListener('click',()=>{
      searchInput.value = btn.dataset.name || '';
      suggestionBox.hidden = true;
      goToMap(searchInput.value);
    }));
  }
  function filterSchools(keyword=''){
    const k = normalizeText(keyword);
    return schools.filter(s=>{
      const okKeyword = !k || [s.name,s.nameEn,s.nameKo].some(v=>normalizeText(v).includes(k));
      const okRegion = !regionSelect?.value || s.region === regionSelect.value;
      const okType = !typeSelect?.value || s.type === typeSelect.value;
      return okKeyword && okRegion && okType;
    });
  }
  function goToMap(name){
    const q = encodeURIComponent(name || searchInput.value || '');
    window.location.href = `ban-do-dai-hoc-han-quoc.html?search=${q}`;
  }
  searchInput?.addEventListener('input', e=>renderSuggestions(filterSchools(e.target.value)));
  form?.addEventListener('submit', e=>{e.preventDefault(); goToMap();});
  document.addEventListener('click', e=>{ if(!suggestionBox?.contains(e.target) && e.target !== searchInput){ suggestionBox.hidden = true; } });

  fetch('university-map/universities.json')
    .then(r=>r.ok ? r.json() : [])
    .then(data=>{ schools = flatten(Array.isArray(data)?data:(Array.isArray(data.schools)?data.schools:[])); fillRegions(); })
    .catch(()=>{});
})();
