/* MR LEE Chess Arena. Independent full legal-move engine. White vs local black AI. */
export const START_FEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const GLYPHS={K:"♔",Q:"♕",R:"♖",B:"♗",N:"♘",P:"♙",k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟︎",".":""};
const D={n:[-33,-31,-18,-14,14,18,31,33],b:[-17,-15,15,17],r:[-16,-1,1,16],q:[-17,-16,-15,-1,1,15,16,17],k:[-17,-16,-15,-1,1,15,16,17]};
const on=i=>i>=0&&i<128&&!(i&0x88);
export const side=p=>p==="."?0:p===p.toUpperCase()?1:-1;
export const square=i=>"abcdefgh"[i&7]+(8-(i>>4));
export const index=s=>(8-Number(s[1]))*16+"abcdefgh".indexOf(s[0]);
export const uci=m=>square(m[0])+square(m[1])+(m[2]||"");
export function parseFen(fen){
 const f=fen.trim().split(/\s+/),rows=f[0]?.split("/"),b=Array(128).fill(".");
 if(rows?.length!==8||!["w","b"].includes(f[1])||!/^(?:-|K?Q?k?q?)$/.test(f[2]||"")||
 !/^(?:-|[a-h][36])$/.test(f[3]||"")||!Number.isInteger(Number(f[4]))||Number(f[4])<0||
 !Number.isInteger(Number(f[5]))||Number(f[5])<1)throw Error("FEN không hợp lệ.");
 rows.forEach((row,r)=>{let c=0;for(const p of row){
  if(/[1-8]/.test(p))c+=Number(p);
  else {if(!/[prnbqkPRNBQK]/.test(p)||c>=8)throw Error("FEN quân sai.");b[r*16+c++]=p;}
 }if(c!==8)throw Error("FEN hàng không đủ tám ô.");});
 if(b.filter(p=>p==="K").length!==1||b.filter(p=>p==="k").length!==1)throw Error("Thiếu vua.");
 return {b,t:f[1]==="w"?1:-1,c:(f[2].includes("K")?1:0)|(f[2].includes("Q")?2:0)|(f[2].includes("k")?4:0)|(f[2].includes("q")?8:0),
 ep:f[3]==="-"?-1:index(f[3]),half:Number(f[4]),full:Number(f[5])};
}
export const start=()=>parseFen(START_FEN);
export function attacked(s,target,by){
 for(let f=0;f<128;f++){
  if(!on(f)||side(s.b[f])!==by)continue;
  const p=s.b[f].toLowerCase();
  if(p==="p"){if(target===f-16*by-1||target===f-16*by+1)return true;continue;}
  for(const d of D[p])for(let t=f+d;on(t);t+=d){
   if(t===target)return true;
   if(s.b[t]!=="."||p==="n"||p==="k")break;
  }
 }
 return false;
}
export function checked(s,color=s.t){return attacked(s,s.b.indexOf(color===1?"K":"k"),-color);}
export function apply(s,m){
 const [f,t,promo="",flag=""]=m,b=s.b.slice(),piece=b[f],captured=b[t];
 let c=s.c;b[f]=".";b[t]=promo?(s.t===1?promo.toUpperCase():promo):piece;
 if(flag==="ep")b[t+16*s.t]=".";
 if(flag==="castle"){
  const rf=t>f?f+3:f-4,rt=t>f?f+1:f-1;
  b[rt]=b[rf];b[rf]=".";
 }
 if(piece==="K")c&=~3;if(piece==="k")c&=~12;
 const bits={119:1,112:2,7:4,0:8};
 if(piece.toLowerCase()==="r")c&=~(bits[f]||0);
 if(captured.toLowerCase()==="r")c&=~(bits[t]||0);
 return {b,t:-s.t,c,ep:piece.toLowerCase()==="p"&&Math.abs(t-f)===32?(t+f)/2:-1,
 half:piece.toLowerCase()==="p"||captured!=="."||flag==="ep"?0:s.half+1,
 full:s.full+(s.t===-1?1:0)};
}
export function pseudo(s){
 const out=[];
 for(let f=0;f<128;f++){
  if(!on(f)||side(s.b[f])!==s.t)continue;
  const p=s.b[f].toLowerCase();
  const add=(t,flag="")=>{
   if(s.b[t].toLowerCase()==="k")return;
   if(p==="p"&&((t>>4)===0||(t>>4)===7))
    for(const q of ["q","r","b","n"])out.push([f,t,q,flag]);
   else out.push([f,t,"",flag]);
  };
  if(p==="p"){
   const t=f-16*s.t;
   if(on(t)&&s.b[t]==="."){
    add(t);
    const u=t-16*s.t;
    if((f>>4)===(s.t===1?6:1)&&s.b[u]===".")add(u);
   }
   for(const delta of [-1,1]){
    const u=t+delta;if(!on(u))continue;
    if(side(s.b[u])===-s.t)add(u);
    else if(u===s.ep&&s.b[u]==="."&&s.b[u+16*s.t]===(s.t===1?"p":"P"))add(u,"ep");
   }
  }else{
   for(const d of D[p])for(let t=f+d;on(t);t+=d){
    if(side(s.b[t])===s.t)break;
    add(t);if(s.b[t]!=="."||p==="n"||p==="k")break;
   }
   const home=s.t===1?116:4,rook=s.t===1?"R":"r",bits=s.t===1?[1,2]:[4,8];
   if(p==="k"&&f===home&&!checked(s)){
    if((s.c&bits[0])&&s.b[f+3]===rook&&s.b[f+1]==="."&&s.b[f+2]==="."&&
     !attacked(s,f+1,-s.t)&&!attacked(s,f+2,-s.t))add(f+2,"castle");
    if((s.c&bits[1])&&s.b[f-4]===rook&&s.b[f-1]==="."&&s.b[f-2]==="."&&s.b[f-3]==="."&&
     !attacked(s,f-1,-s.t)&&!attacked(s,f-2,-s.t))add(f-2,"castle");
   }
  }
 }
 return out;
}
export const legal=s=>pseudo(s).filter(m=>!checked(apply(s,m),s.t));
export function san(s,m){
 const [f,t,promo,flag]=m,p=s.b[f].toUpperCase(),capture=s.b[t]!=="."||flag==="ep";
 let value="";
 if(flag==="castle")value=t>f?"O-O":"O-O-O";
 else{
  if(p!=="P"){
   value=p;
   const other=legal(s).filter(x=>x[0]!==f&&x[1]===t&&s.b[x[0]]===s.b[f]);
   if(other.length)value+=!other.some(x=>(x[0]&7)===(f&7))?square(f)[0]:
    !other.some(x=>(x[0]>>4)===(f>>4))?square(f)[1]:square(f);
  }else if(capture)value=square(f)[0];
  value+=(capture?"x":"")+square(t)+(promo?"="+promo.toUpperCase():"");
 }
 const n=apply(s,m);
 return value+(checked(n)?legal(n).length?"+":"#":"");
}
export const positionKey=s=>s.b.join("")+":"+s.t+":"+s.c+":"+s.ep;
export function insufficient(s){
 const pieces=[];
 for(let i=0;i<128;i++)if(on(i)&&s.b[i]!=="."&&s.b[i].toLowerCase()!=="k")
 pieces.push([s.b[i].toLowerCase(),((i>>4)+(i&7))%2]);
 return !pieces.length||(pieces.length===1&&["b","n"].includes(pieces[0][0]))||
 (pieces.every(x=>x[0]==="b")&&new Set(pieces.map(x=>x[1])).size===1);
}
export function status(history){
 const s=history.at(-1),moves=legal(s),check=checked(s);
 if(!moves.length)return {done:true,winner:check?-s.t:0,reason:check?"Chiếu hết":"Hòa — hết nước đi"};
 if(insufficient(s))return {done:true,winner:0,reason:"Hòa — không đủ lực"};
 if(s.half>=150)return {done:true,winner:0,reason:"Hòa — quy tắc 75 nước"};
 if(history.filter(x=>positionKey(x)===positionKey(s)).length>=5)
  return {done:true,winner:0,reason:"Hòa — lặp thế 5 lần"};
 return {done:false,winner:null,reason:(s.t===1?"Lượt của bạn":"Lượt máy")+(check?" · đang bị chiếu":""),
 claim:s.half>=100||history.filter(x=>positionKey(x)===positionKey(s)).length>=3};
}
const V={p:100,n:320,b:340,r:510,q:920,k:0};
function score(s){
 let points=0;
 for(let i=0;i<128;i++){
  if(!on(i)||s.b[i]===".")continue;
  const color=side(s.b[i]),p=s.b[i].toLowerCase(),row=i>>4,col=i&7;
  const center=7-Math.abs(3.5-row)-Math.abs(3.5-col);
  points+=color*(V[p]+center*(p==="n"?6:2)+(p==="p"?(color===1?6-row:row-1)*5:0));
 }
 return points;
}
function search(s,depth,alpha,beta){
 const moves=legal(s);
 if(!moves.length)return checked(s)?(s.t===1?-200000:200000):0;
 if(depth<=0)return score(s);
 moves.sort((a,b)=>((s.b[b[1]]!=="."?V[s.b[b[1]].toLowerCase()]:0)+(b[2]?800:0))-
 ((s.b[a[1]]!=="."?V[s.b[a[1]].toLowerCase()]:0)+(a[2]?800:0)));
 if(s.t===1){
  let best=-Infinity;for(const m of moves){
   best=Math.max(best,search(apply(s,m),depth-1,alpha,beta));
   alpha=Math.max(alpha,best);if(alpha>=beta)break;
  }return best;
 }
 let best=Infinity;for(const m of moves){
  best=Math.min(best,search(apply(s,m),depth-1,alpha,beta));
  beta=Math.min(beta,best);if(alpha>=beta)break;
 }return best;
}
export function bestBotMove(s,difficulty="normal"){
 if(s.t!==-1)throw Error("Bot điều khiển quân đen.");
 const choices=legal(s);if(!choices.length)return null;
 if(difficulty==="easy")return choices[Math.floor(Math.random()*choices.length)];
 const depth=difficulty==="hard"?2:1;
 const ordered=choices.map(m=>({m,v:score(apply(s,m))})).sort((a,b)=>a.v-b.v);
 let best=Infinity,selected=[];
 for(const {m} of ordered){
  const value=search(apply(s,m),depth,-Infinity,Infinity);
  if(value<best-0.00001){best=value;selected=[m];}
  else if(value<=best+0.00001)selected.push(m);
 }
 return selected[Math.floor(Math.random()*selected.length)]||choices[0];
}
export const fromUci=(s,text)=>legal(s).find(m=>uci(m)===text)||null;
