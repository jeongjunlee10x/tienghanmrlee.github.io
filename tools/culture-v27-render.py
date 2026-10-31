#!/usr/bin/env python3
"""Culture V27: ten individually composed, original vector scene illustrations.
No user or third-party photographs, no derivation of previous montage, native SVG.
"""
import io,random,hashlib,json,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import cairosvg

BASE=Path(__file__).resolve().parent
OUT=BASE/'images/culture-v27-art'
W,H=1536,1024
TOPICS={
 'lich-su':[
  ('Triều điện và kiến trúc cung đình thời Joseon','Minh họa nghệ thuật cung điện Hàn Quốc, không phải hình chụp lịch sử'),
  ('Mũ miện vàng và hiện vật của vương quốc Silla','Hình minh họa hiện vật cổ trong phòng trưng bày bảo tàng'),
  ('Khu phố hanok và kiến trúc gỗ truyền thống','Minh họa đường phố nhà hanok trong không gian lịch sử'),
  ('Di sản thư pháp và văn hóa học thuật truyền thống','Minh họa bút lông, mực và thư tịch cổ trên bàn gỗ'),
  ('Chùa, tháp đá và di sản kiến trúc cổ Hàn Quốc','Minh họa tháp đá và chùa cổ, không nhằm xác định di tích cụ thể'),
 ],
 'hien-dai':[
  ('Seoul hiện đại và đô thị bên sông Hàn','Minh họa thành phố Seoul hiện đại ở thời điểm hoàng hôn'),
  ('Giao thông tốc độ cao và hệ thống đường sắt','Minh họa đoàn tàu cao tốc trong nhà ga Hàn Quốc'),
  ('Công nghệ bán dẫn và nghiên cứu kỹ thuật','Minh họa không gian nghiên cứu và sản xuất công nghệ'),
  ('Dịch vụ số và giao thông đô thị thông minh','Minh họa thanh toán số và đi lại tại đô thị Hàn Quốc'),
  ('Giới trẻ, sáng tạo và đời sống Hàn Quốc hiện đại','Minh họa thanh niên làm dự án sáng tạo trong không gian cộng đồng'),
 ]}

def defs(a,b,light='#fbc89d'):
 return f'''<defs>
 <linearGradient id="bg" x2=".1" y2="1"><stop stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>
 <linearGradient id="ground" x2="0" y2="1"><stop stop-color="{b}"/><stop offset="1" stop-color="#101b37"/></linearGradient>
 <linearGradient id="glass" x2="1" y2="1"><stop stop-color="#ffffff" stop-opacity=".43"/><stop offset=".45" stop-color="#86e6f7" stop-opacity=".17"/><stop offset="1" stop-color="#ffffff" stop-opacity=".04"/></linearGradient>
 <radialGradient id="sun"><stop stop-color="{light}" stop-opacity=".9"/><stop offset=".45" stop-color="{light}" stop-opacity=".38"/><stop offset="1" stop-color="{light}" stop-opacity="0"/></radialGradient>
 <radialGradient id="ambient"><stop stop-color="#ffffff" stop-opacity=".25"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
 <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="20"/></filter>
 <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>
 <pattern id="wood" width="45" height="65" patternUnits="userSpaceOnUse"><path d="M2 0 V65 M18 0 V65" stroke="#ffd8a8" stroke-opacity=".12" stroke-width="3"/></pattern>
 <pattern id="windows" width="44" height="47" patternUnits="userSpaceOnUse"><path d="M 12 10 h 12 v 20 h -12 z" fill="#a4ddf6" fill-opacity=".7"/><path d="M 32 11 h 8 v 17 h -8 z" fill="#ffeaa3" fill-opacity=".35"/></pattern>
 <pattern id="circuit" width="132" height="132" patternUnits="userSpaceOnUse"><path d="M0 55 H70 V100 H132 M35 0 V25 H91 V55" stroke="#39d9e5" stroke-width="4" opacity=".25" fill="none"/><circle cx="70" cy="100" r="8" fill="#7cf4f2" opacity=".6"/></pattern>
 </defs>'''

def bg(top,bottom,mode='historic',seed=1):
 rng=random.Random(seed)
 s=[defs(top,bottom,'#eebd8c' if mode=='historic' else '#80faff'),'<rect width="1536" height="1024" fill="url(#bg)"/>',
    '<circle cx="1110" cy="250" r="460" fill="url(#sun)"/>',
    '<circle cx="250" cy="270" r="330" fill="url(#ambient)"/>']
 for i in range(55):
  x=rng.randrange(50,1500);y=rng.randrange(45,770);r=rng.choice([2,3,4]);
  s.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#eaf9ff" opacity="{rng.uniform(.2,.72):.2f}"/>')
 if mode=='historic':
  s+=['<path d="M0 590 Q150 430 295 554 Q440 325 587 540 Q790 340 910 540 Q1110 338 1240 515 Q1440 350 1536 512 V1024 H0Z" fill="#173e59" opacity=".50"/>',
       '<path d="M0 715 Q260 565 480 678 Q760 520 970 680 Q1270 563 1536 655 V1024 H0Z" fill="#112d42" opacity=".70"/>']
 else:
  s+=['<path d="M0 700 Q240 645 460 692 Q660 610 890 687 Q1235 570 1536 668 V1024 H0Z" fill="#0f416b" opacity=".42"/>']
 return '\n'.join(s)

def roof(x,y,w,height=118,fill='#26334a',outline='#cfa46d',flip=False):
 # Curved eaves with overhang, ridge and support rafters; stylized rather than architectural record.
 x2=x+w;tip=28 if not flip else 43
 shapes=[f'<path d="M{x-90} {y+38} Q{x+w*.18} {y-45} {x+w*.50} {y-57} Q{x+w*.86} {y-44} {x2+90} {y+38} L{x2+47} {y+78} Q{x+w*.50} {y+34} {x-47} {y+78} Z" fill="{fill}" stroke="{outline}" stroke-width="9"/>',
 f'<path d="M{x-85} {y+35} Q{x+w*.10} {y-30} {x+w*.5} {y-50} Q{x+w*.9} {y-30} {x2+85} {y+35}" stroke="#edce92" stroke-width="8" fill="none"/>',
 f'<path d="M{x-46} {y+72} H{x2+48}" stroke="#bd835b" stroke-width="12"/>']
 for i in range(15):
  xx=x+i*w/14
  shapes.append(f'<path d="M{xx:.1f} {y-11+abs(i-7)*2:.1f} l-20 73" stroke="#6b7683" stroke-width="4" opacity=".72"/>')
 return ''.join(shapes)

def lattice(x,y,w,h,frame='#be8a53',glass='#c0dcc9'):
 s=[f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{glass}" stroke="{frame}" stroke-width="11"/>']
 for i in range(1,5):
  s.append(f'<path d="M{x+i*w/5} {y} V{y+h}" stroke="{frame}" stroke-width="6"/>')
 for i in range(1,3):
  s.append(f'<path d="M{x} {y+i*h/3} H{x+w}" stroke="{frame}" stroke-width="6"/>')
 return ''.join(s)

def cloud(x,y,s=1,opacity=.4):
 return f'<g opacity="{opacity}"><ellipse cx="{x}" cy="{y}" rx="{115*s}" ry="{26*s}" fill="#fbebda"/><ellipse cx="{x+60*s}" cy="{y-20*s}" rx="{75*s}" ry="{36*s}" fill="#fbebda"/><ellipse cx="{x-45*s}" cy="{y-18*s}" rx="{62*s}" ry="{31*s}" fill="#fbebda"/></g>'

def lantern(x,y,color='#f0b064',r=18):
 return f'<g><path d="M{x} {y-95} V{y-20}" stroke="#f7d8a2" stroke-width="4"/><ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*1.3}" fill="{color}" stroke="#ffe9bc" stroke-width="3"/><path d="M{x-r*.8} {y} H{x+r*.8} M{x} {y+r*1.2} v20" stroke="#ffe6c2" stroke-width="3" opacity=".7"/></g>'

def person(x,y,scale=1,top='#a3cdf2',bottom='#243b5d'):
 return f'<g transform="translate({x} {y}) scale({scale})"><ellipse cx="0" cy="-88" rx="29" ry="32" fill="#f3c6a0"/><path d="M-28 -105 q24 -35 52 0 l-4 -17 q-24 -22 -50 0 z" fill="#273c50"/><path d="M-25 -57 Q0 -70 24 -57 L53 42 H-54Z" fill="{top}"/><path d="M-25 42 H25 L31 128 H4 L0 80 L-5 128 H-35Z" fill="{bottom}"/></g>'

def plant(x,y,s=1,color='#142f35'):
 parts=[f'<g transform="translate({x} {y}) scale({s})"><path d="M0 180 Q-20 20 0 -70" stroke="#583b34" stroke-width="18" fill="none"/>']
 for angle,yy,r in [(-60,-45,120),(-15,-85,110),(50,-50,110),(-100,20,86),(80,20,75)]:
  rad=math.radians(angle);ex=math.cos(rad)*r;ey=yy+math.sin(rad)*r*.5
  parts.append(f'<path d="M0 {yy+80} Q{ex/2:.1f} {yy+10} {ex:.1f} {ey:.1f}" stroke="#694b39" stroke-width="11" fill="none"/>')
  parts.append(f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{48 if s>1 else 46}" fill="{color}" opacity=".88"/>')
 parts.append('</g>');return ''.join(parts)

def historic_palace():
 s=[bg('#172d54','#b66d65','historic',41),cloud(480,170,.9),cloud(1270,140,.65)]
 s+=['<path d="M0 805 H1536 V1024 H0Z" fill="#5d5162"/>',
 '<path d="M450 738 L1060 738 L1420 1024 H110Z" fill="#cbb49b" opacity=".8"/>',
 '<path d="M530 745 L970 745 L1130 1024 H370Z" fill="#e2d3b8" opacity=".72"/>']
 for x,y,w in [(300,456,930),(395,575,730)]:
  s.append(f'<rect x="{x}" y="{y+65}" width="{w}" height="{235 if w>800 else 168}" fill="#ab795c" stroke="#e8b47d" stroke-width="12"/>')
  for i in range(7):
   cx=x+65+i*(w-130)/6
   s.append(f'<rect x="{cx-15}" y="{y+107}" width="30" height="{190 if w>800 else 130}" fill="#66445a" stroke="#d9b189" stroke-width="5"/>')
  s.append(roof(x,y,w,'') if False else roof(x,y,w))
 for x in range(420,1100,85):s.append(f'<path d="M{x} 780 v67" stroke="#b9a286" stroke-width="10"/>')
 s+=[lantern(330,580),lantern(1200,570),plant(115,730,.75,'#7c7554'),plant(1440,760,.68,'#b16d59')]
 for x in [570,970,1060]:s.append(person(x,885,.57,'#e6c4c4','#40536d'))
 return ''.join(s)

def silla_crown():
 s=[bg('#121c39','#345b66','historic',43)]
 s+=['<path d="M0 775 H1536 V1024 H0" fill="#152d3c"/>','<path d="M0 754 H1536" stroke="#d0ac69" stroke-width="10"/>']
 for x in [80,1200]:
  s.append(f'<rect x="{x}" y="100" width="250" height="620" fill="#214657" stroke="#aa8e68" stroke-width="12"/>')
  for y in [260,430,600]:s.append(f'<rect x="{x+30}" y="{y}" width="190" height="13" fill="#a9bfaa" opacity=".48"/>')
 s+=['<ellipse cx="760" cy="955" rx="520" ry="68" fill="#020c20" opacity=".5"/>',
 '<rect x="360" y="775" width="810" height="240" rx="25" fill="#53677a" stroke="#d7c18f" stroke-width="16"/>',
 '<rect x="415" y="180" width="700" height="610" rx="30" fill="url(#glass)" stroke="#bedbdd" stroke-opacity=".75" stroke-width="16"/>',
 '<path d="M450 775 H1080" stroke="#fff2c5" stroke-width="11"/>',
 '<ellipse cx="770" cy="660" rx="280" ry="65" fill="#806241" opacity=".8"/>',
 '<ellipse cx="760" cy="602" rx="200" ry="38" fill="#f8ce71" stroke="#fff4b9" stroke-width="10"/>']
 for i in range(7):
  x=550+i*70
  h=260-abs(i-3)*34
  s.append(f'<path d="M{x} 605 V{605-h} M{x-35} {605-h+70} H{x+35} M{x-28} {605-h+120} H{x+28}" stroke="#f9c96b" stroke-width="25" stroke-linecap="round"/>')
  for y in [605-h+30,605-h+103]:s.append(f'<circle cx="{x}" cy="{y}" r="15" fill="#86e4d2" stroke="#ffe4a1" stroke-width="7"/>')
 s+=['<path d="M430 188 H1100" stroke="#ffffff" stroke-opacity=".55" stroke-width="6"/>',
 '<path d="M470 230 L660 180" stroke="#ffffff" opacity=".25" stroke-width="10"/>']
 for x in [500,1050]:s.append(f'<path d="M{x} 120 l-90 180 l130 -70" fill="#fee4a9" opacity=".11"/>')
 return ''.join(s)

def hanok_street():
 s=[bg('#1c365a','#e6aa75','historic',45),cloud(970,120,.8)]
 s+=['<path d="M520 1024 L690 500 H850 L1060 1024 Z" fill="#d6ba9a"/>',
 '<path d="M0 1024 L0 625 L660 520 L620 1024Z" fill="#806251"/>',
 '<path d="M1536 1024 L1536 595 L870 512 L935 1024Z" fill="#705a50"/>']
 for side in ['left','right']:
  for k in range(3):
   if side=='left':x=40+k*175;y=535-k*60;w=270-k*30
   else:x=1180-k*160;y=520-k*50;w=300-k*25
   s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{430+k*20}" fill="#c5a078" stroke="#3a3f43" stroke-width="15"/>')
   s.append(lattice(x+28,y+90,w-56,225,'#5c3f3e','#d9ceb3'))
   s.append(roof(x-8,y-80,w+22,fill='#2f3647'))
   s.append(lantern(x+w*.35,y+70,'#ed935c',16))
 for x,y in [(700,850),(850,930),(810,730)]:s.append(person(x,y,.75,'#cfb9d6','#294766'))
 s+=['<path d="M720 1024 L753 570" stroke="#ffdfba" opacity=".45" stroke-width="4"/>',plant(1415,705,.55,'#96694a')]
 return ''.join(s)

def scholar_study():
 s=[bg('#2d253f','#be795a','historic',47),cloud(1130,145,.5,.18)]
 s+=['<rect x="0" y="760" width="1536" height="264" fill="#4a333c"/>',
 '<rect x="130" y="160" width="500" height="570" rx="15" fill="#84665b" stroke="#efd0a1" stroke-width="16"/>',
 '<rect x="170" y="203" width="420" height="490" fill="#a7b1ac" opacity=".5"/>']
 for x in [265,370,475]:s.append(f'<path d="M{x} 203 V693" stroke="#543f49" stroke-width="16"/>')
 for y in [360,522]:s.append(f'<path d="M170 {y} H590" stroke="#543f49" stroke-width="16"/>')
 s+=['<path d="M60 775 L1495 775 L1450 1024 H100 Z" fill="#86604c" stroke="#d39d6a" stroke-width="14"/>',
 '<path d="M110 825 H1430" stroke="#e6b683" stroke-width="9" opacity=".8"/>',
 '<rect x="570" y="770" width="570" height="210" rx="16" fill="#ead8b7" stroke="#a17d55" stroke-width="8"/>']
 for i in range(5):
  y=810+i*29
  s.append(f'<path d="M630 {y} Q740 {y-12} 826 {y} M880 {y} Q955 {y-10} 1048 {y}" fill="none" stroke="#3f4149" opacity=".72" stroke-width="5"/>')
 s+=['<path d="M1120 730 L1298 270" stroke="#4c3d38" stroke-width="25" stroke-linecap="round"/>',
 '<path d="M1298 270 q43 56 -12 97 q-28 -45 12 -97" fill="#1c2634"/>',
 '<ellipse cx="390" cy="884" rx="140" ry="48" fill="#1c2a36" stroke="#ceb17b" stroke-width="14"/>',
 '<ellipse cx="390" cy="880" rx="96" ry="20" fill="#4d626a"/>',
 '<rect x="1100" y="850" width="110" height="80" rx="20" fill="#b79370"/>',
 lantern(1370,310,'#e4af77',30)]
 return ''.join(s)

def temple_pagoda():
 s=[bg('#273850','#dc886d','historic',49),cloud(450,175,.8)]
 s+=['<path d="M0 820 H1536 V1024 H0" fill="#746458"/>',
 '<path d="M0 840 Q500 770 770 838 Q1150 770 1536 815 V1024 H0Z" fill="#b9a48b"/>']
 for k in range(5):
  y=725-k*125;w=370-k*58;x=770-w/2
  s.append(f'<rect x="{x}" y="{y-75}" width="{w}" height="80" fill="#c9c4b4" stroke="#736d6a" stroke-width="9"/>')
  s.append(f'<path d="M{x-55} {y-75} Q770 {y-160} {x+w+55} {y-75}" fill="#ddd9cb" stroke="#756e67" stroke-width="9"/>')
 s.append('<path d="M770 30 V150" stroke="#cfbc91" stroke-width="25"/>')
 s+=['<rect x="85" y="610" width="395" height="235" fill="#a87a61" stroke="#e0b18a" stroke-width="12"/>',roof(85,540,395,fill='#2d394a')]
 for i in range(3):s.append(lattice(117+i*115,680,105,132,'#553d40','#d1bba5'))
 s+=['<path d="M0 1000 Q380 920 550 1000" stroke="#e7c5a0" stroke-width="18" fill="none"/>',plant(1410,725,.89,'#b88455'),plant(130,710,.65,'#3a6957')]
 for x in [170,370,1390]:s.append(lantern(x,580,'#f4af81',22))
 return ''.join(s)

# Modern motifs
def building(x,y,w,h,shade='#204b74',seed=1):
 rng=random.Random(seed);parts=[f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="{shade}" stroke="#87d7f0" stroke-opacity=".35" stroke-width="5"/>']
 step=27 if w<150 else 34
 for xx in range(int(x+20),int(x+w-14),step):
  for yy in range(int(y+28),int(y+h-12),step):
   if rng.random()<.8:
    col=rng.choice(['#a1f6ff','#f0ccab','#b2e1ff','#4697c8'])
    parts.append(f'<rect x="{xx}" y="{yy}" width="13" height="17" rx="2" fill="{col}" opacity="{rng.uniform(.35,.85):.2f}"/>')
 return ''.join(parts)

def city():
 s=[bg('#121e54','#925c9e','modern',53),'<path d="M0 765 Q770 650 1536 764 L1536 1024 H0Z" fill="#20557e"/>']
 coords=[(20,435,143,355),(155,505,148,280),(303,352,155,428),(430,520,130,270),(580,460,170,320),(790,520,145,260),(950,445,160,340),(1100,485,145,300),(1270,370,190,418)]
 for i,(x,y,w,h) in enumerate(coords):s.append(building(x,y,w,h,seed=80+i))
 s+=['<path d="M705 80 L745 160 L773 718 H630 L663 160 Z" fill="#457cb7" stroke="#8bdbf1" stroke-width="10"/>',
 '<path d="M717 63 V10" stroke="#d8eafa" stroke-width="13"/>',
 '<path d="M674 300 H757 M655 507 H770" stroke="#a8f0ff" stroke-width="11" opacity=".75"/>',
 '<path d="M0 785 H1536 V1024 H0Z" fill="#266287"/>',
 '<path d="M0 895 Q410 700 780 878 Q1170 700 1536 850" fill="none" stroke="#c9daf2" stroke-width="20"/>',
 '<path d="M0 920 Q410 730 780 900 Q1170 740 1536 872" fill="none" stroke="#61e8e0" stroke-width="8"/>']
 for x in range(30,1530,42):s.append(f'<path d="M{x} 928 l-11 60" stroke="#b6ffff" opacity=".30" stroke-width="4"/>')
 return ''.join(s)

def high_speed_train():
 s=[bg('#132646','#236d8b','modern',55)]
 s+=['<rect x="0" y="82" width="1536" height="145" fill="#173c58"/>',
 '<path d="M0 210 H1536 M0 264 H1536" stroke="#b8dce7" opacity=".45" stroke-width="12"/>']
 for x in range(80,1536,180):s.append(f'<path d="M{x} 100 V690" stroke="#8dc5d7" stroke-width="17" opacity=".3"/>')
 s+=['<path d="M0 720 H1536 V1024 H0Z" fill="#455e70"/>',
 '<path d="M0 780 H1536" stroke="#dbe5e4" stroke-width="13"/>',
 '<path d="M0 920 H1536" stroke="#b0c7d0" stroke-width="17"/>',
 '<path d="M0 690 Q310 588 1090 585 Q1290 580 1478 705 L1536 775 H0Z" fill="#e3eaf0" stroke="#d4f5f8" stroke-width="15"/>',
 '<path d="M0 730 Q400 628 1120 632 Q1290 634 1478 717" fill="none" stroke="#36b4d5" stroke-width="32"/>',
 '<path d="M960 590 Q1250 590 1448 705 L1500 733 Q1210 740 1000 740Z" fill="#215b84"/>',
 '<path d="M1190 648 Q1310 655 1424 714" fill="none" stroke="#a1e7ed" stroke-width="8"/>']
 for i in range(8):
  x=85+i*104
  s.append(f'<rect x="{x}" y="649" width="72" height="35" rx="10" fill="#397da3" stroke="#b2edf3" stroke-width="5"/>')
 for x in [370,710,1090]:s.append(f'<path d="M{x} 795 V970" stroke="#b7d9dc" stroke-width="18"/>')
 s+=[person(480,895,.45,'#e7a99b','#334c62'),person(620,900,.49,'#92bed8','#273850')]
 return ''.join(s)

def semiconductor():
 s=[bg('#101d3c','#29677e','modern',57)]
 s+=['<path d="M0 1000 H1536 V1024 H0Z" fill="#172e4e"/>',
 '<rect x="100" y="130" width="1320" height="735" rx="55" fill="#20465f" stroke="#75d5e6" stroke-opacity=".8" stroke-width="13"/>',
 '<rect x="155" y="183" width="1220" height="630" rx="38" fill="url(#circuit)" stroke="#82bdcf" stroke-width="8"/>',
 '<ellipse cx="760" cy="750" rx="420" ry="90" fill="#081f37" opacity=".65"/>',
 '<circle cx="760" cy="510" r="290" fill="#318cb1" stroke="#e3fdff" stroke-width="22"/>',
 '<circle cx="760" cy="510" r="235" fill="#143f65" stroke="#68dfe8" stroke-width="13"/>']
 for i in range(15):
  theta=i*math.pi*2/15
  x=760+205*math.cos(theta);y=510+205*math.sin(theta)
  s.append(f'<path d="M760 510 L{x:.2f} {y:.2f}" stroke="#65e8e4" stroke-width="5" opacity=".68"/>')
  s.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="13" fill="#b7effc"/>')
 s+=['<rect x="672" y="423" width="176" height="176" rx="25" fill="#17385d" stroke="#e3faff" stroke-width="14"/>',
 '<path d="M720 462 H806 M720 510 H806 M720 552 H806" stroke="#65dbdf" stroke-width="18"/>',
 '<path d="M160 330 Q260 180 352 390 L430 560" fill="none" stroke="#b8e6ec" stroke-width="30"/>',
 '<path d="M1360 320 Q1250 170 1160 375 L1090 570" fill="none" stroke="#b8e6ec" stroke-width="30"/>',
 '<circle cx="430" cy="560" r="42" fill="#cdd9e1" stroke="#286e82" stroke-width="13"/>',
 '<circle cx="1090" cy="570" r="42" fill="#cdd9e1" stroke="#286e82" stroke-width="13"/>']
 return ''.join(s)

def digital_mobility():
 s=[bg('#1c2c55','#ac729a','modern',59)]
 for idx,(x,y,w,h) in enumerate([(30,355,220,480),(250,450,160,385),(1160,410,160,440),(1280,305,230,540)]):s.append(building(x,y,w,h,seed=100+idx))
 s+=['<path d="M0 850 H1536 V1024 H0Z" fill="#293f64"/>',
 '<path d="M0 917 H1536" stroke="#b9cbd4" stroke-width="16"/>',
 '<rect x="460" y="330" width="630" height="510" rx="56" fill="#213d66" stroke="#a9edf4" stroke-width="18"/>',
 '<rect x="495" y="362" width="560" height="420" rx="30" fill="url(#glass)" stroke="#7dc3e0" stroke-width="8"/>',
 '<path d="M520 700 H1020" stroke="#e1faff" stroke-width="22"/>',
 '<path d="M585 530 Q760 400 945 530" stroke="#68e8ed" stroke-width="27" fill="none"/>',
 '<path d="M650 574 Q760 475 875 574" stroke="#cceeff" stroke-width="24" fill="none"/>',
 '<circle cx="760" cy="618" r="31" fill="#d1f8ef"/>',
 '<rect x="1160" y="550" width="160" height="310" rx="29" fill="#1c395c" stroke="#b9eaf4" stroke-width="13"/>',
 '<rect x="1180" y="585" width="120" height="210" rx="14" fill="#7ecfe2"/>',
 '<path d="M1200 678 L1232 715 L1280 627" stroke="#f7fff1" stroke-width="16" fill="none"/>',
 '<circle cx="1240" cy="827" r="9" fill="#a1edee"/>']
 for x in [200,1430]:s.append(person(x,900,.55,'#a8cddd','#284663'))
 return ''.join(s)

def young_creatives():
 s=[bg('#1c234f','#9b68a0','modern',61)]
 s+=['<path d="M0 730 H1536 V1024 H0Z" fill="#374e6e"/>',
 '<rect x="160" y="200" width="1200" height="520" rx="40" fill="#35587a" stroke="#a7e7ee" stroke-width="16"/>',
 '<rect x="212" y="247" width="1100" height="420" rx="30" fill="url(#glass)"/>']
 for x,y,w,h in [(250,300,180,290),(450,325,165,270),(930,310,170,310),(1110,350,130,255)]:s.append(building(x,y,w,h,seed=x))
 s+=['<path d="M115 785 H1420 L1325 1024 H195 Z" fill="#aa7d78" stroke="#f0c6a1" stroke-width="16"/>',
 '<rect x="630" y="680" width="255" height="185" rx="18" fill="#dfe5ec" stroke="#2f5d7a" stroke-width="12"/>',
 '<rect x="645" y="697" width="223" height="135" rx="8" fill="#347d9c"/>',
 '<path d="M680 790 L745 733 L785 780 L820 724" stroke="#8bffea" stroke-width="10" fill="none"/>',
 '<rect x="410" y="685" width="150" height="180" rx="18" fill="#e2e0dc" stroke="#b8a89f" stroke-width="8"/>',
 '<circle cx="470" cy="765" r="28" fill="#efa59b"/>',
 '<path d="M1320 810 h90 v100 h-90 z" fill="#9a665d"/>',
 plant(1400,830,.52,'#5c9483')]
 s+=[person(310,720,1.12,'#f1ae9c','#303658'),person(1050,745,.98,'#94c2df','#273b54'),person(1240,760,.87,'#dbc5a3','#364060')]
 return ''.join(s)

SCENES={
 'lich-su':[historic_palace,silla_crown,hanok_street,scholar_study,temple_pagoda],
 'hien-dai':[city,high_speed_train,semiconductor,digital_mobility,young_creatives]
}

def main():
 rng=random.Random(1337);rows=[]
 for slug,functions in SCENES.items():
  for index,fn in enumerate(functions,1):
   content=fn()
   svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">{content}</svg>'
   dest=OUT/slug/f'{index:02d}.webp';dest.parent.mkdir(parents=True,exist_ok=True)
   png=cairosvg.svg2png(bytestring=svg.encode(),output_width=W,output_height=H)
   im=Image.open(io.BytesIO(png)).convert('RGB')
   # Original vector paths remain sharp; very subtle fine-grain removes overly flat synthetic feel.
   from PIL import ImageEnhance
   im=ImageEnhance.Contrast(im).enhance(1.02)
   im.save(dest,format='WEBP',quality=91,method=6)
   (OUT/slug/f'{index:02d}.svg').write_text(svg,encoding='utf-8')
   with Image.open(dest) as check:check.load();assert check.size==(W,H)
   data=dest.read_bytes()
   caption,alt=TOPICS[slug][index-1]
   rows.append(dict(topic=slug,index=index,file=str(dest.relative_to(BASE)),caption=caption,alt=alt,
      width=W,height=H,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),
      source='original-procedural-SVG-illustration',author='MR LEE generated vector scene',
      disclosure='New sharp vector art, NOT documentary photo, NOT AI-generated photorealistic image'))
 assert len(rows)==10
 assert len({i['sha256'] for i in rows})==10
 mf=dict(version='27.0',batch=6,total=10,topics={'lich-su':5,'hien-dai':5},
   disclaimer='Ten original vector scenes (not photographs and not photorealistic AI); geometry is native to 1536x1024 exports. Symbolic stylizations are not visual evidence of exact historical buildings or technical procedures.',
   labels={t:[k[0] for k in v] for t,v in TOPICS.items()},images=rows)
 (BASE/'assets/culture/v27-manifest.json').write_text(json.dumps(mf,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print('PASS: 10 vector artworks',sum(r['bytes'] for r in rows)//1024,'KB')
 for r in rows:print(r['file'],r['bytes'])

if __name__=='__main__':main()
