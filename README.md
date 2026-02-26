# Salon Privé – Construction Breakdown (EN/PT)

Static bilingual case study page for GitHub Pages.

## Stack

- `index.html`
- `assets/css/styles.css`
- `assets/js/i18n.js` (dictionary-driven translations)
- `assets/img/*` (local gallery assets)

No build tools, no framework, no backend.

## Local preview

```bash
python3 -m http.server 8000
```

Open:

- `http://localhost:8000/` (default EN)
- `http://localhost:8000/?lang=pt` (PT override)

## Language behavior

- Default language is **English**.
- `?lang=pt` or `?lang=en` overrides everything.
- Without query param, language falls back to `localStorage` (`preferredLanguage`).
- Switcher updates all page content immediately and persists language.

## Gallery assets

The gallery uses local files from `assets/img/`.

If you have final project photos, replace the placeholder SVGs with your real images using the same filenames:

- `hero-finished`
- `detail-bar`
- `detail-display`
- `framing-steel`
- `curved-shell`
- `platform-build`
- `wn-sign`

Keep paths local for GitHub Pages compatibility.

## PDF placeholder

A placeholder file is provided at:

- `assets/SalonPrive-CaseStudy.pdf`

Replace it with your final downloadable case study PDF when ready.
