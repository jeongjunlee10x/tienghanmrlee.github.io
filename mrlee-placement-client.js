/* MR LEE Placement Free - full submission to Supabase; no Firebase login required. */
(()=>{'use strict';
  const cfg=window.MRLEE_PLACEMENT_CONFIG||{};
  const result=document.getElementById('results');
  if(!result)return;
  const block=document.createElement('div');
  block.id='mrlee-placement-save';
  block.setAttribute('role','status');
  block.style.cssText='border:1px solid #b8d0e5;border-radius:12px;padding:14px 16px;margin:18px 0;background:#f4f8fd;';
  block.innerHTML='<strong>Hệ thống lưu bài làm:</strong> <span id="mrlee-placement-message">Chưa nộp bài.</span>';
  const zone=document.createElement('div');zone.id='mrlee-turnstile';zone.style.marginTop='8px';block.append(zone);
  const retry=document.createElement('button');retry.textContent='Thử lưu lại';retry.type='button';retry.className='btn secondary hidden';retry.style.marginTop='8px';block.append(retry);
  const target=document.getElementById('studentResult');
  (target||result.firstElementChild).after(block);
  const message=block.querySelector('#mrlee-placement-message');
  let snapshot=null,awaiting=false,stored=false;
  let loader=null;
  function render(txt){message.textContent=txt}
  function library(){
    if(window.turnstile)return Promise.resolve(window.turnstile);
    if(loader)return loader;
    loader=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
      script.onload=()=>window.turnstile?resolve(window.turnstile):reject(new Error('Không khởi tạo được Turnstile'));
      script.onerror=()=>reject(new Error('Không tải được xác thực miễn phí Turnstile'));
      document.head.append(script);
    });return loader;
  }
  function turnstileToken(){return new Promise(async(resolve,reject)=>{
    try{
      const sdk=await library();zone.replaceChildren();
      const widget=sdk.render(zone,{
        sitekey:cfg.turnstileSiteKey,execution:'execute',appearance:'interaction-only',
        callback:resolve,'error-callback':()=>reject(new Error('Xác thực chống spam thất bại')),
        'timeout-callback':()=>reject(new Error('Xác thực hết thời gian'))
      });
      sdk.execute(widget);
    }catch(e){reject(e)}
  })}
  async function save(){
    if(!snapshot||awaiting||stored)return;
    awaiting=true;retry.classList.add('hidden');render('Đang xác thực và lưu đủ 50 câu vào Admin...');
    try{
      if(!/^https:\/\/pkxqsboyotlyoizzxizb\.supabase\.co\/functions\/v1\/mrlee-placement-submit$/.test(cfg.endpoint))
        throw Error('Đường dẫn lưu bài chưa được cấu hình');
      if(!cfg.turnstileSiteKey||cfg.turnstileSiteKey.startsWith('THAY_'))
        throw Error('Admin chưa cấu hình mã Turnstile miễn phí');
      const token=await turnstileToken();
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),22000);
      let res;
      try{res=await fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...snapshot,turnstileToken:token}),signal:controller.signal});}finally{clearTimeout(timer)}
      const data=await res.json().catch(()=>({message:'Máy chủ không phản hồi đúng định dạng'}));
      if(!res.ok||!data.ok)throw Error(data.message||'Máy chủ không nhận bài');
      if(data.submissionId!==snapshot.submissionId)throw Error('Mã xác nhận bài nộp không trùng khớp');
      stored=true;
      render('✓ Đã lưu đầy đủ bài làm lên Admin. Mã bài: '+snapshot.submissionId);
      zone.replaceChildren();
    }catch(error){
      render('⚠ Chưa lưu lên Admin: '+(error?.message||'Không rõ nguyên nhân')+'. Nhấn “Thử lưu lại” trước khi thoát.');
      retry.classList.remove('hidden');
    }finally{awaiting=false}
  }
  window.MRLEE_PLACEMENT={submit(data){
    if(!data||!Array.isArray(data.answers)||data.answers.length!==50)return;
    snapshot={...data,submissionId:crypto.randomUUID()};stored=false;
    void save();
  }};
  retry.addEventListener('click',()=>void save());
  window.addEventListener('beforeunload',e=>{
    if(snapshot&&!stored){e.preventDefault();e.returnValue='Bài làm chưa được lưu lên Admin.'}
  });
})();
