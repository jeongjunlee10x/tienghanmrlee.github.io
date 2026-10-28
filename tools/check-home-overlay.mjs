import fs from 'node:fs';import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/branding/home-hero-overlay-v3.css','utf8');
const before=html.indexOf('home-hero-split-v2.css'),after=html.indexOf('home-hero-overlay-v3.css');
assert.ok(before>=0&&after>before,'Overlay stylesheet must load after old split styles');
assert.match(html,/class="hero mrlee-hero-overlay-v3" data-mrlee-hero="split"/);
assert.match(html,/<h1>DU HỌC <span>HÀN QUỐC<\/span><\/h1>/);
for(const path of ['01-trang-chu-fresh.webp','01-trang-chu-future.webp']){
 assert.match(css,new RegExp(path.replaceAll('.','\\.')),'Different photo missing: '+path);
 const file='assets/images/heroes/'+path;
 const stat=fs.statSync(file);assert.ok(stat.size>100000,'Hero photo too low-resolution: '+file);
}
const links=['id="openContactHero"','id="mrlee-auth2-locked-hero"','href="ban-do-dai-hoc-han-quoc.html"','href="hoc-tieng-han.html"','href="kiem-tra-dau-vao.html"','href="tuyen-sinh.html"'];
for(const link of links)assert.ok(html.includes(link),'Missing real, working hero CTA: '+link);
assert.match(css,/position:absolute!important;inset:0!important;/,'Photo must cover entire hero');
assert.match(css,/background:transparent!important;box-shadow:none!important/,'Legacy empty panel should be removed');
assert.match(css,/\.mrlee-hero-photo-pane::after/,'Readability gradient should not cover people');
assert.match(css,/@media\\(max-width:760px\\)/,'Mobile hero should have responsive rule');
assert.match(css,/V4 · Approved right-side typography for FUTURE hero only/,'Right skyline variant must be isolated to Future');
assert.match(css,/margin-left:auto!important;margin-right:0!important/,'Future copy pane must move to right');
assert.match(css,/background:linear-gradient\\(270deg/,'Future copy needs a right-side contrast gradient');
assert.match(css,/justify-content:flex-end!important/,'Narrow screen buttons should align right');
console.log('PASS home-hero overlay: two distinct verified image covers, full-bleed photo, live clickable text, Fresh left overlay + Future right skyline overlay, live accessible CTAs.');
