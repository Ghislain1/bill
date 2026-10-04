---
name: axe-accessibility
description: Accessibility-Prüfung mit @axe-core/playwright 4.11 und Playwright — AxeBuilder-Pattern, relevante WCAG-Tags, Report-Format und Bootstrap-4-spezifische Stolperfallen.
---

# axe-Accessibility-Prüfung

## Grundpattern

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('WCAG-AA-Audit der Startseite', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

## Nützliche Varianten

```ts
// Nur bestimmten Teil der Seite prüfen (Header/Footer getrennt)
new AxeBuilder({ page }).include('#main-content').analyze();

// Bestimmte Regeln deaktivieren (dokumentieren, warum!)
new AxeBuilder({ page })
  .disableRules(['color-contrast'])
  .analyze();

// Ergebnisse strukturiert ausgeben statt sofort failen
for (const v of results.violations) {
  console.log(`${v.impact} | ${v.id} | ${v.help} | ${v.nodes.length} Elemente`);
  console.log(`  → ${v.helpUrl}`);
}
```

## WCAG-Tags

| Tag | Bedeutung |
|---|---|
| `wcag2a`, `wcag2aa` | WCAG 2.0 Level A / AA |
| `wcag21a`, `wcag21aa` | WCAG 2.1 Level A / AA |
| `best-practice` | Empfehlungen jenseits WCAG |

Für Kundenprojekte i. d. R. `wcag2a + wcag2aa + wcag21a + wcag21aa` (entspricht BITV 2.0 / EN 301 549-Anspruchsniveau in Deutschland).

## Bootstrap-4-Stolperfallen

- `btn-outline-*` auf weißem Grund gern mit Kontrast-Problemen bei kleinen Schriftgrößen
- Custom-Color-Overrides: `--primary`-Ersatz per eigenem CSS prüft axe nur, wenn es im gerenderten CSS landet
- Navbar-Toggle braucht `aria-expanded` und sichtbaren Fokus
- Tooltips/Modals: Fokus-Management von Bootstrap 4 verhält sich bei Tastatur nicht immer korrekt — `modal`-Öffnen mit Keyboard testen

## Was axe NICHT prüft (manuell testen)

- Screenreader-Verhalten (Vorlesereihenfolge, ARIA-Live)
- Bedienbarkeit komplett per Tastatur (Tab-Reihenfolge)
- Verständlichkeit von Texten, Alt-Text-Qualität
- Zoom auf 200 % / Reflow
