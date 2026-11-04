/* MR LEE: approved speaking-page topic showcase. Enhances V4 launcher only.
   Leaves all native topic buttons, lesson content, auth and scoring intact. */
(()=>{'use strict';
 const page=decodeURIComponent(location.pathname.split('/').pop()||'');
 if(page!=='giao-tiep-theo-chu-de.html')return;
 const d=document,html=d.documentElement;
 const photos=[
  'assets/mrlee-ai/v3/03_giao_tiep/hero-fresh.webp',
  'assets/v306/images/step-1-tu-van.webp',
  'assets/v306/images/learning-listening.webp',
  'assets/mrlee-ai/v3/05_phong_van/hero-fresh.webp',
  'assets/v306/images/feature-6-thi-topik.webp'
 ];
 function swapWhenReady(img,url){
  if(!img)return;
  const check=new Image();check.decoding='async';
  check.onload=()=>{if(img.isConnected&&check.naturalWidth>=500&&check.naturalHeight>=250){img.src=url;img.dataset.mrleeSpeakingPhoto='ready';}};
  check.src=url;
 }
 function el(tag,cls,txt){const n=d.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
 function selectGreeting(){
  const menu=d.getElementById('topicMenu');if(!menu)return;
  const buttons=Array.from(menu.querySelectorAll('button'));
  const greeting=buttons.find(btn=>/Chào hỏi/.test(btn.textContent||''));
  if(greeting)greeting.click();
 }
 function enhance(){
  const root=d.querySelector('main > .mrlee-v4-root[data-section="speaking"]');
  if(!root||root.dataset.speakingReady==='true')return;
  const dir=root.querySelector(':scope > .mrlee-v4-directory');
  const grid=dir?.querySelector('.mrlee-v4-directory-grid');
  const tools=root.querySelector(':scope > .mrlee-v4-tools');
  const card=grid?.querySelector('.mrlee-v4-card');
  const live=root.querySelector(':scope > .mrlee-v4-live-intro');
  if(!dir||!tools||!card||!live)return;
  const originalTitle=dir.querySelector('.mrlee-v4-section-title');
  const panel=el('section','mrlee-speaking-panel');
  panel.setAttribute('aria-label','Luyện giao tiếp theo chủ đề');
  const head=el('div','mrlee-speaking-head');
  const left=el('div','mrlee-speaking-head-main');
  const mark=el('span','mrlee-speaking-mark','💬');mark.setAttribute('aria-hidden','true');
  const summary=el('div','mrlee-speaking-head-copy');
  const title=el('h2','',originalTitle?.querySelector('h2')?.textContent||'Luyện giao tiếp theo chủ đề');
  summary.append(title,el('p','','Luyện hội thoại thực tế theo từng chủ đề trong học tập, công việc và đời sống.'));
  left.append(mark,summary);
  head.append(left,el('span','mrlee-speaking-head-hint','✦ Chọn chủ đề để bắt đầu học'));
  const board=el('div','mrlee-speaking-board');
  const toolPanel=el('section','mrlee-speaking-tools-wrap');
  toolPanel.setAttribute('aria-label','Các dạng luyện tập khác');
  toolPanel.append(el('h3','mrlee-speaking-tools-title','Các dạng luyện tập khác'));
  originalTitle?.remove();
  dir.classList.add('mrlee-speaking-feature');
  dir.before(panel);
  board.append(dir,toolPanel);
  panel.append(head,board);
  toolPanel.append(tools);
  const caption=card.querySelector('.mrlee-v4-card-caption');
  if(caption)caption.textContent='Luyện cách chào hỏi, làm quen và giới thiệu bản thân bằng tiếng Hàn.';
  card.querySelector('.mrlee-v4-card-copy')?.append(el('span','mrlee-speaking-start','Bắt đầu học  →'));
  card.addEventListener('click',()=>{requestAnimationFrame(()=>{selectGreeting();});});
  swapWhenReady(card.querySelector('img'),photos[0]);
  const labels=[
   ['💬','Tham khảo các đoạn hội thoại thực tế, dễ áp dụng.'],
   ['🎧','Nghe hiểu và luyện phản xạ qua các đoạn hội thoại.'],
   ['🎤','Luyện trả lời phỏng vấn du học và công việc.'],
   ['📘','Luyện các kỹ năng cần thiết cho kỳ thi TOPIK.']
  ];
  Array.from(tools.querySelectorAll('.mrlee-v4-tool')).forEach((a,i)=>{
   const name=a.querySelector('span:not(.mrlee-v4-tool-arrow)');
   const arrow=a.querySelector('.mrlee-v4-tool-arrow');
   const photo=a.querySelector('img');
   if(!name||!arrow)return;
   const wrap=el('div','mrlee-speaking-tool-copy');
   const icon=el('span','mrlee-speaking-tool-icon',labels[i]?.[0]||'💬');
   icon.setAttribute('aria-hidden','true');
   name.classList.add('mrlee-speaking-tool-name');
   wrap.append(icon,name,el('span','mrlee-speaking-tool-desc',labels[i]?.[1]||'Mở nội dung luyện tập.'));
   a.insertBefore(wrap,arrow);
   swapWhenReady(photo,photos[i+1]||photos[0]);
  });
  root.dataset.speakingReady='true';
  html.dataset.mrleeSpeakingShowcase='ready';
 }
 if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
