/**
 * TOPIK PBT archival catalogue.
 * The source pages link to publicly released papers/audio/answer sheets.
 * This site does not reproduce third-party PDFs or audio files.
 * Verified answer keys included for 35th, 96th and 102nd TOPIK I and II.
 * Unverified exams remain non-scoring by design.
 */
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

// Each row is [right choice (1-4), points]. Must preserve official section order.
// For TOPIK I reading, booklet numbers are 31–70, while the 35th key lists 1–40.
const rows = (leftAnswers, rightAnswers, leftPoints, rightPoints) => {
  const pairs = leftAnswers.map((answer,i) => [answer,leftPoints[i]])
    .concat(rightAnswers.map((answer,i) => [answer,rightPoints[i]]));
  if(pairs.some(([a,p])=>![1,2,3,4].includes(a) || !Number.isInteger(p))) throw Error('Invalid key rows');
  return pairs;
};
const twos = n => Array(n).fill(2);
export const VERIFIED_KEYS = {
  'I-35': {
    source:'https://content.topikguide.com/file/TOPIK1Papers/35th-TOPIK-I-Answer-Sheet.pdf',
    listening: rows(
      [3,2,1,2,1,2,2,4,3,4,1,4,3,4,1],
      [3,3,4,3,2,2,2,1,1,4,4,1,3,1,2],
      [4,4,3,3,4,3,3,3,3,4,3,3,4,3,4],
      [4,3,3,3,3,3,3,3,3,3,4,3,4,3,4]
    ),
    reading: rows(
      [3,4,1,4,1,3,3,1,1,3,2,4,1,2,2,4,3,3,2,4],
      [1,2,4,3,3,2,4,2,2,3,1,1,4,4,2,3,1,3,4,1],
      [2,2,2,2,2,2,3,3,2,3,3,3,3,2,3,3,3,2,2,2],
      [3,2,2,3,2,3,2,3,2,3,2,2,2,3,2,3,3,3,3,3]
    )
  },
  'II-35': {
    source:'https://content.topikguide.com/file/TOPIK2Papers/35th-TOPIK-II-Answer-Sheet.pdf',
    listening: rows(
      [2,4,1,2,4,3,2,4,1,3,1,3,4,4,3,3,1,1,2,1,2,2,4,3,4],
      [2,2,4,1,3,4,2,1,2,4,4,2,4,2,1,3,3,1,3,3,1,1,2,4,3],
      twos(25), twos(25)
    ),
    reading: rows(
      [3,4,1,1,1,2,1,3,4,1,2,3,1,4,4,2,3,3,2,4,1,2,1,3,3],
      [1,4,3,4,4,1,2,4,4,2,2,4,4,2,3,3,1,2,2,3,2,3,2,1,4],
      twos(25),twos(25)
    )
  },
  'I-96': {
    source:"https://www.topikguide.com/TOPIK-Papers/96th-TOPIK-I-Answers.pdf",
    listening: rows([3,4,4,3,3,1,2,3,2,4,3,1,2,1,1], [2,4,1,3,4,1,2,2,4,3,4,1,2,3,4], [4,4,3,3,4,3,3,3,3,4,3,3,4,3,4], [4,3,3,3,3,3,3,3,3,3,4,3,4,3,4]),
    reading: rows([3,4,2,3,3,4,3,4,4,2,2,3,2,1,2,2,1,3,4,4], [1,3,1,3,3,1,2,1,1,1,2,4,4,2,4,1,2,4,1,3], [2,2,2,2,2,2,3,3,2,3,3,3,3,2,3,3,3,2,2,2], [3,2,2,3,2,3,3,2,2,3,2,2,2,3,2,3,3,3,3,3])
  },
  'II-96': {
    source:"https://www.topikguide.com/TOPIK-Papers/96th-TOPIK-II-Answers.pdf",
    listening: rows([1,2,2,3,1,2,4,3,4,2,4,2,3,2,4,4,3,1,4,1,4,2,4,2,1], [1,2,3,1,2,4,3,3,1,1,4,3,2,4,3,3,2,1,4,4,3,3,3,4,1], twos(25), twos(25)),
    reading: rows([4,1,1,4,2,4,1,1,3,2,4,4,2,3,1,1,3,1,4,2,2,3,2,1,3], [3,4,4,2,4,3,3,1,2,3,4,3,1,1,3,2,3,1,2,4,2,2,3,4,4], twos(25), twos(25))
  },
  'I-102': {
    source:"https://www.topikguide.com/download-102nd-topik-test-papers/",
    listening: rows([1,3,2,3,4,2,3,3,2,4,2,1,4,2,2], [1,3,4,3,4,4,1,4,1,1,3,3,4,2,1], [4,4,3,3,4,3,3,3,3,4,3,3,4,3,4], [4,3,3,3,3,3,3,3,3,3,4,3,4,3,4]),
    reading: rows([4,1,4,1,4,4,3,1,4,2,3,2,4,1,3,2,4,3,4,1], [1,3,4,2,3,2,2,3,3,1,1,2,4,1,2,3,3,2,2,1], [2,2,2,2,2,2,3,3,2,3,3,3,3,2,3,3,3,2,2,2], [3,2,2,3,2,3,3,2,2,3,2,2,2,3,2,3,3,3,3,3])
  },
  'II-102': {
    source:"https://www.topikguide.com/download-102nd-topik-test-papers/",
    listening: rows([2,1,3,2,4,3,1,1,4,2,4,1,4,1,3,2,4,4,1,4,3,1,2,3,2], [2,3,4,2,3,3,4,1,1,2,3,1,4,4,2,2,3,1,2,3,3,2,1,4,4], twos(25), twos(25)),
    reading: rows([1,1,4,4,1,3,2,1,2,4,2,1,1,2,1,2,3,1,1,4,3,3,1,4,2], [2,3,4,3,2,4,1,3,4,3,3,4,4,3,2,4,2,3,2,1,3,2,4,4,3], twos(25), twos(25))
  }
};

export const TOPIK_LEVELS = {
 I:{title:'TOPIK I',subtitle:'Sơ cấp · 1–2급',durationMinutes:100,sections:[{key:'listening',label:'Nghe · 듣기',count:30,minutes:40,firstNumber:1},{key:'reading',label:'Đọc · 읽기',count:40,minutes:60,firstNumber:31}]},
 II:{title:'TOPIK II',subtitle:'Trung – Cao cấp · 3–6급',durationMinutes:180,sections:[{key:'listening',label:'Nghe · 듣기',count:50,minutes:60,firstNumber:1},{key:'writing',label:'Viết · 쓰기',count:4,minutes:50,firstNumber:51},{key:'reading',label:'Đọc · 읽기',count:50,minutes:70,firstNumber:1}]}
};

export function hasKey(level, examNumber){return !!VERIFIED_KEYS[`${level}-${examNumber}`];}
