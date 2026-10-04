---
description: Projekt-Grundstruktur mit dem HTML5-Parcel-Stack anlegen
agent: html5-parcel-frontend
---

Lege eine saubere Projektgrundstruktur für ein HTML5-Projekt mit Parcel an, falls noch nicht vorhanden.

**Stack (exakt diese Versionen):**

```json
{
  "devDependencies": {
    "@axe-core/playwright": "^4.11.1",
    "@parcel/packager-raw-url": "^2.16.4",
    "@parcel/transformer-jsonld": "^2.16.4",
    "@playwright/test": "^1.58.2",
    "bootstrap": "4.6.2",
    "parcel": "^2.16.0"
  },
  "dependencies": {
    "simple-line-icons": "2.5.5"
  }
}
```

**Schritte:**

1. Ordnerstruktur anlegen: `src/` (HTML, CSS, JS, Assets), `tests/` (Playwright-Specs), `dist/` (Build-Output, gitignored)
2. `package.json` mit dem Stack oben + Scripts anlegen:
   - `"start": "parcel src/index.html --port 1234"`
   - `"build": "parcel build src/index.html --dist-dir dist --public-url ./"`
   - `"test": "playwright test"`
3. `.parcelrc` mit transformer-jsonld + packager-raw-url (Vorlage im Skill `parcel-build`)
4. `src/index.html` als semantische HTML5-Vorlage mit Bootstrap-4.6-CSS, simple-line-icons, Viewport-Meta und JSON-LD-Platzhalter (Skill `bootstrap4-ui` und `jsonld-seo` laden)
5. `playwright.config.ts` nach Vorlage im Skill `playwright-testing`
6. `.gitignore` mit `node_modules/`, `dist/`, `.parcel-cache/`, `test-results/`, `playwright-report/`
7. `npm install` ausführen und Build mit `npm run build` verifizieren

Bestehende Dateien nicht überschreiben — fehlende ergänzen.
