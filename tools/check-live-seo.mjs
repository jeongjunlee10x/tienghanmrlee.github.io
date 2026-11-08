/* Read-only public SEO connectivity check. No account tokens or secret data. */
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const origin = new URL(process.env.MRLEE_SITE_ORIGIN || 'https://mrlee-b6a.pages.dev').origin;
const report = {checkedAt:new Date().toISOString(),origin,checks:[],errors:[],notes:[
  'These requests originate from GitHub Actions, not from Googlebot.',
  'A successful HTTP fetch does not establish Google Search Console sitemap processing or indexation.'
]};
const bad = message => { report.errors.push(message); console.error('FAIL',message); };
const record = (path, res) => report.checks.push({path, status:res.status,
  finalUrl:res.url,contentType:res.headers.get('content-type')||'',
  cfRay:res.headers.get('cf-ray')||'',xRobotsTag:res.headers.get('x-robots-tag')||''});
async function read(path){
  const url = new URL(path,origin);
  if(url.origin!==origin)throw new Error('Cross-origin path refused: '+path);
  const res=await fetch(url,{
    method:'GET',redirect:'follow',signal:AbortSignal.timeout(20000),
    headers:{'Accept':'text/html, application/xml, text/xml, text/plain;q=0.9, */*;q=0.5',
      'User-Agent':'MRLEE-Public-SEO-Check/1.0','Cache-Control':'no-cache'}
  });
  record(url.pathname,res);
  if(!res.ok)throw Error(url.pathname+' HTTP '+res.status);
  if(new URL(res.url).origin!==origin)throw Error(url.pathname+' redirected off-site to '+res.url);
  if(/noindex/i.test(res.headers.get('x-robots-tag')||''))bad(url.pathname+' returned X-Robots-Tag noindex');
  const content=await res.text();
  if(content.length>2_000_000)throw Error(url.pathname+' response too large');
  return {content,res};
}
function ensure(check,message){if(!check)bad(message);}
async function run(){
  let robots,xml,home;
  for(const [path,kind] of [['/robots.txt','robots'],['/sitemap.xml','sitemap'],['/','home']]){
    try{const got=await read(path); ({robots:()=>robots=got,sitemap:()=>xml=got,home:()=>home=got})[kind]();}
    catch(e){bad(path+': '+String(e.message||e));}
  }
  if(robots){
    ensure(/^\s*User-agent:\s*\*/mi.test(robots.content),'robots.txt missing user-agent group');
    ensure(robots.content.includes('Sitemap: '+origin+'/sitemap.xml'),'robots.txt sitemap URL mismatch');
    ensure(!/^Disallow:\s*\/\s*$/mi.test(robots.content),'robots.txt blocks the entire site');
  }
  let urls=[];
  if(xml){
    ensure(/<urlset\b/i.test(xml.content),'sitemap.xml does not contain urlset');
    urls=[...xml.content.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(m=>m[1].trim());
    ensure(urls.length>=21,'sitemap.xml contains fewer than 21 URLs: '+urls.length);
    ensure(new Set(urls).size===urls.length,'sitemap.xml includes duplicate URLs');
    ensure(urls.includes(origin+'/'),'sitemap.xml lacks canonical homepage URL');
    for(const url of urls){
      let parsed;try{parsed=new URL(url);}catch{bad('Invalid sitemap URL '+url);continue;}
      ensure(parsed.origin===origin,'Off-origin sitemap URL: '+url);
    }
    const ct=xml.res.headers.get('content-type')||'';
    ensure(/(?:xml|text\/plain)/i.test(ct),'Unexpected sitemap Content-Type: '+ct);
  }
  if(home){
    ensure(/<html\b/i.test(home.content),'Homepage is not HTML');
    ensure(home.content.includes('href="'+origin+'/"'),'Homepage canonical URL mismatch');
    ensure(!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(home.content),'Homepage has noindex');
  }
  // Read-only probe of URLs advertised to Google; bounded concurrency.
  for(let i=0;i<urls.length;i+=4){
    await Promise.all(urls.slice(i,i+4).map(async value=>{
      try{
        const path=new URL(value).pathname;
        if(new URL(value).origin!==origin)return;
        if(path==='/')return;
        const {content,res}=await read(path);
        ensure(res.url===value,path+' sitemap URL redirects to '+res.url);
        const canonical=content.match(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/i)?.[0]||'';
        const canonicalUrl=canonical.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
        ensure(canonicalUrl===value,path+' canonical URL differs from sitemap: '+canonicalUrl);
        ensure(/text\/html/i.test(res.headers.get('content-type')||''),path+' did not return text/html');
        ensure(/<html\b/i.test(content),path+' does not appear to be HTML');
        ensure(!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(content),path+' has noindex');
      }catch(e){bad(value+': '+String(e.message||e));}
    }));
  }
}
await run();
const filename=resolve('artifacts/seo-live/report.json');
await mkdir(resolve('artifacts/seo-live'),{recursive:true});
await writeFile(filename,JSON.stringify(report,null,2)+'\n');
console.log('PUBLIC SEO CHECK',JSON.stringify({origin,requests:report.checks.length,errors:report.errors.length,report:filename}));
if(report.errors.length)process.exitCode=1;
