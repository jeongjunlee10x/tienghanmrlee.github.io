# MR LEE - Banner 9 images, 2-second autoplay, fix for previous 5-second version.
# Works with Windows PowerShell 5.1. Put this file beside index.html.
# Images must be named images/1.png through images/9.png.
# Only index.html is changed. A timestamped backup is created.
$ErrorActionPreference = 'Stop'

try {
  $project = $PSScriptRoot
  $page = Join-Path $project 'index.html'
  $imageDir = Join-Path $project 'images'

  if (-not (Test-Path -LiteralPath $page -PathType Leaf)) {
    throw 'index.html is missing. Put this installer beside index.html.'
  }
  $missing = @()
  foreach ($n in 1..9) {
    if (-not (Test-Path -LiteralPath (Join-Path $imageDir ($n.ToString() + '.png')) -PathType Leaf)) {
      $missing += ('images/' + $n + '.png')
    }
  }
  if ($missing.Count -gt 0) {
    throw ('Missing files: ' + ($missing -join ', ') + '. No changes made.')
  }

  $utf8 = New-Object System.Text.UTF8Encoding($false)
  $html = [System.IO.File]::ReadAllText($page, [System.Text.Encoding]::UTF8)

  # Remove previous banner CSS/JS (both original and fixed versions).
  $html = [regex]::Replace($html, '(?is)\s*<!--\s*MRLEE-BANNER9-CSS(?:-V4)?\s*-->\s*<style\b[^>]*>.*?</style\s*>', '')
  $html = [regex]::Replace($html, '(?is)\s*<!--\s*MRLEE-BANNER9-JS(?:-V4)?\s*-->\s*<script\b[^>]*>.*?</script\s*>', '')

  # Locate hero banner and its matching closing DIV, even if old carousel is nested.
  $start = [regex]::Match($html, '(?is)<div\b[^>]*\bclass\s*=\s*["''][^"'']*\bhero-banner\b[^"'']*["''][^>]*>')
  if (-not $start.Success) {
    throw 'Cannot locate the hero-banner DIV in index.html. No changes made.'
  }
  $insideStart = $start.Index + $start.Length
  $tokens = [regex]::Matches($html.Substring($insideStart), '(?is)</?div\b[^>]*>')
  $depth = 1
  $insideEnd = -1
  foreach ($token in $tokens) {
    if ($token.Value -match '^</div') { $depth-- } else { $depth++ }
    if ($depth -eq 0) {
      $insideEnd = $insideStart + $token.Index
      break
    }
  }
  if ($insideEnd -lt $insideStart) {
    throw 'Cannot find matching closing DIV for hero-banner. No changes made.'
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
  $parts = New-Object 'System.Collections.Generic.List[string]'
  $parts.Add('<!-- MRLEE-BANNER9-START -->')
  $parts.Add('<div id="mrleeBanner9" class="mrlee-banner9" role="region" aria-roledescription="carousel" aria-label="9 muc hoc tap; moi 2 giay doi anh" aria-live="off">')
  for ($i=0; $i -lt 9; $i++) {
    $id = $slides[$i][0]
    $link = $slides[$i][1]
    $alt = $slides[$i][2]
    $activeClass = if ($i -eq 0) { ' is-active' } else { '' }
    $tabIndex = if ($i -eq 0) { '0' } else { '-1' }
    $hidden = if ($i -eq 0) { 'false' } else { 'true' }
    $fetchPriority = if ($i -eq 0) { ' fetchpriority="high"' } else { '' }
    $parts.Add(('<a class="mrlee-banner9-slide{0}" href="{1}" tabindex="{2}" aria-hidden="{3}"><img src="images/{4}.png?v=banner2" alt="{5}" loading="eager" decoding="async"{6}></a>' -f $activeClass,$link,$tabIndex,$hidden,$id,$alt,$fetchPriority))
  }
  $parts.Add('<button class="mrlee-banner9-arrow mrlee-banner9-prev" type="button" data-banner-prev aria-label="Previous banner">&#10094;</button>')
  $parts.Add('<button class="mrlee-banner9-arrow mrlee-banner9-next" type="button" data-banner-next aria-label="Next banner">&#10095;</button>')
  $parts.Add('<div class="mrlee-banner9-controls">')
  $parts.Add('<button class="mrlee-banner9-pause" type="button" data-banner-pause aria-label="Pause automatic banner" aria-pressed="false">&#10074;&#10074;</button>')
  $parts.Add('<div class="mrlee-banner9-dots" aria-label="Choose banner">')
  for ($i=0; $i -lt 9; $i++) {
    $selected = if ($i -eq 0) { 'true' } else { 'false' }
    $parts.Add(('<button type="button" data-banner-dot="{0}" aria-label="Banner {1}" aria-current="{2}"></button>' -f $i,($i+1),$selected))
  }
  $parts.Add('</div></div></div>')
  $parts.Add('<!-- MRLEE-BANNER9-END -->')
  $markup = [string]::Join("`n", $parts.ToArray())

  # Replace ONLY the content of .hero-banner; preserve the DIV and surrounding site.
  $html = $html.Substring(0,$insideStart) + "`n" + $markup + "`n" + $html.Substring($insideEnd)

  $css = @'
<!-- MRLEE-BANNER9-CSS-V4 -->
<style>
.hero-banner .mrlee-banner9{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;isolation:isolate;background:#e3edf8}
.hero-banner .mrlee-banner9-slide{position:absolute;inset:0;z-index:0;display:block!important;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .35s ease,visibility .35s ease}
.hero-banner .mrlee-banner9-slide.is-active{z-index:1;opacity:1;visibility:visible;pointer-events:auto}
.hero-banner .mrlee-banner9-slide img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center}
.mrlee-banner9-arrow{position:absolute;z-index:3;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:42px;height:42px;border:0;border-radius:50%;background:rgba(16,43,77,.66);color:#fff;font-size:22px;cursor:pointer}
.mrlee-banner9-prev{left:12px}.mrlee-banner9-next{right:12px}
.mrlee-banner9-controls{position:absolute;z-index:3;left:50%;bottom:12px;transform:translateX(-50%);display:flex;gap:8px;align-items:center;padding:6px 9px;border-radius:99px;background:rgba(16,43,77,.48)}
.mrlee-banner9-pause{border:0;border-radius:50%;height:25px;min-width:25px;padding:0;background:rgba(255,255,255,.22);color:#fff;font-size:11px;cursor:pointer}
.mrlee-banner9-dots{display:flex;align-items:center;gap:7px}
.mrlee-banner9-dots button{border:0;border-radius:50%;width:9px;height:9px;min-width:9px;background:rgba(255,255,255,.6);padding:0;cursor:pointer}
.mrlee-banner9-dots button[aria-current="true"]{width:22px;border-radius:9px;background:#fff}
.mrlee-banner9 button:focus-visible,.mrlee-banner9-slide:focus-visible{outline:3px solid #ee773f;outline-offset:-3px}
@media(max-width:600px){.mrlee-banner9-arrow{width:30px;height:30px;font-size:16px}.mrlee-banner9-prev{left:4px}.mrlee-banner9-next{right:4px}.mrlee-banner9-controls{bottom:5px;gap:4px;padding:4px 7px}.mrlee-banner9-dots{gap:4px}.mrlee-banner9-dots button{width:6px;height:6px;min-width:6px}.mrlee-banner9-dots button[aria-current="true"]{width:15px}}
@media(prefers-reduced-motion:reduce){.hero-banner .mrlee-banner9-slide{transition:none}}
</style>
'@

  $js = @'
<!-- MRLEE-BANNER9-JS-V4 -->
<script>
(function () {
  'use strict';
  var root = document.getElementById('mrleeBanner9');
  if (!root) return;
  var slides = Array.from(root.querySelectorAll('.mrlee-banner9-slide'));
  var dots = Array.from(root.querySelectorAll('[data-banner-dot]'));
  var previous = root.querySelector('[data-banner-prev]');
  var next = root.querySelector('[data-banner-next]');
  var pauseButton = root.querySelector('[data-banner-pause]');
  if (slides.length !== 9 || dots.length !== 9 || !previous || !next || !pauseButton) {
    console.error('MR LEE: banner setup incomplete; expected 9 slides and controls.');
    return;
  }
  var DELAY_MS = 2000;
  var current = 0;
  var intervalId = null;
  var manuallyPaused = false;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      var isCurrent = i === current;
      slide.classList.toggle('is-active', isCurrent);
      slide.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
      slide.tabIndex = isCurrent ? 0 : -1;
      dots[i].setAttribute('aria-current', isCurrent ? 'true' : 'false');
    });
  }
  function stop() {
    if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
  }
  function start() {
    stop();
    // Unlike the previous version, hover/focus never blocks automatic rotation.
    if (manuallyPaused || document.hidden) return;
    intervalId = setInterval(function () { show(current + 1); }, DELAY_MS);
  }
  function changeBy(delta) { show(current + delta); start(); }
  function updatePauseButton() {
    pauseButton.textContent = manuallyPaused ? '\u25b6' : '\u275a\u275a';
    pauseButton.setAttribute('aria-label', manuallyPaused ? 'Resume automatic banner' : 'Pause automatic banner');
    pauseButton.setAttribute('aria-pressed', manuallyPaused ? 'true' : 'false');
  }
  previous.addEventListener('click', function () { changeBy(-1); });
  next.addEventListener('click', function () { changeBy(1); });
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { show(i); start(); });
  });
  pauseButton.addEventListener('click', function () {
    manuallyPaused = !manuallyPaused;
    updatePauseButton();
    start();
  });
  document.addEventListener('visibilitychange', start);
  slides.forEach(function (slide) {
    var img = slide.querySelector('img');
    if (img) img.addEventListener('error', function () {
      console.error('MR LEE: missing banner image', img.src);
    });
  });
  show(0);
  updatePauseButton();
  start();
})();
</script>
'@

  $head = [regex]::Match($html, '(?i)</head\s*>')
  $body = [regex]::Match($html, '(?i)</body\s*>')
  if (-not $head.Success -or -not $body.Success) { throw 'Missing </head> or </body>. No changes made.' }
  $html = $html.Insert($body.Index, $js + "`n")
  $html = $html.Insert($head.Index, $css + "`n")

  if (([regex]::Matches($html, 'id="mrleeBanner9"')).Count -ne 1 -or
      -not $html.Contains('var DELAY_MS = 2000') -or
      -not $html.Contains('MRLEE-BANNER9-CSS-V4')) {
    throw 'Validation failed. No changes made.'
  }

  $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $backup = Join-Path $project ('index.backup-banner2s-' + $timestamp + '.html')
  $temp = Join-Path $project ('index.banner2s.tmp.html')
  [System.IO.File]::Copy($page, $backup, $false)
  try {
    [System.IO.File]::WriteAllText($temp, $html, $utf8)
    [System.IO.File]::Copy($temp, $page, $true)
    Remove-Item -LiteralPath $temp -Force
  } catch {
    if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
    throw
  }

  Write-Host 'SUCCESS: Homepage banner now changes every 2 seconds.' -ForegroundColor Green
  Write-Host 'Autoplay runs even when the mouse is over the banner.'
  Write-Host 'Pause / Resume button and manual navigation are enabled.'
  Write-Host ('Backup: ' + $backup)
  Write-Host 'Test with Live Server. Then commit and push index.html and images/1.png to 9.png.'
}
catch {
  Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red
  exit 1
}
