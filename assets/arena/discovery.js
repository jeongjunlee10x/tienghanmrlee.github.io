/* MR LEE Discover. Original UI; never uses or imports Facebook Gaming code. */
const catalog=document.getElementById("arenaCatalog");
if(catalog){
 const $=id=>document.getElementById(id);
 const details={
  colors:{name:"Bài Màu Đại Chiến",group:["card","fun"],tag:"🃏 Game bài",online:true},
  chess:{name:"Cờ Vua",group:["board","strategy"],tag:"♟️ Cờ chiến thuật",online:true},
  tienlen:{name:"Tiến Lên Miền Nam",group:["card"],tag:"🃏 Game bài",online:true},
  ludo:{name:"Cờ Cá Ngựa",group:["board","fun"],tag:"🎲 Bàn cờ",online:false},
  xiangqi:{name:"Cờ Tướng / Cờ Úp",group:["board","strategy"],tag:"♜ Chiến thuật",online:false},
  estate:{name:"Địa Ốc Đại Chiến",group:["strategy","fun"],tag:"🏙️ Mô phỏng",online:false}
 };
 const storageKey="mrlee.arena.discovery.v1";
 function stored(){
  try{
   const value=JSON.parse(localStorage.getItem(storageKey)||"{}");
   return {favorites:Array.isArray(value.favorites)?value.favorites.filter(x=>x in details):[],
    recent:Array.isArray(value.recent)?value.recent.filter(x=>x in details).slice(0,6):[]};
  }catch{return {favorites:[],recent:[]};}
 }
 let preference=stored(),filter="all";
 const cards=[...catalog.querySelectorAll(".arena-game-card")].map((card,index)=>{
  const action=card.querySelector("[data-game]"),online=card.querySelector("[data-room-game]");
  const id=action?.dataset.game||online?.dataset.roomGame;
  if(!id||!details[id])return null;
  const meta=details[id];
  card.dataset.gameId=id;card.dataset.search=meta.name.toLocaleLowerCase("vi-VN").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
  card.dataset.originalOrder=String(index);
  const banner=card.querySelector(".arena-card-banner");
  const favorite=document.createElement("button");
  favorite.type="button";favorite.className="arena-game-favorite";
  favorite.dataset.favorite=id;favorite.setAttribute("aria-label","Thêm "+meta.name+" vào yêu thích");
  favorite.title="Đánh dấu yêu thích";banner.after(favorite);
  const tags=document.createElement("div");tags.className="arena-game-meta";
  for(const [text,cls] of [[meta.tag,""],[meta.online?"🟢 Có PvP":"🤖 Đấu máy",meta.online?"arena-game-online":"arena-game-offline"]]){
   const tag=document.createElement("span");tag.textContent=text;if(cls)tag.className=cls;tags.append(tag);
  }
  card.querySelector(".arena-card-body")?.append(tags);
  return {id,meta,card,index,favorite};
 }).filter(Boolean);
 function save(){
  try{localStorage.setItem(storageKey,JSON.stringify(preference));}catch{}
 }
 function normalized(s){return String(s||"").toLocaleLowerCase("vi-VN").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").trim();}
 function redraw(){
  const query=normalized($("arenaGameSearch").value),sort=$("arenaGameSort").value;
  catalog.dataset.activeFilter=filter;
  catalog.dataset.activeSort=sort;
  catalog.dataset.hasSearch=String(Boolean(query));
  const filtered=cards.filter(({id,meta,card})=>{
   const group=filter==="all"||filter==="favorite"&&preference.favorites.includes(id)||
    filter==="recent"&&preference.recent.includes(id)||
    filter==="online"&&meta.online||meta.group.includes(filter);
   return group&&(!query||card.dataset.search.includes(query));
  });
  const display=[...filtered].sort((a,b)=>sort==="alphabetic"?a.meta.name.localeCompare(b.meta.name,"vi"):
   sort==="recent"||filter==="recent"?
    (preference.recent.indexOf(a.id)<0?999:preference.recent.indexOf(a.id))-
    (preference.recent.indexOf(b.id)<0?999:preference.recent.indexOf(b.id)):a.index-b.index);
  for(const item of cards){
   item.card.hidden=!filtered.includes(item);
   item.favorite.textContent=preference.favorites.includes(item.id)?"★":"☆";
   item.favorite.setAttribute("aria-pressed",String(preference.favorites.includes(item.id)));
   item.favorite.setAttribute("aria-label",(preference.favorites.includes(item.id)?"Bỏ ":"Thêm ")+item.meta.name+(preference.favorites.includes(item.id)?" khỏi":" vào")+" yêu thích");
  }
  // Move nodes, don't rebuild them: all existing Arena and PvP handlers stay alive.
  for(const item of display)catalog.append(item.card);
  $("arenaGameCount").textContent=display.length+"/"+cards.length+" trò chơi";
  $("arenaGameEmpty").hidden=display.length>0;
  document.querySelectorAll("[data-arena-filter]").forEach(button=>{
   button.setAttribute("aria-pressed",String(button.dataset.arenaFilter===filter));
  });
 }
 catalog.addEventListener("click",event=>{
  const favorite=event.target.closest("[data-favorite]");
  if(favorite){
   const id=favorite.dataset.favorite;
   preference.favorites=preference.favorites.includes(id)?
    preference.favorites.filter(x=>x!==id):[...preference.favorites,id];
   save();redraw();return;
  }
  const play=event.target.closest("[data-game],[data-room-game]");
  if(!play)return;
  const id=play.dataset.game||play.dataset.roomGame;
  if(!(id in details))return;
  preference.recent=[id,...preference.recent.filter(x=>x!==id)].slice(0,6);
  save(); // Recently played appears on subsequent lobby visits.
 });
 document.querySelectorAll("[data-arena-filter]").forEach(b=>b.addEventListener("click",()=>{
  filter=b.dataset.arenaFilter;redraw();
 }));
 $("arenaGameSearch").addEventListener("input",redraw);
 $("arenaGameSort").addEventListener("change",redraw);
 $("arenaGameSearch").addEventListener("keydown",e=>{if(e.key==="Escape"){$("arenaGameSearch").value="";redraw();}});
 $("arenaDiscoverRewards").addEventListener("click",()=>{
  $("arenaDailyOpen")?.click();
 });
 redraw();
}
