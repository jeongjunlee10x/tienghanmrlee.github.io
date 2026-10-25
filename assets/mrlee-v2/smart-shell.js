/* TIẾNG HÀN MR LEE V3 | compact image-first homepage and practical Admin shortcuts.
 * No data mutations, score writes, auth bypass, synthetic metrics, or logo replacement.
 */
(()=>{'use strict';
const d=document,root=d.documentElement;
const page=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
const photoRoot='assets/v306/images/';
const catalog=[
 {title:'Học tiếng Hàn',desc:'6 cấp độ · Học theo bài',href:'hoc-tieng-han.html',img:'feature-5-hoc-tieng-han.webp'},
 {title:'Giao tiếp',desc:'Hội thoại và phản xạ',href:'giao-tiep-theo-chu-de.html',img:'learning-cap-2.webp'},
 {title:'TOPIK',desc:'Luyện thi I · II',href:'kiem-tra-topik.html',img:'feature-6-thi-topik.webp'},
 {title:'Phỏng vấn',desc:'Tự tin trả lời',href:'giao-tiep-phong-van.html',img:'step-1-tu-van.webp'},
 {title:'Văn hóa Hàn Quốc',desc:'Đời sống và kỹ năng',href:'van-hoa-han-quoc.html',img:'culture.webp'},
 {title:'Bản đồ đại học',desc:'Tra cứu trường Hàn Quốc',href:'ban-do-dai-hoc-han-quoc.html',img:'feature-2-ban-do.webp'},
 {title:'Hồ sơ học viên',desc:'Xem hành trình học tập',href:'trung-tam-hoc-vien.html',img:'learning-roadmap.webp'}
];
const $=(tag,cls,text)=>{const el=d.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
// Short homepage no longer has the anchor targets shown in legacy top navigation.
// Restore original anchors as soon as user selects Fresh or opens the full page.
const reroutes={'#ranking':'bang-xep-hang.html','#schoolSearch':'ban-do-dai-hoc-han-quoc.html','#contactPanel':'dang-ky-tu-van.html'};
function smartNavLinks(){
 if(page!=='index.html')return;
 const compact=root.dataset.mrleeTheme==='future'&&root.dataset.mrleeSmartExpanded!=='true';
 d.querySelectorAll('.site-header a[href],#mobileNav a[href],a[data-mrlee-smart-original-href]').forEach(a=>{
  const original=a.dataset.mrleeSmartOriginalHref||a.getAttribute('href');
  if(!(original in reroutes))return;
  if(!a.dataset.mrleeSmartOriginalHref)a.dataset.mrleeSmartOriginalHref=original;
  a.setAttribute('href',compact?reroutes[original]:original);
 });
}
function homepage(){
 const main=d.querySelector('main#mainContent'),hero=main?.querySelector(':scope > .hero');
 if(!hero||main.querySelector('.mrlee-smart-home-hub'))return;
 const hub=$('section','mrlee-smart-home-hub');
 hub.id='mrleeSmartHub';
 hub.setAttribute('aria-label','Điều hướng nhanh toàn bộ website MR LEE');
 const head=$('div','mrlee-smart-hub-heading');
 head.append($('strong','','KHÁM PHÁ MR LEE'));
 head.append($('p','','7 chuyên mục học tập và định hướng · Mỗi mục đến đúng chức năng'));
 hub.append(head);
 const grid=$('nav','mrlee-smart-home-grid');grid.setAttribute('aria-label','Các chuyên mục chính MR LEE');
 for(const item of catalog){
  const a=$('a','mrlee-smart-home-card');a.href=item.href;
  const img=$('img');img.src=photoRoot+item.img;img.alt='';
  img.width=640;img.height=360;img.loading='lazy';img.decoding='async';
  a.append(img,$('strong','',item.title),$('small','',item.desc),$('span','mrlee-smart-arrow','›'));grid.append(a);
 }
 hub.append(grid);
 const actions=$('div','mrlee-smart-hub-extra');
 const routes=[
  ['WORKBOOK · Bài tập theo bài','mrlee-bai-tap-pro.html'],
  ['Kiểm tra đầu vào','kiem-tra-dau-vao.html'],
  ['Tư vấn du học','dang-ky-tu-van.html'],
  ['Bảng xếp hạng','bang-xep-hang.html']
 ];
 for(const [label,url] of routes){const a=$('a','',label);a.href=url;actions.append(a)}
 const toggle=$('button','','Xem toàn bộ nội dung ↓');toggle.type='button';
 toggle.setAttribute('aria-controls','mrleeFutureStart');
 toggle.setAttribute('aria-expanded','false');
 toggle.addEventListener('click',()=>{
  const expand=root.dataset.mrleeSmartExpanded!=='true';
  root.dataset.mrleeSmartExpanded=String(expand);
  toggle.textContent=expand?'Thu gọn về trang thông minh ↑':'Xem toàn bộ nội dung ↓';
  toggle.setAttribute('aria-expanded',String(expand));
  if(!expand)hub.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 });
 actions.append(toggle);hub.append(actions);
 hero.after(hub);
 root.dataset.mrleeSmartHome='true';
}
function fixAdminNav(){
 const menu=d.querySelector('#app .side-menu');if(!menu)return;
 for(const item of menu.querySelectorAll('button[data-nav]')){
  const b=item.querySelector('b');if(!b)continue;
  const icon={
   overview:'⌂',students:'♙',scores:'▤',activity:'◷',
   rewards:'★',settings:'⚙',placements:'✓', 'all-attempts':'▥',consultations:'✉'
  }[item.dataset.nav];
  if(icon)b.textContent=icon;
 }
}
function admin(){
 const overview=d.querySelector('#page-overview');if(!overview||overview.querySelector('.mrlee-smart-admin-hero'))return;
 const hero=$('section','mrlee-smart-admin-hero');
 hero.setAttribute('aria-label','Tiếng Hàn MR LEE - trung tâm quản trị');
 hero.append($('small','','MR LEE · SMART ADMIN'),
  $('h2','','Quản trị thông minh, dữ liệu rõ ràng'),
  $('p','','Học viên · Bài làm · Luyện tập · Kiểm tra đầu vào · Tư vấn'));
 const link=$('a','mrlee-smart-admin-link','Mở giao diện học viên ↗');link.href='index.html';link.target='_blank';link.rel='noopener';hero.append(link);
 const controls=$('nav','mrlee-smart-admin-actions');controls.setAttribute('aria-label','Thao tác Admin nhanh');
 const actions=[['＋ Thêm học viên','students','newStudent'],['▤ Xem bài làm','all-attempts'],['✉ Yêu cầu tư vấn','consultations'],['✓ Kiểm tra đầu vào','placements']];
 for(const [name,key,buttonId] of actions){
  const button=$('button','',name);button.type='button';
  button.addEventListener('click',()=>{
   const target=d.querySelector('#app .side-menu [data-nav="'+key+'"]')||
      d.querySelector('#app .side-menu [data-nav="'+(key==='all-attempts'?'scores':key==='placements'?'scores':'overview')+'"]');
   if(target){target.click();if(buttonId)requestAnimationFrame(()=>{const add=d.getElementById(buttonId);if(add&&!add.disabled)add.click()});}
  });
  controls.append(button);
 }
 const chart=overview.querySelector('.mrlee-admin-analytics');
 if(chart)chart.before(hero,controls);
 else overview.prepend(hero,controls);
 fixAdminNav();
}
function start(){
 if(page==='index.html'){homepage();smartNavLinks();new MutationObserver(smartNavLinks).observe(root,{attributes:true,attributeFilter:['data-mrlee-theme','data-mrlee-smart-expanded']})}
 if(page==='admin.html'){admin();fixAdminNav();
  const menu=d.querySelector('#app .side-menu');
  if(menu)new MutationObserver(fixAdminNav).observe(menu,{childList:true});
  }
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();