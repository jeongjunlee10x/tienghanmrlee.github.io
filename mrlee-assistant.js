// Searches the shipped lesson source modules. Online AI is optional.
import { SC_LESSONS } from './mrlee-sc-lesson-data.js';
import { ADVANCED_LESSONS } from './mrlee-advanced-lesson-data.js';
const $=id=>document.getElementById(id);
const form=$('aiForm'),input=$('aiQuery'),mode=$('aiMode'),status=$('aiStatus'),results=$('aiResults'),online=$('aiOnline'),submit=$('aiSubmit');
let data=[];
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[?！!,.:;()\[\]"']/g,' ').replace(/\s+/g,' ').trim();
const tokens=s=>normalize(s).split(' ').filter(t=>t.length>1).slice(0,14);
const safeLocalUrl=u=>typeof u==='string'&&/^[\w-]+\.html(?:[?#][\w=&#.\-]*)?$/.test(u)?u:'hoc-tieng-han.html';
function search(q){const phrase=normalize(q),ts=tokens(q);return data.map((rec,i)=>{
 const ko=normalize(rec.ko),vi=normalize(rec.vi),title=normalize(rec.title),detail=normalize(rec.detail);
 let score=0;if(ko===phrase||vi===phrase)score+=70;
 if(ko.includes(phrase)&&phrase.length>=2)score+=40;
 if(vi.includes(phrase)&&phrase.length>=3)score+=35;
 if(title.includes(phrase)&&phrase.length>=3)score+=20;
 for(const t of ts){if(ko.includes(t))score+=12;if(vi.includes(t))score+=9;if(title.includes(t))score+=6;if(detail.includes(t))score+=2}
 return {rec,i,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.i-b.i).slice(0,15)}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function render(items){results.replaceChildren();if(!items.length){results.append(el('p','ml-ai-empty','Không tìm thấy bài phù hợp. Hãy thử từ khóa ngắn hơn hoặc nhập trực tiếp tiếng Hàn.'));return}
 for(const {rec} of items){const card=el('article','ml-ai-result'),type=el('span','ml-ai-type',rec.type),h=el('h3');const link=el('a','',rec.title||'Mở bài học');link.href=safeLocalUrl(rec.url);h.append(link);card.append(type,h);
 if(rec.ko){const p=el('p','ml-ai-ko',rec.ko);p.lang='ko';card.append(p)}
 if(rec.vi)card.append(el('p','ml-ai-vi',rec.vi));if(rec.detail)card.append(el('p','ml-ai-detail',rec.detail));
 const foot=el('footer');const source=el('a','','Xem bài gốc ↗');source.href=safeLocalUrl(rec.url);foot.append(source);
 if(rec.ko&&/[\uac00-\ud7af]/.test(rec.ko)){const b=el('button','','🔊 Nghe');b.type='button';b.addEventListener('click',()=>window.MRLEE_AUDIO_PLUS?.speak(rec.ko));foot.append(b)}
 card.append(foot);results.append(card)}}
function apiUrl(){const configured=typeof window.MRLEE_AI_API_URL==='string'?window.MRLEE_AI_API_URL.trim():'';if(configured){try{const url=new URL(configured,location.href);return url.protocol==='https:'||url.origin===location.origin?url.href:''}catch{return ''}}
 return location.hostname.endsWith('pages.dev')?new URL('/api/mrlee-ai',location.origin).href:''}
async function answerOnline(question,found){const url=apiUrl();if(!url){const r=found[0]?.rec;
 if(r){online.textContent=[
 'GỢI Ý TỪ GIÁO TRÌNH (không phải AI tạo sinh):',
 r.title?'Chủ đề: '+r.title:'',
 r.ko?'Tiếng Hàn: '+r.ko:'',
 r.vi?'Nghĩa: '+r.vi:'',
 r.detail?'Ghi chú: '+r.detail:'',
 'Nguồn: '+safeLocalUrl(r.url),
 'AI trực tuyến chưa kết nối.'
 ].filter(Boolean).join('\n')}
 else online.textContent='Chưa tìm thấy câu trả lời trong giáo trình. Hãy thử từ khóa khác. AI trực tuyến chưa kết nối.';return}
 let token;try{const [{initializeApp,getApps},{getAuth},{firebaseConfig,isFirebaseConfigured}]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),import('./firebase-config.js')]);if(!isFirebaseConfigured){online.textContent='Chưa cấu hình Firebase.';return}const app=getApps()[0]||initializeApp(firebaseConfig);const user=getAuth(app).currentUser;if(!user||!user.emailVerified){online.textContent='Muốn dùng AI trực tuyến, hãy đăng nhập và xác minh email. Tra cứu giáo trình vẫn dùng được.';return}token=await user.getIdToken()}catch{online.textContent='Chưa thể xác minh tài khoản. Hãy đăng nhập lại.';return}
 try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);let res;
 try{res=await fetch(url,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${token}`},body:JSON.stringify({question,mode:mode.value,context:found.slice(0,5).map(x=>x.rec).map(r=>({ko:r.ko,vi:r.vi,detail:r.detail,title:r.title,url:r.url}))}),signal:controller.signal,cache:'no-store'})}finally{clearTimeout(timeout)}
 const body=await res.json().catch(()=>({}));if(!res.ok)throw Error(body?.message||body?.error||`Máy chủ trả mã ${res.status}`);
 online.textContent=(body.answer||'Không có câu trả lời.')+'\n\n— Trợ lý AI trực tuyến · hãy đối chiếu giáo trình trước khi áp dụng.';
 }catch(err){online.textContent='AI trực tuyến chưa phản hồi: '+String(err?.message||'Kết nối lỗi').slice(0,190)+'\nDữ liệu tra cứu giáo trình vẫn hiển thị bên dưới.'}}
form.addEventListener('submit',async e=>{e.preventDefault();const query=input.value.trim();if(query.length<2){status.textContent='Hãy nhập ít nhất 2 ký tự.';input.focus();return}if(!data.length){status.textContent='Kho tri thức chưa tải được; hãy mở trang qua một máy chủ web.';return}
 submit.disabled=true;online.replaceChildren();try{const items=search(query);render(items);status.textContent=`Đã tìm được ${items.length} kết quả phù hợp nhất từ ${data.length.toLocaleString('vi-VN')} mục giáo trình.`;
 if(mode.value!=='search')await answerOnline(query,items);
 }finally{submit.disabled=false}});
document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.example;input.focus();form.requestSubmit()}));
// Build the index from the exact same 90 lesson modules as the learning pages.
function buildLessonIndex(){
 const content=[];
 for(const lesson of [...SC_LESSONS,...ADVANCED_LESSONS]){
  const cap=Number(lesson.cap),bai=Number(lesson.bai);
  if(!Number.isInteger(cap)||cap<1||cap>6||!Number.isInteger(bai)||bai<1||bai>15)continue;
  const url='hoc-theo-bai.html?cap='+cap+'&bai='+bai;
  const label='Cấp '+cap+' · Bài '+bai+' · '+String(lesson.title||'');
  content.push({type:'Bài học',title:label,detail:'Từ vựng và ngữ pháp theo bài',url});
  for(const row of Array.isArray(lesson.vocab)?lesson.vocab:[]){
   const ko=String(Array.isArray(row)?row[0]||'':'').trim();
   const vi=String(Array.isArray(row)?row[1]||'':'').trim();
   if(ko&&vi)content.push({type:'Từ vựng',title:label,ko,vi,url});
  }
  for(const g of Array.isArray(lesson.grammar)?lesson.grammar:[]){
   const formula=String(g.formula||'').trim(),meaning=String(g.meaning||'').trim();
   if(formula&&meaning)content.push({type:'Ngữ pháp',title:label+' · '+formula,
    ko:formula,vi:meaning,detail:[g.usage,g.example].filter(Boolean).join(' · ').slice(0,440),url});
  }
 }
 return content;
}
try{
 data=buildLessonIndex();
 if(data.length<2000)throw Error('Dữ liệu giáo trình chưa đầy đủ.');
 status.textContent='Sẵn sàng tra cứu '+data.length.toLocaleString('vi-VN')+' mục từ 90 bài học thực tế.';
}catch(err){data=[];status.textContent='Không thể nạp kho bài học: '+String(err.message||err).slice(0,110)}
