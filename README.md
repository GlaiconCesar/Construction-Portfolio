# Construction Portfolio (EN / PT-BR)

Static portfolio website for GitHub Pages branch deployment:

- Base URL: `https://glaiconcesar.github.io/Construction-Portfolio/`
- No framework, no backend
- Language support: English + Brazilian Portuguese

## Project structure

- `index.html` - Home page (Hero, About Me, Skills, Projects Gallery, Contact)
- `projects/salon-prive.html` - Salon Privé case study page
- `data/home.en.json` + `data/home.pt.json` - Home page translations
- `data/salon-prive.en.json` + `data/salon-prive.pt.json` - Case study translations
- `data/projects.en.json` + `data/projects.pt.json` - Localized project cards
- `assets/js/i18n.js` - Page-aware translation loader and metadata updater
- `assets/js/gallery.js` - Salon Privé image gallery and modal viewer
- `assets/css/styles.css` - Shared styles

## Local preview

```bash
python -m http.server 8000
```

Open:

- `http://localhost:8000/Construction-Portfolio/` (if served from parent folder), or
- `http://localhost:8000/` (if served from repo root)

Language query examples:

- `?lang=en`
- `?lang=pt`

## Language behaviour

Language selection priority:

1. URL query parameter `?lang=en|pt`
2. `localStorage.preferredLanguage`
3. default `en`

The loader updates:

- page text via `data-i18n`
- image alt text via `data-i18n-alt`
- metadata (`<title>`, description, Open Graph fields)
- `<html lang>` (`en` or `pt-BR`)

## How to add a new project

1. **Add project images**
   - Create `assets/img/projects/<slug>/`
   - Place optimized images in this folder (web-friendly names, lowercase + hyphens).

2. **Create the project page**
   - Add `projects/<slug>.html` (you can copy `projects/salon-prive.html` as a base).
   - Keep relative paths from `projects/` (example: `../assets/...`, `../data/...`).

3. **Create bilingual dictionaries for the new page**
   - Add `data/<slug>.en.json`
   - Add `data/<slug>.pt.json`
   - Include `meta` fields and all translation keys used by the page.

4. **Add project cards in both languages**
   - Update `data/projects.en.json`
   - Update `data/projects.pt.json`
   - Add card data (`title`, `summary`, `href`, `image`, `alt`, `cta`).

5. **Link check for GitHub Pages base path**
   - Use relative links only (`projects/...`, `../assets/...`, `../data/...`).
   - Avoid root-absolute links like `/assets/...`.

6. **Preview locally and validate**
   - Check the home card opens the new case-study page.
   - Check EN/PT text, metadata, gallery, and language switch on both pages.
