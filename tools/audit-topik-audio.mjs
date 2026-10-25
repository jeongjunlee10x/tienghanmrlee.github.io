/** Check the 24 native TOPIK listening files referenced in the actual HTML.
 * All sound files must exist in the repository and have nontrivial size.
 * Failing track is never silently replaced with synthesized audio.
 */
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),page=fs.readFileSync(path.join(root,'topik-nghe-24-cau.html'),'utf8');
const sources=[...page.matchAll(/<audio\b[^>]*\bsrc="([^"]+\.mp3)"/g)].map(m=>m[1]);
let passed=0,missing=0;
for(const src of sources){
 const target=path.resolve(root,src);
 const safe=target.startsWith(root+path.sep)&&/^MRLEE_AUDIO\/03_TOPIK\/[a-zA-Z0-9_/-]+\.mp3$/.test(src);
 const ok=safe&&fs.existsSync(target)&&fs.statSync(target).isFile()&&fs.statSync(target).size>1000;
 if(ok)passed++;else {missing++;console.error('UNAVAILABLE TOPIK AUDIO '+src)}
}
console.log('MR LEE TOPIK listening audio: '+passed+'/'+sources.length+' verified real MP3; missing '+missing);
if(sources.length!==24||missing)process.exitCode=1;
