const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pages = ['index.html', 'videos.html', 'datenschutz.html'];
for (const page of pages) {
  test(`${page}: local assets, privacy and accessible structure`, () => {
    const html = fs.readFileSync(`src/${page}`, 'utf8');
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
    assert.match(html, /<main\b/);
    assert.match(html, /name="description"/);
    assert.match(html, /rel="canonical"/);
    assert.doesNotMatch(html, /googletagmanager|gtag\(|formsubmit\.co|<form\b|onclick=|\bautoplay\b/i);
    for (const match of html.matchAll(/<(?:script|link|img|source)\b[^>]*(?:src|href)="([^"]+)"/g)) {
      const ref = match[1];
      if (/^https:/.test(ref)) { assert.match(match[0], /rel="canonical"/); continue; }
      assert.ok(fs.existsSync(path.resolve('src', ref)), `Missing asset ${ref}`);
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(ids.length, new Set(ids).size, 'Duplicate ID');
    for (const [, ref] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(ref), `Missing anchor ${ref}`);
  });
}
test('reproducible build and single production pipeline', () => {
  assert.ok(fs.existsSync('package-lock.json'));
  assert.doesNotMatch(fs.readFileSync('.github/workflows/main.yml', 'utf8'), /actions-netlify|\|\| echo/);
  assert.match(fs.readFileSync('.github/workflows/bill-build.yaml', 'utf8'), /npm ci/);
  assert.ok(fs.existsSync('.deploy-now/bill/config.yaml'));
});

test('static deployment never expands all repository secrets into files', () => {
  const workflow = fs.readFileSync('.github/workflows/deploy-to-ionos.yaml', 'utf8');
  assert.doesNotMatch(workflow, /toJson\(secrets\)|template-renderer-action/);
  assert.match(workflow, /DEPLOYMENT_ID:/);
  assert.doesNotMatch(workflow, /run:.*\$\{\{ matrix/);
});
