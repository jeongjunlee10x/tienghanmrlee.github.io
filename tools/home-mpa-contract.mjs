import assert from 'node:assert/strict';
import fs from 'node:fs';
export function assertHomeRoutes(){
 for(const [mode,file,other] of [['fresh','index.html','future.html'],['future','future.html','index.html']]){
  const html=fs.readFileSync(file,'utf8');
  for(const attr of ['data-mrlee-home-mode','data-mrlee-theme','data-mr4-theme'])assert(html.includes(attr+'="'+mode+'"'),file+' lock '+attr);
  const row=html.match(/<nav class="mr4-theme-row"[^>]*>([\s\S]*?)<\/nav>/)?.[1]||'';
  assert(row.includes('href="index.html"')&&row.includes('href="future.html"')&&row.includes('href="'+file+'" aria-current="page"'),file+' native links/current');
  assert(html.includes('class="mr41-theme-route" href="'+other+'"'),file+' alternate');
  assert(!html.includes('data-mr4-choose=')&&!html.includes('live-v3.js'),file+' old switch');
  const src='assets/images/heroes/01-trang-chu-'+mode+'.webp';
  assert(html.includes('src="'+src+'"')&&!html.includes('class="mr27-art-'+(mode==='fresh'?'future':'fresh')+'"'),file+' single hero');
  const bytes=fs.readFileSync(src);assert(bytes.length>100000&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP',src+' HD WebP');
  const cards=[...html.matchAll(/<a class="mr27-tile" data-key="([^"]+)" href="([^"]+)"/g)];
  assert.deepEqual(cards.map(c=>c[1]),['learn','talk','topik','workbook','interview','map','culture','profile']);
  assert.equal(new Set(cards.map(c=>c[2])).size,8);
  for(const route of [...cards.map(c=>c[2]),'bang-diem-tuan-v12.html','dang-ky-tu-van.html','huong-dan-hoc-tieng-han.html']){
   assert(fs.existsSync(route.split('?')[0]),file+' target '+route);assert(html.includes('href="'+route+'"'),file+' link '+route);
  }
  assert(!html.includes('href="#ranking"')&&!html.includes('href="#contactPanel"'),file+' old anchors');
  for(const id of ['mrleeNewHome','schoolSearchForm','ranking','rankSlider','contactDialog','openContactHero','mrlee-auth2-dialog'])assert(html.includes('id="'+id+'"'),file+' preserved '+id);
 }
}
