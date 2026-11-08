/* Pure browser TTS cleaning regression, without a real microphone or audio playback. */
import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
import assert from 'node:assert/strict';

const player=readFileSync('mrlee-listening-plus.js','utf8');
const window={};
const document={readyState:'loading',addEventListener(){}};
new Script(player,{filename:'mrlee-listening-plus.js'}).runInContext(createContext({
 window,document,console
}));
const clean=window.MRLEE_AUDIO_PLUS?.cleanSpokenText;
assert.equal(typeof clean,'function');
assert.equal(clean('여자: 안녕하세요. 남자: 네, 안녕하세요.'),'안녕하세요. 네, 안녕하세요.');
assert.equal(clean('남성： 감사합니다. 여성: 천만에요.'),'감사합니다. 천만에요.');
assert.equal(clean('저 남자는 선생님입니다.'),'저 남자는 선생님입니다.');
assert.equal(clean('남자: 어디에 갑니까?\n여자: 학교에 갑니다.'),'어디에 갑니까? 학교에 갑니다.');
const img=readFileSync('assets/branding/media-quality-v3.js','utf8');
new Script(img,{filename:'assets/branding/media-quality-v3.js'});
assert.match(img,/mr27-art-fresh/);
assert.match(img,/mr27-art-future/);
console.log('PASS MR LEE media browser audio role cleaning and hero priority scripts');
