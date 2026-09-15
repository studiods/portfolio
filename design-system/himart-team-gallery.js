(() => {
  'use strict';

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const HOLD_MS = 3000;
  const TRANSITION_MS = 720;

  const galleryConfigs = [
    {
      root: '#data .team-workshop-visual--people .team-workshop-visual__image',
      sources: [
        './assets/image/himart-workshop/himart_ws_02.png',
        './assets/image/himart-workshop/himart_ws_01_01.png',
        './assets/image/himart-workshop/himart_ws_01_02.png',
        './assets/image/himart-workshop/himart_ws_01_03.png'
      ]
    },
    {
      root: '#data .team-workshop-visual--strengths .team-workshop-visual__image',
      sources: [
        './assets/image/himart-workshop/himart_ws_01.png',
        './assets/image/himart-workshop/himart_ws_01_04.png',
        './assets/image/himart-workshop/himart_ws_01_05.png',
        './assets/image/himart-workshop/himart_ws_01_06.png',
        './assets/image/himart-workshop/himart_ws_01_07.png',
        './assets/image/himart-workshop/himart_ws_01_08.png',
        './assets/image/himart-workshop/himart_ws_01_09.png'
      ]
    },
    {
      root: '#data .team-workshop-visual--voices .team-workshop-visual__image',
      sources: Array.from({ length:9 }, (_, index) =>
        `./assets/image/himart-workshop/himart_ws_03_${String(index).padStart(2, '0')}.png`
      )
    },
    {
      root: '#journey .team-workshop-visual--core .team-workshop-visual__image',
      sources: [
        './assets/image/himart-workshop/himart_ws_06.png',
        ...Array.from({ length:7 }, (_, index) =>
          `./assets/image/himart-workshop/himart_ws_04_${String(index + 1).padStart(2, '0')}.png`
        )
      ]
    }
  ];

  const preload = src => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => resolve(null);
    image.src = src;
  });

  const setupGallery = async (root, requested) => {
    if (!root || root.dataset.teamGalleryMounted === 'true' || !requested.length) return;

    /* Preserve every authored slot. Missing workshop files intentionally render as a
       clean black frame instead of being removed from the sequence, so future uploads
       become active on refresh without changing gallery numbering or code. */
    const availability = await Promise.all(requested.map(preload));
    const frames = requested.map((src, index) => ({ src, available:Boolean(availability[index]) }));

    root.dataset.teamGalleryMounted = 'true';
    root.classList.add('team-workshop-gallery');
    root.tabIndex = 0;
    root.style.touchAction = 'pan-y';

    const authoredImage = root.querySelector(':scope > img');
    const cards = root.querySelector(':scope > .team-workshop-visual__cards');
    const alt = authoredImage?.alt || '하이마트 UX 디자인팀 워크숍 장면';

    const viewport = document.createElement('div');
    viewport.className = 'team-workshop-gallery__viewport';

    frames.forEach((frame, slideIndex) => {
      const slide = document.createElement('article');
      slide.className = `team-workshop-gallery__slide${slideIndex === 0 ? ' is-active' : ''}`;
      slide.setAttribute('aria-hidden', slideIndex === 0 ? 'false' : 'true');

      const media = document.createElement('div');
      media.className = `team-workshop-gallery__media${frame.available ? '' : ' is-missing'}`;

      if (frame.available) {
        const image = document.createElement('img');
        image.src = frame.src;
        image.alt = slideIndex === 0 ? alt : '';
        image.loading = slideIndex === 0 ? 'eager' : 'lazy';
        image.decoding = 'async';
        image.draggable = false;
        media.appendChild(image);
      }

      slide.appendChild(media);
      viewport.appendChild(slide);
    });

    authoredImage?.remove();
    root.insertBefore(viewport, cards || root.firstChild);

    const prev = document.createElement('button');
    prev.className = 'team-workshop-gallery__nav team-workshop-gallery__nav--prev hm-ds-gallery-nav hm-ds-gallery-nav--prev';
    prev.type = 'button';
    prev.setAttribute('aria-label', '이전 이미지');

    const next = document.createElement('button');
    next.className = 'team-workshop-gallery__nav team-workshop-gallery__nav--next hm-ds-gallery-nav hm-ds-gallery-nav--next';
    next.type = 'button';
    next.setAttribute('aria-label', '다음 이미지');

    const status = document.createElement('span');
    status.className = 'team-workshop-gallery__status';
    status.setAttribute('aria-live', 'polite');

    root.append(prev, next, status);

    const slides = [...viewport.querySelectorAll('.team-workshop-gallery__slide')];
    let index = 0;
    let timer = 0;
    let busy = false;
    let inView = false;
    let hasStarted = false;
    let pointerStart = null;

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
      root.classList.remove('is-reverse');
      updateStatus();
    };

    const schedule = (delay = HOLD_MS) => {
      clearTimer();
      if (!inView || document.hidden || busy || slides.length < 2) return;
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

    prev.addEventListener('click', event => {
      event.stopPropagation();
      move(-1);
    });
    next.addEventListener('click', event => {
      event.stopPropagation();
      move(1);
    });

    root.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    });

    root.addEventListener('pointerdown', event => {
      pointerStart = { x:event.clientX, y:event.clientY };
    });
    root.addEventListener('pointerup', event => {
      if (!pointerStart) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        move(dx < 0 ? 1 : -1);
      }
    });
    root.addEventListener('pointercancel', () => { pointerStart = null; });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = Boolean(entries[0]?.isIntersecting);
        if (inView) {
          const delay = hasStarted ? HOLD_MS : HOLD_MS;
          hasStarted = true;
          schedule(delay);
        } else {
          clearTimer();
        }
      }, { threshold:.20, rootMargin:'0px 0px -5% 0px' });
      observer.observe(root);
    } else {
      inView = true;
      hasStarted = true;
      schedule();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimer();
      else schedule();
    });

    settle();
  };

  const init = () => {
    if (!document.body.classList.contains('himart-team-page')) return;
    galleryConfigs.forEach(config => {
      const root = document.querySelector(config.root);
      if (root) setupGallery(root, config.sources);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
