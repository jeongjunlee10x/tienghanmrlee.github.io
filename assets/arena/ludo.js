/* Cờ Cá Ngựa 2–4 người — local/demo, no G or study-point transactions. */
const NAMES=["Bạn","Minh","Lan","Jun"], COLORS=["red","blue","yellow","green"];
const $=id=>document.getElementById(id);
const node=(tag,cls="",text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
const button=(text,cls,action)=>{const e=node("button",cls,text);e.type="button";if(action)e.addEventListener("click",action);return e;};
export const TRACK=(()=>{const a=[];for(let x=0;x<14;x++)a.push([0,x]);for(let y=1;y<14;y++)a.push([y,13]);for(let x=12;x>=0;x--)a.push([13,x]);for(let y=12;y>0;y--)a.push([y,0]);return a;})();
export const STARTS=[0,13,26,39];
export const LANE=[
 [[1,1],[2,2],[3,3],[4,4],[5,5],[6,6]],
 [[1,12],[2,11],[3,10],[4,9],[5,8],[6,7]],
 [[12,12],[11,11],[10,10],[9,9],[8,8],[7,7]],
 [[12,1],[11,2],[10,3],[9,4],[8,5],[7,6]]
];
const BASES=[
 [[2,2],[2,3],[3,2],[3,3]],
 [[2,10],[2,11],[3,10],[3,11]],
 [[10,10],[10,11],[11,10],[11,11]],
 [[10,2],[10,3],[11,2],[11,3]]
];
const die=()=>Math.floor(Math.random()*6)+1;
export function newLudo(playerCount=4){if(![2,3,4].includes(playerCount))throw Error("Chọn 2, 3 hoặc 4 người.");return {turn:0,activePlayers:playerCount,seats:playerCount===2?[0,2]:Array.from({length:playerCount},(_,i)=>i),phase:"roll",die:0,pawns:Array.from({length:4},()=>[-1,-1,-1,-1]),winner:null,history:["Tung được 6 để đưa ngựa ra chuồng xuất phát."],turns:0};}
export function ludoMoves(g,n=g.turn,roll=g.die){
 if(g.winner!==null||roll<1||roll>6)return [];
 return g.pawns[n].map((p,i)=>p===-1?(roll===6?i:-1):p===58?-1:p+roll<=58?i:-1).filter(i=>i>=0);
}
export function moveLudo(g,pawn){
 if(g.phase!=="choose"||!ludoMoves(g).includes(pawn))throw Error("Quân này chưa thể di chuyển.");
 const who=g.turn,step=g.die,old=g.pawns[who][pawn],next=old===-1?0:old+step;
 g.pawns[who][pawn]=next;
 const events=[NAMES[who]+" "+(old===-1?"xuất chuồng":("đi "+step+" ô"))+" (ngựa "+(pawn+1)+")."];
 let captured=false;
 if(next>=0&&next<52){
  const place=(STARTS[who]+next)%52;
  if(!STARTS.includes(place)){
   g.pawns.forEach((horses,other)=>{
    if(other===who)return;
    horses.forEach((at,j)=>{
     if(at>=0&&at<52&&(STARTS[other]+at)%52===place){
      horses[j]=-1;captured=true;events.push("🎯 Bắt ngựa "+NAMES[other]+" về chuồng!");
     }
    });
   });
  }
 }
 g.history.push(...events);
 if(g.pawns[who].every(p=>p===58)){g.winner=who;g.phase="end";g.history.push("🏆 "+NAMES[who]+" về đích cả 4 ngựa!");return g;}
 g.phase="roll";g.die=0;g.turns++;
 if(step!==6&&!captured)g.turn=g.seats[(g.seats.indexOf(g.turn)+1)%g.seats.length];
 else g.history.push("✨ "+NAMES[who]+" được tung thêm lượt.");
 return g;
}
export function rollLudo(g,value=die()){
 if(g.phase!=="roll"||g.winner!==null)throw Error("Không phải lúc tung xúc xắc.");
 if(!Number.isInteger(value)||value<1||value>6)throw Error("Xúc xắc không hợp lệ.");
 g.die=value;g.phase="choose";
 const choices=ludoMoves(g);
 g.history.push("🎲 "+NAMES[g.turn]+" tung được "+value+".");
 if(!choices.length){
  g.history.push("Không có nước hợp lệ.");
  g.phase="roll";g.die=0;g.turns++;
  if(value!==6)g.turn=g.seats[(g.seats.indexOf(g.turn)+1)%g.seats.length];
 }
 return g;
}
function coordinates(who,pawn,progress){
 if(progress===-1)return BASES[who][pawn];
 if(progress===58)return [6+(who>=2?1:0),6+(who===1||who===2?1:0)];
 if(progress>=52)return LANE[who][progress-52];
 return TRACK[(STARTS[who]+progress)%52];
}
export function mountLudo({onStart,onFinish,onExit}){
 const root=$("arenaLudo"),board=$("ludoBoard"),status=$("ludoStatus"),rollBtn=$("ludoRoll"),moves=$("ludoMoves");
 let game=null,timer=null,epoch=0,done=false;
 function stop(){epoch++;if(timer!==null)clearTimeout(timer);timer=null;if($("ludoPlayers"))$("ludoPlayers").disabled=false;}
 function exit(){stop();root.hidden=true;game=null;onExit();}
 function finish(){
  if(done||game?.winner===null)return;
  done=true;stop();
  onFinish(game.winner===0?"win":"loss","Cờ Cá Ngựa",root);
 }
 function start(){
  if(!onStart())return;
  stop();done=false;game=newLudo(Number($("ludoPlayers")?.value||4));
   if($("ludoPlayers"))$("ludoPlayers").disabled=true;
  root.querySelector(".arena-game-result")?.remove();
  root.hidden=false;render();root.scrollIntoView({behavior:"smooth",block:"start"});
  schedule();
 }
 function choose(i){
  if(!game||game.turn!==0||game.phase!=="choose"||done)return;
  try{moveLudo(game,i);render();if(game.winner!==null)finish();else schedule();}
  catch(err){status.textContent=err.message;}
 }
 function schedule(){
  if(!game||done||game.turn===0||timer!==null)return;
  const stamp=epoch;
  timer=setTimeout(()=>{
   timer=null;if(epoch!==stamp||root.hidden||!game||done||game.turn===0)return;
   const who=game.turn;
   if(game.phase==="roll")rollLudo(game);
   if(game.phase==="choose"){
    const choices=ludoMoves(game);
    choices.sort((a,b)=>{
     const x=game.pawns[who][a],y=game.pawns[who][b];
     return (y===58?100:y)-(x===58?100:x);
    });
    if(choices.length)moveLudo(game,choices[0]);
   }
   render();if(game.winner!==null)finish();else schedule();
  },420);
 }
 function render(){
  if(!game||root.hidden)return;
  const g=game,canChoose=g.turn===0&&g.phase==="choose",allowed=canChoose?ludoMoves(g):[];
  board.dataset.activePlayers=String(g.activePlayers);
  status.textContent=g.winner!==null?"🏆 "+NAMES[g.winner]+" chiến thắng!":
   g.turn===0?(g.phase==="roll"?"Đến lượt bạn · tung xúc xắc.":"Bạn tung "+g.die+" · chọn ngựa để đi."):
   "⏳ "+NAMES[g.turn]+" đang chơi.";
  $("ludoDie").textContent=g.die?["","⚀","⚁","⚂","⚃","⚄","⚅"][g.die]:"🎲";
  rollBtn.disabled=!(g.turn===0&&g.phase==="roll"&&!done);
  const holder=Array.from({length:196},(_,n)=>{const r=Math.floor(n/14),c=n%14;
   const tile=node("div","ludo-cell");
   tile.dataset.cell=r+"-"+c;
   if(r===0||c===0||r===13||c===13)tile.classList.add("track");
   for(let i=0;i<4;i++){
    if(STARTS[i]===TRACK.findIndex(([y,x])=>y===r&&x===c))tile.classList.add("start-"+COLORS[i]);
    if(LANE[i].some(([y,x])=>y===r&&x===c))tile.classList.add("lane-"+COLORS[i]);
   }
   if(r>=1&&r<=5&&c>=1&&c<=5)tile.classList.add("base-red");
   if(r>=1&&r<=5&&c>=8&&c<=12)tile.classList.add("base-blue");
   if(r>=8&&r<=12&&c>=8&&c<=12)tile.classList.add("base-yellow");
   if(r>=8&&r<=12&&c>=1&&c<=5)tile.classList.add("base-green");
   if(r>=6&&r<=7&&c>=6&&c<=7)tile.classList.add("goal");
   return tile;});
  g.pawns.forEach((horses,who)=>{if(!g.seats.includes(who))return;horses.forEach((p,i)=>{
   const [r,c]=coordinates(who,i,p),tile=holder[r*14+c];
   const token=button(String(i+1),"ludo-pawn "+COLORS[who],()=>choose(i));
   token.title=NAMES[who]+" · ngựa "+(i+1)+(p<0?" trong chuồng":p===58?" đã về đích":"");
   token.dataset.pawn=who+"-"+i;
   token.dataset.progress=String(p);
   token.disabled=who!==0||!allowed.includes(i);
   if(allowed.includes(i))token.classList.add("legal");
   tile.append(token);
  });});
  board.replaceChildren(...holder);
  board.append(node("div","arena-extra-ticker",g.history.at(-1)));
  moves.replaceChildren();
  g.pawns.forEach((arr,who)=>{
   if(!g.seats.includes(who))return;
   const home=arr.filter(v=>v===58).length;
   const chip=node("span","ludo-player "+COLORS[who]+(who===g.turn?" active":""),
    NAMES[who]+" · "+home+"/4 về đích");moves.append(chip);
  });
  $("ludoHistory").replaceChildren(...g.history.slice(-4).reverse().map(t=>node("p","",t)));
 }
 rollBtn.addEventListener("click",()=>{
  if(!game||game.turn!==0||game.phase!=="roll"||done)return;
  rollLudo(game);render();
 });
 $("ludoNew").addEventListener("click",start);
 $("ludoExit").addEventListener("click",exit);
 return {start,stop};
}
