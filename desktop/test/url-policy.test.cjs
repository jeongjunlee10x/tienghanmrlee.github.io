'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { HOME, classifyUrl } = require('../url-policy.cjs');

test('correct official Cloudflare production URL', () => {
  assert.equal(HOME, 'https://mrlee-b6a.pages.dev/');
});
test('website subpages stay inside the desktop application', () => {
  for (const url of [
    HOME,
    HOME + 'hoc-tieng-han.html',
    HOME + 'admin.html?tab=students#overview',
    HOME + 'mrlee-game-arena.html'
  ]) assert.equal(classifyUrl(url), 'internal');
});
test('legitimate third-party HTTPS and email links open outside app', () => {
  assert.equal(classifyUrl('https://www.tiktok.com/@hankuc_chemi'), 'external');
  assert.equal(classifyUrl('https://accounts.google.com/'), 'external');
  assert.equal(classifyUrl('mailto:hello@example.com'), 'external');
});
test('unsafe schemes and spoofed URLs are blocked', () => {
  for (const url of [
    'http://mrlee-b6a.pages.dev/',
    'https://mrlee-b6a.pages.dev.evil.example/',
    'https://mrlee-b6a.pages.dev@evil.example/',
    'javascript:alert(1)',
    'file:///C:/Windows/system.ini',
    'data:text/html,unsafe',
    'about:blank',
    '//mrlee-b6a.pages.dev/path',
    '',
    null
  ]) assert.equal(classifyUrl(url), 'blocked', String(url));
});
