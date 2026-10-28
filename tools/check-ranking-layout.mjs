import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/branding/home-ranking-repair.css','utf8');
const js=fs.readFileSync('assets/branding/home-ranking-repair.js','utf8');
const before=html.indexOf('home-hero-overlay-v3.css'),after=html.indexOf('home-ranking-repair.css');
assert.ok(before>=0&&after>before,'Ranking repair must override the legacy/recovery stylesheet');
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
