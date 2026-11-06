/* MR LEE Chess AI — compute legal engine moves off the rendering thread.
 * Local-only worker; no wallet, storage, network or external chess sources.
 */
import {bestBotMove} from "./chess-engine.js";
self.addEventListener("message",event=>{
 const {id,position,difficulty}=event.data||{};
 if(!Number.isSafeInteger(id)||!position||!["easy","normal","hard"].includes(difficulty))return;
 try{
  const move=bestBotMove(position,difficulty);
  self.postMessage({id,move});
 }catch(error){
  self.postMessage({id,error: String(error?.message||"AI failed")});
 }
});
