/* Goose Mystery map catalogue v3 — identical client and server data.
 * World coordinates are server-owned; no player positions encoded in map assets.
 * Walls are opaque and solid; zones describe environment and do not block movement. */
export const WORLD=Object.freeze({width:2400,height:1500,radius:20,speed:190,vision:228,bodyVision:92,killRange:62,reportRange:74});
const orbital={
 id:"orbital",name:"Trạm Quỹ Đạo",subtitle:"Trạm nghiên cứu ngoài không gian",
 colors:{floor:"#102943",zone:"#1c4861",border:"#63cde2",accent:"#6ff8df"},
 zones:[
  [85,100,625,395,"PHÒNG LIÊN LẠC"],[875,95,625,380,"TRẠM CHỈ HUY"],
  [1685,95,625,395,"PHÒNG THÍ NGHIỆM"],[85,560,620,420,"KHO DỮ LIỆU"],
  [845,565,710,405,"SẢNH TRUNG TÂM"],[1680,560,630,425,"PHÒNG NĂNG LƯỢNG"],
  [90,1060,625,345,"KHO HẬU CẦN"],[865,1055,650,345,"PHÒNG O₂"],
  [1690,1060,615,345,"XƯỞNG BẢO TRÌ"]],
 walls:[
  {x:720,y:165,w:32,h:240},{x:720,y:920,w:32,h:300},
  {x:1640,y:165,w:32,h:240},{x:1640,y:940,w:32,h:300},
  {x:320,y:525,w:275,h:32},{x:1800,y:525,w:270,h:32},
  {x:325,y:1000,w:280,h:32},{x:1770,y:1000,w:290,h:32},
  {x:1000,y:470,w:260,h:30},{x:1050,y:990,w:260,h:30},
  {x:400,y:285,w:140,h:28},{x:1865,y:300,w:140,h:28},
  {x:410,y:1220,w:145,h:28},{x:1850,y:1215,w:150,h:28}
 ],
 stations:[
  {x:270,y:240,name:"Khởi động liên lạc"},
  {x:1100,y:225,name:"Kiểm tra radar"},
  {x:1980,y:245,name:"Phân loại hồ sơ"},
  {x:280,y:790,name:"Kết nối điện"},
  {x:1130,y:1185,name:"Hiệu chỉnh thiết bị"},
  {x:2000,y:835,name:"Bảo trì hệ thống"}
 ]};
const arctic={
 id:"arctic",name:"Căn Cứ Băng Giá",subtitle:"Trạm quan sát giữa vùng tuyết lạnh",
 colors:{floor:"#15374e",zone:"#25546a",border:"#a4e2f6",accent:"#b6f6ff"},
 zones:[
  [90,100,670,425,"NHÀ KÍNH BĂNG"],[890,95,610,395,"TRẠM QUAN SÁT"],
  [1640,100,655,415,"KHO LẠNH"],[95,555,605,390,"PHÒNG Y TẾ"],
  [850,560,700,440,"KHU TRUNG TÂM"],[1700,560,590,385,"PHÒNG MÁY"],
  [90,1030,620,385,"KHU BẢO DƯỠNG"],[865,1030,645,385,"TRẠM NĂNG LƯỢNG"],
  [1640,1040,650,370,"KHO MÁY BĂNG"]],
 walls:[
  {x:755,y:145,w:34,h:225},{x:755,y:970,w:34,h:260},
  {x:1610,y:140,w:34,h:245},{x:1610,y:960,w:34,h:260},
  {x:280,y:520,w:240,h:35},{x:1830,y:520,w:275,h:35},
  {x:255,y:995,w:285,h:32},{x:1830,y:995,w:300,h:32},
  {x:980,y:465,w:170,h:27},{x:1270,y:465,w:140,h:27},
  {x:1020,y:1010,w:340,h:27},
  {x:385,y:265,w:120,h:32},{x:1890,y:275,w:120,h:32},
  {x:375,y:1235,w:140,h:30},{x:1835,y:1210,w:135,h:30}
 ],
 stations:[
  {x:260,y:250,name:"Lấy mẫu băng"},
  {x:1160,y:240,name:"Quan trắc khí hậu"},
  {x:1960,y:265,name:"Kiểm tra kho lạnh"},
  {x:270,y:760,name:"Bảo trì máy sưởi"},
  {x:1100,y:1190,name:"Nạp nguồn dự phòng"},
  {x:1950,y:790,name:"Hiệu chỉnh máy phát"}
 ]};
const garden={
 id:"garden",name:"Vườn Sinh Học",subtitle:"Khu nghiên cứu sinh thái trên không",
 colors:{floor:"#163f45",zone:"#235b5b",border:"#64d7b6",accent:"#a7f39c"},
 zones:[
  [85,90,625,400,"TRẠM RADAR"],[850,90,700,400,"NHÀ KÍNH"],
  [1695,95,620,400,"XƯỞNG BẢO TRÌ"],[90,555,625,400,"PHÒNG ĐIỀU KHIỂN"],
  [850,545,710,455,"VƯỜN SINH HỌC"],[1690,550,620,405,"KHU OXY"],
  [100,1045,615,350,"BỂ THỦY SINH"],[860,1045,650,350,"VƯỜN ƯƠM"],
  [1690,1040,620,355,"PHÒNG NĂNG LƯỢNG"]],
 walls:[
  {x:720,y:165,w:32,h:225},{x:720,y:975,w:32,h:240},
  {x:1650,y:165,w:32,h:230},{x:1650,y:965,w:32,h:240},
  {x:320,y:505,w:255,h:32},{x:1850,y:510,w:255,h:32},
  {x:310,y:1005,w:280,h:32},{x:1850,y:1005,w:280,h:32},
  {x:1000,y:485,w:300,h:28},{x:1070,y:1015,w:230,h:28},
  {x:330,y:290,w:150,h:28},{x:1895,y:300,w:145,h:28},
  {x:350,y:1220,w:125,h:32},{x:1900,y:1215,w:120,h:32}
 ],
 stations:[
  {x:280,y:230,name:"Hiệu chỉnh radar"},
  {x:1120,y:260,name:"Thu hoạch mẫu cây"},
  {x:1960,y:240,name:"Bảo trì cánh tay robot"},
  {x:265,y:770,name:"Kết nối điều khiển"},
  {x:1150,y:1210,name:"Đo chất lượng nước"},
  {x:1950,y:795,name:"Sửa bộ lọc oxy"}
 ]};
export const MAP_ORDER=Object.freeze(["orbital","arctic","garden"]);
export const MAPS=Object.freeze({orbital,arctic,garden});
export function getMap(id){return MAPS[id]||MAPS.orbital}
export function spawnFor(seat){
 const positions=[
 [1170,735],[1230,735],[1130,770],[1270,770],
 [1110,825],[1290,825],[1170,870],[1230,870],
 [1050,735],[1350,735],[1050,865],[1350,865],
 [1150,670],[1250,670],[1150,925],[1250,925]
 ];
 const [x,y]=positions[seat%positions.length];return {x,y};
}
/* Segment-box intersection, conservative to walls for both reporting and sight. */
export function wallBlocksVision(a,b,walls){
 for(const wall of walls){
  const left=wall.x,right=wall.x+wall.w,top=wall.y,bottom=wall.y+wall.h;
  let lo=0,hi=1;
  const dx=b.x-a.x,dy=b.y-a.y;
  for(const [p,q] of [[-dx,a.x-left],[dx,right-a.x],[-dy,a.y-top],[dy,bottom-a.y]]){
   if(Math.abs(p)<1e-9){if(q<0){lo=2;break}continue}
   const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);
  }
  if(lo<=hi&&lo<=1&&hi>=0)return true;
 }
 return false;
}
export function visibleBetween(a,b,mapId,range=WORLD.vision){
 return Math.hypot(a.x-b.x,a.y-b.y)<=range&&!wallBlocksVision(a,b,getMap(mapId).walls);
}
