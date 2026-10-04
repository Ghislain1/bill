---
description: Parcel-Production-Build ausführen und Ergebnis prüfen
agent: parcel-build-fixer
---

Führe den Production-Build aus und prüfe das Ergebnis.

1. Falls vorhanden `npm run build` ausführen, sonst `npx parcel build src/index.html --dist-dir dist --public-url ./`
2. Bei Fehlern: Fehlermeldung analysieren und mit Cache-Ausschluss (`--no-cache`) erneut versuchen — wenn der Fehler bleibt, Ursache fixen (Skill `parcel-build` für typische Muster)
3. Build-Ergebnis verifizieren:
   - `dist/` enthält HTML mit gehashten Assets?
   - Bootstrap-CSS und simple-line-icons-Font liegen in `dist/` und werden referenziert?
   - JSON-LD-Blöcke im gebauten HTML intakt?
   - Keine 404-Assets: HTML kurz mit dem Dev-Server oder `npx serve dist` gegenprüfen
4. Kurze Zusammenfassung: Build-Dauer, Output-Größe, Auffälligkeiten

Keine Refactorings während des Builds — nur Fehler beheben.
