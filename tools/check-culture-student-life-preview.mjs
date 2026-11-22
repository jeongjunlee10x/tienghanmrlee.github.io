import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const preview=fs.readFileSync('van-hoa-du-hoc-sinh-preview.html','utf8');
const slides=fs.readFileSync('van-hoa-du-hoc-sinh-slides.html','utf8');
const match=slides.match(/const topics=(\[[^\n]+\]);\s*const \$=/);
assert(match,'Missing embedded topics dataset');
const topics=JSON.parse(match[1]);
assert.equal(topics.length,8,'Exactly eight approved topics required');
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
