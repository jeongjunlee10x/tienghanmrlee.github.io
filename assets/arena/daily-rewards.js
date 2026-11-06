/* Daily Game Zone rewards. Server chooses prize and prevents repeat credit. */
import {roomRequest,formatG} from "./room-api.js";
const PRIZES=[100,200,300,500,800,1000,1500,2000,3000,5000];
const COLORS=["#224687","#c93668","#078b83","#ae5d24","#634db5",
              "#1473af","#ba4261","#238657","#b98a20","#7354a3"];
const $=id=>document.getElementById(id);
function shuffle(arr){
 const a=[...arr];for(let i=a.length-1;i>0;i--){
  const rand=new Uint32Array(1);crypto.getRandomValues(rand);
  const j=rand[0]%(i+1);[a[i],a[j]]=[a[j],a[i]];
 }return a;
}
export function prizeLayout(){
 const low=shuffle(PRIZES.slice(0,5)),high=shuffle(PRIZES.slice(5));
 const flipped=crypto.getRandomValues(new Uint32Array(1))[0]%2;
 return Array.from({length:10},(_,i)=>(i+flipped)%2?high[Math.floor(i/2)]:low[Math.floor(i/2)]);
}
export function mountDailyRewards(){
 const trigger=$("arenaDailyOpen")||$("mzDailyOpen");if(!trigger)return null;
 const dialog=document.createElement("dialog");dialog.className="arena-daily-dialog";dialog.id="arenaDailyDialog";
 dialog.setAttribute("aria-labelledby","arenaDailyTitle");
 dialog.innerHTML=[
  '<div class="arena-daily-shell">',
  '<div class="arena-daily-heading"><div><small>MR LEE GAME ZONE · THƯỞNG MỖI NGÀY</small><h2 id="arenaDailyTitle">🎁 Điểm danh & Vòng quay may mắn</h2>',
  '<p>Phần thưởng tự động lưu trên máy chủ · Theo giờ Việt Nam</p></div>',
  '<button type="button" id="arenaDailyClose" class="arena-daily-close" aria-label="Đóng">✕</button></div>',
  '<div class="arena-daily-grid">',
  '<section class="arena-daily-checkin"><div class="arena-daily-gift">🪙</div><h3>Điểm danh mỗi ngày</h3>',
  '<strong class="arena-daily-award">+1.000G <span>và</span> +1 điểm học tập</strong>',
  '<p>1 điểm học tập xác minh của Game Zone có thể đổi thành 10G.</p>',
  '<button type="button" id="arenaDailyCheckButton" class="arena-daily-primary" disabled>✓ Nhận quà hôm nay</button>',
  '<small id="arenaDailyCheckStatus"></small></section>',
  '<section class="arena-daily-spin"><h3>🎡 Vòng quay may mắn</h3>',
  '<p>10 ô thưởng xếp xen kẽ ngẫu nhiên, từ 100G đến 5.000G</p>',
  '<div class="arena-wheel-container"><div class="arena-wheel-pointer" aria-hidden="true"></div>',
  '<div id="arenaWheelDisk" class="arena-wheel-disk" role="img" aria-label="Vòng quay 10 ô thưởng từ 100 đến 5000 vàng">',
  '<div id="arenaWheelLabels" class="arena-wheel-labels"></div><div class="arena-wheel-hub">MR<br>LEE</div></div>',
  '<div id="arenaWheelResult" class="arena-wheel-result" role="status" aria-live="polite" hidden></div></div>',
  '<button type="button" id="arenaDailySpinButton" class="arena-daily-primary" disabled>🎯 QUAY NGAY</button>',
  '<small id="arenaDailySpinStatus"></small></section></div>',
  '<div class="arena-daily-footer"><span>🪙 Ví G: <strong id="arenaDailyBalance">—</strong></span>',
  '<span>📚 Điểm có thể đổi: <strong id="arenaDailyPoints">—</strong></span>',
  '<span id="arenaDailyDay"></span></div>',
  '<p id="arenaDailyError" class="arena-daily-error" role="status" aria-live="polite" hidden></p>',
  '<p class="arena-daily-disclaimer">G là vàng ảo, không đổi ra tiền thật. Điểm học tập xác minh trong Game Zone không tự cộng vào điểm kiểm tra, TOPIK Spark hay bảng xếp hạng học thuật.</p>',
  '</div>'
 ].join("");
 document.body.append(dialog);
 let daily=null,busy=false,rolling=false;
 const layout=prizeLayout(),disk=$("arenaWheelDisk"),labels=$("arenaWheelLabels");
 const btnCheck=$("arenaDailyCheckButton"),btnSpin=$("arenaDailySpinButton");
 const angle=360/layout.length;
 disk.style.background="conic-gradient("+layout.map((_,i)=>COLORS[i]+" "+(i*angle)+"deg "+((i+1)*angle)+"deg").join(",")+")";
 layout.forEach((value,i)=>{
  const deg=(i+.5)*angle,radians=(deg-90)*Math.PI/180;
  const label=document.createElement("span");label.className="arena-wheel-label";
  label.textContent=formatG(value);
  label.style.left=(50+33*Math.cos(radians))+"%";
  label.style.top=(50+33*Math.sin(radians))+"%";
  label.style.transform="translate(-50%,-50%) rotate("+(-deg)+"deg)";
  labels.append(label);
 });
 function updateWallet(wallet){
  if(!wallet)return;
  for(const id of ["arenaVerifiedGold","roomAvailableGold","mzDailyBalance","arenaDailyBalance"])
   if($(id))$(id).textContent=formatG(wallet.gold);
  for(const id of ["arenaDailyPoints","roomVerifiedPoints"])
   if($(id))$(id).textContent=String(wallet.availablePoints??0);
 }
 function update(){
  if(!daily)return;
  btnCheck.disabled=busy||daily.checkedIn;
  btnCheck.textContent=daily.checkedIn?"✓ Đã nhận 1.000G + 1 điểm":"✓ Nhận quà hôm nay";
  $("arenaDailyCheckStatus").textContent=daily.checkedIn?"Hẹn gặp lại ngày mai!":"Chưa điểm danh hôm nay";
  btnSpin.disabled=busy||rolling||daily.spun;
  btnSpin.textContent=rolling?"🎡 Đang quay...":daily.spun?"✓ Đã quay hôm nay":"🎯 QUAY NGAY";
  $("arenaDailySpinStatus").textContent=rolling?"🎡 Vòng quay đang chạy · kết quả sau 4,8 giây":
   daily.spun?"Hôm nay đã trúng "+formatG(daily.spinGold)+" · Mai quay tiếp":
   "Bạn có một lượt quay miễn phí hôm nay";
  $("arenaDailyDay").textContent="📅 "+daily.day.split("-").reverse().join("/");
  const pending=!daily.checkedIn||!daily.spun;
  trigger.classList.toggle("arena-daily-pending",pending);
 }
 function error(message){
  const node=$("arenaDailyError");node.textContent=message||"";node.hidden=!message;
 }
 function show(){if(!dialog.open)dialog.showModal();}
 async function refresh(auto=false){
  try{
   const result=await roomRequest("daily",{},"GET");
   daily=result.daily;updateWallet(result.wallet);update();error("");
   // Screenshot-style Game Arena shows daily rewards directly in its hero.
   // Preserve the automatic modal on Game Zone, but do not obscure Arena lobby.
   if(auto&&(!daily.checkedIn||!daily.spun)&&!document.documentElement.classList.contains("arena-reference-v1"))show();
  }catch(err){
   if(!auto){show();error(err.message||"Không kết nối được máy chủ.");}
  }
 }
 async function claim(kind){
  if(!daily||busy||rolling)return;
  busy=true;update();error("");
  try{
   const result=await roomRequest(kind==="spin"?"daily_spin":"daily_checkin",{});
   daily=result.daily;
   // For a new spin, do not reveal the balance/result until the wheel stops.
   const newlySpun=kind==="spin"&&!result.reward.already;
   if(!newlySpun)updateWallet(result.wallet);
   if(kind==="spin"){
    const award=Number(result.reward.awardedGold);
    const amount=result.reward.already?Number(daily.spinGold):award;
    if(!PRIZES.includes(amount))throw Error("Mức thưởng từ máy chủ không hợp lệ.");
    if(!result.reward.already){
     rolling=true;update();$("arenaWheelResult").hidden=true;
     const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
     const index=layout.indexOf(amount);
     const diskContainer=disk.closest(".arena-wheel-container");
     const rotations=2880+((360-(index+.5)*angle)%360+360)%360;
     disk.style.transitionDuration=reduced?"0ms":"4800ms";
     diskContainer?.classList.add("arena-wheel-rolling");
     disk.setAttribute("aria-busy","true");
     disk.style.transform="rotate("+rotations+"deg)";
     await new Promise(done=>setTimeout(done,reduced?0:4850));
     diskContainer?.classList.remove("arena-wheel-rolling");
     diskContainer?.classList.add("arena-wheel-won");
     disk.setAttribute("aria-busy","false");
     setTimeout(()=>diskContainer?.classList.remove("arena-wheel-won"),1600);
     updateWallet(result.wallet);
     rolling=false;
    }
    $("arenaWheelResult").textContent="🎉 +"+formatG(amount);
    $("arenaWheelResult").hidden=false;
   }else if(!result.reward.already){
    $("arenaDailyCheckStatus").textContent="🎉 Đã nhận 1.000G và 1 điểm!";
   }
  }catch(e){error(e.message||"Lỗi nhận thưởng.");await refresh();}
  finally{busy=false;rolling=false;update();}
 }
 trigger.addEventListener("click",()=>{show();void refresh();});
 $("arenaDailyClose").addEventListener("click",()=>{if(!rolling)dialog.close();});
 dialog.addEventListener("cancel",e=>{if(rolling)e.preventDefault();});
 dialog.addEventListener("click",e=>{if(e.target===dialog&&!rolling)dialog.close();});
 btnCheck.addEventListener("click",()=>void claim("checkin"));
 btnSpin.addEventListener("click",()=>void claim("spin"));
 void refresh(true);
 return {open:show,refresh:()=>refresh()};
}
if(typeof document!=="undefined")mountDailyRewards();
