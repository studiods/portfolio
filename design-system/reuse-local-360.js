/* HIMART REUSE 03.2 — local eight-frame 360 viewer.
   Uses reuse_360_01.png through reuse_360_08.png.
   - Plays one 01→08→01 focus preview at 200ms per frame on first viewport focus.
   - Horizontal pointer drag / keyboard arrows rotate the product manually.
   - Interaction hint hides immediately on interaction and returns after 5s idle.
   - Normalizes REUSE 04.1 into the canonical number / title / body subsection pattern. */
(() => {
  'use strict';

  if (!document.body?.classList.contains('reuse-current')) return;

  const FRAME_SOURCES = Array.from({ length: 8 }, (_, index) =>
    `./assets/image/himart-reuse/reuse_360_${String(index + 1).padStart(2, '0')}.png`
  );
  const PREVIEW_FRAME_MS = 200;
  const HINT_IDLE_MS = 5000;
  const FOCUS_RATIO = 0.38;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const normalize = (value, length) => ((value % length) + length) % length;

  const normalizeDirectionSection = () => {
    const section = document.querySelector('#direction');
    const intro = section?.querySelector('.prototype-intro.hm-subsection');
    if (!intro || intro.dataset.reuseDirectionStandard === 'true') return false;

    const title = intro.querySelector(':scope > h3');
    const copy = intro.querySelector(':scope > p');
    if (!title || !copy) return false;

    const subhead = document.createElement('div');
    subhead.className = 'hm-subhead';

    const number = document.createElement('span');
    number.className = 'hm-subno';
    number.textContent = '04.1';

    const text = document.createElement('div');
    title.className = 'hm-subtitle hm-ds-subsection__title';
    copy.className = 'hm-subcopy hm-ds-subsection__description';
    text.append(title, copy);
    subhead.append(number, text);
    intro.prepend(subhead);

    const gallery = section.querySelector(':scope .phone-gallery');
    if (gallery && gallery.parentElement !== intro) {
      gallery.classList.add('hm-ds-subtitle-to-content');
      intro.appendChild(gallery);
    }

    intro.classList.remove('hm-ds-prototype-grid', 'hm-ds-narrative');
    intro.classList.add('reuse-direction-standard');
    intro.dataset.reuseDirectionStandard = 'true';
    return true;
  };

  const mountViewer = () => {
    const grid = document.querySelector('#journey .reuse-image-display-grid');
    if (!grid) return false;
    const cards = Array.from(grid.querySelectorAll(':scope > .reuse-image-display-card'));
    const sourceCard = cards[2];
    if (!sourceCard) return false;
    if (sourceCard.dataset.local360Mounted === 'true') return true;

    const card = sourceCard.cloneNode(true);
    card.dataset.local360Mounted = 'true';
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
    let previewStarted = false;
    let previewRunning = false;
    let previewTimer = 0;
    let hintTimer = 0;

    const render = nextIndex => {
      index = normalize(nextIndex, frames.length);
      frames.forEach((frame, frameIndex) => {
        frame.classList.toggle('is-active', frameIndex === index);
      });
    };

    const clearPreviewTimer = () => {
      if (previewTimer) window.clearTimeout(previewTimer);
      previewTimer = 0;
    };

    const stopPreview = () => {
      clearPreviewTimer();
      previewRunning = false;
    };

    const playFocusPreview = () => {
      if (previewStarted || reducedMotion || document.hidden) return;
      previewStarted = true;
      previewRunning = true;
      render(0);
      let step = 0;

      const tick = () => {
        if (!previewRunning || document.hidden) return;
        step += 1;
        render(step % frames.length);
        if (step >= frames.length) {
          previewRunning = false;
          previewTimer = 0;
          return;
        }
        previewTimer = window.setTimeout(tick, PREVIEW_FRAME_MS);
      };

      previewTimer = window.setTimeout(tick, PREVIEW_FRAME_MS);
    };

    const clearHintTimer = () => {
      if (hintTimer) window.clearTimeout(hintTimer);
      hintTimer = 0;
    };

    const showHint = () => {
      clearHintTimer();
      card.classList.remove('is-hint-hidden');
    };

    const scheduleHintReturn = () => {
      clearHintTimer();
      hintTimer = window.setTimeout(() => {
        if (!dragging) showHint();
      }, HINT_IDLE_MS);
    };

    const registerInteraction = () => {
      card.classList.add('is-hint-hidden');
      scheduleHintReturn();
    };

    const dragStep = () => Math.max(34, Math.min(72, card.clientWidth / 18));

    const beginDrag = event => {
      if (event.button != null && event.button !== 0) return;
      stopPreview();
      registerInteraction();
      activePointer = event.pointerId;
      startX = event.clientX;
      startIndex = index;
      dragging = true;
      card.classList.add('is-dragging');
      try { card.setPointerCapture?.(event.pointerId); } catch (_) {}
    };

    const moveDrag = event => {
      if (!dragging || activePointer !== event.pointerId) return;
      registerInteraction();
      const dx = event.clientX - startX;
      const frameDelta = Math.round(dx / dragStep());
      render(startIndex - frameDelta);
    };

    const endDrag = event => {
      if (!dragging || activePointer !== event.pointerId) return;
      dragging = false;
      activePointer = null;
      card.classList.remove('is-dragging');
      scheduleHintReturn();
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
      scheduleHintReturn();
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        stopPreview();
        registerInteraction();
        event.preventDefault();
        render(index + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    });

    if (!reducedMotion && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries.find(item => item.target === card);
        if (!entry || !entry.isIntersecting || entry.intersectionRatio < FOCUS_RATIO) return;
        observer.disconnect();
        playFocusPreview();
      }, { threshold:[0, FOCUS_RATIO, .6, 1], rootMargin:'0px 0px -4% 0px' });
      observer.observe(card);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopPreview();
    });

    FRAME_SOURCES.slice(1).forEach(src => {
      const image = new Image();
      image.src = src;
      image.decode?.().catch(() => {});
    });

    render(0);
    return true;
  };

  const mount = () => {
    normalizeDirectionSection();
    return mountViewer();
  };

  if (!mount()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true });
    requestAnimationFrame(mount);
    [120, 400, 900].forEach(ms => window.setTimeout(mount, ms));
  }
})();
