# MR LEE - Leaderboard right sidebar + UNLIMITED points +1 per lesson
# Windows PowerShell 5.1. Self-contained, no Python required.
param([string]$WebsitePath='')
$ErrorActionPreference='Stop'
if([string]::IsNullOrWhiteSpace($WebsitePath)){ $WebsitePath=Split-Path -Parent $MyInvocation.MyCommand.Path }
$WebsitePath=[System.IO.Path]::GetFullPath($WebsitePath)
$enc=New-Object System.Text.UTF8Encoding($false)
$backupPath=Join-Path (Split-Path -Parent $WebsitePath) ('.mrlee-backup-leaderboard-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
function Read-Local([string]$rel){return [System.IO.File]::ReadAllText((Join-Path $WebsitePath $rel),$enc)}
function Set-Local([string]$rel,[string]$content){
 $dst=Join-Path $WebsitePath $rel
 $old=if(Test-Path $dst){[System.IO.File]::ReadAllText($dst,$enc)}else{''}
 if((Test-Path $dst) -and $old -ceq $content){return}
 if(Test-Path $dst){
  $back=Join-Path $backupPath $rel
  [System.IO.Directory]::CreateDirectory((Split-Path -Parent $back))|Out-Null
  [System.IO.File]::Copy($dst,$back,$true)
 }
 [System.IO.Directory]::CreateDirectory((Split-Path -Parent $dst))|Out-Null
 [System.IO.File]::WriteAllText($dst,$content,$enc)
 Write-Host ('UPDATED: '+$rel) -ForegroundColor Green
}
function Unzip-Text([string]$encoded){
 $bytes=[Convert]::FromBase64String(($encoded -replace '\s',''))
 $mem=New-Object System.IO.MemoryStream(,$bytes)
 $gz=New-Object System.IO.Compression.GzipStream($mem,[System.IO.Compression.CompressionMode]::Decompress)
 $dest=New-Object System.IO.MemoryStream
 try{$gz.CopyTo($dest);return [System.Text.Encoding]::UTF8.GetString($dest.ToArray())}
 finally{$dest.Dispose();$gz.Dispose();$mem.Dispose()}
}
function Add-AssetLink([string]$html,[string]$file,[string]$kind){
 if($html.Contains($file)){return $html}
 if($kind -eq 'css'){
  if($html -notmatch '(?i)</head>'){throw 'Cannot locate closing HEAD'}
  return [regex]::Replace($html,'(?i)</head>','<link rel="stylesheet" href="'+$file+'?v=20261010" />'+"`n"+'</head>',1)
 }
 if($html -notmatch '(?i)</body>'){throw 'Cannot locate closing BODY'}
 return [regex]::Replace($html,'(?i)</body>','<script type="module" src="'+$file+'?v=20261010"></script>'+"`n"+'</body>',1)
}
function Patch-Required([string]$s,[string]$before,[string]$after,[string]$filename){
 if($s.Contains($before)){return $s.Replace($before,$after)}
 if($s.Contains($after)){return $s}
 throw ('Cannot safely patch '+$filename+'; website version differs. No files written.')
}
# PREFLIGHT: all changes computed before writing any files.
foreach($f in @('index.html','so-cap-1.html','so-cap-2.html','lo-trinh-1-6.html','mrlee-points-core.js','mrlee-speaking-app.js','mrlee-points-gate.js','mrlee-roadmap.js','firebase-config.js')){
 if(-not (Test-Path (Join-Path $WebsitePath $f))){throw ('Missing '+$f+' in '+$WebsitePath+'. Put installer in website ROOT.')}
}
$coreOld=Read-Local 'mrlee-points-core.js'
if(($coreOld -notmatch 'maximum:200') -or ($coreOld -notmatch 'export async function commitSpeaking') -or ($coreOld -match 'export async function claimLessonPoint')){
 throw 'Unknown or already-updated points core. No files changed. Send your current mrlee-points-core.js for a safe merge.'
}
$staged=@{}

$patched=Read-Local 'mrlee-speaking-app.js'
$patched=Patch-Required $patched 'Số dư ${response.balance}/200.' 'Số dư ${response.balance.toLocaleString("vi-VN")} điểm.' 'mrlee-speaking-app.js'
$patched=Patch-Required $patched '${delta>0?''Dự kiến thưởng +''+delta:delta<0?''Dự kiến trừ ''+(-delta):''Chưa đạt mức phục hồi.''}' '${active.kind===''recovery''?(delta>0?''Dự kiến phục hồi +''+delta:''Chưa đạt mức phục hồi.''):(score>=60?''Có thể nhận +1 điểm nếu chưa nhận thưởng cho bài này.'':''Chưa đạt 60/100, không trừ điểm.'')}' 'mrlee-speaking-app.js'
$patched=Patch-Required $patched 'if(!response.historySaved){summary.textContent+='' Lưu sổ điểm thành công, nhưng lịch sử/Supabase chưa cập nhật (cần kiểm tra quyền practiceAttempts).'';}' 'if(response.lessonRewardStatus===''already'')summary.textContent+='' Bài này đã nhận +1 điểm trước đó.''; if(response.lessonRewardStatus===''error'')summary.textContent+='' Lưu bài nói thành công nhưng chưa cộng được +1 điểm (kiểm tra Firestore Rules).''; if(!response.historySaved){summary.textContent+='' Lưu sổ điểm thành công, nhưng lịch sử/Supabase chưa cập nhật (cần kiểm tra quyền practiceAttempts).'';}' 'mrlee-speaking-app.js'
$patched=Patch-Required $patched 'Bạn đã được tính điểm cho bài này hôm nay. Lượt làm lại chỉ để ôn tập, không tính thưởng/phạt.' 'Bạn đã nộp bài này hôm nay. Lượt làm lại chỉ để ôn tập; thưởng +1 chỉ một lần cho mỗi bài.' 'mrlee-speaking-app.js'
 $staged['mrlee-speaking-app.js']=$patched
$patched=Read-Local 'mrlee-points-gate.js'
$patched=Patch-Required $patched '`⭐ ${wallet.balance}/${SETTINGS.maximum} điểm`' '`⭐ ${wallet.balance.toLocaleString("vi-VN")} điểm`' 'mrlee-points-gate.js'
 $staged['mrlee-points-gate.js']=$patched
$patched=Read-Local 'mrlee-roadmap.js'
$patched=Patch-Required $patched '`${wallet.balance}/${SETTINGS.maximum}`' '`${wallet.balance.toLocaleString("vi-VN")} điểm`' 'mrlee-roadmap.js'
 $staged['mrlee-roadmap.js']=$patched
if(Test-Path (Join-Path $WebsitePath 'mrlee-engagement.js')){
 $patched=Read-Local 'mrlee-engagement.js'
$patched=Patch-Required $patched 'fmt(wallet.balance)+'' / ''+SETTINGS.maximum' 'fmt(wallet.balance)' 'mrlee-engagement.js'
$patched=Patch-Required $patched '`${wallet.balance} / ${SETTINGS.maximum}`' '`${wallet.balance} điểm`' 'mrlee-engagement.js'
$patched=Patch-Required $patched 'const badgeForPoints=(p)=>p>=160?[''Bứt phá'',''🏆'']:p>=120?[''Tăng tốc'',''🚀'']:p>=60?[''Bền bỉ'',''🌱'']:[''Khởi động'',''📘''];' 'const badgeForPoints=(p)=>p>=2000?[''Huyền thoại'',''👑'']:p>=1000?[''Bậc thầy'',''🏆'']:p>=500?[''Tinh anh'',''💎'']:p>=200?[''Xuất sắc'',''🌟'']:p>=100?[''Tăng tốc'',''🚀'']:[''Khởi động'',''🌱''];' 'mrlee-engagement.js'
 $staged['mrlee-engagement.js']=$patched
}
$homepageHtml=Read-Local 'index.html'
$homepageHtml=Add-AssetLink $homepageHtml 'mrlee-leaderboard.css' 'css'
$homepageHtml=Add-AssetLink $homepageHtml 'mrlee-leaderboard.js' 'js'
$staged['index.html']=$homepageHtml
foreach($page in @('so-cap-1.html','so-cap-2.html','lo-trinh-1-6.html')){
 $htmlContent=Read-Local $page
 $htmlContent=Add-AssetLink $htmlContent 'mrlee-lesson-reward.css' 'css'
 $htmlContent=Add-AssetLink $htmlContent 'mrlee-lesson-reward.js' 'js'
 $staged[$page]=$htmlContent
}
# All checks passed: now stage assets and write with external backup.

$payload=@'
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
'@
$staged['mrlee-points-core.js'] = Unzip-Text $payload
$payload=@'
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
'@
$staged['mrlee-leaderboard.js'] = Unzip-Text $payload
$payload=@'
H4sIAI3JyWoC/41WyY7jNhC9z1cwaAx6idWj1ZKlSxBgTlkQzABBgiAHSizZnJZFgaLbdhv9Xbnny1IkRVtSe5A5WDApsZb3XhXrwwP55RP5+e
NH8u8/5DNnUFJJJG2feLvuc0KbPT325Jn3vGyAUEUkX28UES1h0D8p0S1Iv6VNY/c9YGsgipZEqA3IPe+BPHx497htSq+3xhfjBXk4leKAqxd0
l5dCMpAe7rxOjpxq0SqvplveHPPbH4H8zkG1dEt+k+J2cfurUIJ8pm1Pfvp0u+iPvYKtt+OLHre8HiSvi070XHHR5jU/ACtMrHkQdocCM8hX+s
+Lx1sGhzxZFXvO1CYPVxlub+nB24D5vqJNdRf4PnveEI8EPr6+L8QzyLoR+5zulCgY77uGHvO6gUOhHx7jEirjuhLNbtsWa9pZzx1lTGcdpLiw
qedBdyC9aDgjN6yCpA6HF56kjO/6PNQHS1o9raXYtSyX65LehUmycL/HVXZfoCch85tgGYVJWhiAN5RhjD4JMGgS64c5GmSLOFtkeC4IbS59JU
XTeCVs6DNHKxVCT3k7ELIByk6TJGnD163HEfI+7xWVqviy6xWvj54+Ca3K+45WgAbVHsCmv+wOr8ac4gpFZfRzGoIuWRrHZWEYR1lAHviYcgNK
IQralIbs0c9ga7/ZW24y3x+b3ITOXpBFaQIje6FvWJVr3uYx4uATv2h4C47l4DG2lqpG9HBOthUtOJb8MQU3UNVRXTrQoyiJ03hG2wpdjiKIcG
k1FiEUxeDY/K92skczneAInnRlsCtPI0ACDcgk4qXznqZZSUOX3gAJ0qJ2/cltFjNTw9FllJarbPDY8F6dnED9s71C76O9YwMWkG/Ue+oI1zr5
un4q0EmbE9nVmoAUoE4n6NdZXdb1DO8gGteXNqAZ2PLWs7D7l2iwI0jMqdrwhp0mhut6BZUzPIBUh6ym7HLa/um9LZzETmlS8vASblqXGJv92n
Wg00C8Rl4DYHFUcFCegcKBMCIpceoZtL5yWu+kqHkDp1Fi1mbwrcREjpjBFOmVFO16rDbdcVyT8/YSD9H2uMfmDtfL5mxpXNVZtEroalbVDhiU
ej/2GF1EGdClv1oW+w2Cbapf604HMei0w4bDK95RBU6unu7oJuqBOrMeaSgEWrtYL8fJJprH4FSPLSIZhRRjiZevQztsutOsVblyYlm8Kt/U6c
jmBYJayFlVGMYM2PoxbZq87XZqxHlg3A68z4i7cq3E4ANc6U+uXFbTG8ZAX0yaqQ3jC/J2Gh0y+Yw65BsH4+IKyiRM68GsdTHrSrPmPm+MtksB
fYahrxma00kEF38KBxpUj8TSmvsxlcegEpKa4sDPQWrWXM5JsqTZdf8dXpeipc03NuckSoOsdBLI7N0z3FpivW5ml83VmcU3A0vivy9MTlo5Nr
sGNfznnYdv7s+jzDIo9hJtYFFsBYMcqxjlThtPNjZvITlCYhPfGi/nphn/D6NaXsTIOJxzm0blMplwOxlBjGUsKHITRGEZs3gOrqEoT31rm7wZ
+K5NeK/vftgC4/RuVBdxgvHf44DJjgZkaCnOsOzcKCyikR6JXifjppv/4vOc8pae7/i2E1LRVr1efOOs6HzHK+17YvYKY3/cuaHyPfme6Onu/t
4ya6k/HyGPUdKTalfyCkepFw7y7jFcPGYLfAYjxv1JJua/6KC97tu/n3xNrow9ZSOqp6sg2DdXck9i/23qwl7pFnJbpkqJbT4bsY3wrRkk8i7S
DC4cRM97HLvDxGA0E2M6Y0r7MwP54GalZ6sLBtbNuDQ2WAovetRtPFXOh25/kLoZHc8VEg46vmDQSaixJXgS2K4ChpYNiXZ5TQyWZB3N63Ch6f
D+2nDGoP17cWlybutrEnz3H4ZV5rfHDQAA
'@
$staged['mrlee-leaderboard.css'] = Unzip-Text $payload
$payload=@'
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
pOqh1PFMx80ZpD/mvXPL/wKEIN4Gwg4AAA==
'@
$staged['mrlee-lesson-reward.js'] = Unzip-Text $payload
$payload=@'
H4sIAI3JyWoC/2WSTU/EIBCG7/4Kkj1Uk22Fbj8i3LyaGKOJ92mBLpFCA9Tdtdn/Lu26cVcvZGYyzPu8A1mvXerEDhyfenCdMpQUwx5hNgDnyn
SUbGI611hjHReOkph7qxVHK/4gKolZA+1H5+xoOF3JUoKUP72pA65GT0ker3PlBw0HKrXYM9CqM6kKove0FSYIx+Z6unMw0PlgXQwIHvbHbEZs
xhCsmS6VSF3lhWCt1dbR3TbOOhPiv/JxzK8fPPspY0VaE2iNMZot3pOsRMmjQO9KBAM9enE2WSfPNlj0Bsajp9dk7WOQeuGUZO3ofNQdrJrhLy
Hp1n5GCGPDLY2eodGC312RY160m+bqzrlxsgO0KhxoVhVnDS4kjDqc+n2AMPppYS9n9nxhr/+z+4OP601HdYW9bGtV5FVet8vKKTkNPn0CBMvo
1KsvsTzb8eYbGWW+RCMCAAA=
'@
$staged['mrlee-lesson-reward.css'] = Unzip-Text $payload
$payload=@'
H4sIAI3JyWoC/+1cS28jxxG+76/oBRYmaZHiQyvZ1i690EpyIq9WUvQw4Aiy0TvTIicaztAzQ0m0VicDCYIgQHzMzY4PRhAvEiM5SUguCvI/+E
9S1fPqIWfI7iGllQEfJJI9XdU13VVfVb/K6ZnM/fyUOa5hW6RJCo3Ckwcuc04NjRHNtHv6/LHhMNezHUYuHhDSoZ7WJlWdevQVdZlbvQi/XlZ1
W+t1mOW5vCYhxz1L85Cva7Qspm9YxVLwhBCHeT3Hgo8vesB9nva8NnnYJFbPNJ/wKpdJFiCicWwwfZSFwPyddxIM5z37hFnzrEMN8/OQAWk2ie
f0WGor9pnFnGLP0EdaEdofbgWqI1P4SOXZdexjw2SfUNPQszsA+tjuORqbx+6cP2F9t1iab1N32zL7xcOCbrhdk/a3aIcVyqSgOYx6TF/x8Eev
qwc/jkoBcyIKmcV6xTRnylngRAyXuJ5jWC0lsnnX+JJBH33YJI1chE+b5P3aZMroJVFOz+hADdrpTqaL+iNBlzrqlu1NOeQeO/dmPNYzYIksVE
YX60fDSmpqBDCcjVrtfgwoPQUCZ7ohNTq0xdbg0fRDOQWriFRlHCMiYWzqjxelRiem5d6DucXCZ/hgmT+o/qbLWk/Qgyw9Lh+uVH5NK1/WKh/M
VZtHc48KJZVBBBQOq+BghuPIP6pV8kubuPYyadsaOTWYRbS2Qc5Zh5xS4vYo8bAIPqHYapMO/JsPKV+0basFD2zwiUDpEa9HWkDt2CarUh3qVl
sO1ZlPEPjIHvhR8I/gFy4jfaGmaZ+RFvOWiXEsuJsnieem4foVjqnpsuQzX9WHyMVOSvobFdsZ6r6pez4U2a92eyKnPppCehnXc3xcTBSV5unx
MdOA34sJvls01mQ/6cxkQT8FAx88Bg3cag+u3njk5ObfpD24/qNGPPjdXQadHFz/nng33xjkpG0Prr6zyH+/vvmOnN98q3Edhp//+8fg+jtO8a
1dRYU3B9d/AA11B9dviDa4/h51/uYNKv3ND6HW81bXBtd/B20cXP+uR3Qb4iZ8TvReH0o80gJ6I5DAvPmGYPvfetDg4PrPYC5em3ZAKJDJLhPt
5p9QMLj+iryCxknLgGLSQYnC5gKrMRl1LICk9VOMJKsXDD83BBOabEQjZiSEdcKQwn+nP28aHcPjaFarDTMYb2tSaB3owIlh6YVyoQt4Bx+e4Z
n4qTMPQlP4EjvkI0X+vjeYNXtgRwyLHBZODdeAKKEAswTXtpC33TU0bMqh4Bc1VjiSYYiCpXibCRSCq1mqSRPFPubQ9ySVo7nD+aO21zFFdzIu
BMH+UxOXkwjha12ZCDWwLvWW/rCqyefTqLc1IbDK41aGjczHw3IK+vm1LgUUfDG4+s8++dXB4OovZPPg08H1b7fI/uDqh50yAM3NvwB0uog3Bm
AQgNZXHYAcI8Q2RJ+/aqTIzmlnl7k903NLAtT9908BxeD6b+RjiPb2NMfoeiFfH7siLOXwimU/agBoVz9CjT2m9RzD65NdnFMPoVpoLiuexzpd
xDXqf/vJIxt25waCD37ZD5DHBNRG4HE12+GIZHsUf+s9h2I0DX1lW7qLNTjvBEaVCw6D+OzsY0ScfHg4e6Hk5PDbVTNNnyYNti7q5aXapSRoRW
+q3vp+HvAaIZQHFT4Qvn9xtTofkQb/v8D/P+b/F/n/JRwnXqfFQE1hvKT8DR9i7AjD8qSQGFVBub40zvPaviHKSw/cFWo/bY5rXMpFJM1AoTeG
KWUlH6aDd3ivIddFAJFFESYgri6U1DQ/lYWozLj0IDcC/Dv6uYI/Pfw8io5+gj52lcfzMDf4OvKiJg/4LX/OkTIR4DOLJ6GrxPj/ez4t+Bp+tQ
xqwYTj6o01LzTSBIFf7pLN9XVSryyRCvlkg6xtrL8kn6yQvf3d9ZUXWEWYiBgwbdHF6bcHcxtsEifmeg+m9HxiQ4mONX23b3Cv39NCXxyt5ZxB
rzDPn6gJ3jdYzDksvKImtbgDwMkIQ0di2i56psBro5MwqeuthE48+L3GTFyREcaOF/O5zH6/y4Jqmzya9qnslmHteTCQJ/DrFQxg9IM/WqP9sL
FN/B01xX+htxQbE52oMM+Mhzm1I/batMvSekIqBBA7M4ezViYPBkcBn0IKWVzyB12hgYBAlj/qkgJ3Xl2Wd6igCvwjEnn5I51Veo2YSral2B5U
hjsm+rA5WRhp2dEUVd+X00j3a2zWyq5AAAg1N5iAsSlIRc9Zk3/dAAnVGw4phXbfk26W47TKWEY0MJaVBTUS7JFFWZLIVQTxcRc0FHoldAfxUs
zR7YYWE5d2R3wJsG6x57bVc4suN6wUh+I/QJYL5Bmpk2VSjIveg6KFZFH9MZQtJssWalD2PpTVSqVSpjQOO6OOvqJ5PWoWAwdQzpSrQeZS5M9k
bpt6YKfpXnMkzEw47HggsAYrYpxZrpfrY97GYuc+vQ9Zaa2KMvl8S9hbRXHswvIKCUPv+VNq9lixDrPgQsL9Pkt9DTFYqZWg03AI65li8/ofGc
zU3T3aYSvuc3YMkxX5UEP0GSNL/WkiKfqHdJ5iFCbHMsb6MVL6oZwkQwHOM1gmIsJCSdXBAFdRZbLHkMPNLjenVR9O0sbvITs3XM8tCidDHhXD
76X4aEiwK/aILzhVReZYOBnuh2NE6IuVY485d9BwuHgReKxmU8I7vWVhu7aBx3EQSTMH+BR33bbYmU+rYJsJb4WT38AzqXnHpuQiSsLnx4tlrn
YIE8ijSrEGnx8cva4f1iqLR6VHrz/jOxWVeDGtUX68KLuYFoXETYXQLY6isDMKqjFxUz0mbqoE7CE81XLgT6GQA16y3JzKlA21o1ZXmINJqxNO
qkZ7IxXtxpuOr5QH3cC3/mw9ycD+Ybb3ildB1K0y/UkuUx3zeEg5ssIZRY1OfzBHFPU8tXxOTf1HS4epMxZSGtMbDvicvWB6M43dRFMkVRVSNp
yfcX22uF4DbZ0AcGoWUZw4eyc1PrMZXwunlipGNLHZp7zZyszaFeG/NpMQMzSiaH96XJQZwWMYZnZs3bdFy3Y61CzcA5H0qH8mB76o2lN5br4y
c4/jyltEuiRq1ZVRq54DgFLP6t3G2uhtoFXCeBtq+NaYIrLNaYU6Ncz+aptpYIoT5p5+D48YYGPMqtZZoNtp1vc2YCN7cTPgykdu+BB4JHJRfK
MRVJQFdNEHvH6dxdRhmn3KnD5nm6gSHR9YEledVWYUi9mh31OI/CbEdWFQN/2UKHdol/FkLh8Sqs9f0tRFHe4f3qO5yUzjtIyZy1sK31JK524x
pnu74dAEeScsdaCSzWClIyVeStu+eJh09UHx3a4UTIcDs16BmMHug/wKQSKEHNmBUg8OixO3WsDAR3e6nk3eogErG6FT3mZ5eFvbLHnC1bXYXo
V9zFRwLud79XuC+bOIqCXXst5aBKyIucGRcdfr6f0dvoFTvfA3cuQOi/MbVUF9jrf+EatC5iHyxFHAsSfEs1hjeeIs2VSnF5PExZTFQgiLh2fv
YlGwk1VKPwZ5h+80/maa8HojMXP4OkmXG5Um9hxG3jP7mGd0oHKuTna2N7b2yc46HsPc29veIttbm5/Cv9V1srFFVlZXtw/g+ebGR+v7Gy/XR6
5piXuSF+Gu6H29zGDe1d7HyP0IM44OfC3DawUmBTXPf91rFjzFfWwzdbc6445VvKUsZRChWOONPG9QLGCkb6slpe2122h2c2LH3kar8eRd/ex3
BAq8x0jYPK6VBaCFh9G8NiMu5nbwHGq5NLgV7wYYGTQzhBJJ33mh0/5dQMRCPQdCcNnEWzhg+0cXjy8r/pdG/CUvEkALeNuI9vnxbDc6841Hzv
htTX52fGpwuKVmgCGqF+8myfqjRq8whZMEjowbGapnht3ovLAUqvHORMGEQ4PjGMv1sOKhVD08kFqTr80d6B1gYLzFmKIwt9biPfAyKUsbM291
+FBktt7dod8Zo3W5byOFM6Hhpa+7vDzbuMW7sx51T3gUh1/Ca6q4wu8DuHBXNUTt8M6q76c4KXpjflXZv8U2dS6BeyGUL4TiHXxOkxLhR447K7
R//Vm4m1I5rDeOJB08ekS1S/i0ny/AoMnFwjEdNkcKlULmsgoIINuROa4SR2TKeRCGCeWvEvPtMH5TIthkK8cbY0M3JIqSWjOsCmNOeIxuxsmt
valeT855IVjyHs5dxR2Lt3oTe0HpJraULAGeKUgTUnwouVcf1p/+9nYScRUNN0ErGuHSyA3oSZYQ7nU/G6sOuM2Nt3om1Ak3osfaxNJiaZbLjb
cRJCU2e2j61s5PLjirVsmeTTxwgholVptaQ3N/zIAIoRp+ZMRp5bRQLEe0JeRanKEi5LwXJ5f0bAZyS6wt5817NqvMZ2G+ybSUZylr1aNKICrb
CiYcoAZe8LeWiZBcr+qnZnSrQRq5mOQj+EU+3ln/BRASi1mYKAAYUEwZgPkPD3Y3y8TjRUEyQ3LSJ15vSJND/hf+F/ldmLA+R8ZAulzbMGUZdU
ptLa1KoHNSIzHxNS6HkizuHDzf3Fglm+sra+u7z7dXdtfKZHtnv7Lh7y8sYxYHUHzipxTmuXnL5GBjDV0WYByBbzZoTyKTYscxGdtkVGfOK5s6
+tikinFy35EeTpviBUmHpWaAKkMiPwuE0aCuuJQfrdlNlyJ0Vnw5H5VcoZxALZdvggSXcCXSigY7EUPR2aTqibhVcQFRYvmwNqO8k7muU6YEAw
8UNnTwwMOMoo/gEIF0z822dWGFLDPD5rCziRHsOTgZzBHrgKNplXmWWASmE/jkcIXe4pxqQobYcJ0KM8Axf/8ndU80LfKJE4uPQ5mseCyWeo3x
rDc5hV4/px1Mtslzkd2NwC+YR77AtLuJXD3lMMWPkNkHM+1iWp+E3EIavzAMGLc8KBd05nuTl9CvOn+BHuYINlBqHmJgimF4Q/4SJ21Qq1fUTr
zERajZzXffHZYVhNDL5Mwx0prGv8sH/wfDelEWvl8AAA==
'@
$staged['firestore-rules-MR-LEE-BXH-KHONG-GIOI-HAN.rules'] = Unzip-Text $payload
foreach($name in ($staged.Keys | Sort-Object)){Set-Local $name $staged[$name]}
Write-Host ''
Write-Host 'SUCCESS: Leaderboard enabled; unlimited points, +1 per lesson once.' -ForegroundColor Green
Write-Host ('Backups (if any): '+$backupPath)
Write-Host 'IMPORTANT: Publish firestore-rules-MR-LEE-BXH-KHONG-GIOI-HAN.rules in Firebase Console.' -ForegroundColor Yellow
Write-Host 'Then git add/commit/push changes, test with a verified student account.'
