const galleryItems = [
  { baseName: 'hero-finished', altKey: 'img_hero' },
  { baseName: 'bar-feature', altKey: 'img_bar' },
  { baseName: 'wine-wall', altKey: 'img_wine' },
  { baseName: 'build-framing-arch', altKey: 'img_framing_arch' },
  { baseName: 'build-finished-shell', altKey: 'img_shell' },
  { baseName: 'build-framing-curved-wall', altKey: 'img_framing_curve' },
  { baseName: 'brand-wn-salon-prive', altKey: 'img_brand' }
];

const thumbSizes = '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw';
const fullSizes = '90vw';

let activeIndex = 0;
let revealObserver;

function getCopy() {
  return window.__langPack?.gallery || {};
}

function createGalleryCard(item, index) {
  const figure = document.createElement('figure');
  figure.className = 'gallery-card gallery-reveal';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'gallery-trigger';
  trigger.setAttribute('data-gallery-index', String(index));
  trigger.setAttribute('aria-label', getCopy().openImage || 'Open image');

  const picture = document.createElement('picture');

  const webpSource = document.createElement('source');
  webpSource.type = 'image/webp';
  webpSource.srcset = `assets/img/${item.baseName}-thumb-480.webp 480w, assets/img/${item.baseName}-thumb-960.webp 960w`;
  webpSource.sizes = thumbSizes;

  const jpgSource = document.createElement('source');
  jpgSource.type = 'image/jpeg';
  jpgSource.srcset = `assets/img/${item.baseName}-thumb-480.jpg 480w, assets/img/${item.baseName}-thumb-960.jpg 960w`;
  jpgSource.sizes = thumbSizes;

  const img = document.createElement('img');
  img.src = `assets/img/${item.baseName}-thumb-480.jpg`;
  img.alt = '';
  img.loading = index === 0 ? 'eager' : 'lazy';
  img.decoding = 'async';
  img.setAttribute('data-i18n-alt', item.altKey);

  picture.append(webpSource, jpgSource, img);
  trigger.appendChild(picture);
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

function buildFullPicture(item, altText) {
  const picture = document.createElement('picture');

  const webpSource = document.createElement('source');
  webpSource.type = 'image/webp';
  webpSource.srcset = `assets/img/${item.baseName}-full-480.webp 480w, assets/img/${item.baseName}-full-960.webp 960w, assets/img/${item.baseName}-full-1600.webp 1600w`;
  webpSource.sizes = fullSizes;

  const jpgSource = document.createElement('source');
  jpgSource.type = 'image/jpeg';
  jpgSource.srcset = `assets/img/${item.baseName}-full-480.jpg 480w, assets/img/${item.baseName}-full-960.jpg 960w, assets/img/${item.baseName}-full-1600.jpg 1600w`;
  jpgSource.sizes = fullSizes;

  const img = document.createElement('img');
  img.src = `assets/img/${item.baseName}-full-960.jpg`;
  img.alt = altText;
  img.loading = 'lazy';
  img.decoding = 'async';

  picture.append(webpSource, jpgSource, img);
  return picture;
}

function createModal() {
  const copy = getCopy();
  const modal = document.createElement('div');
  modal.className = 'gallery-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="gallery-modal-backdrop" data-modal-close></div>
    <div class="gallery-modal-dialog" role="dialog" aria-modal="true" aria-label="${copy.viewerLabel || 'Image viewer'}">
      <button type="button" class="gallery-modal-close" data-modal-close aria-label="${copy.closeViewer || 'Close viewer'}">×</button>
      <button type="button" class="gallery-modal-nav gallery-modal-prev" data-modal-prev aria-label="${copy.previousImage || 'Previous image'}">‹</button>
      <div class="gallery-modal-media" id="gallery-modal-media"></div>
      <button type="button" class="gallery-modal-nav gallery-modal-next" data-modal-next aria-label="${copy.nextImage || 'Next image'}">›</button>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

function openModal(index) {
  const modal = document.querySelector('.gallery-modal') || createModal();
  activeIndex = index;
  updateModalImage();
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal() {
  const modal = document.querySelector('.gallery-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function updateModalImage() {
  const modalMedia = document.getElementById('gallery-modal-media');
  if (!modalMedia) return;

  const item = galleryItems[activeIndex];
  const thumb = document.querySelector(`[data-gallery-index="${activeIndex}"] img`);
  const altText = thumb?.alt || '';

  modalMedia.innerHTML = '';
  modalMedia.appendChild(buildFullPicture(item, altText));
}

function updateModalLabels() {
  const modal = document.querySelector('.gallery-modal');
  if (!modal) return;

  const copy = getCopy();
  const dialog = modal.querySelector('.gallery-modal-dialog');
  const closeButton = modal.querySelector('[data-modal-close].gallery-modal-close');
  const prevButton = modal.querySelector('[data-modal-prev]');
  const nextButton = modal.querySelector('[data-modal-next]');

  if (dialog) dialog.setAttribute('aria-label', copy.viewerLabel || 'Image viewer');
  if (closeButton) closeButton.setAttribute('aria-label', copy.closeViewer || 'Close viewer');
  if (prevButton) prevButton.setAttribute('aria-label', copy.previousImage || 'Previous image');
  if (nextButton) nextButton.setAttribute('aria-label', copy.nextImage || 'Next image');
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
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = document.querySelectorAll('.gallery-reveal');

  if (revealObserver) {
    revealObserver.disconnect();
  }

  if (reducedMotion) {
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
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
    const modalOpen = document.querySelector('.gallery-modal.is-open');
    if (!modalOpen) return;

    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowRight') showNext();
    if (event.key === 'ArrowLeft') showPrev();
  });
}

window.addEventListener('languagechange', () => {
  const container = document.getElementById('gallery-grid');
  if (container?.children.length) {
    container.querySelectorAll('[data-gallery-index]').forEach((trigger) => {
      trigger.setAttribute('aria-label', getCopy().openImage || 'Open image');
    });
  }

  updateModalLabels();

  const modalOpen = document.querySelector('.gallery-modal.is-open');
  if (modalOpen) updateModalImage();
});

window.addEventListener('DOMContentLoaded', () => {
  renderGallery();
  setupGalleryEvents();
});
