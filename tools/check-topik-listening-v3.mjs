/** Offline TOPIK 24 MP3 + source contract; no synthetic audio replaces a missing file. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const html=fs.readFileSync('topik-nghe-24-cau.html','utf8');
const cards=[...html.matchAll(/<article class="tv-listen-card" data-level="([12])" data-id="([^"]+)">([\s\S]*?)<\/article>/g)];
assert.equal(cards.length,24,'Expected exactly 24 listening cards');
const seenIds=new Set(), seenSources=new Set(), count={1:0,2:0};
for(const [_,level,id,card] of cards){
 count[level]++;
 assert(!seenIds.has(id),'Duplicate card ID '+id);seenIds.add(id);
 assert(new RegExp('^'+level+'-listening-([1-9]|1[012])$').test(id),'Mismatched listening level '+id);
 const source=card.match(/<audio\s[^>]*\bsrc="([^"]+\.mp3)"/)?.[1];
 assert(source&&source.startsWith('MRLEE_AUDIO/03_TOPIK/TOPIK_'+level+'/CO_BAN/'),'Wrong MP3 level for '+id);
 assert(!seenSources.has(source),'Duplicate audio in '+id);seenSources.add(source);
 assert(!source.includes('..')&&!source.includes('%'),'Unsafe audio path '+source);
 const file=path.resolve(source);
 assert(file.startsWith(process.cwd()+path.sep)&&fs.existsSync(file),'Missing audio file '+source);
 assert(fs.statSync(file).size>1000,'Suspiciously short MP3 '+source);
 assert(/<p class="tv-listen-q" lang="ko">[^<]*[가-힣]/.test(card),'Korean question missing '+id);
 assert(/<div lang="ko" class="tv-listen-transcript" hidden>[^<]*[가-힣]/.test(card),'Korean transcript missing '+id);
 assert((card.match(/data-speed="/g)||[]).length===2,'Expected both 1x and 0.8x controls '+id);
 assert(card.includes('data-speed="1"')&&card.includes('data-speed="0.8"'),'Wrong speed control '+id);
 assert(card.includes('data-reviewed'),'Local review control missing '+id);
}
assert.deepEqual(count,{1:12,2:12});
assert(html.includes('class="tv-listen-grid" data-no-audio-plus="1"'),
 'TOPIK speed buttons must not be overwritten by the shared audio enhancer');
assert(html.includes("toggle.setAttribute('aria-expanded',String(!transcript.hidden))"),
 'Transcript toggle must expose expanded state');
assert(html.includes("other.setAttribute('aria-pressed',String(other===b))"),
 'Speed selection must expose pressed state');
assert(html.includes("a.playbackRate=Number(b.dataset.speed)"),
 '0.8x and 1x buttons must set the actual HTMLMediaElement playback rate');
assert(!html.includes('\uFFFD'),'Replacement glyph found in TOPIK listening');
console.log('PASS TOPIK V3: 24 unique cards, 12/12 levels, 24 MP3 files, Korean text, speed 0.8x isolation and accessible state');
