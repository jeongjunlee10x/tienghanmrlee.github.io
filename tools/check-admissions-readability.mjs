import fs from 'node:fs';import assert from 'node:assert/strict';
const html=fs.readFileSync('tuyen-sinh.html','utf8');
const css=fs.readFileSync('assets/branding/admissions-readable-v2.css','utf8');
const intake=fs.readFileSync('assets/branding/admissions-intake.js','utf8');
const interview=fs.readFileSync('assets/branding/interview-question-list-fix.css','utf8');
assert.ok(html.indexOf('admissions-readable-v2.css')>html.indexOf('assets/mrlee-dual-ui/theme.css'),'Admissions CSS must load after universal theme styles');
for(const needle of ['.ts-header .ts-nav a','.ts-contact-copy h2','.ts-form-card form label',
 '.ts-form-card :is(input:not([type=checkbox]),textarea,select)',
 '.ts-contact-section .ts-check-consent','.ts-intake-options span',
 '.ts-contact-section .ts-btn-submit','.ts-v15-float .ts-float-cta']){
 assert.ok(css.includes(needle),'Missing scoped readability repair: '+needle);
}
assert.match(css,/\-webkit-text-fill-color:#17385c!important/,'Chrome text input must not remain pale');
assert.match(css,/color-scheme:light!important/,'Form must use light native selects even under Future theme');
assert.match(intake,/tsIntakeOverlay/,'Admissions opening popup must remain active');
assert.match(intake,/university-map\/universities\.json/,'School suggestions must come from published school catalog');
assert.match(intake,/KHÔNG phải xếp hạng trường/,'Suggestions must not pretend to determine admissions eligibility');
assert.match(interview,/\.question-list .question-link/,'Prior interview list readability repair must remain present');
assert.match(interview,/\.question-link \.ko-mini/,'Korean interview questions remain two-line readable');
console.log('PASS admissions: high-contrast left headline, labels, inputs, menu, school orientation popup and interview guard');
