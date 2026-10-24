/* TIẾNG HÀN MR LEE · verified-data-aware university regional explorer */
(()=>{'use strict';
const $=id=>document.getElementById(id),root=document.documentElement,labels={seoul:'Seoul',gyeonggi:'Gyeonggi',busan:'Busan',incheon:'Incheon',daegu:'Daegu',daejeon:'Daejeon',ulsan:'Ulsan',sejong:'Sejong',gwangju:'Gwangju',gangwon:'Gangwon',chungnam:'Chungnam',chungbuk:'Chungbuk',gyeongbuk:'Gyeongbuk',gyeongnam:'Gyeongnam',jeonbuk:'Jeonbuk',jeonnam:'Jeonnam',jeju:'Jeju','jeonnam-gwangju':'Jeonnam / Gwangju'};
let schools=[],found=[],visible=0,selected='',regionCounts=new Map();const chunk=18;
const mk=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=String(value);return x};
const clear=(node)=>node.replaceChildren();const display=s=>String(s||'').trim();
function safeURL(s){try{const u=new URL(s);return u.protocol==='https:'?u.href:null}catch{return null}}
function title(s){return display(s.vi)||display(s.en)||display(s.ko)||'Trường chưa có tên'}
function campuses(s){return Array.isArray(s.campuses)?s.campuses:[]}
function regions(s){return [...new Set(campuses(s).map(x=>display(x.region)).filter(Boolean))]}
function keyword(x){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('vi')}
function setup(){
 document.querySelectorAll('.mrlee-theme-switch button').forEach(b=>b.addEventListener('click',()=>{root.dataset.mrleeTheme=b.dataset.theme==='future'?'future':'fresh';try{localStorage.setItem('MRLEE.THEME.V1',root.dataset.mrleeTheme)}catch(_){}paint()}));paint();
 $('universitySearch').addEventListener('input',filter);
 $('universityRegion').addEventListener('change',filter);
 $('universityType').addEventListener('change',filter);
 $('universityClear').addEventListener('click',()=>{$('universitySearch').value='';$('universityRegion').value='';$('universityType').value='';filter()});
 $('universityMore').addEventListener('click',()=>{visible+=chunk;renderCards()});
}
function paint(){document.querySelectorAll('.mrlee-theme-switch button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===root.dataset.mrleeTheme)))}
function filter(){
 const name=keyword($('universitySearch').value),region=$('universityRegion').value,type=$('universityType').value;
 found=schools.filter(s=>(!type||s.type===type)&&(!region||regions(s).includes(region))&&(!name||keyword([s.ko,s.en,s.vi,...(s.aliases||[]),...campuses(s).flatMap(c=>[c.address,c.city,c.vi,c.en,c.ko])].join(' ')).includes(name)));
 visible=chunk;selected='';renderCards();renderRegions();
}
function renderRegions(){
 const parent=$('mrleeRegionList');clear(parent);
 const chosen=$('universityRegion').value;
 const keys=[...regionCounts.keys()].sort((a,b)=> (labels[a]||a).localeCompare(labels[b]||b,'vi'));
 for(const region of keys){
 const button=mk('button','',labels[region]||region);button.type='button';
 button.append(mk('span','',regionCounts.get(region)));button.classList.toggle('selected',chosen===region);
 button.addEventListener('click',()=>{$('universityRegion').value=chosen===region?'':region;filter()});parent.append(button);
 }
}
function renderCards(){
 const area=$('universityCards');clear(area);
 const count=$('universityCount');count.textContent=found.length+' trường phù hợp · '+Math.min(visible,found.length)+' đang hiển thị';
 for(const s of found.slice(0,visible)){
 const button=mk('button','mrlee-university-item');button.type='button';
 button.append(mk('small','',display(s.ko)||'DANH MỤC TRƯỜNG'),mk('b','',title(s)),mk('small','',(regions(s).map(x=>labels[x]||x).join(' · ')||'Chưa phân loại khu vực')+' · '+campuses(s).length+' campus'),mk('em','','Xem thông tin trường ↗'));
 button.classList.toggle('selected',selected===s.id);
 button.addEventListener('click',()=>{selected=s.id;detail(s);area.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));button.classList.add('selected');if(innerWidth<750)$('universityDetail').scrollIntoView({behavior:'smooth',block:'center'})});
 area.append(button);
 }
 $('universityMore').hidden=visible>=found.length;
 if(!found.length){area.append(mk('p','',schools.length?'Không tìm thấy trường phù hợp. Thử thay đổi bộ lọc.':'Dữ liệu chưa tải.'))}
}
function detail(s){
 const p=$('universityDetail');clear(p);
 p.append(mk('h3','',title(s)),mk('p','',display(s.ko)||display(s.en)||''));
 p.append(mk('p','', 'Loại hình nhập: '+(s.type==='university'?'Đại học':s.type==='college'?'Cao đẳng / phân loại từ nguồn':'Chưa xác minh')));
 const web=safeURL(s.website);if(web){const a=mk('a','', 'Trang web trường ↗');a.href=web;a.target='_blank';a.rel='noopener noreferrer';p.append(a)}
 const origin=safeURL(s.officialSource);if(origin){const a=mk('a','', ' · Đối chiếu nguồn dữ liệu ↗');a.href=origin;a.target='_blank';a.rel='noopener noreferrer';p.append(a)}
 for(const [i,c] of campuses(s).entries()){
 const div=mk('div','mrlee-campus');div.append(mk('b','', 'Cơ sở '+(i+1)+' · '+(display(c.ko)||display(c.en)||'Campus')));
 div.append(mk('p','', 'Địa chỉ nhập: '+(display(c.address)||'Chưa có')));
 const coordOK=c.accuracy==='verified'&&Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lng))&&c.lat!==null&&c.lng!==null;
 if(coordOK){div.append(mk('p','','✓ Có tọa độ đã xác minh trong dữ liệu nguồn.'))}
 else {div.append(mk('small','','⚠ Chưa có tọa độ được xác minh. Kết quả tìm trên bản đồ ngoài cần đối chiếu với trường.'))}
 if(display(c.address)){
 const nav=mk('a','', 'Tra cứu địa chỉ trên Naver Map ↗');nav.href='https://map.naver.com/p/search/'+encodeURIComponent(c.address);nav.target='_blank';nav.rel='noopener noreferrer';div.append(document.createElement('br'),nav);
 }
 p.append(div);
 }
 if(!campuses(s).length)p.append(mk('p','', 'Chưa có dữ liệu campus.'));
}
async function start(){
 setup();
 try{
 const response=await fetch('university-map/universities.json',{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
 const doc=await response.json();if(!Array.isArray(doc.schools))throw Error('Dữ liệu không có mảng schools');
 schools=doc.schools.filter(x=>x&&typeof x==='object'&&x.id);
 schools.sort((a,b)=>title(a).localeCompare(title(b),'vi'));
 $('mapSchoolStat').textContent=schools.length.toLocaleString('vi-VN')+' trường đã nhập';
 $('mapCampusStat').textContent=schools.reduce((n,s)=>n+campuses(s).length,0)+' campus';
 $('mapVerifiedStat').textContent='Tọa độ xác minh: '+Number(doc.stats?.verifiedPins||0);
 for(const s of schools){for(const x of regions(s))regionCounts.set(x,(regionCounts.get(x)||0)+1)}
 const sorted=[...regionCounts.keys()].sort((a,b)=>(labels[a]||a).localeCompare(labels[b]||b,'vi'));
 for(const region of sorted){const opt=mk('option','',labels[region]||region);opt.value=region;$('universityRegion').append(opt)}
 const qs=new URLSearchParams(location.search),q=qs.get('q'),rg=qs.get('region');
 if(q)$('universitySearch').value=q.slice(0,90);
 if(rg&&regionCounts.has(rg))$('universityRegion').value=rg;
 filter();
 if(found.length)detail(found[0]);
 }catch(error){$('universityCount').textContent='Không tải được dữ liệu trường';$('universityCards').replaceChildren(mk('p','', 'Không thể tải danh mục. Kiểm tra university-map/universities.json hoặc thử tìm trường ở trang Tìm trường.'))}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();