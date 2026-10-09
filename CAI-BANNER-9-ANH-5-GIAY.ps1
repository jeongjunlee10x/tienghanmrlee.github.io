# MR LEE - 9-image homepage banner installer (Windows PowerShell 5.1 compatible)
# Place this PS1 next to index.html and images/1.png ... images/9.png.
# The installer modifies only index.html and creates a dated backup.
$ErrorActionPreference = 'Stop'

try {
  $project = $PSScriptRoot
  $page = Join-Path $project 'index.html'
  $imageDir = Join-Path $project 'images'

  if (-not (Test-Path -LiteralPath $page -PathType Leaf)) {
    throw 'index.html is not in the same folder as this installer.'
  }

  $missing = @()
  foreach ($n in 1..9) {
    $p = Join-Path $imageDir ($n.ToString() + '.png')
    if (-not (Test-Path -LiteralPath $p -PathType Leaf)) {
      $missing += ('images/' + $n + '.png')
    }
  }
  if ($missing.Count -gt 0) {
    throw ('Missing image file(s): ' + ($missing -join ', ') + '. No HTML was changed.')
  }

  $enc = New-Object System.Text.UTF8Encoding($false)
  $html = [System.IO.File]::ReadAllText($page, [System.Text.Encoding]::UTF8)

  if ($html.Contains('MRLEE-BANNER9-START')) {
    Write-Host 'This 9-image carousel is already installed. No changes made.' -ForegroundColor Yellow
    exit 0
  }

  $heroRegex = '(?is)(<div\s+class\s*=\s*["'']hero-banner["'']\s*>)(.*?)(</div\s*>)'
  if (-not [regex]::IsMatch($html, $heroRegex)) {
    throw 'Cannot find <div class="hero-banner">. No changes made.'
  }
  if (-not [regex]::IsMatch($html, '(?i)</head\s*>') -or -not [regex]::IsMatch($html, '(?i)</body\s*>')) {
    throw 'Invalid index.html: missing </head> or </body>. No changes made.'
  }

  $slides = @(
    @('1','bai-hoc.html','Bai hoc tieng Han'),
    @('2','giao-tiep-theo-chu-de.html','Giao tiep theo chu de'),
    @('3','on-luyen-phong-van.html','On luyen phong van'),
    @('4','kiem-tra-dau-vao.html','Kiem tra dau vao'),
    @('5','kiem-tra-online.html','Kiem tra online'),
    @('6','de-thi-topik.html','Bo de thi TOPIK'),
    @('7','thi-topik-online.html','Thi TOPIK online'),
    @('8','bo-sach.html','Bo sach va tai lieu'),
    @('9','dang-nhap.html','Tai khoan hoc vien')
  )
  $parts = New-Object System.Collections.Generic.List[string]
  $parts.Add('<!-- MRLEE-BANNER9-START -->')
  $parts.Add('<div id="mrleeBanner9" class="mrlee-banner9" role="region" aria-roledescription="carousel" aria-label="9 chuc nang hoc tap">')
  for ($i = 0; $i -lt $slides.Count; $i++) {
    $id = $slides[$i][0]
    $url = $slides[$i][1]
    $alt = $slides[$i][2]
    $active = if ($i -eq 0) { ' is-active' } else { '' }
    $tabIndex = if ($i -eq 0) { '0' } else { '-1' }
    $loading = if ($i -eq 0) { 'eager' } else { 'lazy' }
    $priority = if ($i -eq 0) { ' fetchpriority="high"' } else { '' }
    $hiddenState = if ($i -eq 0) { 'false' } else { 'true' }
    $parts.Add(('<a class="mrlee-banner9-slide{0}" href="{1}" tabindex="{2}" aria-hidden="{3}"><img src="images/{4}.png" alt="{5}" loading="{6}" decoding="async"{7}></a>' -f $active, $url, $tabIndex, $hiddenState, $id, $alt, $loading, $priority))
  }
  $parts.Add('<button class="mrlee-banner9-arrow mrlee-banner9-prev" type="button" aria-label="Anh truoc" data-banner-prev>&#10094;</button>')
  $parts.Add('<button class="mrlee-banner9-arrow mrlee-banner9-next" type="button" aria-label="Anh tiep theo" data-banner-next>&#10095;</button>')
  $parts.Add('<div class="mrlee-banner9-dots" aria-label="Chon anh banner">')
  for ($i = 0; $i -lt 9; $i++) {
    $selected = if ($i -eq 0) { 'true' } else { 'false' }
    $parts.Add(('<button type="button" data-banner-dot="{0}" aria-label="Xem anh {1}" aria-current="{2}"></button>' -f $i, ($i + 1), $selected))
  }
  $parts.Add('</div>')
  $parts.Add('</div>')
  $parts.Add('<!-- MRLEE-BANNER9-END -->')
  $heroMarkup = [string]::Join("`n", $parts.ToArray())

  $style = @'
<!-- MRLEE-BANNER9-CSS -->
<style>
.hero-banner:has(.mrlee-banner9) { background:#dfedf8; }
.mrlee-banner9 { position:relative; width:100%; aspect-ratio:16 / 9; overflow:hidden; isolation:isolate; }
.hero-banner .mrlee-banner9-slide {
  position:absolute; inset:0; z-index:0; display:block; opacity:0; visibility:hidden;
  transition:opacity .7s ease, visibility .7s ease; pointer-events:none;
}
.hero-banner .mrlee-banner9-slide.is-active { opacity:1; visibility:visible; pointer-events:auto; z-index:1; }
.hero-banner .mrlee-banner9-slide img { width:100%; height:100%; display:block; object-fit:contain; object-position:center; }
.mrlee-banner9-arrow { position:absolute; z-index:3; top:50%; transform:translateY(-50%);
  display:grid; place-items:center; width:42px; height:42px; border:0; border-radius:50%;
  background:rgba(16,43,77,.68); color:white; font-size:22px; line-height:1; cursor:pointer;
}
.mrlee-banner9-prev {left:12px} .mrlee-banner9-next {right:12px}
.mrlee-banner9-arrow:hover { background:rgba(16,43,77,.9) }
.mrlee-banner9-dots { position:absolute; left:50%; bottom:12px; transform:translateX(-50%);
  z-index:3; display:flex; justify-content:center; align-items:center; gap:7px;
  background:rgba(16,43,77,.36); border-radius:100px; padding:7px 10px;
}
.mrlee-banner9-dots button { box-sizing:border-box; border:0; border-radius:50%; width:9px; height:9px;
  background:rgba(255,255,255,.52); padding:0; cursor:pointer;
}
.mrlee-banner9-dots button[aria-current="true"] { background:white; width:23px; border-radius:20px; }
.mrlee-banner9 button:focus-visible,.mrlee-banner9-slide:focus-visible {outline:3px solid #ef773f;outline-offset:-3px}
@media(max-width:600px) {
 .mrlee-banner9-arrow {width:30px;height:30px;font-size:16px}
 .mrlee-banner9-prev {left:4px} .mrlee-banner9-next {right:4px}
 .mrlee-banner9-dots {gap:5px;bottom:5px;padding:5px 7px}
 .mrlee-banner9-dots button {width:6px;height:6px}
 .mrlee-banner9-dots button[aria-current="true"] {width:15px}
}
@media(prefers-reduced-motion:reduce) { .hero-banner .mrlee-banner9-slide { transition:none } }
</style>
'@

  $script = @'
<!-- MRLEE-BANNER9-JS -->
<script>
(function () {
  'use strict';
  const root = document.getElementById('mrleeBanner9');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('.mrlee-banner9-slide'));
  const dots = Array.from(root.querySelectorAll('[data-banner-dot]'));
  if (slides.length !== 9) return;
  const DELAY = 5000;
  let current = 0;
  let timer = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, n) => {
      const active = n === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.tabIndex = active ? 0 : -1;
      if (dots[n]) dots[n].setAttribute('aria-current', String(active));
    });
  }
  function stop() { if (timer !== null) { clearInterval(timer); timer = null; } }
  function start() {
    stop();
    if (reducedMotion.matches || document.hidden || root.matches(':hover') || root.matches(':focus-within')) return;
    timer = setInterval(() => show(current + 1), DELAY);
  }
  root.querySelector('[data-banner-prev]').addEventListener('click', () => { show(current - 1); start(); });
  root.querySelector('[data-banner-next]').addEventListener('click', () => { show(current + 1); start(); });
  dots.forEach((dot, n) => dot.addEventListener('click', () => { show(n); start(); }));
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', () => { requestAnimationFrame(start); });
  document.addEventListener('visibilitychange', start);
  if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', start);
  slides.slice(1).forEach(slide => {
    const img = slide.querySelector('img');
    if (img) img.addEventListener('error', () => console.warn('MR LEE banner image not found:', img.src));
  });
  show(0);
  start();
})();
</script>
'@

  # Build every change in memory; write only after successful validation.
  $replacement = ('$1' + "`n" + $heroMarkup + "`n" + '$3')
  $updated = [regex]::Replace($html, $heroRegex, $replacement, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  $updated = [regex]::Replace($updated, '(?i)</head\s*>', ($style + "`n</head>"))
  $updated = [regex]::Replace($updated, '(?i)</body\s*>', ($script + "`n</body>"))
  if (-not $updated.Contains('MRLEE-BANNER9-START') -or -not $updated.Contains('MRLEE-BANNER9-JS')) {
    throw 'Installer validation failed. No HTML was changed.'
  }

  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $backup = Join-Path $project ('index.backup-banner9-' + $stamp + '.html')
  [System.IO.File]::Copy($page, $backup, $false)
  [System.IO.File]::WriteAllText($page, $updated, $enc)

  Write-Host 'SUCCESS: Installed carousel with 9 images (5 seconds per image).' -ForegroundColor Green
  Write-Host ('Backup: ' + $backup)
  Write-Host 'Please open index.html with Live Server and check all 9 slides.'
  Write-Host 'Then run: git add index.html images/1.png images/2.png images/3.png images/4.png images/5.png images/6.png images/7.png images/8.png images/9.png'
}
catch {
  Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red
  exit 1
}
