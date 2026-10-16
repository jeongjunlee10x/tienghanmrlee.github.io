/* TIẾNG HÀN MR LEE / Tuyển sinh V15. Original UI implementation. No analytics or auto-posting of applicant data. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const regionNames = {
    seoul:'Seoul · 서울', busan:'Busan · 부산', daegu:'Daegu · 대구', incheon:'Incheon · 인천',
    daejeon:'Daejeon · 대전', ulsan:'Ulsan · 울산', sejong:'Sejong · 세종', gwangju:'Gwangju · 광주',
    gyeonggi:'Gyeonggi · 경기', gangwon:'Gangwon · 강원', chungnam:'Chungnam · 충남',
    chungbuk:'Chungbuk · 충북', gyeongbuk:'Gyeongbuk · 경북', gyeongnam:'Gyeongnam · 경남',
    jeonbuk:'Jeonbuk · 전북', jeonnam:'Jeonnam · 전남', jeju:'Jeju · 제주'
  };
  const normalize = val => String(val || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
  const safeHttp = value => { try { const u = new URL(String(value)); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch (_) {return '';} };
  const create = (tag, className, text) => { const e=document.createElement(tag); if(className)e.className=className; if(text!==undefined)e.textContent=String(text); return e; };
  const menuToggle=$('tsNavigation') && document.querySelector('.ts-menu-toggle');
  if(menuToggle){
    menuToggle.addEventListener('click',()=>{ const opened=$('tsNavigation').classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded',String(opened));menuToggle.setAttribute('aria-label',opened?'Đóng danh mục':'Mở danh mục'); });
    $('tsNavigation').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{ $('tsNavigation').classList.remove('is-open'); menuToggle.setAttribute('aria-expanded','false'); }));
  }
  document.querySelectorAll('[data-interest]').forEach(link=>{
    link.addEventListener('click',()=>{ const select=$('tsProgram');if(select)select.value=link.dataset.interest || ''; });
  });

  let schoolList=[];
  const search=$('tsSchoolSearch'), regionFilter=$('tsRegionFilter'), results=$('tsSchoolResults'), count=$('tsSchoolCount'), meta=$('tsSchoolMeta');
  function regionOf(campus, school){
    const id=String(campus?.region||school.region||'').toLowerCase().replace(/_/g,'-');
    if(id==='jeonbuk-special')return 'jeonbuk';
    if(id in regionNames)return id;
    const text=normalize([campus?.cityKo,campus?.city,campus?.address,school.address].filter(Boolean).join(' '));
    const aliases={seoul:['서울','seoul'],busan:['부산','busan'],daegu:['대구','daegu'],incheon:['인천','incheon'],daejeon:['대전','daejeon'],ulsan:['울산','ulsan'],sejong:['세종','sejong'],gwangju:['광주','gwangju'],gyeonggi:['경기','gyeonggi'],gangwon:['강원','gangwon'],chungnam:['충남','충청남','chungnam'],chungbuk:['충북','충청북','chungbuk'],gyeongbuk:['경북','경상북','gyeongbuk'],gyeongnam:['경남','경상남','gyeongnam'],jeonbuk:['전북','전라북','jeonbuk'],jeonnam:['전남','전라남','jeonnam'],jeju:['제주','jeju']};
    for(const [key,words] of Object.entries(aliases))if(words.some(w=>text.includes(normalize(w))))return key;
    return '';
  }
  function schoolName(s){return String(s.vi||s.en||s.ko||'Trường chưa có tên');}
  function renderSchools(){
    if(!results)return;
    const q=normalize(search.value), r=regionFilter.value;
    const filtered=schoolList.filter(s=>{
      if(r!=='all'&&!s._regions.includes(r))return false;
      if(!q)return true;
      return normalize([s.vi,s.en,s.ko,...(s.aliases||[]),...(s.campuses||[]).flatMap(c=>[c.vi,c.en,c.ko,c.city,c.cityKo])].join(' ')).includes(q);
    });
    results.replaceChildren();
    if(!filtered.length){results.append(create('div','ts-loading','Chưa tìm thấy trường phù hợp trong dữ liệu hiện có. Hãy thử tên tiếng Anh/Hàn hoặc xem bản đồ.'));}
    filtered.slice(0,30).forEach((s,i)=>{
      const row=create('div','ts-school-item');const n=create('span','ts-school-item-num',String(i+1).padStart(2,'0'));
      const content=create('div','ts-school-item-text');
      content.append(create('strong','',schoolName(s)),create('small','',String(s.ko||s.en||'')+(Array.isArray(s.campuses)?' · '+s.campuses.length+' cơ sở':'')));
      const link=create('a','','Bản đồ ↗');link.href='ban-do-dai-hoc-han-quoc.html';link.title='Xem trường trên bản đồ MR LEE';
      row.append(n,content,link);results.append(row);
    });
    count.textContent=schoolList.length+' trường trong dữ liệu';
    meta.textContent=filtered.length>30?'Hiển thị 30 / '+filtered.length+' kết quả (lọc để thu hẹp)':'Hiển thị '+filtered.length+' / '+schoolList.length+' trường';
  }
  async function loadSchools(){
    try{
      const response=await fetch('university-map/universities.json',{cache:'no-store'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();
      if(!data || !Array.isArray(data.schools))throw new Error('Không nhận được danh mục schools[]');
      schoolList=data.schools.filter(s=>s&&typeof s==='object').map(s=>Object.assign({},s,{_regions:[...new Set((Array.isArray(s.campuses)&&s.campuses.length?s.campuses:[{}]).map(c=>regionOf(c,s)).filter(Boolean))]}));
      schoolList.sort((a,b)=>schoolName(a).localeCompare(schoolName(b),'vi'));
      const activeRegions=[...new Set(schoolList.flatMap(s=>s._regions))].sort((a,b)=>(regionNames[a]||a).localeCompare(regionNames[b]||b));
      activeRegions.forEach(key=>{const opt=create('option','',regionNames[key]||key);opt.value=key;regionFilter.append(opt);});
      search.addEventListener('input',renderSchools);regionFilter.addEventListener('change',renderSchools);
      if(!schoolList.length){count.textContent='Chưa có trường';results.replaceChildren(create('div','ts-loading','Danh mục đang trống. Xem lại university-map/universities.json.'));return;}
      renderSchools();
    }catch(error){
      count.textContent='Chưa tải được dữ liệu';results.replaceChildren(create('div','ts-loading','Chưa đọc được danh sách trường. Kiểm tra tệp university-map/universities.json trên cùng website.'));
      meta.textContent='Dữ liệu bản đồ chưa sẵn sàng';
      console.warn('[MR LEE Tuyển sinh] Không tải được danh mục trường:',error.message);
    }
  }
  if(results)loadSchools();

  // Public endpoints only. Do not put API keys, credentials or applicant data in this config.
  let contactConfig={email:'',officialFormUrl:'',messengerUrl:'',facebookPageUrl:'',zaloUrl:''};
  function checkChannelURL(value,kind){
    const url=safeHttp(value);
    if(!url)return '';
    try {
      const host=new URL(url).hostname.toLowerCase();
      const allowed=kind==='zalo' ? ['zalo.me','oa.zalo.me'] :
        ['m.me','messenger.com','www.messenger.com','facebook.com','www.facebook.com','web.facebook.com','fb.com','www.fb.com'];
      return allowed.includes(host) && url.startsWith('https://') ? url : '';
    }catch(_){return '';}
  }
  function linkIfConfigured(id,url){
    const el=$(id);if(!el)return;
    if(url){el.href=url;el.hidden=false;}
    else {el.hidden=true;el.removeAttribute('href');}
  }
  function refreshChannels(){
    linkIfConfigured('tsMetaLink',contactConfig.messengerUrl);
    linkIfConfigured('tsFloatMessenger',contactConfig.messengerUrl);
    linkIfConfigured('tsZaloLink',contactConfig.zaloUrl);
    linkIfConfigured('tsFloatZalo',contactConfig.zaloUrl);
    linkIfConfigured('tsFacebookLink',contactConfig.facebookPageUrl);
    const hasContact=!!(contactConfig.messengerUrl||contactConfig.zaloUrl||contactConfig.facebookPageUrl);
    if($('tsSocialEmpty'))$('tsSocialEmpty').hidden=hasContact;
    if($('tsDeliveryInfo') && (hasContact||contactConfig.email||contactConfig.officialFormUrl))
      $('tsDeliveryInfo').textContent='Chỉ chuyển thông tin sau khi bạn tự chọn kênh gửi; website không tự lưu hoặc gửi hồ sơ.';
  }
  fetch('assets/tuyen-sinh-config.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(cfg=>{
    if(!cfg || typeof cfg!=='object')return;
    contactConfig={
      email:String(cfg.email||'').trim(),officialFormUrl:safeHttp(cfg.officialFormUrl||''),
      messengerUrl:checkChannelURL(cfg.messengerUrl||'','meta'),
      facebookPageUrl:checkChannelURL(cfg.facebookPageUrl||'','meta'),
      zaloUrl:checkChannelURL(cfg.zaloUrl||'','zalo')
    };
    if(typeof cfg.logoPath==='string' && cfg.logoPath.trim() && !/^https?:/i.test(cfg.logoPath) && !cfg.logoPath.includes('..')){
      const logo=$('tsLogo');if(logo)logo.src=cfg.logoPath;
    }
    refreshChannels();
  }).catch(()=>{refreshChannels();});
  const logo=$('tsLogo');
  let logoMarkTried=false;
  function logoFallback(){
    if(!logo)return;
    if(!logoMarkTried){logoMarkTried=true;logo.src='assets/mrlee-admissions-mark.svg';return;}
    logo.hidden=true;
    const fallback=document.querySelector('.ts-logo-fallback');
    if(fallback)fallback.hidden=false;
  }
  if(logo){logo.addEventListener('error',logoFallback);if(logo.complete && !logo.naturalWidth)logoFallback();}
  const form=$('tsLeadForm');
  if(form)form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity())return;
    const name=$('tsName').value.trim(), phone=$('tsPhone').value.trim(), program=$('tsProgram').value, education=$('tsEducation').value, city=$('tsCity')?.value.trim()||'', preferred=$('tsPreferred')?.value||'', message=$('tsMessage').value.trim();
    if(name.length<2){$('tsName').setCustomValidity('Vui lòng nhập họ tên hợp lệ.');$('tsName').reportValidity();$('tsName').setCustomValidity('');return;}
    if(!/^[+()\d\s.-]{9,24}$/.test(phone)||phone.replace(/\D/g,'').length<9){$('tsPhone').setCustomValidity('Số điện thoại chưa hợp lệ.');$('tsPhone').reportValidity();$('tsPhone').setCustomValidity('');return;}
    if(!program)return;
    const lines=['PHIẾU YÊU CẦU TƯ VẤN TUYỂN SINH - TIẾNG HÀN MR LEE', 'Họ và tên: '+name,'Số điện thoại: '+phone,'Chương trình: '+program,education?'Trình độ: '+education:'',city?'Khu vực hiện tại: '+city:'',preferred?'Kênh mong muốn: '+preferred:'',message?'Mục tiêu/câu hỏi: '+message:'', 'Nguồn: Trang tuyển sinh MR LEE'];
    const content=lines.filter(Boolean).join('\n');
    $('tsLeadText').value=content;$('tsLeadOutput').hidden=false;
    $('tsLeadOutput').scrollIntoView({behavior:'smooth',block:'nearest'});
    const emailAnchor=$('tsSendEmail');emailAnchor.hidden=true;emailAnchor.removeAttribute('href');
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactConfig.email)){
      emailAnchor.href='mailto:'+encodeURIComponent(contactConfig.email)+'?subject='+encodeURIComponent('Yêu cầu tư vấn tuyển sinh - MR LEE')+'&body='+encodeURIComponent(content);
      emailAnchor.hidden=false;
    }
    linkIfConfigured('tsSendMessenger',contactConfig.messengerUrl);
    linkIfConfigured('tsSendZalo',contactConfig.zaloUrl);
    linkIfConfigured('tsSendFacebook',contactConfig.facebookPageUrl);
    const formAnchor=$('tsOfficialForm');formAnchor.hidden=!contactConfig.officialFormUrl;
    if(contactConfig.officialFormUrl)formAnchor.href=contactConfig.officialFormUrl;else formAnchor.removeAttribute('href');
    $('tsLeadHint').textContent=(emailAnchor.hidden && formAnchor.hidden && !contactConfig.messengerUrl && !contactConfig.zaloUrl && !contactConfig.facebookPageUrl)
      ? 'Chưa cấu hình Meta/Zalo. Hãy sao chép nội dung; cần cung cấp liên kết chính thức để hiển thị nút gửi.'
      : 'Nhấn Sao chép, rồi mở Messenger hoặc Zalo để dán và nhấn Gửi. Chưa có dữ liệu nào được gửi tự động.';
    $('tsCopyStatus').textContent='';
  });
  const copyButton=$('tsCopyLead');
  if(copyButton)copyButton.addEventListener('click',async()=>{
    const value=$('tsLeadText').value;
    try{
      if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(value);}
      else{ $('tsLeadText').focus();$('tsLeadText').select();if(!document.execCommand('copy'))throw new Error('Không sao chép được'); }
      $('tsCopyStatus').textContent='Đã sao chép phiếu. Bạn có thể dán vào Zalo hoặc email của bộ phận tư vấn.';
    }catch(_){$('tsLeadText').focus();$('tsLeadText').select();$('tsCopyStatus').textContent='Đã chọn nội dung; nhấn Ctrl+C để sao chép.';}
  });

  // Copy draft when the user explicitly clicks an outgoing chat action.
  for(const id of ['tsSendMessenger','tsSendZalo']){
    const link=$(id);if(!link)continue;
    link.addEventListener('click',()=>{
      const text=$('tsLeadText')?.value||'';
      if(!text)return;
      if(navigator.clipboard && window.isSecureContext){navigator.clipboard.writeText(text).then(()=>{
        if($('tsCopyStatus'))$('tsCopyStatus').textContent='Đã sao chép: dán vào cửa sổ chat và tự nhấn Gửi.';
      }).catch(()=>{});}
    });
  }

  // Quick program guidance: local-only, no eligibility or visa guarantees.
  const wizard=$('tsWizard');
  if(wizard)wizard.addEventListener('submit',event=>{
    event.preventDefault();
    if(!wizard.reportValidity())return;
    const data=new FormData(wizard);
    const goal=String(data.get('goal')||''),stage=String(data.get('stage')||'');
    const select=$('tsProgram');if(select)select.value=goal;
    const education=$('tsEducation');if(education){for(const opt of education.options)if(opt.value===stage)education.value=stage;}
    const hints={
      'Học tiếng D-4-1':'Bước tiếp theo: xác nhận điều kiện học tiếng, thời điểm tuyển sinh và trường có chương trình phù hợp.',
      'Đại học / Cao đẳng D-2':'Bước tiếp theo: rà soát bậc học, ngành muốn theo đuổi, trình độ ngoại ngữ và yêu cầu của trường.',
      'Sau đại học D-2':'Bước tiếp theo: đối chiếu bằng cấp, chuyên ngành, ngoại ngữ và yêu cầu riêng của khoa/viện.',
      'Chưa xác định':'Bước tiếp theo: trao đổi mục tiêu học tập, khả năng tiếng Hàn và tài chính để so sánh các phương án.'
    };
    $('tsWizardResultTitle').textContent='Gợi ý dành cho bạn: '+goal;
    $('tsWizardResultText').textContent='Giai đoạn hiện tại: '+stage+'. '+(hints[goal]||hints['Chưa xác định'])+' Đây không phải xét tuyển tự động.';
    $('tsWizardResult').hidden=false;
  });

  // Checklist is not stored, uploaded or analyzed off-device.
  const checks=[...document.querySelectorAll('.ts-document-check')];
  function updateChecklist(){const count=checks.filter(c=>c.checked).length;const el=$('tsChecklistCount');if(el)el.textContent=count+'/'+checks.length+' mục đã đánh dấu';}
  checks.forEach(check=>check.addEventListener('change',updateChecklist));
  updateChecklist();
  async function copyPlain(text){
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true;}
    const textarea=document.createElement('textarea');textarea.value=text;textarea.style.position='fixed';textarea.style.opacity='0';document.body.append(textarea);textarea.select();
    let success=false;try{success=document.execCommand('copy');}catch(_){}textarea.remove();return success;
  }
  const checklistButton=$('tsCopyChecklist');
  if(checklistButton)checklistButton.addEventListener('click',async()=>{
    const list=checks.map(c=>(c.checked?'[x] ':'[ ] ')+c.nextElementSibling.textContent.trim());
    const message='DANH SÁCH CHUẨN BỊ THAM KHẢO - MR LEE\n'+list.join('\n')+'\nLưu ý: yêu cầu hồ sơ chính thức tùy trường.';
    try{const success=await copyPlain(message);$('tsChecklistStatus').textContent=success?'Đã sao chép danh sách.':'Không thể tự sao chép, hãy thử lại.';}
    catch(_){$('tsChecklistStatus').textContent='Không thể tự sao chép, hãy thử lại.';}
  });
})();
