'use strict';
// Pure helpers for unit tests and server. All calendar decisions in Asia/Ho_Chi_Minh.
function vnDate(instant = new Date()) {
  const part = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(instant);
  const get = key => part.find(p => p.type === key).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function weekOf(date = new Date()) {
  const local = vnDate(date);
  const t = new Date(`${local}T00:00:00Z`);
  const monday = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - monday + 3);
  const isoYear = t.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  firstThursday.setUTCDate(firstThursday.getUTCDate() - (firstThursday.getUTCDay() + 6) % 7 + 3);
  const no = 1 + Math.round((t - firstThursday) / 604800000);
  return `${isoYear}-W${String(no).padStart(2, '0')}`;
}
function weekBefore(now = new Date()) { return weekOf(new Date(now.valueOf() - 7 * 86400000)); }
const POLICY = require('../../assets/mrlee-score-v12/points-policy.json');
// Server uses exactly the same versioned point schedule shown to learners.
function score(type, correct, total) {
  const cfg=POLICY.types[type];
  if(!cfg || !Number.isSafeInteger(correct) || !Number.isSafeInteger(total) ||
     total<=0 || correct<0 || correct>total || cfg.maxPoints<=0)return 0;
  const ratio=correct/total;
  return ratio<cfg.threshold?0:Math.min(cfg.maxPoints,Math.round(cfg.maxPoints*ratio));
}
module.exports = { vnDate, weekOf, weekBefore, score, POLICY };
