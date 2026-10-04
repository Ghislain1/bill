import { removeAnalyticsCookies, removeLegacyConsent } from './privacy.js';
import { analyticsPage, createConsent, parseConsent, continuesVisit, MEASUREMENT_ID, CONSENT_KEY, TRANSITION_KEY } from './consent-state.js';

export function initializeConsent() {
    const disableKey = 'ga-disable-' + MEASUREMENT_ID;
    window[disableKey] = true;
    let storage, channel, choice = null, tagStarted = false, expiryTimer;
    try { removeLegacyConsent(window.localStorage); } catch { /* Persistent storage is never a consent source. */ }
    try {
        storage = window.sessionStorage;
        const transition = storage.getItem(TRANSITION_KEY);
        storage.removeItem(TRANSITION_KEY);
        const raw = storage.getItem(CONSENT_KEY);
        const navigationType = performance.getEntriesByType('navigation')[0]?.type;
        choice = continuesVisit(transition, window.location.pathname, navigationType) ? parseConsent(raw) : null;
        // Do not reuse acceptance from read-only storage: withdrawal must remain
        // writable. Rewriting the identical value does not extend its lifetime.
        if (choice) storage.setItem(CONSENT_KEY, raw);
        else if (raw !== null) storage.removeItem(CONSENT_KEY);
    } catch { storage = undefined; choice = null; }

    const dialog = document.createElement('dialog');
    dialog.className = 'cookie-dialog';
    dialog.setAttribute('aria-labelledby', 'cookie-title');
    dialog.setAttribute('aria-describedby', 'cookie-description');
    dialog.innerHTML = `
        <button type="button" class="cookie-close" aria-label="Ohne Cookies schließen">×</button>
        <p class="cookie-eyebrow">BILL PHYSIO · DATENSCHUTZ</p>
        <h2 id="cookie-title">Ihre Cookie-Auswahl</h2>
        <p id="cookie-description">Dürfen wir Google Analytics für freiwillige Besuchsstatistiken verwenden? Damit erfahren wir, wie unsere Website genutzt wird, und können sie verbessern.</p>
        <p>Bei Zustimmung erhält Google Ireland Limited unter anderem Seitenaufrufe, Geräteinformationen und eine Cookie-Kennung. Eine Verarbeitung in den USA ist möglich. Ihre Auswahl gilt nur für diesen Besuch, höchstens 30 Minuten. Beim erneuten Öffnen fragen wir wieder.</p>
        <p>Ohne Ihre Zustimmung laden wir Google Analytics nicht. Die Website bleibt nutzbar. Sie können Ihre Einwilligung jederzeit über <strong>Cookie-Einstellungen</strong> widerrufen.</p>
        <p><a href="datenschutz.html#statistik">Details in der Datenschutzerklärung</a> · <a href="index.html#impressum" data-impressum-link>Impressum</a></p>
        <p class="cookie-status" aria-live="polite"></p>
        <div class="cookie-actions">
            <button type="button" class="cookie-choice" data-consent="deny">Cookies ablehnen</button>
            <button type="button" class="cookie-choice" data-consent="allow">Cookies erlauben</button>
        </div>`;
    document.body.append(dialog);
    const status = dialog.querySelector('.cookie-status');

    function isReadingLegalNotice() {
        return window.location.pathname.endsWith('/datenschutz.html') ||
            (['/', '/index.html'].includes(window.location.pathname) && window.location.hash === '#impressum');
    }

    function readChoice() {
        if (storage) {
            try {
                const raw = storage.getItem(CONSENT_KEY);
                const stored = parseConsent(raw);
                if (stored) storage.setItem(CONSENT_KEY, raw);
                else if (raw !== null) storage.removeItem(CONSENT_KEY);
                return stored;
            }
            catch { storage = undefined; }
        }
        return parseConsent(JSON.stringify(choice));
    }

    function openSettings() {
        status.textContent = choice?.analytics === true ? 'Aktuell: Cookies erlaubt. Mit „Cookies ablehnen“ widerrufen Sie Ihre Einwilligung.' :
            choice?.analytics === false ? 'Aktuell: Cookies abgelehnt.' : 'Aktuell: Google Analytics ist deaktiviert.';
        if (!dialog.open) dialog.showModal();
    }

    function rememberTransition(path, type) {
        if (!choice) return;
        try { storage?.setItem(TRANSITION_KEY, JSON.stringify({ path, type, timestamp: Date.now() })); }
        catch { /* If it cannot be saved, ask again on the next page. */ }
    }

    function stopAnalytics() {
        // Setting denied via the loaded Google tag could itself send cookieless
        // pings. Disable it first, discard queued work, then unload it by reloading.
        window[disableKey] = true;
        window.gtag = () => {};
        window.dataLayer = [];
        document.getElementById('bill-analytics')?.remove();
        removeAnalyticsCookies(document, window.location);
        if (tagStarted) {
            if (choice?.analytics === false) rememberTransition(window.location.pathname, 'withdrawal');
            window.location.reload();
        }
    }

    function startAnalytics() {
        const page = analyticsPage(window.location);
        if (tagStarted || choice?.analytics !== true || !page) return;
        tagStarted = true;
        window[disableKey] = false;
        window.dataLayer = [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        const advertisingDenied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
        window.gtag('consent', 'default', { ...advertisingDenied, analytics_storage: 'denied' });
        window.gtag('consent', 'update', { ...advertisingDenied, analytics_storage: 'granted' });
        window.gtag('set', { ...page, ads_data_redaction: true, url_passthrough: false,
            allow_google_signals: false, allow_ad_personalization_signals: false });
        window.gtag('js', new Date());
        window.gtag('config', MEASUREMENT_ID, { ...page, send_page_view: false,
            allow_google_signals: false, allow_ad_personalization_signals: false,
            cookie_expires: 0, cookie_update: false,
            cookie_domain: window.location.hostname, cookie_flags: 'SameSite=Lax;Secure' });
        window.gtag('event', 'page_view', { ...page, send_to: MEASUREMENT_ID });
        const script = document.createElement('script');
        script.id = 'bill-analytics';
        script.async = true;
        script.referrerPolicy = 'no-referrer';
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
        document.head.append(script);
    }

    function scheduleExpiry() {
        window.clearTimeout(expiryTimer);
        if (!choice) return;
        expiryTimer = window.setTimeout(refreshChoice, Math.max(1, choice.expiresAt - Date.now()));
    }

    function refreshChoice() {
        choice = readChoice();
        if (choice?.analytics === true) startAnalytics();
        else stopAnalytics();
        scheduleExpiry();
        if (!choice && !isReadingLegalNotice()) openSettings();
    }

    function choose(analytics, broadcast = true) {
        choice = createConsent(analytics);
        try { storage?.setItem(CONSENT_KEY, JSON.stringify(choice)); }
        catch {
            // A full/blocked store must not leave an old acceptance behind.
            try { storage?.removeItem(CONSENT_KEY); } catch { /* Unwritable storage is ignored on reload. */ }
            storage = undefined;
        }
        dialog.close();
        if (!analytics && broadcast) {
            try { channel?.postMessage('deny'); } catch { /* Local withdrawal still applies. */ }
        }
        if (analytics) startAnalytics();
        else stopAnalytics();
        scheduleExpiry();
    }

    dialog.querySelector('[data-consent="allow"]').addEventListener('click', () => choose(true));
    dialog.querySelector('[data-consent="deny"]').addEventListener('click', () => choose(false));
    dialog.querySelector('.cookie-close').addEventListener('click', () => choose(false));
    // Reading the Impressum is neither acceptance nor refusal. Also close when
    // the link targets the current document, where no initialization runs again.
    dialog.querySelector('[data-impressum-link]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('cancel', event => { event.preventDefault(); choose(false); });
    document.querySelectorAll('[data-cookie-settings]').forEach(button => {
        button.hidden = false;
        button.addEventListener('click', openSettings);
    });
    // A new tab needs its own choice. Only refusals, never acceptances, propagate.
    try {
        channel = new BroadcastChannel('bill_physio_privacy_v2');
        channel.addEventListener('message', event => {
            if (event.data === 'deny' && choice?.analytics === true) choose(false, false);
        });
    } catch { /* Tabs remain independent when cross-tab communication is unavailable. */ }
    document.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest('a[href]');
        if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
        const destination = new URL(link.href, window.location.href);
        if (destination.origin !== window.location.origin ||
            !['/', '/index.html', '/videos.html', '/datenschutz.html'].includes(destination.pathname)) return;
        if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;
        rememberTransition(destination.pathname, 'link');
    });
    // A restored page may keep its old JS heap. Disable the tag before it is
    // frozen, then discard the old choice when the browser brings it back.
    window.addEventListener('pagehide', () => { window[disableKey] = true; });
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;
        choice = null;
        try { storage?.removeItem(CONSENT_KEY); storage?.removeItem(TRANSITION_KEY); } catch { storage = undefined; }
        stopAnalytics();
        scheduleExpiry();
        if (!isReadingLegalNotice()) openSettings();
    });
    window.addEventListener('hashchange', () => {
        if (isReadingLegalNotice() && dialog.open) dialog.close();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') refreshChoice();
    });
    if (choice?.analytics === true) startAnalytics();
    else removeAnalyticsCookies(document, window.location);
    scheduleExpiry();
    // Both legal notices must remain readable before making a choice.
    if (!choice && !isReadingLegalNotice()) openSettings();
}
