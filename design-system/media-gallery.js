(() => {
  'use strict';

  const GALLERY_SELECTOR = '.hm-ds-media-gallery';
  const ITEM_SELECTOR = '.hm-ds-media-gallery__item';
  const IMAGE_SELECTOR = ':scope > img';

  let lightbox = null;
  let lightboxImage = null;
  let closeButton = null;
  let lastTrigger = null;

  const ensureLightbox = () => {
    if (lightbox) return lightbox;

    lightbox = document.createElement('div');
    lightbox.className = 'hm-ds-image-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.setAttribute('aria-label', '이미지 확대 보기');

    const stage = document.createElement('div');
    stage.className = 'hm-ds-image-lightbox__stage';

    lightboxImage = document.createElement('img');
    lightboxImage.className = 'hm-ds-image-lightbox__image';
    lightboxImage.alt = '';

    closeButton = document.createElement('button');
    closeButton.className = 'hm-ds-image-lightbox__close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', '확대 이미지 닫기');

    stage.append(lightboxImage, closeButton);
    lightbox.append(stage);
    document.body.append(lightbox);

    return lightbox;
  };

  const closeLightbox = () => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('hm-ds-lightbox-open');
    lightboxImage.removeAttribute('src');
    lightboxImage.alt = '';
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    lastTrigger = null;
  };

  const openLightbox = (image) => {
    ensureLightbox();
    lastTrigger = image;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('hm-ds-lightbox-open');
    closeButton.focus({ preventScroll: true });
  };

  const activateGallery = (gallery) => {
    if (gallery.dataset.galleryNoExpand === 'true') return;

    const items = gallery.querySelectorAll(ITEM_SELECTOR);
    if (items.length !== 1) return;

    const image = items[0].querySelector(IMAGE_SELECTOR);
    if (!image) return;

    gallery.classList.add('is-single-expand');
    image.setAttribute('role', 'button');
    image.setAttribute('tabindex', '0');
    image.setAttribute('aria-label', `${image.alt || '이미지'} 크게 보기`);

    image.addEventListener('click', (event) => {
      event.preventDefault();
      openLightbox(image);
    });

    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(image);
      }
    });
  };

  const init = () => {
    document.querySelectorAll(GALLERY_SELECTOR).forEach(activateGallery);
    ensureLightbox();

    lightbox.addEventListener('click', closeLightbox);
    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      closeLightbox();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeLightbox();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
