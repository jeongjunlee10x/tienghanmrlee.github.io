/* Shared pure helpers for MR LEE GAME ZONE. No scoring authority on the client. */
export const MODES = Object.freeze([
  { id:"word-match", label:"Ghép từ siêu tốc", ko:"단어 매칭", icon:"🧩", desc:"Ghép tiếng Hàn với nghĩa tiếng Việt." },
  { id:"sentence-builder", label:"Xây dựng câu", ko:"문장 만들기", icon:"🔤", desc:"Sắp xếp từ thành câu tiếng Hàn đúng." },
  { id:"listening", label:"Thính giác siêu phàm", ko:"듣기 챌린지", icon:"🎧", desc:"Nghe MP3 rồi chọn nghĩa chính xác." },
  { id:"memory", label:"Trí nhớ thần tốc", ko:"기억력 게임", icon:"🃏", desc:"Lật thẻ tìm đúng cặp từ Hàn–Việt." },
  { id:"hangul-bubbles", label:"Bắn bóng Hangul", ko:"한글 버블", icon:"🎈", desc:"Săn bong bóng đúng theo nghĩa tiếng Việt." },
  { id:"grammar-detective", label:"Thám tử ngữ pháp", ko:"문법 탐정", icon:"🔎", desc:"Tìm công thức đang bị ghép sai ý nghĩa." },
  { id:"typing-king", label:"Vua gõ tiếng Hàn", ko:"타자왕", icon:"⌨️", desc:"Gõ từ Hangul đúng và luyện chính tả." },
  { id:"korean-mart", label:"Siêu thị Hàn Quốc", ko:"한국 마트", icon:"🛒", desc:"Mua đúng sản phẩm đã học bằng tiếng Hàn." },
]);
export const LEVELS = ["Sơ cấp 1", "Sơ cấp 2", "Trung cấp 1", "Trung cấp 2", "Cao cấp 1", "Cao cấp 2"];
export function shuffled(items, random = Math.random) {
  const a = items.slice();
  for (let i=a.length-1; i>0; i--) {
    const j=Math.floor(random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
export function normalized(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/g," ").toLowerCase();
}
export function uniqueWords(rows) {
  const koSet=new Set(), viSet=new Set(), out=[];
  for (const row of rows || []) {
    const ko=String(row.ko || "").trim(), vi=String(row.vi || "").trim();
    const k=normalized(ko), v=normalized(vi);
    if (!/[\uac00-\ud7a3]/u.test(ko) || ko.length>65 || !vi || vi.length>110 ||
        koSet.has(k) || viSet.has(v)) continue;
    koSet.add(k); viSet.add(v); out.push({ko,vi});
  }
  return out;
}
export function pickWords(rows, amount, namespace="") {
  const eligible=uniqueWords(rows);
  if(!namespace)return shuffled(eligible).slice(0,amount);
  const storageKey="MRLEE.GAME.RECENT."+namespace;
  let history=[];
  try {
    const saved=JSON.parse(sessionStorage.getItem(storageKey)||"[]");
    if(Array.isArray(saved))history=saved.filter(x=>typeof x==="string").slice(-40);
  }catch{}
  const old=new Set(history);
  const current=shuffled(eligible.filter(x=>!old.has(normalized(x.ko))));
  const fallback=shuffled(eligible.filter(x=>old.has(normalized(x.ko))));
  const picked=[...current,...fallback].slice(0,amount);
  try {
    const updated=[...history,...picked.map(x=>normalized(x.ko))];
    sessionStorage.setItem(storageKey,JSON.stringify(updated.slice(-Math.max(amount*3,12))));
  }catch{}
  return picked;
}
export function el(tag, className, content) {
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(content!==undefined)node.textContent=String(content);
  return node;
}
export function button(text, className, onClick) {
  const b=el("button",className,text);b.type="button";
  if(typeof onClick==="function")b.addEventListener("click",onClick);
  return b;
}
export function parseCsv(text) {
  const lines=String(text||"").replace(/^\uFEFF/,"").split(/\r?\n/);
  const result=[];
  for(const line of lines) {
    if(!line.trim())continue;
    const columns=[];let cell="", quoted=false;
    for(let i=0;i<line.length;i++) {
      const ch=line[i];
      if(ch==='"' && quoted && line[i+1]==='"'){cell+='"';i++;}
      else if(ch==='"')quoted=!quoted;
      else if(ch==="," && !quoted){columns.push(cell);cell="";}
      else cell+=ch;
    }
    columns.push(cell);result.push(columns);
  }
  return result;
}
export function formatLesson(cap,bai) {
  return LEVELS[cap-1] + " · Bài " + bai;
}