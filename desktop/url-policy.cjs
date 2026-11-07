'use strict';

const HOME = 'https://mrlee-b6a.pages.dev/';
const ORIGIN = new URL(HOME).origin;

/**
 * Only MR LEE's HTTPS website is displayed inside the app.
 * Other HTTPS links and mailto links go through the system browser/mail client.
 * Never allow file:, javascript:, http:, data: or lookalike domains.
 */
function classifyUrl(raw) {
  if (typeof raw !== 'string' || raw.length > 4096) return 'blocked';
  let url;
  try { url = new URL(raw); } catch { return 'blocked'; }
  if (url.username || url.password) return 'blocked';
  if (url.protocol === 'https:') {
    return url.origin === ORIGIN ? 'internal' : 'external';
  }
  if (url.protocol === 'mailto:' && url.pathname) return 'external';
  return 'blocked';
}

module.exports = { HOME, ORIGIN, classifyUrl };
