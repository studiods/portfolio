(() => {
  'use strict';

  const SOURCES = [
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
      html body.reuse-current .reuse-image-display-card.is-live360-viewer{
        aspect-ratio:4/3;
        overflow:hidden;
        background:#0a0a0a;
      }
      html body.reuse-current .reuse-live360__viewport{
        position:absolute;
        inset:0;
        z-index:1;
        width:100%;
        height:100%;
        overflow:hidden;
        background:#0a0a0a;
      }
      html body.reuse-current .reuse-live360__slide{
        position:absolute;
        inset:0;
        opacity:0;
        visibility:hidden;
        pointer-events:none;
        transition:opacity .36s ease;
      }
      html body.reuse-current .reuse-live360__slide.is-active{
        opacity:1;
        visibility:visible;
        pointer-events:auto;
      }
      html body.reuse-current .reuse-live360__crop{
        position:absolute;
        inset:0;
        overflow:hidden;
        background:#0a0a0a;
      }
      html body.reuse-current .reuse-live360__frame{
        position:absolute;
        top:50%;
        left:50%;
        display:block;
        width:100%;
        height:100%;
        border:0;
        background:#0a0a0a;
        transform:translate(-50%,-50%);
      }
      html body.reuse-current .reuse-live360__open{
        position:absolute;
        z-index:9;
        top:24px;
        right:28px;
        display:flex;
        align-items:center;
        height:30px;
        padding:0 11px;
        border:1px solid rgba(255,255,255,.24);
        border-radius:999px;
        background:rgba(0,0,0,.34);
        color:rgba(255,255,255,.82)!important;
        font:300 10px/1 var(--hm-font-en);
        letter-spacing:.05em;
        text-decoration:none!important;
        backdrop-filter:blur(8px);
      }
      html body.reuse-current .reuse-image-display-card.is-live360-viewer .reuse-image-display-card__nav{
        z-index:10;
      }
      html body.reuse-current .reuse-image-display-card.is-live360-viewer .reuse-image-display-card__status{
        z-index:10;
      }
      html body.reuse-current .reuse-image-display-card.is-live360-viewer .reuse-image-display-card__copy{
        z-index:8;
      }
      html body.reuse-current .reuse-image-display-card.is-live360-viewer::after{
        z-index:7;
      }
      @media(max-width:780px){
        html body.reuse-current .reuse-live360__open{top:16px;right:18px}
      }
      @media(prefers-reduced-motion:reduce){
        html body.reuse-current .reuse-live360__slide{transition:none}
      }
    `;
    document.head.appendChild(style);
  };

  const mount = () => {
    installStyles();

    const grid = document.querySelector('#journey .reuse-image-display-grid');
    if (!grid) return;
    const sourceCard = grid.querySelectorAll(':scope > .reuse-image-display-card')[2];
    if (!sourceCard || sourceCard.dataset.live360Mounted === 'true') return;

    const card = sourceCard.cloneNode(true);
    card.dataset.live360Mounted = 'true';
    card.dataset.spinMounted = 'true';
    card.classList.remove('is-360-viewer', 'is-dragging', 'has-rotated', 'is-reverse');
    card.classList.add('is-live360-viewer');
    card.tabIndex = 0;
    card.setAttribute('aria-label', '하이마트 인증중고 360도 상품 3개. 좌우 버튼으로 상품을 전환하고 화면 안에서 직접 회전할 수 있습니다.');

    card.querySelectorAll('.reuse-image-display-card__viewport, .reuse-360-viewer, .reuse-360-viewer__badge, .reuse-360-viewer__hint, .reuse-image-display-card__nav, .reuse-image-display-card__status').forEach((node) => node.remove());
    card.querySelector(':scope > .reuse-image-display-card__media')?.remove();

    const viewport = document.createElement('div');
    viewport.className = 'reuse-live360__viewport';

    SOURCES.forEach((item, index) => {
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
      open.href = SOURCES[index].url;
      open.setAttribute('aria-label', `${SOURCES[index].label} 원본 페이지에서 보기`);
    };

    const move = (delta) => {
      index = (index + delta + slides.length) % slides.length;
      render();
    };

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

    render();
  };

  mount();
  requestAnimationFrame(mount);
  window.setTimeout(mount, 300);
  window.setTimeout(mount, 1200);
  document.addEventListener('DOMContentLoaded', mount, { once:true });
})();
