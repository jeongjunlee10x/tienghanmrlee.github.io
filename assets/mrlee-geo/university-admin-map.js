/* MR LEE · University atlas using 17 historical (2023) polygon shapes, filtered by 16 current (2026) regions.
   Source: public V-World boundaries (2023 distribution); not for legal borders.
   No school pins are implied by the polygons. */
(()=>{'use strict';
const mount=document.getElementById('mrleeAdministrativeMap');if(!mount)return;
const NS='http://www.w3.org/2000/svg',dataURL='assets/mrlee-geo/data/ctprvn.geojson';
const divs={11:['Seoul','seoul',126.97,37.56],26:['Busan','busan',129.08,35.18],27:['Daegu','daegu',128.60,35.88],28:['Incheon','incheon',126.69,37.47],29:['Gwangju','jeonnam-gwangju',126.85,35.16],30:['Daejeon','daejeon',127.39,36.35],31:['Ulsan','ulsan',129.32,35.54],36:['Sejong','sejong',127.27,36.52],41:['Gyeonggi','gyeonggi',127.18,37.31],51:['Gangwon','gangwon',128.41,37.74],43:['Chungbuk','chungbuk',127.78,36.75],44:['Chungnam','chungnam',126.94,36.43],45:['Jeonbuk','jeonbuk',127.09,35.72],46:['Jeonnam','jeonnam-gwangju',126.92,34.75],47:['Gyeongbuk','gyeongbuk',129.03,36.65],48:['Gyeongnam','gyeongnam',128.19,35.45],50:['Jeju','jeju',126.54,33.40]};
const colors=['#76c6e9','#ffa59c','#b8aaff','#98d6a8','#ffd080','#8abcec','#edb1cb','#e6bd69','#8dd0c8','#b7df91','#e8bb8c','#b5b4f2','#a6d9f0','#c2dba3','#ffca9c','#91bddc','#deb1cf'];
function s(tag,attrs){const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs||{}))n.setAttribute(k,String(v));return n}
function allCoords(g){const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;return polys.flat(2)}
function track(geo){const lo=[Infinity,Infinity],hi=[-Infinity,-Infinity];for(const f of geo.features){for(const p of allCoords(f.geometry)){if(p[0]<lo[0])lo[0]=p[0];if(p[1]<lo[1])lo[1]=p[1];if(p[0]>hi[0])hi[0]=p[0];if(p[1]>hi[1])hi[1]=p[1]}}return {lo,hi}}
function make(geo){
 if(!geo||geo.features?.length!==17)throw Error('Expected 17 administrative regions');
 const {lo,hi}=track(geo);const cos=.80;
 const z=Math.min(500/((hi[0]-lo[0])*cos),615/(hi[1]-lo[1]));
 const ox=(550-(hi[0]-lo[0])*cos*z)/2,oy=(690-(hi[1]-lo[1])*z)/2;
 const xy=p=>[+(ox+(p[0]-lo[0])*cos*z).toFixed(2),+(oy+(hi[1]-p[1])*z).toFixed(2)];
 const svg=s('svg',{viewBox:'0 0 550 690',role:'img','aria-label':'Bản đồ Hàn Quốc: 17 vùng địa giới trong nguồn 2023, quy về 16 đơn vị hành chính hiện hành năm 2026'});
 svg.append(s('rect',{x:1,y:1,width:548,height:688,rx:20,fill:'#dbf1fd',opacity:'.08'}));
 const lineLabel=s('text',{x:17,y:26,class:'seaname'});lineLabel.textContent='대한민국 · 16 ĐƠN VỊ (2026)';svg.append(lineLabel);
 let selected='';
 const regionPick=document.getElementById('universityRegion');
 const setSelected=(code)=>{const chosen=divs[code]?.[1];if(!chosen)return;const opt=[...regionPick.options].find(o=>o.value===chosen);if(!opt){const notice=mount.querySelector('.mrlee-admin-map-credit');if(notice)notice.textContent='Vùng '+divs[code][0]+' hiện chưa có trường được phân loại trong dữ liệu.';return}
 regionPick.value=regionPick.value===chosen?'':chosen;regionPick.dispatchEvent(new Event('change',{bubbles:true}));select(regionPick.value)};
 const select=value=>{selected=value;svg.querySelectorAll('.province').forEach(p=>p.setAttribute('data-active',String(p.dataset.region===value)))};
 geo.features.forEach((f,i)=>{
  const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
  const pathString=polys.map(poly=>poly.map(ring=>ring.map((p,j)=>{const [x,y]=xy(p);return (j?'L':'M')+x+','+y}).join('')+'Z').join('')).join('');
  const code=String(f.properties.CTPRVN_CD),name=divs[code]?.[0]||f.properties.CTP_ENG_NM;
  const path=s('path',{d:pathString,fill:colors[i%colors.length],class:'province','fill-rule':'evenodd',tabindex:'0',role:'button','aria-label':'Lọc trường tại '+name});
  path.dataset.region=divs[code]?.[1]||'';
  const title=s('title');title.textContent=name+' — '+f.properties.CTP_KOR_NM;path.append(title);
  path.addEventListener('click',()=>setSelected(code));path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(code)}});
  svg.append(path)
 });
 const names=['41','51','43','44','45','46','47','48','50'];
 for(const code of names){const region=divs[code];const [x,y]=xy([region[2],region[3]]);const t=s('text',{x,y,class:'province-label','text-anchor':'middle'});t.textContent=region[0];svg.append(t)}
 const cities=['11','28','36','30','27','29','26','31'];
 for(const code of cities){const reg=divs[code];let [x,y]=xy([reg[2],reg[3]]);const dot=s('circle',{cx:x,cy:y,r:3.5,fill:'#163e6a',stroke:'#fff','stroke-width':1});svg.append(dot);
 const shift=code==='11'?[10,-9]:code==='28'?[-7,15]:code==='36'?[9,-9]:code==='30'?[-4,17]:code==='29'?[-4,-8]:[8,-7];
 const tx=s('text',{x:x+shift[0],y:y+shift[1],class:'province-label minor-label','text-anchor':shift[0]<0?'end':'start'});tx.textContent=reg[0];svg.append(tx)}
 mount.replaceChildren(svg);
 const notice=document.createElement('p');notice.className='mrlee-admin-map-credit';notice.innerHTML='Địa giới V-World 2023 (17 đa giác). Từ 01/07/2026, Gwangju và Jeonnam cùng thuộc Jeonnam–Gwangju (1 bộ lọc). Bản đồ đã đơn giản hóa • <a href="ban-do-han-quoc.html#koreaMap">Xem bản đồ chi tiết</a>';mount.append(notice);
 regionPick.addEventListener('change',()=>select(regionPick.value));select(regionPick.value)
}
fetch(dataURL).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(make).catch(()=>{mount.replaceChildren();const p=document.createElement('p');p.className='mrlee-admin-map-loading';p.textContent='Không tải được địa giới. Vẫn có thể lọc trường theo danh sách khu vực bên trái.';mount.append(p);const a=document.createElement('a');a.href='ban-do-han-quoc.html#koreaMap';a.textContent='Mở bản đồ hành chính ↗';mount.append(a)});
})();
