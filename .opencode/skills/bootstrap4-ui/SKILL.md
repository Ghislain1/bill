---
name: bootstrap4-ui
description: Bootstrap-4.6.2-Referenz für HTML5-Markup — Grid, Spacing-Utilities, JS-Komponenten mit jQuery/Popper, simple-line-icons-2.5.5-Integration und klare Abgrenzung zu Bootstrap 5.
---

# Bootstrap 4.6.2 + simple-line-icons

## Einbindung

```html
<!-- kompiliertes CSS -->
<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
<!-- eigene Styles DANACH -->
<link rel="stylesheet" href="styles/main.css">
```

Bootstrap-JS nur wenn Komponenten benutzt werden (benötigt jQuery 3.x + Popper.js 1.x):

```html
<script src="node_modules/jquery/dist/jquery.slim.min.js"></script>
<script src="node_modules/popper.js/dist/umd/popper.min.js"></script>
<script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
```

Icons (simple-line-icons 2.5.5):

```html
<link rel="stylesheet" href="node_modules/simple-line-icons/css/simple-line-icons.css">
<span class="icon-user" aria-hidden="true"></span> Profil
```

## Grid

```html
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-4">…</div>
    <div class="col-12 col-md-6 col-lg-8">…</div>
  </div>
</div>
```

Breakpoints: `sm` ≥576 px, `md` ≥768 px, `lg` ≥992 px, `xl` ≥1200 px. Mobile-first: `col-12` als Fallback, dann breiter werdend.

## Abgrenzung zu Bootstrap 5 — NICHT verwenden

| Bootstrap 5 (verboten) | Bootstrap 4 (richtig) |
|---|---|
| `ms-2`, `me-2` | `ml-2`, `mr-2` |
| `g-3` (Gutter) | keine Grid-Gaps — Padding/Utilities nutzen |
| `data-bs-toggle` | `data-toggle` |
| kein jQuery nötig | jQuery + Popper nötig |
| `form-control-lg` etc. teils gleich | immer 4.6-Doku prüfen |

## Häufige Komponenten-Snippets

```html
<!-- Responsive Navbar -->
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="#">Brand</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse"
          data-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Menü umschalten">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="mainNav">
    <ul class="navbar-nav ml-auto">
      <li class="nav-item active"><a class="nav-link" href="#">Home</a></li>
    </ul>
  </div>
</nav>
```

## Regeln

- Custom-Styles immer als eigener Layer nach Bootstrap, niemals Bootstrap-Dateien editieren
- `!important` vermeiden — stattdessen spezifischere Selektoren
- Keine `hidden-xs`-Klassen (Bootstrap-3-Syntax)
- Viewport-Meta nicht vergessen: `width=device-width, initial-scale=1, shrink-to-fit=no`
