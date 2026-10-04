# AGENTS.md

## Build & Dev

- Node >= 22 (see engines). Use `npm ci` for clean installs.
- Dev: `npm run dev` serves at http://localhost:4200 via Parcel (serves src/*.html).
- Build: `npm run build` runs Parcel to build `src/index.html`, `src/videos.html`, `src/datenschutz.html` to `dist/`, then runs `scripts/copy-static.cjs` to copy `robots.txt`, `sitemap.xml`, `.htaccess` and `src/css/nojs.css`.
- Serve built site for local checks: `node scripts/serve.cjs` serves `dist/` on http://127.0.0.1:4200 with security headers (CSP allowing GA4/gtag).
- Output: `dist/` with hashed assets. `public/` contains static files copied to dist on build.

## Test Commands

- Unit tests: `npm test` runs `node --test tests/*.test.cjs`. Verifies h1/main/SEO, local assets exist, no inline handlers, IDs unique/anchored, no Netlify in workflows, IONOS workflow sanity.
- Install Playwright browser (once locally): `npx playwright install chromium` (CI uses `--with-deps chromium`).
- Browser tests: `npm run test:browser` runs Playwright tests in `tests/browser/*.spec.cjs` against production build served by `scripts/serve.cjs`. Runs on Desktop Chrome and iPhone 13 (mobile).

## Key Build/Toolchain Quirks

- Parcel v2 with custom transformers: `@parcel/packager-raw-url`, `@parcel/transformer-jsonld`. Uses `browserslist` >0.5%, last 2 versions, not dead.
- Bootstrap 4.6.2 CSS only; jQuery/Bootstrap JS not used. `simple-line-icons` 2.5.5.
- Images: original in `src/img/`, optimized WebP used in production. noscript fallback CSS copied explicitly (Parcel treats as text).
- Static server (`scripts/serve.cjs`) enforces same-origin, proper MIME types, CSP, and short/no-cache for HTML vs assets.

## Testing Quirks

- Browser tests require built dist (`npm run build` first) - webServer serves dist.
- Tests block unsolicited external requests (only http://127.0.0.1:4200 allowed). Any external request fails the test.
- On non-CI runs, site.spec.cjs saves a full-page screenshot to Playwright output (local review only).
- Consent: tests dismiss the consent dialog (accept/refuse behavior validated). GA4 traffic is intercepted; tests expect no Google/network calls in normal flow.
- Accessibility: axe-core checks (`wcag2a, wcag2aa, wcag21aa`) with no violations. Images must be loaded (naturalWidth>0). No JS/no tracking assertions.

## Architecture & Boundaries

- Pure static site: HTML/CSS/JS in `src/`. Three pages: `index.html`, `videos.html`, `datenschutz.html`.
- Entry JS: `src/js/script.js` imports `consent.js` and initializes consent, handles mobile nav, header height, scroll effects, year.
- Consent: `src/js/consent.js` + `src/js/consent-state.js` + `src/js/privacy.js`. GA4 loads only after explicit statistics consent on https://bill-physio.de/www.bill-physio.de. Visit-scoped consent (max 30 min), transition marker via sessionStorage, BroadcastChannel propagation on withdrawal, legacy cleanup.
- CSP is consistent: source files have meta CSP, built server sets CSP headers (dist/served), Vercel sets headers. All allow only self + GA4 domains as needed.

## Deployments & CI

- IONOS Deploy Now: workflows in `.github/workflows/` - `bill-orchestration.yaml` (main, dispatch), `bill-build.yaml` (build, test, install chromium, browser tests, upload artifact), `deploy-to-ionos.yaml` (deployment). Production deploys only from main.
- Vercel: `vercel.json` uses `npm ci`, runs `npm test && npm run build`, outputs `dist/`, sets security headers including CSP and Cache-Control per HTML page.
- Deploy config: `.deploy-now/bill/config.yaml`. Two Vercel integrations exist; repository cannot disable external hosting dashboards.
- CI guardrails: tests prevent Netlify references in workflows, validate IONOS workflow sanity, ensure no secrets expanded via `toJson(secrets)`.

## Do's/Don'ts

- Do not add forms or external font/ads integrations. No patient-data forms; contact is phone/email.
- Do not commit secrets. Never store credentials/tokens in repo.
- When changing HTML, preserve accessibility (h1 once, <main>, unique IDs, aria-*), local asset references, CSP compatibility.
- Build before running browser tests - they test `dist/`.
- Respect consent logic: do not pre-load GA; do not propagate acceptance to new tabs.
- Keep Bootstrap 4 CSS; do not reintroduce its JS/jQuery.
