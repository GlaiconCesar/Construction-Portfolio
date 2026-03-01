function getValue(path, source) {
  return path.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    if (/^\d+$/.test(part)) return acc[Number(part)];
    return acc[part];
  }, source);
}

function getFallbackText(element) {
  return element.getAttribute('data-fallback') || element.textContent.trim() || '[content unavailable]';
}

function getInitialLanguage() {
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang');
  if (queryLang === 'en' || queryLang === 'pt') return queryLang;

  const saved = localStorage.getItem('preferredLanguage');
  if (saved === 'en' || saved === 'pt') return saved;

  return 'en';
}

function getPageKey() {
  const explicit = document.body?.dataset.page;
  if (explicit) return explicit;

  const pathname = window.location.pathname;
  const projectMatch = pathname.match(/\/projects\/([a-z0-9-]+)\.html$/i);
  if (projectMatch) return projectMatch[1];

  if (pathname.includes('/projects/salon-prive')) return 'salon-prive';
  return 'home';
}

function getPathPrefix() {
  return window.location.pathname.includes('/projects/') ? '../' : '';
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

function updateMetadata(langPack) {
  if (!langPack.meta) return;

  document.documentElement.lang = langPack.meta.lang || 'en';
  if (langPack.meta.title) document.title = langPack.meta.title;

  const description = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');

  if (description && langPack.meta.description) description.setAttribute('content', langPack.meta.description);
  if (ogTitle && langPack.meta.ogTitle) ogTitle.setAttribute('content', langPack.meta.ogTitle);
  if (ogDescription && langPack.meta.ogDescription) ogDescription.setAttribute('content', langPack.meta.ogDescription);
}

function renderProjects(projectsData) {
  const grid = document.getElementById('projects-grid');
  if (!grid || !Array.isArray(projectsData?.projects)) return;

  grid.innerHTML = '';

  projectsData.projects.forEach((project) => {
    const article = document.createElement('article');
    article.className = 'project-card';
    const metadata = [project.year, project.category].filter(Boolean).join(' • ');

    article.innerHTML = `
      <img src="${project.image}" alt="${project.alt}" loading="lazy" decoding="async" />
      <h3>${project.title}</h3>
      ${metadata ? `<p>${metadata}</p>` : ''}
      <p>${project.summary}</p>
      <a class="button" href="${project.href}">${project.cta}</a>
    `;

    grid.appendChild(article);
  });
}

function applyLanguage(lang, langPack, fallbackPack) {
  localStorage.setItem('preferredLanguage', lang);

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const value = getValue(key, langPack);
    const fallbackValue = getValue(key, fallbackPack);
    element.textContent = typeof value === 'string' ? value : typeof fallbackValue === 'string' ? fallbackValue : getFallbackText(element);
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const key = element.getAttribute('data-i18n-alt');
    const value = getValue(key, langPack);
    const fallbackValue = getValue(key, fallbackPack);
    const fallbackAttr = element.getAttribute('alt') || 'Portfolio image';
    element.setAttribute('alt', typeof value === 'string' ? value : typeof fallbackValue === 'string' ? fallbackValue : fallbackAttr);
  });

  document.querySelectorAll('[data-lang-btn]').forEach((button) => {
    const active = button.getAttribute('data-lang-btn') === lang;
    button.setAttribute('aria-pressed', String(active));
  });

  updateMetadata(langPack);

  window.__langPack = langPack;
  window.__fallbackPack = fallbackPack;
  window.__translate = (key, defaultText = '') => {
    const localized = getValue(key, window.__langPack);
    if (typeof localized === 'string') return localized;
    const fallback = getValue(key, window.__fallbackPack);
    return typeof fallback === 'string' ? fallback : defaultText;
  };

  window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang, langPack } }));
}

async function setup() {
  const page = getPageKey();
  const lang = getInitialLanguage();
  const prefix = getPathPrefix();

  const dictionaryPath = `${prefix}data/${page}.${lang}.json`;
  const fallbackPath = `${prefix}data/${page}.en.json`;

  const [langPack, fallbackPack] = await Promise.all([
    loadJson(dictionaryPath).catch(() => loadJson(fallbackPath)),
    loadJson(fallbackPath)
  ]);

  let projectsData = null;
  let fallbackProjects = null;

  if (page === 'home') {
    const projectsPath = `${prefix}data/projects.${lang}.json`;
    const fallbackProjectsPath = `${prefix}data/projects.en.json`;

    [projectsData, fallbackProjects] = await Promise.all([
      loadJson(projectsPath).catch(() => loadJson(fallbackProjectsPath)),
      loadJson(fallbackProjectsPath)
    ]);

    renderProjects(projectsData || fallbackProjects);
  }

  applyLanguage(lang, langPack, fallbackPack);

  document.querySelectorAll('[data-lang-btn]').forEach((button) => {
    button.addEventListener('click', async () => {
      const selected = button.getAttribute('data-lang-btn');
      const selectedPackPath = `${prefix}data/${page}.${selected}.json`;
      const selectedProjectsPath = `${prefix}data/projects.${selected}.json`;

      const selectedPack = await loadJson(selectedPackPath).catch(() => fallbackPack);

      if (page === 'home') {
        const selectedProjects = await loadJson(selectedProjectsPath).catch(() => fallbackProjects);
        renderProjects(selectedProjects || fallbackProjects);
      }

      applyLanguage(selected, selectedPack, fallbackPack);

      const url = new URL(window.location.href);
      url.searchParams.set('lang', selected);
      window.history.replaceState({}, '', url);
    });
  });

  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
}

window.addEventListener('DOMContentLoaded', () => {
  setup().catch((error) => {
    console.error(error);
  });
});
