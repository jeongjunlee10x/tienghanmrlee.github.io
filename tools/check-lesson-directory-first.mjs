/* MR LEE - first-screen lesson-directory source regression.
 * No Firebase writes; checks 90 genuine native lessons and removal of
 * redundant marketing panels only on hoc-theo-bai.html.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const html=read('hoc-theo-bai.html');
const layout=read('assets/branding/lesson-directory-first-v1.css');
const typography=read('assets/branding/lesson-typography-v2.css');
const theme=read('assets/mrlee-dual-ui/theme.js');
const experience=read('assets/mrlee-v2/experience.js');
const lessonJS=read('mrlee-lesson-page.js');
const bank=read('mrlee-roadmap-bank.js');

const at=s=>html.indexOf(s);
const start=at('<main class="mr-new-shell" id="mrleeLessonDirectory">');
const heading=at('class="mr-lesson-directory-head"');
const grid=at('id="lessonGrid"');
const detail=at('id="lessonContent"');
assert(start>=0&&start<heading&&heading<grid&&grid<detail,
 'Lesson title, level selector and real 15-lesson grid must come first');
for(const id of ['lessonTitle','lessonIntro','levelButtons','lessonCards','lessonGrid',
 'lessonContent','lessonGrammar','lessonVocab','lessonSpeak','lessonWorkbook',
 'lessonSpeakingLink','lessonOldLink','lessonNextLesson','lessonReturn']){
 assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,
  'Native lesson control missing or duplicated: '+id);
}
assert(!html.includes('class="section-hero"'),'Redundant full-size lesson banner has returned');
assert(!html.includes('class="breadcrumbs"'),'Duplicate breadcrumb occupies the lesson viewport');
assert(html.includes('lesson-directory-first-v1.css?v=20261104-first-v1'),
 'Direct grid CSS missing or stale');
assert(html.includes('theme.js?v=20261104-lesson-first-v1'),'Theme script cache is stale');
assert(html.includes('mrlee-lesson-page.js?v=20261104-speaking-v3'),
 'Lesson renderer cache is stale');
assert(theme.includes("if(path==='hoc-theo-bai.html')"),
 'Theme JS must skip duplicate megamenu, portal and decoration on lesson directory');
assert(experience.includes("if(page==='hoc-theo-bai.html')return;"),
 'Promotional experience JS must not reinsert large banner on lesson directory');
assert(html.includes('lesson-typography-v2.css?v=20261104-font-v2'),
 'Lesson font repair stylesheet must load on real lesson pages');
for(const key of ['--lesson-vi-font','--lesson-ko-font','Malgun Gothic',
 'word-break:keep-all','mr-sc-grammar-card','mr-sc-vocab-word',
 '#lessonSpeak .mr-new-korean','data-mrlee-theme="future"']){
 assert(typography.includes(key),'Korean/Vietnamese typography repair missing '+key);
}
assert(lessonJS.includes('function lessonExampleMarkup(raw)') &&
 lessonJS.includes('class="mr-sc-formula" lang="ko"') &&
 lessonJS.includes('lessonExampleMarkup(g.example)'),
 'Grammar formula/example should be marked as Korean without changing text');
assert(lessonJS.includes("currentPool.map(u=>"),'Actual course links must still use real bank');
const listeningJS=read('mrlee-listening-plus.js');
const speakingCSS=read('assets/branding/lesson-speaking-v3.css');
assert(html.includes('lesson-speaking-v3.css?v=20261104-speaking-v3'),
 'New speaking stylesheet not loaded');
assert(html.includes('mrlee-listening-plus.js?v=20261104-speaking-v3'),
 'Listening enhancer cache still outdated');
assert(listeningJS.includes("audio.closest('[data-no-audio-plus]')"),
 'Global audio enhancer still duplicates speaking player controls');
for(const selector of ['mr-v5-speaking-card','mr-v5-sentence-ko','mr-v5-sentence-vi',
 'mr-v5-speak-tools','mr-v5-audio-main','mr-v5-actions','data-no-audio-plus','data-no-tts']){
 assert(lessonJS.includes(selector),'Missing new speaking markup: '+selector);
}
assert(speakingCSS.includes('#lessonSpeak .mr-v5-speaking-card'),
 'Dedicated speaking layout styles missing');
assert(speakingCSS.includes('#lessonSpeak .ml-audio-bar'),
 'Cached old toolbar may not be hidden');
assert(lessonJS.includes('hoc-theo-bai.html?cap=${cap}&bai=${u.number}'),
 'Dynamic lesson card must link to selected level and lesson');
assert(lessonJS.includes("renderGrammar(d);renderVocab(d);renderSpeaking(d,samples);renderWorkbook(d,units);"),
 'All language/voice/quiz functions must remain linked');

const marker='export const ROADMAP_UNITS = ';
const i=bank.indexOf(marker);
assert(i>=0,'Missing canonical lesson bank');
const begin=bank.indexOf('[',i+marker.length);
const end=bank.indexOf('];',begin);
assert(begin>=0&&end>begin,'Missing canonical unit data');
const units=JSON.parse(bank.slice(begin,end+1));
assert.equal(units.length,90,'Six-level curriculum must keep 90 lessons');
for(let cap=1;cap<=6;cap++){
 const num=units.filter(u=>u.level===cap).map(u=>u.number);
 assert.deepEqual(num,Array.from({length:15},(_,i)=>i+1),
  'Missing or reordered lessons for level '+cap);
}
for(const selector of [
 '#mrleeLessonDirectory #lessonCards',
 '#mrleeLessonDirectory #lessonGrid',
 'grid-template-columns:repeat(5,minmax(0,1fr))',
 'grid-template-columns:repeat(2,minmax(0,1fr))',
 '[data-mrlee-theme="future"]',
 '#mrleeLessonDirectory #lessonCards.mr-new-hidden']){
 assert(layout.includes(selector),'Missing lesson-first CSS contract: '+selector);
}
for(const f of ['assets/mrlee-dual-ui/theme.js','assets/mrlee-v2/experience.js',
 'mrlee-lesson-page.js']){
 const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});
 assert.equal(r.status,0,'JS syntax error '+f+' '+r.stderr);
}
console.log('PASS: 15 lessons directly beneath header, 6 x 15 routes, no duplicate hero/menu; Fresh/Future and all exercise controls preserved.');
