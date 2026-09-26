# Corrections — 26 September 2026

## Implemented

- Removed pre-consent Analytics and the misleading monthly cookie modal. No tracking
  request, cookie or localStorage write is performed by the website.
- Removed the external FormSubmit patient-data form and false success toast. Telephone
  and email work as native links; medical documents are explicitly excluded from email.
- Added privacy information matching the implemented website, linked on every page.
- Updated the legal reference from TMG to DDG; removed the personal tax number and
  the false identification of Physio Deutschland as a statutory chamber. Added MPhG.
- Replaced incompatible Bootstrap/jQuery/Popper/AOS scripts with small native JavaScript.
  Fonts, CSS and icons are local. Content remains visible without JavaScript.
- Fixed unclosed HTML containers, mobile navigation, Escape handling, anchor navigation,
  heading hierarchy, accessible link names, focus outlines, link underlines and contrast.
- Images: 28,662,607 bytes of originals replaced in the build by 362,836 bytes of WebP
  (98.7% smaller). Explicit dimensions, deferred images and opt-in video playback.
- Added local SEO title, description, canonical, OpenGraph, MedicalBusiness structured
  data, sitemap and robots. The unfinished video page honestly states availability in
  German, has return/contact links, no fake signup/social links, and noindex.
- Added package-lock.json, npm ci, regression tests and browser/accessibility checks.
  Builds fail on errors. The IONOS workflow is restricted to main; duplicate Netlify
  workflow replaced by quality checks. Fixed IONOS workflow input/path typos and missing
  deployment configuration. Added a restrictive CSP and defensive response headers for Apache and Vercel.
- Removed possible credentials from dev.md without repeating them in this report.

## Verification

Local production build succeeded. Four Node regression tests and twelve Chromium
browser tests passed (desktop/mobile). Axe reports no WCAG A/AA violations on the
three pages in these tested views. All page images loaded; no missing requested assets,
external resource requests, cookies, localStorage writes or JavaScript errors occurred.
Video playback/pause and navigation without JavaScript were tested. These automated
checks do not establish full accessibility or legal compliance.

## Items that code alone cannot verify or resolve

1. Rotate any actual credentials formerly recorded in dev.md in their respective
   accounts. Git history still contains the previous values. Removing history does not
   revoke credentials; no destructive history rewrite was performed.
2. Confirm the practice's competent professional supervisory authority, exact registered
   proprietor name, professional qualification country and any applicable VAT/business
   identification number against its administrative documents. No authority or number
   was invented. The existing qualification country was preserved.
3. Confirm the precise hosting contract/entity, processing agreement, actual log
   retention and email handling. The privacy page describes the technical implementation
   and general retention criteria; it is not a certified legal review.
4. Confirm IONOS secrets/project connection and actual domain deployment. Two Vercel integrations (bill-physio and bill-physio-87f3) also build this repository. Dashboard
   access is needed to consolidate Netlify/Kinsta/Vercel deployments and integrations.
5. Protect main with required check `verify`, block force-push/deletion and require pull
   requests. Repository settings are external to these workflow files.

## Sources used for corrections

- DDG §5: https://www.gesetze-im-internet.de/ddg/__5.html
- Professional association: https://www.physio-deutschland.de/verband/
- MPhG: https://www.gesetze-im-internet.de/mphg/
- IONOS configuration: https://docs.ionos.space/docs/deployment-configuration/
- IONOS reference: https://raw.githubusercontent.com/ionos-deploy-now/laravel-starter/main/.deploy-now/config.yaml

## Deployment follow-up

PR #1 was merged after all GitHub/Linux checks passed. Vercel production deployed
commit b1671a3. GitHub flagged the inherited IONOS deployment workflow for a security
review. The static site does not need its template-renderer step, which passed the
entire repository secrets object into deployment files. That step and unnecessary
URL rewriting were removed; the SSH secret selector now validates its input and
passes it through a shell environment variable. No security gate was bypassed.
IONOS approval/account connection and deployment to bill-physio.de remain external.

## Requested video adjustment

The two practice videos now autoplay muted in a loop. The play buttons and their
JavaScript handlers were removed at the owner's request. Privacy wording and
browser checks have been updated to match.
