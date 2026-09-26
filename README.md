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

Google Analytics (`G-MN2KJN5SSK`) loads only after an explicit, current statistics
consent, only on HTTPS bill-physio.de/www.bill-physio.de. No Google request occurs
before acceptance or after refusal (basic consent mode). Equal accept/refuse buttons,
a close/escape refusal, and persistent footer settings allow visitors to change their
choice. Every fresh entry, manual reload, reopened tab or history restoration asks
again even with a warm cache. Only a just-clicked internal link continues the current
visit, using a single-use sessionStorage transition marker. Choices last at most
30 minutes; persistent 180-day and legacy monthly preferences are discarded. GA
cookies are session cookies. Withdrawal deletes these cookies and reloads a page
that had loaded the tag. Refusals propagate to other opted-in tabs via BroadcastChannel;
acceptance never propagates to new tabs. Blocked storage preserves current-page choice.
HTML is revalidated by the browser; hashed assets can remain cached. The privacy notice
is readable before a choice, without an automatic modal.

Page views use known public paths, fixed titles and an empty referrer, without URL
queries or fragments. Ad storage, ad personalization and Google Signals are disabled
in code. GA property settings, processing terms and server retention still require
account verification before release; see PRIVACY-RELEASE.md. Preview/local acceptance
never sends real production statistics. Browser tests intercept all Google traffic.

No patient-data form, remote fonts or advertising integration is present. HTTP and
HTML Content Security Policies allow only the required Analytics hosts for scripts
and connections; forms and embedded frames stay blocked. IONOS server-log statistics
are distinct from browser Analytics and are described in the privacy notice.
Appointments are arranged by phone; email is for general organizational questions.
The two practice videos play automatically, muted and looping. Maps is an external link.

Original images remain in src/img for future edits; production uses optimized WebP.
Bootstrap 4 CSS is retained to preserve the existing layout; its JavaScript and jQuery
are not loaded. Dependency versions are locked and checked by npm audit.

See AUDIT-CORRECTIONS.md for evidence and items requiring account/administrative access.
See PRIVACY-RELEASE.md for the 26 September privacy patch and the confirmed IONOS
deployment blocker. A successful GitHub check or Vercel preview is not evidence that
the bill-physio.de production domain has been updated.
