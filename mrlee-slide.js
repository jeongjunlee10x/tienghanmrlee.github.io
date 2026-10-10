/* MR LEE — seamless 9-slide horizontal carousel, 2000ms per new slide. */
(function () {
  'use strict';
  function init() {
    var root = document.getElementById('mrleeBanner9');
    if (!root || root.dataset.mrleeSlideReady === '1') return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.mrlee-banner9-slide'));
    if (slides.length !== 9) {
      console.error('MR LEE Slide: expected 9 banner images; found ' + slides.length);
      return;
    }
    root.dataset.mrleeSlideReady = '1';
    root.setAttribute('aria-label', '9 ảnh giới thiệu nội dung học tập');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-live', 'off');

    var track = document.createElement('div');
    track.className = 'mrlee-banner9-track';
    var before = slides[8].cloneNode(true);
    var after = slides[0].cloneNode(true);
    [before, after].forEach(function (clone) {
      clone.removeAttribute('id');
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      clone.classList.remove('is-active');
      clone.classList.add('is-clone');
      var img = clone.querySelector('img');
      if (img) img.setAttribute('aria-hidden', 'true');
    });
    track.appendChild(before);
    slides.forEach(function (slide) {
      slide.classList.remove('is-active');
      track.appendChild(slide);
    });
    track.appendChild(after);
    root.insertBefore(track, root.firstChild);

    var prev = root.querySelector('[data-banner-prev]');
    var next = root.querySelector('[data-banner-next]');
    var pause = root.querySelector('[data-banner-pause]');
    var dotsBox = root.querySelector('.mrlee-banner9-dots');
    var controls = root.querySelector('.mrlee-banner9-controls');
    if (!prev) {
      prev = document.createElement('button');
      prev.className = 'mrlee-banner9-arrow mrlee-banner9-prev';
      prev.type = 'button';
      prev.dataset.bannerPrev = '';
      prev.setAttribute('aria-label', 'Ảnh trước');
      prev.textContent = '❮';
      root.appendChild(prev);
    }
    if (!next) {
      next = document.createElement('button');
      next.className = 'mrlee-banner9-arrow mrlee-banner9-next';
      next.type = 'button';
      next.dataset.bannerNext = '';
      next.setAttribute('aria-label', 'Ảnh tiếp theo');
      next.textContent = '❯';
      root.appendChild(next);
    }
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'mrlee-banner9-controls';
      root.appendChild(controls);
    }
    if (!pause) {
      pause = document.createElement('button');
      pause.type = 'button';
      pause.className = 'mrlee-banner9-pause';
      pause.dataset.bannerPause = '';
      controls.appendChild(pause);
    }
    if (!dotsBox) {
      dotsBox = document.createElement('div');
      dotsBox.className = 'mrlee-banner9-dots';
      dotsBox.setAttribute('aria-label', 'Chọn ảnh');
      controls.appendChild(dotsBox);
    }
    if (!controls.contains(pause)) controls.insertBefore(pause, controls.firstChild);
    dotsBox.replaceChildren();
    var dots = slides.map(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.dataset.bannerDot = String(i);
      dot.setAttribute('aria-label', 'Xem ảnh ' + (i + 1));
      dotsBox.appendChild(dot);
      return dot;
    });

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var SLIDE_MS = reducedMotion ? 0 : 900;
    var STEP_EVERY_MS = 2000;
    var pos = 1; // first real slide; index 0 is a clone of slide 9
    var busy = false;
    var timer = null;
    var paused = false;
    var finger = null;
    var suppressClickUntil = 0;

    function activeIndex() {
      return ((pos - 1) % 9 + 9) % 9;
    }
    function updateUi() {
      var i = activeIndex();
      slides.forEach(function (slide, j) {
        slide.tabIndex = j === i ? 0 : -1;
        slide.setAttribute('aria-hidden', j === i ? 'false' : 'true');
      });
      dots.forEach(function (dot, j) {
        dot.setAttribute('aria-current', j === i ? 'true' : 'false');
      });
      pause.textContent = paused ? '▶' : '❚❚';
      pause.setAttribute('aria-label', paused ? 'Tiếp tục tự chuyển ảnh' : 'Tạm dừng chuyển ảnh');
      pause.setAttribute('aria-pressed', paused ? 'true' : 'false');
    }
    function positionTrack(animate) {
      track.style.transition = animate && !reducedMotion
        ? 'transform ' + SLIDE_MS + 'ms cubic-bezier(.22, 1, .36, 1)'
        : 'none';
      track.style.transform = 'translate3d(-' + (pos * 100) + '%, 0, 0)';
    }
    function stopTimer() {
      if (timer !== null) { window.clearTimeout(timer); timer = null; }
    }
    function schedule() {
      stopTimer();
      if (paused || document.hidden || reducedMotion) return;
      timer = window.setTimeout(function () { advance(1); }, STEP_EVERY_MS);
    }
    function finish() {
      if (pos === 10) {
        pos = 1;
        positionTrack(false); // invisible teleport from clone 1 to the real 1
      } else if (pos === 0) {
        pos = 9;
        positionTrack(false); // invisible teleport from clone 9 to the real 9
      }
      busy = false;
      updateUi();
    }
    function advance(delta) {
      if (busy) return;
      busy = !reducedMotion;
      pos += delta;
      positionTrack(true);
      updateUi();
      if (reducedMotion) finish();
      schedule();
    }
    track.addEventListener('transitionend', function (event) {
      if (event.target === track && event.propertyName === 'transform') finish();
    });
    function restartAfterManual() { schedule(); }
    prev.addEventListener('click', function () { advance(-1); restartAfterManual(); });
    next.addEventListener('click', function () { advance(1); restartAfterManual(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (busy) return;
        var target = i + 1;
        var delta = target - pos;
        if (Math.abs(delta) === 1) {
          advance(delta);
        } else {
          // Direct dot selection: no flash of intermediate slides.
          pos = target;
          positionTrack(false);
          updateUi();
        }
        restartAfterManual();
      });
    });
    pause.addEventListener('click', function () {
      paused = !paused;
      updateUi();
      schedule();
    });
    document.addEventListener('visibilitychange', schedule);
    // Horizontal swipe on mobile / touch-enabled tablets.
    root.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'touch' || e.target.closest('button')) return;
      finger = { x: e.clientX, y: e.clientY, id: e.pointerId };
    });
    root.addEventListener('pointerup', function (e) {
      if (!finger || e.pointerId !== finger.id) return;
      var dx = e.clientX - finger.x;
      var dy = e.clientY - finger.y;
      finger = null;
      if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        suppressClickUntil = Date.now() + 550;
        advance(dx > 0 ? -1 : 1);
      }
    });
    root.addEventListener('pointercancel', function () { finger = null; });
    root.addEventListener('click', function (e) {
      if (Date.now() < suppressClickUntil && e.target.closest('a')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
    track.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        console.warn('MR LEE Slide: không tải được ảnh ' + image.src);
      });
    });
    positionTrack(false);
    updateUi();
    schedule();
    // For a quick setup check in browser DevTools.
    root.dataset.mrleeSlideInterval = String(STEP_EVERY_MS);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
