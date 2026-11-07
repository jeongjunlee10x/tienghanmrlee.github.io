/* Tiến lên miền Nam – local 4-player variant, fully checked combos and first-round 3♣ opener.
 * Rule variant (see UI): 3 pair-run chops a single 2; four of a kind chops
 * single/pair 2 and 3 pair-run; 4 pair-run chops those plus quads.
 * Local simulation only; no student points or real-world prizes. */
export const SUITS=["♠","♣","♦","♥"];
export const SUIT_NAMES=["Bích","Chuồn","Rô","Cơ"];
export const NAMES=["Bạn","Min-ji","Jun-ho","Ha-na"];
export const rankText=n=>n===15?"2":n===14?"A":n===13?"K":n===12?"Q":n===11?"J":String(n);
export const label=c=>rankText(c.rank)+SUITS[c.suit];
export const value=c=>c.rank*4+c.suit;
export function deck(){
 const result=[];
 for(let rank=3;rank<=15;rank++)for(let suit=0;suit<4;suit++)
  result.push({id:rank+"-"+suit,rank,suit});
 return result;
}
export function shuffle(items,rng=Math.random){
 const a=items.slice();
 for(let i=a.length-1;i>0;i--){
  const j=Math.max(0,Math.min(i,Math.floor(rng()*(i+1))));
  [a[i],a[j]]=[a[j],a[i]];
 }
 return a;
}
export function start(rng=Math.random,playerCount=4,previousWinner=-1){
 if(!Number.isInteger(playerCount)||playerCount<2||playerCount>4)throw Error("Tiến Lên cần 2–4 người.");
 const shuffled=shuffle(deck(),rng);
 // Keep 13 cards per player even with 2/3 participants. Unused cards are out
 // of the match; ensure 3♠ is in play for the traditional opening rule.
 const dealtCount=13*playerCount;
 const openerIndex=shuffled.findIndex(c=>c.id==="3-1");
 if(openerIndex>=dealtCount)[shuffled[0],shuffled[openerIndex]]=[shuffled[openerIndex],shuffled[0]];
 const hands=Array.from({length:playerCount},()=>[]);
 shuffled.slice(0,dealtCount).forEach((c,i)=>hands[i%playerCount].push(c));
 hands.forEach(h=>h.sort((a,b)=>value(a)-value(b)));
 const opener=hands.findIndex(hand=>hand.some(c=>c.id==="3-1"));
 const continuing=Number.isInteger(previousWinner)&&previousWinner>=0&&previousWinner<playerCount;
 const first=continuing?previousWinner:opener;
 return {hands,turn:first,first:!continuing,leader:first,last:null,passed:Array(playerCount).fill(false),
  history:[continuing?"Người thắng ván trước được đánh đầu (ghế "+(first+1)+").":
   "Ván đầu: người có 3♣ (3 chuồn) đi trước, phải chứa 3♣."],
  played:[],winner:null,specialFinish:false,ruleVersion:2,rounds:0};
}
export function analyze(cards){
 if(!cards?.length||cards.length>13||new Set(cards.map(c=>c.id)).size!==cards.length)return null;
 const sorted=cards.slice().sort((a,b)=>value(a)-value(b));
 const ranks=[...new Set(sorted.map(x=>x.rank))],size=sorted.length,top=sorted.at(-1);
 const common={size,high:top.rank,suit:top.suit,cards:sorted};
 if(size===1)return {...common,type:"single"};
 if(ranks.length===1){
  if(size===2)return {...common,type:"pair"};
  if(size===3)return {...common,type:"triple"};
  if(size===4)return {...common,type:"quad"};
  return null;
 }
 const step=ranks.every((r,i)=>i===0||r===ranks[i-1]+1);
 if(!step||ranks.at(-1)===15)return null;
 if(ranks.length===size&&size>=3)return {...common,type:"straight"};
 if(size>=6&&size%2===0&&ranks.length===size/2&&ranks.length>=3&&
  ranks.every(r=>sorted.filter(c=>c.rank===r).length===2))
  return {...common,type:"pair-run"};
 return null;
}
export function beats(a,b){
 if(!a)return false;
 if(!b)return true;
 const single2=b.type==="single"&&b.high===15;
 const pair2=b.type==="pair"&&b.high===15;
 if(a.type==="pair-run"&&a.size>=6){
  if(single2)return true;
  if(a.size>=8&&(pair2||b.type==="quad"||b.type==="pair-run"&&b.size===6))return true;
 }
 if(a.type==="quad"&&(single2||pair2||b.type==="pair-run"&&b.size===6))return true;
 if(a.type!==b.type||a.size!==b.size)return false;
 if(a.high!==b.high)return a.high>b.high;
 return a.suit>b.suit;
}
export function nextSeat(g,from=g.turn){
 for(let i=1;i<=g.hands.length;i++){
  const seat=(from+i)%g.hands.length;
  if(!g.passed[seat])return seat;
 }
 return from;
}
export function canPlay(g,player,ids){
 if(g.winner!==null||g.turn!==player||!Array.isArray(ids)||!ids.length)return false;
 const hand=g.hands[player],cards=ids.map(id=>hand.find(c=>c.id===id));
 if(cards.some(x=>!x)||new Set(ids).size!==ids.length)return false;
 const combo=analyze(cards);
 if(!combo)return false;
 if(g.first&&!ids.includes("3-1"))return false;
 return beats(combo,g.last?.combo);
}
export function play(g,player,ids){
 if(!canPlay(g,player,ids))throw Error("Bộ bài không hợp lệ, không đủ mạnh hoặc chưa đến lượt.");
 const hand=g.hands[player],cards=ids.map(id=>hand.find(c=>c.id===id));
 const combo=analyze(cards);
 g.hands[player]=hand.filter(c=>!ids.includes(c.id));
 g.last={player,combo};g.leader=player;
 g.passed=Array(g.hands.length).fill(false);
 g.played=cards;
 g.first=false;g.rounds++;
 const type={single:"rác",pair:"đôi",triple:"sám",quad:"tứ quý",straight:"sảnh","pair-run":"đôi thông"}[combo.type];
 g.history.push(NAMES[player]+" ra "+type+": "+cards.map(label).join(" "));
 if(g.hands[player].length===0){
  g.winner=player;
  g.specialFinish=cards.length===1&&cards[0].id==="3-0";
  g.history.push(NAMES[player]+" về nhất!"+(g.specialFinish?" 🏆 ĐÚT 3 BÍCH ×3 MỨC BÀN MỖI ĐỐI THỦ!":""));
 }else g.turn=nextSeat(g,player);
 if(g.rounds>=300&&!g.winner){
  const minimum=Math.min(...g.hands.map(h=>h.length));
  g.winner=g.hands.findIndex(h=>h.length===minimum);
  g.history.push("Giới hạn ván: người ít bài nhất được xử thắng demo.");
 }
 if(g.history.length>30)g.history.shift();
 return combo;
}
export function pass(g,player){
 if(g.turn!==player||g.winner!==null)throw Error("Không đến lượt bỏ.");
 if(!g.last)throw Error("Người mở vòng phải đánh bài.");
 g.passed[player]=true;
 g.history.push(NAMES[player]+" bỏ lượt.");
 g.rounds++;
 const available=Array.from({length:g.hands.length},(_,i)=>i).filter(i=>i!==g.last.player&&!g.passed[i]);
 if(!available.length){
  const leader=g.last.player;
  g.last=null;g.played=[];g.passed=Array(g.hands.length).fill(false);
  g.turn=leader;
  g.history.push("Vòng mới: "+NAMES[leader]+" được mở bài.");
 }else g.turn=nextSeat(g,player);
 if(g.history.length>30)g.history.shift();
}
const byRank=hand=>{
 const m=new Map();
 for(const c of hand){
  if(!m.has(c.rank))m.set(c.rank,[]);
  m.get(c.rank).push(c);
 }return m;
};
function choose(group,n){
 const out=[];
 function visit(i,acc){
  if(acc.length===n){out.push(acc.slice());return;}
  for(let k=i;k<group.length;k++)visit(k+1,[...acc,group[k]]);
 }visit(0,[]);
 return out;
}
export function options(hand){
 const groups=byRank(hand),out=[],seen=new Set();
 function add(cards){
  const key=cards.map(x=>x.id).sort().join(",");
  if(seen.has(key))return;
  seen.add(key);
  if(analyze(cards))out.push(cards);
 }
 for(const group of groups.values()){
  for(let n=1;n<=Math.min(4,group.length);n++)
   for(const combo of choose(group,n))add(combo);
 }
 // Straights: every contiguous run from length 3, highest-rank suit variants.
 // Select the weakest earlier cards to keep generation linear.
 for(let first=3;first<=12;first++){
  for(let last=first+2;last<=14;last++){
   const ranks=Array.from({length:last-first+1},(_,i)=>first+i);
   if(ranks.some(r=>!groups.has(r)))break;
   const prefix=ranks.slice(0,-1).map(r=>groups.get(r)[0]);
   for(const fin of groups.get(last))add([...prefix,fin]);
  }
 }
 // 3+ successive pairs, keep only two lower suits in leading ranks,
 // enumerate the highest pair to allow suit-based response.
 for(let first=3;first<=12;first++){
  for(let last=first+2;last<=14;last++){
   const ranks=Array.from({length:last-first+1},(_,i)=>first+i);
   if(ranks.some(r=>(groups.get(r)?.length||0)<2))break;
   const prefix=ranks.slice(0,-1).flatMap(r=>groups.get(r).slice(0,2));
   for(const pair of choose(groups.get(last),2))add([...prefix,...pair]);
  }
 }
 return out;
}
export function botDecision(g){
 const player=g.turn;if(player===0)throw Error("Không phải bot.");
 let choices=options(g.hands[player]).filter(cards=>canPlay(g,player,cards.map(c=>c.id)));
 if(!choices.length)return null;
 // Keep bombs and 2s unless necessary. On a fresh trick shed combinations.
 choices.sort((a,b)=>{
  const A=analyze(a),B=analyze(b);
  function score(cards,combo){
   const bombs=combo.type==="quad"||combo.type==="pair-run";
   const two=cards.some(c=>c.rank===15);
   const shed=g.last?0:cards.length*15;
   return shed-(bombs?g.last?4:20:0)-(two?g.last?0:17:0)
    -combo.high*0.7-combo.suit*0.05;
  }
  return score(b,B)-score(a,A);
 });
 return choices[0].map(c=>c.id);
}
export function botTurn(g){
 if(g.winner!==null||g.turn===0)return false;
 const ids=botDecision(g);
 if(ids)play(g,g.turn,ids);else pass(g,g.turn);
 return true;
}
