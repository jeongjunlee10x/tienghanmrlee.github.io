/** Enhances the existing conversation page without replacing old cards/favorites. */
(function(){
  const deep = Array.isArray(window.MRLEE_DEEP_TOPICS)?window.MRLEE_DEEP_TOPICS:[];
  const lookup = new Map(deep.flatMap(t=>t.items.map(item=>[item.id,{scenario:item.scenario,taskId:'topic-'+t.id,level:t.level}])));
  function decorate(){
    const grid=document.getElementById('phraseGrid');if(!grid)return;
    for(const card of grid.querySelectorAll('.phrase-card[data-id]')){
      const item=lookup.get(card.dataset.id);if(!item || card.dataset.deepEnhanced==='1')continue;
      card.dataset.deepEnhanced='1';
      const spot=card.querySelector('.ko');
      if(spot&&item.scenario){const label=document.createElement('p');label.className='mrlee-situation';label.textContent='🎭 Tình huống: '+item.scenario;spot.before(label)}
      const actions=card.querySelector('.mini-actions');
      if(actions){const link=document.createElement('a');link.className='mini-btn mrlee-deep-practice';link.href='luyen-noi-tinh-diem.html?task='+encodeURIComponent(item.taskId);link.textContent='🎙️ Luyện nói';link.setAttribute('aria-label','Mở bài luyện nói tính điểm');actions.append(link)}
    }
  }
  function start(){
    const grid=document.getElementById('phraseGrid');if(!grid)return;
    decorate();new MutationObserver(decorate).observe(grid,{childList:true});
    const query=new URLSearchParams(location.search).get('topic');
    if(query){const target=deep.find(x=>x.id===query);if(target){
      const level=document.getElementById('mrleeLevelFilter');if(level){level.value=String(target.level);level.dispatchEvent(new Event('change'))}
      const btn=[...document.querySelectorAll('#topicMenu .topic-btn')].find(x=>x.textContent.includes(target.title));
      btn?.click();
    }}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
