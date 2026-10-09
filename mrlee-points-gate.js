/** Add student points banner, speaking links, and a client-side practice gate.
 * This is a learning UX gate, not a server-side authorization boundary.
 * Do NOT use it to guard paid/secret content on public GitHub Pages.
 */
import { waitForUser, loadWallet, SETTINGS } from './mrlee-points-core.js';
import { SPEAKING_BANK } from './mrlee-speaking-bank.js';
const page=location.pathname.split('/').pop();
if(['so-cap-1.html','so-cap-2.html','giao-tiep-theo-chu-de.html'].includes(page)) {
  const root=document.querySelector('main')||document.body;
  const banner=document.createElement('aside');banner.className='mp-gate';banner.id='mpPointsBar';banner.setAttribute('aria-live','polite');
  const info=document.createElement('div');info.textContent='🎤 Luyện nói theo bài – đang kiểm tra điểm…';
  const action=document.createElement('a');action.href='luyen-noi-tinh-diem.html';action.textContent='🎤 Luyện nói & tích điểm →';
  banner.append(info,action);root.prepend(banner);
  if(page.startsWith('so-cap')){
    const level=page==='so-cap-1.html'?'sc1':'sc2';
    document.querySelectorAll('article.lesson[id^="bai-"]').forEach(article=>{
      const number=Number(article.id.replace('bai-',''));
      if(number>=1&&number<=15){
        const link=document.createElement('a');link.className='mp-lesson-speech';link.href=`luyen-noi-tinh-diem.html?task=${level}-${String(number).padStart(2,'0')}`;
        link.textContent=`🎤 Bài luyện nói số ${number} · Tính điểm`;
        const header=article.querySelector('h2,h3');
        if(header)header.insertAdjacentElement('afterend',link);else article.prepend(link);
      }
    });
  }
  if(page==='giao-tiep-theo-chu-de.html'){
    const title=document.getElementById('mainTitle');
    const pick=document.createElement('a');pick.className='mp-lesson-speech';pick.id='mpSelectedSpeaking';pick.href='luyen-noi-tinh-diem.html?tab=topic';pick.textContent='🎤 Luyện nói chủ đề này · Tính điểm';
    const location=title?.parentElement || root;
    location.append(pick);
    const topicTasks=SPEAKING_BANK.filter(t=>t.kind==='topic');
    const update=()=>{
      const menu=document.getElementById('topicMenu');
      if(!menu)return;
      const buttons=[...menu.querySelectorAll('button.topic-btn')];
      const idx=buttons.findIndex(x=>x.classList.contains('active'))-1;
      const task=topicTasks[idx];
      pick.href=task ? `luyen-noi-tinh-diem.html?task=${encodeURIComponent(task.id)}`:'luyen-noi-tinh-diem.html?tab=topic';
      pick.textContent=task?`🎤 Luyện nói: ${task.title} · Tính điểm`:'🎤 Chọn chủ đề để luyện nói · Tính điểm';
    };
    document.getElementById('topicMenu')?.addEventListener('click',()=>setTimeout(update,0));
    setTimeout(update,100);
  }
  waitForUser().then(async user=>{
    const wallet=await loadWallet(user);
    const badge=document.createElement('span');badge.className='mp-gate-badge';badge.textContent=`⭐ ${wallet.balance}/${SETTINGS.maximum} điểm`;
    info.replaceChildren(badge,document.createTextNode(wallet.balance<SETTINGS.minimum ? `  🔒 Dưới ${SETTINGS.minimum} điểm – bài mới tạm khóa. Phục hồi để tiếp tục.`:'  ✅ Có thể học và nhận điểm khi luyện nói.'));
    if(wallet.balance<SETTINGS.minimum){
      document.body.classList.add('mp-study-locked');
      action.href='luyen-noi-tinh-diem.html?tab=recovery';action.textContent='🔓 Luyện phục hồi điểm →';
      // Hide only course/conversation content. No user data is deleted.
    }
  }).catch(err=>{
    info.textContent='Không xác minh được số điểm: '+(err?.message||'vui lòng thử lại')+'. Bài học vẫn có thể xem; phần thưởng cần đăng nhập và Firebase Rules.';
  });
}
