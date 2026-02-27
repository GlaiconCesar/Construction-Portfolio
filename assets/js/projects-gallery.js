(function () {
  const LANGUAGE_FALLBACK = 'en';

  function getCurrentLanguage() {
    const docLang = document.documentElement.lang || LANGUAGE_FALLBACK;
    return docLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  }

  function createTagList(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return null;

    const list = document.createElement('ul');
    list.className = 'project-tags';

    tags.forEach((tag) => {
      const item = document.createElement('li');
      item.textContent = tag;
      list.appendChild(item);
    });

    return list;
  }

  function createCard(card) {
    const article = document.createElement('article');
    article.className = 'project-card';

    const link = document.createElement('a');
    link.href = card.href;
    link.className = 'project-card-link';

    const thumbnail = document.createElement('img');
    thumbnail.src = card.thumbnail;
    thumbnail.alt = card.alt;
    thumbnail.loading = 'lazy';
    thumbnail.decoding = 'async';

    const heading = document.createElement('h3');
    heading.textContent = card.title;

    const description = document.createElement('p');
    description.textContent = card.shortDescription;

    link.appendChild(thumbnail);
    link.appendChild(heading);
    link.appendChild(description);

    article.appendChild(link);

    if (card.status) {
      const status = document.createElement('p');
      status.className = 'project-status';
      status.textContent = card.status;
      article.appendChild(status);
    }

    const tags = createTagList(card.tags);
    if (tags) {
      article.appendChild(tags);
    }

    return article;
  }

  function isValidCard(card) {
    return (
      card &&
      typeof card.title === 'string' &&
      typeof card.shortDescription === 'string' &&
      typeof card.href === 'string' &&
      !card.href.startsWith('/') &&
      typeof card.thumbnail === 'string' &&
      typeof card.alt === 'string'
    );
  }

  async function loadProjects(lang) {
    const response = await fetch(`data/projects.${lang}.json`, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Could not load projects for language: ${lang}`);
    return response.json();
  }

  async function renderProjects() {
    const container = document.getElementById('projects-gallery');
    if (!container) return;

    try {
      const lang = getCurrentLanguage();
      const data = await loadProjects(lang);
      const cards = Array.isArray(data.cards) ? data.cards.filter(isValidCard) : [];

      if (cards.length === 0) return;

      container.innerHTML = '';
      cards.forEach((card) => {
        container.appendChild(createCard(card));
      });
    } catch (error) {
      console.warn('Project gallery could not be rendered from JSON.', error);
    }
  }

  document.addEventListener('DOMContentLoaded', renderProjects);
})();
