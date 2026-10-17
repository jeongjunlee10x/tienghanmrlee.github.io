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
  const escapeHTML = (x) => String(x||'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function renderSuggestions(list){
    if(!suggestionBox) return;
    suggestionBox.replaceChildren();
    if(!list.length){ suggestionBox.hidden = true; return; }
    list.slice(0,8).forEach(s=>{
      const btn=document.createElement('button'); btn.type='button';
      const strong=document.createElement('strong'); strong.textContent=s.name;
      const small=document.createElement('small'); small.textContent=[s.region,s.city].filter(Boolean).join(' · ');
      btn.append(strong,document.createElement('br'),small);
      btn.addEventListener('click',()=>{searchInput.value=s.name;suggestionBox.hidden=true;goToMap(s.name);});
      suggestionBox.append(btn);
    });
    suggestionBox.hidden = false;
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
    const region=encodeURIComponent(regionSelect?.value||'');
    const type=encodeURIComponent(typeSelect?.value||'');
    window.location.href = `ban-do-dai-hoc-han-quoc.html?search=${q}&region=${region}&type=${type}`;
  }
  searchInput?.addEventListener('input', e=>renderSuggestions(filterSchools(e.target.value)));
  form?.addEventListener('submit', e=>{e.preventDefault(); goToMap();});
  document.addEventListener('click', e=>{ if(!suggestionBox?.contains(e.target) && e.target !== searchInput){ suggestionBox.hidden = true; } });

  fetch('university-map/universities.json')
    .then(r=>r.ok ? r.json() : [])
    .then(data=>{ schools = flatten(Array.isArray(data)?data:(Array.isArray(data.schools)?data.schools:[])); fillRegions(); })
    .catch(()=>{});
})();


// V19.2: horizontal preview uses ONLY the existing ranking page's rendered table.
// If the ranking is dynamically rendered in a non-table structure, do not invent results.
(()=>{
  const source=document.getElementById('rankDataFrame');
  const strip=document.getElementById('rankSlider');
  if(!source || !strip) return;
  let completed=false;
  let tries=0;
  let timeoutId=null;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const render=(items)=>{
    strip.replaceChildren();
    items.slice(0,40).forEach(item=>{
      const card=document.createElement('article'); card.className='student-rank';
      if(item.rank){const rank=document.createElement('span');rank.className='position';rank.textContent=item.rank;card.appendChild(rank);}
      const info=document.createElement('div');info.className='student-info';
      const name=document.createElement('b');name.className='student-name';name.textContent=item.name;
      const score=document.createElement('small');score.className='student-score';score.textContent=item.score;
      info.append(name,score);card.appendChild(info);strip.appendChild(card);
    });
  };
  const read=()=>{
    if(completed) return true;
    let doc;
    try { doc=source.contentDocument || source.contentWindow.document; }
    catch { return false; }
    if(!doc || !doc.body) return false;
    const rows=[...doc.querySelectorAll('table tbody tr')];
    const possible = rows.length ? rows : [...doc.querySelectorAll('table tr,[role="row"]')].slice(1);
    const items=[];
    for(const row of possible){
      const vals=[...row.querySelectorAll('td,[role="cell"]')].map(c=>clean(c.textContent)).filter(Boolean);
      if(vals.length < 2) continue;
      const rank=/^\d{1,4}$/.test(vals[0]) ? vals[0] : '';
      const candidates = rank ? vals.slice(1) : vals;
      const name = candidates.find(v=>/[\p{L}]/u.test(v) && !/^(điểm|score|stt|tổng|total)$/i.test(v));
      if(!name || name.length>120) continue;
      const score = [...candidates].reverse().find(v=>/^\d{1,6}(?:[.,]\d{1,2})?(?:\s*(?:điểm|pts))?$/i.test(v));
      if(!score) continue;
      items.push({rank,name,score:`${score.replace(/\s*(điểm|pts)$/i,'')} điểm`});
    }
    if(items.length){completed=true;render(items);clearTimeout(timeoutId);return true;}
    return false;
  };
  const retry=()=>{
    if(read())return;
    tries++;
    if(tries>=10){
      strip.replaceChildren();
      const message=document.createElement('div');message.className='rank-placeholder';
      const strong=document.createElement('b');strong.textContent='Không có dữ liệu BXH dạng bảng để xem nhanh.';
      const link=document.createElement('a');link.href='bang-xep-hang.html';link.textContent='Mở bảng xếp hạng học viên thật →';
      message.append(strong,link);strip.append(message);
      return;
    }
    timeoutId=setTimeout(retry,1800);
  };
  source.addEventListener('load', retry, {once:true});
  timeoutId=setTimeout(retry,2500);
})();
