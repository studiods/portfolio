(() => {
  'use strict';

  const root = document.querySelector('body.aimmo-system-page #data .aimmo-evidence-gallery');
  if (!root) return;

  const cards = [...root.querySelectorAll('.aimmo-evidence-card')];
  if (cards.length < 3) return;

  const sequences = [
    [
      './assets/image/aimmo-system/aimmo_system_01_01.png',
      './assets/image/aimmo-system/aimmo_system_01_02.png',
      './assets/image/aimmo-system/aimmo_system_01_03.png',
      './assets/image/aimmo-system/aimmo_system_01_04.png'
    ],
    [
      './assets/image/aimmo-system/aimmo_system_02_01.png',
      './assets/image/aimmo-system/aimmo_system_02_02.png',
      './assets/image/aimmo-system/aimmo_system_02_03.png'
    ],
    [
      './assets/image/aimmo-system/aimmo_system_03_01.png',
      './assets/image/aimmo-system/aimmo_system_03_02.png',
      './assets/image/aimmo-system/aimmo_system_03_03.png'
    ]
  ];

  const HOLD_MS = 2500;
  const TRANSITION_MS = 720;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const preload = src => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => resolve(null);
    image.src = src;
  });

  const setupCard = async (card, requested) => {
    const loaded = (await Promise.all(requested.map(preload))).filter(Boolean);
    if (!loaded.length) return;

    const authoredImage = card.querySelector(':scope > img');
    const caption = card.querySelector('figcaption');
    const viewport = document.createElement('div');
    viewport.className = 'aimmo-evidence-card__viewport';

    loaded.forEach((src, slideIndex) => {
      const slide = document.createElement('article');
      slide.className = `aimmo-evidence-card__slide${slideIndex === 0 ? ' is-active' : ''}`;
      slide.setAttribute('aria-hidden', slideIndex === 0 ? 'false' : 'true');

      const media = document.createElement('div');
      media.className = 'aimmo-evidence-card__media';

      const image = document.createElement('img');
      image.src = src;
      image.alt = '';
      image.loading = slideIndex === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.draggable = false;

      media.appendChild(image);
      slide.appendChild(media);
      viewport.appendChild(slide);
    });

    authoredImage?.remove();
    card.insertBefore(viewport, caption || card.firstChild);
    card.tabIndex = 0;

    const prev = document.createElement('button');
    prev.className = 'aimmo-evidence-card__nav aimmo-evidence-card__nav--prev';
    prev.type = 'button';
    prev.setAttribute('aria-label', '이전 이미지');

    const next = document.createElement('button');
    next.className = 'aimmo-evidence-card__nav aimmo-evidence-card__nav--next';
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
    let inView = false;

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

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = Boolean(entries[0]?.isIntersecting);
        if (inView) schedule(); else clearTimer();
      }, { threshold: .20, rootMargin: '0px 0px -5% 0px' });
      observer.observe(card);
    } else {
      inView = true;
      schedule();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimer();
      else schedule();
    });

    settle();
  };

  cards.slice(0, 3).forEach((card, index) => setupCard(card, sequences[index]));
})();