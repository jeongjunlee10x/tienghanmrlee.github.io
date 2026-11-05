/* Four fully playable local practice modes; no official points are written here. */
import {shuffled, pickWords, el, button, normalized} from "./core.js";

function message(host, title, detail) {
  const h=el("h3","",title),p=el("p","",detail);
  host.replaceChildren(h,p);return () => {};
}
function header(host, title, detail) {
  const head=el("div","mz-game-head");
  const block=el("div");
  block.append(el("h3","",title),el("p","",detail));
  const number=el("strong","mz-counter","");
  head.append(block,number);host.append(head);return number;
}

export function playWordMatch(ctx) {
  const pairs=pickWords(ctx.lesson.words,5), host=ctx.host;
  if(pairs.length<4)return message(host,"Chưa đủ từ để ghép","Bài học này cần ít nhất bốn cặp từ có nghĩa khác nhau.");
  host.replaceChildren();
  const count=header(host,"Ghép đúng cặp từ","Chọn một từ tiếng Hàn và một nghĩa tiếng Việt tương ứng.");
  const grid=el("div","mz-pair-grid");
  const koCol=el("div","mz-col"),viCol=el("div","mz-col");
  grid.append(koCol,viCol);host.append(grid);
  let ko=null,vi=null,done=0,mistakes=0,blocked=false,timer=null;
  const koButtons=[],viButtons=[];
  function update(){count.textContent=done+" / "+pairs.length+" cặp";}
  function judge() {
    if(!ko || !vi)return;
    blocked=true;
    if(ko.id===vi.id) {
      ko.button.disabled=vi.button.disabled=true;
      ko.button.classList.add("mz-complete");vi.button.classList.add("mz-complete");
      ko.button.setAttribute("aria-pressed","false");vi.button.setAttribute("aria-pressed","false");
      ko=vi=null;done++;blocked=false;update();ctx.feedback("Đúng rồi! Một cặp đã hoàn thành.",true);
      if(done===pairs.length)ctx.finish({correct:done,total:pairs.length,mistakes});
      return;
    }
    mistakes++;ctx.feedback("Hai thẻ không cùng nghĩa. Hãy thử lại.",false);
    timer=setTimeout(()=>{
      if(!ctx.active())return;
      ko?.button.setAttribute("aria-pressed","false");vi?.button.setAttribute("aria-pressed","false");
      ko=vi=null;blocked=false;
    },600);
  }
  function addColumn(target, side, storage) {
    shuffled(pairs.map((p,id)=>({id,p}))).forEach(item=>{
      const isKo=side==="ko";
      const b=button(isKo?item.p.ko:item.p.vi,"mz-tile");
      if(isKo)b.lang="ko";
      b.setAttribute("aria-pressed","false");
      const entry={id:item.id,button:b};
      b.addEventListener("click",()=>{
        if(blocked || !ctx.active() || b.disabled)return;
        const old=isKo?ko:vi;
        if(old)old.button.setAttribute("aria-pressed","false");
        if(isKo)ko=entry;else vi=entry;
        b.setAttribute("aria-pressed","true");judge();
      });
      target.append(b);storage.push(b);
    });
  }
  addColumn(koCol,"ko",koButtons);addColumn(viCol,"vi",viButtons);update();
  return ()=>{if(timer)clearTimeout(timer);};
}

export function playSentence(ctx) {
  const questions=shuffled(ctx.lesson.sentences).slice(0,5),host=ctx.host;
  if(!questions.length)return message(host,"Chưa đủ câu mẫu","Bài này chưa có câu tiếng Hàn kèm nghĩa Việt phù hợp cho trò xếp câu.");
  host.replaceChildren();
  const count=header(host,"Xây dựng câu tiếng Hàn","Chọn các thẻ theo đúng thứ tự. Chạm thẻ đã chọn để đưa về.");
  const prompt=el("div","mz-prompt");
  const chosen=el("div","mz-chosen-tokens");chosen.setAttribute("aria-label","Các từ đã chọn");
  const tokens=el("div","mz-token-list");tokens.setAttribute("aria-label","Kho từ");
  const actions=el("div","mz-actions");
  const check=button("Kiểm tra câu","mz-primary");
  const clear=button("Làm lại câu","mz-ghost");
  const next=button("Câu tiếp theo →","mz-ghost");next.hidden=true;
  actions.append(check,clear,next);host.append(prompt,chosen,tokens,actions);
  let index=0,correct=0,mistakes=0,available=[],selected=[],locked=false;
  function draw() {
    const q=questions[index];
    prompt.textContent=q.vi;count.textContent=(index+1)+" / "+questions.length;
    available=shuffled(q.words.map((text,id)=>({id,text})));
    selected=[];locked=false;next.hidden=true;check.hidden=false;clear.hidden=false;
    refresh();ctx.feedback("Sắp xếp câu tiếng Hàn có nghĩa như dòng trên.",null);
  }
  function refresh() {
    const selectedIds=new Set(selected.map(x=>x.id));
    chosen.replaceChildren();tokens.replaceChildren();
    for(const item of selected) {
      const b=button(item.text,"mz-tile",()=>{
        if(locked)return;selected=selected.filter(x=>x.id!==item.id);refresh();
      });
      b.lang="ko";chosen.append(b);
    }
    if(!selected.length)chosen.append(el("span","mz-minor","Chưa chọn từ nào"));
    for(const item of available) {
      const b=button(item.text,"mz-tile",()=>{
        if(locked || selectedIds.has(item.id))return;
        selected.push(item);refresh();
      });
      b.lang="ko";b.disabled=selectedIds.has(item.id);tokens.append(b);
    }
  }
  check.addEventListener("click",()=>{
    if(locked || !ctx.active())return;
    const target=questions[index].words.join(" ");
    const answer=selected.map(x=>x.text).join(" ");
    if(selected.length!==questions[index].words.length) {
      ctx.feedback("Hãy chọn đủ các thành phần câu.",false);return;
    }
    if(normalized(answer)!==normalized(target)) {
      mistakes++;ctx.feedback("Thứ tự chưa đúng. Hãy đổi vị trí các từ.",false);return;
    }
    correct++;locked=true;ctx.feedback("Chính xác! "+questions[index].ko,true);
    next.hidden=false;check.hidden=true;clear.hidden=true;
  });
  clear.addEventListener("click",()=>{if(locked)return;selected=[];refresh();});
  next.addEventListener("click",()=>{
    if(!locked || !ctx.active())return;
    if(index===questions.length-1){ctx.finish({correct,total:questions.length,mistakes});return;}
    index++;draw();
  });
  draw();return ()=>{};
}

export function playListening(ctx) {
  const audible=ctx.lesson.words.filter(x=>ctx.audio?.has(x.ko));
  const questions=pickWords(audible,6),host=ctx.host;
  if(questions.length<4)return message(host,"Chưa có đủ MP3 phù hợp","Trò nghe chỉ mở khi có ít nhất bốn từ và tệp MP3 khớp bài học. Không thay bằng lời đọc tự tạo.");
  host.replaceChildren();
  const count=header(host,"Nghe và chọn nghĩa","Nhấn ▶ để nghe từ tiếng Hàn; có thể nghe lại trước khi trả lời.");
  const audio=el("audio","mz-audio");audio.controls=true;audio.preload="metadata";audio.setAttribute("aria-label","Âm thanh tiếng Hàn");
  const grid=el("div","mz-option-grid");
  const actions=el("div","mz-actions");
  const next=button("Câu tiếp theo →","mz-primary");
  const skip=button("Bỏ qua câu","mz-ghost");
  next.hidden=true;actions.append(next,skip);host.append(audio,grid,actions);
  let index=0,correct=0,mistakes=0,answered=false,skips=0;
  function advance() {
    if(!ctx.active())return;
    if(index===questions.length-1){ctx.finish({correct,total:questions.length,mistakes,skips});return;}
    index++;draw();
  }
  function draw() {
    const q=questions[index];answered=false;count.textContent=(index+1)+" / "+questions.length;
    audio.pause();audio.src=ctx.audio.get(q.ko);audio.load();next.hidden=true;skip.hidden=false;grid.replaceChildren();
    const others=shuffled(audible.filter(x=>x.vi!==q.vi)).slice(0,3).map(x=>x.vi);
    for(const label of shuffled([q.vi,...others])) {
      const b=button(label,"mz-option",()=>{
        if(answered || !ctx.active())return;
        answered=true;grid.querySelectorAll("button").forEach(x=>x.disabled=true);
        if(label===q.vi){correct++;ctx.feedback("Chính xác: "+q.ko+" — "+q.vi,true);}
        else {mistakes++;ctx.feedback("Chưa đúng: "+q.ko+" — "+q.vi,false);}
        next.hidden=false;skip.hidden=true;
      });
      grid.append(b);
    }
    ctx.feedback("Nghe và chọn một đáp án.",null);
  }
  next.addEventListener("click",advance);
  skip.addEventListener("click",()=>{if(answered || !ctx.active())return;skips++;advance();});
  audio.addEventListener("error",()=>{if(ctx.active())ctx.feedback("Không tải được MP3 này. Có thể bỏ qua câu mà không tính sai.",false);});
  draw();return ()=>{audio.pause();audio.removeAttribute("src");audio.load();};
}

export function playMemory(ctx) {
  const pairs=pickWords(ctx.lesson.words,5),host=ctx.host;
  if(pairs.length<4)return message(host,"Chưa đủ dữ liệu","Bài này cần ít nhất bốn cặp từ để chơi trí nhớ.");
  const cards=shuffled(pairs.flatMap((p,id)=>[{id,text:p.ko,ko:true},{id,text:p.vi,ko:false}]));
  host.replaceChildren();
  const count=header(host,"Trí nhớ thần tốc","Lật hai thẻ rồi tìm cặp tiếng Hàn và tiếng Việt tương ứng.");
  const grid=el("div","mz-memory-grid");host.append(grid);
  let first=null,second=null,matched=0,mistakes=0,locked=false,timer=null;
  function reveal(item) {
    item.b.textContent=item.text;item.b.setAttribute("aria-pressed","true");
    if(item.ko)item.b.lang="ko";
  }
  function conceal(item) {
    item.b.textContent="?";item.b.setAttribute("aria-pressed","false");
    item.b.removeAttribute("lang");
  }
  function update(){count.textContent=matched+" / "+pairs.length+" cặp";}
  cards.forEach(item=>{
    item.b=button("?","mz-memory-card");item.b.setAttribute("aria-pressed","false");
    item.b.setAttribute("aria-label","Lật thẻ chưa mở");
    item.b.addEventListener("click",()=>{
      if(!ctx.active()||locked||item.b.disabled||item===first)return;
      reveal(item);
      if(!first){first=item;return;}
      second=item;locked=true;
      if(first.id===second.id && first.ko!==second.ko){
        first.b.disabled=true;second.b.disabled=true;
        first.b.classList.add("mz-complete");second.b.classList.add("mz-complete");
        matched++;first=second=null;locked=false;update();
        ctx.feedback("Bạn đã tìm đúng một cặp!",true);
        if(matched===pairs.length)ctx.finish({correct:matched,total:pairs.length,mistakes});
      }else{
        mistakes++;ctx.feedback("Chưa đúng, hãy ghi nhớ vị trí các thẻ.",false);
        const previous=first,current=second;
        timer=setTimeout(()=>{
          if(!ctx.active())return;
          conceal(previous);conceal(current);first=second=null;locked=false;
        },950);
      }
    });
    grid.append(item.b);
  });
  update();return ()=>{if(timer)clearTimeout(timer);};
}

export const GAME_RUNNERS=Object.freeze({
  "word-match":playWordMatch,
  "sentence-builder":playSentence,
  "listening":playListening,
  "memory":playMemory
});