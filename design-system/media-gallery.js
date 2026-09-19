(() => {
  'use strict';

  const GALLERY_SELECTOR = '.hm-ds-media-gallery, .aimmo-application-gallery';
  const ITEM_SELECTOR = '.hm-ds-media-gallery__item, .aimmo-application-gallery__item';
  const SINGLE_COLUMN_SELECTOR = '.hm-ds-media-gallery--single-column, .aimmo-wide-gallery';
  const IMAGE_SELECTOR = ':scope > img';
  const CAROUSEL_SELECTOR = '[data-hm-ds-carousel]';
  const PRODUCT_GALLERY_SELECTOR = '.hst-product-gallery';
  const PRODUCT_GALLERY_IMAGE_SELECTOR = '.hst-product-gallery__slide[data-hst-slide] > img';
  const EXPLICIT_IMAGE_SELECTOR = '[data-hm-ds-expand-image]';
  const DOM_GALLERY_SELECTOR = '[data-hm-ds-dom-gallery]';
  const DOM_SLIDE_SELECTOR = '[data-hst-slide]';
  const CAROUSEL_SLIDE_SELECTOR = '.hm-ds-media-carousel__slide';
  const HOLD_MS = 3000;
  const TRANSITION_MS = 720;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  let lightbox = null;
  let lightboxViewport = null;
  let lightboxImage = null;
  let lightboxIncoming = null;
  let lightboxDomViewport = null;
  let lightboxDomCanvas = null;
  let lightboxPrev = null;
  let lightboxNext = null;
  let closeButton = null;
  let lastTrigger = null;
  let lightboxGroup = [];
  let lightboxIndex = 0;
  let lightboxMode = 'image';
  let lightboxDomGroup = [];
  let lightboxDomIndex = 0;
  let lightboxBusy = false;
  let lightboxTransitionTimer = 0;

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

    lightboxViewport = document.createElement('div');
    lightboxViewport.className = 'hm-ds-image-lightbox__viewport';

    lightboxImage = document.createElement('img');
    lightboxImage.className = 'hm-ds-image-lightbox__image';
    lightboxImage.alt = '';

    lightboxIncoming = document.createElement('img');
    lightboxIncoming.className = 'hm-ds-image-lightbox__image hm-ds-image-lightbox__image--incoming';
    lightboxIncoming.alt = '';

    lightboxDomViewport = document.createElement('div');
    lightboxDomViewport.className = 'hm-ds-image-lightbox__dom';
    lightboxDomViewport.hidden = true;

    lightboxDomCanvas = document.createElement('div');
    lightboxDomCanvas.className = 'hm-ds-image-lightbox__dom-canvas';
    lightboxDomViewport.append(lightboxDomCanvas);

    lightboxPrev = document.createElement('button');
    lightboxPrev.className = 'hm-ds-image-lightbox__nav hm-ds-image-lightbox__nav--prev';
    lightboxPrev.type = 'button';
    lightboxPrev.setAttribute('aria-label', '이전 확대 이미지');

    lightboxNext = document.createElement('button');
    lightboxNext.className = 'hm-ds-image-lightbox__nav hm-ds-image-lightbox__nav--next';
    lightboxNext.type = 'button';
    lightboxNext.setAttribute('aria-label', '다음 확대 이미지');

    closeButton = document.createElement('button');
    closeButton.className = 'hm-ds-image-lightbox__close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', '확대 이미지 닫기');

    lightboxViewport.append(lightboxImage, lightboxIncoming);
    stage.append(lightboxViewport, lightboxDomViewport, lightboxPrev, lightboxNext, closeButton);
    lightbox.append(stage);
    document.body.append(lightbox);
    lightboxImage.addEventListener('load', updateLightboxNavContrast);

    return lightbox;
  };

  const getLightboxGroup = (image) => {
    const stack = image.closest('.hm-ds-media-gallery-stack');
    const selector = '.hm-ds-media-gallery__item > img, .aimmo-application-gallery__item > img';
    if (stack) {
      const images = Array.from(stack.querySelectorAll(selector)).filter((item) => item.dataset.galleryExpandBound === 'true');
      if (images.length) return images;
    }

    const gallery = image.closest(GALLERY_SELECTOR);
    if (gallery) {
      const images = Array.from(gallery.querySelectorAll(selector)).filter((item) => item.dataset.galleryExpandBound === 'true');
      if (images.length) return images;
    }

    const productGallery = image.closest(PRODUCT_GALLERY_SELECTOR);
    if (productGallery) {
      const images = Array.from(productGallery.querySelectorAll(PRODUCT_GALLERY_IMAGE_SELECTOR))
        .filter((item) => item.dataset.galleryExpandBound === 'true');
      if (images.length) return images;
    }
    return [image];
  };

  const updateLightboxNav = () => {
    if (!lightboxPrev || !lightboxNext) return;
    const count = lightboxMode === 'dom' ? lightboxDomGroup.length : lightboxGroup.length;
    const hidden = count < 2;
    lightboxPrev.hidden = hidden;
    lightboxNext.hidden = hidden;
  };

  const sampleEdgeLuminance = (image, side) => {
    if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, 32, 32);
    const x = side === 'prev' ? 0 : 26;
    const data = context.getImageData(x, 6, 6, 20).data;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 32) continue;
      sum += (0.2126 * data[i]) + (0.7152 * data[i + 1]) + (0.0722 * data[i + 2]);
      count += 1;
    }
    return count ? (sum / count) : null;
  };

  const updateLightboxNavContrast = () => {
    if (!lightbox || !lightboxImage) return;
    try {
      const prevLum = sampleEdgeLuminance(lightboxImage, 'prev');
      const nextLum = sampleEdgeLuminance(lightboxImage, 'next');
      if (prevLum == null || nextLum == null) throw new Error('no luminance sample');
      lightbox.style.setProperty('--hm-lightbox-nav-prev-color', prevLum > 150 ? '#111' : '#fff');
      lightbox.style.setProperty('--hm-lightbox-nav-next-color', nextLum > 150 ? '#111' : '#fff');
    } catch {
      lightbox.style.removeProperty('--hm-lightbox-nav-prev-color');
      lightbox.style.removeProperty('--hm-lightbox-nav-next-color');
    }
  };

  const closeLightbox = () => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (lightboxTransitionTimer) window.clearTimeout(lightboxTransitionTimer);
    lightboxTransitionTimer = 0;
    lightboxBusy = false;
    lightbox.classList.remove('is-open', 'is-reverse', 'is-dom');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('hm-ds-lightbox-open');
    lightboxImage.classList.remove('is-exiting');
    lightboxIncoming.classList.remove('is-next', 'is-entering');
    lightboxImage.removeAttribute('src');
    lightboxIncoming.removeAttribute('src');
    lightboxImage.alt = '';
    lightboxIncoming.alt = '';
    lightboxGroup = [];
    lightboxIndex = 0;
    lightboxDomGroup = [];
    lightboxDomIndex = 0;
    lightboxMode = 'image';
    lightboxDomCanvas?.replaceChildren();
    if (lightboxDomViewport) lightboxDomViewport.hidden = true;
    if (lightboxViewport) lightboxViewport.hidden = false;
    lightbox.style.removeProperty('--hm-lightbox-nav-prev-color');
    lightbox.style.removeProperty('--hm-lightbox-nav-next-color');
    updateLightboxNav();
    if (lightbox.parentNode !== document.body) document.body.append(lightbox);
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    lastTrigger = null;
  };

  const renderDomLightbox = () => {
    if (!lightboxDomCanvas || !lightboxDomViewport) return;
    const source = lightboxDomGroup[lightboxDomIndex];
    if (!source) return;

    const clone = source.cloneNode(true);
    clone.removeAttribute('data-hst-slide');
    clone.removeAttribute('aria-hidden');
    clone.removeAttribute('role');
    clone.removeAttribute('tabindex');
    clone.classList.remove('hm-ds-gallery-expand-target');
    clone.classList.add('hm-ds-dom-lightbox-clone');

    const sourceWidth = Math.max(1, source.offsetWidth || source.getBoundingClientRect().width || 1200);
    const sourceHeight = Math.max(1, source.offsetHeight || source.getBoundingClientRect().height || sourceWidth * .75);
    const maxWidth = window.innerWidth * .85;
    const maxHeight = Math.max(1, window.innerHeight - 96);
    const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);

    lightboxDomViewport.style.width = Math.round(sourceWidth * scale) + 'px';
    lightboxDomViewport.style.height = Math.round(sourceHeight * scale) + 'px';
    lightboxDomCanvas.style.width = sourceWidth + 'px';
    lightboxDomCanvas.style.height = sourceHeight + 'px';
    lightboxDomCanvas.style.transform = 'scale(' + scale + ')';
    lightboxDomCanvas.replaceChildren(clone);
  };

  const openDomLightbox = (slide) => {
    ensureLightbox();
    const gallery = slide.closest(DOM_GALLERY_SELECTOR);
    if (!gallery) return;

    const track = gallery.querySelector('.hst-ds-gallery__track');
    lightboxDomGroup = track
      ? Array.from(track.children).filter((item) => item.matches(DOM_SLIDE_SELECTOR))
      : [slide];
    lightboxDomIndex = Math.max(0, lightboxDomGroup.indexOf(slide));
    lightboxMode = 'dom';
    lightboxBusy = false;
    lastTrigger = slide;

    const scope = slide.closest('#direction') || document.body;
    if (lightbox.parentNode !== scope) scope.append(lightbox);

    lightbox.classList.add('is-dom');
    lightboxViewport.hidden = true;
    lightboxDomViewport.hidden = false;
    lightbox.style.setProperty('--hm-lightbox-nav-prev-color', '#111');
    lightbox.style.setProperty('--hm-lightbox-nav-next-color', '#111');
    renderDomLightbox();
    updateLightboxNav();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('hm-ds-lightbox-open');
    closeButton.focus({ preventScroll: true });
  };

  const moveLightbox = (delta) => {
    if (lightboxMode === 'dom') {
      if (lightboxDomGroup.length < 2) return;
      lightboxDomIndex = (lightboxDomIndex + delta + lightboxDomGroup.length) % lightboxDomGroup.length;
      renderDomLightbox();
      return;
    }
    if (lightboxBusy || lightboxGroup.length < 2) return;
    const targetIndex = (lightboxIndex + delta + lightboxGroup.length) % lightboxGroup.length;
    const target = lightboxGroup[targetIndex];
    if (!target) return;

    lightboxBusy = true;
    lightbox.classList.toggle('is-reverse', delta < 0);
    lightboxIncoming.src = target.currentSrc || target.src;
    lightboxIncoming.alt = target.alt || '';
    lightboxIncoming.classList.add('is-next');

    const complete = () => {
      lightboxIndex = targetIndex;
      lightboxImage.src = lightboxIncoming.src;
      lightboxImage.alt = lightboxIncoming.alt;
      lightboxImage.classList.remove('is-exiting');
      lightboxIncoming.classList.remove('is-next', 'is-entering');
      lightboxIncoming.removeAttribute('src');
      lightboxIncoming.alt = '';
      lightbox.classList.remove('is-reverse');
      lightboxBusy = false;
      lightboxTransitionTimer = 0;
      window.requestAnimationFrame(updateLightboxNavContrast);
    };

    if (reducedMotion) {
      complete();
      return;
    }

    void lightboxIncoming.offsetWidth;
    lightboxImage.classList.add('is-exiting');
    lightboxIncoming.classList.add('is-entering');
    lightboxTransitionTimer = window.setTimeout(complete, TRANSITION_MS + 30);
  };

  const openLightbox = (image) => {
    ensureLightbox();
    lightboxMode = 'image';
    lightbox.classList.remove('is-dom');
    if (lightbox.parentNode !== document.body) document.body.append(lightbox);
    lightboxViewport.hidden = false;
    lightboxDomViewport.hidden = true;
    lightboxDomCanvas?.replaceChildren();
    lastTrigger = image;
    lightboxGroup = getLightboxGroup(image);
    lightboxIndex = Math.max(0, lightboxGroup.indexOf(image));
    lightboxBusy = false;
    lightboxImage.classList.remove('is-exiting');
    lightboxIncoming.classList.remove('is-next', 'is-entering');
    lightboxIncoming.removeAttribute('src');
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || '';
    updateLightboxNav();
    if (lightboxImage.complete) window.requestAnimationFrame(updateLightboxNavContrast);
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

  const bindExpandableDomSlide = (slide) => {
    if (!slide || slide.dataset.galleryDomExpandBound === 'true') return;

    slide.dataset.galleryDomExpandBound = 'true';
    slide.classList.add('hm-ds-gallery-expand-target');
    slide.setAttribute('role', 'button');
    slide.setAttribute('tabindex', '0');
    slide.setAttribute('aria-label', `${slide.getAttribute('aria-label') || '디자인 시스템 페이지'} 크게 보기`);

    slide.addEventListener('click', (event) => {
      event.preventDefault();
      openDomLightbox(slide);
    });

    slide.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDomLightbox(slide);
      }
    });
  };

  const activateDomGallery = (gallery) => {
    const track = gallery.querySelector('.hst-ds-gallery__track');
    if (!track) return;
    Array.from(track.children)
      .filter((slide) => slide.matches(DOM_SLIDE_SELECTOR))
      .forEach(bindExpandableDomSlide);
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
    const status = root.querySelector(':scope > [data-hm-ds-carousel-status]');
    const requestedHold = Number(root.dataset.hmDsCarouselHold || root.dataset.autoplay);
    const holdMs = Number.isFinite(requestedHold) && requestedHold >= 1000 ? requestedHold : HOLD_MS;
    const autoPlayEnabled = root.dataset.hmDsCarouselAutoplay !== 'false';
    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer = 0;
    let busy = false;
    let inView = false;
    let pointerStart = null;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };

    const updateStatus = () => {
      if (!status) return;
      status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };

    const settle = () => {
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.classList.remove('is-next', 'is-entering', 'is-exiting');
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      root.classList.remove('is-reverse');
      updateStatus();
    };

    const canAutoPlay = () => autoPlayEnabled && inView && !document.hidden && !reducedMotion && slides.length > 1;

    const schedule = (delay = holdMs) => {
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
    document.querySelectorAll(`${PRODUCT_GALLERY_SELECTOR} ${PRODUCT_GALLERY_IMAGE_SELECTOR}`).forEach(bindExpandableImage);
    document.querySelectorAll(EXPLICIT_IMAGE_SELECTOR).forEach(bindExpandableImage);
    document.querySelectorAll(DOM_GALLERY_SELECTOR).forEach(activateDomGallery);
    ensureLightbox();

    lightbox.addEventListener('click', closeLightbox);
    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      closeLightbox();
    });
    lightboxPrev.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      moveLightbox(-1);
    });
    lightboxNext.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      moveLightbox(1);
    });

    window.addEventListener('resize', () => {
      if (lightbox?.classList.contains('is-open') && lightboxMode === 'dom') renderDomLightbox();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveLightbox(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveLightbox(1);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
