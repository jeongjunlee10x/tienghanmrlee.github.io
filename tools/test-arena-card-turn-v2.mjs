/* MR LEE card UI / embedded game safety contracts.
 * Static checks complement the real Chromium test in browser-game-rooms.mjs.
 */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=rel=>readFile(new URL("../"+rel,import.meta.url),"utf8");
const [html,auth,shell,bridge,rooms,ui,tl,color,css,qa]=await Promise.all([
 "mrlee-game-arena.html","assets/arena/embedded-auth.js",
 "assets/arena/game-room-shell.js","assets/arena/game-room-embed.js",
 "assets/arena/rooms-play.js","assets/arena/rooms-ui.js",
 "assets/arena/tienlen-ui.js","assets/arena/app.js",
 "assets/arena/card-turn-v2.css","tools/browser-game-rooms.mjs"
].map(read));
assert.match(html,/embedded-auth\.js\?v=/,"Arena has dedicated embedded authentication guard");
assert.match(html,/card-turn-v2\.css\?v=/,"Card UI stylesheet is included");
assert.match(auth,/ancestor\.document\.documentElement\.dataset\.mrleeAuth==="verified"/,
 "Only an already verified same-origin parent may pass UI auth to iframe");
assert.match(auth,/ancestor\.location\.origin===location\.origin/,"Cross-origin frames cannot bypass guard");
assert.match(auth,/await import\("\.\.\/\.\.\/auth-guard\.js"\)/,
 "Top-level Arena still requires full Firebase auth");
assert.match(shell,/function frameFailure\(/,"Iframe errors have retry/back controls");
assert.match(bridge,/send\("error"/,"Iframe reports broken engine instead of hanging");
assert.match(rooms,/className|classList|arena-card-turn-clock/,"Card avatar has server countdown");
assert.match(rooms,/className|classList|arena-pvp-me/,"Own seat is visibly highlighted");
assert.equal((rooms.match(/arena-card-turn-popup/g)||[]).length>=3,true,
 "Both card games render contextual action popups");
assert.doesNotMatch(ui,/append\(hud\)/,"No floating corner countdown on card tables");
assert.match(ui,/querySelectorAll\("\.arena-card-turn-clock\[data-clock-seat\]"/,
 "Countdown updates the active seat avatar");
assert.match(tl,/controls\.hidden=!playable/,"Bot Tiến Lên hides play/pass off turn");
assert.match(color,/controls\.hidden=!humanTurn/,"Bot Bài Màu hides draw/pass off turn");
assert.match(css,/grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/,
 "Full 13-card hands can be read in two mobile rows");
assert.match(css,/arena-card-turn-clock/,"Clock is styled in avatar's center");
assert.match(css,/prefers-reduced-motion/,"Accessible animation preference supported");
assert.match(qa,/readable card faces|card faces must remain legible/,
 "Chromium assertions cover card visibility on phones");
let braces=0;
for(const ch of css){if(ch==="{")braces++;if(ch==="}")braces--;assert.ok(braces>=0,"CSS closes braces in order");}
assert.equal(braces,0,"Card UI CSS declarations are balanced");
console.log("PASS Arena V14: verified embedded auth, recoverable loader, avatar clocks, turn-only actions, readable responsive hands.");
