---
description: Ghis - Bootstrap-4.6-UI-Review der angegebenen Dateien oder Seiten
agent: bootstrap4-ui-reviewer
---

Reviewe die angegebene Datei bzw. Seite (oder alle `src/**/*.html`, falls nichts angegeben) gegen Bootstrap-4.6.2-Konventionen.

Prüfkriterien nach Agent-Playbook `bootstrap4-ui-reviewer`:

- Grid-Struktur und Breakpoint-Nutzung
- Spacing-/Display-Utilities (nur Bootstrap-4-Syntax — `ml-*` statt `ms-*`, keine BS5/BS3-Klassen)
- JS-Komponenten: jQuery/Popper-Einbindung, `data-toggle`-Attribute, ARIA-Attribute
- simple-line-icons-Nutzung (`icon-*`, `aria-hidden`)
- Responsive Verhalten inkl. Viewport-Meta
- Semantische HTML5-Struktur und Heading-Hierarchie

Ausgabe als Tabelle (Datei:Zeile — Schwere — Befund — Fix-Vorschlag) plus Gesamturteil in maximal 3 Sätzen. Keine Code-Änderungen.
