/* MR LEE Xiangqi / Cờ Úp: pure 90-cell rules shared by client and server.
 * Unrevealed identities belong on the server; clients receive masked pieces.
 */
export const GLYPH={K:"帥",A:"仕",E:"相",N:"傌",R:"俥",C:"炮",P:"兵",k:"將",a:"士",e:"象",n:"馬",r:"車",c:"砲",p:"卒"};
const VALUES={k:9999,r:900,c:470,n:430,e:220,a:220,p:100};
const at=(r,c)=>r*9+c,inside=(r,c)=>r>=0&&r<10&&c>=0&&c<9;
export const camp=c=>!c?0:(c.p===c.p.toUpperCase()?1:-1);
const palace=(r,c,side)=>c>=3&&c<=5&&(side===1?r>=7&&r<=9:r<=2&&r>=0);
const secureRandom=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(secureRandom()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function newXiangqi(variant="xiangqi"){
 const b=Array(90).fill(null),back=["r","n","e","a","k","a","e","n","r"];
 for(let c=0;c<9;c++){b[at(0,c)]={p:back[c]};b[at(9,c)]={p:back[c].toUpperCase()};}
 for(const c of [1,7]){b[at(2,c)]={p:"c"};b[at(7,c)]={p:"C"};}
 for(const c of [0,2,4,6,8]){b[at(3,c)]={p:"p"};b[at(6,c)]={p:"P"};}
 if(variant==="up"){
  for(const side of [1,-1]){
   const cells=b.filter(x=>camp(x)===side&&x.p.toLowerCase()!=="k");
   const originals=cells.map(x=>x.p),hidden=shuffle([...originals]);
   cells.forEach((x,i)=>{x.slot=originals[i];x.p=hidden[i];x.covered=true;});
  }
 }
 return {b,turn:1,variant,winner:null,moves:[],last:null};
}
function pseudo(g,origin){
 const b=g.b,c=b[origin];if(!c)return [];
 const side=camp(c),type=(c.covered?c.slot:c.p).toLowerCase();
 const row=Math.floor(origin/9),col=origin%9,out=[];
 const push=(r,k)=>{if(inside(r,k)&&camp(b[at(r,k)])!==side)out.push(at(r,k));};
 if(type==="k"){
  for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]])
   if(palace(row+dr,col+dc,side))push(row+dr,col+dc);
  for(const d of [-1,1]){
   for(let r=row+d;r>=0&&r<10;r+=d){
    const other=b[at(r,col)];
    if(!other)continue;
    if(other.p.toLowerCase()==="k"&&camp(other)!==side)push(r,col);
    break;
   }
  }
 }else if(type==="a"){
  for(const dr of [-1,1])for(const dc of [-1,1])
   if(palace(row+dr,col+dc,side))push(row+dr,col+dc);
 }else if(type==="e"){
  for(const dr of [-2,2])for(const dc of [-2,2]){
   const r=row+dr,k=col+dc;
   if(!inside(r,k)||b[at(row+dr/2,col+dc/2)])continue;
   if(side===1&&r<5||side===-1&&r>4)continue;
   push(r,k);
  }
 }else if(type==="n"){
  for(const [dr,dc] of [[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[1,-2],[-1,2],[1,2]]){
   const lr=row+(Math.abs(dr)===2?Math.sign(dr):0),lc=col+(Math.abs(dc)===2?Math.sign(dc):0);
   if(!b[at(lr,lc)])push(row+dr,col+dc);
  }
 }else if(type==="r"||type==="c"){
  for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
   let crossed=false;
   for(let r=row+dr,k=col+dc;inside(r,k);r+=dr,k+=dc){
    const other=b[at(r,k)];
    if(type==="r"){
     if(!other)out.push(at(r,k));
     else{if(camp(other)!==side)out.push(at(r,k));break;}
    }else if(!crossed){
     if(!other)out.push(at(r,k));else crossed=true;
    }else if(other){
     if(camp(other)!==side)out.push(at(r,k));
     break;
    }
   }
  }
 }else if(type==="p"){
  push(row-(side===1?1:-1),col);
  if(side===1?row<=4:row>=5){push(row,col-1);push(row,col+1);}
 }
 return out;
}
function clonedMove(g,from,to){
 const b=g.b.slice();b[to]={...b[from],covered:false};b[from]=null;
 return {...g,b};
}
export function isXiangqiCheck(g,side){
 const king=g.b.findIndex(c=>c&&c.p.toLowerCase()==="k"&&camp(c)===side);
 if(king<0)return true;
 for(let i=0;i<90;i++)if(camp(g.b[i])===-side&&pseudo(g,i).includes(king))return true;
 return false;
}
export function xiangqiLegal(g,side=g.turn){
 if(g.winner!==null)return [];
 const result=[];
 for(let from=0;from<90;from++){
  if(camp(g.b[from])!==side)continue;
  for(const to of pseudo(g,from))
   if(!isXiangqiCheck(clonedMove(g,from,to),side))result.push([from,to]);
 }
 return result;
}
export function xiangqiMove(g,from,to){
 if(!xiangqiLegal(g).some(m=>m[0]===from&&m[1]===to))throw Error("Nước đi không hợp lệ hoặc khiến tướng bị chiếu.");
 const moved=g.b[from],captured=g.b[to];
 g.b[to]={...moved,covered:false};g.b[from]=null;
 g.last=[from,to];g.moves.push({side:g.turn,from,to,piece:moved.covered?"Úp → "+GLYPH[moved.p]:GLYPH[moved.p],capture:!!captured});
 const last=g.turn;g.turn=-last;
 if(captured?.p.toLowerCase()==="k"||!xiangqiLegal(g).length)g.winner=last;
 return g;
}
