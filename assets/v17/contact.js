/* MRLEE_CONTACTS_V17_1. Links from config; always keeps user-provided fallback in HTML. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const CONTACT_DEFAULT={phone:'0376991180',fax:'0866761403',zaloPhone:'0376991180',zaloUrl:'https://zalo.me/0376991180',messengerUrl:'https://m.me/821366751066220',kakaoId:'ycleeee'};
const toast=$('mrContactToast');let toastTimer;
function showToast(t){if(!toast)return;toast.textContent=t;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true;},4500);}
function digits(s){return String(s||'').replace(/\D/g,'');}
function safeLink(value,type){try{const u=new URL(String(value||''));if(u.protocol!=='https:')return '';const hosts=type==='zalo'?['zalo.me','oa.zalo.me']:['m.me','www.m.me','facebook.com','www.facebook.com','messenger.com'];return hosts.includes(u.hostname.toLowerCase())?u.href:'';}catch{return '';}}
async function copyText(value,message){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);}else{const tmp=document.createElement('textarea');tmp.value=value;tmp.style.position='fixed';tmp.style.opacity='0';document.body.appendChild(tmp);tmp.select();const ok=document.execCommand('copy');tmp.remove();if(!ok)throw Error('copy');}showToast(message);}catch{showToast('Mã KakaoTalk: '+value+' — hãy sao chép thủ công.');}}
function apply(c){
 const phone=digits(c.phone)||CONTACT_DEFAULT.phone, fax=digits(c.fax)||CONTACT_DEFAULT.fax, kakao=String(c.kakaoId||CONTACT_DEFAULT.kakaoId).trim(),zalo=safeLink(c.zaloUrl,'zalo')||`https://zalo.me/${digits(c.zaloPhone)||phone}`;
 const messenger=safeLink(c.messengerUrl,'meta')||CONTACT_DEFAULT.messengerUrl;
 $('mrCallQuick').href='tel:+84'+(phone.startsWith('0')?phone.substring(1):phone);$('mrCallQuick').title='Gọi '+phone;
 $('mrZaloQuick').href=zalo;$('mrZaloQuick').title='Zalo '+(digits(c.zaloPhone)||phone);
 $('mrMessengerQuick').href=messenger;
 const kbtn=$('mrKakaoQuick');kbtn.title='Sao chép KakaoTalk ID '+kakao;kbtn.setAttribute('aria-label','Sao chép KakaoTalk ID '+kakao);kbtn.onclick=()=>copyText(kakao,'Đã sao chép KakaoTalk ID: '+kakao+'. Mở KakaoTalk, tìm bằng ID này.');
 const contactDialog=$('contactDialog');
 if(contactDialog){let facts=$('mrContactFacts');if(!facts){facts=document.createElement('div');facts.id='mrContactFacts';facts.className='mr-contact-facts';const channels=contactDialog.querySelector('.contact-channels');channels?.insertAdjacentElement('beforebegin',facts);}facts.replaceChildren();
 const add=(label,value,href)=>{const block=document.createElement('div'),head=document.createElement('b');head.textContent=label;block.appendChild(head);if(href){const a=document.createElement('a');a.href=href;a.textContent=value;block.appendChild(a);}else{const span=document.createElement('span');span.textContent=value;block.appendChild(span);}facts.appendChild(block);};
 add('Hotline',phone,'tel:+84'+(phone.startsWith('0')?phone.substring(1):phone));add('Fax',fax);add('Zalo',digits(c.zaloPhone)||phone,zalo);add('KakaoTalk ID',kakao);
 const meta=contactDialog.querySelector('#linkMessenger'),z=contactDialog.querySelector('#linkZalo');if(meta){meta.href=messenger;meta.hidden=false;}if(z){z.href=zalo;z.hidden=false;}const no=contactDialog.querySelector('#noContacts');if(no)no.hidden=true;
 const btn=document.createElement('button');btn.type='button';btn.className='mr-copy-inline';btn.textContent='Sao chép Kakao ID';btn.onclick=()=>copyText(kakao,'Đã sao chép KakaoTalk ID: '+kakao);facts.lastElementChild?.appendChild(btn);
 }
}
fetch('assets/mrlee-contact.json',{cache:'no-store'}).then(r=>r.ok?r.json():CONTACT_DEFAULT).then(c=>apply({...CONTACT_DEFAULT,...c})).catch(()=>apply(CONTACT_DEFAULT));
})();
