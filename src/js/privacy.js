// Remove only identifiers used by the former Bill-Physio consent/GA integration.
// No analytics library, consent value or new visitor identifier is created.
export function removeLegacyTracking(storage, cookieDocument, location) {
    try {
        for (let index = storage.length - 1; index >= 0; index -= 1) {
            const key = storage.key(index);
            if (/^Bill_Cookies_(?:[0-9]|1[01])\d{4}$/.test(key)) {
                storage.removeItem(key);
            }
        }
    } catch {
        // Privacy mode or blocked storage must not prevent navigation/contact.
    }

    const domains = ['', location.hostname];
    if (location.hostname === 'bill-physio.de' || location.hostname.endsWith('.bill-physio.de')) {
        domains.push('bill-physio.de');
    }
    for (const name of ['_ga', '_ga_MN2KJN5SSK']) {
        for (const domain of new Set(domains)) {
            try {
                cookieDocument.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}${location.protocol === 'https:' ? '; Secure' : ''}`;
            } catch {
                // Also tolerate browsers that reject cookie access entirely.
            }
        }
    }
}
