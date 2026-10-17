/* MR LEE V21 - no collection, no third-party API token, no false success claim. */
(()=>{
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const form = $('#consultFormV21');
  if(!form) return;
  const result = $('#v21Result');
  const preview = $('#v21Preview');
  const status = $('#v21Status');
  const higherSchool = $('#v21HigherSchool');
  const birthDate = $('#v21BirthDate');
  const messengerUrl = 'https://m.me/821366751066220'; // Public Page recipient MUST be verified by owner.
  const intakeEmail = 'tienghanmrlee@gmail.com';
  let preparedText = '';

  const value = (id)=>$(id)?.value.trim()||'';
  const selected = (name)=>form.querySelector(`input[name="${name}"]:checked`)?.value||'';
  const notify = (message)=>{ if(status) status.textContent = message; };
  const validMessenger = /^https:\/\/m\.me\/[a-zA-Z0-9._-]+$/.test(messengerUrl);
  if (!validMessenger) $('#v21OpenMessenger').hidden = true;
  if (birthDate){const t=new Date(); birthDate.max = [t.getFullYear(),String(t.getMonth()+1).padStart(2,'0'),String(t.getDate()).padStart(2,'0')].join('-');}

  function updateHigherEducation(){
    const isNone = selected('higherSchoolStatus') === 'Chưa học CĐ/ĐH';
    higherSchool.disabled = isNone;
    higherSchool.required = !isNone;
    if(isNone) higherSchool.value = '';
  }
  form.querySelectorAll('input[name="higherSchoolStatus"]').forEach(el=>el.addEventListener('change',updateHigherEducation));
  updateHigherEducation();

  const calculateYears = isoDate => {
    const [year, month, day] = isoDate.split('-').map(Number);
    const now = new Date();
    let age=now.getFullYear()-year;
    if(now.getMonth()+1<month || (now.getMonth()+1===month && now.getDate()<day)) age--;
    return age;
  };
  const formatBirthDate = isoDate => {
    const a=isoDate.split('-');
    return a.length===3 ? `${a[2]}/${a[1]}/${a[0]}` : isoDate;
  };

  function collect(){
    const fullName = value('#v21FullName');
    const birth = value('#v21BirthDate');
    const phone = value('#v21Phone');
    const program = value('#v21Program');
    const highSchool = value('#v21HighSchool');
    const highStatus = selected('highSchoolStatus');
    const higherStatus = selected('higherSchoolStatus');
    const higher = higherStatus==='Chưa học CĐ/ĐH' ? 'Không áp dụng' : value('#v21HigherSchool');
    if(!fullName || !birth || !phone || !program || !highSchool || !highStatus || !higherStatus) return null;
    if(!/^\+?[\d\s().-]{9,18}$/.test(phone) || phone.replace(/\D/g,'').length<9){
      $('#v21Phone').setCustomValidity('Vui lòng nhập số điện thoại hợp lệ.');
      $('#v21Phone').reportValidity();
      return null;
    }
    $('#v21Phone').setCustomValidity('');
    const years = calculateYears(birth);
    if(!Number.isFinite(years) || years<0 || years>110){
      birthDate.setCustomValidity('Ngày sinh không hợp lệ.');birthDate.reportValidity();return null;
    }
    birthDate.setCustomValidity('');
    if(years < 18 && !$('#v21Guardian').checked){
      $('#v21Guardian').setCustomValidity('Cần sự đồng ý của phụ huynh / người giám hộ nếu chưa đủ 18 tuổi.');
      $('#v21Guardian').reportValidity();return null;
    }
    $('#v21Guardian').setCustomValidity('');
    return [
      'PHIẾU ĐĂNG KÝ TƯ VẤN DU HỌC HÀN QUỐC - MR LEE',
      '---------------------------------------------',
      `HỌ VÀ TÊN: ${fullName}`,
      `NGÀY SINH: ${formatBirthDate(birth)}`,
      `SỐ ĐIỆN THOẠI: ${phone}`,
      `CHƯƠNG TRÌNH QUAN TÂM: ${program}`,
      '',
      '1. THÔNG TIN THPT',
      `Tên trường THPT: ${highSchool}`,
      `Tình trạng tốt nghiệp THPT: ${highStatus}`,
      '',
      '2. THÔNG TIN CAO ĐẲNG / ĐẠI HỌC',
      `Tên trường CĐ / Đại học: ${higher}`,
      `Tình trạng tốt nghiệp CĐ / Đại học: ${higherStatus}`,
      '---------------------------------------------',
      'Nguồn: Trang chủ MR LEE'
    ].join('\n');
  }

  ['#v21Phone','#v21BirthDate','#v21Guardian'].forEach(sel=>{
    $(sel)?.addEventListener('input', ()=>$(sel).setCustomValidity(''));
    $(sel)?.addEventListener('change', ()=>$(sel).setCustomValidity(''));
  });
  form.addEventListener('submit', ev=>{
    ev.preventDefault();
    updateHigherEducation();
    if(!form.reportValidity()) return;
    const text = collect();
    if(!text) return;
    preparedText=text;
    preview.value = text;
    $('#v21OpenEmail').href = `mailto:${intakeEmail}?subject=${encodeURIComponent('PHIẾU ĐĂNG KÝ TƯ VẤN - MR LEE')}&body=${encodeURIComponent(text)}`;
    result.hidden = false;
    notify('Phiếu đã tạo trên thiết bị, CHƯA gửi tới Meta hoặc Email.');
    result.scrollIntoView({behavior:'smooth',block:'nearest'});
  });

  async function copyPrepared(){
    if(!preparedText) return false;
    try {
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(preparedText);
        return true;
      }
    } catch(e) { /* fall back to selecting the preview */ }
    preview.focus();preview.select();
    try { return !!document.execCommand('copy'); }
    catch(e) { return false; }
  }

  $('#v21Copy').addEventListener('click', async()=>{
    const copied=await copyPrepared();
    notify(copied ? 'Đã sao chép. Bạn hãy dán và tự gửi tới kênh tư vấn.' : 'Hãy chọn và sao chép thủ công nội dung trong khung.');
  });

  $('#v21OpenMessenger').addEventListener('click', ()=>{
    // Default anchor navigation opens Messenger in a new tab; nothing is auto-sent.
    // Start clipboard copying while the click is still a direct user gesture.
    copyPrepared().then(copied=>{
      notify(copied
        ? 'Đã sao chép phiếu. Trong Messenger, hãy nhấn Dán → Gửi.'
        : 'Messenger đã được yêu cầu mở. Hãy sao chép phiếu thủ công rồi nhấn Dán → Gửi.');
    });
  });
})();
