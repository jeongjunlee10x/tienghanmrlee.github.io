/* MR LEE 2027 — current unified UI release gate.
 * Supersedes the pre-2027 Smart Shell V3 contract. The old renderer is not
 * loaded by homepage or Admin; requiring it would be a false release failure.
 * All checks are static; real browser geometry is tested in GitHub Actions.
 */
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const suites=[
 ['Current 10-page source and image audit','tools/check-ui-phase5.mjs'],
 ['Home V2: two theme artworks and eight modules','tools/check-home-rebuild-v2.mjs'],
 ['Learning V2: native routes, protected Workbook, Culture','tools/check-learning-hubs-v2.mjs'],
 ['V3: map, admissions, student and Admin controls','tools/check-workspaces-v3.mjs']
];
let failed=0;
for(const [label,filename] of suites){
 if(!fs.existsSync(filename)){console.error('FAIL '+label+': missing '+filename);failed++;continue}
 const r=spawnSync(process.execPath,[filename],{encoding:'utf8',maxBuffer:2*1024*1024});
 if(r.status!==0){console.error('FAIL '+label+'\n'+(r.stderr||r.stdout));failed++}
 else console.log('PASS '+label+'\n'+r.stdout.trim().split('\n').slice(-1)[0]);
}
if(failed){console.error('FAILED '+failed+'/'+suites.length+' active UI suites');process.exit(1)}
console.log('PASS MR LEE UI 2027: four active suites; Smart V3 legacy injector is not required.');
