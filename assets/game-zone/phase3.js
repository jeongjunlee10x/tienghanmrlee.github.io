/* MR LEE Game Zone phase 3: TOPIK-style battle and Korean travel missions.
 * Educational practice. Not official TOPIK questions, results or verified XP.
 * Never imports vocab, examples or grammar from future lessons.
 */
import {shuffled,pickWords,el,button,normalized} from "./core.js";

const DESTINATIONS=Object.freeze([
 ["한국","🇰🇷","Đến Hàn Quốc"],["학교","🏫","Tìm trường học"],
 ["대학교","🎓","Đến đại học"],["도서관","📚","Tìm thư viện"],
 ["식당","🍜","Tìm nhà hàng"],["호텔","🏨","Tìm khách sạn"],
 ["병원","🏥","Đến bệnh viện"],["약국","💊","Tìm hiệu thuốc"],
 ["은행","🏦","Tìm ngân hàng"],["우체국","📮","Tìm bưu điện"],
 ["공항","🛫","Đến sân bay"],["공항역","🚇","Tìm ga sân bay"],
 ["역","🚉","Tìm nhà ga"],["지하철역","🚇","Tìm ga tàu điện ngầm"],
 ["버스 정류장","🚌","Tìm trạm xe buýt"],["정류장","🚌","Tìm điểm dừng"],
 ["박물관","🏛️","Tham quan bảo tàng"],["극장","🎭","Tìm rạp hát"],
 ["영화관","🎬","Tìm rạp phim"],["공원","🌳","Tìm công viên"],
 ["관광지","📸","Đến điểm tham quan"],["경찰서","👮","Tìm đồn cảnh sát"],
 ["서점","📖","Tìm hiệu sách"],["백화점","🛍️","Đến trung tâm mua sắm"],
 ["가게","🏬","Tìm cửa hàng"],["시장","🏪","Đi chợ"],
 ["편의점","🏪","Tìm cửa hàng tiện lợi"],["화장실","🚻","Tìm nhà vệ sinh"],
 ["교실","🏫","Tìm phòng học"],["운동장","⚽","Tìm sân vận động"],
 ["은행","🏦","Đến ngân hàng"]
]);
export function availableTravelStops(words){
 const map=new Map((words||[]).map(w=>[normalized(w.ko),w.vi]));
 const unique=new Set();
 return DESTINATIONS.filter(([ko])=>map.has(normalized(ko))&&!unique.has(ko)&&unique.add(ko))
   .map(([ko,icon,task])=>({ko,vi:map.get(normalized(ko)),icon,task}));
}
function header(host,title,desc){
 host.replaceChildren();
 const head=el("div","mz-game-head"),info=el("div"),counter=el("strong","mz-counter","");
 info.append(el("h3","",title),el("p","",desc));head.append(info,counter);host.append(head);
 return counter;
}
function disabled(host,title,reason){
 host.replaceChildren(el("h3","",title),el("p","",reason));
 return ()=>{};
}
function fourChoices(correct,all,key){
 const seen=new Set([normalized(correct[key])]);
 const wrong=[];
 for(const item of shuffled(all)){
  const text=normalized(item[key]);
  if(seen.has(text))continue;seen.add(text);wrong.push(item);
  if(wrong.length===3)break;
 }
 return wrong.length===3?shuffled([correct,...wrong]):[];
}
export function createTopikPracticeBank(lesson){
 const rows=[],vocab=lesson.words||[];
 for(const word of vocab){
  const opts=fourChoices(word,vocab,"vi");
  if(opts.length!==4)continue;
  rows.push({
   kind:"Từ vựng",prompt:"Từ tiếng Hàn sau có nghĩa là gì?",
   korean:word.ko,answer:word.vi,options:opts.map(x=>x.vi),
   explanation:word.ko+" — "+word.vi
  });
 }
 const grammar=(lesson.grammar||[]).filter(x=>x.formula&&x.meaning);
 for(const item of grammar){
  const opts=fourChoices(item,grammar,"meaning");
  if(opts.length!==4)continue;
  rows.push({
   kind:"Ngữ pháp",prompt:"Cấu trúc sau diễn đạt ý nghĩa nào?",
   korean:String(item.formula),answer:String(item.meaning),
   options:opts.map(x=>x.meaning),
   explanation:String(item.formula)+" — "+String(item.meaning)
  });
 }
 for(const pair of lesson.sentences||[]){
  const opts=fourChoices(pair,lesson.sentences||[],"vi");
  if(opts.length!==4)continue;
  rows.push({
   kind:"Đọc hiểu",prompt:"Câu tiếng Hàn dưới đây có nghĩa gì?",
   korean:pair.ko,answer:pair.vi,options:opts.map(x=>x.vi),
   explanation:pair.ko+" — "+pair.vi
  });
 }
 return rows;
}
export function playTopikBattle(ctx){
 const bank=createTopikPracticeBank(ctx.lesson);
 if(bank.length<8)return disabled(ctx.host,"Chưa đủ câu để thi đấu","Bài học cần ít nhất 8 câu có 4 lựa chọn khác nhau. Không tạo câu vượt nội dung giáo trình.");
 const primary=shuffled(bank.filter(x=>x.kind==="Ngữ pháp")).slice(0,2);
 const reading=shuffled(bank.filter(x=>x.kind==="Đọc hiểu")).slice(0,2);
 const vocab=shuffled(bank.filter(x=>x.kind==="Từ vựng")).slice(0,10-primary.length-reading.length);
 const questions=shuffled([...primary,...reading,...vocab]);
 if(questions.length<8)return disabled(ctx.host,"Chưa đủ câu","Không đủ câu học thuật phân biệt để chấm.");
 const count=header(ctx.host,"Đại chiến TOPIK · Luyện theo dạng đề","10 câu hoặc ít hơn • 120 giây • bốn lựa chọn • câu hỏi chỉ từ bài đang học.");
 const progress=el("div","mz-topik-progress"),clock=el("strong","mz-topik-clock"),question=el("div","mz-topik-question"),answers=el("div","mz-option-grid");
 const controls=el("div","mz-actions"),skip=button("Bỏ qua","mz-ghost");
 controls.append(skip);ctx.host.append(progress,clock,question,answers,controls);
 let i=0,correct=0,mistakes=0,skips=0,done=false,remaining=120,locked=false;
 let interval=null;
 function stop(){
  if(interval!==null){clearInterval(interval);interval=null;}
 }
 function finish(){
  if(done)return;done=true;stop();
  ctx.finish({correct,total:questions.length,mistakes,skips,seconds:120-remaining});
 }
 function next(){
  if(i===questions.length-1){finish();return;}
  i++;draw();
 }
 function draw(){
  if(done||!ctx.active())return;
  locked=false;const q=questions[i];
  count.textContent=(i+1)+"/"+questions.length;
  progress.textContent=q.kind+" · Câu "+(i+1);
  question.replaceChildren(el("p","",q.prompt));
  const phrase=el("div","mz-prompt",q.korean);phrase.lang="ko";
  question.append(phrase);
  answers.replaceChildren();
  shuffled(q.options).forEach((opt,index)=>{
   const choice=button((index+1)+". "+opt,"mz-option",()=>{
    if(locked||done||!ctx.active())return;
    locked=true;
    answers.querySelectorAll("button").forEach(x=>x.disabled=true);
    if(normalized(opt)===normalized(q.answer)){
      correct++;ctx.feedback("Đúng! "+q.explanation,true);
    }else{
      mistakes++;ctx.feedback("Chưa đúng. "+q.explanation,false);
    }
    nextButton.hidden=false;
   });
   answers.append(choice);
  });
  nextButton.hidden=true;
 }
 const nextButton=button("Câu tiếp theo →","mz-primary");
 controls.append(nextButton);
 nextButton.addEventListener("click",()=>{if(locked&&ctx.active()){next();}});
 skip.addEventListener("click",()=>{if(done||locked||!ctx.active())return;skips++;next();});
 interval=setInterval(()=>{
  if(!ctx.active()){stop();return;}
  remaining=Math.max(0,remaining-1);
  clock.textContent="⏱ "+remaining+" giây";
  if(remaining===0){ctx.feedback("Hết giờ! Xem kết quả luyện tập.",false);finish();}
 },1000);
 draw();clock.textContent="⏱ "+remaining+" giây";
 return stop;
}
export function playKoreanTravel(ctx){
 const stops=availableTravelStops(ctx.lesson.marketWords||ctx.lesson.words);
 if(stops.length<4)return disabled(ctx.host,"Chưa mở đủ địa điểm",
  "Cần học ít nhất bốn địa điểm tiếng Hàn trước khi tham gia hành trình. Các biển chỉ dẫn chỉ lấy từ bài đã học.");
 const waypoints=pickWords(stops.map(x=>({ko:x.ko,vi:x.vi})),Math.min(5,stops.length),
   "travel:"+ctx.lesson.cap+":"+ctx.lesson.bai).map(x=>stops.find(y=>y.ko===x.ko));
 const count=header(ctx.host,"Du lịch Hàn Quốc · 한국 여행",
  "Đọc nhiệm vụ thực tế, tìm biển chỉ dẫn tiếng Hàn đúng để tiếp tục hành trình.");
 const scene=el("div","mz-travel-scene"),board=el("div","mz-travel-board"),map=el("p","mz-travel-map");
 ctx.host.append(map,scene,board);
 let i=0,correct=0,mistakes=0,locked=false,done=false;
 function draw(){
  if(done||!ctx.active())return;
  locked=false;const current=waypoints[i];
  count.textContent=(i+1)+" / "+waypoints.length+" trạm";
  map.textContent="📍 "+"● ".repeat(i)+"○ ".repeat(waypoints.length-i);
  scene.replaceChildren(el("span","mz-travel-emoji",current.icon),el("h3","",current.task));
  scene.append(el("p","","Bạn đang ở Hàn Quốc. Hãy tìm biển chỉ dẫn phù hợp với nhiệm vụ."));
  board.replaceChildren();
  const opts=fourChoices(current,stops,"ko");
  if(opts.length!==4){done=true;ctx.finish({correct,total:waypoints.length,mistakes});return;}
  for(const dest of opts){
   const choice=button("","mz-travel-sign",()=>{
    if(done||locked||!ctx.active())return;
    if(dest.ko!==current.ko){
      mistakes++;choice.disabled=true;
      ctx.feedback("Chưa đúng biển chỉ dẫn. Chọn lại địa điểm phù hợp.",false);return;
    }
    locked=true;correct++;
    ctx.feedback("Đúng đường! "+current.ko+" — "+current.vi,true);
    board.querySelectorAll("button").forEach(b=>b.disabled=true);
    const advance=button("Đi tiếp →","mz-primary",()=>{
     if(!ctx.active()||done)return;
     if(i===waypoints.length-1){
      done=true;ctx.finish({correct,total:waypoints.length,mistakes});return;
     }
     i++;draw();
    });
    scene.append(advance);
   });
   const ico=el("span","mz-travel-sign-icon",dest.icon);
   const label=el("strong","",dest.ko);label.lang="ko";
   choice.append(ico,label);
   board.append(choice);
  }
 }
 draw();return ()=>{done=true;};
}
export const PHASE3_RUNNERS=Object.freeze({
 "topik-battle":playTopikBattle,
 "korean-travel":playKoreanTravel
});
