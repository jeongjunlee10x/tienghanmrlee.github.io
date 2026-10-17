// MR LEE Reward V2 — Supabase Edge Function.
// Firebase ID tokens are verified cryptographically; no Firebase Blaze is needed.
// IMPORTANT: deploy with verify_jwt=false because the function verifies Firebase JWTs itself.
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.1.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const FIREBASE_PROJECT_ID = 'tieng-han-mr-lee';
const jwks = createRemoteJWKSet(new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
), { timeoutDuration: 5000, cooldownDuration: 30000, cacheMaxAge: 3600000 });

const allowedOrigin = 'https://jeongjunlee10x.github.io';
function cors(req: Request) {
  const origin = req.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? allowedOrigin : allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
}
function response(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors(req), 'Content-Type': 'application/json; charset=utf-8' },
  });
}
function bad(msg: string, status = 400) { return { status, msg }; }
function validateWeek(w: unknown): w is string {
  if (typeof w !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(w)) return false;
  const d = new Date(w + 'T00:00:00.000Z');
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === w && d.getUTCDay() === 1;
}
const clean = (v: unknown, max: number) => typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max + 1) : '';
async function firebaseUid(req: Request) {
  const header = req.headers.get('Authorization') || '';
  if (!/^Bearer [A-Za-z0-9_\-.]+$/.test(header) || header.length > 10000)
    throw bad('Vui lòng đăng nhập Firebase.', 401);
  try {
    const { payload, protectedHeader } = await jwtVerify(header.slice(7), jwks, {
      algorithms: ['RS256'],
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
      clockTolerance: 10,
    });
    const now = Math.floor(Date.now() / 1000);
    if (protectedHeader.alg !== 'RS256' || typeof protectedHeader.kid !== 'string' ||
        typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128 ||
        typeof payload.iat !== 'number' || payload.iat > now + 10 ||
        typeof payload.auth_time !== 'number' || payload.auth_time > now + 10 ||
        payload.email_verified !== true ||
        (payload.firebase as { sign_in_provider?: string } | undefined)?.sign_in_provider === 'anonymous')
      throw new Error('Invalid Firebase identity claims');
    return payload.sub;
  } catch (_e) {
    throw bad('Phiên Firebase không hợp lệ hoặc chưa xác minh email.', 401);
  }
}
function database() {
  const url = Deno.env.get('SUPABASE_URL') || '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !key)
    throw bad('Hệ thống nhận thưởng chưa cấu hình máy chủ.', 503);
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

Deno.serve(async (req: Request) => {
  const headers = cors(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  const origin = req.headers.get('Origin');
  if (origin && origin !== allowedOrigin) return response(req, 403, { error: 'Nguồn truy cập không được phép.' });
  if (!['GET', 'POST'].includes(req.method)) return response(req, 405, { error: 'Phương thức không được hỗ trợ.' });
  try {
    const uid = await firebaseUid(req);
    const db = database();
    if (req.method === 'GET') {
      const { data: awards, error: errA } = await db.from('mrlee_reward_v2_awards')
        .select('week_start,full_name,points,rank,prize,prize_type')
        .eq('firebase_uid', uid).eq('published', true)
        .order('week_start', { ascending: false }).limit(30);
      if (errA) throw bad('Chưa tải được danh sách giải thưởng.', 503);
      const { data: claims, error: errC } = await db.from('mrlee_reward_v2_claims')
        .select('week_start,status').eq('firebase_uid', uid).limit(30);
      if (errC) throw bad('Chưa tải được trạng thái phiếu.', 503);
      const statuses = new Map((claims || []).map((c: {week_start: string, status: string}) => [c.week_start, c.status]));
      return response(req, 200, { awards: (awards || []).map((a: Record<string, unknown>) => ({
        ...a, claim_status: statuses.get(a.week_start as string) || 'not_submitted',
      })) });
    }
    if ((req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase() !== 'application/json')
      return response(req, 415, { error: 'Yêu cầu phải là JSON.' });
    const size = Number(req.headers.get('content-length') || '0');
    if (size > 4096) return response(req, 413, { error: 'Phiếu quá dài.' });
    const raw = await req.text();
    if (raw.length > 4096) return response(req, 413, { error: 'Phiếu quá dài.' });
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw); } catch (_e) { return response(req, 400, { error: 'JSON không hợp lệ.' }); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return response(req, 400, { error: 'Phiếu không hợp lệ.' });
    const week = body.week_start;
    if (!validateWeek(week)) return response(req, 400, { error: 'Tuần phải là ngày thứ Hai hợp lệ.' });
    const fullName = clean(body.full_name, 100);
    const bank = clean(body.bank_name, 90);
    const account = clean(body.account_number, 20);
    if (fullName.length < 2 || fullName.length > 100 || /[<>\x00-\x1f]/.test(fullName))
      return response(req, 400, { error: 'Họ tên không hợp lệ.' });
    if ((bank && (bank.length < 2 || bank.length > 90 || /[<>\x00-\x1f]/.test(bank))) ||
        (account && !/^\d{6,20}$/.test(account)))
      return response(req, 400, { error: 'Thông tin tài khoản không hợp lệ.' });
    // DB RPC atomically checks *published* award, monetary fields, and uniqueness.
    const { error } = await db.rpc('mrlee_reward_v2_submit_claim', {
      p_firebase_uid: uid, p_week_start: week, p_full_name: fullName,
      p_bank_name: bank, p_account_number: account,
    });
    if (error) {
      if (error.code === '23505') return response(req, 409, { error: 'Phiếu thưởng tuần này đã được gửi.' });
      if (error.code === 'P0001' || error.code === '23514') return response(req, 403, { error: 'Bạn chưa đủ điều kiện hoặc thông tin nhận thưởng không hợp lệ.' });
      return response(req, 503, { error: 'Chưa thể lưu phiếu. Vui lòng thử lại.' });
    }
    return response(req, 201, { ok: true, week_start: week, status: 'pending' });
  } catch (e: unknown) {
    const err = e as { status?: number, msg?: string };
    return response(req, err?.status || 503, { error: err?.msg || 'Không thể xử lý yêu cầu. Hãy thử lại.' });
  }
});
