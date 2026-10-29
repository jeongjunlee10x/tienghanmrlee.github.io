import fs from 'node:fs';import assert from 'node:assert/strict';
const root=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const js=fs.readFileSync('assets/mrlee-dual-ui/theme.js','utf8');
const css=fs.readFileSync('assets/mrlee-dual-ui/entry-picker.css','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.match(js,/VISIT_KEY='MRLEE\.THEME\.ENTRY\.V1'/,'Session marker must be tab-scoped');
assert.match(js,/sessionStorage\.getItem\(VISIT_KEY\)/,'Selection must be remembered for this tab');
assert.match(js,/sessionStorage\.setItem\(VISIT_KEY,chosen\)/,'Choice should persist after clicking');
assert.match(js,/dialog\.showModal\(\)/,'Must use accessible native modal');
assert.match(js,/dialog\.addEventListener\('cancel',e=>e\.preventDefault\(\)\)/);
assert.match(js,/path!=='index\.html'/,'Prompt only on website landing, not while taking exams');
assert.match(js,/function run\(\)\{primaryNav\(\);decorate\(\);portal\(\);update\(theme\);entryPicker\(\)\}/);
assert.doesNotMatch(js,/function controls\(/,'Legacy floating theme selector must not be constructed');
assert.doesNotMatch(js,/nav\.className='mrlee-theme-switch'/);
assert.match(css,/\.mrlee-theme-switch\{display:none!important\}/,'No top page switchers');
assert.match(css,/dialog\.mrlee-theme-entry\[open\]/);
assert.match(css,/@media\(max-width:650px\)/);
for(const name of ['01-trang-chu-fresh.webp','01-trang-chu-future.webp']){
 assert.ok(fs.statSync('assets/images/heroes/'+name).size>100000,'Missing real approved hero preview '+name);
 assert.ok(css.includes(name),'Modal missing theme-specific preview photo '+name);
}
let themed=0,old=[];
for(const file of root){
 const content=fs.readFileSync(file,'utf8');
 if(content.includes('assets/mrlee-dual-ui/theme.js?v=')){
  themed++;
  if(!content.includes('assets/mrlee-dual-ui/theme.js?v=20261029-entry1'))old.push(file);
 }
}
assert.ok(themed>=45,'Website-wide selector change must cover all connected pages, saw '+themed);
assert.deepEqual(old,[],'Pages still use cached old header theme script: '+old.join(', '));
assert.match(html,/assets\/mrlee-dual-ui\/theme\.js\?v=20261029-entry1/);
console.log('PASS theme chooser: '+themed+' HTML routes use current shared runtime; modal once per tab, no duplicate header buttons, both image previews and mobile layouts');
