// MR LEE: guard approved meme brand across all live top-level routes.
// Read-only. Redirect aliases do not need a visual header.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.');
const bad=[];
const pages=fs.readdirSync(root).filter(p=>p.endsWith('.html')).sort();
const master='assets/branding/logo-mrlee.png';
const script='assets/branding/site-logo.js';
for(const f of [master,script,'assets/branding/site-logo.css']){
 if(!fs.existsSync(path.join(root,f)))bad.push('Missing official brand resource: '+f);
}
let audited=0,redirects=0;
for(const p of pages){
 const s=fs.readFileSync(path.join(root,p),'utf8');
 if(/<meta\b[^>]*http-equiv\s*=\s*["']refresh["']/i.test(s)){redirects++;continue}
 audited++;
 if(!s.includes(script))bad.push(p+': missing shared brand script');
 if(!s.includes('assets/branding/site-logo.css'))bad.push(p+': missing shared brand CSS');
 if(/Logo gốc TIẾNG HÀN MR LEE/i.test(s))bad.push(p+': stale academic brand alt');
 if(/<span\s+class=["']monogram["']>MR<\/span>/i.test(s))bad.push(p+': stale text monogram');
}
const helper=fs.readFileSync(path.join(root,script),'utf8');
if(!helper.includes('assets\\/branding\\/logo-mrlee'))bad.push('Shared helper does not identify canonical branded images');
console.log('MR LEE BRAND QA: '+audited+' live HTML routes; '+redirects+' redirects; '+bad.length+' errors.');
for(const b of bad)console.error('BRAND FAIL: '+b);
if(bad.length)process.exitCode=1;
