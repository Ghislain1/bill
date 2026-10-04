---
description: Build-Fehler diagnostizieren und beheben
agent: parcel-build-fixer
---

Diagnostiziere den aktuell fehlschlagenden Build und behebe ihn.

Vorgehen nach dem Agent-Playbook `parcel-build-fixer`:

1. Fehlgeschlagenes Kommando exakt ausführen und vollständige Fehlermeldung lesen
2. Cache ausschließen (`rm -rf .parcel-cache` bzw. `--no-cache`)
3. Entry-Punkte und `.parcelrc` prüfen
4. Versionskonsistenz der `@parcel/*`-Pakete prüfen
5. Ursache fixen, Build verifizieren (mit Cache)
6. Report: Ursache, Änderungen, Verifikation, Prävention

Nur minimal-invasive Fixes — kein Umbau der Projektstruktur.
