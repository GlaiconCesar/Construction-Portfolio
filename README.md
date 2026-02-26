# Construction Portfolio (EN / PT-BR)

Static bilingual portfolio website for construction work, optimized for GitHub Pages.

## Routes

- English: `/en/`
- Portuguese (Brazil): `/pt/`
- Root (`/`) redirects to preferred language based on `localStorage` (fallback to browser language).

## Local preview

1. From the repository root, run:

   ```bash
   python3 -m http.server 8000
   ```

2. Open `http://localhost:8000`.
3. Confirm:
   - redirect from `/` to `/en/` or `/pt/`
   - language switcher keeps the current section (`#projects`, `#skills`, etc.)
   - text updates from `/i18n/en.json` and `/i18n/pt.json`

## Deployment (GitHub Pages)

1. Push changes to the default branch.
2. In **Settings → Pages**:
   - **Source**: Deploy from a branch
   - **Branch**: your default branch (root folder)
3. Save. GitHub Pages will publish the static files.

> After deployment, update `og:url` and `hreflang` URLs in `/en/index.html` and `/pt/index.html` with your actual GitHub username/repository path if needed.

## SEO and i18n implementation details

- Per-language documents with localized metadata (`title`, `description`, Open Graph fields).
- Correct `html lang` attributes: `en` and `pt-BR`.
- `hreflang` alternate links (`en`, `pt-BR`, `x-default`) on both pages.
- Lightweight i18n dictionaries in:
  - `i18n/en.json`
  - `i18n/pt.json`
- Translation helper (`assets/i18n.js`) binds dictionary keys to DOM nodes using:
  - `data-i18n` for text content
  - `data-i18n-attr` for attributes (e.g., meta tags)
- Language preference persisted via `localStorage` key: `preferredLanguage`.
