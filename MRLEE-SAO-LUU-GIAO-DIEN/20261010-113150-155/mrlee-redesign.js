/* TIẾNG HÀN MR LEE — Interface enhancement 2026.10.
   Zero Firebase calls; no modification of slideshow, authentication, wallet, or learning data. */
(()=>{
  'use strict';
  if(window.__MRLEE_REDESIGN_LOADED__)return;
  window.__MRLEE_REDESIGN_LOADED__=true;
  const CONTACT=Object.freeze({phone:'0376991180',fax:'0866761403',zalo:'https://zalo.me/0376991180',messenger:'https://m.me/821366751066220',email:'tienghanmrlee@gmail.com'});
  const TEXT={
    vi:{quick:'LỐI TẮT HỌC TẬP · BẮT ĐẦU NGAY',hangul:'Bảng chữ cái Hangul',hangulSub:'Học từ bài số 0',roadmap:'Lộ trình cấp 1–6',roadmapSub:'Học theo từng cấp',speaking:'Luyện nói tính điểm',speakingSub:'Nghe, nói và nhận điểm',contact:'Kết nối với Mr Lee',contactSub:'Tư vấn khóa học và hỗ trợ học viên',call:'Gọi điện · KakaoTalk',fax:'Fax',zalo:'Nhắn Zalo',messenger:'Nhắn Messenger',contactButton:'Liên hệ',close:'Đóng liên hệ',studentLinks:'Hành trình học của bạn',history:'Lịch sử học tập'},
    ko:{quick:'바로 가기 · 지금 시작하세요',hangul:'한글 자모 배우기',hangulSub:'입문 수업부터',roadmap:'1~6급 학습 과정',roadmapSub:'수준별 단계 학습',speaking:'말하기 포인트 연습',speakingSub:'듣고 말하고 점수 받기',contact:'미스터 리에게 문의',contactSub:'수업 문의 및 학습자 지원',call:'전화 · KakaoTalk',fax:'팩스',zalo:'Zalo 채팅',messenger:'Messenger 채팅',contactButton:'문의하기',close:'문의 닫기',studentLinks:'나의 학습 여정',history:'학습 기록'},
    en:{quick:'QUICK ACCESS · START LEARNING',hangul:'Learn Hangul Alphabet',hangulSub:'Start with Lesson 0',roadmap:'Level 1–6 Roadmap',roadmapSub:'Learn step by step',speaking:'Speaking & Points',speakingSub:'Listen, speak and practise',contact:'Connect with Mr Lee',contactSub:'Course enquiries and learner support',call:'Phone · KakaoTalk',fax:'Fax',zalo:'Chat on Zalo',messenger:'Chat on Messenger',contactButton:'Contact us',close:'Close contacts',studentLinks:'Your learning journey',history:'Learning history'}
  };
  const q=(selector,base=document)=>base.querySelector(selector);
  const qa=(selector,base=document)=>Array.from(base.querySelectorAll(selector));
  const newEl=(tag,cls,content)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(content!==undefined)el.textContent=String(content);return el;};
  const add=(par,...children)=>{for(const child of children)par.appendChild(child);return par;};
  const lang=()=>{
    let stored='';try{stored=localStorage.getItem('mrlee-language')||''}catch{}
    const code=(document.documentElement.lang||'').slice(0,2).toLowerCase();
    // Homepage i18n language follows mrlee-language; other pages default vi.
    return TEXT[stored] && q('.feature-grid') ? stored : (TEXT[code]?code:'vi');
  };
  const tr=(key)=>TEXT[lang()][key]||TEXT.vi[key];
  const a=(cls,label,href,external=false)=>{const el=newEl('a',cls,label);el.href=href;if(external){el.target='_blank';el.rel='noopener noreferrer'}return el;};
  function applyLabels(){
    qa('[data-mrlee-tr]').forEach(el=>{const k=el.dataset.mrleeTr;if(TEXT.vi[k])el.textContent=tr(k)});
    const toggle=q('#mrleeContactToggle');if(toggle)toggle.setAttribute('aria-label',tr('contactButton'));
  }
  function page(){
    const path=location.pathname.split('/').pop().toLowerCase();
    if(path==='index.html'||path==='')return q('.feature-grid')?'home':'learning';
    if(path==='dang-nhap.html'||q('#account-view'))return 'account';
    return 'learning';
  }
  function enhanceCards(){
    qa('.feature-grid .feature-card').forEach((card,i)=>{
      card.setAttribute('data-mrlee-number',String(i+1).padStart(2,'0'));
    });
  }
  function insertQuickAccess(){
    if(!q('.feature-grid')||q('#mrleeQuickPath'))return;
    const target=q('.hero.page-wrap')||q('section.hero');if(!target||!target.parentNode)return;
    const section=newEl('section','mrlee-quick-path');section.id='mrleeQuickPath';section.setAttribute('aria-label','Điều hướng học tập nhanh');
    const kicker=newEl('span','mrlee-kicker');kicker.dataset.mrleeTr='quick';section.appendChild(kicker);
    const grid=newEl('div','mrlee-quick-grid');
    const entries=[['📖','hangul','hangulSub','bang-chu-cai-tieng-han.html'],['🎓','roadmap','roadmapSub','lo-trinh-1-6.html'],['🎙️','speaking','speakingSub','luyen-noi-tinh-diem.html']];
    entries.forEach(([icon,title,subtitle,href])=>{
      const link=a('mrlee-quick-card',undefined,href);
      const ico=newEl('span','mrlee-quick-icon',icon);ico.setAttribute('aria-hidden','true');
      const copy=newEl('span','mrlee-quick-label');
      const strong=newEl('b');strong.dataset.mrleeTr=title;
      const small=newEl('small');small.dataset.mrleeTr=subtitle;
      add(copy,strong,small);
      const arrow=newEl('span','mrlee-quick-arr','↗');arrow.setAttribute('aria-hidden','true');
      add(link,ico,copy,arrow);grid.appendChild(link);
    });
    section.appendChild(grid);
    target.after(section);
  }
  function enhanceFooter(){
    const contactSection=q('.footer-contact');
    if(contactSection){
      const contacts=q('.contact-grid',contactSection);
      if(contacts){
        const allPhones=qa('.contact-link',contacts);
      const phone1=allPhones.find(x=>x.getAttribute('href')?.includes('0376991180'));
      if(phone1){const pLabel=q('.contact-label',phone1);if(pLabel){pLabel.dataset.mrleeTr='call';pLabel.textContent=tr('call')}}
      const num=allPhones.find(x=>x.getAttribute('href')?.includes('0866761403')||x.textContent?.replace(/\s+/g,'').includes('0866761403'));
        if(num){const lbl=q('.contact-label',num);if(lbl){lbl.dataset.mrleeTr='fax';lbl.textContent=tr('fax')}}
        if(!q('.mrlee-contact-extra',contacts)){
          const one=a('contact-link mrlee-contact-extra mrlee-zalo',undefined,CONTACT.zalo,true);
          const zi=newEl('span','contact-icon','Z');
          const meta=newEl('span','contact-meta');const label=newEl('span','contact-label');label.dataset.mrleeTr='zalo';const value=newEl('strong','contact-value','0376 991 180');
          add(meta,label,value);add(one,zi,meta);
          const two=a('contact-link mrlee-contact-extra mrlee-messenger',undefined,CONTACT.messenger,true);
          const mi=newEl('span','contact-icon','M');const meta2=newEl('span','contact-meta');const label2=newEl('span','contact-label');label2.dataset.mrleeTr='messenger';const val2=newEl('strong','contact-value','Facebook Messenger');
          add(meta2,label2,val2);add(two,mi,meta2);
          contacts.append(one,two);
        }
      }
      return;
    }
    if(q('#mrleeContactBand'))return;
    const band=newEl('section','mrlee-contact-band');band.id='mrleeContactBand';
    const head=newEl('div','mrlee-band-top');const left=newEl('div');
    const eyebrow=newEl('span','mrlee-band-eyebrow','TIẾNG HÀN MR LEE · KẾT NỐI');
    const title=newEl('h2');title.dataset.mrleeTr='contact';add(left,eyebrow,title);
    const subtitle=newEl('small');subtitle.dataset.mrleeTr='contactSub';subtitle.style.color='#708399';add(head,left,subtitle);
    const items=newEl('div','mrlee-band-items');
    const phone=a('mrlee-band-phone','0376 991 180','tel:+84376991180');const phlab=newEl('b');phlab.dataset.mrleeTr='call';phone.prepend(phlab);
    const zalo=a('mrlee-band-zalo','0376 991 180',CONTACT.zalo,true);const zlab=newEl('b');zlab.dataset.mrleeTr='zalo';zalo.prepend(zlab);
    const mess=a('mrlee-band-messenger','Facebook Messenger',CONTACT.messenger,true);const mlab=newEl('b');mlab.dataset.mrleeTr='messenger';mess.prepend(mlab);
    const fax=newEl('div','mrlee-band-fax','0866 761 403');const flab=newEl('b');flab.dataset.mrleeTr='fax';fax.prepend(flab);
    add(items,phone,zalo,mess,fax);add(band,head,items);
    const footer=q('footer');if(footer&&footer.parentNode)footer.before(band);else document.body.appendChild(band);
  }
  function createDock(){
    if(q('#mrleeContactDock'))return;
    const dock=newEl('aside','mrlee-contact-dock');dock.id='mrleeContactDock';dock.setAttribute('aria-label','Liên hệ Tiếng Hàn Mr Lee');
    const links=newEl('div','mrlee-dock-links');links.id='mrleeContactLinks';
    for(const [kind,label,url,icon,external] of [
      ['zalo','zalo',CONTACT.zalo,'Z',true],
      ['messenger','messenger',CONTACT.messenger,'M',true],
      ['call','call','tel:+84376991180','☎',false]
    ]){
      const link=a('mrlee-dock-link',undefined,url,external);link.dataset.kind=kind;
      const symbol=newEl('span','mrlee-dock-icon',icon);symbol.setAttribute('aria-hidden','true');
      const text=newEl('span');text.dataset.mrleeTr=label;add(link,symbol,text);links.appendChild(link);
      link.addEventListener('click',()=>{dock.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')});
    }
    const toggle=newEl('button','mrlee-dock-toggle');toggle.id='mrleeContactToggle';toggle.type='button';toggle.setAttribute('aria-controls','mrleeContactLinks');toggle.setAttribute('aria-expanded','false');
    const bubble=document.createElementNS('http://www.w3.org/2000/svg','svg');bubble.setAttribute('viewBox','0 0 24 24');bubble.setAttribute('fill','none');bubble.setAttribute('stroke','currentColor');bubble.setAttribute('stroke-width','2');bubble.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M20 11.5a8 8 0 0 1-8 8 8.4 8.4 0 0 1-3-.55L4 20l1.1-4.9A8 8 0 1 1 20 11.5Z');bubble.appendChild(path);
    const label=newEl('span');label.dataset.mrleeTr='contactButton';add(toggle,bubble,label);
    toggle.addEventListener('click',()=>{const open=dock.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){dock.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')}});
    document.addEventListener('click',e=>{if(!dock.contains(e.target)){dock.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')}});
    add(dock,links,toggle);document.body.appendChild(dock);
  }
  function addAccountShortcuts(){
    const view=q('#account-view');if(!view||q('#mrleeAccountShortcuts'))return;
    const wrap=newEl('aside','mrlee-account-shortcuts');wrap.id='mrleeAccountShortcuts';
    const title=newEl('h3');title.dataset.mrleeTr='studentLinks';wrap.appendChild(title);
    const grid=newEl('div','mrlee-account-grid');
    const list=[['🎓','roadmap','lo-trinh-1-6.html'],['🎤','speaking','luyen-noi-tinh-diem.html'],['📚','history','lich-su-hoc-tap.html']];
    list.forEach(([icon,key,href])=>{const link=a('',undefined,href);const symbol=newEl('span','',icon);const text=newEl('strong');text.dataset.mrleeTr=key;add(link,symbol,text);grid.appendChild(link)});
    wrap.appendChild(grid);
    const accountList=q('.account-list',view);if(accountList)accountList.after(wrap);else view.append(wrap);
  }
  function init(){
    const root=document.documentElement;root.classList.add('mrlee-design');root.dataset.mrleePage=page();
    enhanceCards();insertQuickAccess();enhanceFooter();createDock();addAccountShortcuts();applyLabels();
    // Refresh new labels when homepage's 3-language menu changes html.lang.
    const observer=new MutationObserver(()=>{applyLabels()});
    observer.observe(root,{attributes:true,attributeFilter:['lang']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
