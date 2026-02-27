# Construction Portfolio (EN/PT)

Static bilingual portfolio site for GitHub Pages.

## Local preview

Run a local static server from the repository root:

```bash
python -m http.server 8000
```

Open:

- `http://localhost:8000/` (default EN)
- `http://localhost:8000/?lang=pt` (forces Portuguese)

## Site structure

- `index.html`: home/portfolio landing page
- `projects/`: individual project pages (for example, `projects/salon-prive.html`)
- `data/*.json`: bilingual content sources (project cards and per-page dictionaries)
- Shared assets/scripts:
  - `assets/css/`: global styling
  - `assets/js/`: shared behavior (i18n, gallery, etc.)
  - `assets/img/`: reusable images/icons

## Add a new project

1. **Copy a project page template in `projects/`.**
   - Duplicate an existing project page and adapt structure/content.
2. **Create EN/PT page JSON dictionaries.**
   - Add matching translation keys for the new page content.
3. **Add the project card entry in both list files.**
   - Update `data/projects.en.json` and `data/projects.pt.json` with the new card metadata/link.
4. **Confirm relative links/assets for GitHub Pages compatibility.**
   - Validate paths from both `index.html` and `/projects/...` pages so they work under a repository base path.

## Image build (Sharp)

To generate optimized gallery images (full + thumb in JPG/WebP):

```bash
npm i
npm run images:build
```
