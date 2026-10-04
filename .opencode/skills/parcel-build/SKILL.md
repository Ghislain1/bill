---
name: parcel-build
description: Parcel-2.16-Workflows für HTML5-Projekte — Dev-Server, Production-Build, Cache-Troubleshooting, .parcelrc-Konfiguration für transformer-jsonld und packager-raw-url.
---

# Parcel-Build-Workflows

## Standard-Kommandos

```bash
# Dev-Server mit Hot Reload
npx parcel src/index.html --port 1234

# Production-Build
npx parcel build src/index.html --dist-dir dist --public-url ./

# Build ohne Cache (bei seltsamen Fehlern)
npx parcel build src/index.html --no-cache

# Cache komplett löschen
rm -rf .parcel-cache
```

## Entry-Punkte

- Parcel braucht für Websites **HTML als Entry**, nicht JS: `npx parcel build src/index.html`
- Mehrere Seiten: `npx parcel build src/index.html src/about.html ...`
- `--public-url ./` wichtig, wenn `dist/` in Unterverzeichnissen oder via `file://` geöffnet wird

## .parcelrc für dieses Projekt

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.jsonld": ["@parcel/transformer-jsonld"]
  },
  "packagers": {
    "*.jsonld": ["@parcel/packager-raw-url"]
  }
}
```

Regeln:
- Alle `@parcel/*`-Pakete auf derselben Version halten (^2.16.x)
- `.parcelrc` nur anlegen, wenn die Default-Config wirklich erweitert wird — "extends" nie vergessen

## Häufige Fehler und Fixes

| Fehler | Ursache | Fix |
|---|---|---|
| Build läuft "vorbei" an Änderungen | Staler Cache | `rm -rf .parcel-cache`, dann neu bauen |
| `Cannot find module` | Paket fehlt in package.json | `npm install <paket> --save` |
| Raw-URL-Fehler bei Assets | Asset nicht gefunden / falscher Pfad | Relativen Pfad von der HTML/CSS-Datei aus nutzen |
| Bootstrap-SCSS-Fehler | BS-Quelldateien importiert | Kompiliertes `bootstrap/dist/css/bootstrap.min.css` nutzen oder kompletten Custom-SCSS-Stack einrichten |
| Port belegt | Alter Dev-Server läuft | Prozess beenden oder `--port` wechseln |
| Git-Konflikte durch Build-Artefakte | `dist/` oder `.parcel-cache/` committet | Beide in `.gitignore` aufnehmen |

## Gitignore-Einträge

```
node_modules/
dist/
.parcel-cache/
.cache/
test-results/
playwright-report/
```
