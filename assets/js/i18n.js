const SUPPORTED_LANGUAGES = ['en', 'pt'];

const PAGE_CONFIG = {
  home: { files: ['home', 'projects'], metaPath: 'home.meta' },
  'salon-prive': { files: ['salon-prive', 'projects'], metaPath: 'meta' }
};

function getValue(path, source) {
  return path.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    if (/^\d+$/.test(part)) return acc[Number(part)];
    return acc[part];
  }, source);
}

function deepMerge(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) {
    return override !== undefined ? override : base;
  }

  if (base && typeof base === 'object' && override && typeof override === 'object') {
    const merged = { ...base };
    Object.keys(override).forEach((key) => {
      merged[key] = deepMerge(base[key], override[key]);
    });
    return merged;
  }

  return override !== undefined ? override : base;
}

function detectPage() {
  const pathname = window.location.pathname;
  if (pathname.includes('/projects/salon-prive') || pathname.endsWith('projects/salon-prive.html')) return 'salon-prive';
  return 'home';
}

function resolveLanguage() {
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang');
  if (SUPPORTED_LANGUAGES.includes(queryLang)) return queryLang;

  const saved = localStorage.getItem('preferredLanguage');
  if (SUPPORTED_LANGUAGES.includes(saved)) return saved;

  return 'en';
}

function getDataBasePath() {
  return window.location.pathname.includes('/projects/') ? '../data' : 'data';
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load ${url}`);
  return response.json();
}

async function loadLanguagePacks(page, lang) {
  const { files } = PAGE_CONFIG[page] || PAGE_CONFIG.home;
  const dataPath = getDataBasePath();

  const englishPacks = await Promise.all(files.map((file) => loadJson(`${dataPath}/${file}.en.json`)));
  const localizedPacks = lang === 'en'
    ? englishPacks
    : await Promise.all(
      files.map(async (file, index) => {
        try {
          return await loadJson(`${dataPath}/${file}.${lang}.json`);
        } catch {
          return englishPacks[index];
        }
      })
    );

  const english = englishPacks.reduce((acc, pack) => deepMerge(acc, pack), {});
  const localized = localizedPacks.reduce((acc, pack) => deepMerge(acc, pack), {});

  return { localized, english };
}

function getFallbackText(element) {
  return element.getAttribute('data-fallback') || element.textContent.trim() || '[content unavailable]';
}

function updateMetadata(activePack, fallbackPack, page) {
  const metaPath = (PAGE_CONFIG[page] || PAGE_CONFIG.home).metaPath;
  const localizedMeta = getValue(metaPath, activePack);
  const fallbackMeta = getValue(metaPath, fallbackPack);
  const meta = deepMerge(fallbackMeta || {}, localizedMeta || {});

  if (meta.lang) document.documentElement.lang = meta.lang;
  if (meta.title) document.title = meta.title;

  const description = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');

  if (description && meta.description) description.setAttribute('content', meta.description);
  if (ogTitle && (meta.ogTitle || meta.title)) ogTitle.setAttribute('content', meta.ogTitle || meta.title);
  if (ogDescription && (meta.ogDescription || meta.description)) ogDescription.setAttribute('content', meta.ogDescription || meta.description);
}

function applyLanguage(lang, packs, page) {
  const fallbackPack = packs.english;
  const langPack = deepMerge(fallbackPack, packs.localized);

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
    const fallbackAlt = element.getAttribute('alt') || 'Portfolio image';
    element.setAttribute('alt', typeof value === 'string' ? value : typeof fallbackValue === 'string' ? fallbackValue : fallbackAlt);
  });

  document.querySelectorAll('[data-i18n-content]').forEach((element) => {
    const key = element.getAttribute('data-i18n-content');
    const value = getValue(key, langPack);
    const fallbackValue = getValue(key, fallbackPack);
    const fallbackContent = element.getAttribute('content') || '';
    element.setAttribute('content', typeof value === 'string' ? value : typeof fallbackValue === 'string' ? fallbackValue : fallbackContent);
  });

  document.querySelectorAll('[data-lang-btn]').forEach((button) => {
    const active = button.getAttribute('data-lang-btn') === lang;
    button.setAttribute('aria-pressed', String(active));
  });

  updateMetadata(langPack, fallbackPack, page);

  window.__langPack = langPack;
  window.__translate = (key, defaultText = '') => {
    const localized = getValue(key, window.__langPack || fallbackPack);
    if (typeof localized === 'string') return localized;
    const enValue = getValue(key, fallbackPack);
    return typeof enValue === 'string' ? enValue : defaultText;
  };

  window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang, langPack } }));
}

window.addEventListener('DOMContentLoaded', async () => {
  const page = detectPage();
  const initialLanguage = resolveLanguage();
  const packsCache = new Map();
  const getPacksForLanguage = async (lang) => {
    if (!packsCache.has(lang)) {
      packsCache.set(lang, await loadLanguagePacks(page, lang));
    }
    return packsCache.get(lang);
  };

  const initialPacks = await getPacksForLanguage(initialLanguage);
  applyLanguage(initialLanguage, initialPacks, page);

  document.querySelectorAll('[data-lang-btn]').forEach((button) => {
    button.addEventListener('click', async () => {
      const selected = button.getAttribute('data-lang-btn');
      if (!SUPPORTED_LANGUAGES.includes(selected)) return;

      const selectedPacks = await getPacksForLanguage(selected);
      applyLanguage(selected, selectedPacks, page);

      const url = new URL(window.location.href);
      url.searchParams.set('lang', selected);
      window.history.replaceState({}, '', url);
    });
  });

  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
});
