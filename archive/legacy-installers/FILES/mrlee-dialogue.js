(() => {
'use strict';
const $=id=>document.getElementById(id);
const topics=window.MRLEE_DIALOGUE_BANK||{};
const labels={'greetings':'Chào hỏi','self':'Giới thiệu bản thân','restaurant':'Quán ăn','cafe':'Quán cà phê','shopping':'Mua sắm','directions':'Hỏi đường','transport':'Giao thông','everyday':'Sinh hoạt hằng ngày','school':'Trường học','work':'Nơi làm việc','phone':'Điện thoại','home':'Nhà cửa','hospital':'Bệnh viện & sức khỏe','travel':'Du lịch','interview':'Phỏng vấn','bank':'Ngân hàng & bưu điện','pt-restaurant':'Làm thêm · Quán ăn','pt-cafe':'Làm thêm · Cà phê','pt-convenience':'Làm thêm · Tiện lợi'};
let topic=Object.keys(topics)[0], round=0,stream=null, recorder=null,chunks=[], url=null,recognition=null;
function status(value){$('dialogueStatus').textContent=value;}
function cleanup(){try{recorder?.state==='recording'&&recorder.stop();}catch{} if(stream){stream.getTracks().forEach(x=>x.stop());stream=null;}if(recognition){try{recognition.abort()}catch{}recognition=null;}if(url){URL.revokeObjectURL(url);url=null;}$('recordPlayback').removeAttribute('src');$('recordPlayback').classList.add('mr-new-hidden');$('recordStart').disabled=false;$('recordStop').disabled=true;$('dialogueTranscript').classList.add('mr-new-hidden');}
function draw(){cleanup();const entry=topics[topic]?.[round];if(!entry)return;
$('dialogueRound').textContent=`${labels[topic]} · Lượt ${round+1}/${topics[topic].length}`;
$('dialogueQuestion').textContent=entry.question;$('dialogueQvi').textContent=entry.qvi;
$('dialogueAnswer').textContent=entry.answer;$('dialogueAvi').textContent=entry.avi;
$('dialogueMeta').textContent='Hai tình huống cho mỗi chủ đề, có giọng máy và ghi âm thử.';
status('Bấm “Nghe máy đọc”, sau đó bấm “Bắt đầu ghi âm” và nói câu trả lời của mình.');
}
function speak(t){const Native=window.SpeechSynthesisUtterance;if(!Native||!window.speechSynthesis){status('Trình duyệt chưa hỗ trợ giọng đọc.');return;}speechSynthesis.cancel();const v=new Native(t);v.lang='ko-KR';v.rate=.84;const voice=speechSynthesis.getVoices().find(x=>x.lang.toLowerCase()==='ko-kr');if(voice)v.voice=voice;speechSynthesis.speak(v);}
$('dialogueTopic').innerHTML=Object.keys(topics).map(id=>`<option value="${id}">${labels[id]||id}</option>`).join('');
$('dialogueTopic').addEventListener('change',e=>{topic=e.target.value;round=0;draw();});
$('dialogueNext').addEventListener('click',()=>{round=(round+1)%topics[topic].length;draw();});
$('dialogueSpeak').addEventListener('click',()=>speak(topics[topic][round].question));
$('dialogueSpeakAnswer').addEventListener('click',()=>speak(topics[topic][round].answer));
$('recordStart').addEventListener('click',async()=>{
 if(!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder==='undefined'){status('Trình duyệt không hỗ trợ ghi âm trực tiếp. Hãy sử dụng Chrome/Edge và đường dẫn HTTPS.');return;}
 try{window.speechSynthesis?.cancel();if(recognition){recognition.abort();recognition=null;}
 if(url){URL.revokeObjectURL(url);url=null;}
 $('recordPlayback').classList.add('mr-new-hidden');
 stream=await navigator.mediaDevices.getUserMedia({audio:true});
 chunks=[];recorder=new MediaRecorder(stream);
 recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
 recorder.onstop=()=>{
   if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
   if(!chunks.length){status('Chưa ghi được âm thanh. Bạn hãy thử lại.');return;}
   const b=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});url=URL.createObjectURL(b);
   $('recordPlayback').src=url;$('recordPlayback').classList.remove('mr-new-hidden');status('Đã ghi âm xong. Nhấn Play để tự nghe lại và so sánh câu mẫu.');
 };
 recorder.onerror=()=>status('Ghi âm gặp lỗi. Hãy thử lại hoặc kiểm tra quyền micro.');
 recorder.start();$('recordStart').disabled=true;$('recordStop').disabled=false;status('Đang ghi âm… nhấn “Dừng ghi âm” khi nói xong.');
 }catch(err){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}status('Không thể mở micro: '+(err?.message||'Hãy cấp quyền micro'));}
});
$('recordStop').addEventListener('click',()=>{if(recorder?.state==='recording'){recorder.stop();$('recordStart').disabled=false;$('recordStop').disabled=true;}});
$('dialogueRecognize').addEventListener('click',()=>{
 if(recorder?.state==='recording'){status('Hãy dừng ghi âm trước khi bắt đầu nhận diện.');return;}
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Speech){status('Trình duyệt chưa hỗ trợ nhận diện tiếng Hàn. Bạn vẫn có thể ghi âm và nghe lại.');return;}
 const rec=new Speech();recognition=rec;rec.lang='ko-KR';rec.interimResults=false;rec.maxAlternatives=1;
 rec.onresult=event=>{const text=event.results?.[0]?.[0]?.transcript||'';const target=topics[topic][round].answer;
 const box=$('dialogueTranscript');box.classList.remove('mr-new-hidden');box.textContent=`Máy nhận diện: ${text}. Câu mẫu: ${target}. Hãy so sánh nội dung; đây không phải điểm phát âm.`;
 status('Đã nhận diện lời nói. Nhận diện chỉ mang tính tham khảo và có thể không chính xác.');};
 rec.onerror=event=>status('Nhận diện không thành công ('+(event.error||'unknown')+'). Bạn có thể tiếp tục ghi âm bình thường.');
 rec.onend=()=>{if(recognition===rec)recognition=null;};
 try{rec.start();status('Micro đang nghe tiếng Hàn…');}catch(err){status('Không mở được nhận diện: '+err.message);recognition=null;}
});
window.addEventListener('pagehide',cleanup);draw();
})();
