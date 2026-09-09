(() => {
  'use strict';

  const HOLD_MS = 2500;
  const TRANSITION_MS = 720;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  /* Current files in assets/image/himart/reuse, intentionally ordered by filename number.
     GitHub Pages cannot enumerate a repository directory at runtime, so this manifest is the
     browser-safe source of truth for 03.3 gallery 01. */
  const STUDIO_MEDIA = [
    './assets/image/himart/reuse/reuse_studiio_01.png',
    './assets/image/himart/reuse/reuse_studiio_02.png'
  ];

  const galleries = Array.from(document.querySelectorAll('.reuse-production-gallery'));
  if (!galleries.length) return;

  const buildStudioSlides = (gallery) => {
    const viewport = gallery?.querySelector('.reuse-production-gallery__viewport');
    if (!viewport || !STUDIO_MEDIA.length) return;

    const fragment = document.createDocumentFragment();
    STUDIO_MEDIA.forEach((src, index) => {
      const slide = document.createElement('article');
      slide.className = `reuse-production-gallery__slide${index === 0 ? ' is-active' : ''}`;
      slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');

      const media = document.createElement('div');
      media.className = 'reuse-production-gallery__media';

      const image = document.createElement('img');
      image.src = src;
      image.alt = '';
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.draggable = false;

      media.appendChild(image);
      slide.appendChild(media);
      fragment.appendChild(slide);
    });
    viewport.replaceChildren(fragment);
  };

  buildStudioSlides(galleries[0]);

  const controllers = [];

  galleries.forEach((gallery) => {
    let slides = Array.from(gallery.querySelectorAll('.reuse-production-gallery__slide'));
    const prev = gallery.querySelector('[data-reuse-gallery-prev]');
    const next = gallery.querySelector('[data-reuse-gallery-next]');
    const status = gallery.querySelector('[data-reuse-gallery-status]');
    if (!slides.length) return;

    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer = 0;
    let busy = false;
    let inView = false;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };

    const updateStatus = () => {
      if (!status) return;
      status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };

    const settle = () => {
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.classList.remove('is-next', 'is-entering', 'is-exiting');
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      gallery.classList.remove('is-reverse');
      updateStatus();
    };

    const schedule = () => {
      clearTimer();
      if (!inView || document.hidden || busy || slides.length < 2) return;
      timer = window.setTimeout(() => move(1, true), HOLD_MS);
    };

    const transitionTo = (targetIndex, direction = 1) => {
      if (busy || slides.length < 2 || targetIndex === index) return;
      clearTimer();
      busy = true;

      const current = slides[index];
      const incoming = slides[targetIndex];
      gallery.classList.toggle('is-reverse', direction < 0);

      slides.forEach((slide, i) => {
        if (i !== index && i !== targetIndex) {
          slide.classList.remove('is-active', 'is-next', 'is-entering', 'is-exiting');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      current.classList.add('is-active');
      current.classList.remove('is-next', 'is-entering');
      incoming.classList.remove('is-active', 'is-exiting', 'is-entering');
      incoming.classList.add('is-next');
      incoming.setAttribute('aria-hidden', 'true');

      if (reducedMotion) {
        index = targetIndex;
        busy = false;
        settle();
        schedule();
        return;
      }

      /* Force the 95% / 20%-black incoming state to paint before the transition starts. */
      void incoming.offsetWidth;
      current.classList.add('is-exiting');
      incoming.classList.add('is-entering');

      window.setTimeout(() => {
        index = targetIndex;
        busy = false;
        settle();
        schedule();
      }, TRANSITION_MS + 30);
    };

    function move(delta, automatic = false) {
      if (busy || slides.length < 2) return;
      const targetIndex = (index + delta + slides.length) % slides.length;
      transitionTo(targetIndex, delta < 0 ? -1 : 1);
      if (!automatic) clearTimer();
    }

    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));

    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    });

    const controller = {
      setInView(value) {
        inView = value;
        if (inView) schedule();
        else clearTimer();
      },
      resume() { if (inView) schedule(); },
      pause() { clearTimer(); }
    };
    controllers.push(controller);
    settle();
  });

  if ('IntersectionObserver' in window) {
    const byGallery = new Map();
    galleries.forEach((gallery, index) => {
      if (controllers[index]) byGallery.set(gallery, controllers[index]);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => byGallery.get(entry.target)?.setInView(entry.isIntersecting));
    }, { threshold: 0.20, rootMargin: '0px 0px -5% 0px' });
    byGallery.forEach((_, gallery) => observer.observe(gallery));
  } else {
    controllers.forEach((controller) => controller.setInView(true));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) controllers.forEach((controller) => controller.pause());
    else controllers.forEach((controller) => controller.resume());
  });
})();
