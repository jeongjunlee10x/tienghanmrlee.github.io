/**
 * MR LEE UI V3 — non-destructive coverage and asset contract.
 * Covers every live root HTML document; intentionally leaves archived copies
 * and Google Search Console verification files unchanged.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pages=fs.readdirSync(root).filter(name=>name.endsWith('.html')&&!/^google[0-9a-f]+\.html$/i.test(name)).sort();
const cssPath='assets/mrlee-ui2027/v3-unified.css';
const runtimePath='assets/mrlee-ui2027/v3-runtime.js';
assert(fs.existsSync(cssPath),'Missing unified V3 stylesheet');
assert(fs.existsSync(runtimePath),'Missing V3 legacy theme sync');
assert(pages.length>=89,'Expected every active root page, observed '+pages.length);

let admin=0,game=0,site=0;
const errors=[],scopeOf=name=>name==='admin.html'?'admin':
 /^(?:game-|mrlee-game-arena|tro-choi-tieng-han|quan-tri-tro-choi)/.test(name)?'game':'site';
for(const file of pages){
 const html=fs.readFileSync(file,'utf8');
 const scope=scopeOf(file);
 const document=html.match(/<html\b[^>]*>/i)?.[0]||'';
 if(!document)errors.push(file+': missing html root');
 if(!document.includes('data-mrlee-v3-ui="1"'))errors.push(file+': missing V3 root marker');
 if(!document.includes('data-mrlee-v3-scope="'+scope+'"'))errors.push(file+': missing '+scope+' scope');
 const cssLinks=html.match(/<link\b[^>]*href="assets\/mrlee-ui2027\/v3-unified\.css\?v=20261122-fresh-future-v4"[^>]*>/g)||[];
 const scripts=html.match(/<script\b[^>]*src="assets\/mrlee-ui2027\/v3-runtime\.js\?v=(?:20261122-ui-v3|20261127-mpa)"[^>]*><\/script>/g)||[];
 if(['index.html','future.html'].includes(file)&&!html.includes('v3-runtime.js?v=20261127-mpa'))errors.push(file+': MPA runtime version missing');
 if(cssLinks.length!==1)errors.push(file+': expected 1 new stylesheet, found '+cssLinks.length);
 if(scripts.length!==1)errors.push(file+': expected 1 new runtime, found '+scripts.length);
 if(cssLinks.length===1 && scripts.length===1 && html.indexOf(cssLinks[0])>html.indexOf(scripts[0]))
  errors.push(file+': CSS must load before theme runtime');
 if(!html.includes('</head>'))errors.push(file+': no closing head after upgrade');
 if(!html.includes('</body>')&&!/^\s*<meta\b/i.test(html))errors.push(file+': no closing body');
 if(scope==='admin')admin++;
 else if(scope==='game')game++;
 else site++;
}
assert.equal(errors.length,0,errors.join('\n'));

const css=fs.readFileSync(cssPath,'utf8');
const runtime=fs.readFileSync(runtimePath,'utf8');
assert(css.length>=14000,'V3 stylesheet is incomplete');
for(const marker of ['V3.4 — SITEWIDE FRESH / FUTURE DESIGN REFRESH',
 '--v3-brand:#096d78','--v3-brand:#64deed',
 '--v3-max:1440px']){
 assert(css.includes(marker),'V4 Fresh/Future design layer missing: '+marker);
}

for(const value of ['data-mrlee-v3-scope="site"','data-mrlee-v3-scope="admin"','data-mrlee-v3-scope="game"',
 'data-mrlee-theme="future"','prefers-reduced-motion:reduce','focus-visible','--v3-page','--v3-ring']){
 assert(css.includes(value),'Missing CSS design contract: '+value);
}
assert(!/display:\s*none\s*!important[^}]*#mrleeNewHome/i.test(css),'V3 must not hide homepage content');
assert(!/\.mcl-deck\s*{/.test(css),'Unified UI must not change specialized 45-slide stage geometry');
assert(!/\.xq-board\s*{|\.ludo-board\s*{|\.tl24-game-table\s*{/.test(css),
 'Shared UI must not resize game boards');
assert(!/firebase|supabase|spark|fetch\(|localStorage\.setItem|sessionStorage\.setItem/i.test(runtime),
 'Visual runtime must never mutate learning/account/backend state');
assert(runtime.includes('localStorage.getItem')&&runtime.includes('hasSharedTheme'),'Legacy pages must respect shared theme controller');
assert(fs.readFileSync('google3b39ad9c86e1befe.html','utf8').indexOf('v3-unified.css')===-1,
 'Do not alter Google site verification document');

console.log('PASS MR LEE UI V3: '+pages.length+' root HTML pages ('+site+' public, '+admin+' Admin, '+game+
 ' Game Zone), one CSS+runtime per page, scoped themes, preserved verification file and safe controller');
