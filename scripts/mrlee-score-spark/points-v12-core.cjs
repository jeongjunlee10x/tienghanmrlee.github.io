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
function score(type, correct, total) {
  if (type === 'attendance') return 0;
  const pc = total > 0 ? correct / total : 0;
  if (type === 'quiz') return pc < .6 ? 0 : Math.min(12, Math.round(12 * pc));
  if (type === 'listening') return pc < .6 ? 0 : Math.min(20, Math.round(20 * pc));
  if (type === 'mock') return pc < .5 ? 0 : Math.min(40, Math.round(40 * pc));
  if (type === 'mock-listening' || type === 'mock-reading') return pc < .6 ? 0 : Math.min(12, Math.round(12 * pc));
  return 0;
}
module.exports = { vnDate, weekOf, weekBefore, score };
