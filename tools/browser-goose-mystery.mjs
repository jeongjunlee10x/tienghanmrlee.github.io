/* MR LEE Goose Mystery isolated browser smoke test — CI only; never modifies production. */
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const url=pathToFileURL(resolve('game-goose-mystery.html')).href;
const folder=resolve('artifacts/goose-mystery');
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const failures=[];
const check=(condition,msg)=>assert.ok(condition,msg);
async function inspect(page,name){
 page.on('pageerror',err=>failures.push(name+': '+err.message));
 await page.goto(url,{waitUntil:'load'});
 await page.waitForTimeout(150);
 check(await page.locator('#stage').isVisible(),name+': game canvas missing');
 await page.screenshot({path:resolve(folder,name+'-intro.png'),fullPage:true});
 await page.locator('#start').click();
 check((await page.locator('#roundTag').innerText()).includes('Đang chơi'),name+': game did not start');
}
try{
 const desktop=await browser.newPage({viewport:{width:1366,height:900},deviceScaleFactor:1});
 await inspect(desktop,'desktop');
 await desktop.locator('#gmRole').selectOption('good');
 await desktop.locator('#newGame').click();
 check((await desktop.locator('#roleTag').innerText()).includes('phe tốt'),'Good role selection ignored');
 await desktop.locator('#actTask').click();
 check(await desktop.locator('.gm-puzzle-step').isVisible(),'Tutorial task inaccessible at spawn');
 const sequence=(await desktop.locator('.gm-puzzle-step').innerText()).split(' → ');
 const words={'Xin chào':'안녕하세요','Cảm ơn':'감사합니다','Xin lỗi':'죄송합니다',
 'Vâng':'네','Không':'아니요','Không sao':'괜찮아요',
 'Tạm biệt (người đi)':'안녕히 가세요','Tôi sẽ ăn ngon miệng':'잘 먹겠습니다'};
 check(sequence.length===3,'Task should have exactly three vocabulary answers');
 for(const vi of sequence){
  check(Boolean(words[vi]),'Unknown translation '+vi);
  await desktop.locator('.gm-puzzle-answers button').filter({hasText:words[vi]}).click();
 }
 check((await desktop.locator('#taskProgress').getAttribute('value'))==='1','Task not awarded after correct answers');
 await desktop.locator('#actMeeting').click();
 check(await desktop.locator('.vote-list').isVisible(),'Meeting/vote UI missing');
 await desktop.locator('.vote-list button').last().click(); // Skip vote.
 check(await desktop.locator('#modal h2').isVisible(),'Vote response missing');
 await desktop.screenshot({path:resolve(folder,'desktop-vote.png'),fullPage:true});
 await desktop.locator('#modal button').last().click(); // Resume or start the next round before changing roles.
 await desktop.locator('#gmRole').selectOption('bad');
 await desktop.locator('#newGame').click();
 check((await desktop.locator('#roleTag').innerText()).includes('PHÁ HOẠI'),'Bad role selection ignored');
 check(await desktop.locator('#actKill').isVisible(),'Kill action missing for bad role');
 check(!(await desktop.locator('#actTask').isVisible()),'Good tasks exposed to bad role');
 await desktop.locator('#actKill').click();
 check((await desktop.locator('#status').innerText()).includes('Đã hạ'),'Nearby kill action failed');
 await desktop.screenshot({path:resolve(folder,'desktop-play.png'),fullPage:true});
 await desktop.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 await inspect(mobile,'mobile');
 check(await mobile.locator('#joystick').isVisible(),'Touch controls not visible');
 const overflow=await mobile.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 check(overflow<4,'Mobile page overflows horizontally by '+overflow+'px');
 await mobile.screenshot({path:resolve(folder,'mobile-play.png'),fullPage:true});
 await mobile.close();
 check(failures.length===0,'Browser exceptions: '+failures.join(' | '));
 console.log('GOOSE MYSTERY QA PASS — desktop/mobile, mission, votes, roles, attack, no JS exceptions');
}catch(err){console.error('GOOSE MYSTERY QA FAIL',err);process.exitCode=1}
finally{await browser.close()}
