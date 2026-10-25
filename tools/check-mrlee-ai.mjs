/* Offline MR LEE AI tutor contract test; no external AI server required. */
import fs from 'node:fs';
import { SC_LESSONS } from '../mrlee-sc-lesson-data.js';
import { ADVANCED_LESSONS } from '../mrlee-advanced-lesson-data.js';
const lessons=[...SC_LESSONS,...ADVANCED_LESSONS];
const counts={lessons:lessons.length,vocabulary:0,grammar:0};
const unique=new Set(),errors=[];
for(const x of lessons){
 const key=x.cap+'/'+x.bai;
 if(unique.has(key))errors.push('DUPLICATE LESSON '+key);unique.add(key);
 if(!Number.isInteger(x.cap)||x.cap<1||x.cap>6||!Number.isInteger(x.bai)||x.bai<1||x.bai>15)errors.push('INVALID COURSE '+key);
 counts.vocabulary+=(x.vocab||[]).filter(row=>Array.isArray(row)&&row[0]&&row[1]).length;
 counts.grammar+=(x.grammar||[]).filter(row=>row.formula&&row.meaning).length;
}
if(counts.lessons!==90||unique.size!==90||counts.vocabulary<5000||counts.grammar<300)errors.push('INCOMPLETE LESSON INDEX');
const html=fs.readFileSync('ai-tro-ly.html','utf8');
const source=fs.readFileSync('mrlee-assistant.js','utf8');
for(const file of ['mrlee-assistant.css','mrlee-ai-config.js','mrlee-assistant.js','mrlee-sc-lesson-data.js','mrlee-advanced-lesson-data.js'])if(!fs.existsSync(file))errors.push('MISSING AI FILE '+file);
for(const name of ['mrlee-assistant.css','mrlee-ai-config.js','mrlee-assistant.js'])if(!html.includes(name))errors.push('AI HTML NOT WIRED '+name);
for(const marker of ["import { SC_LESSONS }","import { ADVANCED_LESSONS }","buildLessonIndex()","safeLocalUrl","textContent"])if(!source.includes(marker))errors.push('MISSING AI PROTECTION '+marker);
if(source.includes("fetch('mrlee-knowledge.json'"))errors.push('STILL FETCHES REMOVED KNOWLEDGE FILE');
console.log('MR LEE AI: '+counts.lessons+' lessons; '+counts.vocabulary+' vocabulary; '+counts.grammar+' grammar entries.');
if(errors.length){errors.forEach(x=>console.error('FAIL '+x));process.exitCode=1}
else console.log('PASS: The study assistant has a real offline lesson index, source links and local styles.');
