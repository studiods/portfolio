(() => {
  'use strict';

  const runtime = window.HMDSGalleryRuntime;
  const reducedMotion = runtime?.reducedMotion ?? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
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
    } else {
      update(true);
    }

    const visibilityHandler = () => callback(inView && !document.hidden && !reducedMotion);
    document.addEventListener('visibilitychange', visibilityHandler);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  };

  const setupGallery = (root, sources) => {
    if (!root || root.dataset.teamGalleryMounted === 'true' || !sources.length) return;

    root.dataset.teamGalleryMounted = 'true';
    root.classList.add('team-workshop-gallery');
    root.tabIndex = 0;
    root.style.touchAction = 'pan-y';

    const authoredImage = root.querySelector(':scope > img');
    const cards = root.querySelector(':scope > .team-workshop-visual__cards');
    const alt = authoredImage?.alt || '하이마트 UX 디자인팀 워크숍 장면';

    const viewport = document.createElement('div');
    viewport.className = 'team-workshop-gallery__viewport';

    sources.forEach((src, slideIndex) => {
      const slide = document.createElement('article');
      slide.className = `team-workshop-gallery__slide${slideIndex === 0 ? ' is-active' : ''}`;
      slide.setAttribute('aria-hidden', slideIndex === 0 ? 'false' : 'true');
      slide.dataset.gallerySrc = src;

      const media = document.createElement('div');
      media.className = 'team-workshop-gallery__media';
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
    let autoActive = false;
    let pointerStart = null;

    const ensureLoaded = slideIndex => {
      const slide = slides[slideIndex];
      if (!slide || slide.dataset.galleryLoaded === 'true') return;
      slide.dataset.galleryLoaded = 'true';

      const media = slide.querySelector('.team-workshop-gallery__media');
      const image = document.createElement('img');
      image.alt = slideIndex === 0 ? alt : '';
      image.decoding = 'async';
      image.draggable = false;
      image.loading = slideIndex === 0 ? 'eager' : 'lazy';
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
      root.classList.remove('is-reverse');
      updateStatus();
    };

    const schedule = (delay = HOLD_MS) => {
      clearTimer();
      if (!autoActive || busy || reducedMotion || slides.length < 2) return;
      /* Prewarm only the next frame while visible instead of preloading every gallery
         image on page load. Loaded frames stay cached and are never re-requested on resume. */
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
      clearTimer();
    });
    root.addEventListener('pointerup', event => {
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

    const setAutoActive = active => {
      autoActive = Boolean(active);
      if (autoActive) {
        ensureLoaded(index);
        schedule();
      } else {
        clearTimer();
      }
    };

    ensureLoaded(0);
    settle();

    if (runtime) runtime.register(root, setAutoActive);
    else registerVisibilityFallback(root, setAutoActive);
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
