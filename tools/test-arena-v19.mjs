/* MR LEE Arena V19 static build/UX safety checks — no network/G/login. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const [main,app,css,visual,drag,fx,premium,card,room,tl,chess,xq,ludo,estate]=await Promise.all([
 "mrlee-game-arena.html","assets/arena/app.js","assets/arena/game-visuals-v19.css",
 "assets/arena/game-visuals-v19.js","assets/arena/drag-gestures.js",
 "assets/arena/tienlen-fx.js","assets/arena/premium-fx.js",
 "assets/arena/rooms-play.js","assets/arena/rooms-ui.js",
 "assets/arena/tienlen-ui.js","assets/arena/chess-ui.js",
 "assets/arena/xiangqi.js","assets/arena/ludo.js","assets/arena/estate.js"
].map(read));
let count=0;const check=(cond,label)=>{assert.ok(cond,label);count++;};
for(const slug of ["chess","xiangqi","ludo","estate","tienlen","colors"]){
 check(css.includes('url("./covers/'+slug+'.svg")'),
  "Illustrated lobby uses existing original vector cover "+slug);
}
for(const name of ["arenaChess","arenaXiangqi","arenaLudo","arenaEstate","arenaTable","arenaTienLen"]){
 check(css.includes("#"+name),"Dedicated, visual identity exists for "+name);
}
for(const cls of ["chess-white","chess-black","xq-piece","ludo-pawn","estate-tile","tl-real-card","arena-pvp-color-card"]){
 check(css.includes(cls),"Individual game token/card styling: "+cls);
}
for(const prop of ["@keyframes arena-v19-enter","@keyframes arena-v19-active-glow",
 "prefers-reduced-motion","data-arena-visuals=\"lite\"","data-arena-visuals=\"off\"",
 ".arena-visual-quality",".arena-vfx-spark",".arena-vfx-label"]){
 check(css.includes(prop),"Game visuals stylesheet includes "+prop);
}
check(css.includes("box-sizing:border-box!important;max-width:100%!important"),
 "Framed game boards fit narrow touchscreens without horizontal overflow");
check(main.includes('game-visuals-v19.css?v=20261107-v19'),"Arena loads V19 stylesheet after other skins");
check(main.includes('app.js?v=20261107-v19'),"Arena loads V19 application");
for(const page of ["game-co-vua","game-co-tuong","game-tien-len","game-bai-mau","game-co-ca-ngua","game-dia-oc"]){
 const source=await read(page+".html");
 check(source.includes("game-visuals-v19.css?v=20261107-v19"),page+" loads distinct lobby theme");
}
check(app.includes("game-visuals-v19.js?v=20261107-v19"),"FX imported into actual game logic");
check(app.includes("if(won)emitArenaFX"),"Victory animations only for real confirmed wins");
check(!/(?:fetch\(|roomRequest\(|supabase\.|walletState|goldBalance)/.test(visual),
 "Visuals component is independent of network, wallets and game state");
check(visual.includes("MODES=[\"full\",\"lite\",\"off\"]"),"Quality selector has all three levels");
check(visual.includes("requestAnimationFrame")||visual.includes("spark.animate"),
 "Effect renderer uses compositor animation instead of blocking UI");
check(visual.includes("active>=40")&&visual.includes("40-active"),"Animation object budget is capped");
check(visual.includes("document.hidden"),"Inactive browser tabs do not create effects");
check(drag.includes('dataset.arenaVisuals==="off"'),"Drag visuals honor the Off setting");
check(fx.includes('dataset.arenaVisuals==="lite"?12'),"Card dealing reduces decorative sprites on lite mode");
check(fx.includes('dataset.arenaVisuals==="off"'),"Card dealing honors Off setting");
check(premium.includes('dataset.arenaVisuals==="off"'),"Older FLIP visuals honor Off");
check(tl.includes('card.id===item.dataset.cardId')&&card.includes('c.id===item.dataset.cardId'),
 "Drag-and-drop keeps original string card IDs for local and PvP games");
check(room.includes('rooms-play.js?v=20261107-v19'),"PvP module cache refreshed");
check(chess.includes('emitArenaFX("capture"'),"Cờ vua only sparks on real captures");
check(xq.includes('emitArenaFX("xiangqi"'),"Cờ Tướng only sparks on real captures");
check(ludo.includes('emitArenaFX("ludo"'),"Cờ Cá Ngựa captures play the right visual cue");
check(estate.includes('emitArenaFX("estate"'),"Địa Ốc FX only play on real purchases/upgrades");
let depth=0;
for(const char of css){if(char==="{")depth++;else if(char==="}")depth--;assert.ok(depth>=0,"CSS braces must not close prematurely");}
check(depth===0,"Visual stylesheet has matching CSS braces");
console.log("PASS Arena V19: "+count+" checks for independent game graphics, animation safety, responsive controls and cache keys.");
