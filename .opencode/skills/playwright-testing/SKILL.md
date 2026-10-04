---
name: playwright-testing
description: Playwright-1.58-Testpraxis für statische HTML5-Seiten — Config mit Parcel-Dev-Server, Spec-Patterns für Bootstrap-4-Komponenten, axe-Integration, Debugging von flaky Tests.
---

# Playwright-Testing

## playwright.config.ts (Vorlage)

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:1234',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npx parcel src/index.html --port 1234',
    url: 'http://localhost:1234',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
```

## Kommandos

```bash
npx playwright install            # Browser einmalig installieren
npx playwright test               # alle Tests headless
npx playwright test --headed      # mit Browserfenster
npx playwright test --ui          # UI-Modus zum interaktiven Debuggen
npx playwright show-report        # HTML-Report ansehen
npx playwright show-trace <file>  # Trace analysieren
```

## Spec-Patterns für Bootstrap 4.6

```ts
// Modal öffnen/schließen
await page.getByRole('button', { name: 'Kontakt' }).click();
const modal = page.locator('.modal.show');
await expect(modal).toBeVisible();
await expect(modal).toHaveAttribute('aria-modal', 'true');
await page.keyboard.press('Escape');
await expect(modal).not.toBeVisible();

// Responsive Check
await page.setViewportSize({ width: 375, height: 812 });
await expect(page.locator('.navbar-toggler')).toBeVisible();
```

## Regeln

- Rollen-/Text-Locators (`getByRole`, `getByText`) vor CSS-Selektoren
- Animationen: mit `await expect(...).toBeVisible()` warten statt `waitForTimeout`
- Bei flaky Tests: Trace in CI (`trace: 'on-first-retry'`) statt Retry-Schleifen erhöhen
- Tests sind unabhängig voneinander ausführbar — kein Zustand zwischen Tests teilen

## axe-Integration

Siehe Skill `axe-accessibility` für die Kombination mit `@axe-core/playwright`.
