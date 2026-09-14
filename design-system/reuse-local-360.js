/* HIMART REUSE 03.2 — local eight-frame 360 viewer.
   Uses the repository assets reuse_360_01.png through reuse_360_08.png.
   Frames rotate by horizontal pointer drag and keep one shared display geometry. */
(() => {
  'use strict';

  if (!document.body?.classList.contains('reuse-current')) return;

  const FRAME_SOURCES = Array.from({ length: 8 }, (_, index) =>
    `./assets/image/himart/reuse/reuse_360_${String(index + 1).padStart(2, '0')}.png`
  );

  const normalize = (value, length) => ((value % length) + length) % length;

  const mount = () => {
    const grid = document.querySelector('#journey .reuse-image-display-grid');
    if (!grid) return false;
    const cards = Array.from(grid.querySelectorAll(':scope > .reuse-image-display-card'));
    const sourceCard = cards[2];
    if (!sourceCard) return false;
    if (sourceCard.dataset.local360Mounted === 'true') return true;

    const card = sourceCard.cloneNode(true);
    card.dataset.local360Mounted = 'true';
    /* The legacy builder checks this flag. Marking it before that script mounts prevents
       all external iframe/link assets from being constructed or requested. */
    card.dataset.live360Mounted = 'true';
    card.dataset.spinMounted = 'true';
    card.classList.remove('is-live360-viewer', 'is-360-viewer', 'is-reverse', 'has-rotated');
    card.classList.add('is-local360-viewer');
    card.tabIndex = 0;
    card.setAttribute('aria-label', '제품을 좌우로 움직여 여덟 방향의 360도 상태 이미지를 확인할 수 있습니다.');

    card.querySelectorAll(':scope > .reuse-image-display-card__media, .reuse-image-display-card__viewport, .reuse-live360__viewport, .reuse-live360__open, .reuse-image-display-card__nav, .reuse-image-display-card__status, iframe, a').forEach(node => node.remove());

    const viewport = document.createElement('div');
    viewport.className = 'reuse-local360__viewport';
    viewport.setAttribute('aria-hidden', 'true');

    FRAME_SOURCES.forEach((src, index) => {
      const frame = document.createElement('div');
      frame.className = `reuse-local360__frame${index === 0 ? ' is-active' : ''}`;
      frame.dataset.frame = String(index);
      const image = document.createElement('img');
      image.src = src;
      image.alt = '';
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.draggable = false;
      frame.appendChild(image);
      viewport.appendChild(frame);
    });

    const hint = document.createElement('div');
    hint.className = 'reuse-local360__hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = '<i class="reuse-local360__hint-arrow reuse-local360__hint-arrow--left"></i><span class="reuse-local360__hint-copy">좌우로<br>움직여 보세요</span><i class="reuse-local360__hint-arrow reuse-local360__hint-arrow--right"></i>';

    const badge = document.createElement('div');
    badge.className = 'reuse-local360__badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = '360°';

    const copy = card.querySelector('.reuse-image-display-card__copy');
    card.insertBefore(viewport, copy || card.firstChild);
    card.append(hint, badge);
    sourceCard.replaceWith(card);

    const frames = Array.from(viewport.querySelectorAll('.reuse-local360__frame'));
    let index = 0;
    let startIndex = 0;
    let startX = 0;
    let activePointer = null;
    let dragging = false;

    const render = nextIndex => {
      index = normalize(nextIndex, frames.length);
      frames.forEach((frame, frameIndex) => {
        frame.classList.toggle('is-active', frameIndex === index);
      });
    };

    const dragStep = () => Math.max(34, Math.min(72, card.clientWidth / 18));

    const beginDrag = event => {
      if (event.button != null && event.button !== 0) return;
      activePointer = event.pointerId;
      startX = event.clientX;
      startIndex = index;
      dragging = true;
      card.classList.add('is-dragging');
      try { card.setPointerCapture?.(event.pointerId); } catch (_) {}
    };

    const moveDrag = event => {
      if (!dragging || activePointer !== event.pointerId) return;
      const dx = event.clientX - startX;
      const frameDelta = Math.round(dx / dragStep());
      /* Moving the pointer right reveals the previous camera angle; moving left reveals
         the next, matching the physical feeling of turning the object by hand. */
      render(startIndex - frameDelta);
    };

    const endDrag = event => {
      if (!dragging || activePointer !== event.pointerId) return;
      dragging = false;
      activePointer = null;
      card.classList.remove('is-dragging');
      try { card.releasePointerCapture?.(event.pointerId); } catch (_) {}
    };

    card.addEventListener('pointerdown', beginDrag);
    card.addEventListener('pointermove', moveDrag);
    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
    card.addEventListener('lostpointercapture', () => {
      dragging = false;
      activePointer = null;
      card.classList.remove('is-dragging');
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        render(index - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        render(index + 1);
      }
    });

    /* Pre-decode the sequence so the first manual rotation does not flash between frames. */
    FRAME_SOURCES.slice(1).forEach(src => {
      const image = new Image();
      image.src = src;
      image.decode?.().catch(() => {});
    });

    render(0);
    return true;
  };

  if (!mount()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true });
    requestAnimationFrame(mount);
    [120, 400, 900].forEach(ms => window.setTimeout(mount, ms));
  }
})();
