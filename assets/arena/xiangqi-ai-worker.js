/* MR LEE Chinese chess AI — independent module worker, local state only. */
import {xiangqiBotMove} from "./xiangqi.js";
self.addEventListener("message",event=>{
 const {position,difficulty}=event.data||{};
 if(!position||!["easy","normal","hard"].includes(difficulty))return;
 try{self.postMessage({move:xiangqiBotMove(position,difficulty)});}
 catch(error){self.postMessage({error:String(error?.message||error)});}
});
