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
assert.match(js,/const modern=html\.matches\(/,'Rebuilt pages must be recognized by shared theme runtime');
assert.match(js,/primaryNav\(\);decorate\(\);portal\(\);update\(theme\);entryPicker\(\)/,'Old pages must retain their legacy navigation fallback');
assert.match(js,/entryPicker\(\);/,'New pages must also open the theme picker');
assert.match(js,/explicitSelection/,'Subpage change-theme shortcut must reopen the selector');
assert.doesNotMatch(js,/function controls\(/,'Legacy floating theme selector must not be constructed');
assert.doesNotMatch(js,/nav\.className='mrlee-theme-switch'/);
assert.match(css,/\.mrlee-theme-switch\{display:none!important\}/,'No top page switchers');
assert.match(css,/dialog\.mrlee-theme-entry\[open\]/);
assert.match(css,/@media\(max-width:650px\)/);
for(const name of ['01-trang-chu-fresh.webp','01-trang-chu-future.webp']){
 assert.ok(fs.statSync('assets/images/heroes/'+name).size>100000,'Missing real approved hero preview '+name);
 assert.ok(css.includes(name),'Modal missing theme-specific preview photo '+name);
}
let themed=0,newVersion=[];
for(const file of root){
 const content=fs.readFileSync(file,'utf8');
 if(!content.includes('assets/mrlee-dual-ui/theme.js?v='))continue;
 themed++;
 if(content.includes('assets/mrlee-dual-ui/theme.js?v=20261102-phase4'))newVersion.push(file);
}
assert.ok(themed>=45,'Shared theme runtime lost pages: '+themed);
for(const file of ['index.html','hoc-tieng-han.html','kiem-tra-topik.html',
 'van-hoa-han-quoc.html','trung-tam-hoc-vien.html','admin.html']){
 assert(newVersion.includes(file),'Rebuilt page still points to stale theme cache: '+file);
}
assert.ok(newVersion.length>=9,'Modern pages must use cache-busted theme.js');
console.log('PASS theme chooser: '+themed+' HTML routes use current shared runtime; modal once per tab, no duplicate header buttons, both image previews and mobile layouts');
