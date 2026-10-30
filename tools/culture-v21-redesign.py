#!/usr/bin/env python3
"""V21 truly redesigned Culture pictures; no plain upscale of the V18/V20 source.

For the three reported culture topics: recompose from OTHER, existing, locally owned
AI illustrations (V15 and feature art), cropping away preexisting poster text.
For ten life skills: draw original, crisp, purpose-specific vector/editorial infographics
with Pillow (NOT medical procedures). All outputs are new and unique.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import math, hashlib, json, textwrap

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"images/culture-v21-new"
W,H=2040,1360
NAMES={
"le-hoi":"Lễ hội & ngày lễ","am-thuc":"Ẩm thực Hàn Quốc","doi-song":"Đời sống hằng ngày",
"so-cap-cuu":"Sơ cấp cứu","goi-cuu-ho":"Gọi cứu hộ","lac-duong":"Lạc đường",
"mat-vi":"Mất ví, giấy tờ","tau-dien-ngam":"Đi tàu điện ngầm","xe-buyt":"Đi xe buýt",
"benh-vien":"Khám bệnh & thuốc","hoa-hoan":"Thoát hiểm cháy","mat-dien-thoai":"Mất điện thoại",
"an-toan-giao-thong":"An toàn giao thông"}
COLORS={
"le-hoi":("#1e3c69","#bc446b"),"am-thuc":("#4c1e29","#c14a25"),"doi-song":("#13374c","#28798d"),
"so-cap-cuu":("#083c58","#1191a0"),"goi-cuu-ho":("#31325e","#ec6c41"),"lac-duong":("#1c4b67","#4aa3a6"),
"mat-vi":("#513c72","#ca6688"),"tau-dien-ngam":("#152f6e","#267cc8"),"xe-buyt":("#114e5a","#38b49d"),
"benh-vien":("#123d58","#64b6cd"),"hoa-hoan":("#5b2436","#e36a42"),
"mat-dien-thoai":("#282f69","#9965d9"),"an-toan-giao-thong":("#194e56","#5eaf87")}
SCENE_FILES={
"le-hoi":["images/culture-v15-ai/10-seollal.webp","images/culture-v15-ai/05-chuseok-table.webp","images/culture-v15-ai/06-hanbok-palace.webp","images/culture-v15-ai/10-seollal.webp","images/culture-v15-ai/05-chuseok-table.webp"],
"am-thuc":["images/culture-v15-ai/02-bibimbap.webp","images/culture-v15-ai/01-kimchi-banchan.webp","images/culture-v15-ai/03-street-food.webp","images/culture-v15-ai/04-korean-bbq.webp","images/culture-v15-ai/11-food-six-cards.webp"],
"doi-song":["assets/v306/images/feature-8-doi-song.webp","assets/mrlee-ai/v2/06_van_hoa/hero/hero-desktop.webp","assets/mrlee-ai/v2/03_giao_tiep/hero/hero-desktop.webp","assets/v306/images/culture.webp","assets/v306/images/feature-8-doi-song.webp"]
}
LIFE={
"so-cap-cuu":("CẤP CỨU","GỌI 119","firstaid"),
"goi-cuu-ho":("KHẨN CẤP","119 · 112","phone"),
"lac-duong":("TÌM ĐƯỜNG","ĐỊNH VỊ","pin"),
"mat-vi":("GIẤY TỜ","BÁO MẤT","wallet"),
"tau-dien-ngam":("TÀU ĐIỆN","XEM TUYẾN","train"),
"xe-buyt":("XE BUÝT","ĐÚNG TRẠM","bus"),
"benh-vien":("SỨC KHỎE","ĐẶT LỊCH","hospital"),
"hoa-hoan":("BÁO CHÁY","THOÁT HIỂM","exit"),
"mat-dien-thoai":("BẢO MẬT","KHÓA MÁY","mobile"),
"an-toan-giao-thong":("GIAO THÔNG","QUA ĐƯỜNG","crossing")
}
LABELS={
"le-hoi":["Truyền thống Seollal","Bữa ăn Chuseok","Không gian hanbok","Gia đình sum họp","Văn hóa ngày lễ"],
"am-thuc":["Cơm trộn bibimbap","Kimchi và banchan","Ẩm thực đường phố","Bữa ăn thịt nướng","Khám phá món Hàn"],
"doi-song":["Mua sắm ở Hàn Quốc","Dạo phố và giao tiếp","Sinh hoạt mỗi ngày","Khám phá khu dân cư","Môi trường sống"],
"so-cap-cuu":["Nhận biết khẩn cấp","Gọi 119","Tìm AED và người hỗ trợ","Báo vị trí an toàn","Học cùng chuyên gia"],
"goi-cuu-ho":["Lưu số 119","Lưu số 112","Mô tả vị trí","Trao đổi với tổng đài","Chờ cứu hộ an toàn"],
"lac-duong":["Dừng nơi an toàn","Đọc tên địa điểm","Dùng bản đồ","Hỏi quầy thông tin","Liên hệ người tin cậy"],
"mat-vi":["Nhận diện giấy tờ mất","Khóa thẻ ngân hàng","Trình báo phù hợp","Liên hệ cơ quan","Bảo vệ dữ liệu"],
"tau-dien-ngam":["Tìm ga đi","Chọn hướng tàu","Chuyển tuyến","Lối ra đúng","Nhân viên nhà ga"],
"xe-buyt":["Xem số tuyến","Chọn đúng chiều","Thanh toán vé","Ưu tiên an toàn","Kiểm tra chuyển tuyến"],
"benh-vien":["Chọn cơ sở y tế","Đăng ký lịch khám","Mô tả triệu chứng","Hỏi cách dùng thuốc","Gọi 119 khi cấp cứu"],
"hoa-hoan":["Nhận biết báo cháy","Tìm lối thoát hiểm","Không dùng thang máy","Gọi 119","Không quay lại"],
"mat-dien-thoai":["Tìm thiết bị","Khóa tài khoản","Khóa SIM","Cảnh giác OTP","Báo mất an toàn"],
"an-toan-giao-thong":["Vạch qua đường","Quan sát tín hiệu","Tập trung đi bộ","Đội mũ bảo hộ","Gọi cứu trợ khi cần"]}
def font(size,bold=False):
    paths=(
      ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf']
      if bold else
      ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf'])
    for p in paths:
      if Path(p).exists():return ImageFont.truetype(p,size)
    return ImageFont.load_default()
def color(hex,alpha=255):
    return tuple(bytes.fromhex(hex.lstrip('#')))+(alpha,)
def gradient(bg,one,two,variant):
    a=tuple(bytes.fromhex(one[1:])); b=tuple(bytes.fromhex(two[1:]))
    for y in range(H):
      t=.18+.72*(y/H)
      c=tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))
      ImageDraw.Draw(bg).line([(0,y),(W,y)],fill=c)
def icon(draw,k,x,y,r,fill,stroke,width=17):
    # Original symbolic drawings, not detailed medical instruction.
    if k in ('phone','mobile'):
      draw.rounded_rectangle((x-r*.55,y-r*.85,x+r*.55,y+r*.85),radius=28,fill=fill,outline=stroke,width=width)
      draw.rounded_rectangle((x-r*.41,y-r*.66,x+r*.41,y+r*.52),radius=10,fill="#cce4fa")
      draw.ellipse((x-10,y+r*.60,x+10,y+r*.70),fill=stroke)
    elif k=='wallet':
      draw.rounded_rectangle((x-r*.87,y-r*.48,x+r*.87,y+r*.58),radius=35,fill=fill,outline=stroke,width=width)
      draw.rounded_rectangle((x+r*.18,y-r*.08,x+r*.91,y+r*.32),radius=17,fill="#f9deb0",outline=stroke,width=10)
      draw.ellipse((x+r*.65-8,y+r*.1-8,x+r*.65+8,y+r*.1+8),fill=stroke)
    elif k=='pin':
      draw.ellipse((x-r*.58,y-r*.85,x+r*.58,y+r*.27),fill=fill,outline=stroke,width=width)
      draw.polygon([(x-r*.45,y+r*.05),(x+r*.45,y+r*.05),(x,y+r*.83)],fill=fill)
      draw.ellipse((x-r*.23,y-r*.52,x+r*.23,y-r*.04),fill="#f2fcff")
    elif k in ('train','bus'):
      draw.rounded_rectangle((x-r*.91,y-r*.56,x+r*.91,y+r*.47),radius=50,fill=fill,outline=stroke,width=width)
      draw.rounded_rectangle((x-r*.69,y-r*.42,x-r*.07,y+r*.1),radius=12,fill="#a4dcf5")
      draw.rounded_rectangle((x+r*.06,y-r*.42,x+r*.68,y+r*.1),radius=12,fill="#a4dcf5")
      for dx in [-r*.66,r*.66]:
        draw.ellipse((x+dx-23,y+r*.3-23,x+dx+23,y+r*.3+23),fill="#102f4a")
      if k=='train':
        draw.line([(x-r*.45,y+r*.69),(x+r*.45,y+r*.69)],fill=stroke,width=12)
    elif k in ('firstaid','hospital'):
      draw.rounded_rectangle((x-r*.75,y-r*.65,x+r*.75,y+r*.65),radius=55,fill=fill,outline=stroke,width=width)
      draw.rectangle((x-r*.13,y-r*.42,x+r*.13,y+r*.42),fill="#fff")
      draw.rectangle((x-r*.42,y-r*.13,x+r*.42,y+r*.13),fill="#fff")
    elif k=='exit':
      draw.rounded_rectangle((x-r*.82,y-r*.7,x+r*.82,y+r*.7),radius=26,outline=stroke,width=20,fill=fill)
      draw.polygon([(x-r*.16,y-r*.16),(x+r*.28,y-r*.16),(x+r*.28,y-r*.4),(x+r*.68,y),(x+r*.28,y+r*.4),(x+r*.28,y+r*.16),(x-r*.16,y+r*.16)],fill="#f9f6e4")
    elif k=='crossing':
      for d in range(-2,3):draw.polygon([(x+d*64-31,y+r*.4),(x+d*64+12,y+r*.4),(x+d*64+40,y+r*.8),(x+d*64-5,y+r*.8)],fill="#eefbff")
      draw.ellipse((x-27,y-r*.72,x+27,y-r*.44),fill="#f7d9b3")
      draw.line([(x,y-r*.4),(x,y+r*.18)],fill=stroke,width=24)
      draw.line([(x,y+r*.14),(x-r*.4,y+r*.43)],fill=stroke,width=20)
      draw.line([(x,y+r*.14),(x+r*.35,y+r*.35)],fill=stroke,width=20)
    else:draw.ellipse((x-r,y-r,x+r,y+r),fill=fill,outline=stroke,width=width)
def draw_scene(slug,i,caption):
    bg=Image.new('RGB',(W,H));one,two=COLORS[slug];gradient(bg,one,two,i)
    d=ImageDraw.Draw(bg,'RGBA')
    for j in range(14):
      px=(j*407+i*137)%W;py=(j*177+i*79)%H
      rad=25+((j*17+i*11)%120)
      d.ellipse((px-rad,py-rad,px+rad,py+rad),outline=(255,255,255,22),width=5)
    # Massive, decorative numeral: meaningful visual not invented procedural advice.
    num=f"{i:02d}"
    d.rounded_rectangle((83,75,295,173),radius=44,fill=(255,255,255,35),outline=(255,255,255,90),width=3)
    d.text((110,95),num,font=font(63,True),fill="#ffffff")
    d.text((108,246),LIFE[slug][0],font=font(83,True),fill="#ffffff",stroke_width=1)
    d.text((109,383),LIFE[slug][1],font=font(65,True),fill="#bfeeff")
    # right-side crisp, art-directed pictogram
    x,y=1510,615
    for radius in [430,360,285]:
       d.ellipse((x-radius,y-radius,x+radius,y+radius),fill=(255,255,255,25),outline=(255,255,255,45),width=7)
    icon(d,LIFE[slug][2],x,y,250,"#256989","#fefcff",20)
    d.line((90,1030,1920,1030),fill=(255,255,255,115),width=4)
    # very legible caption, with left-subject linkage
    maxlen=35
    a=caption if len(caption)<=maxlen else caption[:maxlen].rsplit(' ',1)[0]
    d.text((115,1080),a,font=font(64,True),fill="#ffffff")
    d.text((115,1190),"MINH HỌA CHỦ ĐỀ · KHÔNG PHẢI ẢNH THỰC TẾ",font=font(29),fill="#d5ecff")
    if slug in ('so-cap-cuu','hoa-hoan','benh-vien'):
      d.text((1040,1270),"THEO HƯỚNG DẪN CƠ QUAN CHỨC NĂNG",font=font(25,True),fill="#fff1d7")
    return bg
def draw_photo(slug,i,caption):
    source=ROOT/SCENE_FILES[slug][i-1]
    if not source.is_file():raise FileNotFoundError(str(source))
    with Image.open(source) as s:
      s=ImageOps.exif_transpose(s).convert('RGB')
      if s.height>s.width*1.10:  # v15 portrait posters have typed labels BELOW the original artwork
        s=s.crop((0,0,s.width,int(s.height*.55)))
      bg=ImageOps.fit(s,(W,H),method=Image.Resampling.LANCZOS,centering=(.5,.27 if i%2 else .50))
    # Add crisp editorial frame, not merely a pixel upscaled rerun.
    overlay=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(overlay,'RGBA')
    base=COLORS[slug][0]
    for k in range(950):
      alpha=int(210*(1-k/950)**1.6)
      d.line((k,0,k,H),fill=color(base,alpha),width=1)
    d.rounded_rectangle((85,85,220,175),radius=40,fill=(255,255,255,235))
    d.text((117,109),f"{i:02d}",font=font(48,True),fill=base)
    d.rounded_rectangle((93,986,1225,1283),radius=48,fill=color(base,200))
    d.text((127,1023),NAMES[slug],font=font(64,True),fill="#ffffff")
    for n,line in enumerate(textwrap.wrap(caption,width=35)[:2]):
      d.text((129,1131+n*56),line,font=font(38,False),fill="#e9faff")
    bg=Image.alpha_composite(bg.convert('RGBA'),overlay).convert('RGB')
    return bg
def main():
    rows=[];hashes=set()
    for slug in NAMES:
      for index in range(1,6):
        caption=LABELS[slug][index-1]
        pic=draw_photo(slug,index,caption) if slug in SCENE_FILES else draw_scene(slug,index,caption)
        dest=OUT/slug/f"{index:02d}.webp";dest.parent.mkdir(parents=True,exist_ok=True)
        pic.save(dest,'WEBP',quality=90,method=5)
        with Image.open(dest) as check:
          check.load()
          if check.size!=(W,H):raise ValueError("Image export dimension wrong "+str(dest))
        raw=dest.read_bytes();h=hashlib.sha256(raw).hexdigest()
        if h in hashes:raise ValueError("Duplicated file "+str(dest))
        hashes.add(h)
        rows.append({"topic":slug,"index":index,"source":"editorial-new-v21" if slug in SCENE_FILES else "original-vector-infographic-v21",
                     "file":str(dest.relative_to(ROOT)),"sha256":h,"bytes":len(raw),"caption":caption})
    assert len(rows)==65
    mf=ROOT/"assets/culture/v21-manifest.json";mf.parent.mkdir(parents=True,exist_ok=True)
    mf.write_text(json.dumps({"version":"21.0","topics":13,"images":65,"width":W,"height":H,
      "note":"Entirely different layouts from V20. Life skills are symbolic illustrations, not emergency procedures.",
      "entries":rows},ensure_ascii=False,indent=2)+"\n",encoding='utf-8')
    print(f"V21 PASS: 13 replaced topics, 65 unique new artwork compositions, {W}×{H}")
if __name__=="__main__":main()
