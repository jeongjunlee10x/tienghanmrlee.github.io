/**
 * V3 Phase 3 Workbook browser QA with an isolated three-question fixture.
 * No real accounts, scores, production requests or Firebase/Supabase access.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const fixtureQuestions=(lesson)=>Array.from({length:3},(_,i)=>({
 id:'fixture-'+lesson+'-'+(i+1),type:'word-ko-vi',scope:'1-'+String(lesson).padStart(2,'0'),
 prompt:'Đáp án cho từ '+lesson+'-'+(i+1)+' là gì?',
 options:['Nghĩa A','Nghĩa B','Nghĩa C','Nghĩa D'],answer:i%4,
 explain:'Giải thích của câu thử nghiệm '+(i+1),refs:['단어'+(i+1)]
}));
const bank={version:'WB10K-20261105',lessons:{'1':fixtureQuestions(1),'2':fixtureQuestions(2)}};
const markup='<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>MR LEE Workbook test</title></head><body>'+
 '<select id="workLevel"><option value="1" selected>Cấp 1</option></select>'+
 '<select id="workLesson"><option value="1" selected>Bài 1</option><option value="2">Bài 2</option></select>'+
 '<input id="workProfile" value="hocvien-001">'+
 '<section id="work10kPanel"><select id="wb10kCount"><option value="12" selected>12</option></select>'+
 '<button id="wb10kStart" type="button" disabled>Bắt đầu lượt luyện mới</button>'+
 '<button id="wb10kReset" type="button" hidden>Mở vòng ôn lại</button>'+
 '<p id="wb10kStatus" role="status"></p><div id="wb10kGame" hidden></div></section>'+
 '<script defer src="/assets/workbook-v2/practice.js"></script></body></html>';
const root=process.cwd(), localKey=(b='1',profile='hocvien-001')=>['MRLEE','WB10K','V1',profile,'1',b].join('.');
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname;
 try{
  if(pathname==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(markup);return}
  if(pathname==='/assets/workbook-v2/bank-cap-1.json'){
   res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});
   res.end(JSON.stringify(bank));return;
  }
  if(pathname==='/assets/workbook-v2/practice.js'){
   const data=await fs.readFile(path.join(root,'assets/workbook-v2/practice.js'));
   res.writeHead(200,{'content-type':'text/javascript; charset=utf-8'});res.end(data);return;
  }
  res.writeHead(404);res.end('Not found');
 }catch{res.writeHead(500);res.end('Fixture failure')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let assertions=0;
const check=(value,message)=>{assert(value,message);assertions++};
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 const unintendedWrites=[];
 page.on('request',request=>{if(request.method()!=='GET')unintendedWrites.push(request.url())});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 const status=page.locator('#wb10kStatus'),start=page.locator('#wb10kStart'),
       reset=page.locator('#wb10kReset'),game=page.locator('#wb10kGame');
 const seen=async(key)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'[]'),key);
 await page.waitForFunction(()=>document.querySelector('#wb10kStatus')?.textContent?.includes('3 câu chưa luyện'));
 check(await start.isEnabled(),'Start enabled only with unseen questions');
 check((await seen(localKey())).length===0,'No questions seen on load');
 await start.click();
 check(await start.isDisabled(),'Start remains disabled during attempt');
 check(await game.isVisible(),'Question card becomes visible');
 check((await seen(localKey())).length===0,'Displaying a question must not mark it as seen');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#wb10kStatus')?.textContent?.includes('3 câu chưa luyện'));
 check((await seen(localKey())).length===0,'Interrupted question stays unseen after reload');
 await start.click();
 check(await start.isDisabled(),'Duplicate sessions blocked');
 await game.locator('.wb10k-option').first().click();
 const answered=await game.locator('.wb10k-prompt').textContent();
 check((await seen(localKey())).length===1,'Answering marks exactly one item');
 check(await start.isDisabled(),'Cannot start a new session in the middle of one');
 await game.locator('.wb10k-next').click();
 check((await seen(localKey())).length===1,'Next displayed card still unseen');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#wb10kStatus')?.textContent?.includes('2 câu chưa luyện'));
 check((await seen(localKey())).length===1,'Answered item stays persisted');
 await start.click();
 check((await game.locator('.wb10k-prompt').textContent())!==answered,'Answered item not replayed');
 for(let i=0;i<2;i++){
  await game.locator('.wb10k-option').first().click();
  await game.locator('.wb10k-next').click();
 }
 await page.waitForFunction(()=>document.querySelector('#wb10kStatus')?.textContent?.includes('Còn 0 câu chưa luyện'));
 check((await seen(localKey())).length===3,'Answered items all persisted');
 check(await start.isDisabled(),'Exhausted bank cannot restart');
 check(await reset.isVisible(),'Explicit review cycle control visible');
 await page.evaluate(()=>localStorage.setItem('MRLEE.OTHER.SCORE','keep'));
 page.once('dialog',d=>d.accept());
 await reset.click();
 await page.waitForFunction(()=>document.querySelector('#wb10kStatus')?.textContent?.includes('3 câu chưa luyện'));
 check((await seen(localKey())).length===0,'Confirmed reset starts a new practice cycle');
 check((await page.evaluate(()=>localStorage.getItem('MRLEE.OTHER.SCORE')))==='keep','Other local data is untouched');
 await start.click();
 await game.locator('.wb10k-option').first().click();
 check((await seen(localKey())).length===1,'Lesson 1 answer persists independently');
 await page.locator('#workLesson').selectOption('2');
 await page.waitForFunction(()=>document.querySelector('#wb10kStatus')?.textContent?.includes('Bài 2'));
 check(await game.isHidden(),'Changing lesson exits previous attempt');
 check((await seen(localKey('2'))).length===0,'New lesson has separate history');
 await page.locator('#workLesson').selectOption('1');
 await page.waitForFunction(()=>document.querySelector('#wb10kStatus')?.textContent?.includes('Bài 1'));
 check((await seen(localKey())).length===1,'Switching back retains the original answer');
 await page.locator('#workProfile').fill('hocvien-002');
 await page.locator('#workProfile').dispatchEvent('change');
 await page.waitForFunction(()=>document.querySelector('#wb10kStatus')?.textContent?.includes('3 câu chưa luyện'));
 check((await seen(localKey('1','hocvien-002'))).length===0,'Different profile has separate history');
 check((await seen(localKey())).length===1,'First profile history remains untouched');
 check(unintendedWrites.length===0,'Unexpected POST or write requests: '+unintendedWrites.join(','));
 check(errors.length===0,'JavaScript page errors: '+errors.join(','));
 await fs.mkdir('artifacts/v3-workbook',{recursive:true});
 await page.screenshot({path:'artifacts/v3-workbook/progress-390.png',animations:'disabled'});
 await context.close();
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
console.log('PASS Workbook V3: '+assertions+' browser assertions, answered-only progress, interruption and profile isolation');
