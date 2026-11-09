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

function createMockImage(kind){
 const img={
  tagName:'IMG',dataset:{},decoding:'',loading:'',fetchPriority:'',
  classList:{contains(name){return name==='mr27-art-'+kind}},
  matches(selector){
   if(selector==='.mrlee-approved-logo')return false;
   return selector.includes('.mr27-art-fresh')||selector.startsWith('img:not(');
  },
  closest(){return null},
  hasAttribute(){return false},
  addEventListener(){},
  getBoundingClientRect(){return {width:650}},
  naturalWidth:1200
 };
 return img;
}
function testThemeHeroPriority(){
 const docRoot={dataset:{mrleeTheme:'fresh'}};
 const fresh=createMockImage('fresh'),future=createMockImage('future');
 const observers=[];
 let go;
 const document={
  readyState:'loading',documentElement:docRoot,body:{},
  addEventListener(type,fn){if(type==='DOMContentLoaded')go=fn},
  querySelectorAll(selector){
   if(selector.includes('.mr27-art-fresh')||selector==='img:not(.mrlee-approved-logo)')return [fresh,future];
   return [];
  }
 };
 class Observer {
  constructor(cb){this.callback=cb;observers.push(this)}
  observe(target,options){this.target=target;this.options=options}
 }
 const ctx=createContext({window:{},document,MutationObserver:Observer,console});
 new Script(img,{filename:'media-quality-v3.js'}).runInContext(ctx);
 assert.equal(typeof go,'function');
 go();
 assert.equal(fresh.loading,'eager');
 assert.equal(fresh.fetchPriority,'high');
 assert.equal(future.loading,'lazy');
 assert.equal(future.fetchPriority,'low');
 const observer=observers.find(o=>o.target===docRoot);
 assert(observer,'The image loader must observe theme changes on documentElement');
 assert.deepEqual(Array.from(observer.options.attributeFilter),['data-mrlee-theme']);
 docRoot.dataset.mrleeTheme='future';
 observer.callback([{type:'attributes',attributeName:'data-mrlee-theme'}]);
 assert.equal(fresh.loading,'lazy');
 assert.equal(fresh.fetchPriority,'low');
 assert.equal(future.loading,'eager');
 assert.equal(future.fetchPriority,'high');
}
function testLoaderIdempotence(existing){
 const loadedScripts=[],loadedLinks=[],injected=[];
 const make=(tag)=>({
  tagName:tag.toUpperCase(),dataset:{},rel:'',
  getAttribute(name){return this[name]||''}
 });
 if(existing){
  const script=make('script');script.src='https://mrlee-b6a.pages.dev/assets/branding/media-quality-v3.js?v=old';
  loadedScripts.push(script);
  const link=make('link');link.rel='stylesheet';link.href='https://mrlee-b6a.pages.dev/assets/branding/media-quality-v3.css';
  loadedLinks.push(link);
 }
 let domReady;
 const doc={
  currentScript:{src:'https://mrlee-b6a.pages.dev/assets/branding/site-logo.js?v=stable'},
  baseURI:'https://mrlee-b6a.pages.dev/index.html',
  readyState:'loading',
  body:{nodeType:1,tagName:'BODY',querySelectorAll(){return[]},matches(){return false}},
  head:{append(el){injected.push(el);if(el.tagName==='SCRIPT')loadedScripts.push(el);else loadedLinks.push(el)},
   appendChild(el){injected.push(el);loadedLinks.push(el)}},
  createElement:make,
  addEventListener(type,fn){if(type==='DOMContentLoaded')domReady=fn},
  getElementById(id){return id==='mrleeContactNative'?{}:null},
  querySelector(sel){return sel==='link[data-mrlee-contact-native]'?{}:null},
  querySelectorAll(sel){
   if(sel==='script[src]')return loadedScripts;
   if(sel==='link[rel~="stylesheet"]')return loadedLinks;
   return [];
  }
 };
 class Observer{observe(){}}
 const brand=readFileSync('assets/branding/site-logo.js','utf8');
 new Script(brand,{filename:'site-logo.js'}).runInContext(createContext({
  window:{},document:doc,MutationObserver:Observer,
  location:{pathname:'/index.html'},URL,console
 }));
 assert.equal(typeof domReady,'function');
 domReady();
 const media=injected.filter(el=>(el.src||el.href||'').includes('media-quality-v3.'));
 assert.equal(media.length,existing?0:2,
  'Only missing media loader resources should be injected');
}
testThemeHeroPriority();
testLoaderIdempotence(true);
testLoaderIdempotence(false);
console.log('PASS MR LEE media browser audio role cleaning and hero priority scripts');
