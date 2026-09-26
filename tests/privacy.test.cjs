const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const privacyModule = import('data:text/javascript,' + encodeURIComponent(fs.readFileSync('src/js/privacy.js', 'utf8')));
function storageFor(entries) {
  const values = new Map(Object.entries(entries));
  return {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index]; },
    removeItem(key) { values.delete(key); },
    values,
  };
}

test('returning visitors: discard every former monthly consent without touching unrelated storage', async () => {
  const { removeLegacyTracking } = await privacyModule;
  const storage = storageFor({ Bill_Cookies_02026: 'true', Bill_Cookies_82026: 'false', Bill_Cookies_112025: 'true', preference: 'keep' });
  const writes = [];
  removeLegacyTracking(storage, { set cookie(value) { writes.push(value); } }, { hostname: 'www.bill-physio.de', protocol: 'https:' });
  assert.deepEqual([...storage.values], [['preference', 'keep']]);
  assert.equal(writes.length, 6);
  for (const value of writes) {
    assert.match(value, /^(?:_ga|_ga_MN2KJN5SSK)=; Max-Age=0; Path=\//);
    assert.match(value, /; Secure$/);
  }
  for (const name of ['_ga', '_ga_MN2KJN5SSK']) {
    assert.ok(writes.some(value => value.startsWith(name + '=;') && !value.includes('Domain=')));
    assert.ok(writes.some(value => value.startsWith(name + '=;') && value.includes('Domain=bill-physio.de')));
    assert.ok(writes.some(value => value.startsWith(name + '=;') && value.includes('Domain=www.bill-physio.de')));
  }
});

test('a preview removes no cookies for unrelated parent domains and creates no persistent cookie', async () => {
  const { removeLegacyTracking } = await privacyModule;
  const writes = [];
  removeLegacyTracking(storageFor({}), { set cookie(value) { writes.push(value); } }, { hostname: 'preview.vercel.app', protocol: 'https:' });
  assert.equal(writes.length, 4);
  assert.ok(writes.every(value => value.includes('Max-Age=0')));
  assert.ok(writes.every(value => !value.includes('Domain=vercel.app') && !value.includes('Domain=bill-physio.de')));
});

test('blocked browser storage/cookies cannot break contact or navigation', async () => {
  const { removeLegacyTracking } = await privacyModule;
  const blocked = { get length() { throw new Error('Storage blocked'); } };
  const cookieDocument = { set cookie(value) { throw new Error('Cookies blocked'); } };
  for (const storage of [undefined, blocked]) {
    assert.doesNotThrow(() => removeLegacyTracking(storage, cookieDocument, { hostname: 'bill-physio.de', protocol: 'https:' }));
  }
});

test('all pages block forms and frames with a restricted Analytics allowlist', () => {
  const headers = JSON.parse(fs.readFileSync('vercel.json', 'utf8')).headers[0].headers;
  const serverPolicy = headers.find(header => header.key === 'Content-Security-Policy').value;
  for (const file of ['index.html', 'datenschutz.html', 'videos.html']) {
    const html = fs.readFileSync('src/' + file, 'utf8');
    const policy = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
    for (const directive of ["frame-src 'none'", "form-action 'none'", "base-uri 'none'"]) {
      assert.ok(policy.includes(directive));
      assert.ok(serverPolicy.includes(directive));
    }
    assert.doesNotMatch(policy, /unsafe-inline|unsafe-eval|doubleclick|formsubmit/);
    assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<link'));
    assert.match(html, /name="referrer" content="no-referrer"/);
    assert.doesNotMatch(html, /<form\b|emailSuccessToast|cookiesBannerModal/i);
  }
  for (const file of ['public/.htaccess', 'scripts/serve.cjs']) {
    const content = fs.readFileSync(file, 'utf8');
    assert.match(content, /connect-src https:\/\/\*\.google-analytics\.com/);
    assert.match(content, /form-action 'none'/);
    assert.match(content, /no-referrer/);
  }
});
