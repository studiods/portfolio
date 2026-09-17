(() => {
  'use strict';

  const runtime = window.HMDSGalleryRuntime;
  const reducedMotion = runtime?.reducedMotion ?? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const HOLD_MS = 2500;
  const TRANSITION_MS = 720;

  const galleryConfigs = [
    {
      root: '#data .aimmo-evidence-gallery',
      stagger: [0, 850, 1700],
      sequences: [
        [
          './assets/image/aimmo-system/aimmo_system_01_01.png',
          './assets/image/aimmo-system/aimmo_system_01_02.png',
          './assets/image/aimmo-system/aimmo_system_01_03.png',
          './assets/image/aimmo-system/aimmo_system_01_04.png'
        ],
        [
          './assets/image/aimmo-system/aimmo_system_02_01.png',
          './assets/image/aimmo-system/aimmo_system_02_02.png',
          './assets/image/aimmo-system/aimmo_system_02_03.png',
          './assets/image/aimmo-system/aimmo_system_02_04.png',
          './assets/image/aimmo-system/aimmo_system_02_05.png',
          './assets/image/aimmo-system/aimmo_system_02_06.png'
        ],
        [
          './assets/image/aimmo-system/aimmo_system_03_01.png',
          './assets/image/aimmo-system/aimmo_system_03_02.png',
          './assets/image/aimmo-system/aimmo_system_03_03.png',
          './assets/image/aimmo-system/aimmo_system_03_04.png',
          './assets/image/aimmo-system/aimmo_system_03_05.png'
        ]
      ]
    },
    {
      root: '#data .aimmo-improvement-gallery',
      stagger: [250, 950, 1650, 2350],
      sequences: [
        [
          './assets/image/aimmo-system/aimmo_system_06_01.png',
          './assets/image/aimmo-system/aimmo_system_06_02.png',
          './assets/image/aimmo-system/aimmo_system_06_03.png',
          './assets/image/aimmo-system/aimmo_system_06_04.png'
        ],
        [
          './assets/image/aimmo-system/aimmo_system_07_01.png',
          './assets/image/aimmo-system/aimmo_system_07_02.png',
          './assets/image/aimmo-system/aimmo_system_07_03.png',
          './assets/image/aimmo-system/aimmo_system_07_04.png'
        ],
        [
          './assets/image/aimmo-system/aimmo_system_08_01.png',
          './assets/image/aimmo-system/aimmo_system_08_02.png',
          './assets/image/aimmo-system/aimmo_system_08_03.png'
        ],
        [
          './assets/image/aimmo-system/aimmo_system_09_01.png',
          './assets/image/aimmo-system/aimmo_system_09_02.png',
          './assets/image/aimmo-system/aimmo_system_09_03.png'
        ]
      ]
    }
  ];

  const registerVisibilityFallback = (root, callback) => {
    let inView = false;
    const update = value => {
      inView = Boolean(value);
      callback(inView && !document.hidden && !reducedMotion);
    };
    let observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        update(Boolean(entry?.isIntersecting && entry.intersectionRatio >= .12));
      }, { threshold:[0,.12,.25,.5,1] });
      observer.observe(root);
    } else update(true);
    const onVisibility = () => callback(inView && !document.hidden && !reducedMotion);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  };

  const setupCard = (card, sources, initialDelay = 0) => {
    if (!card || !sources.length || card.dataset.aimmoGalleryMounted === 'true') return;
    card.dataset.aimmoGalleryMounted = 'true';

    const authoredImage = card.querySelector(':scope > img');
    const caption = card.querySelector('figcaption');
    const viewport = document.createElement('div');
    viewport.className = 'aimmo-evidence-card__viewport';

    sources.forEach((src, slideIndex) => {
      const slide = document.createElement('article');
      slide.className = `aimmo-evidence-card__slide${slideIndex === 0 ? ' is-active' : ''}`;
      slide.setAttribute('aria-hidden', slideIndex === 0 ? 'false' : 'true');
      slide.dataset.gallerySrc = src;

      const media = document.createElement('div');
      media.className = 'aimmo-evidence-card__media';
      slide.appendChild(media);
      viewport.appendChild(slide);
    });

    authoredImage?.remove();
    card.insertBefore(viewport, caption || card.firstChild);
    card.tabIndex = 0;
    card.style.touchAction = 'pan-y';

    const prev = document.createElement('button');
    prev.className = 'aimmo-evidence-card__nav aimmo-evidence-card__nav--prev hm-ds-gallery-nav hm-ds-gallery-nav--prev';
    prev.type = 'button';
    prev.setAttribute('aria-label', '이전 이미지');

    const next = document.createElement('button');
    next.className = 'aimmo-evidence-card__nav aimmo-evidence-card__nav--next hm-ds-gallery-nav hm-ds-gallery-nav--next';
    next.type = 'button';
    next.setAttribute('aria-label', '다음 이미지');

    const status = document.createElement('span');
    status.className = 'aimmo-evidence-card__status';
    status.setAttribute('aria-live', 'polite');

    card.append(prev, next, status);

    const slides = [...viewport.querySelectorAll('.aimmo-evidence-card__slide')];
    let index = 0;
    let timer = 0;
    let busy = false;
    let autoActive = false;
    let hasStarted = false;
    let pointerStart = null;

    const ensureLoaded = slideIndex => {
      const slide = slides[slideIndex];
      if (!slide || slide.dataset.galleryLoaded === 'true') return;
      slide.dataset.galleryLoaded = 'true';
      const media = slide.querySelector('.aimmo-evidence-card__media');
      const image = document.createElement('img');
      image.alt = '';
      image.loading = slideIndex === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.draggable = false;
      image.addEventListener('error', () => {
        media?.classList.add('is-missing');
        image.remove();
      }, { once:true });
      image.src = slide.dataset.gallerySrc;
      media?.appendChild(image);
    };

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };

    const updateStatus = () => {
      status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };

    const settle = () => {
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.classList.remove('is-next', 'is-entering', 'is-exiting');
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      card.classList.remove('is-reverse');
      updateStatus();
    };

    const schedule = (delay = HOLD_MS) => {
      clearTimer();
      if (!autoActive || reducedMotion || busy || slides.length < 2) return;
      ensureLoaded((index + 1) % slides.length);
      timer = window.setTimeout(() => move(1), delay);
    };

    const transitionTo = (targetIndex, direction = 1) => {
      if (busy || slides.length < 2 || targetIndex === index) return;
      clearTimer();
      ensureLoaded(targetIndex);
      busy = true;

      const current = slides[index];
      const incoming = slides[targetIndex];
      card.classList.toggle('is-reverse', direction < 0);

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

    prev.addEventListener('click', event => {
      event.stopPropagation();
      move(-1);
    });
    next.addEventListener('click', event => {
      event.stopPropagation();
      move(1);
    });

    card.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    });

    card.addEventListener('pointerdown', event => {
      pointerStart = { x:event.clientX, y:event.clientY };
      clearTimer();
    });
    card.addEventListener('pointerup', event => {
      if (!pointerStart) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.15) move(dx < 0 ? 1 : -1);
      else schedule();
    });
    card.addEventListener('pointercancel', () => {
      pointerStart = null;
      schedule();
    });

    const setAutoActive = active => {
      autoActive = Boolean(active);
      if (!autoActive) {
        clearTimer();
        return;
      }
      ensureLoaded(index);
      const delay = hasStarted ? HOLD_MS : HOLD_MS + initialDelay;
      hasStarted = true;
      schedule(delay);
    };

    ensureLoaded(0);
    settle();
    if (runtime) runtime.register(card, setAutoActive);
    else registerVisibilityFallback(card, setAutoActive);
  };

  galleryConfigs.forEach(config => {
    const root = document.querySelector(`body.aimmo-system-page ${config.root}`);
    if (!root) return;
    const cards = [...root.querySelectorAll('.aimmo-evidence-card')];
    cards.forEach((card, index) => {
      const sequence = config.sequences[index];
      if (!sequence) return;
      setupCard(card, sequence, config.stagger[index] || 0);
    });
  });
})();
