const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const state = import('data:text/javascript,' + encodeURIComponent(fs.readFileSync('src/js/consent-state.js', 'utf8')));
const now = 1790449000000;

test('only an explicit boolean choice with the current notice version is reusable', async () => {
  const { createConsent, parseConsent } = await state;
  for (const analytics of [true, false]) {
    const choice = createConsent(analytics, now);
    assert.deepEqual(parseConsent(JSON.stringify(choice), now), choice);
  }
  for (const raw of [null, '', 'true', 'false', '{', '{}', '{"analytics":true}', '{"version":"old","analytics":true}']) {
    assert.equal(parseConsent(raw, now), null);
  }
  assert.equal(parseConsent(JSON.stringify(createConsent('true', now)), now), null);
});

test('refusal and acceptance expire equally; future/tampered records fail closed', async () => {
  const { createConsent, parseConsent, CONSENT_LIFETIME } = await state;
  for (const analytics of [true, false]) {
    const record = createConsent(analytics, now);
    assert.equal(parseConsent(JSON.stringify(record), now + CONSENT_LIFETIME), null);
    assert.equal(parseConsent(JSON.stringify(record), now - 1), null);
    assert.equal(parseConsent(JSON.stringify({ ...record, expiresAt: now + 2 * CONSENT_LIFETIME }), now), null);
  }
});

test('statistics use an allowlisted page identity without queries, anchors or referrers', async () => {
  const { analyticsPage } = await state;
  for (const host of ['bill-physio.de', 'www.bill-physio.de']) {
    const page = analyticsPage(new URL(`https://${host}/index.html?email=patient@example.test#diagnose`));
    assert.equal(page.page_location, 'https://bill-physio.de/');
    assert.equal(page.page_referrer, '');
    assert.doesNotMatch(JSON.stringify(page), /patient|diagnose|email|\?|#/);
  }
});

test('previews, insecure URLs and unknown paths never load production analytics', async () => {
  const { analyticsPage } = await state;
  for (const url of ['https://bill-physio.vercel.app/', 'http://localhost:4200/', 'http://bill-physio.de/', 'https://evil-bill-physio.de/', 'https://bill-physio.de/patient/123', 'https://bill-physio.de/toString']) {
    assert.equal(analyticsPage(new URL(url)), null);
  }
});
