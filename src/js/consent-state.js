export const MEASUREMENT_ID = 'G-MN2KJN5SSK';
export const CONSENT_KEY = 'bill_physio_visit_consent_v2';
export const CONSENT_VERSION = '2026-09-26-ga4-visit-v2';
export const CONSENT_LIFETIME = 30 * 60 * 1000;
export const TRANSITION_KEY = 'bill_physio_visit_transition_v2';

// Only a just-clicked internal link, or our own withdrawal reload, continues a
// visit. Cached pages, restored tabs and manually reopened URLs cannot reuse consent.
export function continuesVisit(raw, pathname, navigationType, now = Date.now()) {
    try {
        const transition = JSON.parse(raw);
        return transition?.path === pathname && Number.isSafeInteger(transition.timestamp) &&
            transition.timestamp <= now && now - transition.timestamp < 30000 &&
            ((transition.type === 'link' && navigationType === 'navigate') ||
             (transition.type === 'withdrawal' && navigationType === 'reload'));
    } catch { return false; }
}

export function createConsent(analytics, now = Date.now()) {
    return { version: CONSENT_VERSION, analytics, timestamp: now, expiresAt: now + CONSENT_LIFETIME };
}

export function parseConsent(raw, now = Date.now()) {
    try {
        const choice = JSON.parse(raw);
        if (choice?.version !== CONSENT_VERSION || typeof choice.analytics !== 'boolean' ||
            !Number.isSafeInteger(choice.timestamp) || choice.timestamp > now ||
            choice.expiresAt !== choice.timestamp + CONSENT_LIFETIME || choice.expiresAt <= now) return null;
        return choice;
    } catch { return null; }
}

// Preview deployments must never contaminate production statistics. Use only known
// public pages: query strings, anchors and arbitrary paths can contain health/PII data.
export function analyticsPage(location) {
    if (location.protocol !== 'https:' || !['bill-physio.de', 'www.bill-physio.de'].includes(location.hostname)) return null;
    const pages = {
        '/': ['/', 'Bill Physio – Startseite'],
        '/index.html': ['/', 'Bill Physio – Startseite'],
        '/videos.html': ['/videos.html', 'Bill Physio – Videotraining'],
        '/datenschutz.html': ['/datenschutz.html', 'Bill Physio – Datenschutz'],
    };
    if (!Object.hasOwn(pages, location.pathname)) return null;
    const [path, title] = pages[location.pathname];
    return { page_location: 'https://bill-physio.de' + path, page_title: title, page_referrer: '' };
}
