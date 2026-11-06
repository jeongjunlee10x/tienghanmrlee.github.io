/* MR LEE friend-room modal, separate from the old Arena internal hub.
 * Creates and joins real Firebase-authenticated, Supabase-authoritative rooms.
 * A room is created only after pressing a real user action.
 */
import {roomRequest,GOLD_TIERS,requiredGold,formatG,normalizeRoomCode} from "./room-api.js";
const mk=(tag,cls="",value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e;};
function add(parent,...children){parent.append(...children);return parent;}
const legalCode=code=>/^[A-Z2-9]{8}$/.test(code);
export function mountArenaFriendPopup({game,gameName,getWallet,getTimeControl=()=>"10+0",onAccepted,onWallet,nickname}){
 const dialog=mk("dialog","arena-social-modal");dialog.id="roomFriendsPopup";
 dialog.setAttribute("aria-labelledby","arenaSocialTitle");
 const shell=mk("div","arena-social-shell");
 const heading=mk("header","arena-social-heading");
 const h2=mk("h2","","CHƠI VỚI BẠN");h2.id="arenaSocialTitle";
 const close=mk("button","arena-social-close","✕");close.type="button";close.setAttribute("aria-label","Đóng");
 add(heading,h2,close);
 const tabs=mk("div","arena-social-tabs");
 tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Tạo bàn hoặc vào bàn");
 const createTab=mk("button","arena-social-tab","TẠO BÀN");
 const joinTab=mk("button","arena-social-tab","VÀO BÀN");
 for(const [b,tab] of [[createTab,"create"],[joinTab,"join"]]){
  b.type="button";b.dataset.socialTab=tab;b.setAttribute("role","tab");b.setAttribute("aria-controls",tab==="create"?"arenaSocialCreate":"arenaSocialJoin");
 }
 add(tabs,createTab,joinTab);
 const create=mk("section","arena-social-content");create.id="arenaSocialCreate";
 create.setAttribute("role","tabpanel");
 const walletInfo=mk("p","arena-social-summary","Đang kiểm tra số dư G...");
 walletInfo.setAttribute("aria-live","polite");
 const chessSelect=game==="chess"?mk("select","arena-chess-time-select"):null;
 const chessPicker=game==="chess"?mk("label","arena-chess-time-picker"):null;
 if(chessSelect){
  chessSelect.id="arenaSocialChessTime";
  const groups={Bullet:[["1+0","1+0"],["2+1","2+1"]],
   Blitz:[["3+0","3+0"],["3+2","3+2"],["5+0","5+0"],["5+3","5+3"]],
   Rapid:[["10+0","10+0"],["10+5","10+5"],["15+10","15+10"],["30+0","30+0"]],
   "Luyện tập":[["none","Không đồng hồ"]]};
  Object.entries(groups).forEach(([title,options])=>{
   const group=mk("optgroup");group.label=title;
   options.forEach(([value,label])=>{const opt=mk("option","",label);opt.value=value;group.append(opt);});
   chessSelect.append(group);
  });
  chessSelect.value=getTimeControl();
  add(chessPicker,mk("span","","♟ THỜI GIAN MỖI BÊN"),chessSelect);
 }
 const group=mk("div","arena-social-tier-grid");
 group.setAttribute("role","radiogroup");group.setAttribute("aria-label","Mức G mỗi lá hoặc mỗi ván");
 const radios=[];
 GOLD_TIERS.forEach((tier,i)=>{
  const label=mk("label","arena-social-tier");
  const radio=mk("input");radio.type="radio";radio.name="arenaStake";
  radio.value=String(tier);radio.checked=i===0;
  const text=mk("span","arena-social-tier-name",formatG(tier));
  const risk=mk("small","arena-social-risk","Cần "+formatG(requiredGold(game,tier)));
  add(label,radio,text,risk);group.append(label);radios.push(radio);
 });
 const visibilityLabel=mk("label","arena-social-public");
 const isPublic=mk("input");isPublic.type="checkbox";isPublic.id="arenaSocialPublic";
 add(visibilityLabel,isPublic,mk("span","","Công khai bàn cho người khác tìm thấy"));
 const tierFoot=mk("p","arena-social-rule","Mức bàn tính bằng G; khi đủ người và sẵn sàng, máy chủ sẽ kiểm tra và giữ G bảo đảm theo luật chơi.");
 const createButton=mk("button","arena-social-submit","TẠO BÀN");createButton.type="button";createButton.disabled=true;
 const createStatus=mk("p","arena-social-status","");createStatus.setAttribute("role","status");
 add(create,walletInfo,...(chessPicker?[chessPicker]:[]),group,visibilityLabel,tierFoot,createButton,createStatus);
 const join=mk("section","arena-social-content");join.id="arenaSocialJoin";join.setAttribute("role","tabpanel");
 const joinIntro=mk("p","arena-social-join-intro","Nhập mã bàn 8 ký tự gồm chữ và số. Có thể dán mã bạn bè gửi.");
 const entry=mk("div","arena-social-code");
 const codeInput=mk("input");codeInput.id="arenaSocialCode";codeInput.type="text";codeInput.maxLength=10;
 codeInput.placeholder="________";codeInput.autocomplete="off";codeInput.autocapitalize="characters";codeInput.spellcheck=false;
 codeInput.setAttribute("aria-label","Mã bàn gồm 8 ký tự chữ và số");
 codeInput.setAttribute("inputmode","text");
 const paste=mk("button","arena-social-paste","Dán");paste.type="button";
 add(entry,codeInput,paste);
 const keypad=mk("div","arena-social-keypad");
 keypad.setAttribute("aria-label","Bàn phím số hỗ trợ nhập mã");
 for(const label of ["1","2","3","4","5","6","7","8","9","⌫","0","X"]){
  const b=mk("button","arena-social-key",label);b.type="button";b.dataset.key=label;
  b.addEventListener("click",()=>{
   const clean=normalizeRoomCode(codeInput.value);
   if(label==="⌫")codeInput.value=clean.slice(0,-1);
   else if(label==="X")codeInput.value="";
   else codeInput.value=(clean+label).slice(0,8);
   codeInput.dispatchEvent(new Event("input",{bubbles:true}));
  });
  keypad.append(b);
 }
 const note=mk("p","arena-social-note","Các mã bàn dùng cả chữ A–Z và số 2–9. Nhập chữ trực tiếp bằng bàn phím hoặc dán toàn bộ mã.");
 const joinButton=mk("button","arena-social-submit","VÀO BÀN");joinButton.type="button";
 const joinStatus=mk("p","arena-social-status","");joinStatus.setAttribute("role","status");
 add(join,joinIntro,entry,keypad,note,joinButton,joinStatus);
 const footer=mk("p","arena-social-footer","MR LEE · "+gameName+" · Vàng G là điểm ảo, không phải tiền thật.");
 add(shell,heading,tabs,create,join,footer);dialog.append(shell);document.body.append(dialog);
 let busy=false;
 let wallet=null;
 function chooseTab(next){
  const isCreate=next==="create";
  create.hidden=!isCreate;join.hidden=isCreate;
  createTab.setAttribute("aria-selected",String(isCreate));joinTab.setAttribute("aria-selected",String(!isCreate));
  createTab.tabIndex=isCreate?0:-1;joinTab.tabIndex=isCreate?-1:0;
  createStatus.textContent="";joinStatus.textContent="";
  if(!isCreate)codeInput.focus();
 }
 function updateWallet(data){
  wallet=data;
  const amount=Number(data?.gold);
  walletInfo.textContent=Number.isFinite(amount)?"Ví hiện có: "+formatG(amount)+" · Mỗi mức cược yêu cầu số G bảo đảm khác nhau.":"Không thể xác minh ví G.";
  for(const radio of radios){
   radio.disabled=!Number.isFinite(amount)||amount<requiredGold(game,Number(radio.value));
  }
  if(!radios.some(x=>x.checked&&!x.disabled)){
   const first=radios.find(x=>!x.disabled);
   if(first)first.checked=true;
  }
  createButton.disabled=!radios.some(x=>x.checked&&!x.disabled);
  if(!Number.isFinite(amount))createStatus.textContent="Không thể tạo bàn khi chưa xác minh được ví G.";
  else if(createButton.disabled)createStatus.textContent="Số dư chưa đủ cho mức 5G. Hãy đổi điểm học tập sang G.";
 }
 async function refreshWallet(){
  try{const result=await roomRequest("wallet",{},"GET");updateWallet(result.wallet);onWallet?.(result.wallet);}
  catch(e){updateWallet(null);createStatus.textContent=e?.message||"Chưa thể tải ví G.";}
 }
 function setBusy(value){
  busy=value;createButton.disabled=value||!wallet||!radios.some(x=>x.checked&&!x.disabled);
  joinButton.disabled=value;
  close.disabled=value;
  createTab.disabled=value;joinTab.disabled=value;
 }
 function open(tab="create"){
  if(!dialog.open)dialog.showModal();
  chooseTab(tab);
  if(chessSelect)chessSelect.value=getTimeControl();
  void refreshWallet();
 }
 function closeDialog(){
  if(!busy&&dialog.open)dialog.close();
 }
 function accepted(room){
  if(!room||!legalCode(room.code))throw new Error("Máy chủ chưa trả mã bàn hợp lệ.");
  if(room.game!==game){
   // Joining a valid invite adds the user to that server-owned room.
   // Navigate to its actual game instead of leaving a hidden membership.
   const page={tienlen:"game-tien-len.html",chess:"game-co-vua.html",colors:"game-bai-mau.html"}[room.game];
   if(!page)throw new Error("Không nhận diện được trò chơi của mã bàn.");
   if(dialog.open)dialog.close();
   const url=new URL(page,location.href);url.searchParams.set("room",room.code);
   location.assign(url.href);return;
  }
  if(dialog.open)dialog.close();
  onAccepted(room);
 }
 async function doCreate(){
  if(busy)return;
  const choice=radios.find(x=>x.checked);
  const tier=Number(choice?.value);
  if(!GOLD_TIERS.includes(tier)||choice?.disabled){createStatus.textContent="Hãy chọn mức G đang đủ điều kiện.";return;}
  setBusy(true);createStatus.textContent="Đang tạo bàn và nhận mã từ máy chủ...";
  try{
   const result=await roomRequest("create",{
    game,nickname:nickname(),minGold:tier,visibility:isPublic.checked?"public":"private",
     ...(chessSelect?{timeControl:chessSelect.value}:{})
   });
   accepted(result.room);
  }catch(error){createStatus.textContent=error?.message||"Không thể tạo bàn.";}
  finally{setBusy(false);}
 }
 async function doJoin(){
  if(busy)return;
  const code=normalizeRoomCode(codeInput.value);
  if(!legalCode(code)){joinStatus.textContent="Mã bàn phải gồm đúng 8 ký tự A–Z hoặc 2–9.";codeInput.focus();return;}
  setBusy(true);joinStatus.textContent="Đang xác minh và vào bàn "+code+"...";
  try{
   const result=await roomRequest("join",{code,nickname:nickname()});
   accepted(result.room);
  }catch(error){joinStatus.textContent=error?.message||"Không thể vào bàn.";}
  finally{setBusy(false);}
 }
 close.addEventListener("click",closeDialog);
 dialog.addEventListener("click",event=>{if(event.target===dialog)closeDialog();});
 dialog.addEventListener("cancel",event=>{if(busy)event.preventDefault();});
 createTab.addEventListener("click",()=>chooseTab("create"));
 joinTab.addEventListener("click",()=>chooseTab("join"));
 createButton.addEventListener("click",()=>void doCreate());
 joinButton.addEventListener("click",()=>void doJoin());
 for(const radio of radios)radio.addEventListener("change",()=>{createStatus.textContent="";
  createButton.disabled=busy||!radios.some(x=>x.checked&&!x.disabled);
 });
 codeInput.addEventListener("input",()=>{const p=codeInput.selectionStart;codeInput.value=normalizeRoomCode(codeInput.value).slice(0,8);
  try{codeInput.setSelectionRange(Math.min(p,8),Math.min(p,8));}catch{}
  joinStatus.textContent="";
 });
 codeInput.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();void doJoin();}});
 paste.addEventListener("click",async()=>{
  try{codeInput.value=normalizeRoomCode(await navigator.clipboard.readText()).slice(0,8);codeInput.dispatchEvent(new Event("input",{bubbles:true}));}
  catch{joinStatus.textContent="Trình duyệt không cho dán tự động. Hãy nhấn giữ ô mã rồi chọn Dán.";}
 });
 chooseTab("create");
 return {open,close:closeDialog,refreshWallet,dialog};
}
