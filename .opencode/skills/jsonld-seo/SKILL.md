---
name: jsonld-seo
description: JSON-LD und Structured Data für HTML5-Seiten — Schema.org-Typen, einbettbare Blöcke, @parcel/transformer-jsonld-Konfiguration und Validierungs-Workflow.
---

# JSON-LD / Structured Data

## Variante 1: Direkt im HTML (einfachste Lösung)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Muster Agentur",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+49-671-000000",
    "contactType": "customer service"
  }
}
</script>
```

## Variante 2: Separate .jsonld-Datei via Parcel

Mit `@parcel/transformer-jsonld` + `@parcel/packager-raw-url` (`.parcelrc` siehe Skill `parcel-build`):

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Muster Agentur",
  "image": "https://example.com/hero.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Musterstr. 1",
    "postalCode": "55555",
    "addressLocality": "Bad Kreuznach",
    "addressCountry": "DE"
  },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  }]
}
```

## Häufige Typen für Agentur-/Business-Websites

| Typ | Zweck |
|---|---|
| `Organization` | Firmenidentität, Logo, Social-Profile |
| `LocalBusiness` | Unternehmen mit Adresse + Öffnungszeiten |
| `WebSite` | Site-Name, ggf. SearchAction |
| `BreadcrumbList` | Breadcrumbs in Suchergebnissen |
| `FAQPage` | FAQ-Seiten mit Rich Results |
| `Service` / `Product` | Leistungs-/Produktseiten |

## Regeln

- Pro Seite nur **einen Haupt-`@type`** plus ergänzende Blöcke — nicht alles in eine Seite stopfen
- URLs immer absolut, mit `https://`
- Keine Daten erfinden — nur sichtbare, echte Seiteninhalte auszeichnen (Google-Richtlinie)
- Mehrere Seiten = mehrere spezifische Blöcke statt einem generischen

## Validierung

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- Lighthouse-Score "SEO" als grobe Erstprüfung

Nach Build-Änderungen prüfen, dass Parcel den JSON-LD-Block nicht umgeschrieben hat (HTML-Minifier kann Scripts erhalten — Standard `minify` von Parcel entfernt `type="application/ld+json"`-Inhalte nicht, aber nachsehen schadet nicht).
