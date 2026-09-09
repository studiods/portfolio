(async () => {
  'use strict';

  const HOLD_MS = 2500;
  const TRANSITION_MS = 720;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const REUSE_MEDIA_DIR = 'assets/image/himart/reuse';
  const REUSE_MEDIA_API = `https://api.github.com/repos/studiods/portfolio/contents/${REUSE_MEDIA_DIR}?ref=main`;
  const IMAGE_EXTENSIONS = /\.(?:avif|gif|jpe?g|png|webp)$/i;

  /*
    GitHub Pages is a static host and cannot enumerate a directory by itself.
    Gallery 01 therefore reads the public GitHub Contents API on page load, filters
    image files in assets/image/himart/reuse and sorts them by the final number in
    each filename. New numbered images uploaded to that folder are picked up without
    another code edit. This fallback is kept only for temporary API/rate-limit failure.
  */
  const FALLBACK_STUDIO_MEDIA = [
    './assets/image/himart/reuse/reuse_studiio_01.png',
    './assets/image/himart/reuse/reuse_studiio_02.png',
    './assets/image/himart/reuse/reuse_studiio_03.png',
    './assets/image/himart/reuse/reuse_studiio_04.png'
  ];

  const trailingNumber = (name = '') => {
    const stem = name.replace(/\.[^.]+$/, '');
    const match = stem.match(/(\d+)(?!.*\d)/);
    return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
  };

  const loadStudioMedia = async () => {
    try {
      const response = await fetch(`${REUSE_MEDIA_API}&_=${Date.now()}`, {
        cache: 'no-store',
        headers: { Accept: 'application/vnd.github+json' }
      });
      if (!response.ok) throw new Error(`Reuse media directory request failed: ${response.status}`);

      const entries = await response.json();
      if (!Array.isArray(entries)) throw new Error('Reuse media directory response is not an array');

      const numberedImages = entries
        .filter((entry) => entry?.type === 'file' && IMAGE_EXTENSIONS.test(entry.name || ''))
        .map((entry) => ({ entry, order: trailingNumber(entry.name) }))
        .filter(({ order }) => Number.isFinite(order))
        .sort((a, b) => a.order - b.order || a.entry.name.localeCompare(b.entry.name, 'ko', { numeric: true }))
        .map(({ entry }) => new URL(`./${entry.path}`, window.location.href).href);

      return numberedImages.length ? numberedImages : FALLBACK_STUDIO_MEDIA;
    } catch (error) {
      console.warn('[Reuse gallery] directory auto-discovery failed; using fallback manifest.', error);
      return FALLBACK_STUDIO_MEDIA;
    }
  };

  const galleries = Array.from(document.querySelectorAll('.reuse-production-gallery'));
  if (!galleries.length) return;

  const buildStudioSlides = (gallery, sources) => {
    const viewport = gallery?.querySelector('.reuse-production-gallery__viewport');
    if (!viewport || !sources.length) return;

    const fragment = document.createDocumentFragment();
    sources.forEach((src, index) => {
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

  const studioMedia = await loadStudioMedia();
  buildStudioSlides(galleries[0], studioMedia);

  const controllers = new Map();

  galleries.forEach((gallery) => {
    const slides = Array.from(gallery.querySelectorAll('.reuse-production-gallery__slide'));
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
    controllers.set(gallery, controller);
    settle();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => controllers.get(entry.target)?.setInView(entry.isIntersecting));
    }, { threshold: 0.20, rootMargin: '0px 0px -5% 0px' });
    controllers.forEach((_, gallery) => observer.observe(gallery));
  } else {
    controllers.forEach((controller) => controller.setInView(true));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) controllers.forEach((controller) => controller.pause());
    else controllers.forEach((controller) => controller.resume());
  });
})();
