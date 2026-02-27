const galleryItems = [
  { src: 'assets/img/hero-finished.jpg', altKey: 'img_hero' },
  { src: 'assets/img/bar-feature.jpg', altKey: 'img_bar' },
  { src: 'assets/img/wine-wall.jpg', altKey: 'img_wine' },
  { src: 'assets/img/build-framing-arch.jpg', altKey: 'img_framing_arch' },
  { src: 'assets/img/build-finished-shell.jpg', altKey: 'img_shell' },
  { src: 'assets/img/build-framing-curved-wall.jpg', altKey: 'img_framing_curve' },
  { src: 'assets/img/brand-wn-salon-prive.jpg', altKey: 'img_brand' }
];

let activeIndex = 0;
let revealObserver;
let lastFocusedElement = null;

function t(key, fallback) {
  if (typeof window.__translate === 'function') return window.__translate(key, fallback);
  return fallback;
}

function createGalleryCard(item, index) {
  const figure = document.createElement('figure');
  figure.className = 'gallery-card gallery-reveal';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'gallery-trigger';
  trigger.setAttribute('data-gallery-index', String(index));
  trigger.setAttribute('aria-label', t('gallery.openImage', 'Open image'));

  const frame = document.createElement('span');
  frame.className = 'gallery-thumb-frame';

  const img = document.createElement('img');
  img.src = item.src;
  img.alt = t(item.altKey, 'Portfolio image');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.setAttribute('data-i18n-alt', item.altKey);

  frame.appendChild(img);
  trigger.appendChild(frame);
  figure.appendChild(trigger);
  return figure;
}

function renderGallery() {
  const container = document.getElementById('gallery-grid');
  if (!container) return;

  container.innerHTML = '';
  galleryItems.forEach((item, index) => {
    container.appendChild(createGalleryCard(item, index));
  });

  setupRevealAnimation();
}

function createModal() {
  const modal = document.createElement('div');
  modal.className = 'gallery-modal';
  modal.setAttribute('aria-hidden', 'true');

  modal.innerHTML = `
    <div class="gallery-modal-backdrop" data-modal-close></div>
    <div class="gallery-modal-dialog" role="dialog" aria-modal="true" aria-label="${t('gallery.viewerLabel', 'Image viewer')}">
      <button type="button" class="gallery-modal-close" data-modal-close aria-label="${t('gallery.closeViewer', 'Close viewer')}">×</button>
      <button type="button" class="gallery-modal-nav gallery-modal-prev" data-modal-prev aria-label="${t('gallery.previousImage', 'Previous image')}">‹</button>
      <div class="gallery-modal-media">
        <img id="gallery-modal-image" src="" alt="" loading="eager" decoding="async" />
        <p id="gallery-modal-caption" class="gallery-modal-caption"></p>
      </div>
      <button type="button" class="gallery-modal-nav gallery-modal-next" data-modal-next aria-label="${t('gallery.nextImage', 'Next image')}">›</button>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

function updateModalImage() {
  const modalImage = document.getElementById('gallery-modal-image');
  const caption = document.getElementById('gallery-modal-caption');
  if (!modalImage || !caption) return;

  const item = galleryItems[activeIndex];
  const translatedAlt = t(item.altKey, 'Portfolio image');
  modalImage.src = item.src;
  modalImage.alt = translatedAlt;
  caption.textContent = translatedAlt;
}

function updateModalLabels() {
  const modal = document.querySelector('.gallery-modal');
  if (!modal) return;

  const dialog = modal.querySelector('.gallery-modal-dialog');
  const closeButton = modal.querySelector('.gallery-modal-close');
  const prevButton = modal.querySelector('.gallery-modal-prev');
  const nextButton = modal.querySelector('.gallery-modal-next');

  if (dialog) dialog.setAttribute('aria-label', t('gallery.viewerLabel', 'Image viewer'));
  if (closeButton) closeButton.setAttribute('aria-label', t('gallery.closeViewer', 'Close viewer'));
  if (prevButton) prevButton.setAttribute('aria-label', t('gallery.previousImage', 'Previous image'));
  if (nextButton) nextButton.setAttribute('aria-label', t('gallery.nextImage', 'Next image'));
}

function openModal(index) {
  const modal = document.querySelector('.gallery-modal') || createModal();
  activeIndex = index;
  lastFocusedElement = document.activeElement;
  updateModalImage();
  updateModalLabels();

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  const closeButton = modal.querySelector('.gallery-modal-close');
  if (closeButton) closeButton.focus();
}

function closeModal() {
  const modal = document.querySelector('.gallery-modal');
  if (!modal) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function showNext() {
  activeIndex = (activeIndex + 1) % galleryItems.length;
  updateModalImage();
}

function showPrev() {
  activeIndex = (activeIndex - 1 + galleryItems.length) % galleryItems.length;
  updateModalImage();
}

function setupRevealAnimation() {
  const cards = document.querySelectorAll('.gallery-reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealObserver) revealObserver.disconnect();

  if (reducedMotion) {
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -5% 0px' }
  );

  cards.forEach((card) => revealObserver.observe(card));
}

function setupGalleryEvents() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-gallery-index]');
    if (trigger) {
      openModal(Number(trigger.getAttribute('data-gallery-index')));
      return;
    }

    if (event.target.closest('[data-modal-close]')) {
      closeModal();
      return;
    }

    if (event.target.closest('[data-modal-next]')) {
      showNext();
      return;
    }

    if (event.target.closest('[data-modal-prev]')) {
      showPrev();
    }
  });

  document.addEventListener('keydown', (event) => {
    const isOpen = document.querySelector('.gallery-modal.is-open');
    if (!isOpen) return;

    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowRight') showNext();
    if (event.key === 'ArrowLeft') showPrev();
  });
}

window.addEventListener('languagechange', () => {
  document.querySelectorAll('[data-gallery-index]').forEach((trigger) => {
    trigger.setAttribute('aria-label', t('gallery.openImage', 'Open image'));
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((img) => {
    const key = img.getAttribute('data-i18n-alt');
    if (key) img.setAttribute('alt', t(key, 'Portfolio image'));
  });

  updateModalLabels();

  const modalOpen = document.querySelector('.gallery-modal.is-open');
  if (modalOpen) updateModalImage();
});

window.addEventListener('DOMContentLoaded', () => {
  renderGallery();
  setupGalleryEvents();
});
