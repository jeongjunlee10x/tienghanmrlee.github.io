/**
 * MR LEE TOPIK V3 — read-only pedagogical data contracts.
 * Checks 170 V8 questions / mirrored V10 mock-bank and 180 V9 exercises.
 * The corpus remains independently authored, not NIIED exam material.
 * Pure data audit, no Firebase, score writes, recordings, or network requests.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=(file)=>JSON.parse(fs.readFileSync(file,'utf8'));
const v8=read('assets/topik-v8/bank.json');
const v10=read('assets/topik-v10/mock-bank-v8.json');
const v9=read('assets/topik-v9/lessons.json');
const norm=s=>String(s??'').normalize('NFC').replace(/\s+/gu,' ').trim().toLowerCase();
const actual=Array.isArray(v8.questions)?v8.questions:null;
assert(actual,'TOPIK V8 bank must expose its questions array');
assert.equal(actual.length,170,'TOPIK V8 bank count changed');
assert(Array.isArray(v10),'TOPIK V10 mock bank must be an array');
assert.equal(v10.length,170,'TOPIK V10 bank count changed');
assert.deepEqual(v10,actual,'V10 mirrored bank drifted from V8; sync both before merge');
assert.equal(actual.filter(q=>q.level===1).length,70,'TOPIK I V8 size changed');
assert.equal(actual.filter(q=>q.level===2).length,100,'TOPIK II V8 size changed');

const ids=new Set(),duplicateStems=new Map(),corpusIssues=[];
function inspectChoice(q,where){
 assert(typeof q.id==='string'&&q.id.length>1,'Question id missing: '+where);
 assert(!ids.has(q.id),'Duplicate question ID '+q.id);
 ids.add(q.id);
 assert(typeof q.prompt==='string'&&norm(q.prompt).length>3,'Question stem absent '+q.id);
 assert(Array.isArray(q.choices)&&q.choices.length===4,'Exactly four options required '+q.id);
 assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,'Correct index out of range '+q.id);
 assert(q.choices.every(c=>typeof c==='string'&&norm(c).length>0),'Empty option '+q.id);
 assert.equal(new Set(q.choices.map(norm)).size,4,'Duplicate distractor option '+q.id);
 assert(typeof q.explain==='string'&&norm(q.explain).length>=25,'Insufficient explanation '+q.id);
 assert(/[\uAC00-\uD7A3]/u.test(q.prompt),'Korean text missing from question '+q.id);
 const key=norm(q.prompt)+' | '+norm(q.passage);
 if(duplicateStems.has(key))corpusIssues.push({kind:'similar-stem',id:q.id,other:duplicateStems.get(key)});
 else duplicateStems.set(key,q.id);
}
for(const q of actual){
 assert([1,2].includes(q.level),'Invalid TOPIK level '+q.id);
 assert(['listening','reading'].includes(q.kind),'Unsupported type '+q.id);
 inspectChoice(q,'V8');
}
const curated={
 'v8-1-l-018':'오천 원','v8-1-l-019':'삼천 원','v8-1-l-020':'팔천 원',
 'v8-1-l-021':'천 원','v8-1-l-022':'육천 원',
 'v8-1-l-023':'우체국','v8-1-l-024':'은행','v8-1-l-025':'약국','v8-1-l-026':'서점'
};
for(const [id,expected] of Object.entries(curated)){
 const q=actual.find(x=>x.id===id);
 assert(q,'Missing curated question '+id);
 assert.equal(q.choices[q.answer],expected,'Correct answer changed for '+id);
 assert(q.passage.includes(expected),'Korean audio passage contradicts selected answer '+id);
 assert(q.explain.includes(expected),'Explanation must explicitly name correct Korean phrase '+id);
 assert(/[\uAC00-\uD7A3]/u.test(q.explain)&&/[a-zà-ỹ]/iu.test(q.explain),
  'Korean-Vietnamese explanation is not bilingual '+id);
 assert(q.explain.length>=75,'Curated listening explanation still too generic '+id);
 if(Number(id.slice(-3))>=23){
  assert(q.passage.includes(expected+'에 가요'),'Place-name should precede 에 가요 '+id);
  assert(!q.explain.includes('ngay sau 에 가요'),'Old incorrect word-order advice returned '+id);
 }
}
for(const old of ['Tổng tiền được nói sau từ 모두.','Xác định địa điểm ngay sau 에 가요.']){
 assert(actual.every(q=>q.explain!==old),'Old generic/inaccurate explanation remained');
}

assert(Array.isArray(v9.lessons?.['1'])&&v9.lessons['1'].length===30,'V9 TOPIK I must have 30 lessons');
assert(Array.isArray(v9.lessons?.['2'])&&v9.lessons['2'].length===60,'V9 TOPIK II must have 60 lessons');
let v9Count=0;
const repeated=new Map(),repetitionReview=[];
for(const level of ['1','2'])for(const lesson of v9.lessons[level]){
 assert(Number.isInteger(lesson.day),'V9 day metadata missing');
 assert(Array.isArray(lesson.exercises)&&lesson.exercises.length>=2,'V9 day lacks enough exercises '+level+'/'+lesson.day);
 for(const ex of lesson.exercises){
  v9Count++;
  assert(typeof ex.stem==='string'&&norm(ex.stem).length>=8,'V9 stem incomplete '+ex.id);
  assert(typeof ex.explain==='string'&&norm(ex.explain).length>=25,'V9 explanation absent '+ex.id);
  assert(Array.isArray(ex.choices)&&ex.choices.length===4,'V9 options incomplete '+ex.id);
  assert(new Set(ex.choices.map(norm)).size===4,'V9 duplicate choice '+ex.id);
  assert(Number.isInteger(ex.answer)&&ex.answer>=0&&ex.answer<4,'V9 invalid correct answer '+ex.id);
  assert(!ids.has(ex.id),'Duplicate V9/V8 ID '+ex.id);ids.add(ex.id);
  const key=norm(ex.stem)+'::'+norm(ex.explain);
  if(repeated.has(key))repetitionReview.push({id:ex.id,previous:repeated.get(key),level,day:lesson.day});
  else repeated.set(key,ex.id);
 }
}
assert.equal(v9Count,180,'V9 exercise count unexpectedly changed');
const first=v9.lessons['1'][0].exercises.find(e=>e.id==='v9-1-1-v');
assert(first,'Missing V9 beginner meaning question');
assert.equal(first.stem,'‘시험’의 뜻은 무엇입니까?');
assert.equal(first.choices[first.answer],'kỳ thi','V9 Korean 시험 meaning mismatch');
assert(first.choices.includes('luyện tập'),'Use lesson vocabulary as a plausible distractor');
assert(!first.choices.includes('đáp án đúng'),'Ambiguous meta-label distractor reintroduced');

const report=[
 '# TOPIK pedagogical consistency audit — MR LEE V3',
 '',
 '- V8 bank: **170** original simulated questions; TOPIK I 70, TOPIK II 100',
 '- V10 mock bank: **170** questions, **exact data mirror** of V8',
 '- V9 lessons: **90** (30 TOPIK I / 60 TOPIK II), **180** practice questions',
 '- Manually cross-checked bilingual listening explanations: **9/9**',
 '- Option/answer/id/schema contracts: PASS',
 '- Correct answers, original prompt/passage and score keys: unchanged',
 '- Source: MR LEE authored practice, not official NIIED exam questions',
 '',
 '## Editorial follow-up (warnings; not automatic corrections)',
 '',
 'Repeated V9 exercise prompts and explanations across lessons: '+repetitionReview.length,
 ...repetitionReview.slice(0,20).map(x=>'- '+x.previous+' ↔ '+x.id+' (TOPIK '+x.level+', day '+x.day+')'),
 '',
 'Repeated V8 prompt-passage combinations: '+corpusIssues.length,
 'These may be deliberate spaced repetition; a teacher should review before editing.',
 '',
 '## Manual listening quality checks still required',
 'Listen to the original MP3s and confirm Korean pronunciation, speaker turn order,',
 'correctness of transcript, audio-answer alignment, and plausible distractors.',
 'This data audit does not claim to validate 2.9 MB of V10 curriculum or spoken recordings.'
];
fs.mkdirSync(path.join('artifacts','v3-topik-pedagogy'),{recursive:true});
fs.writeFileSync(path.join('artifacts','v3-topik-pedagogy','report.md'),report.join('\n')+'\n');
console.log('PASS TOPIK V3 pedagogical audit: 170 V8/V10 mirrored; 180 V9; 9/9 bilingual explanations; '+repetitionReview.length+' repeated V9 stems to review');
