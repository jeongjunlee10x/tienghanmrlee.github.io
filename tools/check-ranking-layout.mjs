import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/branding/home-ranking-repair.css','utf8');
const js=fs.readFileSync('assets/branding/home-ranking-repair.js','utf8');
assert.ok(html.includes('home-ranking-repair.css'),'Existing live leaderboard repair stylesheet must remain loaded');
assert.ok(html.includes('assets/mrlee-ui2027/rebuild-home-v2.css'),'Current homepage V2 must be loaded');
assert.ok(html.indexOf('home-ranking-repair.css')<html.indexOf('rebuild-home-v2.css'),'2027 homepage styles must be last');
assert.ok(html.includes('id="mrlee27Expand"') && fs.readFileSync('assets/mrlee-ui2027/rebuild-home-v2.js','utf8').includes('mrleeSmartExpanded'),'Users must still be able to expand the live leaderboard');
assert.match(html,/home-ranking-repair\.js/,'Live badge moving script must load on homepage');
for(const needle of ['#mainContent>.mrlee-bottom-pair','grid-template-rows:auto minmax(75px,1fr)',
  '.rank-strip-wrap','.rank-controls','.mrlee-rank-v304-card','#mrleeV12Widget',
  '#mrleeContactDock[data-open="true"]','@media(max-width:760px)']){
 assert.ok(css.includes(needle),'Missing responsive ranking repair: '+needle);
}
for(const needle of ['rank?.querySelector(\'.rank-title\')','getElementById(\'mrleeV12Widget\')',
  'title.append(badge)','new MutationObserver']){
 assert.ok(js.includes(needle),'Missing score integration: '+needle);
}
assert.match(css,/height:auto!important;min-height:155px!important;max-height:none!important/,
 'The outdated fixed 108/112px ranking height must be overridden');
assert.match(html,/id="rankSlider"/);
assert.match(html,/id="rankPrev"/);
assert.match(html,/id="rankNext"/);
assert.match(html,/hoc-bong-han-quoc\.html/);
execFileSync(process.execPath,['--check','assets/branding/home-ranking-repair.js'],{stdio:'pipe'});
console.log('PASS homepage scholarship and live ranking: responsive dimensions, controls, inline points and closed-by-default contacts');
