const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const key = 'bill_physio_visit_consent_v2';
const version = '2026-09-26-ga4-visit-v2';
const lifetime = 30 * 60000;
const root = path.resolve('dist');
const policy = require('../../vercel.json').headers[0].headers.find(h => h.key === 'Content-Security-Policy').value;
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };

// Serve the real production build at its allowed origin inside the test browser.
// All external requests are intercepted: tests never send data to Google/patients.
async function sandboxProduction(context) {
  const seen = { scripts: [], events: [], unexpected: [] };
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === 'https://bill-physio.de') {
      const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404 });
      return route.fulfill({ path: file, contentType: types[path.extname(file)] || 'application/octet-stream', headers: { 'Content-Security-Policy': policy, 'Referrer-Policy': 'no-referrer' } });
    }
    if (url.origin === 'https://www.googletagmanager.com' && url.pathname === '/gtag/js') {
      seen.scripts.push(url.href);
      return route.fulfill({ contentType: 'application/javascript', body: `
        if (!window['ga-disable-G-MN2KJN5SSK']) {
          document.cookie = '_ga=test; Path=/; Secure; SameSite=Lax';
          document.cookie = '_ga_MN2KJN5SSK=test; Path=/; Secure; SameSite=Lax';
          window.__consentTestQueue = Array.from(window.dataLayer, a => Array.from(a));
          for (const args of window.__consentTestQueue) {
            if (args[0] === 'event') fetch('https://www.google-analytics.com/g/collect', { method: 'POST', body: JSON.stringify(args), mode: 'no-cors' });
          }
        }` });
    }
    if (url.origin === 'https://www.google-analytics.com' && url.pathname === '/g/collect') {
      seen.events.push(request.postData());
      return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    seen.unexpected.push(url.href);
    return route.abort();
  });
  return seen;
}
const allow = page => page.getByRole('button', { name: 'Cookies erlauben', exact: true });
const deny = page => page.getByRole('button', { name: 'Cookies ablehnen', exact: true });
const settings = page => page.getByRole('button', { name: 'Cookie-Einstellungen', exact: true });

test('no Google request before choice; each reload or direct visit asks again', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await page.goto('https://bill-physio.de/');
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(seen.scripts).toHaveLength(0);
  expect(seen.events).toHaveLength(0);
  await deny(page).click();
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
  await deny(page).click();
  await page.goto('https://bill-physio.de/videos.html');
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(seen.scripts).toHaveLength(0);
  expect(seen.events).toHaveLength(0);
  expect(await context.cookies()).toEqual([]);
  expect(seen.unexpected).toEqual([]);
});

test('acceptance enables only analytics and sends one sanitized page view', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await page.goto('https://bill-physio.de/?email=patient@example.test#diagnose');
  await allow(page).click();
  await expect.poll(() => seen.events.length).toBe(1);
  expect(seen.scripts).toHaveLength(1);
  expect(seen.events[0]).not.toMatch(/patient|diagnose|email/);
  const queue = await page.evaluate(() => window.__consentTestQueue);
  const update = queue.find(args => args[0] === 'consent' && args[1] === 'update')[2];
  expect(update).toEqual({ analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  const config = queue.find(args => args[0] === 'config')[2];
  expect(config).toMatchObject({ send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_update: false, page_location: 'https://bill-physio.de/', page_referrer: '' });
  expect(config.cookie_expires).toBe(0);
  await settings(page).click();
  await allow(page).click();
  expect(seen.scripts).toHaveLength(1);
  expect(seen.events).toHaveLength(1);
  expect(seen.unexpected).toEqual([]);
});

test('withdrawal deletes cookies, disables the tag and survives the automatic reload', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await page.goto('https://bill-physio.de/');
  await allow(page).click();
  await expect.poll(() => seen.events.length).toBe(1);
  expect((await context.cookies()).some(c => c.name === '_ga')).toBe(true);
  await settings(page).click();
  await Promise.all([page.waitForEvent('load'), deny(page).click()]);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(await page.evaluate(() => window['ga-disable-G-MN2KJN5SSK'])).toBe(true);
  expect(await context.cookies()).toEqual([]);
  expect(seen.scripts).toHaveLength(1);
  expect(seen.events).toHaveLength(1);
  await page.reload();
  expect(seen.scripts).toHaveLength(1);
  expect(seen.unexpected).toEqual([]);
});

test('privacy notice is readable before deciding; closing the popup refuses analytics', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await page.goto('https://bill-physio.de/');
  await page.getByRole('link', { name: 'Details in der Datenschutzerklärung' }).click();
  await expect(page.locator('#statistik')).toBeVisible();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await settings(page).click();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)).analytics, key)).toBe(false);
  await page.locator('footer a[href="index.html#impressum"]').click();
  await expect(page.locator('#impressum-title')).toBeInViewport();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)).analytics, key)).toBe(false);
  expect(seen.scripts).toHaveLength(0);
  expect(seen.unexpected).toEqual([]);
});

for (const route of ['/', '/index.html', '/videos.html']) {
  test(`Impressum link from the popup on ${route} does not record a cookie choice`, async ({ page, context }) => {
    const seen = await sandboxProduction(context);
    await page.goto('https://bill-physio.de' + route);
    await page.getByRole('dialog').getByRole('link', { name: 'Impressum', exact: true }).click();
    await expect(page).toHaveURL('https://bill-physio.de/index.html#impressum');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('#impressum-title')).toBeInViewport();
    await expect(page.locator('#impressum')).toBeFocused();
    expect(await page.evaluate(key => sessionStorage.getItem(key), key)).toBeNull();

    // Reopening settings on the same fragment must not trap visitors in the modal.
    await settings(page).click();
    await page.getByRole('dialog').getByRole('link', { name: 'Impressum', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('#impressum-title')).toBeInViewport();
    expect(await page.evaluate(key => sessionStorage.getItem(key), key)).toBeNull();
    expect(await context.cookies()).toEqual([]);
    expect(seen.scripts).toHaveLength(0);
    expect(seen.events).toHaveLength(0);
    expect(seen.unexpected).toEqual([]);
  });
}

test('direct Impressum visits remain readable after reload, tab return and history restoration', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  for (const route of ['/#impressum', '/index.html#impressum']) {
    await page.goto('https://bill-physio.de' + route);
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('#impressum-title')).toBeInViewport();
    await page.reload();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('#impressum-title')).toBeInViewport();
    expect(await page.evaluate(key => sessionStorage.getItem(key), key)).toBeNull();
  }
  expect(await context.cookies()).toEqual([]);
  expect(seen.scripts).toHaveLength(0);
  expect(seen.events).toHaveLength(0);
  expect(seen.unexpected).toEqual([]);
});

test('expired or legacy acceptance cannot activate Google', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await context.addInitScript(({ key, version, lifetime }) => {
    const timestamp = Date.now() - lifetime - 1000;
    sessionStorage.setItem(key, JSON.stringify({ version, analytics: true, timestamp, expiresAt: timestamp + lifetime }));
    localStorage.setItem('Bill_Cookies_82026', 'true');
  }, { key, version, lifetime });
  await page.goto('https://bill-physio.de/');
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(seen.scripts).toHaveLength(0);
  expect(await page.evaluate(() => localStorage.getItem('Bill_Cookies_82026'))).toBeNull();
  expect(seen.unexpected).toEqual([]);
});

test('blocked storage still allows an explicit choice for the current page', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await context.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage blocked'); } }));
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://bill-physio.de/');
  await expect(page.getByRole('dialog')).toBeVisible();
  await allow(page).click();
  await expect.poll(() => seen.events.length).toBe(1);
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(seen.scripts).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('a refusal in another tab stops an already loaded tag', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await page.goto('https://bill-physio.de/');
  await allow(page).click();
  await expect.poll(() => seen.events.length).toBe(1);
  const other = await context.newPage();
  await other.goto('https://bill-physio.de/videos.html');
  await expect(other.getByRole('dialog')).toBeVisible();
  expect(seen.events).toHaveLength(1);
  await allow(other).click();
  await expect.poll(() => seen.events.length).toBe(2);
  await settings(other).click();
  await Promise.all([page.waitForEvent('load'), other.waitForEvent('load'), deny(other).click()]);
  expect(await page.evaluate(() => window['ga-disable-G-MN2KJN5SSK'])).toBe(true);
  expect(await context.cookies()).toEqual([]);
  expect(seen.scripts).toHaveLength(2);
  expect(seen.events).toHaveLength(2);
});

test('read-only storage cannot reactivate an old acceptance', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await context.addInitScript(({ key, version, lifetime }) => {
    const timestamp = Date.now();
    sessionStorage.setItem(key, JSON.stringify({ version, analytics: true, timestamp, expiresAt: timestamp + lifetime }));
    Storage.prototype.setItem = () => { throw new Error('Read-only storage'); };
    Storage.prototype.removeItem = () => { throw new Error('Read-only storage'); };
  }, { key, version, lifetime });
  await page.goto('https://bill-physio.de/');
  await expect(page.getByRole('dialog')).toBeVisible();
  await deny(page).click();
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(seen.scripts).toHaveLength(0);
  expect(seen.events).toHaveLength(0);
});

test('an acceptance expires while the page remains open', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await page.clock.install();
  await page.goto('https://bill-physio.de/');
  await allow(page).click();
  await expect.poll(() => seen.events.length).toBe(1);
  await Promise.all([page.waitForEvent('load'), page.clock.fastForward(lifetime + 1000)]);
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => window['ga-disable-G-MN2KJN5SSK'])).toBe(true);
  expect(await context.cookies()).toEqual([]);
  expect(seen.events).toHaveLength(1);
});

test('acceptance on a preview never sends production measurements', async ({ page }) => {
  const google = [];
  page.on('request', req => { if (/google/.test(new URL(req.url()).hostname)) google.push(req.url()); });
  await page.goto('/');
  await allow(page).click();
  expect(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)).analytics, key)).toBe(true);
  await expect(page.locator('#bill-analytics')).toHaveCount(0);
  expect(google).toEqual([]);
});

test('internal links preserve the choice; returning from outside starts a new visit', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await page.goto('https://bill-physio.de/');
  await allow(page).click();
  await expect.poll(() => seen.events.length).toBe(1);
  await page.locator('footer a[href="datenschutz.html"]').click();
  await expect.poll(() => seen.events.length).toBe(2);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('link', { name: 'Bill-Physio · Zur Startseite' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect.poll(() => seen.events.length).toBe(3);
  await page.goto('about:blank');
  await page.goBack();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(seen.events).toHaveLength(3);
  expect(await context.cookies()).toEqual([]);
});

test('a reopened tab prompts again while browser cookies and persistent storage are preserved', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await page.goto('https://bill-physio.de/');
  await allow(page).click();
  await expect.poll(() => seen.events.length).toBe(1);
  await page.evaluate(() => {
    localStorage.setItem('unrelated-setting', 'keep');
    localStorage.setItem('bill_physio_consent_v1', JSON.stringify({ analytics: true, version: '2026-09-26-ga4-v1' }));
  });
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto('https://bill-physio.de/');
  await expect(reopened.getByRole('dialog')).toBeVisible();
  expect(await reopened.evaluate(() => localStorage.getItem('unrelated-setting'))).toBe('keep');
  expect(await reopened.evaluate(() => localStorage.getItem('bill_physio_consent_v1'))).toBeNull();
  expect(seen.events).toHaveLength(1);
  expect(await context.cookies()).toEqual([]);
});

test('a persisted pageshow discards a live tag and its prior acceptance', async ({ page, context }) => {
  const seen = await sandboxProduction(context);
  await page.goto('https://bill-physio.de/');
  await allow(page).click();
  await expect.poll(() => seen.events.length).toBe(1);
  // Exercise the restoration handler even when the CI browser disables bfcache.
  await Promise.all([
    page.waitForEvent('load'),
    page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    }),
  ]);
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => window['ga-disable-G-MN2KJN5SSK'])).toBe(true);
  expect(seen.events).toHaveLength(1);
  expect(await context.cookies()).toEqual([]);
});

test('a warm HTTP asset cache never suppresses the popup on a fresh page opening', async ({ page }) => {
  // No request routing here: real HTTP caching remains enabled.
  await page.goto('/');
  await allow(page).click();
  await page.goto('about:blank');
  await page.goto('/');
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some(entry =>
    /\.(js|css)$/.test(new URL(entry.name).pathname) && entry.transferSize === 0 && entry.decodedBodySize > 0
  ))).toBe(true);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
