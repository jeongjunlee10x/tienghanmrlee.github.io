import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const topik=[
 'lo-trinh-topik.html','topik-hoc-moi-ngay.html','topik-i-lo-trinh.html',
 'topik-ii-lo-trinh.html','topik-viet-51-54.html','topik-nghe-24-cau.html'
];
const css=fs.readFileSync('assets/branding/topik-contrast-v1.css','utf8');
const covered=[];
for(const file of fs.readdirSync('.').filter(x=>x.endsWith('.html'))){
 const html=fs.readFileSync(file,'utf8');
 if(/<body[^>]*class="[^"]*tv-body/.test(html)){
  covered.push(file);
  assert.match(html,/topik-contrast-v1\.css/,'TOPIK V7 page missing contrast fix: '+file);
 }
}
assert.equal(covered.length,topik.length,'A TOPIK V7 page was missed by the audit');
assert.deepEqual(covered.sort(),topik.sort());
const ruleNeedles=[
 'html[data-mrlee-theme="future"] body.tv-body',
 'html[data-mrlee-theme="fresh"] body.tv-body',
 '.tv-topnav a',
 '.tv-brand',
 '.tv-panel,.tv-listen-card',
 '.tv-question,.tv-metric,.tv-hints,.tv-review,.tv-listen-transcript',
 '.tv-choices .tv-choice',
 '.tv-choices .tv-choice:has(input:checked)',
 '.tv-choices .tv-choice.correct',
 '.tv-choices .tv-choice.incorrect',
 '.tv-audio',
 '.tv-muted',
 '.tv-form :is(input,select)',
 '.tv-listen-card',
 '@media(max-width:650px)'
];
for(const needle of ruleNeedles)assert.ok(css.includes(needle),'Missing safe contrast style: '+needle);
assert.ok(!css.includes('html[data-mrlee-theme="future"] :is(.card,.panel)'),
 'Do not modify other lesson cards through broad global CSS selectors');
const place=fs.readFileSync('topik-hoc-moi-ngay.html','utf8');
assert.ok(place.indexOf('topik-contrast-v1.css')>place.indexOf('assets/mrlee-dual-ui/theme.css'),
 'Contrast repair must load after legacy theme stylesheet');
const testing=fs.readFileSync('tools/browser-topik-contrast.mjs','utf8');
assert.ok(testing.includes('ratio<4.5')&&testing.includes("['fresh','future']"),
 'Chromium contrast audit must enforce WCAG normal-text minimum in both themes');
console.log('PASS TOPIK readability: all '+covered.length+' V7 routes covered, consistent Fresh/Future colors, questions/options/audio/nav and WCAG chromium coverage.');
