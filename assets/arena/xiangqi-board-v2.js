/* Xiangqi Board V2: intersection-correct 9x10 geometry, river, palaces and confirmed-move motion.
 * Visual-only. Never generates moves, changes positions, or reveals hidden Cờ Úp identities. */
const NS="http://www.w3.org/2000/svg";
const reduced=()=>document.documentElement.dataset.arenaVisuals==="off"||
 window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const point=(index,flipped=false)=>{
 const row=Math.floor(index/9),col=index%9;
 return {x:50+100*(flipped?8-col:col),y:50+100*(flipped?9-row:row)};
};
const path=(a,b)=>"M"+a.x+" "+a.y+" L"+b.x+" "+b.y;
export function coordinateLabel(index,flipped=false){
 if(!Number.isInteger(index)||index<0||index>89)return "—";
 const r=flipped?9-Math.floor(index/9):Math.floor(index/9);
 const c=flipped?8-index%9:index%9;
 return "H"+(r+1)+"·C"+(c+1);
}
function boardArtwork(){
 const segments=[];
 const line=(x1,y1,x2,y2)=>segments.push('<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'"/>');
 for(let r=0;r<10;r++)line(50,50+r*100,850,50+r*100);
 for(let c=0;c<9;c++){
  const x=50+c*100;
  if(c===0||c===8)line(x,50,x,950);
  else{line(x,50,x,450);line(x,550,x,950);}
 }
 // Palace diagonals: columns 4–6, rows 1–3 and 8–10 (at the intersections).
 for(const y of [50,750]){
  line(350,y,550,y+200);line(550,y,350,y+200);
 }
 const marks=[];
 const mark=(x,y)=>{
  // Small corner registration marks, without obscuring the actual intersection.
  for(const dx of [-1,1])for(const dy of [-1,1]){
   if(x+dx*16<35||x+dx*16>865)continue;
   marks.push('<path d="M'+(x+dx*9)+' '+(y+dy*20)+' v'+(-dy*11)+' h'+(dx*9)+'"/>');
  }
 };
 for(const y of [250,750])for(const x of [150,750])mark(x,y);
 for(const y of [350,650])for(const x of [50,250,450,650,850])mark(x,y);
 return '<rect class="xq-art-border" x="28" y="28" width="844" height="944" rx="3"/>'+
  '<g class="xq-art-lines">'+segments.join("")+'</g>'+
  '<g class="xq-art-marks">'+marks.join("")+'</g>'+
  '<g class="xq-art-river"><text x="280" y="516" text-anchor="middle">楚 河</text>'+
  '<text x="620" y="516" text-anchor="middle">漢 界</text></g>';
}
const ART=boardArtwork();
export function decorateXiangqiBoard(board,{last=null,flipped=false}={}){
 if(!board)return;
 board.classList.add("xq-board-accurate");
 board.querySelector(":scope > .xq-artwork")?.remove();
 const svg=document.createElementNS(NS,"svg");
 svg.setAttribute("class","xq-artwork");
 svg.setAttribute("viewBox","0 0 900 1000");
 svg.setAttribute("preserveAspectRatio","none");
 svg.setAttribute("aria-hidden","true");
 svg.innerHTML='<defs><marker id="xq-move-arrow-'+(board.id||"board").replace(/[^A-Za-z0-9_-]/g,"")+'" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L6 3 L0 6Z" fill="#086e76"/></marker></defs>'+ART;
 if(Array.isArray(last)&&last.length===2&&last.every(n=>Number.isInteger(n)&&n>=0&&n<90)){
  const [from,to]=last,a=point(from,flipped),b=point(to,flipped),dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;
  // Start and end the pointer a little outside the tokens for legibility.
  const shorten=length>155?33:15;
  const p1={x:a.x+dx/length*shorten,y:a.y+dy/length*shorten};
  const p2={x:b.x-dx/length*shorten,y:b.y-dy/length*shorten};
  const marker="url(#xq-move-arrow-"+(board.id||"board").replace(/[^A-Za-z0-9_-]/g,"")+")";
  const route=document.createElementNS(NS,"path");
  route.setAttribute("d",path(p1,p2));route.setAttribute("class","xq-art-last-path");
  route.setAttribute("marker-end",marker);svg.append(route);
  const first=board.querySelector('[data-index="'+from+'"]'),final=board.querySelector('[data-index="'+to+'"]');
  first?.classList.add("xq-last-from");final?.classList.add("xq-last-to");
 }
 board.prepend(svg);
}
export function animateXiangqiMove(board,{from,to,pieceSelector=".xq-piece",duration=480}={}){
 if(!board||!Number.isInteger(from)||!Number.isInteger(to)||reduced()||document.hidden)return;
 const a=board.querySelector('[data-index="'+from+'"]'),b=board.querySelector('[data-index="'+to+'"]');
 const piece=b?.querySelector(pieceSelector);
 if(!a||!b||!piece||!piece.animate)return;
 const outer=board.getBoundingClientRect(),start=a.getBoundingClientRect(),end=b.getBoundingClientRect(),token=piece.getBoundingClientRect();
 if(!token.width||!token.height||!outer.width)return;
 const tokenLeft=start.left+start.width/2-outer.left-board.clientLeft-token.width/2;
 const tokenTop=start.top+start.height/2-outer.top-board.clientTop-token.height/2;
 const dx=(end.left+end.width/2)-(start.left+start.width/2);
 const dy=(end.top+end.height/2)-(start.top+start.height/2);
 const ghost=piece.cloneNode(true);
 ghost.classList.add("xq-moving-token");
 ghost.setAttribute("aria-hidden","true");
 Object.assign(ghost.style,{position:"absolute",left:tokenLeft+"px",top:tokenTop+"px",
  width:token.width+"px",height:token.height+"px",maxWidth:"none",maxHeight:"none",
  margin:"0",zIndex:"25",pointerEvents:"none"});
 // The final position already came from the authoritative rules engine / server.
 // Hide it until the traveling token lands, without making another game move.
 piece.style.visibility="hidden";
 board.append(ghost);
 const finish=()=>{if(piece.isConnected)piece.style.visibility="";ghost.remove();};
 let animation;
 try{
  animation=ghost.animate([
   {transform:"translate3d(0,0,0) scale(1)",filter:"brightness(1)",offset:0},
   {transform:"translate3d("+(dx*.52)+"px,"+(dy*.52-11)+"px,0) scale(1.1)",filter:"brightness(1.14)",offset:.55},
   {transform:"translate3d("+dx+"px,"+dy+"px,0) scale(1)",filter:"brightness(1)",offset:1}
  ],{duration,easing:"cubic-bezier(.24,.7,.2,1)",fill:"forwards"});
  animation.finished.catch(()=>{}).then(finish);
 }catch{finish();return;}
 setTimeout(finish,duration+130);
}
