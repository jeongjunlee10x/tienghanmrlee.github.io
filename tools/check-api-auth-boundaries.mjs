/**
 * MR LEE — read-only checks of anonymous access and CORS boundaries.
 * No credentials, no student identifiers, no POST, no database mutations.
 * Verifies deployment behavior, not the completeness of security controls.
 *
 * Run: node tools/check-api-auth-boundaries.mjs
 */
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const endpoint='https://pkxqsboyotlyoizzxizb.supabase.co/functions/v1/';
const trustedOrigin='https://mrlee-b6a.pages.dev';
const untrustedOrigin='https://untrusted-origin.invalid';
const tests=[
 {name:'arena wallet without login',path:'mrlee-arena-rooms?action=wallet',origin:trustedOrigin,status:401},
 {name:'Game Zone student data without login',path:'mrlee-game-zone?action=me',origin:trustedOrigin,status:401},
 {name:'reward claims without login',path:'mrlee-reward-v2',origin:trustedOrigin,status:401},
 {name:'placement rejects GET',path:'mrlee-placement-submit',origin:trustedOrigin,status:405},
 {name:'consultation rejects GET',path:'mrlee-consultation-submit',origin:trustedOrigin,status:405},
 {name:'Game Zone public status available',path:'mrlee-game-zone?action=status',origin:trustedOrigin,status:200},
 {name:'Arena rejects unknown origin',path:'mrlee-arena-rooms?action=wallet',origin:untrustedOrigin,status:403},
 {name:'Game Zone rejects unknown origin',path:'mrlee-game-zone?action=me',origin:untrustedOrigin,status:403},
 {name:'Reward rejects unknown origin',path:'mrlee-reward-v2',origin:untrustedOrigin,status:403},
 {name:'Placement rejects unknown origin',path:'mrlee-placement-submit',origin:untrustedOrigin,status:403},
 {name:'Consultation rejects unknown origin',path:'mrlee-consultation-submit',origin:untrustedOrigin,status:403}
];
const report={checkedAt:new Date().toISOString(),mode:'read-only GET, no credentials',checks:[],errors:[],notes:[
 'Tests only unauthenticated access boundaries and public service health.',
 'A pass does not prove that authenticated users cannot access one another’s data.',
 'A response from an invalid Origin is checked for status only; disallowed CORS echoing is reported for hardening.'
]};
for(const test of tests){
 try{
  const url=new URL(test.path,endpoint);
  if(url.origin!==new URL(endpoint).origin)throw Error('Unexpected endpoint origin');
  const res=await fetch(url,{method:'GET',headers:{Origin:test.origin,Accept:'application/json'},
    redirect:'error',cache:'no-store',signal:AbortSignal.timeout(12000)});
  const body=await res.text();
  if(body.length>32000)throw Error('Response size exceeds safe test limit');
  let parsed;
  try{parsed=JSON.parse(body);}catch{throw Error('Expected JSON response');}
  const visibleOrigin=res.headers.get('access-control-allow-origin')||'';
  const record={name:test.name,status:res.status,expected:test.status,
    contentType:res.headers.get('content-type')||'',corsReflectedUntrusted:
    test.origin===untrustedOrigin && visibleOrigin===untrustedOrigin};
  report.checks.push(record);
  if(res.status!==test.status)report.errors.push(
   test.name+': HTTP '+res.status+' (expected '+test.status+')');
  if(!/application\/json/i.test(record.contentType))report.errors.push(
   test.name+': response is not JSON');
  if(test.name==='Game Zone public status available' &&
     (!parsed || parsed.ok!==true || !Number.isInteger(parsed.verifiedQuestionCount)))
    report.errors.push('Game Zone public status schema does not match expectations');
  // An error payload must not disclose sensitive keys, even on denied calls.
  if(/sb_secret_[a-zA-Z0-9]+|SUPABASE_SERVICE_ROLE_KEY|-----BEGIN PRIVATE KEY-----/.test(body))
    report.errors.push(test.name+': sensitive server material in response');
 }catch(error){
  report.errors.push(test.name+': '+String(error?.message||error).slice(0,180));
 }
}
await mkdir(resolve('artifacts/security-readonly'),{recursive:true});
const output=resolve('artifacts/security-readonly/api-auth.json');
await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log('MR LEE API AUTH BOUNDARY',JSON.stringify({
 checks:report.checks.length,failures:report.errors.length,output
}));
for(const error of report.errors)console.error('FAIL '+error);
for(const c of report.checks)if(c.corsReflectedUntrusted)console.warn(
 'REVIEW CORS: '+c.name+' reflects an untrusted origin in a denied response');
if(report.errors.length)process.exitCode=1;
