/* Real Chromium QA: lesson typography in Vietnamese + Korean, Fresh and Future.
 * Offline auth fixture is only for visual testing, never a login test.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

fs.mkdirSync('artifacts/lesson-fonts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const checks=[
 {cap:1,bai:1,name:'so-cap-1'},
 {cap:2,bai:1,name:'so-cap-2'},
 {cap:3,bai:1,name:'trung-cap-1'}
];
const themes=['fresh','future'];
const sizes=[['desktop',1440,900],['mobile',390,844]];
let passes=0;
try{
 for(const c of checks)for(const theme of themes)for(const [size,width,height] of sizes){
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  await ctx.addInitScript(value=>{
   try{
    localStorage.setItem('MRLEE.THEME.V1',value);
    sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',value);
   }catch{}
  },theme);
  await ctx.route('**/auth-guard.js',route=>route.fulfill({
   status:200,contentType:'text/javascript',
   body:"document.documentElement.dataset.mrleeAuth='verified';document.addEventListener('DOMContentLoaded',()=>{document.querySelector('#mrlee-auth-hide')?.remove();if(document.body)document.body.style.visibility='visible';},{once:true});"
  }));
  const page=await ctx.newPage();
  try{
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const url=`http://127.0.0.1:8765/hoc-theo-bai.html?cap=${c.cap}&bai=${c.bai}`;
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.querySelector('#lessonContent:not(.mr-new-hidden) .mr-sc-grammar-card .mr-sc-formula')&&
    document.querySelector('#lessonSpeak .mr-new-korean')&&
    document.querySelector('#lessonVocab .mr-sc-vocab-word'),
    null,{timeout:30000});
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForTimeout(500); // allow global audio enhancer mutation observer to settle
   const result=await page.evaluate(()=>{
    const one=s=>document.querySelector(s);
    const style=s=>getComputedStyle(one(s));
    const fg=s=>style(s).color;
    const size=s=>parseFloat(style(s).fontSize);
    const box=s=>{const x=one(s),r=x.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,scroll:x.scrollWidth,client:x.clientWidth}};
    const lang=['.mr-sc-formula','.mr-sc-example-ko','.mr-sc-vocab-word','.mr-new-korean'];
    const koreans=lang.map(sel=>({
      sel,found:!!one(sel),text:one(sel)?.textContent?.slice(0,70)||'',
      font:one(sel)?style(sel).fontFamily:'',
      color:one(sel)?fg(sel):'',fontSize:one(sel)?size(sel):0,
      rect:one(sel)?box(sel):null
    }));
    const panel=one('#lessonContent .mr-new-panel');
    const bad=[...document.querySelectorAll('#lessonContent .mr-sc-grammar-card strong,#lessonContent .mr-sc-vocab-word,#lessonContent .mr-new-korean')]
      .filter(el=>{const st=getComputedStyle(el);return el.scrollWidth>el.clientWidth+3&&
        (st.overflowX==='hidden'||st.textOverflow==='ellipsis')})
      .map(el=>el.textContent?.slice(0,45));
    return {
      theme:document.documentElement.dataset.mrleeTheme,
      panel:panel?getComputedStyle(panel).backgroundColor:'',
      bodyVisible:style('body').visibility!=='hidden',
      korean:koreans,
      vocabCount:document.querySelectorAll('#lessonVocab .mr-sc-vocab-card').length,
      grammarCount:document.querySelectorAll('#lessonGrammar .mr-sc-grammar-card').length,
      speakingCount:document.querySelectorAll('#lessonSpeak .mr-v5-speaking').length,
      speakingCards:[...document.querySelectorAll('#lessonSpeak .mr-v5-speaking-card')].map(card=>{
       const row=card.getBoundingClientRect();
       const sentence=card.querySelector('.mr-v5-sentence')?.getBoundingClientRect();
       const tools=card.querySelector('.mr-v5-speak-tools')?.getBoundingClientRect();
       return {
        width:Math.round(row.width),height:Math.round(row.height),
        isGrid:getComputedStyle(card).display==='grid',
        hasMP3:card.querySelectorAll('audio.mr-v5-audio-main[controls][src]').length===1,
        ttsCount:card.querySelectorAll('button[data-play]').length,
        recordCount:card.querySelectorAll('button[data-record]').length,
        hiddenRecording:card.querySelector('audio[data-audio]')?.hidden===true,
        hasKorean:!!card.querySelector('.mr-v5-sentence-ko[lang="ko"]'),
        hasVietnamese:!!card.querySelector('.mr-v5-sentence-vi[lang="vi"]'),
        duplicateAudioBars:card.querySelectorAll('.ml-audio-bar,.ml-speak-btn').length,
        hasAudioOptout:card.hasAttribute('data-no-audio-plus')&&card.hasAttribute('data-no-tts'),
        columnsSideBySide:tools?.left>=sentence?.right-3,
        contentFits:sentence?.bottom<=row.bottom+2&&tools?.bottom<=row.bottom+2
       };
      }),
      workbookCount:document.querySelectorAll('#lessonWorkbook > a').length,
      lessonTitle:one('#lessonTitle')?.textContent,
      hasReplacementChar:one('#lessonContent')?.textContent?.includes('\uFFFD')||false,
      viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      clipped:bad,
      cardsHidden:getComputedStyle(one('#lessonCards')).display==='none',
      contactVisible:!!one('#mrleeContactNative'),
      detail:box('#lessonContent')
    };
   });
   assert(result.bodyVisible,'Auth fixture did not release lesson body '+url);
   assert(result.cardsHidden,'Lesson list not hidden during active lesson');
   assert(result.korean.every(x=>x.found&&x.font.includes('Malgun Gothic')&&x.text.length>0),
    'Korean glyph fallback missing '+JSON.stringify(result.korean));
   assert(result.korean.every(x=>x.fontSize>=14), 'Korean examples too small '+JSON.stringify(result.korean));
   assert(result.korean.filter(x=>x.sel!=='.mr-sc-example-ko').every(x=>x.fontSize>=16),
    'Korean grammar, vocab or speaking text too small');
   assert(result.korean.some(x=>/[가-힣]/.test(x.text)),'Korean lesson text absent');
   assert(result.vocabCount>=25,'Vocabulary did not render '+url);
   assert(result.grammarCount>=3,'Grammar did not render '+url); // SC2 Bài 1 has three existing approved grammar entries.
   assert.equal(result.speakingCount,10,'Listening/speaking list lost a lesson');
   assert.equal(result.speakingCards.length,10,'Ten cards are required');
   assert(result.speakingCards.every(c=>c.isGrid&&c.hasMP3&&c.ttsCount===1&&
      c.recordCount===1&&c.hiddenRecording&&c.hasKorean&&c.hasVietnamese&&
      c.duplicateAudioBars===0&&c.hasAudioOptout&&c.contentFits),
     'Speaking controls duplicated, missing or clipped '+JSON.stringify(result.speakingCards));
   assert(result.speakingCards.every(c=>c.height<(width>=981?270:370)),
     'Oversized speaking card '+JSON.stringify(result.speakingCards));
   if(width>=981)assert(result.speakingCards.every(c=>c.columnsSideBySide),
     'Desktop speaking sentence / player must stay in two neat columns');

   assert.equal(result.workbookCount,15,'Workbook missing a set');
   assert(!result.hasReplacementChar,'Broken replacement glyph U+FFFD found in lesson');
   assert(!result.clipped.length,'Clipped lesson font '+JSON.stringify(result.clipped));
   assert(result.scrollWidth<=result.viewport+3,'Mobile horizontal overflow '+JSON.stringify(result));
   assert(result.contactVisible,'Six-channel contact missing from lesson');
   if(errors.length)console.log('LESSON SCRIPT WARN '+c.name+' '+errors.slice(0,3).join(' | '));
   await page.locator('#lessonSpeak .mr-v5-speaking-card').first().screenshot({
    path:`artifacts/lesson-fonts/${c.name}-speaking-${size}-${theme}.png`,animations:'disabled'});
   await page.locator('#lessonGrammar').screenshot({
    path:`artifacts/lesson-fonts/${c.name}-${size}-${theme}.png`,animations:'disabled'});
   passes++;
   console.log('LESSON TYPOGRAPHY PASS '+c.name+' '+size+' '+theme+' '+JSON.stringify({
    formulas:result.grammarCount,vocab:result.vocabCount,speak:result.speakingCount,
    workbook:result.workbookCount,viewport:result.viewport,panel:result.panel,
    koreanFont:result.korean[0].font
   }));
  }finally{await ctx.close()}
 }
}finally{await browser.close()}
console.log('LESSON TYPOGRAPHY VISUAL QA PASSED '+passes+' cases');
