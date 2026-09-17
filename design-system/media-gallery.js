(() => {
  'use strict';

  const GALLERY_SELECTOR = '.hm-ds-media-gallery, .aimmo-application-gallery';
  const ITEM_SELECTOR = '.hm-ds-media-gallery__item, .aimmo-application-gallery__item';
  const SINGLE_COLUMN_SELECTOR = '.hm-ds-media-gallery--single-column, .aimmo-wide-gallery';
  const IMAGE_SELECTOR = ':scope > img';
  const CAROUSEL_SELECTOR = '[data-hm-ds-carousel]';
  const CAROUSEL_SLIDE_SELECTOR = '.hm-ds-media-carousel__slide';
  const HOLD_MS = 3000;
  const TRANSITION_MS = 720;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

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

  const bindExpandableImage = (image) => {
    if (!image || image.dataset.galleryExpandBound === 'true') return;

    image.dataset.galleryExpandBound = 'true';
    image.classList.add('hm-ds-gallery-expand-target');
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

  const activateGallery = (gallery) => {
    if (gallery.dataset.galleryNoExpand === 'true') return;

    const items = Array.from(gallery.children).filter((child) => child.matches(ITEM_SELECTOR));
    const isSingleImage = items.length === 1;
    const isSingleColumn = gallery.matches(SINGLE_COLUMN_SELECTOR);

    if (!isSingleImage && !isSingleColumn) return;

    gallery.classList.add(isSingleImage ? 'is-single-expand' : 'is-item-expand');
    items.forEach((item) => bindExpandableImage(item.querySelector(IMAGE_SELECTOR)));
  };

  const activateCarousel = (root) => {
    if (!root || root.dataset.hmDsCarouselMounted === 'true') return;

    const slides = Array.from(root.querySelectorAll(`:scope > .hm-ds-media-carousel__viewport > ${CAROUSEL_SLIDE_SELECTOR}`));
    if (!slides.length) return;

    root.dataset.hmDsCarouselMounted = 'true';
    root.tabIndex = root.tabIndex >= 0 ? root.tabIndex : 0;
    root.style.touchAction = 'pan-y';

    const prev = root.querySelector(':scope > .hm-ds-gallery-nav--prev');
    const next = root.querySelector(':scope > .hm-ds-gallery-nav--next');
    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer = 0;
    let busy = false;
    let inView = false;
    let pointerStart = null;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };

    const settle = () => {
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.classList.remove('is-next', 'is-entering', 'is-exiting');
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      root.classList.remove('is-reverse');
    };

    const canAutoPlay = () => inView && !document.hidden && !reducedMotion && slides.length > 1;

    const schedule = (delay = HOLD_MS) => {
      clearTimer();
      if (!canAutoPlay() || busy) return;
      timer = window.setTimeout(() => move(1), delay);
    };

    const transitionTo = (targetIndex, direction = 1) => {
      if (busy || slides.length < 2 || targetIndex === index) return;
      clearTimer();
      busy = true;

      const current = slides[index];
      const incoming = slides[targetIndex];
      root.classList.toggle('is-reverse', direction < 0);

      slides.forEach((slide, slideIndex) => {
        if (slideIndex !== index && slideIndex !== targetIndex) {
          slide.classList.remove('is-active', 'is-next', 'is-entering', 'is-exiting');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      current.classList.add('is-active');
      current.classList.remove('is-next', 'is-entering');
      incoming.classList.remove('is-active', 'is-exiting', 'is-entering');
      incoming.classList.add('is-next');
      incoming.setAttribute('aria-hidden', 'true');

      const complete = () => {
        index = targetIndex;
        busy = false;
        settle();
        schedule();
      };

      if (reducedMotion) {
        complete();
        return;
      }

      void incoming.offsetWidth;
      current.classList.add('is-exiting');
      incoming.classList.add('is-entering');
      window.setTimeout(complete, TRANSITION_MS + 30);
    };

    function move(delta) {
      if (busy || slides.length < 2) return;
      const targetIndex = (index + delta + slides.length) % slides.length;
      transitionTo(targetIndex, delta < 0 ? -1 : 1);
    }

    prev?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      move(-1);
    });
    next?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      move(1);
    });

    root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    });

    root.addEventListener('pointerdown', (event) => {
      pointerStart = { x:event.clientX, y:event.clientY };
      clearTimer();
    });
    root.addEventListener('pointerup', (event) => {
      if (!pointerStart) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.15) move(dx < 0 ? 1 : -1);
      else schedule();
    });
    root.addEventListener('pointercancel', () => {
      pointerStart = null;
      schedule();
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        inView = Boolean(entry?.isIntersecting && entry.intersectionRatio >= .12);
        if (canAutoPlay()) schedule();
        else clearTimer();
      }, { threshold:[0,.12,.25,.5,1] });
      observer.observe(root);
    } else {
      inView = true;
    }

    document.addEventListener('visibilitychange', () => {
      if (canAutoPlay()) schedule();
      else clearTimer();
    });

    settle();
    schedule();
  };

  const init = () => {
    document.querySelectorAll(GALLERY_SELECTOR).forEach(activateGallery);
    document.querySelectorAll(CAROUSEL_SELECTOR).forEach(activateCarousel);
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
