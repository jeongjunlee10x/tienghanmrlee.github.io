export const TOPIK_EXAMS = [
  {number:35, source:'https://www.topikguide.com/download-35th-topik-test-papers/', paperI:'https://content.topikguide.com/file/TOPIK1Papers/35th-TOPIK-I-Papers.pdf', paperII:'https://content.topikguide.com/file/TOPIK2Papers/35th-TOPIK-II-Papers.pdf'},
  {number:36, source:'https://www.topikguide.com/download-36th-topik-test-papers/'},
  {number:37, source:'https://www.topikguide.com/download-37th-topik-test-papers/'},
  {number:41, source:'https://www.topikguide.com/download-41st-topik-test-papers/'},
  {number:47, source:'https://www.topikguide.com/download-47th-topik-test-papers/'},
  {number:52, source:'https://www.topikguide.com/download-52nd-topik-test-papers/'},
  {number:60, source:'https://www.topikguide.com/download-60th-topik-test-papers/'},
  {number:64, source:'https://www.topikguide.com/download-64th-topik-test-papers/'},
  {number:83, source:'https://www.topikguide.com/download-83rd-topik-test-papers/'},
  {number:91, source:'https://www.topikguide.com/download-91st-topik-test-papers/'},
  {number:96, source:'https://www.topikguide.com/download-96th-topik-test-papers/'},
  {number:102,source:'https://www.topikguide.com/download-102nd-topik-test-papers/'}
];

const VERIFIED_EXAM_IDS = new Set(["I-35", "II-35", "I-96", "II-96", "I-102", "II-102"]);
export const TOPIK_LEVELS = {
 I:{title:'TOPIK I',subtitle:'Sơ cấp · 1–2급',durationMinutes:100,sections:[{key:'listening',label:'Nghe · 듣기',count:30,minutes:40,firstNumber:1},{key:'reading',label:'Đọc · 읽기',count:40,minutes:60,firstNumber:31}]},
 II:{title:'TOPIK II',subtitle:'Trung – Cao cấp · 3–6급',durationMinutes:180,sections:[{key:'listening',label:'Nghe · 듣기',count:50,minutes:60,firstNumber:1},{key:'writing',label:'Viết · 쓰기',count:4,minutes:50,firstNumber:51},{key:'reading',label:'Đọc · 읽기',count:50,minutes:70,firstNumber:1}]}
};

export function hasKey(level, examNumber){return VERIFIED_EXAM_IDS.has(`${level}-${examNumber}`);}
