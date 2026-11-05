/* Phase 2: four interactive Korean learning modes. Practice XP is NOT official. */
import {shuffled,pickWords,el,button,normalized,uniqueWords} from "./core.js";

function empty(host,title,detail){host.replaceChildren(el("h3","",title),el("p","",detail));return ()=>{};}
function header(host,title,hint){
  host.replaceChildren();
  const top=el("div","mz-game-head"),intro=el("div"),count=el("strong","mz-counter","");
  intro.append(el("h3","",title),el("p","",hint));top.append(intro,count);host.append(top);
  return count;
}
export function playBubbles(ctx){
  const words=pickWords(ctx.lesson.words.filter(w=>/^[가-힣]+(?:\s+[가-힣]+)*$/u.test(w.ko)),8,"bubbles:"+ctx.lesson.cap+":"+ctx.lesson.bai);
  if(words.length<5)return empty(ctx.host,"Chưa đủ từ vựng","Cần 5 từ Hangul rõ nghĩa của bài này.");
  const count=header(ctx.host,"Bắn bóng Hangul","Đọc nghĩa tiếng Việt rồi bắn vào từ Hangul đúng. Bạn có ba trái tim.");
  const request=el("div","mz-prompt"),hearts=el("p","mz-hearts"),field=el("div","mz-bubble-field");
  ctx.host.append(request,hearts,field);
  let i=0,correct=0,misses=0,lives=3,ended=false;
  function draw(){
    if(ended||!ctx.active())return;
    const q=words[i];
    count.textContent=(i+1)+" / "+words.length;
    hearts.textContent="❤️".repeat(lives)+"🤍".repeat(3-lives);
    request.textContent="Chọn từ có nghĩa: "+q.vi;
    field.replaceChildren();
    const opts=shuffled([q,...shuffled(words.filter(x=>x.ko!==q.ko)).slice(0,4)]);
    opts.forEach((item,n)=>{
      const b=button(item.ko,"mz-bubble",()=>{
        if(ended||!ctx.active())return;
        if(item.ko===q.ko){
          correct++;
          ctx.feedback("Chính xác: "+q.ko+" — "+q.vi,true);
          if(i===words.length-1){ended=true;ctx.finish({correct,total:words.length,mistakes:misses});return;}
          i++;draw();
        }else{
          misses++;lives--;hearts.textContent="❤️".repeat(lives)+"🤍".repeat(3-lives);
          b.disabled=true;b.classList.add("mz-bubble-wrong");
          if(lives===0){ended=true;ctx.finish({correct,total:words.length,mistakes:misses});}
          else ctx.feedback("Sai rồi. Bạn còn "+lives+" trái tim.",false);
        }
      });
      b.lang="ko";b.style.setProperty("--bubble-delay",String(-n*.31)+"s");
      field.append(b);
    });
  }
  draw();return ()=>{ended=true;};
}

export function grammarCards(raw){
  const forms=new Set(),meanings=new Set(),out=[];
  for(const x of raw||[]){
    const formula=String(x.formula||"").trim(),meaning=String(x.meaning||"").trim();
    if(!formula||!meaning||formula.length>100||meaning.length>180)continue;
    const f=normalized(formula),m=normalized(meaning);
    if(forms.has(f)||meanings.has(m))continue;
    forms.add(f);meanings.add(m);
    out.push({formula,meaning,usage:String(x.usage||"").slice(0,240)});
  }
  return out;
}
export function playGrammarDetective(ctx){
  const all=grammarCards(ctx.lesson.grammar);
  if(all.length<3)return empty(ctx.host,"Chưa đủ hồ sơ ngữ pháp","Bài này cần ít nhất 3 công thức và ý nghĩa khác nhau.");
  const cases=shuffled(all).slice(0,Math.min(6,all.length));
  const count=header(ctx.host,"Thám tử ngữ pháp","Có một thẻ bị tráo ý nghĩa. Hãy chỉ ra thẻ không khớp với giáo trình.");
  const suspects=el("div","mz-suspects"),explain=el("div","mz-detective-fix"),actions=el("div","mz-actions");
  const next=button("Vụ án tiếp theo →","mz-primary");next.hidden=true;
  actions.append(next);ctx.host.append(suspects,explain,actions);
  let i=0,correct=0,misses=0,locked=false;
  function draw(){
    if(!ctx.active())return;
    locked=false;next.hidden=true;count.textContent=(i+1)+" / "+cases.length;
    suspects.replaceChildren();explain.replaceChildren();
    const wrong=cases[i],other=shuffled(all.filter(x=>x.formula!==wrong.formula)).slice(0,2);
    const choices=shuffled([{row:wrong,meaning:other[0].meaning,bad:true},
      ...other.map(x=>({row:x,meaning:x.meaning,bad:false}))]);
    choices.forEach(choice=>{
      const b=button("","mz-suspect");
      const formula=el("strong","",choice.row.formula);formula.lang="ko";
      b.append(formula,el("small","",choice.meaning));
      b.addEventListener("click",()=>{
        if(locked||!ctx.active())return;
        if(!choice.bad){misses++;b.disabled=true;ctx.feedback("Thẻ này khớp giáo trình. Hãy xem thẻ khác.",false);return;}
        correct++;locked=true;b.classList.add("mz-found");
        suspects.querySelectorAll("button").forEach(x=>x.disabled=true);
        explain.replaceChildren(el("strong","","🔎 Đã tìm ra thẻ sai!"),
          el("p","","Công thức: "+wrong.formula),el("p","","Ý nghĩa đúng: "+wrong.meaning));
        if(wrong.usage)explain.append(el("p","",wrong.usage));
        next.hidden=false;ctx.feedback("Tìm đúng thẻ bị tráo nghĩa.",true);
      });
      suspects.append(b);
    });
    ctx.feedback("Chọn công thức đang bị ghép sai ý nghĩa.",null);
  }
  next.addEventListener("click",()=>{
    if(!locked||!ctx.active())return;
    if(i===cases.length-1)ctx.finish({correct,total:cases.length,mistakes:misses});
    else {i++;draw();}
  });
  draw();return ()=>{};
}
export function playTypingKing(ctx){
  const vocab=pickWords(ctx.lesson.words.filter(x=>/^[가-힣]+(?: [가-힣]+)*$/u.test(x.ko)&&x.ko.length<=24),8,"typing:"+ctx.lesson.cap+":"+ctx.lesson.bai);
  if(vocab.length<4)return empty(ctx.host,"Thiếu từ gõ được","Bài học cần tối thiểu 4 từ không có dấu đặc biệt.");
  const count=header(ctx.host,"Vua gõ tiếng Hàn","Gõ từ tiếng Hàn theo nghĩa Việt. Có thể dùng bàn phím Hàn Quốc hoặc bộ gõ trên điện thoại.");
  const prompt=el("div","mz-prompt"),form=el("form","mz-typing-form");
  const input=el("input","mz-typing-input");
  input.type="text";input.lang="ko";input.autocomplete="off";input.autocapitalize="off";input.spellcheck=false;input.maxLength=80;
  input.placeholder="Nhập từ tiếng Hàn";input.setAttribute("aria-label","Câu trả lời bằng tiếng Hàn");
  const check=button("Kiểm tra","mz-primary");check.type="submit";
  const skip=button("Bỏ qua","mz-ghost"),stats=el("p","mz-typing-stats");
  form.append(input,check,skip);ctx.host.append(prompt,form,stats);
  let i=0,correct=0,misses=0,skips=0,chars=0;
  const started=Date.now();
  function draw(){
    if(!ctx.active())return;
    const q=vocab[i];prompt.textContent=q.vi;count.textContent=(i+1)+" / "+vocab.length;
    input.value="";
    stats.textContent="Đúng "+correct+" / "+vocab.length+" • "+chars+" ký tự chính xác";
    ctx.feedback("Nhập từ Hangul, sau đó nhấn Kiểm tra.",null);
  }
  function advance(){
    if(i===vocab.length-1){
      ctx.finish({correct,total:vocab.length,mistakes:misses,skips,
        seconds:Math.max(1,Math.round((Date.now()-started)/1000))});return;
    }
    i++;draw();input.focus({preventScroll:true});
  }
  form.addEventListener("submit",e=>{
    e.preventDefault();if(!ctx.active())return;
    const answer=normalized(input.value).normalize("NFC"),expect=normalized(vocab[i].ko).normalize("NFC");
    if(!answer){ctx.feedback("Nhập từ cần gõ hoặc nhấn Bỏ qua.",false);return;}
    if(answer===expect){
      correct++;chars+=Array.from(expect).length;ctx.feedback("Chính xác!",true);advance();
    } else {
      misses++;ctx.feedback("Chưa đúng. "+(misses>=2?"Gợi ý: "+Array.from(expect)[0]+"…":"Kiểm tra chữ Hàn và dấu cách."),false);
      input.select();
    }
  });
  input.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.isComposing)e.preventDefault();});
  skip.addEventListener("click",()=>{
    if(!ctx.active())return;skips++;
    ctx.feedback("Đáp án: "+vocab[i].ko,false);advance();
  });
  draw();return ()=>{};
}
// The catalog defines illustrations/prices, not new vocabulary. Exact Korean words
// MUST occur in the current or a previously completed lesson to appear.
export const MARKET_CATALOG=Object.freeze([
  ["책","📘",4000],["공책","📓",2500],["펜","🖊️",1500],["지우개","🧽",1000],
  ["가방","🎒",12000],["사전","📗",7500],["연필","✏️",1000],["색연필","🖍️",3000],
  ["물","💧",1500],["우유","🥛",2800],["사과","🍎",3500],["바나나","🍌",2500],
  ["빵","🍞",3000],["과자","🍪",2700],["라면","🍜",2600],["커피","☕",3200],
  ["주스","🧃",3000],["오렌지","🍊",3600],["딸기","🍓",5400],["포도","🍇",4900],
  ["김밥","🍙",4000],["계란","🥚",3000],["달걀","🥚",3000],["쌀","🍚",7000],
  ["우산","☂️",5500],["모자","🧢",6500],["신발","👟",15000],
  ["바지","👖",17000],["치마","👗",16000],["양말","🧦",3000],["티셔츠","👕",11000]
].map(([ko,icon,price])=>Object.freeze({ko,icon,price})));
export function availableMarketProducts(words){
  const translations=new Map(uniqueWords(words).map(x=>[x.ko,x.vi]));
  return MARKET_CATALOG.filter(x=>translations.has(x.ko)).map(x=>({...x,vi:translations.get(x.ko)}));
}
export function marketOrderCorrect(cart,target){
  return cart.size===target.length && target.every(x=>cart.has(x));
}
export function playKoreanMart(ctx){
  const stock=availableMarketProducts(ctx.lesson.marketWords||ctx.lesson.words);
  if(stock.length<3)return empty(ctx.host,"Siêu thị chưa mở cho bài này",
    "Cần tối thiểu ba từ vựng chỉ hàng hóa đã học. Có thể thử Sơ cấp 1 – Bài 2.");
  const count=header(ctx.host,"Siêu thị Hàn Quốc","Khách đưa danh sách tiếng Việt. Chọn đúng tên sản phẩm bằng tiếng Hàn rồi thanh toán.");
  const order=el("div","mz-mart-order"),shelf=el("div","mz-mart-shelf"),basket=el("div","mz-mart-basket");
  const actions=el("div","mz-actions"),pay=button("🧾 Thanh toán","mz-primary"),clear=button("Xóa giỏ","mz-ghost");
  const next=button("Đơn hàng tiếp theo →","mz-primary");next.hidden=true;
  actions.append(pay,clear,next);ctx.host.append(order,shelf,basket,actions);
  let i=0,correct=0,misses=0,locked=false,cart=new Set(),target=[],shelfList=[];
  const totalOrders=stock.length>=5?4:3, won=n=>Number(n).toLocaleString("ko-KR")+" ₩";
  const possibleOrders=[];
  for(let a=0;a<stock.length;a++)for(let b=a+1;b<stock.length;b++)possibleOrders.push([stock[a],stock[b]]);
  const orderPlan=shuffled(possibleOrders).slice(0,totalOrders);
  function paint(){
    shelf.replaceChildren();
    // Keep up to eight cards and always include both requested products.
    shelfList.forEach(product=>{
      const card=button("","mz-product",()=>{
        if(locked||!ctx.active())return;
        if(cart.has(product.ko))cart.delete(product.ko);else cart.add(product.ko);
        paint();
      });
      card.setAttribute("aria-pressed",String(cart.has(product.ko)));
      const name=el("strong","",product.ko);name.lang="ko";
      card.append(el("span","mz-product-icon",product.icon),name,el("small","",won(product.price)));
      shelf.append(card);
    });
    basket.textContent="Giỏ hàng: "+cart.size+" món • "+won(stock.filter(x=>cart.has(x.ko)).reduce((sum,x)=>sum+x.price,0));
  }
  function draw(){
    if(!ctx.active())return;
    locked=false;cart=new Set();target=orderPlan[i];
    shelfList=stock.length<=8?stock.slice():shuffled([...target,...shuffled(stock.filter(x=>!target.some(t=>t.ko===x.ko))).slice(0,6)]);
    count.textContent=(i+1)+" / "+totalOrders;
    order.replaceChildren(el("strong","","🛒 Danh sách cần mua"));
    const list=el("ul","mz-mart-request");
    target.forEach(item=>list.append(el("li","",item.vi)));
    order.append(list);
    pay.hidden=false;clear.hidden=false;next.hidden=true;paint();
    ctx.feedback("Chọn sản phẩm để thêm hoặc loại bỏ khỏi giỏ.",null);
  }
  pay.addEventListener("click",()=>{
    if(locked||!ctx.active())return;
    if(marketOrderCorrect(cart,target.map(x=>x.ko))){
      correct++;locked=true;pay.hidden=true;clear.hidden=true;next.hidden=false;
      ctx.feedback("Đúng đơn! Tổng tiền "+won(target.reduce((s,x)=>s+x.price,0))+".",true);
    }else{misses++;ctx.feedback("Giỏ hàng chưa khớp đơn. Kiểm tra lại từ vựng.",false);}
  });
  clear.addEventListener("click",()=>{if(!locked){cart.clear();paint();}});
  next.addEventListener("click",()=>{
    if(!locked||!ctx.active())return;
    if(i===totalOrders-1)ctx.finish({correct,total:totalOrders,mistakes:misses});
    else {i++;draw();}
  });
  draw();return ()=>{};
}
export const PHASE2_RUNNERS=Object.freeze({
  "hangul-bubbles":playBubbles,
  "grammar-detective":playGrammarDetective,
  "typing-king":playTypingKing,
  "korean-mart":playKoreanMart
});
