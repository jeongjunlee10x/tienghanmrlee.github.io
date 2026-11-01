import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts',{recursive:true});
const routes=[
 {path:'ban-do-dai-hoc-han-quoc.html',kind:'map',main:'.mrlee27-map-intro'},
 {path:'tuyen-sinh.html',kind:'admission',main:'.ts-hero-grid'},
 {path:'trung-tam-hoc-vien.html',kind:'student',main:'.intro'},
 {path:'admin.html',kind:'admin',main:'#authWrap'}
];
for(const cfg of routes){
 for(const theme of ['fresh','future']){
  for(const [mode,width,height] of [['desktop',1365,900],['mobile',390,844]]){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
   await context.addInitScript(choice=>{
    try{
     localStorage.setItem('MRLEE.THEME.V1',choice);
     sessionStorage.setItem('MRLEE.THEME.ENTRY.V1',choice);
    }catch{}
   },theme);
   // Visual-only account page test. Never assume this represents real Firebase access.
   if(cfg.kind==='student'){
    await context.route('**/auth-guard.js',route=>route.fulfill({
      status:200,contentType:'text/javascript',
      body:'document.documentElement.dataset.mrleeAuth="verified";'
    }));
    // A visual fixture cannot read any real Firebase profile. Keep layout
    // visible while asserting only the presence of original data controls.
    for(const pattern of ['**/mrlee-student.js','**/mrlee-avatar.js','**/mrlee-daily-boot.js**']){
      await context.route(pattern,route=>route.fulfill({
        status:200,contentType:'text/javascript',body:'/* visual-only test fixture */'
      }));
    }
   }
   const page=await context.newPage();
   await page.goto('http://127.0.0.1:8765/'+cfg.path,{waitUntil:'domcontentloaded',timeout:60000});
   await page.locator(cfg.main).waitFor({state:'visible',timeout:30000});
   const data=await page.evaluate(kind=>{
    const root=document.documentElement;
    const main=kind==='map'?document.querySelector('.mrlee27-map-intro'):
     kind==='admission'?document.querySelector('.ts-hero-grid'):
     kind==='student'?document.querySelector('main.main>.intro'):
     document.querySelector('#authWrap');
    const rect=main.getBoundingClientRect();
    return {
      phase:root.dataset.mrleePhase3,
      theme:root.dataset.mrleeTheme,
      width:rect.width,viewport:innerWidth,
      mainVisible:getComputedStyle(main).display!=='none',
      map:kind==='map'?['universitySearch','universityRegion','universityType','mrleeAdministrativeMap','universityCards'].every(id=>!!document.getElementById(id)):null,
      student:kind==='student'?['studentEmail','levelFilter','attemptRows','eventRows'].every(id=>!!document.getElementById(id)):null,
      admin:kind==='admin'?{
       authVisible:getComputedStyle(document.getElementById('authWrap')).display!=='none',
       appHidden:document.getElementById('app').classList.contains('hidden')
      }:null
    };
   },cfg.kind);
   assert(data.mainVisible,cfg.kind+' main hidden');
   assert.equal(data.phase,cfg.kind,cfg.kind+' attribute');
   assert(data.width<=data.viewport+2,cfg.kind+' local overflow '+JSON.stringify(data));
   if(cfg.kind==='map')assert(data.map,'missing map controls');
   if(cfg.kind==='student')assert(data.student,'missing student controls');
   if(cfg.kind==='admin'){
     assert(data.admin.appHidden,'Admin data unexpectedly visible without sign-in');
     assert(data.admin.authVisible,'Admin auth form unexpectedly hidden');
   }
   await page.locator(cfg.main).screenshot({path:'artifacts/mrlee-phase3-'+cfg.kind+'-'+theme+'-'+mode+'.png',animations:'disabled'});
   console.log('PASS phase3 visual '+cfg.path+' '+theme+' '+mode);
   await context.close();
  }
 }
}
await browser.close();
