(() => {
  'use strict';

  const HOLD_MS = 2500;
  const TRANSITION_MS = 720;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const CONTENT = [
    {
      title: '제품마다 반드시 보여줘야 할 부위를 촬영 기준으로 만들었습니다.',
      copy: '제품마다 확인해야 할 부위가 달라 상품본부와 협의해 카테고리별 필수 촬영 부위와 중점 확인 사항을 정리했습니다.'
    },
    {
      title: '흠집과 사용 흔적은 가까이 확인할 수 있게 했습니다.',
      copy: '스크래치·찍힘·변색처럼 구매 판단에 영향을 주는 흔적은 위치와 정도가 드러나도록 상세 이미지로 확인하게 했습니다.'
    },
    {
      title: '전체 형태와 보이지 않는 면까지 여러 각도로 확인하게 했습니다.',
      copy: '한 장으로 판단하기 어려운 제품은 여러 방향과 360도 촬영을 활용해 전체 상태를 빠르게 살펴볼 수 있게 했습니다.'
    }
  ];

  const MEDIA_SETS = [
    [
      './assets/image/himart/reuse/03.2_01_01.png',
      './assets/image/himart/reuse/03.2_01_02.png',
      './assets/image/himart/reuse/03.2_01_03.png',
      './assets/image/himart/reuse/03.2_01_04.png',
      './assets/image/himart/reuse/03.2_01_05.png'
    ],
    [
      './assets/image/himart/reuse/03.2_02_01.png',
      './assets/image/himart/reuse/03.2_02_02.png',
      './assets/image/himart/reuse/03.2_02_03.png',
      './assets/image/himart/reuse/03.2_02_04.png',
      './assets/image/himart/reuse/03.2_02_05.png'
    ]
  ];

  const applyFinalState = () => {
    const grid = document.querySelector('#journey .reuse-image-display-grid');
    if (!grid) return null;

    const cards = Array.from(grid.querySelectorAll(':scope > .reuse-image-display-card'));
    cards.slice(CONTENT.length).forEach((card) => card.remove());

    Array.from(grid.querySelectorAll(':scope > .reuse-image-display-card')).forEach((card, index) => {
      const item = CONTENT[index];
      if (!item) return;

      const number = card.querySelector('.reuse-image-display-card__number');
      const title = card.querySelector('.reuse-image-display-card__copy h4');
      const copy = card.querySelector('.reuse-image-display-card__copy p');

      if (number) number.textContent = String(index + 1).padStart(2, '0');
      if (title) title.textContent = item.title;
      if (copy) copy.textContent = item.copy;
      card.setAttribute('aria-label', item.title);
    });

    return grid;
  };

  const buildAssetGallery = (sourceCard, sources, cardIndex) => {
    if (!sourceCard || !sources?.length || sourceCard.dataset.finalAssetsMounted === 'true') return sourceCard;

    /* Clone once so the earlier placeholder gallery listeners cannot compete with this final asset gallery. */
    const card = sourceCard.cloneNode(true);
    card.dataset.finalAssetsMounted = 'true';
    card.classList.remove('is-reverse');
    card.tabIndex = 0;

    let viewport = card.querySelector('.reuse-image-display-card__viewport');
    if (!viewport) {
      viewport = document.createElement('div');
      viewport.className = 'reuse-image-display-card__viewport';
      card.insertBefore(viewport, card.firstChild);
    }

    const fragment = document.createDocumentFragment();
    sources.forEach((src, index) => {
      const slide = document.createElement('article');
      slide.className = `reuse-image-display-card__slide${index === 0 ? ' is-active' : ''}`;
      slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
      slide.dataset.reuseImageSlot = String(index + 1).padStart(2, '0');

      const media = document.createElement('div');
      media.className = 'reuse-image-display-card__media';

      const image = document.createElement('img');
      image.src = src;
      image.alt = '';
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.draggable = false;
      image.style.objectFit = 'cover';
      image.style.objectPosition = '50% 50%';

      media.appendChild(image);
      slide.appendChild(media);
      fragment.appendChild(slide);
    });
    viewport.replaceChildren(fragment);

    let prev = card.querySelector('.reuse-image-display-card__nav--prev');
    let next = card.querySelector('.reuse-image-display-card__nav--next');
    let status = card.querySelector('.reuse-image-display-card__status');

    if (!prev) {
      prev = document.createElement('button');
      prev.className = 'reuse-image-display-card__nav reuse-image-display-card__nav--prev';
      prev.type = 'button';
      prev.setAttribute('aria-label', '이전 이미지');
      card.appendChild(prev);
    }
    if (!next) {
      next = document.createElement('button');
      next.className = 'reuse-image-display-card__nav reuse-image-display-card__nav--next';
      next.type = 'button';
      next.setAttribute('aria-label', '다음 이미지');
      card.appendChild(next);
    }
    if (!status) {
      status = document.createElement('span');
      status.className = 'reuse-image-display-card__status';
      status.setAttribute('aria-live', 'polite');
      card.appendChild(status);
    }

    sourceCard.replaceWith(card);

    const slides = Array.from(viewport.querySelectorAll('.reuse-image-display-card__slide'));
    let index = 0;
    let timer = 0;
    let busy = false;
    let inView = false;
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
      card.classList.remove('is-reverse');
      updateStatus();
    };

    const schedule = () => {
      clearTimer();
      if (!inView || document.hidden || busy || slides.length < 2) return;
      timer = window.setTimeout(() => move(1), HOLD_MS);
    };

    const transitionTo = (targetIndex, direction = 1) => {
      if (busy || targetIndex === index || slides.length < 2) return;
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

    prev.addEventListener('click', (event) => {
      event.stopPropagation();
      move(-1);
    });
    next.addEventListener('click', (event) => {
      event.stopPropagation();
      move(1);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    });

    card.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
      clearTimer();
    });

    card.addEventListener('pointerup', (event) => {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
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

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target !== card) return;
          inView = entry.isIntersecting;
          if (inView) schedule();
          else clearTimer();
        });
      }, { threshold: 0.20, rootMargin: '0px 0px -5% 0px' });
      observer.observe(card);
    } else {
      inView = true;
      schedule();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimer();
      else if (inView) schedule();
    });

    card.dataset.galleryIndex = String(cardIndex + 1);
    settle();
    return card;
  };

  const mountFinalGalleries = () => {
    const grid = applyFinalState();
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(':scope > .reuse-image-display-card'));
    MEDIA_SETS.forEach((sources, index) => buildAssetGallery(cards[index], sources, index));
  };

  mountFinalGalleries();
  requestAnimationFrame(mountFinalGalleries);
  window.setTimeout(mountFinalGalleries, 250);
  window.setTimeout(mountFinalGalleries, 1000);
  document.addEventListener('DOMContentLoaded', mountFinalGalleries, { once: true });
})();
