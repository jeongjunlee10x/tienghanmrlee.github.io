import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const preview=fs.readFileSync('van-hoa-du-hoc-sinh-preview.html','utf8');
const sceneSource=fs.readFileSync('assets/culture/student-life-scenes-v1.js','utf8');
const imageSource=fs.readFileSync('assets/culture/student-life-images-v1.js','utf8');
const imageContext={window:{}};
vm.runInNewContext(imageSource,imageContext,{timeout:1000});
const imageMap=imageContext.window.MRLEE_STUDENT_LIFE_IMAGES_V1?.topicImages;
assert(imageMap,'Missing student-life image registry');
assert.deepEqual(Object.keys(imageMap).sort(),['an-uong','dien-thoai','giao-thong','ky-tuc-xa','mua-online','mua-sam'],'Only verified image groups expected');
let imageCount=0;
for(const [slug,items] of Object.entries(imageMap)){
 assert(items.length>= (slug==='mua-online'?1:2),slug+': insufficient image diversity');
 for(const item of items){
  assert(/^(?:images|assets)\/[a-z0-9/-]+\.webp$/.test(item.src)&&!item.src.includes('..'),slug+': unexpected image path');
  assert(fs.existsSync(item.src),slug+': missing asset '+item.src);
  assert(fs.statSync(item.src).size>10000,slug+': suspiciously small image');
  assert(item.caption.length>=15&&item.alt.length>=15,slug+': missing caption/alt');
  if(item.kind==='licensed-photo'){
   assert(item.author&&item.license&&item.source&&item.licenseUrl&&item.changes,slug+': incomplete attribution including modifications');
   assert(item.source.startsWith('https://commons.wikimedia.org/wiki/File:'),slug+': source must be original photo page');
   assert(item.licenseUrl.startsWith('https://creativecommons.org/licenses/'),slug+': license URL required');
  }else{
   assert.equal(item.kind,'existing-ai-artwork',slug+': unexpected provenance');
   assert(item.alt.includes('AI minh họa'),slug+': AI artwork needs explicit disclosure');
  }
  imageCount++;
 }
}
assert.equal(imageCount,19,'19 existing verified image assets required');
assert.deepEqual(imageMap['mua-online'].map(x=>x.src),['images/culture-speaking/food-delivery.webp'],'Online delivery is only one partial illustration');
assert.deepEqual(imageContext.window.MRLEE_STUDENT_LIFE_IMAGES_V1.pendingTopics,['nha-o','ngan-hang'],'Unillustrated topics must remain flagged');
assert.deepEqual(imageContext.window.MRLEE_STUDENT_LIFE_IMAGES_V1.partiallyIllustratedTopics,['mua-online'],'Partial media needs review');
for(const [slug,items] of Object.entries(imageMap)){
 for(const item of items.filter(x=>x.src.startsWith('images/culture-speaking/'))){
  const image=fs.readFileSync(item.src);
  assert.equal(image.toString('ascii',0,4),'RIFF',slug+': invalid WebP');
  assert.equal(image.toString('ascii',8,12),'WEBP',slug+': invalid WebP');
  const format=image.toString('ascii',12,16);
  assert.equal(format,'VP8 ',slug+': unexpected WebP encoder');
  const w=image.readUInt16LE(26)&0x3fff,h=image.readUInt16LE(28)&0x3fff;
  assert(w>=1536&&h>=1024,slug+': new illustrated scene below 1536 × 1024');
 }
}

assert.equal(imageMap['dien-thoai'].filter(x=>x.kind==='licensed-photo').length,3,'Phone photos require attribution');
assert(preview.includes('photoCredit(v)'),'Preview must show licenses on photo captions');
assert.equal(imageMap['nha-o'],undefined,'Housing pack not on PR yet; avoid broken image links');
assert.equal(imageMap['ngan-hang'],undefined,'Unverified bank photo must not display');
assert.equal(imageMap['mua-online'].length,1,'Only one verified online delivery photo is available');
const sceneContext={window:{}};
vm.runInNewContext(sceneSource,sceneContext,{timeout:1000});
const scenes=sceneContext.window.MRLEE_STUDENT_LIFE_SCENES_V1?.topics;
assert(scenes,'Scene module missing');
assert.equal(Object.keys(scenes).length,8,'Eight scene groups expected');
let turnCount=0;
for(const [slug,items] of Object.entries(scenes)){
 assert.equal(items.length,3,slug+': needs three realistic scenes');
 for(const scene of items){
  assert(scene.title&&scene.objective&&scene.setting,'Scene metadata is incomplete');
  assert.equal(scene.lines.length,4,'Each scene must have four dialogue lines');
  for(const line of scene.lines){
   assert(['A','B'].includes(line.speaker),'Unknown speaker');
   assert(/[가-힣]/u.test(line.ko)&&line.vi.length>5,'Missing bilingual dialogue');
   turnCount++;
  }
 }
}
assert.equal(turnCount,96,'24 dialogues × four turns');
const slides=fs.readFileSync('van-hoa-du-hoc-sinh-slides.html','utf8');
const match=slides.match(/const topics=(\[[^\n]+\]);\s*const \$=/);
assert(match,'Missing embedded topics dataset');
const topics=JSON.parse(match[1]);
assert.equal(topics.length,8,'Exactly eight approved topics required');
const catalog=JSON.parse(fs.readFileSync('assets/culture/student-life-catalog-v1.json','utf8'));
assert.equal(catalog.lessons.length,20,'Catalog must have 20 topics');
assert.equal(catalog.lessons.filter(x=>x.status==='preview').length,8,'Exactly 8 published-to-preview lessons');
assert.equal(catalog.lessons.filter(x=>x.status==='planned').length,12,'Exactly 12 future lessons');
assert.equal(catalog.policy.oldSlugs.length,22,'Preserve all 22 original routes');
const legacySource=fs.readFileSync('mrlee-culture-v13-data.js','utf8');
const legacyMatch=legacySource.match(/window\.MRLEE_CULTURE_V13=(\[[\s\S]*\]);?\s*$/);
assert(legacyMatch,'Original 22-topic dataset missing or altered');
const legacySlugs=JSON.parse(legacyMatch[1]).map(row=>row.slug);
assert.deepEqual(catalog.policy.oldSlugs,legacySlugs,'Legacy slugs must exactly match the original source and ordering');

assert.equal(new Set(catalog.lessons.map(x=>x.slug)).size,20,'No duplicate new identifiers');
assert.equal(new Set(catalog.policy.oldSlugs).size,22,'No duplicate old identifiers');
assert.equal(catalog.policy.preserveLegacyLessons,true,'Must preserve legacy lessons');
assert.equal(catalog.policy.preserveLegacyCompletionSlugs,true,'Must preserve learning progress');
assert.deepEqual(catalog.lessons.filter(x=>x.status==='preview').map(x=>x.slug),topics.map(x=>x.id),'Deck IDs must match preview catalog');
assert(catalog.lessons.every(x=>x.public===false),'Draft lessons must not be marked public');

assert.equal(new Set(topics.map(t=>t.id)).size,8,'Topic IDs must be unique');
for(const t of topics){
 assert.equal(t.terms.length,10,t.id+': vocabulary');
 assert.equal(t.sentences.length,8,t.id+': dialogues');
 assert.equal(t.cases.length,9,t.id+': practice scenarios');
 assert(t.terms.every(x=>x.length===2&&x.every(Boolean)),t.id+': incomplete terms');
 assert(t.sentences.every(x=>x.length===2&&x.every(Boolean)),t.id+': incomplete dialogue');
 // Opening 1 + objectives 2 + context 3 + vocab 10 + dialogues 8
 // + practice 9 + quizzes 8 + recap 4 = 45
 assert.equal(1+2+3+t.terms.length+t.sentences.length+t.cases.length+8+4,45);
}
assert(preview.includes('href="van-hoa-du-hoc-sinh-slides.html"'),'Preview must link to slides');
assert(slides.includes('assets/culture/student-life-scenes-v1.js'),'Slide page must load scene data before runtime');
assert(slides.includes('assets/culture/student-life-images-v1.js'),'Slide page must load image registry');
assert(slides.includes('photoCredit(visual)'),'Slides must show photo attribution');
assert(preview.includes('changeNote')&&slides.includes('changeNote'),'Photograph modifications must be visible');
assert(preview.includes('assets/culture/student-life-images-v1.js'),'Preview must load image registry');
for(const html of [preview,slides]){
 assert(html.includes('noindex,nofollow'),'Draft content must not be indexed');
 assert(!html.includes('localStorage.setItem'),'Must not change legacy learning records');
 assert(!html.includes('supabase.from('),'Must not write backend data');
 const blocks=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 assert(blocks.length>0,'Need inline JavaScript');
 for(const [,js] of blocks)new vm.Script(js);
}
for(const feature of ['requestFullscreen','SpeechSynthesisUtterance','ArrowLeft','ArrowRight','reveal']){
 assert(slides.includes(feature),'Missing slide feature: '+feature);
}
console.log('PASS MR LEE student-life preview: 8 topics x 45 slides = 360, syntax, navigation, read-only, legacy safe');


assert(preview.includes('van-hoa-du-hoc-sinh-slides.html#'),'Topic-specific slide links missing');
assert(slides.includes('touchstart')&&slides.includes('touchend'),'Swipe navigation missing');
assert(slides.includes('.slide:fullscreen'),'Fullscreen layout missing');
const inlineSlideScript=slides.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(inlineSlideScript,'Slide runtime missing');
for(const topic of topics){
 const els={};let spoken=[],fullscreen=false;const errors=[],keyboard={},windowEvents={};
 for(const key of ['topic','slide','prev','next','reveal','speak','counter','progress','fullscreen','answer']){
  els[key]={value:0,innerHTML:'',textContent:'',disabled:false,hidden:false,options:[],events:{},
    classList:{toggle(){return true}},
    add(v){this.options.push(v)},
    addEventListener(k,fn){this.events[k]=fn},
    requestFullscreen(){fullscreen=true}};
 }
 const location={hash:'#'+topic.id+'/1'};
 const document={getElementById:k=>els[k],addEventListener:(k,fn)=>{keyboard[k]=fn},fullscreenElement:null,exitFullscreen(){}};
 const tts={getVoices:()=>[{lang:'ko-KR'}],cancel(){},speak(u){spoken.push(u.text)}};
 vm.runInNewContext(inlineSlideScript,{
  document,location,history:{replaceState:(a,b,url)=>{location.hash=url}},
  window:{speechSynthesis:tts,MRLEE_STUDENT_LIFE_SCENES_V1:{topics:scenes},MRLEE_STUDENT_LIFE_IMAGES_V1:{topicImages:imageMap},addEventListener:(event,cb)=>{windowEvents[event]=cb}},speechSynthesis:tts,
  SpeechSynthesisUtterance:function(text){this.text=text},
  Option:function(label,value){this.label=label;this.value=value},
  alert:message=>errors.push(message)
 },{timeout:1500});
 assert.equal(els.topic.options.length,8,topic.id+': 8 choices');
 assert.equal(els.counter.textContent,'1 / 45',topic.id+': initial');
 assert(els.prev.disabled,topic.id+': prev disabled at first slide');
 assert(els.slide.innerHTML.includes('studyinkorea.go.kr'),topic.id+': source reference');
 assert.equal(els.slide.innerHTML.includes('studentSlideVisual'),!!imageMap[topic.id]?.length,topic.id+': conditional contextual visual');
 for(let i=0;i<44;i++)els.next.onclick();
 assert.equal(els.counter.textContent,'45 / 45',topic.id+': finish');
 assert(els.next.disabled,topic.id+': next disabled at last slide');
 for(let i=0;i<44;i++)els.prev.onclick();
 assert.equal(els.counter.textContent,'1 / 45',topic.id+': returned');
 els.slide.events.touchstart({touches:[{clientX:220,clientY:140}]});
 els.slide.events.touchend({changedTouches:[{clientX:60,clientY:140}]});
 assert.equal(els.counter.textContent,'2 / 45',topic.id+': touch');
 keyboard.keydown({target:{tagName:'BODY'},key:'ArrowLeft'});
 assert.equal(els.counter.textContent,'1 / 45',topic.id+': keyboard');
 for(let i=0;i<6;i++)els.next.onclick();
 assert.equal(els.speak.disabled,false,topic.id+': speak button enabled');
 els.speak.onclick();
 assert.equal(spoken.length,1,topic.id+': TTS action');
 assert(/[가-힣]/u.test(spoken[0]),topic.id+': spoken Korean text');
 els.fullscreen.onclick();
 assert(fullscreen,topic.id+': fullscreen');
 for(let i=0;i<18;i++)els.next.onclick();
 assert.equal(els.counter.textContent,'25 / 45',topic.id+': scenario 1 starts at slide 25');
 assert(els.slide.innerHTML.includes('roleplay'),topic.id+': contextual dialogue style');
 assert(els.slide.innerHTML.includes(scenes[topic.id][0].lines[0].ko),topic.id+': specific scene text');
 assert.equal(els.reveal.textContent,'Hiện bản dịch',topic.id+': translation toggle');
 els.speak.onclick();
 assert.equal(spoken.length,2,topic.id+': contextual Korean TTS');
 assert(spoken[1].includes(scenes[topic.id][0].lines[0].ko),topic.id+': contextual TTS content');
 assert.equal(typeof windowEvents.hashchange,'function',topic.id+': hashchange listener');
 location.hash='#'+topic.id+'/33';windowEvents.hashchange();
 assert.equal(els.counter.textContent,'33 / 45',topic.id+': deep link updates same document');
 location.hash='#'+topic.id+'/25';windowEvents.hashchange();
 assert.equal(els.counter.textContent,'25 / 45',topic.id+': deep link back');
 assert.equal(errors.length,0,topic.id+': unexpected alert');
}
console.log('PASS runtime: 8 topics, slide nav, swipe, keyboard, speech, fullscreen, source links');
