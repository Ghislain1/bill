import { removeAnalyticsCookies, removeLegacyConsent } from './privacy.js';
import { analyticsPage, createConsent, parseConsent, MEASUREMENT_ID, CONSENT_KEY } from './consent-state.js';

export function initializeConsent() {
    const disableKey = 'ga-disable-' + MEASUREMENT_ID;
    window[disableKey] = true;
    let storage, choice = null, tagStarted = false, expiryTimer;
    try {
        storage = window.localStorage;
        const raw = storage.getItem(CONSENT_KEY);
        choice = parseConsent(raw);
        // Do not reuse acceptance from read-only storage: withdrawal must remain
        // writable. Rewriting the identical value does not extend its lifetime.
        if (choice) storage.setItem(CONSENT_KEY, raw);
        else if (raw !== null) storage.removeItem(CONSENT_KEY);
    } catch { storage = undefined; choice = null; }
    removeLegacyConsent(storage);

    const dialog = document.createElement('dialog');
    dialog.className = 'cookie-dialog';
    dialog.setAttribute('aria-labelledby', 'cookie-title');
    dialog.setAttribute('aria-describedby', 'cookie-description');
    dialog.innerHTML = `
        <button type="button" class="cookie-close" aria-label="Ohne Statistik schließen">×</button>
        <p class="cookie-eyebrow">BILL PHYSIO · DATENSCHUTZ</p>
        <h2 id="cookie-title">Ihre Cookie-Auswahl</h2>
        <p id="cookie-description">Dürfen wir Google Analytics für freiwillige Besuchsstatistiken verwenden? Damit erfahren wir, wie unsere Website genutzt wird, und können sie verbessern.</p>
        <p>Bei Zustimmung erhält Google Ireland Limited unter anderem Seitenaufrufe, Geräteinformationen und eine Cookie-Kennung. Eine Verarbeitung in den USA ist möglich. Ihre Auswahl und Statistik-Cookies gelten für höchstens 180 Tage.</p>
        <p>Ohne Ihre Zustimmung laden wir Google Analytics nicht. Die Website bleibt nutzbar. Sie können Ihre Einwilligung jederzeit über <strong>Cookie-Einstellungen</strong> widerrufen.</p>
        <p><a href="datenschutz.html#statistik">Details in der Datenschutzerklärung</a></p>
        <p class="cookie-status" aria-live="polite"></p>
        <div class="cookie-actions">
            <button type="button" class="cookie-choice" data-consent="deny">Statistik ablehnen</button>
            <button type="button" class="cookie-choice" data-consent="allow">Statistik erlauben</button>
        </div>`;
    document.body.append(dialog);
    const status = dialog.querySelector('.cookie-status');

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
        status.textContent = choice?.analytics === true ? 'Aktuell: Statistik erlaubt. Mit „Statistik ablehnen“ widerrufen Sie Ihre Einwilligung.' :
            choice?.analytics === false ? 'Aktuell: Statistik abgelehnt.' : 'Aktuell: Google Analytics ist deaktiviert.';
        if (!dialog.open) dialog.showModal();
    }

    function stopAnalytics() {
        // Setting denied via the loaded Google tag could itself send cookieless
        // pings. Disable it first, discard queued work, then unload it by reloading.
        window[disableKey] = true;
        window.gtag = () => {};
        window.dataLayer = [];
        document.getElementById('bill-analytics')?.remove();
        removeAnalyticsCookies(document, window.location);
        if (tagStarted) window.location.reload();
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
            cookie_expires: Math.floor((choice.expiresAt - Date.now()) / 1000), cookie_update: false,
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
        // setTimeout has a 32-bit limit; recheck long-lived choices in bounded steps.
        expiryTimer = window.setTimeout(refreshChoice, Math.min(24 * 60 * 60 * 1000, Math.max(1, choice.expiresAt - Date.now())));
    }

    function refreshChoice() {
        choice = readChoice();
        if (choice?.analytics === true) startAnalytics();
        else stopAnalytics();
        scheduleExpiry();
        if (!choice && !window.location.pathname.endsWith('/datenschutz.html')) openSettings();
    }

    function choose(analytics) {
        choice = createConsent(analytics);
        try { storage?.setItem(CONSENT_KEY, JSON.stringify(choice)); }
        catch {
            // A full/blocked store must not leave an old acceptance behind.
            try { storage?.removeItem(CONSENT_KEY); } catch { /* Unwritable storage is ignored on reload. */ }
            storage = undefined;
        }
        dialog.close();
        if (analytics) startAnalytics();
        else stopAnalytics();
        scheduleExpiry();
    }

    dialog.querySelector('[data-consent="allow"]').addEventListener('click', () => choose(true));
    dialog.querySelector('[data-consent="deny"]').addEventListener('click', () => choose(false));
    dialog.querySelector('.cookie-close').addEventListener('click', () => choose(false));
    dialog.addEventListener('cancel', event => { event.preventDefault(); choose(false); });
    document.querySelectorAll('[data-cookie-settings]').forEach(button => {
        button.hidden = false;
        button.addEventListener('click', openSettings);
    });
    window.addEventListener('storage', event => {
        if (event.key === CONSENT_KEY || event.key === null) refreshChoice();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') refreshChoice();
    });
    if (choice?.analytics === true) startAnalytics();
    else removeAnalyticsCookies(document, window.location);
    scheduleExpiry();
    // The legal notice must remain readable before making a choice.
    if (!choice && !window.location.pathname.endsWith('/datenschutz.html')) openSettings();
}
