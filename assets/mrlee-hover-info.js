/* MR LEE V13 — safe sitewide hover previews, no auto click/navigation or speech. */
(() => {
  'use strict';
  if (window.__mrleeHoverV13 || !document.body) return;
  window.__mrleeHoverV13 = true;
  const box = document.createElement('div');
  box.id = 'mrleeHoverPreview';
  box.setAttribute('role', 'status');
  box.setAttribute('aria-live', 'off');
  box.hidden = true;
  const head = document.createElement('strong');
  const desc = document.createElement('small');
  const hint = document.createElement('span');
  box.append(head,desc,hint);
  document.body.append(box);
  let active = null, pending = 0;
  const trim = (v, max=190) => String(v||'').replace(/\s+/g,' ').trim().slice(0,max);
  const labelOf = el => trim(el.dataset.mrleePreview || el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || el.textContent, 125);
  const eligible = target => {
    const el = target.closest?.('a[href], button, [data-mrlee-preview], [title]');
    if (!el || el.disabled || el.closest('#mrleeHoverPreview, #koreaAtlas, .map-column, .catalogue, [data-no-hover-preview], [data-mrlee-private]')) return null;
    if (el.closest('input,textarea,select,[role="textbox"],[contenteditable="true"]')) return null;
    return el;
  };
  const position = el => {
    const r = el.getBoundingClientRect();
    const w = box.offsetWidth || 220, h = box.offsetHeight || 75;
    const x = Math.max(8,Math.min(innerWidth-w-8,r.left + Math.min(18,r.width/2)));
    const y = (r.bottom+h+10 < innerHeight) ? r.bottom+7 : Math.max(8,r.top-h-7);
    box.style.left = x+'px'; box.style.top = y+'px';
  };
  const show = el => {
    if (active!==el) return;
    const label = labelOf(el);
    if (label.length < 4 || label.length > 125) return;
    const card=el.closest('[data-mrlee-preview], .course-card, .lesson-card, .feature-card, .school-card, .service-card, .card, .tile');
    let summary = trim(el.dataset.mrleeDescription || card?.getAttribute('data-description') || card?.querySelector?.('p, .description, [data-description]')?.textContent || '', 220);
    let action = 'Rê chuột để xem trước · Click để mở';
    if (el.matches('a[href]')) {
      try {
        const url = new URL(el.getAttribute('href'),location.href);
        if(url.protocol === 'https:' || url.protocol === 'http:') action = 'Liên kết: ' + (url.origin===location.origin ? url.pathname : url.hostname);
        else action = 'Click để mở';
      } catch (_) { action = 'Click để mở'; }
    } else if (el.tagName==='BUTTON') action = 'Click để thực hiện thao tác';
    if (!summary && el.dataset.mrleePreview) summary = trim(el.dataset.mrleePreview,220);
    head.textContent=label;desc.textContent=summary;desc.hidden=!summary;hint.textContent=action;
    box.hidden=false;
    position(el);
  };
  const clear = () => {clearTimeout(pending);active=null;box.hidden=true;};
  // Pointer event delegation; never trigger click, never change input values.
  document.addEventListener('pointerover', e => {
    if(e.pointerType==='touch') return;
    const el=eligible(e.target);
    if (el===active) return;
    clear(); if(!el)return;
    active=el;pending=setTimeout(()=>show(el),220);
  }, {passive:true});
  document.addEventListener('pointerout', e => {
    if(active && (e.target===active || active.contains(e.target)) && (!e.relatedTarget || !active.contains(e.relatedTarget))) clear();
  }, {passive:true});
  document.addEventListener('focusin', e => {const el=eligible(e.target);clear();if(el){active=el;show(el);}});
  document.addEventListener('focusout', e => {if(active && (e.target===active || active.contains(e.target)))clear();});
  document.addEventListener('keydown', e => {if(e.key==='Escape')clear();});
  addEventListener('scroll',clear,{passive:true});addEventListener('resize',clear,{passive:true});
})();
