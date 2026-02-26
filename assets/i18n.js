function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    if (/^\d+$/.test(part)) return acc[Number(part)];
    return acc[part];
  }, obj);
}

async function loadDictionary(lang) {
  const response = await fetch(`/i18n/${lang}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load dictionary for language: ${lang}`);
  }
  return response.json();
}

function applyTranslations(dictionary) {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const value = getNestedValue(dictionary, key);
    if (typeof value === 'string') {
      element.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
    const instruction = element.getAttribute('data-i18n-attr');
    const [attribute, key] = instruction.split(':');
    const value = getNestedValue(dictionary, key);
    if (typeof value === 'string') {
      element.setAttribute(attribute, value);
    }
  });
}

function configureLanguageSwitcher(activeLang) {
  const hash = window.location.hash || '';

  document.querySelectorAll('[data-lang-link]').forEach((link) => {
    const lang = link.getAttribute('data-lang-link');
    const isActive = lang === activeLang;
    link.setAttribute('aria-current', isActive ? 'page' : 'false');

    const targetPath = `/${lang}/`;
    link.setAttribute('href', `${targetPath}${hash}`);

    link.addEventListener('click', () => {
      localStorage.setItem('preferredLanguage', lang);
    });
  });
}

async function initI18n() {
  const activeLang = document.body.dataset.lang === 'pt' ? 'pt' : 'en';
  localStorage.setItem('preferredLanguage', activeLang);
  configureLanguageSwitcher(activeLang);

  try {
    const dictionary = await loadDictionary(activeLang);
    applyTranslations(dictionary);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', initI18n);
