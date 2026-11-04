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
const css=read('assets/branding/contact-native-v5.css');
const home=read('index.html');
const admin=read('admin.html');
execFileSync(process.execPath,['--check','assets/branding/site-logo.js'],{stdio:'pipe'});
assert.match(logo,/loadContactDock\(\)/,'Shared logo loader must initialize contacts');
assert.match(logo,/contact-native-v5\.css/,'Use the native contact menu stylesheet');
assert.match(logo,/mrleeContactNative/,'Other pages must receive the native contact menu');
assert.match(css,/#mrleeContactNative>summary/,'The contact trigger must be visible');
assert.match(home,/id="mrleeContactNative"/,'The homepage must have a native contact trigger before scripts run');
assert.match(home,/href="https:\/\/www\.tiktok\.com\/@hankuc_chemi"/,
 'TikTok should remain in the contact menu');
for(const channel of ['call','zalo','messenger','tiktok','email','kakao']){
 assert.ok(home.includes('data-channel="'+channel+'"'),'Missing contact channel '+channel);
}
assert.match(css,/#mrleeContactNative:not\(\[open\]\)/,'Collapsed native details menu missing');
assert.ok(home.includes('id="contactPanel"'),'Original contact links remain a safe fallback');
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
console.log('MR LEE CONTACT/ADMIN QA: native six-channel trigger, no JS dependency, Admin diagnostics and CSV/date guards, '+scripts.length+' inline scripts parsed.');
