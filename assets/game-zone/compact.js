/* Game Zone compact controls. Keeps lesson modes/verified XP mechanics unchanged. */
const $=id=>document.getElementById(id);
const arena=$("mzArena"),fullscreen=$("mzFullscreen"),feedback=$("mzFeedback"),toast=$("mzArenaToast");
let toastTimer=null;
function showToast(){
 if(!arena||arena.hidden||!feedback||!toast)return;
 const text=feedback.textContent.trim();
 if(!text){toast.hidden=true;return;}
 toast.textContent=text.slice(0,190);
 toast.hidden=false;
 if(feedback.dataset.good==="true")toast.dataset.good="true";
 else if(feedback.dataset.good==="false")toast.dataset.good="false";
 else toast.removeAttribute("data-good");
 clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>{toast.hidden=true;},2600);
}
if(feedback&&toast){
 const observer=new MutationObserver(showToast);
 observer.observe(feedback,{subtree:true,characterData:true,childList:true,attributes:true,attributeFilter:["data-good"]});
}
const exitFallback=()=>{
 arena?.classList.remove("mz-fullscreen-fallback");
 document.body.classList.remove("mz-game-fullscreen");
};
fullscreen?.addEventListener("click",async()=>{
 if(!arena)return;
 if(document.fullscreenElement===arena){await document.exitFullscreen();return;}
 if(arena.classList.contains("mz-fullscreen-fallback")){exitFallback();return;}
 try{
  if(!arena.requestFullscreen)throw Error("Browser not supported");
  await arena.requestFullscreen();
 }catch{
  arena.classList.add("mz-fullscreen-fallback");
  document.body.classList.add("mz-game-fullscreen");
 }
});
document.addEventListener("keydown",event=>{
 if(event.key==="Escape")exitFallback();
});
document.addEventListener("fullscreenchange",()=>{
 if(fullscreen)fullscreen.textContent=document.fullscreenElement===arena?"↙ Thu nhỏ":"⛶ Toàn màn hình";
});
