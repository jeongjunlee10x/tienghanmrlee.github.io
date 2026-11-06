/* Cờ Tướng / Cờ Úp: legal 9×10 board, river, palace, check and face-to-face generals.
 * Cờ Úp: non-general identities shuffled within each camp; first covered move uses
 * the original square's movement rule, then reveals the assigned identity. */
const $=id=>document.getElementById(id);
const node=(tag,cls="",t)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(t!==undefined)x.textContent=String(t);return x;};
const btn=(label,cls,fn)=>{const x=node("button",cls,label);x.type="button";if(fn)x.addEventListener("click",fn);return x;};
const GLYPH={K:"帥",A:"仕",E:"相",N:"傌",R:"俥",C:"炮",P:"兵",k:"將",a:"士",e:"象",n:"馬",r:"車",c:"砲",p:"卒"};
const VALUES={k:9999,r:900,c:470,n:430,e:220,a:220,p:100};
const at=(r,c)=>r*9+c,inside=(r,c)=>r>=0&&r<10&&c>=0&&c<9;
export const camp=c=>!c?0:(c.p===c.p.toUpperCase()?1:-1);
const palace=(r,c,side)=>c>=3&&c<=5&&(side===1?r>=7&&r<=9:r<=2&&r>=0);
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
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
function pickBot(g){
 const legal=xiangqiLegal(g),me=g.turn;
 if(!legal.length)return null;
 let best=-Infinity,chosen=legal[0];
 for(const [from,to] of legal){
  const a=g.b[from],c=g.b[to],t=clonedMove(g,from,to);
  const capture=c?VALUES[c.p.toLowerCase()]||0:0;
  const self=VALUES[a.p.toLowerCase()]||0;
  let threatened=false;
  for(let i=0;i<90&&!threatened;i++)if(camp(t.b[i])===-me&&pseudo(t,i).includes(to))threatened=true;
  const score=capture*1.3-(threatened?self*.85:0)+
   (to%9>=3&&to%9<=5?7:0)+Math.random()*28+(isXiangqiCheck(t,-me)?40:0);
  if(score>best){best=score;chosen=[from,to];}
 }
 return chosen;
}
export function mountXiangqi({onStart,onFinish,onExit}){
 const root=$("arenaXiangqi"),board=$("xqBoard"),status=$("xqStatus");
 const requested=new URL(location.href).searchParams.get("variant");
 if(["xiangqi","up"].includes(requested))$("xqVariant").value=requested;
 let g=null,selected=-1,timer=null,epoch=0,finished=false;
 function stop(){epoch++;if(timer!==null)clearTimeout(timer);timer=null;}
 function exit(){stop();g=null;root.hidden=true;onExit();}
 function finish(){
  if(finished||!g||g.winner===null)return;
  finished=true;stop();
  onFinish(g.winner===1?"win":"loss",g.variant==="up"?"Cờ Úp":"Cờ Tướng",root);
 }
 function start(){
  if(!onStart())return;
  stop();finished=false;selected=-1;g=newXiangqi($("xqVariant").value);
  root.querySelector(".arena-game-result")?.remove();
  root.hidden=false;render();root.scrollIntoView({behavior:"smooth",block:"start"});
 }
 function select(i){
  if(!g||g.turn!==1||finished)return;
  if(selected>=0&&xiangqiLegal(g,1).some(m=>m[0]===selected&&m[1]===i)){
   try{xiangqiMove(g,selected,i);selected=-1;render();if(g.winner!==null)finish();else schedule();}
   catch(err){status.textContent=err.message;}
  }else{selected=camp(g.b[i])===1?(selected===i?-1:i):-1;render();}
 }
 function schedule(){
  if(!g||g.turn!==-1||finished||timer!==null)return;
  const stamp=epoch;
  timer=setTimeout(()=>{
   timer=null;if(stamp!==epoch||!g||root.hidden||finished)return;
   const move=pickBot(g);
   if(!move){g.winner=1;}else xiangqiMove(g,...move);
   render();if(g.winner!==null)finish();
  },480);
 }
 function render(){
  if(!g||root.hidden)return;
  const legal=g.turn===1?xiangqiLegal(g,1):[];
  const target=new Set(legal.filter(m=>m[0]===selected).map(m=>m[1]));
  board.replaceChildren();
  for(let i=0;i<90;i++){
   const c=g.b[i],r=Math.floor(i/9),col=i%9;
   const tile=btn("","xq-square"+(selected===i?" selected":"")+(target.has(i)?" target":"")+
    ((r===4||r===5)?" river":"")+(c?" occupied":""),()=>select(i));
   tile.dataset.index=String(i);
   tile.setAttribute("aria-label","Hàng "+(r+1)+" cột "+(col+1)+": "+(!c?"trống":c.covered?"quân úp":GLYPH[c.p]));
   if(c){
    const piece=node("span","xq-piece "+(camp(c)===1?"red":"black")+(c.covered?" covered":""),
     c.covered?"？":GLYPH[c.p]);
    tile.append(piece);
   }else if(target.has(i))tile.append(node("span","xq-target-dot"));
   board.append(tile);
  }
  status.textContent=g.winner!==null?(g.winner===1?"🏆 Bạn thắng!":"🏆 Máy thắng!"):
   g.turn===1?(isXiangqiCheck(g,1)?"⚠️ Tướng đang bị chiếu! Chọn nước cứu tướng.":"🔴 Lượt bạn · chọn quân đỏ và ô đích hợp lệ."):
   "⏳ Máy đang suy nghĩ nước đi...";
  board.dataset.lastMove=g.last?g.last.join(","):"";
  board.dataset.moveIndex=String(g.moves.length);
  board.append(node("div","arena-extra-ticker xq-ticker",g.last?
   (g.turn===1?"Máy vừa đi. Đến lượt bạn.":"Đã đi quân. Chờ máy trả lời."):"Chọn quân đỏ để đi."));
  $("xqMoveCount").textContent=g.moves.length+" nước";
  $("xqMoveLog").replaceChildren(...g.moves.slice(-6).reverse().map((m,i)=>node("p","",
   (m.side===1?"🔴 Bạn: ":"⚫ Máy: ")+m.piece+" "+(m.capture?"× ":"→ ")+
   (Math.floor(m.to/9)+1)+"/"+(m.to%9+1))));
 }
 $("xqNew").addEventListener("click",start);
 $("xqExit").addEventListener("click",exit);
 $("xqVariant").addEventListener("change",()=>{if(g)status.textContent="Đổi chế độ sẽ áp dụng từ ván mới.";});
 return {start,stop};
}
