/* MR LEE Workbook V2 — strict 10,000 item QA.
 * Reject duplicates, malformed options, invalid lesson/cap, and vocabulary
 * or grammatical references not present in the CURRENT lesson.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const norm=x=>String(x??'').normalize('NFC').replace(/\s+/g,' ').trim();
function source(file){
 const s=read(file);const start=s.indexOf(' = ['),end=s.lastIndexOf('];');
 assert(start>=0&&end>start,'curriculum source not found '+file);
 return JSON.parse(s.slice(start+3,end+1));
}
const lessons=[...source('mrlee-sc-lesson-data.js'),...source('mrlee-advanced-lesson-data.js')];
const byId=new Map(lessons.map(l=>[l.cap+'-'+l.bai,l]));
assert.equal(byId.size,90,'exactly 90 curriculum lessons');
const allPrompts=new Set(),allIDs=new Set(),countTypes={},counts={},idsByLesson={};
let total=0;
for(let cap=1;cap<=6;cap++){
 const bank=JSON.parse(read('assets/workbook-v2/bank-cap-'+cap+'.json'));
 assert.equal(bank.version,'WB10K-20261105');
 assert.equal(Object.keys(bank.lessons).length,15);
 let levelCount=0;
 for(let bai=1;bai<=15;bai++){
  const key=cap+'-'+bai,l=byId.get(key);
  assert(l,'source lesson '+key);
  const items=bank.lessons[String(bai)];
  const target=(cap===1&&bai<=10)?112:111;
  assert.equal(items?.length,target,'count '+key);
  const viByKo=new Map();
  for(const v of (l.vocab||[])){const ko=norm(v[0]),vi=norm(v[1]);if(!viByKo.has(ko))viByKo.set(ko,vi)}
  const koSet=new Set(viByKo.keys()),viSet=new Set(viByKo.values());
  const formulas=new Set((l.grammar||[]).map(g=>norm(g.formula)));
  const concepts=new Set();
  for(const q of items){
   assert.equal(q.scope,cap+'-'+String(bai).padStart(2,'0'),'scope '+key);
   assert(!allIDs.has(q.id),'duplicate ID '+q.id);allIDs.add(q.id);
   const question=norm(q.prompt);
   assert(question.length>7&&question.length<250,'question size '+q.id);
   assert(!allPrompts.has(question),'duplicate full prompt '+q.id+' '+question);
   allPrompts.add(question);
   assert(Array.isArray(q.options)&&q.options.length===4,'4 choices '+q.id);
   assert.equal(new Set(q.options.map(norm)).size,4,'distinct choices '+q.id);
   assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,'correct answer '+q.id);
   assert(q.explain?.length>4,'explanation '+q.id);
   assert(Array.isArray(q.refs)&&q.refs.length>=1&&q.refs.length<=2,'concepts '+q.id);
   for(const ref of q.refs)assert(koSet.has(ref)||formulas.has(ref),'future or out-of-lesson ref '+key+' '+ref);
   const right=q.options[q.answer];
   if(q.type==='word-ko-vi'){
    assert.equal(q.refs.length,1);
    assert.equal(right,viByKo.get(q.refs[0]),'single translation '+q.id);
    for(const o of q.options)assert(viSet.has(o),'out of lesson Vietnamese option '+q.id+' '+o);
   }else if(q.type==='word-vi-ko'){
    assert.equal(q.refs.length,1);
    assert.equal(q.prompt.includes(viByKo.get(q.refs[0])),true,'Vietnamese stem '+q.id);
    assert.equal(right,q.refs[0],'single Korean answer '+q.id);
    for(const o of q.options)assert(koSet.has(o),'out of lesson Korean option '+q.id+' '+o);
   }else if(q.type==='pair-ko-vi'){
    assert.equal(q.refs.length,2);
    assert.notEqual(q.refs[0],q.refs[1],'same word twice '+q.id);
    assert.equal(right,q.refs.map(w=>viByKo.get(w)).join(' · '),'pair translation '+q.id);
    for(const option of q.options){
     const parts=option.split(' · ');assert.equal(parts.length,2,'pair delimiter '+q.id);
     for(const v of parts)assert(viSet.has(v),'out of lesson pair VI option '+q.id+' '+v);
    }
   }else if(q.type==='pair-vi-ko'){
    assert.equal(q.refs.length,2);
    assert.notEqual(q.refs[0],q.refs[1],'same word twice '+q.id);
    assert.equal(right,q.refs.join(' · '),'pair Korean answer '+q.id);
    for(const option of q.options){
     const parts=option.split(' · ');assert.equal(parts.length,2,'pair delimiter '+q.id);
     for(const v of parts)assert(koSet.has(v),'out of lesson pair KO option '+q.id+' '+v);
    }
   }else if(q.type==='grammar'){
    assert.equal(q.refs.length,1);
    assert.equal(right,q.refs[0],'grammar answer '+q.id);
    for(const o of q.options)assert(formulas.has(o),'out-of-lesson grammar option '+q.id);
   }else throw new Error('unknown task type '+q.type);
   concepts.add(q.refs.join('|'));countTypes[q.type]=(countTypes[q.type]||0)+1;
  }
  assert(concepts.size>=75,'too few unique concept combinations '+key);
  levelCount+=items.length;total+=items.length;idsByLesson[key]=items.length;
 }
 counts[cap]=levelCount;
}
assert.equal(total,10000,'bank has 10,000 distinct items');
assert.equal(allPrompts.size,10000,'bank does not repeat full question prompts');
const manifest=JSON.parse(read('assets/workbook-v2/manifest.json'));
assert.equal(manifest.total,total,'manifest total mismatch');
for(const [level,n] of Object.entries(counts))assert.equal(manifest.levels[level],n);
for(const [type,n] of Object.entries(countTypes))assert.equal(manifest.types[type],n);
const html=read('mrlee-bai-tap-pro.html');
for(const fragment of [
 'id="work10kPanel"','id="wb10kStart"','id="wb10kReset"',
 'id="wb10kGame"','id="wb10kCount"','assets/workbook-v2/practice.js',
 'assets/workbook-v2/practice.css','mrlee-bai-tap-pro.js','mrlee-score-v12/widget.js'
])assert(html.includes(fragment),'missing integration '+fragment);
const js=read('assets/workbook-v2/practice.js');
assert(!/\.award\(|mrlee:practice-finished|score-v12\/widget/i.test(js),'supplemental quiz must not award Spark');
for(const source of ['assets/workbook-v2/practice.js','mrlee-bai-tap-pro.js']){
 const result=spawnSync(process.execPath,['--check',source],{encoding:'utf8'});
 assert.equal(result.status,0,'syntax '+source+' '+result.stderr.slice(0,300));
}
console.log('PASS WB10K:',total,'validated questions,',allPrompts.size,'distinct prompts, 90 scoped lessons, all answer choices from their own lessons; types='+JSON.stringify(countTypes));
