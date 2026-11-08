/**
 * Decode a deterministic sample of MR LEE MP3s across every major learning
 * collection. Read-only: never synthesize or replace an original audio file.
 * Requires ffmpeg/ffprobe (installed by CI; locally via ffmpeg).
 * This cannot assess pronunciation quality, gender, or semantic correctness.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const sourceGroups=[
 ['sc1','MRLEE_AUDIO/01_HOC_TIENG_HAN/CAP_1/'],
 ['sc2','MRLEE_AUDIO/01_HOC_TIENG_HAN/CAP_2/'],
 ['tc1','MRLEE_AUDIO/01_HOC_TIENG_HAN/CAP_3/'],
 ['tc2','MRLEE_AUDIO/01_HOC_TIENG_HAN/CAP_4/'],
 ['cc1','MRLEE_AUDIO/01_HOC_TIENG_HAN/CAP_5/'],
 ['cc2','MRLEE_AUDIO/01_HOC_TIENG_HAN/CAP_6/'],
 ['communication','MRLEE_AUDIO/02_GIAO_TIEP/'],
 ['topik-native','MRLEE_AUDIO/03_TOPIK/'],
 ['interview','MRLEE_AUDIO/04_PHONG_VAN/'],
 ['culture','MRLEE_AUDIO/05_VAN_HOA/'],
 ['topik-pro-i','MRLEE_PRO_AUDIO/topik/TOPIK_I/'],
 ['topik-pro-ii','MRLEE_PRO_AUDIO/topik/TOPIK_II/'],
 ['pro-lessons','MRLEE_PRO_AUDIO/lessons/'],
 ['topik-v10','assets/topik-v10/audio/']
];
const groups=Object.fromEntries(sourceGroups.map(([name])=>[name,[]]));
function visit(dir){
 if(!fs.existsSync(dir))return;
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const abs=path.join(dir,item.name);
  if(item.isSymbolicLink())throw Error('Unsafe symlink encountered: '+abs);
  if(item.isDirectory())visit(abs);
  else if(item.isFile()&&item.name.toLowerCase().endsWith('.mp3')){
   const rel=path.relative(root,abs).replaceAll('\\','/');
   for(const [key,prefix] of sourceGroups){
    if(rel.startsWith(prefix)){groups[key].push({abs,rel});break}
   }
  }
 }
}
for(const [,prefix] of sourceGroups)visit(path.join(root,prefix));
const selected=[];
for(const [name] of sourceGroups){
 const files=groups[name].sort((a,b)=>a.rel.localeCompare(b.rel));
 if(!files.length)throw Error('Audio group empty: '+name);
 // At most 5 per group; choose beginning, middle and end deterministically.
 const count=Math.min(5,files.length);
 for(let k=0;k<count;k++){
  const index=count===1?0:Math.round(k*(files.length-1)/(count-1));
  selected.push({...files[index],group:name});
 }
}
function run(exe,args){
 const proc=spawnSync(exe,args,{encoding:'utf8',timeout:12000,maxBuffer:300000});
 if(proc.error)throw proc.error;
 if(proc.status!==0)throw Error((proc.stderr||proc.stdout||exe+' failed').trim().slice(0,300));
 return proc.stdout;
}
const result={selected:selected.length,groupCounts:Object.fromEntries(
  sourceGroups.map(([name])=>[name,groups[name].length])
),failures:[],samples:[]};
for(const sample of selected){
 try{
  const out=JSON.parse(run('ffprobe',[
   '-v','error','-show_entries','format=duration:stream=codec_name,sample_rate,channels',
   '-select_streams','a:0','-of','json',sample.abs]));
  const duration=Number(out.format?.duration);
  const stream=out.streams?.[0];
  if(stream?.codec_name!=='mp3')throw Error('Audio stream codec is not MP3');
  if(!Number.isFinite(duration)||duration<0.08||duration>1200)throw Error('Invalid audio duration: '+duration);
  const sampleRate=Number(stream.sample_rate);
  if(!Number.isInteger(sampleRate)||sampleRate<8000||sampleRate>96000)throw Error('Invalid sample rate');
  if(!Number.isInteger(stream.channels)||stream.channels<1||stream.channels>2)throw Error('Invalid audio channels');
  // Decode the entire file so a valid header cannot mask truncated frames.
  run('ffmpeg',['-v','error','-xerror','-i',sample.abs,'-f','null','-']);
  result.samples.push({group:sample.group,file:sample.rel,
    durationSeconds:+duration.toFixed(2),sampleRate,channels:stream.channels});
 }catch(e){result.failures.push({group:sample.group,file:sample.rel,error:String(e.message||e).slice(0,250)})}
}
const dir=path.join(root,'artifacts/media-integrity');
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'mp3-decode-sample.json'),JSON.stringify(result,null,2)+'\n');
console.log('MR LEE MP3 DECODE AUDIT '+JSON.stringify({
 sampled:selected.length,decoded:result.samples.length,failed:result.failures.length,
 groups:sourceGroups.length
}));
for(const failure of result.failures)console.error('MP3 DECODING FAIL '+JSON.stringify(failure));
if(result.failures.length)process.exitCode=1;
