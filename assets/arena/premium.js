/* MR LEE Game Arena — exclusive illustrated game covers and board identity.
 * Decorative only. Never replaces game controls, game state, scoring or PvP DOM.
 */
const LOGO="assets/branding/logo-mrlee.png?v=20261026-meme1";
const DIRECTORY="assets/arena/covers/";
const meta=Object.freeze({
 colors:{name:"Bài Màu",subtitle:"SẮC MÀU ĐẠI CHIẾN",kicker:"4 NGƯỜI · GAME BÀI"},
 chess:{name:"Cờ Vua",subtitle:"CHINH PHỤC BÀN CỜ",kicker:"2 NGƯỜI · CHIẾN THUẬT"},
 tienlen:{name:"Tiến Lên",subtitle:"TIẾN LÊN MIỀN NAM",kicker:"4 NGƯỜI · GAME BÀI"},
 ludo:{name:"Cờ Cá Ngựa",subtitle:"ĐƯỜNG ĐUA SẮC MÀU",kicker:"4 NGƯỜI · XÚC XẮC"},
 xiangqi:{name:"Cờ Tướng",subtitle:"CỜ TƯỚNG · CỜ ÚP",kicker:"2 NGƯỜI · TRÍ TUỆ"},
 estate:{name:"Địa Ốc",subtitle:"ĐỊA ỐC ĐẠI CHIẾN",kicker:"4 NGƯỜI · MUA BÁN"}
});
const $=id=>document.getElementById(id);
function element(tag,klass,text){
 const n=document.createElement(tag);if(klass)n.className=klass;
 if(text!==undefined)n.textContent=text;return n;
}
function brandChip(game,pvp=false){
 const mark=element("span","arena-game-brand"+(pvp?" brand-pvp":""));
 mark.setAttribute("aria-label","MR LEE · "+meta[game].name);
 const image=document.createElement("img");image.src=LOGO;image.alt="";
 image.width=27;image.height=27;image.loading="lazy";
 const text=element("span","");
 text.append(element("strong","",meta[game].name),element("small","","MR LEE ORIGINAL"));
 mark.append(image,text);return mark;
}
for(const card of document.querySelectorAll("#arenaCatalog .arena-game-card")){
 const id=card.dataset.gameId||card.querySelector("[data-game]")?.dataset.game
  ||card.querySelector("[data-room-game]")?.dataset.roomGame;
 const info=meta[id];if(!info)continue;
 const banner=card.querySelector(".arena-card-banner");if(!banner)continue;
 const image=document.createElement("img");
 image.className="arena-cover-image";image.src=DIRECTORY+id+".svg";
 image.alt="";image.loading="lazy";image.decoding="async";
 const sticker=element("span","arena-cover-brand");
 const mini=document.createElement("img");mini.src=LOGO;mini.alt="";mini.width=24;mini.height=24;
 sticker.append(mini,document.createTextNode("MR LEE GAME"));
 const title=element("span","arena-cover-identity",info.subtitle);
 title.append(element("small","",info.kicker));
 banner.replaceChildren(image,sticker,title);banner.setAttribute("aria-hidden","true");
 card.dataset.premiumCover=id;
}
for(const [id,game] of Object.entries({
 arenaTable:"colors",arenaChess:"chess",arenaTienLen:"tienlen",
 arenaLudo:"ludo",arenaXiangqi:"xiangqi",arenaEstate:"estate"
})){
 const target=$(id)?.querySelector(".arena-table-heading");if(!target)continue;
 const brand=brandChip(game);
 brand.classList.add("arena-board-brand");
 target.append(brand);
}
if($("arenaPvPBoard")){
 const target=$("arenaPvPBoard").querySelector(".arena-table-heading");
 if(target){
  const mark=brandChip("chess",true);
  const title=$("roomBoardTitle");
  const sync=()=>{
   const name=title?.textContent?.toLowerCase()||"";
   const game=name.includes("tiến")?"tienlen":name.includes("màu")?"colors":"chess";
   const text=mark.querySelector("strong");if(text)text.textContent=meta[game].name;
  };
  target.append(mark);
  if(title)new MutationObserver(sync).observe(title,{childList:true,characterData:true,subtree:true});
  sync();
 }
}
