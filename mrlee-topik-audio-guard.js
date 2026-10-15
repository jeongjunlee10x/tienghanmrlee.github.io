/* MR LEE TOPIK Audio Guard 2026-10-15 | Player failure handling, no exam-score shortcuts. */
(() => {
  'use strict';
  if (window.MRLEE_TOPIK_AUDIO_GUARD) return;
  const folder = 'MRLEE_AUDIO/';
  let fallbackPromise;
  const all = new Set();
  const fallbackMap = () => {
    if (!fallbackPromise) fallbackPromise = fetch('MRLEE_AUDIO/catalog.json', {cache: 'force-cache'})
      .then(r => { if (!r.ok) throw Error('Catalog HTTP ' + r.status); return r.json(); })
      .then(rows => {
        const m = new Map();
        if (Array.isArray(rows)) for (const row of rows) {
          if (!row || typeof row.old !== 'string' || typeof row.file !== 'string') continue;
          const old = row.old.replace(/^\.\//, '').split('?')[0];
          if (!/^topik-audio\/[a-zA-Z0-9_-]+\.mp3$/.test(old)) continue;
          if (!/^03_TOPIK\/[a-zA-Z0-9_\/-]+\.mp3$/.test(row.file)) continue;
          m.set(old, folder + row.file.split('/').map(encodeURIComponent).join('/'));
        }
        return m;
      }).catch(() => new Map());
    return fallbackPromise;
  };
  function oldPath(src) {
    try {
      const u = new URL(src, location.href);
      if (u.origin !== location.origin) return '';
      const parts = u.pathname.split('/');
      const last = parts.at(-1);
      if (parts.at(-2) !== 'topik-audio' || !/^[a-zA-Z0-9_-]+\.mp3$/.test(last || '')) return '';
      return 'topik-audio/' + last;
    } catch { return ''; }
  }
  function showError(audio, message) {
    if (!audio.isConnected) return;
    let info = audio.nextElementSibling;
    if (!info || !info.classList?.contains('mrlee-topik-audio-error')) {
      info = document.createElement('p');
      info.className = 'mrlee-topik-audio-error';
      info.style.cssText = 'padding:10px 12px;background:#fff1e9;color:#8c260e;border:1px solid #f2c8a6;border-radius:9px;font-size:13px;line-height:1.5;';
      audio.insertAdjacentElement('afterend', info);
    }
    info.textContent = message;
  }
  async function tryFallback(audio, path, autoPlay) {
    if (!path || audio.dataset.mrleeAudioFallback === '1') return false;
    audio.dataset.mrleeAudioFallback = '1';
    const map = await fallbackMap();
    const other = map.get(path);
    if (!other) return false;
    try {
      const check = await fetch(other, {method: 'HEAD', cache: 'no-store'});
      if (!check.ok) return false;
    } catch { return false; }
    if (!audio.isConnected) return false;
    audio.src = other;
    audio.load();
    if (autoPlay) audio.play().catch(() => showError(audio, 'Không tự phát được. Hãy nhấn ▶ để nghe lại.'));
    return true;
  }
  function attach(audio) {
    if (audio.dataset.mrleeTopikGuard === '1') return;
    const path = oldPath(audio.currentSrc || audio.getAttribute('src') || audio.querySelector('source')?.src || '');
    if (!path) return;
    audio.dataset.mrleeTopikGuard = '1';
    audio.dataset.mrleeTopikSource = path;
    all.add(audio);
    audio.addEventListener('play', () => {
      for (const other of all) if (other !== audio && !other.paused) other.pause();
    });
    audio.addEventListener('error', async () => {
      const fixed = await tryFallback(audio, path, false);
      if (!fixed) showError(audio, 'Không tải được MP3. Hãy kiểm tra đường dẫn và trang kiểm tra âm thanh TOPIK.');
    });
    audio.addEventListener('loadedmetadata', () => {
      const p = audio.nextElementSibling;
      if (p?.classList?.contains('mrlee-topik-audio-error')) p.remove();
    });
  }
  function scan(root = document) {
    if (root.matches?.('audio')) attach(root);
    root.querySelectorAll?.('audio').forEach(attach);
  }
  const observer = new MutationObserver(records => {
    for (const r of records) for (const node of r.addedNodes) {
      if (node.nodeType === 1) scan(node);
    }
    for (const audio of all) if (!audio.isConnected) all.delete(audio);
  });
  function init() { scan(); observer.observe(document.body, {subtree: true, childList: true}); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
  // Applies to V7's off-DOM new Audio() playback. Fallback never counts as official exam audio.
  async function play(id, rate = 1) {
    const sources = window.MRLEE_TOPIK_V11_AUDIO?.sources || window.MRLEE_TOPIK_AUDIO_V8?.sources || {};
    const src = sources[id];
    if (!src) throw Error('Không có đường dẫn MP3 cho ' + id);
    const player = new Audio(src);
    player.playbackRate = Number.isFinite(+rate) ? Math.max(.5, Math.min(1.5, +rate)) : 1;
    try { await player.play(); return player; }
    catch (error) {
      const path = oldPath(src), map = await fallbackMap();
      const other = map.get(path);
      if (!other) throw Error('Không phát được MP3 ' + id + ': ' + error.message);
      player.src = other;
      try { await player.play(); return player; }
      catch { throw Error('Không phát được cả MP3 gốc và bản sao ' + id); }
    }
  }
  window.MRLEE_TOPIK_AUDIO_GUARD = {play, scan};
})();
