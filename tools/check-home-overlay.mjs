/* Home hero QA for 2027 V2 (the pre-2027 overlay stylesheet was removed). */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/mrlee-ui2027/rebuild-home-v2.css','utf8');
assert(html.includes('id="mrleeNewHome"'),'New editorial homepage absent');
assert(html.includes('class="mr27-hero-copy"')&&html.includes('class="mr27-hero-media"'),
 'Separate text and photograph regions are required');
for(const image of ['01-trang-chu-fresh.webp','01-trang-chu-future.webp']){
 const src='assets/images/heroes/'+image;
 assert(html.includes('src="'+src+'"'),'Independent theme image not in markup: '+src);
 const data=fs.readFileSync(src);
 assert(data.length>100000 && data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WEBP',
  'Missing valid high-definition theme image '+src);
}
for(const href of ['hoc-tieng-han.html','kiem-tra-dau-vao.html','tuyen-sinh.html']){
 assert(html.includes('href="'+href+'"'),'Missing live CTA: '+href);
}
for(const selector of [
 '#mrleeNewHome .mr27-hero',
 '#mrleeNewHome .mr27-hero-copy',
 '#mrleeNewHome .mr27-hero-media',
 'grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr)',
 '@media(max-width:650px)'
])assert(css.includes(selector),'New split hero rule missing: '+selector);
assert(!html.includes('home-hero-overlay-v3.css'),'Old overlay must not run alongside V2');
assert(!html.includes('home-hero-split-v2.css'),'Old split CSS must not run alongside V2');
assert(!html.includes('mrlee800-hero-loader.js'),'Legacy auto-image loader must not override V2');
console.log('PASS Home V2 editorial split hero: real theme images, separated copy, clickable CTAs, and mobile rules.');
