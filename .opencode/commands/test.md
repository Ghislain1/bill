---
description: Playwright-Tests ausführen und Fehler analysieren
agent: playwright-e2e-tester
---

Führe die Playwright-Tests aus und analysiere das Ergebnis.

1. Setup prüfen: `playwright.config.ts` vorhanden? Browser installiert (`npx playwright install` bei Bedarf)? Dev-Server-Konfiguration in Ordnung?
2. `npx playwright test` ausführen
3. Bei Fehlschlägen:
   - HTML-Report öffnen: `npx playwright show-report`
   - Trace bei Retries lesen: `npx playwright show-trace <trace.zip>`
   - Ursache klassifizieren: echtes Product-Bug (fixen + Spec sichern), Spec-Fehler (Spec anpassen), Flakiness (Selector/Wait-Strategie verbessern — Skills `playwright-testing` und `bootstrap4-ui`)
4. Zusammenfassung: Anzahl passed/failed/flaky, gefixte Ursachen, offene Punkte

Nicht laufende Tests nicht löschen oder skippen ohne Begründung.
