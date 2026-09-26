const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
for (const route of ['/', '/videos.html', '/datenschutz.html']) {
  test(`${route} loads without broken assets, tracking or accessibility violations`, async ({ page }, testInfo) => {
    const errors = [], external = [], failed = [], media = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', request => {
      if (!request.url().startsWith('http://127.0.0.1:4200')) external.push(request.url());
      if (/\.mp4/.test(request.url())) media.push(request.url());
    });
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
    await page.goto(route);
    await page.evaluate(async () => { await document.fonts.ready; });
    await expect(page.locator('h1')).toBeVisible();
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty('complete', true);
      expect(await image.evaluate(el => el.naturalWidth)).toBeGreaterThan(0);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    // Local review artifact; headless Linux screenshot capture is not a site assertion.
    if (!process.env.CI) await page.screenshot({ path: testInfo.outputPath('page.png'), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations).toEqual([]);
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
    expect(external).toEqual([]);
    if (route !== '/') expect(media).toEqual([]);
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
    expect(await page.context().cookies()).toEqual([]);
  });
}
test('contact links and mobile menu work', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') {
    const toggle = page.locator('.navbar-toggler');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await toggle.click();
  }
  await page.locator('.navbar-nav a[href="#kontakt"]').click();
  await expect(page).toHaveURL(/#kontakt$/);
  await expect(page.locator('#kontakt a[href="tel:+4967197029941"]')).toBeVisible();
  await expect(page.locator('#kontakt a[href="mailto:kontakt@bill-physio.de"]')).toBeVisible();
  if (testInfo.project.name === 'mobile') await expect(page.locator('.navbar-toggler')).toHaveAttribute('aria-expanded', 'false');
});
test('content remains usable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
  const page = await context.newPage();
  const failed = [];
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  await page.goto(baseURL);
  await expect(page.locator('.navbar-nav a[href="#kontakt"]')).toBeVisible();
  await page.locator('.navbar-nav a[href="#kontakt"]').click();
  await expect(page.locator('#kontakt')).toBeVisible();
  await page.locator('footer a[href="datenschutz.html"]').click();
  await expect(page.locator('h1')).toHaveText('Datenschutzerklärung');
  expect(failed).toEqual([]);
  await context.close();
});
test('videos play automatically without play buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-video-toggle]')).toHaveCount(0);
  for (const id of ['home-video', 'about-video']) {
    const video = page.locator('#' + id);
    await expect(video).toHaveJSProperty('autoplay', true);
    await expect(video).toHaveJSProperty('muted', true);
    await expect(video).toHaveJSProperty('loop', true);
    if (await video.isVisible()) {
      await video.scrollIntoViewIfNeeded();
      await expect(video).toHaveJSProperty('paused', false);
      await expect.poll(() => video.evaluate(el => el.currentTime)).toBeGreaterThan(0);
    }
  }
});
