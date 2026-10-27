import fs from 'node:fs';import assert from 'node:assert/strict';
const geo=JSON.parse(fs.readFileSync('assets/mrlee-geo/data/ctprvn.geojson','utf8'));
assert.equal(geo.features.length,17);
assert.equal(new Set(geo.features.map(f=>f.properties.CTPRVN_CD)).size,17);
for(const f of geo.features){assert.ok(['Polygon','MultiPolygon'].includes(f.geometry.type))}
const html=fs.readFileSync('ban-do-dai-hoc-han-quoc.html','utf8');
assert.ok(html.includes('id="mrleeAdministrativeMap"'));
assert.ok(!html.includes('id="mkorea"'));
assert.ok(html.includes('id="ky-tuc-xa"'));assert.ok(html.includes('Two_persons_room_at_E-house_dorm'));assert.ok(html.includes('CC BY-SA 4.0'));
assert.ok(html.includes('mrlee-geo/university-admin-map.js'));
const src=fs.readFileSync('assets/mrlee-geo/university-admin-map.js','utf8');
assert.ok(src.includes('ctprvn.geojson'));
const logical=JSON.parse(fs.readFileSync('university-map/regions.json','utf8')).regions;
assert.equal(logical.length,16,'Current (2026) administrative filter must have 16 regions');
assert.ok(logical.some(x=>x.id==='jeonnam-gwangju'));
for(const [code,name] of [['29','Gwangju'],['46','Jeonnam']]){
  const expected=code+':['+"'"+name+"','jeonnam-gwangju'";
  assert.ok(src.includes(expected),name+' historical polygon must filter the combined current region');
}
assert.ok(html.includes('16 đơn vị hiện hành') && html.includes('17 vùng ranh giới nguồn 2023'));
for(const p of ['tuyen-sinh.html','tim-truong.html'])assert.ok(fs.readFileSync(p,'utf8').includes('ký túc xá'));
for(const p of ['assets/v306/images/feature-7-ky-tuc-xa.webp','assets/mrlee-ai/v3/03_giao_tiep/topic-dorm.webp'])assert.ok(fs.statSync(p).size>10000);
console.log('MRLEE REGION QA: 17 administrative polygons; university map, dorm sections, illustrations OK');
