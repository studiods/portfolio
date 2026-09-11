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

  const ROLLING_MEDIA = [
    Array.from({ length: 5 }, (_, i) => `./assets/image/himart/reuse/03.2_01_${String(i + 1).padStart(2, '0')}.png`),
    Array.from({ length: 5 }, (_, i) => `./assets/image/himart/reuse/03.2_02_${String(i + 1).padStart(2, '0')}.png`)
  ];

  const LIVE_360 = [
    {
      url: 'https://www.e-himart.co.kr/app/goods/goodsDetail?goodsNo=0069891388&gtmPos=%ED%95%98%EC%9D%B4%EB%A7%88%ED%8A%B8%20%EC%9D%B8%EC%A6%9D%EC%A4%91%EA%B3%A0&jsClck=Y#sirv-viewer-1346340621468',
      label: '하이마트 인증중고 360도 상품 01'
    },
    {
      url: 'https://www.e-himart.co.kr/app/goods/goodsDetail?goodsNo=0070377977&gtmPos=%ED%95%98%EC%9D%B4%EB%A7%88%ED%8A%B8%20%EC%9D%B8%EC%A6%9D%EC%A4%91%EA%B3%A0&jsClck=Y#sirv-viewer-384296630126',
      label: '하이마트 인증중고 360도 상품 02'
    },
    {
      url: 'https://www.e-himart.co.kr/app/goods/goodsDetail?goodsNo=0070540451&gtmPos=%ED%95%98%EC%9D%B4%EB%A7%88%ED%8A%B8%20%EC%9D%B8%EC%A6%9D%EC%A4%91%EA%B3%A0&jsClck=Y#sirv-viewer-1339090322750',
      label: '하이마트 인증중고 360도 상품 03'
    }
  ];

  const installStyles = () => {
    if (document.getElementById('reuse-live360-style')) return;
    const style = document.createElement('style');
    style.id = 'reuse-live360-style';
    style.textContent = `
      html body.reuse-current .reuse-image-display-card.is-live360-viewer{aspect-ratio:4/3;overflow:hidden;background:#0a0a0a}
      html body.reuse-current .reuse-live360__viewport{position:absolute;inset:0;z-index:1;width:100%;height:100%;overflow:hidden;background:#0a0a0a}
      html body.reuse-current .reuse-live360__slide{position:absolute;inset:0;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .36s ease}
      html body.reuse-current .reuse-live360__slide.is-active{opacity:1;visibility:visible;pointer-events:auto}
      html body.reuse-current .reuse-live360__crop{position:absolute;inset:0;overflow:hidden;background:#0a0a0a}
      html body.reuse-current .reuse-live360__frame{position:absolute;top:50%;left:50%;display:block;width:100%;height:100%;border:0;background:#0a0a0a;transform:translate(-50%,-50%)}
      html body.reuse-current .reuse-live360__open{position:absolute;z-index:11;top:24px;right:28px;display:flex;align-items:center;height:30px;padding:0 11px;border:1px solid rgba(255,255,255,.24);border-radius:999px;background:rgba(0,0,0,.34);color:rgba(255,255,255,.82)!important;font:300 10px/1 var(--hm-font-en);letter-spacing:.05em;text-decoration:none!important;backdrop-filter:blur(8px)}
      html body.reuse-current .reuse-image-display-card.is-live360-viewer .reuse-image-display-card__nav{z-index:10}
      html body.reuse-current .reuse-image-display-card.is-live360-viewer .reuse-image-display-card__status{z-index:10}
      html body.reuse-current .reuse-image-display-card.is-live360-viewer .reuse-image-display-card__copy{z-index:8}
      html body.reuse-current .reuse-image-display-card.is-live360-viewer::after{z-index:7}
      @media(max-width:780px){html body.reuse-current .reuse-live360__open{top:16px;right:18px}}
      @media(prefers-reduced-motion:reduce){html body.reuse-current .reuse-live360__slide{transition:none}}
    `;
    document.head.appendChild(style);
  };

  const applyContent = () => {
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

  const buildRollingGallery = (sourceCard, sources, cardIndex) => {
    if (!sourceCard || !sources?.length || sourceCard.dataset.finalAssetsMounted === 'true') return sourceCard;
    const card = sourceCard.cloneNode(true);
    card.dataset.finalAssetsMounted = 'true';
    card.classList.remove('is-reverse', 'is-360-viewer', 'is-live360-viewer', 'is-dragging', 'has-rotated');
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

    const clearTimer = () => { if (timer) window.clearTimeout(timer); timer = 0; };
    const updateStatus = () => { status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`; };
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
      if (reducedMotion) return complete();
      void incoming.offsetWidth;
      current.classList.add('is-exiting');
      incoming.classList.add('is-entering');
      window.setTimeout(complete, TRANSITION_MS + 30);
    };
    function move(delta) {
      if (busy || slides.length < 2) return;
      transitionTo((index + delta + slides.length) % slides.length, delta < 0 ? -1 : 1);
    }

    prev.addEventListener('click', (event) => { event.stopPropagation(); move(-1); });
    next.addEventListener('click', (event) => { event.stopPropagation(); move(1); });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    });
    card.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      pointerStart = { x:event.clientX, y:event.clientY, id:event.pointerId };
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
    card.addEventListener('pointercancel', () => { pointerStart = null; schedule(); });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target !== card) return;
          inView = entry.isIntersecting;
          if (inView) schedule();
          else clearTimer();
        });
      }, { threshold:.20, rootMargin:'0px 0px -5% 0px' });
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

  const buildLive360Viewer = (sourceCard) => {
    if (!sourceCard || sourceCard.dataset.live360Mounted === 'true') return sourceCard;
    const card = sourceCard.cloneNode(true);
    card.dataset.live360Mounted = 'true';
    card.dataset.spinMounted = 'true';
    card.removeAttribute('data-final-assets-mounted');
    card.classList.remove('is-360-viewer', 'is-dragging', 'has-rotated', 'is-reverse');
    card.classList.add('is-live360-viewer');
    card.tabIndex = 0;
    card.setAttribute('aria-label', '하이마트 인증중고 360도 상품 3개. 좌우 버튼으로 상품을 전환하고 화면 안에서 직접 회전할 수 있습니다.');

    card.querySelectorAll('.reuse-image-display-card__viewport, .reuse-360-viewer, .reuse-360-viewer__badge, .reuse-360-viewer__hint, .reuse-image-display-card__nav, .reuse-image-display-card__status').forEach((node) => node.remove());
    card.querySelector(':scope > .reuse-image-display-card__media')?.remove();

    const viewport = document.createElement('div');
    viewport.className = 'reuse-live360__viewport';
    LIVE_360.forEach((item, index) => {
      const slide = document.createElement('article');
      slide.className = `reuse-live360__slide${index === 0 ? ' is-active' : ''}`;
      slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
      const crop = document.createElement('div');
      crop.className = 'reuse-live360__crop';
      const frame = document.createElement('iframe');
      frame.className = 'reuse-live360__frame';
      frame.src = item.url;
      frame.title = item.label;
      frame.loading = index === 0 ? 'eager' : 'lazy';
      frame.setAttribute('allow', 'fullscreen');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      crop.appendChild(frame);
      slide.appendChild(crop);
      viewport.appendChild(slide);
    });

    const prev = document.createElement('button');
    prev.className = 'reuse-image-display-card__nav reuse-image-display-card__nav--prev';
    prev.type = 'button';
    prev.setAttribute('aria-label', '이전 360도 상품');
    const next = document.createElement('button');
    next.className = 'reuse-image-display-card__nav reuse-image-display-card__nav--next';
    next.type = 'button';
    next.setAttribute('aria-label', '다음 360도 상품');
    const status = document.createElement('span');
    status.className = 'reuse-image-display-card__status';
    status.setAttribute('aria-live', 'polite');
    const open = document.createElement('a');
    open.className = 'reuse-live360__open';
    open.target = '_blank';
    open.rel = 'noopener noreferrer';
    open.textContent = 'ORIGINAL ↗';

    const copy = card.querySelector('.reuse-image-display-card__copy');
    card.insertBefore(viewport, copy || card.firstChild);
    card.append(prev, next, status, open);
    sourceCard.replaceWith(card);

    const slides = Array.from(viewport.querySelectorAll('.reuse-live360__slide'));
    let index = 0;
    const render = () => {
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      open.href = LIVE_360[index].url;
      open.setAttribute('aria-label', `${LIVE_360[index].label} 원본 페이지에서 보기`);
    };
    const move = (delta) => {
      index = (index + delta + slides.length) % slides.length;
      render();
    };
    prev.addEventListener('click', (event) => { event.stopPropagation(); move(-1); });
    next.addEventListener('click', (event) => { event.stopPropagation(); move(1); });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    });
    render();
    return card;
  };

  const mount = () => {
    installStyles();
    const grid = applyContent();
    if (!grid) return;
    let cards = Array.from(grid.querySelectorAll(':scope > .reuse-image-display-card'));
    ROLLING_MEDIA.forEach((sources, index) => {
      buildRollingGallery(cards[index], sources, index);
      cards = Array.from(grid.querySelectorAll(':scope > .reuse-image-display-card'));
    });
    buildLive360Viewer(cards[2]);
  };

  mount();
  requestAnimationFrame(mount);
  window.setTimeout(mount, 250);
  window.setTimeout(mount, 1000);
  document.addEventListener('DOMContentLoaded', mount, { once:true });
})();
