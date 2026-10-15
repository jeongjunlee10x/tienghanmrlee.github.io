/* Listening Plus 2026: shared playback controls & browser-based Korean pronunciation.
 * Speech synthesis is PRACTICE ONLY. It never counts as playing official MP3 exam audio.
 */
(()=>{'use strict';if(window.MRLEE_AUDIO_PLUS)return;
 let rate=1,speaking=false;
 try{const v=Number(localStorage.getItem('mrlee-audio-rate'));if([.5,.7,.75,.85,1,1.15,1.25,1.5].includes(v))rate=v}catch{}
 const mk=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n};
 function speak(raw){const text=String(raw||'').replace(/\s+/g,' ').trim().slice(0,600);if(!text||!window.speechSynthesis||!window.SpeechSynthesisUtterance){alert('Trình duyệt không hỗ trợ đọc giọng Hàn. Hãy dùng Chrome hoặc Edge.');return false}
  speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(text);utter.lang='ko-KR';utter.rate=rate;utter.pitch=1;
  const voices=speechSynthesis.getVoices(),korean=voices.find(v=>v.lang?.toLowerCase()==='ko-kr')||voices.find(v=>v.lang?.startsWith('ko'));if(korean)utter.voice=korean;
  utter.onerror=()=>{speaking=false};utter.onend=()=>{speaking=false};speaking=true;speechSynthesis.speak(utter);return true}
 function stop(){try{speechSynthesis.cancel()}catch{}speaking=false}
 window.MRLEE_AUDIO_PLUS={speak,stop,getRate:()=>rate};
 function enhanceAudio(root=document){const audios=root.querySelectorAll?root.querySelectorAll('audio[controls]'):[];
  for(const audio of audios){if(audio.dataset.mlAudioUpgraded)continue;audio.dataset.mlAudioUpgraded='1';if(!audio.hasAttribute('preload'))audio.preload='none';audio.setAttribute('playsinline','');
   const host=mk('div','ml-audio-bar');host.setAttribute('aria-label','Tùy chọn nghe');const l=mk('label','','Tốc độ '),s=mk('select');s.setAttribute('aria-label','Tốc độ phát MP3');
   for(const [value,label] of [['.5','0,5×'],['.7','0,7×'],['.75','0,75×'],['.85','0,85×'],['1','1×'],['1.15','1,15×'],['1.25','1,25×'],['1.5','1,5×']]){const opt=mk('option','',label);opt.value=value;if(Number(value)===rate)opt.selected=true;s.append(opt)}
   s.addEventListener('change',()=>{rate=Number(s.value);try{localStorage.setItem('mrlee-audio-rate',String(rate))}catch{}audio.playbackRate=rate});l.append(s);
   const replay=mk('button','','↻ Phát lại');replay.type='button';replay.addEventListener('click',()=>{audio.currentTime=0;audio.playbackRate=rate;audio.play().catch(()=>{message.textContent='Không thể phát MP3 này; kiểm tra tên tệp và máy chủ.'})});
   const message=mk('span','ml-audio-message');message.setAttribute('role','status');message.setAttribute('aria-live','polite');audio.addEventListener('error',()=>{message.textContent='Không tải được MP3. Nếu dùng ZIP mã nguồn, giữ nguyên thư mục topik-audio trên website.'});audio.addEventListener('play',()=>{audio.playbackRate=rate;document.querySelectorAll('audio').forEach(a=>{if(a!==audio&&!a.paused)a.pause()})});
   const toggle=mk('button','','▶ Phát / Tạm dừng');
   toggle.type='button';toggle.addEventListener('click',()=>{if(audio.paused){audio.playbackRate=rate;audio.play().catch(()=>message.textContent='Không phát được MP3.')}else audio.pause()});
   const back=mk('button','','−5 giây');back.type='button';back.addEventListener('click',()=>{try{audio.currentTime=Math.max(0,audio.currentTime-5)}catch{}});
   const next=mk('button','','+5 giây');next.type='button';next.addEventListener('click',()=>{try{audio.currentTime=Math.min(Number.isFinite(audio.duration)?audio.duration:Infinity,audio.currentTime+5)}catch{}});
   host.append(l,toggle,back,next,replay,message);audio.insertAdjacentElement('afterend',host)
  }
 }
 function enhanceKorean(root=document){if(!root.querySelectorAll)return;let count=0;
  for(const n of root.querySelectorAll('[lang="ko"]')){if(++count>240)break;
    if(n.dataset.mlSpeakUpgraded||!['P','TD','H2','H3','SPAN','DIV'].includes(n.tagName)||n.querySelector('button,audio,input,textarea')||n.closest('.question,.exam,.tv-question,.quiz-form,.options,.ml-ai-result,.mrlee-word-actions,.mrlee-voice-modal,[data-no-tts]'))continue;
    const val=(n.textContent||'').replace(/\s+/g,' ').trim();if(val.length<2||val.length>230||!/[\uac00-\ud7af]/.test(val))continue;
    // Existing page-specific audio/practice controls take priority.
    if(n.nextElementSibling?.matches('.mrlee-word-actions,.mini-actions,.mrlee-interview-mic'))continue;
    n.dataset.mlSpeakUpgraded='1';const btn=mk('button','ml-speak-btn','🔊');btn.type='button';btn.title='Nghe giọng tiếng Hàn';btn.setAttribute('aria-label','Nghe phát âm tiếng Hàn');btn.addEventListener('click',()=>speak(val));if(n.tagName==='TD')n.append(' ',btn);else n.insertAdjacentElement('afterend',btn)
  }
 }
 let queued=false;function queue(){if(queued)return;queued=true;setTimeout(()=>{queued=false;enhanceAudio();enhanceKorean()},200)}
 function start(){enhanceAudio();enhanceKorean();const onPage=location.pathname.split('/').pop()||'index.html';if(!/^(?:ai-tro-ly|admin|dang-nhap|kiem-tra|thi-|topik-|de-thi-)/.test(onPage)){const link=mk('a','ml-ai-float','✦ Tra cứu bài học');link.href='ai-tro-ly.html';link.setAttribute('aria-label','Mở trợ lý tra cứu bài học và hỏi tiếng Hàn');document.body.append(link)}if(document.body){const observer=new MutationObserver(m=>{if(m.some(x=>x.addedNodes.length))queue()});observer.observe(document.body,{childList:true,subtree:true})}
 window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden&&speaking)stop()})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
