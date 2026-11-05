/* Read-only adapters. Never generates future-lesson grammar or fake audio. */
import {uniqueWords, parseCsv} from "./core.js";
import {SC_LESSONS} from "../../mrlee-sc-lesson-data.js";

let advancedPromise=null;
function advancedLessons() {
  if(!advancedPromise)advancedPromise=import("../../mrlee-advanced-lesson-data.js").then(m=>m.ADVANCED_LESSONS);
  return advancedPromise;
}
function koreanSentence(raw) {
  return String(raw||"").split(/→|⇒|=>|[\n\r]/)[0].trim();
}
export function collectSentences(lesson) {
  const rows=[];
  for(const g of lesson.grammar || []) {
    const raw=String(g.example||"");
    const ko=koreanSentence(raw);
    const vi=raw.includes("→")?raw.split("→").slice(1).join("→").trim():"";
    const words=ko.split(/\s+/).filter(Boolean);
    if(words.length>=2 && words.length<=10 && vi && /[\uac00-\ud7a3]/u.test(ko))
      rows.push({ko, vi, words});
  }
  for(const s of lesson.samples || []) {
    if(!s || typeof s!=="object")continue;
    const ko=String(s.ko||"").trim(),vi=String(s.vi||"").trim();
    const words=ko.split(/\s+/).filter(Boolean);
    if(vi && words.length>=2 && words.length<=10 && /[\uac00-\ud7a3]/u.test(ko))
      rows.push({ko,vi,words});
  }
  const seen=new Set();
  return rows.filter(x=>{if(seen.has(x.ko))return false;seen.add(x.ko);return true;});
}
export async function loadLesson(cap,bai) {
  if(!Number.isInteger(cap)||cap<1||cap>6||!Number.isInteger(bai)||bai<1||bai>15)
    throw new Error("Cấp độ hoặc bài học không hợp lệ.");
  const list=cap<=2?SC_LESSONS:await advancedLessons();
  const raw=list.find(x=>Number(x.cap)===cap && Number(x.bai)===bai);
  if(!raw)throw new Error("Chưa tìm được nội dung của bài này.");
  const words=uniqueWords((raw.vocab||[]).map(x=>({ko:x[0],vi:x[1]})));
  return {cap,bai,title:String(raw.title||""),words,sentences:collectSentences(raw)};
}
export async function loadWordAudio(cap,bai) {
  const folder="MRLEE_AUDIO/01_HOC_TIENG_HAN/CAP_"+cap+"/BAI_"+String(bai).padStart(2,"0")+"/01_TU_VUNG/";
  const response=await fetch(folder+"DANH_SACH.csv",{cache:"force-cache"});
  if(!response.ok)throw new Error("Danh mục MP3 chưa tải được (HTTP "+response.status+").");
  const rows=parseCsv(await response.text());
  const map=new Map();
  for(const r of rows.slice(1)) {
    const file=String(r[0]||"").replaceAll("\\","/").trim();
    const word=String(r[1]||"").trim();
    if(!/^01_HOC_TIENG_HAN\/CAP_[1-6]\/BAI_\d{2}\/01_TU_VUNG\/[a-z0-9_-]+\.mp3$/i.test(file) ||
       !file.startsWith("01_HOC_TIENG_HAN/CAP_"+cap+"/BAI_"+String(bai).padStart(2,"0")+"/"))continue;
    if(word && !map.has(word))map.set(word,"MRLEE_AUDIO/"+file);
  }
  return map;
}