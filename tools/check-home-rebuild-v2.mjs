import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/mrlee-ui2027/rebuild-home-v2.css','utf8');
const js=fs.readFileSync('assets/mrlee-ui2027/rebuild-home-v2.js','utf8');
assert(html.includes('data-mrlee-redesign="v2"'),'V2 root switch not present');
assert.equal((html.match(/id="mrleeNewHome"/g)||[]).length,1);
assert(html.includes('rebuild-home-v2.css?v=20261102-p5'));
assert(html.includes('rebuild-home-v2.js?v=20261101-rebuild2'));
const root=html.match(/<section id="mrleeNewHome"[\s\S]*?<\/section>/)?.[0];
assert(root,'new design missing');
const cards=[...root.matchAll(/<a class="mr27-tile" data-key="([^"]+)" href="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"/g)];
assert.equal(cards.length,8,'8 genuine new tiles');
assert.equal(new Set(cards.map(x=>x[1])).size,8,'unique module types');
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
 'assets/v306/images/feature-1-tuyen-sinh.webp',
 'assets/v306/images/feature-7-ky-tuc-xa.webp'
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
assert(js.includes("sessionStorage.removeItem('MRLEE.THEME.ENTRY.V1')"));
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
