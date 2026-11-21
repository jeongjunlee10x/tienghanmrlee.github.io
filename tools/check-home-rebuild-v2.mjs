import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/mrlee-ui2027/rebuild-home-v2.css','utf8');
const js=fs.readFileSync('assets/mrlee-ui2027/rebuild-home-v2.js','utf8');
assert(html.includes('data-mrlee-redesign="v2"'),'V2 root switch not present');
assert.equal((html.match(/id="mrleeNewHome"/g)||[]).length,1);
assert(html.includes('rebuild-home-v2.css?v=20261103-nav-density-v10'));
assert(html.includes('rebuild-home-v2.js?v=20261121-v3phase2'));
assert(html.includes('theme.js?v=20261121-v3phase2'),'Homepage theme picker runtime cache must be current');
const root=html.match(/<section id="mrleeNewHome"[\s\S]*?<\/section>/)?.[0];
assert(root,'new design missing');
const cards=[...root.matchAll(/<a class="mr27-tile" data-key="([^"]+)" href="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"/g)];
assert.equal(cards.length,8,'8 genuine new tiles');
assert.equal(new Set(cards.map(x=>x[1])).size,8,'unique module types');
assert.deepEqual(cards.map(c=>c[1]),['learn','talk','topik','workbook','interview','map','culture','profile'],'8 routes must follow user journey');
assert(!root.includes('📍 Tìm trường tại Hàn Quốc'),'duplicate map navigation still visible');
assert.equal(new Set(cards.map(x=>x[2].split('?')[0])).size,8,'unique routes');
assert.equal(new Set(cards.map(x=>x[3])).size,8,'unique card art');
for(const c of cards){
 assert(fs.existsSync(c[2].split('?')[0]),'broken destination: '+c[2]);
 assert(fs.existsSync(c[3]),'broken image: '+c[3]);
 const bytes=fs.readFileSync(c[3]);
 assert.equal(bytes.toString('ascii',0,4),'RIFF',c[3]);
 assert.equal(bytes.toString('ascii',8,12),'WEBP',c[3]);
}
for(const f of [
 'assets/images/heroes/01-trang-chu-fresh.webp',
 'assets/images/heroes/01-trang-chu-future.webp'
])assert(fs.existsSync(f),'missing distinct hero '+f);
for(const s of [
 'html[data-mrlee-redesign="v2"]',
 '#mrleeNewHome .mr27-hero',
 '#mrleeNewHome .mr27-grid',
 '.mr27-tile[data-key="learn"]',
 '.mr27-tile[data-key="workbook"]',
 '.mr27-art-future{display:block!important}',
 '@media(max-width:650px)',
 '@media(prefers-reduced-motion:reduce)',
 'html[data-mrlee-redesign="v2"]:not([data-mrlee-smart-expanded="true"])'
]) assert(css.includes(s),'missing design selector '+s);
assert(js.includes("target.searchParams.set('select-theme','1')"),
 'Change-theme button must reopen the shared chooser explicitly');
assert(!js.includes("sessionStorage.removeItem('MRLEE.THEME.ENTRY.V1')"),
 'Change-theme button must preserve this tab\'s current selection');
assert(js.includes("root.dataset.mrleeSmartExpanded=String(open)"));
assert(root.includes('id="mrlee27Expand"'));
assert(root.includes('id="mrlee27ThemeChange"'));
assert(html.includes('id="mrlee-auth2-dialog"'),'lost login dialog');
assert(html.includes('id="contactDialog"'),'lost consultation dialog');
assert(html.includes('mrlee-score-v12/widget.js'),'lost score engine');
assert(html.includes('id="schoolSearchForm"'),'lost university lookup');
const syntax=spawnSync(process.execPath,['--check','assets/mrlee-ui2027/rebuild-home-v2.js'],{encoding:'utf8'});
assert.equal(syntax.status,0,syntax.stderr);
console.log('PASS MR LEE Home V2: real new markup, 8 unique modules/routes/photos, 2 heroes, mobile, two themes, old functions, syntax.');
