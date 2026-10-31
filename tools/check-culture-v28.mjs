import assert from 'node:assert/strict';
import fs from 'node:fs';
const m=JSON.parse(fs.readFileSync('assets/culture/v28-manifest.json','utf8'));
assert.equal(m.batch,7);assert.equal(m.total,10);assert.equal(m.images.length,10);
for(const topic of ['so-cap-cuu','goi-cuu-ho']){
 assert.equal(m.topics[topic],5);
 const ids=m.images.filter(x=>x.topic===topic);
 assert.deepEqual(ids.map(x=>x.index),[1,2,3,4,5]);
 for(const img of ids){const svg=fs.readFileSync(img.path,'utf8');assert(svg.startsWith('<svg'));assert(svg.includes('viewBox="0 0 1536 1024"'));assert(svg.includes('<title>'));assert(!svg.includes('<script'));assert(!svg.includes('http://www.w3.org/1999/xhtml'));}
}
const engine=fs.readFileSync('mrlee-culture-hd-v19.js','utf8');
assert(engine.includes("const V28='images/culture-v28-safe/';"));assert(engine.includes('NEW_V28.has(id)?V28'));assert(engine.includes('V28_CAPTIONS[ID]?.[i-1]'));
const c=fs.readFileSync('mrlee-culture-v28-captions.js','utf8');assert(c.includes('window.MRLEE_CULTURE_V28_CAPTIONS'));
for(const page of ['van-hoa-han-quoc.html','van-hoa-bai-hoc.html']){const html=fs.readFileSync(page,'utf8');assert(html.includes('mrlee-culture-v28-captions.js'));assert(html.includes('mrlee-culture-hd-v19.js?v=20261031-v27-b7'));}
console.log('PASS V28: 10 original safe SVG scenes, 2 topics, 5/each, integrated captions and correct asset paths');
