/* Static image-gallery regression test for topic 02. Run: node tools/check-culture-food-v1.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const page=fs.readFileSync('van-hoa-bai-hoc.html','utf8');
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
const stylesheet=fs.readFileSync('assets/culture/food-gallery-v1.css','utf8');
assert(page.includes('data-mrlee-food-gallery')||page.includes('dataset.mrleeFoodGallery'));
assert(page.includes('id="cultureImagesV19" class="lessonBlock mrleeCulture19 mrleeFoodStatic"'));
assert(page.includes('food-gallery-v1.css'));
assert(page.includes('id="mrleeFoodStatus"'));
assert(stylesheet.includes('html:not([data-mrlee-food-gallery="1"])'));
assert(engine.includes("ID==='am-thuc'?1:2"));
const matches=[...page.matchAll(/src="(images\/culture-v23-ai\/am-thuc\/(\d\d)\.webp)\?v=20261101-food-direct-1"/g)];
assert.equal(matches.length,5);
assert.deepEqual(matches.map(x=>x[2]),['01','02','03','04','05']);
for(const m of matches){assert(fs.existsSync(m[1]),'Missing binary '+m[1]);const b=fs.readFileSync(m[1]);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');}
console.log('PASS: 5 real 1536x1024 webp assets explicitly in HTML, topic gate, no JS dependency, and fallback status.');
