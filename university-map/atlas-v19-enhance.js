/* MR LEE V19 — additive enhancement for V13 SVG atlas. Never replaces university datasets. */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const cityPanel=$('v19CityPanel'), cityWrap=$('v19CityChips'), atlas=$('koreaAtlas');
  if(!cityPanel||!cityWrap||!atlas||!$('regionSelect')||!$('schoolResults'))return;
  let citiesByRegion=new Map(), activeRegion='', activeCity='', schoolIdsByCity=new Map(), hasLoaded=false;
  const norm=s=>String(s||'').toLowerCase().trim();
  const add=(id,city,key)=>{
    if(!id||!city||!key)return;
    const cid=norm(id), c=String(city).trim();
    if(!citiesByRegion.has(cid))citiesByRegion.set(cid,new Set());
    citiesByRegion.get(cid).add(c);
    const group=cid+'::'+c;
    if(!schoolIdsByCity.has(group))schoolIdsByCity.set(group,new Set());
    schoolIdsByCity.get(group).add(key);
  };
  // Data is downloaded only to power the city chips; the original atlas continues to own all school rendering.
  fetch('university-map/universities.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
    if(!data||!Array.isArray(data.schools))return;
    data.schools.forEach((school,i)=>{
      const key=String(school.id||'school-'+i)+'::'+i;
      (Array.isArray(school.campuses)?school.campuses:[]).forEach(c=>{
        const region=norm(c.region||school.region);
        const city=String(c.city||c.cityKo||'').trim();
        add(region,city,key);
      });
    });
    hasLoaded=true;
    updateCityPanel($('regionSelect').value);
  }).catch(()=>{});
  const clearCityFilter=()=>{
    activeCity='';
    $('schoolResults').querySelectorAll('.school-row').forEach(row=>row.hidden=false);
    const orig=$('resultCount')?.dataset.cityOriginal;
    if(orig) $('resultCount').textContent=orig;
  };
  const setCity=(city)=>{
    activeCity=city;
    const key=activeRegion+'::'+city;
    const matching=schoolIdsByCity.get(key)||new Set();
    const rows=Array.from($('schoolResults').querySelectorAll('.school-row'));
    rows.forEach(row=>row.hidden=!!city&&!matching.has(row.dataset.schoolKey));
    const count=rows.filter(row=>!row.hidden).length;
    if($('resultCount')){
      $('resultCount').dataset.cityOriginal=$('resultCount').dataset.cityOriginal||$('resultCount').textContent;
      $('resultCount').textContent=city?count+' trường ở '+city:$('resultCount').dataset.cityOriginal;
    }
    Array.from(cityWrap.querySelectorAll('button')).forEach(btn=>btn.classList.toggle('active',btn.dataset.city===city));
  };
  const updateCityPanel=(region)=>{
    activeRegion=norm(region);
    clearCityFilter();
    if(!hasLoaded||!activeRegion||activeRegion==='all'){
      cityPanel.hidden=true;
      return;
    }
    const cities=[...(citiesByRegion.get(activeRegion)||[])].sort((a,b)=>a.localeCompare(b,'vi'));
    if(!cities.length){cityPanel.hidden=true;return;}
    cityPanel.hidden=false;
    cityWrap.replaceChildren();
    const list=['',...cities];
    list.forEach(city=>{
      const btn=document.createElement('button');
      btn.type='button';btn.className='v19-city-chip';btn.dataset.city=city;
      btn.textContent=city||'Tất cả thành phố';
      if(!city)btn.classList.add('active');
      const apply=()=>setCity(city);
      btn.addEventListener('pointerenter',e=>{ if(e.pointerType!=='touch')apply(); });
      btn.addEventListener('focus',apply);
      btn.addEventListener('click',apply);
      cityWrap.append(btn);
    });
  };
  const activateRegion=areaEl=>{
    const id=areaEl.dataset.area;
    if(!id||id===activeRegion)return;
    activeRegion=id;
    areaEl.dispatchEvent(new MouseEvent('click',{bubbles:false,cancelable:true}));
    updateCityPanel(id);
  };
  atlas.addEventListener('pointerover',e=>{
    if(e.pointerType==='touch')return;
    const target=e.target.closest('[data-area]');
    if(target&&atlas.contains(target))activateRegion(target);
  });
  atlas.addEventListener('focusin',e=>{
    const target=e.target.closest('[data-area]');
    if(target&&atlas.contains(target))activateRegion(target);
  });
  // Preserve click and touch; school rows already show detail on pointerenter via the original code.
  $('regionSelect').addEventListener('change',()=>{updateCityPanel($('regionSelect').value);});
  $('resetRegion')?.addEventListener('click',()=>{activeRegion='';activeCity='';cityPanel.hidden=true;});
  $('searchInput')?.addEventListener('input',()=>{if($('searchInput').value){activeRegion='';activeCity='';cityPanel.hidden=true;}});
  // Keep counters coherent when native atlas re-renders its school list.
  const resultList=$('schoolResults');
  const obs=new MutationObserver(()=>{
    if(activeCity){
      const key=activeRegion+'::'+activeCity;
      const matching=schoolIdsByCity.get(key)||new Set();
      resultList.querySelectorAll('.school-row').forEach(row=>row.hidden=!matching.has(row.dataset.schoolKey));
    }
  });
  obs.observe(resultList,{childList:true});
  const params=new URLSearchParams(location.search);
  const q=params.get('search');
  if(q){
    let tries=0;
    const wait=setInterval(()=>{
      tries++;
      const inp=$('searchInput');
      if(inp&&$('countSchools')?.textContent!=='—'){
        inp.value=q;inp.dispatchEvent(new Event('input',{bubbles:true}));clearInterval(wait);
      }else if(tries>50)clearInterval(wait);
    },150);
  }
})();
