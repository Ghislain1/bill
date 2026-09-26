# Bill-Physio

Static German-language website for the physiotherapy practice in Bad Kreuznach.
Canonical public URL: https://bill-physio.de/.
The repository also has two existing Vercel integrations (bill-physio and bill-physio-87f3).

## Development

Use Node.js 22 or newer and npm:

```sh
npm ci
npm run dev
```

## Verification

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The production build includes the homepage, video information page, privacy page,
robots.txt, sitemap.xml, security headers and a JavaScript-free navigation fallback.
Browser tests run against the production output with its Content Security Policy,
on desktop and mobile. They check local assets, no unsolicited external requests,
accessibility, navigation, contact links, video playback and no-JavaScript access.

## Deployment

`Site checks / verify` runs for pull requests and main. IONOS production deployment
runs only from main and repeats tests before uploading. The legacy Netlify deployment
has been removed to avoid two competing production pipelines. Existing external
Netlify/Kinsta/Vercel sites and dashboard integrations cannot be disabled by changing this
repository; see AUDIT-CORRECTIONS.md.

IONOS requires the existing IONOS_API_KEY, IONOS_SSH_KEY and deployment-specific SSH
username secrets, and the project must be connected to this repository. No credentials
belong in committed files. The static deployment configuration is in
`.deploy-now/bill/config.yaml`.

Vercel builds use vercel.json (npm ci, tests, build, dist output and security headers).
Git integrations configured in hosting dashboards are separate from GitHub workflows.

## Privacy and contact

No Analytics, third-party scripts, remote fonts, browser storage or patient-data form.
Appointments are arranged by phone; email is for general organizational questions.
Videos are downloaded only on explicit playback. Maps is an external link.

Original images remain in src/img for future edits; production uses optimized WebP.
Bootstrap 4 CSS is retained to preserve the existing layout; its JavaScript and jQuery
are not loaded. Dependency versions are locked and checked by npm audit.

See AUDIT-CORRECTIONS.md for evidence and items requiring account/administrative access.
