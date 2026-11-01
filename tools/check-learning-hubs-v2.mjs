import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const config=[
  ['hoc-tieng-han.html','learning',6,'destination-grid'],
  ['giao-tiep-phong-van.html','talk',4,'destination-grid'],
  ['kiem-tra-topik.html','topik',5,'mrlee-topik-grid']
];
const css=fs.readFileSync('assets/mrlee-ui2027/learning-hubs-v2.css','utf8');
const js=fs.readFileSync('assets/mrlee-ui2027/learning-hubs-v2.js','utf8');
assert(css.includes('html[data-mrlee-theme="future"][data-mrlee-hub-v2]'));
assert(css.includes('html[data-mrlee-hub-v2="workbook"]'));
assert(css.includes('data-mrlee-hub-expanded="true"'));
assert(css.includes('@media(max-width:680px)'));
assert(css.includes('.mr27-subhero')&&css.includes('.mr27-cards'));
assert(js.includes('MRLEE.THEME.ENTRY.V1')&&js.includes('root.dataset.mrleeHubExpanded'));
assert(js.includes("root.dataset.mrleeV4Folded='false'"),'old V5 fold must not hide new UI');
for (const [file,topic,cardCount,legacy] of config){
  const html=fs.readFileSync(file,'utf8');
  assert(html.includes('data-mrlee-hub-v2="'+topic+'"'),file+' root');
  assert(html.includes('assets/mrlee-ui2027/learning-hubs-v2.css?v=20261102-p5'));
  assert(html.includes('assets/mrlee-ui2027/learning-hubs-v2.js?v=20261101-subv2'));
  assert(html.includes('class="'+legacy+'"'),file+' original accessible panel preserved');
  assert(html.includes('assets/mrlee-dual-ui/theme.js'),file+' dual theme preserved');
  assert(html.includes('assets/branding/logo-mrlee.png'),file+' logo preserved');
  const begin=html.indexOf('<section class="mrlee27-subhub"');
  const end=html.indexOf('</section>',begin);
  assert(begin>=0&&end>begin,file+' new section');
  const hub=html.slice(begin,end+10);
  const cards=[...hub.matchAll(/class="mr27-item" href="([^"]+)"/g)];
  assert.equal(cards.length,cardCount,file+' card count');
  assert.equal(new Set(cards.map(c=>c[1])).size,cardCount,file+' distinct routes');
  assert(hub.includes('id="mrlee27HubExpand"'),file+' expand');
  assert(hub.includes('id="mrlee27HubTheme"'),file+' theme');
  const imgRefs=[...hub.matchAll(/<img src="(assets\/v306\/images\/[^"]+)"/g)].map(x=>x[1]);
  assert.equal(imgRefs.length,cardCount+1,file+' number of images');
  assert.equal(new Set(imgRefs).size,imgRefs.length,file+' distinct image paths');
  for(const dest of cards.map(c=>c[1])){
    const filePath=dest.split('?')[0].split('#')[0];
    assert(fs.existsSync(filePath),file+' dead route '+filePath);
  }
  for(const imagePath of imgRefs){
    assert(fs.existsSync(imagePath),file+' missing photo '+imagePath);
    const data=fs.readFileSync(imagePath);
    assert.equal(data.toString('ascii',0,4),'RIFF',imagePath);
    assert.equal(data.toString('ascii',8,12),'WEBP',imagePath);
  }
  console.log('PASS: '+file+' / '+cardCount+' working native routes / '+imgRefs.length+' verified photos');
}
const work=fs.readFileSync('mrlee-bai-tap-pro.html','utf8');
assert(work.includes('data-mrlee-hub-v2="workbook"'));
assert(work.includes('class="mrlee27-workintro"'));
assert(work.includes('class="mrlee27-brandline"'));
for(const id of ['workLevel','workLesson','workProfile','workSummary','workList','workGame','backToLesson']){
  assert(work.includes('id="'+id+'"'),'Workbook must preserve runtime control '+id);
}
assert(work.includes('mrlee-bai-tap-pro.js'),'Workbook native quiz runtime preserved');
assert(work.includes('auth-guard.js'),'Workbook auth gate preserved');
assert(work.includes('mrlee-score-v12/widget.js'),'Workbook score integration preserved');
for(const p of ['assets/mrlee-ui2027/learning-hubs-v2.js','assets/mrlee-ui2027/culture-landing-v2.js']){
 const v=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
 assert.equal(v.status,0,p+' syntax '+v.stderr);
}
console.log('PASS: Workbook scores, controls, auth, 15 exercise sets; shared V2 CSS/JS syntax.');

const culture=fs.readFileSync('van-hoa-han-quoc.html','utf8');
const cultureCss=fs.readFileSync('assets/mrlee-ui2027/culture-landing-v2.css','utf8');
const cultureScript=fs.readFileSync('assets/mrlee-ui2027/culture-landing-v2.js','utf8');
assert(culture.includes('data-mrlee-culture-v2="1"'));
assert(culture.includes('assets/mrlee-ui2027/culture-landing-v2.css'));
assert(culture.includes('assets/mrlee-ui2027/culture-landing-v2.js'));
assert(cultureScript.includes("root.dataset.mrleeV4Folded='false'"));
assert(culture.includes('mr27-culture-visual'));
assert(culture.includes('id="topics"')&&culture.includes('data-filter="culture"')&&culture.includes('data-filter="life"'));
assert(culture.includes('mrlee-culture-v13.js')&&culture.includes('mrlee-culture-hd-v19.js'),'preserve 22-topic runtime and images');
assert(!culture.includes('3 ảnh minh họa AI'),'outdated photo count');
assert(cultureCss.includes('html[data-mrlee-culture-v2="1"] #topics.cards'));
assert(cultureCss.includes('@media(max-width:500px)'));
assert(fs.existsSync('assets/v306/images/culture.webp'),'culture banner asset must exist');
console.log('PASS: culture landing split hero; topic search/filter, 22-topic runtime preserved; outdated AI-count corrected.');

