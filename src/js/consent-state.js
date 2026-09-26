export const MEASUREMENT_ID = 'G-MN2KJN5SSK';
export const CONSENT_KEY = 'bill_physio_consent_v1';
export const CONSENT_VERSION = '2026-09-26-ga4-v1';
export const CONSENT_LIFETIME = 180 * 24 * 60 * 60 * 1000;

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
