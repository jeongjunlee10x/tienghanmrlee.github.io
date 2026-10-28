/* MR LEE · single consistent floating contact dock (public marketing only).
 * Never replaces logos, student data, or authentication. Works on both themes.
 */
(()=>{'use strict';
if(location.pathname.toLowerCase().endsWith('/admin.html'))return; // Admin has its own uncluttered UI.
const doc=document;
function node(tag,cls,text){const el=doc.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
function boot(){
 if(doc.getElementById('mrleeContactDock'))return;
 const root=node('aside');root.id='mrleeContactDock';root.setAttribute('aria-label','Liên hệ nhanh MR LEE');root.dataset.open='false';
 const links=node('div','mrlee-contact-links');links.id='mrleeContactLinks';
 const config=[
  ['call','☎','Gọi 0376991180','tel:+84376991180'],
  ['zalo','Z','Zalo MR LEE','https://zalo.me/0376991180'],
  ['messenger','M','Messenger MR LEE (kiểm tra đúng Fanpage)','https://m.me/MRLEEKR10'],
  ['tiktok','♪','TikTok MR LEE · @hankuc_chemi','https://www.tiktok.com/@hankuc_chemi'],
  ['email','@','Email MR LEE','mailto:tienghanmrlee@gmail.com']
 ];
 for(const [kind,icon,label,url] of config){
  const a=node('a','mrlee-contact-link',icon);a.href=url;a.dataset.channel=kind;a.setAttribute('aria-label',label);a.title=label;
  if(/^https:/.test(url)){a.target='_blank';a.rel='noopener noreferrer'}
  a.append(node('span','mrlee-contact-label',label));links.append(a);
 }
 const status=node('div','mrlee-contact-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const kakao=node('button','mrlee-contact-link','K');kakao.type='button';kakao.dataset.channel='kakao';kakao.title='Sao chép KakaoTalk: ycleeee';kakao.setAttribute('aria-label',kakao.title);
 kakao.append(node('span','mrlee-contact-label','KakaoTalk: ycleeee'));
 kakao.addEventListener('click',async()=>{
  try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText('ycleeee');status.textContent='Đã sao chép ID KakaoTalk: ycleeee'}
  catch{status.textContent='ID KakaoTalk: ycleeee (hãy sao chép thủ công)'}
 });links.append(kakao);
 const toggle=node('button','mrlee-contact-toggle','☏  Liên hệ');toggle.type='button';toggle.setAttribute('aria-controls',links.id);toggle.setAttribute('aria-expanded','false');
 toggle.addEventListener('click',()=>{const open=root.dataset.open!=='true';root.dataset.open=String(open);toggle.setAttribute('aria-expanded',String(open));if(open)links.querySelector('a')?.focus()});
 root.append(status,links,toggle);doc.body.append(root);
 doc.body.classList.add('mrlee-contact-ready'); // Legacy homepage rail remains if script fails.
 doc.querySelectorAll('a[href="#contactPanel"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();root.dataset.open='true';toggle.setAttribute('aria-expanded','true');links.querySelector('a')?.focus()}));
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.dataset.open==='true'){root.dataset.open='false';toggle.setAttribute('aria-expanded','false');toggle.focus()}});
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
