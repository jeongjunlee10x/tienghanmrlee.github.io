import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/mrlee-v2/smart-shell.js','utf8');
const css=fs.readFileSync('assets/mrlee-ui2027/smart-home-v1.css','utf8');
const theme=fs.readFileSync('assets/mrlee-dual-ui/theme.js','utf8');
assert(html.includes('assets/mrlee-ui2027/smart-home-v1.css?v=20261101-p1'),'homepage loads new CSS');
assert(html.includes('TIẾNG HÀN MR LEE | Học tiếng Hàn'),'meta title updated');
assert(theme.includes('MRLEE.THEME.ENTRY.V1'),'existing entry picker preserved');
assert(theme.includes('assets/mrlee-ui2027/foundation-v1.css?v=20261101-p1'),'shared CSS loaded by theme engine');
const foundation=fs.readFileSync('assets/mrlee-ui2027/foundation-v1.css','utf8');
for(const rule of ['--mrlee27-font:','html[data-mrlee-theme="fresh"]','html[data-mrlee-theme="future"]','focus-visible'])assert(foundation.includes(rule),'foundation missing '+rule);
assert.equal((js.match(/\{title:'/g)||[]).length,8,'exactly eight primary homepage cards');
const cards=[...js.matchAll(/\{title:'([^']+)',desc:'([^']+)',href:'([^']+)',img:'([^']+)'\}/g)];
assert.equal(cards.length,8);
const targets=new Set(cards.map(x=>x[3].split('?')[0]));
const visuals=new Set(cards.map(x=>x[4]));
assert.equal(targets.size,8,'no duplicate routes');
assert.equal(visuals.size,8,'all eight use distinct images');
for(const card of cards){
 const src=path.join('assets/v306/images',card[4]);
 assert(fs.existsSync(src),'missing card image '+src);
 const bytes=fs.readFileSync(src);
 assert.equal(bytes.toString('ascii',0,4),'RIFF','invalid WebP RIFF '+src);
 assert.equal(bytes.toString('ascii',8,12),'WEBP','invalid WebP header '+src);
 assert(fs.existsSync(card[3].split('?')[0]),'missing card destination '+card[3]);
}
for(const token of [
 'html[data-mrlee-theme="fresh"][data-mrlee-smart-home="true"]',
 'html[data-mrlee-theme="future"][data-mrlee-smart-home="true"]',
 '#mrleeSmartHub .mrlee-smart-home-grid',
 'not([data-mrlee-smart-expanded="true"])',
 '@media(max-width:760px)',
 'prefers-reduced-motion'
]) assert(css.includes(token),'CSS rule missing '+token);
assert(js.includes("themeButton.id='mrleeChangeTheme'"));
assert(js.includes("toggle.id='mrleeSmartToggle'"));
assert(js.includes("sessionStorage.removeItem('MRLEE.THEME.ENTRY.V1')"));
assert(js.includes("root.dataset.mrleeSmartExpanded=String(expand)"));
for(const fname of ['01-trang-chu-fresh.webp','01-trang-chu-future.webp'])
 assert(fs.existsSync(path.join('assets/images/heroes',fname)),'hero artwork missing '+fname);
for(const src of ['assets/mrlee-v2/smart-shell.js','assets/mrlee-dual-ui/theme.js']){
 const result=spawnSync(process.execPath,['--check',src],{encoding:'utf8'});
 assert.equal(result.status,0,'invalid JS '+src+': '+result.stderr);
}
console.log('PASS Smart UI 2027: eight distinct verified WebP modules/routes, two existing themes and heroes, compact/expanded states, theme selection, JS syntax.');
