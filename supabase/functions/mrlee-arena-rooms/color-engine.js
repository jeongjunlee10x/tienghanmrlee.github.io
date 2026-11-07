/* MR LEE Arena / Sắc Màu — original color-card strategy game.
 * Complete local turn engine, no official currencies, no network or betting.
 * The player, bots and tests use the same legal move reducer.
 */
export const COLORS=Object.freeze(["red","blue","green","yellow"]);
export const COLOR_VI=Object.freeze({red:"Đỏ",blue:"Xanh biển",green:"Xanh lá",yellow:"Vàng"});
export const PLAYER_NAMES=Object.freeze(["Bạn","Min-ji","Jun-ho","Ha-na"]);
const TYPES=Object.freeze(["skip","reverse","draw2"]);
const ACTION_VI=Object.freeze({skip:"Cấm lượt",reverse:"Đảo chiều",draw2:"+2",wild:"Đổi màu",wild4:"+4"});
const legalColor=color=>COLORS.includes(color);
const advance=(from,dir,n=1)=>((from+dir*n)%4+4)%4;
export function makeDeck(){
 const deck=[];let id=0;
 for(const color of COLORS){
  deck.push({id:id++,color,type:"number",value:0});
  for(let n=1;n<=9;n++)for(let j=0;j<2;j++)deck.push({id:id++,color,type:"number",value:n});
  for(const type of TYPES)for(let j=0;j<2;j++)deck.push({id:id++,color,type,value:null});
 }
 for(let k=0;k<4;k++){
  deck.push({id:id++,color:null,type:"wild",value:null});
  deck.push({id:id++,color:null,type:"wild4",value:null});
 }
 return deck;
}
export function shuffle(array,random=Math.random){
 const a=array.slice();
 for(let i=a.length-1;i>0;i--){
  const j=Math.floor(Math.min(0.999999999,Math.max(0,random()))*(i+1));
  [a[i],a[j]]=[a[j],a[i]];
 }
 return a;
}
export function cardLabel(card){
 if(card.type==="number")return String(card.value);
 return ACTION_VI[card.type]||"?";
}
export function newGame(random=Math.random){
 const pile=shuffle(makeDeck(),random);
 const hands=Array.from({length:4},()=>pile.splice(-7));
 // Start with a colored number; action cards in opening may confuse beginners.
 let idx=pile.findIndex(x=>x.type==="number");
 if(idx<0)throw Error("Missing opening numeric card.");
 const [first]=pile.splice(idx,1);
 return {hands,pile,discard:[first],activeColor:first.color,turn:0,direction:1,winner:null,
   drawnCardId:null,turns:0,events:["Bắt đầu ván Bài Màu. Bạn đi trước."]};
}
export function topCard(game){return game.discard.at(-1);}
export function canPlay(game,card,player=game.turn){
 if(game.winner!==null||player!==game.turn)return false;
 if(!card||!game.hands[player].some(x=>x.id===card.id))return false;
 if(game.drawnCardId!==null && card.id!==game.drawnCardId)return false;
 const top=topCard(game);
 if(card.type==="wild")return true;
 if(card.type==="wild4"){
  // No +4 when holding a natural matching color; excludes wild cards.
  return !game.hands[player].some(x=>x.color===game.activeColor);
 }
 return card.color===game.activeColor ||
   (card.type===top.type &&
    (card.type!=="number"||card.value===top.value)) ||
   (card.type==="number"&&top.type==="number"&&card.value===top.value);
}
function recycle(game,random=Math.random){
 if(game.pile.length)return;
 if(game.discard.length<2)return;
 const current=game.discard.pop();
 game.pile=shuffle(game.discard,random);game.discard=[current];
}
export function drawCards(game,player,count=1,random=Math.random){
 const gained=[];
 for(let i=0;i<count;i++){
  recycle(game,random);
  if(!game.pile.length)break;
  const card=game.pile.pop();
  game.hands[player].push(card);gained.push(card);
 }
 return gained;
}
function log(game,s){game.events.push(s);if(game.events.length>25)game.events.shift();}
function ensureActive(game,player){
 if(game.winner!==null)throw Error("Ván chơi đã kết thúc.");
 if(game.turn!==player)throw Error("Không đến lượt của bạn.");
}
function doneOrPass(game,player,next){
 game.turns++;
 if(game.hands[player].length===0){
  game.winner=player;
  game.turn=player;
  log(game,PLAYER_NAMES[player]+" đã về nhất!");
  return;
 }
 game.turn=next;
 if(game.turns>=400){
  let shortest=0;
  game.hands.forEach((hand,i)=>{if(hand.length<game.hands[shortest].length)shortest=i;});
  game.winner=shortest;
  log(game,"Ván dài, người còn ít bài nhất thắng.");
 }
}
/** @param {string|null} chosenColor - optional active color for a wild card. */
export function play(game,player,cardId,chosenColor=null,random=Math.random){
 ensureActive(game,player);
 const index=game.hands[player].findIndex(c=>c.id===cardId);
 if(index<0)throw Error("Lá bài không nằm trong tay người chơi.");
 const card=game.hands[player][index];
 if(!canPlay(game,card,player))throw Error("Lá này không hợp lệ ở lượt hiện tại.");
 if((card.type==="wild"||card.type==="wild4")&&!legalColor(chosenColor))
  throw Error("Phải chọn một màu hợp lệ.");
 game.hands[player].splice(index,1);
 game.discard.push(card);
 game.activeColor=card.color??chosenColor;
 game.drawnCardId=null;
 let next=advance(player,game.direction);
 if(card.type==="reverse"){
  game.direction*=-1;next=advance(player,game.direction);
 }else if(card.type==="skip")next=advance(player,game.direction,2);
 else if(card.type==="draw2"){
  const target=advance(player,game.direction);
  drawCards(game,target,2,random);
  next=advance(target,game.direction);
 }else if(card.type==="wild4"){
  const target=advance(player,game.direction);
  drawCards(game,target,4,random);
  next=advance(target,game.direction);
 }
 log(game,PLAYER_NAMES[player]+" đánh "+cardLabel(card)+(card.color?" · "+COLOR_VI[card.color]:" → "+COLOR_VI[game.activeColor]));
 doneOrPass(game,player,next);
 return card;
}
export function beginDraw(game,player,random=Math.random){
 ensureActive(game,player);
 if(game.drawnCardId!==null)throw Error("Đã rút một lá trong lượt này.");
 const cards=drawCards(game,player,1,random);
 game.drawnCardId=cards[0]?.id??-1;
 log(game,PLAYER_NAMES[player]+" rút một lá bài.");
 return cards[0]||null;
}
export function pass(game,player){
 ensureActive(game,player);
 if(game.drawnCardId===null)throw Error("Cần rút bài trước khi bỏ lượt.");
 game.drawnCardId=null;
 log(game,PLAYER_NAMES[player]+" qua lượt.");
 doneOrPass(game,player,advance(player,game.direction));
}
export function chooseBotMove(game){
 const player=game.turn;
 if(player===0)throw Error("Đây là lượt người chơi.");
 const hand=game.hands[player];
 const playable=hand.filter(x=>canPlay(game,x,player));
 if(!playable.length)return null;
 const scores=playable.map(card=>{
  const same=hand.filter(x=>x.color===card.color).length;
  const danger=game.hands[advance(player,game.direction)].length<=2;
  const action=card.type==="skip"||card.type==="draw2"?danger?7:2:card.type==="reverse"?2:0;
  const wild=card.type==="wild"||card.type==="wild4"?-8:0;
  return {card,score:same*3+action+wild+(card.type==="number"?1:0)};
 });
 scores.sort((a,b)=>b.score-a.score);
 return scores[0].card;
}
export function botTurn(game,random=Math.random){
 const player=game.turn;
 if(player===0||game.winner!==null)return false;
 let card=chooseBotMove(game);
 if(!card){
  const drawn=beginDraw(game,player,random);
  if(drawn&&canPlay(game,drawn,player))card=drawn;
  else {pass(game,player);return true;}
 }
 const other=game.hands[player].filter(x=>x.id!==card.id&&x.color);
 const counts=COLORS.map(color=>({color,count:other.filter(x=>x.color===color).length}));
 counts.sort((a,b)=>b.count-a.count);
 const color=card.color?null:counts[0].color;
 play(game,player,card.id,color,random);
 return true;
}
export function cardsRemaining(game){
 return game.hands.map(hand=>hand.length);
}
