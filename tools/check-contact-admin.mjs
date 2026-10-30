/**
 * MR LEE · contact + Admin regression preflight.
 * Runs without credentials or database writes.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const logo=read('assets/branding/site-logo.js');
const js=read('assets/branding/contact-dock.js');
const css=read('assets/branding/contact-dock.css');
const home=read('index.html');
const admin=read('admin.html');
for(const file of ['assets/branding/site-logo.js','assets/branding/contact-dock.js']){
  execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
}
assert.match(logo,/loadContactDock\(\)/,'Shared logo loader must initialize contacts');
assert.match(logo,/contact-dock\.js/);
assert.match(js,/getElementById\('mrleeContactDock'\)/,'Avoid duplicates on pages with legacy dock');
for(const channel of ['call','zalo','messenger','tiktok','email','kakao']){
  assert.ok(js.includes(channel),'Missing channel: '+channel);
}
assert.match(js,/https:\/\/www\.tiktok\.com\/@hankuc_chemi/,'TikTok link must match the provided profile URL');
assert.match(css,/data-channel="tiktok"/,'TikTok contact must have its own icon treatment');
assert.match(home,/href="https:\/\/www\.tiktok\.com\/@hankuc_chemi"/,'TikTok should remain available as a fallback link');
assert.match(css,/#mrleeContactDock\[data-open="true"\]/,'Mobile expanded UI missing');
assert.match(css,/#mrleeContactDock/,'Single six-channel contact dock must remain styled');
assert.ok(!home.includes('id="contactPanel"')&&home.includes('id="contactDialog"'), 'Keep contact form but remove redundant floating contact rail');
assert.match(admin,/id="mrleeAdminHealth"/,'Admin must show account-scoped diagnostics');
assert.match(admin,/function renderAdminHealth\(\)/);
assert.match(admin,/id="mrleeRewardHealth"/,'Reward V2 deploy status must be visible');
assert.match(admin,/function inspectRewardModule\(\)/,'Reward V2 schema must be checked, not assumed');
assert.match(admin,/const DEFAULT_URL='https:\/\/pkxqsboyotlyoizzxizb\.supabase\.co'/,'Admin must point at actual project');
assert.match(admin,/DEFAULT_KEY='sb_publishable_/,'Only public API key is bundled');
assert.match(admin,/function scorePercent\(/,'Protect against divide-by-zero');
assert.match(admin,/new Date\(s.last_activity_at\)\.getTime\(\)>=Date\.now\(\)-7\*86400000/,'7-day active metric must use dates');
assert.ok(admin.includes(String.raw`if(/^[\s\uFEFF]*[=+@-]/.test(t))`),'Spreadsheet formula-prefix protection missing');
const scripts=[...admin.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(m=>!/\bsrc\s*=/.test(m[1]))
  .map(m=>m[2]).filter(s=>s.trim());
for(let i=0;i<scripts.length;i++)new vm.Script(scripts[i],{filename:'admin-inline-'+i+'.js'});
console.log('MR LEE CONTACT/ADMIN QA: six channels including TikTok, contact form without second rail, Fresh/Future dock, Admin diagnostics, date/score/CSV guards, '+scripts.length+' inline scripts parsed.');
