// MRLEE TOPIK scoring API. Source answer keys are in functions/_lib, not public assets.
// Practice results only; not a trusted wallet/leaderboard credit source.
// Server-only scoring dataset. This file is a Cloudflare Pages Function, not a static asset.
/**
 * TOPIK PBT archival catalogue.
 * The source pages link to publicly released papers/audio/answer sheets.
 * This site does not reproduce third-party PDFs or audio files.
 * Verified answer keys included for 35th, 96th and 102nd TOPIK I and II.
 * Unverified exams remain non-scoring by design.
 */
const TOPIK_EXAMS = [
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
const VERIFIED_KEYS = {
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

const TOPIK_LEVELS = {
 I:{title:'TOPIK I',subtitle:'Sơ cấp · 1–2급',durationMinutes:100,sections:[{key:'listening',label:'Nghe · 듣기',count:30,minutes:40,firstNumber:1},{key:'reading',label:'Đọc · 읽기',count:40,minutes:60,firstNumber:31}]},
 II:{title:'TOPIK II',subtitle:'Trung – Cao cấp · 3–6급',durationMinutes:180,sections:[{key:'listening',label:'Nghe · 듣기',count:50,minutes:60,firstNumber:1},{key:'writing',label:'Viết · 쓰기',count:4,minutes:50,firstNumber:51},{key:'reading',label:'Đọc · 읽기',count:50,minutes:70,firstNumber:1}]}
};

function hasKey(level, examNumber){return !!VERIFIED_KEYS[`${level}-${examNumber}`];}


const FIREBASE_PROJECT_ID = 'tieng-han-mr-lee';
const GOOGLE_JWKS = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const ENCODER = new TextEncoder();
const DURATION_MS = 15 * 60 * 1000;
let cachedJwks = null;
let cachedUntil = 0;

function output(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, private',
      'x-content-type-options': 'nosniff',
    },
  });
}
function base64UrlEncode(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function base64UrlDecode(s) {
  if (typeof s !== 'string' || !/^[A-Za-z0-9_-]+$/.test(s)) throw new Error('invalid encoding');
  const binary = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4));
  return Uint8Array.from(binary, x => x.charCodeAt(0));
}
function parseUrlJson(s) { return JSON.parse(new TextDecoder().decode(base64UrlDecode(s))); }
async function jwks() {
  if (cachedJwks && Date.now() < cachedUntil) return cachedJwks;
  const response = await fetch(GOOGLE_JWKS, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error('JWKS unavailable');
  const data = await response.json();
  if (!Array.isArray(data.keys) || !data.keys.length) throw new Error('JWKS invalid');
  const match = /max-age=(\d+)/i.exec(response.headers.get('cache-control') || '');
  const age = match ? Math.min(Number(match[1]), 3600) : 300;
  cachedJwks = data.keys;
  cachedUntil = Date.now() + Math.max(60, age) * 1000;
  return data.keys;
}
async function verifyFirebaseUser(request) {
  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.get('authorization') || '');
  if (!match || match[1].length > 6000) return null;
  const parts = match[1].split('.');
  if (parts.length !== 3) return null;
  try {
    const header = parseUrlJson(parts[0]);
    const claims = parseUrlJson(parts[1]);
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) return null;
    if (claims.aud !== FIREBASE_PROJECT_ID || claims.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null;
    if (typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 128) return null;
    if (!Number.isSafeInteger(claims.exp) || claims.exp <= now) return null;
    if (!Number.isSafeInteger(claims.iat) || claims.iat > now) return null;
    if (!Number.isSafeInteger(claims.auth_time) || claims.auth_time > now) return null;
    if (claims.email_verified !== true) return null;
    const keys = await jwks();
    const jwk = keys.find(k => k.kid === header.kid && k.kty === 'RSA' && k.n && k.e);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true }, {
      name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'
    }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, base64UrlDecode(parts[2]), ENCODER.encode(`${parts[0]}.${parts[1]}`));
    return ok ? { uid: claims.sub } : null;
  } catch { return null; }
}

export async function onRequestPost({request,env}) {
  const user = await verifyFirebaseUser(request);
  if (!user) return output({error:'firebase-sign-in-required-or-unverified'},401);
  // Fail closed if the D1 database has not been configured or is unavailable.
  if (!env?.MRLEE_QUIZ_DB || typeof env.MRLEE_QUIZ_DB.prepare !== 'function') {
    return output({error:'quiz-storage-unavailable'},503);
  }
  if (Number(request.headers.get('content-length') || 0) > 20000) return output({error:'request-too-large'},413);
  let body;
  try {
    const text = await request.text();
    if (text.length > 20000) return output({error:'request-too-large'},413);
    body = JSON.parse(text);
  } catch { return output({error:'invalid-json'},400); }
  if (!body || !['I','II'].includes(body.level) || !Number.isInteger(body.exam) ||
      !VERIFIED_KEYS[`${body.level}-${body.exam}`]) {
    return output({error:'unverified-topik-exam'},404);
  }
  const key = VERIFIED_KEYS[`${body.level}-${body.exam}`];
  const cfg = TOPIK_LEVELS[body.level];
  const answers = body.answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return output({error:'invalid-answers'},400);
  let points=0, correct=0;
  const sections={};
  for (const section of cfg.sections.filter(x => x.key !== 'writing')) {
    const rows=key[section.key];
    if (!Array.isArray(rows) || rows.length !== section.count) return output({error:'invalid-exam-key'},503);
    const group=answers[section.key] || {};
    if (!group || typeof group !== 'object' || Array.isArray(group) || Object.keys(group).length > section.count) {
      return output({error:'invalid-answers'},400);
    }
    let sectionRight=0, sectionPoints=0;
    for (const [rawNumber, value] of Object.entries(group)) {
      const number=Number(rawNumber);
      if (!Number.isInteger(number) || String(number)!==rawNumber ||
          number < section.firstNumber || number >= section.firstNumber+section.count ||
          ![1,2,3,4].includes(value)) return output({error:'invalid-answers'},400);
    }
    for (let i=0;i<section.count;i++) {
      const n=section.firstNumber+i;
      if (group[n] === rows[i][0]) { sectionRight++; sectionPoints+=rows[i][1]; }
    }
    sections[section.key]={points:sectionPoints,maxPoints:100,correct:sectionRight,total:section.count};
    correct+=sectionRight; points+=sectionPoints;
  }
  const grade = {graded:true,level:body.level,exam:body.exam,points,maxPoints:200,correct,
    total:body.level==='I'?70:100,sections};
  // Normalize every answer. Empty entries are allowed, but still consume one grading
  // attempt. This prevents the API being used as a one-question answer oracle.
  const normalized = cfg.sections.filter(s => s.key !== 'writing').map(section => {
    const group = answers[section.key] || {};
    return [section.key, Array.from({length:section.count}, (_,i) =>
      group[section.firstNumber + i] || 0)];
  });
  const canonical = JSON.stringify([body.level,body.exam,normalized]);
  const digest = await crypto.subtle.digest('SHA-256',ENCODER.encode(canonical));
  const fingerprint = base64UrlEncode(new Uint8Array(digest));
  // Daily quotas follow Vietnam time. PRIMARY KEY prevents simultaneous submissions
  // from bypassing the limit. The first submitted set of answers is authoritative.
  const vietnamDay = new Date(Date.now() + 7*60*60*1000).toISOString().slice(0,10);
  const db = env.MRLEE_QUIZ_DB;
  try {
    const saved = await db.prepare(`INSERT OR IGNORE INTO topik_attempts
      (uid,level,exam,day_vn,answers_sha256,result_json)
      VALUES (?,?,?,?,?,?)`)
      .bind(user.uid,body.level,body.exam,vietnamDay,fingerprint,JSON.stringify(grade)).run();
    if (saved?.success !== true) throw new Error('D1 insert failed');
    if (saved.meta?.changes === 1) return output(grade);
    const previous = await db.prepare(`SELECT answers_sha256,result_json
      FROM topik_attempts WHERE uid=? AND level=? AND exam=? AND day_vn=?`)
      .bind(user.uid,body.level,body.exam,vietnamDay).first();
    if (previous && previous.answers_sha256 === fingerprint) {
      return output(JSON.parse(previous.result_json));
    }
    return output({error:'topik-daily-limit',message:'Mỗi đề chỉ được chấm một lần/ngày. Bạn có thể xem lại kết quả đã nộp.'},429);
  } catch (err) {
    console.error('MRLEE TOPIK attempt database unavailable', err);
    return output({error:'quiz-storage-unavailable'},503);
  }
}
export function onRequestGet(){return output({error:'use-post-with-firebase-auth'},405);}
