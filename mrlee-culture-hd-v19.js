/* TIẾNG HÀN MR LEE · V19 · one authoritative, local-HD Culture image engine.
 * 22 topics / 110 packaged illustrations; 5 themed images per lesson.
 * Education content, official-video source, authentication and scores untouched.
 * Old V171/V172/V1721 competing handlers are removed from HTML.
 * These are AI-created illustrations, NOT documentary photos or emergency guidance.
 */
(()=>{'use strict';
const MEDIA=window.MRLEE_CULTURE_V17_MEDIA||{};
const TOPICS=Object.keys(MEDIA);
if(TOPICS.length!==22){console.error('[MR LEE CULTURE V19] Expected 22 topics, got',TOPICS.length);return;}
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const DIR='images/culture-v18-hd/';
const FALLBACK='images/culture-v13/';
const ID=new URLSearchParams(location.search).get('chu-de')||TOPICS[0];
const safe=id=>TOPICS.includes(id)?id:null;
const asset=(id,index)=>DIR+encodeURIComponent(id)+'/'+String(index).padStart(2,'0')+'.webp?v=19.1';
const backup=id=>FALLBACK+encodeURIComponent(id)+'.svg?v=19.1';
const write=(parent,tag,klass,content)=>{const el=document.createElement(tag);if(klass)el.className=klass;if(content!==undefined)el.textContent=content;parent.append(el);return el};
const safety=new Set(['so-cap-cuu','goi-cuu-ho','hoa-hoan','benh-vien','an-toan-giao-thong']);
function load(img,id,k){
 if(!img||!safe(id))return;
 const url=asset(id,k),alt='Ảnh AI minh họa '+k+'/5 — '+MEDIA[id].title;
 img.onerror=null;img.hidden=false;img.removeAttribute('style');
 img.loading=k===1?'eager':'lazy';img.decoding='async';
 img.alt=alt;img.dataset.mrleeCultureHd='19';
 const fail=()=>{img.removeEventListener('error',fail);img.src=backup(id);img.alt='Đồ họa dự phòng — '+MEDIA[id].title;img.classList.add('mrleeCultureVector')};
 img.addEventListener('error',fail,{once:true});
 if(img.getAttribute('src')!==url)img.src=url;
}
function covers(){
 const grid=$('#topics');if(!grid)return;
 $$('#topics a.topic').forEach(card=>{
  let id=null;try{id=new URL(card.href,location.href).searchParams.get('chu-de')}catch{}
  if(!safe(id))return;
  const img=$('img',card);if(!img)return;
  if(img.dataset.mrleeCultureHd==='19'&&img.getAttribute('src')===asset(id,1))return;
  load(img,id,1);
  const old=$('.mr172AiTag',card);
  if(old)old.textContent='Minh họa AI · HD';
  else if(!$('.mrleeCultureTag',card))write($('.topicText',card)||card,'span','mrleeCultureTag','Minh họa AI · HD');
 });
}
function hub(){
 const grid=$('#topics');if(!grid)return;
 covers();
 const panel=$('#topicSection .sectionHeading');
 if(panel){
  const h=$('h2',panel),p=$('p',panel);
  if(h)h.textContent='22 chủ đề · Hình minh họa rõ nét và hướng dẫn thực tế';
  if(p)p.textContent='Mỗi chủ đề có 5 ảnh minh họa AI độc lập, chú thích dễ đọc và nội dung kỹ năng sống. Đây không phải ảnh chụp thực tế.';
 }
 const header=$('.heroVisual');
 if(header){
  const keys=['le-hoi','am-thuc','tau-dien-ngam','so-cap-cuu'];
  $$('img',header).slice(0,4).forEach((img,i)=>load(img,keys[i],1));
 }
 let queued=false;
 new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;covers()})})
  .observe(grid,{childList:true,subtree:false});
}
function view(src,alt){
 const before=document.activeElement;
 const overlay=document.createElement('div');overlay.className='mrleeCultureViewer';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Xem ảnh minh họa kích thước lớn');
 const button=write(overlay,'button','mrleeCultureViewerClose','✕ Đóng ảnh');button.type='button';
 const img=write(overlay,'img','');img.src=src;img.alt=alt;img.decoding='async';
 write(overlay,'p','',alt+' · Hình AI minh họa, không phải ảnh tư liệu');
 function close(){document.removeEventListener('keydown',key);overlay.remove();document.body.classList.remove('mrleeCultureOpen');before?.focus?.()}
 function key(e){if(e.key==='Escape')close();if(e.key==='Tab'){e.preventDefault();button.focus()}}
 button.addEventListener('click',close);overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 document.addEventListener('keydown',key);document.body.append(overlay);document.body.classList.add('mrleeCultureOpen');button.focus();
}
function lesson(){
 const parent=$('#lessonContent'),t=MEDIA[ID];if(!parent||!t)return;
 for(const id of ['cultureImagesV16','cultureImagesV17','cultureImagesV172','mrleeAiPhotos','realPhotos'])document.getElementById(id)?.remove();
 const legacy=$('#image');if(legacy)legacy.hidden=true;
 let section=$('#cultureImagesV19');
 if(!section){
  section=document.createElement('section');section.id='cultureImagesV19';section.className='lessonBlock mrleeCulture19';
  write(section,'h2','','II. Bộ ảnh minh họa chất lượng cao');
  write(section,'p','mrleeCultureLead','5 ảnh AI được lưu ngay trong website, mỗi ảnh ứng với một góc nhìn về chủ đề. Không dùng thay ảnh tư liệu hoặc quy trình cứu hộ chính thức.');
  const gallery=write(section,'div','mrleeCultureGrid');
  for(let i=1;i<=5;i++){
   const fig=write(gallery,'figure','mrleeCultureFigure');
   const image=write(fig,'img','mrleeCultureFull');
   load(image,ID,i);image.loading=i===1?'eager':'lazy';
   image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label','Xem lớn ảnh minh họa '+i+' của '+t.title);
   const show=()=>view(image.currentSrc||image.src,image.alt);
   image.addEventListener('click',show);image.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}});
   const cap=write(fig,'figcaption','');
   write(cap,'b','','Ảnh minh họa '+String(i).padStart(2,'0')+' / 05');
   write(cap,'span','',t.title);if(t.ko)write(cap,'small','',t.ko);
  }
  const caution=safety.has(ID)?
   'Chú ý: AI có thể minh họa sai tư thế hoặc thiết bị an toàn. Hãy dựa vào hướng dẫn cơ quan chức năng; gọi 119/112 khi cần.':
   'Hình do AI tạo, nhằm hỗ trợ học tập; không xác nhận địa điểm, sự kiện hoặc tập quán của mọi gia đình Hàn Quốc.';
  write(section,'p','mrleeCultureNotice',caution);
  const anchor=$('#read')||$('#how')||parent.firstElementChild;
  if(anchor)anchor.insertAdjacentElement('beforebegin',section);else parent.append(section);
 }
 const hero=$('#topicHero img');if(hero)load(hero,ID,2);
 for(const a of $$('.sidePanel a[href="#image"],.sidePanel a[href="#cultureImagesV16"],.sidePanel a[href="#cultureImagesV17"],.sidePanel a[href="#cultureImagesV172"]')){
  a.href='#cultureImagesV19';a.textContent='5 ảnh minh họa HD';
 }
}
function start(){hub();lesson();console.info('[MR LEE Culture V19] Ready: 22 topics / 110 packaged HD WebP, single image controller')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();